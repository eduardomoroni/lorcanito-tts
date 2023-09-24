import { PassTurnSection } from "~/spaces/table/PassTurnSection";
import React from "react";
import { usePreGame } from "~/providers/PreGameProvider";
import { useTurn } from "~/engine/GameProvider";
import { useHotkeys } from "react-hotkeys-hook";
import { useGameStore } from "~/engine/lib/GameStoreProvider";

type Props = {
  playerHand: string[];
};

export const Button: React.FC<{
  color: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}> = ({ children, onClick, color, disabled }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${color} my-2 inline-flex items-center justify-center gap-x-2 rounded-md px-2.5 py-1.5 py-4 font-mono text-sm font-semibold leading-4 text-white opacity-50 shadow-sm transition duration-150 ease-in-out hover:bg-indigo-500 hover:opacity-75 focus-visible:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
    >
      {children}
    </button>
  );
};

export function RighHandSideButtons() {
  const {
    passTurn,
    readyToStart,
    isReadyToStartLoading,
    isPassingTurn,
    isMyTurn,
  } = useTurn();
  const store = useGameStore();

  useHotkeys("space", passTurn, {
    scopes: ["game"],
    // TODO: This can be risky, if the user is typing in a text field, the spacebar will trigger the pass turn action
    preventDefault: true,
    // enableOnFormTags: true,
    enabled: isMyTurn && !isPassingTurn,
    description: "Pass turn",
  });

  const { playerIsReadyToStart, playerHasJoined, playerHasLoadedDeck } =
    usePreGame();

  let content = (
    <PassTurnSection
      isLoading={isPassingTurn}
      isMyTurn={isMyTurn}
      onClick={() => {
        store.passTurn(store.activePlayer);
      }}
    />
  );

  if (!playerHasJoined) {
    content = (
      <div className="flex flex-col rounded bg-black p-2 text-white opacity-75">
        <h2 className="text-center text-xl">You're watching this game</h2>
        <h2 className="text-center text-slate-300">
          You can join by going to game settings and clicking the "Join Game"
          button.
        </h2>
      </div>
    );
  } else if (!playerHasLoadedDeck) {
    content = (
      <div className="flex flex-col rounded bg-black p-2 text-white opacity-75">
        <h2 className="text-center text-xl">Load your deck</h2>
        <h2 className="text-center text-slate-300">
          In order to start the game, you need to load your deck. Go to game
          settings and click the "Load Deck" button.
        </h2>
      </div>
    );
  } else if (!playerIsReadyToStart) {
    content = (
      <>
        <Button
          color="bg-green-600"
          onClick={() => readyToStart(false)}
          disabled={isReadyToStartLoading}
        >
          {isReadyToStartLoading ? "Loading" : "I'M READY"}
        </Button>
      </>
    );
  }

  return <div className="flex w-full flex-col self-end">{content}</div>;
}
