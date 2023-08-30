import React, { type FC } from "react";
import { useCardPreview } from "~/providers/CardPreviewProvider";
import { EyeSlashIcon } from "@heroicons/react/20/solid";

import { useGameController } from "~/engine/rule-engine/lib/GameControllerProvider";
import { InternalLogEntry } from "~/spaces/Log/game-log/types";
import { LorcanitoCard } from "~/engine/cardTypes";

const COLORS = {
  ruby: "text-ruby",
  amber: "text-amber",
  steel: "text-steel",
  sapphire: "text-sapphire",
  emerald: "text-emerald",
  amethyst: "text-amethyst",
} as const;

// TODO: This should receivee instance id
export const CardLogEntry: FC<{
  card?: LorcanitoCard;
  instanceId?: string;
  privateEntry?: InternalLogEntry["private"];
  player: string;
}> = ({ card, privateEntry, player, instanceId }) => {
  const setPreview = useCardPreview();
  const engine = useGameController();

  card = card || engine.findLorcanitoCard(instanceId);

  if (!card) {
    return null;
  }

  const privateCardForAnotherPlayer = privateEntry && !privateEntry?.[player];
  if (privateCardForAnotherPlayer) {
    return <>a card</>;
  }

  return (
    <>
      {privateEntry && privateEntry[player] && (
        <>
          <EyeSlashIcon
            title="This is only visible to you, your opponent can't see this."
            className="inline h-4 w-4"
          />{" "}
        </>
      )}
      <span
        key={card.id}
        onMouseEnter={() => {
          setPreview({ card });
        }}
        onMouseLeave={() => setPreview(undefined)}
        className={`cursor-pointer break-words text-sm font-extrabold underline ${
          COLORS[card.color]
        }`}
      >
        {`${card.name}${card.title ? " - " + card.title : ""}`}
      </span>
    </>
  );
};
