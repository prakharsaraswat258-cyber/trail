import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FoundItemPayload } from '@/lib/types/foundItem';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const id = params.id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase.from('found_items_public').select('*');
    if (isUuid) {
      query = query.or(`id.eq.${id},reference_code.eq.${id}`);
    } else {
      query = query.eq('reference_code', id);
    }

    const { data, error } = await query.single();
    if (error || !data) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const id = params.id;
    const updates = (await req.json()) as Partial<FoundItemPayload>;

    const updateData: Record<string, any> = {};
    if (updates.itemName !== undefined) updateData.item_name = updates.itemName;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.photos !== undefined) updateData.photos = updates.photos;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.handoffDesk !== undefined) updateData.handoff_desk = updates.handoffDesk;
    if (updates.hideDetails !== undefined) updateData.hide_details = updates.hideDetails;
    if (updates.contactMethod !== undefined) updateData.contact_method = updates.contactMethod;
    if (updates.contactDetail !== undefined) updateData.contact_detail = updates.contactDetail;
    if (updates.dateFound !== undefined) updateData.date_found = updates.dateFound;
    if (updates.timeFound !== undefined) updateData.time_found = updates.timeFound;
    if (updates.timePeriod !== undefined) updateData.time_period = updates.timePeriod;

    if (updates.location) {
      if (updates.location.building !== undefined) updateData.location_building = updates.location.building;
      if (updates.location.floor !== undefined) updateData.location_floor = updates.location.floor;
      if (updates.location.landmarkOrRoom !== undefined) updateData.location_landmark_or_room = updates.location.landmarkOrRoom;
      if (updates.location.geoDetected !== undefined) updateData.location_geo_detected = updates.location.geoDetected;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let query = supabase.from('found_items').update(updateData);
    if (isUuid) {
      query = query.or(`id.eq.${id},reference_code.eq.${id}`);
    } else {
      query = query.eq('reference_code', id);
    }

    const { data, error } = await query.select().single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ report: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Invalid update payload' }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const id = params.id;
    const body = await req.json();

    if (body.status === 'returned') {
      const returnedAt = new Date().toISOString();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      let query = supabase.from('found_items').update({
        status: 'returned',
        returned_at: returnedAt,
      });

      if (isUuid) {
        query = query.or(`id.eq.${id},reference_code.eq.${id}`);
      } else {
        query = query.eq('reference_code', id);
      }

      const { data, error } = await query.select('id, status, returned_at').single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ id: data.id, status: 'returned', returnedAt: data.returned_at || returnedAt });
    }

    return NextResponse.json({ error: 'Invalid status update' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
  }
}
