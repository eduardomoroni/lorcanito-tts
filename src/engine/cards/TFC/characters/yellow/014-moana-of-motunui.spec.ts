/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";

import {
    cinderellaGentleAndKind,
    johnSilverAlienPirate, moanaOfMotunui,
    rapunzelGiftedWithHealing
} from "~/engine/cards/TFC/characters/characters";

describe("Moana Of Motunui", () => {
    it("WE FIX IT effect- Ready All Princess", () => {
        const testStore = new TestStore({
            play: [moanaOfMotunui, cinderellaGentleAndKind, rapunzelGiftedWithHealing],
        });

        const cardUnderTest = testStore.getByZoneAndId("play", moanaOfMotunui.id);
        const target = testStore.getByZoneAndId("play", cinderellaGentleAndKind.id);
        const anotherTarget = testStore.getByZoneAndId("play", rapunzelGiftedWithHealing.id);
        cardUnderTest.updateCardMeta({ exerted: false });
        target.updateCardMeta({ exerted: true });
        anotherTarget.updateCardMeta({ exerted: true });
        expect(testStore.getByZoneAndId("play", moanaOfMotunui.id).meta).toEqual(
            expect.objectContaining({ exerted: false })
        );

        cardUnderTest.quest();

        testStore.resolveTopOfStack();

        expect(testStore.getByZoneAndId("play", cinderellaGentleAndKind.id).meta).toEqual(
            expect.objectContaining({ exerted: false })
        );
        expect(testStore.getByZoneAndId("play", rapunzelGiftedWithHealing.id).meta).toEqual(
            expect.objectContaining({ exerted: false })
        );
    });

    it("WE FIX IT effect- Should ready only all princess", () => {
        const testStore = new TestStore({
            play: [moanaOfMotunui, cinderellaGentleAndKind, rapunzelGiftedWithHealing, johnSilverAlienPirate],
        });

        const cardUnderTest = testStore.getByZoneAndId("play", moanaOfMotunui.id);
        const target = testStore.getByZoneAndId("play", cinderellaGentleAndKind.id);
        const anotherTarget = testStore.getByZoneAndId("play", rapunzelGiftedWithHealing.id);
        const shouldNoBeTarget = testStore.getByZoneAndId("play", johnSilverAlienPirate.id);
        cardUnderTest.updateCardMeta({ exerted: false });
        target.updateCardMeta({ exerted: true });
        anotherTarget.updateCardMeta({ exerted: true });
        shouldNoBeTarget.updateCardMeta({ exerted: true });
        expect(testStore.getByZoneAndId("play", moanaOfMotunui.id).meta).toEqual(
            expect.objectContaining({ exerted: false })
        );

        cardUnderTest.quest();

        testStore.resolveTopOfStack();

        expect(testStore.getByZoneAndId("play", cinderellaGentleAndKind.id).meta).toEqual(
            expect.objectContaining({ exerted: false })
        );
        expect(testStore.getByZoneAndId("play", rapunzelGiftedWithHealing.id).meta).toEqual(
            expect.objectContaining({ exerted: false })
        );
        expect(testStore.getByZoneAndId("play", johnSilverAlienPirate.id).meta).toEqual(
            expect.objectContaining({ exerted: true })
        );
    });
});
