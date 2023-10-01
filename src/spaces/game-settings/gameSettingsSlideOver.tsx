import { SlideOverContent } from "~/spaces/game-settings/GameSettings";
import React from "react";
import { useConfirmationModal } from "~/spaces/providers/ConfirmationModalProvider";
import SlideOver from "../components/SlideOver";
export function GameSettingsSlideOver(props: {
  open: boolean;
  onClose: () => void;
  gameId: string;
  playerId: string;
}) {
  const confirm = useConfirmationModal(
    "Your deck has been updated",
    "Would you like to restart the game? This will reset the board and the turn order",
  );

  return (
    <SlideOver
      title="Game Settings"
      open={props.open}
      onClose={props.onClose}
      onSave={() => {
        props.onClose();
      }}
    >
      <SlideOverContent />
    </SlideOver>
  );
}
