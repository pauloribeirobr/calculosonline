import { test, expect } from '@playwright/test'
import { encodeShareData } from '../../src/lib/shareLink'

// Trava a F82: referências do Banco Central, faixa do IR por dias de
// calendário, custódia do Tesouro Selic só sobre o excedente e o texto das
// páginas de CDB e Tesouro batendo com a calculadora.
//
// Antes: o CDB simulava com CDI de 10,65% (real: 13,65%), 12 meses caíam na
// faixa de 20% (um ano tem 365 dias e paga 17,5%) e o Tesouro Selic acima de
// R$ 10.000 pagava custódia sobre o valor inteiro.
//
// Os links abaixo estão no formato anterior à F84 (taxa em decimal, `taxaAnual`)
// de propósito: continuarem abrindo é parte do contrato da F84.

const resultado = (page: import('@playwright/test').Page) =>
  page.getByRole('region', { name: 'Resultado do cálculo' })

test.describe('F82 — investimentos', () => {
  test('CDB 100% do CDI, R$ 10.000 por 12 meses: R$ 11.126,12, como diz o texto', async ({
    page,
  }) => {
    await page.goto(
      `/calculadora/cdb?d=${encodeShareData({ valorInicial: 10000, taxaAnual: 1, tipo: 'cdi', prazoMeses: 12 })}`,
    )
    await expect(resultado(page)).toContainText('11.126,12')
    await expect(resultado(page)).toContainText('de 361 a 720 dias')
    await expect(page.locator('article').filter({ hasText: 'Exemplo rápido' })).toContainText(
      'R$ 11.126,12',
    )
  })

  test('Tesouro Selic com R$ 20.000: custódia só sobre os R$ 10.000 excedentes', async ({
    page,
  }) => {
    await page.goto(
      `/calculadora/tesouro-direto?d=${encodeShareData({ valorInicial: 20000, tipo: 'selic', taxaAnual: 0, prazoMeses: 24 })}`,
    )
    await expect(resultado(page)).toContainText('sobre o que passa de R$ 10.000')
    await expect(resultado(page)).toContainText('40,00')
  })

  test('Tesouro Selic, R$ 1.000 por 12 meses: R$ 1.113,44, como diz o texto', async ({ page }) => {
    await page.goto(
      `/calculadora/tesouro-direto?d=${encodeShareData({ valorInicial: 1000, tipo: 'selic', taxaAnual: 0, prazoMeses: 12 })}`,
    )
    await expect(resultado(page)).toContainText('1.113,44')
    await expect(page.locator('article').filter({ hasText: 'Exemplo rápido' })).toContainText(
      'R$ 1.113,44',
    )
  })

  test('nenhuma página de investimento cita banco ou corretora pelo nome', async ({ page }) => {
    // F83: `Banco do Brasil` entrou porque é o distribuidor citado na notícia
    // oficial de lançamento do Tesouro Reserva, e a página linka essa notícia.
    for (const slug of ['cdb', 'tesouro-direto', 'tesouro-reserva', 'poupanca']) {
      await page.goto(`/calculadora/${slug}`)
      const texto = (await page.locator('main').textContent()) ?? ''
      expect(texto, slug).not.toMatch(
        /Banco Master|Banco do Brasil|Bradesco|Itaú|Santander|Nubank|BTG|\bXP\b|\bInter\b|Rico\b|Yubb/,
      )
    }
  })
})
