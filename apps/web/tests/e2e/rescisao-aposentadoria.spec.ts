import { test, expect, type Page } from '@playwright/test'

// A opção "Aposentadoria" existia no formulário desde o F3 devolvendo o mesmo
// resultado de "sem justa causa" — multa de 40% e aviso prévio integral. A
// premissa não se sustenta: o STF (ADI 1.721 e 1.770) derrubou os §§ 1º e 2º
// do art. 453 da CLT e a OJ 361 da SDI-1 do TST fixou que a aposentadoria
// espontânea não extingue o contrato. Quem encerra é a empresa (→ multa) ou o
// próprio trabalhador (→ sem multa).
//
// Com R$ 3.000 de salário, 9.000 de FGTS e 3 anos de casa, a diferença entre
// as duas leituras é de **R$ 8.621,66** no líquido — todos os valores abaixo
// saíram de execuções do core (disciplina do F47/F49).

const LIQUIDO_A_PEDIDO = 'R$ 2.694,45'
const LIQUIDO_DISPENSA = 'R$ 11.316,11'

async function calcular(page: Page, motivo: string) {
  await page.goto('/calculadora/rescisao-trabalhista')
  await page.getByLabel('Salário Bruto').fill('300000') // R$ 3.000,00
  await page.getByLabel('Data de Admissão').fill('01/01/2023')
  await page.getByLabel('Data de Rescisão').fill('15/03/2026')
  await page.getByLabel('Motivo da Rescisão').selectOption(motivo)
  await page.getByLabel('Saldo do FGTS').fill('900000') // R$ 9.000,00
  await page.getByRole('button', { name: /Calcular/ }).click()
  return {
    resultado: page.getByRole('region', { name: 'Resultado do cálculo' }),
    detalhamento: page.getByRole('list', { name: 'Detalhamento linha a linha' }),
  }
}

test.describe('rescisão por aposentadoria', () => {
  test('não paga multa de 40% nem aviso prévio indenizado', async ({ page }) => {
    const { resultado, detalhamento } = await calcular(page, 'aposentadoria')

    await expect(resultado).toContainText(LIQUIDO_A_PEDIDO)
    await expect(detalhamento).not.toContainText('Multa FGTS 40%')
    await expect(detalhamento).not.toContainText('Aviso Prévio Indenizado')
  })

  test('mostra os 40% como linha informativa, fora da soma', async ({ page }) => {
    const { resultado, detalhamento } = await calcular(page, 'aposentadoria')

    // Os R$ 3.600 aparecem, mas como cenário — não entram no líquido, que
    // continua sendo o da saída a pedido.
    await expect(detalhamento).toContainText(
      'Multa de 40% — só se o desligamento partir da empresa',
    )
    await expect(detalhamento).toContainText('R$ 3.600,00')
    await expect(detalhamento).toContainText('OJ 361 do TST')
    await expect(resultado).toContainText(LIQUIDO_A_PEDIDO)
    await expect(resultado).not.toContainText(LIQUIDO_DISPENSA)
  })

  test('declara a premissa assumida e aponta o outro cenário', async ({ page }) => {
    const { resultado } = await calcular(page, 'aposentadoria')

    await expect(resultado).toContainText('não extingue o contrato de trabalho')
    await expect(resultado).toContainText('OJ 361')
    // O usuário precisa saber para onde ir se o caso dele for o outro.
    await expect(resultado).toContainText('demissão sem justa causa')
  })

  test('dispensa sem justa causa continua com os 40% — a diferença é o motivo', async ({
    page,
  }) => {
    const { resultado, detalhamento } = await calcular(page, 'sem_justa_causa')

    await expect(resultado).toContainText(LIQUIDO_DISPENSA)
    await expect(detalhamento).toContainText('Multa FGTS 40%')
    // O aviso da aposentadoria não pode vazar para os outros motivos.
    await expect(resultado).not.toContainText('não extingue o contrato de trabalho')
  })

  test('o conteúdo da página explica a distinção', async ({ page }) => {
    await page.goto('/calculadora/rescisao-trabalhista')
    const conteudo = page.getByRole('main')

    await expect(conteudo.getByRole('heading', { name: 'Aposentadoria' })).toBeVisible()
    await expect(conteudo).toContainText('OJ 361')
    // A confusão mais comum do tema, dita com todas as letras.
    await expect(conteudo).toContainText('Não confunda saque com multa')
  })
})
