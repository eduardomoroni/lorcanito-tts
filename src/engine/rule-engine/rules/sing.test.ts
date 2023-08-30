/**
 * @jest-environment node
 */

import { expect, it } from "@jest/globals";
import {
  hakunaMatata,
  heiheiBoatSnack,
  mickeyMouseArtfulRogue,
} from "~/engine/cards";
import { createRuleEngine } from "~/engine/rule-engine/engine";
import { createMockGame } from "~/engine/rule-engine/__mocks__/createGameMock";

it("Sing a song paying costs", () => {});

it("Glimmer sings a song", () => {
  const engine = createRuleEngine(
    createMockGame({
      hand: [hakunaMatata],
      play: [mickeyMouseArtfulRogue],
    })
  );

  const song = engine.get.zoneCards("hand", "player_one")[0];
  const singer = engine.get.zoneCards("play", "player_one")[0];

  expect(engine.get.zoneCards("play", "player_one")).toHaveLength(1);
  engine.moves.singCard(song, singer);

  expect(engine.get.tableCard(singer)?.meta?.exerted).toBeTruthy();
  expect(engine.get.zoneCards("hand", "player_one")).toHaveLength(0);

  // TODO: once all songs are implemented we will change this to discard
  // expect(engine.get.zoneCards("discard", "player_one")).toHaveLength(1);
  expect(engine.get.zoneCards("play", "player_one")).toHaveLength(2);
});

it("Invalid glimmer sings a song", () => {
  const engine = createRuleEngine(
    createMockGame({
      hand: [hakunaMatata],
      play: [heiheiBoatSnack],
    })
  );

  const song = engine.get.zoneCards("hand", "player_one")[0];
  const singer = engine.get.zoneCards("play", "player_one")[0];

  engine.moves.singCard(song, singer);

  expect(engine.get.tableCard(singer)?.meta?.exerted).toBeFalsy();
  expect(engine.get.zoneCards("hand", "player_one")).toHaveLength(1);
  expect(engine.get.zoneCards("discard", "player_one")).toHaveLength(0);
});

it("Glimmer, with singer ability, sings a song", () => {});
