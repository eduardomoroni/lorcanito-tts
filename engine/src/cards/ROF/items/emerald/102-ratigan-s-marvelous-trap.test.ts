/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { ratigansMarvelousTrap } from "@lorcanito/engine/cards/ROF/items/items";

describe("Ratigan's Marvelous Trap", () => {
  it("**SNAP! BOOM! TWANG!** Banish this item − Each opponent loses 2 lore.", () => {
    const initialLore = 3;

    const testStore = new TestStore(
      {
        play: [ratigansMarvelousTrap],
      },
      {
        lore: initialLore,
      },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      ratigansMarvelousTrap.id,
    );

    cardUnderTest.activate();

    expect(cardUnderTest.zone).toEqual("discard");
    expect(testStore.getPlayerLore("player_two")).toEqual(initialLore - 2);
  });
});
