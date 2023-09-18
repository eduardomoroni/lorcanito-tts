import type { LorcanitoActionCard } from "~/engine/cardTypes";
import { readyAndCantQuest, ResolutionAbility } from "~/engine/abilities";
import {
  AbilityEffect,
  AttributeEffect,
  ConditionalEffect,
  DamageEffect,
  DrawEffect,
  MoveCardEffect,
} from "~/engine/effectTypes";

export const controlYourTemper: LorcanitoActionCard = {
  implemented: true,
  id: "65699c6262dea5080cd00636733660c64e4c7b25",
  url: "https://static.lorcanito.com/images/cards/TFC/26.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/26_en_control_your_temper-716.webp",
  name: "Control Your Temper!",
  characteristics: ["action"],
  text: "Chosen characters gets -2 ※ this turn.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      effects: [
        {
          type: "attribute",
          attribute: "strength",
          amount: 2,
          modifier: "subtract",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "type", value: "character" },
              { filter: "zone", value: "play" },
            ],
          },
        } as AttributeEffect,
      ],
    } as ResolutionAbility,
  ],
  inkwell: true,
  color: "amber",
  cost: 1,
  language: "EN",
  illustrator: "Amber Kommavongsa",
  number: 26,
  set: "TFC",
  rarity: "common",
};
export const healingGlow: LorcanitoActionCard = {
  implemented: true,
  id: "09f9618de70b8402787968bd5c8f752da37c2aa0",
  url: "https://static.lorcanito.com/images/cards/TFC/28.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/28_en_healing_glow-716.webp",
  name: "Healing Glow",
  characteristics: ["action"],
  text: "Remove up to 2 damage from chosen character.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Healing Glow",
      text: "Remove up to 2 damage from chosen character.",
      effects: [
        {
          type: "heal",
          amount: 2,
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "type", value: "character" },
              { filter: "zone", value: "play" },
            ],
          },
        },
      ],
    } as ResolutionAbility,
  ],
  flavour: "“Don't freak out!” Rapunzel",
  inkwell: true,
  color: "amber",
  cost: 1,
  language: "EN",
  illustrator: "Philipp Kruse",
  number: 28,
  set: "TFC",
};

export const justInTime: LorcanitoActionCard = {
  implemented: true,
  id: "2b2ec1ded689159045ee10790d96e74ac7d07db4",
  url: "https://static.lorcanito.com/images/cards/TFC/29.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/29_en_just_in_time-716.webp",
  name: "Just in Time",
  characteristics: ["action"],
  text: "You may play a character with cost 5 or less for free.",
  type: "action",
  // We could use similar effect as Lantern
  abilities: [
    {
      type: "resolution",
      optional: true,
      effects: [
        {
          type: "move",
          to: "play",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "owner", value: "self" },
              { filter: "zone", value: "hand" },
              {
                filter: "attribute",
                value: "cost",
                comparison: { operator: "lte", value: 5 },
              },
            ],
          },
        },
      ],
    } as ResolutionAbility,
  ],
  flavour:
    "The best heroes always arrive at the perfect moment− \rwhether they know it or not.",
  color: "amber",
  cost: 3,
  language: "EN",
  illustrator: "Leonardo Giammichele",
  number: 29,
  set: "TFC",
  rarity: "rare",
};
export const youHaveForgottenMe: LorcanitoActionCard = {
  implemented: true,
  id: "e14c1754f2cdbfd07f620d4aa1e7ec6b110a95be",
  url: "https://static.lorcanito.com/images/cards/TFC/31.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/31_en_you_have_forgotten_me-716.webp",
  name: "You Have Forgotten Me",
  characteristics: ["action"],
  text: "Each opponent chooses and discards 2 cards.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "You Have Forgotten Me",
      text: "Each opponent chooses and discards two cards.",
      optional: false,
      effects: [
        {
          type: "discard",
          amount: 2,
          target: {
            type: "player",
            value: "opponent",
          },
        } as DrawEffect,
      ],
      responder: "opponent",
    } as ResolutionAbility,
  ],
  flavour: "“You are more than what you have become.” \n−Mufasa",
  inkwell: true,
  color: "amber",
  cost: 4,
  language: "EN",
  illustrator: "Alice Pisoni",
  number: 31,
  set: "TFC",
  rarity: "uncommon",
};
export const befuddle: LorcanitoActionCard = {
  implemented: true,
  id: "92ae697dc90b18a30c624603e635e2d5180d4d69",
  url: "https://static.lorcanito.com/images/cards/TFC/62.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/62_en_befuddle-716.webp",
  name: "Befuddle",
  characteristics: ["action"],
  text: "Return a character or item with cost 2 or less to their player's hand.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Befuddle",
      text: "Return a character or item with cost 2 or less to their player's hand.",
      effects: [
        {
          type: "move",
          to: "hand",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "type", value: ["character", "item"] },
              { filter: "zone", value: "play" },
              {
                filter: "attribute",
                value: "cost",
                comparison: { operator: "lte", value: 2 },
              },
            ],
          },
        },
      ],
    } as ResolutionAbility,
  ],
  flavour: "Never be afraid to have your mind boggled now and then.",
  inkwell: true,
  color: "amethyst",
  cost: 1,
  language: "EN",
  illustrator: "Kendall Hale",
  number: 62,
  set: "TFC",
  rarity: "uncommon",
};
export const freeze: LorcanitoActionCard = {
  implemented: true,
  id: "ee51a10c657f1b42fd0493f7fddbf9fdbc53dd59",
  url: "https://static.lorcanito.com/images/cards/TFC/63.webp",
  alternativeUrl: "https://images.lorcania.com/cards/tfc/63_en_freeze-716.webp",
  name: "Freeze",
  characteristics: ["action"],
  text: "Exert chosen opposing character.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Freeze",
      text: "Exert chosen opposing character.",
      effects: [
        {
          type: "exert",
          exert: true,
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "type", value: "character" },
              { filter: "zone", value: "play" },
              { filter: "owner", value: "opponent" },
            ],
          },
        },
      ],
    } as ResolutionAbility,
  ],
  flavour: "It's time for you to chill.",
  color: "amethyst",
  cost: 2,
  language: "EN",
  illustrator: "Cristian Romero",
  number: 63,
  set: "TFC",
  rarity: "common",
};
export const doItAgain: LorcanitoActionCard = {
  implemented: true,
  id: "881b1adc3c80b082c78c50354d25952579b36d6a",
  url: "https://static.lorcanito.com/images/cards/TFC/94.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/3_en_do_it_again-716.webp",
  name: "Do It Again!",
  characteristics: ["action"],
  text: "Return an action card from your discard to your hand.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Do It Again!",
      text: "Return an action card from your discard to your hand.",
      effects: [
        {
          type: "move",
          to: "hand",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "owner", value: "self" },
              { filter: "type", value: ["action"] },
              { filter: "zone", value: "discard" },
            ],
          },
        },
      ],
    } as ResolutionAbility,
  ],
  flavour:
    "“. . . Then scrub the terrace, sweep the halls and the stairs, clean the chimneys. And of course there's the mending, and the sewing, and the laundry . . .” −Lady Tremaine",
  color: "emerald",
  cost: 3,
  language: "EN",
  illustrator: "Ellie Horie",
  number: 94,
  set: "TFC",
  rarity: "rare",
};
export const stampede: LorcanitoActionCard = {
  implemented: true,
  id: "35bdb36f1579e326476e096dd05830dbfd02b45b",
  url: "https://static.lorcanito.com/images/cards/TFC/96.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/96_en_stampede-716.webp",
  name: "Stampede",
  characteristics: ["action"],
  text: "Deal 2 damage to chosen damaged character.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Stampede",
      text: "Deal 2 damage to chosen damaged character.",
      effects: [
        {
          type: "damage",
          amount: 2,
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "type", value: "character" },
              { filter: "zone", value: "play" },
              { filter: "status", value: "damage", comparison: { operator: "gte", value: 1 } },
            ],
          },
        } as DamageEffect,
      ],
    } as ResolutionAbility,
  ],
  flavour:
    "A wildebeest stampede is like a raging river: best experienced from a distance.",
  color: "emerald",
  cost: 1,
  language: "EN",
  illustrator: "Matt Chapman",
  number: 96,
  set: "TFC",
  rarity: "common",
};
export const stealFromRich: LorcanitoActionCard = {
  implemented: false,
  id: "38becbbae98c662e838ff5f30c6895879eb0083d",
  url: "https://static.lorcanito.com/images/cards/TFC/97.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/97_en_steam_from_the_rich-716.webp",
  name: "Steal from the Rich",
  characteristics: ["action"],
  text: "Whenever one of your characters quests this turn, each opponent loses 1 lore.",
  type: "action",
  // We have StaticTriggeredAbility trigerring by quest, but we don't have an effect to lose lose
  // I am not sure this would be a static trigger though
  // see 6.6. Triggered Effects.https://storage.googleapis.com/fabmaster/media/documents/FaB_Comprehensive_Rules_v2.1.0_access.pdf
  abilities: [
    {
      ability:
        "Whenever one of your characters quests this turn, each opponent loses 1 lore.",
    },
  ],
  flavour:
    "“Wonder how much ol' Prince John spent on all those fancy locks.” \n−Little John",
  color: "emerald",
  cost: 5,
  language: "EN",
  illustrator: "Hedvig Häggman-Sund",
  number: 97,
  set: "TFC",
  rarity: "rare",
};
export const theBeastIsMine: LorcanitoActionCard = {
  implemented: true,
  id: "528e3faa7ae9d994e14c517c29b3d3d11fafd9a6",
  url: "https://static.lorcanito.com/images/cards/TFC/99.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/99_en_the_beast_is_mine-716.webp",
  name: "The Beast is Mine!",
  characteristics: ["action"],
  text: "Chosen character gains **Reckless** during their next turn. _(They can‘t quest and must challenge if able.)_",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "The Beast is Mine!",
      text: "Chosen character gains **Reckless** during their next turn. _(They can‘t quest and must challenge if able.)_",
      effects: [
        {
          type: "ability",
          ability: "reckless",
          modifier: "add",
          duration: "next_turn",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "zone", value: "play" },
              { filter: "type", value: "character" },
            ],
          },
        } as AbilityEffect,
      ],
    } as ResolutionAbility,
  ],
  flavour:
    "“It‘s only fitting that the finest hunter gets the foulest \rbeast!”<br />\r− Gaston",
  inkwell: true,
  color: "emerald",
  cost: 3,
  language: "EN",
  illustrator: "\tMatthew Robert Davies",
  number: 99,

  set: "TFC",
  rarity: "uncommon",
};
export const viciousBetrayal: LorcanitoActionCard = {
  implemented: true,
  id: "3b98947510e01d01f9837ff6138619315039597e",
  url: "https://static.lorcanito.com/images/cards/TFC/100.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/100_en_vicious_betrayal-716.webp",
  name: "Vicious Betrayal",
  characteristics: ["action"],
  text: "Chosen character gets +2 ※ this turn. If a Villain character is chosen, they get +3 ※ instead.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      effects: [
        {
          type: "conditional",
          autoResolve: false,
          effects: [
            {
              type: "attribute",
              attribute: "strength",
              amount: 3,
              modifier: "add",
              duration: "turn",
              target: {
                type: "card",
                value: 1,
                filters: [
                  { filter: "type", value: "character" },
                  { filter: "zone", value: "play" },
                  { filter: "characteristics", value: ["villain"] },
                ],
              },
            },
          ],
          fallback: [
            {
              type: "attribute",
              attribute: "strength",
              amount: 2,
              modifier: "add",
              duration: "turn",
              target: {
                type: "card",
                value: 1,
                filters: [
                  { filter: "type", value: "character" },
                  { filter: "zone", value: "play" },
                ],
              },
            } as AttributeEffect,
          ],
        } as ConditionalEffect,
      ],
    } as ResolutionAbility,
  ],
  flavour: "“A true king takes matters into his own claws.” −Scar",
  inkwell: true,
  color: "emerald",
  cost: 1,
  language: "EN",
  illustrator: "Michaela Martin",
  number: 100,
  set: "TFC",
  rarity: "common",
};
export const cutToTheChase: LorcanitoActionCard = {
  implemented: true,
  id: "edd7ccbf838b25a958247e17b48752ba949530c7",
  url: "https://static.lorcanito.com/images/cards/TFC/129.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/129_en_cut_to_the_chase-716.webp",
  name: "Cut to the Chase",
  characteristics: ["action"],
  text: "Chosen character gains **Rush** this turn. _(They can challenge the turn they're played.)_",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Cut to the Chase",
      text: "Chosen character gains **Rush** this turn. _(They can challenge the turn they're played.)_",
      effects: [
        {
          type: "ability",
          ability: "rush",
          modifier: "add",
          duration: "turn",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "zone", value: "play" },
              { filter: "type", value: "character" },
            ],
          },
        } as AbilityEffect,
      ],
    } as ResolutionAbility,
  ],
  flavour: "“Surprise!”",
  inkwell: true,
  color: "ruby",
  cost: 2,
  language: "EN",
  illustrator: "Ellie Horie",
  number: 129,
  set: "TFC",
  rarity: "uncommon",
};
export const dragonFire: LorcanitoActionCard = {
  implemented: true,
  id: "4f55b90e0359772a0bae9396bb37200e63897c42",
  url: "https://static.lorcanito.com/images/cards/TFC/130.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/130_en_dragon_fire-716.webp",
  name: "Dragon Fire",
  characteristics: ["action"],
  text: "Banish chosen character.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Dragon Fire",
      text: "Banish chosen character.",
      effects: [
        {
          type: "banish",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "type", value: "character" },
              { filter: "zone", value: "play" },
            ],
          },
        },
      ],
    } as ResolutionAbility,
  ],
  flavour: "Rare is the hero who can withstand a dragon's wrath.",
  color: "ruby",
  cost: 5,
  language: "EN",
  illustrator: "Luis Huerta",
  number: 130,
  set: "TFC",
  rarity: "uncommon",
};
export const fanTheFlames: LorcanitoActionCard = {
  implemented: true,
  id: "6febf2f105416b14a755de9a55f69ac10c63b124",
  url: "https://static.lorcanito.com/images/cards/TFC/131.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/131_en_fan_the_flames-716.webp",
  name: "Fan The Flames",
  characteristics: ["action"],
  text: "Ready chosen character. They can't quest for the rest of this turn.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Fan The Flames",
      text: "Ready chosen character. They can't quest for the rest of this turn.",
      effects: readyAndCantQuest({
        type: "card",
        value: 1,
        filters: [
          { filter: "type", value: "character" },
          { filter: "zone", value: "play" },
        ],
      }),
    } as ResolutionAbility,
  ],
  flavour: "Pretty words can move a crowd, but so can ugly ones.",
  inkwell: true,
  color: "ruby",
  cost: 1,
  language: "EN",
  illustrator: "Jenna Gray",
  number: 131,
  set: "TFC",
  rarity: "uncommon",
};
export const hesGotASword: LorcanitoActionCard = {
  implemented: true,
  id: "09245fd73de7b2293d02a3aea74fcf061aff889b",
  url: "https://static.lorcanito.com/images/cards/TFC/132.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/132_en_hes_got_a_sword-716.webp",
  name: "He's Got a Sword!",
  characteristics: ["action"],
  text: "Chosen character gets +2 ※ this turn.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      effects: [
        {
          type: "attribute",
          attribute: "strength",
          amount: 2,
          modifier: "add",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "type", value: "character" },
              { filter: "zone", value: "play" },
            ],
          },
        } as AttributeEffect,
      ],
    } as ResolutionAbility,
  ],
  flavour: "“We've all got swords!” \n−Razoul",
  inkwell: true,
  color: "ruby",
  cost: 1,
  language: "EN",
  illustrator: "Koni",
  number: 132,
  set: "TFC",
  rarity: "common",
};
export const tangle: LorcanitoActionCard = {
  implemented: false,
  id: "fb3475577b166d19cfd6e9fe418e233322392e26",
  url: "https://static.lorcanito.com/images/cards/TFC/133.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/133_en_tangle-716.webp",
  name: "Tangle",
  characteristics: ["action"],
  text: "Each opponent loses 1 lore.",
  type: "action",
  // We don't have lose lore effect
  abilities: [{ ability: "Each opponent loses 1 lore." }],
  flavour:
    "“Stay right here! I mean, you don't have a choice, I guess. But still! Don't move!” \n− Rapunzel",
  inkwell: true,
  color: "ruby",
  cost: 2,
  language: "EN",
  illustrator: "Eri Welli",
  number: 133,
  set: "TFC",
  rarity: "common",
};
export const developYourBrain: LorcanitoActionCard = {
  implemented: true,
  id: "a7f2dc6604f4409d80252bb3d4140046f336d2ed",
  url: "https://static.lorcanito.com/images/cards/TFC/161.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/161_en_develop_your_brain-716.webp",
  name: "Develop Your Brain",
  characteristics: ["action"],
  text: "Look at the top 2 cards of your deck. Put one into your hand and the other on the bottom of the deck.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Develop Your Brain",
      text: "Look at the top 2 cards of your deck. Put one into your hand and the other on the bottom of the deck.",
      effects: [
        {
          autoResolve: true,
          type: "scry",
          amount: 2,
          mode: "bottom",
          target: {
            type: "player",
            value: "self",
          },
          limits: {
            bottom: 1,
            top: 0
          },
          tutorFilters: [
            { filter: "owner", value: "self" },
            { filter: "zone", value: "deck" },
          ],
        },
      ],
    } as ResolutionAbility,
  ],
  flavour:
    "„Knowledge, wisdom−there‘s the <b>real</b> power!“\u0003<br />−Merlin",
  inkwell: true,
  color: "sapphire",
  cost: 1,
  language: "EN",
  illustrator: "Pao Yong",
  number: 161,
  set: "TFC",
  rarity: "common",
};
export const ifItsNotBaroque: LorcanitoActionCard = {
  implemented: true,
  id: "9350d1618fa8bedd97705c4b7bea64d9e66ae1eb",
  url: "https://static.lorcanito.com/images/cards/TFC/162.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/162_en_if_its_not_baroque-716.webp",
  name: "If It's Not Baroque",
  characteristics: ["action"],
  text: "Return an item card from your discard to your hand.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      effects: [
        {
          type: "move",
          to: "hand",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "type", value: "item" },
              { filter: "owner", value: "self" },
              { filter: "zone", value: "discard" },
            ],
          },
        },
      ],
    } as ResolutionAbility,
  ],
  flavour: "“. . . Don't fix it.”",
  color: "sapphire",
  cost: 3,
  language: "EN",
  illustrator: "Kenneth Anderson",
  number: 162,
  set: "TFC",
  rarity: "rare",
};
export const workTogether: LorcanitoActionCard = {
  implemented: true,
  id: "a007dee2587ca79e20d55cf45d86ee0f5a5872b6",
  url: "https://static.lorcanito.com/images/cards/TFC/165.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/165_en_work_together-716.webp",
  name: "Work Together",
  characteristics: ["action"],
  text: "Chosen character gains **Support** this turn. _(Whenever they quest, you may add their ※ to another chosen character's ※ this turn.)_",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Work Together",
      text: "Chosen character gains **Support** this turn.",
      effects: [
        {
          type: "ability",
          ability: "support",
          modifier: "add",
          duration: "turn",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "zone", value: "play" },
              { filter: "type", value: "character" },
            ],
          },
        } as AbilityEffect,
      ],
    } as ResolutionAbility,
  ],
  flavour:
    "Pacha: “Put your whole back into it!” \nKuzco: “This is my whole back!”",
  inkwell: true,
  color: "sapphire",
  cost: 1,
  language: "EN",
  illustrator: "Bill Robinson",
  number: 165,
  set: "TFC",
  rarity: "common",
};
export const breakAction: LorcanitoActionCard = {
  implemented: true,
  id: "24f53be3106c63af52982c92cfcce03b319edb95",
  url: "https://static.lorcanito.com/images/cards/TFC/196.webp",
  alternativeUrl: "https://images.lorcania.com/cards/tfc/196_en_break-716.webp",
  name: "Break",
  characteristics: ["action"],
  text: "Banish chosen item.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      effects: [
        {
          type: "banish",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "type", value: "item" },
              { filter: "zone", value: "play" },
            ],
          },
        },
      ],
    } as ResolutionAbility,
  ],
  flavour: "No one throws a tantrum like a beast.",
  inkwell: true,
  color: "steel",
  cost: 2,
  language: "EN",
  illustrator: "Grace Tran",
  number: 196,
  set: "TFC",
  rarity: "common",
};
export const fireTheCannons: LorcanitoActionCard = {
  implemented: true,
  id: "b26d01b43ef8e6a3802ef81a6cd8dad8c79d09f6",
  url: "https://static.lorcanito.com/images/cards/TFC/197.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/197_en_fire_the_cannons-716.webp",
  name: "Fire the Cannons!",
  characteristics: ["action"],
  text: "Deal 2 damage to chosen character.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Fire the Cannons!",
      text: "Deal 2 damage to chosen character.",
      effects: [
        {
          type: "damage",
          amount: 2,
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "type", value: "character" },
              { filter: "zone", value: "play" },
            ],
          },
        },
      ],
    } as ResolutionAbility,
  ],
  flavour:
    "Captain Hook: „Double the powder and shorten the\rfuse!“<br />Mr. Smee: „Shorten the powder and double the fuse!“",
  color: "steel",
  cost: 1,
  language: "EN",
  illustrator: "Matt Chapman",
  number: 197,
  set: "TFC",
  rarity: "common",
};
export const ransack: LorcanitoActionCard = {
  implemented: true,
  id: "6ea078ad44c30a1b22a0f293c097af3e1efbbd69",
  url: "https://static.lorcanito.com/images/cards/TFC/199.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/199_en_ransack-716.webp",
  name: "Ransack",
  characteristics: ["action"],
  text: "Draw 2 cards, then choose and discard 2 cards.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      optional: false,
      responder: "self",
      effects: [
        {
          type: "draw",
          amount: 2,
          target: {
            type: "player",
            value: "self",
          },
        } as DrawEffect,
        {
          type: "discard",
          amount: 2,
          target: {
            type: "player",
            value: "self",
          },
        } as DrawEffect,
      ],
    } as ResolutionAbility,
  ],
  flavour: "Who has time to read labels?",
  inkwell: true,
  color: "steel",
  cost: 2,
  language: "EN",
  illustrator: "Amber Kommavongsa",
  number: 199,
  set: "TFC",
  rarity: "uncommon",
};
export const smash: LorcanitoActionCard = {
  implemented: true,
  id: "45afd1bfb76f45add7f410a0ede509c100ea0243",
  url: "https://static.lorcanito.com/images/cards/TFC/200.webp",
  alternativeUrl: "https://images.lorcania.com/cards/tfc/200_en_smash-716.webp",
  name: "Smash",
  characteristics: ["action"],
  text: "Deal 3 damage to the chosen character.",
  type: "action",
  abilities: [
    {
      type: "resolution",
      name: "Smash",
      text: "Deal 3 damage to chosen character.",
      effects: [
        {
          type: "damage",
          amount: 3,
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "type", value: "character" },
              { filter: "zone", value: "play" },
            ],
          },
        } as DamageEffect,
      ],
    } as ResolutionAbility,
  ],
  flavour: '"Go away!"',
  inkwell: true,
  color: "steel",
  cost: 3,
  language: "EN",
  illustrator: "Simangaliso Sibaya",
  number: 200,
  set: "TFC",
  rarity: "uncommon",
};
