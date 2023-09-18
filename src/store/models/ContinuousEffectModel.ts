import { makeAutoObservable, toJS } from "mobx";
import type { MobXRootStore } from "~/store/RootStore";
import { CardModel } from "~/store/models/CardModel";
import type { ContinuousEffect, Effect } from "~/engine/effectTypes";
import { TargetFilter } from "~/components/modals/target/filters";
import { createId } from "@paralleldrive/cuid2";

// Continuous effects are effects that last for a duration of time.
// They don't exist in the JSON structure that we call LorcanitoCard
// but they are saved in Firebase
export class ContinuousEffectModel
  implements Omit<ContinuousEffect, "source" | "target">
{
  type: "continuous" = "continuous";
  id: string;
  // This should not be optional
  source: CardModel;
  target?: CardModel;
  filters?: TargetFilter[];
  duration?: {
    // effect last until turn X
    turn: number;
    times?: number;
  };
  effect: Effect;
  private rootStore: MobXRootStore;

  constructor(
    id: string,
    source: CardModel,
    target?: CardModel,
    // @ts-ignore
    duration: ContinuousEffect["duration"],
    effect: Effect,
    rootStore: MobXRootStore,
    observable: boolean
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

    this.rootStore = rootStore;
  }

  isCostReplacementEffect(card: CardModel): boolean {
    const effect = this.effect;

    return (
      effect.type === "replacement" &&
      effect.replacement === "cost" &&
      card.isValidTarget(effect.filters || [])
    );
  }

  cardPlayed(card: CardModel) {
    const effect = this.effect;
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
      effect: toJS(this.effect),
    };
  }
}
