/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  magicBroomBucketBrigade,
  simbaFutureKing,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Simba - Future King", () => {
  describe("**GUESS WHAT?** When you play this character, you may draw a card, then choose and discard a card.", () => {
    it("Happy path", () => {
      const testStore = new TestStore({
        inkwell: simbaFutureKing.cost,
        deck: [magicBroomBucketBrigade],
        hand: [simbaFutureKing],
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "hand",
        simbaFutureKing.id,
      );

      cardUnderTest.playFromHand();

      expect(testStore.stackLayers).toHaveLength(1);
      testStore.resolveOptionalAbility();

      expect(testStore.stackLayers).toHaveLength(1);

      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({ hand: 1, deck: 0, play: 1, discard: 0 }),
      );

      const aCardToDiscard = testStore.getByZoneAndId(
        "hand",
        magicBroomBucketBrigade.id,
      );
      testStore.resolveTopOfStack({
        targets: [aCardToDiscard],
      });
      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({ hand: 0, deck: 0, play: 1, discard: 1 }),
      );
    });

    it.todo("should not let people skip the discard");
  });
});
