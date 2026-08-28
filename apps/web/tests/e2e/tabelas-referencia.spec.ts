import { test, expect } from '@playwright/test'

// Trava o F47 (tabelas de referência numéricas) e o F49 (exemplos nomeados).
//
// Motivo: quem rankeia nos clusters do site publica uma tabela "quanto vale X
// para o salário Y" e casos resolvidos com números fechados. A calculadora só
// responde depois que a pessoa preenche o formulário — e o Google não preenche
// formulário, nem o modelo que cita a página.
//
// Os números das tabelas foram gerados a partir do próprio core, então uma
// mudança de regra que os invalide precisa quebrar aqui.

const paginas = [
  { slug: 'hora-extra', tabela: 'Quanto vale sua hora extra em 2026', valor: 'R$ 20,45' },
  // R$ 2.666,67 é a linha de R$ 2.000 — a mesma que o arredondamento antigo
  // (corrigido no F57) devolvia como R$ 2.666,80. Serve de trava dupla.
  { slug: 'ferias', tabela: 'Quanto você recebe de férias', valor: 'R$ 2.666,67' },
  { slug: 'fgts', tabela: 'Quanto entra no seu FGTS por mês', valor: 'R$ 14.400,00' },
  { slug: 'poupanca', tabela: 'Quanto rende a poupança', valor: 'R$ 1.061,68' },
  { slug: 'financiamento', tabela: 'Parcela por valor financiado', valor: 'R$ 1.965,34' },
]

test.describe('tabelas de referência e exemplos (F47/F49)', () => {
  for (const { slug, tabela, valor } of paginas) {
    test(`${slug} publica a tabela de referência com os valores do motor`, async ({ page }) => {
      await page.goto(`/calculadora/${slug}`)

      const artigo = page.locator('article')
      await expect(artigo.getByRole('heading', { name: new RegExp(tabela, 'i') })).toBeVisible()
      await expect(artigo.getByText(valor, { exact: false }).first()).toBeVisible()
    })

    test(`${slug} tem exemplos resolvidos com números fechados`, async ({ page }) => {
      await page.goto(`/calculadora/${slug}`)
      await expect(
        page.locator('article').getByRole('heading', { name: 'Exemplos resolvidos' }),
      ).toBeVisible()
    })
  }

  test('a tabela de conversão de minutos acompanha o campo de minutos do F48', async ({ page }) => {
    await page.goto('/calculadora/hora-extra')

    await expect(
      page.locator('article').getByRole('heading', { name: /Tabela de conversão de minutos/i }),
    ).toBeVisible()
    await expect(page.getByLabel('Minutos', { exact: true })).toBeVisible()
  })
})
