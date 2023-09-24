/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";

import {auroraBriarRose, mickeyMouseTrueFriend} from "~/engine/cards/TFC/characters/characters";

describe("Aurora Briar Rose!", () => {
    it("DISARMING BEAUTY effect - Chosen characters gets -2 ※ this turn.", () => {
        const testStore = new TestStore({
            inkwell: auroraBriarRose.cost,
            hand: [auroraBriarRose],
            play: [mickeyMouseTrueFriend],
        });

        const cardUnderTest = testStore.getByZoneAndId(
            "hand",
            auroraBriarRose.id
        );
        const target = testStore.getByZoneAndId("play", mickeyMouseTrueFriend.id);

        cardUnderTest.playFromHand();
        testStore.resolveTopOfStack({ targetId: target.instanceId });

        expect(target.strength).toEqual((target.lorcanitoCard.strength || 0) - 2);
    });
});
