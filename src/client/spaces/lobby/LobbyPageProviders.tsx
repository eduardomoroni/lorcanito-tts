"use client";

import React, { type FC } from "react";
import { NotificationProvider } from "~/client/providers/NotificationProvider";
import { ContextMenuProvider } from "~/client/providers/card-context-menu/ContextMenuProvider";
import { ConfirmationModalProvider } from "~/client/providers/ConfirmationModalProvider";
import LobbyPage from "~/client/spaces/lobby/LobbyPage";
import { type GameLobby } from "@lorcanito/engine";
import { DeckImportProvider } from "~/client/providers/DeckImportProvider";
import { PresenceProvider } from "~/client/providers/presence/PresenceProvider";
import { GameLobbyProvider } from "~/client/providers/lobby/GameLobbyProvider";

type Props = {
  lobby: GameLobby;
  userId: string;
  streamToken: string;
};

export const LobbyPageProviders: FC<Props> = ({
  lobby,
  userId,
  streamToken,
}) => {
  return (
    <GameLobbyProvider ssrLobby={lobby} playerId={userId} gameId={lobby.id}>
      <NotificationProvider>
        <ContextMenuProvider>
          <ConfirmationModalProvider>
            <DeckImportProvider gameId={lobby.id}>
              <PresenceProvider gameId={lobby.id} playerId={userId}>
                <LobbyPage lobbyId={lobby.id} streamToken={streamToken} />
              </PresenceProvider>
            </DeckImportProvider>
          </ConfirmationModalProvider>
        </ContextMenuProvider>
      </NotificationProvider>
    </GameLobbyProvider>
  );
};

export default LobbyPageProviders;
