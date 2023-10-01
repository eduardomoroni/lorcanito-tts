import { Fragment, useRef, type FC, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { api } from "~/libs/api";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";

export const StartGameModal: FC<{
  lobbyId: string;
  wonDieRoll?: string | null;
  playerId: string;
  opponentId?: string;
}> = (props) => {
  const { wonDieRoll, playerId, lobbyId, opponentId } = props;
  console.log({ wonDieRoll, playerId, lobbyId, opponentId });
  const goingFirstButton = useRef(null);
  const isChoosingFirstPlayer = wonDieRoll === playerId;
  const startGameMutation = api.game.startGame.useMutation();
  const [submitted, setSubmitted] = useState(false);

  const startGame = async (playerGoingFirst: string) => {
    await startGameMutation.mutate({ gameId: lobbyId, playerGoingFirst });
    logAnalyticsEvent("start_game", {
      goingFirst: playerGoingFirst === playerId,
    });
    setSubmitted(true);
  };

  useEffect(() => {
    const randomTime = Math.floor(Math.random() * 12) * 15000;

    if (wonDieRoll) {
      setTimeout(() => {
        startGame(isChoosingFirstPlayer ? playerId : opponentId || playerId);
      }, 60000 + randomTime);
    }
  }, [wonDieRoll]);

  return (
    <Transition.Root show={!!wonDieRoll} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-20"
        initialFocus={goingFirstButton}
        onClose={() => {}}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative max-h-[80vh] transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h1"
                        className="text-3xl font-bold tracking-tight text-gray-900"
                      >
                        {isChoosingFirstPlayer
                          ? "You won the die roll!"
                          : "Your opponent won the die roll"}
                      </Dialog.Title>
                      <p className="mt-4 max-w-xl text-sm text-gray-700">
                        {isChoosingFirstPlayer
                          ? "You get to choose who goes first."
                          : "Your opponent gets to choose who goes first."}
                      </p>
                      {/*<div className="mt-4">TEXT</div>*/}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  {isChoosingFirstPlayer ? (
                    <>
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                        ref={goingFirstButton}
                        onClick={() => {
                          startGame(playerId);
                        }}
                      >
                        {startGameMutation.isLoading || submitted
                          ? "Loading...."
                          : "I want to go first (skip draw step)"}
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => {
                          startGame(opponentId || playerId);
                        }}
                      >
                        {startGameMutation.isLoading || submitted
                          ? "Loading...."
                          : "I want to go second (draw a card)"}
                      </button>
                    </>
                  ) : null}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
