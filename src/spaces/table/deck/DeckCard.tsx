import React from "react";
import { CardModel } from "~/engine/store/models/CardModel";
import { useUser } from "reactfire";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import { CardCounter } from "~/spaces/table/CardCounter";
import { FaceDownCard } from "~/spaces/components/card/FaceDownCard";
import { TopDeckCard } from "~/spaces/table/deck/TopDeckCard";

function everyFourth(n: number) {
  return Math.floor((n - 1) / 4);
}
export function DeckCard(props: {
  index: number;
  card: CardModel;
  count: number;
  ownerId: string;
  isTopCard: boolean;
}) {
  const { ownerId, index, isTopCard, card, count } = props;
  const { data: user } = useUser();
  const isOpponentsCard = ownerId !== user?.uid;

  // TODO: shuffle animation
  // Potentially using react spring
  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();

        logAnalyticsEvent("clicking_opponents_deck");
      }}
      style={{
        marginTop: `-${everyFourth(index)}px`,
        marginLeft: `${everyFourth(index)}px`,
      }}
      className={`${
        isOpponentsCard ? "cursor-not-allowed" : "cursor-pointer"
      } group absolute flex aspect-card w-full scale-90 select-none`}
    >
      <CardCounter length={count} />
      {isTopCard ? (
        <TopDeckCard card={card} count={count} ownerId={ownerId} />
      ) : (
        <FaceDownCard className="!h-fit" />
      )}
    </div>
  );
}
