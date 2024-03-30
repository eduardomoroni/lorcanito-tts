/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1",
    "^@lorcanito/engine$": "<rootDir>/src/index.ts",
    "^@lorcanito/engine/(.*)$": "<rootDir>/src/$1",
  },
};
