/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { aladdinHeroicOutlaw } from "~/engine/cards/TFC";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { smash } from "~/engine/cards/TFC/actions";

describe("Smash", () => {
  it("Deal 3 damage to chosen character", () => {
    const testStore = new TestStore({
      inkwell: smash.cost,
      hand: [smash],
      play: [aladdinHeroicOutlaw],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", smash.id);
    const target = testStore.getByZoneAndId("play", aladdinHeroicOutlaw.id);
    target.updateCardMeta({ damage: 0 });
    expect(
      testStore.getByZoneAndId("play", aladdinHeroicOutlaw.id).meta
    ).toEqual(expect.objectContaining({ damage: 0 }));

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(
      testStore.getByZoneAndId("play", aladdinHeroicOutlaw.id).meta
    ).toEqual(expect.objectContaining({ damage: 3 }));
  });
});
