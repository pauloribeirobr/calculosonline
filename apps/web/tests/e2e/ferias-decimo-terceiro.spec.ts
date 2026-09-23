import { test, expect } from '@playwright/test'
import { findCalculator } from '../../src/lib/calculators'

// Trava o F69 — a calculadora de férias + 13º, a intenção combinada.
//
// Pauta saída do Semrush de 21/09 (Diário 22/09, parte 9): o concorrente que
// tem essa página ocupa **posição 1-3** numa família de ~18 keywords de KD
// 11-24 — `calcular decimo terceiro e ferias` (390/mês, KD 15),
// `calculo de 13 e ferias` (110, KD 13), `calculadora de 13 e ferias` (90,
// KD 11) —, a menor dificuldade medida em qualquer análise deste projeto.
// Nenhuma calculadora de item único atende "vou tirar férias e receber o 13º,
// quanto dá no total".
//
// Três coisas aqui, e a terceira é a que dura:
//  1. a rota existe, entra no sitemap e tem vizinhança de links (F43);
//  2. o vocabulário medido está no registry e na copy (disciplina do F67);
//  3. os números batem com as duas calculadoras de origem, e a página avisa o
//     que **não** está somando — espelho do aviso do F58.

const SLUG = 'ferias-e-decimo-terceiro'

async function calcular(
  page: import('@playwright/test').Page,
  campos: { salario: string; abono?: number; mes?: string; adiantar?: boolean },
) {
  await page.goto(`/calculadora/${SLUG}`)
  await page.getByLabel('Salário Bruto').fill(campos.salario)
  if (campos.mes) await page.getByLabel('Mês de admissão').selectOption(campos.mes)
  if (campos.abono !== undefined) {
    await page.getByLabel('Dias de férias vendidos (abono)').fill(String(campos.abono))
  }
  if (campos.adiantar) {
    await page
      .getByLabel('Receber a 1ª parcela do 13º junto das férias?')
      .selectOption('sim')
  }
  await page.getByRole('button', { name: /Calcular Férias \+ 13º/ }).click()
  return {
    resultado: page.getByRole('region', { name: 'Resultado do cálculo' }),
    detalhamento: page.getByRole('list', { name: 'Detalhamento linha a linha' }),
  }
}

test.describe('F69 — rota, SEO e links', () => {
  test('a rota responde 200 com H1 e entra no sitemap', async ({ page }) => {
    const resposta = await page.goto(`/calculadora/${SLUG}`)
    expect(resposta?.status()).toBe(200)
    await expect(page.locator('h1')).toContainText('Férias e 13º')

    const xml = await (await page.request.get('/sitemap.xml')).text()
    expect(xml).toContain(`<loc>https://calculosonline.com.br/calculadora/${SLUG}</loc>`)
  })

  test('o title cabe no orçamento da SERP e carrega os dois termos', async ({ page }) => {
    await page.goto(`/calculadora/${SLUG}`)
    const title = await page.title()
    expect(title.length, title).toBeLessThanOrEqual(78)
    expect(title).toContain('Férias')
    expect(title).toMatch(/13º|Décimo/)
  })

  test('o registry declara o vocabulário medido', async () => {
    const calc = findCalculator(SLUG)
    const vocab = (calc?.sinonimos ?? []).join(' | ').toLowerCase()
    for (const termo of [
      'calcular décimo terceiro e férias',
      'cálculo de 13 e férias',
      'calculadora de 13 e férias',
    ]) {
      expect(vocab, termo).toContain(termo)
    }
  })

  test('férias e 13º linkam para a página combinada, e ela para as duas', async ({ page }) => {
    // Sem isto a página nasce órfã — é a disciplina do F43.
    for (const origem of ['ferias', 'decimo-terceiro']) {
      await page.goto(`/calculadora/${origem}`)
      await expect(
        page.locator('article').locator(`a[href="/calculadora/${SLUG}"]`).first(),
        origem,
      ).toBeVisible()
    }

    await page.goto(`/calculadora/${SLUG}`)
    const artigo = page.locator('article')
    await expect(artigo.locator('a[href="/calculadora/ferias"]').first()).toBeVisible()
    await expect(
      artigo.locator('a[href="/blog/salario-depois-das-ferias-por-que-vem-menor"]').first(),
    ).toBeVisible()
  })
})

test.describe('F69 — os números vêm do motor', () => {
  test('R$ 3.000, ano inteiro: as três linhas e o total', async ({ page }) => {
    const { resultado, detalhamento } = await calcular(page, { salario: '300000' })

    await expect(resultado).toContainText('R$ 6.382,80')
    await expect(resultado).toContainText(/férias \+ 13º/i)
    await expect(detalhamento).toContainText('R$ 3.631,40') // recibo de férias líquido
    await expect(detalhamento).toContainText('R$ 1.500,00') // 1ª parcela
    await expect(detalhamento).toContainText('R$ 1.251,40') // 2ª parcela
  })

  test('a página avisa o que NÃO está somando', async ({ page }) => {
    // Espelho do aviso do F58: lá o erro é somar o que já está contido, aqui é
    // achar que o salário do mês entra no total.
    const { resultado } = await calcular(page, { salario: '300000' })
    await expect(resultado).toContainText('NÃO inclui o salário do mês')
  })

  test('adiantar a 1ª parcela muda o que cai com as férias, não o total', async ({ page }) => {
    const { resultado } = await calcular(page, { salario: '300000', adiantar: true })
    await expect(resultado).toContainText('R$ 6.382,80')
    await expect(resultado).toContainText('janeiro')
  })

  test('vender 10 dias aumenta o total', async ({ page }) => {
    const { resultado } = await calcular(page, { salario: '300000', abono: 10 })
    await expect(resultado).toContainText('R$ 6.535,71')
  })

  test('admissão em maio dá 8/12 de 13º', async ({ page }) => {
    const { resultado, detalhamento } = await calcular(page, { salario: '300000', mes: '5' })
    await expect(detalhamento).toContainText('8/12')
    await expect(resultado).toContainText('R$ 5.475,71')
  })

  test('a tabela do conteúdo bate com a calculadora', async ({ page }) => {
    // Mesma trava do F47: o texto e o formulário saem do mesmo motor.
    await page.goto(`/calculadora/${SLUG}`)
    const artigo = page.locator('article')
    for (const valor of ['R$ 6.382,80', 'R$ 3.631,40', 'R$ 13.171,25', 'R$ 6.535,71']) {
      await expect(artigo.getByText(valor, { exact: false }).first(), valor).toBeVisible()
    }
  })
})
