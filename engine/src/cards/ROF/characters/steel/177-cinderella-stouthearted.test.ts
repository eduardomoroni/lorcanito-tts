/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  christopherRobinAdventurer,
  cinderellaStouthearted,
} from "@lorcanito/engine/cards/ROF/characters/characters";
import { grabYourSword } from "@lorcanito/engine/cards/TFC/songs/songs";

describe("Cinderella- Stouthearted", () => {
  it("Shift", () => {
    const testStore = new TestStore({
      play: [cinderellaStouthearted],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      cinderellaStouthearted.id,
    );

    expect(cardUnderTest.hasShift).toBeTruthy();
  });

  it("Resist", () => {
    const testStore = new TestStore({
      play: [cinderellaStouthearted],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      cinderellaStouthearted.id,
    );

    expect(cardUnderTest.hasResist).toBeTruthy();
  });

  it("**THE SINGING SWORD** Whenever you play a song, this character may challenge ready characters this turn.", () => {
    const testStore = new TestStore(
      {
        inkwell: grabYourSword.cost,
        hand: [grabYourSword],
        play: [cinderellaStouthearted],
      },
      { play: [christopherRobinAdventurer] },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      cinderellaStouthearted.id,
    );
    const defender = testStore.getByZoneAndId(
      "play",
      christopherRobinAdventurer.id,
      "player_two",
    );
    const song = testStore.getByZoneAndId("hand", grabYourSword.id);

    expect(cardUnderTest.canChallenge(defender)).toBeFalsy();
    expect(defender.canBeChallenged(cardUnderTest)).toBeFalsy();

    song.playFromHand();

    expect(defender.canBeChallenged(cardUnderTest)).toBeTruthy();
    expect(cardUnderTest.canChallenge(defender)).toBeTruthy();
  });
});
