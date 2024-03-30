import type { Ability } from "@lorcanito/engine/rules/abilities/abilities";
import type { Characteristics } from "@lorcanito/engine/cards/characteristics";

export type CardColor =
  | "amber"
  | "amethyst"
  | "emerald"
  | "ruby"
  | "sapphire"
  | "steel";

type CardRarity = "common" | "uncommon" | "rare" | "super_rare" | "legendary";

export type LorcanitoCard =
  | LorcanitoLocationCard
  | LorcanitoCharacterCard
  | LorcanitoActionCard
  | LorcanitoItemCard;

interface LorcanitoBaseCard {
  type: "character" | "item" | "action" | "location";
  implemented?: boolean;
  id: string;
  name: string;
  url: string;
  alternativeUrl?: string;
  text?: string;
  flavour?: string;
  language: string;
  set: "TFC" | "ROF" | "ITI";
  cost: number;
  color: CardColor;
  number: number;
  illustrator: string;
  // TODO: I think we can remove this
  keywords?: Record<string, unknown>;
  inkwell?: boolean;
  characteristics: Array<Characteristics>;
  abilities?: Ability[];
  rarity: CardRarity;
  // Adding this for simplicity
  strength?: number;
  lore?: number;
  willpower?: number;
  title?: string;
  moveCost?: number;
}

export interface LorcanitoLocationCard extends LorcanitoBaseCard {
  type: "location";
  title: string;
  lore: number;
  moveCost: number;
  willpower: number;
}

export interface LorcanitoCharacterCard extends LorcanitoBaseCard {
  type: "character";
  title: string;
  lore: number;
  strength: number;
  willpower: number;
}

export interface LorcanitoActionCard extends LorcanitoBaseCard {
  type: "action";
  text: string;
}

export interface LorcanitoItemCard extends LorcanitoBaseCard {
  type: "item";
  text: string;
}
