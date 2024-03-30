/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { aWholeNewWorld } from "@lorcanito/engine/cards/TFC/songs/songs";
import { dingleHopper } from "@lorcanito/engine/cards/TFC/items/items";
import {
  magicBroomBucketBrigade,
  moanaOfMotunui,
  teKaTheBurningOne,
} from "@lorcanito/engine/cards/TFC/characters/characters";

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
      },
    );

    testStore.store.playCardFromHand(
      testStore.getByZoneAndId("hand", aWholeNewWorld.id).instanceId,
    );

    expect(testStore.getZonesCardCount("player_one")).toEqual(
      expect.objectContaining({ hand: 7, discard: 2, deck: 0 }),
    );
    expect(testStore.getZonesCardCount("player_two")).toEqual(
      expect.objectContaining({ hand: 7, discard: 3, deck: 0 }),
    );
  });
});
