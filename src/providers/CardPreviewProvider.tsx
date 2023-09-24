"use client";

import React, { createContext, useContext, useState } from "react";
import Image from "next/image";
import { cardLoader, createImgixUrl } from "~/components/card/LorcanaCardImage";
import { getCardFullName } from "~/spaces/table/deckbuilder/parseDeckList";
import { LorcanitoCard } from "~/engine/cards/cardTypes";
import { useGameStore } from "~/engine/lib/GameStoreProvider";

// TODO: No longer needs lorcanito card
type CardPreviewPayload =
  | { instanceId?: string; tableId?: string; card?: LorcanitoCard }
  | undefined;
const CardPreviewContext = createContext<
  (cardPreview: CardPreviewPayload) => void
>(() => {});

type SetPreview =
  | { instanceId?: string; tableId?: string; card?: LorcanitoCard }
  | undefined;

export function CardPreviewProvider({ children }: { children: JSX.Element }) {
  const [card, setCard] = useState<LorcanitoCard | undefined>(undefined);
  const store = useGameStore();

  const setCardPreview = (args: SetPreview) => {
    if (!args) {
      setCard(undefined);
      return;
    } else if (args.card) {
      setCard(args.card);
    } else if (args.instanceId) {
      const card = store.cardStore.getCard(args.instanceId)?.lorcanitoCard;
      setCard(card);
    }
  };

  return (
    <CardPreviewContext.Provider value={setCardPreview}>
      <div className={`${card ? "absolute" : "hidden"} left-2 top-2 z-50`}>
        <PreviewCard card={card} setCardPreview={setCardPreview} />
      </div>
      {children}
    </CardPreviewContext.Provider>
  );
}

export function PreviewCard({
  card,
  setCardPreview,
}: {
  card?: LorcanitoCard;
  setCardPreview: (args: SetPreview) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!card) {
    return null;
  }

  return (
    <>
      {!isLoaded ? (
        <Image
          className="aspect-card rounded-md"
          src={
            "https://lorcanito.imgix.net/images/tts/card/card-back.png?auto=format"
          }
          priority
          alt={getCardFullName(card)}
          width={358 * (5 / 6)}
          height={500 * (5 / 6)}
        />
      ) : null}
      <Image
        loader={cardLoader}
        onMouseLeave={() => setCardPreview(undefined)}
        className="aspect-card rounded-md"
        onLoadingComplete={() => setIsLoaded(true)}
        src={createImgixUrl(card)}
        alt={getCardFullName(card)}
        width={358 * (5 / 6)}
        height={500 * (5 / 6)}
      />
    </>
  );
}

export function useCardPreview() {
  return useContext(CardPreviewContext);
}
