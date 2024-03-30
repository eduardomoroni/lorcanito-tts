import {
  AbilityEffect,
  BanishEffect,
  DamageEffect,
  HealEffect,
  LoreEffect,
} from "@lorcanito/engine/rules/effects/effectTypes";
import type { LorcanitoActionCard } from "@lorcanito/engine/cards/cardTypes";
import {
  atTheEndOfYourTurn,
  DelayedTriggeredAbility,
  ResolutionAbility,
  StaticTriggeredAbility,
  type Trigger,
} from "@lorcanito/engine/rules/abilities/abilities";
import type { RestrictionEffect } from "@lorcanito/engine/rules/effects/effectTypes";
import type { CardEffectTarget } from "@lorcanito/engine/rules/effects/effectTargets";
import type {
  AttributeEffect,
  DrawEffect,
  ReplacementEffect,
} from "@lorcanito/engine/rules/effects/effectTypes";
import type { PlayerEffectTarget } from "@lorcanito/engine/rules/effects/effectTargets";
import { readyAndCantQuest } from "@lorcanito/engine/rules/abilities/abilities";

const targetTriggerCard: CardEffectTarget = {
  type: "card",
  value: "all",
  filters: [{ filter: "source", value: "trigger" }],
};

const banishSelf: BanishEffect = {
  type: "banish",
  target: targetTriggerCard,
};

const atEndOfTurnBanishItself: StaticTriggeredAbility = atTheEndOfYourTurn({
  effects: [banishSelf],
  target: targetTriggerCard,
});

const self: PlayerEffectTarget = {
  type: "player",
  value: "self",
};
const opponent: PlayerEffectTarget = {
  type: "player",
  value: "opponent",
};
const drawACard: DrawEffect = {
  type: "draw",
  amount: 1,
  target: self,
};
const chosenItemOfYours: CardEffectTarget = {
  type: "card",
  value: 1,
  filters: [
    { filter: "zone", value: "play" },
    { filter: "type", value: "item" },
    { filter: "owner", value: "self" },
  ],
};
const chosenVillainOfYours: CardEffectTarget = {
  type: "card",
  value: 1,
  filters: [
    { filter: "zone", value: "play" },
    { filter: "type", value: "character" },
    { filter: "owner", value: "self" },
    { filter: "characteristics", value: ["villain"] },
  ],
};
const chosenCharacterOfYour: CardEffectTarget = {
  type: "card",
  value: 1,
  filters: [
    { filter: "zone", value: "play" },
    { filter: "type", value: "character" },
    { filter: "owner", value: "self" },
  ],
};
const chosenCharacter: CardEffectTarget = {
  type: "card",
  value: 1,
  filters: [
    { filter: "zone", value: "play" },
    { filter: "type", value: "character" },
  ],
};
const chosenDamagedCharacter: CardEffectTarget = {
  type: "card",
  value: 1,
  filters: [
    {
      filter: "status",
      value: "damage",
      comparison: { operator: "gte", value: 1 },
    },
    { filter: "type", value: "character" },
    { filter: "zone", value: "play" },
  ],
};
export const holdStill: LorcanitoActionCard = {
  id: "379d678ccb1b9d94feb1096ff28136222a795252",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/28.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/28_en_hold_still-716.webp",
  name: "Hold Still",
  characteristics: ["action"],
  text: "Remove up to 4 damage from chosen character.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      text: "Remove up to 4 damage from chosen character.",
      effects: [
        {
          type: "heal",
          amount: 4,
          target: chosenCharacter,
        } as HealEffect,
      ],
    },
  ],
  flavour: "“This might sting a little.”",
  inkwell: true,
  color: "amber",
  cost: 2,
  language: "EN",
  illustrator: "Connie Kang / Jackie Droujko",
  number: 28,
  set: "ROF",
  rarity: "common",
};
export const lastStand: LorcanitoActionCard = {
  id: "4ebeb26abede40f3cd479bf23398678f7eeb94f0",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/029.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/29_en_last_stand-716.webp",
  name: "Last Stand",
  characteristics: ["action"],
  text: "Banish chosen character who was challenged this turn.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      text: "Banish chosen character who was challenged this turn.",
      effects: [
        {
          type: "banish",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "zone", value: "play" },
              { filter: "type", value: "character" },
              { filter: "was-challenged" },
            ],
          },
        },
      ],
    },
  ],
  flavour: "“Let’s finish this, binturi.”\n–Namaari",
  color: "amber",
  cost: 2,
  language: "EN",
  illustrator: "Aisha Durmagambetova",
  number: 29,
  set: "ROF",
  rarity: "uncommon",
};

export const paintingTheRosesRed: LorcanitoActionCard = {
  id: "c1f63916c64e097a5a591a0246389b749575f309",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/30.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/30_en_painting_the_roses_red-716.webp",
  name: "Painting the Roses Red",
  characteristics: ["action", "song"],
  text: "_(A character with cost 2 or more can ↷ to sing this song for free.)_\n\nUp to 2 chosen characters get -1 ※ this turn. Draw a card.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Painting the Roses Red",
      text: "Up to 2 chosen characters get -1 ※ this turn. Draw a card.",
      detrimental: true,
      effects: [
        {
          type: "attribute",
          attribute: "strength",
          amount: 1,
          modifier: "subtract",
          target: {
            type: "card",
            value: 2,
            upTo: true,
            filters: [
              { filter: "type", value: "character" },
              { filter: "zone", value: "play" },
            ],
          },
        } as AttributeEffect,
        drawACard,
      ],
    } as ResolutionAbility,
  ],
  inkwell: true,
  color: "amber",
  cost: 2,
  language: "EN",
  illustrator: "Matt Chapman",
  number: 30,
  set: "ROF",
  rarity: "common",
};
export const worldsGreatestCriminalMind: LorcanitoActionCard = {
  id: "e4c083163e0c842bcf45ff82609024f0919c0e92",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/31.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/31_en_worlds_greatest_criminal_mind-716.webp",
  name: "World's Greatest Criminal Mind",
  characteristics: ["action", "song"],
  text: "_A character with cost 3 or more can ↷ to sing this song for free.)_\n\nBanish chosen character with 5 ※ or more.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "World's Greatest Criminal Mind",
      text: "Banish chosen character with 5 ※ or more.",
      effects: [
        {
          type: "banish",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "type", value: "character" },
              { filter: "zone", value: "play" },
              {
                filter: "attribute",
                value: "strength",
                comparison: { operator: "gte", value: 5 },
              },
            ],
          },
        } as BanishEffect,
      ],
    },
  ],
  inkwell: true,
  color: "amber",
  cost: 3,
  language: "EN",
  illustrator: "Giulia Riva",
  number: 31,
  set: "ROF",
  rarity: "rare",
};
export const zeroToHero: LorcanitoActionCard = {
  id: "0b2669219f7e9b35f4b810c23f83a817fcfe9f6c",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/32.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/32_en_zero_to_hero-716.webp",
  name: "Zero To Hero",
  characteristics: ["action", "song"],
  text: "_A character with cost 2 or more can ↷ to sing this song for free.)_\n\nCount the number of characters you have in play. You pay that amount of ⬡ less for the next character you play this turn.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      optional: false,
      effects: [
        {
          type: "replacement",
          replacement: "cost",
          duration: "next",
          amount: {
            dynamic: true,
            filters: [
              { filter: "type", value: "character" },
              { filter: "zone", value: "play" },
              { filter: "owner", value: "self" },
            ],
          },
          target: {
            type: "card",
            value: "all",
            filters: [{ filter: "type", value: "character" }],
          },
        } as ReplacementEffect,
      ],
    },
  ],
  color: "amber",
  cost: 2,
  language: "EN",
  illustrator: "Rob Di Salvo",
  number: 32,
  set: "ROF",
  rarity: "uncommon",
};
export const gruesomeAndGrim: LorcanitoActionCard = {
  id: "e9200318a3209d3e2f316efa34a85f75d681112b",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/62.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/62_en_gruesome_and_grim-716.webp",
  name: "Gruesome And Grim",
  characteristics: ["action", "song"],
  text: "_A character with cost 3 or more can ↷ to sing this song for free.)_\n\nPlay a character with cost 4 or less for free. They gain **Rush**. At the end of the turn, banish them. _(They can challenge the turn they're played.)_",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Gruesome And Grim",
      text: "Play a character with cost 4 or less for free. They gain **Rush**. At the end of the turn, banish them.",
      effects: [
        {
          type: "ability",
          ability: "custom",
          modifier: "add",
          duration: "turn",
          customAbility: atEndOfTurnBanishItself,
          target: {
            type: "card",
            value: "all",
            filters: [{ filter: "source", value: "target" }],
          },
        } as AbilityEffect,
        {
          type: "ability",
          ability: "rush",
          modifier: "add",
          duration: "turn",
          target: {
            type: "card",
            value: "all",
            filters: [{ filter: "source", value: "target" }],
          },
        } as AbilityEffect,
        {
          type: "play",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "owner", value: "self" },
              { filter: "zone", value: "hand" },
              { filter: "type", value: "character" },
              {
                filter: "attribute",
                value: "cost",
                comparison: { operator: "lte", value: 4 },
              },
            ],
          },
        },
      ],
    },
  ],
  color: "amethyst",
  cost: 3,
  language: "EN",
  illustrator: "Mariana Moreno",
  number: 62,
  set: "ROF",
  rarity: "rare",
};
export const imStuck: LorcanitoActionCard = {
  id: "28fff0270d9d27ada8cb0e8adbe37e915992a5c2",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/63.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/63_en_im_stuck-716.webp",
  name: "I'm Stuck!",
  characteristics: ["action"],
  text: "Chosen exerted character can't ready at the start of their next turn.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      text: "Chosen exerted character can't ready at the start of their next turn.",
      effects: [
        {
          type: "restriction",
          restriction: "exert",
          duration: "next_turn",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "status", value: "exerted" },
              { filter: "type", value: "character" },
              { filter: "zone", value: "play" },
            ],
          },
        } as RestrictionEffect,
      ],
    } as ResolutionAbility,
  ],
  flavour: "“Oh, bother−not again.”",
  inkwell: true,
  color: "amethyst",
  cost: 1,
  language: "EN",
  illustrator: "Rob Di Salve",
  number: 63,
  set: "ROF",
  rarity: "common",
};
export const legendOfTheSwordInTheStone: LorcanitoActionCard = {
  id: "01a3ecf0446f7ccd0d346c5e89a03054b4b30f5f",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/64.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/64_en_legend_of_the_sword_in_the_stone-716.webp",
  name: "Legend of the Sword in the Stone",
  characteristics: ["action", "song"],
  text: "_(A character with cost 2 or more can ↷ to sing this song for free.)_\n\nChosen character gains **Challenger** +3 this turn. _(They get +3 ※ while challenging.)_",
  type: "action",
  abilities: [
    {
      type: "resolution",
      effects: [
        {
          type: "ability",
          ability: "challenger",
          amount: 3,
          modifier: "add",
          duration: "turn",
          target: chosenCharacter,
        } as AbilityEffect,
      ],
    },
  ],
  flavour:
    "A legend is sung of when England was young \nAnd knights were brave and bold",
  inkwell: true,
  color: "amethyst",
  cost: 2,
  language: "EN",
  illustrator: "Kuya Jaypi",
  number: 64,
  set: "ROF",
  rarity: "common",
};
export const bibbidiBobbidiBoo: LorcanitoActionCard = {
  id: "fe4723c4e64a2ee03ab0e0a979092be5d0e74715",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/96.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/96_en_bibbidi_bobbidi_boo-716.webp",
  name: "Bibbidi Bobbidi Boo",
  characteristics: ["action", "song"],
  text: "_A character with cost 3 or more can ↷ to sing this song for free.)_\n\nReturn chosen character of yours to your hand to play another character with the same cost or less for free.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      optional: false,
      name: "Bibbidi Bobbidi Boo",
      text: "Return chosen character of yours to your hand to play another character with the same cost or less for free.",
      resolveEffectsIndividually: true,
      dependentEffects: true,
      effects: [
        {
          type: "play",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "type", value: "character" },
              { filter: "owner", value: "self" },
              { filter: "zone", value: "hand" },
            ],
          },
        },
        {
          type: "move",
          to: "hand",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "type", value: "character" },
              { filter: "zone", value: "play" },
              { filter: "owner", value: "self" },
            ],
          },
        },
      ],
    },
  ],
  flavour: "It'll do magic, believe it or not",
  color: "emerald",
  cost: 3,
  language: "EN",
  illustrator: "LadyShalirin",
  number: 96,
  set: "ROF",
  rarity: "rare",
};
export const bounce: LorcanitoActionCard = {
  id: "339d7f4e4320a90c2026d8e341a2d2cc0960b61b",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/97.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/97_en_bounce-716.webp",
  name: "Bounce",
  characteristics: ["action"],
  text: "Return chosen character of yours to your hand to return another chosen character to their player's hand.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      optional: false,
      resolveEffectsIndividually: true,
      dependentEffects: true,
      effects: [
        {
          type: "move",
          to: "hand",
          target: chosenCharacter,
        },
        {
          type: "move",
          to: "hand",
          target: chosenCharacterOfYour,
        },
      ],
    },
  ],
  flavour: "“Are you ready for some bouncing?”\n−Tigger",
  color: "emerald",
  cost: 2,
  language: "EN",
  illustrator: "Bill Robinson",
  number: 97,
  set: "ROF",
  rarity: "uncommon",
};
export const hypnotize: LorcanitoActionCard = {
  id: "c9c15e0fa9c9ca1c6216c4a0d708dd35fecdaaf5",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/98.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/98_en_hypnotize-716.webp",
  name: "Hypnotize",
  characteristics: ["action"],
  text: "Each opponent chooses and discards a card. Draw a card.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      optional: false,
      responder: "opponent",
      effects: [
        {
          type: "move",
          to: "discard",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "zone", value: "hand" },
              { filter: "owner", value: "self" },
            ],
          },
        },
        { type: "draw", amount: 1, target: opponent },
      ],
    },
  ],
  flavour: "“Look me in the eye when I’m speaking to you.”",
  inkwell: true,
  color: "emerald",
  cost: 3,
  language: "EN",
  illustrator: "Lauren Levering",
  number: 98,
  set: "ROF",
  rarity: "common",
};
export const improvise: LorcanitoActionCard = {
  id: "f8fc9a9a925fe2472466113ba7d47cdb07ac2dc3",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/99.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/99_en_improvise-716.webp",
  name: "Improvise",
  characteristics: ["action"],
  text: "Chosen character gets +1 ※ this turn. Draw a card.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Improvise",
      text: "Chosen character gets +1 ※ this turn. Draw a card.",
      effects: [
        {
          type: "attribute",
          attribute: "strength",
          amount: 1,
          modifier: "add",
          duration: "turn",
          target: chosenCharacter,
        },
        {
          type: "draw",
          amount: 1,
          target: self,
        },
      ],
    },
  ],
  flavour:
    "Shan-Yu: “It looks like you’re out of ideas.” \nMulan: “Not quite!”",
  inkwell: true,
  color: "emerald",
  cost: 1,
  language: "EN",
  illustrator: "Mane Kandalyan",
  number: 99,
  set: "ROF",
  rarity: "common",
};
export const packTactics: LorcanitoActionCard = {
  id: "64545a6a883909ed673e8221588f0ed3d2adac8e",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/100.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/100_en_pack_tactics-716.webp",
  name: "Pack Tactics",
  characteristics: ["action"],
  text: "Gain 1 lore for each damaged character opponents have in play.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      effects: [
        {
          type: "lore",
          modifier: "add",
          target: {
            type: "player",
            value: "self",
          },
          amount: {
            dynamic: true,
            amount: 1,
            filters: [
              { filter: "type", value: "character" },
              { filter: "zone", value: "play" },
              { filter: "owner", value: "opponent" },
              {
                filter: "status",
                value: "damage",
                comparison: { operator: "gte", value: 1 },
              },
            ],
          },
        } as LoreEffect,
      ],
    },
  ],
  flavour:
    "Pacha: “You want to survive the jungle? Start thinking like you belong here.” \nKuzco: “No problem . . . Grrr, look at me, I'm a jaguar.”",
  inkwell: true,
  color: "emerald",
  cost: 4,
  language: "EN",
  illustrator: "Don Aguillo",
  number: 100,
  set: "ROF",
  rarity: "rare",
};

export const ringTheBell: LorcanitoActionCard = {
  id: "f179f59df47f214939ea22078bb425a0a6a527a4",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/101.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/101_en_ring_the_bell-716.webp",
  name: "Ring The Bell",
  characteristics: ["action"],
  text: "Banish chosen damaged character.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      effects: [
        {
          type: "banish",
          target: chosenDamagedCharacter,
        },
      ],
    },
  ],
  flavour: "“I’m afraid that you’ve gone and upset me.“ \n– Ratigan",
  inkwell: true,
  color: "emerald",
  cost: 3,
  language: "EN",
  illustrator: "Brian Weisz",
  number: 101,
  set: "ROF",
  rarity: "uncommon",
};
export const goTheDistance: LorcanitoActionCard = {
  id: "d335cdea41df26e864982ab2b45eecd6804034ce",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/129.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/129_en_go_to_disnance-716.webp",
  name: "Go the Distance",
  characteristics: ["action", "song"],
  text: "_(A character with cost 2 or more can ↷ to sing this song for free.)_\n\nReady chosen damaged character of yours. They can't quest for the rest of this turn. Draw a card.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      effects: [
        ...readyAndCantQuest({
          type: "card",
          value: 1,
          filters: [
            { filter: "owner", value: "self" },
            { filter: "type", value: "character" },
            { filter: "zone", value: "play" },
            {
              filter: "status",
              value: "damage",
              comparison: { operator: "gte", value: 1 },
            },
          ],
        }),
        {
          type: "draw",
          amount: 1,
          target: self,
        },
      ],
    },
  ],
  inkwell: true,
  color: "ruby",
  cost: 2,
  language: "EN",
  illustrator: "Gaku Kumatori",
  number: 129,
  set: "ROF",
  rarity: "common",
};
export const teethAndAmbitions: LorcanitoActionCard = {
  id: "e7458213f8aca1f3e1d4a9e065c320292d1c0767",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/130.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/130_en_teeth_and_ambitions-716.webp",
  name: "Teeth and Ambitions",
  characteristics: ["action", "song"],
  text: "_A character with cost 2 or more can ↷ to sing this song for free.)_\n\nDeal 2 damage to chosen character of yours to deal 2 damage to another chosen character.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Deal 2 damage to chosen character of yours to deal 2 damage to another chosen character.",
      dependentEffects: true,
      resolveEffectsIndividually: true,
      effects: [
        {
          type: "damage",
          amount: 2,
          target: chosenCharacter,
        },
        {
          type: "damage",
          amount: 2,
          target: chosenCharacterOfYour,
        },
      ],
    },
  ],
  flavour:
    "Of course, quid pro quo, you’re expected \nTo take certain duties on board",
  inkwell: true,
  color: "ruby",
  cost: 2,
  language: "EN",
  illustrator: "Jake Parker",
  number: 130,
  set: "ROF",
  rarity: "rare",
};
export const theMostDiabolicalScheme: LorcanitoActionCard = {
  id: "325131aab212f3fa7c2de8b6154f23aa2729b547",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/131.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/131_en_the_most_diabolical_scheme-716.webp",
  name: "The Most Diabolical Scheme",
  characteristics: ["action", "song"],
  text: "_(A character with cost 3 or more can ↷ to sing this song for free.)_\n\nBanish chosen Villain of yours to banish chosen character.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      dependentEffects: true,
      resolveEffectsIndividually: true,
      effects: [
        {
          type: "banish",
          target: chosenCharacter,
        },
        {
          type: "banish",
          target: chosenVillainOfYours,
        },
      ],
    },
  ],
  flavour: "New comes the real tour de force \nTricky and wicked, of course",
  color: "ruby",
  cost: 3,
  language: "EN",
  illustrator: "Carlos Ruiz",
  number: 131,
  set: "ROF",
  rarity: "uncommon",
};
export const whatDidYouCallMe: LorcanitoActionCard = {
  id: "fbfde018e2d2b46094f67070cf7da47660a0559c",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/132.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/132_en_what_did_you_call_me-716.webp",
  name: "What did you call me?",
  characteristics: ["action"],
  text: "Chosen damaged character gets +3 ※ this turn.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "What did you call me?",
      text: "Chosen damaged character gets +3 ※ this turn.",
      effects: [
        {
          type: "attribute",
          attribute: "strength",
          amount: 3,
          modifier: "add",
          duration: "turn",
          target: chosenDamagedCharacter,
        },
      ],
    },
  ],
  flavour:
    "“No one can have a higher opinion of you than I have, and I think you’re a slimy, contemptible sewer rat!” \n−Basil",
  inkwell: true,
  color: "ruby",
  cost: 1,
  language: "EN",
  illustrator: "Luis Huerta",
  number: 132,
  set: "ROF",
  rarity: "common",
};
export const youCanFly: LorcanitoActionCard = {
  id: "5beca2950ccbb04360d49ddac6f5e918dacddc39",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/133.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/133_en_you_can_fly-716.webp",
  name: "You Can Fly",
  characteristics: ["action", "song"],
  text: "_(A character with cost 2 or more can ↷ to sing this song for free.)_\n\nChosen character gains **Evasive** until the start of your next turn. _Only characters with Evasive can challenge them.)_",
  type: "action",
  abilities: [
    {
      type: "resolution",
      effects: [
        {
          type: "ability",
          ability: "evasive",
          modifier: "add",
          duration: "next_turn",
          until: true,
          target: chosenCharacter,
        } as AbilityEffect,
      ],
    },
  ],
  inkwell: true,
  color: "ruby",
  cost: 2,
  language: "EN",
  illustrator: "Eva Widermann",
  number: 133,
  set: "ROF",
  rarity: "uncommon",
};
export const fallingDownTheRabbitHole: LorcanitoActionCard = {
  id: "079a2bed5b3df0825f85996a71b242a0b2932f34",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/162.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/162_en_falling_down_the_rabbit_hole-716.webp",
  name: "Falling Down the Rabbit Hole",
  characteristics: ["action"],
  text: "Each player chooses one of their characters and puts them into their inkwell facedown and exerted.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Falling Down the Rabbit Hole",
      text: "Each player chooses one of their characters and puts them into their inkwell facedown and exerted.",
      responder: "self",
      effects: [
        {
          type: "move",
          to: "inkwell",
          exerted: true,
          target: chosenCharacter,
        },
      ],
    },
    {
      type: "resolution",
      name: "Falling Down the Rabbit Hole",
      text: "Each player chooses one of their characters and puts them into their inkwell facedown and exerted.",
      responder: "opponent",
      effects: [
        {
          type: "move",
          to: "inkwell",
          exerted: true,
          target: chosenCharacter,
        },
      ],
    },
  ],
  flavour:
    "Down, down, down she went, floating in a swirl of ink. How curious!",
  color: "sapphire",
  cost: 4,
  language: "EN",
  illustrator: "Lissette Carrera",
  number: 162,
  set: "ROF",
  rarity: "rare",
};
export const fourDozenEggs: LorcanitoActionCard = {
  id: "ab3433f54e3e7aa1c48f35ddb4e901eb038e7341",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/163.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/163_en_four_dozen_eggs-716.webp",
  name: "Four Dozen Eggs",
  characteristics: ["action", "song"],
  text: "_(A character with cost 4 or more can ↷ to sing this\nsong for free.)_\n\nYour characters gain **Resist** +2 until the start of your next turn. _(Damage dealt to them is reduced by 2.)_",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Four Dozen Eggs",
      text: "Your characters gain **Resist** +2 until the start of your next turn. _(Damage dealt to them is reduced by 2.)_",
      effects: [
        {
          type: "ability",
          ability: "resist",
          amount: 2,
          modifier: "add",
          duration: "next_turn",
          until: true,
          target: {
            type: "card",
            value: "all",
            filters: [
              { filter: "zone", value: "play" },
              { filter: "type", value: "character" },
              { filter: "owner", value: "self" },
            ],
          },
        } as AbilityEffect,
      ],
    } as ResolutionAbility,
  ],
  inkwell: true,
  color: "sapphire",
  cost: 4,
  language: "EN",
  illustrator: "Jochem Van Gool",
  number: 163,
  set: "ROF",
  rarity: "uncommon",
};

export const launch: LorcanitoActionCard = {
  id: "e4aedbaa5007f22f1b7252f5f6f466e32e683e69",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/164.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/164_en_launch-716.webp",
  name: "Launch",
  characteristics: ["action"],
  text: "Banish chosen item of yours to deal 5 damage to chosen character.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      text: "Banish chosen item of yours to deal 5 damage to chosen character.",
      resolveEffectsIndividually: true,
      dependentEffects: true,
      detrimental: true,
      effects: [
        {
          type: "damage",
          amount: 5,
          target: chosenCharacter,
        } as DamageEffect,
        {
          type: "banish",
          target: chosenItemOfYours,
        } as BanishEffect,
      ],
    },
  ],
  flavour: "Ready . . . aim . . . coconut?",
  color: "sapphire",
  cost: 3,
  language: "EN",
  illustrator: "Juan Diego Leon",
  number: 164,
  set: "ROF",
  rarity: "uncommon",
};
export const nothingToHide: LorcanitoActionCard = {
  id: "3b807a8d422b06a61682cc20c466f58c79418857",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/165.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/165_en_nothing_to_hide-716.webp",
  name: "Nothing to Hide",
  characteristics: ["action"],
  text: "Each opponent reveals their hand. Draw a card.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Nothing to Hide",
      text: "Each opponent reveals their hand. Draw a card.",
      effects: [
        {
          type: "draw",
          amount: 1,
          target: self,
        },
        {
          type: "reveal",
          target: {
            type: "card",
            value: "all",
            filters: [
              { filter: "zone", value: "hand" },
              { filter: "owner", value: "opponent" },
            ],
          },
        },
      ],
    },
  ],
  flavour: "Helps you avoid unpleasant surprises.",
  inkwell: true,
  color: "sapphire",
  cost: 1,
  language: "EN",
  illustrator: "Mane Kandalyan / Jochem Van Gool",
  number: 165,
  set: "ROF",
  rarity: "common",
};
export const charge: LorcanitoActionCard = {
  id: "68fc95a761fb2b6db3e281e6764a7c2b298f44b2",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/198.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/198_en_charge-716.webp",
  name: "Charge",
  characteristics: ["action"],
  text: "Chosen character gains **Challenger** +2 and **Resist** +2 this turn. _(They get +2 ※ while challenging. Damage dealt to them is reduced by 2.)_",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Charge",
      text: "Chosen character gains **Challenger** +2 and **Resist** +2 this turn. _(They get +2 ※ while challenging. Damage dealt to them is reduced by 2.)_",
      effects: [
        {
          type: "ability",
          ability: "challenger",
          amount: 2,
          modifier: "add",
          duration: "turn",
          target: chosenCharacter,
        } as AbilityEffect,
        {
          type: "ability",
          ability: "resist",
          amount: 2,
          modifier: "add",
          duration: "turn",
          target: chosenCharacter,
        } as AbilityEffect,
      ],
    },
  ],
  flavour: "Sometimes subtlety is required. This is not one of those times.",
  inkwell: true,
  color: "steel",
  cost: 2,
  language: "EN",
  illustrator: "Hedvig Häggman-Sund",
  number: 198,
  set: "ROF",
  rarity: "common",
};
export const letTheStormRageOn: LorcanitoActionCard = {
  id: "56aa38886b5e9fe0f23e6fda25467754232e3a45",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/199.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/199_en_let_the_storm_rage_on-716.webp",
  name: "Let the Storm Rage On",
  characteristics: ["action", "song"],
  text: "_(A character with cost 3 or more can ↷ to sing this song for free.)_\n\nDeal 2 damage to chosen character. Draw a card.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Let the Storm Rage On",
      text: "Deal 2 damage to chosen character. Draw a card.",
      detrimental: true,
      effects: [
        {
          type: "damage",
          amount: 2,
          target: chosenCharacter,
        },
        drawACard,
      ],
    },
  ],
  flavour: "The cold never bothered me anyway",
  color: "steel",
  cost: 3,
  language: "EN",
  illustrator: "R. la Barbera / L. Giammichele",
  number: 199,
  set: "ROF",
  rarity: "common",
};
export const pickAFight: LorcanitoActionCard = {
  id: "37edf08e744d4c635b01471d839e7b0299972f42",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/200.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/200_en_pick_a_fight-716.webp",
  name: "Pick a Fight",
  characteristics: ["action"],
  text: "Chosen character can challenge ready characters this turn.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Pick a Fight",
      text: "Chosen character can challenge ready characters this turn.",
      effects: [
        {
          type: "ability",
          ability: "challenge_ready_chars",
          modifier: "add",
          duration: "turn",
          until: true,
          target: chosenCharacter,
        } as AbilityEffect,
      ],
    },
  ],
  flavour: "“I'm gonna wreck it!”",
  color: "steel",
  cost: 2,
  language: "EN",
  illustrator: "Pablo Hidalgo / Jeff Merghart",
  number: 200,
  set: "ROF",
  rarity: "uncommon",
};
export const strengthOfARagingFire: LorcanitoActionCard = {
  id: "a7d364a781ed96bdb9e27d36d3a3d8bfc6f81d72",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/201.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/201_en_strength_of_a_raging_fire-716.webp",
  name: "Strength of a Raging Fire",
  characteristics: ["action", "song"],
  text: "_A character with cost 3 or more can ↷ to sing this song for free.)_\n\nDeal damage to chosen character equal to the number of characters you have in play.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Strength of a Raging Fire",
      text: "Deal damage to chosen character equal to the number of characters you have in play.",
      effects: [
        {
          type: "damage",
          target: chosenCharacter,
          amount: {
            dynamic: true,
            filters: [
              { filter: "type", value: "character" },
              { filter: "zone", value: "play" },
              { filter: "owner", value: "self" },
            ],
          },
        },
      ],
    },
  ],
  flavour: "Tranquil as a forest \nBut on fire within",
  inkwell: true,
  color: "steel",
  cost: 3,
  language: "EN",
  illustrator: "Jared Nickerl / Alex Accorsi",
  number: 201,
  set: "ROF",
  rarity: "rare",
};
