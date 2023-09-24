/**
 * @jest-environment node
 */

import { expect, it } from "@jest/globals";
import { createRuleEngine } from "~/engine/engine";
import { createMockGame } from "~/engine/__mocks__/createGameMock";
import { hakunaMatata } from "~/engine/cards/TFC/songs/songs";
import { TestStore } from "~/engine/rules/testStore";
import {heiheiBoatSnack, mickeyMouseArtfulRogue} from "~/engine/cards/TFC/characters/characters";

it("Sing a song paying costs", () => {});

it("Glimmer sings a song", () => {
  const testStore = new TestStore({
    hand: [hakunaMatata],
    play: [mickeyMouseArtfulRogue],
  });

  const song = testStore.getByZoneAndId("hand", hakunaMatata.id);
  const singer = testStore.getByZoneAndId("play", mickeyMouseArtfulRogue.id);

  singer.sing(song);

  expect(song.zone).toEqual("discard");
});

it("Invalid glimmer sings a song", () => {
  const engine = createRuleEngine(
    createMockGame({
      hand: [hakunaMatata],
      play: [heiheiBoatSnack],
    }),
  );

  const song = engine.get.zoneCards("hand", "player_one")[0];
  const singer = engine.get.zoneCards("play", "player_one")[0];

  engine.moves.singCard(song, singer);

  expect(engine.get.tableCard(singer)?.meta?.exerted).toBeFalsy();
  expect(engine.get.zoneCards("hand", "player_one")).toHaveLength(1);
  expect(engine.get.zoneCards("discard", "player_one")).toHaveLength(0);
});

it("Glimmer, with singer ability, sings a song", () => {});
