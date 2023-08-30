import { useDropCardInZone } from "~/hooks/dndCard";
import { ZoneOverlay } from "~/components/ZoneOverlay";
import { DragNDropOverlay } from "~/components/DragNDropOverlay";
import { CardImage } from "~/components/card/CardImage";
import React, { FC } from "react";

import { useGameController } from "~/engine/rule-engine/lib/GameControllerProvider";

export const InkWell: FC<{
  cards: string[];
  playerId: string;
  position: "bottom" | "top";
}> = ({ cards, playerId, position }) => {
  const engine = useGameController();
  const { dropZoneRef, isActive, isOver } = useDropCardInZone(
    playerId,
    "inkwell"
  );

  const freshInk = cards.filter(
    (card) => engine.findTableCard(card)?.meta?.playedThisTurn
  );
  const dryInk = cards.filter(
    (card) => !engine.findTableCard(card)?.meta?.playedThisTurn
  );
  const tappedInk = cards.filter(
    (card) => !engine.findTableCard(card)?.meta?.exerted
  );

  const toCardImage = (card: string, index: number) => {
    const owner = engine.findCardOwner(card);

    return (
      <CardImage
        key={`${index}-${card}`}
        style={{ transform: `translateX(-${index * 25}%)` }}
        className={`${freshInk.includes(card) ? "grayscale" : ""}`}
        instanceId={card}
        zone="inkwell"
        onClick={() => {
          if (engine.playerId !== owner) {
            return;
          }
          engine.tapCard({ toggle: true, instanceId: card, inkwell: true });
        }}
        isFaceDown
      />
    );
  };

  return (
    <div
      ref={dropZoneRef}
      className="relative z-20 m-1 mt-0 flex h-full grow p-1"
    >
      <ZoneOverlay>Ink Well</ZoneOverlay>
      <DragNDropOverlay isOver={isOver} isActive={isActive}>
        Add to Inkwell
      </DragNDropOverlay>
      <div
        className={`${
          position === "top" ? "top-0" : "bottom-0"
        } absolute right-0 z-10 flex select-none items-center justify-center rounded-lg bg-black px-2 text-lg text-white opacity-25`}
      >
        <span>{`Ink available: ${tappedInk.length}/${cards.length}`}</span>
      </div>
      {dryInk.map(toCardImage)}
      {freshInk.map(toCardImage)}
    </div>
  );
};
