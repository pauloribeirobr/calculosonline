const testimonials = [
  {
    nome: 'Carlos M.',
    papel: 'Auxiliar contábil',
    texto:
      'Uso o cálculo de rescisão e férias quase todos os dias. Os detalhamentos linha a linha me ajudam a explicar para o cliente sem precisar abrir a CLT.',
  },
  {
    nome: 'Bianca S.',
    papel: 'Servidora pública',
    texto:
      'Comparei o IRPF simplificado × completo aqui antes de declarar. Ganhei R$ 1.300 a mais de restituição escolhendo o modelo certo.',
  },
  {
    nome: 'Diego R.',
    papel: 'MEI — prestação de serviços',
    texto:
      'Calculadora do DAS direto no celular. Sem precisar abrir o app do MEI e ainda mostra se vou estourar o teto anual.',
  },
]

export function Testimonials() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Quem usa, recomenda
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
            Depoimentos de profissionais que economizam tempo todos os dias.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.nome}
              className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm"
            >
              <blockquote className="text-sm leading-relaxed text-gray-700">
                <span aria-hidden className="font-serif text-3xl leading-none text-brand-300">
                  “
                </span>
                {t.texto}
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-semibold text-white">
                  {t.nome.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.nome}</p>
                  <p className="text-xs text-gray-500">{t.papel}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
