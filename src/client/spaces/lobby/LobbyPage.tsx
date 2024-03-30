"use client";

import React, { type FC, useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  useFirebaseUser,
  useFirebaseUserId,
} from "~/libs/3rd-party/firebase/FirebaseSessionProvider";
import { useDatabase, useSigninCheck } from "reactfire";
import GameChat from "~/client/components/messaging/GameChat";
import { type Tab, Tabs } from "~/client/components/tabs/Tabs";
import { ImportDeckTab } from "~/client/components/tabs/ImportDeckTab";
import { DeckCardTab } from "~/client/components/tabs/DeckCardTab";
import { HandSimulatorTab } from "~/client/components/tabs/HandSimulatorTab";
import { useGameLobby } from "~/client/providers/lobby/GameLobbyProvider";
import { useDeckImport } from "~/client/providers/DeckImportProvider";
import { StartGameModal } from "~/client/spaces/lobby/StartGameModal";
import { StreamChatProvider } from "~/client/providers/stream-chat-provider/StreamChatProvider";
import { DeckListTab } from "~/client/components/tabs/DeckListTab";
import { setUpLobbyPresence } from "~/libs/3rd-party/firebase/database/presence";
import { ref, set } from "firebase/database";
import { useLobbySounds } from "~/client/hooks/useLorcanitoSounds";
import { LobbySummaryTab } from "~/client/components/tabs/LobbySummaryTab";
import { ImReadyButton } from "~/client/spaces/lobby/ImReadyButton";
import { useRootLayoutContext } from "@/components/RootLayoutContext";

const deckCardsTab = { name: "Deck Cards", key: "deck-cards" };
const deckListTab = { name: "Deck List", key: "deck-list" };
const importDeck = { name: "Import Deck", key: "import-deck" };
const lobbyTab = { name: "Lobby", key: "lobby" };
const chatTab = { name: "Chat", key: "chatTab" };

const tabs: Tab[] = [
  importDeck,
  deckListTab,
  deckCardsTab,
  lobbyTab,
  chatTab,
  // { name: "Simulate Hand", key: "simulate-hand" },
];

export const LobbyPage: FC<{ lobbyId: string; streamToken: string }> = (
  props,
) => {
  const { lobbyId, streamToken } = props;
  const router = useRouter();
  const { deck } = useDeckImport();
  const userId = useFirebaseUserId();
  const firebaseUser = useFirebaseUser();
  const database = useDatabase();
  const [gameLobby, userUID] = useGameLobby();
  const { setSubTitle } = useRootLayoutContext();

  useLobbySounds(gameLobby);
  const [selectedTab, setSelectedTab] = useState<Tab>(
    deck.length ? deckListTab : importDeck,
  );
  const players = Object.keys(gameLobby?.players || {});
  const playerHasJoined = players.includes(userUID);

  const { status, data: signInCheckResult } = useSigninCheck();

  useEffect(() => {
    if (players.length <= 1) {
      setSubTitle(" (Waiting for opponent)");
    } else {
      setSubTitle("(Opponent found)");
    }
  }, [players.length]);

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
          <div className="h-full w-full rounded-lg bg-gray-200 p-2">
            {playerHasJoined ? (
              <LobbyPageTabs
                playerHasJoined={playerHasJoined}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                lobbyId={lobbyId}
              />
            ) : (
              <JoinTableCopy />
            )}
          </div>
        </div>
        <div className="flex h-full max-w-6xl flex-col">
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
  lobbyId,
}: {
  selectedTab: Tab;
  setSelectedTab: (tab: Tab) => void;
  playerHasJoined: boolean;
  lobbyId: string;
}) {
  return (
    <>
      <Tabs tabs={tabs} onSelect={setSelectedTab} selected={selectedTab} />
      <div className="h-full w-full overflow-y-auto">
        {selectedTab.key === "import-deck" && (
          <ImportDeckTab
            playerHasJoined={playerHasJoined}
            changeTab={() => setSelectedTab(lobbyTab)}
          />
        )}
        {selectedTab.key === "deck-list" && <DeckListTab />}
        {selectedTab.key === "deck-cards" && <DeckCardTab />}
        {selectedTab.key === "simulate-hand" && <HandSimulatorTab />}
        {selectedTab.key === lobbyTab.key && (
          <LobbySummaryTab
            lobbyId={lobbyId}
            changeTab={() => setSelectedTab(lobbyTab)}
          />
        )}
      </div>
    </>
  );
}

function RightHandSide(props: { lobbyId: string }) {
  const lobbyId = props.lobbyId;

  return (
    <>
      <ImReadyButton lobbyId={lobbyId} />
      <GameChat />
    </>
  );
}

export default LobbyPage;
