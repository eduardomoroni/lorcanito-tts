import { type Zones } from "@lorcanito/engine";
import { type MouseEvent, useContext } from "react";
import { type ContextMenuItem } from "~/client/providers/card-context-menu/CardContextMenu";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import {
  ContextMenu,
  useContextMenu,
} from "~/client/providers/card-context-menu/ContextMenuProvider";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import { CardModel } from "@lorcanito/engine";
import { createContextMenuItems } from "~/client/providers/card-context-menu/createCardContextMenuItems";
import { useTargetModal } from "~/client/providers/TargetModalProvider";
import { useScryModal } from "~/client/providers/ScryModalProvider";
import { createDeckContextMenuItems } from "~/client/providers/card-context-menu/createDeckContextMenuItems";
import { useGameController } from "~/client/hooks/useGameController";
import { useSetCardPreview } from "~/client/providers/CardPreviewProvider";

export const useCardContextMenu = (zone?: Zones) => {
  const store = useGameStore();
  const gameController = useGameController();
  const setCardPreview = useSetCardPreview();

  const context = useContext(ContextMenu);

  if (!zone) {
    return {
      openContextMenu: () => {},
      isContextMenuOpen: false,
    };
  }

  const openContextMenu = (
    card: CardModel,
    event: MouseEvent<HTMLDivElement> | HTMLElement | null,
    openDirection?: "top" | "bottom",
  ) => {
    if (isMouseEvent(event)) {
      event?.preventDefault();
    }

    if (!card.ready && !store.manualMode) {
      return;
    }

    const items = createContextMenuItems(card, store, gameController);

    context.setDirection(openDirection || "bottom");
    context.setItems(items.filter(Boolean));
    context.setPosition(getPosition(event));
    setCardPreview({ card: card?.lorcanitoCard });

    logAnalyticsEvent("context_menu", { zone });
  };

  return { openContextMenu, isContextMenuOpen: context.position !== null };
};

export const useDeckZoneContextMenu = () => {
  const store = useGameStore();
  const controller = useGameController();

  const { openTargetModal } = useTargetModal();
  const { openScryModal } = useScryModal();

  const contextMenuItems: ContextMenuItem[] = createDeckContextMenuItems(
    openTargetModal,
    openScryModal,
    controller,
  );
  return useContextMenu(contextMenuItems);
};

function getPosition(el: MouseEvent<HTMLDivElement> | HTMLElement | null) {
  if (isMouseEvent(el)) {
    return { x: el.clientX, y: el.clientY };
  }

  if (isElement(el)) {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
    };
  }

  return { x: 0, y: 0 };
}

function isElement(element: unknown): element is HTMLElement {
  return element instanceof Element || element instanceof HTMLDocument;
}

function isMouseEvent(event: unknown): event is MouseEvent<HTMLDivElement> {
  // @ts-ignore
  return event?.clientX !== undefined && event?.clientY !== undefined;
}
