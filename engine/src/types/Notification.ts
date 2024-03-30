export type IconNotification = {
  id: string;
  title: string;
  message: string;
  icon: string;
};
export type NotificationPayload = IconNotification & {
  type: "icon";
  autoClear?: boolean;
};
export type NotificationType = Omit<NotificationPayload, "id">;
