import { ImageResponse } from 'next/og'
import { calculatorRegistry } from '@/lib/calculators'
import { IDENTIDADE_CATEGORIA, CATEGORIAS_ORDEM } from '@/lib/identidadeVisual'
import colors from 'tailwindcss/colors'

/**
 * Imagem social padrão do site (F42). Vale para a home e, por herança de
 * segmento, para toda página que não tenha um `opengraph-image` próprio —
 * `/categorias`, `/sobre`, `/contato`, políticas. As calculadoras têm a sua
 * em `app/calculadora/[slug]/opengraph-image.tsx`.
 */
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Calculos Online — calculadoras online grátis e sem cadastro'

export default function Image() {
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
          borderTop: `16px solid ${colors.blue[600]}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: '#2563eb' }}>
            calculosonline.com.br
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.1,
              color: '#111827',
              maxWidth: 1010,
            }}
          >
            {/* Uma string só: no Satori, `div` com mais de um nó filho exige
                `display` explícito, e `{n} texto` são dois nós. */}
            {`${calculatorRegistry.length} calculadoras online e grátis`}
          </div>
          <div style={{ fontSize: 29, lineHeight: 1.35, color: '#4b5563', maxWidth: 980 }}>
            Sem cadastro, com tabelas oficiais de 2026 e a memória de cálculo aberta em cada
            resultado.
          </div>
        </div>

        {/* Uma pastilha por categoria, nas mesmas cores do site (F41). */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {CATEGORIAS_ORDEM.map((categoria) => {
            const identidade = IDENTIDADE_CATEGORIA[categoria]
            const paleta = colors[identidade.familia]
            return (
              <div
                key={categoria}
                style={{
                  display: 'flex',
                  fontSize: 22,
                  fontWeight: 600,
                  color: paleta[700],
                  backgroundColor: paleta[50],
                  border: `2px solid ${paleta[100]}`,
                  borderRadius: 999,
                  padding: '10px 20px',
                }}
              >
                {identidade.label}
              </div>
            )
          })}
        </div>
      </div>
    ),
    size,
  )
}
