/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { daisyDuckSecretAgent } from "@lorcanito/engine/cards/ROF/characters/characters";
import {
  donaldDuck,
  donaldDuckMusketeer,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Daisy Duck - Secret Agent", () => {
  it("**THWART** Whenever this character quests, each opponent chooses and discards a card.", () => {
    const testStore = new TestStore(
      {
        play: [daisyDuckSecretAgent],
      },
      {
        hand: [donaldDuck, donaldDuckMusketeer],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      daisyDuckSecretAgent.id,
    );
    const target = testStore.getByZoneAndId(
      "hand",
      donaldDuck.id,
      "player_two",
    );

    cardUnderTest.quest();
    testStore.resolveTopOfStack({ targets: [target] });

    expect(target.zone).toEqual("discard");
  });
});
