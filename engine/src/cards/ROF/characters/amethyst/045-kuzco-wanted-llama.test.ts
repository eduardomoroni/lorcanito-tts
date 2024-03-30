/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  fairyGodmotherHereToHelp,
  kuzcoWantedLlama,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Kuzco - Wanted Llama", () => {
  it("**OK, WHERE AM I?** When this character is banished, you may draw a card.", () => {
    const testStore = new TestStore(
      {
        deck: 1,
        play: [kuzcoWantedLlama],
      },
      { play: [fairyGodmotherHereToHelp] },
    );

    const cardUnderTest = testStore.getByZoneAndId("play", kuzcoWantedLlama.id);

    cardUnderTest.updateCardMeta({ exerted: true });
    const attacker = testStore.getByZoneAndId(
      "play",
      fairyGodmotherHereToHelp.id,
      "player_two",
    );

    attacker.challenge(cardUnderTest);
    testStore.resolveOptionalAbility(true);

    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({
        hand: 1,
        discard: 1,
        deck: 0,
      }),
    );
  });
});
