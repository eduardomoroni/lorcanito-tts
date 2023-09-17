/**
 * @jest-environment node
 */
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import {
  donaldDuckStruttingHisStuff,
  gastonArrogantHunter,
  jetsamUrsulaSpy,
  moanaOfMotunui,
  teKaTheBurningOne,
} from "~/engine/cards/TFC";
import { describe, expect } from "@jest/globals";

describe("Reckless keyword", () => {
  it("Cannot pass turn if there's a valid challenge target", () => {
    const testStore = new TestStore(
      {
        play: [gastonArrogantHunter],
      },
      {
        play: [moanaOfMotunui],
      }
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      gastonArrogantHunter.id
    );
    expect(cardUnderTest.meta).toEqual(
      expect.objectContaining({ exerted: undefined, playedThisTurn: undefined })
    );
    const defender = testStore.getByZoneAndId(
      "play",
      moanaOfMotunui.id,
      "player_two"
    );
    defender.updateCardMeta({ exerted: true });
    expect(defender.ready).toEqual(false);

    expect(testStore.store.turnPlayer).toEqual("player_one");
    expect(testStore.store.turnCount).toEqual(0);

    testStore.store.passTurn("player_one");

    expect(testStore.store.turnPlayer).toEqual("player_one");
    expect(testStore.store.turnCount).toEqual(0);
  });

  it("let people skip check if needed (manual mode)", () => {
    const testStore = new TestStore(
      {
        play: [gastonArrogantHunter],
      },
      {
        play: [moanaOfMotunui],
        deck: [moanaOfMotunui],
      }
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      gastonArrogantHunter.id
    );
    expect(cardUnderTest.meta).toEqual(
      expect.objectContaining({ exerted: undefined, playedThisTurn: undefined })
    );
    const defender = testStore.getByZoneAndId(
      "play",
      moanaOfMotunui.id,
      "player_two"
    );
    defender.updateCardMeta({ exerted: true });
    expect(defender.ready).toEqual(false);

    expect(testStore.store.turnPlayer).toEqual("player_one");
    expect(testStore.store.turnCount).toEqual(0);

    testStore.store.passTurn("player_one", true);

    expect(testStore.store.turnPlayer).toEqual("player_two");
    expect(testStore.store.turnCount).toEqual(1);
  });

  describe("When there's no valid challenge target", () => {
    it("No cards exerted", () => {
      const testStore = new TestStore(
        {
          play: [teKaTheBurningOne],
        },
        {
          play: [moanaOfMotunui],
          deck: [donaldDuckStruttingHisStuff],
        }
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        teKaTheBurningOne.id
      );
      const defender = testStore.getByZoneAndId(
        "play",
        moanaOfMotunui.id,
        "player_two"
      );

      expect(testStore.store.turnPlayer).toEqual("player_one");
      expect(testStore.store.turnCount).toEqual(0);

      testStore.store.passTurn("player_one");

      expect(testStore.store.turnPlayer).toEqual("player_two");
      expect(testStore.store.turnCount).toEqual(1);
    });

    it("Evasive glimmer", () => {
      const testStore = new TestStore(
        {
          play: [gastonArrogantHunter],
        },
        {
          play: [jetsamUrsulaSpy],
          deck: [jetsamUrsulaSpy],
        }
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        gastonArrogantHunter.id
      );
      expect(cardUnderTest.meta).toEqual(
        expect.objectContaining({
          exerted: undefined,
          playedThisTurn: undefined,
        })
      );
      const defender = testStore.getByZoneAndId(
        "play",
        jetsamUrsulaSpy.id,
        "player_two"
      );
      defender.updateCardMeta({ exerted: true });
      expect(defender.ready).toEqual(false);

      expect(testStore.store.turnCount).toEqual(0);
      expect(testStore.store.turnPlayer).toEqual("player_one");

      testStore.store.passTurn("player_one");

      expect(testStore.store.turnCount).toEqual(1);
      expect(testStore.store.turnPlayer).toEqual("player_two");
    });
  });
});
