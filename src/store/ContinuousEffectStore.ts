import { makeAutoObservable, toJS } from "mobx";
import { Dependencies } from "~/store/types";
import type { MobXRootStore } from "~/store/RootStore";
import type { ContinuousEffect } from "~/engine/effectTypes";
import { ContinuousEffectModel } from "~/store/models/ContinuousEffectModel";
import { CardModel } from "~/store/models/CardModel";
import {
  loreEffectPredicate,
  strengthEffectPredicate,
} from "~/engine/effectTypes";
import { mapContinuousEffectToAbility } from "~/store/utils";
import { notEmptyPredicate } from "~/engine/abilities";

export class ContinuousEffectStore {
  continuousEffects: ContinuousEffectModel[];

  private readonly rootStore: MobXRootStore;

  constructor(initialState: ContinuousEffect[], rootStore: MobXRootStore) {
    makeAutoObservable<ContinuousEffectStore, "dependencies" | "rootStore">(
      this,
      {
        rootStore: false,
        dependencies: false,
      }
    );
    this.rootStore = rootStore;

    this.continuousEffects = [];
    this.sync(initialState);
  }

  sync(effects: ContinuousEffect[] = []) {
    const rootStore = this.rootStore;
    this.continuousEffects = effects.map(
      (effect) => new ContinuousEffectModel(effect, rootStore)
    );
  }

  toJSON(): ContinuousEffect[] {
    return toJS(this.continuousEffects.map((effect) => effect.toJSON()));
  }

  startContinuousEffect(effect: ContinuousEffect) {
    this.continuousEffects.push(
      new ContinuousEffectModel(effect, this.rootStore)
    );
  }

  stopContinuousEffect(effect: ContinuousEffectModel) {
    const effects = this.continuousEffects || [];
    const index = effects.findIndex((element) => element.id === effect.id);
    if (index !== -1) {
      effects.splice(index, 1);
    }
  }

  findContinuousEffect(id: string): ContinuousEffectModel | undefined {
    return this.continuousEffects.find((effect) => effect.id === id);
  }

  findContinuousEffectsByCard(card: CardModel): ContinuousEffectModel[] {
    return this.continuousEffects.filter(
      (effect) => effect.target?.instanceId === card.instanceId
    );
  }

  getLoreModifier(card: CardModel): number {
    return (
      this.findContinuousEffectsByCard(card).reduce((acc, continuous) => {
        const effect = continuous.effect;

        if (!loreEffectPredicate(effect)) {
          return acc;
        }

        switch (effect.modifier) {
          case "add": {
            return acc + effect.amount;
          }
          case "subtract": {
            return acc - effect.amount;
          }
        }
      }, 0) || 0
    );
  }

  getStrengthModifier(card: CardModel): number {
    return (
      this.rootStore.continuousEffectStore
        .findContinuousEffectsByCard(card)
        .reduce((acc, continuous) => {
          const effect = continuous.effect;

          if (!strengthEffectPredicate(effect)) {
            return acc;
          }

          switch (effect.modifier) {
            case "add": {
              return acc + effect.amount;
            }
            case "subtract": {
              return acc - effect.amount;
            }
          }
        }, 0) || 0
    );
  }

  getAbilitiesModifier(card: CardModel) {
    return this.continuousEffects
      .filter((effect) => effect.effect.type === "ability")
      .filter((continuous) => {
        return continuous.duration?.turn === this.rootStore.turnCount;
      })
      .filter((continuous) => {
        return continuous.target?.instanceId === card.instanceId;
      })
      .map(mapContinuousEffectToAbility)
      .filter(notEmptyPredicate);
  }

  getQuestRestriction(card: CardModel) {
    return this.rootStore.continuousEffectStore.continuousEffects
      .filter((continuous) => {
        return (
          continuous.effect.type === "restriction" &&
          continuous.effect.restriction === "quest"
        );
      })
      .filter((continuous) => {
        return continuous.target?.instanceId === card.instanceId;
      });
  }

  getChallengeRestriction(card: CardModel) {
    return this.rootStore.continuousEffectStore.continuousEffects
      .filter((continuous) => {
        return (
          continuous.effect.type === "restriction" &&
          continuous.effect.restriction === "challenge"
        );
      })
      .filter((continuous) => {
        return continuous.target?.instanceId === card.instanceId;
      });
  }
}
