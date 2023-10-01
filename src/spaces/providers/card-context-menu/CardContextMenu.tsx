import { Transition } from "@headlessui/react";
import { useOnClickOutside } from "~/spaces/hooks/useClickOutside";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import { observer } from "mobx-react-lite";

export type ContextMenuItem = {
  text: string;
  onClick: () => void;
  items?: Array<Omit<ContextMenuItem, "items">>;
};

function CardContextMenu(props: {
  show: boolean;
  direction: "top" | "bottom";
  onClose: () => void;
  items: ContextMenuItem[];
}) {
  const { show, onClose, direction } = props;
  const ref = useRef<HTMLDivElement>(null);
  const itemsWrapperRef = useRef<HTMLUListElement>(null);
  useOnClickOutside(ref, onClose);

  // https://stackoverflow.com/questions/50257057/how-to-navigate-through-li-elements-using-arrow-keys-jquery

  useEffect(() => {
    if (!itemsWrapperRef.current) {
      return;
    }
    try {
      // @ts-ignore
      itemsWrapperRef.current.children[0]?.focus();
    } catch (error) {
      console.error(error);
    }
  }, [itemsWrapperRef.current]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <Transition
        show={show}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div
          className={`${
            direction === "top" ? "-translate-y-full" : ""
          } absolute right-0 mt-2 w-36 origin-top-right rounded-md bg-white opacity-95 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
        >
          <ul
            className="flex flex-col items-start justify-start py-1"
            ref={itemsWrapperRef}
          >
            {props.items.map(({ text, onClick, items }, index) => {
              const onSubmit = () => {
                onClick();
                onClose();
              };

              return (
                <ListItem
                  key={text}
                  items={items}
                  onSubmit={onSubmit}
                  onClose={onClose}
                  index={index ?? -1}
                  text={text}
                />
              );
            })}
          </ul>
        </div>
      </Transition>
    </div>
  );
}

function ListItem(props: {
  onSubmit: () => void;
  onClose: () => void;
  items?: Array<Omit<ContextMenuItem, "items">>;
  text: string;
  index: number;
}) {
  const { onSubmit, onClose, text, index, items } = props;
  const hotKey = props.index + 1;
  const [subMenuOpen, openSubMenu] = useState(false);
  const onClick = items?.length ? () => openSubMenu(true) : onSubmit;

  useHotkeys(
    hotKey.toString(),
    () => {
      logAnalyticsEvent("card_hotkey_context_menu", { hotKey });
      onClick();
    },

    {
      scopes: ["context_menu"],
      // TODO: This can be risky, if the user is typing in a text field, the spacebar will trigger the pass turn action
      preventDefault: true,
      // enableOnFormTags: true,
      description: "Use context menu action",
      enabled: hotKey <= 10,
    },
  );

  return (
    <li
      tabIndex={0}
      key={text}
      className="flex w-full cursor-pointer justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onClick();
        }

        if (event.key === "Escape") {
          onClose();
        }
      }}
    >
      {text}
      <span className="ml-4 self-end font-semibold text-gray-400">
        {hotKey}
      </span>
      {subMenuOpen && items && (
        <CardContextMenu
          items={items}
          show={subMenuOpen}
          direction={"top"}
          onClose={onClose}
        />
      )}
    </li>
  );
}

export default observer(CardContextMenu);
