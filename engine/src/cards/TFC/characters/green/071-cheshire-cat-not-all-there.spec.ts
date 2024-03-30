/**
 * @jest-environment node
 */

import { expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  cheshireCat,
  teKaTheBurningOne,
} from "@lorcanito/engine/cards/TFC/characters/characters";

export const cheshireCatNotAllThereTestCase = () => {
  const testStore = new TestStore(
    {
      play: [teKaTheBurningOne],
    },
    {
      play: [cheshireCat],
    },
  );

  const cardUnderTest = testStore.getByZoneAndId(
    "play",
    cheshireCat.id,
    "player_two",
  );

  const attacker = testStore.getByZoneAndId("play", teKaTheBurningOne.id);

  expect(cardUnderTest.zone).toEqual("play");
  cardUnderTest.updateCardMeta({ exerted: true });

  attacker.challenge(cardUnderTest);

  expect(testStore.getZonesCardCount("player_one")).toEqual(
    expect.objectContaining({ discard: 1, play: 0 }),
  );
  expect(testStore.getZonesCardCount("player_two")).toEqual(
    expect.objectContaining({ discard: 1, play: 0 }),
  );
};

xdescribe("Cheshire Cat - Not All There", () => {
  it("**Lose something?** When this character is challenged and banished, banish the challenging character.", () => {
    cheshireCatNotAllThereTestCase();
  });
});
