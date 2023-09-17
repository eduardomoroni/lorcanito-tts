/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import {
  beOurGuest,
  friendsOnTheOtherSide,
  oneJumpAhead,
  reflection,
} from "~/engine/cards/TFC/songs";
import {
  chiefTui,
  heiheiBoatSnack,
  liloMakingAWish,
  moanaOfMotunui,
} from "~/engine/cards/TFC";
import type { CardModel } from "~/store/models/CardModel";

describe("Be Our Guest", () => {
  it("Look at the top 4 cards of your deck. You may reveal a character card and put it into your hand. Put the rest on the bottom of your deck in any order", () => {
    const testStore = new TestStore({
      deck: [liloMakingAWish, moanaOfMotunui, chiefTui, heiheiBoatSnack],
      hand: [beOurGuest],
      inkwell: beOurGuest.cost,
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", beOurGuest.id);
    const one = testStore.getByZoneAndId("deck", heiheiBoatSnack.id);
    const two = testStore.getByZoneAndId("deck", chiefTui.id);
    const three = testStore.getByZoneAndId("deck", moanaOfMotunui.id);

    cardUnderTest.playFromHand();

    const bottom: CardModel[] = [one, three];

    testStore.resolveTopOfStack({ scry: { bottom, hand: [two] } });

    const deck = testStore.store.tableStore
      .getPlayerZoneCards("player_one", "deck")
      .map((card) => card.lorcanitoCard?.name);

    expect(deck).toEqual([
      ...bottom.reverse().map((card) => card.lorcanitoCard?.name),
      liloMakingAWish.name,
    ]);
    expect(two.zone).toEqual("hand");
  });

  it("Tutoring an invalid target card", () => {
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
