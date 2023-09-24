/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import {
  ransack,
  youHaveForgottenMe,
} from "~/engine/cards/TFC/actions/actions";
import {aladdinHeroicOutlaw, magicBroomBucketBrigade, simbaFutureKing} from "~/engine/cards/TFC/characters/characters";

describe("Simba - Future King", () => {
  it("**GUESS WHAT?** When you play this character, you may draw a card, then choose and discard a card.", () => {
    const testStore = new TestStore({
      inkwell: simbaFutureKing.cost,
      deck: [magicBroomBucketBrigade, youHaveForgottenMe],
      hand: [simbaFutureKing, aladdinHeroicOutlaw],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", simbaFutureKing.id);

    const aCardToDiscard = testStore.getByZoneAndId(
      "hand",
      aladdinHeroicOutlaw.id,
    );

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({
      targets: [aCardToDiscard],
    });

    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 1, deck: 1, play: 1, discard: 1 }),
    );
  });
});
