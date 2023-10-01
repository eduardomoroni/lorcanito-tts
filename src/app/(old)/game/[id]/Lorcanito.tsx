"use client";

import React, { useState, type FC } from "react";
import GameTable from "~/spaces/GameTable";
import PrivacyPolicyBanner from "~/spaces/components/banners/PrivacyPolicyBanner";
import { CardPreviewProvider } from "~/spaces/providers/CardPreviewProvider";
import type { Game } from "~/libs/game";
import { DnDProvider } from "~/spaces/providers/DnDProvider";
import { HotkeysProvider } from "react-hotkeys-hook";
import { ContextMenuProvider } from "~/spaces/providers/card-context-menu/ContextMenuProvider";
import { PreGameProvider } from "~/spaces/providers/PreGameProvider";
import { WelcomeModal } from "~/spaces/components/modals/WelcomeModal";
import { PresenceProvider } from "~/spaces/providers/presence/PresenceProvider";
import { GameLobbyProvider } from "~/spaces/providers/lobby/GameLobbyProvider";
import { useGameStore } from "~/engine/lib/GameStoreProvider";

export const Lorcanito: FC<{
  game: Game;
  gameId: string;
  isMobile: boolean;
}> = ({ isMobile }) => {
  const store = useGameStore();
  const [isOpen, setIsOpen] = useState(isMobile);

  // TODO: STOP using toJSON, as it forces a full re-render of the game
  if (!store.toJSON()) {
    return <span>Game not found</span>;
  }

  return (
    <CardPreviewProvider>
      <HotkeysProvider initiallyActiveScopes={["game", "hand"]}>
        <ContextMenuProvider>
          <DnDProvider isMobile={isMobile}>
            <PreGameProvider>
              <GameLobbyProvider
                ssrLobby={undefined}
                playerId={store.activePlayer}
                gameId={store.id}
              >
                <PresenceProvider
                  gameId={store.id}
                  playerId={store.activePlayer}
                >
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
            </PreGameProvider>
          </DnDProvider>
        </ContextMenuProvider>
      </HotkeysProvider>
    </CardPreviewProvider>
  );
};
