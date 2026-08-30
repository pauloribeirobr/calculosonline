import { test, expect } from '@playwright/test'

// Regressões de render no celular (F56).
//
// Contexto: o GSC de 27/08 mostrou 765 impressões no celular em posição 54,6
// (16 posições melhor que o desktop) e ZERO cliques. A auditoria não achou
// problema de performance — Lighthouse mobile 94 — e sim de render: 9 das 20
// páginas de calculadora rolavam na horizontal, porque TODA classe Tailwind
// de `mdx-components.tsx` era classe morta (o arquivo mora na raiz de
// `apps/web` e estava fora dos globs de `content` do `tailwind.config.ts`),
// incluindo o `overflow-x-auto` do wrapper de tabela.
//
// Estes testes travam as duas invariantes que o fix restabeleceu. São baratos
// e cobrem as 20 calculadoras porque a causa era global, não por página.

const CALCULADORAS = [
  'rescisao-trabalhista', 'ferias', 'decimo-terceiro', 'hora-extra', 'fgts',
  'salario-liquido', 'inss', 'irrf', 'irpf', 'das-mei', 'juros-compostos',
  'porcentagem', 'emprestimo', 'financiamento', 'cdb', 'poupanca',
  'tesouro-direto', 'imc', 'calorias', 'margem-lucro',
]

test.describe('render no celular — sem rolagem horizontal', () => {
  for (const slug of CALCULADORAS) {
    test(`/calculadora/${slug} cabe na viewport`, async ({ page }) => {
      await page.goto(`/calculadora/${slug}`)

      const { scrollW, clientW } = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
      }))

      // 1px de folga para arredondamento de subpixel.
      expect(
        scrollW,
        `a página rola ${scrollW - clientW}px na horizontal — algo escapou de um contêiner rolável`,
      ).toBeLessThanOrEqual(clientW + 1)
    })
  }

  test('tabela larga do MDX rola dentro do próprio contêiner, não na página', async ({
    page,
  }) => {
    // A tabela de projeção do FGTS (F47) é a pior do site: ~491px de conteúdo
    // numa viewport de 412. Nem toda tabela precisa rolar — as estreitas cabem
    // e devem continuar cabendo —, então o teste mira a larga pelo cabeçalho.
    await page.goto('/calculadora/fgts')

    const wrapper = page
      .getByRole('region', { name: /Tabela de referência/ })
      .filter({ has: page.getByRole('columnheader', { name: 'Salário bruto' }) })
    await expect(wrapper).toHaveCount(1)

    const rola = await wrapper.evaluate((el) => ({
      overflowX: getComputedStyle(el).overflowX,
      conteudo: el.scrollWidth,
      caixa: el.clientWidth,
      alcancavelPorTeclado: (el as HTMLElement).tabIndex === 0,
    }))

    // O conteúdo é mais largo que a caixa — e é justamente por isso que a
    // caixa precisa rolar sozinha, senão empurra a página inteira.
    expect(rola.conteudo).toBeGreaterThan(rola.caixa)
    expect(rola.overflowX).toBe('auto')
    expect(rola.alcancavelPorTeclado).toBe(true)
  })
})

test.describe('campos de formulário não disparam zoom no iOS', () => {
  // O Safari no iOS dá zoom automático ao focar um campo com font-size < 16px,
  // e sair do zoom depois é manual. iOS é 27 dos 50 usuários mobile do GA4.
  const COM_CAMPO_VARIADO = ['salario-liquido', 'rescisao-trabalhista', 'hora-extra', 'cdb']

  for (const slug of COM_CAMPO_VARIADO) {
    test(`/calculadora/${slug} usa ≥16px nos campos`, async ({ page }) => {
      await page.goto(`/calculadora/${slug}`)

      const pequenos = await page.evaluate(() =>
        [...document.querySelectorAll('input, select, textarea')]
          .map((el) => ({
            nome: (el as HTMLInputElement).name || el.id || (el as HTMLElement).tagName,
            fontSize: parseFloat(getComputedStyle(el).fontSize),
          }))
          .filter((c) => c.fontSize < 16),
      )

      expect(pequenos, `campos abaixo de 16px: ${JSON.stringify(pequenos)}`).toEqual([])
    })
  }
})
