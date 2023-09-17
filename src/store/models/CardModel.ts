import type { Meta, TableCard, Zones } from "~/providers/TabletopProvider";
import { makeAutoObservable, toJS } from "mobx";
import { allCardsById } from "~/engine/cards/cards";
import { CardColor, LorcanitoCard } from "~/engine/cardTypes";
import { CardMetaModel } from "~/store/models/CardMetaModel";
import type { MobXRootStore } from "~/store/RootStore";
import { exhaustiveCheck } from "~/libs/exhaustiveCheck";
import {
  Ability,
  ActivatedAbility,
  challengerAbilityPredicate,
  Cost,
  notEmptyPredicate,
  ResolutionAbility,
  resolutionAbilityPredicate,
  shiftAbilityPredicate,
  singerAbilityPredicate,
  supportAbilityPredicate,
} from "~/engine/abilities";
import { createLogEntry } from "~/spaces/Log/game-log/GameLogProvider";
import { Abilities, TargetFilter } from "~/components/modals/target/filters";
import { keywordToAbilityPredicate } from "~/store/utils";

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
    rootStore: MobXRootStore
  ) {
    makeAutoObservable<CardModel, "rootStore">(this, {
      rootStore: false,
    });

    this.instanceId = instanceId;
    this.cardId = cardId;
    this.meta = new CardMetaModel(meta);
    this.ownerId = ownerId;

    this.rootStore = rootStore;
  }

  isCard(card?: CardModel) {
    return card?.instanceId === this.instanceId;
  }

  get isDead() {
    return (this.meta.damage || 0) >= (this.lorcanitoCard.willpower || 0);
  }

  get inkwell() {
    return !!this.lorcanitoCard?.inkwell;
  }

  get strength() {
    const strengthModifier =
      this.rootStore.continuousEffectStore.getStrengthModifier(this);

    const finalValue = (this.lorcanitoCard?.strength || 0) + strengthModifier;
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

  // Move will ignore restrictions
  moveTo(zone: Zones, position: "first" | "last" = "last") {
    this.rootStore.tableStore.move(this, zone, position);

    if (zone === "discard") {
      this.rootStore.staticTriggeredStore.onBanish(this);
    }
  }

  isValidTarget(filters: TargetFilter[], expectedOwner: string = "") {
    return (
      this.rootStore.cardStore
        // TODO: Revisit this expected owner
        .getCardsByFilter(filters, expectedOwner || this.ownerId)
        .find((card) => {
          return card.instanceId === this.instanceId;
        })
    );
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
    const costReduction =
      this.rootStore.continuousEffectStore.continuousEffects.filter(
        (continuous) =>
          continuous.effect.type === "replacement" &&
          continuous.effect.replacement === "cost" &&
          this.isValidTarget(continuous.filters || [])
      ).length;
    return (this.lorcanitoCard?.cost || 0) - costReduction;
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

  get lore(): number {
    const cardLore = this.lorcanitoCard?.lore || 0;

    const loreModifier =
      this.rootStore.continuousEffectStore.getLoreModifier(this);

    return cardLore + loreModifier;
  }

  updateCardMeta(meta: Partial<CardMetaModel>) {
    this.meta.update(meta);
  }

  get abilities() {
    const nativeAbilities: Ability[] = this.lorcanitoCard?.abilities || [];

    const gainedAbilities: Ability[] =
      this.rootStore.continuousEffectStore.getAbilitiesModifier(this);

    return [...nativeAbilities, ...gainedAbilities];
  }

  getAbility(abilityName?: string) {
    if (!abilityName) {
      return this.abilities[0];
    }

    return this.abilities.find(
      (ability) => ability.name?.toLowerCase() === abilityName.toLowerCase()
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

    return this.hasReckless || questRestriction.length > 0;
  }

  quest() {
    const card = this.lorcanitoCard;
    const instanceId = this.instanceId;
    if (!card) {
      console.log("Card not found", instanceId);
      return;
    }
    const table = this.rootStore.tableStore.getTable(this.ownerId);

    if (this.hasQuestRestriction) {
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

    const supportAbility = card?.abilities?.find(supportAbilityPredicate);
    if (supportAbility) {
      // I think this should be called effect, not ability
      const supportEffect: ResolutionAbility = {
        type: "resolution",
        name: "Support",
        text: supportAbility.text,
        effects: [
          {
            type: "attribute",
            attribute: "strength",
            amount: this.strength,
            modifier: "add",
            duration: "turn",
            target: {
              type: "cardModel",
              // TODO: This is wrong
              card: this,
            },
          },
        ],
        targets: {
          type: "card",
          value: 1,
          filters: [
            { filter: "zone", value: "play" },
            { filter: "type", value: "character" },
          ],
        },
        optional: true,
      };
      this.rootStore.stackLayerStore.addAbilityToStack(supportEffect, this);
    }

    this.rootStore.staticTriggeredStore.onQuest(this);
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

    if (!lorcanitoCard?.characteristics?.includes("action")) {
      this.moveTo("play");
    }

    if (params?.bodyguard) {
      this.updateCardMeta({
        exerted: true,
      });
    }

    const resolutionAbilities = this.resolutionAbilities;

    resolutionAbilities?.forEach((ability) => {
      if (resolutionAbilityPredicate(ability)) {
        this.rootStore.stackLayerStore.addAbilityToStack(ability, this);
      } else {
        console.error("Ability not found", ability);
      }
    });

    if (
      lorcanitoCard?.implemented &&
      lorcanitoCard?.characteristics?.includes("action")
    ) {
      this.moveTo("discard");
    }

    this.rootStore.staticTriggeredStore.onPlay(this);
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

    return this.lorcanitoCard.cost >= song?.lorcanitoCard.cost;
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
      this.rootStore.stackLayerStore.addAbilityToStack(ability, this);
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

  banish() {
    this.moveTo("discard");
  }

  challenge(defender: CardModel) {
    const attacker = this;

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

    if (defender.hasEvasive && !attacker.hasEvasive) {
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

    if (attacker.meta.playedThisTurn && !this.hasRush) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Can't challenge when the ink is fresh",
        message: `You can instead use manual mode to simulate a challenge`,
        icon: "warning",
        autoClear: true,
      });
      return;
    }

    const playerId = attacker.ownerId;
    const defenderPlayer = defender.ownerId;
    const defenderBodyGuards = this.rootStore.cardStore.getCardsByFilter([
      { filter: "owner", value: defenderPlayer },
      { filter: "zone", value: "play" },
      { filter: "status", value: "exerted" },
      { filter: "keyword", value: "bodyguard" },
    ]);

    if (
      defenderBodyGuards.length > 0 &&
      !defenderBodyGuards.find(
        (card) => card.instanceId === defender.instanceId
      )
    ) {
      console.log("Can't challenge a body guarded card");
      return;
    }

    const defenderCard = defender.lorcanitoCard;
    const attackerCard = attacker.lorcanitoCard;
    let attackerStrength = attackerCard?.strength || 0;
    const challengerAbility = attackerCard?.abilities?.find(
      challengerAbilityPredicate
    );
    if (challengerAbility) {
      attackerStrength += challengerAbility.value;
    }

    attacker.updateCardMeta({
      exerted: true,
      damage: (attacker.meta?.damage || 0) + (defenderCard?.strength || 0),
    });
    defender.updateCardMeta({
      damage: (defender.meta?.damage || 0) + attackerStrength,
    });

    if (defender.isDead) {
      defender.moveTo("discard");
    }
    if (attacker.isDead) {
      attacker.moveTo("discard");
    }

    this.rootStore.log(
      createLogEntry(
        {
          type: "CHALLENGE",
          attacker: this.instanceId,
          defender: defender.instanceId,
        },
        playerId
      )
    );
  }

  get type() {
    return this.lorcanitoCard.type;
  }

  canChallenge(opponent: CardModel) {
    if (!this.ready || opponent.ready) {
      return false;
    }

    if (opponent.hasEvasive && !this.hasEvasive) {
      return false;
    }

    // TODO: insert bodyguard check

    return true;
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

  get hasChallengeRestriction() {
    const challengeRestriction =
      this.rootStore.continuousEffectStore.getChallengeRestriction(this);

    return challengeRestriction.length > 0;
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
