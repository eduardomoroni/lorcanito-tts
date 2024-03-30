/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { fireTheCannons } from "@lorcanito/engine/cards/TFC/actions/actions";
import { moanaOfMotunui } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Fire The Cannons!", () => {
  it("Deal 2 damage to chosen character", () => {
    const testStore = new TestStore({
      inkwell: fireTheCannons.cost,
      hand: [fireTheCannons],
      play: [moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", fireTheCannons.id);
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);
    target.updateCardMeta({ damage: 0 });
    expect(target.meta).toEqual(expect.objectContaining({ damage: 0 }));

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.meta).toEqual(expect.objectContaining({ damage: 2 }));
  });
});
