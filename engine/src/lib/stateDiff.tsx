import { diff } from "deep-diff";
import { Game } from "@lorcanito/engine/types";
// https://github.com/flitbit/diff#differences
export type Diff = {
  kind: "N" | "D" | "E" | "A";
  path: string[];
  lhs: unknown;
  rhs: unknown;
};

function getByPath(path: string, obj: Record<string, unknown>) {
  return (
    path
      .split("/")
      // @ts-ignore
      .reduce((acc: Record<string, unknown>, part: string) => {
        return acc && acc[part];
      }, obj)
  );
}

export function convertDiffToRealTimeUpdates(diff: Diff[] = [], game: Game) {
  const updates: Record<string, unknown> = {};

  diff.forEach(({ path, rhs, kind }) => {
    if (!path) {
      return;
    }

    let value = rhs;
    const key: string = path.join("/");

    switch (kind) {
      // N - indicates a newly added property/element
      case "N":
        break;

      // D - indicates a property/element was deleted
      case "D":
        break;

      // E - indicates a property/element was edited
      case "E": {
        if (key.includes("/zones/") && diff.find((d) => d.kind === "A")) {
          return;
        }
        break;
      }

      // A - indicates a change occurred within an array
      case "A":
        value = getByPath(key, game);
        break;
    }

    updates[key] = value;
  });

  return updates;
}

export function getDiff(lhs: unknown, rhs: unknown): Diff[] {
  return diff(lhs, rhs) as Diff[];
}
