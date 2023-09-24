/**
 * @jest-environment node
 */

import { expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import {mauiDemiGod, princePhillipDragonSlayer} from "~/engine/cards/TFC/characters/characters";

export const princePhillipTestCase = () => {
  const testStore = new TestStore(
    {
      play: [princePhillipDragonSlayer],
    },
    {
      play: [mauiDemiGod],
    },
  );

  const attacker = testStore.getByZoneAndId(
    "play",
    princePhillipDragonSlayer.id,
  );
  const defender = testStore.getByZoneAndId(
    "play",
    mauiDemiGod.id,
    "player_two",
  );

  expect(defender.zone).toEqual("play");
  defender.updateCardMeta({ exerted: true });

  attacker.challenge(defender);

  expect(testStore.getZonesCardCount("player_one")).toEqual(
    expect.objectContaining({ discard: 1, play: 0 }),
  );
  expect(testStore.getZonesCardCount("player_two")).toEqual(
    expect.objectContaining({ discard: 1, play: 0 }),
  );
};

xdescribe("Prince Phillip - Dragonslayer", () => {
  it("**HEROISM** When this character challenges and is banished, you may banish the challenged character.", () => {
    princePhillipTestCase();
  });
});
