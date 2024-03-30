/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";

import {
  maleficentMonstrousDragon,
  moanaOfMotunui,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Maleficent Monstrous Dragon", () => {
  it("**Dragon Fire** When you play this character, you may banish chosen character.", () => {
    const testStore = new TestStore({
      inkwell: maleficentMonstrousDragon.cost,
      hand: [maleficentMonstrousDragon],
      play: [moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      maleficentMonstrousDragon.id,
    );
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("discard");
  });
});
