import { makeAutoObservable, toJS } from "mobx";
import { CardModel } from "~/engine/store/models/CardModel";
import { StaticTriggeredAbility } from "~/engine/rules/abilities/abilities";
import {
  cardEffectTargetPredicate,
  onChallengedTriggerEffectTargetPredicate,
  onPlayTriggerEffectTargetPredicate,
  triggerItselfTargetPredicate,
  TriggerTarget,
} from "~/engine/rules/effects/effectTypes";
import { exhaustiveCheck } from "~/libs/exhaustiveCheck";

export class StaticTriggeredAbilityModel {
  type: "static-triggered" = "static-triggered";
  source: CardModel;
  cardThatTriggered: CardModel;

  layer: StaticTriggeredAbility["layer"];
  trigger: StaticTriggeredAbility["trigger"];
  effects: StaticTriggeredAbility["effects"];
  optional: StaticTriggeredAbility["optional"];

  constructor(
    ability: StaticTriggeredAbility,
    source: CardModel,
    cardThatTriggered: CardModel,
    observable: boolean,
  ) {
    if (observable) {
      makeAutoObservable<StaticTriggeredAbilityModel, "rootStore">(this, {
        rootStore: false,
      });
    }
    this.source = source;
    this.cardThatTriggered = cardThatTriggered;
    // We gotta make sure changes to the type StaticTriggeredAbility are reflected in the constructor
    this.effects = ability.effects;
    this.trigger = ability.trigger;
    this.optional = ability.optional;
    this.layer = ability.layer;
  }

  get filters() {
    if (this.trigger.on === "play" && "filters" in this.trigger.target) {
      return this.trigger.target.filters;
    } else {
      return [];
    }
  }

  // TODO: FInd a better way to do this

  replacePlayTarget(card: CardModel) {
    const layer = this.layer;

    layer.effects.forEach((effect) => {
      const target = effect.target;

      if (!onPlayTriggerEffectTargetPredicate(target)) {
        return;
      }

      effect.target = {
        type: "instanceId",
        instanceId: card.instanceId,
      };
    });
  }

  // same as above
  replaceTriggerTarget(card: CardModel) {
    const layer = this.layer;

    layer.effects.forEach((effect) => {
      const target = effect.target;

      if (!triggerItselfTargetPredicate(target)) {
        return;
      }

      effect.target = {
        type: "instanceId",
        instanceId: card.instanceId,
      };
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

    layer.effects.forEach((effect) => {
      const target = effect.target;

      if (!onChallengedTriggerEffectTargetPredicate(target)) {
        return;
      }

      switch (target.value) {
        case "attacker":
          if (attacker) {
            effect.target = {
              type: "instanceId",
              instanceId: attacker?.instanceId,
            };
          } else {
            console.error("no attacker");
          }

          break;
        case "defender":
          if (defender) {
            effect.target = {
              type: "instanceId",
              instanceId: defender?.instanceId,
            };
          } else {
            console.error("No defender");
          }

          break;
        default: {
          exhaustiveCheck(target);
        }
      }
    });
  }

  toJSON() {
    return {
      source: this.source.fullName,
      effects: toJS(this.effects),
      trigger: this.trigger,
      optional: this.optional,
      layer: this.layer,
    };
  }
}
