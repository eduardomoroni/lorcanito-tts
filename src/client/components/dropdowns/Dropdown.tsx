import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type Props = {
  title: string;
  items: Array<{ readonly title: string }>;
  onChange: (selectedItem: string) => void;
};

export default function Dropdown(props: Props) {
  const { title, items, onChange } = props;

  return (
    <Menu as="div" className="relative z-10 inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full items-center justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-xl uppercase text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          <ChevronDownIcon
            className="-mr-1 h-10 w-10 text-gray-400"
            aria-hidden="true"
          />
          {title}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {items.map((item) => {
              return (
                <Menu.Item key={item.title}>
                  {({ active }) => (
                    <a
                      href="#"
                      onClick={() => onChange(item.title)}
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "block px-4 py-2 text-sm",
                      )}
                    >
                      {item.title}
                    </a>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
