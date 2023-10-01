/**
 * @jest-environment node
 */
import { createRuleEngine } from "~/engine/engine";
import { gameBeforeAlterHand } from "~/engine/__mocks__/gameMock";
import {
  heiheiBoatSnack,
  moanaOfMotunui,
} from "~/engine/cards/TFC/characters/characters";
import { TestStore } from "~/engine/rules/testStore";
import { expect } from "@jest/globals";

const testPlayer = "player_one";

const maleficent = "tnw97xassyww93ehp7bfuot1";
const coconutBasket = "tjky2hlfxfwy9myr5ugn4kuh";

it("can put card in inkwell", () => {
  const testStore = new TestStore({
    hand: [heiheiBoatSnack],
  });
  const first = testStore.getByZoneAndId("hand", heiheiBoatSnack.id);

  first.addToInkwell();
  expect(first.zone).toEqual("inkwell");

  expect(testStore.getZonesCardCount()).toEqual(
    expect.objectContaining({ inkwell: 1 }),
  );
});

it("Cannot put two cards in the inkwell zone the same turn", () => {
  const testStore = new TestStore({
    hand: [heiheiBoatSnack, moanaOfMotunui],
  });
  const first = testStore.getByZoneAndId("hand", heiheiBoatSnack.id);
  const second = testStore.getByZoneAndId("hand", moanaOfMotunui.id);

  first.addToInkwell();
  expect(first.zone).toEqual("inkwell");
  second.addToInkwell();
  expect(second.zone).toEqual("hand");

  expect(testStore.getZonesCardCount()).toEqual(
    expect.objectContaining({ inkwell: 1 }),
  );
});
