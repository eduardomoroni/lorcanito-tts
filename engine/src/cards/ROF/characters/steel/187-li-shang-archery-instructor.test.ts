/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  goofyKnightForADay,
  liShangArcheryInstructor,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Li Shang- Archery Instructor", () => {
  it("**ARCHERY LESSON** Whenever this character quests, your characters gain **Evasive** this turn. _(They can challenge characters with Evasive.)_", () => {
    const testStore = new TestStore({
      play: [liShangArcheryInstructor, goofyKnightForADay],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      liShangArcheryInstructor.id,
    );
    const target = testStore.getByZoneAndId("play", goofyKnightForADay.id);

    cardUnderTest.quest();

    expect(target.hasEvasive).toBe(false);
    testStore.resolveTopOfStack({ targets: [target] });
    expect(target.hasEvasive).toBe(true);
  });
});
