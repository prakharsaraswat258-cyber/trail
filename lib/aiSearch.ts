import { Type } from '@google/genai';
import { getGeminiClient, GEMINI_FALLBACK_MODELS } from './gemini-client';
import { ITEM_CATEGORIES } from './constants/itemCategories';
import { findMatchesForLostSpecs } from './matching/computeMatches';
import { EnrichedMatchResult } from './matching';


export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ExtractedSpecs {
  category: string;
  description: string;
  color?: string;
  brand?: string;
  date_lost?: string;
  location_lost?: string;
}

export interface AiSearchResponse {
  reply: string;
  action: 'ask_clarifying_question' | 'search_results' | 'no_input_understood';
  extracted?: ExtractedSpecs;
  matches?: EnrichedMatchResult[];
}

const aiSearchSchema = {
  type: Type.OBJECT,
  properties: {
    action: {
      type: Type.STRING,
      enum: ['ask_clarifying_question', 'search_results', 'no_input_understood'],
    },
    reply: {
      type: Type.STRING,
      description: 'The conversational assistant reply to the user.',
    },
    extracted: {
      type: Type.OBJECT,
      properties: {
        category: {
          type: Type.STRING,
          enum: [...ITEM_CATEGORIES],
        },
        description: {
          type: Type.STRING,
          description: 'A summary description of the lost item.',
        },
        color: {
          type: Type.STRING,
          description: 'Color of the item if mentioned.',
        },
        brand: {
          type: Type.STRING,
          description: 'Brand or model of the item if mentioned.',
        },
        date_lost: {
          type: Type.STRING,
          description: 'Resolved ISO date string (YYYY-MM-DD) when the item was lost, based on today\'s date reference.',
        },
        location_lost: {
          type: Type.STRING,
          description: 'Location or campus building where the item was lost if mentioned.',
        },
      },
      required: ['category', 'description'],
    },
  },
  required: ['action', 'reply'],
};

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
        console.warn(`Transient issue with model ${model}, trying fallback...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}




/**
 * Handles multi-turn conversational AI search for lost items.
 */
export async function handleAiSearch(messages: ChatMessage[]): Promise<AiSearchResponse> {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return {
      reply: 'Please describe the item you are looking for.',
      action: 'no_input_understood',
    };
  }

  try {
    const ai = getGeminiClient();
    const todayIso = new Date().toISOString().split('T')[0];
    const todayHuman = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const conversationHistory = messages
      .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
      .map((m) => `${m.role.toUpperCase()}: ${m.content.trim()}`)
      .join('\n\n');

    if (!conversationHistory) {
      return {
        reply: 'Please describe the item you are looking for.',
        action: 'no_input_understood',
      };
    }

    const systemPrompt = `You are an intelligent Lost & Found AI search assistant for a university campus.
Your goal is to assist students and staff in searching for lost items in the campus found inventory through natural conversation.

TODAY'S REFERENCE DATE IS: ${todayIso} (${todayHuman}).
Use this date to resolve all relative date mentions (e.g. "today", "yesterday", "last week", "3 days ago", "last Monday") into real ISO date strings (YYYY-MM-DD).

ALLOWED ITEM CATEGORIES (strict enum):
${ITEM_CATEGORIES.map((c) => `- ${c}`).join('\n')}

DECISION RULES:
1. "no_input_understood":
   - The user input is off-topic, spam, gibberish, a greeting without describing an item, or unparseable.
   - Reply warmly and politely ask them to describe the lost item (e.g. item type, color, brand, or location).
   - Do NOT include the "extracted" object.

2. "ask_clarifying_question":
   - The user describes losing an item, but the details are too vague or generic to perform an effective search (e.g. "I lost my bottle", "I lost something yesterday", "lost my bag"), or the category cannot be determined with confidence.
   - Ask ONE friendly, concise clarifying question (e.g. asking for color, brand, distinctive marks, or where it was lost) to narrow down candidates.
   - Do NOT include the "extracted" object.

3. "search_results":
   - The user has provided sufficient identifying details to perform a search: at minimum, a category that maps clearly to the allowed categories enum, and identifying description (e.g. specific type, color, brand, or model).
   - Populate "extracted":
     - category: MUST be one of the allowed categories enum.
     - description: concise summary of the lost item.
     - color: color name if mentioned, otherwise omit.
     - brand: brand or make if mentioned, otherwise omit.
     - date_lost: resolved ISO date (YYYY-MM-DD) if mentioned or inferred relative to ${todayIso}, otherwise omit.
     - location_lost: campus building/room if mentioned, otherwise omit.
   - In "reply", provide a short, helpful message introducing the search.`;

    const prompt = `${systemPrompt}

CONVERSATION TRANSCRIPT:
${conversationHistory}`;

    const result = await generateContentWithRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: aiSearchSchema,
      },
    });



    const responseText = result.text;
    if (!responseText) {
      return {
        reply: 'Having trouble right now — try again in a moment.',
        action: 'no_input_understood',
      };
    }

    const parsed = JSON.parse(responseText);
    const action = parsed.action as AiSearchResponse['action'];

    if (action === 'ask_clarifying_question') {
      return {
        reply: parsed.reply || 'Could you provide a few more details about your item, such as its color or brand?',
        action: 'ask_clarifying_question',
      };
    }

    if (action === 'search_results' && parsed.extracted?.category) {
      const extracted: ExtractedSpecs = {
        category: parsed.extracted.category,
        description: parsed.extracted.description || '',
        color: parsed.extracted.color || undefined,
        brand: parsed.extracted.brand || undefined,
        date_lost: parsed.extracted.date_lost || undefined,
        location_lost: parsed.extracted.location_lost || undefined,
      };

      const matches = await findMatchesForLostSpecs(extracted);

      if (matches.length === 0) {
        return {
          reply: 'No matches found yet — want me to file this as an official report so you\'re notified if something turns up?',
          action: 'search_results',
          extracted,
          matches: [],
        };
      }

      return {
        reply: parsed.reply || `I found ${matches.length} possible matching item${matches.length > 1 ? 's' : ''} in the system:`,
        action: 'search_results',
        extracted,
        matches,
      };
    }

    return {
      reply: parsed.reply || 'Please describe the item you lost, including any details like color, brand, or where you last saw it.',
      action: 'no_input_understood',
    };
  } catch (error) {
    console.error('Error in handleAiSearch:', error);
    return {
      reply: 'Having trouble right now — try again in a moment.',
      action: 'no_input_understood',
    };
  }
}
