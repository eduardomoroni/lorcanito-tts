import React from "react";
import { allCards } from "@lorcanito/engine";
import { getCardFullName } from "~/client/table/deckbuilder/parseDeckList";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";

export function DeckListDeckImport(props: {
  deckList: string;
  setDeckList: (deckList: string) => void;
}) {
  const { deckList, setDeckList } = props;
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const showAllCards = () => {
    const allCardsList = allCards
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      })
      .reduce((acc, card) => {
        return acc + "1 " + getCardFullName(card) + "\n";
      }, "")
      .trim();
    setDeckList(allCardsList);
    logAnalyticsEvent("import_deck_show_all_cards");

    if (textAreaRef.current) {
      textAreaRef.current.value = allCardsList;
    }
  };

  return (
    <div className="sm:col-span-2">
      <span className="inline text-sm font-medium leading-6 text-gray-900">
        Paste your deck list in the text area below and hit IMPORT DECK button.
      </span>
      <div
        className="text-sm font-medium leading-6 text-gray-900"
        aria-hidden="true"
      >
        <a href="#" className="inline">
          <span
            className="group flex items-center space-x-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-900"
            onClick={showAllCards}
          >
            Click here to see ALL the cards available
          </span>
        </a>
      </div>
      <textarea
        id="deck-list-textarea"
        name="deck-list-textarea"
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        defaultValue={deckList}
        ref={textAreaRef}
        rows={10}
        onChange={(e) => setDeckList(e.target.value)}
      />
    </div>
  );
}
