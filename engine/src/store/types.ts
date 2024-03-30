import type { LogEntry } from "@lorcanito/engine/types/Log";

export type Dependencies = {
  playerId: string;
  logger: { log: (entry: LogEntry) => void };
  notifier: {
    sendNotification: (notification: unknown) => void;
    clearNotification: (id: string) => void;
    clearAllNotifications: () => void;
  };
  modals: {
    openYesOrNoModal: (args: unknown) => void;
    openTargetModal: (args: unknown) => void;
    openScryModal: (args: unknown) => void;
  };
};
