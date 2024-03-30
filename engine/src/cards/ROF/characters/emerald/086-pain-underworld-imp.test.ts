/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  painUnderworldImp,
  panicUnderworldImp,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Pain - Underworld Imp", () => {
  it("**COMING, YOUR MOST LUGUBRIOUSNESS** While this character has 5 ※ or more, he gets + 2 ◆.", () => {
    const testStore = new TestStore({
      inkwell: panicUnderworldImp.cost,
      hand: [panicUnderworldImp],
      play: [painUnderworldImp],
    });

    const buff = testStore.getByZoneAndId("hand", panicUnderworldImp.id);
    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      painUnderworldImp.id,
    );

    buff.playFromHand();
    testStore.resolveTopOfStack({ targets: [cardUnderTest] });

    expect(cardUnderTest.strength).toBe(painUnderworldImp.strength + 4);
    expect(cardUnderTest.lore).toBe(painUnderworldImp.lore + 2);
  });
});
