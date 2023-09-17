/**
 * @jest-environment node
 */
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import {
  genieOnTheJob,
  geniePowerUnleashed,
  peterPanNeverLanding,
  zeusGodOfLightning,
} from "~/engine/cards/TFC";

describe("Evasive keyword", () => {
  it("Can challenge another evasive", () => {
    const testStore = new TestStore(
      {
        play: [geniePowerUnleashed],
      },
      {
        play: [genieOnTheJob],
      }
    );

    const attacker = testStore.getByZoneAndId("play", geniePowerUnleashed.id);
    const defender = testStore.getByZoneAndId(
      "play",
      genieOnTheJob.id,
      "player_two"
    );
    defender.updateCardMeta({ exerted: true });
    expect(defender.ready).toBeFalsy();

    attacker.challenge(defender);

    expect(attacker.meta).toEqual(
      expect.objectContaining({ damage: 3, exerted: true })
    );
    expect(defender.meta).toEqual(
      expect.objectContaining({ damage: 3, exerted: true })
    );
  });

  it("non evasive cannot challenge evasive char", () => {
    const testStore = new TestStore(
      {
        play: [zeusGodOfLightning],
      },
      {
        play: [peterPanNeverLanding],
      }
    );

    const attacker = testStore.getByZoneAndId("play", zeusGodOfLightning.id);
    const defender = testStore.getByZoneAndId(
      "play",
      peterPanNeverLanding.id,
      "player_two"
    );
    defender.updateCardMeta({ exerted: true });

    testStore.store.cardStore.challenge(
      attacker.instanceId,
      defender.instanceId
    );

    expect(attacker.meta).toEqual(
      expect.objectContaining({ damage: undefined, exerted: undefined })
    );
    expect(defender.meta).toEqual(
      expect.objectContaining({ damage: undefined, exerted: true })
    );
  });
});
