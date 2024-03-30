export type GameLobby = {
  id: string;
  name: string;
  gameId: string;
  ownerId: string;
  visibility: "public" | "private";
  players: Record<string, boolean>;
  deckLists: Record<string, string>;
  lastActivity?: string;
  wonDieRoll?: string | null;
  gameStarted: boolean;
};
