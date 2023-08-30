import { FC } from "react";
import { useIsPresent } from "~/providers/presence/PresenceProvider";

export const PlayerOfflineBanner: FC<{ playerId: string }> = (props) => {
  const isOnline = useIsPresent(props.playerId);

  if (isOnline) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-1/3 z-10 sm:flex sm:justify-center sm:px-6 sm:pb-5 lg:px-8">
      <div className="pointer-events-auto flex items-center justify-between gap-x-6 bg-gray-900 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
        <p className="text-sm leading-6 text-white">
          <a href="#">
            <strong className="font-semibold">Player is offline</strong>
            <svg
              viewBox="0 0 2 2"
              className="mx-2 inline h-0.5 w-0.5 fill-current"
              aria-hidden="true"
            >
              <circle cx={1} cy={1} r={1} />
            </svg>
            they will reconnect automatically, but it can also be that they left
            the game.
          </a>
        </p>
      </div>
    </div>
  );
};
