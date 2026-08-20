import { ImageResponse } from 'next/og'
import colors from 'tailwindcss/colors'
import { calculatorRegistry, findCalculator } from '@/lib/calculators'
import { IDENTIDADE_CATEGORIA } from '@/lib/identidadeVisual'
import { calculatorIcons, glifoHeroicon } from '@/lib/iconesCalculadora'

/**
 * Imagem social de cada calculadora (F42), montada com o próprio ícone e a
 * cor da categoria — a mesma identidade do F41, agora na superfície mais
 * compartilhada que existe: o preview de link no WhatsApp (F32), nos cards
 * sociais e nas citações de IA.
 *
 * Antes disso, `seo.ts` apontava todas as páginas para `/images/og-image.png`,
 * um arquivo que **nunca existiu** — todo compartilhamento do site mostrava
 * preview quebrado.
 */
/**
 * Corpo do título por comprimento. Os nomes variam muito — de "Calculadora de
 * IMC" a "Calculadora e Simulador de Tesouro Direto" (F38) e "Calculadora de
 * Décimo Terceiro Salário (13º)" — e um corpo fixo ou estoura o orçamento
 * vertical (empurrando o rodapé para fora) ou desperdiça a imagem nos curtos.
 */
function corpoDoTitulo(titulo: string): number {
  if (titulo.length > 38) return 50
  if (titulo.length > 26) return 58
  return 66
}

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Calculadora online grátis e sem cadastro | Calculos Online'

/** Uma imagem por calculadora, geradas no build junto das páginas (SSG). */
export function generateStaticParams() {
  return calculatorRegistry.map((calc) => ({ slug: calc.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const calc = findCalculator(slug)
  if (!calc) return new ImageResponse(<div />, size)

  const identidade = IDENTIDADE_CATEGORIA[calc.categoria]
  const paleta = colors[identidade.familia]
  const Icone = calculatorIcons[calc.icone]

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
          // Faixa da cor da categoria no topo — o mesmo sinal de agrupamento
          // que o ícone dá no site.
          borderTop: `16px solid ${paleta[600]}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 112,
              height: 112,
              borderRadius: 28,
              backgroundColor: paleta[50],
              border: `2px solid ${paleta[100]}`,
              color: paleta[600],
            }}
          >
            {glifoHeroicon(Icone, { cor: paleta[600], tamanho: 64 })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: paleta[700],
              }}
            >
              {identidade.label}
            </div>
            <div
              style={{
                fontSize: corpoDoTitulo(calc.tituloLongo),
                fontWeight: 700,
                lineHeight: 1.15,
                color: '#111827',
                maxWidth: 1010,
              }}
            >
              {calc.tituloLongo}
            </div>
            <div style={{ fontSize: 28, lineHeight: 1.3, color: '#4b5563', maxWidth: 960 }}>
              {calc.descricaoCurta}
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
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              fontWeight: 600,
              color: '#15803d',
              backgroundColor: '#f0fdf4',
              border: '2px solid #dcfce7',
              borderRadius: 999,
              padding: '10px 24px',
            }}
          >
            Grátis, sem cadastro
          </div>
        </div>
      </div>
    ),
    size,
  )
}
