/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { dingleHopper, magicMirror } from "~/engine/cards/TFC/items/items";

describe("Magic Mirror", () => {
  it("Speak - Drawing one", () => {
    const testStore = new TestStore({
      deck: [dingleHopper],
      play: [magicMirror],
      inkwell: [dingleHopper, dingleHopper, dingleHopper, dingleHopper],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", magicMirror.id);

    expect(
      testStore.store.tableStore.getPlayerZone("player_one", "deck")?.cards,
    ).toHaveLength(1);

    cardUnderTest.activate();

    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 1, deck: 0 }),
    );
  });
});
