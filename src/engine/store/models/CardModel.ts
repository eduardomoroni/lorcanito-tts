import type {
  Meta,
  TableCard,
  Zones,
} from "~/spaces/providers/TabletopProvider";
import { makeAutoObservable } from "mobx";
import { allCardsById } from "~/engine/cards/cards";
import { CardColor, LorcanitoCard } from "~/engine/cards/cardTypes";
import { CardMetaModel } from "~/engine/store/models/CardMetaModel";
import type { MobXRootStore } from "~/engine/store/RootStore";
import { exhaustiveCheck } from "~/libs/exhaustiveCheck";
import {
  Ability,
  ActivatedAbility,
  challengerAbilityPredicate,
  Cost,
  gainStaticAbilityPredicate,
  notEmptyPredicate,
  propertyStaticRestrictionAbilityPredicate,
  resolutionAbilityPredicate,
  shiftAbilityPredicate,
  singerAbilityPredicate,
  staticAbilityPredicate,
  staticEffectAbilityPredicate,
  WhileCondition,
  whileStaticAbilityPredicate,
  whileStaticAttributeAbilityPredicate,
  whileStaticRestrictionAbilityPredicate,
} from "~/engine/rules/abilities/abilities";
import { createLogEntry } from "~/spaces/Log/game-log/GameLogProvider";
import {
  Abilities,
  StatusFilterValues,
  TargetFilter,
} from "~/spaces/components/modals/target/filters";
import { keywordToAbilityPredicate } from "~/engine/store/utils";
import {
  AttributeEffect,
  costReplacementEffectPredicate,
  protectionEffectPredicate,
  restrictionEffectPredicate,
  strengthEffectPredicate,
} from "~/engine/rules/effects/effectTypes";
import { computeNumericOperator } from "~/spaces/components/modals/target/filterPredicates";

export class CardModel {
  instanceId: string;
  cardId: string;
  meta: CardMetaModel;
  ownerId: string;
  private rootStore: MobXRootStore;

  constructor(
    instanceId: string,
    cardId: string,
    meta: Meta | null | undefined,
    ownerId: string,
    rootStore: MobXRootStore,
    observable: boolean,
  ) {
    if (observable) {
      makeAutoObservable<CardModel, "rootStore">(this, {
        rootStore: false,
      });
    }

    this.instanceId = instanceId;
    this.cardId = cardId;
    this.meta = new CardMetaModel(meta, observable);
    this.ownerId = ownerId;

    this.rootStore = rootStore;
  }

  isCard(card?: CardModel) {
    return card?.instanceId === this.instanceId;
  }

  get isDead() {
    if (this.zone === "discard") {
      return true;
    }
    return (this.meta.damage || 0) >= (this.lorcanitoCard.willpower || 0);
  }

  get inkwell() {
    return !!this.lorcanitoCard?.inkwell;
  }

  get strength() {
    const strengthModifier =
      this.rootStore.continuousEffectStore.getStrengthModifier(this);

    const staticSelfModifier = this.abilities
      .filter(propertyStaticRestrictionAbilityPredicate)
      .reduce((acc, curr) => {
        let modifier = 0;

        curr.effects?.forEach((effect) => {
          if (effect.attribute !== "strength") {
            return;
          }

          switch (effect.modifier) {
            case "add": {
              modifier += effect.amount;
              break;
            }
            case "subtract": {
              modifier -= effect.amount;
              break;
            }
            case "filter": {
              if (effect.filters) {
                const filter = this.rootStore.cardStore
                  .getCardsByFilter(effect.filters, this.ownerId)
                  // TODO: This is a hack to avoid filtering the card itself
                  // Re work this to avoid this hack
                  .filter((card) => card.instanceId !== this.instanceId);

                modifier += filter.length;
              } else {
                console.error("Filter missing");
              }
              break;
            }
            default: {
              exhaustiveCheck(effect.modifier);
            }
          }
        });

        return modifier;
      }, 0);

    const staticModifier = this.rootStore.cardStore
      .getCardsByFilter([
        { filter: "zone", value: "play" },
        { filter: "type", value: "character" },
        { filter: "owner", value: "self" },
      ])
      .reduce((acc, curr) => {
        const attributeStaticAbility = curr.abilities.find(
          staticEffectAbilityPredicate,
        );

        if (!attributeStaticAbility) {
          return acc;
        }

        let modifier = 0;

        attributeStaticAbility.effects
          ?.filter(strengthEffectPredicate)
          .filter((effect: AttributeEffect) => {
            if (effect.target && effect.target.type === "card") {
              return this.isValidTarget(effect.target.filters, curr.ownerId);
            } else {
              return false;
            }
          })
          .forEach((effect: AttributeEffect) => {
            // extract this to the model
            switch (effect.modifier) {
              case "add": {
                modifier += effect.amount;
                break;
              }
              case "subtract": {
                modifier -= effect.amount;
                break;
              }
              case "filter": {
                if (effect.filters) {
                  const filter = this.rootStore.cardStore
                    .getCardsByFilter(effect.filters, this.ownerId)
                    // TODO: This is a hack to avoid filtering the card itself
                    // Re work this to avoid this hack
                    .filter((card) => card.instanceId !== this.instanceId);

                  modifier += filter.length;
                } else {
                  console.error("Filter missing");
                }
                break;
              }
              default: {
                exhaustiveCheck(effect.modifier);
              }
            }
          });

        return modifier;
      }, 0);

    const finalValue =
      (this.lorcanitoCard?.strength || 0) +
      strengthModifier +
      staticSelfModifier +
      staticModifier;

    return finalValue < 0 ? 0 : finalValue;
  }

  get fullName() {
    const card = this.lorcanitoCard;
    return `${card?.name}${card?.title ? " - " + card.title : ""}`;
  }

  get color(): CardColor {
    const card = this.lorcanitoCard;
    return card?.color as CardColor;
  }

  discard() {
    this.rootStore.tableStore.move(this, "discard");
  }

  addToInkwell() {
    this.rootStore.tableStore.addToInkwell(this.instanceId);
  }

  banish(params: { attacker?: CardModel; defender?: CardModel } = {}) {
    this.moveTo("discard");
    this.rootStore.triggeredStore.onBanish(this, params);
  }

  // Move will ignore restrictions
  moveTo(zone: Zones, position: "first" | "last" = "last") {
    this.rootStore.tableStore.move(this, zone, position);

    // if (zone === "discard") {
    //   this.rootStore.triggeredStore.onBanish(this);
    // }
  }

  isValidTarget(filters: TargetFilter[], expectedOwner: string = "") {
    return !!this.rootStore.cardStore
      // TODO: Revisit this expected owner
      .getCardsByFilter(filters, expectedOwner || this.ownerId)
      .find((card) => {
        return card.instanceId === this.instanceId;
      });
  }

  get zone(): Zones {
    // This potentially returns undefined
    return this.rootStore.tableStore.findCardZone(this) as Zones;
  }

  get shiftCost(): number {
    const card = allCardsById[this.cardId];
    const shiftAbility = card?.abilities?.find(shiftAbilityPredicate);

    if (shiftAbilityPredicate(shiftAbility)) {
      return shiftAbility.shift;
    }

    return 0;
  }

  get singCost(): number {
    const card = this.lorcanitoCard;

    const singerAbility = card?.abilities?.find(singerAbilityPredicate);
    if (singerAbilityPredicate(singerAbility)) {
      return singerAbility.value;
    }

    return 0;
  }

  get cost(): number {
    const costReduction = this.rootStore.continuousEffectStore.continuousEffects
      .filter((continuous) => continuous.isCostReplacementEffect(this))
      .reduce((acc, curr) => {
        if (curr.effect?.type === "replacement") {
          return acc + curr.effect.amount;
        }

        return acc;
      }, 0);

    // THIS needs to be improved, it's too specific to Mickey Mouse - Wayward Sorcerer
    const staticCostReduction = this.rootStore.cardStore
      .getCardsByFilter([
        { filter: "zone", value: "play" },
        { filter: "type", value: "character" },
        { filter: "owner", value: "self" },
      ])
      .filter((card) =>
        card.abilities.some(
          (ability) => ability.effects?.some(costReplacementEffectPredicate),
        ),
      )
      .reduce((acc, curr) => {
        const ability = curr.abilities.find(
          (ability) => ability.effects?.some(costReplacementEffectPredicate),
        );
        const costReplacementEffect = ability?.effects?.find(
          costReplacementEffectPredicate,
        );

        if (
          costReplacementEffectPredicate(costReplacementEffect) &&
          this.isValidTarget(costReplacementEffect.filters, curr.ownerId)
        ) {
          return acc + costReplacementEffect.amount;
        } else {
          return acc;
        }
      }, 0);

    const cost =
      (this.lorcanitoCard?.cost || 0) - costReduction - staticCostReduction;
    return cost <= 0 ? 0 : cost;
  }

  get lorcanitoCard(): LorcanitoCard {
    const card = allCardsById[this.cardId];
    if (!card) {
      console.error("Card not found", this.cardId);
      throw Error("Card not found");
    }

    return card;
  }

  get resolutionAbilities() {
    const card = this.lorcanitoCard;
    return card?.abilities?.filter(resolutionAbilityPredicate) || [];
  }

  metWhileCondition(conditions: WhileCondition[] = []) {
    return conditions.every((condition) => {
      switch (condition.type) {
        case "hand": {
          const playerId = this.ownerId;

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

          if (typeof condition.amount === "number") {
            return (
              this.rootStore.tableStore.getPlayerZone(playerId, "hand")?.cards
                .length <= condition.amount
            );
          } else {
            console.error("Amount missing");
            return false;
          }
        }
        case "turn": {
          if (condition.value === "self") {
            return this.ownerId === this.rootStore.turnPlayer;
          } else {
            return this.ownerId !== this.rootStore.turnPlayer;
          }
        }
        case "inkwell": {
          const inkwell = this.rootStore.tableStore.getPlayerZone(
            this.ownerId,
            "inkwell",
          )?.cards;

          return inkwell?.length >= condition.amount;
        }
        case "exerted": {
          return !this.ready;
        }
        case "not-alone": {
          const cardsInPlay = this.rootStore.cardStore.getCardsByFilter([
            { filter: "zone", value: "play" },
            { filter: "type", value: "character" },
            { filter: "owner", value: "self" },
          ]);
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
        default: {
          exhaustiveCheck(condition);
          return false;
        }
      }

      return false;
    });
  }

  get lore(): number {
    const cardLore = this.lorcanitoCard?.lore || 0;

    const loreModifier =
      this.rootStore.continuousEffectStore.getLoreModifier(this);

    const staticLoreModifier = this.abilities
      .filter(whileStaticAttributeAbilityPredicate)
      .filter((ability) => this.metWhileCondition(ability.whileCondition))
      .filter(
        (ability) => ability.ability.effect.target?.type === "this-character",
      )
      .reduce((acc, curr) => {
        const effect = curr.ability.effect;
        if (effect.attribute === "lore") {
          if (effect.modifier === "add") {
            return acc + effect.amount;
          } else {
            return acc - effect.amount;
          }
        }

        return acc;
      }, 0);

    // TODO: this is duplicated, improve it
    const staticSelfModifier = this.abilities
      .filter(propertyStaticRestrictionAbilityPredicate)
      .reduce((acc, curr) => {
        let modifier = 0;

        curr.effects?.forEach((effect) => {
          if (effect.attribute !== "lore") {
            return;
          }
          switch (effect.modifier) {
            case "add": {
              modifier += effect.amount;
              break;
            }
            case "subtract": {
              modifier -= effect.amount;
              break;
            }
            case "filter": {
              if (effect.filters) {
                const filter = this.rootStore.cardStore
                  .getCardsByFilter(effect.filters, this.ownerId)
                  // TODO: This is a hack to avoid filtering the card itself
                  // Re work this to avoid this hack
                  .filter((card) => card.instanceId !== this.instanceId);

                modifier += filter.length;
              } else {
                console.error("Filter missing");
              }
              break;
            }
            default: {
              exhaustiveCheck(effect.modifier);
            }
          }
        });

        return modifier;
      }, 0);

    return cardLore + loreModifier + staticLoreModifier + staticSelfModifier;
  }

  updateCardMeta(meta: Partial<CardMetaModel>) {
    this.meta.update(meta);
  }

  private get nativeAbilities() {
    return this.lorcanitoCard?.abilities || [];
  }

  get abilities() {
    const nativeAbilities: Ability[] = this.nativeAbilities;

    const gainedAbilities: Ability[] =
      this.rootStore.continuousEffectStore.getAbilitiesModifier(this);

    const whileStaticAbilities: Ability[] = nativeAbilities
      .filter(whileStaticAbilityPredicate)
      .map((ability) => {
        const isConditionMet = this.metWhileCondition(ability.whileCondition);

        if (isConditionMet) {
          return ability.ability;
        } else {
          return null;
        }
      })
      .filter(notEmptyPredicate);

    const staticGainedAbilities: Ability[] = this.rootStore.cardStore
      .getCardsByFilter([
        { filter: "zone", value: "play" },
        // TODO: Probably also items
        { filter: "type", value: "character" },
      ])
      .map((card) => {
        // TODO: eventually could be that a character has more than one to evaluate, but currently there's none
        const staticEffect = card.nativeAbilities.find(
          gainStaticAbilityPredicate,
        );

        if (!this.metWhileCondition(staticEffect?.conditions)) {
          return undefined;
        }

        const target = staticEffect?.target;

        if (target && this.isValidTarget(target.filters, card.ownerId)) {
          if (target.excludeSelf && this.isCard(card)) {
            return undefined;
          }
          return staticEffect.gainedAbility;
        }

        return undefined;
      })
      .filter(notEmptyPredicate);

    return [
      ...nativeAbilities,
      ...gainedAbilities,
      ...staticGainedAbilities,
      ...whileStaticAbilities,
    ].filter(notEmptyPredicate);
  }

  getAbility(abilityName?: string) {
    if (!abilityName) {
      return this.abilities[0];
    }

    return this.abilities.find(
      (ability) => ability.name?.toLowerCase() === abilityName.toLowerCase(),
    );
  }

  get hasActivatedAbility() {
    return !!this.abilities.find((ability) => ability.type === "activated");
  }

  canShiftInto(shifted: CardModel) {
    const shiftCost = this.shiftCost;
    const isAlreadyShifted = shifted.meta?.shifted;

    if (isAlreadyShifted || !shiftCost) {
      return false;
    }

    return this?.lorcanitoCard.name === shifted?.lorcanitoCard.name;
  }

  hasAbility(keyword: Abilities) {
    return !!this.abilities.find(keywordToAbilityPredicate(keyword));
  }

  get hasShift(): boolean {
    return this.hasAbility("shift");
  }

  get hasBodyguard(): boolean {
    return this.hasAbility("bodyguard");
  }

  get hasSupport(): boolean {
    return this.hasAbility("support");
  }

  get hasReckless(): boolean {
    return this.hasAbility("reckless");
  }

  get hasRush() {
    return this.hasAbility("rush");
  }

  get hasEvasive() {
    return this.hasAbility("evasive");
  }

  get hasWard() {
    return this.hasAbility("ward");
  }

  get hasChallenger() {
    return this.hasAbility("challenger");
  }

  get hasSinger() {
    return this.hasAbility("singer");
  }

  get hasVoiceless() {
    return this.hasAbility("voiceless");
  }

  get ready() {
    return !this.meta.exerted;
  }

  unpayCosts(costs: Cost[]) {
    if (costs.length === 1) {
      const cost = costs[0];

      if (cost?.type === "exert" && !this.ready) {
        this.updateCardMeta({ exerted: false });
        return true;
      }
    }

    return false;
  }

  get hasQuestRestriction() {
    const questRestriction =
      this.rootStore.continuousEffectStore.getQuestRestriction(this);

    const staticQuestRestriction = this.rootStore.cardStore
      .getCardsByFilter([
        { filter: "zone", value: "play" },
        // Items could also have
        { filter: "type", value: "character" },
      ])
      .find((card) => {
        const staticAbility = card.abilities.find(
          whileStaticRestrictionAbilityPredicate,
        );

        if (
          !staticAbility ||
          !card.metWhileCondition(staticAbility?.whileCondition)
        ) {
          return false;
        }

        const effect = staticAbility?.ability.effect;
        const target = staticAbility?.ability.target;

        if (effect?.restriction === "quest" && target?.type === "card") {
          return this.isValidTarget(target.filters, card.ownerId);
        }

        return false;
      });

    return (
      this.hasReckless ||
      questRestriction.length > 0 ||
      !!staticQuestRestriction
    );
  }

  quest() {
    const card = this.lorcanitoCard;
    const instanceId = this.instanceId;
    if (!card) {
      console.log("Card not found", instanceId);
      return;
    }
    const table = this.rootStore.tableStore.getTable(this.ownerId);

    if (!this.ready) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Glimmer can't quest",
        message: `Glimmer's exerted, you can use manual mode to simulate a quest`,
        icon: "warning",
        autoClear: true,
      });
      return;
    }

    if (this.hasQuestRestriction || this.meta.playedThisTurn) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Glimmer can't quest",
        message: `You can use manual mode to simulate a quest`,
        icon: "warning",
        autoClear: true,
      });
      return;
    }

    if (card.lore && table) {
      table.lore += card.lore;
      this.updateCardMeta({ exerted: true });
    }

    this.rootStore.stackLayerStore.onQuest(this);
    this.rootStore.triggeredStore.onQuest(this);
  }

  canPayCosts(costs: Cost[]) {
    return costs.every((cost) => {
      switch (cost.type) {
        case "exert": {
          return this.ready;
        }
        case "ink": {
          return (
            this.rootStore.tableStore
              .getPlayerZone(this.ownerId, "inkwell")
              ?.inkAvailable() >= cost.amount
          );
        }
        case "banish": {
          return cost.target === "self";
        }
        default: {
          console.error("Unknown cost type", cost);
          exhaustiveCheck(cost);
        }
      }
    });
  }

  private play(params?: { bodyguard?: boolean }) {
    const lorcanitoCard = this.lorcanitoCard;

    if (
      lorcanitoCard?.implemented &&
      lorcanitoCard?.characteristics?.includes("action")
    ) {
      this.moveTo("discard");
    } else {
      this.moveTo("play");
    }

    if (params?.bodyguard) {
      this.updateCardMeta({
        exerted: true,
      });
    }

    this.rootStore.stackLayerStore.onPlay(this);
    this.rootStore.triggeredStore.onPlay(this);
    this.rootStore.continuousEffectStore.onPlay(this);
  }

  playFromHand(params?: { bodyguard?: boolean }) {
    if (this.zone !== "hand") {
      console.error("Can only play cards from hand");
      return;
    }

    const hasBodyGuard = this.hasBodyguard;
    if (hasBodyGuard && params?.bodyguard === undefined) {
      this.rootStore.dependencies.modals.openYesOrNoModal({
        title: "Would you like to play this card exerted?",
        text: "**Bodyguard** _(This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.)_",
        onYes: () => {
          this.playFromHand({ bodyguard: true });
        },
        onNo: () => {
          this.playFromHand({ bodyguard: false });
        },
      });

      return;
    }

    const ownerTable = this.rootStore.tableStore.getTable(this.ownerId);
    const canPay = ownerTable?.canPayInkCost(this);

    if (canPay) {
      this.rootStore.tableStore.payInk(ownerTable, this);
      this.play(params);
    } else {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Not enough ink",
        message: `If you think this is a mistake, right click the card and select "Move to Play Area"`,
        icon: "warning",
        autoClear: true,
      });
    }
  }

  canSing(song?: CardModel) {
    if (!song) {
      return false;
    }

    if (this.meta.playedThisTurn || !this.ready) {
      return false;
    }

    if (
      this.type !== "character" ||
      !song.lorcanitoCard.characteristics?.includes("song")
    ) {
      return false;
    }

    return this.cost >= song?.cost;
  }

  sing(song?: CardModel) {
    if (!song) {
      console.error("Song not found");
      return;
    }
    const singValue: number = this.singCost || this.cost;

    if (!this.ready) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Can't sing when exerted",
        message: `You can instead right click the card and select "Play Card" option and then exert the singer, if you want to skip this check.`,
        icon: "warning",
        autoClear: true,
      });
      return;
    }

    if (this.meta.playedThisTurn) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Fresh ink can't sing",
        message: `You can instead right click the card and select "Play Card" option and then exert the singer, if you want to skip this check.`,
        icon: "warning",
        autoClear: true,
      });
      return;
    }

    if (this.hasVoiceless) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Voiceless character can't sing",
        message: `You can instead right click the card and select "Play Card" option and then exert the singer, if you want to skip this check.`,
        icon: "warning",
        autoClear: true,
      });
      return;
    }

    if (song.cost > singValue) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Not enough ink",
        message: `You can instead right click the card and select "Play Card" option and then exert the singer, if you want to skip this check.`,
        icon: "warning",
        autoClear: true,
      });
      return;
    }

    this.rootStore.cardStore.updateCardMeta(this.instanceId, {
      exerted: true,
    });

    song.play();

    this.rootStore.log({
      type: "SING",
      song: song.instanceId,
      singer: this.instanceId,
    });
  }

  payCosts(costs: Cost[] = []) {
    if (!this.canPayCosts(costs)) {
      return false;
    }

    costs.forEach((cost) => {
      switch (cost.type) {
        case "exert": {
          this.updateCardMeta({ exerted: true });
          break;
        }
        case "ink": {
          const table = this.rootStore.tableStore.getTable(this.ownerId);
          this.rootStore.tableStore.payInk(table, this, {
            byPass: cost.amount,
          });
          break;
        }
        case "banish": {
          return this.moveTo("discard");
        }
        default: {
          console.error("Unknown cost type", cost);
          exhaustiveCheck(cost);
        }
      }
    });

    return true;
  }

  activate(abilityName?: string) {
    // Todo: solve this
    const ability = this.getAbility(abilityName) as ActivatedAbility;
    const payed = this.payCosts(ability.costs);

    if (payed) {
      this.rootStore.stackLayerStore.onActivateAbility(this, ability);
    } else {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Can't activate this card",
        message: `You can't pay activation costs, if you think this is a mistake you can enable manual mode and adjust the game state.`,
        icon: "warning",
        autoClear: true,
      });
    }
  }

  canBeChallenged(opponent: CardModel) {
    if (this.ready) {
      console.log("Can't challenge a ready glimmer");
      return false;
    }

    if (this.hasEvasive && !opponent.hasEvasive) {
      console.log(
        "Can't challenge an evasive glimmer, unless the attacker has evasive too",
      );
      return false;
    }
    // TODO: insert bodyguard check

    let result = true;

    // TODO: this can be optimized by using hasChallengeRestriction
    this.abilities.forEach((ability) => {
      if (!staticAbilityPredicate(ability)) {
        return;
      }

      ability.effects?.forEach((effect) => {
        if (
          protectionEffectPredicate(effect) &&
          effect.restriction === "challenge"
        ) {
          console.log(
            opponent.isValidTarget(effect.target.filters, this.ownerId),
          );
          result = !opponent.isValidTarget(effect.target.filters, this.ownerId);
        }
      });
    });

    return result;
  }

  canChallenge(opponent: CardModel) {
    if (!this.ready) {
      return false;
    }
    // TODO: insert bodyguard check

    return opponent.canBeChallenged(this);
  }

  get hasChallengeRestriction() {
    const cardsInPlay = this.rootStore.cardStore.getCardsByFilter([
      { filter: "zone", value: "play" },
    ]);

    let restriction = false;
    for (const card of cardsInPlay) {
      card.abilities.forEach((ability) => {
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
              this.isValidTarget(effect.target.filters, card.ownerId)
            ) {
              restriction = true;
            }
          });
      });
    }

    const challengeRestriction =
      this.rootStore.continuousEffectStore.getChallengeRestriction(this);

    return challengeRestriction.length > 0 || restriction;
  }

  challenge(defender: CardModel) {
    if (this.hasChallengeRestriction) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Glimmer can't challenge",
        message: `You can use manual mode to simulate a quest`,
        icon: "warning",
        autoClear: true,
      });
      return;
    }

    if (defender.hasEvasive && !this.hasEvasive) {
      this.rootStore.sendNotification({
        type: "icon",
        title:
          "Can't challenge an evasive glimmer, unless the attacker has evasive too",
        message: `You can instead use manual mode to simulate a challenge`,
        icon: "warning",
        autoClear: true,
      });
      return;
    }

    if (this.meta.playedThisTurn && !this.hasRush) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Can't challenge when the ink is fresh",
        message: `You can instead use manual mode to simulate a challenge`,
        icon: "warning",
        autoClear: true,
      });
      return;
    }

    if (!this.canChallenge(defender)) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Can't challenge this character",
        message: `You can instead use manual mode to simulate a challenge`,
        icon: "warning",
        autoClear: true,
      });
      return;
    }

    const playerId = this.ownerId;
    const defenderPlayer = defender.ownerId;
    const defenderBodyGuards = this.rootStore.cardStore.getCardsByFilter([
      { filter: "owner", value: defenderPlayer },
      { filter: "zone", value: "play" },
      { filter: "status", value: StatusFilterValues.EXERTED },
      { filter: "keyword", value: "bodyguard" },
    ]);

    if (
      defenderBodyGuards.length > 0 &&
      !defenderBodyGuards.find(
        (card) => card.instanceId === defender.instanceId,
      )
    ) {
      console.log("Can't challenge a body guarded card");
      return;
    }

    const defenderCard = defender.lorcanitoCard;
    const attackerCard = this.lorcanitoCard;
    let attackerStrength = attackerCard?.strength || 0;
    const challengerAbility = attackerCard?.abilities?.find(
      challengerAbilityPredicate,
    );
    if (challengerAbility) {
      attackerStrength += challengerAbility.value;
    }

    this.updateCardMeta({
      exerted: true,
      damage: (this.meta?.damage || 0) + (defenderCard?.strength || 0),
    });
    defender.updateCardMeta({
      damage: (defender.meta?.damage || 0) + attackerStrength,
    });

    this.rootStore.stackLayerStore.onChallenge(this, defender);
    this.rootStore.triggeredStore.onChallenge(this, defender);
    this.rootStore.continuousEffectStore.onChallenge(this, defender);

    // We're moving to discard after the triggers, so we can evaluate the triggers before discarding
    if (defender.isDead) {
      defender.banish({ attacker: this, defender: defender });
    }
    if (this.isDead) {
      this.banish({ attacker: this, defender: defender });
    }

    this.rootStore.log(
      createLogEntry(
        {
          type: "CHALLENGE",
          attacker: this.instanceId,
          defender: defender.instanceId,
        },
        playerId,
      ),
    );
  }

  get type() {
    return this.lorcanitoCard.type;
  }

  updateCardDamage(amount: number, type: "add" | "remove" = "add") {
    const cardDamageCounter = this?.meta?.damage || 0;
    let damage: number =
      type === "add" ? cardDamageCounter + amount : cardDamageCounter - amount;

    if (damage < 0) {
      console.log("Damage can't be negative");
      damage = 0;
    }

    this.updateCardMeta({
      damage,
    });

    this.rootStore.log({
      type: "DAMAGE_CHANGE",
      instanceId: this.instanceId,
      // amount,
      to: damage,
      from: cardDamageCounter,
    });
    // logAnalyticsEvent("damage_change", { instanceId, amount, type });
  }

  get hasExertRestriction() {
    const exertRestriction =
      this.rootStore.continuousEffectStore.getExertRestriction(this);

    return exertRestriction.length > 0;
  }

  // From upstream to Model
  sync(tableCard: TableCard): void {
    if (!tableCard.meta) {
      this.meta.resetMeta();
    } else {
      this.meta.sync(tableCard.meta);
    }
  }

  // From model to upstream
  toJSON(): TableCard {
    return {
      instanceId: this.instanceId,
      cardId: this.cardId,
      ownerId: this.ownerId,
      meta: this.meta.toJSON(),
    };
  }
}
