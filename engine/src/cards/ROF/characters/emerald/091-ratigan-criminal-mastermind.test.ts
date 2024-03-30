/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { ratiganCriminalMastermind } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Ratigan - Criminal Mastermind", () => {
  it.skip("", () => {
    const testStore = new TestStore({
      inkwell: ratiganCriminalMastermind.cost,
      play: [ratiganCriminalMastermind],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      ratiganCriminalMastermind.id,
    );

    cardUnderTest.playFromHand();
    testStore.resolveOptionalAbility();
    testStore.resolveTopOfStack({});

    expect(false).toBe(true);
  });
});
