import js from '@eslint/js';
import stylisticJS from '@stylistic/eslint-plugin-js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: true,
        process: true,
      },
    },
    files: ['**/*.mjs'],
    plugins: { '@stylistic/js': stylisticJS },
    rules: {
      'arrow-spacing': 'error',
      'brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
      'keyword-spacing': 'error',
      'object-curly-spacing': ['error', 'always'],
      'prefer-const': 'error',
      'prefer-template': 'error',
      semi: ['error', 'always'],
      '@stylistic/js/array-bracket-spacing': ['error', 'never'],
      '@stylistic/js/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/js/comma-spacing': ['error', {
        before: false,
        after: true,
      }],
      '@stylistic/js/comma-style': ['error', 'last'],
      '@stylistic/js/indent': ['error', 2, { SwitchCase: 1 }],
      '@stylistic/js/no-multi-spaces': ['error', { ignoreEOLComments: true }],
      '@stylistic/js/no-whitespace-before-property': 'error',
      '@stylistic/js/object-curly-newline': ['error', { multiline: true }],
      '@stylistic/js/object-property-newline': 'error',
      '@stylistic/js/quote-props': ['error', 'as-needed'],
      '@stylistic/js/quotes': ['error', 'single', { allowTemplateLiterals: true }],
    },
  },
];
