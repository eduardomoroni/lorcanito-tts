import React from "react";
import { DeckZone } from "~/client/table/DeckZone";
import { DiscardPileZone } from "~/client/DiscardPileZone";
import { PlayArea } from "~/client/PlayAreaZone";
import { InkWell } from "~/client/InkWellZone";
import { HandZone } from "~/client/HandZone";
import { TableOverlay } from "~/client/table/TableOverlay";
import { PlayerOfflineBanner } from "~/client/components/banners/PlayerOfflineBanner";
import { observer } from "mobx-react-lite";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import { CardModel } from "@lorcanito/engine";
import { LoreCounter } from "~/client/table/lore/LoreCounter";
import { ItemArea } from "~/client/ItemArea";
import clsx from "clsx";

const PlayerTableComponent: React.FC<{
  position: "bottom" | "top";
  tableOwner?: string;
  isStackZoneOpen?: boolean;
  cardsOnStack: CardModel[];
  isPlayerTurn: boolean;
}> = ({
  isPlayerTurn,
  position,
  tableOwner,
  isStackZoneOpen,
  cardsOnStack,
}) => {
  const rootStore = useGameStore();
  const table = rootStore.tableStore.getTable(tableOwner);

  if (!table || !tableOwner) {
    return (
      <TableOverlay
        position={position}
        notJoined={!table || !tableOwner}
        // TODO: Fix this
        noCards={false}
      />
    );
  }

  const zones = table?.zones;

  const playAreaCards =
    zones?.play.cards.filter((card) => card.lorcanitoCard?.type !== "item") ||
    [];
  const items =
    zones?.play.cards.filter((card) => card.lorcanitoCard?.type === "item") ||
    [];
  const deckCards = zones?.deck.cards || [];

  return (
    <div
      data-testid={`player-table-${tableOwner}`}
      className={clsx(
        "relative flex h-full w-full rounded-lg border border-solid border-slate-700",
      )}
    >
      <PlayerOfflineBanner playerId={tableOwner} />
      <div className="playmat absolute inset-0 rounded-lg" />
      <div
        className={clsx(
          "min-w-32 flex h-full w-32 shrink-0",
          position === "bottom" ? "flex-col" : "flex-col-reverse",
        )}
      >
        <div
          className={clsx("flex w-full grow")}
          style={{
            marginTop:
              position === "bottom" ? `0px` : `-${deckCards.length / 10}px`,
          }}
        >
          <DeckZone ownerId={tableOwner} cards={deckCards} />
        </div>
        <div className="relative flex w-full">
          <DiscardPileZone
            playerId={tableOwner}
            cards={zones?.discard.cards || []}
          />
        </div>
        <div className="flex w-full px-1">
          <LoreCounter loreOwner={tableOwner} position={position} />
        </div>
      </div>
      <div
        className={clsx(
          "flex h-full flex-grow",
          position === "bottom" ? "flex-col" : "flex-col-reverse",
        )}
      >
        <div className="flex h-4/6 w-full grow">
          <PlayArea
            playerId={tableOwner}
            cards={playAreaCards}
            cardsOnStack={cardsOnStack}
          />
        </div>
        <div className="z-0 mt-1 flex h-2/6 w-full shrink-0 overflow-x-auto">
          <InkWell
            playerId={tableOwner}
            cards={zones?.inkwell.cards || []}
            position={position}
            canAddToInkwell={table.canAddToInkwell()}
          />
        </div>
      </div>
      {items.length ? (
        <div
          className={clsx(
            "ml-1 flex h-full w-[20%] max-w-[150px] shrink-0",
            position === "bottom" ? "flex-col" : "flex-col-reverse",
          )}
        >
          <ItemArea
            playerId={tableOwner}
            cards={items}
            position={position}
            hotkeyOffset={playAreaCards.length}
          />
        </div>
      ) : null}
      <div
        className={clsx(
          "absolute left-1/2 z-10 flex h-44 w-auto min-w-1/2 max-w-full -translate-x-1/2 justify-center overflow-y-visible transition-all duration-500 ease-in-out hover:scale-125",
          position === "top" ? "-top-44" : "-bottom-44",
          isStackZoneOpen && position === "top" ? "translate-y-2/4" : "",
          isStackZoneOpen && position === "bottom" ? "-translate-y-3/4" : "",
        )}
      >
        <HandZone
          playerId={tableOwner}
          position={position}
          cards={zones?.hand.cards || []}
        />
      </div>
    </div>
  );
};

export const PlayerTable = observer(PlayerTableComponent);
