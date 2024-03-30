/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { jasmineHeirOfAgrabah } from "@lorcanito/engine/cards/ROF/characters/characters";
import { donaldDuckMusketeer } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Jasmine - Heir of Agrabah", () => {
  it("**I'M A FAST LEARNER** When you play this character, remove up to 1 damage from chosen character of yours.", () => {
    const testStore = new TestStore({
      inkwell: jasmineHeirOfAgrabah.cost,
      hand: [jasmineHeirOfAgrabah],
      play: [donaldDuckMusketeer],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      jasmineHeirOfAgrabah.id,
    );
    const target = testStore.getByZoneAndId("play", donaldDuckMusketeer.id);

    target.updateCardMeta({ damage: 2 });

    cardUnderTest.playFromHand();

    testStore.resolveOptionalAbility();
    testStore.resolveTopOfStack({ targetId: target.instanceId });

    expect(cardUnderTest.zone).toEqual("play");
    expect(target.meta.damage).toEqual(1);
  });
});
