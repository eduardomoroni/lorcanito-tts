/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  grumpyBadTempered,
  happyGoodNatured,
  sleepyNoddingOff,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("[Grumpy - Bad-Tempered] Both players see the bonus the same way.", () => {
  it("As active player", () => {
    const testStore = new TestStore({
      inkwell: grumpyBadTempered.cost,
      play: [grumpyBadTempered, sleepyNoddingOff, happyGoodNatured],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      grumpyBadTempered.id,
    );
    const happy = testStore.getByZoneAndId("play", happyGoodNatured.id);

    expect(happy.strength).toEqual(happyGoodNatured.strength + 1);
  });

  it("As an opponent", () => {
    const testStore = new TestStore(
      {},
      {
        inkwell: grumpyBadTempered.cost,
        play: [grumpyBadTempered, sleepyNoddingOff, happyGoodNatured],
      },
    );

    const happy = testStore.getByZoneAndId(
      "play",
      happyGoodNatured.id,
      "player_two",
    );

    expect(happy.strength).toEqual(happyGoodNatured.strength + 1);
  });
});
