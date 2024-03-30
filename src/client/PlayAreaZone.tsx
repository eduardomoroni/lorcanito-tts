import React, { FC, useEffect } from "react";
import { useDropCardInZone } from "~/client/hooks/dndCard";
import { ZoneOverlay } from "~/client/components/ZoneOverlay";
import { DragNDropOverlay } from "~/client/components/DragNDropOverlay";
import { LorcanitoCardImage } from "~/client/components/card/LorcanitoCardImage";
import { useHotkeysContext } from "react-hotkeys-hook";
import { CardImage } from "~/client/components/image/CardImage";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import { observer } from "mobx-react-lite";
import type { CardModel } from "@lorcanito/engine";
import { useGameController } from "~/client/hooks/useGameController";

const PlayAreaComponent: FC<{
  cards: CardModel[];
  cardsOnStack: CardModel[];
  playerId: string;
}> = ({ cards, playerId, cardsOnStack }) => {
  const { dropZoneRef, isActive, isOver } = useDropCardInZone(playerId, "play");
  const controller = useGameController();
  const { enableScope, disableScope } = useHotkeysContext();

  useEffect(() => {
    if (controller.isMyTurn) {
      enableScope("play");
    } else {
      disableScope("play");
    }
  }, [controller.isMyTurn]);

  const playAreaCards = cards
    .filter(
      (card) =>
        !cardsOnStack.map((c) => c.instanceId).includes(card.instanceId),
    )
    .filter((card) => !card.meta?.shifted);

  const shiftedCards = cards
    .filter(
      (card) =>
        !cardsOnStack.map((c) => c.instanceId).includes(card.instanceId),
    )
    .filter((card) => card.meta?.shifter)
    .filter((card, index, cards) => {
      // TODO: I'm not quite sure about this one
      const shifter = card.meta?.shifter || "";
      return cards.map((card) => card.instanceId).indexOf(shifter) === index;
    });

  const toCardImage = (cardModel: CardModel, index: number) => {
    const instanceId = cardModel.instanceId;

    return (
      <LorcanitoCardImage
        zone="play"
        index={index}
        key={instanceId}
        card={cardModel}
        className={`ml-1`}
        enablePopOver={true}
        draggable
      />
    );
  };

  const toShiftedCardImage = (cardModel: CardModel, index: number) => {
    const mobXRootStore = useGameStore();
    const shifted = cardModel.meta?.shifted || "";
    const shiftedCard = mobXRootStore.cardStore.getCard(shifted);

    const lorcanitoCard = shiftedCard?.lorcanitoCard;
    return (
      <div
        key={cardModel.instanceId}
        data-id-shifter={cardModel.instanceId}
        data-id-shifted={shifted}
        className="relative ml-14 flex aspect-card h-full"
      >
        <CardImage
          className="-translate-x-8 -rotate-6"
          cardSet={lorcanitoCard?.set}
          cardNumber={lorcanitoCard?.number}
        />
        {toCardImage(cardModel, index)}
      </div>
    );
  };

  return (
    <div
      ref={dropZoneRef}
      data-testid={`play-zone-${playerId}`}
      className={`relative flex h-full w-full overflow-y-hidden rounded-lg p-1`}
    >
      <ZoneOverlay>Play Area</ZoneOverlay>
      <DragNDropOverlay isActive={isActive} isOver={isOver}>
        Play Card
      </DragNDropOverlay>
      {shiftedCards.map(toShiftedCardImage)}
      {playAreaCards.toReversed().map(toCardImage)}
    </div>
  );
};

export const PlayArea = observer(PlayAreaComponent);
