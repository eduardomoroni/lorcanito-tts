/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import {
  magicBroomBucketBrigade,
  moanaOfMotunui,
  teKaTheBurningOne,
} from "~/engine/cards/TFC";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { aWholeNewWorld } from "~/engine/cards/TFC/songs";
import { dingleHopper } from "~/engine/cards/TFC/items";

describe("A Whole New World", () => {
  it("Each player discards their hand and draws 7 cards.", () => {
    const testStore = new TestStore(
      {
        inkwell: aWholeNewWorld.cost,
        hand: [dingleHopper, aWholeNewWorld],
        deck: 7,
      },
      {
        hand: [magicBroomBucketBrigade, teKaTheBurningOne, moanaOfMotunui],
        deck: 7,
      }
    );

    testStore.store.playCardFromHand(
      testStore.getByZoneAndId("hand", aWholeNewWorld.id).instanceId
    );

    expect(testStore.getZonesCardCount("player_one")).toEqual(
      expect.objectContaining({ hand: 7, discard: 2, deck: 0 })
    );
    expect(testStore.getZonesCardCount("player_two")).toEqual(
      expect.objectContaining({ hand: 7, discard: 3, deck: 0 })
    );
  });
});
