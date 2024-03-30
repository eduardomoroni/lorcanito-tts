import type { ContextMenuItem } from "~/client/providers/card-context-menu/CardContextMenu";
import type { CardModel, ScryEffectPayload } from "@lorcanito/engine";
import type { ScryModalParams } from "~/client/providers/ScryModalProvider";
import type { OpenTargetModalParams } from "~/client/providers/TargetModalProvider";
import type { GameController } from "~/client/hooks/useGameController";
import { createMoveToSubMenu } from "~/client/providers/card-context-menu/createCardContextMenuItems";

export function createDeckContextMenuItems(
  openTargetModal: (args: OpenTargetModalParams) => void,
  openScryModal: (args: ScryModalParams) => void,
  controller: GameController,
) {
  const playerId = controller.activePlayer;
  const topCard = controller.topCard;

  const scry = (payload: ScryEffectPayload) => {
    const { top, hand, bottom, tutorFilters, limits, shouldRevealTutored } =
      payload;
    controller.scry(
      top,
      bottom,
      hand,
      tutorFilters,
      limits,
      shouldRevealTutored,
    );
  };

  const moveSubMenu = createMoveToSubMenu(controller, topCard);

  const scryItems = createScrySubMenu(openScryModal, scry);

  const contextMenuItems: ContextMenuItem[] = [
    {
      text: "Draw card",
      onClick: () => {
        controller.manualMoves.draw(playerId);
      },
    },
    {
      text: "Reveal top card",
      onClick: () => {
        if (!topCard) {
          console.log("Deck is empty");
          return;
        } else {
          controller.manualMoves.reveal(topCard);
        }
      },
    },
    {
      text: "Shuffle deck",
      onClick: () => controller.manualMoves.shuffle(),
    },
    {
      text: "Look at X top cards",
      onClick: () => {},
      items: scryItems,
    },
    {
      text: "Tutor for a card",
      onClick: () => {
        if (!topCard) {
          console.log("Deck is empty");
          return;
        }

        // controller.log({
        //   type: "TUTORING",
        // });

        openTargetModal({
          title: `Tutor for a card`,
          subtitle: `Choose a card to tutor for`,
          filters: [
            { filter: "zone", value: "deck" },
            { filter: "owner", value: playerId },
          ],
          callback: (cards: CardModel[]) => {
            const card = cards[0];
            if (card) {
              controller.manualMoves.tutorCard(card);
            }
          },
        });
      },
    },
    moveSubMenu,
  ];

  return contextMenuItems;
}

function createScrySubMenu(
  openScryModal: (args: ScryModalParams) => void,
  scry: (payload: ScryEffectPayload) => void,
) {
  const subMenu: Array<Omit<ContextMenuItem, "items">> = [
    {
      text: "Scry 1",
      onClick: () => {
        openScryModal({
          amount: 1,
          mode: "both",
          callback: (payload) => {
            if (payload) {
              scry(payload);
            }
          },
        });
      },
    },
    {
      text: "Scry 2",
      onClick: () => {
        openScryModal({
          amount: 2,
          mode: "both",
          callback: (payload) => {
            if (payload) {
              scry(payload);
            }
          },
        });
      },
    },
    {
      text: "Scry 3",
      onClick: () => {
        openScryModal({
          amount: 3,
          mode: "both",
          callback: (payload) => {
            if (payload) {
              scry(payload);
            }
          },
        });
      },
    },
    {
      text: "Scry 4",
      onClick: () => {
        openScryModal({
          amount: 4,
          mode: "both",
          callback: (payload) => {
            if (payload) {
              scry(payload);
            }
          },
        });
      },
    },
    {
      text: "Scry 5",
      onClick: () => {
        openScryModal({
          amount: 5,
          mode: "both",
          callback: (payload) => {
            if (payload) {
              scry(payload);
            }
          },
        });
      },
    },
  ];
  return subMenu;
}
