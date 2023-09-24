import { useDropCardInZone } from "~/hooks/dndCard";
import { ZoneOverlay } from "~/components/ZoneOverlay";
import { DragNDropOverlay } from "~/components/DragNDropOverlay";
import { CardImage } from "~/components/card/CardImage";
import React, { FC, useEffect } from "react";
import { useUser } from "reactfire";
import { useTurn } from "~/engine/GameProvider";
import { useHotkeysContext } from "react-hotkeys-hook";
import { LorcanaCardImage } from "~/components/card/LorcanaCardImage";
import { useGameStore } from "~/engine/lib/GameStoreProvider";
import { observer } from "mobx-react-lite";
import type { CardModel } from "~/store/models/CardModel";

const PlayAreaComponent: FC<{
  cards: CardModel[];
  cardsOnStack: CardModel[];
  playerId: string;
}> = ({ cards, playerId, cardsOnStack }) => {
  const store = useGameStore();
  const { dropZoneRef, isActive, isOver } = useDropCardInZone(playerId, "play");
  const { data: user } = useUser();

  const { isMyTurn } = useTurn();
  const { enableScope, disableScope } = useHotkeysContext();

  useEffect(() => {
    if (isMyTurn) {
      enableScope("play");
    } else {
      disableScope("play");
    }
  }, [isMyTurn]);

  const playAreaCards = cards
    .filter(
      (card) => !cardsOnStack.map((c) => c.instanceId).includes(card.instanceId)
    )
    .filter((card) => !card.meta?.shifted);

  const freshInk = playAreaCards.filter((card) => card.meta?.playedThisTurn);
  const dryInk = playAreaCards.filter((card) => !card.meta?.playedThisTurn);
  const shiftedCards = cards
    .filter(
      (card) => !cardsOnStack.map((c) => c.instanceId).includes(card.instanceId)
    )
    .filter((card) => card.meta?.shifter)
    .filter((card, index, cards) => {
      // TODO: I'm not quite sure about this one
      const shifter = card.meta?.shifter || "";
      return cards.map((card) => card.instanceId).indexOf(shifter) === index;
    });

  const toCardImage = (cardModel: CardModel, index: number) => {
    const owner = cardModel.ownerId;
    const isFreshInkCard = freshInk
      .map((card) => card.instanceId)
      .includes(cardModel.instanceId);
    const instanceId = cardModel.instanceId;

    return (
      <CardImage
        onClick={() => {
          if (user?.uid !== owner) {
            return;
          }

          if (cardModel.hasActivatedAbility) {
            cardModel.activate();
            return;
          }

          store.cardStore.tapCard(instanceId, { toggle: true });
        }}
        zone="play"
        index={isFreshInkCard ? index + dryInk.length : index}
        key={instanceId}
        card={cardModel}
        className={`ml-2`}
      />
    );
  };

  const toShiftedCardImage = (cardModel: CardModel, index: number) => {
    const mobXRootStore = useGameStore();
    const shifted = cardModel.meta?.shifted || "";
    const shiftedCard = mobXRootStore.cardStore.getCard(shifted);

    return (
      <div
        key={cardModel.instanceId}
        data-id-shifter={cardModel.instanceId}
        data-id-shifted={shifted}
        className="relative ml-14 flex aspect-card h-full"
      >
        <LorcanaCardImage
          className="-translate-x-8 -rotate-6"
          card={shiftedCard.lorcanitoCard}
        />
        {toCardImage(cardModel, index)}
      </div>
    );
  };

  return (
    <div
      ref={dropZoneRef}
      className={`relative m-1 flex h-full w-full overflow-y-hidden rounded-lg p-1`}
    >
      <ZoneOverlay>Play Area</ZoneOverlay>
      <DragNDropOverlay isActive={isActive} isOver={isOver}>
        Play Card
      </DragNDropOverlay>
      {shiftedCards.map(toShiftedCardImage)}
      {freshInk.map(toCardImage)}
      {dryInk.map(toCardImage)}
    </div>
  );
};

export const PlayArea = observer(PlayAreaComponent);
