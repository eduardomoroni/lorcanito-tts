import { CardLogEntry } from "~/client/Log/CardLogEntry";
import React from "react";
import Image from "next/image";
import {
  type LorcanitoCard,
  type InternalLogEntry,
  type LogEntryMoveCard,
} from "@lorcanito/engine";

export function moveCard(
  elements: Array<unknown>,
  entry: LogEntryMoveCard & { private?: InternalLogEntry["private"] },
  player: string,
  card?: LorcanitoCard,
  instanceId?: string,
) {
  const { from, to, position } = entry;

  // TODO: theree is a component for thin
  const inkImage = (
    <Image
      src={
        card?.inkwell
          ? "https://six-inks.pages.dev/assets/images/tts/icons/inkpot.svg"
          : "https://six-inks.pages.dev/assets/images/tts/icons/inkless.svg"
      }
      className="mr-1 inline-block"
      width={10}
      height={10}
      alt={card?.inkwell ? "Inkwell card" : "Inkless card"}
    />
  );

  if (from === "deck") {
    switch (to) {
      case "hand": {
        if (player in (entry?.private || {})) {
          elements.push(`drew `);
          elements.push(
            <CardLogEntry
              key={card?.id}
              instanceId={instanceId}
              privateEntry={entry.private}
              player={player}
            />,
          );
          break;
        } else {
          elements.push(`draws a card.`);
        }

        break;
      }
      case "play": {
        elements.push(`put `);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );
        elements.push(` in play, from the top of their deck`);
        break;
      }
      case "inkwell": {
        elements.push(`put `);
        elements.push(inkImage);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );
        elements.push(` in the inkwell, from the top of their deck`);
        break;
      }
      case "discard": {
        elements.push(`discarded `);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );
        elements.push(` from the top of their deck`);
      }
    }

    return;
  }

  if (from === "hand") {
    switch (to) {
      case "play":
        elements.push(`played `);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );
        break;
      case "discard":
        elements.push(`discarded `);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );
        break;
      case "inkwell":
        elements.push(`put `);
        elements.push(inkImage);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );
        elements.push(` in the inkwell`);
        break;
      case "deck":
        elements.push(`put `);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );

        if (position === "last") {
          elements.push(` on the top of the deck`);
        } else {
          elements.push(` on the bottom of the deck`);
        }
        break;
    }

    elements.push(` from their hand`);
    return;
  }

  if (from === "play") {
    switch (to) {
      case "hand":
        elements.push(`returned `);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );
        elements.push(` to their hand`);
        break;
      case "discard":
        elements.push(`banished `);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );
        break;
      case "inkwell":
        elements.push(`put `);
        elements.push(inkImage);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );
        elements.push(` in the inkwell from play`);
        break;
      case "deck":
        elements.push(`put `);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );

        if (position === "first") {
          elements.push(` on the top of the deck`);
        } else {
          elements.push(` on the bottom of the deck`);
        }
        break;
    }

    elements.push(` from play`);
    return;
  }

  if (from === "inkwell") {
    switch (to) {
      case "hand":
        elements.push(`returned `);
        elements.push(inkImage);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );
        elements.push(` to their hand`);
        break;
      case "discard":
        elements.push(`banished `);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );
        break;
      case "play":
        elements.push(`put `);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );
        elements.push(` in play from the inkwell`);
        break;
      case "deck":
        elements.push(`put `);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );

        if (position === "first") {
          elements.push(` on the top of the deck`);
        } else {
          elements.push(` on the bottom of the deck`);
        }
        break;
    }

    elements.push(` from the inkwell`);
    return;
  }

  if (from === "discard") {
    switch (to) {
      case "play":
        elements.push(`played `);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );
        break;
      case "inkwell":
        elements.push(`put `);
        elements.push(inkImage);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );
        elements.push(` in the inkwell`);
        break;
      case "deck":
        elements.push(`put `);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );
        if (position === "first") {
          elements.push(` on the top of the deck`);
        } else {
          elements.push(` on the bottom of the deck`);
        }
        break;
      case "hand": {
        elements.push(`returned `);
        elements.push(
          <CardLogEntry
            key={card?.id}
            instanceId={instanceId}
            privateEntry={entry.private}
            player={player}
          />,
        );
        elements.push(` to their hand`);
        break;
      }
    }

    elements.push(` from the discard pile`);
    return;
  }
}
