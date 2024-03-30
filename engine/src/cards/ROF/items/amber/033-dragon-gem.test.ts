/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { dragonGem } from "@lorcanito/engine/cards/ROF/items/items";
import {
  docLeaderOfTheSevenDwarfs,
  happyGoodNatured,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Dragon Gem", () => {
  describe("**BRING BACK TO LIFE** ↷, 3 ⬡ − Return a character card with **Support** from your discard to your hand.", () => {
    it("Returns a character with Support", () => {
      const testStore = new TestStore({
        inkwell: 3,
        play: [dragonGem],
        discard: [happyGoodNatured],
      });

      const cardUnderTest = testStore.getByZoneAndId("play", dragonGem.id);
      const target = testStore.getByZoneAndId("discard", happyGoodNatured.id);

      cardUnderTest.activate();
      testStore.resolveTopOfStack({ targets: [target] });

      expect(target.zone).toEqual("hand");
    });

    it("Returns a character without Support", () => {
      const testStore = new TestStore({
        inkwell: 3,
        play: [dragonGem],
        discard: [docLeaderOfTheSevenDwarfs],
      });

      const cardUnderTest = testStore.getByZoneAndId("play", dragonGem.id);
      const target = testStore.getByZoneAndId(
        "discard",
        docLeaderOfTheSevenDwarfs.id,
      );

      cardUnderTest.activate();
      testStore.resolveTopOfStack({ targets: [target] }, true);

      expect(target.zone).toEqual("discard");
    });
  });
});
