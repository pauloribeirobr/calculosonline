import type { ReactNode } from 'react'
import { AdSlot } from '../AdSlot'
import { LegalBadge } from '../LegalBadge'
import { UpdatedBadge } from '../UpdatedBadge'

export interface CalculatorLayoutProps {
  titulo: string
  descricao: string
  fonteJuridica: string
  dataAtualizacao: string
  /** ID do slot AdSense acima do formulário */
  adSlotTop?: string
  /** ID do slot AdSense entre resultado e conteúdo editorial */
  adSlotMid?: string
  /** ID do slot AdSense ao final */
  adSlotBottom?: string
  form: ReactNode
  /** Resultado — `null` antes do primeiro cálculo */
  result?: ReactNode
  /** Conteúdo editorial (MDX) */
  content: ReactNode
  /** Calculadoras relacionadas */
  related?: ReactNode
  breadcrumb?: ReactNode
}

/**
 * Layout padrão de página de calculadora com 3 slots de anúncio
 * posicionados em pontos de alto valor sem prejudicar a UX.
 */
export function CalculatorLayout({
  titulo,
  descricao,
  fonteJuridica,
  dataAtualizacao,
  adSlotTop,
  adSlotMid,
  adSlotBottom,
  form,
  result,
  content,
  related,
  breadcrumb,
}: CalculatorLayoutProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6">
      {breadcrumb}

      <header>
        <h1 className="text-2xl font-bold leading-tight text-gray-900 md:text-3xl">
          {titulo}
        </h1>
        <p className="mt-2 text-sm text-gray-600 md:text-base">{descricao}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <LegalBadge fonteJuridica={fonteJuridica} />
          <UpdatedBadge dataAtualizacao={dataAtualizacao} />
        </div>
      </header>

      {adSlotTop && (
        <div className="flex justify-center">
          <AdSlot slotId={adSlotTop} format="banner" />
        </div>
      )}

      <section
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"
        aria-label="Calculadora"
      >
        {form}
        {result && <div className="mt-6">{result}</div>}
      </section>

      {adSlotMid && (
        <div className="flex justify-center">
          <AdSlot slotId={adSlotMid} format="rectangle" />
        </div>
      )}

      <article className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-brand-600">
        {content}
      </article>

      {adSlotBottom && (
        <div className="flex justify-center">
          <AdSlot slotId={adSlotBottom} format="rectangle" />
        </div>
      )}

      {related}
    </div>
  )
}
