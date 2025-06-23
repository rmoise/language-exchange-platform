import { getNotifications, getUnreadNotificationCount } from "@/app/actions/notifications";
import UnifiedHeader from "./UnifiedHeader";

export default async function ProtectedHeader() {
  // Fetch notifications on the server
  const [notifications, unreadCount] = await Promise.all([
    getNotifications(),
    getUnreadNotificationCount(),
  ]);

  return (
    <UnifiedHeader
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
    />
  );
}