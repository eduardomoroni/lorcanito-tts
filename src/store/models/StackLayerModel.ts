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

export class StackLayerModel implements GameEffect {
  source: CardModel;
  instanceId: string;
  id: string;
  responder: string;
  ability: ResolutionAbility | ActivatedAbility | StaticTriggeredAbility;
  private readonly rootStore: MobXRootStore;

  constructor(
    instanceId: string,
    id: string,
    responder: string,
    ability: ResolutionAbility | ActivatedAbility | StaticTriggeredAbility,
    rootStore: MobXRootStore
  ) {
    makeAutoObservable<StackLayerModel, "rootStore">(this, {
      rootStore: false,
    });

    this.id = id;
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

  resolve(params: ResolvingParam = {}) {
    const { targetId } = params;

    // TODO: better handle effects that target player
    if (targetId && this.ability?.targets) {
      const filters =
        "filters" in this.ability.targets ? this.ability.targets.filters : [];
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
        return;
      }

      if (!isTargetValid) {
        this.rootStore.sendNotification({
          type: "icon",
          title: "Invalid target for effect",
          message: `You selected an invalid target for the effect`,
          icon: "warning",
          autoClear: true,
        });
        return;
      }

      logAnalyticsEvent("resolve_effect");
    } else if (params.player) {
      // TODO: validate user exists
    } else {
      logAnalyticsEvent("skip_resolve_effect");
    }

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
      this.rootStore.stackLayerStore.remove(this);
      return;
    }

    this.rootStore.log({
      type: "RESOLVE_EFFECT",
      // This is actually a layer
      effect: this.toJSON(),
      targetId,
    });
    ability.effects?.forEach((effect) => {
      const effectModel = new EffectModel(effect, this.source, this.rootStore);

      effectModel.resolve(params);
      this.rootStore.stackLayerStore.remove(this);
    });
  }

  get autoResolve() {
    // if the effect is optional, we should let the player decide
    if (this.ability.optional) {
      return false;
    }

    if (!!this.ability.targets) {
      return false;
    }

    return true;
  }

  cancel() {
    const costs = "costs" in this.ability ? this.ability.costs : undefined;

    if (costs) {
      this.source.unpayCosts(costs);
    }

    this.rootStore.stackLayerStore.remove(this);
    this.rootStore.log({ type: "CANCEL_EFFECT", effect: this.toJSON() });
  }
}
