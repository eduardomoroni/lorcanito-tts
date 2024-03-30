"use client";

import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
} from "@heroicons/react/24/solid";
import { CardImage } from "~/client/components/image/CardImage";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import { observer } from "mobx-react-lite";
import type { ScryEffect, ResolvingParam, CardModel } from "@lorcanito/engine";
import { useSendNotification } from "~/client/providers/NotificationProvider";
import { useSetCardPreview } from "~/client/providers/CardPreviewProvider";
import { notEmptyPredicate } from "@lorcanito/engine";

type Props = {
  onClose: (param?: ResolvingParam["scry"]) => void;
  open: boolean;
  shouldReveal?: boolean;
  scryCount: number;
  mode: ScryEffect["mode"];
  tutorFilters?: ScryEffect["tutorFilters"];
  limits?: ScryEffect["limits"];
  title?: string;
  subtitle?: string;
};

function ScryModalComponent(props: Props) {
  const {
    shouldReveal,
    onClose,
    open,
    scryCount,
    mode,
    tutorFilters,
    limits,
    title,
    subtitle,
  } = props;
  const mobXRootStore = useGameStore();
  const sendNotification = useSendNotification();
  const player = mobXRootStore.activePlayer;
  const cards = mobXRootStore.tableStore
    .getPlayerZone(player, "deck")
    ?.cards.map((c) => c.instanceId)
    .slice(-scryCount);
  const modalTitle = title || `Looking at top ${cards.length} cards`;
  const modalSubtitle = subtitle || "Choose the order of the cards";
  const [scry, setScry] = useState(
    mode === "bottom"
      ? { bottom: cards, top: [] as string[], hand: [] as string[] }
      : { top: cards, bottom: [] as string[], hand: [] as string[] },
  );

  const store = mobXRootStore;

  const selectCard = (card: string) => {
    if (!tutorFilters) {
      return;
    }

    let hand = scry.hand;
    let top = scry.top.filter((c) => c !== card);
    let bottom = scry.bottom.filter((c) => c !== card);

    if (scry.hand.includes(card)) {
      hand = scry.hand.filter((c) => c !== card);

      if (mode === "bottom") {
        bottom = [...scry.bottom, card];
      } else {
        top = [card, ...scry.top];
      }
    } else {
      if (!store.cardStore.getCard(card)?.isValidTarget(tutorFilters)) {
        sendNotification({
          type: "icon",
          title: "Invalid target card",
          message: `The card you chose is not a valid target for this effect.`,
          icon: "warning",
          autoClear: true,
        });
        return;
      }

      hand = [...scry.hand, card];
    }

    setScry({ top, bottom, hand });
  };

  const toBottom = (card: string) => {
    if (scry.bottom.includes(card)) {
      return;
    }
    const top = scry.top.filter((c) => c !== card);
    const bottom = [...scry.bottom, card];
    const hand: string[] = [];
    setScry({ top, bottom, hand });
  };

  const toTop = (card: string) => {
    if (scry.top.includes(card)) {
      return;
    }
    const bottom = scry.bottom.filter((c) => c !== card);
    const top = [card, ...scry.top];
    const hand: string[] = [];
    setScry({ top, bottom, hand });
  };

  const toLeft = (card: string) => {
    if (scry.top.includes(card)) {
      const index = scry.top.indexOf(card);
      if (index > 0) {
        setScry({ ...scry, top: moveLeft(scry.top, index) });
      }
    }

    if (scry.bottom.includes(card)) {
      const index = scry.bottom.indexOf(card);
      if (index > 0) {
        setScry({ ...scry, bottom: moveLeft(scry.bottom, index) });
      }
    }
  };

  const toRight = (card: string) => {
    if (scry.top.includes(card)) {
      const index = scry.top.indexOf(card);
      if (index < scry.top.length - 1) {
        setScry({ ...scry, top: moveRight(scry.top, index) });
      }
    }

    if (scry.bottom.includes(card)) {
      const index = scry.bottom.indexOf(card);
      if (index < scry.bottom.length - 1) {
        setScry({ ...scry, bottom: moveRight(scry.bottom, index) });
      }
    }
  };

  function Card(props: { card: string; top?: boolean }) {
    const { card } = props;
    const iconStyle =
      "absolute h-12 w-12 cursor-pointer rounded bg-black text-slate-100 opacity-25 group-hover:opacity-100 transition-opacity duration-300";
    const selected = scry.hand.includes(props.card);
    const setCardPreview = useSetCardPreview();
    const store = useGameStore();
    const lorcanitoCard = store.cardStore.getCard(card)?.lorcanitoCard;

    return (
      <div
        onMouseEnter={() => setCardPreview({ card: lorcanitoCard })}
        onMouseLeave={() => setCardPreview(undefined)}
        onClick={() => {
          selectCard(card);
        }}
        className="group relative mx-1 flex aspect-card-image-only h-48"
      >
        <CardImage
          imageOnly
          cardSet={lorcanitoCard?.set}
          cardNumber={lorcanitoCard?.number}
          className="cursor-auto"
        />

        {tutorFilters && !selected ? (
          <button className="absolute top-1/2 -translate-y-1/2 translate-x-1/2 cursor-pointer rounded border-2 border-black font-mono text-4xl font-extrabold tracking-tight text-gray-900 opacity-25 hover:bg-slate-400 hover:bg-opacity-50 group-hover:opacity-100">
            CHOOSE
          </button>
        ) : null}

        {tutorFilters && selected ? (
          <span className="absolute top-1/2 -translate-y-1/2 translate-x-1/2 cursor-pointer rounded border-2 border-black bg-slate-200 bg-opacity-50 font-mono text-4xl font-extrabold tracking-tight text-gray-900 hover:bg-opacity-50 group-hover:opacity-100">
            CHOSEN
          </span>
        ) : null}

        {props.top && mode === "both" ? (
          <ChevronDoubleDownIcon
            className={iconStyle + " bottom-0 right-1/2 translate-x-1/2"}
            onClick={() => toBottom(card)}
            aria-hidden="true"
          />
        ) : null}

        {!props.top && mode === "both" ? (
          <ChevronDoubleUpIcon
            className={iconStyle + " right-1/2 top-0 translate-x-1/2"}
            onClick={() => toTop(card)}
            aria-hidden="true"
          />
        ) : null}

        <ChevronDoubleLeftIcon
          className={iconStyle + " left-0 top-1/2 -translate-y-1/2"}
          onClick={() => toLeft(card)}
          aria-hidden="true"
        />
        <ChevronDoubleRightIcon
          className={iconStyle + " right-0 top-1/2 -translate-y-1/2"}
          onClick={() => toRight(card)}
          aria-hidden="true"
        />
      </div>
    );
  }

  const onConfirmScry = () => {
    const top = scry.top
      .map((card) => store.cardStore.getCard(card))
      .filter(notEmptyPredicate);
    const bottom = scry.bottom
      .map((card) => store.cardStore.getCard(card))
      .filter(notEmptyPredicate);
    const hand: CardModel[] = scry.hand
      .map((card) => store.cardStore.getCard(card))
      .filter(notEmptyPredicate);

    if (limits?.bottom && scry.bottom?.length > limits.bottom) {
      sendNotification({
        type: "icon",
        title: `You can put at maximum ${limits.bottom} cards in the bottom.`,
        message: ``,
        icon: "warning",
        autoClear: true,
      });
      return;
    }

    if (limits?.top && scry.top?.length > limits.top) {
      sendNotification({
        type: "icon",
        title: `You can put at maximum ${limits.top} cards in the top.`,
        message: ``,
        icon: "warning",
        autoClear: true,
      });
      return;
    }

    if (limits?.hand && scry.hand?.length > limits.hand) {
      sendNotification({
        type: "icon",
        title: `You can put at maximum ${limits.hand} cards in the hand.`,
        message: ``,
        icon: "warning",
        autoClear: true,
      });
      return;
    }

    onClose({
      top,
      bottom,
      hand,
      tutorFilters,
      limits,
      shouldRevealTutored: shouldReveal,
    });
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => onClose()}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-75"
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => onClose()}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      {modalTitle}
                    </Dialog.Title>
                    <p className="mt-4 text-sm text-gray-700">
                      {modalSubtitle}
                    </p>
                  </div>
                </div>
                {mode === "both" || mode === "top" ? (
                  <>
                    <h2 className="mt-4 truncate text-end text-base font-medium leading-7 text-slate-900">
                      Top (First to the right) →
                    </h2>
                    <Well className="justify-end">
                      {scry.top.map((card) => (
                        <Card
                          key={card}
                          card={card}
                          top={scry.top.includes(card)}
                        />
                      ))}
                    </Well>
                  </>
                ) : null}
                {mode === "both" || mode === "bottom" ? (
                  <>
                    <h2 className="mt-4 truncate text-base font-medium leading-7 text-slate-900">
                      ← Bottom (Last to the left)
                    </h2>
                    <Well>
                      {scry.bottom.map((card) => (
                        <Card key={card} card={card} />
                      ))}
                    </Well>
                  </>
                ) : null}
                {scry.hand.length ? (
                  <>
                    <h2 className="mt-4 truncate text-base font-medium leading-7 text-slate-900">
                      Put in hand
                    </h2>
                    <Well>
                      {scry.hand.map((card) => (
                        <Card key={card} card={card} />
                      ))}
                    </Well>
                  </>
                ) : null}
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto"
                    onClick={() => {
                      onConfirmScry();
                    }}
                  >
                    Confirm
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

function Well(props: { children: React.ReactNode; className?: string }) {
  return (
    <div className={"min-w-full overflow-hidden rounded-lg bg-gray-200"}>
      <div
        className={
          "flex min-h-[12rem] w-full flex-row overflow-y-auto px-1 py-2 " +
          props.className
        }
      >
        {props.children}
      </div>
    </div>
  );
}

// given an array of string, move the element to the left
function moveLeft<T>(arr: T[], index: number) {
  const copy = [...arr];
  const [removed] = copy.splice(index, 1);
  if (removed) {
    copy.splice(index - 1, 0, removed);
  }
  return copy;
}

// given an array of string, move the element to the right
function moveRight<T>(arr: T[], index: number) {
  const copy = [...arr];
  const [removed] = copy.splice(index, 1);
  if (removed) {
    copy.splice(index + 1, 0, removed);
  }
  return copy;
}

export const ScryModal = observer(ScryModalComponent);
