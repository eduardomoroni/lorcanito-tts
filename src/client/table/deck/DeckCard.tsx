import React from "react";
import { CardModel } from "@lorcanito/engine";
import { useUser } from "reactfire";
import { CardCounter } from "~/client/table/CardCounter";
import { FaceDownCard } from "~/client/components/image/FaceDownCard";
import { TopDeckCard } from "~/client/table/deck/TopDeckCard";
import clsx from "clsx";

function everyTenth(n: number) {
  return Math.floor((n - 1) / 10);
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

  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
      }}
      style={{
        marginTop: `-${everyTenth(index)}px`,
        marginLeft: `${everyTenth(index)}px`,
      }}
      className={clsx(
        "group absolute flex aspect-card w-full scale-90 select-none",
        isOpponentsCard ? "cursor-not-allowed" : "cursor-pointer",
      )}
    >
      <CardCounter length={count} />
      {isTopCard ? (
        <TopDeckCard card={card} count={count} ownerId={ownerId} />
      ) : (
        <FaceDownCard />
      )}
    </div>
  );
}
