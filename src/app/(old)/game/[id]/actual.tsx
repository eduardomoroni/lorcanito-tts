"use client";

import React, { type FC, useEffect, useState } from "react";
import { useFirebaseUserId } from "~/3rd-party/firebase/FirebaseSessionProvider";
import { useSigninCheck } from "reactfire";
import type { Game } from "~/libs/game";
import { Lorcanito } from "./Lorcanito";
import { GameStoreProvider } from "~/engine/rule-engine/lib/GameStoreProvider";
import { GameProvider } from "~/engine/GameProvider";
import { StreamChatProvider } from "~/providers/stream-chat-provider/StreamChatProvider";
import { GameLogProvider } from "~/spaces/Log/game-log/GameLogProvider";
import { NotificationProvider } from "~/providers/NotificationProvider";
import { YesOrNoModalProvider } from "~/providers/YesOrNoModalProvider";
import { ConfirmationModalProvider } from "~/providers/ConfirmationModalProvider";
import { TargetModalProvider } from "~/providers/TargetModalProvider";
import { ScryModalProvider } from "~/providers/ScryModalProvider";

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
              <GameProvider ssrGame={ssrGame} playerId={userId}>
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
              </GameProvider>
            </GameLogProvider>
          </StreamChatProvider>
        </NotificationProvider>
      </ConfirmationModalProvider>
    </YesOrNoModalProvider>
  );
};

export default GamePage;
