/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { aladdinHeroicOutlaw, moanaOfMotunui } from "~/engine/cards/TFC";
import { stolenScimitar } from "~/engine/cards/TFC/items";

describe("Stolen Scimitar", () => {
  it("[Aladdin] Chosen character get +1 ※ this turn. If a character named Aladdin is chosen, he gets +2 ※ instead.", () => {
    const testStore = new TestStore({
      play: [stolenScimitar, aladdinHeroicOutlaw],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", stolenScimitar.id);
    const target = testStore.getByZoneAndId("play", aladdinHeroicOutlaw.id);

    cardUnderTest.activate();
    testStore.resolveTopOfStack({ targetId: target.instanceId });

    expect(target.strength).toEqual((target.lorcanitoCard.strength || 0) + 2);
  });

  it("[Non Aladdin] Chosen character get +1 ※ this turn. If a character named Aladdin is chosen, he gets +2 ※ instead.", () => {
    const testStore = new TestStore({
      play: [stolenScimitar, moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", stolenScimitar.id);
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    cardUnderTest.activate();
    testStore.resolveTopOfStack({ targetId: target.instanceId });

    expect(target.strength).toEqual((target.lorcanitoCard.strength || 0) + 1);
  });
});
