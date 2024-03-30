"use client";

import React, { type FC, useEffect, useState } from "react";
import { useFirebaseUserId } from "~/libs/3rd-party/firebase/FirebaseSessionProvider";
import { useSigninCheck } from "reactfire";
import type { Game } from "@lorcanito/engine";
import { Lorcanito } from "~/client/spaces/game/Lorcanito";
import { GameStoreProvider } from "~/client/providers/GameStoreProvider";
import { StreamChatProvider } from "~/client/providers/stream-chat-provider/StreamChatProvider";
import { GameLogProvider } from "~/client/Log/game-log/GameLogProvider";
import { NotificationProvider } from "~/client/providers/NotificationProvider";
import { YesOrNoModalProvider } from "~/client/providers/YesOrNoModalProvider";
import { ConfirmationModalProvider } from "~/client/providers/ConfirmationModalProvider";
import { TargetModalProvider } from "~/client/providers/TargetModalProvider";
import { ScryModalProvider } from "~/client/providers/ScryModalProvider";
import { CardPreviewProvider } from "~/client/providers/CardPreviewProvider";
import { HotkeysProvider } from "react-hotkeys-hook";

// TODO: I created this file because firebase was initializing as null and it was breaking the app
const GamePage: FC<{
  game: Game;
  gameId: string;
  isMobile: boolean;
  streamToken: string;
}> = (props) => {
  const { streamToken, gameId } = props;
  const userId = useFirebaseUserId();

  // https://demystifying-rsc.vercel.app/client-components/no-ssr/
  // TODO: Revisit this, there's hydration errors caused by auth state
  const [isServer, setServer] = useState(true);
  useEffect(() => setServer(false), []);

  const { status, data: signInCheckResult } = useSigninCheck();

  // TODO: this is the conditional causing hydration error
  if (status === "loading" || isServer) {
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

  const ssrGame = props.game;

  return (
    <HotkeysProvider initiallyActiveScopes={["game"]}>
      <CardPreviewProvider>
        <YesOrNoModalProvider>
          <ConfirmationModalProvider>
            <NotificationProvider>
              <StreamChatProvider
                chatId={ssrGame.id}
                playerId={userId}
                players={Object.keys(ssrGame.tables || {})}
                streamToken={streamToken}
              >
                <GameLogProvider>
                  <GameStoreProvider
                    ssrGame={ssrGame}
                    gameId={props.gameId}
                    playerId={userId}
                  >
                    {/*We have a cyclic dependency here, GameProvider depends on TargetModalProvider that depends on GameProvider */}
                    <ScryModalProvider>
                      <TargetModalProvider>
                        <Lorcanito
                          game={ssrGame}
                          gameId={gameId}
                          isMobile={props.isMobile}
                        />
                      </TargetModalProvider>
                    </ScryModalProvider>
                  </GameStoreProvider>
                </GameLogProvider>
              </StreamChatProvider>
            </NotificationProvider>
          </ConfirmationModalProvider>
        </YesOrNoModalProvider>
      </CardPreviewProvider>
    </HotkeysProvider>
  );
};

export default GamePage;
