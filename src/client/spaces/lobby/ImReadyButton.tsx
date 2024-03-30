import Link from "next/link";
import clsx from "clsx";
import { Button } from "~/client/components/button/Button";
import React from "react";
import { useGameLobby } from "~/client/providers/lobby/GameLobbyProvider";
import { useDeckImport } from "~/client/providers/DeckImportProvider";
import { api } from "~/libs/api";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";

export function ImReadyButton(props: { lobbyId: string }) {
  const lobbyId = props.lobbyId;
  const [gameLobby, userUID] = useGameLobby();
  const { deck, deckList } = useDeckImport();

  const players = Object.keys(gameLobby.players || {}) || [];

  const joinGameMutation = api.game.joinGameLobby.useMutation();
  const loadDeckMutation = api.game.loadDeck.useMutation();
  const readyMutation = api.game.lobbyReady.useMutation();

  const loadDeck = () => {
    loadDeckMutation.mutate({ gameId: lobbyId, deckList });
    logAnalyticsEvent("load_deck", {
      gameId: lobbyId,
      user: userUID,
    });
  };
  const joinGame = () => {
    joinGameMutation.mutate({ gameId: lobbyId });
    logAnalyticsEvent("join_game", {
      gameId: lobbyId,
      user: userUID,
    });
  };

  const ready = () => {
    // TODO: Think about if this is needed in isolation or not
    loadDeckMutation.mutate({ gameId: lobbyId, deckList });
    readyMutation.mutate({ gameId: lobbyId });
    logAnalyticsEvent("ready", {
      gameId: lobbyId,
      user: userUID,
    });
  };

  const playerHasJoined = players.includes(userUID);
  let buttonCopy = "Click to be ready";
  let onClick = ready;

  if (!deck?.length && playerHasJoined) {
    buttonCopy = "Import Deck";
    onClick = loadDeck;
  }

  const waitingForOthers =
    playerHasJoined && deck.length > 0 && gameLobby.players[userUID];

  if (waitingForOthers) {
    buttonCopy = "Waiting for others to be ready";
    onClick = loadDeck;
  }

  if (!playerHasJoined) {
    buttonCopy = "Join Game";
    onClick = joinGame;
  }

  if (
    readyMutation.isLoading ||
    joinGameMutation.isLoading ||
    loadDeckMutation.isLoading
  ) {
    buttonCopy = "Loading...";
  }

  if (
    playerHasJoined &&
    deck.length > 1 &&
    Object.keys(gameLobby.players).length === 1
  ) {
    buttonCopy = "start SOLO mode";
  }

  return (
    <Button
      disabled={!deck && playerHasJoined}
      onClick={onClick}
      className={
        "item-center !bg-stone-800-500 my-4 flex w-full justify-center py-2 font-mono !text-xl uppercase hover:!bg-stone-500"
      }
    >
      {buttonCopy}
    </Button>
  );
}
