/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { basilOfBakerStreet } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Basil - Of Baker Street", () => {
  it.skip("", () => {
    const testStore = new TestStore({
      inkwell: basilOfBakerStreet.cost,

      play: [basilOfBakerStreet],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      basilOfBakerStreet.id,
    );

    cardUnderTest.playFromHand();
    testStore.resolveOptionalAbility();
    testStore.resolveTopOfStack({});
  });
});
