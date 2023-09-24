/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";

import {annaHeirToArrendelle, elsaIceSurfer} from "~/engine/cards/TFC/characters/characters";

describe("Elsa Ice Surfer", () => {
    it("THAT'S NO BLIZZARD effect - Whenever you play a character named Anna, ready this character. This character can't quest for the rest of this turn.", () => {
        const testStore = new TestStore({
            inkwell: annaHeirToArrendelle.cost,
            play: [elsaIceSurfer],
            hand: [annaHeirToArrendelle]
        });

        const cardUnderTest = testStore.getByZoneAndId("play", elsaIceSurfer.id);
        const targetTrigger = testStore.getByZoneAndId("hand", annaHeirToArrendelle.id);
        cardUnderTest.updateCardMeta({ exerted: true });

        targetTrigger.playFromHand();

        expect(cardUnderTest.meta).toEqual(
            expect.objectContaining({ exerted: false })
        );
    });

});
