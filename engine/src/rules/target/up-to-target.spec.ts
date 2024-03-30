/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { gumboPot } from "@lorcanito/engine/cards/ROF/items/items";
import {
  owlLogicalLecturer,
  rabbitReluctantHost,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Gumbo Pot", () => {
  describe("**THE BEST I'VE EVER TASTED** ↷ − Remove 1 damage each from up to 2 chosen characters.", () => {
    it("should remove 1 damage from 2 characters", () => {
      const testStore = new TestStore({
        play: [gumboPot, rabbitReluctantHost, owlLogicalLecturer],
      });

      const cardUnderTest = testStore.getByZoneAndId("play", gumboPot.id);
      const damagedChar1 = testStore.getByZoneAndId(
        "play",
        rabbitReluctantHost.id,
      );
      const damagedChar2 = testStore.getByZoneAndId(
        "play",
        owlLogicalLecturer.id,
      );

      [damagedChar1, damagedChar2].forEach((char) => {
        char.updateCardMeta({ damage: 1 });
        expect(char.meta).toEqual(expect.objectContaining({ damage: 1 }));
      });

      cardUnderTest.activate();
      testStore.resolveTopOfStack({ targets: [damagedChar1, damagedChar2] });

      [damagedChar1, damagedChar2].forEach((char) => {
        expect(char.meta).toEqual(expect.objectContaining({ damage: 0 }));
      });
    });

    it("should remove 1 damage from 1 characters", () => {
      const testStore = new TestStore({
        play: [gumboPot, rabbitReluctantHost, owlLogicalLecturer],
      });

      const cardUnderTest = testStore.getByZoneAndId("play", gumboPot.id);
      const damagedChar1 = testStore.getByZoneAndId(
        "play",
        rabbitReluctantHost.id,
      );
      const damagedChar2 = testStore.getByZoneAndId(
        "play",
        owlLogicalLecturer.id,
      );

      [damagedChar1, damagedChar2].forEach((char) => {
        char.updateCardMeta({ damage: 1 });
        expect(char.meta).toEqual(expect.objectContaining({ damage: 1 }));
      });

      cardUnderTest.activate();
      testStore.resolveTopOfStack({ targets: [damagedChar1] });

      expect(damagedChar1.meta).toEqual(expect.objectContaining({ damage: 0 }));
      expect(damagedChar2.meta).toEqual(expect.objectContaining({ damage: 1 }));
    });
  });
});
