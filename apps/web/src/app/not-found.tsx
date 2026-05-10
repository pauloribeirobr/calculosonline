import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">404</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
        Calculadora não encontrada
      </h1>
      <p className="mt-4 text-base text-gray-600">
        Esta calculadora ainda não está disponível ou o endereço está incorreto.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
      >
        Voltar para a home
      </Link>
    </div>
  )
}
