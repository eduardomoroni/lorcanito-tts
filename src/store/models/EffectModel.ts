import { makeAutoObservable } from "mobx";
import type { MobXRootStore } from "~/store/RootStore";
import { CardModel } from "~/store/models/CardModel";
import { createId } from "@paralleldrive/cuid2";
import type { ContinuousEffect, Effect } from "~/engine/effectTypes";
import { exhaustiveCheck } from "~/libs/exhaustiveCheck";
import { EffectTargets } from "~/engine/effectTypes";
import { ResolvingParam } from "~/store/StackLayerStore";

export type EffectOutput = {
  source: string;
  effects: Effect[];
};

export class EffectModel {
  effects: Effect[];
  source: CardModel;
  private rootStore: MobXRootStore;

  constructor(
    effects: Effect | Effect[],
    source: CardModel,
    rootStore: MobXRootStore
  ) {
    makeAutoObservable<EffectModel, "rootStore">(this, {
      rootStore: false,
    });

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
      switch (targets.value) {
        case "self": {
          return [this.rootStore.turnPlayer];
        }
        case "opponent": {
          return [this.rootStore.opponentPlayer];
        }
        case "all": {
          return [this.rootStore.turnPlayer, this.rootStore.opponentPlayer];
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
    } = {}
  ): CardModel[] {
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

    switch (targets.type) {
      case "card": {
        const cards = this.rootStore.cardStore.getCardsByFilter(
          targets.filters
        );

        if (targets.value === "all") {
          return cards;
        }

        if (typeof targets.value === "number") {
          return cards.slice(0, targets.value);
        }

        return [];
      }
      case "cardModel": {
        return [targets.card];
      }
      default: {
        return [];
      }
    }
  }

  resolve(params: ResolvingParam = {}) {
    this.effects.forEach((effect) => {
      const cardTargets = this.resolveCardTargets(effect.target, params);
      const turn = this.rootStore.turnCount;
      switch (effect.type) {
        case "restriction": {
          cardTargets.forEach((target) => {
            const continuousEffect: ContinuousEffect = {
              type: "continuous",
              id: createId(),
              source: this.source.instanceId,
              target: target.instanceId,
              duration: { turn: effect.duration === "turn" ? turn : turn + 1 },
              effect: effect,
            };

            this.rootStore.continuousEffectStore.startContinuousEffect(
              continuousEffect
            );
          });

          break;
        }
        case "shuffle": {
          cardTargets.forEach((target) => {
            this.rootStore.cardStore.shuffleCardIntoDeck(
              target.instanceId,
              "discard"
            );
            this.rootStore.log({
              type: "SHUFFLE_CARD",
              instanceId: target.instanceId,
            });
          });

          break;
        }
        case "heal": {
          const healAmount = effect.amount;
          cardTargets.forEach((card) => {
            this.rootStore.cardStore.updateCardDamage(
              card.instanceId,
              healAmount,
              "remove"
            );
          });

          break;
        }
        case "damage": {
          const damage = effect.amount;
          cardTargets.forEach((card) => {
            this.rootStore.cardStore.updateCardDamage(
              card.instanceId,
              damage,
              "add"
            );
          });

          break;
        }
        case "draw": {
          this.resolvePlayerTargets(effect.target).forEach((playerId) => {
            this.rootStore.drawCard(playerId, effect.amount || 1);
          });
          break;
        }
        case "move": {
          cardTargets.forEach((card) => {
            card.moveTo(effect.to);
          });
          break;
        }
        case "attribute": {
          const amount = effect.amount || 0;
          const attribute = effect.attribute;
          cardTargets.forEach((target) => {
            const continuousEffect: ContinuousEffect = {
              type: "continuous",
              id: createId(),
              source: this.source.instanceId,
              target: target.instanceId,
              duration: { turn: turn },
              effect: {
                type: "attribute",
                modifier: effect.modifier,
                attribute,
                amount,
                duration: "turn",
                target: {
                  type: "cardModel",
                  card: target,
                },
              },
            };
            this.rootStore.continuousEffectStore.startContinuousEffect(
              continuousEffect
            );
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
              effect.limits
            );
          } else {
            console.error("Invalid scry params");
          }
          break;
        }
        case "discard": {
          console.log("discard not implemented");

          break;
        }
        case "ability": {
          cardTargets.forEach((target) => {
            const continuousEffect: ContinuousEffect = {
              type: "continuous",
              id: createId(),
              source: this.source.instanceId,
              target: target.instanceId,
              duration: { turn: effect.duration === "turn" ? turn : turn + 1 },
              effect: effect,
            };

            this.rootStore.continuousEffectStore.startContinuousEffect(
              continuousEffect
            );
          });

          break;
        }
        case "replacement": {
          const continuousEffect: ContinuousEffect = {
            type: "continuous",
            id: createId(),
            source: this.source.instanceId,
            filters: effect.filters,
            duration: { turn: turn, times: effect.duration === "next" ? 1 : 0 },
            effect: effect,
          };

          this.rootStore.continuousEffectStore.startContinuousEffect(
            continuousEffect
          );
          break;
        }
        case "conditional": {
          cardTargets.forEach((target) => {
            effect.effects.forEach((conditionalEffect) => {
              const metConditions = target.isValidTarget(
                conditionalEffect.target
              );

              // TODO: Fix this it only works for attribute
              if (metConditions) {
                const currentEffect = conditionalEffect.effect;
                if (currentEffect.type === "attribute") {
                  const continuousEffect: ContinuousEffect = {
                    type: "continuous",
                    id: createId(),
                    source: this.source.instanceId,
                    target: target.instanceId,
                    duration: {
                      turn: currentEffect.duration === "turn" ? turn : turn + 1,
                    },
                    effect: currentEffect,
                  };

                  this.rootStore.continuousEffectStore.startContinuousEffect(
                    continuousEffect
                  );
                  // TODO: fix this
                } else if (currentEffect.type === "banish") {
                  target.banish();
                }
              } else if (effect.fallback) {
                // TODO: This is worng
                const currentEffect = effect.fallback[0];

                // TODO: THIS IS WRONG
                if (currentEffect?.type === "attribute") {
                  const continuousEffect: ContinuousEffect = {
                    type: "continuous",
                    id: createId(),
                    source: this.source.instanceId,
                    target: target.instanceId,
                    duration: {
                      turn: currentEffect.duration === "turn" ? turn : turn + 1,
                    },
                    effect: currentEffect,
                  };

                  this.rootStore.continuousEffectStore.startContinuousEffect(
                    continuousEffect
                  );
                } else if (currentEffect?.type === "exert") {
                  target.updateCardMeta({ exerted: currentEffect.exert });
                }
              }
            });
          });
          break;
        }
        default: {
          exhaustiveCheck(effect);
        }
      }
    });
  }
}
