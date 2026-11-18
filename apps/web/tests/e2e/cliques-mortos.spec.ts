import { test, expect, type Page } from '@playwright/test'
import { HUB_TRABALHISTA } from '../../src/lib/hubTrabalhista'

// Trava a F70 — os cliques que o Clarity mediu e que não faziam nada.
//
// Exports de heatmap de 01 a 25/10/2026: no hub, só 5 de ~9 cliques nos cards
// acertavam o `summary` (o resto caía no `LI`, no título, nas linhas do
// detalhamento); nas férias e na rescisão, cliques no valor grande e nas
// linhas `#detalhamento-lista > li`. Em 17/11, a API do Clarity (F89) mediu
// 64% de clique morto no PC na `ferias-e-decimo-terceiro`, a página do pico
// do 13º. A resposta: o valor e as linhas copiam, o card inteiro do hub abre
// o detalhamento, e o `result_copied` vai para o GA4 para medir se copiar era
// mesmo o que a pessoa queria.

test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

type EventoCapturado = { nome: string; params: Record<string, unknown> }

/** Mesmo stub do `error-logger.spec.ts`: habilita o `analytics.track` e grava o que foi enviado. */
async function capturarEventos(page: Page) {
  await page.addInitScript(() => {
    const capturados: EventoCapturado[] = []
    ;(window as unknown as { __eventos: EventoCapturado[] }).__eventos = capturados
    ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (...args: unknown[]) => {
      if (args[0] === 'event') {
        capturados.push({ nome: String(args[1]), params: (args[2] as Record<string, unknown>) ?? {} })
      }
    }
  })
}

const eventosCopia = (page: Page) =>
  page.evaluate(() =>
    (window as unknown as { __eventos: EventoCapturado[] }).__eventos.filter((e) => e.nome === 'result_copied'),
  )

const areaDeTransferencia = (page: Page) => page.evaluate(() => navigator.clipboard.readText())

async function calcularFeriasE13(page: Page) {
  await page.goto('/calculadora/ferias-e-decimo-terceiro')
  await page.getByLabel('Salário Bruto').fill('300000')
  await page.getByRole('button', { name: /Calcular Férias \+ 13º/ }).click()
  const resultado = page.getByRole('region', { name: 'Resultado do cálculo' })
  await expect(resultado).toBeVisible()
  return resultado
}

test.describe('F70 — o resultado copia o valor clicado', () => {
  test.beforeEach(async ({ page }) => {
    await capturarEventos(page)
  })

  test('o valor grande copia o texto exibido e confirma', async ({ page }) => {
    const resultado = await calcularFeriasE13(page)

    // O nome acessível do botão é o próprio valor (o ícone é aria-hidden).
    const headline = resultado.getByRole('button', { name: /^R\$/ })
    const exibido = (await headline.textContent())!.trim()
    await headline.click()

    expect(await areaDeTransferencia(page)).toBe(exibido)
    await expect(headline).toContainText('Copiado')
    await expect(resultado.getByRole('status')).toHaveText('Valor copiado')

    const eventos = await eventosCopia(page)
    expect(eventos).toHaveLength(1)
    expect(eventos[0]!.params).toMatchObject({
      calculator_slug: 'ferias-e-decimo-terceiro',
      calculator_category: 'trabalhista',
      copy_target: 'resultado',
    })
  })

  test('uma linha do detalhamento copia o valor dela, sem o sinal', async ({ page }) => {
    const resultado = await calcularFeriasE13(page)
    const detalhamento = page.getByRole('list', { name: 'Detalhamento linha a linha' })

    // Uma linha com sinal (+ ou −): o sinal é da leitura, não do número, e
    // não cola como número numa planilha.
    const linha = detalhamento.getByRole('button').filter({ hasText: /[+−] R\$/ }).first()
    const valorComSinal = (await linha.locator('span.tabular-nums').textContent())!.trim()
    const esperado = valorComSinal.replace(/^[+−]\s*/, '')
    expect(esperado).toMatch(/^R\$ /)

    await linha.click()
    expect(await areaDeTransferencia(page)).toBe(esperado)
    await expect(resultado.getByRole('status')).toHaveText('Valor copiado')

    const eventos = await eventosCopia(page)
    expect(eventos.at(-1)!.params).toMatchObject({ copy_target: 'linha' })
    expect(String(eventos.at(-1)!.params.copy_label).length).toBeGreaterThan(0)
  })

  test('copiar não muda o texto do detalhamento (os outros testes leem esse texto)', async ({ page }) => {
    await calcularFeriasE13(page)
    const detalhamento = page.getByRole('list', { name: 'Detalhamento linha a linha' })
    const antes = await detalhamento.textContent()
    await detalhamento.getByRole('button').first().click()
    expect(await detalhamento.textContent()).toBe(antes)
  })
})

test.describe('F70 — o card do hub abre pelo card inteiro', () => {
  test.beforeEach(async ({ page }) => {
    await capturarEventos(page)
    await page.goto(HUB_TRABALHISTA.path)
    await page.getByLabel('Salário Bruto').fill('300000')
    await page.getByLabel('Data de Admissão').fill('01/09/2021')
    await page.getByLabel('Data de Saída').fill('30/09/2026')
    await page.getByLabel('Motivo da Saída').selectOption('sem_justa_causa')
    await page.getByLabel('Saldo do FGTS').fill('1440000')
    await page.getByRole('button', { name: /Calcular tudo/ }).click()
    await expect(page.getByRole('heading', { name: 'Seu panorama trabalhista' })).toBeVisible()
  })

  const card = (page: Page, titulo: string) =>
    page.locator('li').filter({ has: page.getByRole('heading', { name: titulo, exact: true }) })

  test('clicar no título, na legenda ou no fundo do card abre e fecha o detalhamento', async ({ page }) => {
    const ferias = card(page, 'Férias')
    const detalhes = ferias.locator('details')
    await expect(detalhes).not.toHaveAttribute('open', '')

    await ferias.getByRole('heading', { name: 'Férias', exact: true }).click()
    await expect(detalhes).toHaveAttribute('open', '')

    await ferias.getByRole('heading', { name: 'Férias', exact: true }).click()
    await expect(detalhes).not.toHaveAttribute('open', '')

    // O canto do card (o padding do `li`), que era o alvo errado mais comum.
    await ferias.click({ position: { x: 8, y: 8 } })
    await expect(detalhes).toHaveAttribute('open', '')
  })

  test('o "Ver como chegou nesse valor" continua funcionando pelo teclado', async ({ page }) => {
    const fgts = card(page, 'FGTS')
    await fgts.getByText('Ver como chegou nesse valor').focus()
    await page.keyboard.press('Enter')
    await expect(fgts.locator('details')).toHaveAttribute('open', '')
    await expect(page.getByText('já incluída no total da rescisão acima')).toBeVisible()
  })

  test('o valor do card copia, e não abre nem fecha o detalhamento', async ({ page }) => {
    const ferias = card(page, 'Férias')
    await ferias.getByRole('button', { name: 'R$ 4.000,00' }).click()

    expect(await areaDeTransferencia(page)).toBe('R$ 4.000,00')
    await expect(ferias.locator('details')).not.toHaveAttribute('open', '')
    await expect(ferias.getByRole('status')).toHaveText('Valor copiado')

    const eventos = await eventosCopia(page)
    expect(eventos.at(-1)!.params).toMatchObject({
      calculator_slug: HUB_TRABALHISTA.slug,
      copy_target: 'bloco',
      copy_label: 'Férias',
    })
  })

  test('com o detalhamento aberto, clicar numa linha copia e não fecha', async ({ page }) => {
    const rescisao = card(page, 'Rescisão')
    const detalhes = rescisao.locator('details')
    await rescisao.getByText('Ver como chegou nesse valor').click()
    await expect(detalhes).toHaveAttribute('open', '')

    await detalhes.getByRole('button').first().click()
    expect(await areaDeTransferencia(page)).toMatch(/^R\$ /)
    await expect(detalhes).toHaveAttribute('open', '')
    expect((await eventosCopia(page)).at(-1)!.params).toMatchObject({ copy_target: 'linha' })
  })

  test('o link para a calculadora dedicada não alterna o card', async ({ page }) => {
    const ferias = card(page, 'Férias')
    const link = ferias.getByRole('link', { name: /Abrir a calculadora de/ })
    await link.click()
    await expect(page).toHaveURL(/\/calculadora\/ferias$/)
  })
})
