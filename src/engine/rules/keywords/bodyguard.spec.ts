/**
 * @jest-environment node
 */

import { expect, it } from "@jest/globals";
import { createRuleEngine } from "~/engine/engine";
import { createMockGame } from "~/engine/__mocks__/createGameMock";
import { TestStore } from "~/engine/rules/testStore";
import {
  heiheiBoatSnack,
  liloMakingAWish,
  moanaOfMotunui,
  simbaProtectiveCub,
} from "~/engine/cards/TFC/characters/characters";

const testPlayer = "player_one";
const opponent = "player_two";

it("Let's you play a bodyguard character exerted", () => {
  // const inkwell = [moanaOfMotunui, moanaOfMotunui];
  // const engine = createRuleEngine(
  //   createMockGame({
  //     inkwell,
  //     hand: [simbaProtectiveCub],
  //   }),
  // );
  //
  // const bodyGuardChar = engine.get.zoneCards("hand", testPlayer)[0];
  // if (!bodyGuardChar) {
  //   throw new Error("No cards found");
  // }
  //
  // engine.moves.playCardFromHand(bodyGuardChar, { bodyguard: true });
  // const cardUnderTest = engine.get.tableCard(bodyGuardChar);
  //
  // expect(engine.get.zoneCards("play", testPlayer)).toContain(bodyGuardChar);
  // expect(cardUnderTest?.meta?.playedThisTurn).toBe(true);
  // expect(cardUnderTest?.meta?.exerted).toBeTruthy();
});

it("doesn't let you challenge a body guarded character", () => {
  // const inkwell = [moanaOfMotunui, moanaOfMotunui];
  //
  // const testStore = new TestStore(
  //   {
  //     inkwell,
  //     play: [liloMakingAWish],
  //   },
  //   {
  //     inkwell,
  //     play: [simbaProtectiveCub, heiheiBoatSnack],
  //   },
  // );
  //
  // testStore.store.tableStore
  //   .getPlayerZone("player_two", "play")
  //   ?.cards.forEach((card) => {
  //     card.updateCardMeta({ exerted: true });
  //   });
  //
  // const attacker = testStore.getByZoneAndId("play", liloMakingAWish.id);
  // const defender = testStore.getByZoneAndId(
  //   "play",
  //   heiheiBoatSnack.id,
  //   "player_two",
  // );
  //
  // attacker.challenge(defender);
  //
  // // Bodyguard should prevent the challenge from happening, in case of an invalid target
  // expect(attacker.meta?.damage).toBeFalsy();
  // expect(defender.meta?.damage).toBeFalsy();
});

it("Let players challenge bodyguards", () => {
  // const inkwell = [moanaOfMotunui, moanaOfMotunui];
  // const engine = createRuleEngine(
  //   createMockGame(
  //     {
  //       inkwell,
  //       play: [simbaProtectiveCub],
  //     },
  //     {
  //       inkwell,
  //       play: [simbaProtectiveCub, simbaProtectiveCub],
  //     },
  //   ),
  // );
  //
  // engine.get.zoneCards("play", opponent).forEach((card) => {
  //   engine.moves.tapCard(card, { exerted: true });
  //   expect(engine.get.tableCard(card)?.meta?.exerted).toBeTruthy();
  // });
  //
  // const attacker = engine.get.byZoneAndId({
  //   owner: testPlayer,
  //   zone: "play",
  //   lorcanitoId: simbaProtectiveCub.id,
  // });
  // const defender = engine.get.byZoneAndId({
  //   owner: opponent,
  //   zone: "play",
  //   lorcanitoId: simbaProtectiveCub.id,
  // });
  //
  // engine.moves.challenge(attacker, defender);
  //
  // expect(engine.get.tableCard(defender)?.meta?.damage).toEqual(2);
  // expect(engine.get.tableCard(attacker)?.meta?.damage).toEqual(2);
});
