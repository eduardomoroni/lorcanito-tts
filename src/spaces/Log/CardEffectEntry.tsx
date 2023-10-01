import React, { type FC } from "react";
import { useCardPreview } from "~/spaces/providers/CardPreviewProvider";
import { GameEffect } from "~/libs/game";
import { useGameStore } from "~/engine/lib/GameStoreProvider";

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
    return <span> an effect.</span>;
  }

  const setPreview = useCardPreview();
  const store = useGameStore();
  const card = store.cardStore.getCard(effect.instanceId)?.lorcanitoCard;

  return (
    <>
      <span> an effect: </span>
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
