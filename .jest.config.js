module.exports = {
    roots: ['src'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    testRegex: '(.*.(test|spec)).(jsx?|tsx?)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverage: true,
    coveragePathIgnorePatterns: ['(tests/.*.mock).(jsx?|tsx?)$'],
    verbose: true,
};
