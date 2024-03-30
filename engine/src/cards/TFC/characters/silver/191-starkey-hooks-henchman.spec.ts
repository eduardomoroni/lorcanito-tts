/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  johnSilverAlienPirate,
  starkeyHooksHenchman,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Starkey - Hook's Henchman", () => {
  describe("**AYE AYE, CAPTAIN** While you have a Captain character in play, this character gets +1 ◆.", () => {
    test.only("No Captain in play", () => {
      const testStore = new TestStore({
        play: [starkeyHooksHenchman],
      });
      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        starkeyHooksHenchman.id,
      );

      expect(cardUnderTest.lore).toEqual(starkeyHooksHenchman.lore);
    });

    test("With Captain in play", () => {
      const testStore = new TestStore({
        play: [starkeyHooksHenchman, johnSilverAlienPirate],
      });
      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        starkeyHooksHenchman.id,
      );

      expect(cardUnderTest.lore).toEqual(starkeyHooksHenchman.lore + 1);
    });
  });
});
