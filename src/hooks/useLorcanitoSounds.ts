import useSound from "use-sound";
import { usePrevious } from "~/hooks/usePrevious";
import { useEffect } from "react";
import { useGameStore } from "~/engine/lib/GameStoreProvider";

export function useLorcanitoSounds() {
  const [passTurn] = useSound(
    "https://play.lorcanito.com/sounds/pass-turn.ogg",
    {
      volume: 0.5,
    }
  );
  const [playChar] = useSound(
    "https://play.lorcanito.com/sounds/pass-character.mp3",
    { volume: 0.5 }
  );

  const store = useGameStore();
  const previousGame = usePrevious(store.turnPlayer);

  useEffect(() => {
    if (previousGame !== store.turnPlayer) {
      passTurn();
    }
  }, [previousGame, store.turnPlayer]);
}
