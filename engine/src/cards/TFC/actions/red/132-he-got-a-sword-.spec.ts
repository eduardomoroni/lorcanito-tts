/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { hesGotASword } from "@lorcanito/engine/cards/TFC/actions/actions";
import { moanaOfMotunui } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("He's Got a Sword!", () => {
  it("Chosen character gets +2 ※ this turn.", () => {
    const testStore = new TestStore({
      inkwell: hesGotASword.cost,
      hand: [hesGotASword],
      play: [moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", hesGotASword.id);
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targetId: target.instanceId });

    expect(target.strength).toEqual((target.lorcanitoCard.strength || 0) + 2);
  });
});
