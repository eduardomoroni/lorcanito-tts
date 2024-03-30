import { GamePageObjectModel } from "./pageObject/GamePageObject";
import {
  cinderellaBallroomSensation,
  cobraBubblesSimpleEducator,
  theHuntsmanReluctantEnforcer,
} from "@lorcanito/engine/cards/ROF/characters/characters";
import { createMockGame } from "@lorcanito/engine";

describe("Alter Hand", () => {
  it("you may draw a card, then choose and discard a card.", () => {
    const game = createMockGame({
      deck: [cobraBubblesSimpleEducator],
      play: [theHuntsmanReluctantEnforcer],
      hand: [cinderellaBallroomSensation],
    });

    const pom = new GamePageObjectModel(game, "draw-then-discard");

    pom.visit();

    pom.playerHand().should("have.length", 1);

    cy.intercept("POST", "/api/trpc/effects.resolveTopOfTheStack*").as(
      "resolveTopOfTheStack",
    );
    pom.quest(theHuntsmanReluctantEnforcer);

    pom.confirmOptionalAbility();
    pom.targetModalCard(cobraBubblesSimpleEducator).click();
    cy.wait("@resolveTopOfTheStack");

    cy.reload();
    pom.assertThatCardIsOnHand(cinderellaBallroomSensation);
    pom.assertThatCardIsOnDiscard(cobraBubblesSimpleEducator);
  });
});
