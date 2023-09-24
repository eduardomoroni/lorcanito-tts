/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { fryingPan, shieldOfVirtue } from "~/engine/cards/TFC/items/items";

import {heiheiBoatSnack, teKaTheBurningOne} from "~/engine/cards/TFC/characters/characters";

describe("Frying Pan", () => {
  it("**CLANG!** Banish this item - Chosen character can't challenge during their next turn.", () => {
    const testStore = new TestStore(
      {
        play: [fryingPan, heiheiBoatSnack],
      },
      {
        play: [teKaTheBurningOne],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId("play", fryingPan.id);
    const attacker = testStore.getByZoneAndId("play", heiheiBoatSnack.id);
    const defender = testStore.getByZoneAndId(
      "play",
      teKaTheBurningOne.id,
      "player_two",
    );

    defender.updateCardMeta({ exerted: true });

    cardUnderTest.activate();

    testStore.resolveTopOfStack({ targetId: attacker.instanceId });

    attacker.challenge(defender);

    expect(defender.meta.damage).toBeFalsy();
    expect(attacker.meta.damage).toBeFalsy();
    expect(attacker.ready).toBeTruthy();
  });
});
