import { makeAutoObservable, toJS } from "mobx";
import { GameEffect } from "~/libs/game";
import { Dependencies } from "~/engine/store/types";
import { StackLayerModel } from "~/engine/store/models/StackLayerModel";
import { CardModel } from "~/engine/store/models/CardModel";
import { createId } from "@paralleldrive/cuid2";
import type { MobXRootStore } from "~/engine/store/RootStore";
import type { ScryEffectPayload } from "~/engine/rules/effects/effectTypes";
import {
  Ability,
  ActivatedAbility,
  activatedAbilityPredicate,
  delayedTriggeredAbilityPredicate,
  ResolutionAbility,
  resolutionAbilityPredicate,
  staticTriggeredAbilityPredicate,
  supportAbility,
  supportAbilityPredicate,
} from "~/engine/rules/abilities/abilities";

export type ResolvingParam = {
  targetId?: string;
  targets?: CardModel[];
  player?: string;
  scry?: ScryEffectPayload;
  skip?: boolean;
};

export class StackLayerStore {
  dependencies: Dependencies;
  layers: StackLayerModel[];
  readonly rootStore: MobXRootStore;
  readonly observable: boolean;

  constructor(
    initialState: GameEffect[] = [],
    dependencies: Dependencies,
    rootStore: MobXRootStore,
    observable: boolean,
  ) {
    if (observable) {
      makeAutoObservable(this, { rootStore: false, dependencies: false });
    }
    this.observable = observable;
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
        this.rootStore,
        this.observable,
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
  addAbilityToStack(
    ability: ResolutionAbility | ActivatedAbility,
    card: CardModel,
  ) {
    const isResolution = resolutionAbilityPredicate(ability);
    const isActivated = activatedAbilityPredicate(ability);
    const isStaticTriggered = staticTriggeredAbilityPredicate(ability);
    const isDelayedTriggered = delayedTriggeredAbilityPredicate(ability);

    if (
      isResolution ||
      isActivated ||
      isStaticTriggered ||
      isDelayedTriggered
    ) {
      const responder =
        ability.responder === "opponent"
          ? this.rootStore.opponentPlayer(card.ownerId)
          : card.ownerId;

      const layer = new StackLayerModel(
        card.instanceId,
        createId(),
        responder,
        ability,
        this.rootStore,
        this.observable,
      );
      this.layers.push(layer);

      this.rootStore.log({ type: "EFFECT", effect: layer.toJSON() });

      if (layer.autoResolve) {
        console.log("Auto resolving", ability);
        layer.resolve();
      } else {
        console.log(
          "Not auto resolving, player has to choose a target",
          JSON.stringify(ability),
        );
      }
    } else {
      console.log("Static abilities are not supported yet");
    }
  }

  resolveLayer(effectId: string, params?: ResolvingParam) {
    const ability = this.getAbility(effectId);

    if (!ability) {
      console.error("Layer not found", effectId);
    } else {
      ability.resolve(params);
    }
  }

  onPlay(card: CardModel) {
    const resolutionAbilities = card.resolutionAbilities;

    resolutionAbilities?.forEach((ability) => {
      if (resolutionAbilityPredicate(ability)) {
        this.addAbilityToStack(ability, card);
      } else {
        console.error("Ability not found", ability);
      }
    });
  }

  onActivateAbility(card: CardModel, ability: ActivatedAbility) {
    this.addAbilityToStack(ability, card);
  }

  onQuest(card: CardModel) {
    if (card.hasSupport) {
      const supportEffect: ResolutionAbility = {
        type: "resolution",
        name: supportAbility.name,
        text: supportAbility.text,
        optional: true,
        effects: [
          {
            type: "attribute",
            attribute: "strength",
            amount: card.strength,
            modifier: "add",
            duration: "turn",
            target: {
              type: "card",
              filters: [
                { filter: "zone", value: "play" },
                { filter: "type", value: "character" },
              ],
            },
          },
        ],
      };

      this.addAbilityToStack(supportEffect, card);
    }
  }

  onChallenge(attacker: CardModel, defender: CardModel) {}

  remove(effect: StackLayerModel) {
    const index = this.layers.findIndex((element) => element.id === effect.id);
    if (index !== -1) {
      this.layers.splice(index, 1);
    }
  }
}
