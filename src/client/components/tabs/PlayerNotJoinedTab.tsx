import { Tabs } from "~/client/components/tabs/Tabs";
import { DeckTextArea } from "~/client/table/deckbuilder/DeckTextArea";
import { Button } from "~/client/components/button/Button";

export function PlayerNotJoinedTab(props: { playerHasJoined: boolean }) {
  return (
    <div className="flex w-full flex-col justify-center">
      <Button
        invert
        className={
          "item-center flex w-full justify-center py-2 font-mono !text-xl uppercase"
        }
      >
        NOT JOINED
      </Button>
    </div>
  );
}
