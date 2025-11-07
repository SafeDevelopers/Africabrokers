/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "./",
  moduleFileExtensions: ["js", "json", "ts"],
  testRegex: ".*\\.(spec|e2e-spec)\\.ts$",
  coverageDirectory: "../coverage/core-api",
  collectCoverageFrom: ["src/**/*.ts"]
};
