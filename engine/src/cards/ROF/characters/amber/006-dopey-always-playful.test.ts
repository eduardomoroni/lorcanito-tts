/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  docLeaderOfTheSevenDwarfs,
  dopeyAlwaysPlayful,
  sleepyNoddingOff,
} from "@lorcanito/engine/cards/ROF/characters/characters";
import { liloMakingAWish } from "@lorcanito/engine/cards/TFC/characters/characters";
import { smash } from "@lorcanito/engine/cards/TFC/actions/actions";

describe("Dopey - Always Playful", () => {
  it("**ODD ONE OUT** When this character is banished, your other Seven Dwarfs characters get +2 ※ until the start of your next turn.", () => {
    const testStore = new TestStore(
      {
        inkwell: smash.cost,
        hand: [smash],
        deck: 1,
        play: [
          dopeyAlwaysPlayful,
          sleepyNoddingOff,
          docLeaderOfTheSevenDwarfs,
          liloMakingAWish,
        ],
      },
      { deck: 1 },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      dopeyAlwaysPlayful.id,
    );
    const lilo = testStore.getByZoneAndId("play", liloMakingAWish.id);
    const sleepy = testStore.getByZoneAndId("play", sleepyNoddingOff.id);
    const doc = testStore.getByZoneAndId("play", docLeaderOfTheSevenDwarfs.id);

    testStore.fromZone("hand", smash).playFromHand();
    testStore.resolveTopOfStack({ targets: [cardUnderTest] });

    expect(cardUnderTest.zone).toEqual("discard");
    expect(lilo.strength).toEqual(liloMakingAWish.strength);
    [doc, sleepy].forEach((card) => {
      expect(card.strength).toEqual((card.lorcanitoCard.strength || 0) + 2);
    });

    testStore.passTurn();

    [doc, sleepy].forEach((card) => {
      expect(card.strength).toEqual((card.lorcanitoCard.strength || 0) + 2);
    });

    testStore.passTurn();

    [doc, sleepy].forEach((card) => {
      expect(card.strength).toEqual(card.lorcanitoCard.strength);
    });
  });
});
