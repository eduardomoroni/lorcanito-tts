import { makeAutoObservable } from "mobx";
import type { MobXRootStore } from "@lorcanito/engine/store/RootStore";
import { CardModel } from "@lorcanito/engine/store/models/CardModel";
import {
  AttributeEffect,
  Effect,
  loreEffectPredicate,
  strengthEffectPredicate,
} from "@lorcanito/engine/rules/effects/effectTypes";
import {
  conditionEffectPredicate,
  scryEffectPredicate,
} from "@lorcanito/engine/rules/effects/effectTypes";
import { ContinuousEffectModel } from "@lorcanito/engine/store/models/ContinuousEffectModel";
import {
  cardEffectTargetPredicate,
  type EffectTargets,
} from "@lorcanito/engine/rules/effects/effectTargets";
import type { ResolvingParam } from "@lorcanito/engine/store/StackLayerStore";
import { notEmptyPredicate } from "@lorcanito/engine/rules/abilities/abilityTypeGuards";
import { exhaustiveCheck } from "@lorcanito/engine/lib/exhaustiveCheck";

import type { TargetFilter } from "@lorcanito/engine/filter/targetFilter";
import type { ResolutionAbility } from "@lorcanito/engine/rules/abilities/abilities";
import { AbilityModel } from "@lorcanito/engine/store/models/AbilityModel";

export type EffectOutput = {
  source: string;
  responder: string;
  effects: Effect;
};

function createId(effect: Effect, source: CardModel, target?: CardModel) {
  return `${target?.instanceId}-${source.instanceId}-${effect.type}`;
}

// TODO: This should receive Ability model
export class EffectModel {
  effect: Effect;
  source: CardModel;
  responder: string;
  private readonly rootStore: MobXRootStore;
  private readonly observable: boolean;

  constructor(
    effects: Effect,
    source: CardModel,
    responder: string,
    rootStore: MobXRootStore,
    observable: boolean,
  ) {
    if (observable) {
      makeAutoObservable<EffectModel, "rootStore" | "observable">(this, {
        rootStore: false,
        observable: false,
      });
    }

    this.effect = effects;
    this.source = source;
    this.responder = responder;
    this.rootStore = rootStore;
    this.observable = observable;

    const effectTarget = this.effect.target;
    if (cardEffectTargetPredicate(effectTarget)) {
      const sourceSelf = effectTarget.filters.findIndex(
        (item) => item.filter === "source" && item.value === "self",
      );
      if (sourceSelf !== -1) {
        effectTarget.filters.splice(sourceSelf, 1, {
          filter: "instanceId",
          value: source.instanceId,
        });
      }
    }
  }

  sync(effect: EffectOutput) {
    this.effect = effect.effects;
    this.responder = effect.responder;
    this.source = this.rootStore.cardStore.getCard(effect.source) as CardModel; // TODO: CardNotFound issue;
  }

  toJSON(): EffectOutput {
    return {
      source: this.source.instanceId,
      effects: this.effect,
      responder: this.responder,
    };
  }

  isScryEffect() {
    return scryEffectPredicate(this.effect);
  }

  get type() {
    return this.effect.type;
  }

  requiresTarget() {
    const target = this.target;

    if (scryEffectPredicate(this.effect)) {
      return true;
    }

    if (target?.type === "player") {
      return false;
    }

    if (this.effect.type === "reveal-and-play") {
      return false;
    }

    if (cardEffectTargetPredicate(target)) {
      if (target.value === "all") {
        return false;
      }

      if (target.filters.find((filter) => filter.filter === "top-deck")) {
        return false;
      }

      if (
        target.filters.find(
          (filter) => filter.filter === "instanceId" && !!filter.value,
        )
      ) {
        return false;
      }

      if (target.filters.find((filter) => filter.filter === "source")) {
        return false;
      }
    }

    return !!target;
  }

  calculateAmount(targets: CardModel[] = []) {
    if (!("amount" in this.effect)) {
      return 0;
    }

    if (typeof this.effect.amount === "number") {
      return this.effect.amount;
    }

    const target = targets[0];
    if (this.effect.amount?.target && target) {
      const attribute = this.effect.amount.target.attribute;

      switch (attribute) {
        case "strength": {
          return target.strength;
        }
        case "lore": {
          return target.lore;
        }
        default: {
          exhaustiveCheck(attribute);
          return 0;
        }
      }
    }

    const amount = this.rootStore.effectStore.calculateDynamicEffectAmount(
      // @ts-expect-error FIX LATER
      this.effect,
      this.source,
    );

    if ("modifier" in this.effect && this.effect.modifier === "subtract") {
      return -amount;
    }

    return amount;
  }

  get targets() {
    return this.target;
  }

  get target() {
    const effect = this.effect;
    const conditionalEffect = conditionEffectPredicate(effect);

    if (conditionalEffect) {
      return effect.fallback?.map((effect) => effect.target)[0];
    }

    return this.effect.target;
  }

  isValidTarget(cardTarget: CardModel, responder: string) {
    if (cardTarget.hasWard && cardTarget.zone === "play" && responder !== cardTarget.ownerId) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Invalid target for effect",
        message: `You cannot target a card protected by Ward`,
        icon: "warning",
        autoClear: true,
      });

      return false;
    }

    const effect = this.effect;
    const effectTarget = effect.target;
    if (!cardEffectTargetPredicate(effectTarget)) {
      return true;
    }

    if ("excludeSelf" in effectTarget && this.source.isCard(cardTarget)) {
      return false;
    }

    let isTargetValid = cardTarget.isValidTarget(
      effectTarget.filters,
      responder,
      this.source,
    );

    const conditionalEffect = conditionEffectPredicate(effect);
    if (!isTargetValid && !!conditionalEffect) {
      const fallbackFilters = effect.fallback[0]?.target.filters || [];
      isTargetValid = cardTarget.isValidTarget(fallbackFilters, responder);
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

    return true;
  }

  resolvePlayerTargets(
    targets?: EffectTargets,
    layerParams: ResolvingParam = {},
  ): string[] {
    if (!targets) {
      return [];
    }

    if (targets.type === "player") {
      const opponentPlayer = this.rootStore.opponentPlayer(this.responder);
      switch (targets.value) {
        case "self": {
          return [this.responder];
        }
        case "opponent": {
          return [opponentPlayer];
        }
        case "all": {
          return [opponentPlayer, this.responder];
        }
        case "target_owner": {
          const layerTarget = layerParams.targets?.[0];
          if (layerTarget) {
            return [layerTarget.ownerId];
          }

          this.rootStore.debug("Invalid target", targets);
          return [];
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
      targets?: CardModel[] | CardModel;
    } = {},
  ): CardModel[] {
    if (params.targets) {
      return Array.isArray(params.targets) ? params.targets : [params.targets];
    }

    if (!targets) {
      return [];
    }

    switch (targets.type) {
      case "card": {
        const cards = this.rootStore.cardStore.getCardsByFilter(
          targets.filters,
          this.responder,
          this.source,
        );
        if (targets.excludeSelf) {
          return cards.filter(
            (card) => card.instanceId !== this.source.instanceId,
          );
        }

        if (targets.value === "all") {
          return cards;
        }

        return cards.slice(0, targets.value);
      }
      default: {
        return [];
      }
    }
  }

  resolve(params: ResolvingParam = {}) {
    return this.resolveEffect(this.effect, params);
  }

  private resolveEffect(effect: Effect, params: ResolvingParam = {}) {
    const target = effect.target;
    const allTargets = this.resolveCardTargets(target, params);
    // console.warn(allTargets.map((card) => card.fullName));
    // TODO: By here we should have validated target already
    const cardTargets = allTargets
      .filter((card) => {
        if (!!target && "filters" in target) {
          return card.isValidTarget(
            target.filters,
            this.responder,
            this.source,
          );
        } else {
          return true;
        }
      })
      .filter(notEmptyPredicate);

    // TODO: We should probably do something about this
    // should we let the stack resolve and then send a notification?
    // or should we prevent the stack from resolving?
    if (allTargets.length > cardTargets.length) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Invalid target",
        message: `an effect tried to target a card that was not valid`,
        icon: "warning",
        autoClear: true,
      });
    }

    const turn = this.rootStore.turnCount;

    switch (effect.type) {
      case "restriction": {
        cardTargets.forEach((target) => {
          this.rootStore.continuousEffectStore.startContinuousEffect(
            new ContinuousEffectModel(
              createId(effect, this.source, target),
              this.source,
              target,
              {
                turn: effect.duration === "turn" ? turn : turn + 1,
                until: effect.until,
              },
              this,
              [],
              this.rootStore,
              this.observable,
            ),
          );
        });

        break;
      }
      case "shuffle": {
        cardTargets.forEach((target) => {
          this.rootStore.cardStore.shuffleCardIntoDeck(target.instanceId);
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
        const damage = this.calculateAmount();
        cardTargets.forEach((card) => {
          card.updateCardDamage(damage, "add");

          if (card.isDead) {
            card.moveTo("discard");
          }
        });

        break;
      }

      case "lore": {
        this.resolvePlayerTargets(effect.target, params).forEach((playerId) => {
          const table = this.rootStore.tableStore.getTable(playerId);
          const amount = this.calculateAmount(params.targets);

          if (effect.modifier === "add") {
            table.updateLore(table.lore + amount);
          }

          if (effect.modifier === "subtract") {
            table.updateLore(table.lore - amount);
          }
        });
        break;
      }
      case "play": {
        cardTargets.forEach((card) => {
          card.playFromHand({ forFree: true, bodyguard: false });
        });
        break;
      }
      case "discard": {
        this.rootStore.tableStore.discardCards(cardTargets);
        break;
      }
      case "draw": {
        this.resolvePlayerTargets(effect.target, params).forEach((playerId) => {
          this.rootStore.tableStore.drawCards(playerId, this.calculateAmount());
        });
        break;
      }

      case "move": {
        cardTargets.forEach((card) => {
          card.moveTo(effect.to, { discard: effect.to === "discard" });

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
      case "reveal": {
        cardTargets.forEach((card) => {
          card.reveal();
        });
        break;
      }
      case "reveal-and-play": {
        const { target } = effect;

        const topCard = this.rootStore.tableStore.getTopDeckCard(
          this.responder,
        );

        if (!topCard) {
          this.rootStore.sendNotification({
            type: "icon",
            title: "No cards in deck",
            message: "You have no cards in your deck to play",
            icon: "warning",
            autoClear: true,
          });
          break;
        }

        topCard.reveal();

        if (
          topCard.isValidTarget(target.filters, this.responder, this.source)
        ) {
          const ability: ResolutionAbility = {
            type: "resolution",
            name: "foo",
            text: "bar",
            optional: true,
            // TODO: We should have linked effect to ability, so we could use ability name and text here, as well as optional or not
            effects: [
              {
                type: "play",
                target: {
                  type: "card",
                  value: 1,
                  filters: [
                    { filter: "owner", value: "self" },
                    { filter: "instanceId", value: topCard.instanceId },
                  ],
                },
              },
            ],
          };

          this.rootStore.stackLayerStore.addAbilityToStack(
            new AbilityModel(
              ability,
              this.source,
              this.rootStore,
              this.observable,
            ),
            this.source,
          );
        }

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
              createId(effect, this.source, target),
              this.source,
              target,
              {
                turn: effect.duration === "turn" ? turn : turn + 1,
                until: effect.until,
              },
              this,
              [],
              this.rootStore,
              this.observable,
            ),
          );
        });

        break;
      }
      case "replacement": {
        this.rootStore.continuousEffectStore.startContinuousEffect(
          new ContinuousEffectModel(
            createId(effect, this.source),
            this.source,
            null,
            { turn: turn, times: effect.duration === "next" ? 1 : 0 },
            this,
            effect.target?.filters || [],
            this.rootStore,
            this.observable,
          ),
        );

        break;
      }
      case "protection": {
        this.rootStore.debug(
          "Protection effect is implemented in the card model itself",
        );
        break;
      }
      case "attribute": {
        const amount = effect.amount || 0;
        const attribute = effect.attribute;

        cardTargets.forEach((target) => {
          const attributeEffect: AttributeEffect = {
            type: "attribute",
            modifier: effect.modifier,
            attribute,
            amount,
            duration: effect.duration,
            until: effect.until,
            target: {
              type: "card",
              value: "all", // All is to skip selecting a target
              filters: [
                {
                  filter: "instanceId",
                  value: target.instanceId,
                },
              ],
            },
          };
          const effectModel = new EffectModel(
            attributeEffect,
            this.source,
            this.responder,
            this.rootStore,
            this.observable,
          );
          this.rootStore.continuousEffectStore.startContinuousEffect(
            new ContinuousEffectModel(
              createId(effect, this.source, target),
              this.source,
              target,
              {
                turn: effect.duration === "next_turn" ? turn + 1 : turn,
                until: effect.until,
              },
              effectModel,
              [],
              this.rootStore,
              this.observable,
            ),
          );
        });

        break;
      }
      // TODO: This is not well implemented, everythign about it was done in a rush. We need to re do it
      case "conditional": {
        const target = params.targets?.[0];

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
      case "player-restriction": {
        console.warn("Player restriction is not implemented");
        break;
      }
      default: {
        exhaustiveCheck(effect);
      }
    }
  }

  get isLoreEffect() {
    return loreEffectPredicate(this.effect);
  }

  get isStrengthEffect() {
    return strengthEffectPredicate(this.effect);
  }
}
