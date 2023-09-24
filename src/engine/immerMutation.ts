import type { Meta } from "~/providers/TabletopProvider";
import { selectCardMeta } from "~/engine/selectors";
import type { LorcanitoGameState } from "~/engine/types";
import { Game } from "~/libs/game";

export function updateCardMeta(
  G: LorcanitoGameState,
  instanceId: string,
  // null means remove meta
  meta: Partial<Meta> | null,
) {
  const cardMeta = selectCardMeta(G, instanceId);
  setCardMeta(G, instanceId, { ...cardMeta, ...meta });
}

export function setCardMeta(
  state: Game,
  instanceId: string,
  // null means remove meta
  meta: Partial<Meta> | null,
) {
  const card = state.cards[instanceId];
  if (!card) {
    console.error("Card not found", instanceId);
    return;
  }

  if (!meta) {
    // Setting to null removes the meta
    card.meta = null;
  } else if (!card.meta) {
    card.meta = meta;
  } else {
    card.meta = {
      // @ts-ignore
      ...state.cards[instanceId].meta,
      ...meta,
    };
  }
}
