/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  gastonArrogantHunter,
  lefouBumbler,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Lefou - Bumbler", () => {
  describe("**LOYAL** If you have a character named Gaston in play, you pay 1 ⬡ less to play this character.", () => {
    test("Lefou costs 1 ⬡ if Gaston is in play", () => {
      const testStore = new TestStore({
        inkwell: lefouBumbler.cost - 1,
        hand: [lefouBumbler],
        play: [gastonArrogantHunter],
      });

      const cardUnderTest = testStore.getByZoneAndId("hand", lefouBumbler.id);

      expect(cardUnderTest.cost).toEqual(lefouBumbler.cost - 1);

      cardUnderTest.playFromHand();

      expect(cardUnderTest.zone).toEqual("play");
      expect(testStore.store.tableStore.getTable().inkAvailable()).toEqual(0);
    });

    test("Lefou costs 2 ⬡ if Gaston is NOT in play", () => {
      const testStore = new TestStore({
        inkwell: lefouBumbler.cost - 1,
        hand: [lefouBumbler],
      });

      const cardUnderTest = testStore.getByZoneAndId("hand", lefouBumbler.id);

      expect(cardUnderTest.cost).toEqual(lefouBumbler.cost);

      cardUnderTest.playFromHand();

      expect(cardUnderTest.zone).toEqual("hand");
    });
  });
});
