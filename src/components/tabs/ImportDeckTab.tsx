import { DeckTextArea } from "~/spaces/table/deckbuilder/DeckTextArea";
import { Button } from "~/components/button/Button";
import { useDeckImport } from "~/providers/DeckImportProvider";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";

export function ImportDeckTab(props: {
  playerHasJoined: boolean;
  changeTabToDeckStatus: () => void;
}) {
  const { parseAndUpdateDeck } = useDeckImport();
  logAnalyticsEvent("import_deck_tab");

  return (
    <div className="flex w-full flex-col justify-center">
      <DeckTextArea playerHasJoined={props.playerHasJoined} />
      <Button
        invert
        onClick={async () => {
          await parseAndUpdateDeck();
          props.changeTabToDeckStatus();
        }}
        className={
          "item-center flex w-full justify-center py-2 font-mono !text-xl uppercase"
        }
      >
        IMPORT DECK
      </Button>
    </div>
  );
}
