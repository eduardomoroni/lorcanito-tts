/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { befuddle } from "~/engine/cards/TFC/actions/actions";
import { shieldOfVirtue } from "~/engine/cards/TFC/items/items";
import {simbaProtectiveCub} from "~/engine/cards/TFC/characters/characters";

describe("Befuddle", () => {
  it("Return an opponent character with cost 2.", () => {
    const testStore = new TestStore(
      {
        inkwell: befuddle.cost,
        hand: [befuddle],
      },
      {
        play: [simbaProtectiveCub],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId("hand", befuddle.id);
    const target = testStore.getByZoneAndId(
      "play",
      simbaProtectiveCub.id,
      "player_two",
    );

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("hand");
    expect(testStore.getZonesCardCount("player_two")).toEqual(
      expect.objectContaining({ hand: 1, deck: 0, discard: 0, play: 0 }),
    );
  });

  it("Return self character with cost 2.", () => {
    const testStore = new TestStore({
      inkwell: befuddle.cost,
      hand: [befuddle],
      play: [simbaProtectiveCub],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", befuddle.id);
    const target = testStore.getByZoneAndId("play", simbaProtectiveCub.id);

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("hand");
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 1, deck: 0, discard: 1, play: 0 }),
    );
  });

  it("Return an opponent item with cost 2.", () => {
    const testStore = new TestStore(
      {
        inkwell: befuddle.cost,
        hand: [befuddle],
      },
      {
        play: [shieldOfVirtue],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId("hand", befuddle.id);
    const target = testStore.getByZoneAndId(
      "play",
      shieldOfVirtue.id,
      "player_two",
    );

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("hand");
    expect(testStore.getZonesCardCount("player_two")).toEqual(
      expect.objectContaining({ hand: 1, deck: 0, discard: 0, play: 0 }),
    );
  });

  it("Return self item with cost 2.", () => {
    const testStore = new TestStore({
      inkwell: befuddle.cost,
      hand: [befuddle],
      play: [shieldOfVirtue],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", befuddle.id);
    const target = testStore.getByZoneAndId("play", shieldOfVirtue.id);

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("hand");
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 1, deck: 0, discard: 1, play: 0 }),
    );
  });
});
