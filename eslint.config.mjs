// eslint.config.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// mimic CommonJS __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Apply recommended JavaScript rules
  js.configs.recommended,

  // Apply recommended TypeScript rules
  ...tseslint.configs.recommended,

  // Apply Next.js recommended rules using FlatCompat
  ...compat.extends('next/core-web-vitals'),

  // Define files to lint (adjust as needed for your project structure)
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'], // Specify your tsconfig.json for type-aware linting
      },
    },
    rules: {
      // Add any project-specific rules or overrides here
      // Example: 'react/react-in-jsx-scope': 'off',
    },
  },

  // Ignore files and directories
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'node_modules/**',
      'next-env.d.ts',
      '*.config.js',
      '*.config.mjs',
      '.sanity/runtime/**', // Ignorer les fichiers générés par Sanity
    ],
  },
];