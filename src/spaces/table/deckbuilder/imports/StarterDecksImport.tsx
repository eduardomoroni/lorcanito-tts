"use client";

import React, { useEffect, useState } from "react";
import {
  decks,
  type DeckType,
  StarterDeckSelect,
} from "~/spaces/table/deckbuilder/imports/StarterDeckSelect";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import { useDeckImport } from "~/providers/DeckImportProvider";

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
      <div>
        {selected ? (
          <StarterDeckSelect selected={selected} setSelected={setSelected} />
        ) : null}
      </div>
      <div>
        <label
          htmlFor="project-name"
          className="block text-sm font-medium leading-6 text-gray-900 sm:mt-1.5"
        >
          Deck List (Feel free to edit)
        </label>
      </div>
      <textarea
        id="deck-list-textarea"
        name="deck-list-textarea"
        rows={4}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        value={deckList}
        onChange={(e) => setDeckList(e.target.value)}
      />
    </div>
  );
}
