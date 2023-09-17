/**
 * @jest-environment node
 */
import { createRuleEngine } from "~/engine/rule-engine/engine";
import { gameBeforeAlterHand } from "~/engine/rule-engine/__mocks__/gameMock";

const testPlayer = "player_one";

const maleficent = "tnw97xassyww93ehp7bfuot1";
const coconutBasket = "tjky2hlfxfwy9myr5ugn4kuh";

it("can put card in inkwell", () => {
  const engine = createRuleEngine(gameBeforeAlterHand);

  engine.store.tableStore.addToInkwell(maleficent);

  expect(engine.get.zoneCards("inkwell", testPlayer)).toContain(maleficent);
  expect(engine.getState().cards[maleficent]?.meta?.playedThisTurn).toBe(true);
  expect(engine.getState().cards[maleficent]?.meta?.exerted).toBeFalsy();
});

it("Cannot put two cards in the inkwell zone the same turn", () => {
  const engine = createRuleEngine(gameBeforeAlterHand);

  engine.store.tableStore.addToInkwell(maleficent);
  engine.store.tableStore.addToInkwell(coconutBasket);

  expect(engine.getState().tables[testPlayer]?.zones.inkwell).toHaveLength(1);
  expect(engine.getState().tables[testPlayer]?.zones.hand).toContain(
    coconutBasket
  );
});
