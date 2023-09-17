/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { bePrepared, letItGo } from "~/engine/cards/TFC/songs";
import {
  chiefTui,
  heiheiBoatSnack,
  mickeyMouseArtfulRogue,
  mickeyMouseTrueFriend,
  moanaOfMotunui,
} from "~/engine/cards/TFC";

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
      }
    );

    const cardUnderTest = testStore.getByZoneAndId("hand", bePrepared.id);

    cardUnderTest.playFromHand();

    expect(testStore.getZonesCardCount("player_one")).toEqual(
      expect.objectContaining({ play: 0 })
    );
    expect(testStore.getZonesCardCount("player_two")).toEqual(
      expect.objectContaining({ play: 0 })
    );
  });
});