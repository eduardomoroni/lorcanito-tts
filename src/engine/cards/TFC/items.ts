import type { LorcanitoItemCard } from "~/engine/cardTypes";
import type {
  ActivatedAbility,
  StaticTriggeredAbility,
} from "~/engine/abilities";
import type {
  AbilityEffect,
  BanishEffect,
  EffectTargets,
  ExertEffect,
  ScryEffect,
} from "~/engine/effectTypes";
import type {
  AttributeEffect,
  ConditionalEffect,
  DrawEffect,
  HealEffect,
  ReplacementEffect,
  RestrictionEffect,
} from "~/engine/effectTypes";
import { readyAndCantQuest } from "~/engine/abilities";

export const dingleHopper: LorcanitoItemCard = {
  implemented: true,
  id: "15dc6d521d3ad4dfda6c40ff441deec12e90a330",
  url: "https://static.lorcanito.com/images/cards/TFC/32.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/32_en_dinglehopper-716.webp",
  name: "Dinglehopper",
  text: "**STRAIGHTEN HAIR** ↷ - Remove up to 1 damage from chosen character.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Straighten Hair",
      text: "↷ - Remove up to 1 damage from chosen character.",
      effects: [
        {
          type: "heal",
          amount: 1,
        },
      ],
      targets: {
        type: "card",
        value: 1,
        filters: [
          { filter: "owner", value: "self" },
          { filter: "type", value: "character" },
          { filter: "zone", value: "play" },
        ],
      },
      optional: false,
      costs: [{ type: "exert" }],
    } as ActivatedAbility,
  ],
  flavour: "Enjoy the finest of human hairstyles.",
  inkwell: true,
  color: "amber",
  cost: 1,
  language: "EN",
  illustrator: "Eri Welli",
  number: 32,
  set: "TFC",
  rarity: "common",
};
export const lantern: LorcanitoItemCard = {
  implemented: true,
  id: "a068f8f06c08ec83387c2f7a0952acb9859f095f",
  url: "https://static.lorcanito.com/images/cards/TFC/33.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/33_en_lantern-716.webp",
  name: "Lantern",
  text: "**BIRTHDAY LIGHTS** ↷ - You pay 1 ⬡ less for the next character you play this turn.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Birthday Lights",
      text: "↷ - You pay 1 ⬡ less for the next character you play this turn.",
      effects: [
        {
          type: "replacement",
          replacement: "cost",
          duration: "next",
          amount: 1,
          filters: [{ filter: "type", value: "character" }],
        } as ReplacementEffect,
      ],
      optional: false,
      costs: [{ type: "exert" }],
    } as ActivatedAbility,
  ],
  flavour:
    "Lanterns fill the sky on one special night, beacons of hope and love.",
  color: "amber",
  cost: 2,
  language: "EN",
  illustrator: "Eri Welli",
  number: 33,
  set: "TFC",
  rarity: "rare",
};
export const ursulaShellNecklace: LorcanitoItemCard = {
  implemented: true,
  id: "f9becaf6d4cbcb427eeac1de2a7fa391508ca94d",
  url: "https://static.lorcanito.com/images/cards/TFC/34.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/34_en_ursulas_shell_necklace-716.webp",
  name: "Ursula's Shell Necklace",
  text: "**NOW, SING!** Whenever you play a song, you may pay 1 **⬡** to draw a card.",
  type: "item",
  abilities: [
    {
      type: "static-triggered",
      name: "Now, Sing!",
      text: "Whenever you play a song, you may pay 1 **⬡** to draw a card.",
      trigger: "play",
      optional: true,
      targets: {
        type: "card",
        value: 1,
        filters: [
          { filter: "type", value: "action" },
          { filter: "characteristics", value: ["song"] },
          { filter: "owner", value: "self" },
        ],
      },
      effects: [
        {
          type: "draw",
          amount: 1,
          target: {
            type: "player",
            value: "self",
          },
        } as DrawEffect,
      ],
    },
  ],
  flavour:
    "“Singing is a lovely pastime . . . if you've got the voice for it.” −Ursula",
  color: "amber",
  cost: 3,
  language: "EN",
  illustrator: "Jenna Gray",
  number: 34,
  set: "TFC",
  rarity: "rare",
};
export const magicMirror: LorcanitoItemCard = {
  implemented: true,
  id: "a2b67363d97354df5c25713e60d67ca19cfdec61",
  url: "https://static.lorcanito.com/images/cards/TFC/66.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/66_en_magic_mirror-716.webp",
  name: "Magic Mirror",
  text: "**Speak** ↷, 4 ⬡ - Draw a card.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Speak",
      effects: [
        {
          type: "draw",
          amount: 1,
          target: {
            type: "player",
            value: "self",
          } as EffectTargets,
        },
      ],
      optional: false,
      costs: [{ type: "exert" }, { type: "ink", amount: 4 }],
      text: "↷, 4 ⬡ - Draw a card.",
    } as ActivatedAbility,
  ],
  flavour: '"What wouldst thou know, my Queen?"',
  color: "amethyst",
  cost: 2,
  language: "EN",
  illustrator: "Andrew Trabbold",
  number: 66,
  set: "TFC",
  rarity: "rare",
};
export const ursulaCaldron: LorcanitoItemCard = {
  implemented: true,
  id: "fbcd12f70d9cf78401bcc8c159743cee3bfbaa08",
  url: "https://static.lorcanito.com/images/cards/TFC/67.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/67_en_ursulas_cauldron-716.webp",
  name: "Ursula's Cauldron",
  text: "**PEER INTO THE DEPTHS** ↷ − Look at the top 2 cards of your deck. Put one on the top of your deck and the other on the bottom.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Peer Into The Depths",
      text: "↷ − Look at the top 2 cards of your deck. Put one on the top of your deck and the other on the bottom.",
      effects: [
        {
          type: "scry",
          amount: 3,
          mode: "both",
          limits: {
            top: 1,
            bottom: 1,
          },
        } as ScryEffect,
      ],
      targets: {
        type: "player",
        value: "self",
      },
      optional: false,
      costs: [{ type: "exert" }],
    } as ActivatedAbility,
  ],
  flavour: "Perfect for mixing potions and stealing voices.",
  color: "amethyst",
  cost: 2,
  language: "EN",
  number: 67,
  set: "TFC",
  rarity: "uncommon",
  illustrator: "TBD",
};
export const whiteRabbitPocketWatch: LorcanitoItemCard = {
  implemented: true,
  id: "960fb90370cc04551b74c266f72e5497c7869ae9",
  url: "https://static.lorcanito.com/images/cards/TFC/68.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/68_en_white_rabbits_pocket_watch-716.webp",
  name: "White Rabbit's Pocket Watch",
  text: "**I'm late!** ↷, 1 ⬡ - Chosen character gains **Rush** this turn. _(They can challenge the turn they're played.)_",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "I'm late!",
      text: "Chosen character gains **Rush** this turn. _(They can challenge the turn they're played.)_",
      costs: [{ type: "exert" }, { type: "ink", amount: 1 }],
      effects: [
        {
          type: "ability",
          ability: "rush",
          modifier: "add",
          duration: "turn",
        } as AbilityEffect,
      ],
      targets: {
        type: "card",
        value: 1,
        filters: [
          { filter: "zone", value: "play" },
          { filter: "type", value: "character" },
        ],
      },
      optional: false,
    } as ActivatedAbility,
  ],
  flavour:
    '"No wonder you\'re late. Why, this clock is exactly two days slow." −The Mad Hatter',
  inkwell: true,
  color: "amethyst",
  cost: 3,
  language: "EN",
  illustrator: "Kamil Murzyn",
  number: 68,
  set: "TFC",
  rarity: "rare",
};
export const drFacilierCards: LorcanitoItemCard = {
  implemented: true,
  id: "7009f708b5f8e9437c9f748f11cacc3a1854d7ab",
  url: "https://static.lorcanito.com/images/cards/TFC/101.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/101_en_dr_faciliers_cards-716.webp",
  name: "Dr. Facilier's Cards",
  text: "**THE CARDS WILL TELL** ↷ − You pay 1 ⬡ less for the next action you play this turn.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "The Cards Will Tell",
      text: "You pay 1 ⬡ less for the next action you play this turn.",
      effects: [
        {
          type: "replacement",
          replacement: "cost",
          duration: "next",
          amount: 1,
          filters: [{ filter: "type", value: "action" }],
        } as ReplacementEffect,
      ],
      optional: false,
      costs: [{ type: "exert" }],
    } as ActivatedAbility,
  ],
  flavour: "“Take a little trip into your future with me!” \n−Dr. Facilier",
  color: "emerald",
  cost: 2,
  language: "EN",
  illustrator: "Koni",
  number: 101,
  set: "TFC",
  rarity: "uncommon",
};
export const stolenScimitar: LorcanitoItemCard = {
  implemented: true,
  id: "c2bedb26af7c98664dca268c84ddab9d739ec8ac",
  url: "https://static.lorcanito.com/images/cards/TFC/102.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/102_en_stolen_scimitar-716.webp",
  name: "Stolen Scimitar",
  text: "**SLASH** ↷ − Chosen character get +1 ※ this turn. If a character named Aladdin is chosen, he gets +2 ※ instead.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Slash",
      text: "Chosen character get +1 ※ this turn. If a character named Aladdin is chosen, he gets +2 ※ instead.",
      costs: [{ type: "exert" }],
      effects: [
        {
          type: "conditional",
          effects: [
            {
              target: [
                { filter: "type", value: "character" },
                { filter: "zone", value: "play" },
                {
                  filter: "attribute",
                  value: "name",
                  comparison: { operator: "eq", value: "aladdin" },
                },
              ],
              effect: {
                type: "attribute",
                attribute: "strength",
                amount: 2,
                modifier: "add",
                duration: "turn",
              } as AttributeEffect,
            },
          ],
          fallback: [
            {
              type: "attribute",
              attribute: "strength",
              amount: 1,
              modifier: "add",
              duration: "turn",
            } as AttributeEffect,
          ],
        } as ConditionalEffect,
      ],
      targets: {
        type: "card",
        value: 1,
        filters: [
          { filter: "type", value: "character" },
          { filter: "zone", value: "play" },
        ],
      },
      optional: false,
    } as ActivatedAbility,
  ],
  flavour: "Sometimes you've got to take what you can get.",
  inkwell: true,
  color: "emerald",
  cost: 2,
  language: "EN",
  illustrator: "Kendall Hale",
  number: 102,
  set: "TFC",
  rarity: "common",
};
export const poisonedApple: LorcanitoItemCard = {
  implemented: true,
  id: "35cf6b8bf558cc97aa80f792e59006c286dcf293",
  url: "https://static.lorcanito.com/images/cards/TFC/134.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/134_en_poisoned_apple-716.webp",
  name: "Poisoned Apple",
  text: "**TAKE A BITE . . . ** 1 ⬡, Banish this item − Exert chosen character. If a Princess character is chosen, banish her instead.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Poisoned Apple",
      text: "Banish this item − Exert chosen character. If a Princess character is chosen, banish her instead.",
      costs: [{ type: "banish", target: "self" }],
      effects: [
        {
          type: "conditional",
          effects: [
            {
              effect: {
                type: "banish",
              } as BanishEffect,
              target: [
                { filter: "characteristics", value: ["princess"] },
                { filter: "type", value: "character" },
                { filter: "zone", value: "play" },
              ],
            },
          ],
          fallback: [
            {
              type: "exert",
              exert: true,
            } as ExertEffect,
          ],
        } as ConditionalEffect,
      ],
      targets: {
        type: "card",
        value: 1,
        filters: [
          { filter: "type", value: "character" },
          { filter: "zone", value: "play" },
        ],
      },
      optional: false,
    } as ActivatedAbility,
  ],
  flavour:
    "“One taste of the poisoned apple, and the victim's eyes will close forever. . . .” \n−The Queen",
  color: "ruby",
  cost: 3,
  language: "EN",
  illustrator: "Andrew Trabbold",
  number: 134,
  set: "TFC",
  rarity: "rare",
};
export const shieldOfVirtue: LorcanitoItemCard = {
  implemented: true,
  id: "aa68317a85ca67aebbbb2aa8b80c6602715706bd",
  url: "https://static.lorcanito.com/images/cards/TFC/135.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/135_en_shield_of_virtue-716.webp",
  name: "Shield of Virtue",
  text: "**FIREPROOF** ↷, 3 ⬡ − Ready chosen character. They can't quest for the rest of this turn.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Fireproof",
      text: "Ready chosen character. They can't quest for the rest of this turn.",
      optional: false,
      costs: [{ type: "exert" }, { type: "ink", amount: 3 }],
      effects: readyAndCantQuest(),
      targets: {
        type: "card",
        value: 1,
        filters: [
          { filter: "type", value: "character" },
          { filter: "zone", value: "play" },
        ],
      },
    } as ActivatedAbility,
  ],
  flavour:
    "“Arm thyself with this enchanted Shield of Virtue and this mighty Sword of Truth, for these weapons of righteousness will triumph over evil.” \n−Flora",
  inkwell: true,
  color: "ruby",
  cost: 1,
  language: "EN",
  illustrator: "Eri Welli",
  number: 135,
  set: "TFC",
  rarity: "uncommon",
};
export const swordOfTruth: LorcanitoItemCard = {
  implemented: true,
  id: "e1a5af4fc658c26c5bf506151b2149821cab0627",
  url: "https://static.lorcanito.com/images/cards/TFC/136.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/136_en_sword_of_truth-716.webp",
  name: "Sword of Truth",
  text: "**FINAL ENCHANTMENT** Banish this item − Banish chosen Villain character.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Final Enchantment",
      text: "Banish this item − Banish chosen Villain character.",
      costs: [{ type: "banish", target: "self" }],
      effects: [
        {
          type: "banish",
        },
      ],
      targets: {
        type: "card",
        value: 1,
        filters: [
          { filter: "type", value: "character" },
          { filter: "characteristics", value: ["villain"] },
          { filter: "zone", value: "play" },
        ],
      },
      optional: false,
    } as ActivatedAbility,
  ],
  flavour: "Almost as powerful as True Love's Kiss.",
  color: "ruby",
  cost: 4,
  language: "EN",
  illustrator: "Andrew Trabbold",
  number: 136,
  set: "TFC",
  rarity: "rare",
};
export const coconutbasket: LorcanitoItemCard = {
  implemented: true,
  id: "8f49d6ea16cda4e7b7cd4d63fd48bf0f5df6bca6",
  url: "https://static.lorcanito.com/images/cards/TFC/166.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/166_en_coconut_basket-716.webp",
  name: "Coconut Basket",
  text: "**CONSIDER THE COCONUT** Whenever you play a character,\ryou may remove up to 2 damage from chosen character.",
  type: "item",
  abilities: [
    {
      type: "static-triggered",
      name: "Consider the Coconut",
      text: "Whenever you play a character, you may remove up to 2 damage from chosen character.",
      trigger: "play",
      optional: true,
      effects: [
        {
          type: "heal",
          amount: 2,
          // TODO: Revisit this, this target is not being used
          // target: {
          //   type: "card",
          //   value: 1,
          //   filters: [
          //     { filter: "zone", value: "play" },
          //     { filter: "type", value: "character" },
          //   ],
          // },
        } as HealEffect,
      ],
      targets: {
        type: "card",
        value: 1,
        filters: [
          { filter: "owner", value: "self" },
          { filter: "type", value: "character" },
          { filter: "zone", value: "play" },
        ],
      },
    },
  ],
  flavour:
    "The coconut is a versatile gift from the gods, used to make nearly everything - including baskets to carry more coconuts.",
  inkwell: true,
  color: "sapphire",
  cost: 2,
  language: "EN",
  illustrator: "Milica Celikovic",
  number: 166,
  set: "TFC",
  rarity: "uncommon",
};
export const eyeOfTheFate: LorcanitoItemCard = {
  implemented: true,
  id: "44e7863c33e135335f206a14f1bdbe4bbb173046",
  url: "https://static.lorcanito.com/images/cards/TFC/167.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/167_en_eye_of_the_fates-716.webp",
  name: "Eye of the Fates",
  text: "**SEE THE FUTURE** ↷ − Chosen character gets +1 ◆ this turn.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "See the Future",
      text: "Chosen character gets +1 ◆ this turn.",
      optional: false,
      costs: [{ type: "exert" }],
      effects: [
        {
          type: "attribute",
          attribute: "lore",
          amount: 1,
          modifier: "add",
          duration: "turn",
        } as AttributeEffect,
      ],
      targets: {
        type: "card",
        value: 1,
        filters: [
          { filter: "type", value: "character" },
          { filter: "zone", value: "play" },
        ],
      },
    } as ActivatedAbility,
  ],
  flavour: "You can change the future once you know what you're looking at.",
  inkwell: true,
  color: "sapphire",
  cost: 4,
  language: "EN",
  illustrator: "Ron Baird",
  number: 167,
  set: "TFC",
  rarity: "uncommon",
};

export const fishboneQuill: LorcanitoItemCard = {
  implemented: true,
  id: "ab88bf1331a922de07edd2df9b58f68d9382093d",
  url: "https://static.lorcanito.com/images/cards/TFC/168.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/168_en_fishbone_quill-716.webp",
  name: "Fishbone Quill",
  text: "**GO AHEAD AND SIGN** ↷ − Put any card from your hand into your inkwell facedown.",
  type: "item",
  abilities: [
    {
      // This is same as One Jump Ahead
      type: "activated",
      name: "Go Ahead And Sign",
      text: "↷ − Put any card from your hand into your inkwell facedown.",
      effects: [
        {
          type: "move",
          to: "inkwell",
        },
      ],
      targets: {
        type: "card",
        value: 1,
        filters: [
          { filter: "owner", value: "self" },
          { filter: "zone", value: "hand" },
        ],
      },
      optional: false,
      costs: [{ type: "exert" }],
    } as ActivatedAbility,
  ],
  flavour:
    "“If you want to cross the bridge, my sweet, you've got to pay the toll.” \n−Ursula",
  inkwell: true,
  color: "sapphire",
  cost: 3,
  language: "EN",
  number: 168,
  set: "TFC",
  rarity: "rare",
  illustrator: "TBD",
};
export const magicGoldenFlower: LorcanitoItemCard = {
  implemented: true,
  id: "80c2d2a3d0c6b3cb465f1f8136077e7e5d9900ae",
  url: "https://static.lorcanito.com/images/cards/TFC/169.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/169_en_magic_golden_flower-716.webp",
  name: "Magic Golden Flower",
  text: "**HEALING POLLEN** Banish this item - Remove up to 3 damage from chosen character.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Healing Pollen",
      text: "Banish this item - Remove up to 3 damage from chosen character.",
      effects: [
        {
          type: "heal",
          amount: 3,
        },
      ],
      targets: {
        type: "card",
        value: 1,
        filters: [
          { filter: "owner", value: "self" },
          { filter: "type", value: "character" },
          { filter: "zone", value: "play" },
        ],
      },
      optional: false,
      costs: [{ type: "banish", target: "self" }],
    } as ActivatedAbility,
  ],
  flavour:
    "“Once upon a time, a single drop of sunlight fell from the heavens. . . .” \n−Flynn Rider",
  inkwell: true,
  color: "sapphire",
  cost: 1,
  language: "EN",
  illustrator: "Cory Godbey",
  number: 169,
  set: "TFC",
  rarity: "common",
};
export const scepterOfArendel: LorcanitoItemCard = {
  implemented: true,
  id: "a11f384d67f1a51bc742dd7ce95276ba603f19bf",
  url: "https://static.lorcanito.com/images/cards/TFC/170.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/170_en_scepter_of_arendelle-716.webp",
  name: "Scepter Of Arendelle",
  text: "**COMMAND** ↷ − Chosen character gains **Support** this turn. _(Whenever they quest, you may add their ※ to another chosen character's ※ this turn.)_",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Command",
      text: "Chosen character gains **Support** this turn.",
      costs: [{ type: "exert" }],
      effects: [
        {
          type: "ability",
          ability: "support",
          modifier: "add",
          duration: "turn",
        } as AbilityEffect,
      ],
      targets: {
        type: "card",
        value: 1,
        filters: [
          { filter: "zone", value: "play" },
          { filter: "type", value: "character" },
        ],
      },
      optional: false,
    } as ActivatedAbility,
  ],
  inkwell: true,
  color: "sapphire",
  cost: 1,
  language: "EN",
  illustrator: "Grace Tran",
  number: 170,
  set: "TFC",
  rarity: "uncommon",
};
export const beastMirror: LorcanitoItemCard = {
  implemented: true,
  id: "197c85b9c275b5b685e0577ca5cfde34ad21f3ad",
  url: "https://static.lorcanito.com/images/cards/TFC/201.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/201_en_beasts_mirror-716.webp",
  name: "Beast's Mirror",
  text: "**SHOW ME** ↷, 3 ⬡ - If you have no cards in your hand, draw a card.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Show Me",
      text: "↷, 3 ⬡ - If you have no cards in your hand, draw a card.",
      effects: [
        {
          type: "draw",
          amount: 1,
          target: {
            type: "player",
            value: "self",
          } as EffectTargets,
        },
      ],
      optional: false,
      conditions: [
        {
          type: "hand",
          amount: 0,
        },
      ],
      costs: [{ type: "exert" }, { type: "ink", amount: 3 }],
    } as ActivatedAbility,
  ],
  flavour:
    "Ashamed of his monstrous form, the Beast concealed himself inside his castle, with a magic mirror as his only window to the outside world.",
  inkwell: true,
  color: "steel",
  cost: 2,
  language: "EN",
  illustrator: "Samanta Erdini",
  number: 201,
  set: "TFC",
  rarity: "common",
};
export const fryingPan: LorcanitoItemCard = {
  implemented: true,
  id: "7387466163a37671c614ff1c50702740eef6a578",
  url: "https://static.lorcanito.com/images/cards/TFC/202.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/202_en_frying_pan-716.webp",
  name: "Frying Pan",
  text: "**CLANG!** Banish this item - Chosen character can't challenge during their next turn.",
  type: "item",
  abilities: [
    {
      type: "activated",
      optional: false,
      costs: [{ type: "banish", target: "self" }],
      effects: [
        {
          type: "restriction",
          restriction: "challenge",
          duration: "next_turn",
        } as RestrictionEffect,
      ],
      targets: {
        type: "card",
        value: 1,
        filters: [
          { filter: "type", value: "character" },
          { filter: "zone", value: "play" },
        ],
      },
    } as ActivatedAbility,
  ],
  flavour:
    "It's a fine piece of cookware, but as a weapon it's truly stunning.",
  inkwell: true,
  color: "steel",
  cost: 2,
  language: "EN",
  illustrator: "Kamil Murzyn",
  number: 202,
  set: "TFC",
  rarity: "uncommon",
};
export const musketeerTabard: LorcanitoItemCard = {
  implemented: true,
  id: "fec6b61460c28b56cbb861e72220e83ef55eac87",
  url: "https://static.lorcanito.com/images/cards/TFC/203.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/203_en_musketeer_tabard-716.webp",
  name: "Musketeer Tabard",
  text: "**ALL FOR ONE AND ONE FOR ALL** Whenever one of your characters with **Bodyguard** is banished, you may draw a card.",
  type: "item",
  abilities: [
    {
      type: "static-triggered",
      trigger: "banish",
      optional: true,
      targets: {
        type: "card",
        value: 1,
        // This is the trigger target
        filters: [
          { filter: "owner", value: "self" },
          { filter: "type", value: "character" },
          // TODO: This should have been ability
          { filter: "ability", value: "bodyguard" },
        ],
      },
      effects: [
        {
          type: "draw",
          amount: 1,
          target: {
            type: "player",
            value: "self",
          },
        } as DrawEffect,
      ],
    } as StaticTriggeredAbility,
  ],
  flavour: "There's no such thing as a lone musketeer.",
  color: "steel",
  cost: 4,
  language: "EN",
  illustrator: "Dav Augereau / Guykua Ruva",
  number: 203,
  set: "TFC",
  rarity: "rare",
};
export const plasmaBlaster: LorcanitoItemCard = {
  implemented: true,
  id: "9e8f180f327b8a7a81fbaa3f558989d400411b45",
  url: "https://static.lorcanito.com/images/cards/TFC/204.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/204_en_plasma_blaster-716.webp",
  name: "Plasma Blaster",
  text: "**QUICK SHOT** ↷, 2 ⬡ − Deal 1 damage to chosen character.",
  type: "item",
  abilities: [
    {
      type: "activated",
      name: "Quick Shot",
      text: "↷, 2 ⬡ − Deal 1 damage to chosen character.",
      effects: [
        {
          type: "damage",
          amount: 1,
        },
      ],
      targets: {
        type: "card",
        value: 1,
        filters: [
          { filter: "type", value: "character" },
          { filter: "zone", value: "play" },
        ],
      },
      costs: [{ type: "exert" }, { type: "ink", amount: 2 }],
      optional: false,
    } as ActivatedAbility,
  ],
  flavour:
    "“You don't have to say 'pew pew' when you use it, but it doesn't hurt.” \n−Lilo, galactic hero",
  color: "steel",
  cost: 3,
  language: "EN",
  number: 204,
  set: "TFC",
  rarity: "rare",
  illustrator: "TBD",
};
