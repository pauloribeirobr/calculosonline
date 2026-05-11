'use client'

import { useState } from 'react'
import type { ItemDetalhamento, ResultadoCalculo } from '@calculosonline/core'
import { cn } from '../utils/cn'

export type CalculatorResultFormato =
  | 'currency'
  | 'percent'
  | 'number'
  | ((v: number) => string)

export interface CalculatorResultProps {
  resultado: ResultadoCalculo<unknown>
  /** Formatação do valor headline. `currency` por padrão. */
  formato?: CalculatorResultFormato
  titulo?: string
}

function formatarValor(valor: number, formato: CalculatorResultFormato = 'currency'): string {
  if (typeof formato === 'function') return formato(valor)
  if (formato === 'currency') {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }
  if (formato === 'percent') return `${valor.toFixed(2)}%`
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function corItem(tipo: ItemDetalhamento['tipo']) {
  return {
    credito: 'text-result-positive',
    debito: 'text-result-negative',
    neutro: 'text-gray-700',
  }[tipo]
}

function formatarItem(item: ItemDetalhamento): string {
  const tituloLower = item.descricao.toLowerCase()
  // Para alíquotas, IMC e contadores, evitamos formatar como moeda.
  if (item.tipo === 'neutro' && tituloLower.includes('alíquota')) {
    return `${item.valor.toFixed(2)}%`
  }
  return item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function CalculatorResult({ resultado, formato, titulo }: CalculatorResultProps) {
  const [aberto, setAberto] = useState(false)

  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      role="region"
      aria-label="Resultado do cálculo"
    >
      <div className="bg-brand-600 px-6 py-5 text-white">
        {titulo && <p className="mb-1 text-sm font-medium opacity-80">{titulo}</p>}
        <p className="font-mono text-result-lg" aria-live="polite">
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
        <button
          type="button"
          onClick={() => setAberto(!aberto)}
          className={cn(
            'flex w-full items-center justify-between px-4 py-3',
            'text-sm font-medium text-gray-700 hover:bg-gray-50',
            'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500',
          )}
          aria-expanded={aberto}
          aria-controls="detalhamento-lista"
        >
          <span>Ver detalhamento do cálculo</span>
          <span
            className={cn('transition-transform duration-200', aberto && 'rotate-180')}
            aria-hidden
          >
            ▼
          </span>
        </button>

        {aberto && (
          <ul
            id="detalhamento-lista"
            className="space-y-1 px-4 py-2"
            role="list"
            aria-label="Detalhamento linha a linha"
          >
            {resultado.detalhamento.map((item, i) => (
              <li key={i} className="flex items-baseline justify-between py-1">
                <span className="flex-1 pr-4 text-sm text-gray-600">
                  {item.descricao}
                  {item.formula && (
                    <span className="ml-1 font-mono text-xs text-gray-400">
                      ({item.formula})
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'font-mono text-sm font-medium tabular-nums',
                    corItem(item.tipo),
                  )}
                >
                  {formatarItem(item)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
        <p className="text-xs text-gray-500">
          <strong>Base legal:</strong> {resultado.fonteJuridica}
        </p>
        <p className="mt-0.5 text-xs text-gray-400">{resultado.baseCalculo}</p>
      </div>
    </div>
  )
}
