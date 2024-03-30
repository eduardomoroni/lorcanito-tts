/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { merlinGoat } from "@lorcanito/engine/cards/ROF/characters/characters";
import { smash } from "@lorcanito/engine/cards/TFC/actions/actions";

describe("Merlin - Goat", () => {
  describe("**HERE I COME!** When you play this character and when he leaves play, gain 1 lore.", () => {
    it("When you play", () => {
      const testStore = new TestStore({
        inkwell: merlinGoat.cost,
        hand: [merlinGoat],
      });

      const cardUnderTest = testStore.getByZoneAndId("hand", merlinGoat.id);

      expect(testStore.store.tableStore.getTable("player_one").lore).toEqual(0);

      cardUnderTest.playFromHand();

      expect(testStore.store.tableStore.getTable("player_one").lore).toEqual(1);
    });

    it("When he leaves play", () => {
      const testStore = new TestStore({
        inkwell: smash.cost,
        hand: [smash],
        play: [merlinGoat],
      });

      const removal = testStore.getByZoneAndId("hand", smash.id);
      const target = testStore.getByZoneAndId("play", merlinGoat.id);

      removal.playFromHand();
      testStore.resolveTopOfStack({
        targets: [target],
      });

      expect(testStore.store.tableStore.getTable("player_one").lore).toEqual(1);
    });
  });
});
