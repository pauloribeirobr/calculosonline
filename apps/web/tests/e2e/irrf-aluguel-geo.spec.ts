import { test, expect } from '@playwright/test'
import { calculatorRegistry } from '../../src/lib/calculators'

// Trava o F53 (vocabulário do painel de IA), o F54 (IRRF sobre aluguel) e o
// F55 (JSON-LD `Dataset` nas tabelas legislativas).
//
// Contexto: o `irrf` é a página nº1 do site em citação por IA — 158 de 295 em
// 7 dias no Clarity — e ao mesmo tempo invisível no Google (88 impressões,
// posição 81). O painel de Share of Authority mostrou "calculadora irrf 2026
// aluguel" com citação real e a calculadora não atendia.

test.describe('IRRF sobre aluguel (F54)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora/irrf')
  })

  test('os campos de despesa só aparecem no modo aluguel', async ({ page }) => {
    const iptu = page.getByLabel('IPTU pago pelo locador')
    await expect(iptu).toBeHidden()

    await page.getByLabel('Origem do rendimento').selectOption('aluguel')
    await expect(iptu).toBeVisible()
    await expect(page.getByLabel('Condomínio e taxas pagos pelo locador')).toBeVisible()
    await expect(page.getByLabel('Taxa de administração imobiliária')).toBeVisible()
  })

  test('aluguel não desconta INSS e abate as despesas do locador', async ({ page }) => {
    await page.getByLabel('Origem do rendimento').selectOption('aluguel')
    await page.getByLabel('Valor bruto do mês').fill('500000') // R$ 5.000,00
    await page.getByLabel('IPTU pago pelo locador').fill('20000') // R$ 200,00
    await page.getByLabel('Condomínio e taxas pagos pelo locador').fill('45000') // R$ 450,00
    await page.getByLabel('Taxa de administração imobiliária').fill('35000') // R$ 350,00
    await page.getByRole('button', { name: 'Calcular IRRF' }).click()

    const detalhamento = page.getByRole('list', { name: 'Detalhamento linha a linha' })
    await expect(detalhamento).toContainText('Aluguel Bruto Recebido')
    await expect(detalhamento).toContainText('(-) IPTU')
    await expect(detalhamento).toContainText('(-) Taxa de administração imobiliária')
    // 5.000 − 1.000 de despesas = base de 4.000
    await expect(detalhamento).toContainText('R$ 4.000,00')
    await expect(detalhamento).not.toContainText('(-) INSS')
  })

  test('o mesmo valor rende imposto maior como aluguel que como salário', async ({ page }) => {
    await page.getByLabel('Valor bruto do mês').fill('500000')
    await page.getByRole('button', { name: 'Calcular IRRF' }).click()
    const comoSalario = await page.getByRole('list', { name: 'Detalhamento linha a linha' }).textContent()

    await page.getByLabel('Origem do rendimento').selectOption('aluguel')
    await page.getByRole('button', { name: 'Calcular IRRF' }).click()
    const comoAluguel = await page.getByRole('list', { name: 'Detalhamento linha a linha' }).textContent()

    // Sem INSS a base é o bruto inteiro — os dois detalhamentos têm de diferir.
    expect(comoAluguel).not.toBe(comoSalario)
    expect(comoAluguel).toContain('R$ 5.000,00')
  })

  test('o conteúdo explica o aluguel e responde na FAQ', async ({ page }) => {
    const artigo = page.locator('article')
    await expect(artigo.getByRole('heading', { name: /IRRF sobre aluguel/i })).toBeVisible()
    await expect(artigo.getByText(/carnê-leão/i).first()).toBeVisible()
    await expect(artigo.getByText(/benfeitoria/i).first()).toBeVisible()
  })
})

test.describe('vocabulário do painel de IA (F53)', () => {
  test('o registry carrega o vocabulário que gerou citação', async () => {
    const porSlug = (slug: string) => calculatorRegistry.find((c) => c.slug === slug)!

    // Foi "investimento", não "simulação" (que o F38 mirou), que gerou as 47
    // citações do tesouro em 7 dias.
    expect(porSlug('tesouro-direto').sinonimos).toEqual(
      expect.arrayContaining(['calculadora de investimento em tesouro direto']),
    )
    expect(porSlug('irrf').sinonimos).toEqual(
      expect.arrayContaining(['calcular IR 2026', 'cálculo de dependente no IR']),
    )
    expect(porSlug('cdb').sinonimos).toEqual(expect.arrayContaining(['benchmark de CDB']))
  })

  test('o vocabulário aparece no corpo do texto, não só no keywords', async ({ page }) => {
    // `keywords` não ranqueia nada desde 2009 — o que vale é o texto.
    await page.goto('/calculadora/irrf')
    const artigo = page.locator('article')
    await expect(artigo.getByRole('heading', { name: /IR na folha de pagamento/i })).toBeVisible()
    await expect(artigo.getByRole('heading', { name: /dependente no IR/i })).toBeVisible()

    await page.goto('/calculadora/tesouro-direto')
    await expect(
      page.locator('article').getByRole('heading', { name: /investir no Tesouro Direto/i }).first(),
    ).toBeVisible()

    await page.goto('/calculadora/inss')
    await expect(
      page.locator('article').getByRole('heading', { name: /calcular o INSS online/i }),
    ).toBeVisible()
  })
})

test.describe('JSON-LD Dataset das tabelas legislativas (F55)', () => {
  const comDataset = calculatorRegistry.filter((c) => c.dataset)

  test('as calculadoras de tabela legislativa declaram Dataset', async () => {
    // Se um dia isso ficar vazio, o F55 foi desfeito sem querer.
    expect(comDataset.map((c) => c.slug).sort()).toEqual(['das-mei', 'inss', 'irpf', 'irrf'])
  })

  for (const calc of comDataset) {
    test(`${calc.slug} publica Dataset com vigência e fonte`, async ({ page }) => {
      await page.goto(`/calculadora/${calc.slug}`)

      const blocos = await page.locator('script[type="application/ld+json"]').allTextContents()
      const dataset = blocos.map((b) => JSON.parse(b)).find((d) => d['@type'] === 'Dataset')

      expect(dataset, `${calc.slug} sem Dataset no JSON-LD`).toBeTruthy()
      expect(dataset.name).toBe(calc.dataset!.nome)
      expect(dataset.temporalCoverage).toBe(`${calc.dataset!.vigenciaInicio}/..`)
      expect(dataset.dateModified).toBe(calc.dataAtualizacao)
      expect(dataset.citation).toBe(calc.fonteJuridica)
      expect(dataset.variableMeasured).toEqual(calc.dataset!.variaveis)
      expect(dataset.inLanguage).toBe('pt-BR')
      expect(dataset.isAccessibleForFree).toBe(true)
    })
  }

  test('calculadora que só aplica fórmula não declara Dataset', async ({ page }) => {
    // `porcentagem` não publica tabela nenhuma — declarar Dataset ali seria
    // ruído para o modelo que lê a página.
    await page.goto('/calculadora/porcentagem')
    const blocos = await page.locator('script[type="application/ld+json"]').allTextContents()
    const tipos = blocos.map((b) => JSON.parse(b)['@type'])
    expect(tipos).not.toContain('Dataset')
  })
})
