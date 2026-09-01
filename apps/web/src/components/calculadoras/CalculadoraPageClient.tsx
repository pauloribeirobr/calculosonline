'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
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
 * Leva scroll **e foco** até um elemento (F59).
 *
 * O foco é a metade que costuma faltar: rolar sozinho move a tela e deixa o
 * cursor de teclado/leitor de tela parado onde estava. Os alvos daqui são
 * `tabIndex={-1}` — focáveis por código, fora da ordem de Tab —, e o
 * `preventScroll` evita que o navegador dê um segundo pulo por conta própria
 * depois do `scrollIntoView`.
 */
function irPara(elemento: HTMLElement | null) {
  if (!elemento) return
  const reduzirMovimento =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  elemento.scrollIntoView({
    behavior: reduzirMovimento ? 'auto' : 'smooth',
    block: 'start',
  })
  elemento.focus({ preventScroll: true })
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

  // F59 — abrir um cálculo salvo (`/meus-calculos` → "Abrir") ou um link
  // compartilhado (F32) caía no topo da página, com o resultado já calculado
  // lá embaixo: a pessoa pedia um número e recebia o formulário de novo.
  //
  // Só vale para essas duas aberturas. Em visita normal a página tem de abrir
  // no H1 — o tráfego é praticamente todo orgânico, e pular o conteúdo
  // editorial seria desfazer o F43/F47 na prática.
  const resultadoRef = useRef<HTMLDivElement>(null)
  const formularioRef = useRef<HTMLDivElement>(null)
  // Dispara uma vez só, no primeiro resultado auto-calculado. Sem isso, um
  // recálculo manual depois de editar rolaria a página de novo, e a rolagem
  // brigaria com a restauração de scroll do botão "voltar" do navegador.
  const jaDirecionou = useRef(false)
  const veioDeCalculoPronto = sharedData !== null

  useEffect(() => {
    if (!veioDeCalculoPronto || !resultado || jaDirecionou.current) return
    jaDirecionou.current = true
    irPara(resultadoRef.current)
  }, [veioDeCalculoPronto, resultado])

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
            <div
              ref={formularioRef}
              tabIndex={-1}
              aria-label={`Formulário da ${config.titulo}`}
              className="focus:outline-none"
            >
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
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Formulário desta calculadora ainda não foi implementado.
            </p>
          )
        }
        result={
          resultado ? (
            <CalculatorResult
              ref={resultadoRef}
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
              // Só na abertura de cálculo pronto: é ali que o formulário ficou
              // para trás. Numa visita normal a pessoa acabou de preencher o
              // formulário logo acima, e o botão seria redundante.
              onEditarCalculo={
                veioDeCalculoPronto
                  ? () => {
                      irPara(formularioRef.current)
                      analytics.calculatorEdited(config.slug, config.categoria)
                    }
                  : undefined
              }
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
