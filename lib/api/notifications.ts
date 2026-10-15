import { createClient } from '../supabase/client';

export interface NotificationItem {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  // New, optional — only present if/when the backend starts sending match data:
  matchScore?: number;
  recipientRole?: 'OWNER' | 'FINDER';
  partnerName?: string;
  partnerContact?: string;
  itemName?: string;
  ticketId?: string;
  location?: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

const DEMO_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

/**
 * Fetches notifications from Supabase (authenticated user or demo user).
 */
export async function fetchNotifications(): Promise<NotificationsResponse> {
  const supabase = createClient();
  let targetUserId = DEMO_USER_ID;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
      targetUserId = user.id;
    }
  } catch {}

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${targetUserId},user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return { notifications: [], unreadCount: 0 };
    }

    const notifications: NotificationItem[] = (data || []).map((row: any) => ({
      id: row.id,
      message: row.message,
      timestamp: formatTimestamp(row.created_at),
      read: Boolean(row.read),
      link: row.link || undefined,
    }));

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
      notifications,
      unreadCount,
    };
  } catch {
    return { notifications: [], unreadCount: 0 };
  }
}

/**
 * Marks all notifications as read for current user or demo user.
 */
export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  const supabase = createClient();
  let targetUserId = DEMO_USER_ID;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
      targetUserId = user.id;
    }
  } catch {}

  try {
    await supabase
      .from('notifications')
      .update({ read: true })
      .or(`user_id.eq.${targetUserId},user_id.is.null`)
      .eq('read', false);
  } catch {}

  return { success: true };
}
