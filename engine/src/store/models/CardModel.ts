import { makeAutoObservable } from "mobx";

import {
  Abilities,
  CardColor,
  Cost,
  LorcanitoCard,
  Meta,
  MobXRootStore,
  MoveResponse,
  notEmptyPredicate,
  NotificationType,
  TableCard,
  TargetFilter,
  whileStaticAbilityPredicate,
  Zones,
} from "@lorcanito/engine";
import {
  activatedAbilityPredicate,
  allCardsById,
  CardMetaModel,
  AbilityModel,
  challengerAbilityPredicate,
  createLogEntry,
  exhaustiveCheck,
  keywordToAbilityPredicate,
  protectionEffectPredicate,
  resistAbilityPredicate,
  shiftAbilityPredicate,
  singerAbilityPredicate,
  staticAbilityPredicate,
} from "@lorcanito/engine";
import { reverseChallengerAbilityPredicate } from "@lorcanito/engine/rules/abilities/abilityTypeGuards";

type AbilityFilter = (ability: AbilityModel) => boolean;

export class CardModel {
  instanceId: string;
  cardId: string;
  meta: CardMetaModel;
  ownerId: string;
  abilities: AbilityModel[];

  private readonly rootStore: MobXRootStore;
  private readonly observable: boolean;

  constructor(
    instanceId: string,
    cardId: string,
    meta: Meta | null | undefined,
    ownerId: string,
    rootStore: MobXRootStore,
    observable: boolean,
  ) {
    this.rootStore = rootStore;
    this.observable = observable;

    if (observable) {
      makeAutoObservable<CardModel, "rootStore">(this, {
        rootStore: false,
      });
    }

    this.instanceId = instanceId;
    this.cardId = cardId;
    this.meta = new CardMetaModel(meta, observable, this.rootStore);
    this.ownerId = ownerId;

    this.abilities =
      this.lorcanitoCard.abilities?.map(
        (ability) => new AbilityModel(ability, this, rootStore, observable),
      ) || [];
  }

  isCard(card?: CardModel | null) {
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

  get isSong() {
    return !!this.lorcanitoCard?.characteristics.includes("song");
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
    this.moveTo("discard", { discard: true });
  }

  addToInkwell(): MoveResponse {
    return this.rootStore.tableStore.addToInkwell(this.instanceId);
  }

  banish(params: { attacker?: CardModel; defender?: CardModel } = {}) {
    this.moveTo("discard", params);
  }

  reveal() {
    this.updateCardMeta({ revealed: true });
    this.rootStore.log({
      type: "REVEAL_CARD",
      player: this.ownerId,
      card: this.instanceId,
      from: this.zone,
    });
  }

  // Move will ignore restrictions
  moveTo(
    zone: Zones,
    opts: {
      skipLog?: true;
      position?: "first" | "last";
      attacker?: CardModel;
      defender?: CardModel;
      discard?: boolean;
    } = {},
  ): MoveResponse {
    const leavesPlay = this.zone === "play" && zone !== "play";
    const isBanish = this.zone === "play" && zone === "discard";
    const discard = this.zone === "hand" && zone === "discard" && opts.discard;

    if (leavesPlay) {
      this.rootStore.triggeredStore.onLeavePlay(this, zone);
    }

    const charactersAtLocation = this.meta.characters || [];
    charactersAtLocation.forEach((character) => {
      character.leaveLocation();
    });

    this.rootStore.tableStore.move(this, zone, opts);

    if (isBanish) {
      this.rootStore.triggeredStore.onBanish(this, opts);
    }

    if (discard) {
      this.rootStore.triggeredStore.onDiscard(this);
    }

    return this.rootStore.moveResponse(true);
  }

  isValidTarget(
    filters: TargetFilter[],
    expectedOwner: string = "",
    effectSource?: CardModel,
  ) {
    return this.rootStore.effectStore.isValidTarget(
      this,
      filters,
      expectedOwner,
      effectSource,
    );
  }

  get zone(): Zones {
    // This potentially returns undefined
    return this.rootStore.tableStore.findCardZone(this) as Zones;
  }

  get shiftCost(): number {
    const card = this.lorcanitoCard;
    const shiftAbility = card?.abilities?.find(shiftAbilityPredicate);

    if (shiftAbilityPredicate(shiftAbility)) {
      return shiftAbility.shift;
    }

    return 0;
  }

  get singCost(): number {
    const singerAbility = this.getAbilities([
      (ability: AbilityModel) => ability.isSingAbility,
    ])[0];

    const ability = singerAbility?.ability;
    if (singerAbilityPredicate(ability)) {
      return ability.value;
    }

    return this.lorcanitoCard.cost || 0;
  }

  get cost(): number {
    const modifier = this.rootStore.effectStore.getCostModifier(this);
    const cost = (this.lorcanitoCard?.cost || 0) - modifier;
    return cost <= 0 ? 0 : cost;
  }

  get lorcanitoCard(): LorcanitoCard {
    const card = allCardsById[this.cardId];
    if (!card) {
      console.error("Card not found", this.cardId);
      throw Error("Card not found");
    }

    if (!card.implemented) {
      card.abilities = [];
    }

    return card;
  }

  get resolutionAbilities() {
    return this.getAbilities([(ability) => ability.isResolutionAbility]);
  }

  get lore(): number {
    const cardLore = this.lorcanitoCard?.lore || 0;
    const loreModifier = this.rootStore.effectStore.getLoreModifier(this);

    const finalValue = cardLore + loreModifier;

    if (finalValue <= 0) {
      return 0;
    }

    return finalValue;
  }

  get strength(): number {
    const original = this.lorcanitoCard?.strength || 0;
    const strengthModifier =
      this.rootStore.effectStore.getStrengthModifier(this);

    const finalValue = original + strengthModifier;

    if (finalValue <= 0) {
      return 0;
    }

    return finalValue;
  }

  get characteristics() {
    return this.lorcanitoCard.characteristics;
  }

  updateCardMeta(meta: Partial<CardMetaModel>) {
    if (this.meta.exerted === true && meta.exerted === false) {
      this.rootStore.triggeredStore.onReady(this);
    }

    this.meta.update(meta);
  }

  nativeAbilities(filters: AbilityFilter[] = []): AbilityModel[] {
    return this.abilities.filter((ability) =>
      filters.every((filter) => filter(ability)),
    );
  }

  nativeWhileStaticAbilities(
    filters: Array<(ability: AbilityModel) => boolean>,
  ) {
    return this.nativeAbilities(filters)
      .filter((ability) => ability.isWhileStaticAbility)
      .filter((ability) => ability.areConditionsMet)
      .map((whileStaticModel) => {
        const ability = whileStaticModel.ability;

        if (!whileStaticAbilityPredicate(ability)) {
          return undefined;
        }

        return new AbilityModel(
          ability.ability,
          this,
          this.rootStore,
          this.observable,
        );
      })
      .filter(notEmptyPredicate);
  }

  nativeGainedStaticAbilities(
    filters: Array<(ability: AbilityModel) => boolean>,
  ) {
    const staticEffect = this.nativeAbilities(filters).find(
      (ability) => ability.isGainStaticAbility,
    );

    const whileStaticEffect = this.nativeWhileStaticAbilities(filters).find(
      (ability) => ability.isGainStaticAbility,
    );

    const abilities: AbilityModel[] = [];
    if (staticEffect) {
      abilities.push(staticEffect);
    }

    if (whileStaticEffect) {
      abilities.push(whileStaticEffect);
    }

    return abilities;
  }

  // TODO: Make it https://mobx.js.org/computeds.html
  // TODO: improve type so return type is inferred from filter
  getAbilities(
    filters: AbilityFilter[] = [],
    ignoreConditions = false,
  ): AbilityModel[] {
    const nativeAbilities = this.nativeAbilities(filters)
      .filter((ability) => ignoreConditions || ability.areConditionsMet)
      .map((model) => {
        const ability = model.ability;

        if (whileStaticAbilityPredicate(ability)) {
          return new AbilityModel(
            ability.ability,
            model.source,
            this.rootStore,
            this.observable,
          );
        }

        return model;
      });

    const gainedAbilities =
      this.rootStore.continuousEffectStore.getAbilitiesModifier(this, filters);

    const staticGainedAbilities =
      this.rootStore.effectStore.getStaticGainedAbilities(this, filters);

    return (
      [...nativeAbilities, ...gainedAbilities, ...staticGainedAbilities]
        // .filter((ability) => ability.areConditionsMet)
        .filter(notEmptyPredicate)
    );
  }

  getActivatedAbility(abilityName?: string) {
    const activatedAbilities = this.getAbilities(
      [
        (ability: AbilityModel) => {
          return ability.isActivatedAbility;
        },
      ],
      true,
    );

    if (!abilityName) {
      return activatedAbilities[0];
    }

    return activatedAbilities.find(
      (ability) => ability.name?.toLowerCase() === abilityName.toLowerCase(),
    );
  }

  get hasActivatedAbility() {
    return !!this.getActivatedAbility();
  }

  canShiftInto(shifted?: CardModel) {
    if (!shifted) {
      return false;
    }
    const shiftCost = this.shiftCost;
    const isAlreadyShifted = shifted.meta?.shifted;

    if (isAlreadyShifted || !shiftCost) {
      return false;
    }

    return this?.lorcanitoCard.name === shifted?.lorcanitoCard.name;
  }

  getStaticAbility(keyword: Abilities) {
    const filter = (ability: AbilityModel) => {
      return ability.hasAbility(keywordToAbilityPredicate(keyword));
    };

    return this.getAbilities([filter]).find((ability) =>
      keywordToAbilityPredicate(keyword)(ability.ability),
    );
  }

  getNativeStaticAbility(keyword: Abilities) {
    return this.nativeAbilities([() => true])
      .map((model) => model.ability)
      .find(keywordToAbilityPredicate(keyword));
  }

  hasAbility(keyword: Abilities) {
    return !!this.getStaticAbility(keyword);
  }

  hasNativeAbility(keyword: Abilities) {
    return !!this.getNativeStaticAbility(keyword);
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

  get hasProtector(): boolean {
    return this.hasAbility("protector");
  }

  get hasRush() {
    return this.hasAbility("rush");
  }

  get hasResist() {
    return this.hasAbility("resist");
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
    if (this.hasReckless) {
      return true;
    }

    const questRestriction =
      this.rootStore.continuousEffectStore.getQuestRestriction(this);

    const staticQuestRestriction =
      this.rootStore.effectStore.hasQuestRestriction(this);

    return questRestriction.length > 0 || !!staticQuestRestriction;
  }

  quest(): MoveResponse {
    const table = this.rootStore.tableStore.getTable(this.ownerId);

    if (!this.ready) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Glimmer can't quest",
        message: `Glimmer's exerted, you can use manual mode to simulate a quest`,
        icon: "warning",
        autoClear: true,
      });
    }

    if (this.hasQuestRestriction || this.meta.playedThisTurn) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Glimmer can't quest",
        message: `You can use manual mode to simulate a quest`,
        icon: "warning",
        autoClear: true,
      });
    }

    if (table) {
      table.updateLore(table.lore + this.lore);
      this.updateCardMeta({ exerted: true });
    }

    this.rootStore.stackLayerStore.onQuest(this);
    this.rootStore.triggeredStore.onQuest(this);

    return this.rootStore.moveResponse(true);
  }

  gainLocationLore() {
    if (this.zone !== "play" || this.type !== "location") {
      return;
    }

    const table = this.rootStore.tableStore.getTable(this.ownerId);
    if (table) {
      table.updateLore(table.lore + this.lore);
    }

    return this.rootStore.log({
      type: "GAIN_LOCATION_LORE",
      player: this.ownerId,
      location: this.instanceId,
      lore: this.lore,
    });
  }

  canPayCosts(costs: Cost[], cardsToExert: CardModel[] = []) {
    return costs.every((cost) => {
      switch (cost.type) {
        case "exert": {
          if (this.type === "item") {
            return this.ready;
          }

          return this.ready && !this.meta.playedThisTurn;
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
        case "exert-characters": {
          return (
            cardsToExert.filter((card) => card.ready).length >= cost.amount
          );
        }
        default: {
          console.error("Unknown cost type", cost);
          exhaustiveCheck(cost);
        }
      }
    });
  }

  shift(target?: CardModel): MoveResponse {
    if (!target) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Can't shift",
        message: `You must select a target to shift into`,
        icon: "warning",
        autoClear: true,
      });
    }

    return this.rootStore.cardStore.shiftCard(
      this.instanceId,
      target.instanceId,
    );
  }

  private play(params?: {
    bodyguard?: boolean;
    hasShifted?: boolean;
    forFree?: boolean;
  }): MoveResponse {
    if (!params?.forFree) {
      const ownerTable = this.rootStore.tableStore.getTable(this.ownerId);
      this.rootStore.tableStore.payInk(ownerTable, this.cost);
    }

    const lorcanitoCard = this.lorcanitoCard;

    if (
      lorcanitoCard?.implemented &&
      lorcanitoCard?.characteristics?.includes("action")
    ) {
      this.moveTo("discard", { skipLog: true });
    } else {
      this.moveTo("play");
    }

    if (params?.bodyguard) {
      this.updateCardMeta({
        exerted: true,
      });
    }

    return this.onPlay(params);
  }

  onPlay(params?: { bodyguard?: boolean; hasShifted?: boolean }) {
    this.rootStore.tableStore
      .getTable(this.ownerId)
      .turn.cardsPlayed.push(this);

    this.rootStore.stackLayerStore.onPlay(this, params);
    this.rootStore.triggeredStore.onPlay(this);
    this.rootStore.continuousEffectStore.onPlay(this);

    return this.rootStore.moveResponse(true);
  }

  playingCardRestrictions(
    params: {
      hasShifted?: boolean;
      bodyguard?: boolean;
      forFree?: boolean;
    } = {},
  ) {
    if (this.zone !== "hand" && !params?.forFree) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Can't play this card",
        message: "This card is not in your hand",
        icon: "warning",
        autoClear: true,
      });
    }

    const hasBodyGuard = this.hasBodyguard;
    if (hasBodyGuard && params?.bodyguard === undefined) {
      const notification: NotificationType = {
        type: "icon",
        title: "You must choose bodyguard option",
        message: "This character has bodyguard, you must choose an option",
        icon: "warning",
        autoClear: true,
      };
      return this.rootStore.sendNotification(notification);
    }

    const ownerTable = this.rootStore.tableStore.getTable(this.ownerId);
    const canPay = ownerTable?.canPayInkCost(this);
    if (!canPay && !params?.forFree) {
      const notification: NotificationType = {
        type: "icon",
        title: "Not enough ink",
        message: `If you think this is a mistake, right click the card and select "Move to Play Area"`,
        icon: "warning",
        autoClear: true,
      };
      return this.rootStore.sendNotification(notification);
    }

    if (this.rootStore.effectStore.hasRestrictionToPlayActionCard(this)) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "You can't play this card",
        message:
          "there's a restriction that prevents you from playing this card",
        icon: "warning",
        autoClear: true,
      });
    }
  }

  playFromHand(params?: {
    hasShifted?: boolean;
    bodyguard?: boolean;
    forFree?: boolean;
  }): MoveResponse {
    const restrictions = this.playingCardRestrictions(params);
    if (restrictions) {
      return restrictions;
    }

    return this.play(params);
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

    const singer = this.singCost;
    if (singer) {
      return singer >= song?.cost;
    }

    return this.cost >= song?.cost;
  }

  sing(song?: CardModel): MoveResponse {
    if (!song) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Can't sing",
        message: "You must select a song to sing",
        icon: "warning",
        autoClear: true,
      });
    }

    const singValue: number = this.singCost || this.cost;

    if (!this.ready) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Can't sing when exerted",
        message: `You can instead right click the card and select "Play Card" option and then exert the singer, if you want to skip this check.`,
        icon: "warning",
        autoClear: true,
      });
    }

    if (this.meta.playedThisTurn) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Fresh ink can't sing",
        message: `You can instead right click the card and select "Play Card" option and then exert the singer, if you want to skip this check.`,
        icon: "warning",
        autoClear: true,
      });
    }

    if (this.hasVoiceless) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Voiceless character can't sing",
        message: `You can instead right click the card and select "Play Card" option and then exert the singer, if you want to skip this check.`,
        icon: "warning",
        autoClear: true,
      });
    }

    if (song.cost > singValue) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Not enough ink",
        message: `You can instead right click the card and select "Play Card" option and then exert the singer, if you want to skip this check.`,
        icon: "warning",
        autoClear: true,
      });
    }

    this.rootStore.cardStore.updateCardMeta(this.instanceId, {
      exerted: true,
    });

    this.rootStore.log({
      type: "SING",
      song: song.instanceId,
      singer: this.instanceId,
    });

    return song.play();
  }

  payCosts(costs: Cost[] = [], cardsToExert: CardModel[] = []) {
    if (!this.canPayCosts(costs, cardsToExert)) {
      return false;
    }

    let result = true;

    costs.forEach((cost) => {
      switch (cost.type) {
        case "exert": {
          this.updateCardMeta({ exerted: true });
          break;
        }
        case "ink": {
          const table = this.rootStore.tableStore.getTable(this.ownerId);
          const payedInk = this.rootStore.tableStore.payInk(table, cost.amount);

          result = result && payedInk;
          break;
        }
        case "banish": {
          this.moveTo("discard");
          break;
        }
        case "exert-characters": {
          for (let i = 0; i < cost.amount; i++) {
            const card = cardsToExert[i];
            card?.updateCardMeta({ exerted: true });
          }
          break;
        }
        default: {
          console.error("Unknown cost type", cost);
          exhaustiveCheck(cost);
        }
      }
    });

    return result;
  }

  activate(
    abilityName?: string,
    params: { costs?: CardModel[] } = {},
  ): MoveResponse {
    const ability = this.getActivatedAbility(abilityName);

    if (!ability || !activatedAbilityPredicate(ability.ability)) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Can't activate this card",
        message: `Ability not found`,
        icon: "warning",
        autoClear: true,
      });
    }

    this.rootStore.debug("Activating ability", ability.costs);
    //TODO: Add a check to see if player can pay the cost

    const payed = this.payCosts(ability.costs, params.costs);

    if (!payed) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Can't activate this card",
        message: `You can't pay activation costs, if you think this is a mistake you can enable manual mode and adjust the game state.`,
        icon: "warning",
        autoClear: true,
      });
    }

    this.rootStore.stackLayerStore.onActivateAbility(this, ability);
    return this.rootStore.moveResponse(true);
  }

  canBeChallenged(opponent: CardModel) {
    const isCharacter = this.type === "character";
    if (isCharacter && this.ready && !opponent.canChallengeReadyCharacters) {
      this.rootStore.debug("Can't challenge a ready glimmer");
      return false;
    }

    if (this.hasEvasive && !opponent.hasEvasive) {
      this.rootStore.debug(
        "Can't challenge an evasive glimmer, unless the attacker has evasive too",
      );
      return false;
    }
    // TODO: insert bodyguard check

    let result = true;

    // TODO: this can be optimized by using hasChallengeRestriction
    this.getAbilities([
      (ability: AbilityModel) => ability.isStaticAbility,
    ]).forEach((model) => {
      const ability = model.ability;
      if (!staticAbilityPredicate(ability)) {
        return;
      }

      ability.effects?.forEach((effect) => {
        if (
          protectionEffectPredicate(effect) &&
          effect.restriction === "challenge"
        ) {
          this.rootStore.debug(
            opponent.isValidTarget(effect.target.filters, this.ownerId),
          );
          result = !opponent.isValidTarget(effect.target.filters, this.ownerId);
        }
      });
    });

    return result;
  }

  canChallenge(opponent?: CardModel) {
    if (
      !opponent ||
      !this.ready ||
      (this.meta.playedThisTurn && !this.hasRush)
    ) {
      return false;
    }
    // TODO: insert bodyguard check

    return opponent.canBeChallenged(this);
  }

  get damageReduction() {
    const model = this.getStaticAbility("resist");
    const ability = model?.ability;

    if (resistAbilityPredicate(ability)) {
      return ability.value;
    }

    return 0;
  }

  get hasChallengeRestriction() {
    return this.rootStore.effectStore.hasChallengeRestriction(this);
  }

  get canChallengeReadyCharacters() {
    const filters = [
      (abilityModel: AbilityModel) => {
        const ability = abilityModel.ability;

        return (
          staticAbilityPredicate(ability) &&
          ability.ability === "challenge-ready-chars"
        );
      },
    ];

    return this.getAbilities([]).some((model) => {
      const ability = model.ability;
      return (
        ability.type === "static" && ability.ability === "challenge-ready-chars"
      );
    });
  }

  challenge(defender: CardModel): MoveResponse {
    if (this.hasChallengeRestriction) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Glimmer can't challenge",
        message: `You can use manual mode to simulate a quest`,
        icon: "warning",
        autoClear: true,
      });
    }

    if (defender.hasEvasive && !this.hasEvasive) {
      return this.rootStore.sendNotification({
        type: "icon",
        title:
          "Can't challenge an evasive glimmer, unless the attacker has evasive too",
        message: `You can instead use manual mode to simulate a challenge`,
        icon: "warning",
        autoClear: true,
      });
    }

    if (this.meta.playedThisTurn && !this.hasRush) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Can't challenge when the ink is fresh",
        message: `You can instead use manual mode to simulate a challenge`,
        icon: "warning",
        autoClear: true,
      });
    }

    if (!this.canChallenge(defender)) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Can't challenge this character",
        message: `You can instead use manual mode to simulate a challenge`,
        icon: "warning",
        autoClear: true,
      });
    }

    const playerId = this.ownerId;
    const defenderPlayer = defender.ownerId;
    const defenderBodyGuards = this.rootStore.cardStore.getCardsByFilter([
      { filter: "owner", value: defenderPlayer },
      { filter: "zone", value: "play" },
      { filter: "status", value: "exerted" },
      // TODO: This filter ignores gained abilities, this will cause bugs
      { filter: "ability", value: "bodyguard" },
    ]);

    if (
      defenderBodyGuards.length > 0 &&
      !defenderBodyGuards.find(
        (card) => card.instanceId === defender.instanceId,
      )
    ) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Can't challenge this character",
        message: `You can instead use manual mode to simulate a challenge`,
        icon: "warning",
        autoClear: true,
      });
    }

    this.updateCardMeta({
      exerted: true,
    });

    let attackerStrength = this.strength;
    // TODO: replace by challenger effect
    const challengerAbility = this.getAbilities([
      (ability) => ability.isChallengerAbility,
    ])[0]?.ability;

    if (challengerAbilityPredicate(challengerAbility)) {
      attackerStrength += challengerAbility.value;
    }

    let defenderStrength = defender.strength;
    const reverseChallengerAbility = defender.getAbilities([
      (ability) => ability.isReverseChallengerAbility,
    ])[0]?.ability;
    if (reverseChallengerAbilityPredicate(reverseChallengerAbility)) {
      defenderStrength += reverseChallengerAbility.value;
    }

    const attackerDamageTaken = this.damage + defenderStrength;
    const defenderDamageTaken = defender.damage + attackerStrength;

    this.updateCardDamage(defenderStrength, "add");
    defender.updateCardDamage(attackerStrength, "add");

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

    this.rootStore.tableStore.getTable(this.ownerId).turn.challenges.push({
      attacker: this,
      defender: defender,
    });

    return this.rootStore.log(
      createLogEntry(
        {
          type: "CHALLENGE",
          attacker: this.instanceId,
          defender: defender.instanceId,
          strength: {
            attacker: attackerStrength,
            defender: defenderStrength,
          },
          banish: {
            attacker: this.isDead,
            defender: defender.isDead,
          },
          // TODO: this is not considering RESIST.
          damage: {
            attacker: attackerDamageTaken,
            defender: defenderDamageTaken,
          },
          // life: {
          //   attacker: this.meta.damage,
          //   defender: defender.meta.damage,
          // },
        },
        playerId,
      ),
    );
  }

  get type() {
    return this.lorcanitoCard.type;
  }

  get damage() {
    return this.meta.damage || 0;
  }

  // This function skips resist, please use updateCardDamage instead
  set damage(value: number) {
    this.updateCardMeta({
      damage: value,
    });
  }

  updateCardDamage(
    amount: number,
    type: "add" | "remove" = "add",
  ): MoveResponse {
    const characterCardsInPlay = this.rootStore.cardStore.characterCardsInPlay;
    // TODO: If many characters have protector, this will only trigger the first one
    const protector = characterCardsInPlay.find(
      (card) =>
        card.ownerId === this.ownerId &&
        card.instanceId !== this.instanceId &&
        card.hasProtector,
    );

    if (protector && type === "add") {
      const moveResponse = protector.updateCardDamage(amount, type);

      if (protector.isDead) {
        protector.moveTo("discard");
      }

      return moveResponse;
    }

    const currentDamage = this?.meta?.damage || 0;

    if (type === "add" && this.hasResist) {
      amount = amount - this.damageReduction;
    }

    let damage: number =
      type === "add" ? currentDamage + amount : currentDamage - amount;

    if (damage < 0) {
      this.rootStore.debug("Damage can't be negative");
      damage = 0;
    }

    this.updateCardMeta({
      damage,
    });

    if (damage > currentDamage) {
      this.rootStore.triggeredStore.onDamage(this);
    }

    if (damage < currentDamage) {
      this.rootStore.triggeredStore.onHeal(this);
    }

    return this.rootStore.log({
      type: "DAMAGE_CHANGE",
      instanceId: this.instanceId,
      // amount,
      to: damage,
      from: currentDamage,
    });
  }

  get hasExertRestriction() {
    const exertRestriction =
      this.rootStore.continuousEffectStore.getExertRestriction(this);

    return exertRestriction.length > 0;
  }

  canEnterLocation(location: CardModel) {
    if (location.zone !== "play" || location.type !== "location") {
      return false;
    }

    if (this.zone !== "play" || this.type !== "character") {
      return false;
    }

    if (this.isAtLocation(location)) {
      return false;
    }

    const moveCost = location.lorcanitoCard.moveCost;
    if (moveCost && !this.canPayCosts([{ type: "ink", amount: moveCost }])) {
      return false;
    }

    return true;
  }

  //Once a character enters a location, they cannot leave the location, unless it is to enter another location.
  private leaveLocation() {
    const currentLocation = this.meta.location;
    const locationChars = currentLocation?.meta.characters;

    this.updateCardMeta({ location: undefined });
    currentLocation?.updateCardMeta({
      characters: locationChars?.filter((card) => !card.isCard(this)),
    });
  }

  enterLocation(location: CardModel) {
    if (!this.canEnterLocation(location)) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Can't enter location",
        message: "This card can't enter this location",
        icon: "warning",
        autoClear: true,
      });
    }

    const cost = location.lorcanitoCard.moveCost;
    const payed = this.payCosts([{ type: "ink", amount: cost || 99 }]);

    if (payed) {
      this.leaveLocation();

      this.updateCardMeta({ location: location });

      if (location.meta.characters) {
        // TODO: This is breaking encapsulation
        location.meta.characters.push(this);
      } else {
        location.updateCardMeta({ characters: [this] });
      }
    }

    this.rootStore.triggeredStore.onEnterLocation(this, location);

    return this.rootStore.log({
      type: "ENTER_LOCATION",
      character: this.instanceId,
      location: location.instanceId,
    });
  }

  isAtLocation(location: CardModel) {
    return location.isCard(this.meta.location);
  }

  containsCharacter(character: CardModel) {
    const characters = this.meta.characters;

    if (!characters) {
      return false;
    }

    return characters.some((card) => card.isCard(character));
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
    const json = {
      instanceId: this.instanceId,
      cardId: this.cardId,
      ownerId: this.ownerId,
      meta: this.meta.toJSON(),
    };

    if (!json.meta) {
      delete json.meta;
    }

    return json;
  }
}
