import React, { type FC } from "react";
import { useSetCardPreview } from "~/client/providers/CardPreviewProvider";
import { EyeSlashIcon } from "@heroicons/react/20/solid";
import type { InternalLogEntry } from "@lorcanito/engine";
import type { CardModel } from "@lorcanito/engine";
import { Tooltip } from "antd";
import { useGameController } from "~/client/hooks/useGameController";

const COLORS = {
  ruby: "text-ruby",
  amber: "text-amber",
  steel: "text-steel",
  sapphire: "text-sapphire",
  emerald: "text-emerald",
  amethyst: "text-amethyst",
} as const;

// TODO: This should receive instance id
export const CardLogEntry: FC<{
  card?: CardModel;
  instanceId?: string;
  privateEntry?: InternalLogEntry["private"];
  player: string;
}> = ({ card, privateEntry, player, instanceId }) => {
  const setPreview = useSetCardPreview();
  const controller = useGameController();

  if (!card && !instanceId) {
    return null;
  }

  // @ts-ignore TODO: come back to this later
  card = card || controller.getCard(instanceId);

  const lorcanitoCard = card?.lorcanitoCard;
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
        <Tooltip
          title={"This is only visible to you, your opponent can't see this."}
        >
          <>
            <EyeSlashIcon
              title="This is only visible to you, your opponent can't see this."
              className="inline h-4 w-4"
            />{" "}
          </>
        </Tooltip>
      )}
      <span
        key={card.instanceId}
        onMouseEnter={() => {
          setPreview({ card: lorcanitoCard });
        }}
        onMouseLeave={() => setPreview(undefined)}
        className={`cursor-pointer break-words text-sm font-extrabold underline ${
          COLORS[card.color]
        }`}
      >
        {`${card.fullName}`}
      </span>
    </>
  );
};
