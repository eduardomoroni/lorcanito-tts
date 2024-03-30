import { Button } from "~/client/components/button/Button";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";

export function HandSimulatorTab() {
  logAnalyticsEvent("hand_simulator_tab");

  return (
    <div className="flex w-full flex-col justify-center">
      <Button
        invert
        className={
          "item-center flex w-full justify-center py-2 font-mono !text-xl uppercase"
        }
      >
        NOT IMPLEMENTED YET
      </Button>
    </div>
  );
}
