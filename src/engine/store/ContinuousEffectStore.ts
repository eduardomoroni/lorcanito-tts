import { makeAutoObservable, toJS } from "mobx";
import type { MobXRootStore } from "~/engine/store/RootStore";
import type {
  AttributeEffect,
  ContinuousEffect,
} from "~/engine/rules/effects/effectTypes";
import { ContinuousEffectModel } from "~/engine/store/models/ContinuousEffectModel";
import { CardModel } from "~/engine/store/models/CardModel";
import {
  loreEffectPredicate,
  replacementEffectPredicate,
  strengthEffectPredicate,
} from "~/engine/rules/effects/effectTypes";
import { mapContinuousEffectToAbility } from "~/engine/store/utils";
import { notEmptyPredicate } from "~/engine/rules/abilities/abilities";
import { exhaustiveCheck } from "~/libs/exhaustiveCheck";

export class ContinuousEffectStore {
  continuousEffects: ContinuousEffectModel[];

  private readonly rootStore: MobXRootStore;
  private readonly observable: boolean;

  constructor(
    initialState: ContinuousEffect[],
    rootStore: MobXRootStore,
    observable: boolean,
  ) {
    if (observable) {
      makeAutoObservable<ContinuousEffectStore, "dependencies" | "rootStore">(
        this,
        {
          rootStore: false,
          dependencies: false,
        },
      );
    }
    this.observable = observable;
    this.rootStore = rootStore;

    this.continuousEffects = [];
    this.sync(initialState);
  }

  sync(effects: ContinuousEffect[] = []) {
    const rootStore = this.rootStore;
    this.continuousEffects = effects.map((effect) => {
      const { id, source, target, duration } = effect;
      return new ContinuousEffectModel(
        id,
        rootStore.cardStore.getCard(source),
        target ? rootStore.cardStore.getCard(target) : undefined,
        duration,
        effect.effect,
        rootStore,
        this.observable,
      );
    });
  }

  toJSON(): ContinuousEffect[] {
    return toJS(this.continuousEffects.map((effect) => effect.toJSON()));
  }

  startContinuousEffect(effect: ContinuousEffectModel) {
    this.continuousEffects.push(effect);
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

  onPlay(card: CardModel) {
    this.continuousEffects
      .filter((continuous) => {
        return replacementEffectPredicate(continuous.effect);
      })
      .forEach((continuous) => continuous.cardPlayed(card));
  }

  onTurnPassed(turn: number) {
    // iterate the array in reverse order
    // so we can remove items without breaking the loop
    for (let i = this.continuousEffects.length - 1; i >= 0; i--) {
      const effect = this.continuousEffects[i];
      if (
        // turn can be 0
        effect?.duration?.turn !== undefined &&
        effect?.duration?.turn < turn
      ) {
        this.stopContinuousEffect(effect);
      }
    }
  }
  onChallenge(attacker: CardModel, defender: CardModel) {}
  findContinuousEffectsByCard(card: CardModel): ContinuousEffectModel[] {
    return this.continuousEffects.filter(
      (effect) => effect.target?.instanceId === card.instanceId,
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
          case "filter": {
            console.error("NOT IMPLEMENTED");
            return 0;
          }
          default: {
            exhaustiveCheck(effect);
            return 0;
          }
        }
      }, 0) || 0
    );
  }

  getStrengthModifier(card: CardModel): number {
    const reducer = (acc: number, effect: AttributeEffect) => {
      switch (effect.modifier) {
        case "add": {
          return acc + effect.amount;
        }
        case "subtract": {
          return acc - effect.amount;
        }
      }

      console.log("NOT IMPLEMENTED");
      return 0;
    };

    const continuousEffectModifier = this.rootStore.continuousEffectStore
      .findContinuousEffectsByCard(card)
      .reduce((acc, continuous) => {
        const effect = continuous.effect;

        if (!strengthEffectPredicate(effect)) {
          return acc;
        }

        return reducer(acc, effect);
      }, 0);

    return continuousEffectModifier;
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

  getExertRestriction(card: CardModel) {
    return this.rootStore.continuousEffectStore.continuousEffects
      .filter((continuous) => {
        return (
          continuous.effect.type === "restriction" &&
          continuous.effect.restriction === "exert"
        );
      })
      .filter((continuous) => {
        return continuous.target?.instanceId === card.instanceId;
      });
  }
}
