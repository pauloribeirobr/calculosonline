'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CalculatorLayout, CalculatorResult, RelatedCalculators } from '@calculosonline/ui'
import type { ErroValidacao, ResultadoCalculo } from '@calculosonline/core'
import { CATEGORIAS, type CalculadoraRegistro } from '@/lib/calculators'
import { CalculatorIcon } from '@/components/common/CalculatorIcon'
import { analytics } from '@/lib/analytics'
import { buildShareUrl, readShareParam } from '@/lib/shareLink'
import { salvarCalculo, removerCalculo } from '@/lib/calculationHistory'
import { siteConfig } from '@/lib/seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { getCalculadoraForm } from './forms'

interface Props {
  config: CalculadoraRegistro
  relacionadas: CalculadoraRegistro[]
}

/**
 * Isolado num componente próprio + Suspense porque `useSearchParams()` exige
 * isso pra não forçar a página inteira (hoje SSG/ISR) a virar dinâmica —
 * só esse leaf invisível opta por CSR, o resto da página continua estático.
 * Lê tanto `d` (F32, valores compartilhados) quanto `calc` (F37, id do
 * cálculo salvo — presente só quando veio do "Abrir" em `/meus-calculos`).
 */
function SharedDataReader({
  onData,
  onCalcId,
}: {
  onData: (data: Record<string, unknown> | null) => void
  onCalcId: (id: string | null) => void
}) {
  const searchParams = useSearchParams()
  useEffect(() => {
    onData(readShareParam(searchParams))
    onCalcId(searchParams.get('calc'))
  }, [searchParams, onData, onCalcId])
  return null
}

export function CalculadoraPageClient({ config, relacionadas }: Props) {
  const [resultado, setResultado] = useState<ResultadoCalculo<unknown> | null>(null)
  const [erros, setErros] = useState<ErroValidacao[]>([])
  const [inputData, setInputData] = useState<Record<string, unknown> | null>(null)
  const [sharedData, setSharedData] = useState<Record<string, unknown> | null>(null)
  const [savedCalcId, setSavedCalcId] = useState<string | null>(null)
  // Id pendente lido da URL (`calc`), aplicado só no 1º resultado calculado
  // (o auto-submit do cálculo compartilhado) — consumido (setado pra null)
  // depois, pra um reenvio manual do formulário não herdar o id de um
  // cálculo antigo. Precisa ser state (setter estável), não uma ref lida
  // dentro de um callback inline: `SharedDataReader` reexecuta o efeito
  // sempre que a prop `onCalcId` muda de referência, e uma função inline
  // recriada a cada render "ressuscitaria" o id da URL depois de consumido.
  const [pendingCalcId, setPendingCalcId] = useState<string | null>(null)

  const FormComponent = getCalculadoraForm(config.slug)
  const resultProps = config.formatoResultado ? { formato: config.formatoResultado } : {}

  const shareUrl = inputData
    ? buildShareUrl(`${siteConfig.url}/calculadora/${config.slug}`, inputData)
    : undefined

  return (
    <>
      <Suspense fallback={null}>
        <SharedDataReader onData={setSharedData} onCalcId={setPendingCalcId} />
      </Suspense>
      <CalculatorLayout
        titulo={`${config.tituloLongo} Online e Gratuita`}
        descricao={config.descricao}
        icone={<CalculatorIcon icon={config.icone} categoria={config.categoria} size="xl" />}
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
              {sharedData && (
                <p className="border-brand-200 bg-brand-50 text-brand-700 mb-4 rounded-md border px-3 py-2 text-sm">
                  Valores de um cálculo compartilhado — edite e recalcule à vontade.
                </p>
              )}
              <FormComponent
                sharedData={sharedData ?? undefined}
                autoSubmit={!!sharedData}
                onResult={(r, data) => {
                  setErros([])
                  setResultado(r)
                  setInputData(data ?? null)
                  // Só o cálculo que consome o `calc` pendente da URL nasce
                  // "salvo"; qualquer recálculo manual depois disso é um
                  // cálculo novo/editado, não o registro salvo original.
                  if (pendingCalcId) {
                    setSavedCalcId(pendingCalcId)
                    setPendingCalcId(null)
                  } else {
                    setSavedCalcId(null)
                  }
                  analytics.calculatorCalculated(
                    config.slug,
                    config.categoria,
                    sharedData ? 'shared_link' : 'manual',
                  )
                }}
                onError={(e) => {
                  setErros(e)
                  setResultado(null)
                  setInputData(null)
                  analytics.calculatorValidationError(
                    config.slug,
                    config.categoria,
                    e.length,
                    e.map((erro) => erro.campo),
                  )
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
            <CalculatorResult
              resultado={resultado}
              titulo="Resultado"
              nomeCalculadora={config.titulo}
              shareUrl={shareUrl}
              onShareClick={() => analytics.calculatorShared(config.slug, config.categoria)}
              onSalvarCalculo={
                inputData
                  ? async () => {
                      const registro = await salvarCalculo({
                        slug: config.slug,
                        titulo: config.titulo,
                        categoria: config.categoria,
                        inputData,
                        resultadoValor: resultado.resultado,
                        ...(config.formatoResultado !== undefined
                          ? { resultadoFormato: config.formatoResultado }
                          : {}),
                      })
                      setSavedCalcId(registro.id)
                      analytics.calculatorSaved(config.slug, config.categoria)
                    }
                  : undefined
              }
              salvo={savedCalcId !== null}
              onExcluirCalculo={
                savedCalcId
                  ? async () => {
                      await removerCalculo(savedCalcId)
                      setSavedCalcId(null)
                    }
                  : undefined
              }
              {...resultProps}
            />
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
              icone: <CalculatorIcon icon={r.icone} categoria={r.categoria} size="md" />,
            }))}
          />
        }
      />
    </>
  )
}
