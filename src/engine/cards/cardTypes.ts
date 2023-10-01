import { Ability } from "~/engine/rules/abilities/abilities";

export type CardColor =
  | "amber"
  | "amethyst"
  | "emerald"
  | "ruby"
  | "sapphire"
  | "steel";

export type Characteristics =
  | "song"
  | "action"
  | "item"
  | "villain"
  | "dragon"
  | "tigger"
  | "pirate"
  | "detective"
  | "sorcerer"
  | "queen"
  | "alien"
  | "king"
  | "mentor"
  | "inventor"
  | "fairy"
  | "captain"
  | "hero"
  | "prince"
  | "storyborn"
  | "floodborn"
  | "dreamborn"
  | "broom"
  | "ally"
  | "princess"
  | "musketeer"
  | "deity";

type CardRarity = "common" | "uncommon" | "rare" | "super_rare" | "legendary";

export type LorcanitoCard =
  | LorcanitoCharacterCard
  | LorcanitoActionCard
  | LorcanitoItemCard;

interface LorcanitoBaseCard {
  type: "character" | "item" | "action";
  implemented?: boolean;
  id: string;
  name: string;
  url: string;
  alternativeUrl: string;
  text?: string;
  flavour?: string;
  language: string;
  set: string;
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
