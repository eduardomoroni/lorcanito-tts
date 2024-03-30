import React, { type FC, useEffect, useState } from "react";
import { LinkIcon, PlusIcon } from "@heroicons/react/20/solid";
import { api } from "~/libs/api";
import { copyTextToClipboard } from "~/libs/copyToClipboard";
import { useAuth, useDatabase } from "reactfire";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import { useDebounce } from "~/libs/useDebounce";
import { useIsPresent } from "~/client/providers/presence/PresenceProvider";
import { useGameLobby } from "~/client/providers/lobby/GameLobbyProvider";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import { usePlayerNickname } from "~/client/providers/GameProvider";
import { GermanyFlag } from "~/client/game-settings/flags/de";
import { USAFlag } from "~/client/game-settings/flags/usa";
import { FranceFlag } from "~/client/game-settings/flags/fr";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Toggle } from "~/client/components/toggle/Toggle";
import { useGameController } from "~/client/hooks/useGameController";
import { updateNickName } from "~/libs/3rd-party/firebase/nickName";

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const statuses = {
  offline: "text-gray-500 bg-gray-100/10",
  online: "text-green-400 bg-green-400/10",
  error: "text-rose-400 bg-rose-400/10",
};

const Player: FC<{
  isCurrentUser: boolean;
  isOwner: boolean;
  playerId: string;
  gameId: string;
}> = ({ isCurrentUser, playerId, gameId, isOwner }) => {
  const nickName = usePlayerNickname(playerId);
  const isPresent = useIsPresent(playerId);
  const leaveGameMutation = api.game.leaveGameLobby.useMutation();

  // TODO: repelace by reactfiree
  // const nickName = engine.getPlayerNickname(playerId);

  const leaveGame = async () => {
    logAnalyticsEvent("leave", {
      gameId: gameId,
      user: playerId,
    });
    await leaveGameMutation.mutateAsync({ gameId: gameId });
    window.location.assign("/lobbies/");
  };

  const [number, setNumber] = useState(getRandomInt(0, 4));

  const icons: Record<number, string> = {
    1: "/images/icons/amber.svg",
    2: "/images/icons/amethyst.svg",
    3: "/images/icons/emerald.svg",
    4: "/images/icons/ruby.svg",
    5: "/images/icons/steel.svg",
    0: "/images/icons/sapphire.svg",
  };

  useEffect(() => {
    setNumber(getRandomInt(0, 5));
  }, [playerId]);

  const icon = icons[number];
  return (
    <>
      <li className="flex items-center justify-between py-3">
        <div className="flex items-center">
          {isPresent ? (
            <img src={icon} alt="" className="h-8 w-8 rounded-full" />
          ) : (
            <>
              <div className={`${statuses.offline} flex-none rounded-full p-1`}>
                <div className="h-2 w-2 rounded-full bg-current" />
              </div>
              <p className="text-sm font-bold text-gray-900">[OFFLINE]</p>
            </>
          )}

          <p className="ml-4 inline-block text-sm font-medium text-gray-900">
            {nickName}
          </p>
        </div>
        {isCurrentUser && (
          <button
            className="ml-6 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            type="button"
            onClick={leaveGame}
            disabled={leaveGameMutation.isLoading}
          >
            {leaveGameMutation.isLoading ? "Leaving" : "Leave game"}
          </button>
        )}
      </li>
    </>
  );
};

export function Players(props: { players: string[]; gameId: string }) {
  const { players, gameId } = props;
  const [gameLobby, userUID] = useGameLobby();
  const isOwner = gameLobby?.ownerId === userUID;
  const joinGameMutation = api.game.joinGameLobby.useMutation();

  const joinGame = () => {
    joinGameMutation.mutate({ gameId: gameId });
    logAnalyticsEvent("join_game", {
      gameId: gameId,
      user: userUID,
    });
  };

  return (
    <>
      <h3 className="font-medium text-gray-900">Players at the table</h3>
      <ul
        role="list"
        className="mt-2 divide-y divide-white border-b border-t border-gray-200"
      >
        {players.map((player) => {
          return (
            <Player
              key={player}
              playerId={player}
              gameId={gameId}
              isCurrentUser={player === userUID}
              isOwner={isOwner}
            />
          );
        })}
        {players.length < 2 && !isOwner && (
          <li className="flex items-center justify-between py-2">
            <button
              type="button"
              className="group -ml-1 flex items-center rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={joinGame}
              disabled={joinGameMutation.isLoading}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-800 text-gray-900">
                <PlusIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="ml-4 flex text-sm font-medium text-indigo-600 group-hover:text-indigo-500">
                {joinGameMutation.isLoading ? "Joining..." : "Join Game"}
              </span>
            </button>
          </li>
        )}
        {players.length < 2 && isOwner && (
          <li className="flex items-center justify-between py-2">
            <button
              type="button"
              className="group -ml-1 flex items-center rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => {
                logAnalyticsEvent("share_game", {
                  gameId: gameId,
                  user: userUID,
                });
                copyTextToClipboard(window?.location.href);
              }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-indigo-500 text-indigo-600">
                <PlusIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="ml-4 flex text-sm font-medium text-indigo-600 group-hover:text-indigo-500">
                Invite player (You can invite players by sharing the page link)
              </span>
            </button>
            <div>
              <a
                href="#"
                className="group flex items-center space-x-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-900"
              >
                <LinkIcon
                  className="h-5 w-5 text-indigo-500 group-hover:text-indigo-900"
                  aria-hidden="true"
                />
                <span
                  onClick={() => {
                    logAnalyticsEvent("share_game", {
                      gameId: gameId,
                      user: userUID,
                    });
                    copyTextToClipboard(window?.location.href);
                  }}
                >
                  Copy invite link to clipboard
                </span>
              </a>
            </div>
          </li>
        )}
      </ul>
    </>
  );
}

export function PlayerId() {
  const auth = useAuth();
  const [user, setUser] = useState(
    auth.currentUser?.displayName || auth.currentUser?.uid,
  );
  const debouncedValue = useDebounce<string>(user || "", 500);
  const database = useDatabase();

  // TODO: This will call the database on every key stroke
  useEffect(() => {
    if (auth.currentUser && user) {
      updateNickName(database, auth.currentUser, user);
    }
  }, [auth.currentUser, debouncedValue]);

  return (
    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:py-5">
      <div>
        <label
          htmlFor="project-name"
          className="block text-sm font-medium leading-6 text-gray-900 sm:mt-1.5"
        >
          Your Nickname
        </label>
      </div>
      <div className="sm:col-span-2">
        <input
          type="text"
          name="project-name"
          id="project-name"
          value={user}
          onChange={(event) => setUser(event.target.value)}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  );
}

export const SlideOverContent: React.FC = () => {
  const store = useGameStore();
  const [enabled, setEnabled] = useState(true);

  const [language, changeLanguage] = useLocalStorage<"EN" | "DE" | "FR">(
    "language",
    "EN",
  );

  const controller = useGameController();

  return (
    <>
      <div className="sm:space-y-0 sm:divide-y sm:divide-white sm:py-0">
        <PlayerId />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium leading-6 text-gray-900">
          Card Language
        </h3>
        <div className="sm:col-span-2">
          <div className="mt-2 flex space-x-2">
            <a
              href={"#"}
              title={"English"}
              className="flex-shrink-0 rounded-full hover:opacity-75"
              onClick={() => changeLanguage("EN")}
            >
              <USAFlag className="inline-block h-8 w-8 rounded-full" />
            </a>
            <a
              href={"#"}
              title={"German"}
              className="flex-shrink-0 rounded-full hover:opacity-75"
              onClick={() => changeLanguage("DE")}
            >
              <GermanyFlag className="inline-block h-8 w-8 rounded-full" />
            </a>
            <a
              href={"#"}
              title={"French"}
              className="flex-shrink-0 rounded-full hover:opacity-75"
              onClick={() => changeLanguage("FR")}
            >
              <FranceFlag className="inline-block h-8 w-8 rounded-full" />
            </a>
          </div>
        </div>
      </div>
      <div className="mt-2 space-y-2  sm:py-5">
        <h3 className="centered text-sm font-medium leading-6 text-gray-900">
          Sound Effects &nbsp;{" "}
          <Toggle onChange={setEnabled} enabled={enabled} />
        </h3>
        <div className="sm:col-span-2 ">
          <div className="mt-2 flex space-x-2"></div>
        </div>
      </div>
      <div className="mt-2 space-y-2">
        <fieldset className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:space-y-0 sm:py-5">
          <legend className="sr-only">Game Mode</legend>
          <div
            className="text-sm font-medium leading-6 text-gray-900"
            aria-hidden="true"
          >
            Game Mode
          </div>
          <div className="space-y-5 sm:col-span-2">
            <div className="space-y-5 sm:mt-0">
              <div className="relative flex items-start">
                <div className="absolute flex h-6 items-center">
                  <input
                    id="automatic"
                    name="game-mode"
                    aria-describedby="automatic-game-mode-description"
                    type="radio"
                    className="h-4 w-4 cursor-pointer border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    onChange={() => {
                      controller.changeMode(false);
                    }}
                    defaultChecked={!store.manualMode}
                  />
                </div>
                <div className="pl-7 text-sm leading-6">
                  <label
                    htmlFor="automatic"
                    className="cursor-pointer font-medium text-gray-900"
                  >
                    Automatic
                  </label>
                  <p
                    id="automatic-game-mode-description"
                    className="text-gray-500"
                  >
                    Game rules will be evaluate automatically, if for some
                    reason the board state is not correct, you can use the
                    "Manual Mode" to adjust the game state.
                  </p>
                </div>
              </div>
              <div className="relative flex items-start">
                <div className="absolute flex h-6 items-center">
                  <input
                    id="manual"
                    name="game-mode"
                    aria-describedby="manual-description"
                    type="radio"
                    className="h-4 w-4 cursor-pointer border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    onChange={() => {
                      controller.changeMode(true);
                    }}
                    defaultChecked={store.manualMode}
                  />
                </div>
                <div className="pl-7 text-sm leading-6">
                  <label
                    htmlFor="manual"
                    className="cursor-pointer font-medium text-gray-900"
                  >
                    Manual
                  </label>
                  <p id="manual-description" className="text-gray-500">
                    Use this mode if you want to manually adjust the game state.
                    You should not need to use this mode, in case you do,
                    consider reporting the bug.
                  </p>
                </div>
              </div>
            </div>
            {/*<hr className="border-gray-200" />*/}
            {/*<div className="flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">*/}
            {/*  <div>*/}
            {/*    <a*/}
            {/*      href="#"*/}
            {/*      className="group flex items-center space-x-2.5 text-sm text-gray-500 hover:text-gray-900"*/}
            {/*    >*/}
            {/*      <QuestionMarkCircleIcon*/}
            {/*        className="h-5 w-5 text-gray-400 group-hover:text-gray-500"*/}
            {/*        aria-hidden="true"*/}
            {/*      />*/}
            {/*      <span>Learn more about game mode</span>*/}
            {/*    </a>*/}
            {/*  </div>*/}
            {/*</div>*/}
          </div>
        </fieldset>
      </div>
    </>
  );
};
