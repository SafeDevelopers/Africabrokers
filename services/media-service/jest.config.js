/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "./",
  moduleFileExtensions: ["js", "json", "ts"],
  testRegex: ".*\\.spec\\.ts$",
  coverageDirectory: "../coverage/media-service",
  collectCoverageFrom: ["src/**/*.ts"],
  passWithNoTests: true
};
