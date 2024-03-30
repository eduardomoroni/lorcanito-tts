import React from "react";
import { PassTurnSection } from "~/client/table/PassTurnSection";
import { useHotkeys } from "react-hotkeys-hook";
import { observer } from "mobx-react-lite";
import { useGameController } from "~/client/hooks/useGameController";

const ButtonComponent: React.FC<{
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

export function RightHandSideButtons() {
  const controller = useGameController();

  const myTurn = controller.isMyTurn;
  const passTurn = () => {
    controller.passTurn(controller.activePlayer);
  };

  useHotkeys("space", passTurn, {
    scopes: ["game"],
    preventDefault: true,
    enabled: myTurn,
    description: "Pass turn",
  });

  return (
    <div className="flex w-full flex-col self-end">
      <PassTurnSection
        isLoading={false}
        isMyTurn={myTurn}
        onClick={passTurn}
        gameStarted={controller.gameHasStarted}
      />
    </div>
  );
}

export const Button = observer(ButtonComponent);
