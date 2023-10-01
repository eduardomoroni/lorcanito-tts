/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { coconutbasket, dingleHopper } from "~/engine/cards/TFC/items/items";
import { tamatoaSoShiny } from "~/engine/cards/TFC/characters/characters";

describe("Tamatoa - So Shiny!", () => {
  it("Glam - This character gets +1 ◆ for each item you have in play.", () => {
    const testStore = new TestStore({
      inkwell: dingleHopper.cost + coconutbasket.cost,
      hand: [dingleHopper, coconutbasket],
      play: [tamatoaSoShiny],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", tamatoaSoShiny.id);
    const aTarget = testStore.getByZoneAndId("hand", dingleHopper.id);
    const anotherTarget = testStore.getByZoneAndId("hand", coconutbasket.id);

    expect(cardUnderTest.lore).toBe(1);
    aTarget.playFromHand();
    expect(cardUnderTest.lore).toBe(2);
    anotherTarget.playFromHand();
    expect(cardUnderTest.lore).toBe(3);
  });

  describe("WHAT HAVE WE HERE? - When you play this character and whenever he quests, you may return an item card from your discard to your hand.", () => {
    it("On play", () => {
      const testStore = new TestStore({
        inkwell: tamatoaSoShiny.cost,
        hand: [tamatoaSoShiny],
        discard: [dingleHopper],
      });

      const cardUnderTest = testStore.getByZoneAndId("hand", tamatoaSoShiny.id);
      const aTarget = testStore.getByZoneAndId("discard", dingleHopper.id);

      expect(aTarget.zone).toBe("discard");

      cardUnderTest.playFromHand();
      testStore.resolveTopOfStack({ targetId: aTarget.instanceId });
      expect(aTarget.zone).toBe("hand");
    });

    it("On quest", () => {
      const testStore = new TestStore({
        inkwell: tamatoaSoShiny.cost,
        play: [tamatoaSoShiny],
        discard: [coconutbasket],
      });

      const cardUnderTest = testStore.getByZoneAndId("play", tamatoaSoShiny.id);
      const anotherTarget = testStore.getByZoneAndId(
        "discard",
        coconutbasket.id,
      );

      cardUnderTest.quest();
      testStore.resolveTopOfStack({ targetId: anotherTarget.instanceId });
      expect(anotherTarget.zone).toBe("hand");
    });

    it("Can skip the effect.", () => {
      const testStore = new TestStore({
        inkwell: tamatoaSoShiny.cost,
        hand: [tamatoaSoShiny],
        discard: [dingleHopper],
      });

      const cardUnderTest = testStore.getByZoneAndId("hand", tamatoaSoShiny.id);
      const aTarget = testStore.getByZoneAndId("discard", dingleHopper.id);

      expect(aTarget.zone).toBe("discard");

      cardUnderTest.playFromHand();
      testStore.resolveTopOfStack({ skip: true });
      expect(aTarget.zone).toBe("discard");
      expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
    });
  });
});
