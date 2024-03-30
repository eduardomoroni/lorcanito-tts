/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  bibbidiBobbidiBoo,
  hypnotize,
} from "@lorcanito/engine/cards/ROF/actions/actions";

describe("Hypnotize", () => {
  it("Each opponent chooses and discards a card. Draw a card.", () => {
    const testStore = new TestStore(
      {
        deck: 2,
        inkwell: hypnotize.cost,
        hand: [hypnotize],
      },
      {
        deck: 2,
        hand: [bibbidiBobbidiBoo],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId("hand", hypnotize.id);
    const target = testStore.getByZoneAndId(
      "hand",
      bibbidiBobbidiBoo.id,
      "player_two",
    );

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targets: [target] });

    expect(testStore.getZonesCardCount("player_two")).toEqual(
      expect.objectContaining({
        hand: 0,
        deck: 2,
        discard: 1,
      }),
    );
    expect(testStore.getZonesCardCount("player_one")).toEqual(
      expect.objectContaining({
        hand: 1,
        deck: 1,
      }),
    );
  });
});
