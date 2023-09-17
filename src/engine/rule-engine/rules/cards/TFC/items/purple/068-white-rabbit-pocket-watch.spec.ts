/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { whiteRabbitPocketWatch } from "~/engine/cards/TFC/items";
import { moanaOfMotunui } from "~/engine/cards/TFC";

describe("White Rabbit's Pocket Watch", () => {
  it("I'm late - Chosen character gains **Rush** this turn.", () => {
    const testStore = new TestStore({
      inkwell: 1,
      play: [whiteRabbitPocketWatch, moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      whiteRabbitPocketWatch.id
    );
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    cardUnderTest.activate();
    testStore.resolveTopOfStack({ targetId: target.instanceId });

    expect(target.hasRush).toEqual(true);
  });
});
