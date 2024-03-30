import { makeAutoObservable } from "mobx";
import type { MobXRootStore } from "@lorcanito/engine/store/RootStore";
import type { CardModel } from "@lorcanito/engine/store/models/CardModel";
import {
  type Ability,
  type WhileCondition,
} from "@lorcanito/engine/rules/abilities/abilities";
import { exhaustiveCheck } from "@lorcanito/engine/lib/exhaustiveCheck";
import {
  CardEffects,
  costReplacementEffectPredicate,
  type Effect,
  restrictionEffectPredicate,
  strengthEffectPredicate,
} from "@lorcanito/engine/rules/effects/effectTypes";
import {
  gainStaticAbilityPredicate,
  notEmptyPredicate,
  playerRestrictionPredicate,
  playStaticAbilityPredicate,
  restrictionStaticAbilityPredicate,
  singleEffectAbility,
  staticAbilityPredicate,
  staticEffectAbilityPredicate,
  whileStaticAbilityPredicate,
  whileStaticRestrictionAbilityPredicate,
} from "@lorcanito/engine/rules/abilities/abilityTypeGuards";
import { computeNumericOperator } from "@lorcanito/engine/filter/filterPredicates";
import { TargetFilter } from "@lorcanito/engine/filter/targetFilter";
import { AbilityModel } from "@lorcanito/engine";

// This store holds convoluted logic that handles effects
// It's a bit of a mess, but it's a mess that works
// I'll be refactoring this later
export class EffectStore {
  private readonly rootStore: MobXRootStore;
  private readonly observable: boolean;

  constructor(rootStore: MobXRootStore, observable: boolean) {
    if (observable) {
      makeAutoObservable<EffectStore, "dependencies" | "rootStore">(this, {
        rootStore: false,
        dependencies: false,
      });
    }

    this.rootStore = rootStore;
    this.observable = observable;
  }

  hasRestrictionToPlayActionCard(card: CardModel) {
    const cardOwner = card.ownerId;

    const playerEffects = this.getPlayerEffects(cardOwner)
      .filter((model) => playerRestrictionPredicate(model.ability))
      .filter((model) => {
        const ability = model?.ability;
        if (playerRestrictionPredicate(ability)) {
          return ability?.effect?.restriction === "play-action-cards";
        }
      })
      .filter(notEmptyPredicate);

    return playerEffects.length > 0;
  }

  // TODO: this is incomplete, it's working only for:
  // Tiana Celebrating Princess
  getPlayerEffects(playerId: string) {
    return this.rootStore.cardStore
      .getCardsByFilter([{ filter: "zone", value: "play" }])
      .map((card) => {
        const whileStatic = this.getActiveWhileStaticAbilitiesOnCard(card, []);

        return whileStatic.filter((ability) =>
          this.isValidPlayerTarget(card, ability.ability, playerId),
        );
      })
      .filter(notEmptyPredicate)
      .reduce((acc, curr) => {
        return [...acc, ...curr];
      }, []);
  }

  // This should have been AbilityModel
  isValidPlayerTarget(source: CardModel, ability: Ability, playerId: string) {
    const isValid = (effect: Effect) => {
      const target = effect.target;

      if (target?.type !== "player") {
        return false;
      }

      if (target.value === "all") {
        return true;
      }

      if (target.value === "opponent") {
        return playerId !== source.ownerId;
      }

      if (target.value === "self") {
        return playerId === source.ownerId;
      }
    };

    if (singleEffectAbility(ability)) {
      return isValid(ability.effect);
    }

    return ability.effects?.some(isValid);
  }

  isValidTarget(
    target: CardModel,
    filters: TargetFilter[],
    expectedOwner: string = "",
    source?: CardModel,
  ) {
    return this.rootStore.cardStore.isValidCardTargetPredicate(
      filters,
      expectedOwner,
      source,
    )(target);
  }

  hasQuestRestriction(source: CardModel) {
    return this.rootStore.cardStore
      .getCardsByFilter([
        { filter: "zone", value: "play" },
        { filter: "type", value: ["character", "item"] },
      ])
      .find((card) => {
        const restrictionAbilityModel = card
          .getAbilities([
            (model) => {
              return whileStaticRestrictionAbilityPredicate(model.ability);
            },
          ])
          .find((model) => restrictionStaticAbilityPredicate(model.ability));
        const restrictionAbility = restrictionAbilityModel?.ability;

        if (!restrictionStaticAbilityPredicate(restrictionAbility)) {
          return false;
        }

        const effect = restrictionAbility?.effect;
        const target = restrictionAbility?.target;

        if (effect?.restriction === "quest") {
          if (target?.type === "card") {
            return this.isValidTarget(
              source,
              target.filters,
              card.ownerId,
              source,
            );
          }

          if (target.type === "this-character") {
            return source.instanceId === card.instanceId;
          }
        }

        return false;
      });
  }

  hasChallengeRestriction(cardModel: CardModel) {
    const cardsInPlay = this.rootStore.cardStore.getCardsByFilter([
      { filter: "zone", value: "play" },
    ]);

    let restriction = false;
    for (const card of cardsInPlay) {
      card.getAbilities([(model) => model.isStaticAbility]).forEach((model) => {
        const ability = model.ability;
        if (!staticAbilityPredicate(ability)) {
          return;
        }

        ability.effects
          ?.filter(restrictionEffectPredicate)
          // TODO: improve this type, can restriction only happen to target?!
          .filter((effect) => effect.restriction === "challenge")
          .forEach((effect) => {
            if (
              effect.target?.type === "card" &&
              Array.isArray(effect.target.filters) &&
              this.isValidTarget(cardModel, effect.target.filters, card.ownerId)
            ) {
              restriction = true;
            }
          });
      });
    }

    const challengeRestriction =
      this.rootStore.continuousEffectStore.getChallengeRestriction(cardModel);

    return challengeRestriction.length > 0 || restriction;
  }

  getLoreModifier(source: CardModel) {
    const staticLoreModifier = source
      .getAbilities([
        (model: AbilityModel) => {
          return model.hasEffect((effect) => effect.isLoreEffect);
        },
      ])
      .filter((ability) => ability.areConditionsMet)
      .reduce((acc, curr) => {
        const model = curr.effects.find((effect) => effect.isLoreEffect);
        const amount = model?.calculateAmount() || 0;
        return acc + amount;
      }, 0);

    const loreModifier =
      this.rootStore.continuousEffectStore.getLoreModifier(source);

    return staticLoreModifier + loreModifier;
  }

  getCostModifier(cardModel: CardModel) {
    const costReduction = this.rootStore.continuousEffectStore.continuousEffects
      .filter((continuous) => continuous.isCostReplacementEffect(cardModel))
      .reduce((acc, curr) => {
        // TODO: I should come back here for zero to hero
        if (curr.effect.effect?.type === "replacement") {
          return acc + curr.effect.calculateAmount();
        }

        return acc;
      }, 0);

    const playStaticCostReduction = cardModel
      .getAbilities([(model) => playStaticAbilityPredicate(model.ability)])
      .filter((ability) => ability.areConditionsMet)
      .map((ability) =>
        ability.effects.find((model) =>
          costReplacementEffectPredicate(model.effect),
        ),
      )
      .filter(notEmptyPredicate)
      .reduce((acc, costReplacementEffectModel) => {
        const costReplacementEffect = costReplacementEffectModel.effect;

        if (!costReplacementEffectPredicate(costReplacementEffect)) {
          return acc;
        }

        if (
          this.isValidTarget(cardModel, costReplacementEffect.target.filters)
        ) {
          if (typeof costReplacementEffect.amount === "number") {
            return acc + costReplacementEffect.amount;
          }

          return acc;
        } else {
          return acc;
        }
      }, 0);

    // THIS needs to be improved, it's too specific to Mickey Mouse - Wayward Sorcerer
    const staticCostReduction = this.rootStore.cardStore
      .getCardsByFilter([
        { filter: "zone", value: "play" },
        { filter: "type", value: "character" },
        { filter: "owner", value: "self" },
      ])
      .filter((card) =>
        card
          .getAbilities([
            (ability?: AbilityModel) =>
              !!ability?.ability?.effects?.some(costReplacementEffectPredicate),
          ])
          .some(
            (ability) =>
              ability.effects?.some((model) =>
                costReplacementEffectPredicate(model.effect),
              ),
          ),
      )
      .reduce((acc, curr) => {
        const ability = curr
          .getAbilities([
            (ability?: AbilityModel) =>
              !!ability?.ability?.effects?.some(costReplacementEffectPredicate),
          ])
          .find(
            (ability) =>
              ability.effects?.some((model) =>
                costReplacementEffectPredicate(model.effect),
              ),
          );
        const costReplacementEffectModel = ability?.effects?.find((model) =>
          costReplacementEffectPredicate(model.effect),
        );
        const costReplacementEffect = costReplacementEffectModel?.effect;

        if (
          costReplacementEffectPredicate(costReplacementEffect) &&
          this.isValidTarget(
            cardModel,
            costReplacementEffect.target.filters,
            curr.ownerId,
          )
        ) {
          if (typeof costReplacementEffect.amount === "number") {
            return acc + costReplacementEffect.amount;
          }

          return acc;
        } else {
          return acc;
        }
      }, 0);

    return staticCostReduction + costReduction + playStaticCostReduction;
  }

  getStrengthModifier(cardModel: CardModel) {
    const strengthModifier =
      this.rootStore.continuousEffectStore.getStrengthModifier(cardModel);

    const staticSelfModifier: number = cardModel
      .getAbilities([
        (model: AbilityModel) => {
          return model.hasEffect((effect) => effect.isStrengthEffect);
        },
      ])
      .reduce((acc, curr) => {
        const strengthEffect = curr.effects.find(
          (effect) => effect.isStrengthEffect,
        );

        if (!strengthEffect?.isValidTarget(cardModel, cardModel.ownerId)) {
          return 0;
        }

        return strengthEffect?.calculateAmount() || 0;
      }, 0);

    const staticModifier = this.rootStore.cardStore
      .getCardsByFilter(
        [
          { filter: "zone", value: "play" },
          { filter: "type", value: ["character", "item"] },
          { filter: "owner", value: "self" },
        ],
        cardModel.ownerId,
      )
      .reduce((acc, curr) => {
        const attributeStaticAbility = curr
          .getAbilities([
            (model: AbilityModel) => {
              const ability = model.ability;

              return (
                staticEffectAbilityPredicate(ability) &&
                ability?.effects?.some(strengthEffectPredicate)
              );
            },
          ])
          .find((ability) => staticEffectAbilityPredicate(ability.ability));

        if (!attributeStaticAbility) {
          return acc;
        }

        const strengthEffect = attributeStaticAbility.effects.find(
          (effect) => effect.isStrengthEffect,
        );

        if (!strengthEffect?.isValidTarget(cardModel, curr.ownerId)) {
          return 0;
        }

        return strengthEffect?.calculateAmount() || 0;
      }, 0);

    return strengthModifier + staticSelfModifier + staticModifier;
  }

  getActiveWhileStaticAbilitiesOnCard(
    card: CardModel,
    filters: Array<(ability: AbilityModel) => boolean>,
  ) {
    return card
      .nativeAbilities(filters)
      .filter((ability) => ability.isWhileStaticAbility)
      .filter((ability) => ability.areConditionsMet)
      .map((model) => {
        if (whileStaticAbilityPredicate(model.ability)) {
          return new AbilityModel(
            model.ability.ability,
            model.source,
            this.rootStore,
            this.observable,
          );
        }
      })
      .filter(notEmptyPredicate);
  }

  getStaticGainedAbilities(
    cardToFetchAbilities: CardModel,
    filters: Array<(ability: AbilityModel) => boolean>,
  ): AbilityModel[] {
    return this.rootStore.cardStore
      .getCardsByFilter([
        { filter: "zone", value: "play" },
        { filter: "type", value: ["character", "item"] },
      ])
      .map((abilityCardSource) => {
        const staticAbilities =
          abilityCardSource.nativeGainedStaticAbilities(filters);

        const gainAbilityStaticAbilities = staticAbilities.filter(
          (abilityModel) => {
            const metCondition = abilityModel.areConditionsMet;

            if (!metCondition) {
              return undefined;
            }

            const ability = abilityModel.ability;

            if (!gainStaticAbilityPredicate(ability)) {
              return undefined;
            }

            const target = ability?.target;
            if (
              target &&
              this.isValidTarget(
                cardToFetchAbilities,
                target.filters,
                abilityCardSource.ownerId,
                abilityCardSource,
              )
            ) {
              if (
                target.excludeSelf &&
                cardToFetchAbilities.instanceId === abilityCardSource.instanceId
              ) {
                return undefined;
              }
              return ability.gainedAbility;
            }

            return undefined;
          },
        );

        return gainAbilityStaticAbilities
          .map((model) => {
            const ability = model.ability;
            if (gainStaticAbilityPredicate(ability)) {
              return ability.gainedAbility;
            }
          })
          .filter(notEmptyPredicate);
      })
      .flat(1)
      .map(
        (ability) =>
          new AbilityModel(
            ability,
            cardToFetchAbilities,
            this.rootStore,
            this.observable,
          ),
      );
  }

  metCondition(sourceCard: CardModel, conditions: WhileCondition[] = []) {
    if (!conditions.length) {
      return true;
    }

    return conditions.every((condition) => {
      switch (condition.type) {
        case "hand": {
          const { player } = condition;
          const playerId =
            player === "opponent"
              ? this.rootStore.opponentPlayer(sourceCard.ownerId)
              : sourceCard.ownerId;

          if (condition.amount === "less_than_opponent") {
            const playerHand = this.rootStore.tableStore.getPlayerZone(
              playerId,
              "hand",
            )?.cards.length;

            const opponentPlayer = this.rootStore.opponentPlayer(playerId);
            const opponentHand = this.rootStore.tableStore.getPlayerZone(
              opponentPlayer,
              "hand",
            )?.cards.length;

            return playerHand < opponentHand;
          }

          return (
            this.rootStore.tableStore.getPlayerZone(playerId, "hand")?.cards
              .length <= condition.amount
          );
        }
        case "turn": {
          return condition.value === "self"
            ? sourceCard.ownerId === this.rootStore.turnPlayer
            : sourceCard.ownerId !== this.rootStore.turnPlayer;
        }
        case "inkwell": {
          const inkwell = this.rootStore.tableStore.getPlayerZone(
            sourceCard.ownerId,
            "inkwell",
          )?.cards;

          return inkwell?.length >= condition.amount;
        }
        case "exerted": {
          return !sourceCard.ready;
        }
        case "not-alone": {
          const cardsInPlay = this.rootStore.cardStore.getCardsByFilter(
            [
              { filter: "zone", value: "play" },
              { filter: "type", value: "character" },
              { filter: "owner", value: "self" },
            ],
            undefined,
            sourceCard,
          );
          return cardsInPlay.length > 1;
        }
        // TODO: improve this
        case "play": {
          const cardsInPlay = this.rootStore.cardStore.getCardsByFilter([
            { filter: "type", value: "character" },
            { filter: "zone", value: "play" },
            { filter: "owner", value: "self" },
          ]);

          return computeNumericOperator(
            condition.comparison,
            cardsInPlay.length,
          );
        }
        case "damage": {
          return (sourceCard.meta.damage || 0) === condition.value;
        }
        case "filter": {
          const { filters, comparison } = condition;
          const length = this.rootStore.cardStore.getCardsByFilter(
            filters,
            sourceCard.ownerId,
            sourceCard,
          ).length;

          return computeNumericOperator(comparison, length);
        }
        case "played-songs": {
          return (
            this.rootStore.tableStore
              .getTable()
              .turn.cardsPlayed.filter(
                (card) =>
                  card.type === "action" &&
                  card.characteristics.includes("song"),
              ).length > 0
          );
        }
        case "attribute": {
          const { attribute, comparison } = condition;

          switch (attribute) {
            case "strength": {
              return computeNumericOperator(comparison, sourceCard.strength);
            }
            default: {
              exhaustiveCheck(attribute);
              return false;
            }
          }
        }
        case "resolution": {
          const { value } = condition;

          switch (value) {
            case "bodyguard": {
              console.warn("NOT IMPLEMENTED");
              return false;
            }
            case "shift": {
              return sourceCard.hasShift && sourceCard.meta.shifted;
            }
            default:
              return false;
          }
        }
        case "char-is-at-location": {
          return !!sourceCard.meta.location;
        }
        default: {
          exhaustiveCheck(condition);
          return false;
        }
      }

      return false;
    });
  }

  calculateDynamicAmountMultiplier(
    multiplier: "damage" | undefined,
    source: CardModel,
  ) {
    if (!multiplier) {
      return 0;
    }

    switch (multiplier) {
      case "damage": {
        return source?.meta.damage || 0;
      }
      default: {
        exhaustiveCheck(multiplier);
        return 0;
      }
    }
  }

  calculateDynamicEffectAmount(effect: CardEffects, source: CardModel): number {
    if (!effect.amount) {
      return 0;
    }

    if (typeof effect.amount === "number") {
      return effect.amount;
    }

    if (
      "multiplier" in effect.amount &&
      typeof effect.amount.amount === "number"
    ) {
      const multiplier = this.calculateDynamicAmountMultiplier(
        effect.amount.multiplier,
        source,
      );
      return effect.amount.amount * multiplier;
    }

    const filter = this.rootStore.cardStore
      .getCardsByFilter(effect.amount.filters, source.ownerId)
      // TODO: This is a hack to avoid filtering the card itself
      // Re work this to avoid this hack
      .filter((card) => card.instanceId !== source.instanceId);

    return filter.length;
  }
}
