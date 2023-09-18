/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { scepterOfArendelle } from "~/engine/cards/TFC/items";
import { moanaOfMotunui } from "~/engine/cards/TFC";

describe("Scepter Of Arendelle", () => {
  it("Command - Chosen character gains **Support** this turn.", () => {
    const testStore = new TestStore({
      play: [scepterOfArendelle, moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      scepterOfArendelle.id
    );
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    cardUnderTest.activate();

    testStore.resolveTopOfStack({ targetId: target.instanceId });

    expect(target.hasSupport).toEqual(true);
  });
});
