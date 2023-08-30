import type { TargetFilter } from "~/components/modals/target/filters";

export type LorcanitoCard = {
  id: string;
  name: string;
  title?: string;
  url: string;
  text?: string;
  flavour?: string;
  language: string;
  set: string;
  cost: number;
  type: "character" | "item" | "action";
  color: "amber" | "amethyst" | "emerald" | "ruby" | "sapphire" | "steel";
  number: number;
  illustrator?: string;
  keywords?: Record<string, unknown>;
  lore?: number;
  strength?: number;
  willpower?: number;
  inkwell?: boolean;
  characteristics: Array<string>;
  // TODO: This can only be fixed once we implement all abilities
  abilities?: Ability[] | BaseAbility[];
  rarity?: string;
  alternativeUrl?: string;
};

type AbilityTypes = "singer" | "shift" | "challenger" | "bodyguard";
interface BaseAbility {
  // TODO: Remove `string` once we implement all abilities
  ability: AbilityTypes | string;
  // Following https://storage.googleapis.com/fabmaster/media/documents/FaB_Comprehensive_Rules_v2.1.0_access.pdf
  // as lorcana doesn't have a rules document
  type?: "static" | "resolution";
  text?: string;
}

export interface SingerAbility extends BaseAbility {
  ability: "singer";
  type: "static";
  value: number;
}

export interface ShiftAbility extends BaseAbility {
  ability: "shift";
  type: "static";
  shift: number;
}

export interface ChallengerAbility extends BaseAbility {
  ability: "challenger";
  type: "static";
  value: number;
}

export interface BodyGuardAbility extends BaseAbility {
  ability: "bodyguard";
  type: "static";
}

export interface ResolutionAbility extends BaseAbility {
  type: "resolution";
  name: string;
  effect: "shuffle";
  targets: number;
  filters: TargetFilter[];
  optional?: boolean;
}

export type Ability =
  | ResolutionAbility
  | SingerAbility
  | ShiftAbility
  | ChallengerAbility
  | BodyGuardAbility;

export const challengerAbilityPredicate = (
  ability?: Ability | BaseAbility
): ability is ChallengerAbility => ability?.ability === "challenger";

export const singerAbilityPredicate = (
  ability?: Ability | BaseAbility
): ability is SingerAbility => ability?.ability === "singer";

export const shiftAbilityPredicate = (
  ability?: Ability | BaseAbility | undefined
): ability is ShiftAbility => {
  return ability?.ability === "shift";
};

export const bodyguardAbilityPredicate = (
  ability?: Ability | BaseAbility
): ability is BodyGuardAbility => ability?.ability === "bodyguard";

export const resolutionAbilityPredicate = (
  ability?: Ability | BaseAbility
): ability is ResolutionAbility => ability?.type === "resolution";
