/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { letItGo, motherKnowsBest } from "~/engine/cards/TFC/songs";
import { moanaOfMotunui } from "~/engine/cards/TFC";

describe("Mother Knows Best", () => {
  it("Your own card", () => {
    const testStore = new TestStore({
      inkwell: motherKnowsBest.cost,
      hand: [motherKnowsBest],
      play: [moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", motherKnowsBest.id);
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("hand");
  });

  it("Opponent's card", () => {
    const testStore = new TestStore(
      {
        inkwell: motherKnowsBest.cost,
        hand: [motherKnowsBest],
      },
      { play: [moanaOfMotunui] }
    );

    const cardUnderTest = testStore.getByZoneAndId("hand", motherKnowsBest.id);
    const target = testStore.getByZoneAndId(
      "play",
      moanaOfMotunui.id,
      "player_two"
    );

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("hand");
  });
});
