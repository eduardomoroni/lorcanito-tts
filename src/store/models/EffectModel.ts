import { makeAutoObservable } from "mobx";
import type { MobXRootStore } from "~/store/RootStore";
import { CardModel } from "~/store/models/CardModel";
import { createId } from "@paralleldrive/cuid2";
import type {
  AttributeEffect,
  Effect,
} from "~/engine/rules/effects/effectTypes";
import { exhaustiveCheck } from "~/libs/exhaustiveCheck";
import {
  conditionEffectPredicate,
  EffectTargets,
} from "~/engine/rules/effects/effectTypes";
import { ResolvingParam } from "~/store/StackLayerStore";
import { ContinuousEffectModel } from "~/store/models/ContinuousEffectModel";
import { TargetFilter } from "~/components/modals/target/filters";
import { notEmptyPredicate } from "~/engine/rules/abilities/abilities";

export type EffectOutput = {
  source: string;
  effects: Effect[];
};

export class EffectModel {
  effects: Effect[];
  source: CardModel;
  private readonly rootStore: MobXRootStore;
  private readonly observable: boolean;

  constructor(
    effects: Effect | Effect[],
    source: CardModel,
    rootStore: MobXRootStore,
    observable: boolean,
  ) {
    if (observable) {
      makeAutoObservable<EffectModel, "rootStore" | "observable">(this, {
        rootStore: false,
        observable: false,
      });
    }

    this.observable = observable;
    this.effects = Array.isArray(effects) ? effects : [effects];
    this.source = source;
    this.rootStore = rootStore;
  }

  sync(effect: EffectOutput) {
    this.effects = effect.effects;
    this.source = this.rootStore.cardStore.getCard(effect.source);
  }

  toJSON(): EffectOutput {
    return {
      source: this.source.instanceId,
      effects: this.effects,
    };
  }

  resolvePlayerTargets(targets?: EffectTargets): string[] {
    if (!targets) {
      return [];
    }

    if (targets.type === "player") {
      const ownerId = this.source.ownerId;
      const opponentPlayer = this.rootStore.opponentPlayer(ownerId);
      switch (targets.value) {
        case "self": {
          return [ownerId];
        }
        case "opponent": {
          return [opponentPlayer];
        }
        case "all": {
          return [opponentPlayer, ownerId];
        }
        default: {
          exhaustiveCheck(targets);
        }
      }
    }

    return [];
  }

  resolveCardTargets(
    targets?: EffectTargets,
    params: {
      targetId?: string;
      targets?: CardModel[] | CardModel;
    } = {},
    playerId?: string,
  ): CardModel[] {
    if (targets?.type === "trigger") {
      console.log("This value should have been replaced by the trigger");
      return [];
    }

    if (params.targets) {
      return Array.isArray(params.targets) ? params.targets : [params.targets];
    }

    if (params.targetId) {
      const card = this.rootStore.cardStore.getCard(params.targetId);
      return [card];
    }

    if (!targets) {
      return [];
    }

    if (targets.type === "top-deck" && playerId) {
      return [this.rootStore.topDeckCard(playerId)].filter(notEmptyPredicate);
    }

    switch (targets.type) {
      case "card": {
        const cards = this.rootStore.cardStore.getCardsByFilter(
          targets.filters,
        );

        if (targets.excludeSelf) {
          return cards.filter(
            (card) => card.instanceId !== this.source.instanceId,
          );
        }

        if (targets.value === "all") {
          return cards;
        }

        if (typeof targets.value === "number") {
          return cards.slice(0, targets.value);
        }

        return [];
      }
      case "instanceId": {
        return [this.rootStore.cardStore.getCard(targets.instanceId)];
      }
      default: {
        return [];
      }
    }
  }

  resolve(params: ResolvingParam = {}) {
    this.effects.forEach((effect) => this.resolveEffect(effect, params));
  }

  private resolveEffect(effect: Effect, params: ResolvingParam = {}) {
    const cardTargets = this.resolveCardTargets(
      effect.target,
      params,
      this.source.ownerId,
    );
    const turn = this.rootStore.turnCount;

    switch (effect.type) {
      case "restriction": {
        cardTargets.forEach((target) => {
          this.rootStore.continuousEffectStore.startContinuousEffect(
            new ContinuousEffectModel(
              createId(),
              this.source,
              target,
              { turn: effect.duration === "turn" ? turn : turn + 1 },
              effect,
              this.rootStore,
              this.observable,
            ),
          );
        });

        break;
      }
      case "shuffle": {
        cardTargets.forEach((target) => {
          this.rootStore.cardStore.shuffleCardIntoDeck(
            target.instanceId,
            "discard",
          );
        });
        break;
      }
      case "heal": {
        const healAmount = effect.amount;

        cardTargets.forEach((card) => {
          const damageBefore = card.meta.damage || 0;
          card.updateCardDamage(healAmount, "remove");
          const damageAfter = card.meta.damage || 0;

          if (effect?.subEffect?.type === "draw") {
            this.rootStore.tableStore.drawCards(
              this.source.ownerId,
              damageBefore - damageAfter,
            );
          }
        });

        break;
      }
      case "damage": {
        const damage = effect.amount;

        cardTargets.forEach((card) => {
          card.updateCardDamage(damage, "add");

          if (card.isDead) {
            card.moveTo("discard");
          }
        });

        break;
      }
      case "draw": {
        this.resolvePlayerTargets(effect.target).forEach((playerId) => {
          this.rootStore.drawCard(playerId, effect.amount || 1);
        });
        break;
      }
      case "lore": {
        this.resolvePlayerTargets(effect.target).forEach((playerId) => {
          if (effect.modifier === "add") {
            this.rootStore.tableStore.getTable(playerId).lore += effect.amount;
          }

          if (effect.modifier === "subtract") {
            this.rootStore.tableStore.getTable(playerId).lore -= effect.amount;

            if (this.rootStore.tableStore.getTable(playerId).lore < 0) {
              this.rootStore.tableStore.getTable(playerId).lore = 0;
            }
          }
        });
        break;
      }
      case "discard": {
        cardTargets.forEach((card) => {
          card.discard();
        });
        break;
      }
      case "move": {
        cardTargets.forEach((card) => {
          card.moveTo(effect.to);

          if (effect.exerted) {
            card.updateCardMeta({ exerted: effect.exerted });
          }
        });
        break;
      }
      case "exert": {
        cardTargets.forEach((card) => {
          card.updateCardMeta({ exerted: effect.exert });
        });

        break;
      }
      case "banish": {
        cardTargets.forEach((card) => {
          card.banish();
        });
        break;
      }
      case "scry": {
        if (params.scry) {
          const { top, hand, bottom } = params.scry;
          this.rootStore.tableStore.scry(
            top,
            bottom,
            hand,
            effect.tutorFilters,
            effect.limits,
            effect.shouldRevealTutored,
          );
        } else {
          console.error("Invalid scry params");
        }
        break;
      }
      case "ability": {
        cardTargets.forEach((target) => {
          this.rootStore.continuousEffectStore.startContinuousEffect(
            new ContinuousEffectModel(
              createId(),
              this.source,
              target,
              { turn: effect.duration === "turn" ? turn : turn + 1 },
              effect,
              this.rootStore,
              this.observable,
            ),
          );
        });

        break;
      }
      // Replacement effect has no targets, in this sense it means that it can be applied to any card that match the filter
      case "replacement": {
        this.rootStore.continuousEffectStore.startContinuousEffect(
          new ContinuousEffectModel(
            createId(),
            this.source,
            undefined,
            // TODO: This might cause issues
            // effect.filters,
            { turn: turn, times: effect.duration === "next" ? 1 : 0 },
            effect,
            this.rootStore,
            this.observable,
          ),
        );

        break;
      }
      case "attribute": {
        const amount = effect.amount || 0;
        const attribute = effect.attribute;

        cardTargets.forEach((target) => {
          this.rootStore.continuousEffectStore.startContinuousEffect(
            new ContinuousEffectModel(
              createId(),
              this.source,
              target,
              { turn: turn },
              {
                type: "attribute",
                modifier: effect.modifier,
                attribute,
                amount,
                duration: "turn",
                target: {
                  type: "instanceId",
                  instanceId: target.instanceId,
                },
              } as AttributeEffect,
              this.rootStore,
              this.observable,
            ),
          );
        });

        break;
      }
      // TODO: This is not well implemented, everythign about it was done in a rush. We need to re do it
      case "conditional": {
        const target = params.targetId
          ? this.rootStore.cardStore.getCard(params.targetId)
          : undefined;

        if (target && conditionEffectPredicate(effect)) {
          effect.effects.forEach((conditionalEffect) => {
            const effectTarget = conditionalEffect.target || {};
            const filters: TargetFilter[] =
              "filters" in effectTarget
                ? (effectTarget.filters as TargetFilter[])
                : [];
            const metConditions = target.isValidTarget(filters);

            if (metConditions) {
              this.resolveEffect(conditionalEffect, params);
            }

            if (!metConditions && effect.fallback) {
              effect.fallback.forEach((fallbackEffect) => {
                this.resolveEffect(fallbackEffect, params);
              });
            }
          });
        }
        break;
      }
      default: {
        exhaustiveCheck(effect);
      }
    }
  }
}
