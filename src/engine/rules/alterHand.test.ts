/**
 * @jest-environment node
 */
import { createRuleEngine } from "~/engine/engine";
import { gameBeforeAlterHand } from "../__mocks__/gameMock";
import { expect } from "@jest/globals";

const testPlayer = "player_one";
const anotherTestPlayer = "player_two";

it("Should let player alter hand", () => {
  // const engine = createRuleEngine(gameBeforeAlterHand);
  //
  // const initialHand = engine.get.zoneCards("hand", testPlayer);
  // const cardsToAlter = initialHand.slice(0, 3);
  // expect(engine.get.zoneCards("deck", testPlayer)).not.toEqual(
  //   expect.arrayContaining(cardsToAlter),
  // );
  //
  // engine.moves.alterHand(cardsToAlter, testPlayer);
  // const hand = engine.get.zoneCards("hand", testPlayer);
  //
  // expect(hand).toHaveLength(7);
  // expect(hand).not.toEqual(expect.arrayContaining(cardsToAlter));
  // expect(engine.get.zoneCards("deck", testPlayer)).toEqual(
  //   expect.arrayContaining(cardsToAlter),
  // );
});

it("Altering hand shuffles the deck", () => {
  const engine = createRuleEngine(gameBeforeAlterHand);

  const initialHand = gameBeforeAlterHand.tables[testPlayer]?.zones.deck || [];

  engine.moves.alterHand([], testPlayer);

  const zones = engine.getState().tables[testPlayer]?.zones;

  //test whether the list is shuffled

  expect(initialHand).not.toEqual(zones?.deck);
});

it("When both alter hands, should start game", () => {
  const engine = createRuleEngine(gameBeforeAlterHand);

  engine.moves.alterHand([], anotherTestPlayer);
  engine.moves.alterHand([], testPlayer);

  // expect(engine.getContext().phase).toBe("play");
});
