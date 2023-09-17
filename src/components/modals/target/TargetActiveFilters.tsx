import { type TargetFilter } from "~/components/modals/target/filters";
import { exhaustiveCheck } from "~/libs/exhaustiveCheck";

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

function filterToText(filter: TargetFilter) {
  const activeFilter = filter.filter;

  switch (activeFilter) {
    case "owner": {
      return filter.value === "self"
        ? "Cards you own"
        : "Cards your opponent owns";
    }
    case "type": {
      return `Type: ${filter.value}`;
    }
    case "status": {
      return `Status: ${filter.value}`;
    }
    case "zone": {
      return `Zone: ${filter.value}`;
    }
    case "attribute": {
      return `Attribute: ${filter.value}`;
    }
    case "keyword": {
      return `Keyword: ${filter.value}`;
    }
    case "characteristics": {
      return `Characteristics: ${filter.value.join(", ")}`;
    }
    case "ability": {
      return `Ability: ${filter.value}`;
    }
    default: {
      // If this is failing, it means you forgot to add a case for a new filter
      exhaustiveCheck(activeFilter);
      return filter.value;
    }
  }
}
