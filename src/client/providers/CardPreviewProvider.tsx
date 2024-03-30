"use client";

import React, { createContext, useContext, useState } from "react";
import Image from "next/image";
import { getCardFullName } from "~/client/table/deckbuilder/parseDeckList";
import { LorcanitoCard } from "@lorcanito/engine";
import { useLocalStorage } from "@uidotdev/usehooks";
import { createCardUrl } from "~/client/components/image/createCardUrl";

// TODO: No longer needs lorcanito card
type CardPreviewPayload = { card?: LorcanitoCard } | undefined;
const CardPreviewContext = createContext<{
  setCardPreview: (args: CardPreviewPayload) => void;
  cardPreview?: LorcanitoCard;
}>({ cardPreview: undefined, setCardPreview: () => {} });

type SetPreview = { instanceId?: string; card?: LorcanitoCard } | undefined;

export function CardPreviewProvider({ children }: { children: JSX.Element }) {
  const [card, setCard] = useState<LorcanitoCard | undefined>(undefined);

  const setCardPreview = (args: SetPreview) => {
    if (!args) {
      setCard(undefined);
      return;
    } else if (args.card) {
      setCard(args.card);
    }
  };

  return (
    <CardPreviewContext.Provider value={{ setCardPreview, cardPreview: card }}>
      {children}
    </CardPreviewContext.Provider>
  );
}

export function PreviewCard({
  card,
  setCardPreview,
}: {
  card?: LorcanitoCard;
  setCardPreview?: (args: SetPreview) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [language] = useLocalStorage<"EN" | "DE" | "FR">("language", "EN");

  if (!card) {
    return null;
  }

  const className =
    "z-50 aspect-card self-start justify-self-center rounded-md object-contain";

  return (
    <>
      {!isLoaded ? (
        <Image
          fill
          priority
          className={className}
          alt={getCardFullName(card)}
          src="https://six-inks.pages.dev/assets/images/cards/card-back.avif"
        />
      ) : null}
      <Image
        fill
        className={className}
        alt={getCardFullName(card)}
        onLoad={() => setIsLoaded(true)}
        src={createCardUrl(card.set, card.number, { language })}
        loader={({ src }) => `${src}?auto=format&q=50`}
        onMouseLeave={() => setCardPreview && setCardPreview(undefined)}
      />
    </>
  );
}

export function useSetCardPreview() {
  return useContext(CardPreviewContext).setCardPreview;
}

export function usePreviewCard() {
  return useContext(CardPreviewContext).cardPreview;
}
