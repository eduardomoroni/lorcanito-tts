import { useGameLogger } from "~/spaces/Log/game-log/GameLogProvider";
import { useNotification } from "~/spaces/providers/NotificationProvider";
import { useYesOrNoModal } from "~/spaces/providers/YesOrNoModalProvider";
import type { OpenTargetModalParams } from "~/spaces/providers/TargetModalProvider";
import type { ScryModalParams } from "~/spaces/providers/ScryModalProvider";

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
