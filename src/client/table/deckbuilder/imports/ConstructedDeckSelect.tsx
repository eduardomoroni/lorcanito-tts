import React from "react";
import { RadioGroup } from "@headlessui/react";
import { useDeckImport } from "~/client/providers/DeckImportProvider";

const icons = {
  amber: "/images/icons/amber.svg",
  amethyst: "/images/icons/amethyst.svg",
  emerald: "/images/icons/emerald.svg",
  ruby: "/images/icons/ruby.svg",
  sapphire: "/images/icons/sapphire.svg",
  steel: "/images/icons/steel.svg",
} as const;

export type DeckType = {
  deck: string;
  colors: (keyof typeof icons)[];
  deckList: string;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type Props = {
  selected: DeckType;
  setSelected: (deck: DeckType) => void;
  decks: DeckType[];
};

export function ConstructedDeckSelect(props: Props) {
  const { selected, setSelected } = props;
  const { parseAndUpdateDeck } = useDeckImport();

  return (
    <RadioGroup
      value={selected}
      onChange={(deck: DeckType) => {
        setSelected(deck);
        parseAndUpdateDeck(deck.deckList);
      }}
    >
      <RadioGroup.Label className="sr-only">Privacy setting</RadioGroup.Label>
      <div className="-space-y-px rounded-md bg-white">
        {props.decks.map((item, settingIdx) => (
          <RadioGroup.Option
            key={item.deck}
            value={item}
            className={({ checked }) =>
              classNames(
                settingIdx === 0 ? "rounded-tl-md rounded-tr-md" : "",
                settingIdx === props.decks.length - 1
                  ? "rounded-bl-md rounded-br-md"
                  : "",
                checked
                  ? "z-5 border-indigo-200 bg-indigo-50"
                  : "border-gray-200",
                "relative flex cursor-pointer border p-4 focus:outline-none",
              )
            }
          >
            {({ active, checked }) => (
              <>
                <span
                  className={classNames(
                    checked
                      ? "border-transparent bg-indigo-600"
                      : "border-gray-300 bg-white",
                    active ? "ring-2 ring-indigo-600 ring-offset-2" : "",
                    "mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border",
                  )}
                  aria-hidden="true"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <span className="ml-3 flex flex-row items-center justify-center">
                  <RadioGroup.Description
                    as="span"
                    className={classNames(
                      checked ? "text-indigo-700" : "text-gray-500",
                      "inline text-sm",
                    )}
                  >
                    {item.colors.map((color) => (
                      <img
                        src={icons[color]}
                        key={color}
                        alt={color}
                        className="inline h-8 w-8 rounded-full"
                      />
                    ))}
                  </RadioGroup.Description>
                  <RadioGroup.Label
                    as="span"
                    className={classNames(
                      checked ? "text-indigo-900" : "text-gray-900",
                      "inline text-sm font-medium",
                    )}
                  >
                    {item.deck}
                  </RadioGroup.Label>
                </span>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
}
