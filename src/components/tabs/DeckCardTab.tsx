import { useDeckImport } from "~/providers/DeckImportProvider";
import { LorcanaCardImage } from "~/components/card/LorcanaCardImage";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import React from "react";
import { LorcanitoCard } from "~/engine/cardTypes";

// @ts-ignore
const CardImage: React.FC<{
  card: LorcanitoCard;
  qty: number;
}> = (props): React.ReactNode => {
  const { card, qty } = props;

  return (
    <>
      {[...Array(qty).keys()].map((_, i) => (
        <div
          key={i}
          className={`${
            i !== qty - 1 ? "mb-[-90%]" : ""
          } relative aspect-card-image-name w-full overflow-hidden`}
        >
          <LorcanaCardImage hideCardText card={card} />
        </div>
      ))}
    </>
  );
};

export function DeckCardTab() {
  const { deck } = useDeckImport();
  logAnalyticsEvent("deck_card_tab");

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {deck
          .sort((a, b) => b.qty - a.qty)
          .map((card) => {
            return (
              <a
                key={card.cardId}
                data-id-card={card.cardId}
                className={`group rounded-lg`}
              >
                <CardImage card={card.card} qty={card.qty} />
              </a>
            );
          })}
      </div>
    </div>
  );
}
