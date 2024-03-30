/**
 * @jest-environment node
 */
import { expect, it, describe } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  beastForbiddingRecluse,
  beastTragicHero,
} from "@lorcanito/engine/cards/ROF/characters/characters";
import { fireTheCannons } from "@lorcanito/engine/cards/TFC/actions/actions";
import { heiheiBoatSnack } from "@lorcanito/engine/cards/TFC/characters/characters";
import { grabYourSword } from "@lorcanito/engine/cards/TFC/songs/songs";

describe("Shifted Character", () => {
  it("[Support] should not be able to target the shifted character", () => {
    const testStore = new TestStore({
      play: [beastForbiddingRecluse],
      inkwell: 3,
      hand: [beastTragicHero, heiheiBoatSnack],
    });

    const shifter = testStore.getByZoneAndId("hand", beastTragicHero.id);
    const shifted = testStore.getByZoneAndId("play", beastForbiddingRecluse.id);
    const charWithSupport = testStore.getByZoneAndId(
      "hand",
      heiheiBoatSnack.id,
    );

    testStore.store.cardStore.shiftCard(shifter.instanceId, shifted.instanceId);
    charWithSupport.quest();
    testStore.resolveOptionalAbility();

    const potentialTargets = testStore.store.stackLayerStore
      .getTopLayer()
      ?.getPotentialTargets();

    if (!potentialTargets) {
      throw new Error("No potential targets");
    }

    expect(potentialTargets).toHaveLength(1);
    expect(potentialTargets[0]?.fullName).toEqual(shifter.fullName);
  });

  it("[Target effects] should not be able to target the shifted character", () => {
    const testStore = new TestStore({
      play: [beastForbiddingRecluse],
      inkwell: 3 + fireTheCannons.cost,
      hand: [beastTragicHero, fireTheCannons],
    });

    const shifter = testStore.getByZoneAndId("hand", beastTragicHero.id);
    const shifted = testStore.getByZoneAndId("play", beastForbiddingRecluse.id);
    const targetEffect = testStore.getByZoneAndId("hand", fireTheCannons.id);

    testStore.store.cardStore.shiftCard(shifter.instanceId, shifted.instanceId);
    targetEffect.playFromHand();

    const potentialTargets = testStore.store.stackLayerStore
      .getTopLayer()
      ?.getPotentialTargets();

    if (!potentialTargets) {
      throw new Error("No potential targets");
    }

    expect(potentialTargets).toHaveLength(1);
    expect(potentialTargets[0]?.fullName).toEqual(shifter.fullName);
  });

  it("[Area effects] should not be able to target the shifted character", () => {
    const testStore = new TestStore(
      {
        play: [beastForbiddingRecluse],
        inkwell: 3,
        hand: [beastTragicHero],
      },
      {
        deck: 1,
        inkwell: grabYourSword.cost,
        hand: [grabYourSword],
      },
    );

    const shifter = testStore.getByZoneAndId("hand", beastTragicHero.id);
    const shifted = testStore.getByZoneAndId("play", beastForbiddingRecluse.id);
    testStore.store.cardStore.shiftCard(shifter.instanceId, shifted.instanceId);

    testStore.passTurn();

    const areaEffect = testStore.getByZoneAndId(
      "hand",
      grabYourSword.id,
      "player_two",
    );
    areaEffect.playFromHand();

    expect(shifter.meta.damage).toEqual(2);
    expect(shifted.meta.damage).toBeFalsy();
  });
});
