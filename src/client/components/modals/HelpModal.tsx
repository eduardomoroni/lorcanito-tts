"use client";

import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { IconDiscord } from "~/client/components/DiscorIcon";

type Props = {
  setOpen: (open: boolean) => void;
  open: boolean;
};
const posts = [
  {
    id: 1,
    title: "Basic Interactions",
    href: "#",
    description:
      "Left click, Right click and Drag & Drop are the basic interaction in the game, the game is currently in manual mode, so you have to do most of the things manually. We're working on the auto mode, so stay tuned!",
    date: "Mar 16, 2020",
    datetime: "2020-03-16",
    category: { title: "Marketing", href: "#" },
    author: {
      name: "Michael Foster",
      role: "Co-Founder / CTO",
      href: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  },
  // More posts...
];

export default function Content() {
  return (
    <div className="">
      <div className="mx-auto max-w-2xl">
        <div className="mt-6 space-y-16 border-t border-gray-200 pt-6 ">
          {posts.map((post) => (
            <article
              key={post.id}
              className="flex max-w-xl flex-col items-start justify-between"
            >
              <div className="flex items-center gap-x-4 text-xs">
                {/*<time dateTime={post.datetime} className="text-gray-500">*/}
                {/*  {post.date}*/}
                {/*</time>*/}
                {/*<a*/}
                {/*  href={post.category.href}*/}
                {/*  className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"*/}
                {/*>*/}
                {/*  {post.category.title}*/}
                {/*</a>*/}
              </div>
              <div className="group relative">
                <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                  <a href={post.href}>
                    <span className="absolute inset-0" />
                    {post.title}
                  </a>
                </h3>
                <p className="mt-5 text-sm leading-6 text-gray-600">
                  {post.description}
                </p>
              </div>
              {/*<div className="relative mt-8 flex items-center gap-x-4">*/}
              {/*  <img*/}
              {/*    src={post.author.imageUrl}*/}
              {/*    alt=""*/}
              {/*    className="h-10 w-10 rounded-full bg-gray-50"*/}
              {/*  />*/}
              {/*  <div className="text-sm leading-6">*/}
              {/*    <p className="font-semibold text-gray-900">*/}
              {/*      <a href={post.author.href}>*/}
              {/*        <span className="absolute inset-0" />*/}
              {/*        {post.author.name}*/}
              {/*      </a>*/}
              {/*    </p>*/}
              {/*    <p className="text-gray-600">{post.author.role}</p>*/}
              {/*  </div>*/}
              {/*</div>*/}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HelpModal(props: Props) {
  const { setOpen, open } = props;

  const title = "Help";

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
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
          <div className="max-h[60%] min-w[80%] flex items-end justify-center p-4 text-center sm:items-center sm:p-0">
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
                    <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Help
                      </h2>
                      {/*<p className="mt-2 text-lg leading-8 text-gray-600">*/}
                      {/*  Learn how to grow your business with our expert advice.*/}
                      {/*</p>*/}
                    </Dialog.Title>
                    <div>
                      <div className="space-y-12">
                        <div className="">
                          <p className="mt-2 text-sm leading-6 text-gray-600">
                            We will explain briefly about game interactions, if
                            you'd like to ask for a new feature please reach out
                            to us on{" "}
                            <a
                              href="https://discord.gg/w7DzwKFN8M"
                              className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                            >
                              our discord server
                              <IconDiscord className="ml-1 inline" />
                            </a>
                            <br />
                            This modal will be update once new features are
                            introduce, so make sure to check this out regularly
                          </p>
                        </div>
                      </div>

                      {<Content />}

                      <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                          type="button"
                          className="text-sm font-semibold leading-6 text-gray-900"
                        >
                          Close Modal
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
