import type { LorcanitoItemCard } from "@lorcanito/engine/cards/cardTypes";
import {
  AbilityEffect,
  AttributeEffect,
  DrawEffect,
} from "@lorcanito/engine/rules/effects/effectTypes";
import {
  CardEffectTarget,
  PlayerEffectTarget,
} from "@lorcanito/engine/rules/effects/effectTargets";
import {
  ActivatedAbility,
  type EffectStaticAbility,
  type GainAbilityStaticAbility,
  wardAbility,
  wheneverYouPlay,
  whenYouPlayMayDrawACard,
} from "@lorcanito/engine/rules/abilities/abilities";
import { TargetFilter } from "@lorcanito/engine";

const self: PlayerEffectTarget = {
  type: "player",
  value: "self",
};

const chosenCharacter: CardEffectTarget = {
  type: "card",
  value: 1,
  filters: [
    { filter: "zone", value: "play" },
    { filter: "type", value: "character" },
  ],
};

const chosenCharacterOfYours: CardEffectTarget = {
  type: "card",
  value: 1,
  filters: [
    { filter: "zone", value: "play" },
    { filter: "type", value: "character" },
    { filter: "owner", value: "self" },
  ],
};

export const dragonGem: LorcanitoItemCard = {
  id: "3669b7ca1857164ed3499f8e371124b0261079b5",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/33.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/33_en_dragon_gem-716.webp",
  name: "Dragon Gem",
  characteristics: ["item"],
  text: "**BRING BACK TO LIFE** ↷, 3 ⬡ − Return a character card with **Support** from your discard to your hand.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Bring Back to Life",
      text: "↷, 3 ⬡ − Return a character card with **Support** from your discard to your hand.",
      costs: [{ type: "exert" }, { type: "ink", amount: 3 }],
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
              { filter: "ability", value: "support" },
            ],
          },
        },
      ],
    },
  ],
  flavour: "Hope shines in even the darkest situations.",
  color: "amber",
  cost: 3,
  language: "EN",
  illustrator: "Andrew Trabbold",
  number: 33,
  set: "ROF",
  rarity: "rare",
};
export const sleepysFlute: LorcanitoItemCard = {
  id: "8cd9b733f37344154c296bbafc34d54c1c746e3c",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/34.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/34_en_sleepys_flute-716.webp",
  name: "Sleepy's Flute",
  characteristics: ["item"],
  text: "**A SILLY SONG** ↷ − If you played a song this turn, gain 1 lore.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "A Silly Song",
      text: "↷ − If you played a song this turn, gain 1 lore.",
      optional: false,
      costs: [{ type: "exert" }],
      conditions: [{ type: "played-songs" }],
      effects: [
        {
          type: "lore",
          amount: 1,
          modifier: "add",
          target: {
            type: "player",
            value: "self",
          },
        },
      ],
    },
  ],
  color: "amber",
  cost: 2,
  language: "EN",
  illustrator: "Antonia Flechsig",
  number: 34,
  set: "ROF",
  rarity: "rare",
};
export const bindingContract: LorcanitoItemCard = {
  id: "431eff69726698fa1df54c7c6f04d9e3c72099e2",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/65.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/65_en_binding_contract-716.webp",
  name: "Binding Contract",
  characteristics: ["item"],
  text: "**FOR ALL ETERNITY** ↷, ↷ one of your characters − Exert chosen character.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "For All Eternity",
      text: "↷, ↷ one of your characters − Exert chosen character.",
      costs: [{ type: "exert" }, { type: "exert-characters", amount: 1 }],
      effects: [
        {
          type: "exert",
          exert: true,
          target: chosenCharacter,
        },
      ],
    },
  ],
  flavour: "Just a standard form, nothing to worry about.",
  color: "amethyst",
  cost: 4,
  language: "EN",
  illustrator: "Kasia Brzezinska",
  number: 65,
  set: "ROF",
  rarity: "uncommon",
};
export const croquetMallet: LorcanitoItemCard = {
  id: "9065ffb8407b47461331fd9556d9ebc63975dd59",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/66.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/66_en_croquet_mallet-716.webp",
  name: "Croquet Mallet",
  characteristics: ["item"],
  text: "**HURTLING HEDGEHOG** Banish this item − Chosen character gains **Rush** this turn. _(They can challenge the turn they're played.)_",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Hurtling Hedgehog",
      text: "Banish this item − Chosen character gains **Rush** this turn. _(They can challenge the turn they're played.)_",
      costs: [{ type: "banish", target: "self" }],
      effects: [
        {
          type: "ability",
          ability: "rush",
          amount: 1,
          modifier: "add",
          duration: "turn",
          target: chosenCharacter,
        } as AbilityEffect,
      ],
    },
  ],
  color: "amethyst",
  cost: 1,
  language: "EN",
  illustrator: "Matt Chapman",
  number: 66,
  set: "ROF",
  rarity: "common",
};
export const perplexingSignposts: LorcanitoItemCard = {
  id: "f508ff86cc28bd648e3d2cf3c193389ce8a58697",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/67.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/67_en_perplexing_signposts-716.webp",
  name: "Perplexing Signposts",
  characteristics: ["item"],
  text: "**TO WONDERLAND** Banish this item – Return chosen character of yours to your hand.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "To Wonderland",
      text: "Banish this item – Return chosen character of yours to your hand.",
      costs: [{ type: "banish", target: "self" }],
      effects: [
        {
          type: "move",
          to: "hand",
          target: chosenCharacterOfYours,
        },
      ],
    },
  ],
  flavour:
    "Alice: “I just wanted to ask you which way I ought to go.” \nCheshire Cat: “Well, that depends on where you want to get to.”",
  color: "amethyst",
  cost: 2,
  language: "EN",
  illustrator: "Andrew Trabbold",
  number: 67,
  set: "ROF",
  rarity: "rare",
};
export const theSorcerersSpellbook: LorcanitoItemCard = {
  id: "8d1f35f19f360c4d82f45cfb6778b1f36e52dbb6",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/68.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/68_en_the_sorcerers_spellbook-716.webp",
  name: "The Sorcerer's Spellbook",
  characteristics: ["item"],
  text: "**KNOWLEDGE** ↷, 1 ⬡ − Gain 1 lore.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Knowledge",
      text: "↷, 1 ⬡ − Gain 1 lore.",
      optional: false,
      costs: [{ type: "exert" }, { type: "ink", amount: 1 }],
      effects: [
        {
          type: "lore",
          amount: 1,
          modifier: "add",
          target: {
            type: "player",
            value: "self",
          },
        },
      ],
    },
  ],
  flavour:
    "Illumineers seek the power of knowledge−but must be aware of the price.",
  color: "amethyst",
  cost: 3,
  language: "EN",
  illustrator: "Julie Vu",
  number: 68,
  set: "ROF",
  rarity: "rare",
};
export const ratigansMarvelousTrap: LorcanitoItemCard = {
  id: "828162d91b5fe182aeb408ce5a1ae1a65427e2d3",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/102.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/102_en_ratigans_marvelous_trap-716.webp",
  name: "Ratigan's Marvelous Trap",
  characteristics: ["item"],
  text: "**SNAP! BOOM! TWANG!** Banish this item − Each opponent loses 2 lore.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Snap! Boom! Twang!",
      text: "Banish this item − Each opponent loses 2 lore.",
      costs: [{ type: "banish", target: "self" }],
      effects: [
        {
          type: "lore",
          amount: 2,
          modifier: "subtract",
          target: {
            type: "player",
            value: "opponent",
          },
        },
      ],
    },
  ],
  flavour: "Simple in purpose, elaborate in execution−just like Ratigan.",
  color: "emerald",
  cost: 3,
  language: "EN",
  illustrator: "Leonardo Giammichele",
  number: 102,
  set: "ROF",
  rarity: "rare",
};
const damageCharacterOfYours: TargetFilter[] = [
  { filter: "type", value: "character" },
  { filter: "zone", value: "play" },
  { filter: "owner", value: "self" },
  {
    filter: "status",
    value: "damage",
    comparison: { operator: "gte", value: 1 },
  },
];

export const dinnerBell: LorcanitoItemCard = {
  id: "6ef003c3d6b8c58ceeac8a19bf6895d939bfb5e5",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/134.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/134_en_dinner_bell-716.webp",
  name: "Dinner Bell",
  characteristics: ["item"],
  text: "**YOU KNOW WHAT HAPPENS** ↷, 2 ⬡ − Draw cards equal to the damage on chosen character of yours, then banish them.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "You Know What Happens",
      text: "↷, 2 ⬡ − Draw cards equal to the damage on chosen character of yours, then banish them.",
      costs: [{ type: "exert" }, { type: "ink", amount: 2 }],
      effects: [
        {
          type: "draw",
          target: self,
          amount: {
            dynamic: true,
            filters: damageCharacterOfYours,
          },
        } as DrawEffect,
        {
          type: "banish",
          target: {
            type: "card",
            value: "all",
            filters: damageCharacterOfYours,
          },
        },
      ],
    },
  ],

  flavour: "The delicate sound of impending doom.",
  color: "ruby",
  cost: 4,
  language: "EN",
  illustrator: "Peter Brockhammer",
  number: 134,
  set: "ROF",
  rarity: "rare",
};
export const peterPansDagger: LorcanitoItemCard = {
  id: "fb406bdedb6c0b5c77956308c7516136e6febece",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/135.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/135_en_peter_pans_dagger-716.webp",
  name: "Peter Pan's Dagger",
  characteristics: ["item"],
  text: "Your characters with **Evasive** get +1 ※.",
  type: "item",
  abilities: [
    {
      type: "static",
      ability: "effects",
      effects: [
        {
          type: "attribute",
          attribute: "strength",
          amount: 1,
          modifier: "add",
          duration: "turn",
          target: {
            type: "card",
            value: "all",
            filters: [
              { filter: "zone", value: "play" },
              { filter: "owner", value: "self" },
              { filter: "ability", value: "evasive" },
            ],
          } as CardEffectTarget,
        } as AttributeEffect,
      ],
    } as EffectStaticAbility,
  ],
  flavour:
    "Like so much other lore, Peter Pan's dagger was safe in the Great Illuminary until the flood.",
  color: "ruby",
  cost: 2,
  language: "EN",
  illustrator: "Leonardo Giammichele",
  number: 135,
  set: "ROF",
  rarity: "common",
};
export const swordInTheStone: LorcanitoItemCard = {
  id: "ce6a996e041c2f1b18d326361f2544a16e860417",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/136.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/136_en_sword_in_the_stone-716.webp",
  name: "Sword In The Stone",
  characteristics: ["item"],
  text: "↷, 2 ⬡ - Chosen character gets +1 ※ this turn for each 1 damage on them.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Sword In The Stone",
      text: "↷, 2 ⬡ - Chosen character gets +1 ※ this turn for each 1 damage on them.",
      costs: [{ type: "exert" }, { type: "ink", amount: 2 }],
      effects: [
        {
          type: "attribute",
          attribute: "strength",
          modifier: "add",
          duration: "turn",
          target: chosenCharacter,
          amount: {
            dynamic: true,
            amount: 1,
            multiplier: "damage",
          },
        } as AttributeEffect,
      ],
    },
  ],
  flavour:
    "“Whoso pulleth out this sword of this stone and anvil is rightwise king born of England.”",
  color: "ruby",
  cost: 1,
  language: "EN",
  illustrator: "Gaku Kumatori",
  number: 136,
  set: "ROF",
  rarity: "uncommon",
};
export const fangCrossbow: LorcanitoItemCard = {
  id: "c1240af729206b9f553a216168fe332afbc36014",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/166.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/166_en_fang_crossbow-716.webp",
  name: "Fang Crossbow",
  characteristics: ["item"],
  text: "**CAREFUL AIM** ↷, 2 ⬡ – Chosen character gets -2 ※ this turn.\n\n**STAY BACK!** ↷, Banish this item – Banish chosen Dragon character.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Careful Aim",
      text: "↷, 2 ⬡ – Chosen character gets -2 ※ this turn.",
      costs: [{ type: "exert" }, { type: "ink", amount: 2 }],
      effects: [
        {
          type: "attribute",
          attribute: "strength",
          amount: 2,
          modifier: "subtract",
          duration: "turn",
          target: chosenCharacter,
        },
      ],
    },
    {
      type: "activated",
      name: "Stay Back!",
      text: "↷, Banish this item – Banish chosen Dragon character.",
      costs: [{ type: "exert" }, { type: "banish", target: "self" }],
      effects: [
        {
          type: "banish",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "zone", value: "play" },
              { filter: "type", value: "character" },
              { filter: "characteristics", value: ["dragon"] },
            ],
          },
        },
      ],
    },
  ],
  inkwell: true,
  color: "sapphire",
  cost: 3,
  language: "EN",
  illustrator: "Antonia Flechsig",
  number: 166,
  set: "ROF",
  rarity: "uncommon",
};
export const gumboPot: LorcanitoItemCard = {
  id: "612453e923753922b8d1bfac71d67b50444f8889",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/167.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/167_en_gumbo_pot-716.webp",
  name: "Gumbo Pot",
  characteristics: ["item"],
  text: "**THE BEST I'VE EVER TASTED** ↷ − Remove 1 damage each from up to 2 chosen characters.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "The Best I've Ever Tasted",
      text: "↷ − Remove 1 damage each from up to 2 chosen characters.",
      optional: false,
      costs: [{ type: "exert" }],
      effects: [
        {
          type: "heal",
          amount: 1,
          target: {
            type: "card",
            value: 2,
            upTo: true,
            filters: [
              { filter: "owner", value: "self" },
              { filter: "type", value: "character" },
              { filter: "zone", value: "play" },
            ],
          },
        },
      ],
    } as ActivatedAbility,
  ],
  flavour: "“A gift this special just got to be shared.” \n−James",
  inkwell: true,
  color: "sapphire",
  cost: 2,
  language: "EN",
  illustrator: "Tanisha Cherislin",
  number: 167,
  set: "ROF",
  rarity: "common",
};
export const mauricesWorkshop: LorcanitoItemCard = {
  id: "ca0f8800ede55ee1bac0ff791234f2a0d0a0b0e1",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/168.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/168_en_maurices_workshop-716.webp",
  name: "Maurice's Workshop",
  characteristics: ["item"],
  text: "**LOOKING FOR THIS?** Whenever you play another item, you may pay 1 ⬡ to draw a card.",
  type: "item",
  abilities: [
    wheneverYouPlay({
      name: "Looking For This?",
      text: "Whenever you play another item, you may pay 1 ⬡ to draw a card.",
      optional: true,
      costs: [{ type: "ink", amount: 1 }],
      excludeSelf: true,
      triggerFilter: [
        { filter: "type", value: "item" },
        { filter: "owner", value: "self" },
      ],
      effects: [
        {
          type: "draw",
          amount: 1,
          target: {
            type: "player",
            value: "self",
          },
        },
      ],
    }),
  ],
  flavour: "The solution you need could be just a few adjustments away.",
  color: "sapphire",
  cost: 3,
  language: "EN",
  illustrator: "Antonia Flechsig",
  number: 168,
  set: "ROF",
  rarity: "rare",
};
export const pawpsicle: LorcanitoItemCard = {
  id: "605d2400e48ba9e92470e8437368271ebec303b7",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/169.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/169_en_pawpsicle-716.webp",
  name: "Pawpsicle",
  characteristics: ["item"],
  text: "**JUMBO POP** When you play this item, you may draw a card.\n\n**THAT'S REDWOOD** Banish this item − Remove up to 2 damage from chosen character.",
  type: "item",
  abilities: [
    {
      ...whenYouPlayMayDrawACard,
      name: "Jumbo Pop",
    },
    {
      type: "activated",
      name: "That's Redwood",
      text: "Banish this item − Remove up to 2 damage from chosen character.",
      optional: false,
      costs: [{ type: "banish", target: "self" }],
      effects: [
        {
          type: "heal",
          amount: 2,
          target: chosenCharacter,
        },
      ],
    } as ActivatedAbility,
  ],
  inkwell: true,
  color: "sapphire",
  cost: 1,
  language: "EN",
  illustrator: "Isaiah Mesq",
  number: 169,
  set: "ROF",
  rarity: "common",
};
export const sardineCan: LorcanitoItemCard = {
  id: "a76d94b82f621f6e0d3ad17d8c0de43a88c76805",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/170.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/170_en_sardine_can-716.webp",
  name: "Sardine Can",
  characteristics: ["item"],
  text: "**FLIGHT CABIN** Your exerted characters gain **Ward**. _(Opponents can’t choose them except to challenge.)_",
  type: "item",
  abilities: [
    {
      type: "static",
      ability: "gain-ability",
      name: "Flight Cabin",
      text: "Your exerted characters gain **Ward**.",
      gainedAbility: wardAbility,
      target: {
        type: "card",
        value: "all",
        filters: [
          { filter: "owner", value: "self" },
          { filter: "zone", value: "play" },
          { filter: "type", value: "character" },
          { filter: "status", value: "exerted" },
        ],
      } as CardEffectTarget,
    } as GainAbilityStaticAbility,
  ],
  flavour: "“Flight 3759 boarding now! Let’s go get that lore!” \n–Orville",
  inkwell: true,
  color: "sapphire",
  cost: 4,
  language: "EN",
  illustrator: "Peter Brockhammer",
  number: 170,
  set: "ROF",
  rarity: "uncommon",
};

export const lastCannon: LorcanitoItemCard = {
  id: "1c651c7db54489ac6cfd5ec0a519f923a69bef33",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/202.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/202_en_last_cannon-716.webp",
  name: "Last Cannon",
  characteristics: ["item"],
  text: "**ARM YOURSELF** 1 ⬡, Banish this item − Chosen character gains **Challenger** +3 this turn. _(They get +3 ※ while challenging.)_",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Arm Yourself",
      text: "1 ⬡, Banish this item − Chosen character gains **Challenger** +3 this turn. _(They get +3 ※ while challenging.)_",
      costs: [
        { type: "banish", target: "self" },
        { type: "ink", amount: 1 },
      ],
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
  flavour: "One shot can change everything.",
  inkwell: true,
  color: "steel",
  cost: 1,
  language: "EN",
  illustrator: "Jared Nickerl",
  number: 202,
  set: "ROF",
  rarity: "common",
};

export const mouseArmor: LorcanitoItemCard = {
  id: "06fad0465cf899ddccf9aafebd804adc5c8973af",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/203.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/203_en_mouse_armor-716.webp",
  name: "Mouse Armor",
  characteristics: ["item"],
  text: "**PROTECTION** ↷ − Chosen character gains **Resist** +1 until the start of your next turn. _(Damage dealt to them is reduced by 1.)_",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Protection",
      text: "↷ − Chosen character gains **Resist** +1 until the start of your next turn. _(Damage dealt to them is reduced by 1.)_",
      costs: [{ type: "exert" }],
      effects: [
        {
          type: "ability",
          ability: "resist",
          amount: 1,
          modifier: "add",
          duration: "next_turn",
          until: true,
          target: chosenCharacter,
        } as AbilityEffect,
      ],
    },
  ],
  flavour: "Built by the tiniest of hands for the bravest of hearts.",
  color: "steel",
  cost: 2,
  language: "EN",
  illustrator: "Gaku Kumatori",
  number: 203,
  set: "ROF",
  rarity: "uncommon",
};
export const weightSet: LorcanitoItemCard = {
  id: "f0afaeb88db56d999d1dcf46fd14591d5a7c33a8",
  implemented: true,
  url: "https://six-inks.pages.dev/assets/images/cards/EN/002/204.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/204_en_weight_set-716.webp",
  name: "Weight Set",
  characteristics: ["item"],
  text: "**TRAINING** Whenever you play a character with 4 ※ or more, you may pay 1 ⬡ to draw a card.",
  type: "item",
  abilities: [
    wheneverYouPlay({
      name: "Training",
      text: "Whenever you play a character with 4 ※ or more, you may pay 1 ⬡ to draw a card.",
      optional: true,
      costs: [{ type: "ink", amount: 1 }],
      triggerFilter: [
        { filter: "type", value: "character" },
        { filter: "owner", value: "self" },
        {
          filter: "attribute",
          value: "strength",
          comparison: { operator: "gte", value: 4 },
        },
      ],
      effects: [
        {
          type: "draw",
          amount: 1,
          target: {
            type: "player",
            value: "self",
          },
        },
      ],
    }),
  ],
  flavour: "Personally endorsed by Hercules himself!",
  inkwell: true,
  color: "steel",
  cost: 3,
  language: "EN",
  illustrator: "Antonia Flechsig",
  number: 204,
  set: "ROF",
  rarity: "rare",
};
