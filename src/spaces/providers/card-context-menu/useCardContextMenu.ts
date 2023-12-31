import { type Zones } from "~/spaces/providers/TabletopProvider";
import { type MouseEvent, useContext } from "react";
import { type ContextMenuItem } from "~/spaces/providers/card-context-menu/CardContextMenu";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import {
  ContextMenu,
  useContextMenu,
} from "~/spaces/providers/card-context-menu/ContextMenuProvider";
import { useGameStore } from "~/engine/lib/GameStoreProvider";
import { CardModel } from "~/engine/store/models/CardModel";
import { createContextMenuItems } from "~/spaces/providers/card-context-menu/createCardContextMenuItems";
import { useTargetModal } from "~/spaces/providers/TargetModalProvider";
import { useScryModal } from "~/spaces/providers/ScryModalProvider";

export const useCardContextMenu = (zone: Zones) => {
  const store = useGameStore();

  const context = useContext(ContextMenu);
  const openContextMenu = (
    card: CardModel,
    event: MouseEvent<HTMLDivElement> | HTMLElement | null,
    openDirection?: "top" | "bottom",
  ) => {
    if (isMouseEvent(event)) {
      event?.preventDefault();
    }

    const items = createContextMenuItems(card, store);

    context.setDirection(openDirection || "bottom");
    context.setItems(items.filter(Boolean));
    context.setPosition(getPosition(event));

    logAnalyticsEvent("context_menu", { zone });
  };

  return { openContextMenu };
};

export const useDeckZoneContextMenu = () => {
  const store = useGameStore();
  const playerId = store.activePlayer;
  const topCard = store.topDeckCard(playerId);
  const bottomCard = store.bottomDeckCard(playerId);
  const { openTargetModal } = useTargetModal();
  const openScryModal = useScryModal();

  const scryItems: Array<Omit<ContextMenuItem, "items">> = [
    {
      text: "Scry 1",
      onClick: () => {
        store.log({
          type: "LOOKING_AT_TOP_CARDS",
          amount: 1,
        });
        openScryModal({
          amount: 1,
          mode: "both",
        });
      },
    },
    {
      text: "Scry 2",
      onClick: () => {
        store.log({
          type: "LOOKING_AT_TOP_CARDS",
          amount: 2,
        });
        openScryModal({
          amount: 2,
          mode: "both",
        });
      },
    },
    {
      text: "Scry 3",
      onClick: () => {
        store.log({
          type: "LOOKING_AT_TOP_CARDS",
          amount: 3,
        });
        openScryModal({
          amount: 3,
          mode: "both",
        });
      },
    },
    {
      text: "Scry 4",
      onClick: () => {
        store.log({
          type: "LOOKING_AT_TOP_CARDS",
          amount: 4,
        });
        openScryModal({
          amount: 4,
          mode: "both",
        });
      },
    },
    {
      text: "Scry 5",
      onClick: () => {
        store.log({
          type: "LOOKING_AT_TOP_CARDS",
          amount: 5,
        });
        openScryModal({
          amount: 5,
          mode: "both",
        });
      },
    },
  ];
  const contextMenuItems: ContextMenuItem[] = [
    {
      text: "Draw card",
      onClick: () => {
        store.drawCard(playerId);
      },
    },
    {
      text: "Reveal top card",
      onClick: () => {
        if (!topCard) {
          console.log("Deck is empty");
          return;
        } else {
          store.cardStore.revealCard(topCard.instanceId, "deck");
        }
      },
    },
    {
      text: "Shuffle deck",
      onClick: () => store.tableStore.shuffleDeck(playerId),
    },
    {
      text: "Look at X top cards",
      onClick: () => {},
      items: scryItems,
    },
    {
      text: "Move top card to inkwell",
      onClick: () => {
        if (!topCard) {
          console.log("Deck is empty");
          return;
        } else {
          store.tableStore.moveCard(topCard.instanceId, "deck", "inkwell");
        }
      },
    },
    {
      text: "Move top card to discard pile",
      onClick: () => {
        if (!topCard) {
          console.log("Deck is empty");
          return;
        } else {
          store.tableStore.moveCard(topCard.instanceId, "deck", "discard");
        }
      },
    },
    {
      text: "Tutor for a card",
      onClick: () => {
        if (!topCard) {
          console.log("Deck is empty");
          return;
        }

        store.log({
          type: "TUTORING",
        });
        store.tableStore.moveCard(topCard.instanceId, "deck", "discard");

        openTargetModal({
          title: `Tutor for a card`,
          subtitle: `Choose a card to tutor for`,
          filters: [
            { filter: "zone", value: "deck" },
            { filter: "owner", value: playerId },
          ],
          callback: (card?: CardModel) => {
            if (card) {
              card.moveTo("hand");
              store.log({
                type: "TUTORED",
                instanceId: card.instanceId,
              });
              store.tableStore.shuffleDeck(playerId);
            }
          },
        });
      },
    },
    {
      text: "Draw from the bottom of the deck",
      onClick: () => {
        store.tableStore.moveCard(
          bottomCard?.instanceId,
          "deck",
          "hand",
          "last",
        );
      },
    },
  ];

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
