# Prompt de IA — Sprint 1.1: Calculadoras Core (15 restantes)
**calculosonline.com.br | Fase 1 — MVP | Semanas 3–4**

---

## PRÉ-REQUISITO

Sprint 0.2 concluída. `packages/core` contém:
- 5 calculadoras trabalhistas (rescisão, férias, 13º, hora extra, salário líquido)
- Funções utilitárias: `calcularINSSProgressivo`, `calcularIRRFMensal`, `arredondar`, `dividir`
- Tabelas 2026: INSS, IRRF, pisos regionais, salário mínimo
- Padrão `ResultadoOuErro<T>` estabelecido

---

## OBJETIVO DA SPRINT 1.1

Implementar as **15 calculadoras restantes** para completar o MVP de 20 calculadoras. Seguir exatamente o mesmo padrão da Sprint 0.2:

- Funções puras TypeScript, sem dependências de UI
- Retorno `ResultadoOuErro<T>` com detalhamento linha a linha
- Testes unitários com Vitest, 100% de cobertura

---

## GRUPO A — TRABALHISTA (1 calculadora)

### calcularFGTS — Lei 8.036/1990

```typescript
// packages/core/src/trabalhista/fgts.ts

export type ModalidadeFGTS = "rescisao" | "saque_aniversario" | "contribuicao_mensal"

export interface FGTSParams {
  salarioBruto: number
  mesesTrabalhados: number
  modalidade: ModalidadeFGTS
  /** Saldo atual do FGTS (necessário para rescisão e saque-aniversário) */
  saldoAtual?: number
  /** Para saque-aniversário: mês de aniversário (1-12) */
  mesAniversario?: number
}

export interface FGTSResultado {
  depositoMensal: number        // 8% do salário bruto
  saldoProjetado: number        // saldo atual + depósitos
  multaRescisoria40: number     // 40% sobre saldo (sem justa causa)
  multaRescisoria20: number     // 20% sobre saldo (acordo mútuo)
  saqueAniversarioValor?: number
  saqueAniversarioAliquota?: number
}

// Tabela saque-aniversário (Lei 13.932/2019)
const TABELA_SAQUE_ANIVERSARIO: Array<{ ate: number | null; aliquota: number; parcela: number }> = [
  { ate: 500,        aliquota: 0.50, parcela: 0       },
  { ate: 1000,       aliquota: 0.40, parcela: 50      },
  { ate: 5000,       aliquota: 0.30, parcela: 150     },
  { ate: 10000,      aliquota: 0.20, parcela: 650     },
  { ate: 15000,      aliquota: 0.15, parcela: 1150    },
  { ate: 20000,      aliquota: 0.10, parcela: 1900    },
  { ate: null,       aliquota: 0.05, parcela: 2900    },
]

export function calcularFGTS(params: FGTSParams): ResultadoOuErro<FGTSResultado> {
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)
  if (params.mesesTrabalhados < 0)
    erros.push({ campo: "mesesTrabalhados", mensagem: "Meses trabalhados não pode ser negativo" })
  if (erros.length > 0) return { sucesso: false, erros }

  const depositoMensal = arredondar(params.salarioBruto * 0.08)
  const depositosNoPeriodo = arredondar(depositoMensal * params.mesesTrabalhados)
  const saldoAtual = params.saldoAtual ?? 0
  const saldoProjetado = arredondar(saldoAtual + depositosNoPeriodo)

  const multaRescisoria40 = arredondar(saldoProjetado * 0.40)
  const multaRescisoria20 = arredondar(saldoProjetado * 0.20)

  let saqueAniversarioValor: number | undefined
  let saqueAniversarioAliquota: number | undefined

  if (params.modalidade === "saque_aniversario" && saldoAtual > 0) {
    const faixa = TABELA_SAQUE_ANIVERSARIO.find(
      (f) => saldoAtual <= (f.ate ?? Infinity),
    )!
    saqueAniversarioAliquota = faixa.aliquota
    saqueAniversarioValor = arredondar(saldoAtual * faixa.aliquota + faixa.parcela)
  }

  return {
    sucesso: true,
    dados: {
      resultado: depositoMensal,
      detalhamento: [
        { descricao: "Depósito Mensal (8%)",       valor: depositoMensal,      tipo: "credito",
          formula: `R$ ${params.salarioBruto.toFixed(2)} × 8%` },
        { descricao: `Depósitos em ${params.mesesTrabalhados} meses`, valor: depositosNoPeriodo, tipo: "credito" },
        { descricao: "Saldo Projetado",             valor: saldoProjetado,      tipo: "credito" },
        { descricao: "Multa Rescisória 40%",        valor: multaRescisoria40,   tipo: "neutro" },
        { descricao: "Multa Rescisória 20% (acordo mútuo)", valor: multaRescisoria20, tipo: "neutro" },
        ...(saqueAniversarioValor !== undefined ? [{
          descricao: `Saque-Aniversário (${(saqueAniversarioAliquota! * 100).toFixed(0)}%)`,
          valor: saqueAniversarioValor, tipo: "credito" as const,
        }] : []),
      ],
      baseCalculo: "8% sobre salário bruto por competência (não incide sobre INSS/IRRF)",
      fonteJuridica: "Lei 8.036/1990 | Lei 13.932/2019 (Saque-Aniversário)",
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: { depositoMensal, saldoProjetado, multaRescisoria40, multaRescisoria20,
               saqueAniversarioValor, saqueAniversarioAliquota },
    },
  }
}
```

**Testes obrigatórios:**
- Depósito mensal = 8% do salário bruto
- Saldo projetado = saldo atual + depósitos no período
- Multa 40% e 20% sobre o saldo projetado
- Saque-aniversário: cada faixa da tabela (testar 6 valores distintos)
- Erro quando salário é zero ou negativo

---

## GRUPO B — IMPOSTOS (4 calculadoras)

### calcularINSS — Contribuição Mensal Standalone

Atenção: `calcularINSSProgressivo` já existe como helper interno. Esta função é a versão pública standalone com interface completa e suporte a autônomo/MEI.

```typescript
// packages/core/src/impostos/inss.ts

export type CategoriaINSS =
  | "empregado"         // tabela progressiva Dec. 11.936/2024
  | "autonomo"          // 20% sobre o salário-base (contribuinte individual)
  | "facultativo"       // mesmo que autônomo
  | "mei"               // R$75,60 fixo/mês (5% do SM) em 2026

export interface INSSParams {
  salarioBruto: number
  categoria: CategoriaINSS
}

export interface INSSResultado {
  contribuicao: number
  aliquotaEfetiva: number
  categoria: CategoriaINSS
  teto: boolean  // se atingiu o teto do INSS (R$8.157,41 em 2026)
}

const TETO_INSS_2026 = 8157.41
const CONTRIBUICAO_MEI_2026 = 75.60   // 5% do SM

export function calcularINSS(params: INSSParams): ResultadoOuErro<INSSResultado> {
  const erros: ErroValidacao[] = []
  if (params.categoria !== "mei") {
    const erroSalario = validarSalario(params.salarioBruto)
    if (erroSalario) erros.push(erroSalario)
  }
  if (erros.length > 0) return { sucesso: false, erros }

  let contribuicao: number
  let fonteJuridica: string
  let formula: string

  if (params.categoria === "mei") {
    contribuicao = CONTRIBUICAO_MEI_2026
    fonteJuridica = "LC 123/2006 | Resolução CGSN 140/2018"
    formula = `5% × R$ ${getTabelasVigentes().salarioMinimo.toFixed(2)} (SM 2026)`
  } else if (params.categoria === "empregado") {
    const { valorINSS } = calcularINSSProgressivo(
      Math.min(params.salarioBruto, TETO_INSS_2026),
    )
    contribuicao = valorINSS
    fonteJuridica = "Decreto 11.936/2024"
    formula = "Tabela progressiva por faixa salarial"
  } else {
    // Autônomo/facultativo: 20% sobre salário-base, respeitando teto
    const base = Math.min(params.salarioBruto, TETO_INSS_2026)
    contribuicao = arredondar(base * 0.20)
    fonteJuridica = "Lei 8.212/1991 art. 21 | IN RFB 2.110/2022"
    formula = `20% × R$ ${base.toFixed(2)}`
  }

  const aliquotaEfetiva = params.categoria === "mei"
    ? 0.05
    : arredondar(contribuicao / params.salarioBruto)

  return {
    sucesso: true,
    dados: {
      resultado: contribuicao,
      detalhamento: [
        { descricao: `Salário Base`, valor: params.categoria === "mei" ? getTabelasVigentes().salarioMinimo : params.salarioBruto, tipo: "neutro" },
        { descricao: `INSS (${params.categoria})`, valor: contribuicao, tipo: "debito", formula },
        { descricao: `Alíquota efetiva`, valor: aliquotaEfetiva * 100, tipo: "neutro" },
      ],
      baseCalculo: formula,
      fonteJuridica,
      dataReferencia: getTabelasVigentes().vigenciaInicio,
      dados: {
        contribuicao,
        aliquotaEfetiva,
        categoria: params.categoria,
        teto: params.salarioBruto >= TETO_INSS_2026,
      },
    },
  }
}
```

---

### calcularIRRF — Retenção na Fonte (standalone completo)

```typescript
// packages/core/src/impostos/irrf.ts

export interface IRRFParams {
  salarioBruto: number
  numeroDependentes: number
  descontoINSS?: number           // se não informado, calcula automaticamente
  pensaoAlimenticia?: number      // dedução integral da base IRRF
  outrasDeducoes?: number
}

export interface IRRFResultado {
  baseCalculo: number
  aliquota: number
  deducaoParcela: number
  deducaoDependentes: number
  irrf: number
  isento: boolean
}

export function calcularIRRF(params: IRRFParams): ResultadoOuErro<IRRFResultado> {
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)
  if (params.numeroDependentes < 0)
    erros.push({ campo: "numeroDependentes", mensagem: "Dependentes não pode ser negativo" })
  if (erros.length > 0) return { sucesso: false, erros }

  const inss = params.descontoINSS ?? calcularINSSProgressivo(params.salarioBruto).valorINSS
  const tabelas = getTabelasVigentes()
  const deducaoDep = params.numeroDependentes * tabelas.deducaoDependenteIRRF
  const baseCalculo = Math.max(
    0,
    params.salarioBruto - inss - deducaoDep
      - (params.pensaoAlimenticia ?? 0)
      - (params.outrasDeducoes ?? 0),
  )

  const faixa = tabelas.irrf.find((f) => baseCalculo <= (f.ate ?? Infinity))
    ?? tabelas.irrf.at(-1)!
  const irrf = Math.max(0, arredondar(baseCalculo * faixa.aliquota - faixa.deducao))
  const isento = irrf === 0

  return {
    sucesso: true,
    dados: {
      resultado: irrf,
      detalhamento: [
        { descricao: "Salário Bruto",              valor: params.salarioBruto, tipo: "neutro" },
        { descricao: "(-) INSS",                   valor: inss,                tipo: "debito" },
        { descricao: `(-) Dependentes (${params.numeroDependentes} × R$ ${tabelas.deducaoDependenteIRRF.toFixed(2)})`,
          valor: deducaoDep, tipo: "debito" },
        ...(params.pensaoAlimenticia ? [{ descricao: "(-) Pensão Alimentícia", valor: params.pensaoAlimenticia, tipo: "debito" as const }] : []),
        { descricao: "Base de Cálculo IRRF",       valor: baseCalculo,         tipo: "neutro" },
        { descricao: `Alíquota ${(faixa.aliquota * 100).toFixed(1)}%`,
          valor: arredondar(baseCalculo * faixa.aliquota), tipo: "debito" },
        { descricao: "(-) Parcela a Deduzir",      valor: faixa.deducao,       tipo: "credito" },
        { descricao: isento ? "IRRF (Isento)" : "IRRF",  valor: irrf,          tipo: "debito" },
      ],
      baseCalculo: `Bruto − INSS − Dependentes − outras deduções`,
      fonteJuridica: "RIR/2018 (Decreto 9.580/2018) | Lei 11.482/2007",
      dataReferencia: tabelas.vigenciaInicio,
      dados: { baseCalculo, aliquota: faixa.aliquota, deducaoParcela: faixa.deducao, deducaoDependentes: deducaoDep, irrf, isento },
    },
  }
}
```

---

### calcularIRPF — Declaração Anual (simplificada vs. completa)

```typescript
// packages/core/src/impostos/irpf.ts

export interface IRPFParams {
  rendimentosTributaveis: number     // total anual
  rendimentosIsentos?: number
  irrfRetidoFonte: number            // total já descontado no ano
  numeroDependentes: number
  despesasMedicas?: number           // dedução integral
  despesasEducacao?: number          // dedutível até R$3.561,50/ano por pessoa (2026)
  contribuicaoINSS?: number          // total anual pago
  pensaoAlimenticia?: number
  contribuicaoPrevidenciaPrivada?: number  // PGBL: até 12% dos rendimentos
}

export interface IRPFResultado {
  modeloIndicado: "simplificado" | "completo"
  // Modelo Simplificado
  deducaoSimplificada: number        // 20% dos rendimentos, max R$16.754,34 (2026)
  impostoDevolvidoSimplificado: number
  // Modelo Completo
  totalDeducoesCompleto: number
  impostoDevidoCompleto: number
  impostoDevolvidoCompleto: number
  // Recomendação
  diferencaEntreModelos: number      // positivo = completo é melhor
}

const DEDUCAO_SIMPLIFICADA_MAX_2026 = 16754.34
const DEDUCAO_SIMPLIFICADA_PERC = 0.20
const DEDUCAO_EDUCACAO_MAX_2026 = 3561.50

export function calcularIRPF(params: IRPFParams): ResultadoOuErro<IRPFResultado> {
  const erros: ErroValidacao[] = []
  if (params.rendimentosTributaveis < 0)
    erros.push({ campo: "rendimentosTributaveis", mensagem: "Rendimentos não podem ser negativos" })
  if (erros.length > 0) return { sucesso: false, erros }

  const tabelas = getTabelasVigentes()

  // --- Modelo Simplificado ---
  const deducaoSimplificada = Math.min(
    params.rendimentosTributaveis * DEDUCAO_SIMPLIFICADA_PERC,
    DEDUCAO_SIMPLIFICADA_MAX_2026,
  )
  const baseSimplificada = Math.max(0, params.rendimentosTributaveis - deducaoSimplificada)
  const impostoSimplificado = calcularImpostoAnual(baseSimplificada, tabelas)
  const impostoDevolvidoSimplificado = arredondar(params.irrfRetidoFonte - impostoSimplificado)

  // --- Modelo Completo ---
  const deducaoDependentes = params.numeroDependentes * tabelas.deducaoDependenteIRRF * 12
  const deducaoEducacao = Math.min(params.despesasEducacao ?? 0, DEDUCAO_EDUCACAO_MAX_2026 * (params.numeroDependentes + 1))
  const totalDeducoesCompleto = arredondar(
    (params.contribuicaoINSS ?? 0)
    + deducaoDependentes
    + (params.despesasMedicas ?? 0)
    + deducaoEducacao
    + (params.pensaoAlimenticia ?? 0)
    + (params.contribuicaoPrevidenciaPrivada ?? 0),
  )
  const baseCompleta = Math.max(0, params.rendimentosTributaveis - totalDeducoesCompleto)
  const impostoCompleto = calcularImpostoAnual(baseCompleta, tabelas)
  const impostoDevolvidoCompleto = arredondar(params.irrfRetidoFonte - impostoCompleto)

  const modeloIndicado = impostoDevolvidoCompleto >= impostoDevolvidoSimplificado
    ? "completo"
    : "simplificado"

  return {
    sucesso: true,
    dados: {
      resultado: Math.max(impostoDevolvidoSimplificado, impostoDevolvidoCompleto),
      detalhamento: [
        { descricao: "Rendimentos Tributáveis (anual)", valor: params.rendimentosTributaveis, tipo: "neutro" },
        { descricao: "IRRF Retido na Fonte",            valor: params.irrfRetidoFonte,        tipo: "credito" },
        { descricao: "Simplificado — Dedução 20%",      valor: deducaoSimplificada,           tipo: "neutro" },
        { descricao: "Simplificado — Imposto Devido",   valor: impostoSimplificado,           tipo: "debito" },
        { descricao: "Simplificado — Restituição",      valor: impostoDevolvidoSimplificado,  tipo: modeloIndicado === "simplificado" ? "credito" : "neutro" },
        { descricao: "Completo — Total Deduções",       valor: totalDeducoesCompleto,         tipo: "neutro" },
        { descricao: "Completo — Imposto Devido",       valor: impostoCompleto,               tipo: "debito" },
        { descricao: "Completo — Restituição",          valor: impostoDevolvidoCompleto,      tipo: modeloIndicado === "completo" ? "credito" : "neutro" },
        { descricao: `Modelo indicado: ${modeloIndicado.toUpperCase()}`, valor: 0, tipo: "neutro" },
      ],
      baseCalculo: `Rendimentos tributáveis − deduções → tabela progressiva anual`,
      fonteJuridica: "Lei 9.250/1995 | RIR/2018 | IN RFB 2.178/2024",
      dataReferencia: tabelas.vigenciaInicio,
      dados: { modeloIndicado, deducaoSimplificada, impostoDevolvidoSimplificado,
               totalDeducoesCompleto, impostoDevidoCompleto: impostoCompleto,
               impostoDevolvidoCompleto, diferencaEntreModelos: impostoDevolvidoCompleto - impostoDevolvidoSimplificado },
    },
  }
}

function calcularImpostoAnual(base: number, tabelas: TabelasLegislativas): number {
  // Tabela anual = tabela mensal × 12
  for (const faixa of [...tabelas.irrf].reverse()) {
    const limiteAnual = faixa.ate ? faixa.ate * 12 : Infinity
    if (base >= faixa.de * 12) {
      return Math.max(0, arredondar(base * faixa.aliquota - faixa.deducao * 12))
    }
  }
  return 0
}
```

---

### calcularDASMEI — Documento de Arrecadação Simplificada

```typescript
// packages/core/src/impostos/das-mei.ts

export type AtividadeMEI = "comercio" | "industria" | "servico" | "comercio_servico"

export interface DASMEIParams {
  atividadePrincipal: AtividadeMEI
  /** Faturamento anual para verificar se permanece no limite MEI */
  faturamentoAnual?: number
}

export interface DASMEIResultado {
  inss: number          // 5% do SM = R$75,60 em 2026
  icms: number          // R$1,00 — apenas comércio/indústria
  iss: number           // R$5,00 — apenas serviços
  total: number
  dentro_limite: boolean // faturamento dentro do teto MEI (R$81.000/ano)
  teto_anual: number
  teto_mensal: number
}

const TETO_MEI_ANUAL = 81000
const ICMS_FIXO = 1.00
const ISS_FIXO = 5.00

export function calcularDASMEI(params: DASMEIParams): ResultadoOuErro<DASMEIResultado> {
  const sm = getTabelasVigentes().salarioMinimo
  const inss = arredondar(sm * 0.05)
  let icms = 0, iss = 0

  if (params.atividadePrincipal === "comercio" || params.atividadePrincipal === "industria") icms = ICMS_FIXO
  if (params.atividadePrincipal === "servico") iss = ISS_FIXO
  if (params.atividadePrincipal === "comercio_servico") { icms = ICMS_FIXO; iss = ISS_FIXO }

  const total = arredondar(inss + icms + iss)
  const dentro_limite = !params.faturamentoAnual || params.faturamentoAnual <= TETO_MEI_ANUAL

  return {
    sucesso: true,
    dados: {
      resultado: total,
      detalhamento: [
        { descricao: "INSS (5% do Salário Mínimo)", valor: inss,  tipo: "debito",
          formula: `5% × R$ ${sm.toFixed(2)}` },
        ...(icms > 0 ? [{ descricao: "ICMS (fixo)", valor: icms, tipo: "debito" as const }] : []),
        ...(iss  > 0 ? [{ descricao: "ISS (fixo)",  valor: iss,  tipo: "debito" as const }] : []),
        { descricao: "Total DAS mensal",             valor: total, tipo: "debito" },
        { descricao: "Teto anual MEI",               valor: TETO_MEI_ANUAL, tipo: "neutro" },
      ],
      baseCalculo: `INSS 5% SM + ICMS R$1 (comércio/indústria) + ISS R$5 (serviços)`,
      fonteJuridica: "LC 123/2006 art. 18-A | Resolução CGSN 140/2018",
      dataReferencia: getTabelasVigentes().vigenciaInicio,
      dados: { inss, icms, iss, total, dentro_limite, teto_anual: TETO_MEI_ANUAL, teto_mensal: TETO_MEI_ANUAL / 12 },
    },
  }
}
```

---

## GRUPO C — FINANCEIRAS (4 calculadoras)

### calcularPorcentagem — 6 tipos de cálculo

```typescript
// packages/core/src/financeiro/porcentagem.ts

export type TipoPorcentagem =
  | "percentual_de"         // Quanto % X é de Y?
  | "valor_de_percent"      // Quanto é X% de Y?
  | "variacao_percentual"   // Variação de X para Y em %
  | "valor_acrescimo"       // Y + X% = ?
  | "valor_desconto"        // Y - X% = ?
  | "porcentagem_inversa"   // X é Y% de quanto?

export interface PorcentagemParams {
  tipo: TipoPorcentagem
  valorA: number   // primeiro valor
  valorB: number   // segundo valor (percentual ou base, conforme o tipo)
}

export function calcularPorcentagem(params: PorcentagemParams): ResultadoOuErro<{
  resultado: number
  formula: string
  descricao: string
}> {
  const erros: ErroValidacao[] = []
  if (!Number.isFinite(params.valorA)) erros.push({ campo: "valorA", mensagem: "Valor A inválido" })
  if (!Number.isFinite(params.valorB)) erros.push({ campo: "valorB", mensagem: "Valor B inválido" })
  if (erros.length > 0) return { sucesso: false, erros }

  let resultado: number, formula: string, descricao: string

  switch (params.tipo) {
    case "percentual_de":
      if (params.valorB === 0) return { sucesso: false, erros: [{ campo: "valorB", mensagem: "Divisor não pode ser zero" }] }
      resultado = arredondar((params.valorA / params.valorB) * 100)
      formula = `(${params.valorA} ÷ ${params.valorB}) × 100`
      descricao = `${params.valorA} é ${resultado}% de ${params.valorB}`
      break
    case "valor_de_percent":
      resultado = arredondar((params.valorB / 100) * params.valorA)
      formula = `${params.valorB}% × ${params.valorA}`
      descricao = `${params.valorB}% de ${params.valorA} = ${resultado}`
      break
    case "variacao_percentual":
      if (params.valorA === 0) return { sucesso: false, erros: [{ campo: "valorA", mensagem: "Valor inicial não pode ser zero" }] }
      resultado = arredondar(((params.valorB - params.valorA) / params.valorA) * 100)
      formula = `((${params.valorB} − ${params.valorA}) ÷ ${params.valorA}) × 100`
      descricao = `Variação de ${params.valorA} para ${params.valorB}: ${resultado > 0 ? "+" : ""}${resultado}%`
      break
    case "valor_acrescimo":
      resultado = arredondar(params.valorA * (1 + params.valorB / 100))
      formula = `${params.valorA} × (1 + ${params.valorB}%)`
      descricao = `${params.valorA} com acréscimo de ${params.valorB}% = ${resultado}`
      break
    case "valor_desconto":
      resultado = arredondar(params.valorA * (1 - params.valorB / 100))
      formula = `${params.valorA} × (1 − ${params.valorB}%)`
      descricao = `${params.valorA} com desconto de ${params.valorB}% = ${resultado}`
      break
    case "porcentagem_inversa":
      if (params.valorB === 0) return { sucesso: false, erros: [{ campo: "valorB", mensagem: "Percentual não pode ser zero" }] }
      resultado = arredondar((params.valorA / params.valorB) * 100)
      formula = `${params.valorA} ÷ (${params.valorB}% / 100)`
      descricao = `${params.valorA} é ${params.valorB}% de ${resultado}`
      break
  }

  return {
    sucesso: true,
    dados: {
      resultado,
      detalhamento: [
        { descricao, valor: resultado, tipo: "neutro", formula },
      ],
      baseCalculo: formula,
      fonteJuridica: "Matemática básica",
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: { resultado, formula, descricao },
    },
  }
}
```

---

### calcularJurosCompostos — com suporte a aportes mensais

```typescript
// packages/core/src/financeiro/juros-compostos.ts

export type PeriodoTaxa = "mensal" | "anual" | "diario"

export interface JurosCompostosParams {
  principal: number            // capital inicial
  taxaJuros: number            // ex: 0.01 = 1% ao mês
  periodoTaxa: PeriodoTaxa
  prazoMeses: number
  aporteMensal?: number        // contribuição mensal adicional
}

export interface JurosCompostosResultado {
  montanteFinal: number
  jurosAcumulados: number
  totalAportado: number
  evolucaoAnual: Array<{ ano: number; saldo: number; juros: number; aportes: number }>
}

export function calcularJurosCompostos(
  params: JurosCompostosParams,
): ResultadoOuErro<JurosCompostosResultado> {
  const erros: ErroValidacao[] = []
  if (params.principal < 0) erros.push({ campo: "principal", mensagem: "Capital não pode ser negativo" })
  if (params.taxaJuros <= 0 || params.taxaJuros > 10) erros.push({ campo: "taxaJuros", mensagem: "Taxa inválida" })
  if (params.prazoMeses <= 0) erros.push({ campo: "prazoMeses", mensagem: "Prazo deve ser maior que zero" })
  if (erros.length > 0) return { sucesso: false, erros }

  // Converter taxa para mensal
  let taxaMensal: number
  if (params.periodoTaxa === "mensal") {
    taxaMensal = params.taxaJuros
  } else if (params.periodoTaxa === "anual") {
    taxaMensal = Math.pow(1 + params.taxaJuros, 1 / 12) - 1
  } else {
    taxaMensal = Math.pow(1 + params.taxaJuros, 30) - 1
  }

  const aporte = params.aporteMensal ?? 0
  let saldo = params.principal
  let totalAportado = params.principal
  const evolucaoAnual = []

  for (let mes = 1; mes <= params.prazoMeses; mes++) {
    saldo = arredondar(saldo * (1 + taxaMensal) + aporte)
    totalAportado += aporte
    if (mes % 12 === 0 || mes === params.prazoMeses) {
      evolucaoAnual.push({
        ano: Math.ceil(mes / 12),
        saldo,
        juros: arredondar(saldo - totalAportado),
        aportes: totalAportado,
      })
    }
  }

  const jurosAcumulados = arredondar(saldo - totalAportado)

  return {
    sucesso: true,
    dados: {
      resultado: saldo,
      detalhamento: [
        { descricao: "Capital Inicial",     valor: params.principal, tipo: "credito" },
        { descricao: `Aportes Mensais (${params.prazoMeses}×)`, valor: aporte * params.prazoMeses, tipo: "credito" },
        { descricao: "Juros Acumulados",    valor: jurosAcumulados,  tipo: "credito",
          formula: `M = P×(1+i)^n + PMT×((1+i)^n − 1)/i` },
        { descricao: "Montante Final",      valor: saldo,            tipo: "credito" },
      ],
      baseCalculo: `M = P(1+i)^n + PMT×((1+i)^n−1)/i | i = ${(taxaMensal * 100).toFixed(4)}%/mês`,
      fonteJuridica: "Matemática financeira",
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: { montanteFinal: saldo, jurosAcumulados, totalAportado, evolucaoAnual },
    },
  }
}
```

---

### calcularEmprestimo e calcularFinanciamento — Tabela Price e SAC

```typescript
// packages/core/src/financeiro/amortizacao.ts

export type SistemaAmortizacao = "price" | "sac" | "sam"

export interface AmortizacaoParams {
  valorFinanciado: number
  taxaMensalJuros: number      // ex: 0.015 = 1,5% a.m.
  prazoMeses: number
  sistema: SistemaAmortizacao
  /** Para empréstimos: inclui seguro (MIP+DFI) como % do saldo devedor/mês */
  taxaSeguroMensal?: number
}

export interface ParcelaAmortizacao {
  numero: number
  parcela: number
  amortizacao: number
  juros: number
  seguro: number
  saldoDevedor: number
}

export interface AmortizacaoResultado {
  primeiraParcela: number
  ultimaParcela: number
  totalPago: number
  totalJuros: number
  totalSeguro: number
  cet: number                     // Custo Efetivo Total (anual)
  tabela: ParcelaAmortizacao[]    // todas as parcelas
}

export function calcularAmortizacao(
  params: AmortizacaoParams,
): ResultadoOuErro<AmortizacaoResultado> {
  const erros: ErroValidacao[] = []
  if (params.valorFinanciado <= 0) erros.push({ campo: "valorFinanciado", mensagem: "Valor financiado deve ser maior que zero" })
  if (params.taxaMensalJuros <= 0) erros.push({ campo: "taxaMensalJuros", mensagem: "Taxa deve ser maior que zero" })
  if (params.prazoMeses <= 0) erros.push({ campo: "prazoMeses", mensagem: "Prazo deve ser maior que zero" })
  if (erros.length > 0) return { sucesso: false, erros }

  const i = params.taxaMensalJuros
  const n = params.prazoMeses
  const PV = params.valorFinanciado
  const segTaxa = params.taxaSeguroMensal ?? 0
  const tabela: ParcelaAmortizacao[] = []

  let totalPago = 0, totalJuros = 0, totalSeguro = 0

  if (params.sistema === "price") {
    // Fórmula Price: PMT = PV × i × (1+i)^n / ((1+i)^n − 1)
    const fator = Math.pow(1 + i, n)
    const pmt = arredondar((PV * i * fator) / (fator - 1))
    let saldo = PV

    for (let k = 1; k <= n; k++) {
      const juros = arredondar(saldo * i)
      const amortizacao = arredondar(pmt - juros)
      const seguro = arredondar(saldo * segTaxa)
      saldo = arredondar(saldo - amortizacao)
      const parcela = arredondar(pmt + seguro)

      tabela.push({ numero: k, parcela, amortizacao, juros, seguro, saldoDevedor: Math.max(0, saldo) })
      totalPago += parcela; totalJuros += juros; totalSeguro += seguro
    }
  } else {
    // SAC: amortização fixa = PV / n
    const amortizacaoFixa = arredondar(PV / n)
    let saldo = PV

    for (let k = 1; k <= n; k++) {
      const juros = arredondar(saldo * i)
      const seguro = arredondar(saldo * segTaxa)
      const parcela = arredondar(amortizacaoFixa + juros + seguro)
      saldo = arredondar(saldo - amortizacaoFixa)

      tabela.push({ numero: k, parcela, amortizacao: amortizacaoFixa, juros, seguro, saldoDevedor: Math.max(0, saldo) })
      totalPago += parcela; totalJuros += juros; totalSeguro += seguro
    }
  }

  // CET anual aproximado (pela TIR mensal × 12)
  const cetMensal = (totalPago / PV - 1) / n
  const cet = arredondar(Math.pow(1 + cetMensal, 12) - 1)

  return {
    sucesso: true,
    dados: {
      resultado: totalPago,
      detalhamento: [
        { descricao: "Valor Financiado",    valor: PV,           tipo: "neutro" },
        { descricao: "Total de Juros",      valor: arredondar(totalJuros),  tipo: "debito" },
        { descricao: "Total de Seguros",    valor: arredondar(totalSeguro), tipo: "debito" },
        { descricao: "Total Pago",          valor: arredondar(totalPago),   tipo: "debito" },
        { descricao: `1ª Parcela`,          valor: tabela[0]!.parcela,      tipo: "neutro" },
        { descricao: `Última Parcela`,      valor: tabela.at(-1)!.parcela,  tipo: "neutro" },
        { descricao: `CET anual`,           valor: cet * 100,               tipo: "neutro",
          formula: `${(cet * 100).toFixed(2)}% a.a.` },
      ],
      baseCalculo: params.sistema === "price"
        ? "PMT = PV × i × (1+i)^n / ((1+i)^n − 1)"
        : "Amortização = PV / n | Parcela crescente até mês 1",
      fonteJuridica: "Res. CMN 3.517/2007 (CET) | Circular BCB 2.905/1999",
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: {
        primeiraParcela: tabela[0]!.parcela,
        ultimaParcela: tabela.at(-1)!.parcela,
        totalPago: arredondar(totalPago),
        totalJuros: arredondar(totalJuros),
        totalSeguro: arredondar(totalSeguro),
        cet,
        tabela,
      },
    },
  }
}

// Aliases com nomes amigáveis
export const calcularEmprestimo = calcularAmortizacao
export const calcularFinanciamento = calcularAmortizacao
```

---

## GRUPO D — INVESTIMENTOS (3 calculadoras)

### calcularCDB

```typescript
// packages/core/src/investimentos/cdb.ts

export type TipoCDB = "cdi" | "prefixado" | "ipca_mais"
export type PrazoIR = "ate180" | "181_360" | "361_720" | "acima720"

// Tabela IR regressivo (Lei 11.033/2004)
const ALIQUOTAS_IR: Record<PrazoIR, number> = {
  ate180:   0.225,
  "181_360": 0.20,
  "361_720": 0.175,
  acima720: 0.15,
}

function getPrazoIR(dias: number): PrazoIR {
  if (dias <= 180) return "ate180"
  if (dias <= 360) return "181_360"
  if (dias <= 720) return "361_720"
  return "acima720"
}

export interface CDBParams {
  valorInicial: number
  taxaAnual: number           // ex: 0.12 = 12% a.a. (prefixado) | 1.10 = 110% CDI
  tipo: TipoCDB
  prazoMeses: number
  /** CDI atual anualizado (necessário para tipo "cdi") */
  cdiAnual?: number
  /** IPCA acumulado 12 meses (necessário para tipo "ipca_mais") */
  ipcaAnual?: number
}

export function calcularCDB(params: CDBParams): ResultadoOuErro<{
  montanteBruto: number
  ir: number
  iof: number
  montanteLiquido: number
  rentabilidadeLiquida: number
  aliquotaIR: number
}> {
  const erros: ErroValidacao[] = []
  if (params.valorInicial <= 0) erros.push({ campo: "valorInicial", mensagem: "Valor inicial deve ser positivo" })
  if (erros.length > 0) return { sucesso: false, erros }

  let taxaAnualEfetiva: number
  if (params.tipo === "cdi") {
    const cdi = params.cdiAnual ?? 0.1065  // CDI referência 2026
    taxaAnualEfetiva = cdi * params.taxaAnual  // taxaAnual aqui é o % do CDI (ex: 1.10 = 110%)
  } else if (params.tipo === "ipca_mais") {
    const ipca = params.ipcaAnual ?? 0.0450  // IPCA referência 2026
    taxaAnualEfetiva = (1 + ipca) * (1 + params.taxaAnual) - 1
  } else {
    taxaAnualEfetiva = params.taxaAnual
  }

  const taxaMensal = Math.pow(1 + taxaAnualEfetiva, 1 / 12) - 1
  const montanteBruto = arredondar(params.valorInicial * Math.pow(1 + taxaMensal, params.prazoMeses))
  const rendimentoBruto = arredondar(montanteBruto - params.valorInicial)
  const dias = params.prazoMeses * 30

  // IOF (apenas primeiros 29 dias) — tabela regressiva
  const iof = dias < 30 ? arredondar(rendimentoBruto * Math.max(0, (30 - dias) / 30) * 0.96) : 0
  const rendimentoAposIOF = arredondar(rendimentoBruto - iof)

  // IR sobre rendimento líquido de IOF
  const prazoIR = getPrazoIR(dias)
  const aliquotaIR = ALIQUOTAS_IR[prazoIR]
  const ir = arredondar(rendimentoAposIOF * aliquotaIR)
  const montanteLiquido = arredondar(params.valorInicial + rendimentoAposIOF - ir)
  const rentabilidadeLiquida = arredondar((montanteLiquido / params.valorInicial - 1) * 100)

  return {
    sucesso: true,
    dados: {
      resultado: montanteLiquido,
      detalhamento: [
        { descricao: "Capital Inicial",          valor: params.valorInicial,  tipo: "neutro" },
        { descricao: "Montante Bruto",           valor: montanteBruto,        tipo: "credito" },
        { descricao: "Rendimento Bruto",         valor: rendimentoBruto,      tipo: "credito" },
        { descricao: "(-) IOF",                  valor: iof,                  tipo: "debito" },
        { descricao: `(-) IR ${(aliquotaIR * 100).toFixed(1)}% (${prazoIR})`, valor: ir, tipo: "debito" },
        { descricao: "Montante Líquido",         valor: montanteLiquido,      tipo: "credito" },
        { descricao: `Rentabilidade Líquida`,    valor: rentabilidadeLiquida, tipo: "neutro",
          formula: `${rentabilidadeLiquida.toFixed(2)}%` },
      ],
      baseCalculo: `Taxa efetiva anual: ${(taxaAnualEfetiva * 100).toFixed(2)}% a.a.`,
      fonteJuridica: "Lei 11.033/2004 (IR regressivo) | Decreto 6.306/2007 (IOF)",
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: { montanteBruto, ir, iof, montanteLiquido, rentabilidadeLiquida, aliquotaIR },
    },
  }
}
```

---

### calcularPoupanca e calcularTesouroDireto

Implemente seguindo o mesmo padrão `ResultadoOuErro<T>`:

**calcularPoupanca:**
- Regra: se SELIC > 8,5% a.a. → 0,5% a.m. + TR; se SELIC ≤ 8,5% → 70% da SELIC
- SELIC referência 2026: 13,25% a.a. → regra antiga: 0,5%/mês + TR
- Isento de IR para pessoa física
- Campos: `valorInicial`, `prazoMeses`, `aporteMensal?`, `selicAnual?`

**calcularTesouroDireto:**
- Tipos: `"prefixado"` | `"selic"` | `"ipca_plus"` | `"prefixado_cupom"` | `"ipca_cupom"`
- IR regressivo igual ao CDB (tabela Lei 11.033/2004)
- Taxa de custódia B3: 0,20% a.a. (isenta até R$10.000 no Tesouro SELIC)
- Campos: `valorInicial`, `tipo`, `taxaAnual`, `prazoMeses`, `ipcaAnual?`, `selicAnual?`

---

## GRUPO E — SAÚDE (2 calculadoras)

### calcularIMC

```typescript
// packages/core/src/saude/imc.ts

export type SexoBiologico = "masculino" | "feminino"

export interface IMCParams {
  peso: number      // kg
  altura: number    // metros
  idade?: number
  sexo?: SexoBiologico
}

export interface IMCResultado {
  imc: number
  classificacao: string
  risco: "muito_baixo" | "baixo" | "moderado" | "alto" | "muito_alto"
  pesoideal: { min: number; max: number }
  pesoParaPerder: number  // negativo = ganhar peso
}

const CLASSIFICACOES_IMC = [
  { ate: 16.0,  label: "Magreza grau III",    risco: "muito_alto" as const },
  { ate: 17.0,  label: "Magreza grau II",     risco: "alto" as const },
  { ate: 18.5,  label: "Magreza grau I",      risco: "moderado" as const },
  { ate: 25.0,  label: "Peso normal",         risco: "muito_baixo" as const },
  { ate: 30.0,  label: "Sobrepeso",           risco: "baixo" as const },
  { ate: 35.0,  label: "Obesidade grau I",    risco: "moderado" as const },
  { ate: 40.0,  label: "Obesidade grau II",   risco: "alto" as const },
  { ate: Infinity,"label": "Obesidade grau III", risco: "muito_alto" as const },
]

export function calcularIMC(params: IMCParams): ResultadoOuErro<IMCResultado> {
  const erros: ErroValidacao[] = []
  if (params.peso <= 0 || params.peso > 500) erros.push({ campo: "peso", mensagem: "Peso inválido (1–500 kg)" })
  if (params.altura <= 0 || params.altura > 3) erros.push({ campo: "altura", mensagem: "Altura inválida (0,5–3,0 m)" })
  if (erros.length > 0) return { sucesso: false, erros }

  const imc = arredondar(params.peso / (params.altura * params.altura))
  const classif = CLASSIFICACOES_IMC.find((c) => imc <= c.ate)!
  const pesoMinIdeal = arredondar(18.5 * params.altura * params.altura)
  const pesoMaxIdeal = arredondar(24.9 * params.altura * params.altura)
  const pesoParaPerder = arredondar(params.peso - pesoMaxIdeal)

  return {
    sucesso: true,
    dados: {
      resultado: imc,
      detalhamento: [
        { descricao: "Peso",              valor: params.peso,          tipo: "neutro" },
        { descricao: "Altura",            valor: params.altura,        tipo: "neutro" },
        { descricao: "IMC",               valor: imc,                  tipo: "neutro",
          formula: `${params.peso} ÷ ${params.altura}²` },
        { descricao: classif.label,       valor: 0,                    tipo: "neutro" },
        { descricao: "Peso ideal (mín)",  valor: pesoMinIdeal,         tipo: "neutro" },
        { descricao: "Peso ideal (máx)",  valor: pesoMaxIdeal,         tipo: "neutro" },
      ],
      baseCalculo: `IMC = peso (kg) ÷ altura² (m)`,
      fonteJuridica: "OMS — World Health Organization (Classificação 1997)",
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: { imc, classificacao: classif.label, risco: classif.risco,
               pesoideal: { min: pesoMinIdeal, max: pesoMaxIdeal }, pesoParaPerder },
    },
  }
}
```

---

### calcularCalorias — Gasto Calórico Diário (TDEE)

```typescript
// packages/core/src/saude/calorias.ts

export type NivelAtividade =
  | "sedentario"        // pouco ou nenhum exercício
  | "leve"              // 1-3 dias/semana
  | "moderado"          // 3-5 dias/semana
  | "intenso"           // 6-7 dias/semana
  | "muito_intenso"     // 2× por dia, trabalho físico pesado

const FATORES_ATIVIDADE: Record<NivelAtividade, number> = {
  sedentario:    1.2,
  leve:          1.375,
  moderado:      1.55,
  intenso:       1.725,
  muito_intenso: 1.9,
}

export interface CaloriasParams {
  peso: number         // kg
  altura: number       // cm (não metros!)
  idade: number
  sexo: SexoBiologico
  nivelAtividade: NivelAtividade
  objetivo: "perda" | "manutencao" | "ganho"
}

export function calcularCalorias(params: CaloriasParams): ResultadoOuErro<{
  tmb: number               // Taxa Metabólica Basal (Mifflin-St Jeor)
  tdee: number              // Gasto Total Diário
  caloriasMeta: number      // conforme objetivo
  macros: { proteinas: number; carboidratos: number; gorduras: number }  // em gramas
}> {
  const erros: ErroValidacao[] = []
  if (params.peso <= 0) erros.push({ campo: "peso", mensagem: "Peso inválido" })
  if (params.altura <= 100 || params.altura > 250) erros.push({ campo: "altura", mensagem: "Altura inválida (100–250 cm)" })
  if (params.idade < 15 || params.idade > 100) erros.push({ campo: "idade", mensagem: "Idade inválida (15–100 anos)" })
  if (erros.length > 0) return { sucesso: false, erros }

  // Mifflin-St Jeor (mais preciso que Harris-Benedict)
  const tmb = params.sexo === "masculino"
    ? arredondar(10 * params.peso + 6.25 * params.altura - 5 * params.idade + 5)
    : arredondar(10 * params.peso + 6.25 * params.altura - 5 * params.idade - 161)

  const fator = FATORES_ATIVIDADE[params.nivelAtividade]
  const tdee = arredondar(tmb * fator)

  const ajuste = params.objetivo === "perda" ? -500 : params.objetivo === "ganho" ? 300 : 0
  const caloriasMeta = tdee + ajuste

  // Macros padrão (proteína: 25%, carbo: 50%, gordura: 25%)
  const macros = {
    proteinas:    arredondar((caloriasMeta * 0.25) / 4),
    carboidratos: arredondar((caloriasMeta * 0.50) / 4),
    gorduras:     arredondar((caloriasMeta * 0.25) / 9),
  }

  return {
    sucesso: true,
    dados: {
      resultado: caloriasMeta,
      detalhamento: [
        { descricao: "TMB (Mifflin-St Jeor)",  valor: tmb,           tipo: "neutro" },
        { descricao: `TDEE (fator ${fator})`,  valor: tdee,          tipo: "neutro" },
        { descricao: `Meta (${params.objetivo})`, valor: caloriasMeta, tipo: "credito" },
        { descricao: "Proteínas",              valor: macros.proteinas, tipo: "neutro", formula: `${macros.proteinas}g` },
        { descricao: "Carboidratos",           valor: macros.carboidratos, tipo: "neutro", formula: `${macros.carboidratos}g` },
        { descricao: "Gorduras",               valor: macros.gorduras,   tipo: "neutro", formula: `${macros.gorduras}g` },
      ],
      baseCalculo: params.sexo === "masculino"
        ? "TMB = 10×peso + 6,25×altura − 5×idade + 5"
        : "TMB = 10×peso + 6,25×altura − 5×idade − 161",
      fonteJuridica: "Mifflin-St Jeor (1990) | OMS Guidelines on Physical Activity",
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: { tmb, tdee, caloriasMeta, macros },
    },
  }
}
```

---

## GRUPO F — NEGÓCIOS (1 calculadora)

### calcularMargemLucro

```typescript
// packages/core/src/negocios/margem-lucro.ts

export interface MargemLucroParams {
  custoTotal: number
  precoVenda?: number      // se informado, calcula margem; senão usa markupPercent
  markupPercent?: number   // se informado, calcula o preço de venda
}

export interface MargemLucroResultado {
  precoVenda: number
  lucro: number
  margemLucro: number     // % sobre preço de venda
  markup: number          // % sobre custo
  pontoEquilibrio?: number // se forem fornecidas outras variáveis
}

export function calcularMargemLucro(
  params: MargemLucroParams,
): ResultadoOuErro<MargemLucroResultado> {
  const erros: ErroValidacao[] = []
  if (params.custoTotal <= 0) erros.push({ campo: "custoTotal", mensagem: "Custo deve ser maior que zero" })
  if (!params.precoVenda && !params.markupPercent)
    erros.push({ campo: "precoVenda", mensagem: "Informe o preço de venda ou o markup desejado" })
  if (erros.length > 0) return { sucesso: false, erros }

  let precoVenda: number, lucro: number, margemLucro: number, markup: number

  if (params.precoVenda) {
    precoVenda = params.precoVenda
    lucro = arredondar(precoVenda - params.custoTotal)
    margemLucro = arredondar((lucro / precoVenda) * 100)
    markup = arredondar((lucro / params.custoTotal) * 100)
  } else {
    markup = params.markupPercent!
    precoVenda = arredondar(params.custoTotal * (1 + markup / 100))
    lucro = arredondar(precoVenda - params.custoTotal)
    margemLucro = arredondar((lucro / precoVenda) * 100)
  }

  return {
    sucesso: true,
    dados: {
      resultado: precoVenda,
      detalhamento: [
        { descricao: "Custo Total",           valor: params.custoTotal, tipo: "debito" },
        { descricao: "Preço de Venda",        valor: precoVenda,        tipo: "credito" },
        { descricao: "Lucro",                 valor: lucro,             tipo: "credito" },
        { descricao: `Margem de Lucro`,       valor: margemLucro,       tipo: "neutro",
          formula: `(Lucro ÷ Preço) × 100 = ${margemLucro.toFixed(2)}%` },
        { descricao: `Markup`,                valor: markup,            tipo: "neutro",
          formula: `(Lucro ÷ Custo) × 100 = ${markup.toFixed(2)}%` },
      ],
      baseCalculo: "Margem = Lucro ÷ Preço | Markup = Lucro ÷ Custo",
      fonteJuridica: "Conceitos de contabilidade de custos",
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: { precoVenda, lucro, margemLucro, markup },
    },
  }
}
```

---

## TAREFA FINAL: Atualizar Exports

### `packages/core/src/index.ts` — adicionar novos exports

```typescript
// Trabalhista
export { calcularFGTS } from "./trabalhista/fgts"

// Impostos
export { calcularINSS } from "./impostos/inss"
export { calcularIRRF } from "./impostos/irrf"
export { calcularIRPF } from "./impostos/irpf"
export { calcularDASMEI } from "./impostos/das-mei"

// Financeiro
export { calcularPorcentagem } from "./financeiro/porcentagem"
export { calcularJurosCompostos } from "./financeiro/juros-compostos"
export { calcularAmortizacao, calcularEmprestimo, calcularFinanciamento } from "./financeiro/amortizacao"

// Investimentos
export { calcularCDB } from "./investimentos/cdb"
export { calcularPoupanca } from "./investimentos/poupanca"
export { calcularTesouroDireto } from "./investimentos/tesouro-direto"

// Saúde
export { calcularIMC } from "./saude/imc"
export { calcularCalorias } from "./saude/calorias"

// Negócios
export { calcularMargemLucro } from "./negocios/margem-lucro"
```

---

## CRITÉRIOS DE ACEITE

```bash
# Todos os 20 exports disponíveis
pnpm --filter @calculosonline/core typecheck

# 100% cobertura
pnpm --filter @calculosonline/core test:coverage

# Zero erros de lint
pnpm --filter @calculosonline/core lint
```

**Checklist de validação cruzada** (comparar com calculadoras online antes de mergear):

| Calculadora | Input de teste | Resultado esperado |
|-------------|---------------|-------------------|
| FGTS        | R$3.000, 24 meses | Depósito R$240/mês, multa 40% = R$2.304 |
| DAS MEI     | Serviço       | Total R$80,60 (75,60 + 5,00) |
| Porcentagem | 300 é X% de 1.200 | 25% |
| Juros comp. | R$10.000, 1%/mês, 12 meses | R$11.268,25 |
| Price 10K   | R$10.000, 1,5%/mês, 24× | 1ª parcela ~R$498 |
| CDB 110% CDI| R$10.000, 365 dias | ~R$11.034 líquido |
| IMC         | 70kg, 1,75m   | IMC 22,9 — Peso Normal |
| Margem      | Custo R$100, markup 50% | Preço R$150, margem 33,33% |

> **Próximo passo:** Sprint 1.2 — criar os componentes React em `packages/ui`.
