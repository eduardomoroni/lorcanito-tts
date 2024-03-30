import { useDatabase, useDatabaseObjectData } from "reactfire";
import { ref } from "firebase/database";

export const OfflineBanner = () => {
  const database = useDatabase();
  const { data: isOnline, status } = useDatabaseObjectData<boolean>(
    ref(database, ".info/connected"),
    {
      initialData: true,
    },
  );

  if (isOnline || status === "loading" || status === "error") {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 sm:flex sm:justify-center sm:px-6 sm:pb-5 lg:px-8">
      <div className="pointer-events-auto flex items-center justify-between gap-x-6 bg-gray-900 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
        <p className="text-sm leading-6 text-white">
          <a href="#">
            <strong className="font-semibold">You're offline</strong>
            <svg
              viewBox="0 0 2 2"
              className="mx-2 inline h-0.5 w-0.5 fill-current"
              aria-hidden="true"
            >
              <circle cx={1} cy={1} r={1} />
            </svg>
            The system is trying to reconnect...
          </a>
        </p>
      </div>
    </div>
  );
};
