import type { StaticTriggeredAbilityModel } from "@lorcanito/engine/store/models/StaticTriggeredAbilityModel";
import type { CardModel } from "@lorcanito/engine/store/models/CardModel";
import { DelayedTriggeredAbilityModel } from "@lorcanito/engine/store/models/DelayedTriggeredAbilityModel";
import { EffectTargets } from "@lorcanito/engine/rules/effects/effectTargets";

export function isValidTarget(
  card: CardModel,
  target: EffectTargets,
  source?: CardModel,
) {
  if ("excludeSelf" in target && target.excludeSelf) {
    if (card.instanceId === source?.instanceId) {
      return false;
    }
  }

  if ("filters" in target) {
    return card.isValidTarget(target.filters, source?.ownerId, source);
  }

  return false;
}

export function isValidAbilityTriggerTarget(
  ability: StaticTriggeredAbilityModel | DelayedTriggeredAbilityModel,
  target: CardModel,
  expectedOwner: string,
  source?: CardModel,
) {
  const trigger = ability.trigger;

  if ("exclude" in trigger && trigger.exclude === "source") {
    if (target.instanceId === source?.instanceId) {
      return false;
    }
  }

  if ("filters" in trigger && trigger.filters) {
    return isValidTarget(
      target,
      { type: "card", filters: trigger.filters, value: 1 },
      source,
    );
  }

  if (
    "target" in trigger &&
    "filters" in trigger.target &&
    trigger.target.filters
  ) {
    return isValidTarget(target, trigger.target, source);
  }

  return true;
}
