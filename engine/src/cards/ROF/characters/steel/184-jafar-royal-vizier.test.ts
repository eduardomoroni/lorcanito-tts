/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { jafarRoyalVizier } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Jafar- Royal Vizier", () => {
  it.skip("I don't trust him, sire", () => {
    const testStore = new TestStore({
      inkwell: jafarRoyalVizier.cost,

      hand: [jafarRoyalVizier],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", jafarRoyalVizier.id);

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({});
  });
});
