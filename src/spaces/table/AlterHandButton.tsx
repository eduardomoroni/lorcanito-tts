import React from "react";
import { Square2StackIcon } from "@heroicons/react/20/solid";

export const AlterHandButton: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="mt-2 inline-flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-2.5 py-1.5 font-mono text-sm font-semibold leading-4 text-white opacity-50 shadow-sm transition duration-150 ease-in-out hover:bg-indigo-500 hover:opacity-75 focus-visible:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
  >
    <Square2StackIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
    ALTER <br /> HAND
  </button>
);
