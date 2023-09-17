import { makeAutoObservable, toJS } from "mobx";
import type { MobXRootStore } from "~/store/RootStore";
import type { CardModel } from "~/store/models/CardModel";
import type { Trigger } from "~/engine/abilities";
import { staticTriggeredAbilityPredicate } from "~/engine/abilities";
import { exhaustiveCheck } from "~/libs/exhaustiveCheck";
import { StaticTriggeredAbilityModel } from "~/store/models/StaticTriggeredAbilityModel";

export class StaticTriggeredStore {
  private readonly rootStore: MobXRootStore;

  constructor(rootStore: MobXRootStore) {
    makeAutoObservable<StaticTriggeredStore, "rootStore">(this, {
      rootStore: false,
    });
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
            triggers.push(new StaticTriggeredAbilityModel(ability, card));
          }
        });
      });

    return triggers;
  }

  getTriggers(trigger: Trigger): StaticTriggeredAbilityModel[] {
    switch (trigger) {
      case "quest": {
        return this.triggers.filter((ability) => {
          return ability.trigger === "quest";
        });
      }
      case "play": {
        return this.triggers.filter((ability) => {
          return ability.trigger === "play";
        });
      }
      case "banish": {
        return this.triggers.filter((ability) => {
          return ability.trigger === "banish";
        });
      }
      default: {
        exhaustiveCheck(trigger);
        return [];
      }
    }
  }

  trigger(trigger: Trigger, card: CardModel) {
    const triggers = this.getTriggers(trigger);

    triggers.forEach((ability) => {
      const filters =
        (ability.targets?.type === "card" && ability.targets?.filters) || [];
      const expectedOwner = ability.source.ownerId;

      // This is only valid to play and banish
      if (ability.trigger === "play" || ability.trigger === "banish") {
        if (!card.isValidTarget(filters, expectedOwner)) {
          return;
        }
      }

      switch (ability.trigger) {
        case "play": {
          if (filters && card.isValidTarget(filters)) {
            this.rootStore.stackLayerStore.addAbilityToStack(
              ability,
              ability.source
            );
          }

          if (filters.length === 0) {
            this.rootStore.stackLayerStore.addAbilityToStack(
              ability,
              ability.source
            );
          }
          break;
        }
        case "banish":
        case "quest": {
          this.rootStore.stackLayerStore.addAbilityToStack(
            ability,
            ability.source
          );
          break;
        }
        default: {
          exhaustiveCheck(ability.trigger);
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
    this.rootStore.continuousEffectStore.continuousEffects
      .filter((continuous) => {
        // This should be Model's responsibily, we should only trigger the effect
        const effect = continuous.effect;
        return (
          effect.type === "replacement" &&
          effect.replacement === "cost" &&
          effect.duration === "next" &&
          card.isValidTarget(continuous.filters || [])
        );
      })
      .forEach((continuous) =>
        this.rootStore.continuousEffectStore.stopContinuousEffect(continuous)
      );
  }
}
