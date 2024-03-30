/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { queenOfHeartsImpulsiveRules } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Queen of Hearts - Impulsive Rules", () => {
  it.skip("", () => {
    const testStore = new TestStore({
      inkwell: queenOfHeartsImpulsiveRules.cost,

      play: [queenOfHeartsImpulsiveRules],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      queenOfHeartsImpulsiveRules.id,
    );

    cardUnderTest.playFromHand();
    testStore.resolveOptionalAbility();
    testStore.resolveTopOfStack({});
  });
});
