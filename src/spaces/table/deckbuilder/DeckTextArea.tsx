import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import Dropdown from "~/components/dropdowns/Dropdown";
import { DeckListDeckImport } from "~/spaces/table/deckbuilder/DeckListDeckImport";
import { LorcaniaDeckImport } from "~/spaces/table/deckbuilder/LorcaniaDeckImport";
import { StarterDecksImport } from "~/spaces/table/deckbuilder/imports/StarterDecksImport";
import { useDeckImport } from "~/providers/DeckImportProvider";
import { DreambornDeckImport } from "~/spaces/table/deckbuilder/DreambornDeckImport";

const MODES = {
  list: "Deck list",
  lorcania: "Lorcania",
  starters: "Starter Decks",
  dreamborn: "Dreamborn.ink",
};

const dropdownItems = [
  { title: MODES.list },
  // { title: MODES.lorcania },
  // { title: MODES.dreamborn },
  { title: MODES.starters },
];

export function DeckTextArea(props: { playerHasJoined: boolean }) {
  const urlSearchParams = useSearchParams();
  const { deckList, setDeckList } = useDeckImport();
  const referrer = urlSearchParams?.get("source")?.toLowerCase();
  const referrerSource = referrer?.toLowerCase() as keyof typeof MODES;
  const modes: string = MODES[referrerSource];
  const initialState = referrer
    ? modes
    : window.localStorage.getItem("deckMode");
  const [importMode, setImportMode] = useState<string>(
    initialState || MODES.starters
  );

  useEffect(() => {
    if (importMode) {
      window.localStorage.setItem("deckMode", importMode);
    } else {
      window.localStorage.setItem(
        "deckMode",
        referrer === "lorcania"
          ? MODES.lorcania
          : referrer === "dreamborn"
          ? MODES.dreamborn
          : MODES.starters
      );
    }
  }, [importMode]);

  return (
    <div className="flex flex-col space-y-2 sm:gap-4 sm:space-y-0 sm:py-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium text-gray-900">{`Import Deck: ${importMode}`}</h3>
        <Dropdown
          title="Import options"
          items={dropdownItems}
          onChange={(mode) => setImportMode(mode)}
        />
      </div>
      <div>
        <div
          className="text-sm font-medium leading-6 text-gray-900"
          aria-hidden="true"
        >
          {!props.playerHasJoined && (
            <span className="inline">
              You haven't joined the table, please click on 'join game' above
            </span>
          )}
        </div>
        {importMode === MODES.list ? (
          <DeckListDeckImport deckList={deckList} setDeckList={setDeckList} />
        ) : null}
        {importMode === MODES.lorcania ? (
          <LorcaniaDeckImport deckList={deckList} setDeckList={setDeckList} />
        ) : null}
        {importMode === MODES.dreamborn ? (
          <DreambornDeckImport deckList={deckList} setDeckList={setDeckList} />
        ) : null}
        {importMode === MODES.starters ? (
          <StarterDecksImport deckList={deckList} setDeckList={setDeckList} />
        ) : null}
      </div>
    </div>
  );
}
