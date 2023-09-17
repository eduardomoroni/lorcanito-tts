// Some transactions run pretty similar code, we're also having clousre issues where the value in the closuree is not updated
import { Meta, TableCard } from "~/providers/TabletopProvider";

// This does not mutate
export function updateMetaHelper(dbMeta: Meta, meta: Meta) {
  if (!dbMeta) {
    console.log("Meta not found");
    return meta;
  }

  if (dbMeta) {
    console.log("updated ", { ...dbMeta, ...meta });
    return { ...dbMeta, ...meta };
  }

  return meta;
}

export function updateCardMetaHelper(card?: TableCard, meta?: Meta) {
  if (!card) {
    return card;
  }

  if (meta) {
    card.meta = updateMetaHelper(card.meta || {}, meta);
  }

  return card;
}
