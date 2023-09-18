/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { developYourBrain } from "~/engine/cards/TFC/actions";
import { shieldOfVirtue } from "~/engine/cards/TFC/items";
import {chiefTui, heiheiBoatSnack, moanaOfMotunui} from "~/engine/cards/TFC";
import {CardModel} from "~/store/models/CardModel";

describe("Develop Your Brain", () => {
    it("Look at the top 2 cards of your deck. Put one into your hand and the other on the bottom of the deck.", () => {
        const testStore = new TestStore(
            {
                inkwell: developYourBrain.cost,
                hand: [developYourBrain],
                deck: [shieldOfVirtue, heiheiBoatSnack, chiefTui, moanaOfMotunui],
            },
        );

        const cardUnderTest = testStore.getByZoneAndId("hand", developYourBrain.id);
        const first = testStore.getByZoneAndId("deck", moanaOfMotunui.id);
        const second = testStore.getByZoneAndId("deck", chiefTui.id);
        const third = testStore.getByZoneAndId("deck", heiheiBoatSnack.id);
        const fourth = testStore.getByZoneAndId("deck", shieldOfVirtue.id);

        cardUnderTest.playFromHand();

        const bottom: CardModel[] = [first]

        testStore.resolveTopOfStack({ scry: { bottom, hand: [second] } });

        const deck = testStore.store.tableStore
            .getPlayerZoneCards("player_one", "deck")
            .map((card) => card.lorcanitoCard?.name);

        expect(deck).toEqual([
            first.lorcanitoCard?.name,
            fourth.lorcanitoCard?.name,
            third.lorcanitoCard?.name,
        ])
        expect(second.zone).toEqual("hand");
    });
});
