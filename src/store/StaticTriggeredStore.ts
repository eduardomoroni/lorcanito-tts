import { makeAutoObservable, toJS } from "mobx";
import type { MobXRootStore } from "~/store/RootStore";
import type { CardModel } from "~/store/models/CardModel";
import {
  DelayedTriggeredAbility,
  delayedTriggeredAbilityPredicate,
  OnTrigger,
  staticTriggeredAbilityPredicate,
  Trigger,
} from "~/engine/rules/abilities/abilities";
import { exhaustiveCheck } from "~/libs/exhaustiveCheck";
import { StaticTriggeredAbilityModel } from "~/store/models/StaticTriggeredAbilityModel";
import { DelayedTriggeredAbilityModel } from "~/store/models/DelayedTriggeredAbilityModel";
import { Game } from "~/libs/game";
import { onChallengedTriggerEffectTargetPredicate } from "~/engine/rules/effects/effectTypes";

export class StaticTriggeredStore {
  private readonly rootStore: MobXRootStore;
  private readonly observable: boolean;

  delayedTriggeredAbilities: Array<DelayedTriggeredAbilityModel> = [];

  constructor(rootStore: MobXRootStore, observable: boolean) {
    if (observable) {
      makeAutoObservable<StaticTriggeredStore, "rootStore">(this, {
        rootStore: false,
      });
    }

    this.observable = observable;
    this.rootStore = rootStore;
  }

  sync(triggeredAbilities: DelayedTriggeredAbility[]) {}

  toJSON(): Game["triggeredAbilities"] {
    return toJS(
      this.delayedTriggeredAbilities.map((effect) => effect.toJSON()),
    );
  }

  private createTriggerModels(
    cardTrigger: CardModel,
  ): StaticTriggeredAbilityModel[] {
    const triggers: StaticTriggeredAbilityModel[] = [];

    // TODO: this might not be performant, revisit
    this.rootStore.cardStore
      .getCardsByFilter([{ filter: "zone", value: "play" }])
      .forEach((card) => {
        card.abilities.forEach((ability) => {
          if (staticTriggeredAbilityPredicate(ability)) {
            triggers.push(
              new StaticTriggeredAbilityModel(
                ability,
                card,
                cardTrigger,
                this.observable,
              ),
            );
          }
        });
      });

    return triggers;
  }

  getTriggers(
    trigger: OnTrigger,
    cardTriggered: CardModel,
  ): (StaticTriggeredAbilityModel | DelayedTriggeredAbilityModel)[] {
    let predicate = (ability: { trigger: Trigger }) => {
      return false;
    };
    switch (trigger) {
      case "quest": {
        predicate = (ability: { trigger: Trigger }) => {
          return ability.trigger.on === "quest";
        };
        break;
      }
      case "play": {
        predicate = (ability: { trigger: Trigger }) => {
          return ability.trigger.on === "play";
        };
        break;
      }
      case "banish": {
        predicate = (ability: { trigger: Trigger }) => {
          return ability.trigger.on === "banish";
        };
        break;
      }
      case "banish-another": {
        predicate = (ability: { trigger: Trigger }) => {
          return ability.trigger.on === "banish-another";
        };
        break;
      }
      case "challenge": {
        predicate = (ability: { trigger: Trigger }) => {
          return ability.trigger.on === "challenge";
        };
        break;
      }
      default: {
        exhaustiveCheck(trigger);
        return [];
      }
    }

    const staticTriggers =
      this.createTriggerModels(cardTriggered).filter(predicate);
    const delayedTriggers = this.delayedTriggeredAbilities.filter(predicate);
    return [...staticTriggers, ...delayedTriggers];
  }

  trigger(trigger: OnTrigger, card: CardModel) {
    const triggers = this.getTriggers(trigger, card);

    triggers.forEach((ability) => {
      const filters = "filters" in ability ? ability.filters : [];
      const expectedOwner = ability.source.ownerId;

      // This is only valid to play and banish
      const trigger = ability.trigger;
      if (trigger.on === "play" || trigger.on === "banish") {
        if (!card.isValidTarget(filters, expectedOwner)) {
          return;
        }
      }

      const layer = ability.layer;

      switch (trigger.on) {
        case "play": {
          // TODO: FInd a better way to do this
          if ("replacePlayTarget" in ability) {
            ability.replacePlayTarget(card);
          }

          if (filters && card.isValidTarget(filters)) {
            this.rootStore.stackLayerStore.addAbilityToStack(
              layer,
              ability.source,
            );
          } else if (filters.length === 0) {
            this.rootStore.stackLayerStore.addAbilityToStack(
              layer,
              ability.source,
            );
          }
          break;
        }
        case "challenge": {
          console.log("THis should be handled by the trigger");
          break;
        }
        case "banish": {
          console.log("THis should be handled by the trigger");
          break;
        }
        case "banish-another": {
          console.log("THis should be handled by the trigger");
          break;
        }
        case "quest": {
          this.rootStore.stackLayerStore.addAbilityToStack(
            layer,
            ability.source,
          );
          break;
        }
        default: {
          exhaustiveCheck(trigger);
        }
      }
    });
  }

  onChallenge(attacker: CardModel, defender: CardModel) {
    this.getTriggers("challenge", defender).forEach((triggeredAbility) => {
      const source = triggeredAbility.source;
      const trigger = triggeredAbility.trigger;

      if (trigger.on !== "challenge") {
        return;
      }

      // TODO: I have to fix the models
      if ("cardThatTriggered" in triggeredAbility) {
        if (trigger.as === "attacker") {
          triggeredAbility.cardThatTriggered = attacker;
        }

        if (trigger.as === "defender") {
          triggeredAbility.cardThatTriggered = defender;
        }
      }

      if (
        trigger.as === "attacker" &&
        source.instanceId !== attacker.instanceId
      ) {
        return;
      }

      if (
        trigger.as === "defender" &&
        source.instanceId !== defender.instanceId
      ) {
        return;
      }

      this.rootStore.stackLayerStore.addAbilityToStack(
        triggeredAbility.layer,
        source,
      );
    });
  }

  onBanish(
    banishedCard: CardModel,
    params: { attacker?: CardModel; defender?: CardModel } = {},
  ) {
    const { attacker, defender } = params;

    this.getTriggers("banish", banishedCard).forEach((triggeredAbility) => {
      const trigger = triggeredAbility.trigger;

      if (trigger.on !== "banish") {
        return;
      }

      const source = triggeredAbility.source;

      if (trigger.exclude === "source") {
        if (banishedCard.instanceId === source.instanceId) {
          console.log("Source is excluded");
          return;
        }
      }

      if (trigger.filters) {
        if (!banishedCard.isValidTarget(trigger.filters, source.ownerId)) {
          console.log("Not a valid target for banish trigger");
          return;
        }
      }

      if (trigger.in === "challenge") {
        if (!attacker || !defender) {
          console.error("No attacker or defender");
          return;
        }

        console.log(JSON.stringify(triggeredAbility, null, 2));
        console.log(`Attacker: ${attacker?.fullName}, ${attacker?.instanceId}`);
        console.log(`Defender: ${defender?.fullName}, ${defender?.instanceId}`);

        if (
          trigger.as === "defender" &&
          source.instanceId !== defender?.instanceId
        ) {
          console.log("Not the defender");
          return;
        }

        // TODO: I have to split the effect "banish" from "is banished"
        if (
          trigger.as === "attacker" &&
          source.instanceId !== attacker?.instanceId
        ) {
          console.log("Not the attacker");
          return;
        }

        if (
          trigger.as === "both" &&
          banishedCard.instanceId !== attacker?.instanceId &&
          banishedCard.instanceId !== defender?.instanceId
        ) {
          console.log("Not the attacker nor the defender");
          return;
        }

        if ("replaceChallengeTarget" in triggeredAbility) {
          triggeredAbility.replaceChallengeTarget(params);
        } else {
          console.error("No replaceChallengeTarget, please implement it");
        }
      }

      if ("replaceTriggerTarget" in triggeredAbility) {
        triggeredAbility.replaceTriggerTarget(banishedCard);
      }

      this.rootStore.stackLayerStore.addAbilityToStack(
        triggeredAbility.layer,
        // banishedCard,
        source,
      );
    });

    this.getTriggers("banish-another", banishedCard).forEach((triggered) => {
      const trigger = triggered.trigger;
      console.log(JSON.stringify(triggered, null, 2));
      console.log(`Attacker: ${attacker?.fullName}, ${attacker?.instanceId}`);
      console.log(`Defender: ${defender?.fullName}, ${defender?.instanceId}`);
      console.log(
        `Source: ${triggered.source.fullName}, ${triggered.source.instanceId}`,
      );
      if (trigger.on === "banish-another" && attacker && defender) {
        if (triggered.source.instanceId !== attacker.instanceId) {
          console.log("Not the attacker");
          return;
        }

        if ("replaceChallengeTarget" in triggered) {
          triggered.replaceChallengeTarget(params);
        } else {
          console.error("No replaceChallengeTarget, please implement it");
        }

        this.rootStore.stackLayerStore.addAbilityToStack(
          triggered.layer,
          triggered.source,
        );
      }
    });
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

    // If a card containing a delayed triggered ability is played, start the effect
    card.lorcanitoCard.abilities
      ?.filter(delayedTriggeredAbilityPredicate)
      .forEach((ability) => {
        this.startDelayedEffect(ability, card);
      });
  }
  startDelayedEffect(ability: DelayedTriggeredAbility, source: CardModel) {
    let duration = ability.duration;

    if (typeof duration === "string") {
      duration =
        ability.duration === "turn"
          ? this.rootStore.turnCount
          : this.rootStore.turnCount + 1;
    }

    this.delayedTriggeredAbilities.push(
      new DelayedTriggeredAbilityModel(ability, source, duration, true),
    );
  }

  stopDelayedEffect(abilityModel: DelayedTriggeredAbilityModel) {
    const effects = this.delayedTriggeredAbilities || [];
    const index = effects.findIndex(
      (element) => element.id === abilityModel.id,
    );
    if (index !== -1) {
      effects.splice(index, 1);
    }
  }

  onTurnPassed(turn: number) {
    this.delayedTriggeredAbilities.forEach((effect) => {
      if (effect.duration !== undefined && effect.duration < turn) {
        this.stopDelayedEffect(effect);
      }
    });
  }
}
