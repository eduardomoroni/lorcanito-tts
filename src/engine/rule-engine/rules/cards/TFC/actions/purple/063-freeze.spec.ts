/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { moanaOfMotunui } from "~/engine/cards/TFC";
import { freeze } from "~/engine/cards/TFC/actions";

describe("Freeze", () => {
  it("Exert chosen opponent character.", () => {
    const testStore = new TestStore(
      {
        inkwell: freeze.cost,
        hand: [freeze],
      },
      {
        play: [moanaOfMotunui],
      }
    );

    const cardUnderTest = testStore.getByZoneAndId("hand", freeze.id);
    const target = testStore.getByZoneAndId(
      "play",
      moanaOfMotunui.id,
      "player_two"
    );

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(
      testStore.getByZoneAndId("play", moanaOfMotunui.id, "player_two").meta
    ).toEqual(expect.objectContaining({ exerted: true }));
  });

  it("Exert chosen opponent character already exerted.", () => {
    const testStore = new TestStore(
      {
        inkwell: freeze.cost,
        hand: [freeze],
      },
      {
        play: [moanaOfMotunui],
      }
    );

    const cardUnderTest = testStore.getByZoneAndId("hand", freeze.id);
    const target = testStore.getByZoneAndId(
      "play",
      moanaOfMotunui.id,
      "player_two"
    );

    target.updateCardMeta({ exerted: true });

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(
      testStore.getByZoneAndId("play", moanaOfMotunui.id, "player_two").meta
    ).toEqual(expect.objectContaining({ exerted: true }));
  });
});
