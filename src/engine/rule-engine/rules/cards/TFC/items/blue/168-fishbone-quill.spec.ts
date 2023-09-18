/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { dingleHopper, fishboneQuill } from "~/engine/cards/TFC/items";

describe("Fishbone Quill", () => {
  it("Go Ahead And Sign", () => {
    const testStore = new TestStore({
      hand: [dingleHopper],
      play: [fishboneQuill],
    });
    const store = testStore.store;
    const tableStore = store.tableStore;

    const cardUnderTest = testStore.getByZoneAndId("play", fishboneQuill.id);

    expect(
      tableStore.getPlayerZone("player_one", "inkwell")?.cards
    ).toHaveLength(0);
    expect(tableStore.getPlayerZone("player_one", "hand")?.cards).toHaveLength(
      1
    );

    cardUnderTest.activate();

    const effect = store.stackLayerStore.layers[0];
    if (effect) {
      const target = testStore.getByZoneAndId("hand", dingleHopper.id);

      store.stackLayerStore.resolveLayer(effect.id, {
        targetId: target.instanceId,
      });
    }

    expect(
      tableStore.getPlayerZone("player_one", "inkwell")?.cards
    ).toHaveLength(1);
    expect(tableStore.getPlayerZone("player_one", "hand")?.cards).toHaveLength(
      0
    );
    expect(store.stackLayerStore.layers).toHaveLength(0);
  });
});
