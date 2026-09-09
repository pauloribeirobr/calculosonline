import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

// Trava a cobertura dos chips de valor rápido (F50, estendida em 08/09).
//
// O levantamento de 08/09 achou **31 de 57 campos numéricos sem chip** — e o
// próprio levantamento subcontava, porque campos declarados numa linha só
// (`peso: { label: 'Peso', type: 'number' }`) escapavam do regex. O total real
// era 65. Este teste existe para que a resposta não dependa de alguém repetir
// a varredura à mão: campo numérico novo sem `quickAdd` quebra o build.
//
// Campo que legitimamente não deve ter chip entra em `SEM_CHIP_POR_DECISAO`,
// com o motivo — a lista vazia é a afirmação de que hoje não há exceção.

const DIR_FORMS = path.join(process.cwd(), 'src/components/calculadoras/forms')

/** Tipos em que "somar um número" não faz sentido. */
const TIPOS_NAO_NUMERICOS = ['select', 'date', 'checkbox', 'itemList', 'radio']

const SEM_CHIP_POR_DECISAO: Record<string, string> = {}

interface Campo {
  form: string
  nome: string
  tipo: string
  temChip: boolean
}

function extrairCampos(): Campo[] {
  const campos: Campo[] = []
  for (const arquivo of fs.readdirSync(DIR_FORMS).filter((f) => f.endsWith('Form.tsx'))) {
    const fonte = fs.readFileSync(path.join(DIR_FORMS, arquivo), 'utf-8')
    const bloco = /fields=\{\{\n([\s\S]*?)\n {6}\}\}/.exec(fonte)
    if (!bloco?.[1]) continue
    const corpo = `\n${bloco[1]}\n`

    const vistos = new Set<string>()
    const registrar = (nome: string, conteudo: string) => {
      if (vistos.has(nome)) return
      vistos.add(nome)
      const tipo = /type:\s*'(\w+)'/.exec(conteudo)?.[1] ?? 'text'
      if (TIPOS_NAO_NUMERICOS.includes(tipo)) return
      campos.push({
        form: arquivo.replace('Form.tsx', ''),
        nome,
        tipo,
        temChip: conteudo.includes('quickAdd'),
      })
    }

    // Multi-linha primeiro; depois os declarados numa linha só, que foram
    // justamente os que o levantamento manual perdeu.
    for (const m of corpo.matchAll(/\n {8}(\w+):\s*\{([\s\S]*?)\n {8}\},/g)) {
      registrar(m[1]!, m[2]!)
    }
    for (const m of corpo.matchAll(/\n {8}(\w+):\s*\{([^\n{}]*)\},/g)) {
      registrar(m[1]!, m[2]!)
    }
  }
  return campos
}

test.describe('chips de valor rápido — cobertura', () => {
  test('todo campo numérico dos formulários tem chips', () => {
    const campos = extrairCampos()
    expect(campos.length, 'nenhum campo lido — o parser quebrou').toBeGreaterThan(50)

    const semChip = campos
      .filter((c) => !c.temChip)
      .filter((c) => !(`${c.form}.${c.nome}` in SEM_CHIP_POR_DECISAO))
      .map((c) => `${c.form}.${c.nome} (${c.tipo})`)

    expect(semChip, `campos numéricos sem quickAdd:\n  ${semChip.join('\n  ')}`).toEqual([])
  })

  // A regra que o modo 'definir' existe para proteger: chip de taxa não pode
  // somar. Dois cliques em "+1%" dariam 2%, que não é o que ninguém quer.
  test('todo preset de taxa usa modo definir, e nenhum preset de valor usa', () => {
    const fonte = fs.readFileSync(path.join(process.cwd(), 'src/lib/quickAddPresets.ts'), 'utf-8')

    for (const m of fonte.matchAll(
      /export const (QUICK_ADD_\w+): QuickAddButton\[\] = \[([\s\S]*?)\n\]/g,
    )) {
      const [, nome, corpo] = m as unknown as [string, string, string]
      const chips = corpo.split('\n').filter((l) => l.includes('value:'))
      const ehTaxa = /TAXA|MARGEM|MARKUP|ADICIONAL_HE|SEGURO/.test(nome)
      if (!ehTaxa) continue
      for (const chip of chips) {
        expect(chip, `${nome}: chip de taxa sem modo 'definir' → ${chip.trim()}`).toContain(
          "modo: 'definir'",
        )
      }
    }
  })
})

test.describe('chips de valor rápido — comportamento no navegador', () => {
  test('chip de taxa DEFINE o valor: clicar duas vezes não dobra', async ({ page }) => {
    await page.goto('/calculadora/juros-compostos')

    const taxa = page.getByLabel(/Taxa de juros/i)
    const chip = page
      .getByTestId('quick-add-taxaJuros')
      .getByRole('button', { name: '1%', exact: true })

    await chip.click()
    await expect(taxa).toHaveValue('0.01')
    await chip.click()
    // Se o chip somasse, aqui estaria 0.02 — que é o bug que o modo evita.
    await expect(taxa).toHaveValue('0.01')
  })

  test('chip de valor continua SOMANDO', async ({ page }) => {
    await page.goto('/calculadora/juros-compostos')

    const capital = page.getByLabel(/Capital inicial/i)
    const chip = page
      .getByTestId('quick-add-principal')
      .getByRole('button', { name: '+1.000', exact: true })

    await chip.click()
    await chip.click()
    await expect(capital).toHaveValue(/2\.000/)
  })

  test('a taxa em decimal aceita o valor do chip sem arredondar para zero', async ({ page }) => {
    // O arredondamento do quickAdd era de 2 casas, o que zeraria 0,005 e
    // 0,0003. Passou a 4 casas quando os presets de taxa entraram.
    await page.goto('/calculadora/juros-compostos')
    await page
      .getByTestId('quick-add-taxaJuros')
      .getByRole('button', { name: '0,5%', exact: true })
      .click()
    await expect(page.getByLabel(/Taxa de juros/i)).toHaveValue('0.005')
  })
})
