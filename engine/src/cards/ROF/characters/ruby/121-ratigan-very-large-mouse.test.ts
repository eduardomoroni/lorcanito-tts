/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  goofyKnightForADay,
  ratiganVeryLargeMouse,
  rayEasygoingFirefly,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Ratigan - Very Large Mouse", () => {
  it("**THIS IS MY KINGDOM** When you play this character, exert chosen opposing character with 3 ※ or less. Chose one of your characters and ready them. They can't quest for the rest of this turn.", () => {
    const testStore = new TestStore(
      {
        inkwell: ratiganVeryLargeMouse.cost,
        hand: [ratiganVeryLargeMouse],
        play: [goofyKnightForADay],
      },
      { play: [rayEasygoingFirefly] },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      ratiganVeryLargeMouse.id,
    );
    const target = testStore.getByZoneAndId("play", goofyKnightForADay.id);
    const targetOpp = testStore.getByZoneAndId(
      "play",
      rayEasygoingFirefly.id,
      "player_two",
    );

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({ targets: [targetOpp] }, true);
    expect(targetOpp.ready).toEqual(false);

    testStore.resolveTopOfStack({ targets: [target] }, true);
    expect(target.ready).toEqual(true);
    expect(target.hasQuestRestriction).toEqual(true);
  });
});
