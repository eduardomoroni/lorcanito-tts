import React from "react";
import { ZoneOverlay } from "~/spaces/components/ZoneOverlay";

export const TableOverlay: React.FC<{
  position: "bottom" | "top";
  noCards: boolean;
  notJoined: boolean;
}> = ({ position, notJoined, noCards }) => {
  if (notJoined) {
    return (
      <div className="relative flex h-full w-full rounded-lg border border-solid border-slate-700">
        <div className="flex h-full w-36 grow">
          <ZoneOverlay>
            <div className="m-4">
              {position === "top" ? (
                <span>
                  No opponent has joined, if you want to play with someone. Go
                  back to lobby and the the link with them.
                </span>
              ) : (
                <span>
                  You have not joined this game, go to game setting (top right
                  corner) and click on Join game
                </span>
              )}
            </div>
          </ZoneOverlay>
        </div>
      </div>
    );
  }

  // Case where they joined the but but hasn't imported a deck yet
  if (noCards) {
    return (
      <div className="relative flex h-full w-full rounded-lg border border-solid border-slate-700">
        <div className="flex h-full w-36 grow">
          <ZoneOverlay>
            <div className="m-4">
              {position === "top" ? (
                <span>Waiting for opponent to import their deck.</span>
              ) : (
                <span>
                  You have joined the table, but you haven't imported a deck
                  yet. Go ahead and import a deck.
                  <br />
                  You can do this by clicking on the settings icon on the top
                  right corner.
                </span>
              )}
            </div>
          </ZoneOverlay>
        </div>
      </div>
    );
  }

  return null;
};
