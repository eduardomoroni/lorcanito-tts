"use client";

import React, { useEffect, useState } from "react";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import {
  ConstructedDeckSelect,
  type DeckType,
} from "~/client/table/deckbuilder/imports/ConstructedDeckSelect";

import { amberAmethyst } from "~/client/table/deckbuilder/decks/starters/amberAmethyst";
import { saphireSteel } from "~/client/table/deckbuilder/decks/starters/saphireSteel";
import { emeraldRuby } from "~/client/table/deckbuilder/decks/starters/emeraldRuby";
import { amberSapphire } from "~/client/table/deckbuilder/decks/starters/amberSapphire";
import { amethystSteel } from "~/client/table/deckbuilder/decks/starters/amethystSteel";

export const decks: DeckType[] = [
  {
    deck: "Moana - Of Motunui & Mickey Mouse - Wayward Sorcerer",
    colors: ["amethyst", "amber"],
    deckList: amberAmethyst,
  },
  {
    deck: "Aurora - Dreaming Guardian & Simba - Returned King",
    colors: ["sapphire", "steel"],
    deckList: saphireSteel,
  },
  {
    deck: "Cruella De Vil - Miserable as Usual & Aladdin - Heroic Outlaw",
    colors: ["emerald", "ruby"],
    deckList: emeraldRuby,
  },
  {
    deck: "Tactical Teamwork",
    colors: ["amber", "sapphire"],
    deckList: amberSapphire,
  },
  {
    deck: "Might and Magic",
    colors: ["amethyst", "steel"],
    deckList: amethystSteel,
  },
];

export function StarterDecksImport(props: {
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
          As warm up, you can import one of the starter decks. Once you're
          familiar you can create your own deck by changing import options or
          editing the Deck list.
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
