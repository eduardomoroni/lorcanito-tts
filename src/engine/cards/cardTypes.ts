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
  | "villain"
  | "hero"
  | "storyborn"
  | "floodborn"
  | "dreamborn"
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
  implemented?: boolean;
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
  color: CardColor;
  number: number;
  illustrator?: string;
  keywords?: Record<string, unknown>;
  lore?: number;
  strength?: number;
  willpower?: number;
  inkwell?: boolean;
  characteristics?: Array<string>;
  abilities?: Ability[];
  rarity?: CardRarity;
  alternativeUrl?: string;
}

export interface LorcanitoCharacterCard extends LorcanitoBaseCard {
  type: "character";
  id: string;
  name: string;
  title?: string;
  url: string;
  text?: string;
  flavour?: string;
  language: string;
  set: string;
  illustrator?: string;
  keywords?: Record<string, unknown>;
  lore: number;
  strength?: number;
  willpower?: number;
  inkwell?: boolean;
  characteristics?: Array<string>;
  rarity?: CardRarity;
  alternativeUrl?: string;
}

export interface LorcanitoActionCard extends LorcanitoBaseCard {
  type: "action";
  title?: never;
  lore?: never;
  strength?: never;
  willpower?: never;
  inkwell?: boolean;
  text: string;
}

export interface LorcanitoItemCard extends LorcanitoBaseCard {
  type: "item";
  id: string;
  url: string;
  alternativeUrl: string;
  name: string;
  text: string;
  flavour?: string;
  language: string;
  set: string;
  cost: number;
  color: CardColor;
  number: number;
  illustrator: string;
  inkwell?: boolean;
  rarity: CardRarity;
}
