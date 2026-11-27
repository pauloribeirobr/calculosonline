import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import localFont from 'next/font/local'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { MicrosoftClarity } from '@/components/analytics/MicrosoftClarity'
import { ErrorLogger } from '@/components/analytics/ErrorLogger'
import { RouteTracker } from '@/components/analytics/RouteTracker'
import { WebsiteJsonLd, OrganizationJsonLd } from '@/components/seo/JsonLd'
import { siteConfig } from '@/lib/seo'
import './globals.css'

// Inter pelo `next/font/local` (27/11/2026), com o mesmo arquivo do `@fontsource-variable/inter`.
// Pelo CSS comum, o texto aparecia primeiro numa fonte reserva de medidas diferentes e, quando a
// Inter chegava, as linhas quebravam em outro lugar: o artigo inteiro do post do 13º
// proporcional se mexia (CLS de 0,27 no PageSpeed, causa "Web font loaded"). O `next/font`
// pré-carrega o arquivo e gera uma reserva com as medidas da Inter (size-adjust), então a troca
// não reorganiza o texto.
const inter = localFont({
  src: '../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-inter',
  adjustFontFallback: 'Arial',
})

export const metadata: Metadata = {
  title: {
    default: 'Calculos Online — Calculadoras Online Grátis e Atualizadas para 2026',
    template: '%s | Calculos Online',
  },
  description: siteConfig.description,
  keywords: [
    'calculadoras online',
    'rescisão trabalhista',
    'férias',
    '13º salário',
    'FGTS',
    'IRPF',
    'INSS',
    'juros compostos',
    'IMC',
    'DAS MEI',
  ],
  metadataBase: new URL(siteConfig.url),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-48.svg', sizes: '48x48', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: 'Calculos Online — Calculadoras Online Grátis e Atualizadas para 2026',
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculos Online — Calculadoras Online Grátis',
    description: siteConfig.description,
  },
  alternates: {
    canonical: '/',
    languages: {
      'pt-BR': '/',
      'x-default': '/',
    },
  },
  // Verificação de posse do site no AdSense (F19). Precisa estar no `<head>`
  // de produção **antes** da aprovação e não pode ser condicionada à flag de
  // exibição de anúncios — sem a meta, a verificação simplesmente falha.
  other: {
    'google-adsense-account': siteConfig.adsensePublisherId,
  },
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://www.clarity.ms" />
      </head>
      <body>
        <WebsiteJsonLd />
        <OrganizationJsonLd />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
        <ScrollToTop />
        <Suspense fallback={null}>
          <RouteTracker />
        </Suspense>
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        <MicrosoftClarity />
        <ErrorLogger />
      </body>
    </html>
  )
}
