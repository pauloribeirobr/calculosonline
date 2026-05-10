# IDENTIDADE VISUAL — calculosonline.com.br

> Espelha o padrão visual do **Recibo Fácil** (`/home/paulo/projects/next/recibofacil`)
> para acelerar entrega e manter coerência entre as duas marcas do mesmo grupo.

---

## 1. Por que reaproveitar o Recibo Fácil?

O Recibo Fácil já está em produção (`recibofacil.com.br`) com um sistema visual maduro:

- Tailwind 3 + Inter Variable + Heroicons + Headless UI
- Header com CTA primário, navegação responsiva e menu mobile com transição
- Footer com colunas categorizadas + selo de privacidade
- Hero com badge, CTAs, indicadores de confiança e mockup ilustrativo (DocumentStack)
- Componentes home prontos: HowItWorks, Features, Stats, Testimonials, FAQ, FinalCta, SeoContent
- SEO estruturado: PageSeo wrapper + JsonLd (Website, Organization, FAQ, WebApplication, ItemList)
- Stack analytics: GA4 + Vercel Analytics + Microsoft Clarity + ErrorLogger

Reaproveitar significa:
- **Menos esforço:** copiar e adaptar em vez de desenhar do zero (estimativa: -3 a -4 dias de Sprint 1.2)
- **Menos risco visual:** padrão já testado em produção
- **Identidade unificada** entre os dois sites (mesma "casa" mesmo que produtos diferentes)

---

## 2. Mapa de Equivalência — Recibo Fácil → Calculos Online

| Recibo Fácil | Calculos Online | Adaptação |
|--------------|-----------------|-----------|
| `Header.tsx` (CTA "Gerar Documento") | `Header.tsx` (CTA "Calcular agora" + busca) | Trocar links de documentos por categorias de calculadoras; adicionar busca |
| `Footer.tsx` (5 colunas: Recibos, Documentos, Declarações, Profissionais, Institucional) | `Footer.tsx` (5 colunas: Trabalhistas, Impostos, Financeiras, Investimentos, Institucional) | Mesma estrutura, mudar o conteúdo das colunas |
| `Hero.tsx` + `DocumentStack` | `Hero.tsx` + `CalculatorStack` | Trocar 5 cards de documentos por 5 mockups de calculadoras (Rescisão, IRPF, Juros Compostos, IMC, FGTS) |
| `HowItWorks.tsx` (4 passos) | Reutilizar literal | Trocar texto: "Escolha calculadora → Preencha dados → Veja resultado → Salve/Compartilhe" |
| `Features.tsx` (6 cards) | Reutilizar literal | Trocar texto: Precisão Legislativa, Multiplataforma, Sem Cadastro, Offline-first, Atualizado, Mobile |
| `FAQ.tsx` | Reutilizar literal | Trocar perguntas (foco em: legislação 2026, INSS, IRRF, etc.) |
| `Stats.tsx` | Reutilizar literal | Métricas do calculosonline (X cálculos/mês, Y calculadoras, etc.) |
| `Testimonials.tsx` | Reutilizar literal | Trocar depoimentos |
| `FinalCta.tsx` | Reutilizar literal | CTA final genérico |
| `DocumentTypes.tsx` (grid de geradores) | `CalculatorTypes.tsx` (grid de calculadoras) | Mesma estrutura: featured + remaining; substituir `documentGenerators` por `calculatorRegistry` |
| `SeoContent.tsx` | Reutilizar literal | Trocar conteúdo SEO sobre cálculos |
| `Button.tsx` (primary/secondary/outline/ghost/danger/white) | Reutilizar literal | — |
| `Input.tsx` (com máscara automática CPF/CNPJ/CEP/phone/currency) | Reutilizar literal | **Crítico** — calculadoras tributárias precisam de CPF; trabalhistas precisam de currency |
| `Modal.tsx`, `Loading.tsx`, `ScrollToTop.tsx`, `Logo.tsx`, `Navigation.tsx`, `Breadcrumbs.tsx` | Reutilizar literal | — |
| `seo/PageSeo.tsx` + `seo/JsonLd.tsx` | Reutilizar literal | Adicionar `WebApplicationJsonLd` específico para cada calculadora |
| `analytics/MicrosoftClarity.tsx` + `analytics/ErrorLogger.tsx` | Reutilizar literal | — |

**Componentes NÃO reaproveitados** (específicos de geração de documento PDF):
- `A4Container.tsx` — calculosonline não imprime PDF
- `DocumentForm.tsx` / `DocumentPreview.tsx` / `DocumentTemplateRenderer.tsx`
- `SignatureField.tsx`, `WatermarkToggle.tsx`
- `AuthContext`, `AuthModal` — calculosonline não tem login na fase 1 (pode entrar na fase 3 quando lançar API/freemium)

---

## 3. Tokens de Design (Tailwind)

### 3.1 Cores

```ts
// herdado do Recibo Fácil — manter
brand: {
  50:  "#eff6ff",   // bg-blue-50
  100: "#dbeafe",   // bg-blue-100
  500: "#3b82f6",   // blue-500
  600: "#2563eb",   // blue-600 (primary)
  700: "#1d4ed8",
  900: "#1e3a8a",
}
result: {
  positive: "#16a34a",  // green-600 — créditos / valores a receber
  negative: "#dc2626",  // red-600   — descontos
  neutral:  "#6b7280",  // gray-500
}
// destaques específicos do calculosonline
legal:    "#0369a1",    // blue-700 — base legal / fonte jurídica
updated:  "#15803d",    // green-700 — selo "tabelas atualizadas"
```

### 3.2 Tipografia

- Fonte principal: `@fontsource-variable/inter` (Inter Variable)
- Fonte mono: `Roboto Mono` ou padrão do sistema (para valores monetários com `tabular-nums`)
- Escala: padrão Tailwind + `text-result-lg` (2rem/700) e `text-result-md` (1.5rem/600) para destaques

### 3.3 Layout

- `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` — container padrão (mesmo do Recibo Fácil)
- Header altura `h-16`
- Sombras sutis: `shadow-sm` em cards; `shadow-lg` em CTAs principais
- Bordas: `rounded-md` (botões), `rounded-lg` (inputs), `rounded-xl` (cards), `rounded-2xl` (cards featured)
- Ring: `ring-1 ring-gray-200` para cards; `ring-blue-100` para featured

---

## 4. Dependências NPM herdadas

Adicionar ao `apps/web/package.json` (alinhado ao Recibo Fácil):

```json
{
  "dependencies": {
    "@fontsource-variable/inter": "^5.2.8",
    "@headlessui/react": "^2.2.9",
    "@heroicons/react": "^2.2.0",
    "@next/third-parties": "^16.2.5",
    "@tailwindcss/forms": "^0.5.11",
    "@tailwindcss/typography": "^0.5.19",
    "@vercel/analytics": "^1.6.1",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

---

## 5. Estrutura de Pastas (apps/web)

Espelha a do Recibo Fácil para reuso direto de componentes:

```
apps/web/src/
├── app/
│   ├── (marketing)/             ← homepage, sobre, blog, contato (público)
│   │   ├── page.tsx             ← homepage (Hero + CalculatorTypes + HowItWorks + ...)
│   │   ├── sobre/
│   │   ├── contato/
│   │   ├── politica-de-privacidade/
│   │   ├── termos-de-uso/
│   │   └── blog/
│   ├── (calculadoras)/          ← rotas dinâmicas das calculadoras
│   │   └── [slug]/page.tsx      ← página individual da calculadora
│   ├── categoria/[slug]/page.tsx
│   ├── api/
│   ├── layout.tsx
│   ├── globals.css
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── analytics/               ← MicrosoftClarity, ErrorLogger
│   ├── common/                  ← Header, Footer, Button, Input, Modal, Logo,
│   │                              Navigation, ScrollToTop, Breadcrumbs, Loading
│   ├── home/                    ← Hero, CalculatorTypes, HowItWorks, Features,
│   │                              Stats, Testimonials, FAQ, SeoContent, FinalCta
│   ├── calculator/              ← componentes específicos: CalculatorForm,
│   │                              CalculatorResult, AdSlot, LegalBadge, UpdatedBadge,
│   │                              RelatedCalculators, CalculatorCategoryGrid
│   ├── seo/                     ← PageSeo, JsonLd
│   └── providers/               ← ClientProviders (Analytics, etc.)
├── core/                        ← re-export do @calculosonline/core
├── hooks/
├── lib/                         ← seo helpers, calculator registry, faq
├── shared/                      ← tipos compartilhados
└── utils/                       ← formatters (CPF, CNPJ, currency), dateUtils
```

---

## 6. Configurações herdadas

### 6.1 `globals.css`

Copiar literalmente de `recibofacil/frontend/src/app/globals.css`, removendo apenas as classes específicas de A4 (`.a4-container`, `@page` regras de impressão). Manter:

- Reset Tailwind (`@tailwind base/components/utilities`)
- `html { scroll-behavior: smooth }`
- `body { font-family: 'Inter Variable', ... }`
- Classes `.prose` para conteúdo editorial (blog e descrição da calculadora)
- `.bg-grid-pattern` (usado no Hero)
- `@keyframes float` + `.animate-float` (animação sutil em ícones)

### 6.2 `tailwind.config.ts`

Estender o config do Recibo Fácil com os tokens da seção 3:

```ts
import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 900: '#1e3a8a' },
        result: { positive: '#16a34a', negative: '#dc2626', neutral: '#6b7280' },
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
```

### 6.3 `layout.tsx` (root)

Estrutura espelhada:

```tsx
<html lang="pt-BR" suppressHydrationWarning>
  <body>
    <WebsiteJsonLd />
    <OrganizationJsonLd />
    <ClientProviders>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
      <ScrollToTop />
    </ClientProviders>
    <Analytics />
    {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    <MicrosoftClarity />
    <ErrorLogger />
  </body>
</html>
```

---

## 7. Ordem de cópia recomendada (Sprint 1.2)

1. **Fundação visual** (Dia 1):
   - `globals.css`, `tailwind.config.ts`, fontes, ícones
   - `Logo.tsx` (criar novo SVG do calculosonline)
   - `Button.tsx`, `Input.tsx`, `Modal.tsx`, `Loading.tsx`, `Breadcrumbs.tsx`, `ScrollToTop.tsx`

2. **Layout principal** (Dia 2):
   - `Header.tsx` + `Navigation.tsx` (adaptar links)
   - `Footer.tsx` (adaptar colunas para categorias de calculadoras)
   - `layout.tsx` raiz com providers

3. **Home page** (Dia 3-4):
   - `Hero.tsx` + `CalculatorStack.tsx` (substituir DocumentStack)
   - `CalculatorTypes.tsx` (DocumentTypes adaptado)
   - `HowItWorks.tsx`, `Features.tsx`, `Stats.tsx`, `Testimonials.tsx`, `FAQ.tsx`, `FinalCta.tsx`

4. **Componentes de calculadora** (Dia 5):
   - `CalculatorForm.tsx`, `CalculatorResult.tsx`, `CalculatorLayout.tsx`
   - `AdSlot.tsx`, `LegalBadge.tsx`, `UpdatedBadge.tsx`, `RelatedCalculators.tsx`

5. **SEO e analytics** (Dia 6):
   - `PageSeo.tsx`, `JsonLd.tsx`
   - `MicrosoftClarity.tsx`, `ErrorLogger.tsx`

---

## 8. Diferenças intencionais (não copiar)

| Item Recibo Fácil | Razão para não trazer |
|-------------------|----------------------|
| `AuthContext` + login/cadastro | Calculos Online não tem cadastro na Fase 1; calculadoras são 100% client-side |
| `ExpirationBanner` | Sem assinatura premium na Fase 1 |
| `useDocumentService` + `documentEvents` | Sem persistência de "documentos gerados" |
| `A4Container` + impressão | Calculadoras não geram PDF |
| `SignatureField`, `WatermarkToggle` | Específicos de geração de documento |
| Routes `/historico`, `/agenda`, `/perfil`, `/premium` | Sem usuário logado nesta fase |

---

## 9. Próximas adições próprias do Calculos Online

Componentes que **não existem** no Recibo Fácil e precisam ser construídos:

- `<CalculatorForm>` genérico parametrizado por schema Zod (Sprint 1.2)
- `<CalculatorResult>` com detalhamento em accordion (Sprint 1.2)
- `<LegalBadge>` e `<UpdatedBadge>` para mostrar base legal e data de tabelas (Sprint 1.2)
- `<AdSlot>` com lazy-load (Sprint 1.2 / 1.6)
- `<RelatedCalculators>` cross-linking entre calculadoras (Sprint 1.2)
- `<TabelaINSS>`, `<TabelaIRRF>` — componentes de exibição de tabelas legislativas (Sprint 1.4)
- `<FerramentaInline>` — embed de calculadora no blog (Sprint 1.4)
- `<DownloadButton>` — para apps Desktop/Mobile (Sprint 2.2)

---

## 10. Checklist de equivalência visual

Ao final da Sprint 1.2 confirmar:

- [ ] Header visual idêntico ao Recibo Fácil (logo + nav + 1 CTA principal)
- [ ] Footer com 5 colunas categorizadas + selo de "100% gratuito"
- [ ] Hero com badge "Grátis e sem cadastro" + CTAs + indicadores + mockup
- [ ] Botões com mesmas variantes e estados
- [ ] Inputs com formatação automática (CPF, CNPJ, currency)
- [ ] Cards com mesmo padrão de sombra, bordas e hover
- [ ] Tipografia Inter Variable carregada via fontsource
- [ ] Heroicons em todos os ícones
- [ ] Cores blue-600 (primária), green-500 (confiança), gray-* (neutros)
- [ ] Mobile menu com `Transition` do Headless UI
- [ ] Lighthouse Performance > 90 e Acessibilidade > 95
