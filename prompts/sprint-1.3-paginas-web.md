# Prompt de IA — Sprint 1.3: Páginas Web Next.js
**calculosonline.com.br | Fase 1 — MVP | Semanas 5–6**

---

## PRÉ-REQUISITOS

- Sprint 1.1: 20 calculadoras implementadas em `packages/core`
- Sprint 1.2: componentes prontos em `packages/ui`
- `apps/web` com Next.js 15 App Router configurado (Sprint 0.1)

---

## OBJETIVO DA SPRINT 1.3

Criar as páginas Next.js que conectam o `packages/core` aos componentes do `packages/ui`:

1. **Homepage** `/` — vitrine com categorias e destaques
2. **Página de calculadora** `/calculadora/[slug]` — SSG + ISR, schema markup completo
3. **Página de categoria** `/categoria/[categoria]` — listagem por nicho
4. **Páginas institucionais** `/sobre`, `/contato`, `/privacidade`

---

## TAREFA 1: Registro Central de Calculadoras

Antes de criar as páginas, criar o registro que centraliza metadados de todas as 20 calculadoras.

```typescript
// apps/web/src/data/calculadoras.ts

export type Categoria =
  | "trabalhista"
  | "impostos"
  | "financeiro"
  | "investimentos"
  | "saude"
  | "negocios"

export interface CalculadoraConfig {
  slug: string
  titulo: string
  descricao: string          // usado em meta description e card
  categoria: Categoria
  fonteJuridica: string
  dataAtualizacao: string    // ISO date da última atualização das tabelas
  palavrasChave: string[]    // para SEO
  adSlotTop?: string
  adSlotMid?: string
  adSlotBottom?: string
  /** Slugs de calculadoras relacionadas (máx 4) */
  relacionadas: string[]
  popular?: boolean          // aparece na homepage
}

export const CALCULADORAS: CalculadoraConfig[] = [
  {
    slug: "rescisao-trabalhista",
    titulo: "Calculadora de Rescisão Trabalhista",
    descricao: "Calcule as verbas rescisórias com precisão: saldo de salário, aviso prévio, férias, 13º e multa FGTS. Atualizado com a CLT 2026.",
    categoria: "trabalhista",
    fonteJuridica: "CLT arts. 477–487 | Lei 12.506/2011",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["rescisão trabalhista", "calcular rescisão", "verbas rescisórias", "aviso prévio"],
    relacionadas: ["ferias", "fgts", "salario-liquido", "hora-extra"],
    popular: true,
  },
  {
    slug: "ferias",
    titulo: "Calculadora de Férias",
    descricao: "Calcule férias com 1/3 constitucional, abono pecuniário e férias em dobro. Base na CLT 2026.",
    categoria: "trabalhista",
    fonteJuridica: "CLT arts. 129–153 | CF/88 art. 7º, XVII",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["calcular férias", "férias proporcional", "abono pecuniário", "1/3 constitucional"],
    relacionadas: ["rescisao-trabalhista", "decimo-terceiro", "salario-liquido", "hora-extra"],
    popular: true,
  },
  {
    slug: "decimo-terceiro",
    titulo: "Calculadora de 13º Salário",
    descricao: "Calcule o 13º salário proporcional com INSS e IRRF. Parcelas 1ª e 2ª. Tabelas 2026.",
    categoria: "trabalhista",
    fonteJuridica: "Lei 4.090/1962 | Lei 4.749/1965",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["13º salário", "décimo terceiro", "calcular 13", "gratificação natalina"],
    relacionadas: ["salario-liquido", "rescisao-trabalhista", "ferias", "inss"],
    popular: true,
  },
  {
    slug: "hora-extra",
    titulo: "Calculadora de Hora Extra",
    descricao: "Calcule horas extras com adicional 50% (dia útil) e 100% (domingo/feriado). Suporte a CCT.",
    categoria: "trabalhista",
    fonteJuridica: "CLT art. 59 | CF/88 art. 7º, XVI",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["hora extra", "calcular hora extra", "adicional hora extra", "banco de horas"],
    relacionadas: ["salario-liquido", "rescisao-trabalhista", "ferias", "fgts"],
    popular: false,
  },
  {
    slug: "fgts",
    titulo: "Calculadora de FGTS",
    descricao: "Calcule depósitos mensais, multa rescisória (40% e 20%) e saque-aniversário do FGTS.",
    categoria: "trabalhista",
    fonteJuridica: "Lei 8.036/1990 | Lei 13.932/2019",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["FGTS", "multa FGTS", "saque aniversário FGTS", "calcular FGTS"],
    relacionadas: ["rescisao-trabalhista", "salario-liquido", "ferias", "decimo-terceiro"],
    popular: false,
  },
  {
    slug: "salario-liquido",
    titulo: "Calculadora de Salário Líquido",
    descricao: "Descubra seu salário líquido após INSS e IRRF. Tabela progressiva 2026 com detalhamento completo.",
    categoria: "trabalhista",
    fonteJuridica: "Decreto 11.936/2024 (INSS) | RIR/2018 (IRRF)",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["salário líquido", "calcular salário líquido", "desconto INSS IRRF", "contracheque"],
    relacionadas: ["inss", "irrf", "rescisao-trabalhista", "decimo-terceiro"],
    popular: true,
  },
  {
    slug: "inss",
    titulo: "Calculadora de INSS 2026",
    descricao: "Calcule a contribuição ao INSS pela tabela progressiva 2026. Válido para empregados, autônomos e MEI.",
    categoria: "impostos",
    fonteJuridica: "Decreto 11.936/2024",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["calcular INSS", "tabela INSS 2026", "contribuição INSS", "alíquota INSS"],
    relacionadas: ["salario-liquido", "irrf", "irpf", "das-mei"],
    popular: true,
  },
  {
    slug: "irrf",
    titulo: "Calculadora de IRRF",
    descricao: "Calcule o Imposto de Renda Retido na Fonte com tabela progressiva 2026, dependentes e deduções.",
    categoria: "impostos",
    fonteJuridica: "RIR/2018 (Decreto 9.580/2018)",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["IRRF", "imposto de renda retido", "calcular IRRF", "tabela IRRF 2026"],
    relacionadas: ["inss", "salario-liquido", "irpf", "decimo-terceiro"],
    popular: false,
  },
  {
    slug: "irpf",
    titulo: "Calculadora de IRPF 2026",
    descricao: "Simule sua declaração do Imposto de Renda 2026: simplificado vs. completo, restituição ou imposto a pagar.",
    categoria: "impostos",
    fonteJuridica: "Lei 9.250/1995 | IN RFB 2.178/2024",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["IRPF 2026", "declaração imposto de renda", "restituição IR", "IR 2026"],
    relacionadas: ["irrf", "inss", "cdb", "tesouro-direto"],
    popular: true,
  },
  {
    slug: "das-mei",
    titulo: "Calculadora DAS MEI 2026",
    descricao: "Calcule o DAS mensal do MEI: INSS, ICMS e ISS. Verifique se está dentro do limite de faturamento.",
    categoria: "impostos",
    fonteJuridica: "LC 123/2006 | Resolução CGSN 140/2018",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["DAS MEI", "calcular MEI", "imposto MEI", "boleto MEI 2026"],
    relacionadas: ["inss", "margem-lucro", "irpf", "juros-compostos"],
    popular: false,
  },
  {
    slug: "juros-compostos",
    titulo: "Calculadora de Juros Compostos",
    descricao: "Calcule o montante final com juros compostos. Suporte a aportes mensais e diferentes periodicidades.",
    categoria: "financeiro",
    fonteJuridica: "Matemática financeira",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["juros compostos", "calcular juros compostos", "montante final", "capitalização composta"],
    relacionadas: ["cdb", "poupanca", "tesouro-direto", "emprestimo"],
    popular: true,
  },
  {
    slug: "porcentagem",
    titulo: "Calculadora de Porcentagem",
    descricao: "Calcule percentuais: valor de X%, variação percentual, acréscimo, desconto e mais.",
    categoria: "financeiro",
    fonteJuridica: "Matemática básica",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["calcular porcentagem", "porcentagem de um valor", "desconto percentual", "variação percentual"],
    relacionadas: ["juros-compostos", "margem-lucro", "imc", "emprestimo"],
    popular: false,
  },
  {
    slug: "emprestimo",
    titulo: "Calculadora de Empréstimo",
    descricao: "Simule empréstimos pela Tabela Price ou SAC. Veja parcelas, total de juros e CET.",
    categoria: "financeiro",
    fonteJuridica: "Res. CMN 3.517/2007 (CET)",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["calcular empréstimo", "simulador empréstimo", "tabela price SAC", "CET empréstimo"],
    relacionadas: ["financiamento", "juros-compostos", "cdb", "porcentagem"],
    popular: true,
  },
  {
    slug: "financiamento",
    titulo: "Calculadora de Financiamento",
    descricao: "Simule financiamentos imobiliários e de veículos: Price, SAC ou SAM. Evolução completa do saldo.",
    categoria: "financeiro",
    fonteJuridica: "Res. CMN 3.517/2007 | Circular BCB 2.905/1999",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["calcular financiamento", "simulador financiamento imóvel", "financiamento price SAC"],
    relacionadas: ["emprestimo", "juros-compostos", "porcentagem", "cdb"],
    popular: true,
  },
  {
    slug: "cdb",
    titulo: "Calculadora de CDB",
    descricao: "Calcule o rendimento líquido do CDB: prefixado, % CDI ou IPCA+. IR regressivo e IOF incluídos.",
    categoria: "investimentos",
    fonteJuridica: "Lei 11.033/2004 | Decreto 6.306/2007",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["calcular CDB", "rendimento CDB", "CDB CDI", "CDB prefixado IPCA"],
    relacionadas: ["poupanca", "tesouro-direto", "juros-compostos", "irpf"],
    popular: false,
  },
  {
    slug: "poupanca",
    titulo: "Calculadora de Poupança",
    descricao: "Simule o rendimento da poupança com a regra atual (Selic > 8,5%). Compare com CDB e Tesouro.",
    categoria: "investimentos",
    fonteJuridica: "Lei 8.177/1991 | Lei 12.703/2012",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["calcular poupança", "rendimento poupança 2026", "quanto rende poupança"],
    relacionadas: ["cdb", "tesouro-direto", "juros-compostos", "irpf"],
    popular: false,
  },
  {
    slug: "tesouro-direto",
    titulo: "Calculadora de Tesouro Direto",
    descricao: "Simule Tesouro Selic, Prefixado e IPCA+. Rentabilidade líquida com IR regressivo e taxa B3.",
    categoria: "investimentos",
    fonteJuridica: "Lei 11.033/2004 | Res. CVM 30/2021",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["tesouro direto", "calcular tesouro direto", "tesouro selic IPCA", "tesouro prefixado"],
    relacionadas: ["cdb", "poupanca", "juros-compostos", "irpf"],
    popular: false,
  },
  {
    slug: "imc",
    titulo: "Calculadora de IMC",
    descricao: "Calcule seu Índice de Massa Corporal e descubra o peso ideal segundo a OMS.",
    categoria: "saude",
    fonteJuridica: "OMS — World Health Organization (1997)",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["calcular IMC", "índice de massa corporal", "peso ideal", "IMC obesidade"],
    relacionadas: ["calorias", "porcentagem"],
    popular: true,
  },
  {
    slug: "calorias",
    titulo: "Calculadora de Calorias Diárias",
    descricao: "Calcule seu gasto calórico diário (TDEE) e a meta de calorias para perda de peso, manutenção ou ganho de massa.",
    categoria: "saude",
    fonteJuridica: "Mifflin-St Jeor (1990) | OMS",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["calcular calorias", "TDEE", "taxa metabólica basal", "dieta calorias"],
    relacionadas: ["imc", "porcentagem"],
    popular: false,
  },
  {
    slug: "margem-lucro",
    titulo: "Calculadora de Margem de Lucro",
    descricao: "Calcule margem de lucro, markup e preço de venda a partir do custo. Essencial para precificação.",
    categoria: "negocios",
    fonteJuridica: "Contabilidade de custos",
    dataAtualizacao: "2026-01-01",
    palavrasChave: ["margem de lucro", "calcular markup", "preço de venda", "precificação"],
    relacionadas: ["das-mei", "porcentagem", "juros-compostos"],
    popular: false,
  },
]

export const CATEGORIAS: Record<Categoria, { label: string; descricao: string; emoji: string }> = {
  trabalhista:   { label: "Trabalhistas",    descricao: "CLT, rescisão, férias, 13º e mais", emoji: "👔" },
  impostos:      { label: "Impostos",        descricao: "INSS, IRRF, IRPF, MEI e mais",      emoji: "🧾" },
  financeiro:    { label: "Financeiro",      descricao: "Juros, empréstimos, porcentagem",    emoji: "💰" },
  investimentos: { label: "Investimentos",   descricao: "CDB, poupança, Tesouro Direto",      emoji: "📈" },
  saude:         { label: "Saúde",           descricao: "IMC, calorias, peso ideal",          emoji: "❤️" },
  negocios:      { label: "Negócios",        descricao: "Margem, markup, precificação",       emoji: "🏢" },
}

export function getCalculadora(slug: string): CalculadoraConfig | undefined {
  return CALCULADORAS.find((c) => c.slug === slug)
}

export function getRelacionadas(slugs: string[]): CalculadoraConfig[] {
  return slugs.map((s) => CALCULADORAS.find((c) => c.slug === s)).filter(Boolean) as CalculadoraConfig[]
}
```

---

## TAREFA 2: Homepage `/`

```typescript
// apps/web/src/app/page.tsx
import { Metadata } from "next"
import Link from "next/link"
import { CALCULADORAS, CATEGORIAS, type Categoria } from "@/data/calculadoras"

export const metadata: Metadata = {
  title: "Calculadoras Online Grátis 2026 | CalculosOnline.com.br",
  description: "Calculadoras online precisas e gratuitas para trabalhadores, autônomos e MEIs. INSS, IRRF, rescisão, juros e muito mais. Tabelas 2026 atualizadas.",
  openGraph: {
    title: "Calculadoras Online Grátis 2026",
    description: "Precisão legislativa, resultados instantâneos.",
    url: "https://calculosonline.com.br",
    siteName: "CalculosOnline.com.br",
    locale: "pt_BR",
    type: "website",
  },
}

export default function HomePage() {
  const populares = CALCULADORAS.filter((c) => c.popular)
  const porCategoria = Object.entries(CATEGORIAS) as [Categoria, typeof CATEGORIAS[Categoria]][]

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-12">

      {/* Hero */}
      <section className="text-center space-y-4 py-8">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
          Calculadoras Online{" "}
          <span className="text-brand-600">Precisas e Gratuitas</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tabelas INSS, IRRF e CLT sempre atualizadas. Resultados com base legal
          e detalhamento completo.
        </p>

        {/* Barra de busca — implementar com client-side filtering */}
        <div className="max-w-md mx-auto">
          <CalculatorSearch calculadoras={CALCULADORAS} />
        </div>

        {/* Selos de confiança */}
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          {["⚖️ Fórmulas baseadas na CLT", "✅ Tabelas 2026 atualizadas", "🔒 Sem cadastro", "📱 Funciona offline"].map((s) => (
            <span key={s} className="bg-gray-100 text-gray-600 rounded-full px-3 py-1">{s}</span>
          ))}
        </div>
      </section>

      {/* Calculadoras Populares */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Calculadoras mais usadas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {populares.map((calc) => (
            <Link
              key={calc.slug}
              href={`/calculadora/${calc.slug}`}
              className="group flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-400 hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden>
                  {CATEGORIAS[calc.categoria].emoji}
                </span>
                <span className="text-xs font-medium text-brand-600 uppercase tracking-wide">
                  {CATEGORIAS[calc.categoria].label}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 leading-tight">
                {calc.titulo}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2">{calc.descricao}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Por Categoria */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Explorar por categoria</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {porCategoria.map(([slug, cat]) => {
            const count = CALCULADORAS.filter((c) => c.categoria === slug).length
            return (
              <Link
                key={slug}
                href={`/categoria/${slug}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-brand-400 hover:bg-brand-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <span className="text-2xl" aria-hidden>{cat.emoji}</span>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{cat.label}</p>
                  <p className="text-xs text-gray-500">{count} calculadoras</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

    </main>
  )
}
```

### Componente de busca client-side

```typescript
// apps/web/src/components/CalculatorSearch.tsx
"use client"
import { useState } from "react"
import Link from "next/link"
import type { CalculadoraConfig } from "@/data/calculadoras"

export function CalculatorSearch({ calculadoras }: { calculadoras: CalculadoraConfig[] }) {
  const [query, setQuery] = useState("")
  const resultados = query.length >= 2
    ? calculadoras.filter((c) =>
        c.titulo.toLowerCase().includes(query.toLowerCase()) ||
        c.palavrasChave.some((k) => k.toLowerCase().includes(query.toLowerCase())),
      ).slice(0, 6)
    : []

  return (
    <div className="relative">
      <input
        type="search"
        placeholder="Buscar calculadora..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-full border border-gray-300 px-5 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        aria-label="Buscar calculadora"
        aria-autocomplete="list"
        aria-controls={resultados.length > 0 ? "busca-resultados" : undefined}
      />
      {resultados.length > 0 && (
        <ul
          id="busca-resultados"
          role="listbox"
          className="absolute top-full mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden"
        >
          {resultados.map((c) => (
            <li key={c.slug} role="option">
              <Link
                href={`/calculadora/${c.slug}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-brand-50 transition-colors"
                onClick={() => setQuery("")}
              >
                <span className="font-medium text-sm text-gray-900">{c.titulo}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

---

## TAREFA 3: Página de Calculadora `/calculadora/[slug]`

Esta é a página mais importante — precisa de SSG + ISR + Schema Markup completo.

```typescript
// apps/web/src/app/calculadora/[slug]/page.tsx
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { CALCULADORAS, getCalculadora, getRelacionadas } from "@/data/calculadoras"
import { CalculadoraPageClient } from "@/components/calculadoras/CalculadoraPageClient"
import { ContentLoader } from "@/components/ContentLoader"
import { Breadcrumb } from "@calculosonline/ui"
import { gerarSchemas } from "@/lib/schema"

// SSG: gera todas as páginas em build time
export async function generateStaticParams() {
  return CALCULADORAS.map((c) => ({ slug: c.slug }))
}

// ISR: revalida a cada 24h (atualização das tabelas legislativas)
export const revalidate = 86400

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const calc = getCalculadora(slug)
  if (!calc) return {}

  const title = `${calc.titulo} Online e Gratuita 2026 | CalculosOnline`
  const description = calc.descricao

  return {
    title,
    description,
    keywords: calc.palavrasChave.join(", "),
    openGraph: {
      title,
      description,
      url: `https://calculosonline.com.br/calculadora/${slug}`,
      siteName: "CalculosOnline.com.br",
      locale: "pt_BR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://calculosonline.com.br/calculadora/${slug}`,
    },
    other: {
      "google-adsense-account": process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? "",
    },
  }
}

export default async function CalculadoraPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const calc = getCalculadora(slug)
  if (!calc) notFound()

  const relacionadas = getRelacionadas(calc.relacionadas)
  const schemas = gerarSchemas(calc)

  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />

      <main>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Breadcrumb items={[
            { label: "Início", href: "/" },
            { label: calc.categoria.charAt(0).toUpperCase() + calc.categoria.slice(1), href: `/categoria/${calc.categoria}` },
            { label: calc.titulo },
          ]} />
        </div>

        {/* Componente client (formulário interativo + resultado) */}
        <CalculadoraPageClient
          slug={slug}
          config={calc}
          relacionadas={relacionadas}
        />

        {/* Conteúdo editorial estático (MDX) — server component */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ContentLoader slug={slug} />
        </div>
      </main>
    </>
  )
}
```

### Schema Markup Generator

```typescript
// apps/web/src/lib/schema.ts
import type { CalculadoraConfig } from "@/data/calculadoras"

export function gerarSchemas(calc: CalculadoraConfig) {
  const url = `https://calculosonline.com.br/calculadora/${calc.slug}`

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": calc.titulo,
    "description": calc.descricao,
    "url": url,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "isAccessibleForFree": true,
    "inLanguage": "pt-BR",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "BRL" },
    "provider": {
      "@type": "Organization",
      "name": "CalculosOnline.com.br",
      "url": "https://calculosonline.com.br",
    },
  }

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://calculosonline.com.br" },
      { "@type": "ListItem", "position": 2, "name": calc.categoria, "item": `https://calculosonline.com.br/categoria/${calc.categoria}` },
      { "@type": "ListItem", "position": 3, "name": calc.titulo, "item": url },
    ],
  }

  // FAQ schema — será preenchido com dados reais do MDX no Sprint 1.4
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Como usar a ${calc.titulo}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Preencha os campos com seus dados e clique em Calcular. O resultado aparece instantaneamente com detalhamento completo baseado em ${calc.fonteJuridica}.`,
        },
      },
      {
        "@type": "Question",
        "name": `A ${calc.titulo} está atualizada para 2026?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Sim. As tabelas foram atualizadas em ${new Date(calc.dataAtualizacao).toLocaleDateString("pt-BR")} com base na legislação vigente: ${calc.fonteJuridica}.`,
        },
      },
    ],
  }

  return [webApp, breadcrumb, faq]
}
```

### Componente Client da Calculadora

```typescript
// apps/web/src/components/calculadoras/CalculadoraPageClient.tsx
"use client"

import { useState } from "react"
import { CalculatorLayout, CalculatorResult, RelatedCalculators } from "@calculosonline/ui"
import type { CalculadoraConfig } from "@/data/calculadoras"
import type { ResultadoCalculo } from "@calculosonline/core"
import { getCalculadoraForm } from "./forms"

interface Props {
  slug: string
  config: CalculadoraConfig
  relacionadas: CalculadoraConfig[]
}

export function CalculadoraPageClient({ slug, config, relacionadas }: Props) {
  const [resultado, setResultado] = useState<ResultadoCalculo<number> | null>(null)
  const [loading, setLoading] = useState(false)

  const FormComponent = getCalculadoraForm(slug)

  return (
    <CalculatorLayout
      titulo={`${config.titulo} Online e Gratuita 2026`}
      descricao={config.descricao}
      fonteJuridica={config.fonteJuridica}
      dataAtualizacao={config.dataAtualizacao}
      adSlotTop={config.adSlotTop}
      adSlotMid={config.adSlotMid}
      adSlotBottom={config.adSlotBottom}
      form={
        <FormComponent
          onResult={setResultado}
          isLoading={loading}
          setLoading={setLoading}
        />
      }
      result={
        resultado ? (
          <CalculatorResult
            resultado={resultado}
            titulo="Resultado"
          />
        ) : null
      }
      content={null}  {/* preenchido pelo ContentLoader no Server Component pai */}
      related={
        <RelatedCalculators
          items={relacionadas.map((r) => ({
            slug: r.slug,
            titulo: r.titulo,
            categoria: r.categoria,
            descricaoCurta: r.descricao,
          }))}
        />
      }
    />
  )
}
```

---

## TAREFA 4: Formulários por Calculadora

Criar um formulário específico para cada calculadora. Exemplo para rescisão:

```typescript
// apps/web/src/components/calculadoras/forms/RescisaoForm.tsx
"use client"
import { z } from "zod"
import { CalculatorForm } from "@calculosonline/ui"
import { calcularRescisao } from "@calculosonline/core"
import type { ResultadoCalculo } from "@calculosonline/core"

const schema = z.object({
  salarioBruto: z.number().positive("Salário deve ser positivo"),
  dataAdmissao: z.string().min(10, "Data inválida"),
  dataRescisao: z.string().min(10, "Data inválida"),
  motivoRescisao: z.enum(["sem_justa_causa", "justa_causa", "pedido_demissao", "acordo_mutuo", "aposentadoria"]),
  saldoFGTS: z.number().min(0, "FGTS não pode ser negativo"),
  numeroDependentesIRRF: z.number().min(0).default(0),
})

interface Props {
  onResult: (r: ResultadoCalculo<number>) => void
  isLoading: boolean
  setLoading: (v: boolean) => void
}

export function RescisaoForm({ onResult, isLoading, setLoading }: Props) {
  const handleSubmit = (data: z.infer<typeof schema>) => {
    setLoading(true)
    // calcularRescisao é síncrono (puro), setTimeout apenas para UX
    setTimeout(() => {
      const result = calcularRescisao({
        ...data,
        avisoPrevisTrabalhado: false,
      })
      if (result.sucesso) onResult(result.dados)
      setLoading(false)
    }, 0)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        salarioBruto:           { label: "Salário Bruto", prefix: "R$", placeholder: "3.000,00", type: "number" },
        dataAdmissao:           { label: "Data de Admissão", type: "text", placeholder: "01/01/2023", hint: "DD/MM/AAAA" },
        dataRescisao:           { label: "Data de Rescisão", type: "text", placeholder: "15/03/2026" },
        motivoRescisao:         {
          label: "Motivo da Rescisão", type: "select",
          options: [
            { value: "sem_justa_causa",  label: "Demissão sem justa causa" },
            { value: "justa_causa",      label: "Justa causa pelo empregador" },
            { value: "pedido_demissao",  label: "Pedido de demissão" },
            { value: "acordo_mutuo",     label: "Acordo mútuo (art. 484-A)" },
            { value: "aposentadoria",    label: "Aposentadoria" },
          ],
        },
        saldoFGTS:              { label: "Saldo do FGTS", prefix: "R$", hint: "Veja no app FGTS ou extrato Caixa" },
        numeroDependentesIRRF:  { label: "Dependentes (IRRF)", suffix: "pessoas", hint: "Para cálculo do IRRF na rescisão" },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular Rescisão"
      isLoading={isLoading}
    />
  )
}
```

### Dispatcher de formulários

```typescript
// apps/web/src/components/calculadoras/forms/index.ts
import { RescisaoForm } from "./RescisaoForm"
// ... importar todos os forms

const FORMS: Record<string, React.ComponentType<any>> = {
  "rescisao-trabalhista":  RescisaoForm,
  "ferias":                FeriasForm,
  "decimo-terceiro":       DecimoTerceiroForm,
  "hora-extra":            HoraExtraForm,
  "fgts":                  FGTSForm,
  "salario-liquido":       SalarioLiquidoForm,
  "inss":                  INSSForm,
  "irrf":                  IRRFForm,
  "irpf":                  IRPFForm,
  "das-mei":               DASMEIForm,
  "juros-compostos":       JurosCompostosForm,
  "porcentagem":           PorcentagemForm,
  "emprestimo":            EmprestimoForm,
  "financiamento":         FinanciamentoForm,
  "cdb":                   CDBForm,
  "poupanca":              PoupancaForm,
  "tesouro-direto":        TesouroDiretoForm,
  "imc":                   IMCForm,
  "calorias":              CaloriasForm,
  "margem-lucro":          MargemLucroForm,
}

export function getCalculadoraForm(slug: string) {
  return FORMS[slug] ?? (() => <p>Calculadora não encontrada</p>)
}
```

---

## TAREFA 5: Página de Categoria `/categoria/[categoria]`

```typescript
// apps/web/src/app/categoria/[categoria]/page.tsx
import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { CALCULADORAS, CATEGORIAS, type Categoria } from "@/data/calculadoras"

export async function generateStaticParams() {
  return Object.keys(CATEGORIAS).map((c) => ({ categoria: c }))
}

export const revalidate = false  // estático forever (só muda quando adicionamos calculadoras)

export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }): Promise<Metadata> {
  const { categoria } = await params
  const cat = CATEGORIAS[categoria as Categoria]
  if (!cat) return {}
  return {
    title: `Calculadoras ${cat.label} Online e Grátis 2026 | CalculosOnline`,
    description: `${cat.descricao}. Todas as calculadoras ${cat.label.toLowerCase()} com tabelas 2026 atualizadas.`,
    alternates: { canonical: `https://calculosonline.com.br/categoria/${categoria}` },
  }
}

export default async function CategoriaPage({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params
  const cat = CATEGORIAS[categoria as Categoria]
  if (!cat) notFound()

  const calculadoras = CALCULADORAS.filter((c) => c.categoria === categoria)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl" aria-hidden>{cat.emoji}</span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Calculadoras {cat.label}
          </h1>
        </div>
        <p className="text-gray-600">{cat.descricao} — todas gratuitas e atualizadas para 2026.</p>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
        {calculadoras.map((calc) => (
          <li key={calc.slug}>
            <Link
              href={`/calculadora/${calc.slug}`}
              className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-400 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <h2 className="font-semibold text-gray-900">{calc.titulo}</h2>
              <p className="text-sm text-gray-500 line-clamp-2">{calc.descricao}</p>
              <span className="text-xs text-brand-600 font-mono">{calc.fonteJuridica.split("|")[0]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
```

---

## TAREFA 6: Páginas Institucionais

Necessárias para aprovação do AdSense (Sprint 1.6).

```typescript
// apps/web/src/app/sobre/page.tsx
export const metadata = {
  title: "Sobre | CalculosOnline.com.br",
  description: "Conheça a plataforma de calculadoras online mais precisa do Brasil.",
}

export default function SobrePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
      <h1>Sobre o CalculosOnline.com.br</h1>
      <p>
        O CalculosOnline.com.br é uma plataforma gratuita de calculadoras online para
        trabalhadores, autônomos, MEIs e empresas brasileiras. Nossa missão é oferecer
        cálculos precisos baseados na legislação vigente — sem cadastro, sem taxas.
      </p>
      <h2>Nossa proposta de valor</h2>
      <ul>
        <li><strong>Precisão legislativa:</strong> Fórmulas baseadas na CLT, tabelas INSS/IRRF atualizadas anualmente.</li>
        <li><strong>Transparência:</strong> Cada resultado mostra o detalhamento linha a linha e a base legal aplicada.</li>
        <li><strong>Multiplataforma:</strong> Funciona no navegador, como app Android e como plugin para Google Sheets.</li>
        <li><strong>Gratuito:</strong> Sem cadastro, sem assinatura, sem limitações.</li>
      </ul>
      <h2>Aviso legal</h2>
      <p>
        As calculadoras são fornecidas para fins informativos e educacionais. Para decisões
        jurídicas ou fiscais, consulte um advogado trabalhista ou contador habilitado.
        As tabelas são atualizadas periodicamente, mas podem não refletir mudanças
        legislativas muito recentes.
      </p>
    </main>
  )
}
```

```typescript
// apps/web/src/app/privacidade/page.tsx — essencial para AdSense
export const metadata = {
  title: "Política de Privacidade | CalculosOnline.com.br",
}

export default function PrivacidadePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
      <h1>Política de Privacidade</h1>
      <p>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

      <h2>Dados coletados</h2>
      <p>
        O CalculosOnline.com.br não coleta dados pessoais identificáveis. Os cálculos
        são realizados localmente no seu navegador e não são enviados a servidores.
      </p>

      <h2>Cookies e anúncios</h2>
      <p>
        Utilizamos o Google AdSense para exibir anúncios relevantes. O Google pode usar
        cookies para personalizar anúncios com base no histórico de navegação. Você pode
        gerenciar preferências em{" "}
        <a href="https://adssettings.google.com">adssettings.google.com</a>.
      </p>

      <h2>Google Analytics</h2>
      <p>
        Utilizamos o Google Analytics 4 para medir audiência de forma anonimizada.
        Nenhum dado pessoal é coletado ou compartilhado.
      </p>

      <h2>Contato</h2>
      <p>Dúvidas sobre esta política: <a href="/contato">entre em contato</a>.</p>
    </main>
  )
}
```

---

## TAREFA 7: Layout Raiz e Navegação

```typescript
// apps/web/src/app/layout.tsx
import type { Metadata } from "next"
import { Inter, Roboto_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono", display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL("https://calculosonline.com.br"),
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${robotoMono.variable}`}>
      <head>
        {/* AdSense auto ads — apenas em produção */}
        {process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
```

---

## CRITÉRIOS DE ACEITE

```bash
# Build completo sem erros
pnpm build

# Todas as rotas SSG geradas (20 calculadoras + 6 categorias + páginas institucionais)
# Verificar em .next/server/app/calculadora/[slug]/

# Lighthouse em localhost após build
# Performance > 90, SEO > 95, Accessibility > 90, Best Practices > 90
```

**Checklist de rotas funcionando:**
- [ ] `/` — homepage com populares e categorias
- [ ] `/calculadora/rescisao-trabalhista` — formulário + schema markup
- [ ] `/calculadora/salario-liquido` — cálculo funcional, resultado exibido
- [ ] `/categoria/trabalhista` — lista das 6 calculadoras
- [ ] `/sobre`, `/privacidade`, `/contato` — páginas sem erro 404
- [ ] `/robots.txt` — sem bloquear /calculadora/
- [ ] `View Source` da página de calculadora mostra JSON-LD no `<head>`
- [ ] Nenhuma hydration error no console

> **Próximo passo:** Sprint 1.4 — criar o conteúdo editorial MDX para cada calculadora.
