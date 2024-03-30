import React from "react";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import { PlayerId, Players } from "~/client/game-settings/GameSettings";
import { useGameLobby } from "~/client/providers/lobby/GameLobbyProvider";
import { ImReadyButton } from "~/client/spaces/lobby/ImReadyButton";

export function LobbySummaryTab(props: {
  lobbyId: string;
  changeTab: () => void;
}) {
  logAnalyticsEvent("deck_card_tab");

  const lobbyId = props.lobbyId;
  const [gameLobby] = useGameLobby();

  const players = Object.keys(gameLobby.players || {}) || [];

  return (
    <div className="rounded bg-gray-200 p-4">
      <div className="sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
        <PlayerId />
      </div>
      <div>
        <Players players={players} gameId={gameLobby.id} />
      </div>
      <ImReadyButton lobbyId={lobbyId} />
    </div>
  );
}
