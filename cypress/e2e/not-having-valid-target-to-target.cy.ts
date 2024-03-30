import { GamePageObjectModel } from "./pageObject/GamePageObject";
import { createMockGame } from "@lorcanito/engine";
import { judyHoppsOptimisticOfficer } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Alter Hand", () => {
  it("you may draw a card, then choose and discard a card.", () => {
    const game = createMockGame({
      deck: 3,
      inkwell: judyHoppsOptimisticOfficer.cost,
      hand: [judyHoppsOptimisticOfficer],
    });

    const pom = new GamePageObjectModel(game, "not-having-enough-targets");

    pom.visit();

    pom.playFromHand(judyHoppsOptimisticOfficer);

    pom.confirmOptionalAbility();
    pom.assertThatEffectsHaveBeenResolved();
    pom.reloadAndWait();
    pom.assertThatEffectsHaveBeenResolved();
  });
});
