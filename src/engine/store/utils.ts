import {
  bodyguardAbility,
  bodyguardAbilityPredicate,
  challengerAbilityPredicate,
  evasiveAbility,
  evasiveAbilityPredicate,
  recklessAbility,
  recklessAbilityPredicate,
  rushAbility,
  rushAbilityPredicate,
  shiftAbilityPredicate,
  singerAbilityPredicate,
  supportAbility,
  supportAbilityPredicate,
  voicelessAbility,
  voicelessAbilityPredicate,
  wardAbility,
  wardAbilityPredicate,
} from "~/engine/rules/abilities/abilities";
import { exhaustiveCheck } from "~/libs/exhaustiveCheck";
import { Abilities } from "~/spaces/components/modals/target/filters";
import type { ContinuousEffectModel } from "~/engine/store/models/ContinuousEffectModel";

export const mapContinuousEffectToAbility = (
  element: ContinuousEffectModel,
) => {
  const effect = element.effect;

  if (effect.type !== "ability") {
    return;
  }

  switch (effect.ability) {
    case "challenger": {
      console.error("Not implemented: ", effect.ability);
      break;
    }
    case "singer": {
      console.error("Not implemented: ", effect.ability);
      break;
    }
    case "shift": {
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
    default: {
      exhaustiveCheck(effect.ability);
    }
  }

  return;
};

export const keywordToAbilityPredicate = (keyword: Abilities) => {
  let predicate = () => false;

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
    default: {
      exhaustiveCheck(keyword);
    }
  }

  return predicate;
};
