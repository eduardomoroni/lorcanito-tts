import { GamePageObjectModel } from "./pageObject/GamePageObject";
import { createMockGame } from "@lorcanito/engine";
import {
  dopeyAlwaysPlayful,
  eudoraAccomplishedSeamstress,
} from "@lorcanito/engine/cards/ROF/characters/characters";
import { paintingTheRosesRed } from "@lorcanito/engine//cards/ROF/actions/actions";

describe("Alter Hand", () => {
  it("you may draw a card, then choose and discard a card.", () => {
    const game = createMockGame(
      {
        deck: 1,
        inkwell: paintingTheRosesRed.cost,
        hand: [paintingTheRosesRed],
      },
      {
        play: [dopeyAlwaysPlayful, eudoraAccomplishedSeamstress],
      },
    );

    const pom = new GamePageObjectModel(game, "not-having-enough-targets");

    pom.visit();

    pom.playFromHand(paintingTheRosesRed);
    pom.playerHand().should("have.length", 0);

    pom.selectModalCards([dopeyAlwaysPlayful, eudoraAccomplishedSeamstress]);

    pom.finalAsserts(() => {
      pom.assertThatEffectsHaveBeenResolved();
      pom.playerHand().should("have.length", 1);
      pom
        .playerPlayArea("player_two")
        .get(`[data-testid="bonus-strength-icon"]`)
        .should("have.length", 2);
    });
  });
});
