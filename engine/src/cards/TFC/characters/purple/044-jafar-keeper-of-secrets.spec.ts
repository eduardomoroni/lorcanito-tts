/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { jafarKeeperOfTheSecrets } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Jafar - Keeper of Secrets", () => {
  it("**HIDDEN WONDERS** This character gets +1 ※ for each card in your hand.", () => {
    const testStore = new TestStore({
      deck: 10,
      play: [jafarKeeperOfTheSecrets],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      jafarKeeperOfTheSecrets.id,
    );

    expect(cardUnderTest.strength).toEqual(0);

    testStore.store.drawCard("player_one");
    expect(cardUnderTest.strength).toEqual(1);

    testStore.store.drawCard("player_one");
    expect(cardUnderTest.strength).toEqual(2);

    testStore.store.drawCard("player_one");
    expect(cardUnderTest.strength).toEqual(3);
  });
});
