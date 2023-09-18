/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { aladdinHeroicOutlaw } from "~/engine/cards/TFC";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { stampede } from "~/engine/cards/TFC/actions";

describe("Stampede", () => {
    it("Deal 2 damage to chosen damaged character.", () => {
        const testStore = new TestStore({
            inkwell: stampede.cost,
            hand: [stampede],
            play: [aladdinHeroicOutlaw],
        });

        const cardUnderTest = testStore.getByZoneAndId("hand", stampede.id);
        const target = testStore.getByZoneAndId("play", aladdinHeroicOutlaw.id);
        target.updateCardMeta({ damage: 2 });
        expect(
            testStore.getByZoneAndId("play", aladdinHeroicOutlaw.id).meta
        ).toEqual(expect.objectContaining({ damage: 2 }));

        cardUnderTest.playFromHand();

        testStore.resolveTopOfStack({
            targetId: target.instanceId,
        });

        expect(
            testStore.getByZoneAndId("play", aladdinHeroicOutlaw.id).meta
        ).toEqual(expect.objectContaining({ damage: 4 }));
    });
});
