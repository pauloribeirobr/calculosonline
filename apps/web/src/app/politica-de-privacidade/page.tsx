import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageSeo } from '@/components/seo/PageSeo'

const description =
  'Saiba como o Calculos Online coleta, usa e protege seus dados. Política de cookies, Google AdSense, Google Analytics, Vercel Analytics e Microsoft Clarity.'

export const metadata: Metadata = buildMetadata({
  title: 'Política de Privacidade',
  description,
  path: '/politica-de-privacidade',
})

export default function PoliticaPrivacidadePage() {
  const dataAtualizacao = new Date('2026-01-01').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <PageSeo
        title="Política de Privacidade"
        description={description}
        path="/politica-de-privacidade"
        breadcrumbs={[
          { name: 'Início', path: '/' },
          { name: 'Política de Privacidade', path: '/politica-de-privacidade' },
        ]}
      />
      <Breadcrumbs
        items={[{ label: 'Início', href: '/' }, { label: 'Política de Privacidade' }]}
      />
      <article className="prose prose-gray max-w-none">
        <h1>Política de Privacidade</h1>
        <p className="text-sm text-gray-500">Última atualização: {dataAtualizacao}</p>

        <h2>1. Quem somos</h2>
        <p>
          O <strong>Calculos Online</strong> (calculosonline.com.br) é uma plataforma gratuita
          de calculadoras online para trabalhadores, autônomos, MEIs e empresas brasileiras.
          Nosso e-mail de contato é{' '}
          <a href="mailto:contato@calculosonline.com.br">contato@calculosonline.com.br</a>.
        </p>

        <h2>2. Dados coletados</h2>
        <p>
          O Calculos Online <strong>não coleta dados pessoais identificáveis</strong>. Todos os
          cálculos são processados localmente no seu navegador e nenhum valor informado nos
          formulários é transmitido a servidores.
        </p>
        <p>
          Coletamos automaticamente, de forma anônima e agregada, dados de uso do site
          (páginas visitadas, tempo de sessão, país/região, erros técnicos e uso das
          calculadoras) por meio do Google Analytics 4, Vercel Analytics e Microsoft
          Clarity. Os valores digitados nos formulários não são enviados como eventos de
          analytics.
        </p>

        <h2>3. Cookies</h2>
        <p>Utilizamos cookies para as seguintes finalidades:</p>
        <ul>
          <li>
            <strong>Cookies de análise</strong> — Google Analytics 4, para medir a audiência de
            forma agregada. Também usamos Vercel Analytics e Microsoft Clarity para entender
            desempenho, navegação e erros de uso. Você pode optar por sair do Google Analytics em{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
            >
              tools.google.com/dlpage/gaoptout
            </a>
            .
          </li>
          <li>
            <strong>Cookies de publicidade</strong> — Google AdSense, para exibir anúncios
            relevantes. O Google pode usar cookies para personalizar anúncios com base no
            histórico de navegação. Você pode gerenciar preferências em{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              adssettings.google.com
            </a>
            .
          </li>
        </ul>

        <h2>4. Google AdSense</h2>
        <p>
          Este site usa o Google AdSense para monetização por anúncios. O Google, como
          fornecedor terceirizado, utiliza cookies para veicular anúncios com base em visitas
          anteriores a este e a outros sites. A exibição de anúncios personalizados pode ser
          desativada nas{' '}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            Configurações de Anúncios do Google
          </a>
          . Para desativar o uso de cookies por fornecedores terceirizados, visite{' '}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
          >
            aboutads.info
          </a>
          .
        </p>

        <h2>5. Seus direitos (LGPD)</h2>
        <p>
          Nos termos da Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:
        </p>
        <ul>
          <li>Confirmar se tratamos dados seus;</li>
          <li>Solicitar a exclusão de dados eventualmente coletados;</li>
          <li>Revogar consentimento para uso de cookies a qualquer momento.</li>
        </ul>
        <p>
          Para exercer esses direitos, entre em contato por{' '}
          <a href="mailto:contato@calculosonline.com.br">contato@calculosonline.com.br</a>.
        </p>

        <h2>6. Alterações nesta política</h2>
        <p>
          Podemos atualizar esta política periodicamente. A data de revisão no topo indica a
          versão vigente. Recomendamos revisar esta página ocasionalmente.
        </p>

        <h2>7. Contato</h2>
        <p>
          Dúvidas sobre privacidade:{' '}
          <a href="mailto:contato@calculosonline.com.br">contato@calculosonline.com.br</a>.
        </p>
      </article>
    </main>
  )
}
