import React, { type FC, useEffect } from "react";
import GameChat from "~/client/components/messaging/GameChat";
import { RightHandSideButtons } from "~/client/table/RightHandSideButtons/RightHandSideButtons";
import { useConfirmationModal } from "~/client/providers/ConfirmationModalProvider";
import { api } from "~/libs/api";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import { useRouter } from "next/navigation";
import { useGameLobby } from "~/client/providers/lobby/GameLobbyProvider";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import {
  PreviewCard,
  usePreviewCard,
} from "~/client/providers/CardPreviewProvider";
import * as Sentry from "@sentry/nextjs";

export const SideBar: FC<{
  gameId: string;
}> = (props) => {
  const confirm = useConfirmationModal(
    "Welcome to Lorcanito!",
    "This is a work in progress. Please report any bugs on Discord. Most of the game interactions are based on dragging and dropping cards, left and right click.",
  );
  const [lobby] = useGameLobby();
  const router = useRouter();
  const store = useGameStore();

  const restartGameMutation = api.game.restartGame.useMutation();
  const undoTurnMutation = api.moves.undoTurn.useMutation();
  const undoTurn = async () => {
    try {
      logAnalyticsEvent("undo", {
        gameId: store.id,
        playerId: store.activePlayer,
      });
      await undoTurnMutation.mutateAsync({
        gameId: store.id,
        playerId: store.activePlayer,
      });
    } catch (e) {
      Sentry.captureException(e);
      console.error(e);
    }
  };
  const restartGame = () => {
    restartGameMutation.mutate({ gameId: store.id });
    logAnalyticsEvent("restart_game", { gameId: store.id });
    // TODO: refresh both browsers
  };
  const previewCard = usePreviewCard();
  const backToLobbyMutation = api.game.backToLobby.useMutation();

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      return;
    }
    confirm(() => {});
  }, []);

  useEffect(() => {
    if (lobby && !lobby.gameStarted) {
      confirm(
        () => {
          logAnalyticsEvent("navigated_back_to_lobby");
          router.push(`/lobby/${lobby.id}`);
        },
        "Lobby is open",
        "This means your opponent left the game. Would you like to navigate back to lobby?",
      );
    }
  }, [lobby?.gameStarted]);

  const backToLobby = async () => {
    try {
      await backToLobbyMutation.mutateAsync({
        gameId: props.gameId,
      });
      router.push(`/lobby/${props.gameId}`);
      logAnalyticsEvent("back_to_lobby");
    } catch (e) {
      Sentry.captureException(e);
      console.error(e);
    }
  };

  return (
    <div
      className={`relative h-full w-1/5 rounded border border-solid border-slate-700 bg-gray-900 shadow-lg`}
    >
      {previewCard ? (
        <div className={"absolute aspect-card w-full"}>
          <PreviewCard card={previewCard} />
        </div>
      ) : null}
      <div className={`flex h-1/2 w-full flex-col justify-between`}>
        <div className={`flex items-center justify-center`}>
          <span className="isolate mt-2 inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => {
                confirm(
                  () => {
                    restartGame();
                  },
                  "Restart Game",
                  "Are you sure you want to restart the game?",
                );
              }}
              className="relative inline-flex items-center rounded-l-md bg-slate-200 px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
            >
              Restart Game
            </button>
            <button
              type="button"
              className="relative -ml-px inline-flex items-center bg-slate-200 px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
              onClick={() => {
                confirm(
                  () => {
                    undoTurn();
                  },
                  "Undo turn",
                  "Are you sure you want to restart the turn? This would effectively undo all the actions you took this turn. You will be able to start a new turn. Would you like to proceed?",
                );
              }}
            >
              Undo Turn
            </button>
            <button
              type="button"
              onClick={async () => {
                confirm(
                  backToLobby,
                  "Back to lobby",
                  "Are you sure? You and your opponent are going to be redirected to game lobby, and the current game state will be lost. You will be able to start a new match. Would you like to proceed?",
                );
              }}
              className="relative -ml-px inline-flex items-center rounded-r-md bg-slate-200 px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
            >
              Back to lobby (concede)
            </button>
          </span>
        </div>
        <RightHandSideButtons />
      </div>
      <div className={`h-1/2 w-full`}>
        <GameChat />
      </div>
    </div>
  );
};
