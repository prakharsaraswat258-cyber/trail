import { createServiceRoleClient } from '../supabase/serviceRole';
import {
  isWithinDays,
  mapScoreToLabel,
  rankCandidatesWithGemini,
  EnrichedMatchResult,
} from '../matching';

export interface MatchCandidateFoundItem {
  id?: string;
  category?: string | null;
  location_building?: string | null;
  location_floor?: string | null;
  location_landmark_or_room?: string | null;
  date_found?: string | null;
  item_name?: string | null;
  description?: string | null;
  time_found?: string | null;
  time_period?: string | null;
  [key: string]: any;
}

export interface MatchCandidateLostReport {
  id: string;
  category?: string | null;
  location_building?: string | null;
  location_area?: string | null;
  date_lost?: string | null;
  item_name?: string | null;
  description?: string | null;
  time_lost?: string | null;
  time_period?: string | null;
  status?: string | null;
  [key: string]: any;
}

export interface MatchRecord {
  id?: string;
  lost_report_id: string;
  found_item_id: string;
  confidence_score: number;
  confidence_label: 'strong' | 'possible' | 'weak';
  ai_reasoning: string | null;
  status: 'suggested' | 'confirmed' | 'dismissed';
  created_at?: string;
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'is', 'it', 'as', 'be', 'are', 'was', 'were', 'been', 'has',
  'have', 'had', 'do', 'does', 'did', 'my', 'your', 'his', 'her', 'its', 'our',
  'their', 'this', 'that', 'these', 'those', 'near', 'left', 'found', 'lost',
  'item', 'some', 'about', 'just', 'over', 'into', 'under', 'here', 'there',
  'when', 'where', 'which', 'who', 'what', 'why', 'how', 'all', 'any', 'both',
  'each', 'few', 'more', 'most', 'other', 'only', 'same', 'so', 'than', 'too',
  'very', 'can', 'will', 'should', 'would', 'could', 'please',
]);

/**
 * Normalizes text to lowercase, removes punctuation, and splits into distinct words.
 */
export function tokenize(text?: string | null, filterStopwords = false): Set<string> {
  if (!text || typeof text !== 'string') return new Set();
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
  if (!cleaned) return new Set();
  const tokens = cleaned
    .split(/\s+/)
    .filter((w) => Boolean(w) && (!filterStopwords || (w.length > 2 && !STOPWORDS.has(w))));
  return new Set(tokens);
}

/**
 * Calculates a 0-100 similarity score between a found item and a lost report.
 */
export function scoreMatch(
  foundItem: MatchCandidateFoundItem,
  lostReport: MatchCandidateLostReport
): number {
  if (!foundItem || !lostReport) return 0;

  // 1. Category exact match (25 pts)
  let categoryScore = 0;
  if (
    foundItem.category &&
    lostReport.category &&
    foundItem.category.trim().toLowerCase() === lostReport.category.trim().toLowerCase()
  ) {
    categoryScore = 25;
  }

  // 2. Location matching (20 pts exact building, 10 pts secondary overlap)
  let locationScore = 0;
  const foundBuilding = (foundItem.location_building || foundItem.location?.building || '')
    .trim()
    .toLowerCase();
  const lostBuilding = (lostReport.location_building || '').trim().toLowerCase();

  if (foundBuilding && lostBuilding && foundBuilding === lostBuilding) {
    locationScore = 20;
  } else {
    // Check secondary location overlap
    const foundSecondary = (
      (foundItem.location_floor || foundItem.location?.floor || '') +
      ' ' +
      (foundItem.location_landmark_or_room || foundItem.location?.landmarkOrRoom || '')
    ).trim();
    const lostSecondary = (lostReport.location_area || '').trim();

    if (foundSecondary && lostSecondary) {
      const foundSecTokens = tokenize(foundSecondary);
      const lostSecTokens = tokenize(lostSecondary);
      let overlaps = false;

      foundSecTokens.forEach((token) => {
        if (token.length >= 3 && lostSecTokens.has(token)) {
          overlaps = true;
        }
      });

      if (
        overlaps ||
        foundSecondary.toLowerCase().includes(lostSecondary.toLowerCase()) ||
        lostSecondary.toLowerCase().includes(foundSecondary.toLowerCase())
      ) {
        locationScore = 10;
      }
    }
  }

  // 3. Date proximity (20 pts max, 0 pts if found before lost)
  let dateScore = 0;
  if (foundItem.date_found && lostReport.date_lost) {
    const parseUtcDate = (dStr: string) => {
      const [y, m, d] = dStr.split('-').map(Number);
      return Date.UTC(y, (m || 1) - 1, d || 1);
    };

    const foundUtc = parseUtcDate(foundItem.date_found);
    const lostUtc = parseUtcDate(lostReport.date_lost);

    if (foundUtc >= lostUtc) {
      const diffDays = Math.max(0, (foundUtc - lostUtc) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        dateScore = 20;
      } else if (diffDays < 14) {
        dateScore = 20 * (1 - diffDays / 14);
      } else {
        dateScore = 0;
      }
    }
  }

  const textFound = `${foundItem.item_name || ''} ${foundItem.description || ''}`;
  const textLost = `${lostReport.item_name || ''} ${lostReport.description || ''}`;
  const tokensFound = tokenize(textFound, true);
  const tokensLost = tokenize(textLost, true);

  let overlapRatio = 0;
  if (tokensFound.size > 0 && tokensLost.size > 0) {
    let intersectionCount = 0;
    tokensFound.forEach((t) => {
      if (tokensLost.has(t)) {
        intersectionCount++;
      }
    });
    const unionSet = new Set<string>();
    tokensFound.forEach((t) => unionSet.add(t));
    tokensLost.forEach((t) => unionSet.add(t));
    const unionSize = unionSet.size;
    overlapRatio = unionSize > 0 ? intersectionCount / unionSize : 0;
  }
  const textScore = 25 * overlapRatio;

  // 5. Distinct keyword overlap bonus (10 pts if shared distinctive word len > 3, and overlap ratio < 0.3)
  let keywordBonus = 0;
  if (overlapRatio < 0.3) {
    const descTokensFound = tokenize(foundItem.description, true);
    const descTokensLost = tokenize(lostReport.description, true);

    descTokensFound.forEach((token) => {
      if (token.length > 3 && !STOPWORDS.has(token) && descTokensLost.has(token)) {
        keywordBonus = 10;
      }
    });
  }

  const rawTotal = categoryScore + locationScore + dateScore + textScore + keywordBonus;
  return Math.max(0, Math.min(100, Math.round(rawTotal)));
}

/**
 * Computes AI-enhanced match scores against active lost reports and upserts qualifying matches into Supabase `matches`.
 * Triggered when a new found item is submitted.
 */
export async function computeAndSaveMatchesForFoundItem(
  foundItem: MatchCandidateFoundItem
): Promise<MatchRecord[]> {
  if (!foundItem?.id || !foundItem?.category) {
    return [];
  }

  try {
    const supabase = createServiceRoleClient();

    // 1. Fetch active lost reports matching category (allowlist: submitted, under_review, potential_match)
    // Note: NEVER select 'photos' column for privacy
    const { data: lostReports, error } = await supabase
      .from('lost_reports')
      .select('id, category, item_name, description, location_building, location_area, date_lost, time_lost, time_period, created_at')
      .eq('category', foundItem.category)
      .in('status', ['submitted', 'under_review', 'potential_match']);

    if (error || !lostReports || lostReports.length === 0) {
      return [];
    }

    // 2. Pre-filter by date window (+-30 days) and calculate base heuristic score
    const scoredCandidates = lostReports
      .filter((report) => isWithinDays(foundItem.date_found, report.date_lost, 30))
      .map((report) => {
        const hScore = scoreMatch(foundItem, report);
        const loc = report.location_area
          ? `${report.location_building || ''} (${report.location_area})`
          : report.location_building || '';
        return {
          id: report.id,
          item_name: report.item_name,
          category: report.category,
          description: report.description,
          date: report.date_lost,
          location: loc,
          heuristicScore: hScore,
          rawReport: report,
        };
      })
      .sort((a, b) => b.heuristicScore - a.heuristicScore)
      .slice(0, 15);

    if (scoredCandidates.length === 0) {
      return [];
    }

    // 3. Re-rank candidates with Gemini with structured output, fallback gracefully on failure
    let aiScoresMap: Map<string, { confidence_score: number; ai_reasoning: string }> | null = null;
    try {
      const foundLocation = [
        foundItem.location_building,
        foundItem.location_floor,
        foundItem.location_landmark_or_room,
      ]
        .filter(Boolean)
        .join(', ');

      aiScoresMap = await rankCandidatesWithGemini(
        {
          type: 'found',
          item_name: foundItem.item_name,
          category: foundItem.category,
          description: foundItem.description,
          date: foundItem.date_found,
          location: foundLocation,
        },
        scoredCandidates
      );
    } catch (geminiError) {
      console.error('Gemini re-ranking failed in computeAndSaveMatchesForFoundItem, falling back to heuristic:', geminiError);
    }

    // 4. Assemble matches using AI score or fallback heuristic
    const matchRowsToUpsert: Array<{
      lost_report_id: string;
      found_item_id: string;
      confidence_score: number;
      confidence_label: 'strong' | 'possible' | 'weak';
      ai_reasoning: string;
      status: 'suggested';
    }> = [];

    for (const candidate of scoredCandidates) {
      let finalScore: number;
      let finalReasoning: string;
      let label: 'strong' | 'possible' | 'weak';

      if (aiScoresMap && aiScoresMap.has(candidate.id)) {
        const aiResult = aiScoresMap.get(candidate.id)!;
        finalScore = aiResult.confidence_score;
        finalReasoning = aiResult.ai_reasoning;
        label = mapScoreToLabel(finalScore);
      } else {
        // Fallback to base score
        finalScore = candidate.heuristicScore;
        label = candidate.heuristicScore >= 70 ? 'strong' : 'possible';
        finalReasoning = 'Matched by category and date — AI ranking unavailable.';
      }

      // Exclude matches with confidence < 40
      if (finalScore >= 40) {
        matchRowsToUpsert.push({
          lost_report_id: candidate.id,
          found_item_id: foundItem.id,
          confidence_score: finalScore,
          confidence_label: label,
          ai_reasoning: finalReasoning,
          status: 'suggested',
        });
      }
    }

    if (matchRowsToUpsert.length === 0) {
      return [];
    }

    // 5. Upsert into public.matches (unique on lost_report_id, found_item_id)
    let { data: savedMatches, error: upsertError } = await supabase
      .from('matches')
      .upsert(matchRowsToUpsert, {
        onConflict: 'lost_report_id,found_item_id',
      })
      .select();

    if (upsertError && (upsertError.message?.includes('ai_reasoning') || upsertError.message?.includes('confidence_label') || upsertError.code === 'PGRST204')) {
      const baseRows = matchRowsToUpsert.map((r) => ({
        lost_report_id: r.lost_report_id,
        found_item_id: r.found_item_id,
        confidence_score: r.confidence_score,
        status: r.status,
      }));
      const retry = await supabase
        .from('matches')
        .upsert(baseRows, { onConflict: 'lost_report_id,found_item_id' })
        .select();
      if (!retry.error) {
        savedMatches = matchRowsToUpsert as any;
        upsertError = null;
      }
    }

    if (upsertError) {
      console.error('Failed to upsert matches in computeAndSaveMatchesForFoundItem:', upsertError);
      return [];
    }

    return (savedMatches as MatchRecord[]) || [];
  } catch (err) {
    console.error('Error in computeAndSaveMatchesForFoundItem:', err);
    return [];
  }
}

export interface LostItemMatchSpec {
  id?: string;
  category?: string | null;
  item_name?: string | null;
  description?: string | null;
  date_lost?: string | null;
  location_building?: string | null;
  location_area?: string | null;
  location_lost?: string | null;
  color?: string | null;
  brand?: string | null;
  [key: string]: any;
}


/**
 * Pure search function: queries found items, pre-filters, and scores candidates with Gemini AI.
 * Does NOT persist to database — usable for both live search assistant and report matching.
 */
export async function findMatchesForLostSpecs(
  lostSpec: LostItemMatchSpec
): Promise<EnrichedMatchResult[]> {
  if (!lostSpec?.category) {
    return [];
  }

  try {
    const supabase = createServiceRoleClient();

    // 1. Fetch active found items (status strictly = 'with_finder')
    // Note: NEVER select 'photos' column for privacy
    const { data: foundItems, error } = await supabase
      .from('found_items')
      .select('id, category, item_name, description, location_building, location_floor, location_landmark_or_room, date_found, time_found, time_period, created_at')
      .eq('category', lostSpec.category)
      .eq('status', 'with_finder');

    if (error || !foundItems || foundItems.length === 0) {
      return [];
    }

    // Build target candidate for heuristic scoring
    const descParts = [
      lostSpec.brand ? `Brand: ${lostSpec.brand}` : '',
      lostSpec.color ? `Color: ${lostSpec.color}` : '',
      lostSpec.description || '',
    ]
      .filter(Boolean)
      .join('. ');

    const targetCandidate: MatchCandidateLostReport = {
      id: lostSpec.id || 'search-spec',
      category: lostSpec.category,
      item_name: lostSpec.item_name || lostSpec.brand || 'Lost Item',
      description: descParts || lostSpec.description || '',
      date_lost: lostSpec.date_lost || null,
      location_building: lostSpec.location_building || lostSpec.location_lost || null,
      location_area: lostSpec.location_area || null,
    };

    // 2. Pre-filter by date window (+-30 days) and calculate base heuristic score
    const scoredCandidates = foundItems
      .filter((item) => isWithinDays(item.date_found, targetCandidate.date_lost, 30))
      .map((item) => {
        const hScore = scoreMatch(item, targetCandidate);
        const loc = [
          item.location_building,
          item.location_floor,
          item.location_landmark_or_room,
        ]
          .filter(Boolean)
          .join(', ');

        return {
          id: item.id,
          item_name: item.item_name,
          category: item.category,
          description: item.description,
          date: item.date_found,
          location: loc,
          heuristicScore: hScore,
          rawItem: item,
        };
      })
      .sort((a, b) => b.heuristicScore - a.heuristicScore)
      .slice(0, 15);

    if (scoredCandidates.length === 0) {
      return [];
    }

    // 3. Re-rank candidates with Gemini with structured output, fallback gracefully on failure
    let aiScoresMap: Map<string, { confidence_score: number; ai_reasoning: string }> | null = null;
    try {
      const lostLocation = targetCandidate.location_area
        ? `${targetCandidate.location_building || ''} (${targetCandidate.location_area})`
        : targetCandidate.location_building || lostSpec.location_lost || '';

      aiScoresMap = await rankCandidatesWithGemini(
        {
          type: 'lost',
          item_name: targetCandidate.item_name,
          category: targetCandidate.category,
          description: targetCandidate.description,
          date: targetCandidate.date_lost,
          location: lostLocation,
        },
        scoredCandidates
      );
    } catch (geminiError) {
      console.error('Gemini re-ranking failed in findMatchesForLostSpecs, falling back to heuristic:', geminiError);
    }

    // 4. Assemble matches using AI score or fallback heuristic
    const results: EnrichedMatchResult[] = [];

    for (const candidate of scoredCandidates) {
      let finalScore: number;
      let finalReasoning: string;
      let label: 'strong' | 'possible' | 'weak';

      if (aiScoresMap && aiScoresMap.has(candidate.id)) {
        const aiResult = aiScoresMap.get(candidate.id)!;
        finalScore = aiResult.confidence_score;
        finalReasoning = aiResult.ai_reasoning;
        label = mapScoreToLabel(finalScore);
      } else {
        // Fallback to base score
        finalScore = candidate.heuristicScore;
        label = candidate.heuristicScore >= 70 ? 'strong' : 'possible';
        finalReasoning = 'Matched by category and date — AI ranking unavailable.';
      }

      // Exclude matches with confidence < 40
      if (finalScore >= 40) {
        results.push({
          found_item_id: candidate.id,
          confidence_score: finalScore,
          confidence_label: label,
          ai_reasoning: finalReasoning,
          item_name: candidate.item_name || 'Found Item',
          category: candidate.category || lostSpec.category,
          date_found: candidate.date || '',
          location_found: candidate.location || undefined,
        });
      }
    }

    results.sort((a, b) => b.confidence_score - a.confidence_score);
    return results;
  } catch (err) {
    console.error('Error in findMatchesForLostSpecs:', err);
    return [];
  }
}

/**
 * Computes AI-enhanced match scores against active found items and upserts qualifying matches into Supabase `matches`.
 * Triggered when a new lost report is submitted.
 */
export async function computeAndSaveMatchesForLostReport(
  lostReport: MatchCandidateLostReport
): Promise<MatchRecord[]> {
  if (!lostReport?.id || !lostReport?.category) {
    return [];
  }

  try {
    const enrichedMatches = await findMatchesForLostSpecs(lostReport);
    if (enrichedMatches.length === 0) {
      return [];
    }

    const supabase = createServiceRoleClient();
    const matchRowsToUpsert = enrichedMatches.map((m) => ({
      lost_report_id: lostReport.id,
      found_item_id: m.found_item_id,
      confidence_score: m.confidence_score,
      confidence_label: m.confidence_label,
      ai_reasoning: m.ai_reasoning,
      status: 'suggested' as const,
    }));

    // Upsert into public.matches (unique on lost_report_id, found_item_id)
    let { data: savedMatches, error: upsertError } = await supabase
      .from('matches')
      .upsert(matchRowsToUpsert, {
        onConflict: 'lost_report_id,found_item_id',
      })
      .select();

    if (upsertError && (upsertError.message?.includes('ai_reasoning') || upsertError.message?.includes('confidence_label') || upsertError.code === 'PGRST204')) {
      const baseRows = matchRowsToUpsert.map((r) => ({
        lost_report_id: r.lost_report_id,
        found_item_id: r.found_item_id,
        confidence_score: r.confidence_score,
        status: r.status,
      }));
      const retry = await supabase
        .from('matches')
        .upsert(baseRows, { onConflict: 'lost_report_id,found_item_id' })
        .select();
      if (!retry.error) {
        savedMatches = matchRowsToUpsert as any;
        upsertError = null;
      }
    }

    if (upsertError) {
      console.error('Failed to upsert matches in computeAndSaveMatchesForLostReport:', upsertError);
      return [];
    }

    return (savedMatches as MatchRecord[]) || [];
  } catch (err) {
    console.error('Error in computeAndSaveMatchesForLostReport:', err);
    return [];
  }
}

