import React, { forwardRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import type { CardModel, Zones } from "@lorcanito/engine";

const FIRST_ROW = ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"];
const HAND_HOTKEYS = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
const PLAY_HOTKEYS = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const HOTKEYS: Record<Zones | "modal", string[]> = {
  hand: HAND_HOTKEYS,
  play: PLAY_HOTKEYS,
  discard: [],
  inkwell: [],
  deck: ["Z"],
  modal: FIRST_ROW.concat(HAND_HOTKEYS, PLAY_HOTKEYS),
};

type Props = {
  card: CardModel;
  zone: Zones | "modal";
  index: number;
  callback: () => void;
};
export const CardHotKeyOverlay = forwardRef<HTMLDivElement, Props>(
  function CardHotKeyOverlay(props, ref) {
    const { zone, index, card, callback } = props;
    const hotKey = HOTKEYS[zone][index];

    useHotkeys(
      hotKey || "",
      () => {
        logAnalyticsEvent("card_hotkey", { hotKey });
        callback();
      },
      {
        scopes: [zone],
        // TODO: This can be risky, if the user is typing in a text field, the spacebar will trigger the pass turn action
        preventDefault: true,
        // enableOnFormTags: true,
        description: "Open card context menu",
        enabled: !!hotKey,
      },
    );

    return (
      <div
        className={`absolute -right-0.5 -top-0.5 z-20 box-border flex select-none items-center justify-center rounded-bl-lg rounded-tr-lg border-2 border-solid border-amber bg-black/75  group-hover:border-indigo-500`}
      >
        <span
          ref={ref}
          className="px-2 font-mono text-orange-500 underline group-hover:text-indigo-500"
        >
          {hotKey}
        </span>
      </div>
    );
  },
);
