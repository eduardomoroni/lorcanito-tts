import { makeAutoObservable, toJS } from "mobx";
import type { MobXRootStore } from "@lorcanito/engine/store/RootStore";
import type { CardModel } from "@lorcanito/engine/store/models/CardModel";
import type { ContinuousEffect } from "@lorcanito/engine/rules/effects/effectTypes";
import type { EffectModel } from "@lorcanito/engine/store/models/EffectModel";

import { TargetFilter } from "@lorcanito/engine/filter/targetFilter";

// Continuous effects are effects that last for a duration of time.
// They don't exist in the JSON structure that we call LorcanitoCard
// but they are saved in Firebase
export class ContinuousEffectModel
  implements Omit<ContinuousEffect, "source" | "target" | "effect">
{
  type: "continuous" = "continuous";
  id: string;
  source: CardModel;
  target: CardModel | null;
  filters: TargetFilter[];
  duration: ContinuousEffect["duration"];
  effect: EffectModel;
  private rootStore: MobXRootStore;

  constructor(
    id: string,
    source: CardModel,
    target: CardModel | null,
    duration: ContinuousEffect["duration"],
    effect: EffectModel,
    filters: TargetFilter[],
    rootStore: MobXRootStore,
    observable: boolean,
  ) {
    if (observable) {
      makeAutoObservable<ContinuousEffectModel, "rootStore">(this, {
        rootStore: false,
      });
    }

    this.id = id;
    this.source = source;
    this.target = target;
    this.duration = duration;
    this.effect = effect;
    this.filters = filters;

    this.rootStore = rootStore;
  }

  isValid(card: CardModel) {
    if (this.target?.instanceId !== card.instanceId) {
      return false;
    }

    if (this.duration?.until && this.duration?.turn) {
      return this.rootStore.turnCount <= this.duration?.turn;
    }

    return this.duration?.turn === this.rootStore.turnCount;
  }

  isCostReplacementEffect(card: CardModel): boolean {
    const effect = this.effect.effect;

    return (
      effect.type === "replacement" &&
      effect.replacement === "cost" &&
      card.isValidTarget(effect.target.filters || [])
    );
  }

  cardPlayed(card: CardModel) {
    const effect = this.effect.effect;
    if (
      this.isCostReplacementEffect(card) &&
      effect.type === "replacement" &&
      effect.duration === "next"
    ) {
      this.rootStore.continuousEffectStore.stopContinuousEffect(this);
    }
  }

  sync(effect: ContinuousEffect) {
    throw new Error("We don't sync them, we just create them");
  }

  toJSON(): ContinuousEffect {
    return {
      type: this.type,
      id: this.id,
      source: this.source?.instanceId,
      target: this.target?.instanceId,
      filters: toJS(this.filters),
      duration: toJS(this.duration),
      // TODO: This is not correct, it doesn't expose responder.
      effect: this.effect.effect,
    };
  }
}
