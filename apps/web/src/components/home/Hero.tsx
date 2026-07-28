import Link from 'next/link'
import {
  CalculatorIcon,
  ArrowDownIcon,
  ShieldCheckIcon,
  ScaleIcon,
  CalendarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

/**
 * Stack visual com 5 mockups de calculadoras rotacionados/sobrepostos.
 * Espelha o `DocumentStack` do Recibo Fácil.
 */
function CalculatorStack() {
  const cards = [
    {
      titulo: 'Rescisão Trabalhista',
      valor: 'R$ 8.420,30',
      x: -92,
      y: -74,
      rotate: -9,
      z: 2,
      duration: 8.8,
      delay: -1.3,
    },
    {
      titulo: 'IRPF — Restituição',
      valor: 'R$ 1.347,82',
      x: 86,
      y: -82,
      rotate: 7,
      z: 3,
      duration: 9.6,
      delay: -4.1,
    },
    {
      titulo: 'Juros Compostos',
      valor: 'R$ 24.180,50',
      x: 30,
      y: 16,
      rotate: 0,
      z: 5,
      duration: 8.2,
      delay: -2.7,
    },
    {
      titulo: 'IMC',
      valor: '22,86',
      x: -96,
      y: 86,
      rotate: 8,
      z: 4,
      duration: 10.4,
      delay: -6.2,
    },
    {
      titulo: 'FGTS — Saldo',
      valor: 'R$ 12.840,00',
      x: 104,
      y: 94,
      rotate: -7,
      z: 1,
      duration: 9.1,
      delay: -0.7,
    },
  ]

  return (
    <div className="relative mx-auto h-80 w-full max-w-md md:h-[26rem]">
      {cards.map((card) => (
        <div
          key={card.titulo}
          className="absolute left-1/2 top-1/2 w-64"
          style={{
            transform: `translate(-50%, -50%) translate(${card.x}px, ${card.y}px) rotate(${card.rotate}deg)`,
            zIndex: card.z,
          }}
        >
          <div
            className="animate-hero-card-drift rounded-xl border border-white/20 bg-white p-4 shadow-2xl"
            style={{
              animationDuration: `${card.duration}s`,
              animationDelay: `${card.delay}s`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                Resultado
              </span>
              <CalculatorIcon className="h-4 w-4 text-gray-400" />
            </div>
            <p className="mt-1 text-sm font-semibold text-gray-900">{card.titulo}</p>
            <p className="mt-3 text-2xl font-bold tracking-normal text-gray-900 tabular-nums">
              {card.valor}
            </p>
            <div className="mt-3 flex gap-1">
              <span className="h-1.5 w-12 rounded-full bg-brand-200" />
              <span className="h-1.5 w-8 rounded-full bg-brand-200" />
              <span className="h-1.5 w-16 rounded-full bg-brand-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-brand-900 py-16 lg:py-24">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div className="text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
            <SparklesIcon className="h-3.5 w-3.5" aria-hidden /> Atualizado para 2026
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Calculadoras Online Grátis e Atualizadas para 2026
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85 md:text-xl">
            Cálculos trabalhistas, impostos, financeiros e mais. Sem cadastro, com base legal e
            tabelas atualizadas (INSS, IRRF, salário mínimo).
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#calculadoras"
              className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
            >
              <CalculatorIcon className="h-5 w-5" />
              Ver calculadoras
            </Link>
            <Link
              href="#como-funciona"
              className="inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <ArrowDownIcon className="h-5 w-5" />
              Como funciona
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheckIcon className="h-4 w-4" aria-hidden /> Sem cadastro
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" aria-hidden /> Tabelas 2026
            </li>
            <li className="inline-flex items-center gap-1.5">
              <ScaleIcon className="h-4 w-4" aria-hidden /> Base legal verificada
            </li>
          </ul>
        </div>
        <div className="hidden lg:block">
          <CalculatorStack />
        </div>
      </div>
    </section>
  )
}
