import { type TargetFilter, filterToText } from "@lorcanito/engine";

export function TargetActiveFilters(props: { activeFilter: TargetFilter }) {
  const { activeFilter } = props;
  return (
    <span className="m-1 inline-flex items-center rounded-full border border-gray-200 bg-white py-1.5 pl-3 pr-2 text-sm font-medium text-gray-900">
      <span>{filterToText(activeFilter)}</span>
      <button
        type="button"
        className="ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
      >
        <span className="sr-only">
          Remove filter for {filterToText(activeFilter)}
        </span>
        <svg
          className="h-2 w-2"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 8 8"
        >
          <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
        </svg>
      </button>
    </span>
  );
}
