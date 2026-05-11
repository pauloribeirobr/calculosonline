import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/inter'
import { Analytics } from '@vercel/analytics/react'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { MicrosoftClarity } from '@/components/analytics/MicrosoftClarity'
import { ErrorLogger } from '@/components/analytics/ErrorLogger'
import { WebsiteJsonLd, OrganizationJsonLd } from '@/components/seo/JsonLd'
import { siteConfig } from '@/lib/seo'
import './globals.css'

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
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <WebsiteJsonLd />
        <OrganizationJsonLd />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
        <ScrollToTop />
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <MicrosoftClarity />
        <ErrorLogger />
      </body>
    </html>
  )
}
