import { useDeckImport } from "~/providers/DeckImportProvider";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import React, { FC } from "react";
import { DeckCard } from "~/providers/TabletopProvider";
import { InkColorIcon } from "~/components/InkColorIcon";
import { InkwellIcon } from "~/components/InkIcon";

// TODO: Divide list by type one table for character another for action and another for item
const ListItem: FC<{
  deckCard: DeckCard;
  even: boolean;
  qty: number;
}> = (props) => {
  const { qty } = props;
  const { lore, name, title, type, color, inkwell, willpower, strength, cost } =
    props.deckCard.card;

  return (
    <tr>
      <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
        <div className="flex items-center">
          <div className="ml-2 flex flex-shrink-0 items-center justify-center">
            <InkColorIcon color={color} />
            <InkwellIcon ink={inkwell} cost={cost} />
            <div className="ml-2 font-medium text-gray-900">{`${qty}x`}</div>
          </div>
          <div className="ml-2">
            <div className="font-medium text-gray-900">{name}</div>
            <div className="mt-1 text-gray-500">{title}</div>
          </div>
        </div>
      </td>
      {/*<td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">*/}
      {/*  <div className="text-gray-900">{"person.title"}</div>*/}
      {/*  <div className="mt-1 text-gray-500">{"person.department"}</div>*/}
      {/*</td>*/}
      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium capitalize text-green-700 ring-1 ring-inset ring-green-600/20">
          {type}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
        {lore}
      </td>
      <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
        {/*<a href="#" className="text-indigo-600 hover:text-indigo-900">*/}
        {/*  Edit<span className="sr-only">, {"person.name"}</span>*/}
        {/*</a>*/}
      </td>
    </tr>
  );
};

export function DeckList() {
  const { deck } = useDeckImport();
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    Glimmer
                  </th>
                  {/*<th*/}
                  {/*  scope="col"*/}
                  {/*  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"*/}
                  {/*>*/}
                  {/*  Status*/}
                  {/*</th>*/}
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Lore
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {deck.map((deckCard, index) => (
                  <ListItem
                    key={deckCard.card.id + index}
                    qty={deckCard.qty}
                    deckCard={deckCard}
                    even={index % 2 === 0}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DeckListTab() {
  logAnalyticsEvent("deck_card_tab");

  return <DeckList />;
}
