/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";

import {
  jasperCommonCrook,
  johnSilverAlienPirate,
  tinkerBellMostHelpful,
} from "~/engine/cards/TFC/characters/characters";

describe("Tinker Bell - Most Helpful", () => {
  it("**PIXIE DUST** When you play this character, chosen character gains **Evasive** this turn.", () => {
    const testStore = new TestStore({
      inkwell: tinkerBellMostHelpful.cost,
      hand: [tinkerBellMostHelpful],
      play: [johnSilverAlienPirate],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      tinkerBellMostHelpful.id,
    );

    const target = testStore.getByZoneAndId("play", johnSilverAlienPirate.id);

    expect(target.hasEvasive).toBeFalsy();
    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targetId: target.instanceId });
    expect(target.hasEvasive).toBeTruthy();
  });
});
