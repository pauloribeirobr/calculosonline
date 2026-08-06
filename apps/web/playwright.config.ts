import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.E2E_PORT ?? 3000)
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // Specs `*.mobile.spec.ts` rodam só no projeto mobile abaixo (não faz
      // sentido duplicar em viewport desktop).
      testIgnore: /\.mobile\.spec\.ts$/,
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
      // Escopo restrito a specs dedicadas (`*.mobile.spec.ts`) — mantém a
      // suíte desktop (26 testes) rodando uma única vez, sem dobrar o tempo
      // de CI; só telas/interações que dependem de viewport pequeno (ex.:
      // stepper por toque) precisam de um projeto mobile de verdade.
      testMatch: /\.mobile\.spec\.ts$/,
    },
  ],
  // Reusa o dev server se já estiver rodando; senão sobe um.
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
