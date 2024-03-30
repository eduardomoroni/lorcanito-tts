/**
 * @jest-environment node
 */

import { expect, it, describe, test, fdescribe } from "@jest/globals";

// TODO: players have reported that moving to discard is problematic, as the engine is not yet ready.
// We should enable this test once we have all cards implemented.
it.skip("Basic Challenge, both die", () => {
  // const engine = createRuleEngine(
  //   createMockGame(
  //     {
  //       play: [mickeyMouseTrueFriend],
  //     },
  //     {
  //       play: [mickeyMouseTrueFriend],
  //     },
  //   ),
  // );
  //
  // // Both are 3/3
  // const attacker = engine.get.zoneCards("play", "player_one")[0];
  // const defender = engine.get.zoneCards("play", "player_two")[0];
  //
  // expect(engine.get.zoneCards("play", "player_one")).toHaveLength(1);
  // expect(engine.get.zoneCards("play", "player_two")).toHaveLength(1);
  // expect(engine.get.zoneCards("discard", "player_one")).toHaveLength(0);
  // expect(engine.get.zoneCards("discard", "player_two")).toHaveLength(0);
  //
  // engine.moves?.challenge(attacker, defender);
  //
  // expect(engine.get.zoneCards("play", "player_one")).toHaveLength(0);
  // expect(engine.get.zoneCards("play", "player_two")).toHaveLength(0);
  // expect(engine.get.zoneCards("discard", "player_one")).toHaveLength(1);
  // expect(engine.get.zoneCards("discard", "player_two")).toHaveLength(1);
});

it("Basic Challenge, none die", () => {
  // const engine = createRuleEngine(
  //   createMockGame(
  //     {
  //       play: [moanaOfMotunui],
  //     },
  //     {
  //       play: [mickeyMouseTrueFriend],
  //     },
  //   ),
  // );
  //
  // // Attacker is 1/6
  // const attacker = engine.get.zoneCards("play", "player_one")[0];
  // // Defender is 3/3
  // const defender = engine.get.zoneCards("play", "player_two")[0];
  //
  // expect(engine.get.zoneCards("play", "player_one")).toHaveLength(1);
  // expect(engine.get.zoneCards("play", "player_two")).toHaveLength(1);
  //
  // engine.moves.tapCard(defender, { exerted: true });
  // engine.moves.challenge(attacker, defender);
  //
  // expect(engine.get.zoneCards("play", "player_one")).toHaveLength(1);
  // expect(engine.get.zoneCards("play", "player_two")).toHaveLength(1);
  // expect(engine.get.tableCard(attacker)?.meta).toMatchObject({
  //   damage: mickeyMouseTrueFriend.strength,
  // });
  // expect(engine.get.tableCard(defender)?.meta).toMatchObject({
  //   damage: moanaOfMotunui.strength,
  // });
});

it("Exerts challenger", () => {
  // const engine = createRuleEngine(
  //   createMockGame(
  //     {
  //       play: [moanaOfMotunui],
  //     },
  //     {
  //       play: [moanaOfMotunui],
  //     },
  //   ),
  // );
  //
  // const attacker = engine.get.zoneCards("play", "player_one")[0];
  // const defender = engine.get.zoneCards("play", "player_two")[0];
  // engine.moves.tapCard(defender, { exerted: true });
  //
  // expect(engine.get.tableCard(attacker)?.meta?.exerted).toBeFalsy();
  // engine.moves?.challenge(attacker, defender);
  // expect(engine.get.tableCard(attacker)?.meta?.exerted).toBeTruthy();
});

it("Can't challenge with fresh ink", () => {
  // const testStore = new TestStore(
  //   {
  //     inkwell: moanaOfMotunui.cost,
  //     hand: [moanaOfMotunui],
  //   },
  //   {
  //     play: [sebastianCourtComposer],
  //   },
  // );
  //
  // const attacker = testStore.getByZoneAndId("hand", moanaOfMotunui.id);
  // testStore.store.playCardFromHand(attacker.instanceId);
  //
  // const defender = testStore.getByZoneAndId(
  //   "play",
  //   sebastianCourtComposer.id,
  //   "player_two",
  // );
  // defender.updateCardMeta({ exerted: true });
  //
  // testStore.store.cardStore.challenge(attacker.instanceId, defender.instanceId);
  //
  // expect(attacker.meta.damage).toBeFalsy();
  // expect(defender.meta.damage).toBeFalsy();
});

it.skip("doesn't challenge ready characters", () => {
  expect(false).toEqual(true);
});

// TODO: effects when challenge and banish
