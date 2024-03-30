/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { sardineCan } from "@lorcanito/engine/cards/ROF/items/items";
import {
  cruellaDeVilPerfectlyWretched,
  gastonIntellectualPowerhouse,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Sardine Can", () => {
  it("**FLIGHT CABIN** Your exerted characters gain **Ward**. _(Opponents can’t choose them except to challenge.)_", () => {
    const testStore = new TestStore({
      play: [
        sardineCan,
        gastonIntellectualPowerhouse,
        cruellaDeVilPerfectlyWretched,
      ],
    });

    const target = testStore.getByZoneAndId(
      "play",
      gastonIntellectualPowerhouse.id,
    );
    const anotherTarget = testStore.getByZoneAndId(
      "play",
      cruellaDeVilPerfectlyWretched.id,
    );

    [target, anotherTarget].forEach((character) => {
      expect(character.hasWard).toBe(false);
    });

    [target, anotherTarget].forEach((character) => {
      character.updateCardMeta({ exerted: true });
      expect(character.hasWard).toBe(true);
    });
  });
});
