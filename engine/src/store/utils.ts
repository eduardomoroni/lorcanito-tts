import {
  Ability,
  bodyguardAbility,
  challengerAbility,
  challengeReadyCharacters,
  evasiveAbility,
  protectorAbility,
  recklessAbility,
  resistAbility,
  rushAbility,
  supportAbility,
  voicelessAbility,
  wardAbility,
} from "@lorcanito/engine/rules/abilities/abilities";
import { exhaustiveCheck } from "@lorcanito/engine/lib/exhaustiveCheck";
import type { ContinuousEffectModel } from "@lorcanito/engine/store/models/ContinuousEffectModel";
import {
  bodyguardAbilityPredicate,
  challengerAbilityPredicate,
  evasiveAbilityPredicate,
  protectorAbilityPredicate,
  recklessAbilityPredicate,
  resistAbilityPredicate,
  rushAbilityPredicate,
  shiftAbilityPredicate,
  singerAbilityPredicate,
  supportAbilityPredicate,
  voicelessAbilityPredicate,
  wardAbilityPredicate,
} from "@lorcanito/engine/rules/abilities/abilityTypeGuards";
import { AbilityEffect } from "@lorcanito/engine/rules/effects/effectTypes";

export const mapContinuousEffectToAbility = (
  element: ContinuousEffectModel,
) => {
  const effect = element.effect.effect;

  if (effect.type !== "ability") {
    return;
  }

  switch (effect.ability) {
    case "singer": {
      console.error("Not implemented: ", effect.ability);
      break;
    }
    case "shift": {
      console.error("Not implemented: ", effect.ability);
      break;
    }
    case "custom": {
      if ("customAbility" in effect) {
        return effect.customAbility;
      }

      console.error("Not implemented: ", effect.ability);
      break;
    }
    case "challenger": {
      if ("amount" in effect && typeof effect.amount === "number") {
        const { amount } = effect;
        return challengerAbility(amount);
      }
      console.error("Not implemented: ", effect.ability);
      break;
    }
    case "resist": {
      if ("amount" in effect && typeof effect.amount === "number") {
        const { amount } = effect;
        return resistAbility(amount);
      }

      console.error("Not implemented: ", effect.ability);
      break;
    }
    case "bodyguard": {
      return bodyguardAbility;
    }
    case "rush": {
      return rushAbility;
    }
    case "reckless": {
      return recklessAbility;
    }
    case "evasive": {
      return evasiveAbility;
    }
    case "support": {
      return supportAbility;
    }
    case "ward": {
      return wardAbility;
    }
    case "voiceless": {
      return voicelessAbility;
    }
    case "challenge_ready_chars": {
      return challengeReadyCharacters;
    }
    case "protector": {
      return protectorAbility;
    }
    default: {
      exhaustiveCheck(effect.ability);
    }
  }

  return;
};

export const keywordToAbilityPredicate = (
  keyword: AbilityEffect["ability"],
): ((ability: Ability) => boolean) => {
  let predicate = (ability: Ability) => false;

  switch (keyword) {
    case "bodyguard": {
      predicate = bodyguardAbilityPredicate;
      break;
    }
    case "challenger": {
      predicate = challengerAbilityPredicate;
      break;
    }
    case "rush": {
      predicate = rushAbilityPredicate;
      break;
    }
    case "reckless": {
      predicate = recklessAbilityPredicate;
      break;
    }
    case "evasive": {
      predicate = evasiveAbilityPredicate;
      break;
    }
    case "support": {
      predicate = supportAbilityPredicate;
      break;
    }
    case "ward": {
      predicate = wardAbilityPredicate;
      break;
    }
    case "singer": {
      predicate = singerAbilityPredicate;
      break;
    }
    case "shift": {
      predicate = shiftAbilityPredicate;
      break;
    }
    case "voiceless": {
      predicate = voicelessAbilityPredicate;
      break;
    }
    case "resist": {
      predicate = resistAbilityPredicate;
      break;
    }
    case "protector": {
      predicate = protectorAbilityPredicate;
      break;
    }
    case "challenge_ready_chars": {
      console.error("Not implemented: ", keyword);
      predicate = () => false;
      break;
    }
    case "custom": {
      console.error("Not implemented: ", keyword);
      predicate = () => false;
      break;
    }
    default: {
      exhaustiveCheck(keyword);
    }
  }

  return predicate;
};
