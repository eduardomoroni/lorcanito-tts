import { makeAutoObservable } from "mobx";
import { CardModel } from "~/store/models/CardModel";
import { StaticTriggeredAbility } from "~/engine/abilities";

export class StaticTriggeredAbilityModel {
  source: CardModel;
  effects: StaticTriggeredAbility["effects"];
  trigger: StaticTriggeredAbility["trigger"];
  type: "static-triggered" = "static-triggered";
  targets: StaticTriggeredAbility["targets"];
  optional: StaticTriggeredAbility["optional"];

  constructor(ability: StaticTriggeredAbility, source: CardModel) {
    makeAutoObservable<StaticTriggeredAbilityModel, "rootStore">(this, {
      rootStore: false,
    });
    this.source = source;

    // We gotta make sure changes to the type StaticTriggeredAbility are reflected in the constructor
    this.effects = ability.effects;
    this.trigger = ability.trigger;
    this.targets = ability.targets;
    this.optional = ability.optional;
  }

  toJSON() {
    return {
      source: this.source.fullName,
    };
  }
}
