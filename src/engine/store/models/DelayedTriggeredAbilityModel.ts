import { makeAutoObservable } from "mobx";
import { CardModel } from "~/engine/store/models/CardModel";
import { DelayedTriggeredAbility } from "~/engine/rules/abilities/abilities";
import { createId } from "@paralleldrive/cuid2";

export class DelayedTriggeredAbilityModel {
  source: CardModel;
  id: string;

  // DelayedTriggeredAbility
  readonly type: "delayed-triggered" = "delayed-triggered";
  duration: number;
  layer: DelayedTriggeredAbility["layer"];
  trigger: DelayedTriggeredAbility["trigger"];
  optional: DelayedTriggeredAbility["optional"];
  responder?: DelayedTriggeredAbility["responder"];
  text?: DelayedTriggeredAbility["text"];
  name?: DelayedTriggeredAbility["name"];
  cost?: DelayedTriggeredAbility["costs"];

  constructor(
    ability: DelayedTriggeredAbility,
    source: CardModel,
    duration: number,
    observable: boolean,
  ) {
    if (observable) {
      makeAutoObservable<DelayedTriggeredAbilityModel, "rootStore">(this, {
        rootStore: false,
      });
    }
    this.source = source;
    this.id = createId();

    // We gotta make sure changes to the type DelayedTriggeredAbility are reflected in the constructor
    this.duration = duration;
    this.trigger = ability.trigger;
    this.optional = ability.optional;
    this.layer = ability.layer;
    this.responder = ability.responder;
    this.text = ability.text;
    this.name = ability.name;
    this.cost = ability.costs;
  }

  sync(ability: DelayedTriggeredAbility) {
    // We don't sync abilities, we just create new ones
  }

  toJSON(): DelayedTriggeredAbility {
    return {
      type: "delayed-triggered",
      trigger: this.trigger,
      optional: this.optional,
      layer: this.layer,
      responder: this.responder,
      text: this.text,
      name: this.name,
      costs: this.cost,
      duration: this.duration,
    };
  }
}
