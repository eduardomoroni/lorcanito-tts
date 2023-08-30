import React from "react";
import { HandRaisedIcon } from "@heroicons/react/20/solid";

export const PassTurnSection: React.FC<{
  isLoading: boolean;
  isMyTurn: boolean;
  onClick: () => void;
}> = ({ onClick, isLoading, isMyTurn }) => {
  if (isLoading) {
    return (
      <button
        type="button"
        disabled={true}
        className="inline-flex items-center gap-x-2 rounded-md bg-red-600 px-2.5 py-1.5 font-mono text-sm font-semibold leading-4 text-white opacity-50 shadow-sm transition duration-150 ease-in-out hover:bg-red-500 hover:opacity-75 focus-visible:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <HandRaisedIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
        LOADING...
      </button>
    );
  }

  if (!isMyTurn) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={
          "inline-flex items-center justify-center gap-x-2 bg-black px-2.5 py-1.5 font-mono text-sm font-semibold leading-4 text-white opacity-50 shadow-sm transition duration-150 ease-in-out hover:bg-red-500 hover:opacity-75 focus-visible:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        }
      >
        <>
          <HandRaisedIcon className="h-5 w-5" aria-hidden="true" />
          OPPONENT'S TURN
          <br />
          PLEASE WAIT...
        </>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "m-2 inline-flex items-center justify-center gap-x-2 rounded-md bg-green-600 px-2.5 py-1.5 font-mono text-sm font-semibold leading-4 text-white shadow-sm transition duration-150 ease-in-out hover:bg-green-500 hover:opacity-75 focus-visible:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      }
    >
      <>
        END YOUR TURN
        <br />
        [SPACE]
      </>
    </button>
  );
};
