'use client'

import { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { ArrowRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { CalculatorForm } from '@calculosonline/ui'
import {
  calcularPanoramaTrabalhista,
  type PanoramaTrabalhistaResultado,
} from '@calculosonline/core/trabalhista'
import type { ErroValidacao, ItemDetalhamento, ResultadoCalculo } from '@calculosonline/core'
import { findCalculator } from '@/lib/calculators'
import { HUB_TRABALHISTA } from '@/lib/hubTrabalhista'
import { QUICK_ADD_SALARIO, QUICK_ADD_VALOR_GRANDE } from '@/lib/quickAddPresets'
import { CalculatorIcon } from '@/components/common/CalculatorIcon'
import { analytics } from '@/lib/analytics'

/**
 * Formulário único do hub (F58) e os quatro blocos de resultado.
 *
 * **Os campos são exatamente os da rescisão, e isso é a decisão de escopo.**
 * O hub tem de custar *menos* preenchimento que abrir quatro calculadoras, não
 * mais — então nada que só uma das quatro precisa entra aqui. `diasFaltas`
 * (que reduz os dias de férias pelo art. 130) e `diasAbono` ficaram de fora
 * por isso: o motor aceita os dois, a página avisa que assumiu zero faltas, e
 * quem tem faltas no período aquisitivo é mandado para a calculadora de
 * férias, que trata o caso inteiro.
 */

const schema = z.object({
  salarioBruto: z.number().positive('Salário deve ser positivo').default(0),
  dataAdmissao: z.string().min(10, 'Data inválida'),
  dataSaida: z.string().min(10, 'Data inválida'),
  motivoRescisao: z.enum([
    'sem_justa_causa',
    'com_justa_causa_emp',
    'justa_causa',
    'pedido_demissao',
    'acordo_mutuo',
    'aposentadoria',
  ]),
  saldoFGTS: z.number().min(0, 'FGTS não pode ser negativo').default(0),
  feriasVencidas: z.number().min(0).max(2).default(0),
  numeroDependentesIRRF: z.number().min(0).default(0),
})

function formatarBRL(valor: number): string {
  return valor
    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    .replace(/ /g, ' ')
}

/** Mesma convenção de sinal do `CalculatorResult`: só crédito/débito ganham sinal. */
function sinalDe(tipo: ItemDetalhamento['tipo']): string {
  return { credito: '+ ', debito: '− ', neutro: '' }[tipo]
}

function corDe(tipo: ItemDetalhamento['tipo']): string {
  return {
    credito: 'text-result-positive',
    debito: 'text-result-negative',
    neutro: 'text-gray-700',
  }[tipo]
}

export function PanoramaTrabalhistaClient() {
  const [panorama, setPanorama] = useState<
    ResultadoCalculo<PanoramaTrabalhistaResultado> | null
  >(null)
  const [erros, setErros] = useState<ErroValidacao[]>([])

  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularPanoramaTrabalhista(data)
    if (r.sucesso) {
      setErros([])
      setPanorama(r.dados)
      analytics.calculatorCalculated(HUB_TRABALHISTA.slug, HUB_TRABALHISTA.categoria)
    } else {
      setPanorama(null)
      setErros(r.erros)
      analytics.calculatorValidationError(
        HUB_TRABALHISTA.slug,
        HUB_TRABALHISTA.categoria,
        r.erros.length,
        r.erros.map((e) => e.campo),
      )
    }
  }

  return (
    <section
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"
      aria-label="Calculadora trabalhista completa"
    >
      <CalculatorForm
        schema={schema}
        fields={{
          salarioBruto: {
            label: 'Salário Bruto',
            prefix: 'R$',
            type: 'currency',
            quickAdd: QUICK_ADD_SALARIO,
            hint: 'O salário atual, antes dos descontos.',
          },
          dataAdmissao: {
            label: 'Data de Admissão',
            type: 'date',
            hint: 'Digite direto: 01011990 vira 01/01/1990.',
            dateShortcuts: [
              { label: 'Há 1 ano', kind: 'anosAtras', anos: 1 },
              { label: 'Há 2 anos', kind: 'anosAtras', anos: 2 },
              { label: 'Há 5 anos', kind: 'anosAtras', anos: 5 },
              { label: 'Há 10 anos', kind: 'anosAtras', anos: 10 },
            ],
          },
          dataSaida: {
            label: 'Data de Saída',
            type: 'date',
            hint: 'Ainda trabalha na empresa? Use hoje — o resultado vira a projeção de sair agora.',
            dateShortcuts: [
              { label: 'Hoje', kind: 'hoje' },
              { label: 'Fim do mês', kind: 'fimDoMes' },
            ],
          },
          motivoRescisao: {
            label: 'Motivo da Saída',
            type: 'select',
            options: [
              { value: 'sem_justa_causa', label: 'Demissão sem justa causa' },
              {
                value: 'com_justa_causa_emp',
                label: 'Rescisão indireta (justa causa do empregador)',
              },
              { value: 'justa_causa', label: 'Justa causa do empregado' },
              { value: 'pedido_demissao', label: 'Pedido de demissão' },
              { value: 'acordo_mutuo', label: 'Acordo mútuo (art. 484-A)' },
              { value: 'aposentadoria', label: 'Aposentadoria' },
            ],
          },
          saldoFGTS: {
            label: 'Saldo do FGTS',
            prefix: 'R$',
            type: 'currency',
            quickAdd: QUICK_ADD_VALOR_GRANDE,
            hint: 'Consulte no app FGTS. Não sabe? Deixe zero — o bloco do FGTS estima quanto deveria haver.',
          },
          feriasVencidas: {
            label: 'Períodos de férias vencidas',
            type: 'stepper',
            min: 0,
            max: 2,
            hint: '0, 1 ou 2 períodos completos não gozados',
          },
          numeroDependentesIRRF: {
            label: 'Dependentes (IRRF)',
            type: 'stepper',
          },
        }}
        onSubmit={handleSubmit}
        submitLabel="Calcular tudo de uma vez"
      />

      {erros.length > 0 && (
        <ul
          role="alert"
          className="mt-4 space-y-1 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {erros.map((e) => (
            <li key={e.campo}>
              <strong>{e.campo}:</strong> {e.mensagem}
            </li>
          ))}
        </ul>
      )}

      {panorama && (
        <div className="mt-8 space-y-5">
          <header>
            <h2 className="text-xl font-bold text-gray-900">Seu panorama trabalhista</h2>
            <p className="mt-1 text-sm text-gray-600">
              {panorama.baseCalculo}
            </p>
          </header>

          {/*
            O aviso vem ANTES dos números, e não num rodapé de letra miúda: a
            leitura errada (somar os quatro) acontece no primeiro olhar, então
            é aí que ela precisa ser interceptada.
          */}
          {panorama.avisos && panorama.avisos.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                <InformationCircleIcon className="h-5 w-5 shrink-0" aria-hidden />
                Antes de ler os números
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
                {panorama.avisos.map((aviso) => (
                  <li key={aviso}>{aviso}</li>
                ))}
              </ul>
            </div>
          )}

          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {panorama.dados.blocos.map((bloco) => {
              const calc = findCalculator(bloco.slugCalculadora)
              return (
                <li
                  key={bloco.id}
                  className="flex flex-col rounded-xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex items-start gap-3">
                    {calc && (
                      <CalculatorIcon
                        icon={calc.icone}
                        categoria={calc.categoria}
                        size="lg"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900">{bloco.titulo}</h3>
                      <p className="mt-0.5 text-xs leading-snug text-gray-500">
                        {bloco.legenda}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-result-lg text-gray-900">
                    {formatarBRL(bloco.valor)}
                  </p>

                  <details className="mt-3 border-t border-gray-100 pt-3">
                    <summary className="cursor-pointer text-sm font-medium text-brand-600">
                      Ver como chegou nesse valor
                    </summary>
                    <ul className="mt-3 space-y-1.5 text-sm">
                      {bloco.linhas.map((linha, i) => (
                        <li
                          key={`${bloco.id}-${i}`}
                          className="flex items-baseline justify-between gap-3"
                        >
                          <span className="min-w-0 text-gray-600">
                            {linha.descricao}
                            {linha.formula && (
                              <span className="block text-xs text-gray-400">
                                {linha.formula}
                              </span>
                            )}
                          </span>
                          <span className={`shrink-0 font-medium ${corDe(linha.tipo)}`}>
                            {sinalDe(linha.tipo)}
                            {formatarBRL(linha.valor)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-gray-400">{bloco.fonteJuridica}</p>
                  </details>

                  {calc && (
                    <Link
                      href={`/calculadora/${calc.slug}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
                    >
                      Abrir a calculadora de {calc.titulo}
                      <ArrowRightIcon className="h-4 w-4" aria-hidden />
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
