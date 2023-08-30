"use client";

import React, { useState, type FC } from "react";
import GameTable from "~/spaces/GameTable";
import PrivacyPolicyBanner from "~/components/banners/PrivacyPolicyBanner";
import { CardPreviewProvider } from "~/providers/CardPreviewProvider";
import type { Game } from "~/libs/game";
import { DnDProvider } from "~/providers/DnDProvider";
import { HotkeysProvider } from "react-hotkeys-hook";
import { ContextMenuProvider } from "~/providers/card-context-menu/ContextMenuProvider";
import { PreGameProvider } from "~/providers/PreGameProvider";
import { WelcomeModal } from "~/components/modals/WelcomeModal";
import { PresenceProvider } from "~/providers/presence/PresenceProvider";
import { GameLobbyProvider } from "~/providers/lobby/GameLobbyProvider";
import { useGame } from "~/engine/rule-engine/lib/GameControllerProvider";

export const Lorcanito: FC<{
  game: Game;
  gameId: string;
  isMobile: boolean;
}> = ({ isMobile }) => {
  const [game, playerId] = useGame();
  const [isOpen, setIsOpen] = useState(isMobile);

  if (!game) {
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
                playerId={playerId}
                gameId={game.id}
              >
                <PresenceProvider gameId={game.id} playerId={playerId}>
                  <>
                    {game ? <GameTable gameId={game?.id || ""} /> : null}
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
