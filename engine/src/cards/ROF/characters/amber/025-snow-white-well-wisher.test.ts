/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { snowWhiteWellWisher } from "@lorcanito/engine/cards/ROF/characters/characters";
import { dragonGem } from "@lorcanito/engine/cards/ROF/items/items";

describe("Snow White - Well Wisher", () => {
  describe("**WISHES COME TRUE** Whenever this character quests, you may return a character card from your discard to your hand.", () => {
    it("return character card to hand", () => {
      const testStore = new TestStore({
        inkwell: snowWhiteWellWisher.cost,
        discard: [snowWhiteWellWisher],
        hand: [],
        play: [snowWhiteWellWisher],
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        snowWhiteWellWisher.id,
      );
      const target = testStore.getByZoneAndId(
        "discard",
        snowWhiteWellWisher.id,
      );

      cardUnderTest.quest();
      testStore.resolveOptionalAbility();
      testStore.resolveTopOfStack({ targetId: target.instanceId });
      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({
          discard: 0,
          hand: 1,
          play: 1,
        }),
      );
    });

    it("no valid target", () => {
      const testStore = new TestStore({
        inkwell: snowWhiteWellWisher.cost,
        discard: [dragonGem],
        hand: [],
        play: [snowWhiteWellWisher],
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        snowWhiteWellWisher.id,
      );

      cardUnderTest.quest();
      testStore.resolveOptionalAbility();
      testStore.resolveTopOfStack({});
      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({
          discard: 1,
          hand: 0,
          play: 1,
        }),
      );
    });
  });
});
