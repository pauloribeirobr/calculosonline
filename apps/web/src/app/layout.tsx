import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/inter'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Calculos Online — Calculadoras Online Grátis e Atualizadas para 2026',
    template: '%s | Calculos Online',
  },
  description:
    'Calculadoras online grátis para o Brasil: rescisão, férias, 13º, IRPF, INSS, juros compostos, IMC e mais. Tabelas atualizadas em 2026 com base legal verificada.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://calculosonline.com.br'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Calculos Online',
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
        <div className="flex min-h-screen flex-col">
          <main className="flex-grow">{children}</main>
        </div>
      </body>
    </html>
  )
}
