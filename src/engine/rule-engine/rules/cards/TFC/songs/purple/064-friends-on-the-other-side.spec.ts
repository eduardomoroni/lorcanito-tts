/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { friendsOnTheOtherSide } from "~/engine/cards/TFC/songs";

describe("Friends On The Other Side", () => {
  it("Draw 2 cards", () => {
    const testStore = new TestStore({
      deck: 2,
      hand: [friendsOnTheOtherSide],
      inkwell: friendsOnTheOtherSide.cost,
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      friendsOnTheOtherSide.id
    );

    cardUnderTest.playFromHand();

    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 2, deck: 0, discard: 1 })
    );
  });
});
