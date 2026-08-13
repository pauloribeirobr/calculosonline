import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { MeusCalculosClient } from './MeusCalculosClient'

const description =
  'Cálculos salvos neste navegador — sem cadastro, sem nuvem, guardados só neste dispositivo.'

// Conteúdo é local ao navegador de cada visitante (IndexedDB) — não há nada
// pra indexar aqui, então noindex (mas follow, pra não cortar o link interno
// do header).
export const metadata: Metadata = {
  ...buildMetadata({ title: 'Meus Cálculos', description, path: '/meus-calculos' }),
  robots: { index: false, follow: true },
}

export default function MeusCalculosPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: 'Meus Cálculos' }]} />
      <div>
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Meus Cálculos</h1>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      </div>
      <MeusCalculosClient />
    </main>
  )
}
