import type { LorcanitoCard } from "@lorcanito/engine/cards/cardTypes";
import { allTFCCards, allTFCCardsById } from "@lorcanito/engine/cards/TFC";
import { allROFCards, allROFCardsById } from "@lorcanito/engine/cards/ROF";
import { allITICards, allITICardsById } from "@lorcanito/engine/cards/ITI";

export const allCards: LorcanitoCard[] = [
  ...allTFCCards,
  ...allROFCards,
  ...allITICards,
];
export const allCardsById: Record<string, LorcanitoCard> = {
  ...allTFCCardsById,
  ...allROFCardsById,
  ...allITICardsById,
};
