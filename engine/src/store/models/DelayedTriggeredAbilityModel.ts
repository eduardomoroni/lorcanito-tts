import { makeAutoObservable } from "mobx";
import { CardModel } from "@lorcanito/engine/store/models/CardModel";
import { DelayedTriggeredAbility } from "@lorcanito/engine/rules/abilities/abilities";
import { isValidAbilityTriggerTarget } from "@lorcanito/engine/store/models/isValidAbilityTarget";
import { AbilityModel, MobXRootStore } from "@lorcanito/engine";

export class DelayedTriggeredAbilityModel {
  cardSource: CardModel;
  // cardTrigger: CardModel;
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
  conditions?: DelayedTriggeredAbility["conditions"];

  private readonly rootStore: MobXRootStore;
  private readonly observable: boolean;

  constructor(
    id: string,
    ability: DelayedTriggeredAbility,
    source: CardModel,
    // cardTrigger: CardModel,
    duration: number,
    rootStore: MobXRootStore,
    observable: boolean,
  ) {
    if (observable) {
      makeAutoObservable<DelayedTriggeredAbilityModel, "rootStore">(this, {
        rootStore: false,
      });
    }

    this.observable = observable;
    this.rootStore = rootStore;

    this.cardSource = source;
    this.id = id;

    // We gotta make sure changes to the type DelayedTriggeredAbility are reflected in the constructor
    this.duration = duration;
    this.trigger = ability.trigger;
    this.optional = ability.optional;
    this.layer = ability.layer;
    this.responder = ability.responder;
    this.text = ability.text;
    this.name = ability.name;
    this.cost = ability.costs;
    this.conditions = ability.conditions;
  }

  sync(ability: DelayedTriggeredAbility) {
    // We don't sync abilities, we just create new ones
  }

  activate(
    target: CardModel,
    params: { attacker?: CardModel; defender?: CardModel } = {},
  ) {
    if (this.isValidTrigger(target)) {
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

  isValidTrigger(target?: CardModel) {
    console.warn("NOT IMPLEMENTED");
    return true;
  }

  isValidTarget(target: CardModel) {
    console.warn("NOT IMPLEMENTED");
    return false;
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
