"use client";

import React, { type FC } from "react";
import { GameLogProvider } from "~/spaces/Log/game-log/GameLogProvider";
import { NotificationProvider } from "~/spaces/providers/NotificationProvider";
import { DnDProvider } from "~/spaces/providers/DnDProvider";
import { HotkeysProvider } from "react-hotkeys-hook";
import { ContextMenuProvider } from "~/spaces/providers/card-context-menu/ContextMenuProvider";
import { TargetModalProvider } from "~/spaces/providers/TargetModalProvider";
import { ConfirmationModalProvider } from "~/spaces/providers/ConfirmationModalProvider";
import LobbyPage from "./LobbyPage";
import { Game, type GameLobby } from "~/libs/game";
import { DeckImportProvider } from "~/spaces/providers/DeckImportProvider";
import { PresenceProvider } from "~/spaces/providers/presence/PresenceProvider";
import { GameLobbyProvider } from "~/spaces/providers/lobby/GameLobbyProvider";
import { GameStoreProvider } from "~/engine/lib/GameStoreProvider";

type Props = {
  lobby: GameLobby;
  game: Game;
  userId: string;
  streamToken: string;
};

export const LobbyPageProviders: FC<Props> = ({
  lobby,
  game,
  userId,
  streamToken,
}) => {
  return (
    <GameLobbyProvider ssrLobby={lobby} playerId={userId} gameId={lobby.id}>
      <GameStoreProvider ssrGame={game} gameId={lobby.id} playerId={userId}>
        <NotificationProvider>
          <GameLogProvider>
            <HotkeysProvider initiallyActiveScopes={["game", "hand"]}>
              <ContextMenuProvider>
                <DnDProvider isMobile={false}>
                  <ConfirmationModalProvider>
                    <TargetModalProvider>
                      <DeckImportProvider gameId={lobby.id}>
                        <PresenceProvider gameId={lobby.id} playerId={userId}>
                          <LobbyPage
                            lobbyId={lobby.id}
                            streamToken={streamToken}
                          />
                        </PresenceProvider>
                      </DeckImportProvider>
                    </TargetModalProvider>
                  </ConfirmationModalProvider>
                </DnDProvider>
              </ContextMenuProvider>
            </HotkeysProvider>
          </GameLogProvider>
        </NotificationProvider>
      </GameStoreProvider>
    </GameLobbyProvider>
  );
};

export default LobbyPageProviders;
