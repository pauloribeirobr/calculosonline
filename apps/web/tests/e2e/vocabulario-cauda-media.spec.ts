import { test, expect } from '@playwright/test'
import { findCalculator } from '../../src/lib/calculators'

// Trava o F67 — vocabulário da cauda média em `hora-extra` e `decimo-terceiro`.
//
// Mesmo molde do F38/F39/F53 (registry + title + copy), com a diferença de que
// desta vez o alvo saiu de três medições que concordam:
//
//  1. Semrush 21/09 (nosso): `calculo hora extra online` pos. 54 (390/mês, KD
//     18), `calcular hora extra online` 58 (720/mês, KD 25), `calculo décimo`
//     57 (480/mês, KD 20), `calcular meu decimo` 52 (110/mês, KD 24) — contra
//     85-95 da cabeça do cluster.
//  2. Semrush do `calculadora.com.br` (AS 14): **pos. 5** em `calcular hora
//     extra online` e 10 em `calculador hora extra`. É a única página
//     trabalhista que rankeia para ele — prova de que a faixa é ganhável sem
//     autoridade de portal.
//  3. GSC: `calculadora de horas extras`, `calculadora hora extra noturna` e
//     `calculo exato horas extras` aparecem com impressão e posição 77-95.
//
// A lição do F38 é a invariante aqui: `keywords` no <head> não ranqueia nada
// desde 2009. O vocabulário precisa estar no title, no H1 e no corpo.

test.describe('F67 — hora extra', () => {
  test('o title e o H1 carregam "Online"', async ({ page }) => {
    await page.goto('/calculadora/hora-extra')
    const title = await page.title()

    expect(title).toContain('Online')
    expect(title.length, title).toBeLessThanOrEqual(78)
    await expect(page.locator('h1')).toContainText('Online')
  })

  test('o corpo responde às três perguntas da cauda', async ({ page }) => {
    await page.goto('/calculadora/hora-extra')
    const artigo = page.locator('article')

    await expect(
      artigo.getByRole('heading', { name: /Calculadora de Hora Extra Online/i }),
    ).toBeVisible()
    for (const termo of [
      'Como calcular hora extra online?',
      'Qual é o cálculo exato de horas extras?',
      'Como calcular hora extra noturna?',
    ]) {
      await expect(artigo.getByText(termo, { exact: false }).first(), termo).toBeVisible()
    }
  })

  test('o registry declara o vocabulário medido', async () => {
    const calc = findCalculator('hora-extra')
    const vocab = (calc?.sinonimos ?? []).join(' | ').toLowerCase()
    for (const termo of [
      'calcular hora extra online',
      'calculador de hora extra',
      'calculadora de horas extras',
      'hora extra noturna',
    ]) {
      expect(vocab, termo).toContain(termo)
    }
  })
})

test.describe('F67 — décimo terceiro', () => {
  test('o corpo responde à forma curta ("meu décimo")', async ({ page }) => {
    // `calcular meu decimo` (pos. 52) e `calculo décimo` (57) são as duas
    // keywords do cluster do 13º mais perto da página 1 — e as duas omitem o
    // "terceiro", que é como toda a copy do site escrevia.
    await page.goto('/calculadora/decimo-terceiro')
    const artigo = page.locator('article')

    await expect(artigo.getByText('Como calcular meu décimo?').first()).toBeVisible()
    await expect(artigo.getByText('cálculo do décimo', { exact: false }).first()).toBeVisible()
  })

  test('o registry declara o vocabulário curto', async () => {
    const calc = findCalculator('decimo-terceiro')
    const vocab = (calc?.sinonimos ?? []).join(' | ').toLowerCase()
    for (const termo of ['calcular meu décimo', 'cálculo décimo']) {
      expect(vocab, termo).toContain(termo)
    }
  })
})
