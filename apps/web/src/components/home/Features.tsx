import {
  ScaleIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon,
  WifiIcon,
  CalendarDaysIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: ScaleIcon,
    titulo: 'Precisão legislativa',
    texto: 'Fórmulas baseadas em CLT, Decretos do INSS e Lei 11.482/2007 (IRRF).',
  },
  {
    icon: DevicePhoneMobileIcon,
    titulo: 'Multiplataforma',
    texto: 'Web, Android (TWA), Desktop (Tauri) e plugin Google Sheets.',
  },
  {
    icon: LockClosedIcon,
    titulo: 'Sem cadastro',
    texto: 'Uso instantâneo — seus dados não saem do navegador.',
  },
  {
    icon: WifiIcon,
    titulo: 'Funciona offline',
    texto: 'PWA instalável: calcule sem conexão depois da primeira visita.',
  },
  {
    icon: CalendarDaysIcon,
    titulo: 'Atualizado para 2026',
    texto: 'Tabelas INSS, IRRF e salário mínimo vigentes.',
  },
  {
    icon: BoltIcon,
    titulo: 'Mobile-first',
    texto: 'Funciona bem em qualquer dispositivo, do smartphone ao desktop.',
  },
]

export function Features() {
  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Por que escolher o Calculos Online
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
            Construído com transparência, precisão técnica e respeito ao seu tempo.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feat) => (
            <article
              key={feat.titulo}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <feat.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{feat.titulo}</h3>
              <p className="mt-2 text-sm text-gray-600">{feat.texto}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
