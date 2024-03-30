/**
 * @jest-environment node
 */

import { expect, it } from "@jest/globals";
import { hakunaMatata } from "@lorcanito/engine/cards/TFC/songs/songs";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  heiheiBoatSnack,
  mickeyMouseArtfulRogue,
} from "@lorcanito/engine/cards/TFC/characters/characters";

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
  const testStore = new TestStore({
    hand: [hakunaMatata],
    play: [heiheiBoatSnack],
  });

  const song = testStore.getByZoneAndId("hand", hakunaMatata.id);
  const singer = testStore.getByZoneAndId("play", heiheiBoatSnack.id);

  singer.sing(song);

  expect(singer.ready).toBeTruthy();
  expect(song.zone).toEqual("hand");
});

it("Glimmer, with singer ability, sings a song", () => {});
