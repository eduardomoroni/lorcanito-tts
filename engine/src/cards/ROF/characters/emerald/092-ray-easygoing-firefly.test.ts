/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { rayEasygoingFirefly } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Ray - Easygoing Firefly", () => {
  it.skip("", () => {
    const testStore = new TestStore({
      inkwell: rayEasygoingFirefly.cost,

      play: [rayEasygoingFirefly],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      rayEasygoingFirefly.id,
    );

    cardUnderTest.playFromHand();
    testStore.resolveOptionalAbility();
    testStore.resolveTopOfStack({});
  });
});
