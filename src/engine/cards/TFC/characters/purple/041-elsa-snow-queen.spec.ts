/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { freeze } from "~/engine/cards/TFC/actions/actions";
import {elsaSnowQueen, moanaOfMotunui} from "~/engine/cards/TFC/characters/characters";

describe("Elsa - Snow Queen", () => {
  it("**Freeze** ↷ - Exert chosen opposing character.", () => {
    const testStore = new TestStore(
      {
        play: [elsaSnowQueen],
      },
      {
        play: [moanaOfMotunui],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId("play", elsaSnowQueen.id);
    const target = testStore.getByZoneAndId(
      "play",
      moanaOfMotunui.id,
      "player_two",
    );

    expect(target.ready).toEqual(true);

    cardUnderTest.activate();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.ready).toEqual(false);
  });
});
