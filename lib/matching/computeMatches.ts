import { createServiceRoleClient } from '../supabase/serviceRole';

export interface MatchCandidateFoundItem {
  id?: string;
  category?: string | null;
  location_building?: string | null;
  location_floor?: string | null;
  location_landmark_or_room?: string | null;
  date_found?: string | null;
  item_name?: string | null;
  description?: string | null;
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
  status?: string | null;
  [key: string]: any;
}

export interface MatchRecord {
  id?: string;
  lost_report_id: string;
  found_item_id: string;
  confidence_score: number;
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
 * Computes match scores against all active lost reports and upserts qualifying matches into Supabase matches.
 */
export async function computeAndSaveMatchesForFoundItem(
  foundItem: MatchCandidateFoundItem
): Promise<MatchRecord[]> {
  if (!foundItem?.id) {
    return [];
  }

  try {
    const supabase = createServiceRoleClient();

    // 1. Fetch active lost reports
    const { data: lostReports, error } = await supabase
      .from('lost_reports')
      .select('*')
      .neq('status', 'resolved');

    if (error || !lostReports || lostReports.length === 0) {
      return [];
    }

    // 2. Score candidate lost reports
    const matchRowsToUpsert: Array<{
      lost_report_id: string;
      found_item_id: string;
      confidence_score: number;
      status: 'suggested';
    }> = [];

    for (const report of lostReports) {
      const score = scoreMatch(foundItem, report);
      if (score >= 30) {
        matchRowsToUpsert.push({
          lost_report_id: report.id,
          found_item_id: foundItem.id,
          confidence_score: score,
          status: 'suggested',
        });
      }
    }

    if (matchRowsToUpsert.length === 0) {
      return [];
    }

    // 3. Upsert into public.matches (unique on lost_report_id, found_item_id)
    const { data: savedMatches, error: upsertError } = await supabase
      .from('matches')
      .upsert(matchRowsToUpsert, {
        onConflict: 'lost_report_id,found_item_id',
      })
      .select();

    if (upsertError) {
      console.error('Failed to upsert matches in computeAndSaveMatchesForFoundItem:', upsertError);
      return [];
    }

    return savedMatches || [];
  } catch (err) {
    console.error('Error in computeAndSaveMatchesForFoundItem:', err);
    return [];
  }
}

/**
 * Computes match scores against all active found items and upserts qualifying matches into Supabase `matches`.
 */
export async function computeAndSaveMatchesForLostReport(
  lostReport: MatchCandidateLostReport
): Promise<MatchRecord[]> {
  if (!lostReport?.id) {
    return [];
  }

  try {
    const supabase = createServiceRoleClient();

    // 1. Fetch active found items (status != 'returned')
    const { data: foundItems, error } = await supabase
      .from('found_items')
      .select('*')
      .neq('status', 'returned');

    if (error || !foundItems || foundItems.length === 0) {
      return [];
    }

    // 2. Score candidate found items
    const matchRowsToUpsert: Array<{
      lost_report_id: string;
      found_item_id: string;
      confidence_score: number;
      status: 'suggested';
    }> = [];

    for (const item of foundItems) {
      const score = scoreMatch(item, lostReport);
      if (score >= 30) {
        matchRowsToUpsert.push({
          lost_report_id: lostReport.id,
          found_item_id: item.id,
          confidence_score: score,
          status: 'suggested',
        });
      }
    }

    if (matchRowsToUpsert.length === 0) {
      return [];
    }

    // 3. Upsert into public.matches (unique on lost_report_id, found_item_id)
    const { data: savedMatches, error: upsertError } = await supabase
      .from('matches')
      .upsert(matchRowsToUpsert, {
        onConflict: 'lost_report_id,found_item_id',
      })
      .select();

    if (upsertError) {
      console.error('Failed to upsert matches in computeAndSaveMatchesForLostReport:', upsertError);
      return [];
    }

    return savedMatches || [];
  } catch (err) {
    console.error('Error in computeAndSaveMatchesForLostReport:', err);
    return [];
  }
}
