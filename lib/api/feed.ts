import { createClient } from '../supabase/client';
import { ItemCategory } from '../constants/itemCategories';

export type ReportType = 'lost' | 'found';
export type MatchStatus = 'none' | 'maybe' | 'matched';

export interface FeedPost {
  id: string;
  type: ReportType;
  ticketId?: string; // present for lost reports
  category: ItemCategory;
  itemName: string;
  descriptionSnippet: string;
  photoUrl?: string;
  location: string;
  timestamp: string; // ISO string
  matchStatus?: MatchStatus;
  matchConfidence?: number; // 0-100
}

export interface FeedResponse {
  posts: FeedPost[];
  nextCursor?: string;
}

export interface FeedQueryParams {
  type?: 'all' | 'lost' | 'found';
  category?: string;
  q?: string;
  cursor?: string;
  limit?: number;
}

/**
 * Fetches unified lost and found feed from Supabase `posts_feed` view.
 */
export async function fetchFeed(params: FeedQueryParams = {}): Promise<FeedResponse> {
  const supabase = createClient();
  const { type = 'all', category, q, cursor, limit = 5 } = params;

  let query = supabase
    .from('posts_feed')
    .select('*')
    .order('created_at', { ascending: false });

  if (type !== 'all') {
    query = query.eq('type', type);
  }

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  const cleanQuery = q?.trim();
  if (cleanQuery) {
    query = query.or(
      `title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,location_summary.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%`
    );
  }

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  // Request 1 extra row to detect nextCursor
  const fetchLimit = Math.min(Math.max(limit, 1), 50);
  query = query.limit(fetchLimit + 1);

  const { data: rows, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  if (!rows || rows.length === 0) {
    return { posts: [], nextCursor: undefined };
  }

  const hasMore = rows.length > fetchLimit;
  const pageRows = hasMore ? rows.slice(0, fetchLimit) : rows;
  const nextCursor = hasMore ? pageRows[pageRows.length - 1].created_at : undefined;

  // Collect found IDs and lost IDs to query matches
  const foundIds = pageRows.filter((r: any) => r.type === 'found').map((r: any) => r.id);
  const lostIds = pageRows.filter((r: any) => r.type === 'lost').map((r: any) => r.id);

  const matchMap: Record<string, number> = {};

  if (foundIds.length > 0 || lostIds.length > 0) {
    let matchQuery = supabase.from('matches').select('found_item_id, lost_report_id, confidence_score');
    if (foundIds.length > 0 && lostIds.length > 0) {
      matchQuery = matchQuery.or(`found_item_id.in.(${foundIds.join(',')}),lost_report_id.in.(${lostIds.join(',')})`);
    } else if (foundIds.length > 0) {
      matchQuery = matchQuery.in('found_item_id', foundIds);
    } else if (lostIds.length > 0) {
      matchQuery = matchQuery.in('lost_report_id', lostIds);
    }

    const { data: matchData } = await matchQuery;
    if (matchData) {
      for (const m of matchData) {
        if (m.found_item_id) {
          const current = matchMap[m.found_item_id] || 0;
          if (m.confidence_score > current) matchMap[m.found_item_id] = m.confidence_score;
        }
        if (m.lost_report_id) {
          const current = matchMap[m.lost_report_id] || 0;
          if (m.confidence_score > current) matchMap[m.lost_report_id] = m.confidence_score;
        }
      }
    }
  }

  // Also query ticket_id for lost reports if needed
  const ticketMap: Record<string, string> = {};
  if (lostIds.length > 0) {
    const { data: lostRows } = await supabase
      .from('lost_reports')
      .select('id, ticket_id')
      .in('id', lostIds);
    if (lostRows) {
      for (const lr of lostRows) {
        ticketMap[lr.id] = lr.ticket_id;
      }
    }
  }

  const posts: FeedPost[] = pageRows.map((row: any) => {
    const score = matchMap[row.id];
    let matchStatus: MatchStatus = 'none';
    if (score !== undefined) {
      matchStatus = score >= 50 ? 'matched' : 'maybe';
    }

    const photoUrl = Array.isArray(row.photos) && row.photos.length > 0 ? row.photos[0] : undefined;

    return {
      id: row.id,
      type: row.type as ReportType,
      ticketId: row.type === 'lost' ? ticketMap[row.id] : undefined,
      category: row.category as ItemCategory,
      itemName: row.title,
      descriptionSnippet: row.description || '',
      photoUrl,
      location: row.location_summary || 'Campus',
      timestamp: row.created_at,
      matchStatus,
      matchConfidence: score,
    };
  });

  return { posts, nextCursor };
}
