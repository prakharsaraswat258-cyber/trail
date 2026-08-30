import { createServiceRoleClient } from './supabase/serviceRole';
import { getGeminiClient, GEMINI_FALLBACK_MODELS } from './gemini-client';
import { Type } from '@google/genai';
import {
  MatchCandidateFoundItem,
  MatchCandidateLostReport,
  MatchRecord,
  LostItemMatchSpec,
  findMatchesForLostSpecs,
  scoreMatch,
} from './matching/computeMatches';

export {
  type LostItemMatchSpec,
  findMatchesForLostSpecs,
  scoreMatch,
};

export interface EnrichedMatchResult {
  found_item_id: string;
  confidence_score: number;
  confidence_label: 'strong' | 'possible' | 'weak';
  ai_reasoning: string;
  item_name?: string;
  category?: string;
  date_found?: string;
  location_found?: string;
}

/**
 * Checks if two ISO date strings (YYYY-MM-DD) are within the given number of days.
 */
export function isWithinDays(dateStr1?: string | null, dateStr2?: string | null, maxDays = 30): boolean {
  if (!dateStr1 || !dateStr2) return true; // Fail permissive on date window if either date is missing
  const d1 = new Date(dateStr1).getTime();
  const d2 = new Date(dateStr2).getTime();
  if (isNaN(d1) || isNaN(d2)) return true;
  const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
  return diffDays <= maxDays;
}

/**
 * Helper to map confidence_score to confidence_label.
 */
export function mapScoreToLabel(score: number): 'strong' | 'possible' | 'weak' {
  if (score >= 70) return 'strong';
  if (score >= 40) return 'possible';
  return 'weak';
}

async function generateContentWithRetry(ai: any, params: any) {
  let lastError: any = null;
  for (const model of GEMINI_FALLBACK_MODELS) {
    try {
      return await ai.models.generateContent({
        ...params,
        model,
      });
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.status === 429 ||
        err?.status === 503 ||
        err?.message?.includes('429') ||
        err?.message?.includes('503') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('quota');
      if (isTransient) {
        console.warn(`Transient issue with model ${model} in rankCandidatesWithGemini, trying fallback...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * Invokes Gemini AI to re-rank candidate items with structured JSON output.
 */
export async function rankCandidatesWithGemini(
  targetItem: {
    type: 'lost' | 'found';
    item_name?: string | null;
    category?: string | null;
    description?: string | null;
    date?: string | null;
    location?: string | null;
  },
  candidates: Array<{
    id: string;
    item_name?: string | null;
    category?: string | null;
    description?: string | null;
    date?: string | null;
    location?: string | null;
    heuristicScore: number;
  }>
): Promise<Map<string, { confidence_score: number; ai_reasoning: string }>> {
  const ai = getGeminiClient();

  const candidateDescriptions = candidates
    .map(
      (c, index) =>
        `Candidate #${index + 1} [ID: ${c.id}]:
- Item Name: ${c.item_name || 'Unknown'}
- Category: ${c.category || 'Unknown'}
- Description/Specs: ${c.description || 'None'}
- Date: ${c.date || 'Unknown'}
- Location: ${c.location || 'Unknown'}
- Base Heuristic Score: ${c.heuristicScore}`
    )
    .join('\n\n');

  const prompt = `You are an intelligent Lost and Found matching AI assistant for a university campus.
Your task is to compare a ${targetItem.type === 'lost' ? 'reported lost item' : 'reported found item'} with several potential candidate items found in the same category.

TARGET ${targetItem.type.toUpperCase()} ITEM:
- Item Name: ${targetItem.item_name || 'Unknown'}
- Category: ${targetItem.category || 'Unknown'}
- Description/Specs: ${targetItem.description || 'None'}
- Date: ${targetItem.date || 'Unknown'}
- Location: ${targetItem.location || 'Unknown'}

CANDIDATE ITEMS TO COMPARE:
${candidateDescriptions}

EVALUATION INSTRUCTIONS:
1. Compare the target item with each candidate item based ONLY on:
   - Item name / title similarity
   - Specific details, brand, model, color, or distinctive features mentioned in the description
   - Date proximity
   - Campus location compatibility
2. Strictly DO NOT mention or assume any photos or image analysis.
3. Assign a confidence_score from 0 to 100 for each candidate indicating how likely it is the exact same item:
   - 70-100: Strong match (high confidence in specific details, model, brand, time/place)
   - 40-69: Possible match (similar general description, plausible time/place)
   - 0-39: Weak / unlikely match (clear contradictions in color, brand, or specs)
4. Provide a single, concise reasoning sentence for each candidate.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      matches: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            candidate_id: { type: Type.STRING },
            confidence_score: { type: Type.INTEGER },
            ai_reasoning: { type: Type.STRING },
          },
          required: ['candidate_id', 'confidence_score', 'ai_reasoning'],
        },
      },
    },
    required: ['matches'],
  };

  const result = await generateContentWithRetry(ai, {
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema,
    },
  });



  const responseText = result.text;
  if (!responseText) {
    throw new Error('Empty response from Gemini');
  }

  const parsed = JSON.parse(responseText);
  const map = new Map<string, { confidence_score: number; ai_reasoning: string }>();

  if (Array.isArray(parsed.matches)) {
    for (const m of parsed.matches) {
      if (m.candidate_id && typeof m.confidence_score === 'number') {
        const score = Math.max(0, Math.min(100, Math.round(m.confidence_score)));
        map.set(m.candidate_id, {
          confidence_score: score,
          ai_reasoning: m.ai_reasoning || 'AI match evaluated.',
        });
      }
    }
  }

  return map;
}
