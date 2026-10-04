import { test, expect } from '@playwright/test'
import { findCalculator } from '../../src/lib/calculators'

// Trava a F76 — o molde da F67 aplicado a férias e salário líquido, mais o
// campo de férias fracionadas.
//
// Por que agora: no BWT de 04/10 (08→30/09), a F67 foi a primeira feature de
// vocabulário com efeito medido — hora extra virou 37% das citações de IA do
// Bing em 8 dias. Férias ficou parada no mesmo período, com o menor share do
// site nas formas curtas (`calcular ferias` 3,98%, `cálculo de férias` 3,75%),
// e `calculadora de salário líquido` tem 63 citações com share de 8,70%.
//
// O campo de fracionamento responde a maior pergunta em linguagem natural do
// relatório de consultas do Bing ("vou tirar 10 dias de férias somente, quanto
// receberia…", 28 impressões @ 6,75, zero clique). Regras do CLT art. 134,
// §1º, conferido no Planalto em 04/10/2026.

async function calcularFerias(
  page: import('@playwright/test').Page,
  campos: { salario: string; diasAgora?: number; abono?: number },
) {
  await page.goto('/calculadora/ferias')
  await page.getByLabel('Salário Bruto').fill(campos.salario)
  if (campos.diasAgora !== undefined) {
    await page.getByLabel('Vai tirar todos os dias de uma vez?').selectOption('sim')
    await page.getByLabel('Dias de férias que vai tirar agora').fill(String(campos.diasAgora))
  }
  if (campos.abono !== undefined) {
    await page.getByLabel('Dias vendidos (abono)').fill(String(campos.abono))
  }
  await page.getByRole('button', { name: /Calcular Férias/ }).click()
  return page.getByRole('region', { name: 'Resultado do cálculo' })
}

test.describe('F76 — férias: vocabulário', () => {
  test('o title e o H1 carregam "Online"', async ({ page }) => {
    await page.goto('/calculadora/ferias')
    const title = await page.title()
    expect(title).toContain('Calculadora de Férias Online')
    expect(title.length, title).toBeLessThanOrEqual(78)
    await expect(page.locator('h1')).toContainText('Online')
  })

  test('o corpo responde às perguntas da cauda', async ({ page }) => {
    await page.goto('/calculadora/ferias')
    const artigo = page.locator('article')
    for (const termo of [
      'calculadora de férias online',
      'Como calcular férias online?',
      'Qual é o cálculo de férias?',
      'Quanto recebo tirando só 10 dias de férias?',
    ]) {
      await expect(artigo.getByText(termo, { exact: false }).first(), termo).toBeVisible()
    }
  })

  test('o registry declara o vocabulário medido', async () => {
    const vocab = (findCalculator('ferias')?.sinonimos ?? []).join(' | ').toLowerCase()
    for (const termo of ['calcular férias online', 'cálculo de férias', 'férias de 10 dias']) {
      expect(vocab, termo).toContain(termo)
    }
  })
})

test.describe('F76 — férias fracionadas', () => {
  test('o stepper só aparece para quem vai dividir as férias', async ({ page }) => {
    await page.goto('/calculadora/ferias')
    await expect(page.getByLabel('Dias de férias que vai tirar agora')).toHaveCount(0)
    await page.getByLabel('Vai tirar todos os dias de uma vez?').selectOption('sim')
    await expect(page.getByLabel('Dias de férias que vai tirar agora')).toBeVisible()
  })

  test('10 dias de R$ 3.000: R$ 1.233,33, o mesmo do conteúdo e do post da F65', async ({
    page,
  }) => {
    const resultado = await calcularFerias(page, { salario: '300000', diasAgora: 10 })
    await expect(resultado).toContainText('R$ 1.233,33')
    await expect(resultado).toContainText('ficam 20 dias para os próximos períodos')
    await expect(resultado).toContainText('Um dos próximos períodos precisa ter pelo menos 14 dias')

    await page.goto('/calculadora/ferias')
    await expect(page.locator('article').getByText('R$ 1.233,33').first()).toBeVisible()
  })

  test('sem dividir, o resultado não muda (R$ 3.631,40)', async ({ page }) => {
    const resultado = await calcularFerias(page, { salario: '300000' })
    await expect(resultado).toContainText('R$ 3.631,40')
    await expect(resultado).not.toContainText('fracionadas')
  })

  test('pedir mais que o saldo, com dias vendidos, explica a conta', async ({ page }) => {
    await calcularFerias(page, { salario: '300000', diasAgora: 25, abono: 10 })
    await expect(
      page.getByText('Você tem 20 dias para tirar (30 de direito menos 10 vendidos)'),
    ).toBeVisible()
  })

  test('o hint do abono diz que não são os dias a tirar', async ({ page }) => {
    await page.goto('/calculadora/ferias')
    await expect(page.getByText('Dias vendidos, não os que você vai tirar.')).toBeVisible()
  })
})

test.describe('F76 — salário líquido', () => {
  test('o title carrega "Online" e cabe na SERP', async ({ page }) => {
    await page.goto('/calculadora/salario-liquido')
    const title = await page.title()
    expect(title).toContain('Calculadora de Salário Líquido Online')
    expect(title.length, title).toBeLessThanOrEqual(78)
  })

  test('a meta description deixou de ser curta', async ({ page }) => {
    await page.goto('/calculadora/salario-liquido')
    const descricao = await page.locator('meta[name="description"]').getAttribute('content')
    expect(descricao?.length ?? 0).toBeGreaterThanOrEqual(120)
    expect(descricao).toContain('online')
  })

  test('o corpo responde às perguntas da cauda, com os números do motor', async ({ page }) => {
    await page.goto('/calculadora/salario-liquido')
    const artigo = page.locator('article')
    for (const termo of [
      'calculadora de salário líquido online',
      'Como usar a calculadora de salário líquido online?',
      'Quanto fica o salário líquido de R$ 3.000 em 2026?',
      'R$ 2.751,40',
    ]) {
      await expect(artigo.getByText(termo, { exact: false }).first(), termo).toBeVisible()
    }
  })

  test('R$ 3.000 na calculadora dá o mesmo R$ 2.751,40 do texto', async ({ page }) => {
    await page.goto('/calculadora/salario-liquido')
    await page.getByLabel('Salário Bruto').fill('300000')
    await page
      .getByRole('button', { name: /Calcular/ })
      .first()
      .click()
    await expect(page.getByRole('region', { name: 'Resultado do cálculo' })).toContainText(
      'R$ 2.751,40',
    )
  })

  test('o registry declara o vocabulário medido', async () => {
    const vocab = (findCalculator('salario-liquido')?.sinonimos ?? []).join(' | ').toLowerCase()
    for (const termo of [
      'calculadora de salário líquido',
      'calculadora online de salário líquido',
    ]) {
      expect(vocab, termo).toContain(termo)
    }
  })
})
