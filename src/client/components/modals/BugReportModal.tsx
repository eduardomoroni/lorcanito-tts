"use client";

import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { IconDiscord } from "~/client/components/DiscorIcon";
import { api } from "~/libs/api";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import { useGameStore } from "~/client/providers/GameStoreProvider";

type Props = {
  setOpen: (open: boolean) => void;
  open: boolean;
};

export function BugReportModal(props: Props) {
  const title = "Bug Report";

  const store = useGameStore();
  const game = store.toJSON();
  const { setOpen, open } = props;
  const { mutate: reportBug, isLoading } = api.settings.bugReport.useMutation();
  const whatHappenedRef = useRef<HTMLTextAreaElement>(null);
  const expectedRef = useRef<HTMLTextAreaElement>(null);
  const stepsToReproduceRef = useRef<HTMLTextAreaElement>(null);

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                    <div>
                      <div className="space-y-12">
                        <div className="border-b border-gray-900/10 pb-12">
                          <p className="mt-2 text-sm leading-6 text-gray-600">
                            Thanks for submitting a bug report, the team will
                            take a look at it ASAP. <br />
                            If you'd like to be notified when the bug is fixed,
                            please reach out to us on{" "}
                            <a
                              href="https://discord.gg/w7DzwKFN8M"
                              className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                            >
                              our discord server
                              <IconDiscord className="ml-1 inline" />
                            </a>
                          </p>

                          <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="col-span-full">
                              <label
                                htmlFor="about"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                What happened?
                              </label>
                              <div className="mt-2">
                                <textarea
                                  ref={whatHappenedRef}
                                  id="about"
                                  name="about"
                                  rows={3}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                              {/*<p className="mt-3 text-sm leading-6 text-gray-600">*/}
                              {/*  Write a few sentences about yourself.*/}
                              {/*</p>*/}
                            </div>

                            <div className="col-span-full">
                              <label
                                htmlFor="behaviour"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                What would be the expected behavior?
                              </label>
                              <div className="mt-2">
                                <textarea
                                  ref={expectedRef}
                                  id="behaviour"
                                  name="behaviour"
                                  rows={3}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>

                            <div className="col-span-full">
                              <label
                                htmlFor="reproduce"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                How to reproduce the issue?
                              </label>
                              <div className="mt-2">
                                <textarea
                                  ref={stepsToReproduceRef}
                                  id="reproduce"
                                  name="reproduce"
                                  rows={3}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                          type="button"
                          className="text-sm font-semibold leading-6 text-gray-900"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isLoading}
                          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          onClick={async () => {
                            await reportBug({
                              whatHappened:
                                whatHappenedRef.current?.value.trim(),
                              expected: expectedRef.current?.value.trim(),
                              reproduce:
                                stepsToReproduceRef.current?.value.trim(),
                              gameId: game.id,
                            });
                            logAnalyticsEvent("bug_report");
                            setOpen(false);
                          }}
                        >
                          {isLoading ? "Sending..." : "Send"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
