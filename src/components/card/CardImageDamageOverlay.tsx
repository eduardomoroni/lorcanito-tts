import React from "react";
import { type Zones } from "~/providers/TabletopProvider";
import { DamageCounter } from "~/spaces/table/DamageCounter";
import { PlusCircleIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import { useGameController } from "~/engine/rule-engine/lib/GameControllerProvider";
import { Button } from "~/components/Button";

export function CardImageDamageOverlay(props: {
  instanceId: string;
  isDead?: boolean;
  className?: string;
  zone: Zones;
  isFresh?: boolean;
}) {
  const { isDead, instanceId, zone, className, isFresh } = props;
  const engine = useGameController();
  const tableCard = engine.tableCard(instanceId);

  if (!tableCard) {
    return null;
  }
  const damage = tableCard.meta?.damage;

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
                engine.moveCard({
                  instanceId,
                  from: "play",
                  to: "discard",
                  position: "last",
                });
                logAnalyticsEvent("banish_card");
              }}
            >
              BANISH CARD
            </Button>
          ) : null}

          <div
            onClick={(event) => {
              event.stopPropagation();
            }}
            className={`${
              isFresh ? "bottom-[35%]" : "bottom-0"
            } absolute left-0 z-20 flex rounded bg-black ${className} ${
              !damage ? "opacity-0 hover:opacity-75" : "opacity-100"
            }`}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                engine.updateCardDamageCounter(instanceId, 1, "remove");
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
                engine.updateCardDamageCounter(instanceId, 1, "add");
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
