/**
 * @jest-environment node
 */
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { moanaOfMotunui, zeusGodOfLightning } from "~/engine/cards/TFC";

describe("Rush keyword", () => {
  it("Can challenge with fresh ink", () => {
    const testStore = new TestStore(
      {
        inkwell: zeusGodOfLightning.cost,
        hand: [zeusGodOfLightning],
      },
      {
        play: [moanaOfMotunui],
      }
    );

    const attacker = testStore.getByZoneAndId("hand", zeusGodOfLightning.id);
    testStore.store.playCardFromHand(attacker.instanceId);

    const defender = testStore.getByZoneAndId(
      "play",
      moanaOfMotunui.id,
      "player_two"
    );
    defender.updateCardMeta({ exerted: true });

    attacker.challenge(defender);

    expect(attacker.meta.damage).toEqual(1);
    expect(defender.meta.damage).toEqual(4);
  });
});
