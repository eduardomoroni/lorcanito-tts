import type { LorcanitoActionCard } from "@lorcanito/engine/cards/cardTypes";
import type { ResolutionAbility } from "@lorcanito/engine/rules/abilities/abilities";
import {
  MoveCardEffect,
  ScryEffect,
} from "@lorcanito/engine/rules/effects/effectTypes";

export const friendsOnTheOtherSide: LorcanitoActionCard = {
  implemented: true,
  id: "3297d4fcfbba0c3cc6355fa9a2c2ea489eb8af1e",
  url: "https://six-inks.pages.dev/assets/images/cards/EN/001/64.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/64_en_friends_on_the_other_side-716.webp",
  name: "Friends On The Other Side",
  characteristics: ["action", "song"],
  text: "_(A character with cost 3 or more can ↷ to sing this song \rfor free.)_\n\rDraw 2 cards.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      effects: [
        {
          type: "draw",
          amount: 2,
          target: {
            type: "player",
            value: "self",
          },
        },
      ],
      text: "Draw 2 cards.",
    } as ResolutionAbility,
  ],
  flavour: "The cards, the cards<br />\rthe cards will tell . . .",
  inkwell: true,
  color: "amethyst",
  cost: 3,
  language: "EN",
  illustrator: "Amber Kommavongsa",
  number: 64,
  set: "TFC",
  rarity: "common",
};
export const hakunaMatata: LorcanitoActionCard = {
  implemented: true,
  id: "7ed65f0a90cd0af2c52719aad0900c9fb28a46bd",
  url: "https://six-inks.pages.dev/assets/images/cards/EN/001/27.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/27_en_hakuna_matata-716.webp",
  name: "Hakuna Matata",
  characteristics: ["action", "song"],
  text: "_(A character with cost 2 or more can ↷ to sing this\nsong for free.)_\nRemove up to 3 damage from each of your characters.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Hakuna Matata",
      text: "Remove up to 3 damage from each of your characters.",
      effects: [
        {
          type: "heal",
          amount: 3,
          target: {
            type: "card",
            value: "all",
            filters: [
              { filter: "zone", value: "play" },
              { filter: "owner", value: "self" },
              { filter: "type", value: "character" },
            ],
          },
        },
      ],
    } as ResolutionAbility,
  ],
  flavour: "What a wonderful phrase!",
  inkwell: true,
  color: "amber",
  cost: 4,
  language: "EN",
  illustrator: "Juan Diego Leon",
  number: 27,
  set: "TFC",
  rarity: "common",
};
export const beOurGuest: LorcanitoActionCard = {
  implemented: true,
  id: "449d07fcd53f74ce7c468bbb02c937315bb7dc2e",
  url: "https://six-inks.pages.dev/assets/images/cards/EN/001/25.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/25_en_be_our_guest-716.webp",
  name: "Be Our Guest",
  characteristics: ["action", "song"],
  text: "_(A character with cost 2 or more can ↷ to sing this\rsong for free.)_\nLook at the top 4 cards of your deck. You may reveal a character card and put it into your hand. Put the rest on the bottom of your deck in any order.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Be Our Guest",
      text: "Look at the top 4 cards of your deck. You may reveal a character card and put it into your hand. Put the rest on the bottom of your deck in any order.",
      optional: false,
      effects: [
        {
          type: "scry",
          amount: 4,
          mode: "bottom",
          shouldRevealTutored: true,
          limits: {
            bottom: 4,
            hand: 1,
          },
          tutorFilters: [
            { filter: "owner", value: "self" },
            { filter: "type", value: "character" },
            { filter: "zone", value: "deck" },
          ],
        } as ScryEffect,
      ],
    } as ResolutionAbility,
  ],
  inkwell: true,
  color: "amber",
  cost: 2,
  language: "EN",
  illustrator: "R. La Barbera / L. Giammichele",
  number: 25,
  set: "TFC",
  rarity: "uncommon",
};
export const partOfOurWorld: LorcanitoActionCard = {
  implemented: true,
  id: "9a9a8606b0b16e2aac5cbf5943711dfc9d12c2e5",
  url: "https://six-inks.pages.dev/assets/images/cards/EN/001/30.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/30_en_part_of_your_world-716.webp",
  name: "Part of Your World",
  characteristics: ["action", "song"],
  text: "_(A character with cost 3 or more can ↷ to sing this song\rfor free.)_\n Return a character card from your discard to your hand.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Part of Your World",
      text: "Return a character card from your discard to your hand.",
      effects: [
        {
          type: "move",
          to: "hand",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "owner", value: "self" },
              { filter: "type", value: "character" },
              { filter: "zone", value: "discard" },
            ],
          },
        },
      ],
    } as ResolutionAbility,
  ],
  flavour: "What would I give\nIf I could live out of these waters?",
  color: "amber",
  cost: 3,
  language: "EN",
  illustrator: "Samanta Erdini",
  number: 30,
  set: "TFC",
  rarity: "rare",
};
export const reflection: LorcanitoActionCard = {
  implemented: true,
  id: "0d31960d45be3710633f8fd14bc2cb1a5d0d455b",
  url: "https://six-inks.pages.dev/assets/images/cards/EN/001/65.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/65_en_reflection-716.webp",
  name: "Reflection",
  characteristics: ["action", "song"],
  text: "_(A character with cost 2 or more can ↷ to sing this\nsong for free.)_\nLook at the top 3 cards of your deck. Put them back on the top of your deck in any order.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Reflection",
      text: "Look at the top 3 cards of your deck. Put them back on the top of your deck in any order.",
      effects: [
        {
          type: "scry",
          amount: 3,
          mode: "top",
          target: {
            type: "player",
            value: "self",
          },
        },
      ],
    } as ResolutionAbility,
  ],
  flavour: "When will my reflection show \nWho I am inside?",
  inkwell: true,
  color: "amethyst",
  cost: 1,
  language: "EN",
  illustrator: "Kevin Hong",
  number: 65,
  set: "TFC",
  rarity: "common",
};
const chosenCharacter = {
  type: "card",
  value: 1,
  filters: [
    { filter: "type", value: "character" },
    { filter: "zone", value: "play" },
  ],
};
export const motherKnowsBest: LorcanitoActionCard = {
  implemented: true,
  id: "f7901284cc687c92dce00ce7a5dac93705c66bfa",
  url: "https://six-inks.pages.dev/assets/images/cards/EN/001/95.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/95_en_mother_knows_best-716.webp",
  name: "Mother Knows Best",
  characteristics: ["action", "song"],
  text: "_(A character with cost 3 or more can ↷ to sing this\nsong for free.)_\nReturn chosen character to their player's hand.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Mother Knows Best",
      text: "Return chosen character to their player's hand.",
      effects: [
        {
          type: "move",
          to: "hand",
          target: chosenCharacter,
        },
      ],
    } as ResolutionAbility,
  ],
  flavour: "One way or another \nSomething will go wrong, I swear",
  color: "emerald",
  cost: 3,
  language: "EN",
  illustrator: "R. La Barbera / L. Giammichele",
  number: 95,
  set: "TFC",
  rarity: "uncommon",
};
export const suddenChill: LorcanitoActionCard = {
  implemented: true,
  id: "f1234c93ebdb915cbb9cd59c26bbfa53b2930dc7",
  url: "https://six-inks.pages.dev/assets/images/cards/EN/001/98.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/98_en_sudden_chill-716.webp",
  name: "Sudden Chill",
  characteristics: ["action", "song"],
  text: "_(A character with cost 2 or more can ↷ to sing this\nsong for free.)_\nEach opponent chooses and discards a card.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Sudden Chill",
      text: "Each opponent chooses and discards a card.",
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
      ],
    } as ResolutionAbility,
  ],
  flavour:
    "Cruella De Vil, Cruella De Vil \nIf she doesn't scare you, no evil thing will",
  inkwell: true,
  color: "emerald",
  cost: 2,
  language: "EN",
  illustrator: "Giulia Riva",
  number: 98,
  set: "TFC",
  rarity: "common",
};
export const bePrepared: LorcanitoActionCard = {
  implemented: true,
  id: "66f449b309975f089015bf4e06cfca1436bf7def",
  url: "https://six-inks.pages.dev/assets/images/cards/EN/001/128.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/128_en_be_prepared-716.webp",
  name: "Be Prepared",
  characteristics: ["action", "song"],
  text: "_(A character with cost 7 or more can ↷ to sing this\nsong for free.)_\nBanish all characters.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Be Prepared",
      text: "Banish all characters.",
      effects: [
        {
          type: "banish",
          target: {
            type: "card",
            value: "all",
            filters: [
              { filter: "zone", value: "play" },
              { filter: "type", value: "character" },
            ],
          },
        },
      ],
    } as ResolutionAbility,
  ],
  flavour: "Out teeth and ambitions are bared!",
  color: "ruby",
  cost: 7,
  language: "EN",
  illustrator: "Jared Nickerl",
  number: 128,
  set: "TFC",
  rarity: "rare",
};
export const letItGo: LorcanitoActionCard = {
  implemented: true,
  id: "896c3caa4dccb15fe042026ef73498972c838579",
  url: "https://six-inks.pages.dev/assets/images/cards/EN/001/163.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/163_en_let_it_go-716.webp",
  name: "Let It Go",
  characteristics: ["action", "song"],
  text: "_(A character with cost 5 or more can ↷ to sing this song for free.)_\nPut chosen character into their player's inkwell facedown and exerted.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Let It Go",
      text: "Put chosen character into their player's inkwell facedown and exerted.",
      effects: [
        {
          type: "move",
          to: "inkwell",
          exerted: true,
          target: chosenCharacter,
        },
      ],
    } as ResolutionAbility,
  ],
  flavour:
    "It's time to see what I can do<br />To test the limits and break through",
  inkwell: true,
  color: "sapphire",
  cost: 5,
  language: "EN",
  illustrator: "Milica Celikovic",
  number: 163,
  set: "TFC",
  rarity: "rare",
};
export const oneJumpAhead: LorcanitoActionCard = {
  implemented: true,
  id: "4e0080092bdad6211fafb326d79891fc4ca48659",
  url: "https://six-inks.pages.dev/assets/images/cards/EN/001/164.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/164_en_one_jump_ahead-716.webp",
  name: "One Jump Ahead",
  characteristics: ["action", "song"],
  text: "_(A character with cost 2 or more can ↷ to sing this song for free.)_\nPut the top card of your deck into your inkwell facedown and exerted.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "One Jump Ahead",
      text: "Put the top card of your deck into your inkwell facedown and exerted.",
      optional: false,
      effects: [
        {
          type: "move",
          to: "inkwell",
          exerted: true,
          target: {
            type: "card",
            target: "self",
            value: 1,
            filters: [{ filter: "top-deck", value: "self" }],
          },
        } as MoveCardEffect,
      ],
    } as ResolutionAbility,
  ],
  flavour:
    "Gotta eat to live, gotta steal to eat -\nTell you all about it when I got the time",
  color: "sapphire",
  cost: 2,
  language: "EN",
  illustrator: "Bill Robinson",
  number: 164,
  set: "TFC",
  rarity: "uncommon",
};
export const aWholeNewWorld: LorcanitoActionCard = {
  implemented: true,
  id: "154bf7f324ddab1008d75b3a79fcb215fc3771dc",
  url: "https://six-inks.pages.dev/assets/images/cards/EN/001/195.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/195_en_a_whole_new_world-716.webp",
  name: "A Whole New World",
  characteristics: ["action", "song"],
  text: "_(A character with cost 5 or more can ↷ to sing this\nsong for free.)_\nEach player discards their hand and draws 7 cards.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "A Whole New World",
      text: "Each player discards their hand and draws 7 cards.",
      effects: [
        {
          type: "discard",
          target: {
            type: "card",
            value: "all",
            filters: [{ filter: "zone", value: "hand" }],
          },
        },
        {
          type: "draw",
          amount: 7,
          target: {
            type: "player",
            value: "all",
          },
        },
      ],
    } as ResolutionAbility,
  ],
  flavour: "Shining, shimmering, splendid . . .",
  color: "steel",
  cost: 5,
  language: "EN",
  illustrator: "Koni",
  number: 195,
  set: "TFC",
  rarity: "super_rare",
};
export const grabYourSword: LorcanitoActionCard = {
  implemented: true,
  id: "6092b9532d04b3dbeb5d69ed55ce007becc59d7f",
  url: "https://six-inks.pages.dev/assets/images/cards/EN/001/198.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/198_en_grab_your_sword-716.webp",
  name: "Grab Your Sword",
  characteristics: ["action", "song"],
  text: "_(A character with cost 5 or more can ↷ to sing this song for free.)_\nDeal 2 damage to each opposing character.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Grab Your Sword",
      text: "Deal 2 damage to each opposing character.",
      effects: [
        {
          type: "damage",
          amount: 2,
          target: {
            type: "card",
            value: "all",
            filters: [
              { filter: "zone", value: "play" },
              { filter: "owner", value: "opponent" },
              { filter: "type", value: "character" },
            ],
          },
        },
      ],
    } as ResolutionAbility,
  ],
  flavour: "We don't like\nwhat we don't understand\nIn fact, it scares us",
  color: "steel",
  cost: 5,
  language: "EN",
  illustrator: "Peter Brockhammer",
  number: 198,
  set: "TFC",
  rarity: "rare",
};
