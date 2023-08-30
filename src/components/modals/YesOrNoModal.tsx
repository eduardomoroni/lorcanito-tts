"use client";

import { Fragment, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useHotkeys, useHotkeysContext } from "react-hotkeys-hook";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
const scope = "yes_or_no_modal";

type Props = {
  title: string;
  text: string;
  onYes: () => void;
  onNo: () => void;
  setOpen: (open: boolean) => void;
  open: boolean;
};

export function YesOrNoModal(props: Props) {
  const { title, text, setOpen, onYes, onNo, open } = props;
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const { enableScope, disableScope } = useHotkeysContext();

  useEffect(() => {
    if (open) {
      enableScope(scope);
    } else {
      disableScope(scope);
    }
  }, [open]);

  const options = {
    scopes: [scope],
    preventDefault: true,
    enableOnFormTags: true,
    enabled: open,
  };
  useHotkeys(
    "enter",
    () => {
      logAnalyticsEvent("on_yes");
      setOpen(false);
      onYes();
    },
    options
  );
  useHotkeys(
    "esc",
    () => {
      logAnalyticsEvent("on_no");
      onNo();
      setOpen(false);
    },
    options
  );

  useEffect(() => {
    if (confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [confirmButtonRef, open]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={setOpen}>
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

        <div className="fixed inset-0 z-30 overflow-y-auto">
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{text}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    ref={confirmButtonRef}
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto"
                    onClick={() => {
                      onYes();
                      setOpen(false);
                    }}
                  >
                    Yes [Enter]
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => {
                      onNo();
                      setOpen(false);
                    }}
                  >
                    No [Esc]
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
