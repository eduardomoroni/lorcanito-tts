import { makeAutoObservable, toJS } from "mobx";
import type { MobXRootStore } from "~/store/RootStore";
import { CardModel } from "~/store/models/CardModel";
import type { ContinuousEffect, Effect } from "~/engine/effectTypes";
import { TargetFilter } from "~/components/modals/target/filters";

// Continuous effects are effects that last for a duration of time.
// They don't exist in the JSON structure that we call LorcanitoCard
// but they are saved in Firebase
export class ContinuousEffectModel
  implements Omit<ContinuousEffect, "source" | "target">
{
  type: "continuous" = "continuous";
  id: string;
  // This should not be optional
  source?: CardModel;
  target?: CardModel;
  filters?: TargetFilter[];
  duration?: {
    // effect last until turn X
    turn: number;
    times?: number;
  };
  effect: Effect;
  private rootStore: MobXRootStore;

  constructor(effect: ContinuousEffect, rootStore: MobXRootStore) {
    makeAutoObservable<ContinuousEffectModel, "rootStore">(this, {
      rootStore: false,
    });

    this.id = effect.id;
    this.source = effect.source
      ? rootStore.cardStore.getCard(effect.source)
      : undefined;
    this.target = effect.target
      ? rootStore.cardStore.getCard(effect.target)
      : undefined;
    this.filters = effect.filters;
    this.duration = effect.duration;
    this.effect = effect.effect;

    this.rootStore = rootStore;
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
