import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageSeo } from '@/components/seo/PageSeo'

const description =
  'Termos de uso do Calculos Online: condições de utilização das calculadoras, isenção de responsabilidade e propriedade intelectual.'

export const metadata: Metadata = buildMetadata({
  title: 'Termos de Uso',
  description,
  path: '/termos-de-uso',
})

export default function TermosDeUsoPage() {
  const dataAtualizacao = new Date('2026-01-01').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <PageSeo
        title="Termos de Uso"
        description={description}
        path="/termos-de-uso"
        breadcrumbs={[
          { name: 'Início', path: '/' },
          { name: 'Termos de Uso', path: '/termos-de-uso' },
        ]}
      />
      <Breadcrumbs
        items={[{ label: 'Início', href: '/' }, { label: 'Termos de Uso' }]}
      />
      <article className="prose prose-gray max-w-none">
        <h1>Termos de Uso</h1>
        <p className="text-sm text-gray-500">Última atualização: {dataAtualizacao}</p>

        <h2>1. Aceitação dos termos</h2>
        <p>
          Ao acessar e utilizar o <strong>Calculos Online</strong> (calculosonline.com.br), você
          concorda com estes Termos de Uso. Se não concordar, por favor, não utilize o serviço.
        </p>

        <h2>2. Natureza do serviço</h2>
        <p>
          O Calculos Online disponibiliza calculadoras online gratuitas para fins
          <strong> exclusivamente informativos e educacionais</strong>. As calculadoras não
          constituem aconselhamento jurídico, contábil, tributário ou financeiro.
        </p>

        <h2>3. Precisão das informações</h2>
        <p>
          Empenhamo-nos em manter as tabelas (INSS, IRRF, CLT etc.) atualizadas conforme a
          legislação vigente. Contudo, <strong>não garantimos</strong> que os resultados estejam
          isentos de erros ou reflitam imediatamente mudanças legislativas muito recentes.
          Sempre consulte um advogado trabalhista ou contador habilitado antes de tomar decisões
          com base nos cálculos apresentados.
        </p>

        <h2>4. Isenção de responsabilidade</h2>
        <p>
          O Calculos Online não se responsabiliza por decisões tomadas com base nos resultados
          das calculadoras, por eventuais imprecisões causadas por alterações legislativas
          ainda não incorporadas, nem por danos diretos ou indiretos decorrentes do uso ou
          impossibilidade de uso do serviço.
        </p>

        <h2>5. Propriedade intelectual</h2>
        <p>
          Todo o conteúdo do site — textos, código-fonte, layout e marca — é de propriedade do
          Calculos Online e está protegido pela legislação de direitos autorais. É proibida a
          reprodução sem autorização prévia por escrito.
        </p>

        <h2>6. Links externos</h2>
        <p>
          O site pode conter links para sites de terceiros. O Calculos Online não controla nem
          se responsabiliza pelo conteúdo desses sites.
        </p>

        <h2>7. Anúncios</h2>
        <p>
          O serviço é financiado por anúncios exibidos pelo Google AdSense. Não nos
          responsabilizamos pelo conteúdo dos anúncios veiculados.
        </p>

        <h2>8. Alterações nos termos</h2>
        <p>
          Podemos revisar estes termos a qualquer momento. A data de atualização no topo indica
          a versão vigente. O uso continuado do serviço após alterações implica aceitação dos
          novos termos.
        </p>

        <h2>9. Lei aplicável e foro</h2>
        <p>
          Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o
          foro da comarca de São Paulo/SP para dirimir eventuais litígios, com renúncia expressa
          a qualquer outro.
        </p>

        <h2>10. Contato</h2>
        <p>
          Dúvidas sobre estes termos:{' '}
          <a href="mailto:contato@calculosonline.com.br">contato@calculosonline.com.br</a>.
        </p>
      </article>
    </main>
  )
}
