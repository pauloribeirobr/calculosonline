const stats = [
  { valor: '20+', label: 'Calculadoras' },
  { valor: '100%', label: 'Grátis' },
  { valor: '2026', label: 'Tabelas atualizadas' },
  { valor: '0', label: 'Cadastros necessários' },
]

export function Stats() {
  return (
    <section className="bg-brand-700 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <dt className="order-2 mt-1 text-sm font-medium text-white/80">{stat.label}</dt>
              <dd className="order-1 text-4xl font-bold tracking-tight text-white md:text-5xl">
                {stat.valor}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
