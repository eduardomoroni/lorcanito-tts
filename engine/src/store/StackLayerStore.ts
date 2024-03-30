import { makeAutoObservable, toJS } from "mobx";
import { Dependencies } from "@lorcanito/engine/store/types";
import { StackLayerModel } from "@lorcanito/engine/store/models/StackLayerModel";
import { CardModel } from "@lorcanito/engine/store/models/CardModel";
import type {
  MobXRootStore,
  MoveResponse,
} from "@lorcanito/engine/store/RootStore";
import type { ScryEffectPayload } from "@lorcanito/engine/rules/effects/effectTypes";
import {
  Ability,
  type ActivatedAbility,
  type ResolutionAbility,
  supportAbility,
} from "@lorcanito/engine/rules/abilities/abilities";
import { AbilityModel } from "@lorcanito/engine/store/models/AbilityModel";
import { GameEffect } from "@lorcanito/engine/types";

export type ResolvingParam = {
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
      const ability = effect.ability as ResolutionAbility | ActivatedAbility;
      const source = this.rootStore.cardStore.getCard(effect.instanceId);
      const abilityModel = new AbilityModel(
        ability,
        source as CardModel, // TODO: CardNotFound issue
        this.rootStore,
        this.observable,
      );

      return new StackLayerModel(
        effect.id,
        source as CardModel, // TODO: CardNotFound issue
        abilityModel,
        this.rootStore,
        this.observable,
      );
    });
  }

  toJSON(): GameEffect[] {
    return toJS(this.layers.map((effect) => effect.toJSON()));
  }

  getLayer(effectId: string) {
    return this.layers.find((effect) => effect.id === effectId);
  }

  getTopLayer() {
    return this.layers[this.layers.length - 1];
  }

  addAbilityToStack(
    ability: AbilityModel,
    card: CardModel,
    opts: {
      optionalAbility?: boolean;
    } = {},
  ): MoveResponse {
    if (!ability.areConditionsMet) {
      this.rootStore.debug(
        `Resolution ability condition not met: ${ability.name}`,
      );
      this.rootStore.debugCondition(ability.conditions, card);
      return this.rootStore.sendNotification({
        type: "icon",
        icon: "warning",
        title: "Ability's condition are not met",
        message: `Card effect's is being skipped`,
        autoClear: true,
      });
    }

    if (
      ability.isResolutionAbility ||
      ability.isActivatedAbility ||
      ability.isStaticTriggeredAbility ||
      ability.isDelayedTriggered
    ) {
      if (ability.optional && !ability.ability.optional) {
        if (this.rootStore.configurationStore.autoAcceptOptionals) {
          this.rootStore.log({
            type: "AUTO_OPTIONAL_ENGAGED",
            ability: ability.name,
          });
        }
      }

      if (ability.optional && !ability.ability.accepted) {
        this.rootStore.debug(
          "Optional ability, adding to stack: ",
          ability.name,
          card.fullName,
        );
        this.addOptionalLayerToStack(ability, card);
        return this.rootStore.moveResponse(true);
      }

      const effects = ability.effects.map((model) => model.effect);
      // Another approach here would be to create all layers on the stack, and then resolve the top
      if (ability.resolveEffectsIndividually && effects) {
        for (let i = 0; i < effects.length; i++) {
          const effect = effects[i];
          if (effect) {
            this.rootStore.debug(
              `Resolving effects individually: ${JSON.stringify(effect)}`,
            );
            // @ts-expect-error
            const rawAbility: Ability = {
              ...ability.ability,
              effects: [effect],
            };
            const abilityModel = new AbilityModel(
              rawAbility,
              card,
              this.rootStore,
              this.observable,
            );
            this.addLayerToStack(card, abilityModel, {
              skipLogs: i !== effects.length - 1,
            });
          }
        }
      } else {
        this.addLayerToStack(card, ability, opts);
      }

      return this.rootStore.moveResponse(true);
    } else {
      this.rootStore.sendNotification({
        type: "icon",
        icon: "warning",
        title: "Static abilities are not supported yet",
        message: `Static abilities are not supported yet`,
        autoClear: true,
      });
      return this.rootStore.moveResponse(false);
    }
  }

  private addLayerToStack(
    card: CardModel,
    ability: AbilityModel,
    params: {
      skipLogs?: boolean;
      optionalAbility?: boolean;
    } = {},
  ) {
    const isResolution = ability.isResolutionAbility;

    const id = `${this.layers.length + 1}-${card.instanceId}-${ability.name}-${
      ability.name
    }`;
    const layer = new StackLayerModel(
      id,
      card,
      ability,
      this.rootStore,
      this.observable,
    );

    // We could also let the layer go to stack and cancel the effect
    if (
      // Accepting an optional ability should not validate the params, and it will be empty
      // !params.optionalAbility &&
      isResolution &&
      !layer.hasValidTarget() &&
      !layer.upToTarget()
    ) {
      return this.rootStore.log({
        type: "INVALID_TARGET_RESOLUTION",
        effect: layer.toJSON(),
      });
    }

    this.layers.push(layer);

    if (!params.skipLogs || !ability.ability.resolveEffectsIndividually) {
      this.rootStore.log({ type: "EFFECT", effect: layer.toJSON() });
    }

    if (layer.autoResolve) {
      this.rootStore.debug(`Auto resolving: ${layer.ability.name}`);

      this.resolveLayerById(layer.id, {}, params);
    } else {
      this.rootStore.debug(
        `Not auto resolving, player has to choose a target for: ${ability.name}.`,
      );
    }

    if (this.rootStore.configurationStore.autoTarget) {
      this.autoTarget(layer);
    }

    this.rootStore.resetPriority();
  }

  private addOptionalLayerToStack(ability: AbilityModel, card: CardModel) {
    const id = `${this.layers.length + 1}-${card.instanceId}-${ability.name}`;
    const layer = new StackLayerModel(
      id,
      card,
      ability,
      this.rootStore,
      this.observable,
    );

    this.layers.push(layer);
    this.rootStore.resetPriority();

    this.rootStore.log({
      type: "OPTIONAL_ABILITY_ON_STACK_ADDED",
      ability: ability.toJSON(),
      source: ability.source.instanceId,
    });
  }

  autoTarget(layer: StackLayerModel) {
    if (!layer.isOptional() && !layer.targetsPlayer && layer.hasValidTarget()) {
      const potentialTargets = layer.ability.potentialTargets();
      const amount = layer.targetAmount();

      if (typeof amount === "number" && potentialTargets.length <= amount) {
        this.rootStore.log({
          type: "AUTO_TARGET_ENGAGED",
          targets: potentialTargets.map((target) => target.instanceId),
        });
        this.resolveLayerById(layer.id, { targets: potentialTargets });
      }
    }
  }

  removeLayerFromStack(layer: StackLayerModel) {
    const index = this.layers.findIndex((element) => element.id === layer.id);
    if (index !== -1) {
      this.layers.splice(index, 1);
    } else {
      console.error("Effect not found", layer.id);
    }
  }

  resolveTopOfStack(params: ResolvingParam = {}) {
    // TODO: Only the layer owner should be able to resolve it
    const layer = this.layers[this.layers.length - 1];
    if (layer) {
      return this.resolveLayerById(layer.id, params);
    }

    console.error("Layer not found");
    return false;
  }

  resolveLayerById(
    layerId: string,
    params: ResolvingParam = {},
    opts: { skipLogs?: boolean } = {},
  ): MoveResponse {
    // TODO: Only the layer owner should be able to resolve it
    const layer = this.getLayer(layerId);

    if (!layer) {
      this.rootStore.sendNotification({
        type: "icon",
        icon: "warning",
        title: "Layer not found",
        message: `Layer not found`,
        autoClear: true,
      });
      return this.rootStore.moveResponse(false);
    }

    this.rootStore.debug(
      `Resolving layer: ${layer.name}, targets: ${params.targets?.map(
        (target) => target.fullName,
      )}`,
    );
    const resolved = layer.resolve(params, opts);

    if (resolved) {
      this.rootStore.debug(
        `Resolved ${layer.ability.name}, targets: ${params.targets?.map(
          (target) => target.fullName,
        )}`,
      );
      this.removeLayerFromStack(layer);
    } else {
      this.rootStore.debug(`Not Resolved ${layer.ability.name}`);
    }

    this.rootStore.resetPriority();
    return this.rootStore.moveResponse(true);
  }

  onPlay(
    card: CardModel,
    params?: {
      bodyguard?: boolean;
      hasShifted?: boolean;
    },
  ) {
    card.resolutionAbilities.forEach((ability) => {
      this.addAbilityToStack(ability, card);
    });
  }

  onActivateAbility(card: CardModel, ability: AbilityModel) {
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
              value: 1,
              filters: [
                { filter: "type", value: "character" },
                { filter: "zone", value: "play" },
              ],
            },
          },
        ],
      };

      this.addAbilityToStack(
        new AbilityModel(supportEffect, card, this.rootStore, this.observable),
        card,
      );
    }
  }

  onChallenge(attacker: CardModel, defender: CardModel) {}
}
