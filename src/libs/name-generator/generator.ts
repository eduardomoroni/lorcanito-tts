import {
  uniqueNamesGenerator,
  type Config,
  adjectives,
  colors,
} from "unique-names-generator";
import {
  lorcanaNames,
  lorcanaTitles,
} from "~/libs/name-generator/nameDictionary";

const customConfig: Config = {
  dictionaries: [adjectives, lorcanaNames, lorcanaTitles],
  separator: " ",
  length: 3,
  style: "capital",
};

export function generateName(): string {
  return uniqueNamesGenerator(customConfig);
}
