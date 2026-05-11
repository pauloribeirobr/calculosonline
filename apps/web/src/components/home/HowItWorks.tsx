import {
  CursorArrowRaysIcon,
  PencilSquareIcon,
  ChartBarIcon,
  ShareIcon,
} from '@heroicons/react/24/outline'

const steps = [
  {
    icon: CursorArrowRaysIcon,
    titulo: '1. Escolha a calculadora',
    texto: 'Navegue pelas 20 calculadoras divididas em 6 categorias.',
  },
  {
    icon: PencilSquareIcon,
    titulo: '2. Preencha os dados',
    texto: 'Campos com máscara automática e validação em tempo real.',
  },
  {
    icon: ChartBarIcon,
    titulo: '3. Veja o resultado',
    texto: 'Detalhamento linha a linha com base legal e fórmulas.',
  },
  {
    icon: ShareIcon,
    titulo: '4. Salve ou compartilhe',
    texto: 'Imprima, copie o link ou volte quando quiser — sem cadastro.',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Como funciona</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
            Quatro passos do clique ao resultado — sem instalação, sem cadastro, sem custo.
          </p>
        </div>
        <ol className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.titulo} className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <step.icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{step.titulo}</h3>
              <p className="mt-2 text-sm text-gray-600">{step.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
