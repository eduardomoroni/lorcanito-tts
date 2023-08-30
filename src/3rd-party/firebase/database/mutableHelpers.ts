import type { Table, Zones } from "~/providers/TabletopProvider";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";

export function moveCardHelperTable(
  table?: Table,
  // @ts-expect-error naah
  instanceId: string,
  from: Zones,
  to: Zones,
  position?: "first" | "last"
) {
  if (!table || !table.zones) {
    console.info("Table not found", table);
    return table;
  }

  if (from === to && from !== "deck") {
    console.info("Same zone");
    return table;
  }

  // Firebase doesn't like empty arrays
  if (!table.zones[from]) {
    table.zones[from] = [];
  }

  // it removes the array when it's empty
  if (!table.zones[to]) {
    table.zones[to] = [];
  }

  if (!table.zones[from]?.includes(instanceId)) {
    console.info("Card not found in zone", instanceId, from);
    return table;
  }

  const zones: Table["zones"] = table?.zones;

  if (zones && zones[from] && zones[to]) {
    // @ts-expect-error it's being checked above
    zones[from] = zones[from].filter((card: string) => card !== instanceId);

    if (!zones[to]) {
      zones[to] = [instanceId];
    } else if (position === "first") {
      // @ts-expect-error it's being checked above
      zones[to] = [instanceId, ...zones[to]];
    } else {
      zones[to] = [...zones[to], instanceId];
    }
  }

  // Prevent duplicates
  (Object.keys(zones) as Zones[]).forEach((zone) => {
    if (zone !== to && zones[zone]?.includes(instanceId)) {
      zones[zone] = zones[zone]?.filter((card) => card !== instanceId);

      console.log("Removing duplicates", zone, instanceId);
      logAnalyticsEvent("remove_duplicates", { zone, instanceId });
    }
  });

  return table;
}

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
