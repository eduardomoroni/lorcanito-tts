/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { CardModel } from "@lorcanito/engine/store/models/CardModel";
import {
  chiefTui,
  rapunzelGiftedWithHealing,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Rapunzel - Gifted with Healing", () => {
  describe("**When you play this character, remove up to 3 damage from one of your characters. Draw a card for each 1 damage removed this way.**", () => {
    it("Healing 2", () => {
      const testStore = new TestStore({
        inkwell: rapunzelGiftedWithHealing.cost,
        deck: 3,
        hand: [rapunzelGiftedWithHealing],
        play: [chiefTui],
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "hand",
        rapunzelGiftedWithHealing.id,
      );
      const target = testStore.getByZoneAndId("play", chiefTui.id);

      target.updateCardDamage(2, "add");

      cardUnderTest.playFromHand();
      testStore.resolveTopOfStack({ targets: [target] });

      expect(target.meta.damage).toEqual(0);
      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({ hand: 2, deck: 1, play: 2, discard: 0 }),
      );
    });

    it("Healing 3", () => {
      const testStore = new TestStore({
        inkwell: rapunzelGiftedWithHealing.cost,
        deck: 3,
        hand: [rapunzelGiftedWithHealing],
        play: [chiefTui],
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "hand",
        rapunzelGiftedWithHealing.id,
      );
      const target = testStore.getByZoneAndId("play", chiefTui.id);

      target.updateCardDamage(3, "add");

      cardUnderTest.playFromHand();
      testStore.resolveTopOfStack({ targets: [target] });

      expect(target.meta.damage).toEqual(0);
      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({ hand: 3, deck: 0, play: 2, discard: 0 }),
      );
    });
  });
});
