/**
 * @jest-environment node
 */

import { mickeyMouseTrueFriend } from "~/engine/cards";
import { createMockGame } from "~/engine/rule-engine/__mocks__/createGameMock";
import { createRuleEngine } from "~/engine/rule-engine/engine";
import { gameBeforeAlterHand } from "~/engine/rule-engine/__mocks__/gameMock";

const playerOneID = "player_one";
const playerTwoID = "player_two";
it("When both alter hands, should start game", () => {
  const engine = createRuleEngine(gameBeforeAlterHand);

  expect(engine.getContext().phase).toBe("alter_hand");

  engine.moves.alterHand([], playerOneID);
  engine.moves.alterHand([], playerTwoID);

  expect(engine.getContext().phase).toBe("play");
});

it("Should pass turn to the next player", () => {
  const engine = createRuleEngine(gameBeforeAlterHand);

  expect(engine.getState().turnCount).toBe(0);

  for (let i = 1; i < 10; i++) {
    if (i === 0) {
      engine.moves.alterHand([], playerOneID);
      engine.moves.alterHand([], playerTwoID);
      expect(engine.getState().turnCount).toBe(0);
      continue;
    }

    engine.moves.passTurn(playerOneID);
    engine.moves.passTurn(playerTwoID);
    expect(engine.getState().turnCount).toBe(i * 2);
  }
});

it("should ready cards when passing turn back to player", () => {
  const mockGame = createMockGame(
    {
      play: [mickeyMouseTrueFriend],
      deck: [mickeyMouseTrueFriend],
    },
    {
      play: [mickeyMouseTrueFriend],
      deck: [mickeyMouseTrueFriend],
    }
  );
  const engine = createRuleEngine(mockGame);

  const tableCard = engine.get.zoneCards("play", "player_one")[0];

  engine?.moves?.tapCard(tableCard, { exerted: true });
  expect(engine.get.tableCard(tableCard)?.meta?.exerted).toBeTruthy();

  engine.moves.passTurn(playerOneID);
  engine.moves.passTurn(playerTwoID);

  expect(engine.get.tableCard(tableCard)?.meta?.exerted).toBeFalsy();
});

it("should NOT ready cards when the player passes their turn", () => {
  const mockGame = createMockGame(
    {
      play: [mickeyMouseTrueFriend],
      deck: [mickeyMouseTrueFriend],
    },
    {
      play: [mickeyMouseTrueFriend],
      deck: [mickeyMouseTrueFriend],
    }
  );
  const engine = createRuleEngine(mockGame);

  const tableCard = engine.get.zoneCards("play", "player_one")[0];

  engine?.moves?.tapCard(tableCard, { exerted: true });
  expect(engine.get.tableCard(tableCard)?.meta?.exerted).toBeTruthy();

  engine.moves.passTurn(playerOneID);

  expect(engine.get.tableCard(tableCard)?.meta?.exerted).toBeTruthy();
});

// passing turn back untaps
// remove freesh ink
// don't let play cards when it's not their turn
