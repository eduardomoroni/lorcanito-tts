import SlideOver from "~/components/SlideOver";
import { SlideOverContent } from "~/spaces/table/GameSettings";
import React from "react";
import { useConfirmationModal } from "~/providers/ConfirmationModalProvider";
import { useDeckImport } from "~/providers/DeckImportProvider";
import { api } from "~/utils/api";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import { useTurn } from "~/engine/GameProvider";

export function GameSettingsSlideOver(props: {
  open: boolean;
  onClose: () => void;
  gameId: string;
  playerId: string;
}) {
  const { parseAndUpdateDeck } = useDeckImport();
  const { restartGame } = useTurn();

  const confirm = useConfirmationModal(
    "Your deck has been updated",
    "Would you like to restart the game? This will reset the board and the turn order"
  );

  return (
    <SlideOver
      title="Game Settings"
      open={props.open}
      onClose={props.onClose}
      onSave={() => {
        parseAndUpdateDeck();
        logAnalyticsEvent("import_deck");

        // TODO remove this reload, it's only there to work around a but where afteer loading a game people cant move cards
        // window.location.reload();
        props.onClose();

        confirm(async () => {
          restartGame();
        });
      }}
    >
      <SlideOverContent />
    </SlideOver>
  );
}
