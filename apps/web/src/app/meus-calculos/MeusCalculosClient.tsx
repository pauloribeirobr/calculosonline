'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrashIcon } from '@heroicons/react/24/outline'
import { CATEGORIAS_LABEL, findCalculator } from '@/lib/calculators'
import { CalculatorIcon } from '@/components/common/CalculatorIcon'
import {
  historicoDisponivel,
  listarCalculos,
  removerCalculo,
  type CalculoSalvo,
} from '@/lib/calculationHistory'
import { encodeShareData } from '@/lib/shareLink'

function formatarValor(valor: number, formato?: CalculoSalvo['resultadoFormato']): string {
  if (formato === 'percent') return `${valor.toLocaleString('pt-BR')}%`
  if (formato === 'integer') return valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
  if (formato === 'kcal') {
    return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kcal`
  }
  if (formato === 'number') return valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  return valor
    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    .replace(/ /g, ' ')
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MeusCalculosClient() {
  const [calculos, setCalculos] = useState<CalculoSalvo[] | null>(null)
  const [indisponivel, setIndisponivel] = useState(false)

  useEffect(() => {
    if (!historicoDisponivel()) {
      setIndisponivel(true)
      setCalculos([])
      return
    }
    listarCalculos()
      .then(setCalculos)
      .catch(() => setCalculos([]))
  }, [])

  async function handleRemover(id: string) {
    await removerCalculo(id)
    setCalculos((atual) => (atual ?? []).filter((c) => c.id !== id))
  }

  if (calculos === null) {
    return (
      <p className="text-sm text-gray-500" aria-live="polite">
        Carregando…
      </p>
    )
  }

  if (indisponivel) {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Seu navegador não suporta armazenamento local (IndexedDB) neste modo, então não é possível
        salvar cálculos aqui.
      </p>
    )
  }

  if (calculos.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        Você ainda não salvou nenhum cálculo. Em qualquer calculadora, depois de calcular, clique
        em <strong>&quot;Salvar cálculo&quot;</strong> para encontrá-lo aqui depois — fica guardado
        só neste navegador, sem cadastro.
      </p>
    )
  }

  return (
    <ul
      className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm"
      aria-label="Cálculos salvos"
    >
      {calculos.map((calculo) => (
        <li key={calculo.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {/* O registro salvo guarda o slug, não o ícone — buscar no registry
                evita migrar os cálculos que o usuário já tem no IndexedDB (F37). */}
            <CalculatorIconDoSlug slug={calculo.slug} />
            <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{calculo.titulo}</p>
            <p className="text-xs text-gray-500">
              {CATEGORIAS_LABEL[calculo.categoria]} · {formatarData(calculo.criadoEm)}
            </p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-brand-700">
              {formatarValor(calculo.resultadoValor, calculo.resultadoFormato)}
            </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/calculadora/${calculo.slug}?d=${encodeShareData(calculo.inputData)}&calc=${encodeURIComponent(calculo.id)}`}
              className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              Abrir
            </Link>
            <button
              type="button"
              onClick={() => handleRemover(calculo.id)}
              aria-label={`Remover cálculo salvo de ${calculo.titulo}`}
              className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600"
            >
              <TrashIcon className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * Ícone de um cálculo salvo, resolvido pelo slug no registry. Devolve `null`
 * se a calculadora não existir mais — a lista continua funcionando para
 * registros antigos apontando para um slug removido.
 */
function CalculatorIconDoSlug({ slug }: { slug: string }) {
  const calc = findCalculator(slug)
  if (!calc) return null
  return <CalculatorIcon icon={calc.icone} categoria={calc.categoria} size="md" />
}
