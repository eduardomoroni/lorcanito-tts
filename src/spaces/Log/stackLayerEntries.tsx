import React from "react";
import { CardEffectEntry } from "~/spaces/Log/CardEffectEntry";
import { CardLogEntry } from "~/spaces/Log/CardLogEntry";
import type {
  CancelEffectEntry,
  EffectEntry,
  ResolveEffectEntry,
} from "~/spaces/Log/types";
import { exhaustiveCheck } from "~/libs/exhaustiveCheck";

export function resolveStackLayerEntries(
  elements: (string | JSX.Element)[],
  entry: ResolveEffectEntry,
  activePlayer: string,
  isActivePlayerTheSender: boolean
) {
  const { targetId, effect } = entry;
  elements.push(`${isActivePlayerTheSender ? "resolved" : "resolves"} `);
  elements.push(<CardEffectEntry effect={effect} />);
  elements.push(`, targeting `);
  elements.push(
    <CardLogEntry
      instanceId={targetId}
      privateEntry={undefined}
      player={activePlayer}
    />
  );

  const ability = effect?.ability || {};
  if ("effects" in ability) {
    const effects = ability.effects || [];

    effects.forEach((effect) => {
      switch (effect.type) {
        case "lore": {
          const { amount, modifier } = effect;
          elements.push(
            `, ${
              modifier === "add" ? "adding" : "reducing"
            } its lore by ${amount}`
          );
          break;
        }
        case "replacement":
          break;
        case "attribute":
          elements.push(
            `, ${effect.modifier === "add" ? "adding" : "reducing"} its ${
              effect.type
            } ${effect.duration === "turn" ? "this turn" : "until next turn"}.`
          );
          break;
        case "restriction":
          elements.push(
            `, and it can not longer ${effect.restriction} ${
              effect.duration === "turn" ? "this turn" : "until next turn"
            }.`
          );
          break;
        case "ability":
          elements.push(`, gaining the ability ${effect.ability}.`);
          break;
        case "conditional":
          elements.push(`, gaining the ability ${effect}.`);
          break;
        case "move":
          elements.push(`, gaining the ability ${effect}.`);
          break;
        case "heal":
          elements.push(`, gaining the ability ${effect}.`);
          break;
        case "scry":
          elements.push(`, gaining the ability ${effect}.`);
          break;
        case "exert":
          elements.push(`, gaining the ability ${effect}.`);
          break;
        case "damage":
          elements.push(`, gaining the ability ${effect}.`);
          break;
        case "draw":
          elements.push(`, gaining the ability ${effect}.`);
          break;
        case "banish":
          elements.push(`, gaining the ability ${effect}.`);
          break;
        case "discard":
          elements.push(`, gaining the ability ${effect}.`);
          break;
        case "shuffle":
          elements.push(`, gaining the ability ${effect}.`);
          break;
        default: {
          exhaustiveCheck(effect);
        }
      }
    });
  }
}

export function cancelStackLayerEntries(
  elements: (string | JSX.Element)[],
  entry: CancelEffectEntry,
  isActivePlayerTheSender: boolean
) {
  const { effect } = entry;
  elements.push(`${isActivePlayerTheSender ? "cancelled" : "cancels"} `);
  elements.push(<CardEffectEntry effect={effect} />);
}

export function activateStackLayerEntries(
  elements: (string | JSX.Element)[],
  entry: EffectEntry,
  isActivePlayerTheSender: boolean
) {
  const { effect } = entry;
  elements.push(`${isActivePlayerTheSender ? "activated" : "activates"} `);
  elements.push(<CardEffectEntry effect={effect} />);
}
