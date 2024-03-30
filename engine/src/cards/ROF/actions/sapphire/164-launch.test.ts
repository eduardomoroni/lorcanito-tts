/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { launch } from "@lorcanito/engine/cards/ROF/actions/actions";
import { goofyKnightForADay } from "@lorcanito/engine/cards/ROF/characters/characters";
import { pawpsicle } from "@lorcanito/engine/cards/ROF/items/items";

describe("Launch", () => {
  it("Banish chosen item of yours to deal 5 damage to chosen character.", () => {
    const testStore = new TestStore(
      {
        inkwell: launch.cost,
        hand: [launch],
        play: [pawpsicle],
      },
      {
        play: [goofyKnightForADay],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId("hand", launch.id);
    const item = testStore.getByZoneAndId("play", pawpsicle.id);
    const target = testStore.getByZoneAndId(
      "play",
      goofyKnightForADay.id,
      "player_two",
    );

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targets: [item] }, true);
    testStore.resolveTopOfStack({
      targets: [target],
    });

    expect(cardUnderTest.zone).toBe("discard");
    expect(item.zone).toBe("discard");
    expect(target.meta.damage).toBe(5);
  });
});
