'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  formatarDataExtenso,
  proximoFeriado,
  type ProximoFeriado,
} from '@calculosonline/core/tempo'
import { hojeISO } from '@calculosonline/core/utils'
import { ehAnoPublicado, pathDoAno } from '@/lib/feriados'

/**
 * "Hoje é feriado?" e o próximo feriado nacional.
 *
 * **Calculado no navegador, de propósito.** As páginas são estáticas com ISR
 * de 24h: um "hoje" renderizado no servidor pode estar um dia atrasado, e
 * numa resposta a "hoje é feriado?" um dia de atraso é a resposta errada. O
 * HTML do servidor traz só o espaço reservado (sem pulo de layout), e a data
 * de Brasília (`hojeISO`) é lida depois de montar.
 */
export function HojeEFeriado() {
  const [estado, setEstado] = useState<{ hoje: string; proximo: ProximoFeriado | null } | null>(
    null,
  )

  useEffect(() => {
    const hoje = hojeISO()
    setEstado({ hoje, proximo: proximoFeriado(hoje) })
  }, [])

  const proximo = estado?.proximo
  const ehHoje = proximo?.diasAte === 0
  const anoDoProximo = proximo ? Number(proximo.feriado.data.slice(0, 4)) : null

  return (
    <section
      aria-labelledby="hoje-e-feriado"
      aria-live="polite"
      data-testid="hoje-e-feriado"
      className="border-brand-200 bg-brand-50 min-h-[7.5rem] rounded-xl border p-5"
    >
      <h2
        id="hoje-e-feriado"
        className="text-brand-700 text-sm font-semibold uppercase tracking-wide"
      >
        Hoje é feriado?
      </h2>
      {!estado ? (
        <p className="mt-2 text-gray-500">Conferindo a data de hoje…</p>
      ) : !proximo ? null : (
        <>
          <p className="mt-2 text-xl font-bold text-gray-900" data-testid="resposta-hoje">
            {ehHoje ? `Sim — hoje é ${proximo.feriado.nome}.` : 'Não, hoje não é feriado nacional.'}
          </p>
          {!ehHoje && (
            <p className="mt-1 text-gray-700" data-testid="proximo-feriado">
              O próximo é <strong>{proximo.feriado.nome}</strong>,{' '}
              {formatarDataExtenso(proximo.feriado.data)} —{' '}
              {proximo.diasAte === 1 ? 'amanhã' : `daqui a ${proximo.diasAte} dias`}.
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Hoje é {formatarDataExtenso(estado.hoje)}, pelo horário de Brasília. Feriados estaduais
            e municipais não entram.
            {anoDoProximo !== null && ehAnoPublicado(anoDoProximo) && (
              <>
                {' '}
                <Link href={pathDoAno(anoDoProximo)} className="text-brand-700 underline">
                  Ver todos os feriados de {anoDoProximo}
                </Link>
                .
              </>
            )}
          </p>
        </>
      )}
    </section>
  )
}
