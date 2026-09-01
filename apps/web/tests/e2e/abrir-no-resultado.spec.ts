import { test, expect, type Page } from '@playwright/test'
import { calculatorRegistry } from '../../src/lib/calculators'
import { encodeShareData } from '../../src/lib/shareLink'

// Trava o F59: abrir um cálculo salvo (`/meus-calculos` → "Abrir") ou um link
// compartilhado (F32) leva direto ao resultado, e o botão "Editar cálculo"
// volta ao formulário.
//
// Contexto: o `autoSubmit` já calculava, mas a viewport ficava no topo — a
// pessoa pedia um número e recebia o formulário de novo, com o resultado
// escondido abaixo da dobra.
//
// **Por que cobrir as 20 páginas** (mesmo critério do F56): o comportamento
// mora no `CalculadoraPageClient`, que é único para todas, mas a altura do
// formulário varia muito — 2 campos no IMC, 11 na hora extra. Uma página curta
// pode ter o resultado já visível sem rolagem nenhuma, e é justamente nas
// longas que a regressão passaria despercebida.

/**
 * Valores válidos por calculadora, no formato que viaja no `?d=` — os valores
 * do formulário **depois** do parse do Zod (moeda em reais, não em centavos;
 * datas em ISO; enums como string).
 *
 * Montar o link direto, em vez de preencher o formulário e clicar em
 * compartilhar, é de propósito: o alvo do teste é a abertura, não o
 * preenchimento (que o `share-link.spec.ts` já cobre). Preencher 20
 * formulários por rótulo tornaria a suíte lenta e refém de mudanças de label.
 */
const ENTRADAS: Record<string, Record<string, unknown>> = {
  'rescisao-trabalhista': {
    salarioBruto: 3000,
    dataAdmissao: '2020-03-10',
    dataRescisao: '2026-08-31',
    motivoRescisao: 'sem_justa_causa',
    saldoFGTS: 15000,
    numeroDependentesIRRF: 0,
    feriasVencidas: 0,
  },
  ferias: { salarioBruto: 3000, diasFaltas: 0, diasAbono: 0, emAtraso: 'nao' },
  'decimo-terceiro': {
    salarioBruto: 3000,
    mesAdmissao: 0,
    parcela: 'total',
    numeroDependentesIRRF: 0,
  },
  'hora-extra': {
    salarioBruto: 3000,
    jornadaMensalHoras: '44h',
    quantidadeHoras: 10,
    quantidadeMinutos: 0,
    tipoHora: 'util',
    adicional: 'legal',
    adicionalPersonalizado: 50,
    horaNoturnaReduzida: 'nao',
    calcularDsr: 'nao',
    diasUteis: 25,
    diasDescanso: 5,
  },
  fgts: { salarioBruto: 3000, mesesTrabalhados: 12, saldoAtual: 5000, modalidade: 'rescisao' },
  'salario-liquido': {
    salarioBruto: 3000,
    numeroDependentesIRRF: 0,
    outrasDeducoes: [],
    outrosDescontos: [],
    adicionais: [],
    temValeTransporte: 'nao',
  },
  inss: { salarioBruto: 3000, categoria: 'empregado' },
  irrf: {
    origemRendimento: 'salario',
    salarioBruto: 5000,
    numeroDependentes: 0,
    pensaoAlimenticia: 0,
    iptu: 0,
    condominio: 0,
    taxaAdministracao: 0,
    outrasDeducoes: [],
  },
  irpf: {
    rendimentosTributaveis: 80000,
    irrfRetidoFonte: 5000,
    numeroDependentes: 0,
    despesasMedicas: 0,
    despesasEducacao: 0,
    contribuicaoINSS: 0,
    pensaoAlimenticia: 0,
    contribuicaoPrevidenciaPrivada: 0,
  },
  'das-mei': { atividadePrincipal: 'servico', faturamentoAnual: 60000 },
  'juros-compostos': {
    principal: 1000,
    taxaJuros: 1,
    periodoTaxa: 'mensal',
    prazoMeses: 12,
    aporteMensal: 100,
  },
  porcentagem: { tipo: 'valor_de_percent', valorA: 10, valorB: 200 },
  emprestimo: {
    valorFinanciado: 10000,
    taxaMensalJuros: 2,
    prazoMeses: 24,
    sistema: 'price',
    taxaSeguroMensal: 0,
  },
  financiamento: {
    valorFinanciado: 200000,
    taxaMensalJuros: 0.9,
    prazoMeses: 240,
    sistema: 'price',
    taxaSeguroMensal: 0,
  },
  cdb: { valorInicial: 10000, taxaAnual: 110, tipo: 'cdi', prazoMeses: 24 },
  poupanca: { valorInicial: 1000, prazoMeses: 12, aporteMensal: 100, selicAnual: 0.1325 },
  'tesouro-direto': { valorInicial: 5000, tipo: 'selic', taxaAnual: 0, prazoMeses: 24 },
  imc: { peso: 70, altura: 1.75 },
  calorias: {
    peso: 70,
    // Em centímetros — o IMC acima usa metros. As duas calculadoras de saúde
    // divergem na unidade de altura, e o core das calorias rejeita fora de
    // 100–250, então 1.75 aqui produziria erro de validação em vez de
    // resultado (foi o que este teste pegou ao ser escrito).
    altura: 175,
    idade: 30,
    sexo: 'masculino',
    nivelAtividade: 'moderado',
    objetivo: 'manutencao',
  },
  'margem-lucro': {
    custoTotal: 100,
    modo: 'preco',
    precoVenda: 150,
    markupPercent: 0,
    margemDesejadaPercent: 0,
  },
}

function linkDeCalculoPronto(slug: string): string {
  const entrada = ENTRADAS[slug]
  if (!entrada) throw new Error(`Sem entrada de teste para "${slug}" — ver ENTRADAS`)
  return `/calculadora/${slug}?d=${encodeShareData(entrada)}`
}

const resultado = (page: Page) => page.getByRole('region', { name: 'Resultado do cálculo' })

/** `true` quando o elemento está inteiramente dentro da viewport atual. */
async function estaNaViewport(page: Page, seletor: ReturnType<typeof resultado>) {
  return seletor.evaluate((el) => {
    const { top, bottom } = el.getBoundingClientRect()
    return top >= 0 && top < window.innerHeight && bottom > 0
  })
}

test.describe('abrir cálculo pronto cai no resultado (F59)', () => {
  for (const calc of calculatorRegistry) {
    test(`/calculadora/${calc.slug} abre no resultado, não no topo`, async ({ page }) => {
      await page.goto(linkDeCalculoPronto(calc.slug))

      const regiao = resultado(page)
      await expect(regiao, 'o auto-submit não produziu resultado').toBeVisible()

      // O scroll é `smooth`; espera o navegador assentar antes de medir.
      await expect
        .poll(async () => estaNaViewport(page, regiao), {
          message: 'o resultado não entrou na viewport ao abrir o cálculo',
          timeout: 5000,
        })
        .toBe(true)

      // A metade que costuma faltar: rolar sem mover o foco deixa quem navega
      // por teclado ou leitor de tela parado no topo.
      await expect
        .poll(
          () => page.evaluate(() => document.activeElement?.getAttribute('aria-label')),
          { message: 'o foco não foi para a região do resultado', timeout: 5000 },
        )
        .toBe('Resultado do cálculo')
    })
  }
})

test.describe('"Editar cálculo" volta ao formulário (F59)', () => {
  for (const calc of calculatorRegistry) {
    test(`/calculadora/${calc.slug} volta ao formulário ao editar`, async ({ page }) => {
      await page.goto(linkDeCalculoPronto(calc.slug))
      await expect(resultado(page)).toBeVisible()

      const botao = page.getByRole('button', { name: 'Editar cálculo' })
      await expect(botao).toBeVisible()
      await botao.click()

      const formulario = page.getByLabel(`Formulário da ${calc.titulo}`)
      await expect
        .poll(
          () =>
            formulario.evaluate((el) => {
              const { top } = el.getBoundingClientRect()
              return top >= 0 && top < window.innerHeight
            }),
          { message: 'o formulário não entrou na viewport', timeout: 5000 },
        )
        .toBe(true)

      await expect
        .poll(
          () => page.evaluate(() => document.activeElement?.getAttribute('aria-label')),
          { message: 'o foco não voltou para o formulário', timeout: 5000 },
        )
        .toBe(`Formulário da ${calc.titulo}`)
    })
  }
})

test.describe('visita normal não é afetada (F59)', () => {
  // A regra que protege o tráfego orgânico, que é praticamente todo o tráfego:
  // sem `?d=`/`?calc=` na URL a página abre no H1, com o conteúdo editorial do
  // F47 e a estrutura de links do F43 pela frente. Direcionar sempre ao
  // resultado desfaria os dois na prática.
  const AMOSTRA = ['rescisao-trabalhista', 'imc', 'financiamento']

  for (const slug of AMOSTRA) {
    test(`/calculadora/${slug} abre no topo quando não veio de cálculo pronto`, async ({
      page,
    }) => {
      await page.goto(`/calculadora/${slug}`)

      expect(await page.evaluate(() => window.scrollY)).toBe(0)
      await expect(page.getByRole('region', { name: 'Resultado do cálculo' })).toHaveCount(0)
    })
  }

  test('o botão "Editar cálculo" não aparece num cálculo feito na hora', async ({ page }) => {
    // Aqui o formulário está logo acima do resultado, na mesma tela — o botão
    // seria redundante. Só existe onde o formulário ficou para trás.
    await page.goto('/calculadora/imc')
    await page.getByLabel('Peso').fill('70')
    await page.getByLabel('Altura').fill('1.75')
    await page.getByRole('button', { name: /Calcular/ }).click()

    await expect(page.getByRole('region', { name: 'Resultado do cálculo' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Editar cálculo' })).toHaveCount(0)
  })
})

test.describe('cobertura do fixture', () => {
  test('toda calculadora do registry tem entrada de teste', () => {
    // Sem isso, acrescentar a 21ª calculadora passaria batido: os laços acima
    // iteram o registry e um slug sem entrada quebraria com erro obscuro.
    const faltando = calculatorRegistry.filter((c) => !ENTRADAS[c.slug]).map((c) => c.slug)
    expect(faltando, `calculadoras sem entrada em ENTRADAS: ${faltando.join(', ')}`).toEqual([])
  })
})
