import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/serviceRole';
import { computeAndSaveMatchesForLostReport } from '@/lib/matching/computeMatches';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lostReportId = body.lostReportId || body.lost_report_id || body.id;

    if (!lostReportId) {
      return NextResponse.json(
        { error: 'Missing lostReportId in request body' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Fetch the lost report by ID or ticket_id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lostReportId);
    let query = supabase.from('lost_reports').select('*');
    if (isUuid) {
      query = query.or(`id.eq.${lostReportId},ticket_id.eq.${lostReportId}`);
    } else {
      query = query.eq('ticket_id', lostReportId);
    }

    const { data: lostReport, error } = await query.maybeSingle();

    if (error || !lostReport) {
      return NextResponse.json(
        { error: 'Lost report not found' },
        { status: 404 }
      );
    }

    const matches = await computeAndSaveMatchesForLostReport(lostReport);

    return NextResponse.json({
      success: true,
      lostReportId: lostReport.id,
      matchCount: matches.length,
      matches,
    });
  } catch (err: any) {
    console.error('Error in /api/lost-reports/match:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to compute matches' },
      { status: 500 }
    );
  }
}
