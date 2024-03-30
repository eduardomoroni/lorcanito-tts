/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { tukTukWreckingBall } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Tuk Tuk - Wrecking Ball", () => {
  it.skip("", () => {
    const testStore = new TestStore({
      inkwell: tukTukWreckingBall.cost,

      play: [tukTukWreckingBall],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      tukTukWreckingBall.id,
    );

    cardUnderTest.playFromHand();
    testStore.resolveOptionalAbility();
    testStore.resolveTopOfStack({});
  });
});
