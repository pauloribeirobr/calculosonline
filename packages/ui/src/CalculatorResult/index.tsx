'use client'

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

export function CalculatorResult({
  resultado,
  formato,
  titulo,
  nomeCalculadora,
  shareUrl,
  onShareClick,
}: CalculatorResultProps) {
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
              <span aria-hidden>⚠️</span> {aviso}
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

      {shareUrl && (
        <div className="border-t border-gray-100 px-4 py-3">
          <a
            href={buildWhatsAppShareHref(shareUrl, nomeCalculadora, resultado.resultado, formato)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onShareClick}
            className="inline-flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
          >
            <span aria-hidden>📤</span> Compartilhar via WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}
