/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { shieldOfVirtue } from "@lorcanito/engine/cards/TFC/items/items";

import { heiheiBoatSnack } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Shield of Virtue", () => {
  it("Fireproof - Ready chosen character. They can't quest for the rest of this turn.", () => {
    const testStore = new TestStore({
      inkwell: 3,
      play: [shieldOfVirtue, heiheiBoatSnack],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", shieldOfVirtue.id);
    const target = testStore.getByZoneAndId("play", heiheiBoatSnack.id);

    target.updateCardMeta({ exerted: true });

    cardUnderTest.activate();

    expect(target.meta.exerted).toBeTruthy();
    testStore.resolveTopOfStack({ targetId: target.instanceId });
    expect(target.meta.exerted).toBeFalsy();

    target.quest();

    expect(testStore.store.tableStore.getTable("player_one").lore).toEqual(0);
  });
});
