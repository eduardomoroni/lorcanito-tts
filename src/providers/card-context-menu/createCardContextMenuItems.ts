import { CardModel } from "~/store/models/CardModel";
import { ContextMenuItem } from "~/providers/card-context-menu/CardContextMenu";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import { MobXRootStore } from "~/store/RootStore";

function fromHand(
  card: CardModel,
  store: MobXRootStore,
  discard: ContextMenuItem,
  moveSubMenu: ContextMenuItem,
  hasAddedCardToInkWellThisTurn: () => number,
  addToInkwell: ContextMenuItem
) {
  const shiftCost = card.shiftCost;
  const shiftAction: ContextMenuItem = {
    text: `Shift ${shiftCost}`,
    onClick: () => {
      store.cardStore.openShiftModal(card);
    },
  };

  const singAction: ContextMenuItem = {
    text: `Sing #`,
    onClick: () => {
      // TODO: SELECT TARGET MODAL
      // controller.shift(instanceId);
      store.sendNotification({
        type: "icon",
        title: "Shift",
        message: `Feature under development, for now you can drag the card from hand and drop it on top of the target.`,
        icon: "warning",
        autoClear: true,
      });
    },
  };

  const autoPlay: ContextMenuItem = {
    text: "Play",
    onClick: () => {
      card.playFromHand();
    },
  };

  const menuItems: ContextMenuItem[] = [autoPlay, discard, moveSubMenu];

  // TODO: Not add this to first option
  if (card?.inkwell && !hasAddedCardToInkWellThisTurn) {
    menuItems.splice(1, 0, addToInkwell);
  }

  if (shiftCost) {
    menuItems.splice(1, 0, shiftAction);
  }

  return menuItems;
}

export function createContextMenuItems(
  card: CardModel,
  store: MobXRootStore
): ContextMenuItem[] {
  const tapped = !!card.meta.exerted;
  const hasAddedCardToInkWellThisTurn =
    store.tableStore.getTable().cardsAddedToInkWellThisTurn;
  const moveSubMenu = createMoveToSubMenu(card);

  const addToInkwell = createItem("Add to Inkwell", "add_inkwell", () => {
    card.addToInkwell();
  });

  const discard: ContextMenuItem = {
    text: "Discard",
    onClick: () => {
      card.discard();
    },
  };

  const banishAction: ContextMenuItem = {
    text: "Banish",
    onClick: () => {
      card.discard();
    },
  };

  // tableCard && card?.type === "character"
  const challengeAction = createItem("Challenge", "challenge", () => {
    store.cardStore.openChallengeModal(card);
  });

  // card.lore
  const questAction: ContextMenuItem = {
    text: "Quest",
    onClick: () => {
      store.cardStore.quest(card.instanceId);
    },
  };

  // card?.type !== "action";
  const exertAction: ContextMenuItem = {
    text: tapped ? "Ready" : "Exert",
    onClick: () => {
      store.cardStore.tapCard(card.instanceId, { toggle: true });
    },
  };

  if (card.zone === "hand") {
    return fromHand(
      card,
      store,
      discard,
      moveSubMenu,
      hasAddedCardToInkWellThisTurn,
      addToInkwell
    );
  }

  const tappedContextMenu: ContextMenuItem[] = [
    exertAction,
    banishAction,
    moveSubMenu,
  ];
  const readyContextMenu: ContextMenuItem[] = [
    exertAction,
    questAction,
    challengeAction,
    banishAction,
    moveSubMenu,
  ];

  card.abilities.forEach((ability) => {
    const abilityName = ability.name;

    if (ability.type === "activated" && abilityName) {
      readyContextMenu.splice(
        0,
        0,
        createItem(abilityName, "ability", () => {
          card.activate(abilityName);
        })
      );
    }
  });

  return tapped ? tappedContextMenu : readyContextMenu;
}

function createMoveToSubMenu(card: CardModel): ContextMenuItem {
  const moveItems: Array<Omit<ContextMenuItem, "items">> = [
    createItem("Hand", "move_to_hand", () => {
      card.moveTo("hand");
    }),
    createItem("Play area", "move_to_play", () => {
      card.moveTo("play");
    }),
    createItem("Inkwell", "move_to_inkwell", () => {
      card.moveTo("inkwell");
    }),
    createItem("Discard", "move_to_discard", () => {
      card.moveTo("discard");
    }),
    createItem("Bottom of the deck", "move_to_deck", () => {
      card.moveTo("deck", "first");
    }),
    createItem("Top of the deck", "move_to_deck", () => {
      card.moveTo("deck");
    }),
  ];

  return {
    text: "Move card to",
    onClick: () => {},
    items: moveItems,
  };
}

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
