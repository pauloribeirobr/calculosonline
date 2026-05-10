import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        // Re-export barrels (sem lógica)
        'src/index.ts',
        'src/trabalhista/index.ts',
        // Módulos placeholder reservados para sprints futuras
        'src/impostos/index.ts',
        'src/financeiro/index.ts',
        'src/investimentos/index.ts',
        'src/saude/index.ts',
        'src/negocios/index.ts',
        // Tipos e testes não contam
        'src/**/types.ts',
        'src/**/*.test.ts',
        'src/**/__tests__/**',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
})
