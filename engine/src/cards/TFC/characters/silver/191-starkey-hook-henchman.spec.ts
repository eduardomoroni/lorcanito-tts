/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { starkeyHooksHenchman } from "@lorcanito/engine/cards/TFC/characters/characters";

xdescribe("Starkey - Hook's Henchman", () => {
  it("**AYE AYE, CAPTAIN** While you have a Captain character in play, this character gets +1 ◆.", () => {
    const testStore = new TestStore({
      play: [starkeyHooksHenchman],
    });
  });
});
