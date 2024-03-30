import React from "react";
import { DndProvider as ReactDnD } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

import { type Zones } from "@lorcanito/engine";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";

type Dragging = { instanceId: string; from: Zones } | null;
const Context = React.createContext<{
  cardDragging: Dragging;
  setCardDragging: (drag: Dragging) => void;
}>({ cardDragging: null, setCardDragging: () => {} });

export const DnDProvider: React.FC<{
  children: React.ReactNode;
  isMobile: boolean;
}> = ({ children, isMobile }) => {
  const [cardDragging, setCardDragging] = React.useState<Dragging>(null);

  if (isMobile) {
    console.log("Using TouchBackend");
    logAnalyticsEvent("mobile_device");
  }

  return (
    <ReactDnD backend={isMobile ? TouchBackend : HTML5Backend}>
      <Context.Provider value={{ cardDragging, setCardDragging }}>
        {children}
      </Context.Provider>
    </ReactDnD>
  );
};

export const useDnDContext = () => React.useContext(Context);
