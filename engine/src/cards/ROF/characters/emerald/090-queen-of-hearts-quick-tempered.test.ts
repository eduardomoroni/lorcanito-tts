/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { queenOfHeartsQuickTempered } from "@lorcanito/engine/cards/ROF/characters/characters";
import { mickeyMouseTrueFriend } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Queen of Hearts - Quick-Tempered", () => {
  it("**ROYALE RAGE** When you play this character, deal 1 damage to chosen damaged opposing character.", () => {
    const testStore = new TestStore(
      {
        inkwell: queenOfHeartsQuickTempered.cost,
        hand: [queenOfHeartsQuickTempered],
      },
      {
        play: [mickeyMouseTrueFriend],
      },
    );

    const target = testStore.getByZoneAndId(
      "play",
      mickeyMouseTrueFriend.id,
      "player_two",
    );
    target.updateCardMeta({ damage: 1 });
    expect(target.meta).toEqual(expect.objectContaining({ damage: 1 }));

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      queenOfHeartsQuickTempered.id,
    );

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targets: [target] });

    expect(target.meta).toEqual(expect.objectContaining({ damage: 2 }));
    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
  });
});
