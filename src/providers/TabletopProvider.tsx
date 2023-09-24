"use client";
// TODO: Remove this
import { createContext, useState } from "react";
import type { Game } from "~/libs/game";

import { LorcanitoCard } from "~/engine/cards/cardTypes";
import { ContinuousEffect } from "~/engine/rules/effects/effectTypes";

export type Meta = {
  exerted?: boolean | null;
  playedThisTurn?: boolean | null;
  damage?: number | null;
  shifter?: string | null;
  shifted?: string | null;
  revealed?: boolean | null;
  continuousEffects?: string[];
};

export type TableCard = {
  instanceId: string;
  cardId: string;
  ownerId: string;
  meta?: Meta | null;
};

export type DeckCard = {
  cardId: string;
  qty: number;
  card: LorcanitoCard;
};
export type Deck = Array<DeckCard>;

export type TableZones = Record<Zones, string[] | undefined>;

export type Table = {
  //TODO: add game id
  zones: TableZones;
  lore: number;
  readyToStart?: boolean;
};

type ContextType = string;

const initialState: ContextType = "";

export type Zones = "hand" | "play" | "discard" | "inkwell" | "deck";

const TabletopContext = createContext(initialState);

export function TabletopProvider({
  children,
  game,
}: {
  children: JSX.Element;
  game: Game;
  playerId?: string;
}) {
  const [gameId] = useState(game.id);

  return (
    <TabletopContext.Provider value={gameId}>
      {children}
    </TabletopContext.Provider>
  );
}
