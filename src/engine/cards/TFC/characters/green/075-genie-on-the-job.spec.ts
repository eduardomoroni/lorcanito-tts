/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { eyeOfTheFate } from "~/engine/cards/TFC/items/items";
import {genieOnTheJob, scarShamelessFirebrand} from "~/engine/cards/TFC/characters/characters";

describe("Genie On The Job", () => {
  it("DISAPPEAR effect - returning own character", () => {
    const testStore = new TestStore({
      inkwell: genieOnTheJob.cost,
      hand: [genieOnTheJob],
      play: [scarShamelessFirebrand],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", genieOnTheJob.id);
    const target = testStore.getByZoneAndId("play", scarShamelessFirebrand.id);
    expect(target.zone).toEqual("play");

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("hand");
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 1, deck: 0, discard: 0, play: 1 }),
    );
  });

  it("DISAPPEAR effect - returning opponents character", () => {
    const testStore = new TestStore(
      {
        inkwell: genieOnTheJob.cost,
        hand: [genieOnTheJob],
      },
      {
        play: [scarShamelessFirebrand],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId("hand", genieOnTheJob.id);
    const target = testStore.getByZoneAndId(
      "play",
      scarShamelessFirebrand.id,
      "player_two",
    );
    expect(target.zone).toEqual("play");

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("hand");
    expect(testStore.getZonesCardCount("player_two")).toEqual(
      expect.objectContaining({ hand: 1, deck: 0, discard: 0, play: 0 }),
    );
  });

  it.failing("DISAPPEAR effect - no valid target", () => {
    const testStore = new TestStore(
      {
        inkwell: genieOnTheJob.cost,
        hand: [genieOnTheJob],
        play: [eyeOfTheFate],
      },
      {
        play: [eyeOfTheFate],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId("hand", genieOnTheJob.id);

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack();

    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 0, deck: 0, discard: 0, play: 2 }),
    );
    expect(testStore.getZonesCardCount("player_two")).toEqual(
      expect.objectContaining({ hand: 0, deck: 0, discard: 0, play: 1 }),
    );
  });
});
