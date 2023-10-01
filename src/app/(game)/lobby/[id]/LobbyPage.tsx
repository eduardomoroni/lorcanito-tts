"use client";

import React, { type FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useFirebaseUser,
  useFirebaseUserId,
} from "~/libs/3rd-party/firebase/FirebaseSessionProvider";
import { useDatabase, useSigninCheck } from "reactfire";
import GameChat from "~/spaces/components/messaging/GameChat";
import { type Tab, Tabs } from "~/spaces/components/tabs/Tabs";
import { Button } from "~/spaces/components/button/Button";
import { ImportDeckTab } from "~/spaces/components/tabs/ImportDeckTab";
import { DeckCardTab } from "~/spaces/components/tabs/DeckCardTab";
import { HandSimulatorTab } from "~/spaces/components/tabs/HandSimulatorTab";
import { useGameLobby } from "~/spaces/providers/lobby/GameLobbyProvider";
import { useDeckImport } from "~/spaces/providers/DeckImportProvider";
import { api } from "~/libs/api";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import { StartGameModal } from "~/app/(game)/lobby/[id]/components/StartGameModal";
import { StreamChatProvider } from "~/spaces/providers/stream-chat-provider/StreamChatProvider";
import { DeckListTab } from "~/spaces/components/tabs/DeckListTab";
import { setUpLobbyPresence } from "~/libs/3rd-party/firebase/database/presence";
import { ref, set } from "firebase/database";
import { PlayerId, Players } from "~/spaces/game-settings/GameSettings";

const deckCardsTab = { name: "Deck Cards", key: "deck-cards" };
const deckListTab = { name: "Deck List", key: "deck-list" };
const importDeck = { name: "Import Deck", key: "import-deck" };
const tabs: Tab[] = [
  importDeck,
  deckListTab,
  deckCardsTab,
  // { name: "Simulate Hand", key: "simulate-hand" },
];

export const LobbyPage: FC<{ lobbyId: string; streamToken: string }> = (
  props,
) => {
  const { lobbyId, streamToken } = props;
  const { deck } = useDeckImport();

  const userId = useFirebaseUserId();
  const firebaseUser = useFirebaseUser();
  const database = useDatabase();

  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState<Tab>(
    deck.length ? deckListTab : importDeck,
  );
  const [gameLobby, userUID] = useGameLobby();
  const players = Object.keys(gameLobby.players || {});
  const playerHasJoined = players.includes(userUID);

  const { status, data: signInCheckResult } = useSigninCheck();

  useEffect(() => {
    if (gameLobby.gameStarted) {
      router.push(`/game/${lobbyId}`);
    }
  }, [gameLobby.gameStarted, router, lobbyId]);

  useEffect(() => {
    if (firebaseUser?.uid && firebaseUser.uid === gameLobby.ownerId) {
      return setUpLobbyPresence(gameLobby, firebaseUser);
    }

    return undefined;
  }, [gameLobby, firebaseUser]);

  useEffect(() => {
    const isFullRef = ref(
      database,
      `presence/lobbies/${gameLobby.gameId}/full`,
    );
    if (gameLobby.players && Object.keys(gameLobby.players).length === 1) {
      set(isFullRef, false);
    } else {
      set(isFullRef, true);
    }
  }, [gameLobby.players]);

  // TODO: this is the conditional causing hydration error
  if (status === "loading") {
    return <span>loading...</span>;
  } else if (status === "error") {
    return <span>{JSON.stringify(signInCheckResult)}</span>;
  } else if (status === "success" && !signInCheckResult.signedIn) {
    return <span>Login error, please sign in again</span>;
  }

  if (!userId) {
    return (
      <span>
        Something went wrong with your authentication, please sign in again
      </span>
    );
  }

  const opponentId = Object.keys(gameLobby?.players || {}).find(
    (player) => player !== userUID,
  );

  return (
    <StreamChatProvider
      chatId={gameLobby.id}
      players={Object.keys(gameLobby.players || {})}
      playerId={userId}
      streamToken={streamToken}
    >
      <StartGameModal
        lobbyId={lobbyId}
        wonDieRoll={gameLobby.wonDieRoll}
        playerId={userUID}
        opponentId={opponentId}
      />
      <div className={"flex h-full w-full p-10 pt-12"}>
        <div className="mr-10 flex w-full flex-grow">
          <div className="w-full overflow-y-auto rounded-lg bg-gray-200 p-2">
            {playerHasJoined ? (
              <LobbyPageTabs
                playerHasJoined={playerHasJoined}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
              />
            ) : (
              <JoinTableCopy />
            )}
          </div>
        </div>
        <div className="flex max-w-6xl flex-col">
          <RightHandSide lobbyId={lobbyId} />
        </div>
      </div>
    </StreamChatProvider>
  );
};

function JoinTableCopy() {
  return (
    <span>
      You have not joined this game, click on Join game button to join the game.
    </span>
  );
}

function LobbyPageTabs({
  selectedTab,
  setSelectedTab,
  playerHasJoined,
}: {
  selectedTab: Tab;
  setSelectedTab: (tab: Tab) => void;
  playerHasJoined: boolean;
}) {
  return (
    <>
      <Tabs tabs={tabs} onSelect={setSelectedTab} selected={selectedTab} />
      <div className={"h-2"} />
      {selectedTab.key === "import-deck" && (
        <ImportDeckTab
          playerHasJoined={playerHasJoined}
          changeTabToDeckStatus={() => setSelectedTab(deckListTab)}
        />
      )}
      {selectedTab.key === "deck-list" && <DeckListTab />}
      {selectedTab.key === "deck-cards" && <DeckCardTab />}
      {selectedTab.key === "simulate-hand" && <HandSimulatorTab />}
    </>
  );
}

function RightHandSide(props: { lobbyId: string }) {
  const lobbyId = props.lobbyId;
  const [gameLobby, userUID] = useGameLobby();
  const { deck } = useDeckImport();
  const players = Object.keys(gameLobby.players || {});

  const joinGameMutation = api.game.joinGame.useMutation();
  const loadDeckMutation = api.game.loadDeck.useMutation();
  const readyMutation = api.game.lobbyReady.useMutation();

  const loadDeck = () => {
    loadDeckMutation.mutate({ gameId: lobbyId, deck });
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
    loadDeckMutation.mutate({ gameId: lobbyId, deck });
    readyMutation.mutate({ gameId: lobbyId });
    logAnalyticsEvent("ready", {
      gameId: lobbyId,
      user: userUID,
    });
  };

  const playerHasJoined = players.includes(userUID);
  let buttonCopy = "I'm Ready";
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
    buttonCopy = "Click here to start SOLO mode";
  }

  return (
    <>
      <div className="rounded bg-gray-200 p-4">
        <div className="sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
          <PlayerId />
        </div>
        <div>
          <Players players={players} gameId={gameLobby.id} />
        </div>
      </div>

      <Button
        disabled={!deck && playerHasJoined}
        onClick={onClick}
        className={
          "item-center my-4 flex w-full justify-center !bg-indigo-500 py-2 font-mono !text-xl uppercase hover:!bg-indigo-600"
        }
      >
        {buttonCopy}
      </Button>

      <div className="h-2/3 w-full rounded">
        {/*TODO: Add log for opponent ready*/}
        <GameChat isLogEnabled={false} />
      </div>
    </>
  );
}

export default LobbyPage;
