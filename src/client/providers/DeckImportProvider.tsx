"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

import {
  getCardFullName,
  invalidEntriesFromDeckList,
  parseDeckList,
  type ParseErrors,
} from "~/client/table/deckbuilder/parseDeckList";
import { type Deck, createCards } from "@lorcanito/engine";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import { useNotification } from "~/client/providers/NotificationProvider";
import { sampleDeck } from "~/client/table/deckbuilder/sampleDeck";
import { api } from "~/libs/api";
import { emeraldRuby } from "~/client/table/deckbuilder/decks/starters/emeraldRuby";

const Context = createContext<{
  deckList: string;
  deck: Deck;
  setDeckList: (deckList: string) => void;
  parseAndUpdateDeck: (deckList: string, notify?: boolean) => Promise<void>;
}>({
  deckList: emeraldRuby,
  setDeckList: () => {},
  parseAndUpdateDeck: async () => {},
  deck: [],
});

export function DeckImportProvider({
  children,
  gameId,
}: {
  children: JSX.Element;
  gameId: string;
}) {
  let initialState = sampleDeck;
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    initialState = localStorage.getItem("deck-list") || sampleDeck;
  }
  const [deckList, setDeckList] = useState<string>(initialState);
  const [deck, setDeck] = useState<Deck>(parseDeckList(deckList));

  useEffect(() => {
    setDeck(parseDeckList(deckList));
  }, [deckList]);

  useEffect(() => {
    if (deckList) {
      setDeck(parseDeckList(deckList));
    }
  }, []);

  const { sendNotification } = useNotification();
  const loadDeck = api.game.loadDeck.useMutation();

  const parseAndUpdateDeck = async (
    deckList: string,
    notify?: boolean,
  ): Promise<void> => {
    if (!deckList) {
      return;
    }

    const invalidEntries = invalidEntriesFromDeckList(deckList);
    const deck: Deck = parseDeckList(deckList);
    setDeck(deck);
    const cards = createCards(deck, "PLAYERID");
    console.log("Parsed deck cards", JSON.parse(JSON.stringify(cards)));
    loadDeck.mutate({ gameId: gameId, deckList: deckList });

    if (invalidEntries.length) {
      console.log("invalidEntries", invalidEntries);
      sendNotification({
        type: "icon",
        title: "Deck Partially Loaded",
        message:
          "Your deck contain invalid cards, please check the message above to see what cards were not loaded.",
        icon: "warning",
        autoClear: true,
      });
      invalidEntries.forEach((item) => {
        if ("invalid" in item) {
          const reason: Record<ParseErrors, string> = {
            missing_card_name: "Missing card name",
            quantity: "Invalid quantity",
            card_not_found: "Card not found",
          };
          sendNotification({
            type: "icon",
            title: "Invalid card",
            message: `${reason[item.error]}: ${item.line}`,
            icon: "warning",
            autoClear: true,
          });
          logAnalyticsEvent("invalid_card", {
            gameId: gameId,
            reason: reason[item.error],
            card: item.line,
          });
        }
      });
      logAnalyticsEvent("deck_loaded", {
        gameId: gameId,
        type: "partially",
      });
    } else {
      deck.forEach((card) => {
        if (!card.card.implemented) {
          sendNotification({
            type: "icon",
            title: "Not implemented yet",
            message: `${getCardFullName(
              card.card,
            )} is not implemented, if you want to play you have to use the manual mode.`,
            icon: "warning",
            autoClear: true,
          });
        }
      });

      if (notify) {
        sendNotification({
          type: "icon",
          title: "Deck Loaded Successfully",
          // message: deck.reduce((acc, value) => {
          //   return `${acc}${value.qty} ${getCardFullName(value.card)} <br />`;
          // }, ""),
          message: "",
          icon: "success",
          autoClear: true,
        });

        logAnalyticsEvent("deck_loaded", {
          gameId: gameId,
          type: "fully",
        });
      }
    }
  };

  return (
    <Context.Provider
      value={{
        deckList,
        setDeckList: (deckList: string) => {
          localStorage.setItem("deck-list", deckList);
          setDeckList(deckList);
        },
        parseAndUpdateDeck,
        deck,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useDeckImport() {
  return useContext(Context);
}
