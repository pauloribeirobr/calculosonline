import { test, expect } from '@playwright/test'

// Trava o F51 (campo de data mascarado + atalhos).
//
// Contexto: o heatmap do Clarity de 20/08 registrou 11 dos 24 cliques da
// página de rescisão nos dois campos de data — o maior atrito medido do site.
// `input[type=date]` nativo é ruim no Edge/Windows, que é 61% do público.
//
// O valor guardado continua sendo ISO (`YYYY-MM-DD`), o mesmo que o
// `type=date` produzia, para não mexer no core nem no link compartilhado (F32).

test.describe('campos de data da rescisão (F51)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora/rescisao-trabalhista')
  })

  test('não usa mais o seletor nativo de data', async ({ page }) => {
    const admissao = page.getByLabel('Data de Admissão')
    await expect(admissao).toHaveAttribute('type', 'text')
    await expect(admissao).toHaveAttribute('inputmode', 'numeric')
    await expect(admissao).toHaveAttribute('placeholder', 'DD/MM/AAAA')
  })

  test('digitar só os números já formata DD/MM/AAAA', async ({ page }) => {
    const admissao = page.getByLabel('Data de Admissão')
    await admissao.fill('01011990')
    await expect(admissao).toHaveValue('01/01/1990')
  })

  test('formata progressivamente enquanto se digita', async ({ page }) => {
    const admissao = page.getByLabel('Data de Admissão')
    await admissao.pressSequentially('1503')
    await expect(admissao).toHaveValue('15/03')
    await admissao.pressSequentially('2020')
    await expect(admissao).toHaveValue('15/03/2020')
  })

  test('data inexistente no calendário não passa na validação', async ({ page }) => {
    await page.getByLabel('Salário Bruto').fill('300000')
    await page.getByLabel('Data de Admissão').fill('31021990')
    await page.getByLabel('Data de Rescisão').fill('01012026')
    await page.getByRole('button', { name: 'Calcular Rescisão' }).click()

    // 31/02 não existe — o campo não vira ISO e o Zod reprova em vez de o
    // JS "consertar" para 03/03 silenciosamente.
    await expect(page.getByText('Data inválida').first()).toBeVisible()
  })

  test('atalho "Hoje" preenche a data de rescisão', async ({ page }) => {
    const hoje = new Date()
    const esperado = [
      String(hoje.getDate()).padStart(2, '0'),
      String(hoje.getMonth() + 1).padStart(2, '0'),
      hoje.getFullYear(),
    ].join('/')

    await page.getByRole('button', { name: 'Hoje' }).click()
    await expect(page.getByLabel('Data de Rescisão')).toHaveValue(esperado)
  })

  test('atalho "Há 5 anos" preenche a admissão com o ano certo', async ({ page }) => {
    await page.getByRole('button', { name: 'Há 5 anos' }).click()
    const valor = await page.getByLabel('Data de Admissão').inputValue()
    expect(valor).toContain(String(new Date().getFullYear() - 5))
  })

  test('fluxo completo com os atalhos chega ao resultado', async ({ page }) => {
    await page.getByLabel('Salário Bruto').fill('300000')
    await page.getByRole('button', { name: 'Há 2 anos' }).click()
    await page.getByRole('button', { name: 'Hoje' }).click()
    await page.getByLabel('Motivo da Rescisão').selectOption('sem_justa_causa')
    await page.getByRole('button', { name: 'Calcular Rescisão' }).click()

    await expect(page.getByText('Detalhamento do cálculo')).toBeVisible()
  })
})
