import type { QuickAddButton } from '@calculosonline/ui'

/**
 * Presets de chips de valor rápido (mesmo padrão visual do Recibo Fácil,
 * ver CalculatorForm em @calculosonline/ui). Cada chip SOMA ao valor atual
 * do campo; "Zerar" é sempre adicionado automaticamente pelo CalculatorForm.
 * Escalas diferentes por tipo de campo: salário mensal, aporte/valor de
 * investimento e valores anuais/financiados (maiores).
 */

export const QUICK_ADD_SALARIO: QuickAddButton[] = [
  { label: '+100', value: 100 },
  { label: '+500', value: 500 },
  { label: '+1.000', value: 1000 },
  { label: '+5.000', value: 5000 },
]

export const QUICK_ADD_INVESTIMENTO: QuickAddButton[] = [
  { label: '+100', value: 100 },
  { label: '+1.000', value: 1000 },
  { label: '+5.000', value: 5000 },
  { label: '+10.000', value: 10000 },
]

export const QUICK_ADD_VALOR_GRANDE: QuickAddButton[] = [
  { label: '+1.000', value: 1000 },
  { label: '+5.000', value: 5000 },
  { label: '+10.000', value: 10000 },
  { label: '+50.000', value: 50000 },
]

/**
 * Presets para campos `stepper` (F50). Diferente dos presets de valor, aqui o
 * chip existe porque o +/− do stepper cobra um clique por unidade: o heatmap
 * do Clarity de 25-27/08 registrou **64 de 133 cliques** da página de CDB no
 * stepper `prazoMeses` — sair de 12 para 24 meses são 12 cliques. Só entram em
 * campos de faixa larga; contadores curtos (dependentes 0-5, férias vencidas
 * 0-2) continuam sem chip, onde eles seriam ruído.
 */

export const QUICK_ADD_MESES: QuickAddButton[] = [
  { label: '+6', value: 6 },
  { label: '+12', value: 12 },
  { label: '+24', value: 24 },
  { label: '+60', value: 60 },
]

export const QUICK_ADD_DIAS: QuickAddButton[] = [
  { label: '+1', value: 1 },
  { label: '+5', value: 5 },
  { label: '+10', value: 10 },
]

/**
 * Dias em escala de **prazo**, não de falta (F68). O `QUICK_ADD_DIAS` acima
 * nasceu para faltas e abono, onde o intervalo útil é 0-10; deslocar uma data
 * trabalha na escala de prazo — 15, 30, 60 e 90 dias são o aviso prévio, o
 * mês comercial, o trimestre e a garantia, que é o que se soma a uma data na
 * prática.
 */
export const QUICK_ADD_DIAS_LONGO: QuickAddButton[] = [
  { label: '+15', value: 15 },
  { label: '+30', value: 30 },
  { label: '+60', value: 60 },
  { label: '+90', value: 90 },
]

export const QUICK_ADD_HORAS: QuickAddButton[] = [
  { label: '+1', value: 1 },
  { label: '+5', value: 5 },
  { label: '+10', value: 10 },
  { label: '+20', value: 20 },
]

export const QUICK_ADD_IDADE: QuickAddButton[] = [
  { label: '+1', value: 1 },
  { label: '+5', value: 5 },
  { label: '+10', value: 10 },
]

export const QUICK_ADD_APORTE: QuickAddButton[] = [
  { label: '+50', value: 50 },
  { label: '+100', value: 100 },
  { label: '+500', value: 500 },
  { label: '+1.000', value: 1000 },
]

export const QUICK_ADD_VALOR_PEQUENO: QuickAddButton[] = [
  { label: '+50', value: 50 },
  { label: '+100', value: 100 },
  { label: '+500', value: 500 },
]

export const QUICK_ADD_PESO: QuickAddButton[] = [
  { label: '+1', value: 1 },
  { label: '+5', value: 5 },
  { label: '+10', value: 10 },
]

/**
 * Altura em **centímetros** (calorias). Não confundir com o preset em metros:
 * as duas calculadoras de saúde usam unidades diferentes para o mesmo dado —
 * `calorias` pede cm (100–250) e `imc` pede m (1,00–2,50). Foi um achado do
 * F59, e é exatamente o tipo de coisa que um preset trocado esconde.
 */
export const QUICK_ADD_ALTURA_CM: QuickAddButton[] = [
  { label: '160', value: 160, modo: 'definir', titulo: '1,60 m' },
  { label: '170', value: 170, modo: 'definir', titulo: '1,70 m' },
  { label: '180', value: 180, modo: 'definir', titulo: '1,80 m' },
  { label: '+1', value: 1 },
]

/** Altura em **metros** (IMC). Ver a ressalva em `QUICK_ADD_ALTURA_CM`. */
export const QUICK_ADD_ALTURA_M: QuickAddButton[] = [
  { label: '1,60', value: 1.6, modo: 'definir' },
  { label: '1,70', value: 1.7, modo: 'definir' },
  { label: '1,80', value: 1.8, modo: 'definir' },
  { label: '+0,01', value: 0.01 },
]

/**
 * Contadores curtos (dependentes 0–5, férias vencidas 0–2).
 *
 * O F50 os deixou de fora de propósito — em faixa tão estreita o chip repete o
 * que o +/− já faz, e o dado do Clarity que motivou os chips era de steppers de
 * faixa larga. Entraram a pedido do Paulo (08/09): mesmo aqui o "Zerar", que
 * vem junto do bloco de chips, resolve o "comecei errado" em um clique.
 */
export const QUICK_ADD_CONTADOR_CURTO: QuickAddButton[] = [
  { label: '+1', value: 1 },
  { label: '+2', value: 2 },
]

/**
 * Campos genéricos da calculadora de porcentagem. Não têm unidade fixa — o
 * sentido de `valorA`/`valorB` muda com o modo escolhido —, então os chips são
 * de escala, para encurtar a digitação, e não de valor de referência.
 */
export const QUICK_ADD_GENERICO: QuickAddButton[] = [
  { label: '+1', value: 1 },
  { label: '+10', value: 10 },
  { label: '+100', value: 100 },
  { label: '+1.000', value: 1000 },
]

/**
 * Presets de TAXA — todos com `modo: 'definir'`.
 *
 * Aqui o chip **substitui** o valor em vez de somar, e a diferença não é
 * detalhe: somar é a operação certa para dinheiro e contagem ("+1.000",
 * "+12 meses") e a errada para percentual — dois cliques em "+1%" dariam 2%.
 * Taxa não se constrói somando pedaços; ela tem valores de referência
 * conhecidos, e o chip serve para dizer "é este".
 *
 * **Atenção à unidade:** os campos de taxa das calculadoras financeiras
 * guardam **decimal** (0,01 = 1%), enquanto margem, markup e adicional de hora
 * extra guardam **ponto percentual** (50 = 50%). Os presets abaixo estão
 * separados por isso, e trocá-los erra o resultado por 100×.
 */

export const QUICK_ADD_TAXA_MENSAL: QuickAddButton[] = [
  { label: '0,5%', value: 0.005, modo: 'definir', titulo: '0,5% ao mês' },
  { label: '0,8%', value: 0.008, modo: 'definir', titulo: '0,8% ao mês' },
  { label: '1%', value: 0.01, modo: 'definir', titulo: '1% ao mês' },
  { label: '1,5%', value: 0.015, modo: 'definir', titulo: '1,5% ao mês' },
]

export const QUICK_ADD_TAXA_ANUAL: QuickAddButton[] = [
  { label: '6%', value: 0.06, modo: 'definir', titulo: '6% ao ano (juro real típico de IPCA+)' },
  { label: '10%', value: 0.1, modo: 'definir', titulo: '10% ao ano' },
  { label: '12%', value: 0.12, modo: 'definir', titulo: '12% ao ano' },
  { label: '13,25%', value: 0.1325, modo: 'definir', titulo: 'Selic de referência 2026' },
]

/**
 * O campo de taxa do CDB muda de sentido conforme o indexador — "1,10" quer
 * dizer 110% do CDI, mas "0,12" quer dizer 12% ao ano. Os chips carregam as
 * duas escalas com o rótulo dizendo qual é qual, que é o que o `hint` sozinho
 * não conseguia resolver.
 */
export const QUICK_ADD_TAXA_CDB: QuickAddButton[] = [
  { label: '100% CDI', value: 1, modo: 'definir', titulo: 'Pós-fixado: 100% do CDI' },
  { label: '110% CDI', value: 1.1, modo: 'definir', titulo: 'Pós-fixado: 110% do CDI' },
  { label: '12% a.a.', value: 0.12, modo: 'definir', titulo: 'Prefixado: 12% ao ano' },
  { label: '6% real', value: 0.06, modo: 'definir', titulo: 'IPCA+: 6% de juro real' },
]

export const QUICK_ADD_SEGURO_FINANCIAMENTO: QuickAddButton[] = [
  { label: 'Sem seguro', value: 0, modo: 'definir', titulo: 'Zera o seguro MIP+DFI' },
  { label: '0,03%', value: 0.0003, modo: 'definir', titulo: '0,03% ao mês' },
  { label: '0,05%', value: 0.0005, modo: 'definir', titulo: '0,05% ao mês' },
]

/** Ponto percentual (50 = 50%), não decimal. */
export const QUICK_ADD_MARGEM: QuickAddButton[] = [
  { label: '10%', value: 10, modo: 'definir' },
  { label: '20%', value: 20, modo: 'definir' },
  { label: '30%', value: 30, modo: 'definir' },
  { label: '50%', value: 50, modo: 'definir' },
]

/** Ponto percentual. Markup costuma ser bem maior que margem. */
export const QUICK_ADD_MARKUP: QuickAddButton[] = [
  { label: '30%', value: 30, modo: 'definir' },
  { label: '50%', value: 50, modo: 'definir' },
  { label: '100%', value: 100, modo: 'definir' },
  { label: '150%', value: 150, modo: 'definir' },
]

/**
 * Ponto percentual. O `select` do formulário já oferece 60/70/80/100, então
 * este campo só aparece em "Outro percentual…" — os chips cobrem o que o
 * select não tem.
 */
export const QUICK_ADD_ADICIONAL_HE: QuickAddButton[] = [
  { label: '50%', value: 50, modo: 'definir', titulo: 'Mínimo legal do dia útil' },
  { label: '75%', value: 75, modo: 'definir' },
  { label: '90%', value: 90, modo: 'definir' },
  { label: '120%', value: 120, modo: 'definir' },
]
