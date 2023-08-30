import React from "react";
import { type Zones } from "~/providers/TabletopProvider";

import { useHotkeys } from "react-hotkeys-hook";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import { useCardContextMenu } from "~/providers/card-context-menu/useCardContextMenu";

const HAND_HOTKEYS = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
const PLAY_HOTKEYS = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const HOTKEYS: Record<Zones, string[]> = {
  hand: HAND_HOTKEYS,
  play: PLAY_HOTKEYS,
  discard: [],
  inkwell: [],
  deck: ["Z"],
};

export function CardHotKeyOverlay(props: {
  instanceId: string;
  zone: Zones;
  index: number;
  callback?: () => void;
}) {
  const { zone, index, instanceId, callback } = props;
  const hotKey = HOTKEYS[zone][index];
  const { openContextMenu } = useCardContextMenu(props.zone);
  const textRef = React.useRef<HTMLSpanElement>(null);

  useHotkeys(
    hotKey || "",
    () => {
      logAnalyticsEvent("card_hotkey", { hotKey });
      if (callback) {
        callback();
      } else {
        openContextMenu(
          instanceId,
          textRef.current,
          zone === "play" ? "bottom" : "top"
        );
      }
    },
    {
      scopes: [zone],
      // TODO: This can be risky, if the user is typing in a text field, the spacebar will trigger the pass turn action
      preventDefault: true,
      // enableOnFormTags: true,
      description: "Open card context menu",
      enabled: !!hotKey,
    }
  );

  return (
    <div
      className={`absolute -right-0.5 -top-0.5 z-20 flex select-none items-center justify-center rounded-bl-lg rounded-tr-lg border-2 border-solid border-amber bg-black/75  group-hover:border-indigo-500`}
    >
      <span
        ref={textRef}
        className="px-2 font-mono text-orange-500 underline group-hover:text-indigo-500"
      >
        {hotKey}
      </span>
    </div>
  );
}
