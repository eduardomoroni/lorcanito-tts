/**
 * @jest-environment node
 */

it("When both alter hands, should start game", () => {
  // const engine = createRuleEngine(gameBeforeAlterHand);
  //
  // // expect(engine.getContext().phase).toBe("alter_hand");
  //
  // engine.moves.alterHand([], playerOneID);
  // engine.moves.alterHand([], playerTwoID);
  //
  // // expect(engine.getContext().phase).toBe("play");
});

it("Should pass turn to the next player", () => {
  // const testStore = new TestStore(
  //   {
  //     deck: 53,
  //     hand: 7,
  //   },
  //   {
  //     deck: 53,
  //     hand: 7,
  //   },
  // );
  //
  // expect(testStore.store.turnCount).toBe(0);
  // expect(testStore.store.turnPlayer).toBe(playerOneID);
  //
  // for (let i = 1; i < 10; i++) {
  //   if (i === 0) {
  //     testStore.store.alterHand([], playerOneID);
  //     testStore.store.alterHand([], playerTwoID);
  //     expect(testStore.store.turnCount).toBe(0);
  //     continue;
  //   }
  //
  //   testStore.passTurn();
  //   testStore.passTurn();
  //   expect(testStore.store.turnCount).toBe(i * 2);
  // }
});

it("should ready cards when passing turn back to player", () => {
  // const testStore = new TestStore(
  //   {
  //     play: [mickeyMouseTrueFriend, heiheiBoatSnack],
  //     deck: 1,
  //   },
  //   {
  //     deck: 1,
  //   },
  // );
  //
  // const tableCard = testStore.store.tableStore.getPlayerZoneCards(
  //   "player_one",
  //   "play",
  // );
  //
  // expect(tableCard).toHaveLength(2);
  //
  // tableCard.forEach((card) => card.updateCardMeta({ exerted: true }));
  //
  // testStore.passTurn();
  // testStore.passTurn();
  //
  // tableCard.forEach((card) => expect(card.ready).toBeTruthy());
  // expect.assertions(3);
});

it("should NOT ready cards when the player passes their turn", () => {
  // const mockGame = createMockGame(
  //   {
  //     play: [mickeyMouseTrueFriend],
  //     deck: [mickeyMouseTrueFriend],
  //   },
  //   {
  //     play: [mickeyMouseTrueFriend],
  //     deck: [mickeyMouseTrueFriend],
  //   },
  // );
  // const engine = createRuleEngine(mockGame);
  //
  // const tableCard = engine.get.zoneCards("play", "player_one")[0];
  //
  // engine?.moves?.tapCard(tableCard, { exerted: true });
  // expect(engine.get.tableCard(tableCard)?.meta?.exerted).toBeTruthy();
  //
  // engine.moves.passTurn(playerOneID);
  //
  // expect(engine.get.tableCard(tableCard)?.meta?.exerted).toBeTruthy();
});

// passing turn back untaps
// remove freesh ink
// don't let play cards when it's not their turn
