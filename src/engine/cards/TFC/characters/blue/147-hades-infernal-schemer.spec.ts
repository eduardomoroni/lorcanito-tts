/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import {
  hadesInfernalSchemer,
  mauriceWorldFamousInventor,
} from "~/engine/cards/TFC/characters/characters";

describe("Hades - Infernal Schemer", () => {
  it("**IS THERE A DOWNSIDE TO THIS?** When you play this character, you may put chosen opposing character into their player's inkwell facedown.", () => {
    const testStore = new TestStore(
      {
        inkwell: hadesInfernalSchemer.cost,
        hand: [hadesInfernalSchemer],
      },
      {
        play: [mauriceWorldFamousInventor],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      hadesInfernalSchemer.id,
    );

    const target = testStore.getByZoneAndId(
      "play",
      mauriceWorldFamousInventor.id,
      "player_two",
    );

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targetId: target.instanceId });

    expect(target.zone).toEqual("inkwell");
    expect(target.ready).toEqual(false);
    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
  });
});
