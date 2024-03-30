/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { snowWhiteLostInTheForest } from "@lorcanito/engine/cards/ROF/characters/characters";
import { donaldDuckMusketeer } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Snow White - Lost in the Forest", () => {
  it("**I WON'T HURT YOU** When you play this character, you may remove up to 2 damage from chosen character.", () => {
    const testStore = new TestStore({
      inkwell: snowWhiteLostInTheForest.cost,
      hand: [snowWhiteLostInTheForest],
      play: [donaldDuckMusketeer],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      snowWhiteLostInTheForest.id,
    );
    const target = testStore.getByZoneAndId("play", donaldDuckMusketeer.id);

    target.updateCardMeta({ damage: 3 });

    cardUnderTest.playFromHand();

    testStore.resolveOptionalAbility();
    testStore.resolveTopOfStack({ targets: [target] });

    expect(cardUnderTest.zone).toEqual("play");
    expect(target.meta.damage).toEqual(1);
  });
});
