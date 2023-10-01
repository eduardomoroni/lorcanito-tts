import React from "react";
import { type Zones } from "~/spaces/providers/TabletopProvider";
import { DamageCounter } from "~/spaces/table/DamageCounter";
import { PlusCircleIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import { useGameStore } from "~/engine/lib/GameStoreProvider";
import { Button } from "~/spaces/components/Button";
import { observer } from "mobx-react-lite";
import { CardModel } from "~/engine/store/models/CardModel";

function CardImageDamageOverlayComponent(props: {
  card: CardModel;
  className?: string;
  zone: Zones;
}) {
  const { zone, className, card } = props;

  const store = useGameStore();
  const meta = card.meta;
  const damage = meta?.damage || 0;

  const isDead =
    zone === "play" &&
    !!damage &&
    damage >= (card.lorcanitoCard?.willpower || 0);

  return (
    <>
      {zone === "play" && (
        <>
          {isDead ? (
            <Button
              className={`absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 px-4`}
              variant={"solid"}
              color={"slate"}
              onClick={(event) => {
                event.stopPropagation();
                card.banish();
              }}
            >
              BANISH CARD
            </Button>
          ) : null}

          <div
            onClick={(event) => {
              event.stopPropagation();
            }}
            className={`absolute left-0 top-0 z-20 flex rounded bg-black hover:z-40 ${className} ${
              !damage ? "opacity-0 hover:opacity-75" : "opacity-100"
            }`}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                card.updateCardDamage(1, "remove");
                logAnalyticsEvent("card_damage_counter");
              }}
              className="-m-2 inline-flex p-2 text-gray-200 hover:text-gray-500"
            >
              <span className="sr-only">Remove</span>
              <MinusCircleIcon className="h-8 w-8" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                card.updateCardDamage(1, "add");
                logAnalyticsEvent("card_damage_counter");
              }}
              className="-m-2 inline-flex p-2 text-gray-200 hover:text-gray-500"
            >
              <span className="sr-only">Remove</span>
              <PlusCircleIcon className="h-8 w-8" aria-hidden="true" />
            </button>

            <DamageCounter damage={damage} />
          </div>
        </>
      )}
    </>
  );
}

export const CardImageDamageOverlay = observer(CardImageDamageOverlayComponent);
