import { test, expect } from '@playwright/test'
import { encodeShareData } from '../../src/lib/shareLink'

// Trava a F81: a calculadora de IRPF simula a declaração 2027 (ano-base 2026).
//
// Antes, o conteúdo publicava uma tabela anual que não batia com nenhuma tabela
// oficial (isenção em R$ 33.888, última faixa a partir de R$ 73.839,60), e o
// motor aplicava a mensal × 12 sem o desconto simplificado novo nem a redução
// anual da Lei 15.270/2025. Valores conferidos na tabela da Receita para o
// exercício 2027 e no art. 11-A da Lei 9.250/1995.

const link = (rendimentosTributaveis: number) =>
  `/calculadora/irpf?d=${encodeShareData({
    rendimentosTributaveis,
    irrfRetidoFonte: 0,
    numeroDependentes: 0,
    despesasMedicas: 0,
    despesasEducacao: 0,
    contribuicaoINSS: 0,
    pensaoAlimenticia: 0,
    contribuicaoPrevidenciaPrivada: 0,
  })}`

test.describe('F81 — IRPF declaração 2027', () => {
  test('o conteúdo traz a tabela oficial e o desconto simplificado novo', async ({ page }) => {
    await page.goto('/calculadora/irpf')
    const artigo = page.locator('article').filter({ hasText: 'simule a declaração 2027' })
    await expect(artigo).toContainText('R$ 29.145,60')
    await expect(artigo).toContainText('R$ 10.904,66')
    await expect(artigo).toContainText('R$ 17.640,00')
    await expect(artigo).not.toContainText('R$ 33.888,00')
    await expect(artigo).not.toContainText('R$ 73.839,60')
  })

  test('R$ 80.000 no simplificado: R$ 783,73 de redução e R$ 5.911,61 de imposto', async ({
    page,
  }) => {
    await page.goto(link(80000))
    const resultado = page.getByRole('region', { name: 'Resultado do cálculo' })
    await expect(resultado).toContainText('Redução da Lei 15.270/2025')
    await expect(resultado).toContainText('783,73')
    await expect(resultado).toContainText('5.911,61')
  })

  test('R$ 60.000: a redução zera o imposto', async ({ page }) => {
    await page.goto(link(60000))
    const resultado = page.getByRole('region', { name: 'Resultado do cálculo' })
    await expect(resultado).toContainText('2.694,15')
  })
})
