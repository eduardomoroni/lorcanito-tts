/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { belleBookworm } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Belle - Bookworm", () => {
  describe("**USE YOUR IMAGINATION** While an opponent has no cards in their hand, this character gets +2 ◆.", () => {
    it("No Cards in Hand", () => {
      const testStore = new TestStore(
        {
          play: [belleBookworm],
        },
        { hand: 0 },
      );

      const cardUnderTest = testStore.getByZoneAndId("play", belleBookworm.id);

      expect(cardUnderTest.lore).toEqual(belleBookworm.lore + 2);
    });

    it("Cards in Hand", () => {
      const testStore = new TestStore(
        {
          play: [belleBookworm],
        },
        { hand: 1 },
      );

      const cardUnderTest = testStore.getByZoneAndId("play", belleBookworm.id);

      expect(cardUnderTest.lore).toEqual(belleBookworm.lore);
    });
  });
});
