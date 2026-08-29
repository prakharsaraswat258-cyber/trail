import { createClient } from '../supabase/client';
import { isValidPhotoUrl } from '../utils/imageCompression';

export interface FoundSearchResult {
  id: string;
  itemName: string;
  category: string;
  type?: 'lost' | 'found';
  ticketId?: string;
  itemType?: string;
  color?: string;
  brand?: string;
  description?: string;
  thumbnailUrl?: string;
  foundLocationSummary: string;
  foundDate: string;
}

export interface SubmitLostReportPayload {
  category: string;
  itemName: string;
  description: string;
  dateLost: string;
  timeLost?: string;
  timePeriod?: 'morning' | 'afternoon' | 'evening' | 'night';
  location: { building: string; area?: string };
  photos?: string[];
  contact: {
    fullName: string;
    phone: string;
    email: string;
    studentId: string;
  };
  notificationPreferences: { email: boolean; sms: boolean; inApp: boolean };
}

export interface SubmitLostReportResponse {
  id: string;
  ticketId: string;
  createdAt: string;
  status: 'submitted';
  trackingUrl: string;
}

export interface TicketStatusResponse {
  ticketId: string;
  status: 'submitted' | 'under_review' | 'potential_match' | 'resolved';
  summary: {
    itemName: string;
    category: string;
    description: string;
    location: string;
    dateLost: string;
  };
  contact?: {
    fullName: string;
    phone: string;
    email: string;
    studentId: string;
  };
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Searches database across both found items and lost reports by ticket ID, reference code, name, category, and description.
 */
export async function searchFoundItems(
  query: string,
  selectedCategory?: string,
  selectedColor?: string
): Promise<{ results: FoundSearchResult[] }> {
  const supabase = createClient();
  const cleanQuery = query.trim();

  // 1. Query found_items_public
  let foundQuery = supabase
    .from('found_items_public')
    .select('*')
    .neq('status', 'returned')
    .order('created_at', { ascending: false });

  if (selectedCategory && selectedCategory !== 'All') {
    foundQuery = foundQuery.eq('category', selectedCategory);
  }

  if (cleanQuery) {
    foundQuery = foundQuery.or(
      `reference_code.ilike.%${cleanQuery}%,item_name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%,location_building.ilike.%${cleanQuery}%`
    );
  }

  if (selectedColor && selectedColor !== 'All') {
    foundQuery = foundQuery.or(
      `item_name.ilike.%${selectedColor}%,description.ilike.%${selectedColor}%`
    );
  }

  // 2. Query lost_reports
  let lostQuery = supabase
    .from('lost_reports')
    .select('*')
    .neq('status', 'resolved')
    .order('created_at', { ascending: false });

  if (selectedCategory && selectedCategory !== 'All') {
    lostQuery = lostQuery.eq('category', selectedCategory);
  }

  if (cleanQuery) {
    lostQuery = lostQuery.or(
      `ticket_id.ilike.%${cleanQuery}%,item_name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%,location_building.ilike.%${cleanQuery}%`
    );
  }

  const [foundRes, lostRes] = await Promise.allSettled([
    foundQuery.limit(30),
    lostQuery.limit(30),
  ]);

  const foundData = foundRes.status === 'fulfilled' ? foundRes.value.data || [] : [];
  const lostData = lostRes.status === 'fulfilled' ? lostRes.value.data || [] : [];

  const foundResults: FoundSearchResult[] = foundData
    .filter((row: any) => {
      const photo = Array.isArray(row.photos) && row.photos.length > 0 ? row.photos[0] : null;
      return isValidPhotoUrl(photo);
    })
    .map((row: any) => ({
      id: row.id,
      type: 'found' as const,
      ticketId: row.reference_code,
      itemName: row.item_name,
      category: row.category,
      description: row.description,
      thumbnailUrl: row.photos[0],
      foundLocationSummary: `${row.location_building}${row.location_floor ? `, ${row.location_floor}` : ''}`,
      foundDate: row.date_found,
    }));

  const lostResults: FoundSearchResult[] = lostData
    .filter((row: any) => {
      const photo = Array.isArray(row.photos) && row.photos.length > 0 ? row.photos[0] : null;
      return isValidPhotoUrl(photo);
    })
    .map((row: any) => ({
      id: row.id,
      type: 'lost' as const,
      ticketId: row.ticket_id,
      itemName: row.item_name,
      category: row.category,
      description: row.description,
      thumbnailUrl: row.photos[0],
      foundLocationSummary: `${row.location_building}${row.location_area ? ` (${row.location_area})` : ''}`,
      foundDate: row.date_lost,
    }));

  const combined = [...foundResults, ...lostResults];

  if (cleanQuery) {
    const qLower = cleanQuery.toLowerCase();
    combined.sort((a, b) => {
      const aExact = a.ticketId && a.ticketId.toLowerCase().includes(qLower) ? 1 : 0;
      const bExact = b.ticketId && b.ticketId.toLowerCase().includes(qLower) ? 1 : 0;
      return bExact - aExact;
    });
  }

  return { results: combined };
}

/**
 * Submits lost item report to Supabase table `lost_reports`.
 */
export async function submitLostReport(
  payload: SubmitLostReportPayload
): Promise<SubmitLostReportResponse> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isUuid = user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

  let validProfileUserId: string | null = null;
  if (user && isUuid) {
    try {
      const { data: upsertData } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || payload.contact?.fullName || '',
        phone: payload.contact?.phone || '',
        student_id: payload.contact?.studentId || '',
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

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const ticketId = `LST-2026-${randomDigits}`;

  const insertPayload: any = {
    ticket_id: ticketId,
    category: payload.category,
    item_name: payload.itemName,
    description: payload.description,
    date_lost: payload.dateLost,
    time_lost: payload.timeLost || null,
    time_period: payload.timePeriod || null,
    location_building: payload.location.building,
    location_area: payload.location.area || null,
    photos: payload.photos || [],
    contact_full_name: payload.contact.fullName,
    contact_phone: payload.contact.phone,
    contact_email: payload.contact.email,
    contact_student_id: payload.contact.studentId,
    notify_email: payload.notificationPreferences.email,
    notify_sms: payload.notificationPreferences.sms,
    notify_in_app: payload.notificationPreferences.inApp,
    status: 'submitted',
  };

  if (validProfileUserId) {
    insertPayload.user_id = validProfileUserId;
  }

  let insertResult = await supabase
    .from('lost_reports')
    .insert(insertPayload)
    .select()
    .single();

  // If foreign key constraint failed on user_id, retry without user_id for guest/demo submission
  if (insertResult.error && insertPayload.user_id && insertResult.error.message.includes('foreign key')) {
    delete insertPayload.user_id;
    insertResult = await supabase
      .from('lost_reports')
      .insert(insertPayload)
      .select()
      .single();
  }

  const { data, error } = insertResult;

  if (error) {
    console.error('Supabase submitLostReport error:', error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    ticketId: data.ticket_id,
    createdAt: data.created_at,
    status: 'submitted',
    trackingUrl: `/lost/${data.ticket_id}`,
  };
}

/**
 * Fetches ticket status for tracking from Supabase `lost_reports`.
 */
export async function getTicketStatus(ticketId: string): Promise<TicketStatusResponse> {
  const supabase = createClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticketId);

  let query = supabase.from('lost_reports').select('*');
  if (isUuid) {
    query = query.or(`id.eq.${ticketId},ticket_id.eq.${ticketId}`);
  } else {
    query = query.eq('ticket_id', ticketId);
  }

  const { data, error } = await query.single();
  if (error || !data) {
    throw new Error(error?.message || 'Report not found');
  }

  const locationStr = data.location_area
    ? `${data.location_building} (${data.location_area})`
    : data.location_building;

  return {
    ticketId: data.ticket_id,
    status: data.status,
    summary: {
      itemName: data.item_name,
      category: data.category,
      description: data.description,
      location: locationStr,
      dateLost: data.date_lost,
    },
    contact: {
      fullName: data.contact_full_name,
      phone: data.contact_phone,
      email: data.contact_email,
      studentId: data.contact_student_id,
    },
    notificationPreferences: {
      email: data.notify_email,
      sms: data.notify_sms,
      inApp: data.notify_in_app,
    },
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Updates notification preferences on Supabase `lost_reports`.
 */
export async function updateNotificationPreferences(
  ticketId: string,
  preferences: { email: boolean; sms: boolean; inApp: boolean }
): Promise<{ success: boolean; preferences: { email: boolean; sms: boolean; inApp: boolean } }> {
  const supabase = createClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticketId);

  let query = supabase.from('lost_reports').update({
    notify_email: preferences.email,
    notify_sms: preferences.sms,
    notify_in_app: preferences.inApp,
  });

  if (isUuid) {
    query = query.or(`id.eq.${ticketId},ticket_id.eq.${ticketId}`);
  } else {
    query = query.eq('ticket_id', ticketId);
  }

  const { error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return { success: true, preferences };
}
