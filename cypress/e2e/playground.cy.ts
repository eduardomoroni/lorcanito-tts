import { gameBeforeAlterHand } from "@lorcanito/engine";
import { GamePageObjectModel } from "./pageObject/GamePageObject";

describe("Alter Hand", () => {
  it("Player altering hand", () => {
    const pom = new GamePageObjectModel(gameBeforeAlterHand, "TEST_GAME_ID");

    pom.visit();

    // rafiki, be our guest, part of new
    const cardsToAlter = [
      "eezf7mxb4xxrfc4rdrro2qj7",
      "nnr8offv1fe9icoawkbb4txr",
      "e0iz0xprobespymapk4t5bu9",
    ];

    // ['m4j0fi2hw2ywnp71e8jt19rk', 'bupxiv1cvcu21rdlb8jxw6q3', 'zs0sywgsk76l1usnf13yf1my', 'gkbskfzfudp1vx8id34m4kbf', 'd2s04bykz3zcpsp48uyuli5v', 'mk8bu5ldxkd683xxqjdgcdcr', 'gtk1p5b3bqsdez1sceikrd91']

    pom
      .alterHandModal()
      .findCards()
      .each((item, index, list) => {
        const searchElement = Cypress.$(item).data("id-card");
        if (cardsToAlter.includes(searchElement)) {
          Cypress.$(item).click();
        }
      });

    pom.alterHandModal().submit();
    pom.playerHand().should("have.length", 7);
    pom.playerHand().each((item, index, list) => {
      const searchElement = Cypress.$(item).data("id-card");
      if (cardsToAlter.includes(searchElement)) {
        throw new Error("Card should have been altered");
      }
    });

    pom.getPassTurnButton().should("be.disabled");

    pom.opponent().alterHand([]);

    // only after the opponent makes a move the player can pass the turn; Or play any card;
    pom.getPassTurnButton().should("not.be.disabled");

    const cardToAddToInkwell = "m4j0fi2hw2ywnp71e8jt19rk";
    pom.addToInkwell(cardToAddToInkwell);

    pom
      .playerInkwell()
      .filter(`[data-id-card="${cardToAddToInkwell}"]`)
      .should("have.length", 1);

    const oneCostCard = "d2s04bykz3zcpsp48uyuli5v";
    pom.playCard(oneCostCard);

    pom
      .playerPlayArea()
      .filter(`[data-id-card="${oneCostCard}"]`)
      .should("have.length", 1);

    pom.passTurn();

    // cy.reload();

    // TODO: I have to make sure optimistic rendering is working
  });
});
