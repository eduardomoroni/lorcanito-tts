import React from "react";
import { DeckZone } from "~/spaces/table/DeckZone";
import { DiscardPileZone } from "~/spaces/DiscardPileZone";
import { PlayArea } from "~/spaces/PlayAreaZone";
import { InkWell } from "~/spaces/InkWellZone";
import { LoreCounter } from "~/spaces/table/LoreCounter";
import { Hand } from "~/spaces/Hand";
import { TableOverlay } from "~/spaces/table/TableOverlay";
import { PlayerOfflineBanner } from "~/components/banners/PlayerOfflineBanner";
import { usePlayerTable } from "~/engine/GameProvider";

export const PlayerTable: React.FC<{
  position: "bottom" | "top";
  tableOwner?: string;
  isStackZoneOpen?: boolean;
  cardsOnStack: string[];
}> = ({ position, tableOwner, isStackZoneOpen, cardsOnStack }) => {
  const { table } = usePlayerTable(tableOwner);
  const zones = table?.zones;

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

  return (
    <div className="relative flex h-full w-full rounded-lg border border-solid border-slate-700">
      <PlayerOfflineBanner playerId={tableOwner} />
      <div className="playmat absolute inset-0 rounded-lg"></div>
      <div
        className={`flex h-full w-36 min-w-[9rem] ${
          position === "bottom" ? "flex-col" : "flex-col-reverse"
        }`}
      >
        <div className={`flex h-1/2 w-full`}>
          <DeckZone ownerId={tableOwner} cards={zones?.deck || []} />
        </div>
        <div className="flex h-1/2 w-full">
          <DiscardPileZone playerId={tableOwner} cards={zones?.discard || []} />
        </div>
      </div>
      <div
        className={`flex h-full w-10/12 flex-grow ${
          position === "bottom" ? "flex-col" : "flex-col-reverse"
        }`}
      >
        <div className="flex h-4/6 w-full">
          <PlayArea
            playerId={tableOwner}
            cards={zones?.play || []}
            cardsOnStack={cardsOnStack}
          />
        </div>
        <div className="z-0 flex h-2/6 w-full">
          <InkWell
            playerId={tableOwner}
            cards={zones?.inkwell || []}
            position={position}
          />
        </div>
      </div>
      <div
        className={`z-10 mr-1 flex h-full w-12 rounded-lg bg-black opacity-25 ${
          position === "bottom" ? "flex-col-reverse" : "flex-col"
        }`}
      >
        <LoreCounter loreOwner={tableOwner} position={position} />
      </div>
      <div
        className={`${position === "top" ? "-top-44" : "-bottom-44"} ${
          isStackZoneOpen ? "-translate-y-3/4" : ""
        } absolute left-1/2 z-10 flex h-44 w-auto min-w-1/2 max-w-full -translate-x-1/2 justify-center overflow-y-visible transition-all duration-700 hover:scale-125`}
      >
        <Hand
          playerId={tableOwner}
          position={position}
          cards={zones?.hand || []}
        />
      </div>
    </div>
  );
};
