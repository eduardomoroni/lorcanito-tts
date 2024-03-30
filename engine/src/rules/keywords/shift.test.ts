/**
 * @jest-environment node
 */
import { expect, it, describe, test, fdescribe } from "@jest/globals";

import {
  beastForbiddingRecluse,
  beastTragicHero,
} from "@lorcanito/engine/cards/ROF/characters/characters";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { dragonFire } from "@lorcanito/engine/cards/TFC/actions/actions";

it("Shifts glimmer", () => {
  const testStore = new TestStore({
    play: [beastForbiddingRecluse],
    inkwell: 3,
    hand: [beastTragicHero],
  });

  const cardUnderTest = testStore.getByZoneAndId("hand", beastTragicHero.id);
  const shifted = testStore.getByZoneAndId("play", beastForbiddingRecluse.id);

  testStore.store.cardStore.shiftCard(
    cardUnderTest.instanceId,
    shifted.instanceId,
  );

  expect(cardUnderTest.zone).toEqual("play");
});

it("Removing shifter glimmer also removes shifted", () => {
  const testStore = new TestStore({
    play: [beastForbiddingRecluse],
    inkwell: 3 + dragonFire.cost,
    hand: [beastTragicHero, dragonFire],
  });

  const cardUnderTest = testStore.getByZoneAndId("hand", beastTragicHero.id);
  const shifted = testStore.getByZoneAndId("play", beastForbiddingRecluse.id);
  const removal = testStore.getByZoneAndId("hand", dragonFire.id);

  testStore.store.cardStore.shiftCard(
    cardUnderTest.instanceId,
    shifted.instanceId,
  );

  removal.playFromHand();
  testStore.resolveTopOfStack({ targets: [cardUnderTest] });

  expect(cardUnderTest.zone).toEqual("discard");
  expect(shifted.zone).toEqual("discard");
});

it("Pays shift cost", () => {
  // const testStore = new TestStore({
  //   play: [mickeyMouseTrueFriend],
  //   hand: [mickeyMouseArtfulRogue],
  //   inkwell: 5,
  // });
  //
  // const shifter = testStore.getByZoneAndId("hand", mickeyMouseArtfulRogue.id);
  // const shifted = testStore.getByZoneAndId("play", mickeyMouseTrueFriend.id);
  //
  // expect(
  //   testStore.store.tableStore
  //     .getPlayerZone("player_one", "inkwell")
  //     ?.cards.filter((card) => !card?.meta?.exerted),
  // ).toHaveLength(5);
  //
  // testStore.store.shiftCard(shifter.instanceId, shifted.instanceId);
  //
  // expect(
  //   testStore.store.tableStore
  //     .getPlayerZone("player_one", "inkwell")
  //     ?.cards.filter((card) => !card?.meta?.exerted),
  // ).toHaveLength(0);
});

it("Shift carries over card status", () => {
  // const engine = createRuleEngine(createMockGame(initialState));
  //
  // const shifted = engine.get.zoneCards("play", "player_one")[0];
  // const shifter = engine.get.zoneCards("hand", "player_one")[0];
  //
  // engine.moves?.tapCard(shifted, { exerted: true });
  // expect(engine.get.tableCard(shifted)?.meta?.exerted).toBeTruthy();
  //
  // engine.moves?.shift(shifter, shifted);
  // expect(engine.get.tableCard(shifted)?.meta?.exerted).toBeTruthy();
});

it("Move both cards to discard when banished", function () {});

it("Move one to hand and other to discard when returning it to hand", function () {});
