/**
 * @jest-environment node
 */

import { expect, it } from "@jest/globals";
import { createRuleEngine } from "~/engine/rule-engine/engine";
import { createMockGame } from "~/engine/rule-engine/__mocks__/createGameMock";
import {
  heiheiBoatSnack,
  moanaOfMotunui,
  simbaProtectiveCub,
} from "~/engine/cards";

const testPlayer = "player_one";
const opponent = "player_two";

it("Let's you play a bodyguard character exerted", () => {
  const inkwell = [moanaOfMotunui, moanaOfMotunui];
  const engine = createRuleEngine(
    createMockGame({
      inkwell,
      hand: [simbaProtectiveCub],
    })
  );

  const bodyGuardChar = engine.get.zoneCards("hand", testPlayer)[0];
  if (!bodyGuardChar) {
    throw new Error("No cards found");
  }

  engine.moves.playCardFromHand(bodyGuardChar, { bodyguard: true });
  const cardUnderTest = engine.get.tableCard(bodyGuardChar);

  expect(engine.get.zoneCards("play", testPlayer)).toContain(bodyGuardChar);
  expect(cardUnderTest?.meta?.playedThisTurn).toBe(true);
  expect(cardUnderTest?.meta?.exerted).toBeTruthy();
});

it("doesn't let you challenge a bodyguarded character", () => {
  const inkwell = [moanaOfMotunui, moanaOfMotunui];
  const engine = createRuleEngine(
    createMockGame(
      {
        inkwell,
        play: [heiheiBoatSnack],
      },
      {
        inkwell,
        play: [simbaProtectiveCub, heiheiBoatSnack],
      }
    )
  );

  engine.get.zoneCards("play", opponent).forEach((card) => {
    engine.moves.tapCard(card, { exerted: true });
    expect(engine.get.tableCard(card)?.meta?.exerted).toBeTruthy();
  });

  const attacker = engine.get.byZoneAndId({
    owner: testPlayer,
    zone: "play",
    lorcanitoId: heiheiBoatSnack.id,
  });
  const defender = engine.get.byZoneAndId({
    owner: opponent,
    zone: "play",
    // Simba is the bodyguard
    lorcanitoId: heiheiBoatSnack.id,
  });

  engine.moves.challenge(attacker, defender);

  // Bodyguard should prevent the challenge from happening, in case of an invalid target
  expect(engine.get.tableCard(defender)?.meta?.damage).toBeFalsy();
  expect(engine.get.tableCard(attacker)?.meta?.damage).toBeFalsy();
});

it("Let players challenge bodyguards", () => {
  const inkwell = [moanaOfMotunui, moanaOfMotunui];
  const engine = createRuleEngine(
    createMockGame(
      {
        inkwell,
        play: [simbaProtectiveCub],
      },
      {
        inkwell,
        play: [simbaProtectiveCub, simbaProtectiveCub],
      }
    )
  );

  engine.get.zoneCards("play", opponent).forEach((card) => {
    engine.moves.tapCard(card, { exerted: true });
    expect(engine.get.tableCard(card)?.meta?.exerted).toBeTruthy();
  });

  const attacker = engine.get.byZoneAndId({
    owner: testPlayer,
    zone: "play",
    lorcanitoId: simbaProtectiveCub.id,
  });
  const defender = engine.get.byZoneAndId({
    owner: opponent,
    zone: "play",
    lorcanitoId: simbaProtectiveCub.id,
  });

  engine.moves.challenge(attacker, defender);

  expect(engine.get.tableCard(defender)?.meta?.damage).toEqual(2);
  expect(engine.get.tableCard(attacker)?.meta?.damage).toEqual(2);
});
