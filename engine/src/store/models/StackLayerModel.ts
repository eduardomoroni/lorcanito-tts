import { makeAutoObservable, toJS } from "mobx";
import { cardEffectTargetPredicate } from "@lorcanito/engine/rules/effects/effectTargets";
import type {
  MobXRootStore,
  MoveResponse,
} from "@lorcanito/engine/store/RootStore";
import type { CardModel } from "@lorcanito/engine/store/models/CardModel";
import type { ResolvingParam } from "@lorcanito/engine/store/StackLayerStore";
import { AbilityModel } from "@lorcanito/engine/store/models/AbilityModel";
import type { EffectModel } from "@lorcanito/engine/store/models/EffectModel";
import { GameEffect } from "@lorcanito/engine/types";

export class StackLayerModel {
  source: CardModel;
  instanceId: string;
  id: string;
  responder: string;
  ability: AbilityModel;
  private readonly observable: boolean;
  private readonly rootStore: MobXRootStore;

  constructor(
    id: string,
    source: CardModel,
    ability: AbilityModel,
    rootStore: MobXRootStore,
    observable: boolean,
  ) {
    if (observable) {
      makeAutoObservable<StackLayerModel, "rootStore" | "observable">(this, {
        rootStore: false,
        observable: false,
      });
    }

    this.id = id;
    this.observable = observable;
    this.responder = ability.responder;
    this.rootStore = rootStore;
    this.instanceId = source.instanceId;
    this.source = source;
    this.ability = ability;
  }

  sync(effect: GameEffect) {
    throw new Error("We should not sync effects, they are only created");
  }

  toJSON(): GameEffect {
    return toJS({
      id: this.id,
      responder: this.responder,
      ability: this.ability.toJSON(),
      instanceId: this.source.instanceId,
    });
  }

  cancel() {
    const costs = this.ability.costs;
    if (costs) {
      this.source.unpayCosts(costs);
    }

    this.rootStore.stackLayerStore.removeLayerFromStack(this);
    this.rootStore.log({ type: "CANCEL_EFFECT", effect: this.toJSON() });
    this.rootStore.changePriority(this.rootStore.turnPlayer);
  }

  skipEffect(): MoveResponse {
    this.rootStore.stackLayerStore.removeLayerFromStack(this);
    this.rootStore.log({
      type: "SKIP_EFFECT",
      //effect: this.toJSON()
    });

    const skipLayer = this.ability.onCancelLayer();
    if (skipLayer) {
      this.rootStore.stackLayerStore.addAbilityToStack(
        new AbilityModel(
          skipLayer,
          this.source,
          this.rootStore,
          this.observable,
        ),
        this.source,
      );
    }

    this.rootStore.changePriority(this.rootStore.turnPlayer);

    return this.rootStore.moveResponse(true);
  }

  resolve(params: ResolvingParam = {}, opts: { skipLogs?: boolean } = {}) {
    if (params.skip) {
      this.rootStore.debug("skipping effect");
      this.skipEffect();
      return false;
    }

    // Not having effect means this is an optional ability layer.
    // I have to work on this concept a bit more.
    if (this.ability.optional && !this.ability.accepted) {
      const ability = this.ability.ability;

      this.rootStore.log({
        type: "OPTIONAL_ABILITY_ON_STACK_ACCEPTED",
        ability: ability,
        source: this.ability.source.instanceId,
      });

      this.rootStore.stackLayerStore.addAbilityToStack(
        new AbilityModel(
          { ...ability, accepted: true },
          this.ability.source,
          this.rootStore,
          this.observable,
        ),
        this.ability.source,
        {
          optionalAbility: true,
        },
      );

      return true;
    }

    // TODO: Should we change this to effect.areConditionsMet?
    if (!this.ability.areConditionsMet) {
      this.rootStore.debug("Condition not met, skipping effect");
      this.rootStore.log({
        type: "CONDITION_NOT_MET",
        layer: this.toJSON(),
      });
      this.skipEffect();
      return false;
    }

    // TODO: Should we change this to effect.hasTheRightAmountOfTargets?
    if (!this.ability.hasTheRightAmountOfTargets(params, this.responder)) {
      // In such cases, we have to cancel the effect
      if (this.ability.ability.dependentEffects) {
        return this.skipEffect();
      }

      this.rootStore.sendNotification({
        type: "icon",
        title: "Invalid number of targets.",
        message: "You're either targeting more or fewer cards than you should.",
        icon: "warning",
        autoClear: true,
      });
      return false;
    }

    if (!this.ability.isValidTarget(params, this.responder)) {
      this.rootStore.debug("Invalid target for effect");
      this.rootStore.sendNotification({
        type: "icon",
        title: "Invalid target for effect",
        message: `You selected an invalid target for the effect`,
        icon: "warning",
        autoClear: true,
      });
      return false;
    }

    // Static triggers vs Activated
    // activate pays cost before generating effect
    if (this.ability.type === "resolution" && this.ability.costs) {
      if (!this.source.canPayCosts(this.ability.costs)) {
        this.rootStore.log({
          type: "CANT_PAY_COSTS",
          //effect: this.toJSON()
        });
        this.skipEffect();
        this.rootStore.debug("Can't pay costs for effect");
        return false;
      }

      this.source.payCosts(this.ability.costs);
    }

    if (!opts.skipLogs) {
      this.rootStore.log({
        type: "RESOLVE_LAYER",
        layer: this.toJSON(),
        params: params,
      });
    }

    this.ability.effects.forEach((effectModel) => {
      try {
        effectModel.resolve(params);
      } catch (e) {
        // TODO: I have to find a better way of doing this
        this.rootStore.debug("Error resolving effect", e);
        return false;
      }
    });

    return true;
  }

  effectCardFilters() {
    const targets = this.ability.effectTargets();
    return targets.find(cardEffectTargetPredicate)?.filters || [];
  }

  // TODO: change this to effect
  targetAmount() {
    const targets = this.ability.effectTargets();
    const effectTarget = targets.find(cardEffectTargetPredicate);

    return effectTarget?.value || 1;
  }

  // TODO: change this to effect
  // TODO: add unit tests to this
  hasValidTarget() {
    if (this.targetsPlayer) {
      return true;
    }

    const exceptions = (effect?: EffectModel) => {
      return ["replacement", "scry"].includes(effect?.type || "");
    };
    if (this.ability.effects.filter(exceptions).length > 0) {
      return true;
    }

    return this.ability.potentialTargets().length > 0;
  }

  isOptional() {
    return this.ability.optional;
  }

  get targetsPlayer() {
    return this.ability.effects?.every((effect) => {
      if (effect.target?.type === "player") {
        return true;
      }

      return ["lore", "draw", "scry"].includes(effect.type || "");
    });
  }

  upToTarget() {
    const find = this.ability
      .effectTargets()
      .find((effect) => "upTo" in effect && effect.upTo);
    return !!find;
  }

  requiresTarget() {
    return this.ability.effects?.some((effect) => effect.requiresTarget());
  }

  getPotentialTargets() {
    return this.ability.potentialTargets();
  }

  getScryEffect() {
    return this.ability.getScryEffect()?.effect;
  }

  get autoResolve() {
    return !this.requiresTarget();
  }

  get name() {
    return this.ability.name;
  }

  get description() {
    return this.ability.text;
  }
}
