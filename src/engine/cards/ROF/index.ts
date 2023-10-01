export type LorcanitoCard = {
  id: string;
  implemented: boolean;
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
  abilities?: Array<any>;
  rarity?: string;
  alternativeUrl?: string;
};

export const zeroToHero: LorcanitoCard = {
  id: "0b2669219f7e9b35f4b810c23f83a817fcfe9f6c",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/32.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/32_en_zero_to_hero-716.webp",
  name: "Zero To Hero",
  characteristics: ["action", "song"],
  text: "_A character with cost 2 or more can ↷ to sing this song for free.)_<br>\nCount the number of characters you have in play. You pay that amount of ⬡ less for the next character you play this turn.",
  type: "action",
  abilities: [
    {
      name: "_A character with cost 2 or more can ↷ to sing this song for free.)_",
    },
    {
      name: "Count the number of characters you have in play. You pay that amount of ⬡ less for the next character you play this turn.",
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
export const imStuck: LorcanitoCard = {
  id: "28fff0270d9d27ada8cb0e8adbe37e915992a5c2",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/63.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/63_en_im_stuck-716.webp",
  name: "I'm Stuck!",
  characteristics: ["action"],
  text: "Chosen exerted character can't ready at the start of their next turn.",
  type: "action",
  abilities: [
    {
      name: "Chosen exerted character can't ready at the start of their next turn.",
    },
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
export const bounce: LorcanitoCard = {
  id: "339d7f4e4320a90c2026d8e341a2d2cc0960b61b",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/97.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/97_en_bounce-716.webp",
  name: "Bounce",
  characteristics: ["action"],
  text: "Return chosen character of yours to your hand to return another chosen character to their player's hand.",
  type: "action",
  abilities: [
    {
      name: "Return chosen character of yours to your hand to return another chosen character to their player's hand.",
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
export const hypnotize: LorcanitoCard = {
  id: "c9c15e0fa9c9ca1c6216c4a0d708dd35fecdaaf5",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/98.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/98_en_hypnotize-716.webp",
  name: "Hypnotize",
  characteristics: ["action"],
  text: "Each opponent chooses and discards a card. Draw a card.",
  type: "action",
  abilities: [
    { name: "Each opponent chooses and discards a card. Draw a card." },
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
export const mickeyMouseFriendlyFace: LorcanitoCard = {
  id: "68c4144594ee11c60d025ac3348d1e89076bc1c1",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/13.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/13_en_mickey_mouse-716.webp",
  name: "Mickey Mouse",
  title: "Friendly Face",
  characteristics: ["hero", "storyborn"],
  text: "**GLAD YOU’RE HERE!** Whenever this character quests, you pay 3 ⬡ less for the next character you play this turn.",
  type: "character",
  abilities: [
    {
      name: "**GLAD YOU’RE HERE!** Whenever this character quests, you pay 3 ⬡ less for the next character you play this turn.",
    },
  ],
  flavour: "“Come on in−there’s lots to explore.”",
  inkwell: true,
  color: "amber",
  cost: 6,
  strength: 1,
  willpower: 6,
  lore: 3,
  language: "EN",
  illustrator: "Veronica Di Lorenzo / Livio Cacciatore",
  number: 13,
  set: "ROF",
  rarity: "super_rare",
};
export const theQueenCommandingPresence: LorcanitoCard = {
  id: "43e3e500b2ecc64caa46239d0d0da017f85f2f0c",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/26.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/26_en_the_queen-716.webp",
  name: "The Queen",
  title: "Commanding Presence",
  characteristics: ["floodborn", "queen", "villain"],
  text: "**Shift** 2 _You may pay 2 ⬡ to play this on top of one of your characters named The Queen.)_<br>\n**WHO IS THE FAIREST?** Whenever this character quests, chosen opposing character gets -4 ※ this turn and chosen character gets +4 ※ this turn.",
  type: "character",
  abilities: [
    {
      name: "**Shift** 2 _You may pay 2 ⬡ to play this on top of one of your characters named The Queen.)_",
    },
    {
      name: "**WHO IS THE FAIREST?** Whenever this character quests, chosen opposing character gets -4 ※ this turn and chosen character gets +4 ※ this turn.",
    },
  ],
  inkwell: true,
  color: "amber",
  cost: 5,
  strength: 4,
  willpower: 3,
  lore: 2,
  language: "EN",
  illustrator: "Matthew Robert Davies / LadyShalirin",
  number: 26,
  set: "ROF",
  rarity: "super_rare",
};
export const elsaGlovesOff: LorcanitoCard = {
  id: "d5bdfe3238e72a077a2388e36b4f620ba3a037d6",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/39.webp",
  alternativeUrl: "https://images.lorcania.com/cards/rotf/39_en_elsa-716.webp",
  name: "Elsa",
  title: "Gloves Off",
  characteristics: ["hero", "queen", "sorcerer", "storyborn"],
  text: "**Challenger** +3 _(While challenging, this character gets +3 ※)_",
  type: "character",
  abilities: [
    {
      name: "**Challenger** +3 _(While challenging, this character gets +3 ※)_",
    },
  ],
  flavour:
    "The power of ice may not stop the flood, but it will help protect Lorcana.",
  inkwell: true,
  color: "amethyst",
  cost: 4,
  strength: 3,
  willpower: 4,
  lore: 1,
  language: "EN",
  illustrator: "Cristian Romero",
  number: 39,
  set: "ROF",
  rarity: "common",
};
export const merlinShapeshifter: LorcanitoCard = {
  id: "2759168f337f36f4bc8f2799daea1eabba9aa571",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/53.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/53_en_merlin-716.webp",
  name: "Merlin",
  title: "Shapeshifter",
  characteristics: ["sorcerer", "storyborn", "mentor"],
  text: "**BATTLE OF WITS** Whenever one of your other characters is returned to your hand from play, this character gets +1 ◆ this turn.",
  type: "character",
  abilities: [
    {
      name: "**BATTLE OF WITS** Whenever one of your other characters is returned to your hand from play, this character gets +1 ◆ this turn.",
    },
  ],
  flavour: "“Oh, blast it all−I can’t make up my mind.”",
  inkwell: true,
  color: "amethyst",
  cost: 4,
  strength: 1,
  willpower: 5,
  lore: 1,
  language: "EN",
  illustrator: "Matthew Robert Davies",
  number: 53,
  set: "ROF",
  rarity: "rare",
};
export const winnieThePoohHunnyWizard: LorcanitoCard = {
  id: "5dd21c0a20360c7883b4f263bd6a4ee1fdd63047",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/59.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/59_en_winnie_the_pooh-716.webp",
  name: "Winnie The Pooh",
  title: "Hunny Wizard",
  characteristics: ["hero", "dreamborn", "sorcerer"],
  type: "character",
  flavour:
    "He’d always felt a kinship with honey. They were both golden, and sweet, and likely to end up in sticky situations.",
  inkwell: true,
  color: "amethyst",
  cost: 5,
  strength: 5,
  willpower: 5,
  lore: 2,
  language: "EN",
  illustrator: "John Loren",
  number: 59,
  set: "ROF",
  rarity: "common",
};
export const belleHiddenArcher: LorcanitoCard = {
  id: "c013956c1b7df9fbdf49de723aeefa23db0a6c6e",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/72.webp",
  alternativeUrl: "https://images.lorcania.com/cards/rotf/72_en_belle-716.webp",
  name: "Belle",
  title: "Hidden Archer",
  characteristics: ["hero", "floodborn", "princess"],
  text: "**Shift** 3 _You may pay 3 ⬡ to play this on top of one of your characters named Belle.)_<br>\n**THORNY ARROWS** Whenever this character is challenged, the challenging character’s player discards all cards in their hand.",
  type: "character",
  abilities: [
    {
      name: "**Shift** 3 _You may pay 3 ⬡ to play this on top of one of your characters named Belle.)_",
    },
    {
      name: "**THORNY ARROWS** Whenever this character is challenged, the challenging character’s player discards all cards in their hand.",
    },
  ],
  flavour: "She slips through the trees as easily as shadow.",
  color: "emerald",
  cost: 5,
  strength: 3,
  willpower: 3,
  lore: 3,
  language: "EN",
  illustrator: "Aisha Durmagambetova",
  number: 72,
  set: "ROF",
  rarity: "legendary",
};
export const flynnRiderConfidentVagabond: LorcanitoCard = {
  id: "cf8ae4048e63fda8c27f02011d35edba58ca7ad9",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/81.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/81_en_flynn_rider-716.webp",
  name: "Flynn Rider",
  title: "Confident Vagabond",
  characteristics: ["hero", "storyborn", "prince"],
  type: "character",
  flavour:
    "“I love a good fan club, but they could at least <b>try</b> to get the nose right!”",
  inkwell: true,
  color: "emerald",
  cost: 1,
  strength: 1,
  willpower: 3,
  lore: 1,
  language: "EN",
  illustrator: "Ron Baird",
  number: 81,
  set: "ROF",
  rarity: "common",
};
export const mulanSoldierInTraining: LorcanitoCard = {
  id: "dd84c79b49e2ca943716788b6d19fd9785900cfc",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/117.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/117_en_mulan-716.webp",
  name: "Mulan",
  title: "Soldier in Training",
  characteristics: ["hero", "storyborn", "princess"],
  text: "**Rush** _(This character can challenge the turn they're played.)_",
  type: "character",
  abilities: [
    {
      name: "**Rush** _(This character can challenge the turn they're played.)_",
    },
  ],
  flavour: "“I have to do something!”",
  color: "ruby",
  cost: 4,
  strength: 4,
  willpower: 3,
  lore: 1,
  language: "EN",
  illustrator: "Michael “Cookie” Niewiadomy",
  number: 117,
  set: "ROF",
  rarity: "common",
};
export const rayaWarriorOfKumandra: LorcanitoCard = {
  id: "70535e3eef06187f0780376d6c899efc0ae35e22",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/124.webp",
  alternativeUrl: "https://images.lorcania.com/cards/rotf/124_en_raya-716.webp",
  name: "Raya",
  title: "Warrior of Kumandra",
  characteristics: ["hero", "storyborn", "princess"],
  type: "character",
  flavour: "“My ba dreams of a united Kumandra. I fight to honor that dream.”",
  inkwell: true,
  color: "ruby",
  cost: 4,
  strength: 5,
  willpower: 3,
  lore: 1,
  language: "EN",
  illustrator: "Matthew Robert Davies",
  number: 124,
  set: "ROF",
  rarity: "uncommon",
};
export const cogsworthGrandfatherClock: LorcanitoCard = {
  id: "fbb62ca9d20391c165dd54f5e697e52ccf5295bc",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/142.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/142_en_cogsworth-716.webp",
  name: "Cogsworth",
  title: "Grandfather Clock",
  characteristics: ["floodborn", "ally"],
  text: "**Shift** 3 _You may pay 3 ⬡ to play this on top of one of your characters named Cogsworth.)_<br>\n**Ward** _(Opponents can't choose this character except to challenge.)_\n\n**UNWIND** Your other characters gain **Resist +1** _(Damage dealt to them is reduced by 1.)_",
  type: "character",
  abilities: [
    {
      name: "**Shift** 3 _You may pay 3 ⬡ to play this on top of one of your characters named Cogsworth.)_",
    },
    {
      name: "**Ward** _(Opponents can't choose this character except to challenge.)_\n\n**UNWIND** Your other characters gain **Resist +1** _(Damage dealt to them is reduced by 1.)_",
    },
  ],
  inkwell: true,
  color: "sapphire",
  cost: 5,
  strength: 2,
  willpower: 5,
  lore: 2,
  language: "EN",
  illustrator: "Isaiah Mesq",
  number: 142,
  set: "ROF",
  rarity: "super_rare",
};
export const cogsworthTalkingClock: LorcanitoCard = {
  id: "db489df09db8677179973b8729b06fb664543a4e",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/143.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/143_en_cogsworth-716.webp",
  name: "Cogsworth",
  title: "Talking Clock",
  characteristics: ["storyborn", "ally"],
  text: "**WAIT A MINUTE** Your character with **Reckless** gain “↷ − Gain 1 lore.”",
  type: "character",
  abilities: [
    {
      name: "**WAIT A MINUTE** Your character with **Reckless** gain “↷ − Gain 1 lore.”",
    },
  ],
  flavour: "“This has gone far enough. I'm charge here.”",
  inkwell: true,
  color: "sapphire",
  cost: 2,
  strength: 2,
  willpower: 3,
  lore: 1,
  language: "EN",
  illustrator: "Leonardo Giammichele",
  number: 143,
  set: "ROF",
  rarity: "uncommon",
};
export const gastonIntellectualPowerhouse: LorcanitoCard = {
  id: "636d6058f7dbcae7d604ca27a3bc536a15686f8f",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/147.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/147_en_gaston-716.webp",
  name: "Gaston",
  title: "Intellectual Powerhouse",
  characteristics: ["floodborn", "villain"],
  text: "**Shift** 4 _You may pay 4 ⬡ to play this on top of one of your characters named Gaston.)_<br>\n**DEVELOPED BRAIN** When you play this character, look at the top 3 cards of your deck. You may put one into your hand. Put the rest on the bottom of your deck in any order.",
  type: "character",
  abilities: [
    {
      name: "**Shift** 4 _You may pay 4 ⬡ to play this on top of one of your characters named Gaston.)_",
    },
    {
      name: "**DEVELOPED BRAIN** When you play this character, look at the top 3 cards of your deck. You may put one into your hand. Put the rest on the bottom of your deck in any order.",
    },
  ],
  color: "sapphire",
  cost: 6,
  strength: 4,
  willpower: 4,
  lore: 3,
  language: "EN",
  illustrator: "Matthew Robert Davies",
  number: 147,
  set: "ROF",
  rarity: "rare",
};
export const cinderellaStouthearted: LorcanitoCard = {
  id: "0af9cffaca1d8f655baa2a738b9312f073ef26bd",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/177.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/177_en_cinderella-716.webp",
  name: "Cinderella",
  title: "Stouthearted",
  characteristics: ["hero", "floodborn", "princess", "knight"],
  text: "**Shift** 5 _You may pay 5 ⬡ to play this on top of one of your characters named Cinderella.)_<br>\n**Resist** +2 _(Damage dealt to this character is reduced by 2.)_<br>\n**THE SINGING SWORD** Whenever you play a song, this character may challenge ready characters this turn.",
  type: "character",
  abilities: [
    {
      name: "**Shift** 5 _You may pay 5 ⬡ to play this on top of one of your characters named Cinderella.)_",
    },
    {
      name: "**Resist** +2 _(Damage dealt to this character is reduced by 2.)_",
    },
    {
      name: "**THE SINGING SWORD** Whenever you play a song, this character may challenge ready characters this turn.",
    },
  ],
  inkwell: true,
  color: "steel",
  cost: 7,
  strength: 5,
  willpower: 5,
  lore: 3,
  language: "EN",
  illustrator: "Grace Tran",
  number: 177,
  set: "ROF",
  rarity: "super_rare",
};
export const thePrinceNeverGivesUp: LorcanitoCard = {
  id: "5a6355bf39b651c0969512f57b7fc4c8a36cdd00",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/195.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/195_en_the_prince-716.webp",
  name: "The Prince",
  title: "Never Gives Up",
  characteristics: ["hero", "dreamborn", "prince"],
  text: "**Bodyguard** _(This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.)_\n\n**Resist** +1 _(Damage dealt to this character is reduced by 1.)_",
  type: "character",
  abilities: [
    {
      name: "**Bodyguard** _(This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.)_\n\n**Resist** +1 _(Damage dealt to this character is reduced by 1.)_",
    },
  ],
  inkwell: true,
  color: "steel",
  cost: 3,
  strength: 1,
  willpower: 3,
  lore: 2,
  language: "EN",
  illustrator: "Eri Welli",
  number: 195,
  set: "ROF",
  rarity: "uncommon",
};
export const tianaCelebratingPrincess: LorcanitoCard = {
  id: "9f774c96f59278668df6b90514173035e7f34368",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/196.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/196_en_tiana-716.webp",
  name: "Tiana",
  title: "Celebrating Princess",
  characteristics: ["hero", "dreamborn", "princess"],
  text: "**Resist** +2 _(Damage dealt to this character is reduced by 2.)_<br>\n**WHAT YOU GIVE IS WHAT YOU GET** While this character is exerted and you have no cards in your hand, opponents can’t play actions.",
  type: "character",
  abilities: [
    {
      name: "**Resist** +2 _(Damage dealt to this character is reduced by 2.)_",
    },
    {
      name: "**WHAT YOU GIVE IS WHAT YOU GET** While this character is exerted and you have no cards in your hand, opponents can’t play actions.",
    },
  ],
  color: "steel",
  cost: 4,
  strength: 1,
  willpower: 4,
  lore: 2,
  language: "EN",
  illustrator: "Matthew Robert Davies",
  number: 196,
  set: "ROF",
  rarity: "super_rare",
};
export const theSorcerersSpellbook: LorcanitoCard = {
  id: "8d1f35f19f360c4d82f45cfb6778b1f36e52dbb6",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/68.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/68_en_the_sorcerers_spellbook-716.webp",
  name: "The Sorcerer's Spellbook",
  characteristics: ["item"],
  text: "**KNOWLEDGE** ↷, 1 ⬡ − Gain 1 lore.",
  type: "item",
  abilities: [{ name: "**KNOWLEDGE** ↷, 1 ⬡ − Gain 1 lore." }],
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
export const dinnerBell: LorcanitoCard = {
  id: "6ef003c3d6b8c58ceeac8a19bf6895d939bfb5e5",
  implemented: false,
  url: "https://lorcanito.imgix.net/images/cards/EN/002/134.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/rotf/134_en_dinner_bell-716.webp",
  name: "Dinner Bell",
  characteristics: ["item"],
  text: "**YOU KNOW WHAT HAPPENS** ↷, 2 ⬡ − Draw cards equal to the damage on chosen character of yours, then banish them.",
  type: "item",
  abilities: [
    {
      name: "**YOU KNOW WHAT HAPPENS** ↷, 2 ⬡ − Draw cards equal to the damage on chosen character of yours, then banish them.",
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

export const allROFCards: LorcanitoCard[] = [
  zeroToHero,
  imStuck,
  bounce,
  hypnotize,
  mickeyMouseFriendlyFace,
  theQueenCommandingPresence,
  elsaGlovesOff,
  merlinShapeshifter,
  winnieThePoohHunnyWizard,
  belleHiddenArcher,
  flynnRiderConfidentVagabond,
  mulanSoldierInTraining,
  rayaWarriorOfKumandra,
  cogsworthGrandfatherClock,
  cogsworthTalkingClock,
  gastonIntellectualPowerhouse,
  cinderellaStouthearted,
  thePrinceNeverGivesUp,
  tianaCelebratingPrincess,
  theSorcerersSpellbook,
  dinnerBell,
];
export const allROFCardsById: Record<string, LorcanitoCard> = {};
allROFCards.forEach((card) => (allROFCardsById[card.id] = card));
