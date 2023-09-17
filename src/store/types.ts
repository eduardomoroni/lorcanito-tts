import { useGameLogger } from "~/spaces/Log/game-log/GameLogProvider";
import { useNotification } from "~/providers/NotificationProvider";
import { useYesOrNoModal } from "~/providers/YesOrNoModalProvider";
import type { OpenTargetModalParams } from "~/providers/TargetModalProvider";
import type { ScryModalParams } from "~/providers/ScryModalProvider";

export type Dependencies = {
  playerId: string;
  logger: ReturnType<typeof useGameLogger>;
  notifier: ReturnType<typeof useNotification>;
  modals: {
    openYesOrNoModal: ReturnType<typeof useYesOrNoModal>;
    openTargetModal: (args: OpenTargetModalParams) => void;
    openScryModal: (args: ScryModalParams) => void;
  };
};
