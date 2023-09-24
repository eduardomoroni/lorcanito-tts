/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";

import {scarMastermind, tamatoaSoShiny} from "~/engine/cards/TFC/characters/characters";

describe("Scar Mastermind", () => {
    it("DISARMING BEUATY effect - Chosen characters gets -2 ※ this turn.", () => {
        const testStore = new TestStore({
            inkwell: scarMastermind.cost,
            hand: [scarMastermind],

        }, {
            play: [tamatoaSoShiny],
        });

        const cardUnderTest = testStore.getByZoneAndId(
            "hand",
            scarMastermind.id
        );
        const target = testStore.getByZoneAndId("play", tamatoaSoShiny.id, "player_two");

        cardUnderTest.playFromHand();
        testStore.resolveTopOfStack({ targetId: target.instanceId });

        expect(target.strength).toEqual((target.lorcanitoCard.strength || 0) - 5);
    });
});
