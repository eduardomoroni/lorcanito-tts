import { makeAutoObservable } from "mobx";
import type { MobXRootStore } from "~/store/RootStore";
import type { CardModel } from "~/store/models/CardModel";
import { OnTrigger, staticTriggeredAbilityPredicate } from "~/engine/abilities";
import { exhaustiveCheck } from "~/libs/exhaustiveCheck";
import { StaticTriggeredAbilityModel } from "~/store/models/StaticTriggeredAbilityModel";

export class StaticTriggeredStore {
  private readonly rootStore: MobXRootStore;
  private readonly observable: boolean;

  constructor(rootStore: MobXRootStore, observable: boolean) {
    if (observable) {
      makeAutoObservable<StaticTriggeredStore, "rootStore">(this, {
        rootStore: false,
      });
    }

    this.observable = observable;
    this.rootStore = rootStore;
  }

  private get triggers(): StaticTriggeredAbilityModel[] {
    const triggers: StaticTriggeredAbilityModel[] = [];

    // TODO: this might not be performant, revisit
    this.rootStore.cardStore
      .getCardsByFilter([{ filter: "zone", value: "play" }])
      .forEach((card) => {
        card.abilities.forEach((ability) => {
          if (staticTriggeredAbilityPredicate(ability)) {
            triggers.push(
              new StaticTriggeredAbilityModel(ability, card, this.observable)
            );
          }
        });
      });

    return triggers;
  }

  getTriggers(trigger: OnTrigger): StaticTriggeredAbilityModel[] {
    switch (trigger) {
      case "quest": {
        return this.triggers.filter((ability) => {
          return ability.trigger.on === "quest";
        });
      }
      case "play": {
        return this.triggers.filter((ability) => {
          return ability.trigger.on === "play";
        });
      }
      case "banish": {
        return this.triggers.filter((ability) => {
          return ability.trigger.on === "banish";
        });
      }
      default: {
        exhaustiveCheck(trigger);
        return [];
      }
    }
  }

  trigger(trigger: OnTrigger, card: CardModel) {
    const triggers = this.getTriggers(trigger);
    triggers.forEach((ability) => {
      const filters = ability.filters;
      const expectedOwner = ability.source.ownerId;

      // This is only valid to play and banish
      if (ability.trigger.on === "play" || ability.trigger.on === "banish") {
        if (!card.isValidTarget(filters, expectedOwner)) {
          return;
        }
      }

      switch (ability.trigger.on) {
        case "play": {
          if (filters && card.isValidTarget(filters)) {
            this.rootStore.stackLayerStore.addAbilityToStack(
              ability.layer,
              ability.source
            );
          } else if (filters.length === 0) {
            this.rootStore.stackLayerStore.addAbilityToStack(
              ability.layer,
              ability.source
            );
          }
          break;
        }
        case "banish":
        case "quest": {
          this.rootStore.stackLayerStore.addAbilityToStack(
            ability.layer,
            ability.source
          );
          break;
        }
        default: {
          exhaustiveCheck(ability.trigger.on);
        }
      }
    });
  }

  onBanish(card: CardModel) {
    this.trigger("banish", card);
  }

  onQuest(card: CardModel) {
    this.rootStore.log({
      type: "QUEST",
      instanceId: card.instanceId,
      cardId: card.cardId,
      amount: card.lore,
    });
    this.trigger("quest", card);
  }

  onPlay(card: CardModel) {
    this.trigger("play", card);
  }
}
