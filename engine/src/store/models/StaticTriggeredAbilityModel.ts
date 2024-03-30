import { makeAutoObservable, toJS } from "mobx";
import {
  type CardModel,
  type StaticTriggeredAbility,
  type MobXRootStore,
  type TargetFilter,
  AbilityModel,
  cardEffectTargetPredicate,
  challengeFilterPredicate,
  isValidAbilityTriggerTarget,
  isValidTarget,
  exhaustiveCheck,
  staticTriggeredAbilityPredicate,
} from "@lorcanito/engine";

export class StaticTriggeredAbilityModel {
  type: "static-triggered" = "static-triggered";
  cardSource: CardModel;
  cardThatTriggered: CardModel;

  layer: StaticTriggeredAbility["layer"];
  trigger: StaticTriggeredAbility["trigger"];
  effects: StaticTriggeredAbility["effects"];
  optional: StaticTriggeredAbility["optional"];
  conditions: StaticTriggeredAbility["conditions"];
  model: AbilityModel;

  private readonly rootStore: MobXRootStore;
  private readonly observable: boolean;

  constructor(
    abilityModel: AbilityModel,
    source: CardModel,
    cardThatTriggered: CardModel,
    rootStore: MobXRootStore,
    observable: boolean,
  ) {
    if (observable) {
      makeAutoObservable<StaticTriggeredAbilityModel, "rootStore">(this, {
        rootStore: false,
      });
    }

    this.observable = observable;
    this.rootStore = rootStore;

    const ability = abilityModel.ability;
    this.model = abilityModel;
    if (!staticTriggeredAbilityPredicate(ability)) {
      throw new Error("Invalid ability");
    }

    // TODO: FIx properly
    // We're cloning the ability because we don't want to modify the original
    // THere's a mutation when the we replace target "itself" or other relative targets with the actual card that triggered the effect
    const abilityClone = JSON.parse(JSON.stringify(ability));

    this.cardSource = source;
    this.cardThatTriggered = cardThatTriggered;
    // We gotta make sure changes to the type StaticTriggeredAbility are reflected in the constructor
    this.effects = abilityClone.effects;
    this.trigger = abilityClone.trigger;
    this.optional = abilityClone.optional;
    this.conditions = abilityClone.conditions;
    this.layer = abilityClone.layer;

    this.replaceTriggerTarget(source, cardThatTriggered);
  }

  // TODO: MAKE IT CONSIStent
  get filters(): TargetFilter[] {
    if ("filters" in this.trigger) {
      return this.trigger.filters || [];
    }

    if ("target" in this.trigger && "filters" in this.trigger.target) {
      return this.trigger.target.filters || [];
    }

    return [];
  }

  // same as above
  replaceTriggerTarget(source: CardModel, trigger: CardModel) {
    const layer = this.layer;

    layer.effects.forEach((effect) => {
      const effectTarget = effect.target;

      if (cardEffectTargetPredicate(effectTarget)) {
        const sourceSelf = effectTarget.filters.findIndex(
          (item) => item.filter === "source" && item.value === "self",
        );
        if (sourceSelf !== -1) {
          effectTarget.filters.splice(sourceSelf, 1, {
            filter: "instanceId",
            value: source.instanceId,
          });
        }

        const sourceTrigger = effectTarget.filters.findIndex(
          (item) => item.filter === "source" && item.value === "trigger",
        );
        if (sourceTrigger !== -1) {
          effectTarget.filters.splice(sourceTrigger, 1, {
            filter: "instanceId",
            value: trigger.instanceId,
          });
        }
      }
    });
  }

  // TODO: find a better way to do this
  // When we receive the JSON representation of the layer, they contain "static" values that are only known during runtime
  // So when we instantiate the model, we replace those values by the actual targets that are in play
  replaceChallengeTarget(
    params: { attacker?: CardModel; defender?: CardModel } = {},
  ) {
    const { attacker, defender } = params;
    const layer = this.layer;

    if (!attacker || !defender) {
      return;
    }

    layer.effects.forEach((effect) => {
      const target = effect.target;

      if (cardEffectTargetPredicate(target)) {
        const challengeFilter = target.filters.findIndex(
          challengeFilterPredicate,
        );
        const filter = target.filters[challengeFilter];

        if (challengeFilterPredicate(filter)) {
          target.filters.splice(challengeFilter, 1, {
            filter: "instanceId",
            value:
              filter.value === "attacker"
                ? attacker?.instanceId
                : defender?.instanceId,
          });
        }
      }
    });
  }

  isValidTarget(target: CardModel) {
    return isValidTarget(
      target,
      { type: "card", filters: this.filters, value: 1 },
      this.cardSource,
    );
  }

  isValidTriggerTarget(target?: CardModel) {
    if (!target) {
      return false;
    }

    return isValidAbilityTriggerTarget(
      this,
      target,
      this.cardSource.ownerId,
      this.cardSource,
    );
  }

  isValidTrigger(
    target: CardModel,
    params: { attacker?: CardModel; defender?: CardModel } = {},
  ) {
    const source = this.cardSource;
    const trigger = this.trigger;
    const { attacker, defender } = params;

    if (
      this.conditions &&
      !this.rootStore.effectStore.metCondition(this.cardSource, this.conditions)
    ) {
      return;
    }

    if ("replaceChallengeTarget" in this) {
      this.replaceChallengeTarget(params);
    }

    switch (trigger.on) {
      case "moves-to-a-location": {
        console.warn("TODO: Implement");
        break;
      }
      case "quest": {
        // TODO: Move this to the respective model
        const isValidCardTarget =
          cardEffectTargetPredicate(trigger.target) &&
          this.isValidTriggerTarget(target);

        const isValidThisCharacterTarget =
          trigger.target.filters.find(
            (item) => item.filter === "source" && item.value === "self",
          ) && target.instanceId === this.cardSource.instanceId;

        return isValidCardTarget && isValidThisCharacterTarget;
      }
      case "ready": {
        const validTarget = target.isValidTarget(
          this.filters,
          source.ownerId,
          source,
        );
        const isSelf =
          trigger.target.filters.find(
            (item) => item.filter === "source" && item.value === "self",
          ) && target.instanceId !== this.cardSource.instanceId;
        console.warn({ isSelf, validTarget });
        return !isSelf && validTarget;
      }
      case "discard":
        if ("player" in this.trigger) {
          const { player } = this.trigger;

          if (player === "opponent" && source.ownerId === target.ownerId) {
            return false;
          }
        }

        return true;
      case "damage": {
        return target.isValidTarget(this.filters, source.ownerId, source);
      }
      case "heal": {
        return target.isValidTarget(this.filters, source.ownerId, source);
      }
      case "start_turn":
        return source.ownerId === this.rootStore.turnPlayer;
      case "end_turn":
        return source.ownerId === this.rootStore.turnPlayer;
      case "play":
        return this.isValidTarget(target);
      case "leave":
        return true;
      case "banish-another":
        if (!attacker || !defender) {
          console.error("No attacker or defender");
          return false;
        }

        if (this.cardSource.instanceId !== attacker.instanceId) {
          this.rootStore.debug("Not the attacker");
          return;
        }

        return true;
      case "banish": {
        const source = this.cardSource;

        if (trigger.in === "challenge") {
          if (!attacker || !defender) {
            console.error("No attacker or defender");
            return;
          }

          if (
            trigger.as === "defender" &&
            source.instanceId !== defender?.instanceId
          ) {
            this.rootStore.debug("Not the defender");
            return;
          }

          // TODO: I have to split the effect "banish" from "is banished"
          if (
            trigger.as === "attacker" &&
            source.instanceId !== attacker?.instanceId
          ) {
            this.rootStore.debug("Not the attacker");
            return;
          }

          if (
            trigger.as === "both" &&
            target.instanceId !== attacker?.instanceId &&
            target.instanceId !== defender?.instanceId
          ) {
            this.rootStore.debug("Not the attacker nor the defender");
            return;
          }
        }

        return true;
      }
      case "challenge": {
        const actualTarget = trigger.as === "attacker" ? attacker : defender;

        if (!actualTarget) {
          return false;
        }

        // TODO: I have to fix the models
        if ("cardThatTriggered" in this) {
          this.cardThatTriggered = actualTarget;
        }

        // When filter is not present, it means it triggers for the source
        if (this.filters.length === 0) {
          return source.instanceId === actualTarget.instanceId;
        }

        return this.isValidTarget(actualTarget);
      }
      default: {
        exhaustiveCheck(trigger);
        return false;
      }
    }
  }

  activate(
    target: CardModel,
    params: { attacker?: CardModel; defender?: CardModel } = {},
  ) {
    if (this.isValidTrigger(target, params)) {
      this.rootStore.stackLayerStore.addAbilityToStack(
        new AbilityModel(
          this.layer,
          this.cardSource,
          this.rootStore,
          this.observable,
        ),
        this.cardSource,
      );
    }
  }

  toJSON() {
    return {
      source: this.cardSource.fullName,
      effects: toJS(this.effects),
      trigger: this.trigger,
      optional: this.optional,
      layer: this.layer,
    };
  }
}
