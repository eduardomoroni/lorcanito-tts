import { makeAutoObservable, toJS } from "mobx";
import { CardModel } from "~/store/models/CardModel";
import { StaticTriggeredAbility } from "~/engine/abilities";
import { cardEffectTargetPredicate } from "~/engine/effectTypes";

export class StaticTriggeredAbilityModel {
  type: "static-triggered" = "static-triggered";
  source: CardModel;

  layer: StaticTriggeredAbility["layer"];
  trigger: StaticTriggeredAbility["trigger"];
  effects: StaticTriggeredAbility["effects"];
  optional: StaticTriggeredAbility["optional"];

  constructor(
    ability: StaticTriggeredAbility,
    source: CardModel,
    observable: boolean
  ) {
    if (observable) {
      makeAutoObservable<StaticTriggeredAbilityModel, "rootStore">(this, {
        rootStore: false,
      });
    }
    this.source = source;

    // We gotta make sure changes to the type StaticTriggeredAbility are reflected in the constructor
    this.effects = ability.effects;
    this.trigger = ability.trigger;
    this.optional = ability.optional;
    this.layer = ability.layer;
  }

  get filters() {
    const target = this.trigger.target;
    return cardEffectTargetPredicate(target) ? target.filters : [];
  }

  toJSON() {
    return {
      source: this.source.fullName,
      effects: toJS(this.effects),
      optional: this.optional,
    };
  }
}
