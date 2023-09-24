/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import {simbaReturnedKing} from "~/engine/cards/TFC/characters/characters";

describe("Simba - Returned King", () => {
    describe("POUNCE: During your turn, this character gains **Evasive**.", () => {
        it("During your turn.", () => {
            const testStore = new TestStore(
                {
                    play: [simbaReturnedKing],
                },
                {
                    play: [simbaReturnedKing],
                },
            );

            const cardUnderTest = testStore.getByZoneAndId(
                "play",
                simbaReturnedKing.id,
            );

            expect(cardUnderTest.hasEvasive).toBeTruthy();
        });

        it("During opponent's turn.", () => {
            const testStore = new TestStore(
                {},
                {
                    play: [simbaReturnedKing],
                },
            );

            const cardUnderTest = testStore.getByZoneAndId(
                "play",
                simbaReturnedKing.id,
                "player_two",
            );

            expect(cardUnderTest.hasEvasive).toBeFalsy();
        });
    });
});
