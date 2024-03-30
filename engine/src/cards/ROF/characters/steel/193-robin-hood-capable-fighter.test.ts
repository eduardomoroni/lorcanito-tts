/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  princeNaveenPennilessRoyal,
  robinHoodCapableFighter,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Robin Hood- Capable Fighter", () => {
  it("**SKIRMISH** ↷ − Deal 1 damage to chosen character.", () => {
    const testStore = new TestStore({
      inkwell: robinHoodCapableFighter.cost,
      hand: [robinHoodCapableFighter],
      play: [princeNaveenPennilessRoyal],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      robinHoodCapableFighter.id,
    );
    const target = testStore.getByZoneAndId(
      "play",
      princeNaveenPennilessRoyal.id,
    );

    cardUnderTest.activate();
    testStore.resolveTopOfStack({ targets: [target] });

    expect(target.meta.damage).toEqual(1);
  });
});
