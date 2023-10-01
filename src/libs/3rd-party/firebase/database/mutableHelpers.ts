import type { Table } from "~/spaces/providers/TabletopProvider";

// use moveCardHelper instead
export function drawCardHelper(table?: Table) {
  if (!table || !table.zones) {
    console.info("Table not found");
    return;
  }

  const zones: Table["zones"] = table.zones;
  const card = zones?.deck?.shift();

  if (!card) {
    console.info("Unable to draw");
    return table;
  }

  if (zones.hand) {
    zones.hand.push(card);
  } else {
    zones.hand = [card];
  }

  return table;
}
