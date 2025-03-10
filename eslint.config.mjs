// eslint.config.mjs
import js from '@eslint/js';
import eslintPluginTypescript from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier/recommended';
import eslintPluginAutofix from 'eslint-plugin-autofix';
import eslintPluginImport from 'eslint-plugin-import';
import typescriptParser from '@typescript-eslint/parser';
import eslintNodePlugin from 'eslint-plugin-node';
import { rules } from 'eslint-plugin-prettier';

export default [
  {
    // Ignore specific directories
    ignores: ['dist/**'],
  },
  // TypeScript and JavaScript overrides
  {
    files: ['*.ts', '*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: true,
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Promise: 'readonly',
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      rules: {
        'prettier/prettier': 'warn',
        'no-unused-vars': 'error',
        'no-debugger': 'error',
      },
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      sourceType: 'script', // ✅ Use CommonJS instead of ES modules
      parserOptions: { project: null }, // Disable project for JavaScript files
      globals: {
        require: 'readonly', // ✅ Allow require()
        module: 'readonly', // ✅ Allow module.exports
        __dirname: 'readonly', // ✅ Allow __dirname
        setTimeout: 'readonly', // ✅ Allow setTimeout
        clearTimeout: 'readonly', // ✅ Allow clearTimeout
        Promise: 'readonly', // ✅ Allow Promise
      },
    },
  },
  js.configs.recommended, // ESLint recommended rules for JavaScript
  {
    files: ['*.ts', '*.tsx'],
    ...eslintNodePlugin.configs['flat/typescript'],
  },
  {
    settings: {
      'import/resolver': {
        typescript: {}, // Enable TypeScript resolution
      },
    },
  },
  {
    plugins: {
      import: eslintPluginImport,
      autofix: eslintPluginAutofix,
      '@typescript-eslint': eslintPluginTypescript,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_', // Ignore variables that start with '_'
          argsIgnorePattern: '^_', // Ignore function arguments that start with '_'
          ignoreRestSiblings: true, // Ignore unused rest properties
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': 'off', // Adjust based on environment if needed
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-useless-constructor': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
  {
    files: [
      'postcss.config.js',
      'tailwind.config.js',
      'delete_test_data.js',
      'next.config.js',
      '*.js',
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  prettier, // Prettier integration
];
