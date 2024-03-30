/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { fanTheFlames } from "@lorcanito/engine/cards/TFC/actions/actions";
import { moanaOfMotunui } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Fan The Flames", () => {
  it("Ready chosen character. They can't quest for the rest of this turn.", () => {
    const testStore = new TestStore({
      inkwell: fanTheFlames.cost,
      hand: [fanTheFlames],
      play: [moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", fanTheFlames.id);
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    target.updateCardMeta({ exerted: true });
    expect(target.meta).toEqual(expect.objectContaining({ exerted: true }));

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.meta).toEqual(expect.objectContaining({ exerted: false }));
    expect(target.hasQuestRestriction).toBe(true);
  });
});
