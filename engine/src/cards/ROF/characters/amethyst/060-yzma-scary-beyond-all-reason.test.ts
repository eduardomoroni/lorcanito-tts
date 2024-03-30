/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  goofyKnightForADay,
  yzmaScaryBeyondAllReason,
} from "@lorcanito/engine/cards/ROF/characters/characters";
import { mauiDemiGod } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Yzma - Scary Beyond All Reason", () => {
  describe("**CRUEL IRONY** When you play this character, shuffle another chosen character card into their player's deck. That player draws 2 cards.", () => {
    it("Targeting opponent's card", () => {
      const testStore = new TestStore(
        {
          inkwell: yzmaScaryBeyondAllReason.cost,
          hand: [yzmaScaryBeyondAllReason],
          play: [goofyKnightForADay],
        },
        {
          play: [mauiDemiGod],
          deck: 6,
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "hand",
        yzmaScaryBeyondAllReason.id,
      );
      const target = testStore.getByZoneAndId(
        "play",
        mauiDemiGod.id,
        "player_two",
      );

      cardUnderTest.playFromHand();
      testStore.resolveTopOfStack({ targets: [target] });

      expect(target.zone).toBe("deck");
      expect(testStore.getZonesCardCount("player_two")).toEqual(
        expect.objectContaining({
          deck: 4 + 1, // Maui is shuffled back into the deck
          hand: 2,
          play: 0,
        }),
      );
    });

    it("Targeting your own card", () => {
      const testStore = new TestStore(
        {
          inkwell: yzmaScaryBeyondAllReason.cost,
          hand: [yzmaScaryBeyondAllReason],
          play: [goofyKnightForADay],
          deck: 6,
        },
        {
          play: [mauiDemiGod],
          deck: 3,
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "hand",
        yzmaScaryBeyondAllReason.id,
      );
      const target = testStore.getByZoneAndId("play", goofyKnightForADay.id);

      cardUnderTest.playFromHand();
      testStore.resolveTopOfStack({ targets: [target] });

      expect(target.zone).toBe("deck");
      expect(testStore.getZonesCardCount("player_one")).toEqual(
        expect.objectContaining({
          deck: 4 + 1, // goofyKnightForADay is shuffled back into the deck
          hand: 2,
        }),
      );
      expect(testStore.getZonesCardCount("player_two")).toEqual(
        expect.objectContaining({
          deck: 3,
          hand: 0,
          play: 1,
        }),
      );
    });
  });

  it("Shift", () => {
    const testStore = new TestStore({
      play: [yzmaScaryBeyondAllReason],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      yzmaScaryBeyondAllReason.id,
    );

    expect(cardUnderTest.hasShift).toBe(true);
  });
});
