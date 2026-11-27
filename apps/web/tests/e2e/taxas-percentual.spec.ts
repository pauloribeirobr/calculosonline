import { test, expect, type Page } from '@playwright/test'
import { encodeShareData } from '../../src/lib/shareLink'

// Trava a F84: taxas de CDB, Tesouro Direto e poupança em porcentagem, com CDI,
// Selic e IPCA pré-preenchidos pela referência do Banco Central e editáveis.
//
// Antes: a taxa era pedida em decimal ("1.10" = 110% do CDI, "0.12" = 12% ao
// ano) num campo só, o CDB não deixava trocar o CDI e o Tesouro Selic ignorava
// o campo e usava a referência fixa. Os links antigos (`taxaAnual`/`selicAnual`
// em decimal) continuam abrindo; os da F82 em investimentos-referencias.spec.ts
// são desse formato e seguem passando.
//
// Valores: os mesmos do motor (conferidos em 27/11/2026, referências de
// 26/10/2026: CDI 13,65%, Selic 13,75%). Se `referencias.ts` mudar, os que
// usam a referência mudam junto.

const resultado = (page: Page) => page.getByRole('region', { name: 'Resultado do cálculo' })
const link = (slug: string, dados: Record<string, unknown>) =>
  `/calculadora/${slug}?d=${encodeShareData(dados)}`

test.describe('F84 — CDB em porcentagem', () => {
  test('abre com 100% do CDI e o CDI de referência, editável e com a data', async ({ page }) => {
    await page.goto('/calculadora/cdb')
    await expect(page.getByLabel('Percentual do CDI')).toHaveValue('100')
    await expect(page.getByLabel('CDI ao ano')).toHaveValue('13.65')
    await expect(page.locator('#cdi-hint')).toContainText('CDI do Banco Central em 26/10/2026')
  })

  test('R$ 10.000 por 12 meses a 100% do CDI digitado em %: R$ 11.126,12', async ({ page }) => {
    await page.goto('/calculadora/cdb')
    await page.getByLabel('Valor inicial').fill('1000000')
    await page.locator('#prazoMeses').fill('12')
    await page.getByRole('button', { name: 'Calcular CDB' }).click()
    await expect(resultado(page)).toContainText('11.126,12')
  })

  test('prefixado: cada indexador tem o seu campo, e "12" é 12% ao ano', async ({ page }) => {
    await page.goto('/calculadora/cdb')
    await page.getByLabel('Valor inicial').fill('1000000')
    await page.locator('#prazoMeses').fill('12')
    await page.getByLabel('Tipo de remuneração').selectOption('prefixado')
    await expect(page.getByLabel('Percentual do CDI')).toHaveCount(0)
    await expect(page.getByLabel('CDI ao ano')).toHaveCount(0)

    // Sem taxa: erro do campo do indexador, não do campo antigo.
    await page.getByRole('button', { name: 'Calcular CDB' }).click()
    await expect(page.getByRole('alert').filter({ hasText: 'taxaPrefixada' })).toBeVisible()

    await page.getByLabel('Taxa prefixada').fill('12')
    await page.getByRole('button', { name: 'Calcular CDB' }).click()
    await expect(resultado(page)).toContainText('10.990,00')
  })

  test('IPCA+ mostra a taxa real e o IPCA de referência', async ({ page }) => {
    await page.goto('/calculadora/cdb')
    await page.getByLabel('Tipo de remuneração').selectOption('ipca_mais')
    await expect(page.getByLabel('Taxa acima do IPCA')).toBeVisible()
    await expect(page.getByLabel('IPCA ao ano')).toHaveValue('4.58')
  })

  test('link antigo em decimal (110% = 1.1) abre convertido para 110', async ({ page }) => {
    await page.goto(
      link('cdb', { valorInicial: 10000, taxaAnual: 1.1, tipo: 'cdi', prazoMeses: 12 }),
    )
    await expect(resultado(page)).toBeVisible()
    await expect(page.getByLabel('Percentual do CDI')).toHaveValue('110')
  })

  test('link novo leva o CDI editado: trocar o CDI muda o resultado', async ({ page }) => {
    const base = { valorInicial: 10000, tipo: 'cdi', percentualCDI: 100, prazoMeses: 12 }
    await page.goto(link('cdb', { ...base, cdi: 13.65 }))
    await expect(resultado(page)).toContainText('11.126,12')
    await page.goto(link('cdb', { ...base, cdi: 10 }))
    await expect(page.getByLabel('CDI ao ano')).toHaveValue('10')
    await expect(resultado(page)).not.toContainText('11.126,12')
  })
})

test.describe('F84 — Tesouro Direto em porcentagem', () => {
  test('Tesouro Selic abre com a Selic de referência, e trocar a Selic muda o resultado', async ({
    page,
  }) => {
    await page.goto(link('tesouro-direto', { valorInicial: 1000, tipo: 'selic', prazoMeses: 12 }))
    await expect(page.getByLabel('Selic ao ano')).toHaveValue('13.75')
    await expect(resultado(page)).toContainText('1.113,44')

    await page.getByLabel('Selic ao ano').fill('10')
    await page.getByRole('button', { name: 'Calcular Tesouro Direto' }).click()
    await expect(resultado(page)).toContainText('1.082,50')
  })

  test('link antigo do prefixado (0.12) abre com 12 no campo do título', async ({ page }) => {
    await page.goto(
      link('tesouro-direto', {
        valorInicial: 1000,
        tipo: 'prefixado',
        taxaAnual: 0.12,
        prazoMeses: 12,
      }),
    )
    await expect(page.getByLabel('Taxa do título')).toHaveValue('12')
    await expect(resultado(page)).toContainText('1.097,00')
  })
})

test.describe('F84 — poupança em porcentagem', () => {
  test('Selic em %, com os chips da referência e do limite de 8,5%', async ({ page }) => {
    await page.goto('/calculadora/poupanca')
    await expect(page.getByLabel('Selic ao ano')).toHaveValue('13.75')
    await page.getByLabel('Valor inicial', { exact: true }).fill('100000')
    await page.locator('#prazoMeses').fill('12')
    await page.getByRole('button', { name: 'Calcular Poupança' }).click()
    await expect(resultado(page)).toContainText('1.061,68')

    // Selic de 8,5%: a poupança passa a render 70% da Selic (Lei 12.703/2012).
    await page.getByTestId('quick-add-selic').getByRole('button', { name: '8,5%' }).click()
    await page.getByRole('button', { name: 'Calcular Poupança' }).click()
    await expect(resultado(page)).toContainText('1.059,50')
  })

  test('link antigo (selicAnual 0.1325) abre com 13,25 no campo', async ({ page }) => {
    await page.goto(
      link('poupanca', {
        valorInicial: 1000,
        prazoMeses: 12,
        aporteMensal: 100,
        selicAnual: 0.1325,
      }),
    )
    await expect(page.getByLabel('Selic ao ano')).toHaveValue('13.25')
    await expect(resultado(page)).toContainText('2.295,23')
  })
})
