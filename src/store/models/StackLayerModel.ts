import { makeAutoObservable, toJS } from "mobx";
import type { MobXRootStore } from "~/store/RootStore";
import { GameEffect } from "~/libs/game";
import type { CardModel } from "~/store/models/CardModel";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import type {
  ActivatedAbility,
  ResolutionAbility,
  StaticTriggeredAbility,
} from "~/engine/abilities";
import { EffectModel } from "~/store/models/EffectModel";
import type { ResolvingParam } from "~/store/StackLayerStore";
import { notEmptyPredicate } from "~/engine/abilities";
import {
  cardEffectTargetPredicate,
  playerEffectTargetPredicate,
} from "~/engine/effectTypes";

export class StackLayerModel implements GameEffect {
  source: CardModel;
  instanceId: string;
  id: string;
  responder: string;
  ability: ResolutionAbility | ActivatedAbility | StaticTriggeredAbility;
  private readonly observable: boolean;
  private readonly rootStore: MobXRootStore;

  constructor(
    instanceId: string,
    id: string,
    responder: string,
    ability: ResolutionAbility | ActivatedAbility | StaticTriggeredAbility,
    rootStore: MobXRootStore,
    observable: boolean
  ) {
    if (observable) {
      makeAutoObservable<StackLayerModel, "rootStore" | "observable">(this, {
        rootStore: false,
        observable: false,
      });
    }

    this.id = id;
    this.observable = observable;
    this.ability = ability;
    this.responder = responder;
    this.rootStore = rootStore;
    this.instanceId = instanceId;
    this.source = rootStore.cardStore.getCard(instanceId);
  }

  sync(effect: GameEffect) {
    throw new Error("We should not sync effects, they are only created");
  }

  toJSON(): GameEffect {
    return toJS({
      instanceId: this.source.instanceId,
      responder: this.responder,
      id: this.id,
      ability: this.ability,
    });
  }

  cancel() {
    const costs = "costs" in this.ability ? this.ability.costs : undefined;

    if (costs) {
      this.source.unpayCosts(costs);
    }

    this.rootStore.stackLayerStore.remove(this);
    this.rootStore.log({ type: "CANCEL_EFFECT", effect: this.toJSON() });
  }

  skipEffect() {
    this.rootStore.stackLayerStore.remove(this);
    // TODO: resolve this
    // this.rootStore.log({ type: "SKIP_EFFECT", effect: this.toJSON() });
  }

  resolve(params: ResolvingParam = {}) {
    const isValidTarget = this.isValidTarget(params);
    const isConditionMet = this.isConditionMet(params);

    if (params.skip) {
      console.log("skipping effect");
      this.skipEffect();
      return;
    }

    if (!isValidTarget || !isConditionMet) {
      console.log("invalid target", isValidTarget, isConditionMet);
      // this.cancel();
      return;
    }

    // Static triggers vs Activated
    // activate pasys cost before generating effect
    if (this.ability.type === "resolution" && this.ability.costs) {
      if (!this.source.canPayCosts(this.ability.costs)) {
        // this.rootStore.log({ type: "CANT_PAY_COSTS", effect: this.toJSON() });
        this.skipEffect();
        return;
      }

      this.source.payCosts(this.ability.costs);
    }

    this.rootStore.log({
      type: "RESOLVE_EFFECT",
      // This is actually a layer
      effect: this.toJSON(),
      targetId: "TEST_TEST",
    });

    this.ability.effects?.forEach((effect) => {
      const effectModel = new EffectModel(
        effect,
        this.source,
        this.rootStore,
        this.observable
      );

      effectModel.resolve(params);
      this.rootStore.stackLayerStore.remove(this);
    });
  }

  isConditionMet(params: ResolvingParam = {}) {
    const ability = this.ability;

    const conditionMet =
      "conditions" in ability
        ? ability.conditions?.every((condition) => {
            if (condition.type === "hand") {
              return (
                this.rootStore.tableStore.getPlayerZone(
                  this.source.ownerId,
                  "hand"
                )?.cards.length <= condition.amount
              );
            }

            return false;
          })
        : true;

    if (!conditionMet) {
      // TODO: decide whether we cancel execution or undo it
      console.log("Condition not met, cancelling effect");
      return false;
    }

    return true;
  }
  isValidTarget(params: ResolvingParam = {}) {
    const { targetId } = params;

    // TODO: better handle effects that target player
    const targets =
      this.ability.effects
        ?.map((effect) => effect.target)
        .filter(notEmptyPredicate) || [];

    if (!targets.length) {
      return true;
    }

    // TODO: We're currently only looking at the first target
    // the new set will require two targets, so we need to change this
    const cardTargets = targets.filter(cardEffectTargetPredicate);
    const playerTargets = targets.filter(playerEffectTargetPredicate);
    const cardFilter = targets.find(cardEffectTargetPredicate);
    const playerFilter = targets.find(playerEffectTargetPredicate);

    if (playerFilter) {
      return true;
    }

    if (targetId) {
      if (cardFilter) {
        const filters = cardFilter.filters;

        // TODO: replace by CardModel.isValidTarget
        const isTargetValid = this.rootStore.cardStore
          .getCardsByFilter(filters, this.responder)
          .find((card) => card.instanceId === targetId);

        if (isTargetValid?.hasWard) {
          this.rootStore.sendNotification({
            type: "icon",
            title: "Invalid target for effect",
            message: `You cannot target a card protected by Ward`,
            icon: "warning",
            autoClear: true,
          });

          return false;
        }

        if (!isTargetValid) {
          this.rootStore.sendNotification({
            type: "icon",
            title: "Invalid target for effect",
            message: `You selected an invalid target for the effect`,
            icon: "warning",
            autoClear: true,
          });

          return false;
        }

        logAnalyticsEvent("resolve_effect");
      } else {
        return false;
      }
    }

    return true;
  }

  effectTargets() {
    return (
      this.ability.effects
        ?.map((effect) => effect.target)
        .filter(notEmptyPredicate) || []
    );
  }

  effectCardFilters() {
    const targets = this.effectTargets();

    return targets.find(cardEffectTargetPredicate)?.filters || [];
  }

  // TODO: This function is not good, we gotta find a better mechanism
  get autoResolve() {
    // TODO: do this better
    const hasAutoResolveFalse = this.ability.effects?.some(
      (effect) =>
        effect.autoResolve ||
        (effect.target &&
          "autoResolve" in effect?.target &&
          effect.target.autoResolve === false)
    );

    if (this.ability.optional || hasAutoResolveFalse) {
      return false;
    }

    if (this.ability.effects?.some((effect) => effect.type === "conditional")) {
      return false;
    }

    const targets = this.effectTargets();

    if (targets.length === 0) {
      return true;
    }

    const cardTargets = targets.filter(cardEffectTargetPredicate);
    if (cardTargets.some((target) => target.value === "all")) {
      return true;
    }

    if (
      this.ability.effects?.every(
        (effect) =>
          effect.target?.type === "player" && effect.target.value === "self"
      )
    ) {
      return true;
    }

    return !this.ability.effects?.some((effect) => !!effect.target);
  }
}
