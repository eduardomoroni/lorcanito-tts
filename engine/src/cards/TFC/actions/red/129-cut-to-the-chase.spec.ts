/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { cutToTheChase } from "@lorcanito/engine/cards/TFC/actions/actions";
import { moanaOfMotunui } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Cut to the Chase", () => {
  it("Chosen character gains **Rush** this turn.", () => {
    const testStore = new TestStore({
      inkwell: cutToTheChase.cost,
      hand: [cutToTheChase],
      play: [moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", cutToTheChase.id);
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targetId: target.instanceId });

    expect(target.hasRush).toEqual(true);
  });
});
