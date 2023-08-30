"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";

async function fetchDreambornDeck(deckCode: string): Promise<string[]> {
  const response = await fetch(`/api/dreambornink/deck/${deckCode}`);
  return await response.json();
}

export function DreambornDeckImport(props: {
  deckList: string;
  setDeckList: (deckList: string) => void;
}) {
  const { deckList, setDeckList } = props;
  const params = useSearchParams();
  const [deckCode, setDeckCode] = useState(params?.get("deckId") || "");
  const deckCoderef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<unknown>(undefined);

  const loadDeck = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const dreambornDeck = await fetchDreambornDeck(deckCode);
      console.log(dreambornDeck);
      setDeckList(dreambornDeck.join("\n"));
      logAnalyticsEvent("import_dreamborn_deck");
    } catch (e) {
      setIsError(e);
      console.error(e);
      logAnalyticsEvent("failed_import_dreamborn_deck");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (deckCode) {
      loadDeck();
    }
  }, [deckCode]);

  let verifyMessage = "Verify ID";

  if (isError) {
    verifyMessage = "Try again";
  }

  if (isLoading) {
    verifyMessage = "Verifying";
  }

  // if (!!dreambornDeck && !isLoading) {
  //   verifyMessage =
  //     "Loaded! Double check the deck list and click on update deck";
  // }

  return (
    <div className="sm:col-span-2">
      <div
        className="text-sm font-medium leading-6 text-gray-900"
        aria-hidden="true"
      >
        <span className="inline">Visit </span>
        <a
          href="https://dreamborn.ink/popular-decks"
          target="_blank"
          className="inline"
        >
          <span className="space-x-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-900">
            Dreamborn.ink
          </span>
        </a>
        <span className="inline">
          {" "}
          , select or create a deck, click on Options, click on Export, then
          select the menu "Export" then click on Copy to clipboard, paste the
          content in the text area below.
        </span>
        <div className="grid grid-cols-12 items-center space-y-0 py-5">
          <div className="col-span-3 inline">
            <label
              htmlFor="deck-code"
              className="inline-block text-sm font-medium text-gray-900 sm:mt-1.5"
            >
              Dreamborn Deck code
            </label>
          </div>
          <div className="col-span-6 inline">
            <input
              ref={deckCoderef}
              type="text"
              name="deck-code"
              id="deck-code"
              defaultValue={deckCode}
              onChange={(e) => setDeckCode(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <div className={`col-span-3`}>
            <button
              type="button"
              onClick={async () => {
                loadDeck();
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
