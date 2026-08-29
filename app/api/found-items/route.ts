import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FoundItemPayload } from '@/lib/types/foundItem';

function generateRefCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const num = Math.floor(1000 + Math.random() * 9000);
  const prefix = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  return `FND-${prefix}-${num}`;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    let user = null;
    try {
      const { data } = await supabase.auth.getUser();
      user = data?.user || null;
    } catch {
      user = null;
    }

    const body = (await req.json()) as FoundItemPayload;

    if (!body.itemName || !body.category || !body.photos?.length || !body.location?.building) {
      return NextResponse.json(
        { error: 'Missing required fields (itemName, category, photos, building)' },
        { status: 400 }
      );
    }

    const referenceCode = generateRefCode();

    const insertPayload: any = {
      reference_code: referenceCode,
      item_name: body.itemName,
      category: body.category,
      photos: body.photos || [],
      location_building: body.location.building,
      location_floor: body.location.floor || null,
      location_landmark_or_room: body.location.landmarkOrRoom || null,
      location_geo_detected: body.location.geoDetected || false,
      date_found: body.dateFound,
      time_found: body.timeFound || null,
      time_period: body.timePeriod || null,
      description: body.description,
      status: body.status,
      handoff_desk: body.handoffDesk || null,
      hide_details: body.hideDetails || false,
      contact_method: body.contactMethod,
      contact_detail: body.contactDetail || null,
    };

    const isUuid = user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    if (user && isUuid) {
      insertPayload.user_id = user.id;
    }

    let insertResult = await supabase
      .from('found_items')
      .insert(insertPayload)
      .select()
      .single();

    if (insertResult.error && insertPayload.user_id && insertResult.error.message.includes('foreign key')) {
      delete insertPayload.user_id;
      insertResult = await supabase
        .from('found_items')
        .insert(insertPayload)
        .select()
        .single();
    }

    const { data, error } = insertResult;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: matchRows } = await supabase
      .from('matches')
      .select('id, confidence_score')
      .eq('found_item_id', data.id)
      .gte('confidence_score', 50);

    const immediateMatchFound = Boolean(matchRows && matchRows.length > 0);

    return NextResponse.json(
      {
        id: data.id,
        referenceCode: data.reference_code,
        createdAt: data.created_at,
        immediateMatchFound,
        matchCount: matchRows ? matchRows.length : 0,
        report: data,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Invalid request payload' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('found_items_public')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reports: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch reports' }, { status: 500 });
  }
}
