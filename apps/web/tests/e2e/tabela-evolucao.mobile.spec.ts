import { test, expect } from '@playwright/test'
import { encodeShareData } from '../../src/lib/shareLink'

// F86 no celular: a tabela mais larga (Tesouro com custódia, 6 colunas) rola
// dentro da própria caixa, sem empurrar a página para os lados.

test('tabela de evolução aberta não cria rolagem horizontal na página', async ({ page }) => {
  await page.goto(
    `/calculadora/tesouro-direto?d=${encodeShareData({ valorInicial: 20000, tipo: 'selic', taxaAnual: 0, prazoMeses: 24 })}`,
  )
  const resultado = page.getByRole('region', { name: 'Resultado do cálculo' })
  await resultado.locator('summary').filter({ hasText: 'Evolução mês a mês' }).click()
  await expect(resultado.locator('table')).toBeVisible()

  const larguras = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }))
  expect(larguras.pagina).toBeLessThanOrEqual(larguras.viewport)
})
