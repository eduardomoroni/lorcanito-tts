/**
 * @jest-environment node
 */

import { TestStore } from "~/engine/rules/testStore";
import { partOfOurWorld } from "~/engine/cards/TFC/songs/songs";
import { arielOnHumanLegs } from "~/engine/cards/TFC/characters/characters";
import { expect } from "@jest/globals";

describe("Voiceless keywords", () => {
  it("Does NOT sing if character has voiceless", () => {
    const testStore = new TestStore({
      play: [arielOnHumanLegs],
      hand: [partOfOurWorld],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", arielOnHumanLegs.id);
    const songToSing = testStore.getByZoneAndId("hand", partOfOurWorld.id);

    expect(cardUnderTest.ready).toEqual(true);
    expect(cardUnderTest.meta.playedThisTurn).toBeFalsy();

    cardUnderTest.sing(songToSing);

    expect(cardUnderTest.ready).toEqual(true);
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({
        hand: 1,
        play: 1,
      }),
    );
  });
});
