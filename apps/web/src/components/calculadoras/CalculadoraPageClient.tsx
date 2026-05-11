'use client'

import { useState } from 'react'
import {
  CalculatorLayout,
  CalculatorResult,
  RelatedCalculators,
} from '@calculosonline/ui'
import type { ErroValidacao, ResultadoCalculo } from '@calculosonline/core'
import {
  CATEGORIAS,
  type CalculadoraRegistro,
} from '@/lib/calculators'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { getCalculadoraForm } from './forms'

interface Props {
  config: CalculadoraRegistro
  relacionadas: CalculadoraRegistro[]
}

export function CalculadoraPageClient({ config, relacionadas }: Props) {
  const [resultado, setResultado] = useState<ResultadoCalculo<unknown> | null>(null)
  const [erros, setErros] = useState<ErroValidacao[]>([])

  const FormComponent = getCalculadoraForm(config.slug)
  const resultProps = config.formatoResultado
    ? { formato: config.formatoResultado }
    : {}

  return (
    <CalculatorLayout
      titulo={`${config.tituloLongo} Online e Gratuita`}
      descricao={config.descricao}
      fonteJuridica={config.fonteJuridica}
      dataAtualizacao={config.dataAtualizacao}
      breadcrumb={
        <Breadcrumbs
          items={[
            { label: 'Início', href: '/' },
            {
              label: CATEGORIAS[config.categoria].label,
              href: `/categoria/${config.categoria}`,
            },
            { label: config.titulo },
          ]}
        />
      }
      form={
        FormComponent ? (
          <>
            <FormComponent
              onResult={(r) => {
                setErros([])
                setResultado(r)
              }}
              onError={(e) => {
                setErros(e)
                setResultado(null)
              }}
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
          </>
        ) : (
          <p className="text-sm text-gray-600">
            Formulário desta calculadora ainda não foi implementado.
          </p>
        )
      }
      result={
        resultado ? (
          <CalculatorResult resultado={resultado} titulo="Resultado" {...resultProps} />
        ) : null
      }
      content={
        <>
          <h2>Sobre esta calculadora</h2>
          <p>{config.descricao}</p>
          <p>
            <strong>Base legal:</strong> {config.fonteJuridica}
          </p>
          <p>
            <strong>Atualizado em:</strong>{' '}
            {new Date(config.dataAtualizacao + 'T12:00:00').toLocaleDateString('pt-BR')}
          </p>
        </>
      }
      related={
        <RelatedCalculators
          items={relacionadas.map((r) => ({
            slug: r.slug,
            titulo: r.titulo,
            categoria: CATEGORIAS[r.categoria].label,
            descricaoCurta: r.descricaoCurta,
          }))}
        />
      }
    />
  )
}
