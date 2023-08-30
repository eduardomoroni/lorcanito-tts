import React, { type FC, useEffect } from "react";
import GameChat from "~/components/messaging/GameChat";
import { RighHandSideButtons } from "~/spaces/table/RightHandSideButtons/RighHandSideButtons";
import { useConfirmationModal } from "~/providers/ConfirmationModalProvider";
import { useTurn } from "~/engine/GameProvider";
import { api } from "~/utils/api";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import { useRouter } from "next/navigation";
import { useGameLobby } from "~/providers/lobby/GameLobbyProvider";

// https://www.contus.com/blog/best-chat-sdk/
export const SideBar: FC<{
  gameId: string;
}> = (props) => {
  const confirm = useConfirmationModal(
    "Welcome to Lorcanito!",
    "This is a work in progress. Please report any bugs on Discord. Most of the game interactions are based on dragging and dropping cards, left and right click."
  );
  const [lobby] = useGameLobby();
  const router = useRouter();
  const { restartGame } = useTurn();

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
        "This might mean your opponent left the game. Would you like to navigate back to lobby?"
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
      console.error(e);
    }
  };

  return (
    <div
      className={`h-full w-1/5 rounded border border-solid border-slate-700 bg-gray-900 shadow-lg`}
    >
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
                  "Are you sure you want to restart the game?"
                );
              }}
              className="relative inline-flex items-center rounded-l-md bg-slate-200 px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
            >
              Restart Game
            </button>
            {/*<button*/}
            {/*  type="button"*/}
            {/*  className="relative -ml-px inline-flex items-center bg-slate-200 px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"*/}
            {/*>*/}
            {/*  Game Settings*/}
            {/*</button>*/}
            <button
              type="button"
              onClick={async () => {
                confirm(
                  backToLobby,
                  "Back to lobby",
                  "Are you sure? You and your opponent are going to be redirected to game lobby, and the current game state will be lost. You will be able to start a new match. Would you like to proceed?"
                );
              }}
              className="relative -ml-px inline-flex items-center rounded-r-md bg-slate-200 px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
            >
              Back to lobby (concede)
            </button>
          </span>
        </div>
        <RighHandSideButtons />
      </div>
      <div className={`h-1/2 w-full`}>
        <GameChat />
      </div>
    </div>
  );
};
