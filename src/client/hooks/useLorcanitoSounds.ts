import useSound from "use-sound";
import { usePrevious } from "~/client/hooks/usePrevious";
import { useEffect } from "react";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import { GameLobby } from "~/libs/game";

export function useLorcanitoSounds() {
  const [passTurn] = useSound(
    "https://play.lorcanito.com/sounds/pass-turn.ogg",
    {
      volume: 0.5,
    },
  );
  const [playChar] = useSound(
    "https://play.lorcanito.com/sounds/play-character.mp3",
    { volume: 0.5 },
  );

  const [loreGained] = useSound(
    "https://play.lorcanito.com/sounds/lore-increase.ogg",
    { volume: 0.5 },
  );

  const [loreLost] = useSound(
    "https://play.lorcanito.com/sounds/lore-decrease.ogg",
    { volume: 0.5 },
  );

  const store = useGameStore();
  const previousGame = usePrevious(store.toJSON());

  useEffect(() => {
    if (previousGame?.turnPlayer !== store.turnPlayer) {
      passTurn();
    }
  }, [previousGame?.turnPlayer, store.turnPlayer]);

  // TODO: I have not tested this, it could be broken
  const tables = Object.keys(store.tableStore.tables);
  const lores = tables.map((table) => store.tableStore.getTable(table).lore);

  useEffect(() => {
    const prevTables = Object.keys(previousGame?.tables || {});
    const prevLores = prevTables.map(
      (table) => previousGame?.tables[table]?.lore || 0,
    );

    lores.forEach((lore, index) => {
      const prevLore = prevLores[index];

      if (prevLore) {
        if (lore > prevLore) {
          loreGained();
        } else if (lore < prevLore) {
          loreLost();
        }
      }
    });
  }, lores);
}

export function useLobbySounds(gameLobby?: GameLobby) {
  const [joined] = useSound(
    "https://play.lorcanito.com/sounds/player-joined.ogg",
    {
      volume: 0.75,
    },
  );

  const [left] = useSound("https://play.lorcanito.com/sounds/player-left.ogg", {
    volume: 0.75,
  });

  if (!gameLobby) {
    return;
  }

  const previousPlayers = usePrevious(gameLobby.players);
  const previousPlayerCount = Object.keys(previousPlayers || {}).length;
  const playerCount = Object.keys(gameLobby.players || {}).length;
  useEffect(() => {
    if (previousPlayerCount < playerCount) {
      joined();
    } else if (previousPlayerCount > playerCount) {
      left();
    }
  }, [playerCount, previousPlayerCount]);
}
