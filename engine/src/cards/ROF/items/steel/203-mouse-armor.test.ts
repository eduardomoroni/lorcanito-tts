/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { mouseArmor } from "@lorcanito/engine/cards/ROF/items/items";
import { tianaDiligentWaitress } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Mouse Armor", () => {
  it("**PROTECTION** ↷ − Chosen character gains **Resist** +1 until the start of your next turn. _(Damage dealt to them is reduced by 1.)_", () => {
    const testStore = new TestStore({
      play: [mouseArmor, tianaDiligentWaitress],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", mouseArmor.id);
    const target = testStore.getByZoneAndId("play", tianaDiligentWaitress.id);

    expect(target.hasResist).toBeFalsy();

    cardUnderTest.activate();
    expect(testStore.stackLayers).toHaveLength(1);

    testStore.resolveTopOfStack({ targets: [target] });

    expect(cardUnderTest.meta.exerted).toBeTruthy();

    expect(target.hasResist).toBeTruthy();
    expect(target.damageReduction).toEqual(1);
  });
});
