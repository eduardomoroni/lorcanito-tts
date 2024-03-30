/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { bePrepared, letItGo } from "@lorcanito/engine/cards/TFC/songs/songs";

import {
  chiefTui,
  heiheiBoatSnack,
  mickeyMouseArtfulRogue,
  mickeyMouseTrueFriend,
  moanaOfMotunui,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Be Prepared", () => {
  it("Board wipe", () => {
    const testStore = new TestStore(
      {
        inkwell: bePrepared.cost,
        hand: [bePrepared],
        play: [chiefTui, moanaOfMotunui, heiheiBoatSnack],
      },
      {
        play: [mickeyMouseTrueFriend, mickeyMouseArtfulRogue],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId("hand", bePrepared.id);

    cardUnderTest.playFromHand();

    expect(testStore.getZonesCardCount("player_one")).toEqual(
      expect.objectContaining({ play: 0 }),
    );
    expect(testStore.getZonesCardCount("player_two")).toEqual(
      expect.objectContaining({ play: 0 }),
    );
  });
});
