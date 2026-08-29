import { createClient } from '../supabase/client';

export interface NotificationItem {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
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

/**
 * Fetches notifications for currently logged-in user from Supabase.
 */
export async function fetchNotifications(): Promise<NotificationsResponse> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { notifications: [], unreadCount: 0 };
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  const notifications: NotificationItem[] = (data || []).map((row: any) => ({
    id: row.id,
    message: row.message,
    timestamp: formatTimestamp(row.created_at),
    read: row.read,
    link: row.link || undefined,
  }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
  };
}

/**
 * Marks all notifications as read for current user.
 */
export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: true };
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
