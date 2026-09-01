import { ImageResponse } from 'next/og'
import colors from 'tailwindcss/colors'
import { HUB_TRABALHISTA } from '@/lib/hubTrabalhista'
import { findCalculator } from '@/lib/calculators'
import { IDENTIDADE_CATEGORIA } from '@/lib/identidadeVisual'
import { calculatorIcons, glifoHeroicon } from '@/lib/iconesCalculadora'

/**
 * Imagem social do hub trabalhista (F58), na mecânica do F42.
 *
 * Diferença de composição: em vez de um ícone, ela mostra **os quatro** ícones
 * das calculadoras encadeadas. A imagem é o único lugar onde o preview do link
 * pode dizer "isto agrega quatro cálculos" antes do clique — no WhatsApp, que
 * é onde os links do F32 circulam, o cartão é tudo o que se vê.
 *
 * As armadilhas do Satori do F42 continuam valendo: `forwardRef` não renderiza
 * (daí o `glifoHeroicon`) e `div` com mais de um filho exige `display`
 * explícito.
 */
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Calculadora Trabalhista Completa — grátis e sem cadastro'

export default async function Image() {
  const paleta = colors[IDENTIDADE_CATEGORIA[HUB_TRABALHISTA.categoria].familia]
  const encadeadas = HUB_TRABALHISTA.calculadorasEncadeadas
    .map((slug) => findCalculator(slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
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
            Cálculo trabalhista completo
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.12,
                color: '#111827',
                maxWidth: 1010,
              }}
            >
              {HUB_TRABALHISTA.titulo}
            </div>
            <div style={{ fontSize: 27, lineHeight: 1.35, color: '#4b5563', maxWidth: 980 }}>
              Rescisão, 13º salário, férias e FGTS a partir dos mesmos dados.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {encadeadas.map((calc) => {
              const Icone = calculatorIcons[calc.icone]
              return (
                <div
                  key={calc.slug}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 84,
                    height: 84,
                    borderRadius: 21,
                    backgroundColor: paleta[50],
                    border: `2px solid ${paleta[100]}`,
                    color: paleta[600],
                  }}
                >
                  {glifoHeroicon(Icone, { cor: paleta[600], tamanho: 46 })}
                </div>
              )
            })}
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
            Grátis, sem cadastro
          </div>
        </div>
      </div>
    ),
    size,
  )
}
