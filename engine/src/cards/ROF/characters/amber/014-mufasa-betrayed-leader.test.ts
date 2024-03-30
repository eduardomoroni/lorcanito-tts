/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  goofyKnightForADay,
  mufasaBetrayedLeader,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Mufasa - Betrayed Leader", () => {
  it("**THE SUN WILL SET** When this character is banished, you may reveal the top card of your deck. If it's a character card, you may play that character for free and they enter play exerted. Otherwise, put it on the top of your deck.", () => {
    const testStore = new TestStore({
      play: [mufasaBetrayedLeader],
      deck: [goofyKnightForADay],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      mufasaBetrayedLeader.id,
    );
    const target = testStore.getByZoneAndId("deck", goofyKnightForADay.id);

    cardUnderTest.banish();

    expect(testStore.stackLayers).toHaveLength(1);
    testStore.resolveOptionalAbility();

    expect(target.zone).toBe("play");
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ deck: 0 }),
    );
  });
});
