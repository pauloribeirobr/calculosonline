import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.mdx',
    // `mdx-components.tsx` mora na raiz de `apps/web` (exigência do App
    // Router) e por isso ficou de fora de todos os globs acima até o F56 —
    // nenhuma classe dele era gerada, e o `overflow-x-auto` do wrapper de
    // tabela sumia: 9 das 20 páginas de calculadora rolavam na horizontal no
    // celular. Ver MEMORY.md, diário de 2026-08-29.
    './mdx-components.tsx',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        result: {
          positive: '#16a34a',
          negative: '#dc2626',
          neutral: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'result-lg': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'result-md': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
      },
    },
  },
  plugins: [forms, typography],
}

export default config
