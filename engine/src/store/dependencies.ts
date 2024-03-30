import type { Dependencies } from "@lorcanito/engine/store/types";

function noOp() {}

export const noOpDeps: Dependencies = {
  logger: { log: noOp },
  notifier: {
    sendNotification: noOp,
    clearNotification: noOp,
    clearAllNotifications: noOp,
  },
  playerId: "player_one",
  modals: {
    openYesOrNoModal: noOp,
    openTargetModal: noOp,
    openScryModal: noOp,
  },
};
