import { test, expect } from '@playwright/test'

// Trava o F66 — descontos de INSS e IRRF no recibo de férias.
//
// Até 22/09/2026 `calcularFerias` devolvia só o bruto, enquanto o registry, a
// meta description e o `llms.txt` prometiam "descontos de INSS e IRRF" (o F65
// corrigiu os textos; este teste guarda a versão em que a promessa é cumprida).
// A pauta é de canal: `ferias` é a 4ª página do site no Bing (292 impressões,
// posição 8,1) e o 3º tema em citação de IA, e "quanto vou receber de férias"
// — que é pergunta de líquido — já era sinônimo declarado da calculadora.
//
// Três regras próprias do recibo, e são elas que os casos abaixo travam:
//  1. o IRRF das férias é calculado em separado do salário do mês;
//  2. o abono pecuniário fica fora da base dos dois (Lei 8.212/1991, art. 28);
//  3. a dobra do art. 137 também fica, por ser indenização.

async function calcular(
  page: import('@playwright/test').Page,
  campos: { salario: string; abono?: number; dependentes?: number },
) {
  await page.goto('/calculadora/ferias')
  await page.getByLabel('Salário Bruto').fill(campos.salario)

  // `fill` no próprio input do stepper: a página tem três steppers (faltas,
  // abono e dependentes) e o botão "Aumentar" não é único.
  if (campos.abono !== undefined) {
    await page.getByLabel('Dias vendidos (abono)').fill(String(campos.abono))
  }
  if (campos.dependentes !== undefined) {
    await page.getByLabel('Dependentes (IRRF)').fill(String(campos.dependentes))
  }

  await page.getByRole('button', { name: /Calcular Férias/ }).click()
  return {
    resultado: page.getByRole('region', { name: 'Resultado do cálculo' }),
    detalhamento: page.getByRole('list', { name: 'Detalhamento linha a linha' }),
  }
}

test.describe('F66 — o resultado das férias é líquido', () => {
  test('R$ 3.000: headline líquido, com o bruto e o INSS no detalhamento', async ({ page }) => {
    const { resultado, detalhamento } = await calcular(page, { salario: '300000' })

    // 4.000 brutos − 368,60 de INSS, sem IRRF (redutor da Lei 15.270/2025). O
    // INSS aparece faixa a faixa, como na calculadora de salário líquido:
    // 121,58 + 115,36 + 131,66 = 368,60.
    await expect(resultado).toContainText('R$ 3.631,40')
    await expect(resultado).toContainText(/líquido/i)
    await expect(detalhamento).toContainText('R$ 4.000,00')
    await expect(detalhamento).toContainText('R$ 121,58')
    await expect(detalhamento).toContainText('R$ 131,66')
    await expect(detalhamento).toContainText('Total Líquido')
    // O rótulo da faixa é moeda pt-BR, não `toFixed(2)` — saía "Até R$ 1621.00".
    await expect(detalhamento).toContainText('Até R$ 1.621,00')
  })

  test('o aviso explica por que o desconto do mês não bate com o do recibo', async ({ page }) => {
    const { resultado } = await calcular(page, { salario: '300000' })
    await expect(resultado).toContainText('O INSS do mês é calculado sobre tudo')
    await expect(resultado).toContainText('em separado do salário do mês')
  })

  test('vender 10 dias tira o recibo da faixa do IRRF', async ({ page }) => {
    // R$ 4.000, 30 dias: bruto de R$ 5.333,33 e IRRF de R$ 122,45, porque o
    // terço tira o valor da faixa em que o redutor zera o imposto.
    const trinta = await calcular(page, { salario: '400000' })
    await expect(trinta.detalhamento).toContainText('R$ 122,45')
    await expect(trinta.resultado).toContainText('R$ 4.662,70')

    // Mesmo bruto, com 10 dias vendidos: o abono sai da base e o IRRF zera.
    const vendido = await calcular(page, { salario: '400000', abono: 10 })
    await expect(vendido.resultado).toContainText('R$ 5.018,07')
    await expect(vendido.detalhamento).not.toContainText('R$ 122,45')
    await expect(vendido.resultado).toContainText('abono pecuniário')
  })

  test('dependentes reduzem o IRRF das férias', async ({ page }) => {
    const sem = await calcular(page, { salario: '900000' })
    const semTexto = await sem.resultado.textContent()

    const com = await calcular(page, { salario: '900000', dependentes: 2 })
    const comTexto = await com.resultado.textContent()

    expect(semTexto).not.toBe(comTexto)
    await expect(com.detalhamento).toContainText('IRRF')
  })
})

test.describe('F66 — conteúdo e promessa da página', () => {
  test('a tabela de referência publica o líquido ao lado do bruto', async ({ page }) => {
    await page.goto('/calculadora/ferias')
    const artigo = page.locator('article')

    // Mesma linha de R$ 2.000 que o F47/F57 já travavam no bruto.
    await expect(artigo.getByText('R$ 2.666,67', { exact: false }).first()).toBeVisible()
    await expect(artigo.getByText('R$ 2.450,98', { exact: false }).first()).toBeVisible()
    await expect(artigo.getByText('R$ 3.631,40', { exact: false }).first()).toBeVisible()
  })

  test('a description volta a prometer os descontos — agora a calculadora cumpre', async ({
    page,
  }) => {
    await page.goto('/calculadora/ferias')
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description?.toLowerCase()).toContain('inss')
    expect(description?.toLowerCase()).toContain('irrf')
  })

  test('o hub continua mostrando as férias em bruto, e diz isso', async ({ page }) => {
    // O bloco do hub é projeção de um período futuro, não um recibo a pagar —
    // descontar ali seria enganoso, e mudaria os números já publicados do post
    // agregado do F60. A legenda declara o que o número é.
    await page.goto('/calculadora-trabalhista-completa')
    await page.getByLabel('Salário Bruto').fill('300000')
    await page.getByLabel('Data de Admissão').fill('01/09/2021')
    await page.getByLabel('Data de Saída').fill('30/09/2026')
    await page.getByLabel('Motivo da Saída').selectOption('sem_justa_causa')
    await page.getByLabel('Saldo do FGTS').fill('1440000')
    await page.getByRole('button', { name: /Calcular tudo/ }).click()

    const blocoFerias = page
      .locator('li')
      .filter({ has: page.getByRole('heading', { name: 'Férias', exact: true }) })
    await expect(blocoFerias).toContainText('valor bruto')
    await expect(blocoFerias).toContainText('R$ 4.000,00')
  })
})
