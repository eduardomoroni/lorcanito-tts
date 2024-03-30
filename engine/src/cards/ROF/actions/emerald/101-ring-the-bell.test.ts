/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { ringTheBell } from "@lorcanito/engine/cards/ROF/actions/actions";
import { moanaOfMotunui } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Ring The Bell", () => {
  it("Banish chosen damaged character.", () => {
    const testStore = new TestStore({
      inkwell: ringTheBell.cost,
      hand: [ringTheBell],
      play: [moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", ringTheBell.id);
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    target.updateCardDamage(1);

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targets: [target],
    });

    expect(target.zone).toEqual("discard");
  });

  it("doest NOT Banish non damaged character", () => {
    const testStore = new TestStore({
      inkwell: ringTheBell.cost,
      hand: [ringTheBell],
      play: [moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", ringTheBell.id);
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targets: [target],
    });

    expect(target.zone).toEqual("play");
  });
});
