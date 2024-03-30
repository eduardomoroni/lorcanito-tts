"use client";

import React, { useState, type FC } from "react";
import GameTable from "~/client/GameTable";
import PrivacyPolicyBanner from "~/client/components/banners/PrivacyPolicyBanner";
import type { Game } from "@lorcanito/engine";
import { DnDProvider } from "~/client/providers/DnDProvider";
import { ContextMenuProvider } from "~/client/providers/card-context-menu/ContextMenuProvider";
import { WelcomeModal } from "~/client/components/modals/WelcomeModal";
import { PresenceProvider } from "~/client/providers/presence/PresenceProvider";
import { GameLobbyProvider } from "~/client/providers/lobby/GameLobbyProvider";
import { useGameStore } from "~/client/providers/GameStoreProvider";

export const Lorcanito: FC<{
  game: Game;
  gameId: string;
  isMobile: boolean;
}> = ({ isMobile, game }) => {
  const store = useGameStore();
  const [isOpen, setIsOpen] = useState(isMobile);

  // TODO: STOP using toJSON, as it forces a full re-render of the game
  if (!game) {
    return <span>Game not found</span>;
  }

  return (
    <ContextMenuProvider>
      <DnDProvider isMobile={isMobile}>
        <GameLobbyProvider
          ssrLobby={undefined}
          playerId={store.activePlayer}
          gameId={store.id}
        >
          <PresenceProvider gameId={store.id} playerId={store.activePlayer}>
            <>
              {store ? <GameTable gameId={store.id || ""} /> : null}
              <PrivacyPolicyBanner />
              <WelcomeModal
                open={isOpen}
                setOpen={setIsOpen}
                onConfirm={() => setIsOpen(false)}
              />
            </>
          </PresenceProvider>
        </GameLobbyProvider>
      </DnDProvider>
    </ContextMenuProvider>
  );
};
