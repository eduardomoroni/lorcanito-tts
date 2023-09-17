import { makeAutoObservable, toJS } from "mobx";
import { GameEffect } from "~/libs/game";
import { Dependencies } from "~/store/types";
import { StackLayerModel } from "~/store/models/StackLayerModel";
import { CardModel } from "~/store/models/CardModel";
import { createId } from "@paralleldrive/cuid2";
import type { MobXRootStore } from "~/store/RootStore";
import type { ScryEffectPayload } from "~/engine/effectTypes";
import {
  Ability,
  ActivatedAbility,
  activatedAbilityPredicate,
  ResolutionAbility,
  resolutionAbilityPredicate,
  staticTriggeredAbilityPredicate,
} from "~/engine/abilities";

export type ResolvingParam = {
  targetId?: string;
  targets?: CardModel[];
  player?: string;
  scry?: ScryEffectPayload;
};

export class StackLayerStore {
  dependencies: Dependencies;
  layers: StackLayerModel[];
  rootStore: MobXRootStore;

  constructor(
    initialState: GameEffect[] = [],
    dependencies: Dependencies,
    rootStore: MobXRootStore
  ) {
    makeAutoObservable(this, { rootStore: false, dependencies: false });
    this.dependencies = dependencies;
    this.rootStore = rootStore;

    this.layers = [];
    this.sync(initialState);
  }

  sync(effects?: GameEffect[]) {
    if (!effects) {
      this.layers = [];
      return;
    }

    this.layers = effects.map((effect) => {
      return new StackLayerModel(
        effect.instanceId,
        effect.id,
        effect.responder,
        effect.ability as ResolutionAbility | ActivatedAbility,
        this.rootStore
      );
    });
  }

  toJSON(): GameEffect[] {
    return toJS(this.layers.map((effect) => effect.toJSON()));
  }

  getAbility(effectId: string) {
    return this.layers.find((effect) => effect.id === effectId);
  }

  // TODO: mudar Ability para AbilityModel
  addAbilityToStack(ability: Ability, card: CardModel) {
    const isResolution = resolutionAbilityPredicate(ability);
    const isActivated = activatedAbilityPredicate(ability);
    const isStaticTriggered = staticTriggeredAbilityPredicate(ability);

    if (isResolution || isActivated || isStaticTriggered) {
      const responder =
        ability.responder === "opponent"
          ? this.rootStore.opponentPlayer
          : this.rootStore.activePlayer;
      const layer = new StackLayerModel(
        card.instanceId,
        createId(),
        responder,
        ability,
        this.rootStore
      );
      this.layers.push(layer);

      this.rootStore.log({ type: "EFFECT", effect: layer.toJSON() });
      if (layer.autoResolve) {
        layer.resolve();
      }
    } else {
      console.log("Static abilities are not supported yet");
    }
  }

  resolveAbility(effectId: string, params?: ResolvingParam) {
    const ability = this.getAbility(effectId);

    if (!ability) {
      console.error("Effect not found", effectId);
    } else {
      ability.resolve(params);
    }
  }

  remove(effect: StackLayerModel) {
    const index = this.layers.findIndex((element) => element.id === effect.id);
    if (index !== -1) {
      this.layers.splice(index, 1);
    }
  }
}
