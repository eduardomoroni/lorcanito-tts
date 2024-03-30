"use client";

import React, { type FC, useState, Fragment } from "react";
import {
  BugAntIcon,
  Cog8ToothIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";
import { PlayerTable } from "~/client/PlayerTable";
import { OfflineBanner } from "~/client/components/banners/OfflineBanner";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import { BugReportModal } from "~/client/components/modals/BugReportModal";
import { HelpModal } from "~/client/components/modals/HelpModal";
import { SideBar } from "~/client/Sidebar";
import { Transition } from "@headlessui/react";
import { AlterHandModal } from "~/client/components/modals/AlterHandModal";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import { useLorcanitoSounds } from "~/client/hooks/useLorcanitoSounds";
import { EffectStackZoneArena } from "~/client/EffectStackZone";
import { observer } from "mobx-react-lite";
import { GameSettingsSlideOver } from "~/client/game-settings/gameSettingsSlideOver";
import clsx from "clsx";
import ClipLoader from "~/client/components/spinner/ClipLoader";
import { Tooltip } from "antd";
import { useGameController } from "~/client/hooks/useGameController";
import { ActiveEffects } from "~/client/ActiveEffects";
import { ScryModal } from "~/client/components/modals/scry/ScryModal";
import { useScryModal } from "~/client/providers/ScryModalProvider";

const GameTable: FC<{ gameId: string }> = (props) => {
  const store = useGameStore();
  const gameController = useGameController();
  const playerId = store.activePlayer;

  const { params, closeScryModal } = useScryModal();

  // TODO: We have to ask for permission to play sounds
  useLorcanitoSounds();
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const isMyTurn = store.isMyTurn;
  const isOpponentTurn = !isMyTurn;
  const isSpectator = false;
  const activePlayer = store.activePlayer;
  const opponent = store.opponent;
  const players = Object.keys(store.tableStore.tables || {});

  const tables = store.tableStore.tables;
  const cardsOnStack = store.tableStore.getStackCards();
  const pendingEffects = store.tableStore.getPendingEffects();
  const isStackZoneOpen =
    cardsOnStack?.length > 0 || pendingEffects?.length > 0;

  const [isBugReportModalOpen, setBugReportModalOpen] = useState(false);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);

  const closeAlterHand = () => {};

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
      <Cog8ToothIcon
        onClick={() => setIsSlideOverOpen(true)}
        className={`absolute right-0 top-0 z-10 h-12 w-12 cursor-pointer text-slate-50 opacity-75 hover:opacity-100`}
      />
      <Tooltip placement="left" title={"Your game is syncing..."}>
        <ClipLoader
          color="#ffffff"
          speedMultiplier={0.5}
          size={48}
          loading={gameController.isLoading}
          className={
            "absolute right-0 top-12 z-10 cursor-pointer opacity-50 hover:opacity-75"
          }
        />
      </Tooltip>
      <SideBar gameId={store.id} />
      <ActiveEffects />
      <div className="table-perspective-outer relative h-screen w-screen rounded">
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
        {params && (
          <ScryModal
            open={!!params}
            scryCount={typeof params.amount === "number" ? params.amount : 0}
            mode={params.mode}
            limits={params.limits}
            tutorFilters={params.tutorFilters}
            title={params.title}
            subtitle={params.subtitle}
            shouldReveal={params.shouldRevealTutored}
            onClose={(args) => {
              if (params.callback && args) {
                params.callback(args);
              }
              closeScryModal();
            }}
          />
        )}
        <div
          className={`${
            isStackZoneOpen ? "" : "table-perspective-inner"
          } relative flex h-screen w-full flex-col rounded-lg`}
        >
          <div
            className={clsx(
              isOpponentTurn ? "bg-gray-600" : "bg-gray-800",
              isOpponentTurn && !isStackZoneOpen
                ? "scale-[102%]"
                : "scale-[98%]",
              isStackZoneOpen ? "-translate-y-16 scale-90" : "",
              `mb-1 flex h-1/2 w-full rounded-lg shadow-md transition duration-500 ease-in-out`,
            )}
          >
            {opponent === activePlayer ? null : (
              <PlayerTable
                isStackZoneOpen={isStackZoneOpen}
                cardsOnStack={cardsOnStack}
                tableOwner={opponent}
                position="top"
                isPlayerTurn={isMyTurn}
              />
            )}
          </div>
          <div
            className={clsx(
              isMyTurn ? "bg-gray-600" : "bg-gray-800",
              isMyTurn && !isStackZoneOpen ? "scale-[102%]" : "scale-[98%]",
              isStackZoneOpen ? "translate-y-16 scale-90" : "",
              `mt-1 flex h-1/2 w-full rounded-lg shadow-md transition duration-500 ease-in-out`,
            )}
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
              isPlayerTurn={isMyTurn}
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
