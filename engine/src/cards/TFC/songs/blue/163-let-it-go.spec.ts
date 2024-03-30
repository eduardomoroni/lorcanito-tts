/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { letItGo } from "@lorcanito/engine/cards/TFC/songs/songs";

import { moanaOfMotunui } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Let it Go", () => {
  it("Adds your own char to inkwell", () => {
    const testStore = new TestStore({
      inkwell: letItGo.cost,
      hand: [letItGo],
      play: [moanaOfMotunui],
    });
    const store = testStore.store;
    const tableStore = store.tableStore;

    const cardUnderTest = testStore.getByZoneAndId("hand", letItGo.id);
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({
      targets: [target],
    });

    expect(
      tableStore.getPlayerZone("player_one", "inkwell")?.cards,
    ).toHaveLength(letItGo.cost + 1);
    expect(target.zone).toEqual("inkwell");
    expect(target.ready).toBeFalsy();
  });

  it("Adds opponent's char to inkwell", () => {
    const testStore = new TestStore(
      {
        inkwell: letItGo.cost,
        hand: [letItGo],
      },
      {
        play: [moanaOfMotunui],
      },
    );
    const store = testStore.store;
    const tableStore = store.tableStore;

    const cardUnderTest = testStore.getByZoneAndId("hand", letItGo.id);
    const target = testStore.getByZoneAndId(
      "play",
      moanaOfMotunui.id,
      "player_two",
    );

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(
      tableStore.getPlayerZone("player_two", "inkwell")?.cards,
    ).toHaveLength(1);
    expect(target.zone).toEqual("inkwell");
    expect(target.ready).toBeFalsy();
  });
});
