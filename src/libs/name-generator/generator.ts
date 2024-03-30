import {
  uniqueNamesGenerator,
  type Config,
  adjectives,
} from "unique-names-generator";
import {
  lorcanaNames,
  lorcanaTitles,
} from "~/libs/name-generator/nameDictionary";

export function generateLobbyName(): string {
  const customConfig: Config = {
    dictionaries: [adjectives, lorcanaNames, lorcanaTitles],
    separator: " ",
    length: 3,
    style: "capital",
  };

  return uniqueNamesGenerator(customConfig);
}

export function generateUserName(): string {
  const customConfig: Config = {
    dictionaries: [lorcanaNames, lorcanaTitles],
    separator: " ",
    length: 2,
    style: "capital",
  };

  return uniqueNamesGenerator(customConfig);
}
