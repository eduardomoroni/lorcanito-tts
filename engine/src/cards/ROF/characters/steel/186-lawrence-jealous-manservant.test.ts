/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { lawrenceJealousManservant } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Lawrence- Jealous Manservant", () => {
  describe("**PAYBACK** While this character has no damage, he gets +4 ※.", () => {
    it("has no damage", () => {
      const testStore = new TestStore({
        inkwell: lawrenceJealousManservant.cost,
        play: [lawrenceJealousManservant],
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        lawrenceJealousManservant.id,
      );

      expect(cardUnderTest.strength).toEqual(4);
    });

    it("damaged", () => {
      const testStore = new TestStore({
        inkwell: lawrenceJealousManservant.cost,
        play: [lawrenceJealousManservant],
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        lawrenceJealousManservant.id,
      );

      cardUnderTest.updateCardMeta({ damage: 1 });

      expect(cardUnderTest.strength).toEqual(0);
    });
  });
});
