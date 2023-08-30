"use client";

import React, { useEffect, useRef } from "react";
import { usePrevious } from "~/hooks/usePrevious";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import { useConfirmationModal } from "~/providers/ConfirmationModalProvider";
import { api } from "~/utils/api";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import {
  useGame,
  useGameController,
} from "~/engine/rule-engine/lib/GameControllerProvider";

function clamp(x: number) {
  return Math.min(Math.max(x, 0), 20);
}

// TODO: add a overlay rounded-lg bg-black opacity-25
export function LoreCounter(props: {
  loreOwner: string;
  position: "bottom" | "top";
  lore?: number;
}) {
  const { position, loreOwner } = props;
  const [game] = useGame();
  const engine = useGameController();
  const lore = game.tables[loreOwner]?.lore || 0;
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
        restartGame.mutate({ gameId: game.id });
        logAnalyticsEvent("game_over");
      });
    }
  }, [lore]);

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
          engine.setLore((lore) => lore - 1, loreOwner);
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

                engine.setLore(() => number, loreOwner);
                logAnalyticsEvent("set_lore", {
                  lore_to: number,
                  lore_from: props.lore,
                  gameId: game.id,
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
          engine.setLore((lore) => lore + 1, loreOwner);
          logAnalyticsEvent("lore_increment");
        }}
        className={iconClassName}
        aria-hidden="true"
      />
    </div>
  );
}
