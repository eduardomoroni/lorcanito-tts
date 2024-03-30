import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import { observer } from "mobx-react-lite";
import { CardImage } from "~/client/components/image/CardImage";
import { api } from "~/libs/api";
import { LorcanitoCardImage } from "~/client/components/card/LorcanitoCardImage";

type Props = {
  ownerId: string;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
  open: boolean;
};

function AlterHandModalComponent(props: Props) {
  const { ownerId } = props;

  const store = useGameStore();
  const [isLoading] = useState(false);
  const { setOpen, open, onConfirm } = props;
  const playerHand = store.tableStore.getPlayerZoneCards(ownerId, "hand");
  const [cardsToMulligan, setCardsToMulligan] = useState<string[]>([]);
  const alterHandMutation = api.moves.alterHand.useMutation();

  const toggleCardToKeep = (card: string) => {
    setCardsToMulligan((cards) => {
      if (cards.includes(card)) {
        return cards.filter((c) => c !== card);
      }
      return [...cards, card];
    });
  };

  const takeMulligan = () => {
    alterHandMutation.mutate({
      gameId: store.id,
      cardsToMulligan,
    });
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
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
              <Dialog.Panel className="relative max-w-[80%] transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h1"
                      className="text-3xl font-bold tracking-tight text-gray-900"
                    >
                      Altering Hand
                    </Dialog.Title>
                    <p className="mt-4 text-sm text-gray-700">
                      Select the cards you want to move to the bottom of the
                      deck
                    </p>
                    <div className="mt-2">
                      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                        <div
                          data-testid="alter-hand-cards"
                          className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
                        >
                          {playerHand.map((card, index) => {
                            const keep = !cardsToMulligan.includes(
                              card.instanceId,
                            );

                            return (
                              <LorcanitoCardImage
                                card={card}
                                index={index}
                                key={card.instanceId}
                                zone={"deck"}
                                grow="vertical"
                                className={keep ? "rounded-lg" : " grayscale"}
                                onClick={() => {
                                  toggleCardToKeep(card.instanceId);
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    disabled={isLoading}
                    onClick={() => {
                      takeMulligan();
                      onConfirm();
                    }}
                  >
                    {alterHandMutation.isLoading
                      ? "Loading..."
                      : "Alter Hand and Draw new cards"}
                  </button>
                  {alterHandMutation.error && (
                    <p className="mt-2 text-sm text-red-600">
                      {alterHandMutation.error.message}
                    </p>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export const AlterHandModal = observer(AlterHandModalComponent);
