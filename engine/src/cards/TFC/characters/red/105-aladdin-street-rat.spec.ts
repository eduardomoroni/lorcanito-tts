/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { aladdinStreetRat } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Aladdin - Street Rat", () => {
  describe("**IMPROVISE** When you play this character each opponent loses 1 lore.", () => {
    it("Opponent loses lore", () => {
      const testStore = new TestStore({
        inkwell: aladdinStreetRat.cost,
        hand: [aladdinStreetRat],
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "hand",
        aladdinStreetRat.id,
      );

      testStore.store.tableStore.getTable("player_two").lore = 5;

      cardUnderTest.playFromHand();

      expect(testStore.store.tableStore.getTable("player_two").lore).toBe(4);
    });
  });
});
