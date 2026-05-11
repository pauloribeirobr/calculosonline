import Link from 'next/link'
import { CalculatorIcon, Squares2X2Icon } from '@heroicons/react/24/outline'

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-brand-900 py-16 lg:py-24">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          Comece a calcular agora — é grátis
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/85 md:text-lg">
          20 calculadoras com tabelas 2026, base legal verificada e detalhamento completo. Sem
          cadastro, sem instalação, sem custo.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="#calculadoras"
            className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
          >
            <CalculatorIcon className="h-5 w-5" />
            Ver todas as calculadoras
          </Link>
          <Link
            href="/categorias"
            className="inline-flex items-center gap-2 rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <Squares2X2Icon className="h-5 w-5" />
            Navegar por categoria
          </Link>
        </div>
      </div>
    </section>
  )
}
