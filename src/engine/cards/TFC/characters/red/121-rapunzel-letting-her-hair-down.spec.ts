/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { rapunzelLettingHerHairDown } from "~/engine/cards/TFC/characters/characters";

describe("Rapunzel - Letting Down Her Hair", () => {
  describe("**TANGLE** When you play this character, each opponent loses 1 lore.", () => {
    it("Opponent loses lore", () => {
      const testStore = new TestStore({
        inkwell: rapunzelLettingHerHairDown.cost,
        hand: [rapunzelLettingHerHairDown],
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "hand",
        rapunzelLettingHerHairDown.id,
      );

      testStore.store.tableStore.getTable("player_two").lore = 5;

      cardUnderTest.playFromHand();

      expect(testStore.store.tableStore.getTable("player_two").lore).toBe(4);
    });
  });
});
