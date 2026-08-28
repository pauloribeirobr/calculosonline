import { test, expect } from '@playwright/test'

// Trava o F48 (adicional livre, minutos, DSR e a correção do adicional
// noturno) e o F50 (chips nos steppers) na página de hora extra.
//
// Contexto: 240 impressões em 3 meses e posição 84,7 no GSC de 27/08 — e o
// único clique do site na lista de queries veio de "calculo hora extra". A
// SERP mostra que quem rankeia oferece percentual livre, minutos e DSR; esta
// página oferecia um `select` fixo de quatro opções.

test.describe('calculadora de hora extra — parâmetros novos (F48)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora/hora-extra')
  })

  test('minutos entram no cálculo sem exigir conversão para decimal', async ({ page }) => {
    await page.getByLabel('Salário Bruto').fill('300000')
    await page.getByLabel('Horas extras', { exact: true }).fill('1')
    await page.getByLabel('Minutos', { exact: true }).fill('30')
    await page.getByRole('button', { name: 'Calcular Hora Extra' }).click()

    // 3000/220 = 13,6363... → hora extra 20,45 → × 1,5h = 30,67
    await expect(page.getByText('R$ 30,67').first()).toBeVisible()
  })

  test('o percentual da CCT aparece só quando "Outro" é escolhido', async ({ page }) => {
    const percentual = page.getByLabel('Percentual do adicional')
    await expect(percentual).toBeHidden()

    await page.getByLabel('Adicional aplicado').selectOption('outro')
    await expect(percentual).toBeVisible()

    await page.getByLabel('Adicional aplicado').selectOption('60')
    await expect(percentual).toBeHidden()
  })

  test('adicional de 60% da CCT prevalece sobre o mínimo legal de 50%', async ({ page }) => {
    await page.getByLabel('Salário Bruto').fill('300000')
    await page.getByLabel('Horas extras', { exact: true }).fill('1')
    await page.getByLabel('Adicional aplicado').selectOption('60')
    await page.getByRole('button', { name: 'Calcular Hora Extra' }).click()

    // 13,6363... × 1,6 = 21,818 → 21,82
    await expect(page.getByText('R$ 21,82').first()).toBeVisible()
  })

  test('os campos do DSR aparecem só quando o reflexo é pedido', async ({ page }) => {
    const diasUteis = page.getByLabel('Dias úteis no mês')
    await expect(diasUteis).toBeHidden()

    await page.getByLabel('Incluir reflexo no DSR').selectOption('sim')
    await expect(diasUteis).toBeVisible()
    await expect(page.getByLabel('Domingos e feriados no mês')).toBeVisible()
  })

  test('o reflexo no DSR entra no resultado e no detalhamento', async ({ page }) => {
    await page.getByLabel('Salário Bruto').fill('300000')
    await page.getByLabel('Horas extras', { exact: true }).fill('10')
    await page.getByLabel('Incluir reflexo no DSR').selectOption('sim')
    await page.getByRole('button', { name: 'Calcular Hora Extra' }).click()

    // 20,45 × 10 = 204,50; DSR = 204,50 ÷ 25 × 5 = 40,90; total 245,40
    await expect(page.getByText('R$ 245,40').first()).toBeVisible()
    await expect(page.getByText('Reflexo no DSR (Súmula 172 do TST)')).toBeVisible()
    await expect(page.getByText('Total com DSR')).toBeVisible()
  })

  test('a opção de hora noturna reduzida só existe no tipo noturna', async ({ page }) => {
    const reduzida = page.getByLabel('Aplicar hora noturna reduzida (52min30s = 1h)')
    await expect(reduzida).toBeHidden()

    await page.getByLabel('Tipo de hora extra').selectOption('noturna')
    await expect(reduzida).toBeVisible()
  })

  test('hora extra noturna cobra 1,80× — o que o conteúdo da página sempre afirmou', async ({
    page,
  }) => {
    await page.getByLabel('Salário Bruto').fill('300000')
    await page.getByLabel('Horas extras', { exact: true }).fill('1')
    await page.getByLabel('Tipo de hora extra').selectOption('noturna')
    await page.getByRole('button', { name: 'Calcular Hora Extra' }).click()

    // 13,6363... × 1,2 × 1,5 = 24,545 → 24,55 (antes do F48 vinha 20,45)
    await expect(page.getByText('R$ 24,55').first()).toBeVisible()
  })
})

test.describe('chips de valor rápido em campos stepper (F50)', () => {
  test('chip soma ao stepper sem passar do máximo', async ({ page }) => {
    await page.goto('/calculadora/hora-extra')

    const horas = page.getByLabel('Horas extras', { exact: true })
    await expect(horas).toHaveValue('0')

    await page.getByTitle('Adicionar 20 horas').click()
    await expect(horas).toHaveValue('20')
    await page.getByTitle('Adicionar 5 horas').click()
    await expect(horas).toHaveValue('25')
  })

  test('o stepper de prazo em meses do CDB tem chips — 48% dos cliques da página', async ({
    page,
  }) => {
    await page.goto('/calculadora/cdb')

    const prazo = page.getByLabel('Prazo (meses)')
    const inicial = Number(await prazo.inputValue())

    await page.getByTitle('Adicionar 24 meses').click()
    await expect(prazo).toHaveValue(String(inicial + 24))
  })

  test('"Zerar" volta ao mínimo do campo, não a zero', async ({ page }) => {
    await page.goto('/calculadora/cdb')

    const prazo = page.getByLabel('Prazo (meses)')
    await page.getByTitle('Adicionar 24 meses').click()
    await page.getByRole('button', { name: 'Zerar' }).last().click()

    // `prazoMeses` tem `min: 1` — zerar de verdade deixaria o form inválido.
    await expect(prazo).toHaveValue('1')
  })
})
