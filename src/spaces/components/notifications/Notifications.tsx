import { type FC } from "react";
import { CondensedNotification } from "~/spaces/components/notifications/CondensedNotification";
import { IconNotification } from "~/spaces/components/notifications/IconNotification";
import { useClearNotification } from "~/spaces/providers/NotificationProvider";

export type NotificationPayload = IconNotification & {
  type: "icon";
  autoClear?: boolean;
};

export const Notifications: FC<{ notifications: NotificationPayload[] }> = ({
  notifications = [],
}) => {
  const clearNotification = useClearNotification();
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed absolute inset-0 z-50 flex items-start justify-end px-4 py-6 sm:p-6"
    >
      <div className="flex w-3/12 flex-col items-start space-y-4">
        {notifications.map((notification, key) => {
          if (notification.type === "icon") {
            return (
              <IconNotification
                key={notification.id || key}
                notification={notification}
                onClose={clearNotification}
              />
            );
          }

          return <CondensedNotification content={"Not implemented yet"} />;
        })}
      </div>
    </div>
  );
};
