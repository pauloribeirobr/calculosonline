'use client'

import { useId, useRef, useState, type MouseEvent } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import {
  ArrowRightIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/20/solid'
import { CalculatorForm, useCopiarValor } from '@calculosonline/ui'
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

type Bloco = PanoramaTrabalhistaResultado['blocos'][number]

/**
 * Um card do panorama (F58), com os alvos de clique da F70.
 *
 * O Clarity mediu, no PC, quase metade dos cliques nos cards errando o alvo:
 * caíam no `LI` (título, legenda, fundo), e só o texto "Ver como chegou nesse
 * valor" abria o detalhamento. Agora **qualquer clique em área não interativa
 * do card** abre e fecha. O `<summary>` continua sendo o controle de teclado
 * e de leitor de tela (o título fica fora dele de propósito: heading dentro de
 * `summary` some da navegação por títulos). O valor e as linhas do
 * detalhamento copiam ao clicar, como no `CalculatorResult`.
 */
function BlocoPanorama({ bloco }: { bloco: Bloco }) {
  const calc = findCalculator(bloco.slugCalculadora)
  const detalhesRef = useRef<HTMLDetailsElement>(null)
  const { copiado, copiar } = useCopiarValor()
  const dicaId = useId()

  async function handleCopiar(chave: string, texto: string, alvo: 'bloco' | 'linha', rotulo: string) {
    if (await copiar(chave, texto)) {
      analytics.resultCopied(HUB_TRABALHISTA.slug, HUB_TRABALHISTA.categoria, alvo, rotulo)
    }
  }

  function alternarPeloCard(e: MouseEvent<HTMLLIElement>) {
    const alvo = e.target as HTMLElement
    const detalhes = detalhesRef.current
    if (!detalhes) return
    // Controles têm ação própria (o summary já alterna sozinho), e o conteúdo
    // aberto é para ler e selecionar, não para fechar sem querer.
    if (alvo.closest('a, button, summary, input, select, textarea')) return
    if (alvo.closest('[data-conteudo-detalhes]')) return
    // Quem arrastou para selecionar texto não clicou para alternar.
    if (window.getSelection()?.toString()) return
    detalhes.open = !detalhes.open
  }

  const valorTexto = formatarBRL(bloco.valor)

  return (
    <li
      onClick={alternarPeloCard}
      className="flex cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-brand-200"
    >
      <div className="flex items-start gap-3">
        {calc && <CalculatorIcon icon={calc.icone} categoria={calc.categoria} size="lg" />}
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900">{bloco.titulo}</h3>
          <p className="mt-0.5 text-xs leading-snug text-gray-500">{bloco.legenda}</p>
        </div>
      </div>

      <p className="mt-4">
        <button
          type="button"
          onClick={() => handleCopiar('bloco', valorTexto, 'bloco', bloco.titulo)}
          aria-describedby={dicaId}
          title="Copiar valor"
          className="group -mx-1.5 inline-flex cursor-copy items-center gap-2 rounded-md px-1.5 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <span className="text-result-lg text-gray-900">{valorTexto}</span>
          {copiado === 'bloco' ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700">
              <CheckIcon className="h-4 w-4" aria-hidden /> Copiado
            </span>
          ) : (
            <DocumentDuplicateIcon
              className="h-5 w-5 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600"
              aria-hidden
            />
          )}
        </button>
      </p>

      <details ref={detalhesRef} className="group/detalhes mt-3 border-t border-gray-100 pt-1">
        {/* Faixa inteira clicável, com seta: o alvo antigo era só o texto. */}
        <summary className="-mx-2 flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-brand-600 hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
          Ver como chegou nesse valor
          <ChevronDownIcon
            className="h-4 w-4 shrink-0 transition-transform group-open/detalhes:rotate-180"
            aria-hidden
          />
        </summary>
        <div data-conteudo-detalhes className="cursor-auto">
          <ul className="mt-2 space-y-0.5 text-sm">
            {bloco.linhas.map((linha, i) => {
              const chave = `linha-${i}`
              const texto = formatarBRL(linha.valor)
              return (
                <li key={`${bloco.id}-${i}`}>
                  <button
                    type="button"
                    onClick={() => handleCopiar(chave, texto, 'linha', `${bloco.titulo}: ${linha.descricao}`)}
                    aria-describedby={dicaId}
                    title="Copiar valor"
                    className="group -mx-1.5 flex w-[calc(100%+0.75rem)] cursor-copy items-baseline justify-between gap-3 rounded px-1.5 py-1 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <span className="min-w-0 text-gray-600">
                      {linha.descricao}
                      {linha.formula && (
                        <span className="block text-xs text-gray-400">{linha.formula}</span>
                      )}
                    </span>
                    <span className="inline-flex shrink-0 items-baseline gap-1.5">
                      {copiado === chave ? (
                        <CheckIcon className="h-3.5 w-3.5 self-center text-brand-600" aria-hidden />
                      ) : (
                        <DocumentDuplicateIcon
                          className="h-3.5 w-3.5 self-center text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                          aria-hidden
                        />
                      )}
                      <span className={`font-medium ${corDe(linha.tipo)}`}>
                        {sinalDe(linha.tipo)}
                        {texto}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="mt-3 text-xs text-gray-400">{bloco.fonteJuridica}</p>
        </div>
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

      <span id={dicaId} className="sr-only">
        Clique para copiar o valor
      </span>
      <span role="status" className="sr-only">
        {copiado ? 'Valor copiado' : ''}
      </span>
    </li>
  )
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
              { value: 'aposentadoria', label: 'Aposentadoria (saída a pedido do trabalhador)' },
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
            {panorama.dados.blocos.map((bloco) => (
              <BlocoPanorama key={bloco.id} bloco={bloco} />
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
