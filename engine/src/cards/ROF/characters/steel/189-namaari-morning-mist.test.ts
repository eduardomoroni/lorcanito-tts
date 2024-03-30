/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  namaariMorningMist,
  robinHoodCapableFighter,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Namaari- Morning Mist", () => {
  it("Bodyguard", () => {
    const testStore = new TestStore({
      hand: [namaariMorningMist],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      namaariMorningMist.id,
    );

    expect(cardUnderTest.hasBodyguard).toBe(true);
  });

  it("**BLADES** This character can challenge ready characters.", () => {
    const testStore = new TestStore(
      {
        hand: [namaariMorningMist],
      },
      { play: [robinHoodCapableFighter] },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      namaariMorningMist.id,
    );
    const defender = testStore.getByZoneAndId(
      "play",
      robinHoodCapableFighter.id,
      "player_two",
    );

    expect(cardUnderTest.canChallenge(defender)).toBe(true);

    cardUnderTest.challenge(defender);

    expect(cardUnderTest.ready).toBe(false);
    expect(cardUnderTest.meta.damage).toBe(defender.strength);
  });
});
