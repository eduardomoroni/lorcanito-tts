/**
 * @jest-environment node
 */
import { TestStore } from "~/engine/rules/testStore";
import { expect } from "@jest/globals";
import {
  moanaOfMotunui,
  zeusGodOfLightning,
} from "~/engine/cards/TFC/characters/characters";

describe("Challenger keyword", () => {
  it("gets bonus when challenging", () => {
    const testStore = new TestStore(
      {
        play: [zeusGodOfLightning],
      },
      {
        play: [moanaOfMotunui],
      },
    );

    const attacker = testStore.getByZoneAndId("play", zeusGodOfLightning.id);
    const defender = testStore.getByZoneAndId(
      "play",
      moanaOfMotunui.id,
      "player_two",
    );

    defender.updateCardMeta({ exerted: true });

    expect(attacker.meta.damage).toBeFalsy();
    expect(defender.meta.damage).toBeFalsy();

    testStore.store.cardStore.challenge(
      attacker.instanceId,
      defender.instanceId,
    );

    expect(attacker.meta.damage).toEqual(1);
    expect(defender.meta.damage).toEqual(4);
  });

  it("doesn't get the bonus when being challenged", () => {
    const testStore = new TestStore(
      {
        play: [zeusGodOfLightning],
      },
      {
        play: [moanaOfMotunui],
      },
    );

    const defender = testStore.getByZoneAndId("play", zeusGodOfLightning.id);
    const attacker = testStore.getByZoneAndId(
      "play",
      moanaOfMotunui.id,
      "player_two",
    );

    defender.updateCardMeta({ exerted: true });

    expect(attacker.meta.damage).toBeFalsy();
    expect(defender.meta.damage).toBeFalsy();

    testStore.store.cardStore.challenge(
      attacker.instanceId,
      defender.instanceId,
    );

    expect(attacker.meta.damage).toEqual(0);
    expect(defender.meta.damage).toEqual(1);
  });
});
