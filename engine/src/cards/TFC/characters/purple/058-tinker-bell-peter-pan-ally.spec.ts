/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  peterPanFearless,
  peterPanNeverLanding,
  tinkerBellPeterPan,
} from "@lorcanito/engine/cards/TFC/characters/characters";
import { peterPansShadowNotSewnOn } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Tinker Bell - Peter Pan's Ally", () => {
  it("Evasive", () => {
    const testStore = new TestStore({
      play: [tinkerBellPeterPan],
    });
    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      tinkerBellPeterPan.id,
    );

    expect(cardUnderTest.hasEvasive).toEqual(true);
  });

  it("**LOYAL AND DEVOTED** Your characters named Peter Pan gain **Challenger +1.** _(They get +1 ※ while challenging.)_", () => {
    const testStore = new TestStore({
      play: [
        tinkerBellPeterPan,
        peterPanFearless,
        peterPanNeverLanding,
        peterPansShadowNotSewnOn,
      ],
    });

    const peterOne = testStore.getByZoneAndId("play", peterPanFearless.id);
    const peterTwo = testStore.getByZoneAndId("play", peterPanNeverLanding.id);
    const notPeter = testStore.getByZoneAndId(
      "play",
      peterPansShadowNotSewnOn.id,
    );

    expect(notPeter.hasChallenger).toEqual(false);
    [peterOne, peterTwo].forEach((peter) => {
      expect(peter.hasChallenger).toEqual(true);
    });
  });
});
