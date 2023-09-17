/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { beastMirror, dingleHopper } from "~/engine/cards/TFC/items";

describe("Beast Mirror", () => {
  it("Show Me - Empty hand", () => {
    const testStore = new TestStore({
      deck: 1,
      inkwell: 4,
      play: [beastMirror],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", beastMirror.id);

    expect(
      testStore.store.tableStore.getPlayerZone("player_one", "deck")?.cards
    ).toHaveLength(1);

    cardUnderTest.activate();

    expect(
      testStore.store.tableStore.getPlayerZone("player_one", "deck")?.cards
    ).toHaveLength(0);
  });

  it("Show Me - Non Empty hand", () => {
    const testStore = new TestStore({
      deck: [dingleHopper],
      play: [beastMirror],
      hand: [dingleHopper],
      inkwell: [dingleHopper, dingleHopper, dingleHopper],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", beastMirror.id);

    expect(
      testStore.store.tableStore.getPlayerZone("player_one", "deck")?.cards
    ).toHaveLength(1);

    cardUnderTest.activate();

    expect(cardUnderTest.ready).toBeFalsy();
    expect(
      testStore.store.tableStore.getPlayerZone("player_one", "deck")?.cards
    ).toHaveLength(1);
    expect(
      testStore.store.tableStore.getPlayerZone("player_one", "hand")?.cards
    ).toHaveLength(1);
  });
});
