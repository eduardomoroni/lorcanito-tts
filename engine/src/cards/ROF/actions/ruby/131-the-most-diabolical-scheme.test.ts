/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { theMostDiabolicalScheme } from "@lorcanito/engine/cards/ROF/actions/actions";
import {
  gastonBaritoneBully,
  goofyKnightForADay,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("The Most Diabolical Scheme", () => {
  it("Banish chosen Villain of yours to banish chosen character.", () => {
    const testStore = new TestStore(
      {
        inkwell: theMostDiabolicalScheme.cost,
        hand: [theMostDiabolicalScheme],
        play: [gastonBaritoneBully],
      },
      {
        play: [goofyKnightForADay],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      theMostDiabolicalScheme.id,
    );
    const villain = testStore.getByZoneAndId("play", gastonBaritoneBully.id);
    const target = testStore.getByZoneAndId(
      "play",
      goofyKnightForADay.id,
      "player_two",
    );

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targets: [villain] }, true);
    testStore.resolveTopOfStack({ targets: [target] });
  });
});
