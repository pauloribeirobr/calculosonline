import { test, expect } from '@playwright/test'

// Trava a F72 — feriados nacionais.
//
// Alvo (Semrush de 21/09, Diário de 22/09, parte 14): `feriados 2027` 22,2K
// buscas/mês com KD 16, `feriados` 74K/KD 25 e `hoje é feriado` 110K/KD 29.
//
// O que se trava aqui:
//  1. as três rotas existem, entram no sitemap e não nascem órfãs (F43);
//  2. a lista é a da lei, com a fonte linkada (pedido do Paulo: citar a fonte);
//  3. os números da página saem do mesmo motor da calculadora de datas;
//  4. "hoje é feriado?" é calculado no navegador, com a data de Brasília.

test.describe('F72 — rotas, SEO e links', () => {
  for (const path of ['/feriados', '/feriados/2026', '/feriados/2027']) {
    test(`${path} responde 200 e entra no sitemap`, async ({ page, request }) => {
      const resposta = await page.goto(path)
      expect(resposta?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      const sitemap = await (await request.get('/sitemap.xml')).text()
      expect(sitemap).toContain(`${path}</loc>`)
    })
  }

  test('ano fora da lista publicada é 404, não página gerada sob demanda', async ({ page }) => {
    const resposta = await page.goto('/feriados/2031')
    expect(resposta?.status()).toBe(404)
  })

  test('o rodapé de toda página linka a entrada de feriados', async ({ page }) => {
    await page.goto('/calculadora/irrf')
    await expect(
      page.getByRole('contentinfo').getByRole('link', { name: 'Feriados nacionais' }),
    ).toHaveAttribute('href', '/feriados')
  })

  test('a categoria Tempo e a calculadora de datas linkam os feriados', async ({ page }) => {
    await page.goto('/categoria/tempo')
    await expect(
      page.getByRole('main').getByRole('link', { name: /Feriados nacionais/ }),
    ).toHaveAttribute('href', '/feriados')
    await page.goto('/calculadora/datas')
    await expect(page.locator('article a[href="/feriados/2026"]').first()).toBeVisible()
  })

  test('o title de cada ano cabe na SERP', async ({ page }) => {
    for (const ano of [2026, 2027]) {
      await page.goto(`/feriados/${ano}`)
      const title = await page.title()
      expect(title).toContain(`Feriados ${ano}`)
      expect(title.length).toBeLessThanOrEqual(78)
    }
  })
})

test.describe('F72 — a lista é a da lei, com fonte', () => {
  test('2026: os 10 feriados nacionais da Portaria MGI nº 11.460/2025', async ({ page }) => {
    await page.goto('/feriados/2026')
    const tabela = page.getByTestId('tabela-feriados')
    await expect(tabela.locator('tbody tr')).toHaveCount(10)
    for (const nome of [
      'Confraternização Universal',
      'Paixão de Cristo',
      'Tiradentes',
      'Dia Mundial do Trabalho',
      'Independência do Brasil',
      'Nossa Senhora Aparecida',
      'Finados',
      'Proclamação da República',
      'Dia Nacional de Zumbi e da Consciência Negra',
      'Natal',
    ]) {
      await expect(tabela).toContainText(nome)
    }
    // Carnaval é ponto facultativo: fora da tabela de feriados.
    await expect(tabela).not.toContainText('Carnaval')
  })

  test('cada feriado linka o texto oficial da lei', async ({ page }) => {
    await page.goto('/feriados/2026')
    const links = page.getByTestId('tabela-feriados').locator('a')
    await expect(links).toHaveCount(10)
    for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')))) {
      expect(href).toMatch(/^https:\/\/www\.planalto\.gov\.br\//)
    }
  })

  test('2026 cita a portaria do DOU; 2027 diz que ela ainda não saiu', async ({ page }) => {
    await page.goto('/feriados/2026')
    await expect(page.locator('a[href*="in.gov.br"]').first()).toContainText('11.460')

    await page.goto('/feriados/2027')
    await expect(page.locator('a[href*="in.gov.br"]')).toHaveCount(0)
    await expect(page.getByRole('main')).toContainText('sai no fim de dezembro de 2026')
  })

  test('os dias úteis do ano batem com a calculadora de datas', async ({ page }) => {
    await page.goto('/feriados/2026')
    await expect(page.getByTestId('tabela-dias-uteis')).toContainText('252')

    // Mesmo número pelo formulário: 31/12/2025 → 31/12/2026, sem o dia
    // inicial, é o ano de 2026 inteiro.
    await page.goto('/calculadora/datas')
    await page.getByLabel('Data inicial').fill('31/12/2025')
    await page.getByLabel('Data final').fill('31/12/2026')
    await page.getByRole('button', { name: 'Calcular', exact: true }).click()
    await expect(page.getByRole('list', { name: 'Detalhamento linha a linha' })).toContainText(
      '252 dias',
    )
  })
})

test.describe('F72 — hoje é feriado?', () => {
  test('num dia comum, responde não e mostra o próximo', async ({ page }) => {
    // 04/10/2026, meio-dia em Brasília.
    await page.clock.setFixedTime(new Date('2026-10-04T15:00:00Z'))
    await page.goto('/feriados')
    await expect(page.getByTestId('resposta-hoje')).toHaveText('Não, hoje não é feriado nacional.')
    await expect(page.getByTestId('proximo-feriado')).toContainText('Nossa Senhora Aparecida')
    await expect(page.getByTestId('proximo-feriado')).toContainText('daqui a 8 dias')
  })

  test('no feriado, responde sim', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-20T15:00:00Z'))
    await page.goto('/feriados/2026')
    await expect(page.getByTestId('resposta-hoje')).toContainText(
      'Sim — hoje é Dia Nacional de Zumbi e da Consciência Negra',
    )
  })

  test('usa a data de Brasília, não a UTC', async ({ page }) => {
    // 01h UTC de 12/10 ainda é 22h de 11/10 em Brasília: o feriado é amanhã.
    await page.clock.setFixedTime(new Date('2026-10-12T01:00:00Z'))
    await page.goto('/feriados')
    await expect(page.getByTestId('resposta-hoje')).toHaveText('Não, hoje não é feriado nacional.')
    await expect(page.getByTestId('proximo-feriado')).toContainText('amanhã')
  })
})
