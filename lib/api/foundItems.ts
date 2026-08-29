import { createClient } from '../supabase/client';
import { FoundItemPayload, FoundItemResponse, FoundItemRecord } from '../types/foundItem';

function generateRefCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const num = Math.floor(1000 + Math.random() * 9000);
  const prefix = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  return `FND-${prefix}-${num}`;
}

function mapRowToRecord(row: any): FoundItemRecord {
  return {
    id: row.id,
    referenceCode: row.reference_code,
    itemName: row.item_name,
    category: row.category,
    photos: row.photos || [],
    location: {
      building: row.location_building,
      floor: row.location_floor || undefined,
      landmarkOrRoom: row.location_landmark_or_room || undefined,
      geoDetected: row.location_geo_detected ?? false,
    },
    dateFound: row.date_found,
    timeFound: row.time_found || undefined,
    timePeriod: row.time_period || undefined,
    description: row.description,
    status: row.status === 'returned' ? 'handed_over' : row.status,
    currentStatus: row.status,
    handoffDesk: row.handoff_desk || undefined,
    hideDetails: row.hide_details ?? false,
    contactMethod: row.contact_method,
    contactDetail: row.contact_detail || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    returnedAt: row.returned_at || undefined,
  };
}

/**
 * Submits a new found item report to Supabase table `found_items`.
 */
export async function submitFoundItem(payload: FoundItemPayload): Promise<FoundItemResponse> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isUuid = user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

  let validProfileUserId: string | null = null;
  if (user && isUuid) {
    try {
      const { data: upsertData } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
      }).select('id').maybeSingle();

      if (upsertData?.id) {
        validProfileUserId = upsertData.id;
      }
    } catch {}

    if (!validProfileUserId) {
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        if (existing?.id) {
          validProfileUserId = existing.id;
        }
      } catch {}
    }
  }

  const referenceCode = generateRefCode();

  const insertPayload: any = {
    reference_code: referenceCode,
    item_name: payload.itemName,
    category: payload.category,
    photos: payload.photos || [],
    location_building: payload.location.building,
    location_floor: payload.location.floor || null,
    location_landmark_or_room: payload.location.landmarkOrRoom || null,
    location_geo_detected: payload.location.geoDetected ?? false,
    date_found: payload.dateFound,
    time_found: payload.timeFound || null,
    time_period: payload.timePeriod || null,
    description: payload.description,
    status: payload.status,
    handoff_desk: payload.handoffDesk || null,
    hide_details: payload.hideDetails ?? false,
    contact_method: payload.contactMethod,
    contact_detail: payload.contactDetail || null,
  };

  if (validProfileUserId) {
    insertPayload.user_id = validProfileUserId;
  }

  let insertResult = await supabase
    .from('found_items')
    .insert(insertPayload)
    .select()
    .single();

  // If foreign key constraint failed on user_id, retry without user_id for guest/demo submission
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
    console.error('Supabase submitFoundItem error:', error);
    throw new Error(error.message);
  }

  // Check if matches exist for this found item
  const { data: matchRows } = await supabase
    .from('matches')
    .select('id, confidence_score')
    .eq('found_item_id', data.id)
    .gte('confidence_score', 50);

  const immediateMatchFound = Boolean(matchRows && matchRows.length > 0);
  const record = mapRowToRecord(data);

  return {
    id: data.id,
    referenceCode: data.reference_code,
    createdAt: data.created_at,
    immediateMatchFound,
    matchCount: matchRows ? matchRows.length : 0,
    report: record,
  };
}

/**
 * Fetches a single found report by ID or reference code.
 */
export async function getFoundItem(id: string): Promise<FoundItemRecord | null> {
  const supabase = createClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let query = supabase.from('found_items_public').select('*');
  if (isUuid) {
    query = query.or(`id.eq.${id},reference_code.eq.${id}`);
  } else {
    query = query.eq('reference_code', id);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    // If not found in public view, try found_items directly
    let directQuery = supabase.from('found_items').select('*');
    if (isUuid) {
      directQuery = directQuery.or(`id.eq.${id},reference_code.eq.${id}`);
    } else {
      directQuery = directQuery.eq('reference_code', id);
    }
    const { data: directData } = await directQuery.maybeSingle();
    if (!directData) return null;
    return mapRowToRecord(directData);
  }

  return mapRowToRecord(data);
}

/**
 * Updates a found item report (owner only via RLS).
 */
export async function updateFoundItem(id: string, updates: Partial<FoundItemPayload>): Promise<FoundItemRecord> {
  const supabase = createClient();
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
    throw new Error(error.message);
  }

  return mapRowToRecord(data);
}

/**
 * Marks a found item as returned (closes report).
 */
export async function markItemAsReturned(id: string): Promise<{ id: string; status: 'returned'; returnedAt: string }> {
  const supabase = createClient();
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
    throw new Error(error.message);
  }

  return {
    id: data.id,
    status: 'returned',
    returnedAt: data.returned_at || returnedAt,
  };
}
