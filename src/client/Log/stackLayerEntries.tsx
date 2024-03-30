import React from "react";
import { AbilityEntry } from "~/client/Log/AbilityEntry";
import { CardLogEntry } from "~/client/Log/CardLogEntry";
import { exhaustiveCheck } from "~/libs/exhaustiveCheck";
import type {
  Ability,
  CancelEffectEntry,
  EffectEntry,
  ResolveEffectEntry,
  CardEffects,
  PlayerEffects,
} from "@lorcanito/engine";
type Effect = CardEffects | PlayerEffects;

export function resolveStackLayerEntries(
  logs: (string | JSX.Element)[],
  entry: ResolveEffectEntry,
  activePlayer: string,
  isActivePlayerTheSender: boolean,
) {
  const { params, layer } = entry;
  const elements: (string | JSX.Element)[] = [];
  elements.push(`${isActivePlayerTheSender ? "resolved" : "resolves"} `);
  elements.push(
    <AbilityEntry ability={layer?.ability} instanceId={layer?.instanceId} />,
  );
  const ability = layer?.ability || ({} as Ability);

  if ("effects" in ability) {
    const effects = ability.effects || [];

    effects.forEach((effect: Effect) => {
      switch (effect.type) {
        case "replacement":
          return;
        case "ability":
          return;
        case "conditional":
          return;
        case "scry":
          return;
        case "draw":
          return;
        case "banish":
          return;
        case "discard":
          return;
        case "lore": {
          const { amount, modifier } = effect;
          elements.push(
            `, ${
              modifier === "add" ? "adding" : "reducing"
            } its lore by ${amount}`,
          );
          break;
        }
        case "attribute":
          elements.push(
            `, ${effect.modifier === "add" ? "adding" : "reducing"} targets' ${
              effect.attribute
            } in ${effect.amount} ${
              effect.duration === "next_turn" ? "until next turn" : "this turn"
            }, targets:  `,
          );
          break;
        case "restriction":
          elements.push(
            `, and it can not longer ${effect.restriction} ${
              effect.duration === "turn" ? "this turn" : "until next turn"
            }.`,
          );
          break;
        case "move":
          const { layer } = entry;
          elements.push(`, moving `);
          elements.push(
            <CardLogEntry
              instanceId={layer?.instanceId}
              player={activePlayer}
            />,
          );
          elements.push(
            `, to ${effect.to}${effect.exerted ? " exerted" : ""}.`,
          );
          break;
        case "exert":
          elements.push(` exerts`);
          break;
        case "heal":
          elements.push(`, healing ${effect.amount} from `);
          break;
        case "damage":
          elements.push(`, dealing ${effect.amount} damage to `);
          break;
        case "shuffle":
          elements.push(`, gaining the ability ${effect}.`);
          break;
        case "protection":
          elements.push(`, gaining the ability ${effect}.`);
          break;
        case "player-restriction": {
          const { restriction } = effect;
          elements.push(`, and it can not longer ${restriction} `);
          break;
        }
        case "play": {
          elements.push(`playin a card from hand`);
          break;
        }
        case "reveal": {
          elements.push(`reveals`);
          break;
        }
        case "reveal-and-play": {
          elements.push(`reveals and decides whether to play or not`);
          break;
        }
        default: {
          exhaustiveCheck(effect);
        }
      }
    });
  }

  if (params?.targets) {
    elements.push(", Targeting: ");
    params.targets.forEach((target) => {
      elements.push(
        <CardLogEntry
          instanceId={target.instanceId}
          privateEntry={undefined}
          player={activePlayer}
        />,
      );
      elements.push(", ");
    });
  }

  elements.forEach((element) => logs.push(element));
}

export function cancelStackLayerEntries(
  elements: (string | JSX.Element)[],
  entry: CancelEffectEntry,
  isActivePlayerTheSender: boolean,
) {
  const { effect } = entry;
  elements.push(`${isActivePlayerTheSender ? "cancelled" : "cancels"} `);
  elements.push(
    <AbilityEntry ability={effect.ability} instanceId={effect.instanceId} />,
  );
}

export function activateStackLayerEntries(
  elements: (string | JSX.Element)[],
  entry: EffectEntry,
  isActivePlayerTheSender: boolean,
) {
  const { effect } = entry;

  if (effect.ability.optional) {
    elements.push(
      `${
        !isActivePlayerTheSender
          ? "opponent has to decide to activate "
          : "you have to decide to activate"
      } `,
    );
  } else {
    elements.push(`${isActivePlayerTheSender ? "activated" : "activates"} `);
  }
  elements.push(
    <AbilityEntry ability={effect.ability} instanceId={effect.instanceId} />,
  );
}
