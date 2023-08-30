import useSound from "use-sound";
import { usePrevious } from "~/hooks/usePrevious";
import { useEffect } from "react";
import { useGame } from "~/engine/rule-engine/lib/GameControllerProvider";

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

  const [game] = useGame();
  const previousGame = usePrevious(game);

  useEffect(() => {
    if (previousGame?.turnPlayer !== game.turnPlayer) {
      passTurn();
    }
  }, [previousGame, game]);
}
