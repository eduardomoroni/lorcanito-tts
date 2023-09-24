import type { LorcanitoCard } from "~/engine/cards/cardTypes";
import { allTFCCards, allTFCCardsById } from "~/engine/cards/TFC";

export const allCards: LorcanitoCard[] = allTFCCards;
export const allCardsById: Record<string, LorcanitoCard> = allTFCCardsById;
