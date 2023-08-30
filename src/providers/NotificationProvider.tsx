"use client";

import React, { createContext, useContext, useState } from "react";
import {
  type NotificationPayload,
  Notifications,
} from "~/components/notifications/Notifications";
import { createId } from "@paralleldrive/cuid2";

type NotificationType = Omit<NotificationPayload, "id">;
type ContextType = {
  sendNotification: (notification: NotificationType) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
};
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOp = () => {};
const defaultValue: ContextType = {
  sendNotification: noOp,
  clearNotification: noOp,
  clearAllNotifications: noOp,
};
const NotificationContext = createContext<ContextType>(defaultValue);

export function NotificationProvider({ children }: { children: JSX.Element }) {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

  const clearNotification = (id: string) => {
    setNotifications((notifications) =>
      notifications.filter((n) => n.id !== id)
    );
  };

  const sendNotification = (notification: NotificationType) => {
    const id = createId();

    if (notification.autoClear) {
      setTimeout(() => {
        clearNotification(id);
      }, 5000);
    }

    setNotifications((notifications) => [
      { ...notification, id: id },
      ...notifications,
    ]);
  };

  return (
    <NotificationContext.Provider
      value={{
        sendNotification,
        clearNotification,
        clearAllNotifications: () => {
          setNotifications([]);
        },
      }}
    >
      <Notifications notifications={notifications} />
      {children}
    </NotificationContext.Provider>
  );
}

export function useSendNotification() {
  const context = useContext(NotificationContext);
  return context.sendNotification;
}

export function useClearNotification() {
  const context = useContext(NotificationContext);
  return context.clearNotification;
}

export function useNotification() {
  return useContext(NotificationContext);
}
