module.exports = {
    root: true,
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    extends: [
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'eslint-config-prettier', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
        'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        //"plugin:jsdoc/recommended"
    ],
    parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        tsconfigRootDir: __dirname,
    },
    plugins: ['@typescript-eslint', 'prettier'],
    rules: {
        '@typescript-eslint/naming-convention': [
            // Do not start interfaces with prefix "I"
            'error',
            {
                selector: 'interface',
                format: ['PascalCase'],
                custom: {
                    regex: '^I[A-Z]',
                    match: false,
                },
            },
        ],
        '@typescript-eslint/no-empty-interface': 0,
        '@typescript-eslint/no-empty-function': 0,
        'prettier/prettier': [2, { singleQuote: true, tabWidth: 4 }],
        'import/no-unresolved': 0,
        quotes: [2, 'single', { avoidEscape: true }],
        indent: ['error', 4, { SwitchCase: 1 }],
        'import/order': [
            2,
            {
                'newlines-between': 'always',
                groups: [
                    'index',
                    'sibling',
                    'parent',
                    'internal',
                    'external',
                    'builtin',
                ],
            },
        ],
        'eol-last': 2,
        'spaced-comment': 2,
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
                accessibility: 'no-public',
            },
        ],
    },
};
