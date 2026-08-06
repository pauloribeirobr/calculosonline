import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageSeo } from '@/components/seo/PageSeo'

const description =
  'Conheça o Calculos Online: 20 calculadoras gratuitas para trabalhadores, autônomos, MEIs e empresas brasileiras.'

export const metadata: Metadata = buildMetadata({
  title: 'Sobre',
  description,
  path: '/sobre',
})

export default function SobrePage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <PageSeo
        title="Sobre o Calculos Online"
        description={description}
        path="/sobre"
        breadcrumbs={[
          { name: 'Início', path: '/' },
          { name: 'Sobre', path: '/sobre' },
        ]}
      />
      <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: 'Sobre' }]} />
      <article className="prose prose-gray max-w-none">
        <h1>Sobre o Calculos Online</h1>
        <p className="lead">
          O Calculos Online é uma plataforma gratuita de calculadoras para o mercado
          brasileiro, voltada a trabalhadores CLT, autônomos, MEIs e pequenas empresas. Nossa
          missão é oferecer cálculos precisos baseados na legislação vigente, sem cadastro e
          sem custo.
        </p>
        <h2>Nossa proposta de valor</h2>
        <ul>
          <li>
            <strong>Precisão legislativa.</strong> Fórmulas baseadas em CLT, INSS, IRRF, IRPF e
            demais normativas, com tabelas atualizadas anualmente.
          </li>
          <li>
            <strong>Transparência.</strong> Cada resultado mostra o detalhamento linha a linha
            e a base legal aplicada.
          </li>
          <li>
            <strong>Multiplataforma.</strong> Funciona no navegador, como PWA instalável e em
            breve como app Android (TWA), aplicativo Desktop (Tauri) e plugin Google Sheets.
          </li>
          <li>
            <strong>Gratuito.</strong> Sem cadastro, sem assinatura, sem limites.
          </li>
        </ul>
        <h2>Como nos sustentamos</h2>
        <p>
          O projeto é financiado por <strong>publicidade discreta do Google AdSense</strong>{' '}
          posicionada de forma a não atrapalhar o uso das calculadoras. Não vendemos dados,
          não cobramos por uso e não temos plano premium.
        </p>
        <h2>Aviso legal</h2>
        <p>
          As calculadoras são fornecidas para fins informativos e educacionais. Para decisões
          jurídicas, fiscais ou de saúde, consulte um profissional habilitado. As tabelas são
          atualizadas periodicamente, mas podem não refletir mudanças legislativas muito
          recentes.
        </p>
      </article>
    </main>
  )
}
