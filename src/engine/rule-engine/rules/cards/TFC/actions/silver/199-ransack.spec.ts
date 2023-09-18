/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import {
    magicBroomBucketBrigade,
    aladdinHeroicOutlaw,
} from "~/engine/cards/TFC";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { ransack, youHaveForgottenMe } from "~/engine/cards/TFC/actions";

describe.skip("Ransack", () => {
    it("draw 2 cards and discard 2 cards", () => {
        const testStore = new TestStore(
            {
                inkwell: ransack.cost,
                deck: [youHaveForgottenMe, youHaveForgottenMe],
                hand: [ransack, aladdinHeroicOutlaw],
                play: [magicBroomBucketBrigade],
            }
        );

        const cardUnderTest = testStore.getByZoneAndId(
            "hand",
            ransack.id
        );

        cardUnderTest.playFromHand();

        expect(testStore.getZonesCardCount()).toEqual(
            expect.objectContaining({ hand: 1, deck: 0, play: 1, discard: 3 })
        );
    });
});
