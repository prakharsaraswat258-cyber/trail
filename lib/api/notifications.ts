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

// In-memory mock store
let mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    message: 'Your lost AirPods case might have a match in the Library.',
    timestamp: '10m ago',
    read: false,
  },
  {
    id: 'notif-2',
    message: 'A found item near Engineering Quad matches your key report PNG-84920.',
    timestamp: '1h ago',
    read: false,
  },
  {
    id: 'notif-3',
    message: 'New report filed in "Electronics" near your recent location.',
    timestamp: '4h ago',
    read: false,
  },
  {
    id: 'notif-4',
    message: 'Patagonia Backpack report PNG-84918 was marked as potential match.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'notif-5',
    message: 'Welcome to Penga! Learn how fast AI-assisted matches work.',
    timestamp: '3d ago',
    read: true,
  },
];

// TODO: replace mock with live API
export async function fetchNotifications(): Promise<NotificationsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const unreadCount = mockNotifications.filter((n) => !n.read).length;
  return {
    notifications: [...mockNotifications],
    unreadCount,
  };
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  mockNotifications = mockNotifications.map((n) => ({ ...n, read: true }));
  return { success: true };
}
