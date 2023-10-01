/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { createRuleEngine } from "~/engine/engine";
import { createMockGame } from "~/engine/__mocks__/createGameMock";
import { TestStore } from "~/engine/rules/testStore";
import {
  captainColonelsLieutenant,
  heiheiBoatSnack,
  magicBroomBucketBrigade,
  mickeyMouseTrueFriend,
  moanaOfMotunui,
} from "~/engine/cards/TFC/characters/characters";
const testPlayer = "player_one";
const opponent = "player_two";

describe("Magic Broom - Bucket Brigade", () => {
  it("Weep effect - Own Discard", () => {
    const testStore = new TestStore({
      inkwell: [magicBroomBucketBrigade, magicBroomBucketBrigade],
      hand: [magicBroomBucketBrigade],
      discard: [mickeyMouseTrueFriend, moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      magicBroomBucketBrigade.id,
    );

    expect(testStore.getZonesCardCount("player_one").discard).toEqual(2);

    cardUnderTest.playFromHand();

    expect(testStore.store.stackLayerStore.layers).toHaveLength(1);

    const target = testStore.getByZoneAndId(
      "discard",
      mickeyMouseTrueFriend.id,
    );
    testStore.resolveTopOfStack({ targetId: target.instanceId });

    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
    expect(testStore.getZonesCardCount("player_one")).toEqual(
      expect.objectContaining({
        discard: 1,
        play: 1,
        deck: 1,
      }),
    );
  });

  it("Weep effect - Opponent's Discard", () => {
    const testStore = new TestStore(
      {
        inkwell: [magicBroomBucketBrigade, magicBroomBucketBrigade],
        hand: [magicBroomBucketBrigade],
      },
      {
        discard: [mickeyMouseTrueFriend, moanaOfMotunui],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      magicBroomBucketBrigade.id,
    );

    expect(testStore.getZonesCardCount("player_two").discard).toEqual(2);

    cardUnderTest.playFromHand();

    expect(testStore.store.stackLayerStore.layers).toHaveLength(1);

    const target = testStore.getByZoneAndId(
      "discard",
      mickeyMouseTrueFriend.id,
      "player_two",
    );
    testStore.resolveTopOfStack({ targetId: target.instanceId });

    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
    expect(testStore.getZonesCardCount("player_two")).toEqual(
      expect.objectContaining({
        discard: 1,
        deck: 1,
      }),
    );
  });

  it("Weep effect - Skipping", () => {
    const testStore = new TestStore(
      {
        inkwell: 2,
        discard: [heiheiBoatSnack, captainColonelsLieutenant],
        hand: [magicBroomBucketBrigade],
      },
      {
        discard: [mickeyMouseTrueFriend, moanaOfMotunui],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      magicBroomBucketBrigade.id,
    );

    expect(testStore.getZonesCardCount("player_one").discard).toEqual(2);
    expect(testStore.getZonesCardCount("player_two").discard).toEqual(2);

    cardUnderTest.playFromHand();

    expect(testStore.store.stackLayerStore.layers).toHaveLength(1);

    testStore.resolveTopOfStack({ skip: true });

    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
    expect(testStore.getZonesCardCount("player_two").discard).toEqual(2);
    expect(testStore.getZonesCardCount("player_one")).toEqual(
      expect.objectContaining({
        discard: 2,
        play: 1,
      }),
    );
  });
});
