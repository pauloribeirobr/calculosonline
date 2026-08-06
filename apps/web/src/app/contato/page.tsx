import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageSeo } from '@/components/seo/PageSeo'

const description =
  'Fale com a equipe do Calculos Online: sugestões de novas calculadoras, correções de tabelas e parcerias.'

export const metadata: Metadata = buildMetadata({
  title: 'Contato',
  description,
  path: '/contato',
})

export default function ContatoPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <PageSeo
        title="Contato"
        description={description}
        path="/contato"
        breadcrumbs={[
          { name: 'Início', path: '/' },
          { name: 'Contato', path: '/contato' },
        ]}
      />
      <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: 'Contato' }]} />
      <article className="prose prose-gray max-w-none">
        <h1>Contato</h1>
        <p>
          Quer sugerir uma nova calculadora, reportar um valor incorreto em alguma tabela ou
          propor uma parceria? Use o e-mail abaixo — respondemos em até 3 dias úteis.
        </p>
        <p>
          <strong>E-mail:</strong>{' '}
          <a href="mailto:contato@calculosonline.com.br">contato@calculosonline.com.br</a>
        </p>
        <h2>O que enviar junto</h2>
        <ul>
          <li>Para correções: link da calculadora, valores informados e o resultado esperado com fonte.</li>
          <li>Para novas calculadoras: descrição da fórmula e legislação aplicável.</li>
          <li>Para parcerias: tipo de parceria e site/produto envolvido.</li>
        </ul>
        <h2>Onde reportar problemas técnicos</h2>
        <p>
          Encontrou um bug ou tem feedback técnico? Use o mesmo e-mail com o assunto{' '}
          <code>[bug]</code> ou <code>[feedback]</code>.
        </p>
      </article>
    </main>
  )
}
