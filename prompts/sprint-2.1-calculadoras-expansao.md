# Prompt de IA — Sprint 2.1: +30 Calculadoras (Expansao)
**calculosonline.com.br | Fase 2 — Expansao | Semanas 9–20**

---

## PRE-REQUISITO

- Fase 1 concluida: 20 calculadoras publicadas e indexadas no Google
- AdSense aprovado e ativo
- `packages/core` estruturado com categorias: `trabalhista/`, `impostos/`, `financeiro/`, `investimentos/`, `saude/`, `negocios/`
- Pattern estabelecido: cada funcao retorna `{ resultado, detalhamento[], baseCalculo, fonteJuridica }`

---

## OBJETIVO DA SPRINT 2.1

1. Implementar **30 novas calculadoras** no `packages/core` com testes unitarios
2. Criar paginas web SSG para cada nova calculadora com conteudo editorial
3. Adicionar 6 novas categorias ao sistema de roteamento
4. Manter cobertura de testes > 95% no core engine

---

## PARTE 1 — IMOBI LIARIO (6 calculadoras)

### TAREFA 1: Financiamento Imobiliario (Price / SAC / SAM)

```typescript
// packages/core/src/imobiliario/financiamento-imobiliario.ts

export interface FinanciamentoImobiliarioInput {
  valorImovel: number         // R$
  entrada: number             // R$ ou percentual
  prazoMeses: number          // 60 a 420
  taxaAnual: number           // % a.a.
  sistema: "PRICE" | "SAC" | "SAM"
  dataInicio?: Date
  incluirSeguro?: boolean     // MIP + DFI (~0.25% a.m. sobre saldo)
  incluirTaxaAdm?: boolean    // ~R$25/mes
}

export interface ParcelaFinanciamento {
  numero: number
  dataVencimento: Date
  amortizacao: number
  juros: number
  seguro: number
  taxaAdm: number
  prestacao: number
  saldoDevedor: number
}

export interface FinanciamentoImobiliarioOutput {
  resultado: {
    valorFinanciado: number
    primeiraParcelaPrice: number   // Para PRICE: todas iguais
    primeiraParcelaSAC: number     // Para SAC: maior parcela
    ultimaParcelaSAC: number       // Para SAC: menor parcela
    totalPago: number
    totalJuros: number
    totalSeguro: number
    custeTotal: number             // CET estimado em %
    relacaoJurosFinanciado: number // quantas vezes o valor financiado em juros
  }
  tabela: ParcelaFinanciamento[]   // todas as parcelas
  detalhamento: string[]
  baseCalculo: string
  fonteJuridica: string           // "Res. CMN 4.676/2018 — SFH/SFI"
}

export function calcularFinanciamentoImobiliario(
  input: FinanciamentoImobiliarioInput
): FinanciamentoImobiliarioOutput {
  const { valorImovel, entrada, prazoMeses, taxaAnual, sistema } = input
  const valorFinanciado = valorImovel - entrada
  const taxaMensal = taxaAnual / 100 / 12
  const seguroMensal = input.incluirSeguro ? 0.0025 : 0
  const taxaAdmMensal = input.incluirTaxaAdm ? 25 : 0

  const tabela: ParcelaFinanciamento[] = []
  let saldo = valorFinanciado

  for (let i = 1; i <= prazoMeses; i++) {
    const juros = saldo * taxaMensal
    let amortizacao: number
    let prestacao: number

    if (sistema === "SAC" || sistema === "SAM") {
      amortizacao = valorFinanciado / prazoMeses
      prestacao = amortizacao + juros
    } else {
      // PRICE: prestacao constante
      prestacao = valorFinanciado * (taxaMensal * Math.pow(1 + taxaMensal, prazoMeses))
        / (Math.pow(1 + taxaMensal, prazoMeses) - 1)
      amortizacao = prestacao - juros
    }

    const seguro = saldo * seguroMensal
    const parcela: ParcelaFinanciamento = {
      numero: i,
      dataVencimento: new Date(), // calcular com base em dataInicio
      amortizacao,
      juros,
      seguro,
      taxaAdm: taxaAdmMensal,
      prestacao: prestacao + seguro + taxaAdmMensal,
      saldoDevedor: saldo - amortizacao,
    }
    tabela.push(parcela)
    saldo -= amortizacao
  }

  const totalPago = tabela.reduce((s, p) => s + p.prestacao, 0)
  const totalJuros = tabela.reduce((s, p) => s + p.juros, 0)
  const totalSeguro = tabela.reduce((s, p) => s + p.seguro, 0)

  return {
    resultado: {
      valorFinanciado,
      primeiraParcelaPrice: tabela[0].prestacao,
      primeiraParcelaSAC: sistema === "SAC" ? tabela[0].prestacao : tabela[0].prestacao,
      ultimaParcelaSAC: sistema === "SAC" ? tabela[prazoMeses - 1].prestacao : tabela[0].prestacao,
      totalPago,
      totalJuros,
      totalSeguro,
      custeTotal: ((totalPago / valorFinanciado) - 1) * 100,
      relacaoJurosFinanciado: totalJuros / valorFinanciado,
    },
    tabela,
    detalhamento: [
      `Valor financiado: R$ ${valorFinanciado.toFixed(2)}`,
      `Sistema: ${sistema}`,
      `Taxa mensal: ${(taxaMensal * 100).toFixed(4)}% a.m.`,
      `Total de juros pagos: R$ ${totalJuros.toFixed(2)}`,
      `Relacao juros/principal: ${((totalJuros / valorFinanciado) * 100).toFixed(1)}%`,
    ],
    baseCalculo: `Taxa: ${taxaAnual}% a.a. | Prazo: ${prazoMeses} meses | Sistema: ${sistema}`,
    fonteJuridica: "Res. CMN 4.676/2018 — Sistema Financeiro da Habitacao (SFH/SFI)",
  }
}
```

---

### TAREFA 2: Aluguel com Reajuste (IGPM / IPCA)

```typescript
// packages/core/src/imobiliario/reajuste-aluguel.ts

export interface ReajusteAluguelInput {
  valorAtual: number
  indice: "IGPM" | "IPCA" | "INPC"
  percentualAcumulado: number   // acumulado 12 meses em %
  percentualNegociado?: number  // se diferente do indice cheio
  mesReajuste?: number          // 1–12
}

export interface ReajusteAluguelOutput {
  resultado: {
    valorReajustado: number
    aumentoReais: number
    aumentoPercentual: number
    valorNegociado?: number
    economiaComNegociacao?: number
  }
  detalhamento: string[]
  baseCalculo: string
  fonteJuridica: string
}

export function calcularReajusteAluguel(
  input: ReajusteAluguelInput
): ReajusteAluguelOutput {
  const { valorAtual, indice, percentualAcumulado, percentualNegociado } = input
  const fatorIndice = percentualAcumulado / 100
  const valorReajustado = valorAtual * (1 + fatorIndice)
  const aumentoReais = valorReajustado - valorAtual
  const aumentoPercentual = fatorIndice * 100

  const valorNegociado = percentualNegociado !== undefined
    ? valorAtual * (1 + percentualNegociado / 100)
    : undefined

  return {
    resultado: {
      valorReajustado,
      aumentoReais,
      aumentoPercentual,
      valorNegociado,
      economiaComNegociacao: valorNegociado !== undefined
        ? (valorReajustado - valorNegociado) * 12
        : undefined,
    },
    detalhamento: [
      `Indice: ${indice} acumulado 12 meses = ${percentualAcumulado}%`,
      `Valor atual: R$ ${valorAtual.toFixed(2)}`,
      `Valor reajustado (indice cheio): R$ ${valorReajustado.toFixed(2)}`,
      `Aumento mensal: R$ ${aumentoReais.toFixed(2)}`,
      `Aumento anual: R$ ${(aumentoReais * 12).toFixed(2)}`,
    ],
    baseCalculo: `${indice}: ${percentualAcumulado}% | Aluguel: R$ ${valorAtual}`,
    fonteJuridica: "Lei 8.245/1991 (Lei do Inquilinato) — Art. 18",
  }
}
```

---

### TAREFA 3: Yield / Retorno Imobiliario

```typescript
// packages/core/src/imobiliario/yield-imobiliario.ts

export interface YieldImobiliarioInput {
  valorImovel: number
  aluguelMensal: number
  despesasCondominio?: number
  despesasIPTU?: number          // mensal (IPTU anual / 12)
  despesasManutencao?: number    // estimativa mensal
  vacanciaPercentual?: number    // % de meses vagos por ano
  ir?: boolean                   // 15% sobre aluguel (PF nao tributavel ate R$2.824)
}

export interface YieldImobiliarioOutput {
  resultado: {
    yieldBrutoAnual: number       // % a.a.
    yieldLiquidoAnual: number     // % a.a. descontando despesas
    receitaBrutaAnual: number
    despesasTotaisAnual: number
    receitaLiquidaAnual: number
    paybackAnos: number
    comparativoCDB?: number       // yield CDB CDI 100% (referencia)
  }
  detalhamento: string[]
  baseCalculo: string
  fonteJuridica: string
}

export function calcularYieldImobiliario(
  input: YieldImobiliarioInput
): YieldImobiliarioOutput {
  const {
    valorImovel, aluguelMensal,
    despesasCondominio = 0, despesasIPTU = 0,
    despesasManutencao = valorImovel * 0.005 / 12,
    vacanciaPercentual = 5,
  } = input

  const mesesOcupados = 12 * (1 - vacanciaPercentual / 100)
  const receitaBrutaAnual = aluguelMensal * mesesOcupados
  const despesasAnual = (despesasCondominio + despesasIPTU + despesasManutencao) * 12
  const receitaLiquidaAnual = receitaBrutaAnual - despesasAnual

  const yieldBrutoAnual = (receitaBrutaAnual / valorImovel) * 100
  const yieldLiquidoAnual = (receitaLiquidaAnual / valorImovel) * 100
  const paybackAnos = valorImovel / receitaLiquidaAnual

  return {
    resultado: {
      yieldBrutoAnual,
      yieldLiquidoAnual,
      receitaBrutaAnual,
      despesasTotaisAnual: despesasAnual,
      receitaLiquidaAnual,
      paybackAnos,
    },
    detalhamento: [
      `Aluguel bruto anual: R$ ${receitaBrutaAnual.toFixed(2)}`,
      `Vacancia (${vacanciaPercentual}%): -R$ ${(aluguelMensal * 12 * vacanciaPercentual / 100).toFixed(2)}`,
      `Despesas anuais: -R$ ${despesasAnual.toFixed(2)}`,
      `Yield bruto: ${yieldBrutoAnual.toFixed(2)}% a.a.`,
      `Yield liquido: ${yieldLiquidoAnual.toFixed(2)}% a.a.`,
      `Payback estimado: ${paybackAnos.toFixed(1)} anos`,
    ],
    baseCalculo: `Imovel R$ ${valorImovel} | Aluguel R$ ${aluguelMensal}/mes | Vacancia ${vacanciaPercentual}%`,
    fonteJuridica: "Calculo proprio — sem base legal especifica",
  }
}
```

---

## PARTE 2 — TRIBUTARIO EMPRESARIAL (5 calculadoras)

### TAREFA 4: Simples Nacional

```typescript
// packages/core/src/impostos/simples-nacional.ts

// Tabelas 2026 — Anexos I a V
export const ANEXOS_SIMPLES = {
  I: { // Comercio
    faixas: [
      { ate: 180000,    aliquota: 4.00, deducao: 0 },
      { ate: 360000,    aliquota: 7.30, deducao: 5940 },
      { ate: 720000,    aliquota: 9.50, deducao: 13860 },
      { ate: 1800000,   aliquota: 10.70, deducao: 22500 },
      { ate: 3600000,   aliquota: 14.30, deducao: 87300 },
      { ate: 4800000,   aliquota: 19.00, deducao: 378000 },
    ],
  },
  III: { // Servicos (maioria)
    faixas: [
      { ate: 180000,    aliquota: 6.00, deducao: 0 },
      { ate: 360000,    aliquota: 11.20, deducao: 9360 },
      { ate: 720000,    aliquota: 13.20, deducao: 17640 },
      { ate: 1800000,   aliquota: 16.00, deducao: 35640 },
      { ate: 3600000,   aliquota: 21.00, deducao: 125640 },
      { ate: 4800000,   aliquota: 33.00, deducao: 648000 },
    ],
  },
} as const

export interface SimplesNacionalInput {
  receitaBrutaAcumulada12m: number  // RBT12 em R$
  receitaMesAtual: number
  anexo: "I" | "II" | "III" | "IV" | "V"
  fatorR?: number                    // para Anexo III vs V (folha/RBT12)
}

export interface SimplesNacionalOutput {
  resultado: {
    aliquotaNominal: number
    deducao: number
    aliquotaEfetiva: number
    dasDevido: number               // valor a pagar no mes
    faixaAtual: number              // 1 a 6
  }
  detalhamento: string[]
  baseCalculo: string
  fonteJuridica: string
}

export function calcularSimples(input: SimplesNacionalInput): SimplesNacionalOutput {
  const { receitaBrutaAcumulada12m: rbt12, receitaMesAtual, anexo } = input

  // Selecionar tabela (simplificado para Anexo I e III)
  const tabela = anexo === "I" ? ANEXOS_SIMPLES.I.faixas : ANEXOS_SIMPLES.III.faixas
  const faixa = tabela.find((f) => rbt12 <= f.ate) ?? tabela[tabela.length - 1]
  const faixaIdx = tabela.indexOf(faixa) + 1

  const aliquotaNominal = faixa.aliquota / 100
  const deducao = faixa.deducao
  const aliquotaEfetiva = (rbt12 * aliquotaNominal - deducao) / rbt12
  const dasDevido = receitaMesAtual * aliquotaEfetiva

  return {
    resultado: {
      aliquotaNominal: faixa.aliquota,
      deducao,
      aliquotaEfetiva: aliquotaEfetiva * 100,
      dasDevido,
      faixaAtual: faixaIdx,
    },
    detalhamento: [
      `RBT12: R$ ${rbt12.toFixed(2)} — Faixa ${faixaIdx}`,
      `Aliquota nominal: ${faixa.aliquota}%`,
      `Deducao: R$ ${deducao.toFixed(2)}`,
      `Aliquota efetiva: ${(aliquotaEfetiva * 100).toFixed(2)}%`,
      `DAS a recolher: R$ ${dasDevido.toFixed(2)}`,
    ],
    baseCalculo: `Anexo ${anexo} | RBT12: R$ ${rbt12} | Faturamento mes: R$ ${receitaMesAtual}`,
    fonteJuridica: "LC 123/2006 — Anexos atualizados pela Resolucao CGSN 140/2018",
  }
}
```

---

### TAREFA 5: Pro-labore vs Salario

```typescript
// packages/core/src/impostos/prolabore-vs-salario.ts

export interface ProlaboreSalarioInput {
  valorDesejadoLiquido: number   // quanto quer receber limpo
  retiradaTipo: "PROLABORE" | "SALARIO_CLT"
  dependentes?: number
  outrasDeducoes?: number
}

export interface ProlaboreSalarioOutput {
  resultado: {
    valorBrutoNecessario: number
    inss: number
    irrf: number
    custoEmpresaFolha?: number   // encargos patronais CLT
    custoEmpresaProlabore?: number
    diferencaCusto: number
    recomendacao: "PROLABORE" | "SALARIO_CLT" | "EMPATE"
  }
  detalhamento: string[]
  baseCalculo: string
  fonteJuridica: string
}
```

---

## PARTE 3 — INVESTIMENTOS AVANCADOS (5 calculadoras)

### TAREFA 6: Fundos Imobiliarios (FII)

```typescript
// packages/core/src/investimentos/fii.ts

export interface FIIInput {
  cotas: number
  precoMedioCota: number
  dividendoMensal: number          // por cota em R$
  precoAtualCota?: number
  patrimonioLiquidoCota?: number   // P/VPA
}

export interface FIIOutput {
  resultado: {
    investimentoTotal: number
    dividendoMensalTotal: number
    dividendoAnualTotal: number
    yieldMensal: number              // %
    yieldAnual: number               // % (dividend yield)
    pvpa?: number                    // preco/valor patrimonial
    avaliacaoPVPA?: string           // "DESCONTO" | "PREMIO" | "JUSTO"
    mesesPayback: number
  }
  detalhamento: string[]
  baseCalculo: string
  fonteJuridica: string
}

export function calcularFII(input: FIIInput): FIIOutput {
  const { cotas, precoMedioCota, dividendoMensal, precoAtualCota, patrimonioLiquidoCota } = input
  const investimentoTotal = cotas * precoMedioCota
  const dividendoMensalTotal = cotas * dividendoMensal
  const dividendoAnualTotal = dividendoMensalTotal * 12
  const yieldMensal = (dividendoMensal / precoMedioCota) * 100
  const yieldAnual = yieldMensal * 12
  const mesesPayback = investimentoTotal / dividendoMensalTotal

  const pvpa = precoAtualCota && patrimonioLiquidoCota
    ? precoAtualCota / patrimonioLiquidoCota
    : undefined

  const avaliacaoPVPA = pvpa
    ? pvpa < 0.95 ? "DESCONTO" : pvpa > 1.05 ? "PREMIO" : "JUSTO"
    : undefined

  return {
    resultado: {
      investimentoTotal,
      dividendoMensalTotal,
      dividendoAnualTotal,
      yieldMensal,
      yieldAnual,
      pvpa,
      avaliacaoPVPA,
      mesesPayback,
    },
    detalhamento: [
      `${cotas} cotas x R$ ${precoMedioCota} = R$ ${investimentoTotal.toFixed(2)}`,
      `Dividendo: R$ ${dividendoMensal}/cota x ${cotas} cotas = R$ ${dividendoMensalTotal.toFixed(2)}/mes`,
      `Dividend Yield: ${yieldMensal.toFixed(2)}% a.m. / ${yieldAnual.toFixed(2)}% a.a.`,
      pvpa ? `P/VPA: ${pvpa.toFixed(2)} — ${avaliacaoPVPA}` : "",
      `Payback: ${(mesesPayback / 12).toFixed(1)} anos`,
    ].filter(Boolean),
    baseCalculo: `${cotas} cotas | Preco medio: R$ ${precoMedioCota} | DY: R$ ${dividendoMensal}/cota/mes`,
    fonteJuridica: "Isenção de IR sobre dividendos FII para PF — Lei 11.033/2004, Art. 3º",
  }
}
```

---

### TAREFA 7: Aposentadoria INSS

```typescript
// packages/core/src/trabalhista/aposentadoria.ts

// Regras EC 103/2019 (Reforma da Previdencia)
export interface AposentadoriaInput {
  dataNascimento: Date
  sexo: "M" | "F"
  dataInicioContribuicao: Date
  tempoContribuicaoAtual?: number  // em anos (override calculo automatico)
  salarioMedioContribuicoes: number
  regraTransicao?: "PONTOS" | "IDADE" | "TEMPO_CONTRIBUICAO" | "MELHOR"
}

export interface AposentadoriaOutput {
  resultado: {
    idadeAtual: number
    tempoContribuicaoAtual: number
    idadeAposentadoriaIdade: number       // 65H / 62M
    faltamAnosIdade: number
    pontosNecessariosAtual: number        // aumenta 1 ponto/ano ate 105H/100M
    pontosAtuais: number                  // idade + tempo contribuicao
    faltamParaPontos: number
    salarioBeneficioEstimado: number      // media 100% das contribuicoes
    aliquotaProgressiva: number           // % de reducao por antecipacao
  }
  detalhamento: string[]
  baseCalculo: string
  fonteJuridica: string
}
```

---

## PARTE 4 — NEGOCIOS (5 calculadoras)

### TAREFA 8: Ponto de Equilibrio (Breakeven)

```typescript
// packages/core/src/negocios/breakeven.ts

export interface BreakevenInput {
  custoFixoMensal: number         // aluguel, salarios, etc.
  precoVendaUnitario: number
  custoVariavelUnitario: number   // materia-prima, comissao, etc.
  receitaAtual?: number           // para calcular margem de seguranca
}

export interface BreakevenOutput {
  resultado: {
    margemContribuicaoUnitaria: number   // preco - custo variavel
    margemContribuicaoPercentual: number // % sobre preco
    breakEvenUnidades: number
    breakEvenReceita: number
    margemSegurancaUnidades?: number
    margemSegurancaPercentual?: number
    pontoLucroMeta?: number              // para atingir lucro desejado
  }
  detalhamento: string[]
  baseCalculo: string
  fonteJuridica: string
}

export function calcularBreakeven(input: BreakevenInput): BreakevenOutput {
  const { custoFixoMensal, precoVendaUnitario, custoVariavelUnitario, receitaAtual } = input
  const mc = precoVendaUnitario - custoVariavelUnitario
  const mcPerc = (mc / precoVendaUnitario) * 100
  const breakEvenUnidades = custoFixoMensal / mc
  const breakEvenReceita = custoFixoMensal / (mc / precoVendaUnitario)

  const unidadesAtuais = receitaAtual ? receitaAtual / precoVendaUnitario : undefined
  const margemSegurancaUnidades = unidadesAtuais ? unidadesAtuais - breakEvenUnidades : undefined
  const margemSegurancaPercentual = unidadesAtuais
    ? ((unidadesAtuais - breakEvenUnidades) / unidadesAtuais) * 100
    : undefined

  return {
    resultado: {
      margemContribuicaoUnitaria: mc,
      margemContribuicaoPercentual: mcPerc,
      breakEvenUnidades,
      breakEvenReceita,
      margemSegurancaUnidades,
      margemSegurancaPercentual,
    },
    detalhamento: [
      `Margem de contribuicao: R$ ${mc.toFixed(2)}/unidade (${mcPerc.toFixed(1)}%)`,
      `Ponto de equilibrio: ${Math.ceil(breakEvenUnidades)} unidades/mes`,
      `Ponto de equilibrio em receita: R$ ${breakEvenReceita.toFixed(2)}/mes`,
      margemSegurancaPercentual !== undefined
        ? `Margem de seguranca atual: ${margemSegurancaPercentual.toFixed(1)}%`
        : "",
    ].filter(Boolean),
    baseCalculo: `CF: R$ ${custoFixoMensal} | PV: R$ ${precoVendaUnitario} | CV: R$ ${custoVariavelUnitario}`,
    fonteJuridica: "Analise de Custos — conceito de margem de contribuicao",
  }
}
```

---

### TAREFA 9: Precificacao para Freelancers

```typescript
// packages/core/src/negocios/precificacao-freelancer.ts

export interface PrecificacaoFreelancerInput {
  salarioDesejadoLiquido: number      // quanto quer receber/mes
  horasTrabalhadasMes: number         // tipico: 160h
  percentualHorasBillable: number     // % das horas que vira cliente (ex: 70%)
  impostosPercentual: number          // Simples/MEI/PF: 6–15%
  custosMensais: number               // conta, software, equipamento amortizado
  percentualReservaFerias: number     // 8.33% (1/12 para 30 dias)
  percentualReservaDecimo?: number    // 8.33%
  percentualReservaInss?: number      // 20% autonomo ou 5% MEI
}

export interface PrecificacaoFreelancerOutput {
  resultado: {
    horasBillableMes: number
    custoHoraBase: number
    impostosPorHora: number
    reservasBeneficiosPorHora: number
    precoMinimoHora: number          // nao trabalhar abaixo disso
    precoRecomendadoHora: number     // minimo + 20% margem
    receitaBrutaNecessariaMes: number
  }
  detalhamento: string[]
  baseCalculo: string
  fonteJuridica: string
}

export function calcularPrecificacaoFreelancer(
  input: PrecificacaoFreelancerInput
): PrecificacaoFreelancerOutput {
  const {
    salarioDesejadoLiquido, horasTrabalhadasMes,
    percentualHorasBillable, impostosPercentual,
    custosMensais, percentualReservaFerias,
    percentualReservaDecimo = 8.33,
    percentualReservaInss = 20,
  } = input

  const horasBillable = horasTrabalhadasMes * (percentualHorasBillable / 100)
  const totalReservas = percentualReservaFerias + percentualReservaDecimo + percentualReservaInss
  const custoBase = salarioDesejadoLiquido + custosMensais
  const custoComReservas = custoBase * (1 + totalReservas / 100)
  const receitaBrutaNecessaria = custoComReservas / (1 - impostosPercentual / 100)
  const precoMinimoHora = receitaBrutaNecessaria / horasBillable
  const precoRecomendadoHora = precoMinimoHora * 1.20

  return {
    resultado: {
      horasBillableMes: horasBillable,
      custoHoraBase: custoBase / horasBillable,
      impostosPorHora: (receitaBrutaNecessaria * impostosPercentual / 100) / horasBillable,
      reservasBeneficiosPorHora: (custoComReservas - custoBase) / horasBillable,
      precoMinimoHora,
      precoRecomendadoHora,
      receitaBrutaNecessariaMes: receitaBrutaNecessaria,
    },
    detalhamento: [
      `Horas faturadas/mes: ${horasBillable.toFixed(0)}h (${percentualHorasBillable}% de ${horasTrabalhadasMes}h)`,
      `Reservas (ferias + 13o + INSS): ${totalReservas.toFixed(1)}%`,
      `Receita bruta necessaria: R$ ${receitaBrutaNecessaria.toFixed(2)}/mes`,
      `Preco minimo da hora: R$ ${precoMinimoHora.toFixed(2)}/h`,
      `Preco recomendado (+20% margem): R$ ${precoRecomendadoHora.toFixed(2)}/h`,
    ],
    baseCalculo: `Salario desejado: R$ ${salarioDesejadoLiquido} | ${horasBillable}h billable/mes`,
    fonteJuridica: "Gestao financeira pessoal — sem base legal especifica",
  }
}
```

---

## PARTE 5 — CONVERSOES (5 calculadoras)

### TAREFA 10: Conversor de Unidades

```typescript
// packages/core/src/conversoes/unidades.ts

type Categoria = "comprimento" | "peso" | "volume" | "temperatura" | "area"

const FATORES: Record<Categoria, Record<string, number>> = {
  comprimento: { // base: metro
    metro: 1, centimetro: 0.01, milimetro: 0.001,
    quilometro: 1000, polegada: 0.0254, pe: 0.3048,
    jarda: 0.9144, milha: 1609.344, milha_nautica: 1852,
  },
  peso: { // base: quilograma
    quilograma: 1, grama: 0.001, miligrama: 0.000001,
    tonelada: 1000, libra: 0.453592, onca: 0.0283495,
    arroba: 14.688, quintal: 100,
  },
  volume: { // base: litro
    litro: 1, mililitro: 0.001, centilitro: 0.01,
    metro_cubico: 1000, galao_us: 3.78541, galao_uk: 4.54609,
    onca_fluida: 0.0295735, xicara: 0.236588,
  },
  temperatura: { // especial — nao usa fator linear
    celsius: 0, fahrenheit: 0, kelvin: 0,
  },
  area: { // base: metro_quadrado
    metro_quadrado: 1, centimetro_quadrado: 0.0001,
    hectare: 10000, alqueire_sp: 24200, alqueire_mg: 48400,
    km_quadrado: 1000000, pe_quadrado: 0.092903,
  },
}

export function converterUnidade(
  valor: number,
  de: string,
  para: string,
  categoria: Categoria
): { resultado: number; formula: string } {
  if (categoria === "temperatura") {
    return converterTemperatura(valor, de, para)
  }
  const fatores = FATORES[categoria]
  const base = valor * fatores[de]
  const resultado = base / fatores[para]
  return {
    resultado,
    formula: `${valor} ${de} = ${resultado.toFixed(6)} ${para}`,
  }
}

function converterTemperatura(
  valor: number, de: string, para: string
): { resultado: number; formula: string } {
  let celsius: number
  if (de === "fahrenheit") celsius = (valor - 32) * 5 / 9
  else if (de === "kelvin") celsius = valor - 273.15
  else celsius = valor

  let resultado: number
  if (para === "fahrenheit") resultado = celsius * 9 / 5 + 32
  else if (para === "kelvin") resultado = celsius + 273.15
  else resultado = celsius

  return { resultado, formula: `${valor}°${de[0].toUpperCase()} = ${resultado.toFixed(2)}°${para[0].toUpperCase()}` }
}
```

---

### TAREFA 11: Conversor de Moedas (cotacao em tempo real)

```typescript
// packages/core/src/conversoes/moedas.ts
// Dados de cotacao vem de API externa — o core apenas calcula

export interface ConversaoMoedaInput {
  valor: number
  moedaOrigem: string       // "BRL", "USD", "EUR", "GBP", "JPY", "ARS"
  moedaDestino: string
  cotacao: number           // fornecido pela camada de dados (apps/web)
  spread?: number           // % de spread do cambio (padrao 3%)
}

export interface ConversaoMoedaOutput {
  resultado: {
    valorConvertido: number
    valorComSpread: number
    spread: number
    cotacaoUsada: number
  }
  detalhamento: string[]
  baseCalculo: string
  fonteJuridica: string
}

export function converterMoeda(input: ConversaoMoedaInput): ConversaoMoedaOutput {
  const { valor, moedaOrigem, moedaDestino, cotacao, spread = 3 } = input
  const valorConvertido = valor * cotacao
  const valorComSpread = valorConvertido * (1 - spread / 100)

  return {
    resultado: {
      valorConvertido,
      valorComSpread,
      spread,
      cotacaoUsada: cotacao,
    },
    detalhamento: [
      `${valor} ${moedaOrigem} x ${cotacao} = ${moedaDestino} ${valorConvertido.toFixed(2)}`,
      `Com spread de ${spread}%: ${moedaDestino} ${valorComSpread.toFixed(2)}`,
    ],
    baseCalculo: `Cotacao: 1 ${moedaOrigem} = ${cotacao} ${moedaDestino}`,
    fonteJuridica: "Cotacao de referencia — PTAX Banco Central do Brasil",
  }
}
```

```typescript
// apps/web/src/data/cotacoes.ts — buscar cotacao do BCB
// API aberta do Banco Central: https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/

export async function buscarCotacaoBCB(moeda: "USD" | "EUR" | "GBP"): Promise<number> {
  const hoje = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")
  const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/`
    + `CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)`
    + `?@moeda='${moeda}'&@dataCotacao='${hoje}'&$format=json&$top=1`

  const response = await fetch(url, { next: { revalidate: 3600 } }) // ISR 1h
  const data = await response.json()
  return data.value[0]?.cotacaoVenda ?? null
}
```

---

## PARTE 6 — DIA A DIA (4 calculadoras)

### TAREFA 12: Calculadora de Churrasco

```typescript
// packages/core/src/diadia/churrasco.ts

export interface ChurrascoInput {
  adultos: number
  criancas: number               // contam como 0.5 adulto
  horasDuracao: number           // influencia no consumo
  incluiBebidas?: boolean
  tipoEvento: "CASUAL" | "ESPECIAL"
}

export interface ChurrascoOutput {
  resultado: {
    totalPessoas: number         // adultos + criancas*0.5
    // Carnes
    picanha: number              // kg
    fraldinha: number            // kg
    linguica: number             // kg
    frangoCoxaCc: number         // kg
    totalCarneKg: number
    // Acompanhamentos
    paoPorAoLeite: number        // unidades
    queijo: number               // kg
    vinagrete: number            // kg
    // Bebidas (se incluiBebidas)
    cerveja?: number             // latas (350ml)
    refrigerante?: number        // litros
    agua?: number                // litros
    // Carvao
    carvao: number               // kg
  }
  detalhamento: string[]
  baseCalculo: string
  fonteJuridica: string
}

export function calcularChurrasco(input: ChurrascoInput): ChurrascoOutput {
  const { adultos, criancas, horasDuracao, incluiBebidas, tipoEvento } = input
  const pessoas = adultos + criancas * 0.5
  const fatorEspecial = tipoEvento === "ESPECIAL" ? 1.2 : 1

  // Quantidades por pessoa (kg) — empirico
  const picanha = pessoas * 0.25 * fatorEspecial
  const fraldinha = pessoas * 0.20 * fatorEspecial
  const linguica = pessoas * 0.15
  const frangoCoxaCc = pessoas * 0.15 * fatorEspecial
  const totalCarneKg = picanha + fraldinha + linguica + frangoCoxaCc

  const paoPorAoLeite = Math.ceil(pessoas * 2)
  const queijo = pessoas * 0.08
  const vinagrete = pessoas * 0.10
  const carvao = totalCarneKg * 1.5   // 1.5x o peso da carne em carvao

  const bebidas = incluiBebidas ? {
    cerveja: Math.ceil(pessoas * (horasDuracao / 3) * 3),  // 3 latas/pessoa/3h
    refrigerante: pessoas * 0.5,
    agua: pessoas * 0.5,
  } : {}

  return {
    resultado: {
      totalPessoas: pessoas,
      picanha, fraldinha, linguica, frangoCoxaCc, totalCarneKg,
      paoPorAoLeite, queijo, vinagrete,
      carvao,
      ...bebidas,
    },
    detalhamento: [
      `${pessoas} pessoas equivalentes`,
      `Carnes: ${totalCarneKg.toFixed(1)} kg no total`,
      `  Picanha: ${picanha.toFixed(1)} kg`,
      `  Fraldinha: ${fraldinha.toFixed(1)} kg`,
      `  Linguica: ${linguica.toFixed(1)} kg`,
      `  Frango: ${frangoCoxaCc.toFixed(1)} kg`,
      `Carvao: ${carvao.toFixed(0)} kg`,
      incluiBebidas ? `Cerveja: ${bebidas.cerveja} latas` : "",
    ].filter(Boolean),
    baseCalculo: `${adultos} adultos + ${criancas} criancas | ${horasDuracao}h | ${tipoEvento}`,
    fonteJuridica: "Calculo baseado em medias empiricas de consumo",
  }
}
```

---

## ESTRUTURA DE ARQUIVOS

```
packages/core/src/
├── imobiliario/
│   ├── financiamento-imobiliario.ts     (TAREFA 1)
│   ├── reajuste-aluguel.ts              (TAREFA 2)
│   ├── yield-imobiliario.ts             (TAREFA 3)
│   ├── corretagem-imobiliaria.ts
│   └── iptu-estimado.ts
├── impostos/
│   ├── simples-nacional.ts              (TAREFA 4)
│   ├── prolabore-vs-salario.ts          (TAREFA 5)
│   ├── lucro-presumido.ts
│   ├── pis-cofins.ts
│   └── iss-municipal.ts
├── investimentos/
│   ├── fii.ts                           (TAREFA 6)
│   ├── aposentadoria.ts                 (TAREFA 7)
│   ├── consignado.ts
│   ├── previdencia-privada.ts
│   └── poder-compra-inflacao.ts
├── negocios/
│   ├── breakeven.ts                     (TAREFA 8)
│   ├── precificacao-freelancer.ts       (TAREFA 9)
│   ├── markup-preco-venda.ts
│   ├── roi-payback.ts
│   └── plr.ts
├── conversoes/
│   ├── unidades.ts                      (TAREFA 10)
│   ├── moedas.ts                        (TAREFA 11)
│   ├── salario-hora-mes-ano.ts
│   ├── horas-trabalho.ts
│   └── combustivel-km.ts
└── diadia/
    ├── churrasco.ts                     (TAREFA 12)
    ├── gorjeta.ts
    ├── divisao-conta.ts
    └── combustivel-vs-transporte.ts
```

---

## CONTEUDO EDITORIAL — SLUGS DAS NOVAS PAGINAS

```
/calculadora/financiamento-imobiliario
/calculadora/reajuste-aluguel
/calculadora/yield-imobiliario
/calculadora/corretagem-imobiliaria
/calculadora/iptu
/calculadora/simples-nacional
/calculadora/lucro-presumido
/calculadora/pis-cofins
/calculadora/prolabore-salario
/calculadora/iss
/calculadora/fii
/calculadora/aposentadoria-inss
/calculadora/consignado
/calculadora/previdencia-privada
/calculadora/inflacao-poder-compra
/calculadora/markup
/calculadora/roi-payback
/calculadora/breakeven
/calculadora/preco-freelancer
/calculadora/plr
/calculadora/conversor-unidades
/calculadora/conversor-moedas
/calculadora/salario-hora-mes-ano
/calculadora/horas-trabalho
/calculadora/combustivel-km
/calculadora/gorjeta
/calculadora/divisao-conta
/calculadora/combustivel-vs-transporte
/calculadora/churrasco
```

---

## TESTES UNITARIOS — PADRAO PARA NOVAS CALCULADORAS

```typescript
// packages/core/src/imobiliario/__tests__/financiamento-imobiliario.test.ts
import { describe, it, expect } from "vitest"
import { calcularFinanciamentoImobiliario } from "../financiamento-imobiliario"

describe("calcularFinanciamentoImobiliario", () => {
  it("PRICE: primeira e ultima parcela iguais", () => {
    const resultado = calcularFinanciamentoImobiliario({
      valorImovel: 400000,
      entrada: 80000,        // 20%
      prazoMeses: 360,       // 30 anos
      taxaAnual: 10.5,
      sistema: "PRICE",
    })
    const { tabela } = resultado
    expect(tabela[0].prestacao).toBeCloseTo(tabela[359].prestacao, 0)
  })

  it("SAC: primeira parcela maior que a ultima", () => {
    const resultado = calcularFinanciamentoImobiliario({
      valorImovel: 400000,
      entrada: 80000,
      prazoMeses: 360,
      taxaAnual: 10.5,
      sistema: "SAC",
    })
    expect(resultado.tabela[0].prestacao).toBeGreaterThan(resultado.tabela[359].prestacao)
  })

  it("Total pago > valor financiado", () => {
    const resultado = calcularFinanciamentoImobiliario({
      valorImovel: 300000,
      entrada: 60000,
      prazoMeses: 240,
      taxaAnual: 9,
      sistema: "PRICE",
    })
    expect(resultado.resultado.totalPago).toBeGreaterThan(240000)
  })

  it("Saldo devedor final proximo de zero (SAC)", () => {
    const resultado = calcularFinanciamentoImobiliario({
      valorImovel: 300000,
      entrada: 60000,
      prazoMeses: 120,
      taxaAnual: 8,
      sistema: "SAC",
    })
    const ultimaParcela = resultado.tabela[119]
    expect(ultimaParcela.saldoDevedor).toBeCloseTo(0, -2)
  })
})
```

---

## CHECKLIST DE VERIFICACAO

- [ ] 30 funcoes implementadas em `packages/core`
- [ ] 100% cobertura de testes unitarios (rodar `pnpm --filter core test --coverage`)
- [ ] Todas as funcoes exportadas no `packages/core/src/index.ts`
- [ ] 30 paginas SSG geradas (`ls .next/server/app/calculadora/` mostra 50 slugs no total)
- [ ] Conteudo editorial minimo 800 palavras por pagina (verificar no build)
- [ ] Schemas JSON-LD atualizados em todas as novas paginas
- [ ] Sitemap.xml regenerado com todas as URLs
- [ ] Sem erros de TypeScript (`pnpm tsc --noEmit`)

```bash
# Verificar build do core
pnpm --filter core build
pnpm --filter core test --coverage
# Coverage: All files — Stmts > 95%

# Verificar paginas geradas
pnpm build
ls .next/server/app/calculadora/ | wc -l
# Deve retornar 50

# Verificar sitemap
curl https://calculosonline.com.br/sitemap.xml | grep "/calculadora/" | wc -l
# Deve retornar 50
```

---

## CRITERIOS DE ACEITE

| Criterio | Meta |
|----------|------|
| Calculadoras no core | 30 novas (50 total) |
| Cobertura de testes | > 95% |
| Paginas publicadas | 50 total |
| Build sem erros TS | 0 erros |
| Lighthouse Performance | > 90 em todas as novas paginas |
| LCP mobile | < 2.5s |

> **Proximo passo:** Sprint 2.2 — empacotar as calculadoras no app Desktop com Tauri.
