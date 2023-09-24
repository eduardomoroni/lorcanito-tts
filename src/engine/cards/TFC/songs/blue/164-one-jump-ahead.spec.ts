/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { dingleHopper } from "~/engine/cards/TFC/items/items";
import { oneJumpAhead } from "~/engine/cards/TFC/songs/songs";

describe("One Jump Ahead", () => {
  it("Put the top card of your deck into your inkwell facedown and exerted.", () => {
    const testStore = new TestStore({
      inkwell: oneJumpAhead.cost,
      hand: [oneJumpAhead],
      deck: [dingleHopper],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", oneJumpAhead.id);

    cardUnderTest.playFromHand();

    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);

    expect(testStore.getZonesCardCount().inkwell).toEqual(
      oneJumpAhead.cost + 1,
    );
    expect(
      testStore.store.tableStore.getTable("player_one").inkAvailable(),
    ).toEqual(0);
  });
});
