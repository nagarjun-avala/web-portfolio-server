/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^(\\.{1,2}/.*)\\.js$": "$1"
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            useESM: true,
        }],
    },
    extensionsToTreatAsEsm: ['.ts'],
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
};
