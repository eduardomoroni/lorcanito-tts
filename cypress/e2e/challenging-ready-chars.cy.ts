import { GamePageObjectModel } from "./pageObject/GamePageObject";
import { createMockGame } from "@lorcanito/engine";
import {
  eudoraAccomplishedSeamstress,
  namaariMorningMist,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Alter Hand", () => {
  it("you may draw a card, then choose and discard a card.", () => {
    const game = createMockGame(
      {
        play: [namaariMorningMist],
      },
      {
        play: [eudoraAccomplishedSeamstress],
      },
    );

    const pom = new GamePageObjectModel(game, "challenging-ready-chars");

    pom.visit();
    pom.challenge(namaariMorningMist, eudoraAccomplishedSeamstress);

    // pom.finalAsserts(() => {
    //   pom.assertThatEffectsHaveBeenResolved();
    //   pom.playerHand().should("have.length", 1);
    //   pom
    //     .playerPlayArea("player_two")
    //     .get(`[data-testid="bonus-strength-icon"]`)
    //     .should("have.length", 2);
    // });
  });
});
