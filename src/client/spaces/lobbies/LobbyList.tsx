import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { query, ref } from "firebase/database";
import { useDatabase, useDatabaseListData } from "reactfire";
import { LobbyPresence } from "~/libs/3rd-party/firebase/database/presence";
import Link from "next/link";
import { useState } from "react";

const icons = {
  amber: "/images/icons/amber.svg",
  amethyst: "/images/icons/amethyst.svg",
  emerald: "/images/icons/emerald.svg",
  ruby: "/images/icons/ruby.svg",
  sapphire: "/images/icons/sapphire.svg",
  steel: "/images/icons/steel.svg",
} as const;

function getRandomIcon() {
  const keys = Object.keys(icons);
  const randomIndex = Math.floor(Math.random() * keys.length);
  const luckyDraw = (keys[randomIndex] || "amber") as keyof typeof icons;

  return icons[luckyDraw];
}

const tenMinutesInMilliseconds = 10 * 60 * 1000; // 10 minutes in milliseconds

export function LobbyList() {
  const [now] = useState(Date.now);
  const database = useDatabase();
  const presenceRef = ref(database, "presence/lobbies");
  const lobbyPresenceQuery = query(presenceRef);
  const { status, data } = useDatabaseListData<LobbyPresence>(
    lobbyPresenceQuery,
    {
      idField: "id",
      initialData: [],
    },
  );

  if (status === "loading") {
    return <span>loading...</span>;
  }

  const tenMinutesAgo = (time?: number) => {
    if (!time) {
      return false;
    }

    return Math.abs(time - now) <= tenMinutesInMilliseconds;
  };

  const lobbyPresences = (data || [])
    .filter((p) => !p.full)
    .filter((p) => tenMinutesAgo(p.lastUpdated));

  if (lobbyPresences.length === 0) {
    return <span>No lobby available, why don't you create one? 😉 </span>;
  }

  return (
    <ul
      role="list"
      className="cursor-pointer divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
    >
      {lobbyPresences
        .sort((a, b) => (a?.lastUpdated || 0) - (b?.lastUpdated || 0))
        .map((presence) => {
          const href = `/lobby/${presence.id}`;
          return (
            <li key={presence.id}>
              <Link
                href={href}
                replace={true}
                prefetch={false}
                className="relative flex justify-between gap-x-6 px-2 py-5 transition-all hover:bg-gray-100"
              >
                <div className="flex min-w-0 gap-x-4">
                  <img
                    className="h-12 w-12 flex-none rounded-full bg-gray-50"
                    src={getRandomIcon()}
                    alt=""
                  />
                  <div className="min-w-0 flex-auto">
                    <p className="text-sm font-semibold leading-6 text-gray-900">
                      <Link
                        href={href}
                        prefetch={false}
                        replace={true}
                        className="relative truncate hover:underline"
                      >
                        <span className="absolute inset-x-0 -top-px bottom-0" />
                        {presence.name}
                      </Link>
                    </p>
                    <p className="mt-1 flex text-xs leading-5 text-gray-500">
                      <Link
                        href={href}
                        prefetch={false}
                        replace={true}
                        className="relative truncate hover:underline"
                      >
                        {presence.owner}
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-x-4">
                  <div className="hidden sm:flex sm:flex-col sm:items-end">
                    {/*<p className="text-sm leading-6 text-gray-900">*/}
                    {/*  {presence.role}*/}
                    {/*</p>*/}
                    {/*{presence.lastUpdated ? (*/}
                    {/*  <p className="mt-1 text-xs leading-5 text-gray-500">*/}
                    {/*    Last seen{" "}*/}
                    {/*    <time dateTime={presence?.lastUpdated + ""}>*/}
                    {/*      {presence.lastUpdated}*/}
                    {/*    </time>*/}
                    {/*  </p>*/}
                    {/*) : (*/}
                    {/*  <div className="mt-1 flex items-center gap-x-1.5">*/}
                    {/*    <div className="bg-emerald-500/20 flex-none rounded-full p-1">*/}
                    {/*      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />*/}
                    {/*    </div>*/}
                    {/*    <p className="text-xs leading-5 text-gray-500">Online</p>*/}
                    {/*  </div>*/}
                    {/*)}*/}
                    <div className="mt-1 flex items-center gap-x-1.5">
                      <div className="bg-emerald-500/20 flex-none rounded-full p-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      </div>
                      <p className="text-xs leading-5 text-gray-500">Online</p>
                    </div>
                  </div>
                  <ChevronRightIcon
                    className="h-5 w-5 flex-none text-gray-400"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </li>
          );
        })}
    </ul>
  );
}
