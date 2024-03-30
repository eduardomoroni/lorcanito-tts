import { makeAutoObservable, toJS } from "mobx";
import { exhaustiveCheck } from "@lorcanito/engine/lib/exhaustiveCheck";
import { StaticTriggeredAbilityModel } from "@lorcanito/engine/store/models/StaticTriggeredAbilityModel";
import { DelayedTriggeredAbilityModel } from "@lorcanito/engine/store/models/DelayedTriggeredAbilityModel";
import {
  delayedTriggeredAbilityPredicate,
  staticTriggeredAbilityPredicate,
} from "@lorcanito/engine/rules/abilities/abilityTypeGuards";

import type {
  Ability,
  DelayedTriggeredAbility,
  StaticTriggeredAbility,
  Trigger,
} from "@lorcanito/engine/rules/abilities/abilities";
import type { Game, Zones } from "@lorcanito/engine/types";
import type { TargetFilter } from "@lorcanito/engine/filter/targetFilter";
import type { MobXRootStore } from "@lorcanito/engine/store/RootStore";
import type { CardModel } from "@lorcanito/engine/store/models/CardModel";

const onEndOfTurnPredicate = (
  ability?: Ability,
): ability is StaticTriggeredAbility =>
  staticTriggeredAbilityPredicate(ability) && ability.trigger.on === "end_turn";

const startOfTurnPredicate = (
  ability?: Ability,
): ability is StaticTriggeredAbility =>
  staticTriggeredAbilityPredicate(ability) &&
  ability.trigger.on === "start_turn";

function getTriggerPredicate(trigger: Trigger["on"]) {
  let predicate = (ability: { trigger: Trigger }) => {
    return false;
  };

  switch (trigger) {
    case "discard": {
      predicate = (ability: { trigger: Trigger }) => {
        return ability.trigger.on === "discard";
      };
      break;
    }
    case "quest": {
      predicate = (ability: { trigger: Trigger }) => {
        return ability.trigger.on === "quest";
      };
      break;
    }
    case "play": {
      predicate = (ability: { trigger: Trigger }) => {
        return ability.trigger.on === "play";
      };
      break;
    }
    case "banish": {
      predicate = (ability: { trigger: Trigger }) => {
        return ability.trigger.on === "banish";
      };
      break;
    }
    case "banish-another": {
      predicate = (ability: { trigger: Trigger }) => {
        return ability.trigger.on === "banish-another";
      };
      break;
    }
    case "challenge": {
      predicate = (ability: { trigger: Trigger }) => {
        return ability.trigger.on === "challenge";
      };
      break;
    }
    case "leave": {
      predicate = (ability: { trigger: Trigger }) => {
        return ability.trigger.on === "leave";
      };
      break;
    }
    case "ready": {
      predicate = (ability: { trigger: Trigger }) => {
        return ability.trigger.on === "ready";
      };
      break;
    }
    case "start_turn": {
      predicate = (ability: { trigger: Trigger }) => {
        return ability.trigger.on === "start_turn";
      };
      break;
    }
    case "end_turn": {
      predicate = (ability: { trigger: Trigger }) => {
        return ability.trigger.on === "end_turn";
      };
      break;
    }
    case "damage": {
      predicate = (ability: { trigger: Trigger }) => {
        return ability.trigger.on === "damage";
      };
      break;
    }
    case "heal": {
      predicate = (ability: { trigger: Trigger }) => {
        return ability.trigger.on === "heal";
      };
      break;
    }
    case "moves-to-a-location": {
        predicate = (ability: { trigger: Trigger }) => {
            return ability.trigger.on === "moves-to-a-location";
        };
        break;
    }
    default: {
      exhaustiveCheck(trigger);
      return predicate;
    }
  }

  return predicate;
}

export class StaticTriggeredStore {
  private readonly rootStore: MobXRootStore;
  private readonly observable: boolean;

  delayedTriggeredAbilities: Array<DelayedTriggeredAbilityModel> = [];

  constructor(rootStore: MobXRootStore, observable: boolean) {
    if (observable) {
      makeAutoObservable<StaticTriggeredStore, "rootStore">(this, {
        rootStore: false,
      });
    }

    this.observable = observable;
    this.rootStore = rootStore;
  }

  sync(triggeredAbilities: DelayedTriggeredAbility[]) {}

  toJSON(): Game["triggeredAbilities"] {
    return toJS(
      this.delayedTriggeredAbilities.map((effect) => effect.toJSON()),
    );
  }

  private createTriggerModels(
    cardTrigger: CardModel,
    trigger: Trigger["on"],
  ): StaticTriggeredAbilityModel[] {
    const triggers: StaticTriggeredAbilityModel[] = [];

    // TODO: this might not be performant, revisit
    const cardsByFilter = this.rootStore.cardStore.getCardsByFilter([
      { filter: "type", value: ["character", "item"] },
      { filter: "zone", value: ["play"] },
    ]);

    if (trigger === "banish") {
      cardsByFilter.push(cardTrigger);
    }

    cardsByFilter.map((card) => {
      card
        .getAbilities([
          (model) =>
            model.isStaticTriggeredAbility &&
            staticTriggeredAbilityPredicate(model.ability),
        ])
        .forEach((model) => {
          const staticTriggeredAbilityModel = new StaticTriggeredAbilityModel(
            model,
            card,
            cardTrigger,
            this.rootStore,
            this.observable,
          );
          triggers.push(staticTriggeredAbilityModel);
        });
    });

    return triggers;
  }

  private getTriggers(
    trigger: Trigger["on"],
    cardTriggered: CardModel,
  ): (StaticTriggeredAbilityModel | DelayedTriggeredAbilityModel)[] {
    const predicate = getTriggerPredicate(trigger);

    const delayedTriggers = this.delayedTriggeredAbilities.filter(predicate);
    const staticTriggers = this.createTriggerModels(
      cardTriggered,
      trigger,
    ).filter(predicate);

    return [...staticTriggers, ...delayedTriggers];
  }

  private trigger(
    trigger: Trigger["on"],
    card: CardModel,
    params: {
      attacker?: CardModel;
      defender?: CardModel;
      location?: CardModel;
    } = {},
  ) {
    this.getTriggers(trigger, card)
      .filter((ability) => {
        if (ability.trigger.on === "challenge") {
          return ability.isValidTriggerTarget(
            ability.trigger.as === "attacker"
              ? params.attacker
              : params.defender,
          );
        }

        return ability.isValidTriggerTarget(card);
      })
      .forEach((ability) => {
        if (ability.trigger.on === trigger) {
          ability.activate(card, params);
        }
      });
  }

  onPlay(card: CardModel) {
    this.trigger("play", card);

    // If a card containing a delayed triggered ability is played, start the effect
    card
      .nativeAbilities([
        (model) => delayedTriggeredAbilityPredicate(model.ability),
      ])
      .forEach((model) => {
        const ability = model.ability;
        if (delayedTriggeredAbilityPredicate(ability)) {
          this.startDelayedEffect(ability, card);
        }
      });
  }

  onBanish(
    banishedCard: CardModel,
    params: { attacker?: CardModel; defender?: CardModel } = {},
  ) {
    this.trigger("banish", banishedCard, params);
    this.trigger("banish-another", banishedCard, params);
  }

  onChallenge(attacker: CardModel, defender: CardModel) {
    this.trigger("challenge", defender, { attacker, defender });
  }

  onEnterLocation(character: CardModel, location: CardModel) {
    this.trigger("moves-to-a-location", character, { location });
  }

  onQuest(card: CardModel) {
    this.trigger("quest", card);
  }

  onDamage(trigger: CardModel) {
    this.trigger("damage", trigger);
  }

  onHeal(trigger: CardModel) {
    this.trigger("heal", trigger);
  }

  onDiscard(discarded: CardModel) {
    this.trigger("discard", discarded);
  }

  onReady(card: CardModel) {
    this.trigger("ready", card);
  }

  onLeavePlay(trigger: CardModel, destination: Zones) {
    this.trigger("leave", trigger);
  }

  onEndOfTurn(playerId: string) {
    const charsInPlay: TargetFilter[] = [
      { filter: "zone", value: ["play"] },
      { filter: "type", value: ["character", "item"] },
      { filter: "owner", value: playerId },
    ];

    const cardsWithEndOfTurnTrigger = this.rootStore.cardStore
      .getCardsByFilter(charsInPlay, playerId)
      .filter(
        (card) =>
          card.getAbilities([(model) => onEndOfTurnPredicate(model.ability)])
            .length > 0,
      );

    cardsWithEndOfTurnTrigger.forEach((card) =>
      card
        .getAbilities([(model) => onEndOfTurnPredicate(model.ability)])
        .forEach((triggerAbilityModel) => {
          const triggerAbility = triggerAbilityModel.ability;

          if (!staticTriggeredAbilityPredicate(triggerAbility)) {
            return;
          }

          const model = new StaticTriggeredAbilityModel(
            triggerAbilityModel,
            card,
            card,
            this.rootStore,
            this.observable,
          );

          model.activate(card);
        }),
    );
  }

  onStartOfTurn(playerId: string) {
    const charsInPlay: TargetFilter[] = [
      { filter: "zone", value: ["play"] },
      { filter: "type", value: "character" },
      { filter: "owner", value: playerId },
    ];

    const cardsWithStartOfTurnTriggers = this.rootStore.cardStore
      .getCardsByFilter(charsInPlay, playerId)
      .filter(
        (card) =>
          card
            .getAbilities([(model) => startOfTurnPredicate(model.ability)])
            .filter((model) => startOfTurnPredicate(model.ability)).length > 0,
      );

    cardsWithStartOfTurnTriggers.forEach((card) =>
      card
        .getAbilities([(model) => startOfTurnPredicate(model.ability)])
        .forEach((triggerModel) => {
          const trigger = triggerModel.ability;

          if (!staticTriggeredAbilityPredicate(trigger)) {
            return;
          }

          const model = new StaticTriggeredAbilityModel(
            triggerModel,
            card,
            card,
            this.rootStore,
            this.observable,
          );

          model.activate(card);
        }),
    );
  }

  startDelayedEffect(ability: DelayedTriggeredAbility, source: CardModel) {
    let duration = ability.duration;

    if (typeof duration === "string") {
      duration =
        ability.duration === "turn"
          ? this.rootStore.turnCount
          : this.rootStore.turnCount + 1;
    }

    this.delayedTriggeredAbilities.push(
      new DelayedTriggeredAbilityModel(
        `${this.delayedTriggeredAbilities.length + 1}-${source.instanceId}-${
          ability.name
        }`,
        ability,
        source,
        duration,
        this.rootStore,
        this.observable,
      ),
    );
  }

  stopDelayedEffect(abilityModel: DelayedTriggeredAbilityModel) {
    const effects = this.delayedTriggeredAbilities || [];
    const index = effects.findIndex(
      (element) => element.id === abilityModel.id,
    );
    if (index !== -1) {
      effects.splice(index, 1);
    }
  }

  onTurnPassed(turn: number) {
    this.delayedTriggeredAbilities.forEach((effect) => {
      if (effect.duration !== undefined && effect.duration < turn) {
        this.stopDelayedEffect(effect);
      }
    });
  }
}
