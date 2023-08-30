import { useDropCardInZone } from "~/hooks/dndCard";
import { ZoneOverlay } from "~/components/ZoneOverlay";
import { DragNDropOverlay } from "~/components/DragNDropOverlay";
import { CardImage } from "~/components/card/CardImage";
import React, { FC, useEffect } from "react";
import { useUser } from "reactfire";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import { useTurn } from "~/engine/GameProvider";
import { useHotkeysContext } from "react-hotkeys-hook";
import { LorcanaCardImage } from "~/components/card/LorcanaCardImage";
import { useGameController } from "~/engine/rule-engine/lib/GameControllerProvider";

export const PlayArea: FC<{
  cards: string[];
  cardsOnStack: string[];
  playerId: string;
}> = ({ cards, playerId, cardsOnStack }) => {
  const engine = useGameController();
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
    .filter((card) => !cardsOnStack.includes(card))
    .filter((card) => !engine.tableCard(card)?.meta?.shifted);

  const freshInk = playAreaCards.filter(
    (card) => engine.findTableCard(card)?.meta?.playedThisTurn
  );
  const dryInk = playAreaCards.filter(
    (card) => !engine.findTableCard(card)?.meta?.playedThisTurn
  );
  const shiftedCards = cards
    .filter((card) => !cardsOnStack.includes(card))
    .filter((card) => engine.tableCard(card)?.meta?.shifter)
    .filter((card, index, cards) => {
      // TODO: I'm not quite sure about this one
      const shifter = engine.tableCard(card)?.meta?.shifter || "";
      return cards.indexOf(shifter) === index;
    });

  const toCardImage = (instanceId: string, index: number) => {
    const owner = engine.findCardOwner(instanceId);
    const card = engine.findLorcanitoCard(instanceId);
    const isFreshInkCard = freshInk.includes(instanceId);

    return (
      <CardImage
        onClick={() => {
          if (user?.uid !== owner) {
            return;
          }

          engine.tapCard({ toggle: true, instanceId });
          logAnalyticsEvent("tap_card", { zone: "play_area" });
        }}
        zone="play"
        index={isFreshInkCard ? index + dryInk.length : index}
        key={instanceId}
        instanceId={instanceId}
        className={`${
          isFreshInkCard && card?.type === "character"
            ? "translate-y-[35%]"
            : "ml-2"
        }`}
      />
    );
  };

  const toShiftedCardImage = (instanceId: string, index: number) => {
    const owner = engine.findCardOwner(instanceId);
    const card = engine.findLorcanitoCard(instanceId);
    const isFreshInkCard = freshInk.includes(instanceId);
    const shiftedCard = engine.tableCard(instanceId)?.meta?.shifted;

    return (
      <div
        key={instanceId}
        data-id-shifter={instanceId}
        data-id-shifted={shiftedCard}
        className="relative ml-14 flex aspect-card h-full"
      >
        <LorcanaCardImage
          className="-translate-x-8 -rotate-6"
          card={engine.findLorcanitoCard(shiftedCard)}
        />
        {toCardImage(instanceId, index)}
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
      {dryInk.map(toCardImage)}
      {freshInk.map(toCardImage)}
    </div>
  );
};
