function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export type Tab = {
  name: string;
  key: string;
};

export function Tabs(props: {
  tabs: Tab[];
  onSelect: (tab: Tab) => void;
  selected: Tab;
}) {
  const { tabs, onSelect, selected } = props;
  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          defaultValue={tabs.find((tab) => tab.key)?.name}
        >
          {tabs.map((tab) => (
            <option onSelect={() => onSelect(tab)} key={tab.name}>
              {tab.name}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <nav
          className="isolate flex divide-x divide-gray-200 rounded-lg shadow"
          aria-label="Tabs"
        >
          {tabs.map((tab, tabIdx) => (
            <button
              key={tab.name}
              type={"button"}
              onClick={() => onSelect(tab)}
              className={classNames(
                tab.key === selected.key
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700",
                tabIdx === 0 ? "rounded-l-lg" : "",
                tabIdx === tabs.length - 1 ? "rounded-r-lg" : "",
                "group relative min-w-0 flex-1 overflow-hidden bg-white px-4 py-4 text-center text-sm font-medium hover:bg-gray-50 focus:z-10",
              )}
              aria-current={selected.key === selected.key ? "page" : undefined}
            >
              <span>{tab.name}</span>
              <span
                aria-hidden="true"
                className={classNames(
                  tab.key === selected.key ? "bg-indigo-500" : "bg-transparent",
                  "absolute inset-x-0 bottom-0 h-0.5",
                )}
              />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
