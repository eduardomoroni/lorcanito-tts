import { type TableCard, type Zones } from "~/providers/TabletopProvider";
import { useNotification } from "~/providers/NotificationProvider";
import { useTargetModal } from "~/providers/TargetModalProvider";
import { type MouseEvent, useContext } from "react";
import { type ContextMenuItem } from "~/providers/card-context-menu/CardContextMenu";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import {
  ContextMenu,
  useContextMenu,
} from "~/providers/card-context-menu/ContextMenuProvider";
import { challengeOpponentsCardsFilter } from "~/components/modals/target/filters";
import {
  useGame,
  useGameController,
} from "~/engine/rule-engine/lib/GameControllerProvider";
import { useTurn } from "~/engine/GameProvider";
import { shiftAbilityPredicate } from "~/engine/cardTypes";
import { selectBottomDeckCard } from "~/engine/rule-engine/lorcana/selectors";

export const useCardContextMenu = (zone: Zones) => {
  const { sendNotification } = useNotification();
  const controller = useGameController();
  const { hasAddedCardToInkWellThisTurn } = useTurn();
  const { openTargetModal } = useTargetModal();
  const context = useContext(ContextMenu);

  function createContextMenuItems(instanceId: string): ContextMenuItem[] {
    const tableCard = controller.findTableCard(instanceId);
    const lorcanitoCard = controller.findLorcanitoCard(instanceId);
    const tapped = tableCard?.meta?.exerted;

    const addToInkwell = createItem("Add to Inkwell", "add_inkwell", () => {
      controller.addToInkwell(instanceId, zone);
    });

    const moveToInkWell: ContextMenuItem = {
      text: "Move to inkwell",
      onClick: () => {
        controller.moveCard({
          instanceId,
          from: zone,
          to: "inkwell",
          position: "last",
        });
        logAnalyticsEvent("discard");
      },
    };

    const discard: ContextMenuItem = {
      text: "Discard",
      onClick: () => {
        controller.moveCard({
          instanceId,
          from: zone,
          to: "discard",
          position: "last",
        });
        logAnalyticsEvent("discard");
      },
    };

    const topDeck: ContextMenuItem = {
      text: "Move to top of the deck",
      onClick: () => {
        controller.moveCard({
          instanceId,
          from: zone,
          to: "deck",
          position: "last",
        });
        logAnalyticsEvent("deck_top");
      },
    };

    const bottomDeck: ContextMenuItem = {
      text: "Move to bottom of the deck",
      onClick: () => {
        controller.moveCard({
          instanceId,
          from: zone,
          to: "deck",
          position: "first",
        });
        logAnalyticsEvent("deck_bottom");
      },
    };

    const banishAction: ContextMenuItem = {
      text: "Banish",
      onClick: () => {
        controller.moveCard({
          instanceId,
          from: zone,
          to: "discard",
          position: "last",
        });
        logAnalyticsEvent("banish", { zone, context_menu: "true" });
      },
    };
    // tableCard && card?.type === "character"
    const challengeAction = createItem("Challenge", "challenge", () => {
      if (!tableCard) {
        console.log("challenge failed");
        return;
      }

      const callback = (target: TableCard) => {
        controller.challenge(instanceId, target.instanceId);
      };
      openTargetModal({
        filters: challengeOpponentsCardsFilter,
        callback,
        type: "challenge",
        title: `Choose a glimmer to challenge with`,
      });

      logAnalyticsEvent("open_challenge_modal", {
        zone,
        context_menu: "true",
      });
    });

    const moveToHand = createItem("Move to hand", "move_to_hand", () => {
      if (!tableCard) {
        console.log("move failed");
        return;
      }

      controller.moveCard({
        instanceId,
        from: zone,
        to: "hand",
        position: "first",
      });
    });

    // card.lore
    const questAction: ContextMenuItem = {
      text: "Quest",
      onClick: () => {
        controller.quest(instanceId);
        logAnalyticsEvent("quest", { zone, context_menu: "true" });
      },
    };

    // card?.type !== "action";
    const exertAction: ContextMenuItem = {
      text: tapped ? "Ready" : "Exert",
      onClick: () => {
        controller.tapCard({ exerted: !tapped, instanceId });
        logAnalyticsEvent("tap", { zone, context_menu: "true" });
      },
    };

    if (zone === "hand") {
      const shiftAbility = lorcanitoCard?.abilities?.find(
        shiftAbilityPredicate
      );

      const shiftCost = shiftAbilityPredicate(shiftAbility)
        ? shiftAbility?.shift
        : 0;

      const shiftAction: ContextMenuItem = {
        text: `Shift ${shiftCost}`,
        onClick: () => {
          openTargetModal({
            title: `Choose a card to shift`,
            subtitle: shiftAbility?.text,
            filters: [
              { filter: "zone", value: "play" },
              { filter: "type", value: "character" },
              { filter: "owner", value: "self" },
              {
                filter: "attribute",
                value: "name",
                comparison: {
                  operator: "eq",
                  value: lorcanitoCard?.name || "",
                },
              },
            ],
            callback: (card: TableCard) => {
              controller.shift(instanceId, card.instanceId);
            },
            type: "",
          });
          logAnalyticsEvent("shift");
        },
      };

      const singAction: ContextMenuItem = {
        text: `Sing #`,
        onClick: () => {
          // TODO: SELECT TARGET MODAL
          // controller.shift(instanceId);
          sendNotification({
            type: "icon",
            title: "Shift",
            message: `Feature under development, for now you can drag the card from hand and drop it on top of the target.`,
            icon: "warning",
            autoClear: true,
          });
          logAnalyticsEvent("shift");
        },
      };

      const autoPlay: ContextMenuItem = {
        text: "Play",
        onClick: () => {
          controller.playCardFromHand(instanceId);
          logAnalyticsEvent("play_auto");
        },
      };

      const manualPlay: ContextMenuItem = {
        text: "Move to play area",
        onClick: () => {
          controller.moveCard({
            instanceId,
            from: zone,
            to: "play",
            position: "last",
          });
          logAnalyticsEvent("play_manual");
        },
      };

      const menuItems: ContextMenuItem[] = [
        autoPlay,
        discard,
        manualPlay,
        // TODO: Add this moves to submenu
        moveToInkWell,
        topDeck,
        bottomDeck,
      ];
      const card = controller.findLorcanitoCard(instanceId);

      // TODO: Not add this to first option
      if (card?.inkwell && !hasAddedCardToInkWellThisTurn) {
        menuItems.splice(1, 0, addToInkwell);
      }

      if (shiftCost) {
        menuItems.splice(1, 0, shiftAction);
      }

      return menuItems;
    }

    const tappedContextMenu: ContextMenuItem[] = [
      exertAction,
      banishAction,
      moveToInkWell,
      moveToHand,
    ];
    const readyContextMenu: ContextMenuItem[] = [
      exertAction,
      questAction,
      challengeAction,
      banishAction,
      moveToInkWell,
      moveToHand,
    ];

    return tapped ? tappedContextMenu : readyContextMenu;
  }

  const openContextMenu = (
    instanceId: string,
    event: MouseEvent<HTMLDivElement> | HTMLElement | null,
    openDirection?: "top" | "bottom"
  ) => {
    if (isMouseEvent(event)) {
      event?.preventDefault();
    }

    const items = createContextMenuItems(instanceId);

    context.setDirection(openDirection || "bottom");
    context.setItems(items.filter(Boolean));
    context.setPosition(getPosition(event));

    logAnalyticsEvent("context_menu", { zone });
  };

  return { openContextMenu };
};

export const useDeckZoneContextMenu = (setScry: (number: number) => void) => {
  const engine = useGameController();
  const [game, playerId] = useGame();
  const topCard = engine.topDeckCard();
  const bottomCard = selectBottomDeckCard(game, playerId);

  const scryItems: Array<Omit<ContextMenuItem, "items">> = [
    {
      text: "Scry 1",
      onClick: () => {
        setScry(1);
      },
    },
    {
      text: "Scry 2",
      onClick: () => {
        setScry(2);
      },
    },
    {
      text: "Scry 3",
      onClick: () => {
        setScry(3);
      },
    },
    {
      text: "Scry 4",
      onClick: () => {
        setScry(4);
      },
    },
    {
      text: "Scry 5",
      onClick: () => {
        setScry(5);
      },
    },
  ];
  const contextMenuItems: ContextMenuItem[] = [
    {
      text: "Draw card",
      onClick: () => {
        engine.drawCard(playerId);
      },
    },
    {
      text: "Look at X top cards",
      onClick: () => {},
      items: scryItems,
    },
    {
      text: "Reveal top card",
      onClick: () => {
        if (!topCard) {
          console.log("Deck is empty");
          return;
        } else {
          engine.revealCard(topCard, "deck");
          logAnalyticsEvent("reveal_top_card", { card: topCard });
        }
      },
    },
    {
      text: "Shuffle deck",
      onClick: engine.shuffle,
    },
    {
      text: "Move to inkwell",
      onClick: () => {
        if (!topCard) {
          console.log("Deck is empty");
          return;
        } else {
          engine.moveCard({
            instanceId: topCard,
            from: "deck",
            to: "inkwell",
            position: "last",
          });
        }
      },
    },
    {
      text: "Move to discard pile",
      onClick: () => {
        const playerDeck = game?.tables[playerId]?.zones?.deck || [];
        const topCard = playerDeck[0];
        if (!topCard) {
          console.log("Deck is empty");
          return;
        } else {
          engine.moveCard({
            instanceId: topCard,
            from: "deck",
            to: "discard",
            position: "last",
          });
        }
      },
    },
    {
      text: "Draw from the bottom of the deck",
      onClick: () => {
        engine.moveCard({
          instanceId: bottomCard,
          from: "deck",
          to: "hand",
          position: "last",
        });
      },
    },
  ];

  return useContextMenu(contextMenuItems);
};

function createItem(
  text: string,
  event: string,
  onClick: () => void
): ContextMenuItem {
  return {
    text: text,
    onClick: () => {
      onClick();
      logAnalyticsEvent("event", { context_menu: "true" });
    },
  };
}

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
