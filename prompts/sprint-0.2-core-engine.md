# Prompt de IA — Sprint 0.2: Core Engine TypeScript
**calculosonline.com.br | Fase 0 — Fundação | Dias 5–10**

---

## PRÉ-REQUISITO

A Sprint 0.1 foi concluída. O monorepo está configurado com:
- `packages/core/` com tipos base em `src/types.ts`
- Tabelas INSS/IRRF 2026 em `src/tabelas/index.ts`
- Vitest configurado com threshold de 100% de cobertura

---

## OBJETIVO DA SPRINT 0.2

Implementar as **5 calculadoras trabalhistas prioritárias** no `packages/core` com:

1. Fórmulas baseadas na legislação vigente (CLT + leis complementares)
2. Tipagem TypeScript estrita — interfaces para inputs e outputs
3. 100% de cobertura de testes unitários (linhas, funções, branches)
4. Detalhamento linha a linha do cálculo (para exibir ao usuário)
5. Tabelas legislativas completas com pisos regionais

**Calculadoras desta sprint:**
- `calcularRescisao` — CLT arts. 477–487 + Lei 12.506/2011
- `calcularFerias` — CLT arts. 129–153
- `calcularDecimoTerceiro` — Lei 4.090/1962
- `calcularHoraExtra` — CLT art. 59
- `calcularSalarioLiquido` — INSS (progressivo) + IRRF

---

## PRINCÍPIOS DO CORE ENGINE

**Regra de ouro:** `packages/core` é uma biblioteca TypeScript **pura**.

```
✅ Pode: funções puras, interfaces, enums, cálculos, formatação de números
❌ Não pode: importar React, acessar DOM, fazer fetch, ler processo/env
❌ Não pode: depender de packages/ui ou apps/*
```

**Contrato de toda função de cálculo:**

```typescript
// Toda função segue este padrão:
function calcularXxx(params: XxxParams): ResultadoOuErro<XxxResultado>

// Em caso de sucesso:
{ sucesso: true, dados: { resultado, detalhamento, baseCalculo, fonteJuridica, dataReferencia } }

// Em caso de erro de validação:
{ sucesso: false, erros: [{ campo: "salario", mensagem: "Salário deve ser maior que zero" }] }
```

---

## TAREFA 1: Completar packages/core/src/tabelas/index.ts

Expanda o arquivo de tabelas iniciado na Sprint 0.1 com os dados completos:

### Pisos Regionais por Estado (2026)

```typescript
export interface PisoRegional {
  uf: string
  nome: string
  valor: number
  lei: string
  vigencia: string
}

export const PISOS_REGIONAIS_2026: PisoRegional[] = [
  { uf: "SP", nome: "São Paulo",        valor: 1700.00, lei: "Lei Estadual 17.373/2021",   vigencia: "2026-01-01" },
  { uf: "RJ", nome: "Rio de Janeiro",   valor: 1518.00, lei: "Salário mínimo federal",      vigencia: "2026-01-01" },
  { uf: "MG", nome: "Minas Gerais",     valor: 1518.00, lei: "Salário mínimo federal",      vigencia: "2026-01-01" },
  { uf: "RS", nome: "Rio Grande do Sul",valor: 1636.94, lei: "Lei Estadual 15.567/2021",    vigencia: "2026-01-01" },
  { uf: "SC", nome: "Santa Catarina",   valor: 1518.00, lei: "Salário mínimo federal",      vigencia: "2026-01-01" },
  { uf: "PR", nome: "Paraná",           valor: 1518.00, lei: "Salário mínimo federal",      vigencia: "2026-01-01" },
  { uf: "BA", nome: "Bahia",            valor: 1518.00, lei: "Salário mínimo federal",      vigencia: "2026-01-01" },
  { uf: "PE", nome: "Pernambuco",       valor: 1518.00, lei: "Salário mínimo federal",      vigencia: "2026-01-01" },
  { uf: "CE", nome: "Ceará",            valor: 1518.00, lei: "Salário mínimo federal",      vigencia: "2026-01-01" },
  { uf: "DF", nome: "Distrito Federal", valor: 2824.29, lei: "Lei Distrital 6.983/2021",    vigencia: "2026-01-01" },
  { uf: "GO", nome: "Goiás",            valor: 1518.00, lei: "Salário mínimo federal",      vigencia: "2026-01-01" },
  { uf: "MT", nome: "Mato Grosso",      valor: 1518.00, lei: "Salário mínimo federal",      vigencia: "2026-01-01" },
  { uf: "MS", nome: "Mato Grosso do Sul",valor: 1518.00,"lei": "Salário mínimo federal",   vigencia: "2026-01-01" },
  { uf: "PA", nome: "Pará",             valor: 1518.00, lei: "Salário mínimo federal",      vigencia: "2026-01-01" },
  { uf: "AM", nome: "Amazonas",         valor: 1518.00, lei: "Salário mínimo federal",      vigencia: "2026-01-01" },
]

export function getPisoRegional(uf: string): number {
  const piso = PISOS_REGIONAIS_2026.find((p) => p.uf === uf)
  return piso?.valor ?? TABELAS_2026.salarioMinimo
}
```

### Funções utilitárias de tabela

```typescript
/**
 * Calcula INSS pelo regime progressivo (Dec. 11.936/2024).
 * Cada faixa incide apenas sobre a parcela do salário dentro dela.
 */
export function calcularINSSProgressivo(salarioBruto: number): {
  valorINSS: number
  detalhamento: Array<{ faixa: string; base: number; aliquota: number; valor: number }>
} {
  const tabelas = getTabelasVigentes()
  let totalINSS = 0
  const detalhamento = []

  for (const faixa of tabelas.inss) {
    if (salarioBruto <= 0) break
    const limite = faixa.ate ?? Infinity
    const baseNaFaixa = Math.min(salarioBruto, limite) - faixa.de
    if (baseNaFaixa <= 0) continue

    const valorFaixa = arredondar(baseNaFaixa * faixa.aliquota)
    totalINSS += valorFaixa

    detalhamento.push({
      faixa: `Até R$ ${faixa.ate?.toFixed(2) ?? "teto"}`,
      base: baseNaFaixa,
      aliquota: faixa.aliquota,
      valor: valorFaixa,
    })
  }

  return { valorINSS: arredondar(totalINSS), detalhamento }
}

/**
 * Calcula IRRF pela tabela progressiva.
 * Base de cálculo = salário bruto − INSS − (dependentes × dedução)
 */
export function calcularIRRFMensal(params: {
  salarioBruto: number
  inss: number
  numeroDependentes: number
  outrasDeducoes?: number
}): {
  valorIRRF: number
  baseCalculo: number
  aliquota: number
  deducao: number
} {
  const tabelas = getTabelasVigentes()
  const deducaoDep = params.numeroDependentes * tabelas.deducaoDependenteIRRF
  const baseCalculo = Math.max(
    0,
    params.salarioBruto - params.inss - deducaoDep - (params.outrasDeducoes ?? 0),
  )

  const faixa = tabelas.irrf.find((f) => {
    const limite = f.ate ?? Infinity
    return baseCalculo >= f.de && baseCalculo <= limite
  }) ?? tabelas.irrf[0]!

  if (!faixa || faixa.aliquota === 0) {
    return { valorIRRF: 0, baseCalculo, aliquota: 0, deducao: 0 }
  }

  const valorIRRF = arredondar(baseCalculo * faixa.aliquota - faixa.deducao)
  return {
    valorIRRF: Math.max(0, valorIRRF),
    baseCalculo,
    aliquota: faixa.aliquota,
    deducao: faixa.deducao,
  }
}
```

### Utilitários matemáticos (packages/core/src/utils/index.ts)

```typescript
/** Arredonda para 2 casas decimais (padrão monetário brasileiro) */
export function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}

/**
 * Divide e arredonda corretamente para evitar floating point issues.
 * Ex: 1518 / 30 = 50.60 (não 50.599999...)
 */
export function dividir(dividendo: number, divisor: number): number {
  return arredondar(dividendo / divisor)
}

/** Retorna a quantidade de meses entre duas datas (inclusive) */
export function mesesEntre(inicio: Date, fim: Date): number {
  const anos = fim.getFullYear() - inicio.getFullYear()
  const meses = fim.getMonth() - inicio.getMonth()
  return anos * 12 + meses
}

/** Retorna anos completos trabalhados (para aviso prévio) */
export function anosCompletos(inicio: Date, fim: Date): number {
  const anos = fim.getFullYear() - inicio.getFullYear()
  const mesAjuste =
    fim.getMonth() < inicio.getMonth() ||
    (fim.getMonth() === inicio.getMonth() && fim.getDate() < inicio.getDate())
  return Math.max(0, anos - (mesAjuste ? 1 : 0))
}

/** Dias no mês de uma data específica */
export function diasNoMes(data: Date): number {
  return new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate()
}

/** Valida se salário é positivo e finito */
export function validarSalario(salario: number, campo = "salario"): ErroValidacao | null {
  if (!Number.isFinite(salario) || salario <= 0) {
    return { campo, mensagem: "Salário deve ser um valor positivo" }
  }
  return null
}

/** Formata número como moeda BRL */
export function formatarBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}
```

---

## TAREFA 2: calcularSalarioLiquido

### Base Legal
- INSS progressivo: Decreto 11.936/2024
- IRRF: RIR/2018 (Decreto 9.580/2018), Tabela 2026
- Vale-transporte: Lei 7.418/1985 (desconto máx. 6% do salário)

### Interface

```typescript
// packages/core/src/trabalhista/salario-liquido.ts

export interface SalarioLiquidoParams {
  salarioBruto: number
  numeroDependentesIRRF: number
  /** Plano de saúde, alimentação, etc. — deduzidos antes do IRRF */
  outrasDeducoes?: number
  /** Se true, desconta 6% do salário ou o valor do VT, o menor */
  temValeTransporte?: boolean
  /** Outros descontos que não afetam base IRRF (ex: consignado) */
  outrosDescontos?: number
}

export interface SalarioLiquidoResultado {
  salarioBruto: number
  descontoINSS: number
  descontoIRRF: number
  descontoVT: number
  outrosDescontos: number
  totalDescontos: number
  salarioLiquido: number
  aliquotaEfetivaINSS: number  // % real sobre salário bruto
  aliquotaEfetivaIRRF: number  // % real sobre salário bruto
}
```

### Implementação

```typescript
export function calcularSalarioLiquido(
  params: SalarioLiquidoParams,
): ResultadoOuErro<SalarioLiquidoResultado> {
  // --- Validação ---
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)
  if (params.numeroDependentesIRRF < 0) {
    erros.push({ campo: "numeroDependentesIRRF", mensagem: "Número de dependentes não pode ser negativo" })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  // --- INSS ---
  const { valorINSS, detalhamento: detINSS } = calcularINSSProgressivo(params.salarioBruto)

  // --- IRRF ---
  const { valorIRRF, baseCalculo: baseIRRF, aliquota } = calcularIRRFMensal({
    salarioBruto: params.salarioBruto,
    inss: valorINSS,
    numeroDependentes: params.numeroDependentesIRRF,
    outrasDeducoes: params.outrasDeducoes,
  })

  // --- Vale-transporte ---
  const maxVT = arredondar(params.salarioBruto * 0.06)
  const descontoVT = params.temValeTransporte ? maxVT : 0

  // --- Totais ---
  const outrosDescontos = params.outrosDescontos ?? 0
  const totalDescontos = arredondar(valorINSS + valorIRRF + descontoVT + outrosDescontos)
  const salarioLiquido = arredondar(params.salarioBruto - totalDescontos)

  // --- Detalhamento ---
  const detalhamento: ItemDetalhamento[] = [
    { descricao: "Salário Bruto",    valor: params.salarioBruto, tipo: "credito" },
    ...detINSS.map((d) => ({
      descricao: `INSS ${(d.aliquota * 100).toFixed(1)}% (faixa até R$ ${d.faixa})`,
      valor: d.valor,
      tipo: "debito" as const,
      formula: `R$ ${d.base.toFixed(2)} × ${(d.aliquota * 100).toFixed(1)}%`,
    })),
    { descricao: "IRRF",             valor: valorIRRF,           tipo: "debito",
      formula: `Base R$ ${baseIRRF.toFixed(2)} × ${(aliquota * 100).toFixed(1)}%` },
    ...(descontoVT > 0
      ? [{ descricao: "Vale-Transporte (6%)", valor: descontoVT, tipo: "debito" as const }]
      : []),
    ...(outrosDescontos > 0
      ? [{ descricao: "Outros Descontos", valor: outrosDescontos, tipo: "debito" as const }]
      : []),
    { descricao: "Salário Líquido",  valor: salarioLiquido,      tipo: "neutro" },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: salarioLiquido,
      detalhamento,
      baseCalculo: `Salário Bruto (${formatarBRL(params.salarioBruto)}) − INSS − IRRF − descontos`,
      fonteJuridica: "Decreto 11.936/2024 (INSS) | RIR/2018 (IRRF) | Lei 7.418/1985 (VT)",
      dataReferencia: getTabelasVigentes().vigenciaInicio,
      dados: {
        salarioBruto: params.salarioBruto,
        descontoINSS: valorINSS,
        descontoIRRF: valorIRRF,
        descontoVT,
        outrosDescontos,
        totalDescontos,
        salarioLiquido,
        aliquotaEfetivaINSS: arredondar(valorINSS / params.salarioBruto),
        aliquotaEfetivaIRRF: arredondar(valorIRRF / params.salarioBruto),
      },
    },
  }
}
```

### Testes — calcularSalarioLiquido

```typescript
// packages/core/src/trabalhista/__tests__/salario-liquido.test.ts
import { describe, it, expect } from "vitest"
import { calcularSalarioLiquido } from "../salario-liquido"

describe("calcularSalarioLiquido", () => {
  describe("validação", () => {
    it("retorna erro quando salário é zero", () => {
      const r = calcularSalarioLiquido({ salarioBruto: 0, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(false)
      if (!r.sucesso) expect(r.erros[0]?.campo).toBe("salario")
    })

    it("retorna erro quando salário é negativo", () => {
      const r = calcularSalarioLiquido({ salarioBruto: -100, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(false)
    })

    it("retorna erro quando dependentes são negativos", () => {
      const r = calcularSalarioLiquido({ salarioBruto: 3000, numeroDependentesIRRF: -1 })
      expect(r.sucesso).toBe(false)
    })
  })

  describe("salário mínimo 2026 (R$ 1.518,00)", () => {
    it("INSS = R$ 113,85 (7,5% sobre tudo — 1ª faixa)", () => {
      const r = calcularSalarioLiquido({ salarioBruto: 1518, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.descontoINSS).toBe(113.85)  // 1518 × 7.5%
        expect(r.dados.dados.descontoIRRF).toBe(0)        // abaixo do limite de isenção
      }
    })
  })

  describe("salário R$ 3.000,00 sem dependentes", () => {
    it("calcula INSS progressivo corretamente", () => {
      // Faixa 1: R$0–1518 → 7,5% = R$113,85
      // Faixa 2: R$1518,01–2793,88 → 9% sobre R$1481,99 = R$133,38
      // Faixa 3: R$2793,89–3000 → 12% sobre R$206,12 = R$24,73
      // Total INSS = R$271,96
      const r = calcularSalarioLiquido({ salarioBruto: 3000, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.descontoINSS).toBe(271.96)
    })
  })

  describe("salário R$ 5.000,00 com 2 dependentes", () => {
    it("desconta dependentes na base IRRF", () => {
      // INSS: calcular manualmente para verificar
      // Base IRRF = 5000 - INSS - (2 × 189,59)
      const r = calcularSalarioLiquido({ salarioBruto: 5000, numeroDependentesIRRF: 2 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.descontoINSS).toBeGreaterThan(0)
        expect(r.dados.dados.descontoIRRF).toBeGreaterThan(0)
        expect(r.dados.dados.salarioLiquido).toBeLessThan(5000)
      }
    })
  })

  describe("vale-transporte", () => {
    it("desconta exatamente 6% do salário bruto", () => {
      const r = calcularSalarioLiquido({
        salarioBruto: 3000,
        numeroDependentesIRRF: 0,
        temValeTransporte: true,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.descontoVT).toBe(180) // 3000 × 6%
    })
  })

  describe("consistência", () => {
    it("salário líquido = bruto − total descontos", () => {
      const r = calcularSalarioLiquido({ salarioBruto: 8000, numeroDependentesIRRF: 1 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const { salarioBruto, totalDescontos, salarioLiquido } = r.dados.dados
        expect(salarioLiquido).toBe(arredondar(salarioBruto - totalDescontos))
      }
    })
  })
})
```

---

## TAREFA 3: calcularHoraExtra

### Base Legal
- CLT art. 59: jornada máxima 8h/dia, 44h/semana, máx 2h extras/dia
- CLT art. 59, §1º: adicional mínimo de 50% em dias úteis
- CF/88 art. 7º, XVI: adicional de 100% em domingos e feriados
- CCT/ACT pode definir adicional maior (sempre use o mais favorável ao trabalhador)

### Interface e Implementação

```typescript
// packages/core/src/trabalhista/hora-extra.ts

export type TipoHoraExtra = "util" | "domingo" | "feriado" | "noturna"
export type TipoJornada = "44h" | "40h" | "36h" | "30h" | "personalizada"

export interface HoraExtraParams {
  salarioBruto: number
  /** Jornada contratual mensal em horas */
  jornadaMensalHoras: TipoJornada | number
  quantidadeHoras: number
  tipoHora: TipoHoraExtra
  /** Adicional negociado em CCT/ACT — ex: 0.6 = 60% (sobrepõe o mínimo legal) */
  adicionalNegociado?: number
}

const JORNADAS: Record<Exclude<TipoJornada, "personalizada">, number> = {
  "44h": 220,  // 44h/semana × (52 semanas / 12 meses) ≈ 220h/mês
  "40h": 200,
  "36h": 180,
  "30h": 150,
}

const ADICIONAIS_MINIMOS: Record<TipoHoraExtra, number> = {
  util:     0.50,  // 50% mínimo legal
  domingo:  1.00,  // 100% CF/88
  feriado:  1.00,  // 100% CF/88
  noturna:  0.50,  // 50% + adicional noturno (20%) coberto separadamente
}

export function calcularHoraExtra(
  params: HoraExtraParams,
): ResultadoOuErro<{ valorTotal: number; valorPorHora: number; adicionalAplicado: number }> {
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)
  if (params.quantidadeHoras <= 0) {
    erros.push({ campo: "quantidadeHoras", mensagem: "Quantidade de horas deve ser maior que zero" })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  // Resolve jornada mensal em horas
  const jornadaMensal =
    typeof params.jornadaMensalHoras === "number"
      ? params.jornadaMensalHoras
      : JORNADAS[params.jornadaMensalHoras]

  if (!jornadaMensal || jornadaMensal <= 0) {
    return { sucesso: false, erros: [{ campo: "jornadaMensalHoras", mensagem: "Jornada inválida" }] }
  }

  // Valor da hora normal
  const valorHoraNormal = dividir(params.salarioBruto, jornadaMensal)

  // Adicional aplicado — sempre o maior entre legal e negociado
  const adicionalMinimo = ADICIONAIS_MINIMOS[params.tipoHora]
  const adicionalAplicado = Math.max(adicionalMinimo, params.adicionalNegociado ?? 0)

  // Valor da hora extra
  const valorHoraExtra = arredondar(valorHoraNormal * (1 + adicionalAplicado))
  const valorTotal = arredondar(valorHoraExtra * params.quantidadeHoras)

  const tipoLabel: Record<TipoHoraExtra, string> = {
    util: "dia útil (50%)", domingo: "domingo (100%)", feriado: "feriado (100%)", noturna: "noturna (50%+)",
  }

  return {
    sucesso: true,
    dados: {
      resultado: valorTotal,
      detalhamento: [
        { descricao: "Salário Bruto",        valor: params.salarioBruto,         tipo: "neutro" },
        { descricao: `Jornada Mensal`,        valor: jornadaMensal,               tipo: "neutro",
          formula: `${jornadaMensal}h/mês` },
        { descricao: "Valor Hora Normal",     valor: valorHoraNormal,             tipo: "neutro",
          formula: `R$ ${params.salarioBruto.toFixed(2)} ÷ ${jornadaMensal}h` },
        { descricao: `Adicional (${tipoLabel[params.tipoHora]})`,
          valor: adicionalAplicado * 100,     tipo: "credito",
          formula: `${(adicionalAplicado * 100).toFixed(0)}%` },
        { descricao: "Valor da Hora Extra",   valor: valorHoraExtra,              tipo: "credito",
          formula: `R$ ${valorHoraNormal.toFixed(2)} × ${(1 + adicionalAplicado).toFixed(2)}` },
        { descricao: `Total (${params.quantidadeHoras}h)`, valor: valorTotal,     tipo: "credito",
          formula: `R$ ${valorHoraExtra.toFixed(2)} × ${params.quantidadeHoras}h` },
      ],
      baseCalculo: `(Salário ÷ Jornada Mensal) × (1 + Adicional) × Horas`,
      fonteJuridica: "CLT art. 59 | CF/88 art. 7º, XVI",
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: { valorTotal, valorPorHora: valorHoraExtra, adicionalAplicado },
    },
  }
}
```

### Testes — calcularHoraExtra

```typescript
// packages/core/src/trabalhista/__tests__/hora-extra.test.ts
describe("calcularHoraExtra", () => {
  describe("jornada 44h (220h/mês)", () => {
    it("hora extra em dia útil (50%): R$ 3.000 → R$ 20,45/hora extra", () => {
      // Hora normal: 3000/220 = 13,636...
      // Hora extra 50%: 13,636 × 1,5 = 20,45
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: "44h",
        quantidadeHoras: 1,
        tipoHora: "util",
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.valorPorHora).toBe(20.45)
    })

    it("hora extra no domingo (100%): dobro do valor normal", () => {
      const normal = calcularHoraExtra({
        salarioBruto: 3000, jornadaMensalHoras: "44h", quantidadeHoras: 1, tipoHora: "util",
      })
      const domingo = calcularHoraExtra({
        salarioBruto: 3000, jornadaMensalHoras: "44h", quantidadeHoras: 1, tipoHora: "domingo",
      })
      expect(normal.sucesso && domingo.sucesso).toBe(true)
      if (normal.sucesso && domingo.sucesso) {
        // Hora normal × 2 vs hora normal × 1.5 — domingo é 100%
        const valorNormal = 3000 / 220
        expect(domingo.dados.dados.valorPorHora).toBe(arredondar(valorNormal * 2))
      }
    })

    it("adicional negociado em CCT maior que o legal prevalece", () => {
      const legal = calcularHoraExtra({
        salarioBruto: 3000, jornadaMensalHoras: "44h", quantidadeHoras: 2, tipoHora: "util",
      })
      const negociado = calcularHoraExtra({
        salarioBruto: 3000, jornadaMensalHoras: "44h", quantidadeHoras: 2,
        tipoHora: "util", adicionalNegociado: 0.75,  // CCT com 75%
      })
      expect(negociado.sucesso && legal.sucesso).toBe(true)
      if (negociado.sucesso && legal.sucesso) {
        expect(negociado.dados.resultado).toBeGreaterThan(legal.dados.resultado)
        expect(negociado.dados.dados.adicionalAplicado).toBe(0.75)
      }
    })
  })

  describe("validação", () => {
    it("rejeita quantidade de horas zero", () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000, jornadaMensalHoras: "44h", quantidadeHoras: 0, tipoHora: "util",
      })
      expect(r.sucesso).toBe(false)
    })
  })
})
```

---

## TAREFA 4: calcularDecimoTerceiro

### Base Legal
- Lei 4.090/1962: direito ao 13º salário
- Lei 4.749/1965: pagamento em duas parcelas
- Meses: se trabalhou ≥ 15 dias no mês, o mês conta inteiro
- 1ª parcela (até 30/11): metade do salário bruto, sem descontos de IRRF
- 2ª parcela (até 20/12): restante com desconto de INSS + IRRF sobre o total

### Interface e Implementação

```typescript
// packages/core/src/trabalhista/decimo-terceiro.ts

export interface DecimoTerceiroParams {
  salarioBruto: number
  /** Mês de admissão (1–12) se admitido no ano corrente, ou null se já estava no início do ano */
  mesAdmissao: number | null
  /** Mês de referência para o cálculo (1–12). Default: mês atual */
  mesReferencia?: number
  anoReferencia?: number
  numeroDependentesIRRF: number
  /** Parcela sendo calculada */
  parcela: "primeira" | "segunda" | "total"
  /** Dias trabalhados no mês de admissão (para decidir se conta o mês) */
  diasTrabalhados?: number
}

export function calcularDecimoTerceiro(
  params: DecimoTerceiroParams,
): ResultadoOuErro<{
  valorBruto: number
  mesesDireito: number
  descontoINSS: number
  descontoIRRF: number
  valorLiquido: number
}> {
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)

  const mesRef = params.mesReferencia ?? new Date().getMonth() + 1
  const anoRef = params.anoReferencia ?? new Date().getFullYear()

  // Calcula meses com direito
  let mesesDireito: number
  if (params.mesAdmissao === null) {
    // Trabalhava desde o início do ano: 12 meses (ou até mesRef se parcial)
    mesesDireito = params.parcela === "total" ? 12 : mesRef
  } else {
    // Admitido no ano corrente
    const diasNoMesAdmissao = params.diasTrabalhados ?? 30
    const mesContaInteiro = diasNoMesAdmissao >= 15
    mesesDireito = 12 - params.mesAdmissao + 1 - (mesContaInteiro ? 0 : 1)
    mesesDireito = Math.max(0, Math.min(12, mesesDireito))
  }

  const valorBruto = arredondar((params.salarioBruto / 12) * mesesDireito)

  if (params.parcela === "primeira") {
    // 1ª parcela: metade do salário bruto, sem IRRF
    const valorPrimeira = arredondar(valorBruto / 2)
    return {
      sucesso: true,
      dados: {
        resultado: valorPrimeira,
        detalhamento: [
          { descricao: `13º proporcional (${mesesDireito}/12)`, valor: valorBruto, tipo: "credito",
            formula: `R$ ${params.salarioBruto.toFixed(2)} ÷ 12 × ${mesesDireito}` },
          { descricao: "1ª Parcela (50%)", valor: valorPrimeira, tipo: "credito" },
        ],
        baseCalculo: `(Salário ÷ 12) × ${mesesDireito} meses ÷ 2`,
        fonteJuridica: "Lei 4.749/1965 art. 2º | Lei 4.090/1962",
        dataReferencia: `${anoRef}-${String(mesRef).padStart(2, "0")}-01`,
        dados: { valorBruto: valorPrimeira, mesesDireito, descontoINSS: 0, descontoIRRF: 0, valorLiquido: valorPrimeira },
      },
    }
  }

  // 2ª parcela ou total: INSS + IRRF incidem sobre o valor integral do 13º
  const { valorINSS } = calcularINSSProgressivo(valorBruto)
  const { valorIRRF, baseCalculo: baseIRRF } = calcularIRRFMensal({
    salarioBruto: valorBruto,
    inss: valorINSS,
    numeroDependentes: params.numeroDependentesIRRF,
  })

  const valorLiquido = arredondar(valorBruto - valorINSS - valorIRRF)
  const valorSegundaParcela = params.parcela === "segunda"
    ? arredondar(valorLiquido - arredondar(valorBruto / 2))  // deduz 1ª parcela já recebida
    : valorLiquido

  return {
    sucesso: true,
    dados: {
      resultado: valorSegundaParcela,
      detalhamento: [
        { descricao: `13º proporcional (${mesesDireito}/12)`, valor: valorBruto, tipo: "credito" },
        { descricao: "Desconto INSS",    valor: valorINSS,    tipo: "debito" },
        { descricao: "Desconto IRRF",    valor: valorIRRF,    tipo: "debito",
          formula: `Base: R$ ${baseIRRF.toFixed(2)}` },
        ...(params.parcela === "segunda"
          ? [{ descricao: "1ª Parcela (já recebida)", valor: arredondar(valorBruto / 2), tipo: "debito" as const }]
          : []),
        { descricao: params.parcela === "segunda" ? "2ª Parcela líquida" : "13º Líquido",
          valor: valorSegundaParcela, tipo: "credito" },
      ],
      baseCalculo: `(Salário ÷ 12) × ${mesesDireito} meses`,
      fonteJuridica: "Lei 4.090/1962 | Lei 4.749/1965 | Decreto 11.936/2024 (INSS) | RIR/2018 (IRRF)",
      dataReferencia: getTabelasVigentes().vigenciaInicio,
      dados: { valorBruto, mesesDireito, descontoINSS: valorINSS, descontoIRRF: valorIRRF, valorLiquido: valorSegundaParcela },
    },
  }
}
```

---

## TAREFA 5: calcularFerias

### Base Legal
- CLT arts. 129–153
- Faltas injustificadas reduzem o período de férias:
  - 0–5 faltas: **30 dias**
  - 6–14 faltas: **24 dias**
  - 15–23 faltas: **18 dias**
  - 24–32 faltas: **12 dias**
  - > 32 faltas: **perde direito** (período aquisitivo zera)
- Adicional constitucional: 1/3 do salário (CF/88 art. 7º, XVII)
- Abono pecuniário: pode vender até 1/3 dos dias (pagamento em dinheiro)
- Férias em atraso: dobro do valor (CLT art. 137)

### Interface e Implementação

```typescript
// packages/core/src/trabalhista/ferias.ts

export interface FeriasParams {
  salarioBruto: number
  /** Dias trabalhados no período aquisitivo (30 = mês completo) */
  diasFaltas: number
  /** Dias de férias que o empregado quer converter em dinheiro (abono pecuniário — máx 1/3) */
  diasAbono?: number
  /** Se verdadeiro, as férias estão sendo pagas em atraso (dobro) */
  emAtraso?: boolean
}

export interface FeriasResultado {
  diasDireito: number
  diasGozados: number
  diasAbono: number
  salarioFerias: number    // salário proporcional aos dias
  adicionalTerco: number   // 1/3 constitucional
  valorAbono: number       // valor dos dias vendidos
  totalBruto: number
  perdeuDireito: boolean
}

function diasFeriasPorFaltas(faltas: number): number {
  if (faltas <= 5)  return 30
  if (faltas <= 14) return 24
  if (faltas <= 23) return 18
  if (faltas <= 32) return 12
  return 0  // perde o direito
}

export function calcularFerias(params: FeriasParams): ResultadoOuErro<FeriasResultado> {
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)
  if (params.diasFaltas < 0 || params.diasFaltas > 365) {
    erros.push({ campo: "diasFaltas", mensagem: "Número de faltas inválido (0–365)" })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const diasDireito = diasFeriasPorFaltas(params.diasFaltas)
  const perdeuDireito = diasDireito === 0

  if (perdeuDireito) {
    return {
      sucesso: true,
      dados: {
        resultado: 0,
        detalhamento: [
          { descricao: "Perdeu direito às férias", valor: 0, tipo: "neutro",
            formula: `${params.diasFaltas} faltas > 32 — CLT art. 133` },
        ],
        baseCalculo: "Mais de 32 faltas injustificadas no período aquisitivo",
        fonteJuridica: "CLT art. 133 | CLT arts. 129–130",
        dataReferencia: new Date().toISOString().slice(0, 10),
        dados: { diasDireito: 0, diasGozados: 0, diasAbono: 0, salarioFerias: 0,
          adicionalTerco: 0, valorAbono: 0, totalBruto: 0, perdeuDireito: true },
      },
    }
  }

  // Validação abono: máximo 1/3 dos dias de direito
  const maxAbono = Math.floor(diasDireito / 3)
  const diasAbono = Math.min(params.diasAbono ?? 0, maxAbono)
  const diasGozados = diasDireito - diasAbono

  // Valor diário
  const valorDiario = dividir(params.salarioBruto, 30)

  // Cálculo
  const salarioFerias = arredondar(valorDiario * diasGozados)
  const adicionalTerco = arredondar(salarioFerias / 3)
  const valorAbono = arredondar(valorDiario * diasAbono * (1 + 1 / 3))  // abono tbm tem 1/3

  const totalBruto = arredondar(salarioFerias + adicionalTerco + valorAbono)
  const total = params.emAtraso ? arredondar(totalBruto * 2) : totalBruto

  return {
    sucesso: true,
    dados: {
      resultado: total,
      detalhamento: [
        { descricao: `Salário de Férias (${diasGozados} dias)`, valor: salarioFerias, tipo: "credito",
          formula: `R$ ${params.salarioBruto.toFixed(2)} ÷ 30 × ${diasGozados}` },
        { descricao: "Adicional 1/3 Constitucional", valor: adicionalTerco, tipo: "credito",
          formula: `R$ ${salarioFerias.toFixed(2)} ÷ 3` },
        ...(diasAbono > 0 ? [{
          descricao: `Abono Pecuniário (${diasAbono} dias + 1/3)`, valor: valorAbono, tipo: "credito" as const,
          formula: `R$ ${valorDiario.toFixed(2)} × ${diasAbono} × 1,333`,
        }] : []),
        ...(params.emAtraso ? [{
          descricao: "Dobro — Férias em Atraso (CLT art. 137)", valor: totalBruto, tipo: "credito" as const,
        }] : []),
        { descricao: "Total Bruto", valor: total, tipo: "credito" },
      ],
      baseCalculo: `Salário ÷ 30 × ${diasGozados} dias + 1/3`,
      fonteJuridica: "CLT arts. 129–137 | CF/88 art. 7º, XVII",
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: { diasDireito, diasGozados, diasAbono, salarioFerias, adicionalTerco, valorAbono, totalBruto: total, perdeuDireito: false },
    },
  }
}
```

---

## TAREFA 6: calcularRescisao

Esta é a calculadora de maior volume de busca e mais complexidade legal.

### Base Legal
- CLT arts. 477–487
- Lei 12.506/2011: aviso prévio proporcional (3 dias/ano, máx 90 dias)
- Lei 8.036/1990 art. 18: multa FGTS 40% (sem justa causa) / 20% (acordo mútuo, art. 484-A)
- Motivos de rescisão e verbas devidas:

| Motivo | Saldo Sal. | Aviso Prévio | Férias Prop. | 13º Prop. | Multa FGTS |
|--------|-----------|--------------|--------------|-----------|------------|
| Sem justa causa (empregador) | ✅ | ✅ indenizado | ✅ + 1/3 | ✅ | 40% |
| Com justa causa (empregador paga) | ✅ | ❌ | ✅ + 1/3 | ✅ | 40% |
| Pedido de demissão | ✅ | ✅ trabalhado | ✅ + 1/3 | ✅ | ❌ |
| Acordo mútuo (art. 484-A) | ✅ | 15 dias | ✅ + 1/3 | ✅ | 20% |
| Justa causa pelo empregador | ✅ | ❌ | ❌ (salvo venc.) | ❌ | ❌ |
| Aposentadoria espontânea | ✅ | ✅ ou indenizado | ✅ + 1/3 | ✅ | 40% |

### Interface e Implementação

```typescript
// packages/core/src/trabalhista/rescisao.ts

export type MotivoRescisao =
  | "sem_justa_causa"       // demissão pelo empregador sem justa causa
  | "com_justa_causa_emp"   // demissão pelo empregador COM justa causa (raríssimo — empregado fez algo grave)
  | "justa_causa"           // empregador demite por justa causa (falta grave do empregado)
  | "pedido_demissao"       // empregado pede demissão
  | "acordo_mutuo"          // acordo entre empregado e empregador (CLT art. 484-A)
  | "aposentadoria"         // aposentadoria voluntária

export interface RescisaoParams {
  salarioBruto: number
  dataAdmissao: string          // ISO date "YYYY-MM-DD"
  dataRescisao: string          // ISO date "YYYY-MM-DD"
  motivoRescisao: MotivoRescisao
  /** Saldo atual do FGTS para cálculo da multa */
  saldoFGTS: number
  /** Dias trabalhados no mês de rescisão (para saldo de salário) */
  diasTrabalhados?: number
  /** Férias vencidas ainda não gozadas (períodos completos) */
  feriasVencidas?: number       // 0 ou 1 (raramente 2)
  numeroDependentesIRRF?: number
  /** Aviso prévio foi trabalhado (true) ou indenizado (false) */
  avisoPrevisTrabalhado?: boolean
}

export interface RescisaoResultado {
  saldoSalario: number
  avisoPrevio: number
  feriasVencidas: number
  feriasProporcionais: number
  decimoTerceiroProporcional: number
  multaFGTS: number
  totalBruto: number
  descontoINSS: number
  descontoIRRF: number
  totalLiquido: number
  diasAvisoPrevio: number
  mesesTrabalhados: number
  avisoPrevioIndenizado: boolean
}

function calcularDiasAvisoPrevio(anosCompletos: number, motivo: MotivoRescisao): number {
  if (motivo === "justa_causa" || motivo === "pedido_demissao") return 0
  if (motivo === "acordo_mutuo") return 15  // CLT art. 484-A: metade do aviso
  // Lei 12.506/2011: 30 dias + 3 por ano completo, máximo 90 dias
  return Math.min(90, 30 + anosCompletos * 3)
}

export function calcularRescisao(params: RescisaoParams): ResultadoOuErro<RescisaoResultado> {
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)
  if (params.saldoFGTS < 0) {
    erros.push({ campo: "saldoFGTS", mensagem: "Saldo FGTS não pode ser negativo" })
  }

  const dataAdm = new Date(params.dataAdmissao + "T12:00:00")
  const dataResc = new Date(params.dataRescisao + "T12:00:00")

  if (dataResc <= dataAdm) {
    erros.push({ campo: "dataRescisao", mensagem: "Data de rescisão deve ser posterior à admissão" })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const anos = anosCompletos(dataAdm, dataResc)
  const mesesTrabalhados = mesesEntre(dataAdm, dataResc)
  const mesRescisao = dataResc.getMonth() + 1

  // Saldo de salário (dias trabalhados no último mês)
  const diasUltimoMes = params.diasTrabalhados ?? dataResc.getDate()
  const totalDiasUltimoMes = diasNoMes(dataResc)
  const saldoSalario = arredondar((params.salarioBruto / totalDiasUltimoMes) * diasUltimoMes)

  // Aviso prévio
  const diasAvisoPrevio = calcularDiasAvisoPrevio(anos, params.motivoRescisao)
  const avisoPrevioIndenizado = !params.avisoPrevisTrabalhado && diasAvisoPrevio > 0
  const avisoPrevio = avisoPrevioIndenizado
    ? arredondar((params.salarioBruto / 30) * diasAvisoPrevio)
    : 0

  // Se aviso prévio indenizado, soma os dias no tempo de serviço para férias e 13º
  const mesesEfetivosFGTS = mesesTrabalhados + (avisoPrevioIndenizado ? Math.ceil(diasAvisoPrevio / 30) : 0)

  // Férias vencidas (empregado que perdeu justa causa não recebe, exceto se já estavam vencidas)
  const ferVencidas = params.feriasVencidas ?? 0
  const direitoFerVencidas = params.motivoRescisao !== "justa_causa"
  const feriasVencidasValor = direitoFerVencidas
    ? arredondar(params.salarioBruto * ferVencidas * (1 + 1 / 3))
    : 0

  // Férias proporcionais
  const mesRef = mesesEfetivosFGTS % 12 || 12
  const direitoFerProp = params.motivoRescisao !== "justa_causa"
  const feriasProporcionais = direitoFerProp
    ? arredondar((params.salarioBruto / 12) * mesRef * (1 + 1 / 3))
    : 0

  // 13º proporcional
  const meses13 = mesRescisao  // meses trabalhados no ano corrente
  const direitoDecimo = params.motivoRescisao !== "justa_causa"
  const decimoTerceiro = direitoDecimo
    ? arredondar((params.salarioBruto / 12) * meses13)
    : 0

  // Multa FGTS
  let percentualMulta = 0
  if (params.motivoRescisao === "sem_justa_causa" || params.motivoRescisao === "aposentadoria" || params.motivoRescisao === "com_justa_causa_emp") {
    percentualMulta = 0.40
  } else if (params.motivoRescisao === "acordo_mutuo") {
    percentualMulta = 0.20  // CLT art. 484-A
  }
  const multaFGTS = arredondar(params.saldoFGTS * percentualMulta)

  // Total bruto
  const totalBruto = arredondar(
    saldoSalario + avisoPrevio + feriasVencidasValor + feriasProporcionais + decimoTerceiro + multaFGTS,
  )

  // Descontos na rescisão — INSS e IRRF incidem sobre verbas de natureza salarial
  // Multa FGTS e indenizações não têm INSS/IRRF
  const baseINSS = arredondar(saldoSalario + decimoTerceiro)
  const { valorINSS } = calcularINSSProgressivo(baseINSS)
  const { valorIRRF } = calcularIRRFMensal({
    salarioBruto: saldoSalario + avisoPrevio + feriasProporcionais + feriasVencidasValor + decimoTerceiro,
    inss: valorINSS,
    numeroDependentes: params.numeroDependentesIRRF ?? 0,
  })

  const totalLiquido = arredondar(totalBruto - valorINSS - valorIRRF)

  return {
    sucesso: true,
    dados: {
      resultado: totalLiquido,
      detalhamento: [
        { descricao: `Saldo de Salário (${diasUltimoMes} dias)`, valor: saldoSalario, tipo: "credito" },
        ...(avisoPrevio > 0 ? [{ descricao: `Aviso Prévio Indenizado (${diasAvisoPrevio} dias)`, valor: avisoPrevio, tipo: "credito" as const }] : []),
        ...(feriasVencidasValor > 0 ? [{ descricao: `Férias Vencidas + 1/3 (${ferVencidas} período)`, valor: feriasVencidasValor, tipo: "credito" as const }] : []),
        ...(feriasProporcionais > 0 ? [{ descricao: `Férias Proporcionais + 1/3 (${mesRef}/12)`, valor: feriasProporcionais, tipo: "credito" as const }] : []),
        ...(decimoTerceiro > 0 ? [{ descricao: `13º Proporcional (${meses13}/12)`, valor: decimoTerceiro, tipo: "credito" as const }] : []),
        ...(multaFGTS > 0 ? [{ descricao: `Multa FGTS ${percentualMulta * 100}%`, valor: multaFGTS, tipo: "credito" as const }] : []),
        { descricao: "Total Bruto", valor: totalBruto, tipo: "credito" },
        { descricao: "(-) INSS", valor: valorINSS, tipo: "debito" },
        { descricao: "(-) IRRF", valor: valorIRRF, tipo: "debito" },
        { descricao: "Total Líquido", valor: totalLiquido, tipo: "credito" },
      ],
      baseCalculo: `Rescisão por ${params.motivoRescisao} | ${anos} anos e ${mesesTrabalhados} meses de serviço`,
      fonteJuridica: "CLT arts. 477–487 | Lei 12.506/2011 | Lei 8.036/1990 art. 18",
      dataReferencia: getTabelasVigentes().vigenciaInicio,
      dados: {
        saldoSalario, avisoPrevio, feriasVencidas: feriasVencidasValor,
        feriasProporcionais, decimoTerceiroProporcional: decimoTerceiro,
        multaFGTS, totalBruto, descontoINSS: valorINSS, descontoIRRF: valorIRRF,
        totalLiquido, diasAvisoPrevio, mesesTrabalhados, avisoPrevioIndenizado,
      },
    },
  }
}
```

### Testes — calcularRescisao

```typescript
describe("calcularRescisao", () => {
  const BASE = {
    salarioBruto: 3000,
    dataAdmissao: "2023-01-01",
    dataRescisao: "2026-03-15",  // 3 anos e 2 meses e 14 dias
    saldoFGTS: 9000,
    numeroDependentesIRRF: 0,
  }

  describe("sem justa causa", () => {
    it("recebe todas as verbas + multa FGTS 40%", () => {
      const r = calcularRescisao({ ...BASE, motivoRescisao: "sem_justa_causa" })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.multaFGTS).toBe(3600)      // 9000 × 40%
        expect(r.dados.dados.feriasProporcionais).toBeGreaterThan(0)
        expect(r.dados.dados.decimoTerceiroProporcional).toBeGreaterThan(0)
      }
    })

    it("aviso prévio: 30 + 3×anos = 39 dias para 3 anos completos", () => {
      const r = calcularRescisao({ ...BASE, motivoRescisao: "sem_justa_causa" })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.diasAvisoPrevio).toBe(39)
    })
  })

  describe("justa causa", () => {
    it("não recebe férias proporcionais, 13º nem aviso prévio", () => {
      const r = calcularRescisao({ ...BASE, motivoRescisao: "justa_causa" })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.avisoPrevio).toBe(0)
        expect(r.dados.dados.feriasProporcionais).toBe(0)
        expect(r.dados.dados.decimoTerceiroProporcional).toBe(0)
        expect(r.dados.dados.multaFGTS).toBe(0)
      }
    })
  })

  describe("acordo mútuo (art. 484-A)", () => {
    it("aviso de 15 dias e multa de 20%", () => {
      const r = calcularRescisao({ ...BASE, motivoRescisao: "acordo_mutuo" })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.diasAvisoPrevio).toBe(15)
        expect(r.dados.dados.multaFGTS).toBe(1800)  // 9000 × 20%
      }
    })
  })

  describe("aviso prévio máximo", () => {
    it("não ultrapassa 90 dias independente dos anos trabalhados", () => {
      const r = calcularRescisao({
        ...BASE,
        dataAdmissao: "2000-01-01",  // 26 anos → 30 + 78 = 108 → capped at 90
        motivoRescisao: "sem_justa_causa",
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.diasAvisoPrevio).toBe(90)
    })
  })

  describe("validação", () => {
    it("rejeita data de rescisão anterior à admissão", () => {
      const r = calcularRescisao({
        ...BASE,
        dataAdmissao: "2026-01-01",
        dataRescisao: "2025-12-31",
        motivoRescisao: "sem_justa_causa",
      })
      expect(r.sucesso).toBe(false)
    })
  })
})
```

---

## TAREFA 7: Exports e Index

### `packages/core/src/trabalhista/index.ts`

```typescript
export * from "./salario-liquido"
export * from "./hora-extra"
export * from "./decimo-terceiro"
export * from "./ferias"
export * from "./rescisao"
```

### `packages/core/src/index.ts`

```typescript
// Tipos base
export type {
  ResultadoCalculo,
  ItemDetalhamento,
  ErroValidacao,
  ResultadoOuErro,
} from "./types"

// Utilitários
export { arredondar, dividir, mesesEntre, anosCompletos, formatarBRL } from "./utils"

// Tabelas
export {
  getTabelasVigentes,
  calcularINSSProgressivo,
  calcularIRRFMensal,
  TABELAS_2026,
  PISOS_REGIONAIS_2026,
  getPisoRegional,
} from "./tabelas"

// Calculadoras trabalhistas
export {
  calcularSalarioLiquido,
  calcularHoraExtra,
  calcularDecimoTerceiro,
  calcularFerias,
  calcularRescisao,
} from "./trabalhista"
```

---

## CRITÉRIOS DE ACEITE DA SPRINT 0.2

### Verificação automatizada

```bash
# Todos os testes passam
pnpm --filter @calculosonline/core test

# Cobertura 100% (configurada no vitest.config.ts)
pnpm --filter @calculosonline/core test:coverage

# Sem erros de tipo
pnpm --filter @calculosonline/core typecheck
```

### Checklist de validação cruzada

Antes de encerrar a sprint, validar os seguintes resultados contra calculadoras concorrentes (calculoexato.com.br, calculorescisao.com.br):

| Caso | Input | Resultado Esperado |
|------|-------|--------------------|
| Salário Líquido | R$3.000, 0 dep | Líquido ~R$2.455 |
| Salário Líquido | R$5.000, 2 dep | IRRF ~R$191, líquido ~R$4.170 |
| Hora Extra 44h  | R$3.000, 2h úteis | ~R$40,91 |
| 13º proporcional | R$3.000, 7 meses | ~R$1.750 bruto |
| Férias 30 dias  | R$3.000, 0 faltas | ~R$4.000 (c/ 1/3) |
| Rescisão s/ justa causa | R$3.000, 2 anos, FGTS R$6.000 | Multa R$2.400 |

### Estrutura de arquivos entregue

```
packages/core/src/
├── types.ts                         ← interfaces base (Sprint 0.1)
├── index.ts                         ← exports públicos
├── utils/
│   └── index.ts                     ← arredondar, dividir, mesesEntre...
├── tabelas/
│   └── index.ts                     ← INSS, IRRF, pisos regionais, funções
└── trabalhista/
    ├── index.ts
    ├── salario-liquido.ts
    ├── hora-extra.ts
    ├── decimo-terceiro.ts
    ├── ferias.ts
    ├── rescisao.ts
    └── __tests__/
        ├── salario-liquido.test.ts
        ├── hora-extra.test.ts
        ├── decimo-terceiro.test.ts
        ├── ferias.test.ts
        └── rescisao.test.ts
```

---

## O QUE NÃO FAZER NESTA SPRINT

- **Não criar componentes React** — `packages/core` é TypeScript puro
- **Não fazer fetch de APIs** — tabelas são estáticas no código, atualizadas via PR
- **Não implementar persistência** — sem localStorage, sem banco, sem cookies
- **Não implementar as outras 15 calculadoras** — isso é Sprint 1.1
- **Não criar páginas Next.js** — isso é Sprint 1.3
- **Não deixar nenhum teste falhando** — 100% de cobertura é requisito de gate

---

## ENTREGA ESPERADA

Ao final da Sprint 0.2, o `packages/core` deve ser uma biblioteca TypeScript pura com:

1. **5 calculadoras trabalhistas** completamente implementadas e testadas
2. **Tabelas 2026** completas (INSS, IRRF, pisos regionais, salário mínimo)
3. **Cobertura de testes 100%** nas linhas e funções
4. **Tipagem estrita** — nenhum `any`, todas as funções com interfaces definidas
5. **Validação de inputs** — toda função retorna `ResultadoOuErro` com erros estruturados

> **Próximo passo após esta sprint:** Sprint 1.1 — implementar as 15 calculadoras restantes (FGTS, IRPF, Juros Compostos, CDB, IMC, etc.) seguindo os mesmos padrões estabelecidos aqui.
