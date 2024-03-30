import { DeckTextArea } from "~/client/table/deckbuilder/DeckTextArea";
import { Button } from "~/client/components/button/Button";
import { useDeckImport } from "~/client/providers/DeckImportProvider";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";

export function ImportDeckTab(props: {
  playerHasJoined: boolean;
  changeTab: () => void;
}) {
  logAnalyticsEvent("import_deck_tab");

  return (
    <div className="flex w-full flex-col justify-center">
      <DeckTextArea
        playerHasJoined={props.playerHasJoined}
        changeTab={props.changeTab}
      />
    </div>
  );
}
