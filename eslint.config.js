// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    ignores: [
      'node_modules/*',
      '.github/*',
      'functions/*',
      'lib/*',
    ],
  },
  {
    settings: {
      'env': {
        'browser': false,
        'node': true,
      },
      'import/resolver': {
        'node': {
          'extensions': [
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
          ],
        },
      },
      'settings': {
        'jsdoc': {
          'tagNamePreference': {
            'returns': 'return',
          },
        },
      },
    },
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        project: [
          './tsconfig.json',
          './tsconfig.test.json',
          './tsconfig.consumer.json',
        ],
        jsDocParsingMode: 'type-info',
        ecmaVersion: 'latest',
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          modules: true,
          spread: true,
          restParams: true,
          defaultParams: true,
        },
      },
    },
    files: [
      'src/**/*.ts',
      'test/**/*.ts',
      // Consumer-conditions type fixtures. Listed so the directory is linted
      // rather than exempt: a path ESLint does not visit is a path a real
      // problem can sit in unnoticed. Verified by planting a `no-dupe-keys`
      // violation here and observing it reported.
      'test-consumer/**/*.ts',
    ],
    rules: {
      'no-restricted-syntax': [
        'off',
      ],
      'max-len': [
        'error',
        {
          'code': 200,
          'ignoreComments': true,
          'ignoreUrls': true,
        },
      ],
      'no-mixed-spaces-and-tabs': 'error',
      'prefer-const': 'off',
      '@typescript-eslint/no-explicit-any': ['off'],
      '@typescript-eslint/no-namespace': ['off'],
      '@typescript-eslint/no-unused-vars': ['off'],
    },
  },
);
