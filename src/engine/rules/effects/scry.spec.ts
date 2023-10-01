/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { ursulaCaldron } from "~/engine/cards/TFC/items/items";
import {
  beOurGuest,
  friendsOnTheOtherSide,
  oneJumpAhead,
  reflection,
} from "~/engine/cards/TFC/songs/songs";
import { CardModel } from "~/engine/store/models/CardModel";
import {chiefTui, heiheiBoatSnack, liloMakingAWish, moanaOfMotunui} from "~/engine/cards/TFC/characters/characters";

describe("Scry effect", () => {
  it("[Ursula's Cauldron] can't put both cards at the BOTTOM", () => {
    const testStore = new TestStore({
      deck: [liloMakingAWish, moanaOfMotunui, chiefTui, heiheiBoatSnack],
      play: [ursulaCaldron],
      inkwell: ursulaCaldron.cost,
    });

    const cardUnderTest = testStore.getByZoneAndId("play", ursulaCaldron.id);
    const lilo = testStore.getByZoneAndId("deck", liloMakingAWish.id);
    const moana = testStore.getByZoneAndId("deck", moanaOfMotunui.id);

    cardUnderTest.activate();

    testStore.resolveTopOfStack({ scry: { bottom: [moana, lilo] } });

    expect(
      testStore.store.tableStore
        .getPlayerZoneCards("player_one", "deck")
        .map((card) => card.lorcanitoCard?.name),
    ).toEqual([
      moanaOfMotunui.name,
      liloMakingAWish.name,
      chiefTui.name,
      heiheiBoatSnack.name,
    ]);
  });

  it("[Ursula's Cauldron] can't put both cards at the TOP", () => {
    const testStore = new TestStore({
      deck: [liloMakingAWish, moanaOfMotunui, chiefTui, heiheiBoatSnack],
      play: [ursulaCaldron],
      inkwell: ursulaCaldron.cost,
    });

    const cardUnderTest = testStore.getByZoneAndId("play", ursulaCaldron.id);
    const heihei = testStore.getByZoneAndId("deck", heiheiBoatSnack.id);
    const tui = testStore.getByZoneAndId("deck", chiefTui.id);

    cardUnderTest.activate();

    testStore.resolveTopOfStack({ scry: { top: [heihei, tui] } });

    expect(
      testStore.store.tableStore
        .getPlayerZoneCards("player_one", "deck")
        .map((card) => card.lorcanitoCard?.name),
    ).toEqual([
      liloMakingAWish.name,
      moanaOfMotunui.name,
      heiheiBoatSnack.name,
      chiefTui.name,
    ]);
  });

  it("[Be our Guest] Tutoring an invalid target card", () => {
    const testStore = new TestStore({
      deck: [liloMakingAWish, reflection, friendsOnTheOtherSide, oneJumpAhead],
      hand: [beOurGuest],
      inkwell: beOurGuest.cost,
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", beOurGuest.id);
    const one = testStore.getByZoneAndId("deck", reflection.id);
    const two = testStore.getByZoneAndId("deck", friendsOnTheOtherSide.id);
    const three = testStore.getByZoneAndId("deck", oneJumpAhead.id);

    cardUnderTest.playFromHand();

    const bottom: CardModel[] = [one, three];

    testStore.resolveTopOfStack({ scry: { bottom, hand: [two] } });

    const deck = testStore.store.tableStore
      .getPlayerZoneCards("player_one", "deck")
      .map((card) => card.lorcanitoCard?.name);

    expect(deck).toEqual([
      ...bottom.reverse().map((card) => card.lorcanitoCard?.name),
      liloMakingAWish.name,
      // Be our guest only takes characters, so the card should stay on top of the deck
      friendsOnTheOtherSide.name,
    ]);
  });
});
