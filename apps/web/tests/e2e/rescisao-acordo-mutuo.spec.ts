import { test, expect } from '@playwright/test'

// F40: o art. 484-A, I da CLT manda pagar "metade do aviso prévio" sem dizer
// metade de quê — metade do mínimo de 30 dias (15 fixos) ou metade do aviso
// proporcional da Lei 12.506/2011. A calculadora resolve pela primeira e
// mostra a segunda como linha neutra, sem somá-la ao total.

test.describe('rescisão por acordo mútuo — as duas leituras do aviso prévio', () => {
  async function calcular(page: import('@playwright/test').Page, dataAdmissao: string) {
    await page.goto('/calculadora/rescisao-trabalhista')
    await page.getByLabel('Salário Bruto').fill('300000') // R$ 3.000,00
    await page.getByLabel('Data de Admissão').fill(dataAdmissao)
    await page.getByLabel('Data de Rescisão').fill('2026-03-15')
    await page.getByLabel('Motivo da Rescisão').selectOption('acordo_mutuo')
    await page.getByLabel('Saldo do FGTS').fill('900000') // R$ 9.000,00
    await page.getByRole('button', { name: /Calcular/ }).click()
    return page.getByRole('list', { name: 'Detalhamento linha a linha' })
  }

  test('com 3 anos de casa mostra as duas leituras e a diferença entre elas', async ({ page }) => {
    const detalhamento = await calcular(page, '2023-01-01')

    // Leitura praticada — é a que compõe o total.
    await expect(detalhamento).toContainText('Aviso Prévio Indenizado (15 dias)')
    await expect(detalhamento).toContainText('R$ 1.500,00')

    // Segunda leitura, informativa: metade dos 39 dias proporcionais.
    await expect(detalhamento).toContainText('Leitura alternativa do art. 484-A, I')
    await expect(detalhamento).toContainText('19,5 dias')
    await expect(detalhamento).toContainText('Total Líquido nessa leitura')
    await expect(detalhamento).toContainText('R$ 450,00 a mais')
  })

  test('a linha alternativa não entra na soma do total praticado', async ({ page }) => {
    const detalhamento = await calcular(page, '2023-01-01')

    // R$ 6.553,74 é o líquido pela leitura praticada; R$ 7.003,74 é o da
    // alternativa — os dois aparecem, mas o resultado principal é o primeiro.
    const resultado = page.getByRole('region', { name: 'Resultado do cálculo' })
    await expect(resultado).toContainText('R$ 6.553,74')
    await expect(detalhamento).toContainText('R$ 7.003,74')
  })

  test('até 1 ano de casa as duas leituras coincidem e a alternativa some', async ({ page }) => {
    const detalhamento = await calcular(page, '2026-01-01')

    await expect(detalhamento).toContainText('Aviso Prévio Indenizado (15 dias)')
    await expect(detalhamento).not.toContainText('Leitura alternativa')
  })

  test('outros motivos de rescisão não mostram leitura alternativa', async ({ page }) => {
    await page.goto('/calculadora/rescisao-trabalhista')
    await page.getByLabel('Salário Bruto').fill('300000')
    await page.getByLabel('Data de Admissão').fill('2023-01-01')
    await page.getByLabel('Data de Rescisão').fill('2026-03-15')
    await page.getByLabel('Motivo da Rescisão').selectOption('sem_justa_causa')
    await page.getByLabel('Saldo do FGTS').fill('900000')
    await page.getByRole('button', { name: /Calcular/ }).click()

    const detalhamento = page.getByRole('list', { name: 'Detalhamento linha a linha' })
    await expect(detalhamento).toContainText('Aviso Prévio Indenizado (39 dias)')
    await expect(detalhamento).not.toContainText('Leitura alternativa')
  })
})
