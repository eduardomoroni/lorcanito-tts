import { SortTarget } from "~/spaces/components/modals/target/SortTarget";
import { Popover } from "@headlessui/react";
import { filters, TargetFilter } from "~/spaces/components/modals/target/filters";
import { TargetFilters } from "~/spaces/components/modals/target/TargetFilters";
import { TargetActiveFilters } from "~/spaces/components/modals/target/TargetActiveFilters";

export function TargetModalHeader(props: {
  activeFilters: TargetFilter[];
  setOpen: (open: boolean) => void;
}) {
  const { activeFilters, setOpen } = props;
  return (
    <section
      aria-labelledby="filter-heading"
      className={"flex w-full flex-col"}
    >
      {false ? (
        <div className="self-end bg-white pb-4">
          <div className="mx-auto flex w-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <SortTarget />
            <button
              type="button"
              className="inline-block text-sm font-medium text-gray-700 hover:text-gray-900 sm:hidden"
              onClick={() => setOpen(true)}
            >
              Filters
            </button>

            <div className="hidden sm:block">
              <div className="flow-root">
                <Popover.Group className="-mx-4 flex items-center divide-x divide-gray-200">
                  {filters.map((section, sectionIdx) => (
                    <TargetFilters
                      section={section}
                      sectionIdx={sectionIdx}
                      key={sectionIdx}
                    />
                  ))}
                </Popover.Group>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="border-b border-white bg-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:flex sm:items-center sm:px-6 lg:px-8">
          <h3 className="text-sm font-medium text-gray-500">
            Filters
            <span className="sr-only">, active</span>
          </h3>

          <div
            aria-hidden="true"
            className="hidden h-5 w-px bg-gray-300 sm:ml-4 sm:block"
          />

          <div className="mt-2 sm:ml-4 sm:mt-0">
            <div className="-m-1 flex flex-wrap items-center">
              {activeFilters.map((activeFilter, index) => (
                <TargetActiveFilters activeFilter={activeFilter} key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
