import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist', 'dev-dist'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'],
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      globals: globals.browser,
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      // Pages hold prose with plain apostrophes and quotes
      'react/no-unescaped-entities': 'off',
      // Files import React by convention; the JSX runtime doesn't need it
      'no-unused-vars': ['error', { varsIgnorePattern: '^React$' }],
    },
  },
  {
    // Build and tool config files run in Node
    files: ['*.{js,cjs,mjs}'],
    languageOptions: { globals: globals.node },
  },
];
