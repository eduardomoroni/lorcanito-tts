import { createContextMenuItem } from "~/client/providers/card-context-menu/createContextMenuItem";
import type { CardModel } from "@lorcanito/engine";
import type { ContextMenuItem } from "~/client/providers/card-context-menu/CardContextMenu";
import type { MobXRootStore } from "@lorcanito/engine";
import type { GameController } from "~/client/hooks/useGameController";
import { activatedAbilityPredicate } from "@lorcanito/engine";

export function createContextMenuItems(
  card: CardModel,
  store: MobXRootStore,
  gameController: GameController,
): ContextMenuItem[] {
  const moveSubMenu = createMoveToSubMenu(gameController, card);

  if (card.zone === "hand") {
    return fromHand(card, moveSubMenu, gameController);
  }

  if (card.zone === "play") {
    return fromPlay(moveSubMenu, card, gameController);
  }

  return store.manualMode ? [moveSubMenu] : [];
}

function fromHand(
  card: CardModel,
  moveSubMenu: ContextMenuItem,
  gameController: GameController,
) {
  const discard = createContextMenuItem("Discard", "discard_card", () => {
    gameController.manualMoves.moveCardTo(card, "discard");
  });
  const addToInkwell = createContextMenuItem(
    "Add to Inkwell",
    "add_inkwell",
    () => {
      gameController.addToInkwell(card);
    },
  );
  const shiftCost = card.shiftCost;
  const shiftAction = createContextMenuItem(
    `Shift ${shiftCost}`,
    "shift",
    () => {
      gameController.findShiftTarget(card);
    },
  );

  const singAction = createContextMenuItem("Sing", "sing", () => {
    gameController.findSingTarget(card);
  });

  const play = createContextMenuItem("Play", "play_card", () => {
    gameController.playCard(card);
  });

  const menuItems: ContextMenuItem[] = [play];

  if (shiftCost) {
    menuItems.splice(1, 0, shiftAction);
  }

  if (card.isSong) {
    menuItems.splice(1, 0, singAction);
  }

  if (gameController.manualMode) {
    menuItems.splice(1, 0, moveSubMenu);
    menuItems.splice(1, 0, discard);
  }

  if (gameController.canAddCardToInkwell(card)) {
    menuItems.splice(1, 0, addToInkwell);
  }

  return menuItems;
}

function fromPlay(
  moveSubMenu: ContextMenuItem,
  card: CardModel,
  gameController: GameController,
) {
  const banishAction: ContextMenuItem = {
    text: "Banish",
    onClick: () => {
      gameController.manualMoves.moveCardTo(card, "discard");
    },
  };

  const challengeAction = createContextMenuItem(
    "Challenge",
    "challenge",
    () => {
      gameController.findChallengeTarget(card);
    },
  );

  const questAction: ContextMenuItem = {
    text: "Quest",
    onClick: () => {
      gameController.quest(card);
    },
  };

  const questWithAllAction: ContextMenuItem = {
    text: "Quest with All glimmers",
    onClick: () => {
      gameController.questWithAll();
    },
  };

  const exertAction: ContextMenuItem = {
    text: !card.ready ? "Ready" : "Exert",
    onClick: () => {
      gameController.manualMoves.tap(card, { toggle: true });
    },
  };

  const menuItems: ContextMenuItem[] =
    card.type === "character"
      ? [questAction, questWithAllAction, challengeAction]
      : [];

  const activatedAbilities = card.getAbilities([
    (ability) => ability.isActivatedAbility,
  ]);

  activatedAbilities.forEach((ability) => {
    const abilityName = ability.name;

    menuItems.push(
      createContextMenuItem(abilityName || card.fullName, "ability", () => {
        gameController.activate(card, abilityName || card.fullName);
      }),
    );
  });

  if (gameController.manualMode) {
    menuItems.push(exertAction);
    menuItems.push(banishAction);
    menuItems.push(moveSubMenu);
  }

  return menuItems;
}

export function createMoveToSubMenu(
  gameController: GameController,
  card?: CardModel,
): ContextMenuItem {
  if (!card) {
    return {
      text: "No cards in Deck",
      onClick: () => {},
      items: [],
    };
  }
  const moveItems: Array<Omit<ContextMenuItem, "items">> = [
    createContextMenuItem("Hand", "move_to_hand", () => {
      gameController.manualMoves.moveCardTo(card, "hand");
    }),
    createContextMenuItem("Play area", "move_to_play", () => {
      gameController.manualMoves.moveCardTo(card, "play");
    }),
    createContextMenuItem("Inkwell", "move_to_inkwell", () => {
      gameController.manualMoves.moveCardTo(card, "inkwell");
    }),
    createContextMenuItem("Discard", "move_to_discard", () => {
      gameController.manualMoves.moveCardTo(card, "discard");
    }),
    createContextMenuItem("Bottom of the deck", "move_to_deck", () => {
      gameController.manualMoves.moveCardTo(card, "deck", "first");
    }),
    createContextMenuItem("Top of the deck", "move_to_deck", () => {
      gameController.manualMoves.moveCardTo(card, "deck");
    }),
  ];

  return {
    text: "Move card to",
    onClick: () => {},
    items: moveItems,
  };
}
