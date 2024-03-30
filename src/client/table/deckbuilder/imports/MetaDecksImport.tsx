"use client";

import React, { useEffect, useState } from "react";
import {
  ConstructedDeckSelect,
  type DeckType,
} from "~/client/table/deckbuilder/imports/ConstructedDeckSelect";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";

import { amberAmethystAggro } from "~/client/table/deckbuilder/decks/meta/amberAmethystAggro";
import { amberEmeraldTatics } from "~/client/table/deckbuilder/decks/meta/amberEmeraldTatics";
import { amberSteelSongs } from "~/client/table/deckbuilder/decks/meta/amberSteelSongs";
import { emeraldSteelControl } from "~/client/table/deckbuilder/decks/meta/emeraldSteelControl";
import { rubySapphireItemControl } from "~/client/table/deckbuilder/decks/meta/RubySapphireItemControl";
import { sapphireSteelResist } from "~/client/table/deckbuilder/decks/meta/sapphireSteelResist";

export const decks: DeckType[] = [
  {
    deck: "Amber/Amethyst Aggro",
    colors: ["amber", "amethyst"],
    deckList: amberAmethystAggro,
  },
  {
    deck: "Amber/Emerald Tactics",
    colors: ["amber", "emerald"],
    deckList: amberEmeraldTatics,
  },
  {
    deck: "Amber/Steel Songs",
    colors: ["amber", "steel"],
    deckList: amberSteelSongs,
  },
  {
    deck: "Emerald/Steel Control",
    colors: ["emerald", "steel"],
    deckList: emeraldSteelControl,
  },
  {
    deck: "Sapphire/Steel Resist",
    colors: ["sapphire", "steel"],
    deckList: sapphireSteelResist,
  },
  {
    deck: "Ruby/Sapphire Item Control",
    colors: ["sapphire", "ruby"],
    deckList: rubySapphireItemControl,
  },
];

export function MetaDecksImport(props: {
  deckList: string;
  setDeckList: (deckList: string) => void;
}) {
  const { deckList, setDeckList } = props;
  const deckType = decks[0];
  const [selected, setSelected] = useState<DeckType | undefined>(deckType);

  useEffect(() => {
    setDeckList(selected?.deckList || "");
    logAnalyticsEvent("start_deck_selected");
  }, [selected, setDeckList]);

  return (
    <div className="sm:col-span-2">
      <div
        className="text-sm font-medium leading-6 text-gray-900"
        aria-hidden="true"
      >
        <span className="inline">
          You can import one of the current meta decks. Once you're familiar you
          can create your own deck by changing import options or editing the
          Deck list.
        </span>
      </div>
      <div className="flex h-full w-full">
        {selected ? (
          <ConstructedDeckSelect
            selected={selected}
            setSelected={setSelected}
            decks={decks}
          />
        ) : null}
        <div className="h-auto w-full">
          <textarea
            id="deck-list-textarea"
            name="deck-list-textarea"
            className="block h-full w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={deckList}
            onChange={(e) => setDeckList(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
