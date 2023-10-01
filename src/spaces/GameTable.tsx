"use client";

import React, { type FC, useState, Fragment } from "react";
import {
  BugAntIcon,
  Cog8ToothIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";
import { PlayerTable } from "~/spaces/PlayerTable";
import { OfflineBanner } from "~/spaces/components/banners/OfflineBanner";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import { BugReportModal } from "~/spaces/components/modals/BugReportModal";
import { HelpModal } from "~/spaces/components/modals/HelpModal";
import { SideBar } from "~/spaces/Sidebar";
import { Transition } from "@headlessui/react";
import { AlterHandModal } from "~/spaces/components/modals/AlterHandModal";
import { useGameStore } from "~/engine/lib/GameStoreProvider";
import { useTurn } from "~/engine/GameProvider";
import { useLorcanitoSounds } from "~/spaces/hooks/useLorcanitoSounds";
import { EffectStackZoneArena } from "~/spaces/EffectStackZone";
import { observer } from "mobx-react-lite";
import { GameSettingsSlideOver } from "~/spaces/game-settings/gameSettingsSlideOver";

const GameTable: FC<{ gameId: string }> = (props) => {
  const store = useGameStore();
  const playerId = store.activePlayer;

  if (!store.toJSON()) {
    logAnalyticsEvent("game_table_error", { playerId, gameId: props.gameId });
    return <span>Failed to retrieve the game, please try to log in again</span>;
  }

  // TODO: We have to ask for permission to play sounds
  useLorcanitoSounds();
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const {
    activePlayer,
    opponent,
    isMyTurn,
    readyToStart,
    isOpponentTurn,
    isSpectator,
    players,
  } = useTurn();
  const tables = store.tableStore.tables;
  const cardsOnStack = store.tableStore.getStackCards();
  const pendingEffects = store.tableStore.getPendingEffects();
  const isStackZoneOpen =
    cardsOnStack?.length > 0 || pendingEffects?.length > 0;

  const [isBugReportModalOpen, setBugReportModalOpen] = useState(false);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);

  const closeAlterHand = () => {
    readyToStart(false);
  };

  return (
    <main className="table-background relative flex max-h-screen overflow-y-hidden scroll-smooth">
      <div className="absolute isolate z-20 flex w-full">
        {tables[playerId]?.readyToStart === false ? (
          <AlterHandModal
            ownerId={playerId}
            open={true}
            setOpen={closeAlterHand}
            onConfirm={closeAlterHand}
          />
        ) : null}
      </div>

      {isBugReportModalOpen ? (
        <BugReportModal
          setOpen={setBugReportModalOpen}
          open={isBugReportModalOpen}
        />
      ) : (
        <BugAntIcon
          onClick={() => setBugReportModalOpen(true)}
          className="absolute bottom-0 right-0 m-2 h-12 w-12 cursor-pointer text-slate-50 opacity-25 hover:opacity-50"
        />
      )}

      {isHelpModalOpen ? (
        <HelpModal setOpen={setHelpModalOpen} open={isHelpModalOpen} />
      ) : (
        <QuestionMarkCircleIcon
          onClick={() => {
            logAnalyticsEvent("help_modal");
            setHelpModalOpen(true);
          }}
          className="absolute bottom-0 left-0 m-2 h-12 w-12 cursor-pointer text-slate-50 opacity-25 hover:opacity-50"
        />
      )}
      <SideBar gameId={store.id} />
      <Cog8ToothIcon
        onClick={() => setIsSlideOverOpen(true)}
        className={`absolute right-0 top-0 z-10 m-2 h-12 w-12 cursor-pointer text-slate-50 opacity-75 hover:opacity-100`}
      />
      <SideBar gameId={props.gameId} />
      <div className="table-perspective-outer relative h-screen w-screen rounded">
        {/*<QuestDropZone />*/}
        <Transition
          as={Fragment}
          show={isStackZoneOpen}
          enter="transform transition duration-[200ms]"
          enterFrom="opacity-0 scale-50"
          enterTo="opacity-100 scale-100"
          leave="transform duration-200 transition ease-in-out"
          leaveFrom="opacity-100 scale-100 "
          leaveTo="opacity-0 scale-95 "
        >
          <div className="absolute left-1/2 top-1/2 z-10 h-40 w-11/12 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-solid border-slate-700 bg-gray-700 shadow-md ease-in-out">
            {pendingEffects.length > 0 ? <EffectStackZoneArena /> : null}
          </div>
        </Transition>
        <div
          className={`${
            isStackZoneOpen ? "" : "table-perspective-inner"
          } relative flex h-screen w-full flex-col rounded-lg`}
        >
          <div
            className={`${isOpponentTurn ? "bg-gray-700" : "bg-gray-800"} ${
              isOpponentTurn && !isStackZoneOpen
                ? "scale-[101%]"
                : "scale-[99%]"
            } ${
              isStackZoneOpen ? "-translate-y-16 scale-90" : ""
            } mb-1 flex h-1/2 w-full rounded-lg shadow-md transition duration-500 ease-in-out`}
          >
            <PlayerTable
              cardsOnStack={cardsOnStack}
              tableOwner={opponent}
              position="top"
            />
          </div>
          <div
            className={`${isMyTurn ? "bg-gray-700" : "bg-gray-800"} ${
              isMyTurn && !isStackZoneOpen ? "scale-[101%]" : "scale-[99%]"
            } ${
              isStackZoneOpen ? "translate-y-16 scale-90" : ""
            } mt-1 flex h-1/2 w-full rounded-lg shadow-md transition duration-500 ease-in-out`}
          >
            <PlayerTable
              tableOwner={
                !isSpectator
                  ? activePlayer
                  : players.filter((p) => p !== opponent)[0] || ""
              }
              isStackZoneOpen={isStackZoneOpen}
              cardsOnStack={cardsOnStack}
              position="bottom"
            />
          </div>
        </div>
      </div>
      <OfflineBanner />
      <GameSettingsSlideOver
        open={isSlideOverOpen}
        onClose={() => {
          setIsSlideOverOpen(false);
          logAnalyticsEvent("game_settings", {
            action: "open",
          });
        }}
        gameId={props.gameId}
        playerId={playerId}
      />
    </main>
  );
};

// NOTE 1: When joining a game (as a visitor) during the initial load the modal was not loading.
// Steps to reproduce.
// Join a table, load a deck and immediately click on the button to open the modal

export default observer(GameTable);
