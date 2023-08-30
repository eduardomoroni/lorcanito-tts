import { Tabs } from "~/components/tabs/Tabs";
import { DeckTextArea } from "~/spaces/table/deckbuilder/DeckTextArea";
import { Button } from "~/components/button/Button";

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
