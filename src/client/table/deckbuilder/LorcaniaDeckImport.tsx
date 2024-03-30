"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "~/libs/api";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";

export function LorcaniaDeckImport(props: {
  deckList: string;
  setDeckList: (deckList: string) => void;
}) {
  const { deckList, setDeckList } = props;
  const params = useSearchParams();
  const [deckCode, setDeckCode] = useState(params?.get("deckId") || "");
  const deckCoderef = useRef<HTMLInputElement>(null);

  // If people come from lorcania ref, fetch the deck as we open
  // changing the 'enabled' flag would cause the input text to fetch the deck on every keystroke
  useLayoutEffect(() => {
    if (!!deckCode) {
      refetch();
    }
  }, []);

  const {
    data: lorcaniaDeck,
    isFetching,
    isError,
    refetch,
  } = api.settings.loadDeck.useQuery(
    {
      deckCode,
      provider: "lorcania",
    },
    { enabled: false },
  );

  useEffect(() => {
    if (lorcaniaDeck) {
      setDeckList(lorcaniaDeck.join("\n"));
    }
  }, [lorcaniaDeck]);

  let verifyMessage = "Verify code";

  if (!lorcaniaDeck) {
    if (isError) {
      verifyMessage = "Try again";
    }

    if (isFetching) {
      verifyMessage = "Verifying";
    }
  }

  if (!!lorcaniaDeck && !isFetching) {
    verifyMessage =
      "Loaded! Double check the deck list and click on update deck";
  }

  return (
    <div className="sm:col-span-2">
      <div
        className="text-sm font-medium leading-6 text-gray-900"
        aria-hidden="true"
      >
        <span className="inline">Visit </span>
        <a
          href="https://lorcania.com/popular?from=play.lorcanito.com"
          target="_blank"
          className="inline"
        >
          <span className="space-x-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-900">
            Lorcania.com
          </span>
        </a>
        <span className="inline">
          {" "}
          , select or create a deck, click on Export, then select the tab "Deck
          Text" and grab your deck's code.
        </span>
        <div className="grid grid-cols-12 items-center space-y-0 py-5">
          <div className="col-span-3 inline">
            <label
              htmlFor="deck-code"
              className="inline-block text-sm font-medium text-gray-900 sm:mt-1.5"
            >
              Deck code
            </label>
          </div>
          <div className="col-span-6 inline">
            <input
              ref={deckCoderef}
              type="text"
              name="deck-code"
              id="deck-code"
              defaultValue={deckCode}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <div className={`col-span-3`}>
            <button
              type="button"
              onClick={() => {
                setDeckCode(deckCoderef.current?.value || "");
                refetch();
                logAnalyticsEvent("import_lorcania_deck");
              }}
              className="ml-6 rounded-md bg-white text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {verifyMessage}
            </button>
          </div>
        </div>
      </div>
      <div>
        <label
          htmlFor="project-name"
          className="block text-sm font-medium leading-6 text-gray-900 sm:mt-1.5"
        >
          Deck Text
        </label>
      </div>
      <textarea
        id="deck-list-textarea"
        name="deck-list-textarea"
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        value={deckList}
        rows={10}
        onChange={(e) => setDeckList(e.target.value)}
      />
    </div>
  );
}
