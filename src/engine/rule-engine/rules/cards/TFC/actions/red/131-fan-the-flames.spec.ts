/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { moanaOfMotunui } from "~/engine/cards/TFC";
import { fanTheFlames } from "~/engine/cards/TFC/actions";

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
    expect(testStore.getByZoneAndId("play", moanaOfMotunui.id).meta).toEqual(
      expect.objectContaining({ exerted: true })
    );

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(testStore.getByZoneAndId("play", moanaOfMotunui.id).meta).toEqual(
      expect.objectContaining({ exerted: false })
    );
  });
});
