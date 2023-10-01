import React, { type FC } from "react";
import { useCardPreview } from "~/spaces/providers/CardPreviewProvider";
import { EyeSlashIcon } from "@heroicons/react/20/solid";
import type { InternalLogEntry } from "~/spaces/Log/types";
import { useGameStore } from "~/engine/lib/GameStoreProvider";
import type { CardModel } from "~/engine/store/models/CardModel";
import { Tooltip } from "antd";

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
  const setPreview = useCardPreview();
  const store = useGameStore();

  if (!card && !instanceId) {
    return null;
  }

  // @ts-ignore TODO: come back to this later
  card =
    card ||
    // Don't remove this, it's a hack to make sure that the card is loaded
    (store.cardStore.hasCard(instanceId) &&
      store.cardStore.getCard(instanceId));

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
