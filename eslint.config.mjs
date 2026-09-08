import next from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';

// `eslint-config-next/core-web-vitals` already bundles next/typescript, which
// pulls in typescript-eslint's recommended set — so it is not spread again here.
export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'db/migrations/**',
      'next-env.d.ts',
    ],
  },

  ...next,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // The project forbids `any` and silenced errors outright.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': true, 'ts-nocheck': true, 'ts-expect-error': 'allow-with-description' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // Unawaited promises in route handlers and actions are a real source of
      // lost writes and unhandled rejections.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',

      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  {
    // Environment access is centralised so secrets cannot drift into client code.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/lib/env.client.ts', 'src/lib/env.server.ts', 'src/lib/image-loader.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message: 'Import from @/lib/env.server or @/lib/env.client instead of reading process.env.',
        },
      ],
    },
  },

  {
    // Material UI is admin-only; letting it reach the storefront would blow the
    // client bundle budget.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/app/(admin)/**', 'src/features/admin/**', 'src/components/admin/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@mui/*', '@emotion/*'],
              message: 'Material UI and Emotion are restricted to the admin route group.',
            },
          ],
        },
      ],
    },
  },

  {
    // CLI scripts report progress on stdout; that is their interface.
    files: ['db/**/*.{ts,mjs}'],
    rules: { 'no-console': 'off' },
  },

  {
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Test doubles are async purely to satisfy the signature under test.
      '@typescript-eslint/require-await': 'off',
    },
  },
);
