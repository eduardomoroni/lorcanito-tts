/**
 * @jest-environment node
 */

import { describe, expect, test } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { hiramFlavershamToymaker } from "@lorcanito/engine/cards/ROF/characters/characters";
import { gumboPot } from "@lorcanito/engine/cards/ROF/items/items";

describe("Hiram Flaversham - Toymaker", () => {
  describe("**ARTIFICER** When you play this character and whenever he quests, you may banish one of your items to draw 2 cards.", () => {
    test("When you play this character", () => {
      const testStore = new TestStore({
        inkwell: hiramFlavershamToymaker.cost,
        play: [gumboPot],
        hand: [hiramFlavershamToymaker],
        deck: 3,
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "hand",
        hiramFlavershamToymaker.id,
      );
      const target = testStore.getByZoneAndId("play", gumboPot.id);

      cardUnderTest.playFromHand();
      testStore.resolveOptionalAbility();
      testStore.resolveTopOfStack({ targets: [target] });

      expect(target.zone).toEqual("discard");
      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({
          hand: 2,
          deck: 1,
          discard: 1,
          play: 1,
        }),
      );
    });

    test("Whenever he quests", () => {
      const testStore = new TestStore({
        play: [hiramFlavershamToymaker, gumboPot],
        deck: 3,
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        hiramFlavershamToymaker.id,
      );
      const target = testStore.getByZoneAndId("play", gumboPot.id);

      cardUnderTest.quest();
      testStore.resolveOptionalAbility();
      testStore.resolveTopOfStack({ targets: [target] });

      expect(target.zone).toEqual("discard");
      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({
          hand: 2,
          deck: 1,
          discard: 1,
          play: 1,
        }),
      );
    });

    test("No valid target", () => {
      const testStore = new TestStore({
        inkwell: hiramFlavershamToymaker.cost,
        hand: [hiramFlavershamToymaker],
        deck: 3,
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "hand",
        hiramFlavershamToymaker.id,
      );
      cardUnderTest.playFromHand();
      testStore.resolveOptionalAbility();
      testStore.resolveTopOfStack({ targets: [] });

      expect(testStore.stackLayers).toHaveLength(0);
      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({
          hand: 0,
          deck: 3,
          play: 1,
        }),
      );
    });
  });
});
