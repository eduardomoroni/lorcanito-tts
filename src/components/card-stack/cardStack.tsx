import React from "react";
import { animated, to as interpolate, useSprings } from "@react-spring/web";
import { CardImage } from "~/components/card/CardImage";
import { useDragCard } from "~/hooks/dndCard";
import { LorcanaCardImage } from "~/components/card/LorcanaCardImage";
import { CardModel } from "~/store/models/CardModel";

const to = (i: number) => ({
  x: 0,
  y: i * -1,
  scale: 0.8,
  rot: -10 + Math.random() * 20,
  delay: i * 50,
});
const from = (_i: number) => ({ x: 0, rot: 0, scale: 0.9 });
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r: number, s: number) =>
  `perspective(1500px) rotateX(30deg) rotateY(${
    r / 10
  }deg) rotateZ(${r}deg) scale(${s})`;

// https://codesandbox.io/s/to6uf?file=/src/App.tsx:3441-3449
export default function CardStack(props: {
  cards: CardModel[];
  ownerId: string;
  onClick: () => void;
}) {
  const { cards, ownerId, onClick } = props;
  const [springProps] = useSprings(cards.length, (i) => ({
    ...to(i),
    from: from(i),
  }));

  return (
    <>
      {/* @ts-ignore */}
      {springProps.map(({ x, y, rot, scale }, i) => (
        <animated.div
          className={`absolute flex aspect-card w-full touch-none items-center justify-center will-change-transform`}
          key={i}
          style={{ x, y }}
          onClick={onClick}
        >
          {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
          <animated.div
            style={{
              transform: interpolate([rot, scale], trans),
            }}
            className={`aspect-card w-full rounded-lg object-cover shadow-lg will-change-transform`}
          >
            <DiscardPileCard card={cards[i]} />
          </animated.div>
        </animated.div>
      ))}
    </>
  );
}

function DiscardPileCard(props: { card?: CardModel }) {
  /* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */
  const card = props.card;

  return (
    <LorcanaCardImage
      instanceId={card?.instanceId}
      card={card?.lorcanitoCard}
    />
  );
}
