/**
 * @jest-environment node
 */

import { expect, it, describe, test, fdescribe } from "@jest/globals";

import { mickeyMouseTrueFriend, moanaOfMotunui } from "~/engine/cards";
import { createRuleEngine } from "~/engine/rule-engine/engine";
import { createMockGame } from "~/engine/rule-engine/__mocks__/createGameMock";

// TODO: players have reported that moving to discard is problematic, as the engine is not yet ready.
// We should enable this test once we have all cards implemented.
it.skip("Basic Challenge, both die", () => {
  const engine = createRuleEngine(
    createMockGame(
      {
        play: [mickeyMouseTrueFriend],
      },
      {
        play: [mickeyMouseTrueFriend],
      }
    )
  );

  // Both are 3/3
  const attacker = engine.get.zoneCards("play", "player_one")[0];
  const defender = engine.get.zoneCards("play", "player_two")[0];

  expect(engine.get.zoneCards("play", "player_one")).toHaveLength(1);
  expect(engine.get.zoneCards("play", "player_two")).toHaveLength(1);
  expect(engine.get.zoneCards("discard", "player_one")).toHaveLength(0);
  expect(engine.get.zoneCards("discard", "player_two")).toHaveLength(0);

  engine.moves?.challenge(attacker, defender);

  expect(engine.get.zoneCards("play", "player_one")).toHaveLength(0);
  expect(engine.get.zoneCards("play", "player_two")).toHaveLength(0);
  expect(engine.get.zoneCards("discard", "player_one")).toHaveLength(1);
  expect(engine.get.zoneCards("discard", "player_two")).toHaveLength(1);
});

it("Basic Challenge, none die", () => {
  const engine = createRuleEngine(
    createMockGame(
      {
        play: [moanaOfMotunui],
      },
      {
        play: [mickeyMouseTrueFriend],
      }
    )
  );

  // Attacker is 1/6
  const attacker = engine.get.zoneCards("play", "player_one")[0];
  // Defender is 3/3
  const defender = engine.get.zoneCards("play", "player_two")[0];

  expect(engine.get.zoneCards("play", "player_one")).toHaveLength(1);
  expect(engine.get.zoneCards("play", "player_two")).toHaveLength(1);

  engine.moves.challenge(attacker, defender);

  expect(engine.get.zoneCards("play", "player_one")).toHaveLength(1);
  expect(engine.get.zoneCards("play", "player_two")).toHaveLength(1);
  expect(engine.get.tableCard(attacker)?.meta).toMatchObject({
    damage: mickeyMouseTrueFriend.strength,
  });
  expect(engine.get.tableCard(defender)?.meta).toMatchObject({
    damage: moanaOfMotunui.strength,
  });
});

it("Exerts challenger", () => {
  const engine = createRuleEngine(
    createMockGame(
      {
        play: [moanaOfMotunui],
      },
      {
        play: [moanaOfMotunui],
      }
    )
  );

  const attacker = engine.get.zoneCards("play", "player_one")[0];
  const defender = engine.get.zoneCards("play", "player_two")[0];

  expect(engine.get.tableCard(attacker)?.meta?.exerted).toBeFalsy();
  engine.moves?.challenge(attacker, defender);
  expect(engine.get.tableCard(attacker)?.meta?.exerted).toBeTruthy();
});

// TODO: effects when challenge and banish
