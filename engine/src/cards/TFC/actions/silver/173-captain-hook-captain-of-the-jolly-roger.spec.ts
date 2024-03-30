/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { fireTheCannons } from "@lorcanito/engine/cards/TFC/actions/actions";
import {
  captainHookCaptainOfTheJollyRoger,
  scarShamelessFirebrand,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Captain Hook Captain of the Jolly Roger", () => {
  it("DOUBLE THE POWDER! effect - returning an Fire The Cannon", () => {
    const testStore = new TestStore({
      inkwell: captainHookCaptainOfTheJollyRoger.cost,
      hand: [captainHookCaptainOfTheJollyRoger],
      discard: [fireTheCannons],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      captainHookCaptainOfTheJollyRoger.id,
    );
    const target = testStore.getByZoneAndId("discard", fireTheCannons.id);
    expect(target.zone).toEqual("discard");

    cardUnderTest.playFromHand();
    testStore.resolveOptionalAbility();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("hand");
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 1, deck: 0, discard: 0, play: 1 }),
    );
  });

  it("DOUBLE THE POWDER! effect - not returning an Fire The Cannon", () => {
    const testStore = new TestStore({
      inkwell: captainHookCaptainOfTheJollyRoger.cost,
      hand: [captainHookCaptainOfTheJollyRoger],
      discard: [scarShamelessFirebrand],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      captainHookCaptainOfTheJollyRoger.id,
    );

    cardUnderTest.playFromHand();

    testStore.resolveOptionalAbility(true);
    testStore.resolveTopOfStack();

    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 0, deck: 0, discard: 1, play: 1 }),
    );
    expect(testStore.stackLayers).toHaveLength(0);
  });
});
