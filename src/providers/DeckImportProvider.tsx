"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

import {
  getCardFullName,
  invalidEntriesFromDeckList,
  parseDeckList,
  type ParseErrors,
} from "~/spaces/table/deckbuilder/parseDeckList";
import { type Deck } from "~/providers/TabletopProvider";
import { createCards } from "~/libs/game";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import { useNotification } from "~/providers/NotificationProvider";
import { sampleDeck } from "~/spaces/table/deckbuilder/sampleDeck";
import { emeraldRuby } from "~/spaces/table/deckbuilder/decks/emeraldRuby";
import { api } from "~/utils/api";

const Context = createContext<{
  deckList: string;
  deck: Deck;
  setDeckList: (deckList: string) => void;
  parseAndUpdateDeck: () => Promise<void>;
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
  const [deckList, setDeckList] = useState<string>(
    localStorage.getItem("deck-list") || sampleDeck
  );
  const [deck, setDeck] = useState<Deck>(parseDeckList(deckList));

  useEffect(() => {
    setDeck(parseDeckList(deckList));
  }, [deckList]);

  const { sendNotification, clearAllNotifications } = useNotification();
  const loadDeck = api.game.loadDeck.useMutation();

  const parseAndUpdateDeck = async (): Promise<void> => {
    if (!deckList) {
      return;
    }

    const invalidEntries = invalidEntriesFromDeckList(deckList);
    const deck: Deck = parseDeckList(deckList);
    const cards = createCards(deck, "PLAYERID");
    console.log("Parsed deck cards", JSON.parse(JSON.stringify(cards)));
    loadDeck.mutate({ gameId: gameId, deckList: deckList });

    clearAllNotifications();

    typeof window !== "undefined" &&
      window.setTimeout(() => {
        clearAllNotifications();
      }, 5000);

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
      sendNotification({
        type: "icon",
        title: "Deck Loaded Successfully",
        message: deck.reduce((acc, value) => {
          return `${acc}${value.qty} ${getCardFullName(value.card)} <br />`;
        }, ""),
        icon: "success",
      });
      logAnalyticsEvent("deck_loaded", {
        gameId: gameId,
        type: "fully",
      });
    }
  };

  return (
    <Context.Provider
      value={{ deckList, setDeckList, parseAndUpdateDeck, deck }}
    >
      {children}
    </Context.Provider>
  );
}

export function useDeckImport() {
  return useContext(Context);
}
