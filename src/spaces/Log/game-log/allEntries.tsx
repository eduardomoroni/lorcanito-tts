import Image from "next/image";
import React from "react";
import { CardLogEntry } from "~/spaces/Log/CardLogEntry";
import {
  activateStackLayerEntries,
  cancelStackLayerEntries,
  resolveStackLayerEntries,
} from "~/spaces/Log/stackLayerEntries";
import { moveCard } from "~/spaces/Log/moveCardEntries";
import { exhaustiveCheck } from "~/libs/exhaustiveCheck";
import type { MobXRootStore } from "~/store/RootStore";
import type { InternalLogEntry } from "~/spaces/Log/types";

const playerAction = "▾ ";
const systemAction = "◆ ";
const opponentAction = "▴ ";

export function mapLogEntries(store: MobXRootStore, entry: InternalLogEntry) {
  const elements = [];
  const isMyTurn = store.isMyTurn;
  const activePlayer = store.activePlayer;
  const isActivePlayerTheSender = activePlayer === entry.sender;

  if (isActivePlayerTheSender) {
    elements.push(`${playerAction} You `);
  } else if (entry.sender === "SYSTEM") {
    elements.push(`${systemAction} `);
  } else {
    elements.push(`${opponentAction} Opponent `);
  }

  switch (entry.type) {
    case "LOOKING_AT_TOP_CARDS": {
      const { amount } = entry;
      elements.push(`looked at the top ${amount} cards of the deck.`);
      break;
    }
    case "TUTORING": {
      elements.push(`is looking the deck`);
      break;
    }
    case "TUTORED": {
      const { instanceId } = entry;
      elements.push(`tutored `);
      elements.push(
        <CardLogEntry
          instanceId={instanceId}
          privateEntry={entry.private}
          player={activePlayer}
        />
      );
      break;
    }
    case "SCRY": {
      const { bottom, top, hand, shouldReveal } = entry;
      const handCount = Array.isArray(hand) ? hand.length : hand;
      const total = bottom + top + handCount;
      elements.push(`Looked at the top ${total} cards of the deck, `);
      if (bottom > 0) {
        elements.push(`put ${bottom} on the bottom, `);
      }
      if (top > 0) {
        elements.push(`put ${top} on the top, `);
      }
      if (handCount > 0) {
        if (shouldReveal && Array.isArray(hand)) {
          elements.push(`Putting: `);
          hand.forEach((card) => {
            elements.push(
              <CardLogEntry
                instanceId={card}
                privateEntry={undefined}
                player={activePlayer}
              />
            );
          });
          elements.push(` in hand.`);
        } else {
          elements.push(`put ${handCount} in hand, `);
        }
      }
      break;
    }
    case "NEW_GAME": {
      elements.push(
        `Thanks for playing! To start a new game click on the top right corner and select your deck.`
      );
      break;
    }
    case "GAME_RESTARTED": {
      elements.push(`The game has been restarted.`);
      break;
    }
    case "RESOLVING_ABILITIES": {
      elements.push(` is resolving abilities.`);
      break;
    }
    case "SHUFFLE_CARD": {
      const { instanceId } = entry;
      elements.push(`shuffled `);
      elements.push(
        <CardLogEntry
          instanceId={instanceId}
          privateEntry={undefined}
          player={activePlayer}
        />
      );
      elements.push(` into owner's deck.`);
      break;
    }
    case "EFFECT": {
      activateStackLayerEntries(elements, entry, isActivePlayerTheSender);
      break;
    }
    case "CANCEL_EFFECT": {
      cancelStackLayerEntries(elements, entry, isActivePlayerTheSender);
      break;
    }
    case "RESOLVE_EFFECT": {
      resolveStackLayerEntries(
        elements,
        entry,
        activePlayer,
        isActivePlayerTheSender
      );
      break;
    }
    case "BACK_TO_LOBBY": {
      elements.push(`has moved back to the lobby.`);
      break;
    }
    case "REVEAL_CARD": {
      const { card, from } = entry;
      elements.push(`reveals `);
      elements.push(
        <CardLogEntry
          instanceId={card}
          privateEntry={undefined}
          player={activePlayer}
        />
      );
      elements.push(` from ${from}.`);
      break;
    }
    case "READY_TO_START": {
      elements.push(
        `${isActivePlayerTheSender ? "are" : "is"} ready to start the game ${
          entry.solo ? "in SOLO mode" : ""
        }.`
      );
      break;
    }
    case "MULLIGAN": {
      const { cards, player } = entry;
      // TODO: Add to the activePlayer taking mulligan which cards were put to the bottom
      elements.push(
        ` ${
          isActivePlayerTheSender ? "have" : "has"
        } taken a mulligan, drawing ${cards?.length} new cards. `
      );
      if (player === activePlayer) {
        cards?.forEach((card) => {
          elements.push(
            <CardLogEntry
              instanceId={card}
              privateEntry={entry.private}
              player={activePlayer}
            />
          );
          elements.push(", \n");
        });
      }

      break;
    }
    case "MOVE_CARD": {
      moveCard(
        elements,
        entry,
        activePlayer,
        store.cardStore.getCard(entry.instanceId)?.lorcanitoCard,
        entry.instanceId
      );
      break;
    }
    case "DAMAGE_CHANGE": {
      const { from, to, instanceId } = entry;
      const damageDelta = to - from;
      const damageMark = damageDelta > 0 ? "taken" : "healed";
      elements.push(
        <CardLogEntry
          instanceId={instanceId}
          privateEntry={entry.private}
          player={activePlayer}
        />
      );
      elements.push(` ${damageMark} ${damageDelta} damage`);
      break;
    }
    case "SHUFFLE_DECK": {
      elements.push(
        `shuffled ${isActivePlayerTheSender ? "your" : "their"} deck`
      );
      break;
    }
    case "SING": {
      const { singer, song } = entry;
      elements.push(<CardLogEntry instanceId={singer} player={activePlayer} />);
      elements.push(` sang `);
      elements.push(<CardLogEntry instanceId={song} player={activePlayer} />);
      break;
    }
    case "SHIFT": {
      const { shifter, shifted } = entry;
      elements.push(`shifted `);

      elements.push(
        <CardLogEntry instanceId={shifted} player={activePlayer} />
      );
      elements.push(` into `);
      elements.push(
        <CardLogEntry instanceId={shifter} player={activePlayer} />
      );
      break;
    }
    case "CHALLENGE": {
      const { attacker, defender } = entry;
      const attackerCard = store.cardStore.getCard(attacker);
      const defenderCard = store.cardStore.getCard(defender);

      // TODO: add damage dealt

      elements.push(`challenged `);
      elements.push(<CardLogEntry card={defenderCard} player={activePlayer} />);
      elements.push(` with `);
      elements.push(<CardLogEntry card={attackerCard} player={activePlayer} />);
      break;
    }
    case "QUEST": {
      const { amount, instanceId } = entry;

      elements.push(`quests with `);
      elements.push(
        <CardLogEntry
          instanceId={instanceId}
          privateEntry={entry.private}
          player={activePlayer}
        />
      );
      elements.push(` for ${amount} lore`);

      break;
    }
    case "LOAD_DECK": {
      elements.push(`loaded a deck`);
      break;
    }
    case "LORE_CHANGE": {
      const { from, to, player } = entry;
      const loreDelta = to - from;

      // When LORE_CHANGE has activePlayer, it means a activePlayer removed from another
      if (player) {
        elements.pop();
        if (activePlayer === player) {
          elements.push(`${playerAction} You `);
        } else {
          elements.push(`${opponentAction} Opponent `);
        }
      }

      elements.push(
        `${loreDelta < 0 ? "lost ▼" : "gained ▲"} ${loreDelta} lore and now ${
          isActivePlayerTheSender ? "have" : "has"
        } ${to} lore.`
      );

      break;
    }
    case "PASS_TURN": {
      elements.push(` passed the turn.`);
      break;
    }
    case "NEW_TURN": {
      elements.push(
        ` ${isMyTurn ? "are" : "is"} starting turn #${Math.round(
          entry.turn / 2
        )}. `
      );

      if (isMyTurn) {
        elements.push("and you draw ");
        elements.push(
          <CardLogEntry
            instanceId={entry.instanceId}
            privateEntry={entry.private}
            player={activePlayer}
          />
        );
      } else {
        elements.push("Your opponent draws a card.");
      }

      break;
    }
    // TODO: THIS IS REEDUNDANT
    case "ADD_TO_INKWELL": {
      const { instanceId } = entry;
      elements.push(` added `);
      // These images are wrongly sized, so I'm using the same image for both
      const img = store.cardStore.getCard(instanceId)?.inkwell
        ? "https://lorcania.com/images/cards/elements/inkwell.svg"
        : "https://lorcania.com/images/cards/elements/inkless.webp";
      elements.push(
        <Image src={img} width={8} height={8} alt="Inkless card" quality={20} />
      );
      elements.push(
        <CardLogEntry
          instanceId={entry.instanceId}
          privateEntry={entry.private}
          player={activePlayer}
        />
      );
      elements.push(` to inkwell. `);
      break;
    }
    case "GOING_FIRST": {
      elements.push(
        `${entry.player} is going first, and skipping his/her draw step.`
      );
      break;
    }
    case "READY": {
      elements.push(`[READY]`);
      break;
    }
    case "SET": {
      elements.push(`[SET]`);
      break;
    }
    case "DRAW": {
      elements.push(`draws a card`);
      break;
    }
    case "TAP": {
      // TODO: Check if the card is in the inkwell and show a different message
      const card = store.cardStore.getCard(entry.instanceId)?.lorcanitoCard;

      if (entry.inkwell) {
        elements.push(`${entry?.value ? "taps" : "untaps"} from inkwell`);
      } else if (!card) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        elements.push(`Unknown card ${entry?.instanceId}`);
      } else {
        elements.push(`${entry?.value ? "exert" : "ready"} `);
        elements.push(
          <CardLogEntry
            instanceId={entry.instanceId}
            privateEntry={entry.private}
            player={activePlayer}
          />
        );
      }

      break;
    }
    case "WON_DIE_ROLL": {
      elements.push(`won the die roll.`);
      break;
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      if (process.env.NODE_ENV === "development") {
        elements.push(`Unknown action: ${entry}`);
      }
      exhaustiveCheck(entry);
    }
  }

  return elements;
}
