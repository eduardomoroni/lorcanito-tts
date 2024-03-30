import { ContextMenuItem } from "~/client/providers/card-context-menu/CardContextMenu";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";

export function createContextMenuItem(
  text: string,
  event: string,
  onClick: () => void,
): ContextMenuItem {
  return {
    text: text,
    onClick: () => {
      onClick();
      logAnalyticsEvent(event, { context_menu: "true" });
    },
  };
}
