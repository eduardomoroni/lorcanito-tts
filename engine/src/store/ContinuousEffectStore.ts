import { makeAutoObservable, toJS } from "mobx";
import type { MobXRootStore } from "@lorcanito/engine/store/RootStore";
import type {
  AttributeEffect,
  ContinuousEffect,
} from "@lorcanito/engine/rules/effects/effectTypes";
import { ContinuousEffectModel } from "@lorcanito/engine/store/models/ContinuousEffectModel";
import { CardModel } from "@lorcanito/engine/store/models/CardModel";
import {
  loreEffectPredicate,
  replacementEffectPredicate,
  strengthEffectPredicate,
} from "@lorcanito/engine/rules/effects/effectTypes";
import { mapContinuousEffectToAbility } from "@lorcanito/engine/store/utils";
import { exhaustiveCheck } from "@lorcanito/engine/lib/exhaustiveCheck";
import { notEmptyPredicate } from "@lorcanito/engine/rules/abilities/abilityTypeGuards";
import { EffectModel } from "@lorcanito/engine/store/models/EffectModel";
import { AbilityModel } from "@lorcanito/engine";

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

      const cardSource = rootStore.cardStore.getCard(source);
      const cardTarget = target ? rootStore.cardStore.getCard(target) : null;
      const responder = "";

      return new ContinuousEffectModel(
        id,
        cardSource as CardModel, // TODO: CardNotFound issue
        cardTarget || null, // TODO: CardNotFound issue
        duration,
        new EffectModel(
          effect.effect,
          cardSource as CardModel, // TODO: CardNotFound issue,
          responder,
          rootStore,
          this.observable,
        ),
        effect.filters || [],
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
        return replacementEffectPredicate(continuous.effect.effect);
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
        const effect = continuous.effect.effect;

        if (!loreEffectPredicate(effect)) {
          return acc;
        }

        const amount = this.rootStore.effectStore.calculateDynamicEffectAmount(
          effect,
          card,
        );

        switch (effect.modifier) {
          case "add": {
            return acc + amount;
          }
          case "subtract": {
            return acc - amount;
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
      const amount = this.rootStore.effectStore.calculateDynamicEffectAmount(
        effect,
        card,
      );

      switch (effect.modifier) {
        case "add": {
          return acc + amount;
        }
        case "subtract": {
          return acc - amount;
        }
      }

      this.rootStore.debug("NOT IMPLEMENTED");
      return 0;
    };

    const continuousEffectModifier = this.rootStore.continuousEffectStore
      .findContinuousEffectsByCard(card)
      .reduce((acc, continuous) => {
        const effect = continuous.effect.effect;

        if (!strengthEffectPredicate(effect)) {
          return acc;
        }

        return reducer(acc, effect);
      }, 0);

    return continuousEffectModifier;
  }

  getAbilitiesModifier(
    card: CardModel,
    filters: Array<(ability: AbilityModel) => boolean>,
  ) {
    return this.continuousEffects
      .filter((effect) => effect.effect.type === "ability")
      .filter((continuous) => continuous.isValid(card))
      .map(mapContinuousEffectToAbility)
      .filter(notEmptyPredicate)
      .map(
        (ability) =>
          new AbilityModel(ability, card, this.rootStore, this.observable),
      )
      .filter((ability) => filters.every((filter) => filter(ability)));
  }

  getQuestRestriction(card: CardModel) {
    return this.rootStore.continuousEffectStore.continuousEffects
      .filter((continuous) => {
        const effect = continuous.effect.effect;
        return effect.type === "restriction" && effect.restriction === "quest";
      })
      .filter((continuous) => {
        return continuous.target?.instanceId === card.instanceId;
      });
  }

  getChallengeRestriction(card: CardModel) {
    return this.rootStore.continuousEffectStore.continuousEffects
      .filter((continuous) => {
        const effect = continuous.effect.effect;
        return (
          effect.type === "restriction" && effect.restriction === "challenge"
        );
      })
      .filter((continuous) => {
        return continuous.target?.instanceId === card.instanceId;
      });
  }

  getExertRestriction(card: CardModel) {
    return this.rootStore.continuousEffectStore.continuousEffects
      .filter((continuous) => {
        const effect = continuous.effect.effect;
        return effect.type === "restriction" && effect.restriction === "exert";
      })
      .filter((continuous) => {
        return continuous.target?.instanceId === card.instanceId;
      });
  }
}
