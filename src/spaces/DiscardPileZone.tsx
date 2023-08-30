import { useDropCardInZone } from "~/hooks/dndCard";
import React, { FC, useState } from "react";
import CardStack from "~/components/card-stack/cardStack";
import DiscardPileModal from "~/spaces/DiscardPileModal";
import { DragNDropOverlay } from "~/components/DragNDropOverlay";
import { CardCounter } from "~/spaces/table/CardCounter";
import { useGameController } from "~/engine/rule-engine/lib/GameControllerProvider";

export const DiscardPileZone: FC<{ cards: string[]; playerId: string }> = ({
  cards,
  playerId,
}) => {
  const engine = useGameController();
  const { dropZoneRef, isActive, isOver } = useDropCardInZone(
    playerId,
    "discard"
  );
  const [open, setOpen] = useState(false);

  return (
    <div
      ref={dropZoneRef}
      draggable={false}
      className="group relative flex grow grayscale"
    >
      <DiscardPileModal
        open={open}
        setOpen={setOpen}
        discardPile={cards}
        tableId={playerId}
        onClick={(instanceId: string) =>
          engine.moveCard({
            instanceId,
            from: "discard",
            to: "hand",
            position: "last",
          })
        }
      />
      <CardCounter length={cards.length} />
      <DragNDropOverlay isActive={isActive} isOver={isOver}>
        Discard card
      </DragNDropOverlay>
      {/*experimental*/}
      <CardStack
        cards={cards}
        ownerId={playerId}
        onClick={() => {
          setOpen(true);
        }}
      />
      {/*{card && (*/}
      {/*  <CardImage*/}
      {/*    instanceId={card}*/}
      {/*    ownerId={playerId}*/}
      {/*    draggable={false}*/}
      {/*    zone="deck"*/}
      {/*    grow="vertical"*/}
      {/*  />*/}
      {/*)}*/}
    </div>
  );
};
