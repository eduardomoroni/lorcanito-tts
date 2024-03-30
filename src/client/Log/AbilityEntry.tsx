import React, { type FC } from "react";
import { useSetCardPreview } from "~/client/providers/CardPreviewProvider";
import type { Ability } from "@lorcanito/engine";
import { useGameController } from "~/client/hooks/useGameController";

const COLORS = {
  ruby: "text-ruby",
  amber: "text-amber",
  steel: "text-steel",
  sapphire: "text-sapphire",
  emerald: "text-emerald",
  amethyst: "text-amethyst",
} as const;

export const AbilityEntry: FC<{
  ability?: Ability;
  instanceId?: string;
}> = ({ ability, instanceId }) => {
  if (!ability || !instanceId) {
    return <span> an effect.</span>;
  }

  const setPreview = useSetCardPreview();
  const controller = useGameController();
  const card = controller.getCard(instanceId)?.lorcanitoCard;

  return (
    <>
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
        {ability?.name || card?.name}
      </span>
    </>
  );
};
