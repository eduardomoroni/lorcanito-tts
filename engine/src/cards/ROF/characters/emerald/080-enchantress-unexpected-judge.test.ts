/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  enchantressUnexpectedJudge,
  goofyKnightForADay,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Enchantress - Unexpected Judge", () => {
  it("**TRUE FORM** While being challenged, this character gets +2 ※.", () => {
    const testStore = new TestStore(
      {
        play: [goofyKnightForADay],
      },
      {
        play: [enchantressUnexpectedJudge],
      },
    );

    const challenger = testStore.getByZoneAndId("play", goofyKnightForADay.id);
    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      enchantressUnexpectedJudge.id,
      "player_two",
    );
    cardUnderTest.updateCardMeta({ exerted: true });

    challenger.challenge(cardUnderTest);

    expect(challenger.damage).toEqual(enchantressUnexpectedJudge.strength + 2);
  });
});
