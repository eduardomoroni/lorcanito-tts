/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { poisonedApple } from "@lorcanito/engine/cards/TFC/items/items";

import {
  heiheiBoatSnack,
  jasmineQueenOfAgrabah,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Poisoned Apple", () => {
  describe("**TAKE A BITE . . . ** 1 ⬡, Banish this item − Exert chosen character. If a Princess character is chosen, banish her instead.", () => {
    it("Princess", () => {
      const testStore = new TestStore({
        inkwell: 1,
        play: [poisonedApple, jasmineQueenOfAgrabah],
      });

      const cardUnderTest = testStore.getByZoneAndId("play", poisonedApple.id);
      const target = testStore.getByZoneAndId("play", jasmineQueenOfAgrabah.id);

      cardUnderTest.activate();
      testStore.resolveTopOfStack({ targetId: target.instanceId });

      expect(target.zone).toEqual("discard");
      expect(cardUnderTest.zone).toEqual("discard");
    });

    it("Non-Princess", () => {
      const testStore = new TestStore({
        inkwell: 1,
        play: [poisonedApple, heiheiBoatSnack],
      });

      const cardUnderTest = testStore.getByZoneAndId("play", poisonedApple.id);
      const target = testStore.getByZoneAndId("play", heiheiBoatSnack.id);

      cardUnderTest.activate();
      testStore.resolveTopOfStack({ targetId: target.instanceId });

      expect(target.meta.exerted).toBeTruthy();
      expect(target.zone).toEqual("play");
      expect(cardUnderTest.zone).toEqual("discard");
    });
  });
});
