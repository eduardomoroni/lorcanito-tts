/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { peterPanLostBoyLeader } from "@lorcanito/engine/cards/ITI/characters/characters";
import { forbiddenMountainMaleficentsCastle } from "@lorcanito/engine/cards/ITI/locations/locations";

describe("Peter Pan - Lost Boy Leader", () => {
  it("**I CAME TO LISTEN TO THE STORIES** Once per turn, when this character moves to a location, gain lore equal to that location's ◆.", () => {
    const testStore = new TestStore({
      inkwell: forbiddenMountainMaleficentsCastle.moveCost,
      play: [peterPanLostBoyLeader, forbiddenMountainMaleficentsCastle],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      peterPanLostBoyLeader.id,
    );
    const location = testStore.getByZoneAndId(
      "play",
      forbiddenMountainMaleficentsCastle.id,
    );

    cardUnderTest.enterLocation(location);
    expect(testStore.getPlayerLore()).toEqual(2);
  });
});
