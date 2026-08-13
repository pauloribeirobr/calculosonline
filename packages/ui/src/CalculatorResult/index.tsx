'use client'

import { useEffect, useState } from 'react'
import {
  ArrowUpTrayIcon,
  BookmarkIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/20/solid'
import type { ItemDetalhamento, ResultadoCalculo } from '@calculosonline/core'
import { cn } from '../utils/cn'

export type CalculatorResultFormato =
  | 'currency'
  | 'percent'
  | 'number'
  | 'integer'
  | 'kcal'
  | ((v: number) => string)

export interface CalculatorResultProps {
  resultado: ResultadoCalculo<unknown>
  /** Formatação do valor headline. `currency` por padrão. */
  formato?: CalculatorResultFormato
  titulo?: string
  /** Nome da calculadora pra compor a mensagem de compartilhamento (ex. "13º Salário"). */
  nomeCalculadora?: string | undefined
  /** Link com os valores do cálculo (base64) — presente só ativa o botão "Compartilhar via WhatsApp". */
  shareUrl?: string | undefined
  /** Chamado ao clicar em compartilhar, antes de abrir o WhatsApp (ex. para registrar analytics). */
  onShareClick?: (() => void) | undefined
  /**
   * Persiste o cálculo (IndexedDB, F37) — presente só ativa o botão "Salvar
   * cálculo". O componente só cuida do estado visual (salvando/salvo/erro);
   * quem chama decide onde/como guardar.
   */
  onSalvarCalculo?: (() => Promise<void>) | undefined
  /**
   * `true` quando o `resultado` atual já corresponde a um cálculo salvo
   * (ex.: aberto via "Abrir" em `/meus-calculos`) — troca o botão "Salvar
   * cálculo" por um indicador "Cálculo salvo" + botão "Excluir". Editar o
   * formulário e recalcular volta ao estado normal (é outro cálculo).
   */
  salvo?: boolean | undefined
  /** Remove o cálculo salvo (IndexedDB, F37) — presente só ativa "Excluir". */
  onExcluirCalculo?: (() => Promise<void>) | undefined
}

function formatarValor(valor: number, formato: CalculatorResultFormato = 'currency'): string {
  if (typeof formato === 'function') return formato(valor)
  if (formato === 'currency') {
    return valor
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      .replace(/\u00a0/g, ' ')
  }
  if (formato === 'percent') return `${valor.toFixed(2)}%`
  if (formato === 'integer') return valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
  if (formato === 'kcal') {
    return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kcal`
  }
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

function corNatureza(tipo: ItemDetalhamento['tipo']) {
  return {
    credito: 'text-result-positive',
    debito: 'text-result-negative',
    neutro: 'text-gray-700',
  }[tipo]
}

/** Prefixo (+)/(-) por linha — só nos itens que entram na soma (crédito/débito). */
function sinalNatureza(tipo: ItemDetalhamento['tipo']): string {
  return { credito: '+ ', debito: '− ', neutro: '' }[tipo]
}

type FormatoItem = 'currency' | 'percent' | 'number' | 'kg' | 'meter' | 'kcal' | 'gram' | 'empty'

function normalizarDescricao(descricao: string): string {
  return descricao
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function inferirFormatoItem(item: ItemDetalhamento): FormatoItem {
  const titulo = normalizarDescricao(item.descricao)
  const natureza = item.tipo

  if (item.valor === 0 && natureza === 'neutro' && !item.formula) return 'empty'
  if (titulo.includes('aliquota')) return natureza === 'neutro' ? 'percent' : 'currency'
  if (titulo.includes('cet')) return 'percent'
  if (titulo.includes('taxa') && titulo.includes('efetiva')) return 'percent'
  if (titulo.includes('margem')) return 'percent'
  if (titulo.includes('rentabilidade') || titulo.includes('markup')) return 'percent'
  if (titulo === 'imc') return 'number'
  if (titulo === 'peso' || titulo.includes('peso ideal')) return 'kg'
  if (titulo === 'altura') return 'meter'
  if (titulo.includes('tmb') || titulo.includes('tdee') || titulo.includes('meta')) return 'kcal'
  if (titulo.includes('proteina') || titulo.includes('carboidrato') || titulo.includes('gordura')) {
    return 'gram'
  }
  return 'currency'
}

function formatarItem(item: ItemDetalhamento): string {
  const formato = inferirFormatoItem(item)
  if (formato === 'empty') return ''
  if (formato === 'percent') return `${item.valor.toLocaleString('pt-BR')}%`
  if (formato === 'number') return item.valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  if (formato === 'kg')
    return `${item.valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg`
  if (formato === 'meter')
    return `${item.valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} m`
  if (formato === 'kcal')
    return `${item.valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kcal`
  if (formato === 'gram')
    return `${item.valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} g`
  return item.valor
    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    .replace(/\u00a0/g, ' ')
}

function buildWhatsAppShareHref(
  shareUrl: string,
  nomeCalculadora: string | undefined,
  valorHeadline: number,
  formato: CalculatorResultFormato | undefined,
): string {
  const nome = nomeCalculadora ?? 'este cálculo'
  const valor = formatarValor(valorHeadline, formato)
  const mensagem = `Calculei ${nome}: ${valor} — confira ou refaça com seus valores: ${shareUrl}`
  return `https://wa.me/?text=${encodeURIComponent(mensagem)}`
}

type EstadoSalvar = 'idle' | 'salvando' | 'salvo' | 'erro'

export function CalculatorResult({
  resultado,
  formato,
  titulo,
  nomeCalculadora,
  shareUrl,
  onShareClick,
  onSalvarCalculo,
  salvo = false,
  onExcluirCalculo,
}: CalculatorResultProps) {
  const [estadoSalvar, setEstadoSalvar] = useState<EstadoSalvar>(salvo ? 'salvo' : 'idle')
  const [excluindo, setExcluindo] = useState(false)

  // Novo cálculo (resultado trocou de referência) reseta o botão de salvar —
  // exceto quando `salvo` já vem `true` junto (aberto via cálculo salvo).
  useEffect(() => {
    setEstadoSalvar(salvo ? 'salvo' : 'idle')
  }, [resultado, salvo])

  async function handleSalvar() {
    if (!onSalvarCalculo) return
    setEstadoSalvar('salvando')
    try {
      await onSalvarCalculo()
      setEstadoSalvar('salvo')
    } catch {
      setEstadoSalvar('erro')
    }
  }

  async function handleExcluir() {
    if (!onExcluirCalculo) return
    setExcluindo(true)
    try {
      await onExcluirCalculo()
    } catch {
      // IndexedDB raramente falha aqui — deixa o usuário tentar de novo.
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      role="region"
      aria-label="Resultado do cálculo"
    >
      <div className="bg-brand-600 px-6 py-5 text-white">
        {titulo && <p className="mb-1 text-sm font-medium opacity-80">{titulo}</p>}
        <p className="text-result-lg font-semibold tabular-nums tracking-normal" aria-live="polite">
          {formatarValor(resultado.resultado, formato)}
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs opacity-75">
          <span>Tabelas: {resultado.dataReferencia}</span>
        </div>
      </div>

      {resultado.avisos && resultado.avisos.length > 0 && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
          {resultado.avisos.map((aviso, i) => (
            <p key={i} className="flex items-start gap-1 text-xs text-amber-800">
              <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden /> {aviso}
            </p>
          ))}
        </div>
      )}

      <div className="divide-y divide-gray-100">
        <p className="px-4 py-3 text-sm font-medium text-gray-700">Detalhamento do cálculo</p>

        <ul
          id="detalhamento-lista"
          className="space-y-1 px-4 py-2"
          role="list"
          aria-label="Detalhamento linha a linha"
        >
          {resultado.detalhamento.map((item, i) => {
            const valorFormatado = formatarItem(item)

            return (
              <li key={i} className="flex items-baseline justify-between py-1">
                <span className="flex-1 pr-4 text-sm text-gray-600">
                  {item.descricao}
                  {item.formula && (
                    <span className="ml-1 font-mono text-xs text-gray-400">({item.formula})</span>
                  )}
                </span>
                {valorFormatado && (
                  <span className={cn('text-sm font-medium tabular-nums', corNatureza(item.tipo))}>
                    {sinalNatureza(item.tipo)}
                    {valorFormatado}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
        <p className="text-xs text-gray-500">
          <strong>Base legal:</strong> {resultado.fonteJuridica}
        </p>
        <p className="mt-0.5 text-xs text-gray-400">{resultado.baseCalculo}</p>
      </div>

      {(shareUrl || onSalvarCalculo || onExcluirCalculo) && (
        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-4 py-3">
          {shareUrl && (
            <a
              href={buildWhatsAppShareHref(shareUrl, nomeCalculadora, resultado.resultado, formato)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onShareClick}
              className="inline-flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
            >
              <ArrowUpTrayIcon className="h-4 w-4" aria-hidden /> Compartilhar via WhatsApp
            </a>
          )}

          {estadoSalvar === 'salvo' ? (
            <>
              {/* Status, não ação — sem borda/fundo de botão, pra não parecer
                  clicável ao lado de "Compartilhar"/"Excluir" de verdade. */}
              <span className="inline-flex items-center gap-1.5 py-2 text-sm font-medium text-gray-500">
                <CheckCircleIcon className="h-4 w-4 text-brand-600" aria-hidden /> Cálculo salvo
              </span>
              {onExcluirCalculo && (
                <button
                  type="button"
                  onClick={handleExcluir}
                  disabled={excluindo}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-default disabled:opacity-70"
                >
                  <TrashIcon className="h-4 w-4" aria-hidden />
                  {excluindo ? 'Excluindo…' : 'Excluir'}
                </button>
              )}
            </>
          ) : (
            onSalvarCalculo && (
              <button
                type="button"
                onClick={handleSalvar}
                disabled={estadoSalvar === 'salvando'}
                className="inline-flex items-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100 disabled:cursor-default disabled:opacity-90"
              >
                <BookmarkIcon className="h-4 w-4" aria-hidden />
                {estadoSalvar === 'salvando'
                  ? 'Salvando…'
                  : estadoSalvar === 'erro'
                    ? 'Erro ao salvar — tentar de novo'
                    : 'Salvar cálculo'}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
