/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  goofyKnightForADay,
  grandPabbieOldestAndWisest,
} from "@lorcanito/engine/cards/ROF/characters/characters";
import { hakunaMatata } from "@lorcanito/engine/cards/TFC/songs/songs";
import { healingGlow } from "@lorcanito/engine/cards/TFC/actions/actions";
import { dingleHopper } from "@lorcanito/engine/cards/TFC/items/items";

describe("Heal trigger", () => {
  it("Does not trigger when healing zero damage", () => {
    const testStore = new TestStore({
      play: [grandPabbieOldestAndWisest, goofyKnightForADay],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      grandPabbieOldestAndWisest.id,
    );
    const anotherCharacter = testStore.getByZoneAndId(
      "play",
      goofyKnightForADay.id,
    );

    expect(testStore.getPlayerLore()).toEqual(0);

    anotherCharacter.updateCardDamage(2, "remove");
    expect(testStore.getPlayerLore()).toEqual(0);
  });

  it("Healing with actions, multiple targets", () => {
    const testStore = new TestStore({
      inkwell: hakunaMatata.cost,
      hand: [hakunaMatata],
      play: [grandPabbieOldestAndWisest, goofyKnightForADay],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      grandPabbieOldestAndWisest.id,
    );
    const anotherCharacter = testStore.getByZoneAndId(
      "play",
      goofyKnightForADay.id,
    );
    const healCard = testStore.getByZoneAndId("hand", hakunaMatata.id);
    cardUnderTest.updateCardDamage(4);
    anotherCharacter.updateCardDamage(4);

    expect(testStore.getPlayerLore()).toEqual(0);

    healCard.playFromHand();

    expect(testStore.getPlayerLore()).toEqual(4);
  });

  it("Healing with actions, single target", () => {
    const testStore = new TestStore({
      inkwell: healingGlow.cost,
      hand: [healingGlow],
      play: [grandPabbieOldestAndWisest, goofyKnightForADay],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      grandPabbieOldestAndWisest.id,
    );
    const healCard = testStore.getByZoneAndId("hand", healingGlow.id);
    cardUnderTest.updateCardDamage(4);

    expect(testStore.getPlayerLore()).toEqual(0);

    healCard.playFromHand();
    testStore.resolveTopOfStack({ targets: [cardUnderTest] });

    expect(testStore.getPlayerLore()).toEqual(2);
  });

  it("Healing with effects", () => {
    const testStore = new TestStore({
      play: [grandPabbieOldestAndWisest, dingleHopper],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      grandPabbieOldestAndWisest.id,
    );
    const healCard = testStore.getByZoneAndId("play", dingleHopper.id);
    cardUnderTest.updateCardDamage(4);

    expect(testStore.getPlayerLore()).toEqual(0);

    healCard.activate();
    testStore.resolveTopOfStack({ targets: [cardUnderTest] });

    expect(testStore.getPlayerLore()).toEqual(2);
  });
});
