import { test, expect } from '@playwright/test'

// Cobertura dos campos novos da calculadora de salário líquido: campo de
// moeda mascarado com centavos (dígitos digitados = centavos), stepper de
// dependentes (+/-) e listas livres de itens (outras deduções, outros
// descontos, adicionais) com chips de sugestão e remoção de linha.

test.describe('calculadora de salário líquido — campos novos', () => {
  test('salário bruto aceita centavos via máscara (dígitos = centavos)', async ({ page }) => {
    await page.goto('/calculadora/salario-liquido')

    const salario = page.getByLabel('Salário Bruto')
    await salario.fill('500050')
    await expect(salario).toHaveValue('5.000,50')
  })

  test('chips de valor rápido continuam somando ao campo de moeda mascarado', async ({
    page,
  }) => {
    await page.goto('/calculadora/salario-liquido')

    const salario = page.getByLabel('Salário Bruto')
    await expect(salario).toHaveValue('0,00')

    await page.getByRole('button', { name: '+1.000', exact: true }).click()
    await expect(salario).toHaveValue('1.000,00')

    await page.getByRole('button', { name: '+500', exact: true }).click()
    await expect(salario).toHaveValue('1.500,00')

    await page.getByRole('button', { name: 'Zerar' }).click()
    await expect(salario).toHaveValue('0,00')
  })

  test('stepper de dependentes aumenta e diminui, sem passar de zero', async ({ page }) => {
    await page.goto('/calculadora/salario-liquido')

    const dependentes = page.getByLabel('Dependentes (IRRF)')
    await expect(dependentes).toHaveValue('0')

    const diminuir = page.getByRole('button', { name: 'Diminuir' })
    const aumentar = page.getByRole('button', { name: 'Aumentar' })

    await expect(diminuir).toBeDisabled()

    await aumentar.click()
    await aumentar.click()
    await expect(dependentes).toHaveValue('2')

    await diminuir.click()
    await expect(dependentes).toHaveValue('1')
  })

  test('lista de "Outras deduções": chip de sugestão adiciona linha, remoção funciona', async ({
    page,
  }) => {
    await page.goto('/calculadora/salario-liquido')

    const grupo = page.getByRole('group', { name: 'Outras deduções' })
    await grupo.getByRole('button', { name: '+ Plano de Saúde' }).click()

    const linha = grupo.getByRole('listitem')
    await expect(linha).toHaveCount(1)
    await expect(linha.getByLabel('Descrição do item 1')).toHaveValue('Plano de Saúde')

    await linha.getByLabel('Valor do item 1').fill('45000')
    await expect(linha.getByLabel('Valor do item 1')).toHaveValue('450,00')
    await expect(grupo.getByText('Total: R$ 450,00')).toBeVisible()

    await linha.getByRole('button', { name: 'Remover item 1' }).click()
    await expect(grupo.getByRole('listitem')).toHaveCount(0)
  })

  test('lista de itens tem teto de 20 itens e 60 caracteres por descrição (link de compartilhamento não cresce sem controle)', async ({
    page,
  }) => {
    await page.goto('/calculadora/salario-liquido')

    const grupo = page.getByRole('group', { name: 'Outras deduções' })
    for (let i = 0; i < 20; i++) {
      await grupo.getByRole('button', { name: 'Adicionar item' }).click()
    }
    await expect(grupo.getByRole('listitem')).toHaveCount(20)
    await expect(grupo.getByRole('button', { name: 'Adicionar item' })).toBeDisabled()
    await expect(grupo.getByText('Máximo de 20 itens por lista.')).toBeVisible()

    const primeiraDescricao = grupo.getByLabel('Descrição do item 1', { exact: true })
    await primeiraDescricao.fill('X'.repeat(100))
    await expect(primeiraDescricao).toHaveValue('X'.repeat(60))
  })

  test('lista de "Adicionais": item livre via "+ Adicionar item" (sem chip)', async ({ page }) => {
    await page.goto('/calculadora/salario-liquido')

    const grupo = page.getByRole('group', { name: 'Adicionais (não entram na folha)' })
    await grupo.getByRole('button', { name: 'Adicionar item' }).click()

    const linha = grupo.getByRole('listitem').first()
    await linha.getByLabel('Descrição do item 1').fill('Auxílio Home Office')
    await linha.getByLabel('Valor do item 1').fill('15000')
    await expect(grupo.getByText('Total: R$ 150,00')).toBeVisible()
  })

  test('fluxo completo: bruto + dependente + dedução + desconto + adicional → resultado com "Total com Adicionais"', async ({
    page,
  }) => {
    await page.goto('/calculadora/salario-liquido')

    await page.getByLabel('Salário Bruto').fill('500000')

    await page.getByRole('button', { name: 'Aumentar' }).click()

    const deducoes = page.getByRole('group', { name: 'Outras deduções' })
    await deducoes.getByRole('button', { name: '+ Plano de Saúde' }).click()
    await deducoes.getByLabel('Valor do item 1').fill('30000')

    const descontos = page.getByRole('group', { name: 'Outros descontos' })
    await descontos.getByRole('button', { name: '+ Consignado' }).click()
    await descontos.getByLabel('Valor do item 1').fill('10000')

    const adicionais = page.getByRole('group', { name: 'Adicionais (não entram na folha)' })
    await adicionais.getByRole('button', { name: '+ Vale Refeição' }).click()
    await adicionais.getByLabel('Valor do item 1').fill('60000')

    await page.getByRole('button', { name: 'Calcular Salário Líquido' }).click()

    const resultado = page.getByRole('region', { name: 'Resultado do cálculo' })
    await expect(resultado).toBeVisible()
    await expect(resultado.getByText('Plano de Saúde')).toBeVisible()
    await expect(resultado.getByText('Consignado')).toBeVisible()
    await expect(resultado.getByText('Vale Refeição')).toBeVisible()
    await expect(resultado.getByText('Salário Líquido', { exact: true })).toBeVisible()
    await expect(resultado.getByText('Total com Adicionais')).toBeVisible()

    // Compartilhamento via WhatsApp continua funcionando com os novos campos.
    await expect(resultado.getByRole('link', { name: 'Compartilhar via WhatsApp' })).toBeVisible()
  })

  test('sem adicionais, a linha "Total com Adicionais" não aparece no resultado', async ({
    page,
  }) => {
    await page.goto('/calculadora/salario-liquido')

    await page.getByLabel('Salário Bruto').fill('500000')
    await page.getByRole('button', { name: 'Calcular Salário Líquido' }).click()

    const resultado = page.getByRole('region', { name: 'Resultado do cálculo' })
    await expect(resultado).toBeVisible()
    await expect(resultado.getByText('Total com Adicionais')).toHaveCount(0)
  })
})
