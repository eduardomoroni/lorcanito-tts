import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CardImage } from "~/spaces/components/card/CardImage";
import { useGameStore } from "~/engine/lib/GameStoreProvider";
import { observer } from "mobx-react-lite";

type Props = {
  ownerId: string;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
  open: boolean;
};

function AlterHandModalComponent(props: Props) {
  const { ownerId } = props;

  const store = useGameStore();
  const [isLoading, setIsLoading] = useState(false);
  const { setOpen, open, onConfirm } = props;
  const playerHand = store.tableStore.getPlayerZoneCards(ownerId, "hand");
  const [cardsToMulligan, setCardsToMulligan] = useState<string[]>([]);

  const toggleCardToKeep = (card: string) => {
    setCardsToMulligan((cards) => {
      if (cards.includes(card)) {
        return cards.filter((c) => c !== card);
      }
      return [...cards, card];
    });
  };

  const takeMulligan = () => {
    try {
      store.alterHand(cardsToMulligan, ownerId);
      setOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
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
                  {/*<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">*/}
                  {/*  <CheckIcon*/}
                  {/*    className="h-6 w-6 text-green-600"*/}
                  {/*    aria-hidden="true"*/}
                  {/*  />*/}
                  {/*</div>*/}
                  <div className="mt-3 text-center sm:mt-5">
                    {/*<Dialog.Title*/}
                    {/*  as="h3"*/}
                    {/*  className="text-base font-semibold leading-6 text-gray-900"*/}
                    {/*>*/}
                    {/*  Payment successful*/}
                    {/*</Dialog.Title>*/}
                    <div className="mt-2">
                      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                        <h2 className="text-xl font-bold text-gray-900">
                          Altering your hand
                        </h2>

                        <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
                          {playerHand.map((card) => {
                            const keep = !cardsToMulligan.includes(
                              card.instanceId
                            );
                            return (
                              <div
                                key={card.instanceId}
                                onClick={() =>
                                  toggleCardToKeep(card.instanceId)
                                }
                              >
                                <div className="relative aspect-card h-72 w-full overflow-hidden rounded-lg">
                                  <CardImage
                                    key={card.instanceId}
                                    card={card}
                                    zone="hand"
                                    className={
                                      "h-full w-full object-cover object-center" +
                                      (keep ? "" : " grayscale")
                                    }
                                  />
                                  {/*{!keep && (*/}
                                  {/*  <div className="absolute inset-x-0 top-0 mb-4 flex aspect-card h-72 items-end justify-end overflow-hidden rounded-lg p-4">*/}
                                  {/*    <div*/}
                                  {/*      aria-hidden="true"*/}
                                  {/*      // className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black opacity-50"*/}
                                  {/*      className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black opacity-50"*/}
                                  {/*    />*/}
                                  {/*    <p className="relative text-lg font-semibold text-white">*/}
                                  {/*      Not keeping*/}
                                  {/*    </p>*/}
                                  {/*  </div>*/}
                                  {/*)}*/}
                                </div>
                                <div>
                                  <a className="relative flex cursor-pointer items-center justify-center rounded-md border border-transparent bg-gray-100 px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200">
                                    {keep
                                      ? "Don't keep this card"
                                      : "Keep this card"}
                                  </a>
                                </div>
                              </div>
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
                    {isLoading ? "Loading..." : "Alter Hand and Draw new cards"}
                  </button>
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
