import { test, expect } from '@playwright/test'
import { encodeShareData } from '../../src/lib/shareLink'

// Trava a F83: simulador do Tesouro Reserva. Os exemplos do texto saem do
// motor e precisam bater com a calculadora (disciplina do F47/F82); o IOF só
// aparece no resgate antes de 30 dias; a custódia só sobre o que passa de
// R$ 10.000; e a página é o mesmo número do Tesouro Selic, que rende igual.

const resultado = (page: import('@playwright/test').Page) =>
  page.getByRole('region', { name: 'Resultado do cálculo' })

const link = (d: Record<string, unknown>) => `/calculadora/tesouro-reserva?d=${encodeShareData(d)}`

test.describe('F83 — Tesouro Reserva', () => {
  test('R$ 1.000 por 12 meses: R$ 1.113,44, como diz o exemplo rápido', async ({ page }) => {
    await page.goto(link({ valorInicial: 1000, prazo: 12, unidade: 'meses' }))
    await expect(resultado(page)).toContainText('1.113,44')
    await expect(resultado(page)).toContainText('de 361 a 720 dias')
    await expect(resultado(page)).toContainText('isenta até R$ 10.000')
    // Comparação no mesmo prazo
    await expect(resultado(page)).toContainText('1.061,68')
    await expect(resultado(page)).toContainText('1.112,61')
    await expect(page.locator('article').filter({ hasText: 'Exemplo rápido' })).toContainText(
      'R$ 1.113,44',
    )
  })

  test('resgate com 15 dias: IOF de 50% do rendimento e poupança sem rendimento', async ({
    page,
  }) => {
    await page.goto(link({ valorInicial: 1000, prazo: 15, unidade: 'dias' }))
    await expect(resultado(page)).toContainText('IOF (50% do rendimento')
    await expect(resultado(page)).toContainText('2,66')
    await expect(resultado(page)).toContainText('1.002,05')
    await expect(resultado(page)).toContainText('não rende antes de completar 1 mês')
  })

  test('resgate com 30 dias: sem IOF', async ({ page }) => {
    await page.goto(link({ valorInicial: 1000, prazo: 30, unidade: 'dias' }))
    await expect(resultado(page)).toContainText('1.008,25')
    // "IOF (" e não "IOF": a base legal do resultado cita "Decreto 6.306/2007 (IOF)".
    await expect(resultado(page)).not.toContainText('IOF (')
  })

  test('R$ 20.000 por 12 meses: custódia de R$ 20,00 sobre o excedente', async ({ page }) => {
    await page.goto(link({ valorInicial: 20000, prazo: 12, unidade: 'meses' }))
    await expect(resultado(page)).toContainText('sobre o que passa de R$ 10.000')
    await expect(resultado(page)).toContainText('22.248,75')
  })

  test('formulário: escolher dias e simular pelo botão', async ({ page }) => {
    await page.goto('/calculadora/tesouro-reserva')
    await page.getByLabel('Valor aplicado').fill('100000') // R$ 1.000,00 (o campo lê centavos)
    await page.getByLabel('Prazo até o resgate').fill('7')
    await page.getByLabel('Dias', { exact: true }).check()
    await page.getByRole('button', { name: 'Simular Tesouro Reserva' }).click()
    await expect(resultado(page)).toContainText('1.000,46')
    await expect(resultado(page)).toContainText('IOF (76% do rendimento')
  })

  test('a página linka as fontes oficiais', async ({ page }) => {
    await page.goto('/calculadora/tesouro-reserva')
    const artigo = page.locator('article')
    for (const href of [
      'gov.br/tesouronacional',
      'edu.b3.com.br/w/tesouro-reserva',
      'planalto.gov.br/ccivil_03/_ato2007-2010/2007/decreto/d6306.htm',
      'b3.com.br/pt_br/produtos-e-servicos/tarifas',
    ]) {
      await expect(artigo.locator(`a[href*="${href}"]`).first(), href).toBeAttached()
    }
  })
})
