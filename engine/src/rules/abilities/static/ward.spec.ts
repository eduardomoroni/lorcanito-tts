/**
 * @jest-environment node
 */

import { expect, it } from "@jest/globals"
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {fireTheCannons} from "@lorcanito/engine/cards/TFC/actions/actions";
import {theNokkWaterSpirit} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Ward", () => {
  it("Can target your own chars", () => {
    const testStore = new TestStore({
      inkwell: fireTheCannons.cost,
      hand: [fireTheCannons],
      play: [theNokkWaterSpirit],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", theNokkWaterSpirit.id);
    const actionCard = testStore.getByZoneAndId("hand", fireTheCannons.id);

    actionCard.playFromHand()
    testStore.resolveTopOfStack({targets: [cardUnderTest]})

    expect(actionCard.zone).toEqual("discard");
    expect(cardUnderTest.zone).toEqual("play");
    expect(cardUnderTest.damage).toEqual(2);
  });

  it("Cannot target your opponent's chars", () => {
    const testStore = new TestStore({
      inkwell: fireTheCannons.cost,
      hand: [fireTheCannons],

    }, {
      play: [theNokkWaterSpirit],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", theNokkWaterSpirit.id, "player_two");
    const actionCard = testStore.getByZoneAndId("hand", fireTheCannons.id);

    actionCard.playFromHand()
    testStore.resolveTopOfStack({targets: [cardUnderTest]}, true)

    expect(cardUnderTest.damage).toEqual(0);
    expect(cardUnderTest.zone).toEqual("play");
    expect(actionCard.zone).toEqual("discard");
  });
});

