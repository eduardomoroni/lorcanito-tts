/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { flynnRiderHisOwnBiggestFan } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Flynn Rider - His Own Biggest Fan", () => {
  it("Shift", () => {
    const testStore = new TestStore({
      play: [flynnRiderHisOwnBiggestFan],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      flynnRiderHisOwnBiggestFan.id,
    );

    expect(cardUnderTest.hasShift).toEqual(true);
  });

  it("Evasive", () => {
    const testStore = new TestStore({
      play: [flynnRiderHisOwnBiggestFan],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      flynnRiderHisOwnBiggestFan.id,
    );

    expect(cardUnderTest.hasEvasive).toEqual(true);
  });

  describe("**ONE LAST, BIG SCORE** This character gets -1 ◆ for each card in your opponents' hands.", () => {
    it("Zero cards in opponent's hand", () => {
      const testStore = new TestStore(
        {
          play: [flynnRiderHisOwnBiggestFan],
        },
        {
          hand: [],
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        flynnRiderHisOwnBiggestFan.id,
      );

      expect(cardUnderTest.lore).toEqual(4);
    });

    it("One card in opponent's hand", () => {
      const testStore = new TestStore(
        {
          play: [flynnRiderHisOwnBiggestFan],
        },
        {
          hand: 1,
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        flynnRiderHisOwnBiggestFan.id,
      );

      expect(cardUnderTest.lore).toEqual(3);
    });

    it("Two cards in opponent's hand", () => {
      const testStore = new TestStore(
        {
          play: [flynnRiderHisOwnBiggestFan],
        },
        {
          hand: 2,
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        flynnRiderHisOwnBiggestFan.id,
      );

      expect(cardUnderTest.lore).toEqual(2);
    });

    it("Four cards in opponent's hand", () => {
      const testStore = new TestStore(
        {
          play: [flynnRiderHisOwnBiggestFan],
        },
        {
          hand: 4,
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        flynnRiderHisOwnBiggestFan.id,
      );

      expect(cardUnderTest.lore).toEqual(0);
    });
  });
});
