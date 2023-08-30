import { ZoneOverlay } from "~/components/ZoneOverlay";
import React, { FC, useEffect } from "react";
import { useTurn } from "~/engine/GameProvider";
import { LorcanaCardImage } from "~/components/card/LorcanaCardImage";
import { useCardPreview } from "~/providers/CardPreviewProvider";
import { useHotkeys, useHotkeysContext } from "react-hotkeys-hook";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import {
  useGame,
  useGameController,
} from "~/engine/rule-engine/lib/GameControllerProvider";

// The game does not have a stack, but I want to add one.
export const StackZoneArena: FC = () => {
  const [game] = useGame();
  const engine = useGameController();
  const { turnPlayer, activePlayer } = useTurn();
  const cards: string[] = (game.tables?.[turnPlayer]?.zones?.play || []).filter(
    (card: string) => engine.findLorcanitoCard(card)?.type === "action"
  );
  const setCardPreview = useCardPreview();
  const ref = React.useRef<HTMLDivElement>(null);

  const { enableScope, disableScope } = useHotkeysContext();

  const resolveStack = () => {
    cards.forEach((card, index) => {
      window.setTimeout(() => {
        engine.moveCard({
          instanceId: card,
          from: "play",
          to: "discard",
          position: "last",
        });
      }, 200 * (index + 1));
    });
  };

  useEffect(() => {
    if (cards.length) {
      enableScope("stack");
    } else {
      disableScope("stack");
    }
  }, [!!cards.length]);

  return (
    <div className={`flex h-full w-full grow overflow-y-auto rounded-lg p-1`}>
      {turnPlayer === activePlayer ? (
        <>
          <Hotkey ref={ref} hotKey={"ESC"} onHotkey={resolveStack} />
          <div
            className="z-10 flex h-full -rotate-180 cursor-pointer select-none flex-col items-center justify-center rounded bg-green-800 px-2 font-mono text-xl font-bold text-white underline hover:bg-green-500"
            onClick={resolveStack}
            style={{ writingMode: "vertical-rl" }}
          >
            <span>ACTIONS </span>
            <span> RESOLVED</span>
          </div>
        </>
      ) : null}

      {cards.map((card) => {
        const lorcanitoCard = engine.findLorcanitoCard(card);
        return (
          <div
            key={card}
            className={`z-10 mx-1`}
            onMouseEnter={() => {
              setCardPreview({ instanceId: card });
            }}
            onMouseLeave={() => setCardPreview(undefined)}
          >
            <LorcanaCardImage
              key={card}
              card={lorcanitoCard}
              fill={undefined}
              width={108}
              height={150}
            />
          </div>
        );
      })}
      <ZoneOverlay>Stack Area</ZoneOverlay>
    </div>
  );
};

export function Hotkey(props: {
  ref: React.RefObject<HTMLDivElement>;
  hotKey: string;
  onHotkey: () => void;
}) {
  const { hotKey, ref, onHotkey } = props;

  useHotkeys(
    "esc",
    () => {
      logAnalyticsEvent("close_stack_zone");
      onHotkey();
    },
    {
      scopes: ["stack"],
      // TODO: This can be risky, if the user is typing in a text field,
      preventDefault: true,
      // enableOnFormTags: true,
      description: "Close Stack Zone",
      enabled: true,
    }
  );

  return (
    <div
      className={`absolute -right-0.5 -top-0.5 z-20 flex select-none items-center justify-center rounded-bl-lg rounded-tr-lg border-2 border-solid border-amber bg-black/75 p-2 group-hover:border-indigo-500`}
    >
      <span
        ref={ref}
        className="font-mono text-orange-500 underline group-hover:text-indigo-500"
      >
        {hotKey}
      </span>
    </div>
  );
}
