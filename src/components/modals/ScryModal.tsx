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
import { LorcanaCardImage } from "~/components/card/LorcanaCardImage";
import { useGameController } from "~/engine/rule-engine/lib/GameControllerProvider";
import { useGameLogger } from "~/spaces/Log/game-log/GameLogProvider";

type Props = {
  onClose: () => void;
  open: boolean;
  cards: string[];
};

export function ScryModal(props: Props) {
  const { onClose, open, cards } = props;
  const logger = useGameLogger();
  const [scry, setScry] = useState({ top: cards, bottom: [] as string[] });
  const engine = useGameController();

  const toBottom = (card: string) => {
    if (scry.bottom.includes(card)) {
      return;
    }
    const top = scry.top.filter((c) => c !== card);
    const bottom = [...scry.bottom, card];
    setScry({ top, bottom });
  };

  const toTop = (card: string) => {
    if (scry.top.includes(card)) {
      return;
    }
    const bottom = scry.bottom.filter((c) => c !== card);
    const top = [card, ...scry.top];
    setScry({ top, bottom });
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

  function CardImage(props: { card: string; top?: boolean }) {
    const iconStyle =
      "absolute h-12 w-12 cursor-pointer rounded bg-black text-slate-100 opacity-25 group-hover:opacity-100 transition-opacity duration-300";

    return (
      <div className="group relative mx-1 flex aspect-card-image-only h-48">
        <LorcanaCardImage
          imageOnly
          instanceId={props.card}
          className="cursor-auto"
        />

        {/*<span className="absolute h-12 w-12 bg-black text-center align-middle text-xl text-slate-100">*/}
        {/*  1*/}
        {/*</span>*/}
        {props.top ? (
          <ChevronDoubleDownIcon
            className={iconStyle + " bottom-0 right-1/2 translate-x-1/2"}
            onClick={() => toBottom(props.card)}
            aria-hidden="true"
          />
        ) : (
          <ChevronDoubleUpIcon
            className={iconStyle + " right-1/2 top-0 translate-x-1/2"}
            onClick={() => toTop(props.card)}
            aria-hidden="true"
          />
        )}

        <ChevronDoubleLeftIcon
          className={iconStyle + " left-0 top-1/2 -translate-y-1/2"}
          onClick={() => toLeft(props.card)}
          aria-hidden="true"
        />
        <ChevronDoubleRightIcon
          className={iconStyle + " right-0 top-1/2 -translate-y-1/2"}
          onClick={() => toRight(props.card)}
          aria-hidden="true"
        />
      </div>
    );
  }

  // TODO: Create a command for this
  const onConfirmScry = () => {
    engine.scry(scry.top, scry.bottom);
    logger.log({
      type: "SCRY",
      bottom: scry.bottom.length,
      top: scry.top.length,
    });

    onClose();
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
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
                    >{`Scry ${cards.length} - Put the cards on the top and/or bottom in any
                      order`}</Dialog.Title>
                  </div>
                </div>
                <h2 className="mt-4 truncate text-end text-base font-medium leading-7 text-slate-900">
                  Top (First to the right) →
                </h2>
                <Well className="justify-end">
                  {scry.top.map((card) => (
                    <CardImage
                      key={card}
                      card={card}
                      top={scry.top.includes(card)}
                    />
                  ))}
                </Well>
                <h2 className="mt-4 truncate text-base font-medium leading-7 text-slate-900">
                  ← Bottom (Last to the left)
                </h2>
                <Well>
                  {scry.bottom.map((card) => (
                    <CardImage key={card} card={card} />
                  ))}
                </Well>
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
