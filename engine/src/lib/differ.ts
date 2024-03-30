import differ from "deep-diff";
import { Game } from "@lorcanito/engine/types";

// https://github.com/flitbit/diff#differences
const dictionary = {
  E: {
    color: "#2196F3",
    text: "CHANGED:",
  },
  N: {
    color: "#4CAF50",
    text: "ADDED:",
  },
  D: {
    color: "#F44336",
    text: "DELETED:",
  },
  A: {
    color: "#2196F3",
    text: "ARRAY:",
  },
};

export function style(kind: keyof typeof dictionary) {
  return `color: ${dictionary[kind].color}; font-weight: bold`;
}

// @ts-ignore
export function render(diff) {
  const { kind, path, lhs, rhs, index, item } = diff;

  switch (kind) {
    case "E":
      return [path.join("."), lhs, "→", rhs];
    case "N":
      return [path.join("."), rhs];
    case "D":
      return [path.join(".")];
    case "A":
      return [`${path.join(".")}[${index}]`, item];
    default:
      return [];
  }
}

export function diffLogger(
  prevState: Game,
  newState: Game,
  logger: typeof console,
  isCollapsed?: boolean,
  onDiff?: (prev: Game, after: Game) => void,
) {
  if (prevState.lastActivity) {
    prevState.lastActivity = 0;
  }

  if (newState.lastActivity) {
    newState.lastActivity = 0;
  }

  if (prevState.undoState) {
    prevState.undoState = "";
  }

  if (newState.undoState) {
    newState.undoState = "";
  }

  const diff = differ(prevState, newState);

  try {
    if (isCollapsed) {
      logger.groupCollapsed("diff");
    } else {
      logger.group("diff");
    }
  } catch (e) {
    logger.log("diff");
  }

  if (diff) {
    if (onDiff) {
      onDiff(prevState, newState);
    }
    diff.forEach((elem) => {
      const { kind } = elem;
      const output = render(elem);

      logger.log(`%c ${dictionary[kind].text}`, style(kind), ...output);
    });
  } else {
    logger.log("—— no diff ——");
  }

  try {
    logger.groupEnd();
  } catch (e) {
    logger.log("—— diff end —— ");
  }
}
