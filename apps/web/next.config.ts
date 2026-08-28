import type { NextConfig } from 'next'
import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
  },
})

const nextConfig: NextConfig = {
  // Suporte a .mdx nas extensões de página
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],

  // Permite consumir os pacotes do monorepo como source TS (sem build)
  transpilePackages: ['@calculosonline/core', '@calculosonline/ui'],

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Redirects de URLs quebradas com tráfego real (F44).
  // Medido no Clarity em 25-27/08: `/site` respondeu por 4 das 25 sessões
  // (16%) e `/2026/calculadora/cdb` por 1 — nenhuma das duas rotas existe.
  // A origem é externa (link errado em diretório/agregador), então não dá
  // para corrigir na origem; o redirect recupera a sessão em vez de servir 404.
  async redirects() {
    return [
      { source: '/site', destination: '/', permanent: true },
      { source: '/site/:path*', destination: '/', permanent: true },
      // Prefixo de ano espúrio: /2026/calculadora/cdb → /calculadora/cdb
      {
        source: '/:ano(\\d{4})/calculadora/:slug',
        destination: '/calculadora/:slug',
        permanent: true,
      },
      { source: '/:ano(\\d{4})/calculadora', destination: '/categorias', permanent: true },
    ]
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default withMDX(nextConfig)
