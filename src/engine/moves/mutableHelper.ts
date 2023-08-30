// Firebase does remove properties when they're empty
// Firebase transactions need to mutate the values
// This helper is used to mutate the values
import type { Meta, TableCard } from "~/providers/TabletopProvider";

export const mutateCardMeta = (card: TableCard, meta: Partial<Meta>): void => {
  if (!card) {
    return card;
  } else if (!card.meta) {
    card.meta = meta;
    console.log(meta);
  } else {
    card.meta = { ...card.meta, ...meta };
  }
};
