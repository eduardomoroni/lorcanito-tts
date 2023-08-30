import React, { type FC } from "react";
import { useCardPreview } from "~/providers/CardPreviewProvider";
import { EyeSlashIcon } from "@heroicons/react/20/solid";

import { useGameController } from "~/engine/rule-engine/lib/GameControllerProvider";
import { InternalLogEntry } from "~/spaces/Log/game-log/types";
import { GameEffect } from "~/libs/game";
import { instanceId } from "firebase-admin";
import { LorcanitoCard } from "~/engine/cardTypes";

const COLORS = {
  ruby: "text-ruby",
  amber: "text-amber",
  steel: "text-steel",
  sapphire: "text-sapphire",
  emerald: "text-emerald",
  amethyst: "text-amethyst",
} as const;

export const CardEffectEntry: FC<{
  effect?: GameEffect;
}> = ({ effect }) => {
  if (!effect) {
    return <span> resolved an effect.</span>;
  }

  const setPreview = useCardPreview();
  const engine = useGameController();

  const card = engine.findLorcanitoCard(effect.instanceId);

  return (
    <>
      <span> resolved an effect: </span>
      <span
        key={card?.id}
        onMouseEnter={() => {
          setPreview({ card });
        }}
        onMouseLeave={() => setPreview(undefined)}
        className={`cursor-pointer break-words text-sm font-extrabold underline ${
          COLORS[card?.color || "ruby"]
        }`}
      >
        {effect.ability?.name}
      </span>
    </>
  );
};
