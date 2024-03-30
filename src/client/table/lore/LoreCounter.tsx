"use client";

import React, { useEffect, useRef } from "react";
import { usePrevious } from "~/client/hooks/usePrevious";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import { useConfirmationModal } from "~/client/providers/ConfirmationModalProvider";
import { api } from "~/libs/api";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import { observer } from "mobx-react-lite";
import { useGameController } from "~/client/hooks/useGameController";

// https://six-inks.pages.dev/assets/images/tts/icons/lore.png
// https://six-inks.pages.dev/assets/images/tts/bg/frame.png

function clamp(x: number) {
  return Math.min(Math.max(x, 0), 20);
}

// TODO: add a overlay rounded-lg bg-black opacity-25
function LoreCounterComponent(props: {
  loreOwner: string;
  position: "bottom" | "top";
  lore?: number;
}) {
  const { position, loreOwner } = props;
  const controller = useGameController();
  const store = useGameStore();
  const table = store.tableStore.getTable(loreOwner);

  const lore = table?.lore || 0;
  const isOpponentsCounter = position === "top";
  const numberRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const previousLore = usePrevious(lore);
  useEffect(() => {
    const isScrollingUp = (previousLore || 0) < lore;
    const desiredIndex = clamp(isScrollingUp ? lore + 5 : lore - 5);
    const element = numberRefs.current[desiredIndex];

    if (element) {
      // TODO: FIX THIS if I remove this it conflicts with the context menu questing
      setTimeout(() => {
        element.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
          inline: "nearest",
        });
      }, 500);
    }
  }, [lore, previousLore]);

  const title = `${isOpponentsCounter ? "Your Opponent has " : "You "} won!`;
  const description = `Congratulations! the game is over. If you want to restart the game, click on the button below.`;
  const confirm = useConfirmationModal(title, description);
  const restartGame = api.game.restartGame.useMutation();

  useEffect(() => {
    if (lore >= 20) {
      confirm(() => {
        restartGame.mutate({ gameId: store.id });
        logAnalyticsEvent("game_over");
      });
    }
  }, [lore]);

  if (!table) {
    return null;
  }

  const iconClassName =
    "text-white flex w-full items-center justify-center h-6";

  return (
    <div
      className={`z-10 flex w-full cursor-pointer items-center justify-center rounded bg-black bg-opacity-25`}
    >
      {store.manualMode ? (
        <MinusIcon
          className={iconClassName}
          aria-hidden="true"
          onClick={() => {
            controller.updateLore(loreOwner, lore - 1);
            logAnalyticsEvent("lore_decrement");
          }}
        />
      ) : (
        <span
          className={`text-left align-middle text-2xl font-medium text-white`}
        >
          Lore:&nbsp;{" "}
        </span>
      )}

      <div className={`flex h-full scrollbar-hide`}>
        <span
          className={`text-center align-middle text-4xl font-medium text-white`}
        >
          {lore}
        </span>
      </div>
      {store.manualMode ? (
        <PlusIcon
          onClick={() => {
            controller.updateLore(loreOwner, lore + 1);
            logAnalyticsEvent("lore_increment");
          }}
          className={iconClassName}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}

export const LoreCounter = observer(LoreCounterComponent);
