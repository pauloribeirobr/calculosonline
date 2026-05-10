# Prompt de IA — Sprint 1.2: UI Components
**calculosonline.com.br | Fase 1 — MVP | Semanas 3–4 (paralela à 1.1)**

---

## PRÉ-REQUISITO

- Sprint 0.1 concluída: monorepo, `packages/ui` esqueleto, Tailwind configurado em `apps/web`
- Sprint 0.2 concluída: interfaces `ResultadoCalculo`, `ItemDetalhamento`, `ResultadoOuErro` exportadas de `packages/core`
- **Acesso ao código do Recibo Fácil** em `/home/paulo/projects/next/recibofacil/frontend/src/` para cópia direta de componentes

---

## ESTRATÉGIA: REUSO DA IDENTIDADE VISUAL DO RECIBO FÁCIL

Esta sprint **não desenha do zero**. A maior parte dos componentes é copiada e adaptada do Recibo Fácil (que já está em produção em `recibofacil.com.br`).

**Detalhamento completo em [`docs/IDENTIDADE_VISUAL.md`](../docs/IDENTIDADE_VISUAL.md)**, incluindo:
- Mapa de equivalência (qual componente do RF vira qual do Calculos Online)
- Tokens de design (cores, tipografia, sombras, bordas)
- Estrutura de pastas espelhada
- Ordem de cópia recomendada (6 dias)
- Componentes do RF que **não devem ser portados** (Auth, A4, PDF, etc.)

### Onde fica cada coisa

| Componente | Local | Origem |
|------------|-------|--------|
| `Header`, `Footer`, `Button`, `Input`, `Modal`, `Logo`, `Navigation`, `Breadcrumbs`, `Loading`, `ScrollToTop` | `apps/web/src/components/common/` | Cópia adaptada do RF |
| `Hero`, `CalculatorTypes`, `HowItWorks`, `Features`, `Stats`, `Testimonials`, `FAQ`, `FinalCta`, `SeoContent` | `apps/web/src/components/home/` | Cópia adaptada do RF |
| `MicrosoftClarity`, `ErrorLogger` | `apps/web/src/components/analytics/` | Cópia literal do RF |
| `PageSeo`, `JsonLd` | `apps/web/src/components/seo/` | Cópia literal do RF |
| `CalculatorForm`, `CalculatorResult`, `CalculatorLayout`, `AdSlot`, `LegalBadge`, `UpdatedBadge`, `RelatedCalculators` | `packages/ui/src/` (reutilizável Web/Desktop/TWA) | **NOVO** — específico do Calculos Online |

> Os componentes específicos de calculadora vão para `packages/ui` (compartilhados) porque serão reutilizados no app Tauri (Sprint 2.2) e na sidebar do plugin Sheets (Sprint 2.3). Os componentes de marketing/comum ficam em `apps/web` porque só fazem sentido no contexto do site.

---

## OBJETIVO DA SPRINT 1.2

Entregar a casca visual completa do site (Header, Footer, Home) + os componentes específicos de calculadora. Os componentes devem ser:

- **Visualmente idênticos ao Recibo Fácil** (mesma marca, design system unificado)
- **Genéricos** — `<CalculatorForm>` funciona para qualquer calculadora via schema Zod
- **Acessíveis** — ARIA labels, foco gerenciado, leitores de tela
- **Performáticos** — sem layout shift (CLS = 0), lazy load onde necessário
- **Mobile-first** — responsivos de 375px a 1440px

---

## DEPENDÊNCIAS DO packages/ui

```json
// packages/ui/package.json
{
  "name": "@calculosonline/ui",
  "dependencies": {
    "@calculosonline/core": "workspace:*",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "@hookform/resolvers": "^3.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

---

## TAREFA 0: Casca Visual — Cópia do Recibo Fácil

Antes de criar os componentes específicos de calculadora, monte a estrutura visual do site copiando do Recibo Fácil.

### 0.1 Fundação

Copiar e adaptar de `recibofacil/frontend/src/`:

- `app/globals.css` → remover regras `@page` / impressão A4 / `.a4-container`. Manter Inter Variable, classes `.prose`, `.bg-grid-pattern`, animação `@keyframes float`.
- `app/layout.tsx` → adaptar metadata para calculosonline.com.br, manter estrutura `<ClientProviders>`, `<Header>`, `<main>`, `<Footer>`, `<ScrollToTop>`, `<Analytics>`, `<MicrosoftClarity>`, `<ErrorLogger>`.

### 0.2 Componentes comuns (`apps/web/src/components/common/`)

Copiar literalmente (com ajuste de strings/links):

- `Button.tsx` — variantes `primary | secondary | outline | ghost | danger | white`, tamanhos `sm | md | lg`, estados loading/leftIcon/rightIcon
- `Input.tsx` — máscaras automáticas para `cpf`, `cnpj`, `cep`, `phone`, `currency` (deduzidas pelo `name`/`label`/`id`)
- `Modal.tsx`, `Loading.tsx`, `Breadcrumbs.tsx`, `ScrollToTop.tsx`, `Navigation.tsx`
- `Logo.tsx` — **trocar SVG** para o logo do calculosonline (manter API: `width`, `height`, `className`)

Adaptar:

- `Header.tsx` — manter shell idêntico, mas:
  - Substituir botão "Gerar Documento" por "Calcular agora" com ícone `CalculatorIcon`
  - Substituir "Meus Documentos" por "Categorias" (link para `/categorias`)
  - Remover `useAuth`, `useDocumentService` e `DocumentPickerModal` (sem login na Fase 1)
  - Remover bloco de status de plano premium / `paymentStatus`
  - Manter mobile menu com `Transition` do Headless UI
- `Footer.tsx` — manter shell, **trocar `footerSections`**:
  ```ts
  const footerSections = [
    { title: 'Trabalhistas',  links: [/* Rescisão, Férias, 13º, Hora Extra, FGTS, Salário Líquido */] },
    { title: 'Impostos',      links: [/* IRPF, IRRF, INSS, DAS MEI */] },
    { title: 'Financeiras',   links: [/* Juros Compostos, Empréstimo, Financiamento, Porcentagem */] },
    { title: 'Investimentos', links: [/* CDB, Poupança, Tesouro Direto */] },
    { title: 'Institucional', links: [/* Sobre, Blog, Contato, Termos, Privacidade */] },
  ]
  ```
  - Trocar selo "100% Seguro e Privado" por "100% Gratuito e sem cadastro" (manter visual idêntico)
  - Substituir copyright para `calculosonline.com.br`

### 0.3 Componentes home (`apps/web/src/components/home/`)

Copiar literalmente todos e adaptar conteúdo:

- `Hero.tsx` — substituir `DocumentStack` por `CalculatorStack` com 5 mockups de calculadoras (Rescisão, IRPF, Juros Compostos, IMC, FGTS) seguindo o mesmo padrão visual de cards rotacionados/sobrepostos. Trocar H1 e subtítulo:
  ```
  H1: "Calculadoras Online Grátis e Atualizadas para 2026"
  Sub: "Cálculos trabalhistas, impostos, financeiros e mais. Sem cadastro,
        com base legal e tabelas atualizadas (INSS, IRRF, salário mínimo)."
  CTA principal: "Ver calculadoras" (rola para CalculatorTypes)
  CTA secundário: "Como funciona" (âncora #como-funciona)
  Indicadores: "Sem cadastro", "Tabelas 2026", "Base legal verificada"
  ```
- `DocumentTypes.tsx` → renomear para `CalculatorTypes.tsx` — substituir `documentGenerators` por `calculatorRegistry` (de `lib/calculators.ts`). Manter visual: `featuredGenerators` (3 destaque) + `remainingGenerators` (grid completo).
- `HowItWorks.tsx` — manter 4 passos, trocar texto:
  1. "Escolha a calculadora"
  2. "Preencha os dados"
  3. "Veja o resultado e o detalhamento"
  4. "Salve, imprima ou compartilhe"
- `Features.tsx` — manter 6 cards, trocar features:
  1. "Precisão legislativa" — fórmulas baseadas em CLT/INSS/IRRF
  2. "Multiplataforma" — Web, Android, Desktop, Sheets
  3. "Sem cadastro" — uso instantâneo
  4. "Funciona offline" — PWA
  5. "Atualizado 2026" — tabelas vigentes
  6. "Mobile-first" — qualquer dispositivo
- `Stats.tsx`, `Testimonials.tsx`, `FAQ.tsx`, `SeoContent.tsx`, `FinalCta.tsx` — copiar visual; trocar conteúdo conforme nicho de calculadoras
- **Não trazer:** `RecentDocuments.tsx`, `recent-documents/*`, `DemoProcess.tsx` (específicos de geração de documento com persistência)

### 0.4 Analytics e SEO (cópia literal)

Copiar de `recibofacil/frontend/src/components/`:

- `analytics/MicrosoftClarity.tsx` → ajustar `CLARITY_PROJECT_ID` por env var
- `analytics/ErrorLogger.tsx` → manter literal
- `seo/PageSeo.tsx` → trocar URL base para `https://calculosonline.com.br`
- `seo/JsonLd.tsx` → adicionar variante `<CalculatorJsonLd>` com `@type: WebApplication` por calculadora (Sprint 1.3)

### 0.5 Critério de aceite da Tarefa 0

Antes de seguir para a Tarefa 1, confirmar:

- [ ] `pnpm dev` em `apps/web` renderiza homepage com Header + Hero + CalculatorTypes (placeholder) + HowItWorks + Features + Footer
- [ ] Visualmente, abrindo lado a lado com `recibofacil.com.br`, é evidente que são "irmãos" (mesma fonte, cores, espaçamentos, sombras, padrão de cards)
- [ ] Mobile menu abre com transição
- [ ] Lighthouse Performance > 85 e Acessibilidade > 95
- [ ] Sem erros no console

---

## TAREFA 1: Design Tokens (Tailwind Config)

### `packages/ui/tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Marca CalculosOnline
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a8a",
        },
        // Semântica de resultado
        result: {
          positive: "#16a34a",   // valores a receber (crédito)
          negative: "#dc2626",   // descontos (débito)
          neutral:  "#6b7280",   // informativo
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-roboto-mono)", "monospace"],
      },
      fontSize: {
        // Escala usada nos resultados monetários
        "result-lg": ["2rem",    { lineHeight: "2.5rem", fontWeight: "700" }],
        "result-md": ["1.5rem",  { lineHeight: "2rem",   fontWeight: "600" }],
      },
    },
  },
}
export default config
```

---

## TAREFA 2: Utilitário cn() (class names)

```typescript
// packages/ui/src/utils/cn.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## TAREFA 3: \<CalculatorForm />

Componente genérico que recebe um schema Zod e renderiza os campos automaticamente.

```typescript
// packages/ui/src/CalculatorForm/index.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z, ZodObject, ZodRawShape } from "zod"
import { cn } from "../utils/cn"

// Metadados descritivos para cada campo do formulário
export interface FieldMeta {
  label: string
  placeholder?: string
  hint?: string          // texto de ajuda abaixo do campo
  prefix?: string        // "R$", "%", "kg"
  suffix?: string        // "/mês", "anos"
  type?: "number" | "text" | "select" | "radio"
  options?: Array<{ value: string; label: string }>  // para select e radio
}

export interface CalculatorFormProps<T extends ZodRawShape> {
  schema: ZodObject<T>
  fields: Record<keyof z.infer<ZodObject<T>>, FieldMeta>
  onSubmit: (data: z.infer<ZodObject<T>>) => void
  submitLabel?: string
  isLoading?: boolean
  defaultValues?: Partial<z.infer<ZodObject<T>>>
}

export function CalculatorForm<T extends ZodRawShape>({
  schema, fields, onSubmit, submitLabel = "Calcular", isLoading, defaultValues,
}: CalculatorFormProps<T>) {
  const {
    register, handleSubmit, formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as z.infer<typeof schema>,
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
      aria-label="Formulário de cálculo"
    >
      {Object.entries(fields).map(([name, meta]) => {
        const fieldMeta = meta as FieldMeta
        const error = errors[name as keyof typeof errors]

        return (
          <div key={name} className="flex flex-col gap-1">
            <label
              htmlFor={name}
              className="text-sm font-medium text-gray-700"
            >
              {fieldMeta.label}
            </label>

            <div className="relative flex items-center">
              {fieldMeta.prefix && (
                <span className="absolute left-3 text-sm text-gray-500 select-none">
                  {fieldMeta.prefix}
                </span>
              )}

              {fieldMeta.type === "select" ? (
                <select
                  id={name}
                  {...register(name as any)}
                  className={cn(
                    "w-full rounded-lg border bg-white px-3 py-2.5 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-brand-500",
                    error ? "border-red-400" : "border-gray-300",
                  )}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${name}-error` : undefined}
                >
                  {fieldMeta.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : fieldMeta.type === "radio" ? (
                <fieldset className="flex flex-wrap gap-3">
                  {fieldMeta.options?.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={opt.value}
                        {...register(name as any)}
                        className="accent-brand-600"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <input
                  id={name}
                  type={fieldMeta.type ?? "number"}
                  inputMode={fieldMeta.type === "number" ? "decimal" : "text"}
                  placeholder={fieldMeta.placeholder}
                  {...register(name as any, {
                    valueAsNumber: fieldMeta.type !== "text",
                  })}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-brand-500",
                    fieldMeta.prefix && "pl-10",
                    fieldMeta.suffix && "pr-14",
                    error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white",
                  )}
                  aria-invalid={!!error}
                  aria-describedby={
                    [error ? `${name}-error` : null, fieldMeta.hint ? `${name}-hint` : null]
                      .filter(Boolean).join(" ") || undefined
                  }
                />
              )}

              {fieldMeta.suffix && (
                <span className="absolute right-3 text-sm text-gray-500 select-none pointer-events-none">
                  {fieldMeta.suffix}
                </span>
              )}
            </div>

            {fieldMeta.hint && !error && (
              <p id={`${name}-hint`} className="text-xs text-gray-500">{fieldMeta.hint}</p>
            )}
            {error && (
              <p id={`${name}-error`} role="alert" className="text-xs text-red-600">
                {error.message as string}
              </p>
            )}
          </div>
        )
      })}

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white",
          "hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors duration-150",
        )}
        aria-busy={isLoading}
      >
        {isLoading ? "Calculando..." : submitLabel}
      </button>
    </form>
  )
}
```

---

## TAREFA 4: \<CalculatorResult />

```typescript
// packages/ui/src/CalculatorResult/index.tsx
"use client"

import { useState } from "react"
import type { ResultadoCalculo, ItemDetalhamento } from "@calculosonline/core"
import { cn } from "../utils/cn"

export interface CalculatorResultProps {
  resultado: ResultadoCalculo<number>
  /** Formata o resultado principal: "currency" | "percent" | "number" | custom fn */
  formato?: "currency" | "percent" | "number" | ((v: number) => string)
  titulo?: string
}

function formatarValor(valor: number, formato: CalculatorResultProps["formato"] = "currency"): string {
  if (typeof formato === "function") return formato(valor)
  if (formato === "currency") return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  if (formato === "percent") return `${valor.toFixed(2)}%`
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
}

function corItem(tipo: ItemDetalhamento["tipo"]) {
  return { credito: "text-result-positive", debito: "text-result-negative", neutro: "text-gray-700" }[tipo]
}

export function CalculatorResult({ resultado, formato, titulo }: CalculatorResultProps) {
  const [aberto, setAberto] = useState(false)

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
      role="region"
      aria-label="Resultado do cálculo"
    >
      {/* Resultado Principal */}
      <div className="bg-brand-600 px-6 py-5 text-white">
        {titulo && <p className="text-sm font-medium opacity-80 mb-1">{titulo}</p>}
        <p className="text-result-lg font-mono" aria-live="polite">
          {formatarValor(resultado.resultado, formato)}
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs opacity-75">
          <span>Tabelas: {resultado.dataReferencia}</span>
        </div>
      </div>

      {/* Avisos */}
      {resultado.avisos && resultado.avisos.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          {resultado.avisos.map((aviso, i) => (
            <p key={i} className="text-xs text-amber-800 flex items-start gap-1">
              <span aria-hidden>⚠️</span> {aviso}
            </p>
          ))}
        </div>
      )}

      {/* Detalhamento — Accordion */}
      <div className="divide-y divide-gray-100">
        <button
          type="button"
          onClick={() => setAberto(!aberto)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3",
            "text-sm font-medium text-gray-700 hover:bg-gray-50",
            "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500",
          )}
          aria-expanded={aberto}
          aria-controls="detalhamento-lista"
        >
          <span>Ver detalhamento do cálculo</span>
          <span
            className={cn("transition-transform duration-200", aberto && "rotate-180")}
            aria-hidden
          >
            ▼
          </span>
        </button>

        {aberto && (
          <ul
            id="detalhamento-lista"
            className="px-4 py-2 space-y-1"
            role="list"
            aria-label="Detalhamento linha a linha"
          >
            {resultado.detalhamento.map((item, i) => (
              <li key={i} className="flex items-baseline justify-between py-1">
                <span className="text-sm text-gray-600 flex-1 pr-4">
                  {item.descricao}
                  {item.formula && (
                    <span className="ml-1 font-mono text-xs text-gray-400">
                      ({item.formula})
                    </span>
                  )}
                </span>
                <span className={cn("text-sm font-medium font-mono tabular-nums", corItem(item.tipo))}>
                  {item.tipo === "neutro" && item.descricao.toLowerCase().includes("%")
                    ? `${item.valor.toFixed(2)}%`
                    : item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                  }
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Base Legal */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          <strong>Base legal:</strong> {resultado.fonteJuridica}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{resultado.baseCalculo}</p>
      </div>
    </div>
  )
}
```

---

## TAREFA 5: \<AdSlot />

Wrapper para unidades AdSense com lazy loading — garante CLS = 0.

```typescript
// packages/ui/src/AdSlot/index.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "../utils/cn"

export type AdFormat = "banner" | "rectangle" | "leaderboard" | "anchor"

const AD_DIMENSIONS: Record<AdFormat, { width: number; height: number; mobile?: { w: number; h: number } }> = {
  banner:      { width: 728, height: 90,  mobile: { w: 320, h: 50  } },
  rectangle:   { width: 336, height: 280, mobile: { w: 300, h: 250 } },
  leaderboard: { width: 728, height: 90  },
  anchor:      { width: 320, height: 50  },
}

export interface AdSlotProps {
  slotId: string         // data-ad-slot do AdSense
  format: AdFormat
  className?: string
  label?: string         // "Anúncio" visível acima
}

export function AdSlot({ slotId, format, className, label = "Publicidade" }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visivel, setVisivel] = useState(false)
  const dims = AD_DIMENSIONS[format]

  // Intersection Observer: só carrega o ad quando entra na viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) setVisivel(true) },
      { rootMargin: "200px" },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  // Pushea o ad após ficar visível
  useEffect(() => {
    if (!visivel) return
    try {
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
      ;(window as any).adsbygoogle.push({})
    } catch (_) {}
  }, [visivel])

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID

  // Em desenvolvimento ou sem publisher ID, mostra placeholder
  if (!publisherId || process.env.NODE_ENV === "development") {
    return (
      <div
        className={cn("flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded", className)}
        style={{ width: dims.mobile?.w ?? dims.width, height: dims.mobile?.h ?? dims.height, maxWidth: "100%" }}
        aria-label="Área de anúncio (desativado em desenvolvimento)"
      >
        <span className="text-xs text-gray-400">Ad {dims.width}×{dims.height}</span>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn("overflow-hidden", className)}
      // Reserva o espaço antes do ad carregar — elimina CLS
      style={{ minHeight: dims.mobile?.h ?? dims.height, maxWidth: "100%" }}
    >
      {label && (
        <p className="text-center text-xs text-gray-400 mb-1" aria-hidden>
          {label}
        </p>
      )}
      {visivel && (
        <ins
          className="adsbygoogle block"
          style={{ display: "block", width: dims.width, height: dims.height, maxWidth: "100%" }}
          data-ad-client={publisherId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  )
}
```

---

## TAREFA 6: \<CalculatorLayout />

Layout padrão de página de calculadora com 3 slots de ad posicionados.

```typescript
// packages/ui/src/CalculatorLayout/index.tsx
import type { ReactNode } from "react"
import { AdSlot } from "../AdSlot"
import { LegalBadge } from "../LegalBadge"
import { UpdatedBadge } from "../UpdatedBadge"

export interface CalculatorLayoutProps {
  titulo: string
  descricao: string
  fonteJuridica: string
  dataAtualizacao: string
  adSlotTop?: string      // ID do slot AdSense acima do formulário
  adSlotMid?: string      // ID do slot AdSense entre resultado e conteúdo
  adSlotBottom?: string   // ID do slot AdSense ao final
  form: ReactNode
  result?: ReactNode      // null antes do primeiro cálculo
  content: ReactNode      // conteúdo editorial MDX
  related?: ReactNode     // calculadoras relacionadas
  breadcrumb?: ReactNode
}

export function CalculatorLayout({
  titulo, descricao, fonteJuridica, dataAtualizacao,
  adSlotTop, adSlotMid, adSlotBottom,
  form, result, content, related, breadcrumb,
}: CalculatorLayoutProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Breadcrumb */}
      {breadcrumb}

      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
          {titulo}
        </h1>
        <p className="mt-2 text-gray-600 text-sm md:text-base">{descricao}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <LegalBadge fonteJuridica={fonteJuridica} />
          <UpdatedBadge dataAtualizacao={dataAtualizacao} />
        </div>
      </header>

      {/* Ad — acima da ferramenta */}
      {adSlotTop && (
        <div className="flex justify-center">
          <AdSlot slotId={adSlotTop} format="banner" />
        </div>
      )}

      {/* Ferramenta interativa */}
      <section
        className="rounded-xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm"
        aria-label="Calculadora"
      >
        {form}
        {result && <div className="mt-6">{result}</div>}
      </section>

      {/* Ad — entre resultado e conteúdo editorial */}
      {adSlotMid && (
        <div className="flex justify-center">
          <AdSlot slotId={adSlotMid} format="rectangle" />
        </div>
      )}

      {/* Conteúdo editorial */}
      <article className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-brand-600">
        {content}
      </article>

      {/* Ad — ao final */}
      {adSlotBottom && (
        <div className="flex justify-center">
          <AdSlot slotId={adSlotBottom} format="rectangle" />
        </div>
      )}

      {/* Calculadoras relacionadas */}
      {related}
    </div>
  )
}
```

---

## TAREFA 7: \<LegalBadge /> e \<UpdatedBadge />

```typescript
// packages/ui/src/LegalBadge/index.tsx
import { cn } from "../utils/cn"

export function LegalBadge({ fonteJuridica, className }: { fonteJuridica: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full",
        "bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-100",
        className,
      )}
      title={`Base legal: ${fonteJuridica}`}
    >
      <span aria-hidden>⚖️</span>
      <span className="hidden sm:inline">Base legal: </span>
      <span className="font-mono">{fonteJuridica.split("|")[0]?.trim()}</span>
    </span>
  )
}

// packages/ui/src/UpdatedBadge/index.tsx
export function UpdatedBadge({ dataAtualizacao, className }: { dataAtualizacao: string; className?: string }) {
  const data = new Date(dataAtualizacao).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  })
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full",
        "bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 border border-green-100",
      )}
      title="Tabelas atualizadas"
    >
      <span aria-hidden>✅</span> Tabelas {data}
    </span>
  )
}
```

---

## TAREFA 8: \<RelatedCalculators />

```typescript
// packages/ui/src/RelatedCalculators/index.tsx
import { cn } from "../utils/cn"

export interface RelatedItem {
  slug: string
  titulo: string
  categoria: string
  descricaoCurta: string
}

export function RelatedCalculators({
  items,
  className,
}: {
  items: RelatedItem[]
  className?: string
}) {
  if (items.length === 0) return null

  return (
    <aside className={cn("space-y-3", className)} aria-label="Calculadoras relacionadas">
      <h2 className="text-lg font-semibold text-gray-900">Calculadoras relacionadas</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list">
        {items.map((item) => (
          <li key={item.slug}>
            <a
              href={`/calculadora/${item.slug}`}
              className={cn(
                "flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-4",
                "hover:border-brand-400 hover:shadow-sm transition-all duration-150",
                "focus:outline-none focus:ring-2 focus:ring-brand-500",
              )}
            >
              <span className="text-xs font-medium text-brand-600 uppercase tracking-wide">
                {item.categoria}
              </span>
              <span className="font-medium text-gray-900">{item.titulo}</span>
              <span className="text-xs text-gray-500 line-clamp-2">{item.descricaoCurta}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
```

---

## TAREFA 9: \<Breadcrumb />

```typescript
// packages/ui/src/Breadcrumb/index.tsx

export interface BreadcrumbItem {
  label: string
  href?: string  // undefined = item atual (sem link)
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Navegação estrutural">
      <ol
        className="flex flex-wrap items-center gap-1 text-sm text-gray-500"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-1"
            itemScope
            itemType="https://schema.org/ListItem"
            itemProp="itemListElement"
          >
            {i > 0 && <span aria-hidden className="text-gray-300">/</span>}
            {item.href ? (
              <a
                href={item.href}
                className="hover:text-brand-600 hover:underline"
                itemProp="item"
              >
                <span itemProp="name">{item.label}</span>
              </a>
            ) : (
              <span
                className="text-gray-700 font-medium"
                aria-current="page"
                itemProp="name"
              >
                {item.label}
              </span>
            )}
            <meta itemProp="position" content={String(i + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

---

## TAREFA 10: Exports do packages/ui

```typescript
// packages/ui/src/index.ts
export { CalculatorForm } from "./CalculatorForm"
export type { CalculatorFormProps, FieldMeta } from "./CalculatorForm"

export { CalculatorResult } from "./CalculatorResult"
export type { CalculatorResultProps } from "./CalculatorResult"

export { CalculatorLayout } from "./CalculatorLayout"
export type { CalculatorLayoutProps } from "./CalculatorLayout"

export { AdSlot } from "./AdSlot"
export type { AdSlotProps, AdFormat } from "./AdSlot"

export { RelatedCalculators } from "./RelatedCalculators"
export type { RelatedItem } from "./RelatedCalculators"

export { LegalBadge } from "./LegalBadge"
export { UpdatedBadge } from "./UpdatedBadge"
export { Breadcrumb } from "./Breadcrumb"
export type { BreadcrumbItem } from "./Breadcrumb"

export { cn } from "./utils/cn"
```

---

## CRITÉRIOS DE ACEITE

```bash
# Typecheck sem erros
pnpm --filter @calculosonline/ui typecheck
pnpm --filter web typecheck

# Lint sem erros
pnpm --filter @calculosonline/ui lint
pnpm --filter web lint
```

**Checklist de revisão visual** (abrir `apps/web` com `pnpm dev`):

**Tarefa 0 — Casca herdada do Recibo Fácil:**
- [ ] Header com logo + nav + CTA "Calcular agora" (visual igual ao RF)
- [ ] Footer com 5 colunas categorizadas + selo "100% Gratuito"
- [ ] Hero com badge, H1, subtítulo, 2 CTAs, indicadores de confiança e `CalculatorStack` (5 cards rotacionados)
- [ ] CalculatorTypes com seção "Mais buscadas" (featured) + grid completo
- [ ] HowItWorks (4 passos), Features (6 cards), Stats, Testimonials, FAQ, FinalCta presentes
- [ ] Mobile menu abre/fecha com `Transition` do Headless UI
- [ ] Inputs aplicam máscara automática (CPF, CNPJ, currency)
- [ ] PageSeo + JsonLd (Website, Organization) injetados no layout

**Tarefa 1-9 — Componentes específicos de calculadora:**
- [ ] `<CalculatorForm>` renderiza campos com label, placeholder e mensagem de erro
- [ ] Validação Zod exibe mensagens em pt-BR abaixo de cada campo inválido
- [ ] `<CalculatorResult>` exibe valor principal em destaque com cor brand
- [ ] Accordion de detalhamento abre/fecha com animação e aria-expanded correto
- [ ] Itens de crédito em verde, débito em vermelho, neutro em cinza
- [ ] `<AdSlot>` em desenvolvimento mostra placeholder cinza do tamanho correto (sem CLS)
- [ ] `<CalculatorLayout>` posiciona ads nos 3 pontos corretos
- [ ] `<LegalBadge>` e `<UpdatedBadge>` aparecem no header da calculadora
- [ ] Breadcrumb inclui microdata Schema.org
- [ ] Tudo responsivo: testar em 375px, 768px, 1280px

**Validação cruzada com Recibo Fácil:**
- [ ] Abrir `recibofacil.com.br` e `localhost:3000` lado a lado em 1280px e 375px — é evidente que são produtos do mesmo grupo
- [ ] Mesma fonte (Inter Variable), mesma família de cores (azul como primária, verde como confiança)
- [ ] Mesmo padrão de cards, sombras e bordas

> **Próximo passo:** Sprint 1.3 — criar as páginas Next.js que compõem os componentes com os dados do core engine.
