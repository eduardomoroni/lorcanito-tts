/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { youHaveForgottenMe } from "~/engine/cards/TFC/actions/actions";
import {aladdinHeroicOutlaw, magicBroomBucketBrigade} from "~/engine/cards/TFC/characters/characters";

describe.skip("You Have Forgotten Me", () => {
  it("discard 2 cards", () => {
    const testStore = new TestStore(
      {
        inkwell: youHaveForgottenMe.cost,
        hand: [youHaveForgottenMe],
        play: [magicBroomBucketBrigade],
      },
      {
        hand: [magicBroomBucketBrigade, aladdinHeroicOutlaw],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      youHaveForgottenMe.id,
    );

    cardUnderTest.playFromHand();

    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 0, deck: 0, discard: 1, play: 1 }),
    );
    expect(testStore.getZonesCardCount("player_two")).toEqual(
      expect.objectContaining({ hand: 0, deck: 0, discard: 2 }),
    );
  });
});
