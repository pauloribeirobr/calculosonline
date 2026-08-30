import { ImageResponse } from 'next/og'
import colors from 'tailwindcss/colors'
import { blogRegistry, findPost, formatarDataPorExtenso } from '@/lib/blog'
import { findCalculator } from '@/lib/calculators'
import { IDENTIDADE_CATEGORIA } from '@/lib/identidadeVisual'
import { calculatorIcons, glifoHeroicon } from '@/lib/iconesCalculadora'

/**
 * Imagem social dos posts do blog (F22), na mesma mecânica do F42.
 *
 * A identidade **não é própria do blog**: ela vem da calculadora que o post
 * alimenta. Um artigo sobre 13º usa o ícone e o azul de "trabalhista", igual à
 * página da calculadora — o leitor que vê os dois links no WhatsApp reconhece
 * que são do mesmo assunto, e o blog não vira uma ilha visual com paleta
 * própria fora do sistema do F41.
 *
 * As três armadilhas do Satori descobertas no F42 continuam valendo aqui:
 * `forwardRef` não renderiza (por isso `glifoHeroicon` desembrulha o
 * `.render()`), `div` com dois filhos exige `display` explícito, e
 * `openGraph.images` no `generateMetadata` sobrescreveria esta convenção — por
 * isso a página do post passa `imagemPropriaDaRota: true`.
 */
function corpoDoTitulo(titulo: string): number {
  if (titulo.length > 60) return 46
  if (titulo.length > 42) return 54
  return 62
}

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Guia do Calculos Online — grátis e sem cadastro'

export function generateStaticParams() {
  return blogRegistry.map((post) => ({ slug: post.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = findPost(slug)
  if (!post) return new ImageResponse(<div />, size)

  const calc = findCalculator(post.calculadoraPrincipal)
  // Sem calculadora principal o post ainda tem imagem — cai no azul da marca.
  const identidade = calc ? IDENTIDADE_CATEGORIA[calc.categoria] : undefined
  const paleta = identidade ? colors[identidade.familia] : colors.blue
  const Icone = calc ? calculatorIcons[calc.icone] : undefined

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          padding: '56px 64px 48px',
          borderTop: `16px solid ${paleta[600]}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {Icone && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 88,
                  height: 88,
                  borderRadius: 22,
                  backgroundColor: paleta[50],
                  border: `2px solid ${paleta[100]}`,
                  color: paleta[600],
                }}
              >
                {glifoHeroicon(Icone, { cor: paleta[600], tamanho: 50 })}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: paleta[700],
              }}
            >
              Guia · {identidade?.label ?? 'Calculos Online'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                fontSize: corpoDoTitulo(post.titulo),
                fontWeight: 700,
                lineHeight: 1.15,
                color: '#111827',
                maxWidth: 1010,
              }}
            >
              {post.titulo}
            </div>
            <div style={{ fontSize: 26, lineHeight: 1.35, color: '#4b5563', maxWidth: 980 }}>
              {post.descricao}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid #e5e7eb',
            paddingTop: 24,
          }}
        >
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, color: '#111827' }}>
            calculosonline.com.br
          </div>
          <div style={{ display: 'flex', fontSize: 24, color: '#6b7280' }}>
            {formatarDataPorExtenso(post.dataAtualizacao)}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
