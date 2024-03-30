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
  const store = useGameStore();
  const controller = useGameController();

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
    "border-y-2 border-solid border-slate-700 rounded text-white flex w-full items-center justify-center h-16";

  return (
    <div
      className={`${
        position === "bottom" ? "flex-col-reverse" : "flex-col"
      } flex h-full cursor-pointer overflow-y-auto rounded scrollbar-hide`}
    >
      <MinusIcon
        className={iconClassName}
        aria-hidden="true"
        onClick={() => {
          controller.updateLore(loreOwner, lore - 1);
          logAnalyticsEvent("lore_decrement");
        }}
      />

      <div
        className={`${
          position === "bottom" ? "flex-col-reverse" : "flex-col"
        } flex h-full overflow-y-auto scrollbar-hide`}
      >
        {[...Array(21).keys()].map((number) => {
          return (
            <div
              key={number}
              ref={(element: HTMLDivElement | null) =>
                (numberRefs.current[number] = element)
              }
              onClick={() => {
                if (position === "top") {
                  return;
                }

                controller.updateLore(loreOwner, number);

                logAnalyticsEvent("set_lore", {
                  lore_to: number,
                  lore_from: props.lore,
                  gameId: store.id,
                  playerId: loreOwner,
                });
              }}
              className={`flex h-[20%] w-full items-center justify-center ${
                isOpponentsCounter ? "cursor-not-allowed" : "cursor-pointer"
              } ${
                lore === number ? "rounded-lg bg-white py-5 text-black" : ""
              }`}
            >
              <span
                className={`text-center align-middle font-medium ${
                  lore === number ? "text-2xl text-black" : "text-xl text-white"
                }`}
              >
                {number}
              </span>
            </div>
          );
        })}
      </div>
      <PlusIcon
        onClick={() => {
          controller.updateLore(loreOwner, lore + 1);
          logAnalyticsEvent("lore_increment");
        }}
        className={iconClassName}
        aria-hidden="true"
      />
    </div>
  );
}

export const LoreCounterBar = observer(LoreCounterComponent);
