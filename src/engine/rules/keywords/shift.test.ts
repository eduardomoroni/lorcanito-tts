/**
 * @jest-environment node
 */
import { expect, it, describe, test, fdescribe } from "@jest/globals";

import { createRuleEngine } from "~/engine/engine";
import { createMockGame } from "~/engine/__mocks__/createGameMock";
import { TestStore } from "~/engine/rules/testStore";
import {
  mickeyMouseArtfulRogue,
  mickeyMouseTrueFriend,
} from "~/engine/cards/TFC/characters/characters";

const initialState = {
  play: [mickeyMouseTrueFriend],
  inkwell: [
    mickeyMouseArtfulRogue,
    mickeyMouseArtfulRogue,
    mickeyMouseArtfulRogue,
    mickeyMouseArtfulRogue,
    mickeyMouseArtfulRogue,
  ],
  hand: [mickeyMouseArtfulRogue],
};

it("Shifts glimmer", () => {
  // const engine = createRuleEngine(createMockGame(initialState));
  //
  // const shifted = engine.get.zoneCards("play", "player_one")[0];
  // const shifter = engine.get.zoneCards("hand", "player_one")[0];
  //
  // if (!shifted || !shifter) {
  //   throw new Error("No cards found");
  // }
  //
  // expect(engine.get.zoneCards("play", "player_one")).toHaveLength(1);
  // expect(engine.get.zoneCards("hand", "player_one")).toHaveLength(1);
  //
  // engine.moves?.shift(shifter, shifted);
  //
  // expect(engine.get.zoneCards("play", "player_one")).toHaveLength(2);
  // expect(engine.get.zoneCards("hand", "player_one")).toHaveLength(0);
  //
  // const expectedMeta = {
  //   shifter: shifter,
  //   shifted: shifted,
  // };
  //
  // expect(engine.get.tableCard(shifter)?.meta).toMatchObject(expectedMeta);
  // expect(engine.get.tableCard(shifted)?.meta).toMatchObject(expectedMeta);
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
