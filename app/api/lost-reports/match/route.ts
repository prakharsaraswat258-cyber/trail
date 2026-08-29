import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/serviceRole';
import { computeAndSaveMatchesForLostReport } from '@/lib/matching/computeMatches';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const lostItemId = body.lost_item_id || body.lostReportId || body.id;

    // Validate UUID format strictly
    if (!lostItemId || typeof lostItemId !== 'string' || !UUID_REGEX.test(lostItemId)) {
      return NextResponse.json(
        { error: 'Invalid or missing lost_item_id UUID in request body' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Fetch the lost report by primary key UUID
    const { data: lostReport, error: fetchError } = await supabase
      .from('lost_reports')
      .select('id, category, item_name, description, date_lost, time_lost, time_period, location_building, location_area, status')
      .eq('id', lostItemId)
      .maybeSingle();

    if (fetchError || !lostReport) {
      return NextResponse.json(
        { error: 'Lost report not found' },
        { status: 404 }
      );
    }

    // Compute matches using AI + weighted scoring
    const savedMatches = await computeAndSaveMatchesForLostReport(lostReport);

    if (savedMatches.length === 0) {
      return NextResponse.json({
        success: true,
        lostReportId: lostReport.id,
        matchCount: 0,
        matches: [],
      });
    }

    // Fetch found item metadata for matches (strictly excluding photos for privacy)
    const foundItemIds = savedMatches.map((m) => m.found_item_id);
    const { data: foundItems } = await supabase
      .from('found_items')
      .select('id, item_name, category, date_found, location_building, location_floor, location_landmark_or_room')
      .in('id', foundItemIds);

    const foundItemMap = new Map<string, any>();
    if (foundItems) {
      for (const item of foundItems) {
        foundItemMap.set(item.id, item);
      }
    }

    const enrichedMatches = savedMatches.map((m) => {
      const foundItem = foundItemMap.get(m.found_item_id);
      const locationParts = [
        foundItem?.location_building,
        foundItem?.location_floor,
        foundItem?.location_landmark_or_room,
      ].filter(Boolean);

      return {
        found_item_id: m.found_item_id,
        confidence_score: m.confidence_score,
        confidence_label: m.confidence_label,
        ai_reasoning: m.ai_reasoning || 'Matched by category and date — AI ranking unavailable.',
        item_name: foundItem?.item_name || 'Found Item',
        category: foundItem?.category || lostReport.category,
        date_found: foundItem?.date_found || '',
        location_found: locationParts.length > 0 ? locationParts.join(', ') : undefined,
      };
    });

    return NextResponse.json({
      success: true,
      lostReportId: lostReport.id,
      matchCount: enrichedMatches.length,
      matches: enrichedMatches,
    });
  } catch (err: any) {
    console.error('Error in /api/lost-reports/match:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to compute matches' },
      { status: 500 }
    );
  }
}
