/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { dukeWeaseltonSmallTimeCrook } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Duke Weaselton - Small-Time Crook", () => {
  it.skip("", () => {
    const testStore = new TestStore({
      inkwell: dukeWeaseltonSmallTimeCrook.cost,

      play: [dukeWeaseltonSmallTimeCrook],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      dukeWeaseltonSmallTimeCrook.id,
    );

    cardUnderTest.playFromHand();
    testStore.resolveOptionalAbility();
    testStore.resolveTopOfStack({});
  });
});
