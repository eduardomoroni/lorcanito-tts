import type { LorcanitoCharacterCard } from "@lorcanito/engine";

export const characterMock: LorcanitoCharacterCard = {
  implemented: true,
  id: "supersecretid",
  url: "https://six-inks.pages.dev/assets/images/cards/EN/001/57.webp",
  alternativeUrl:
    "https://images.lorcania.com/cards/tfc/57_en_the_wardrobe-716.webp",
  name: "Character",
  title: "Mock",
  characteristics: ["dreamborn", "ally"],
  type: "character",
  flavour: "When you simply must have the hautest couture.",
  inkwell: true,
  color: "amethyst",
  cost: 3,
  strength: 3,
  willpower: 4,
  lore: 1,
  language: "EN",
  illustrator: "Giulia Riva",
  number: 57,
  set: "TFC",
  rarity: "common",
};
