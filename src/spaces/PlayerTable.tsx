import React from "react";
import { DeckZone } from "~/spaces/table/DeckZone";
import { DiscardPileZone } from "~/spaces/DiscardPileZone";
import { PlayArea } from "~/spaces/PlayAreaZone";
import { InkWell } from "~/spaces/InkWellZone";
import { HandZone } from "~/spaces/HandZone";
import { TableOverlay } from "~/spaces/table/TableOverlay";
import { PlayerOfflineBanner } from "~/components/banners/PlayerOfflineBanner";
import { observer } from "mobx-react-lite";
import { useGameStore } from "~/engine/rule-engine/lib/GameStoreProvider";
import { CardModel } from "~/store/models/CardModel";
import { LoreCounter } from "~/spaces/table/lore/LoreCounter";
import { ItemArea } from "~/spaces/ItemArea";

const PlayerTableComponent: React.FC<{
  position: "bottom" | "top";
  tableOwner?: string;
  isStackZoneOpen?: boolean;
  cardsOnStack: CardModel[];
}> = ({ position, tableOwner, isStackZoneOpen, cardsOnStack }) => {
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
  return (
    <div className="relative flex h-full w-full rounded-lg border border-solid border-slate-700">
      <PlayerOfflineBanner playerId={tableOwner} />
      <div className="playmat absolute inset-0 rounded-lg"></div>
      <div
        className={`min-w-32 mr-2 flex h-full w-32 justify-between ${
          position === "bottom" ? "flex-col" : "flex-col-reverse"
        }`}
      >
        <LoreCounter loreOwner={tableOwner} position={position} />
        <div className={`flex aspect-card w-full`}>
          <DeckZone ownerId={tableOwner} cards={zones?.deck.cards || []} />
        </div>
        <div className="flex aspect-card w-full">
          <DiscardPileZone
            playerId={tableOwner}
            cards={zones?.discard.cards || []}
          />
        </div>
      </div>
      <div
        className={`flex h-full flex-grow ${
          position === "bottom" ? "flex-col" : "flex-col-reverse"
        }`}
      >
        <div className="flex h-4/6 w-full">
          <PlayArea
            playerId={tableOwner}
            cards={playAreaCards}
            cardsOnStack={cardsOnStack}
          />
        </div>
        <div className="z-0 flex h-2/6 w-full">
          <InkWell
            playerId={tableOwner}
            cards={zones?.inkwell.cards || []}
            position={position}
          />
        </div>
      </div>
      {items.length ? (
        <div
          className={`flex h-full w-[20%] max-w-[150px] ${
            position === "bottom" ? "flex-col" : "flex-col-reverse"
          }`}
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
        className={`${position === "top" ? "-top-44" : "-bottom-44"} ${
          isStackZoneOpen ? "-translate-y-3/4" : ""
        } absolute left-1/2 z-10 flex h-44 w-auto min-w-1/2 max-w-full -translate-x-1/2 justify-center overflow-y-visible transition-all duration-700 hover:scale-125`}
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
