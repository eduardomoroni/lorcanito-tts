import { makeAutoObservable } from "mobx";
import type { MobXRootStore } from "@lorcanito/engine/store/RootStore";
import type { CardModel } from "@lorcanito/engine/store/models/CardModel";
import type {
  Ability,
  Condition,
} from "@lorcanito/engine/rules/abilities/abilities";
import { EffectModel } from "@lorcanito/engine/store/models/EffectModel";
import {
  conditionEffectPredicate,
  scryEffectPredicate,
} from "@lorcanito/engine/rules/effects/effectTypes";
import { ResolvingParam } from "@lorcanito/engine/store/StackLayerStore";
import {
  cardEffectTargetPredicate,
  playerEffectTargetPredicate,
} from "@lorcanito/engine/rules/effects/effectTargets";
import {
  activatedAbilityPredicate,
  challengerAbilityPredicate,
  delayedTriggeredAbilityPredicate,
  gainStaticAbilityPredicate,
  notEmptyPredicate,
  propertyStaticPredicate,
  resolutionAbilityPredicate,
  reverseChallengerAbilityPredicate,
  singerStaticAbilityPredicate,
  staticAbilityPredicate,
  staticTriggeredAbilityPredicate,
  whileStaticAbilityPredicate,
} from "@lorcanito/engine/rules/abilities/abilityTypeGuards";

import { TargetFilter } from "@lorcanito/engine/filter/targetFilter";

export class AbilityModel {
  effects: EffectModel[];
  source: CardModel;

  readonly ability: Ability;
  private readonly rootStore: MobXRootStore;
  private readonly observable: boolean;

  constructor(
    ability: Ability,
    source: CardModel,
    rootStore: MobXRootStore,
    observable: boolean,
  ) {
    if (observable) {
      makeAutoObservable<AbilityModel, "rootStore" | "observable" | "ability">(
        this,
        {
          rootStore: false,
          observable: false,
          ability: false,
        },
      );
    }

    // beast relentless was causing this issue
    this.ability = JSON.parse(JSON.stringify(ability));
    this.observable = observable;
    this.source = source;
    this.rootStore = rootStore;

    this.effects =
      this.ability.effects?.map(
        (effect) =>
          new EffectModel(
            effect,
            this.source,
            this.responder,
            this.rootStore,
            this.observable,
          ),
      ) || [];

    // TODO: Change while-static to have effects instead of a single effect
    if (whileStaticAbilityPredicate(ability)) {
      const subAbility = ability.ability;

      if (propertyStaticPredicate(subAbility)) {
        this.effects = subAbility.effects.map(
          (effect) =>
            new EffectModel(
              effect,
              this.source,
              this.responder,
              this.rootStore,
              this.observable,
            ),
        );
      }
    }
  }

  sync(effect: Ability) {}

  toJSON(): Ability {
    if (!this.ability.name) {
      let match = this.source.lorcanitoCard.text?.match(/\*\*(.*?)\*\*/);

      if (match && match[1]) {
        this.ability.name = match[1]
          .toLowerCase()
          .replace(/(?:^|\s)\S/g, function (a) {
            return a.toUpperCase();
          });
      }
    }

    return this.ability;
  }

  get resolveEffectsIndividually() {
    return this.ability.resolveEffectsIndividually;
  }

  get costs() {
    return "costs" in this.ability ? this.ability.costs : undefined;
  }

  get type() {
    return this.ability.type;
  }

  get optional(): boolean {
    if (this.rootStore.configurationStore.autoAcceptOptionals) {
      return false;
    }

    return !!this.ability.optional;
  }

  get accepted(): boolean {
    return !!this.ability.accepted;
  }

  get name() {
    return this.ability.name || this.source.fullName;
  }

  get text() {
    return this.ability.text || this.source.lorcanitoCard.text || "";
  }

  get conditions(): Condition[] {
    const ability = this.ability;

    if (whileStaticAbilityPredicate(ability)) {
      return ability.whileCondition || [];
    }

    if (resolutionAbilityPredicate(ability)) {
      return ability.resolutionConditions || [];
    }

    return ability.conditions || [];
  }

  get areConditionsMet() {
    return this.rootStore.effectStore.metCondition(
      this.source,
      this.conditions,
    );
  }

  get conditionalEffects() {
    return this.ability.effects?.find(conditionEffectPredicate);
  }

  get scryEffect() {
    return this.ability?.effects?.find(scryEffectPredicate);
  }

  get isResolutionAbility() {
    return resolutionAbilityPredicate(this.ability);
  }

  get responder() {
    const sourceOwner = this.source.ownerId;

    return this.ability.responder === "opponent"
      ? this.rootStore.opponentPlayer(sourceOwner)
      : sourceOwner;
  }

  potentialTargets(): CardModel[] {
    return this.effects.reduce((acc, effect) => {
      let filters: TargetFilter[] = [];

      if (effect.target && "filters" in effect.target) {
        filters = effect.target.filters;
      }

      const cardsByFilter = this.rootStore.cardStore.getCardsByFilter(
        filters,
        this.responder,
        this.source,
      );
      return [...acc, ...cardsByFilter];
    }, [] as CardModel[]);
  }

  hasTheRightAmountOfTargets(params: ResolvingParam = {}, responder: string) {
    const { targets } = params;
    // TODO: We're currently only looking at the first target
    // the new set will require two targets, so we need to change this
    const cardTargets =
      this.ability.effects
        ?.map((effect) => effect.target)
        .filter(notEmptyPredicate)
        .filter(cardEffectTargetPredicate) || [];

    // TODO" I'm only looking at the first effect, this is wrong
    // To understand this better look at you have forgotten me
    const effectTarget = cardTargets[0];
    const cards = targets;

    if (!cards || !effectTarget) {
      return true;
    }

    const requiredNumberOfTargets = effectTarget.value;

    // Targeting all
    if (
      !requiredNumberOfTargets ||
      typeof requiredNumberOfTargets === "string"
    ) {
      return true;
    }

    // Single target
    if (
      requiredNumberOfTargets === cards.length &&
      requiredNumberOfTargets === 1
    ) {
      return true;
    }

    if (requiredNumberOfTargets === cards.length) {
      return true;
    }

    if (cards.length > requiredNumberOfTargets) {
      this.rootStore.debug("Selected more targets than required");
      return false;
    }

    // If the user has chosen fewer targets than the effect requires, we need to check if there are other targets that the user should have chosen,
    // if there are, the player should be notified
    if (cards.length < requiredNumberOfTargets) {
      if (effectTarget.upTo) {
        return true;
      }

      // In such a cases, we should fail the resolution as an subsequent effects might depend on this one
      if (this.ability.dependentEffects) {
        return false;
      }

      const filters = effectTarget ? effectTarget.filters : [];
      const allValidTargets = this.rootStore.cardStore.getCardsByFilter(
        filters,
        responder,
      );

      // If they're targeting fewer targets than needed
      return cards.length >= allValidTargets.length;
    }

    return true;
  }

  // TODO: This should be effects.every(effect => effect.isValidTarget)
  isValidTarget(params: ResolvingParam = {}, responder: string) {
    // TODO: better handle effects that target player
    const allEffectsTargets =
      this.ability.effects
        ?.map((effect) => effect.target)
        .filter(notEmptyPredicate) || [];
    const playerFilter = allEffectsTargets.find(playerEffectTargetPredicate);

    if (playerFilter) {
      return true;
    }

    if (!allEffectsTargets.length) {
      return true;
    }

    if (!params.targets) {
      return true;
    }

    return this.effects.every((effect) => {
      return params.targets?.every((target) =>
        effect.isValidTarget(target, this.responder),
      );
    });
  }

  effectTargets() {
    const conditionalEffect = this.conditionalEffects;

    if (conditionEffectPredicate(conditionalEffect)) {
      return (
        conditionalEffect.fallback
          ?.map((effect) => effect.target)
          .filter(notEmptyPredicate) || []
      );
    }

    return (
      this.ability.effects
        ?.map((effect) => effect.target)
        .filter(notEmptyPredicate) || []
    );
  }

  onCancelLayer() {
    const ability = this.ability;

    if (this.optional && resolutionAbilityPredicate(ability)) {
      return ability.onCancelLayer;
    }

    return undefined;
  }

  getScryEffect() {
    return this.effects.find((effect) => effect.isScryEffect());
  }

  get isStaticAbility() {
    return staticAbilityPredicate(this.ability);
  }
  get isWhileStaticAbility() {
    return whileStaticAbilityPredicate(this.ability);
  }

  get isGainStaticAbility() {
    return gainStaticAbilityPredicate(this.ability);
  }

  get isSingAbility() {
    return singerStaticAbilityPredicate(this.ability);
  }

  get isActivatedAbility() {
    return this.hasAbility(activatedAbilityPredicate);
  }

  get isChallengerAbility() {
    return challengerAbilityPredicate(this.ability);
  }
  get isReverseChallengerAbility() {
    return reverseChallengerAbilityPredicate(this.ability);
  }

  get isStaticTriggeredAbility() {
    return staticTriggeredAbilityPredicate(this.ability);
  }

  get isDelayedTriggered() {
    return delayedTriggeredAbilityPredicate(this.ability);
  }

  hasEffect(predicate: (effect: EffectModel) => boolean) {
    return this.effects.some(predicate);
  }

  hasAbility(predicate: (ability: Ability) => boolean) {
    const ability = this.ability;

    if (gainStaticAbilityPredicate(ability)) {
      return predicate(ability.gainedAbility);
    }

    if (whileStaticAbilityPredicate(ability)) {
      const subAbility = ability.ability;
      if (gainStaticAbilityPredicate(subAbility)) {
        return predicate(subAbility.gainedAbility);
      }

      return predicate(subAbility);
    }

    return predicate(ability);
  }
}
