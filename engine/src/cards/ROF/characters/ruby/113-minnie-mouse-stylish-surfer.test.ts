/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { minnieMouseStylishSurfer } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Minnie Mouse - Stylish Surfer", () => {
  it.skip("", () => {
    const testStore = new TestStore({
      inkwell: minnieMouseStylishSurfer.cost,

      play: [minnieMouseStylishSurfer],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      minnieMouseStylishSurfer.id,
    );

    cardUnderTest.playFromHand();
    testStore.resolveOptionalAbility();
    testStore.resolveTopOfStack({});
  });
});
