// @ts-check
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/.next/',
      '**/dist/',
      '**/node_modules/',
      '**/coverage/',
      '**/.turbo/',
      '**/*.config.mjs',
      '**/*.config.ts',
      '**/*.config.js',
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
)
