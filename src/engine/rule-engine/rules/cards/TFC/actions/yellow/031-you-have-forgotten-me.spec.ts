/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import {
  magicBroomBucketBrigade,
  aladdinHeroicOutlaw,
} from "~/engine/cards/TFC";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { youHaveForgottenMe } from "~/engine/cards/TFC/actions";

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
      }
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      youHaveForgottenMe.id
    );

    cardUnderTest.playFromHand();

    expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({ hand: 0, deck: 0, discard: 1, play: 1 })
    );
    expect(testStore.getZonesCardCount("player_two")).toEqual(
      expect.objectContaining({ hand: 0, deck: 0, discard: 2 })
    );
  });
});
