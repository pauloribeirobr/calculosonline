# Prompt de IA — Sprint 0.1: Setup do Projeto
**calculosonline.com.br | Fase 0 — Fundação | Dias 1–4**

---

## CONTEXTO DO PROJETO

Estou construindo **calculosonline.com.br**, uma plataforma de calculadoras online para o mercado brasileiro. O diferencial competitivo é precisão legislativa (CLT, tabelas INSS/IRRF atualizadas), performance web superior (Core Web Vitals no verde) e presença multiplataforma (Web PWA, Android TWA, Desktop Tauri, Plugin Google Sheets).

A arquitetura central é um **monorepo** com uma `packages/core` em TypeScript puro contendo todas as funções de cálculo, reutilizada em todas as plataformas sem dependência de UI.

### Identidade visual herdada — Recibo Fácil

A identidade visual e a maior parte dos componentes UI são **herdados do projeto irmão Recibo Fácil** (`/home/paulo/projects/next/recibofacil`), que já está em produção.

Decisões dependentes:
- Stack visual: **Tailwind 3** + Inter Variable + Heroicons + Headless UI (não Tailwind 4 por compatibilidade com a base já existente)
- Estrutura: `apps/web/src/{app,components,core,hooks,lib,utils}` (não usar pasta `app/` direto na raiz do projeto Next.js — o Recibo Fácil usa `src-dir`)
- Detalhamento completo: [`docs/IDENTIDADE_VISUAL.md`](../docs/IDENTIDADE_VISUAL.md)

---

## OBJETIVO DA SPRINT 0.1

Configurar toda a infraestrutura de desenvolvimento e o esqueleto do projeto em **4 dias**, entregando:

1. Monorepo Turborepo funcional com todos os workspaces configurados
2. App Next.js 15 (App Router) pronto para desenvolvimento com SSG/ISR
3. Configuração completa de TypeScript, ESLint, Prettier e Vitest compartilhados
4. Pipeline de CI básico (GitHub Actions) com lint + test + build

---

## STACK TÉCNICA EXATA

```
Gerenciador de pacotes: pnpm (workspaces)
Monorepo:              Turborepo
Linguagem:             TypeScript 5.x (strict mode)
Framework web:         Next.js 16+ (App Router, SSG/ISR) — alinhado ao Recibo Fácil
React:                 19.x
Estilo:                Tailwind CSS 3.x + @tailwindcss/forms + @tailwindcss/typography
Tipografia:            @fontsource-variable/inter
Ícones:                @heroicons/react
UI primitives:         @headlessui/react (Transition, Dialog, Menu)
Analytics:             @vercel/analytics + @next/third-parties (GA4)
Linting:               ESLint 9 (flat config) + @typescript-eslint
Formatação:            Prettier 3
Testes:                Vitest 2 (core) + Playwright (e2e web)
Node.js:               >= 20 LTS
```

**Por que Tailwind 3 (não 4):** o Recibo Fácil usa Tailwind 3 e os componentes serão copiados literalmente. Migração futura a 4 fica como opção quando ambos os projetos puderem migrar juntos.

---

## ESTRUTURA DE PASTAS FINAL ESPERADA

```
calculosonline/
├── .github/
│   └── workflows/
│       └── ci.yml                 ← lint + test + build em todo PR
├── apps/
│   ├── web/                       ← Next.js 15 (site principal)
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── calculadora/
│   │   │       └── [slug]/
│   │   │           └── page.tsx   ← SSG com generateStaticParams
│   │   ├── public/
│   │   │   ├── ads.txt
│   │   │   └── robots.txt
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   ├── android/                   ← placeholder (bubblewrap — fase 2)
│   ├── desktop/                   ← placeholder (tauri — fase 2)
│   └── sheets-plugin/             ← placeholder (apps script — fase 2)
├── packages/
│   ├── core/                      ← biblioteca TypeScript pura (sem deps de UI)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── trabalhista/
│   │   │   ├── impostos/
│   │   │   ├── financeiro/
│   │   │   ├── investimentos/
│   │   │   ├── saude/
│   │   │   ├── negocios/
│   │   │   ├── tabelas/
│   │   │   └── utils/
│   │   ├── vitest.config.ts
│   │   └── package.json
│   ├── ui/                        ← componentes React reutilizáveis
│   │   ├── src/
│   │   └── package.json
│   └── tsconfig/                  ← tsconfig base compartilhado
│       ├── base.json
│       ├── nextjs.json
│       └── package.json
├── content/                       ← conteúdo editorial MDX (calculadoras)
├── .env.example
├── .eslintrc.js (ou eslint.config.mjs)
├── .prettierrc
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## TAREFA 1: Inicializar o Monorepo

### Instruções

Crie o monorepo com Turborepo e pnpm workspaces. Execute os comandos na ordem abaixo e mostre o resultado de cada etapa.

```bash
# Criar diretório e inicializar
# mkdir calculosonline && cd calculosonline
pnpm init

# Instalar Turborepo como dev dependency
pnpm add -D turbo
```

### `pnpm-workspace.yaml` esperado

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### `turbo.json` esperado

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "vitest.config.ts"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    }
  }
}
```

### `package.json` raiz esperado

```json
{
  "name": "calculosonline",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\" --ignore-path .gitignore"
  },
  "devDependencies": {
    "prettier": "^3.0.0",
    "turbo": "latest"
  },
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=20"
  }
}
```

---

## TAREFA 2: Configurar TypeScript Compartilhado (packages/tsconfig)

Crie o pacote `packages/tsconfig` com três arquivos:

### `packages/tsconfig/base.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Default",
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules"]
}
```

### `packages/tsconfig/nextjs.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Next.js",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "jsx": "preserve",
    "plugins": [{ "name": "next" }],
    "incremental": true
  }
}
```

### `packages/tsconfig/package.json`

```json
{
  "name": "@calculosonline/tsconfig",
  "version": "0.0.1",
  "private": true,
  "exports": {
    "./base.json": "./base.json",
    "./nextjs.json": "./nextjs.json"
  }
}
```

---

## TAREFA 3: Configurar ESLint e Prettier (raiz)

### `.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### `eslint.config.mjs` (flat config ESLint 9)

```js
import tseslint from "typescript-eslint"
import nextPlugin from "@next/eslint-plugin-next"

export default tseslint.config(
  tseslint.configs.recommendedTypeChecked,
  {
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    ignores: [".next/", "dist/", "node_modules/", "*.config.mjs"],
  },
)
```

---

## TAREFA 4: Criar packages/core

### Requisitos críticos do packages/core

- **Zero dependências de UI** — não importa React, DOM APIs ou Next.js
- **Funções puras** — mesmo input → mesmo output, sem side effects
- **Tipagem estrita** — interfaces exportadas para inputs e outputs
- **Testável** — 100% de cobertura de testes nas funções de cálculo

### `packages/core/package.json`

```json
{
  "name": "@calculosonline/core",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./trabalhista": "./src/trabalhista/index.ts",
    "./impostos": "./src/impostos/index.ts",
    "./financeiro": "./src/financeiro/index.ts",
    "./tabelas": "./src/tabelas/index.ts"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@calculosonline/tsconfig": "workspace:*",
    "@vitest/coverage-v8": "^2.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

### `packages/core/src/types.ts` — Interfaces base

Crie as interfaces TypeScript que TODAS as calculadoras devem seguir:

```typescript
/**
 * Resultado padrão retornado por toda função de cálculo do core engine.
 * Garante consistência e rastreabilidade em todas as plataformas.
 */
export interface ResultadoCalculo<T = number> {
  /** Valor principal do cálculo */
  resultado: T
  /** Detalhamento linha a linha do cálculo */
  detalhamento: ItemDetalhamento[]
  /** Fórmula ou base de cálculo aplicada */
  baseCalculo: string
  /** Artigo de lei, portaria ou instrução normativa aplicada */
  fonteJuridica: string
  /** Data das tabelas utilizadas (INSS, IRRF, etc.) */
  dataReferencia: string
  /** Avisos ou observações importantes para o usuário */
  avisos?: string[]
}

export interface ItemDetalhamento {
  descricao: string
  valor: number
  tipo: "credito" | "debito" | "neutro"
  formula?: string
}

/** Erros de validação de inputs */
export interface ErroValidacao {
  campo: string
  mensagem: string
}

export interface ResultadoOuErro<T> {
  sucesso: true
  dados: ResultadoCalculo<T>
} | {
  sucesso: false
  erros: ErroValidacao[]
}
```

### `packages/core/src/tabelas/index.ts` — Tabelas Legislativas Versionadas

```typescript
/** Sistema de tabelas com versionamento por data de vigência */

export interface FaixaINSS {
  de: number
  ate: number | null  // null = sem limite (último piso)
  aliquota: number    // ex: 0.075 = 7,5%
}

export interface FaixaIRRF {
  de: number
  ate: number | null
  aliquota: number
  deducao: number
}

export interface TabelasLegislativas {
  vigenciaInicio: string  // ISO date "2026-01-01"
  vigenciaFim: string | null
  salarioMinimo: number
  inss: FaixaINSS[]
  irrf: FaixaIRRF[]
  deducaoDependenteIRRF: number
  limiteIsencaoIRRF: number
}

/** Tabela vigente em 2026 — atualizar via PR automático quando mudar */
export const TABELAS_2026: TabelasLegislativas = {
  vigenciaInicio: "2026-01-01",
  vigenciaFim: null,
  salarioMinimo: 1518.00,
  inss: [
    { de: 0,       ate: 1518.00, aliquota: 0.075 },
    { de: 1518.01, ate: 2793.88, aliquota: 0.09  },
    { de: 2793.89, ate: 4190.83, aliquota: 0.12  },
    { de: 4190.84, ate: 8157.41, aliquota: 0.14  },
  ],
  irrf: [
    { de: 0,        ate: 2428.80,  aliquota: 0,    deducao: 0       },
    { de: 2428.81,  ate: 2826.65,  aliquota: 0.075, deducao: 182.16 },
    { de: 2826.66,  ate: 3751.05,  aliquota: 0.15,  deducao: 394.16 },
    { de: 3751.06,  ate: 4664.68,  aliquota: 0.225, deducao: 675.49 },
    { de: 4664.69,  ate: null,     aliquota: 0.275, deducao: 908.73 },
  ],
  deducaoDependenteIRRF: 189.59,
  limiteIsencaoIRRF: 2428.80,
}

/** Retorna as tabelas vigentes na data informada */
export function getTabelasVigentes(data: Date = new Date()): TabelasLegislativas {
  // Expansão futura: array de tabelas históricas, busca por data
  return TABELAS_2026
}
```

### `packages/core/vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 90,
      },
    },
  },
})
```

---

## TAREFA 5: Criar apps/web com Next.js 15

### Inicialização

```bash
cd apps/web
pnpm create next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

### Dependências adicionais alinhadas ao Recibo Fácil

```bash
cd apps/web
pnpm add @fontsource-variable/inter @headlessui/react @heroicons/react \
         @next/third-parties @tailwindcss/forms @tailwindcss/typography \
         @vercel/analytics clsx tailwind-merge

# Para a Sprint 1.2 (componentes específicos de calculadora)
pnpm add react-hook-form zod @hookform/resolvers
```

> Versões exatas em [`docs/IDENTIDADE_VISUAL.md`](../docs/IDENTIDADE_VISUAL.md#4-dependências-npm-herdadas)

### `apps/web/next.config.ts`

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // SSG + ISR para calculadoras
  // Páginas de calculadoras usam generateStaticParams
  // Tabelas legislativas revalidam a cada 24h via ISR

  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ]
  },
}

export default nextConfig
```

### `apps/web/app/calculadora/[slug]/page.tsx` — Rota SSG

```typescript
import { Metadata } from "next"

// Lista de slugs válidos — será gerada dinamicamente a partir do packages/core
const CALCULADORAS = [
  "rescisao-trabalhista",
  "ferias",
  "decimo-terceiro",
  "hora-extra",
  "fgts",
  "salario-liquido",
] as const

type Slug = (typeof CALCULADORAS)[number]

// SSG: gera todas as páginas em build time
export async function generateStaticParams() {
  return CALCULADORAS.map((slug) => ({ slug }))
}

// ISR: revalida a cada 24h para refletir mudanças nas tabelas
export const revalidate = 86400

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: Slug }>
}): Promise<Metadata> {
  const { slug } = await params
  // TODO: buscar título/descrição do registro da calculadora
  return {
    title: `Calculadora de ${slug} Online e Gratuita | CalculosOnline`,
    description: `Calcule ${slug} online de forma gratuita, precisa e atualizada com a legislação vigente.`,
  }
}

export default async function CalculadoraPage({
  params,
}: {
  params: Promise<{ slug: Slug }>
}) {
  const { slug } = await params

  return (
    <main>
      {/* TODO Sprint 1.2: importar <CalculatorLayout slug={slug} /> */}
      <h1>Calculadora: {slug}</h1>
      <p>Em desenvolvimento — Sprint 1.2</p>
    </main>
  )
}
```

### `apps/web/public/robots.txt`

```
User-agent: *
Allow: /

Disallow: /api/
Disallow: /_next/

Sitemap: https://calculosonline.com.br/sitemap.xml
```

### `apps/web/public/ads.txt`

```
# Será preenchido com o Publisher ID do AdSense após aprovação
# google.com, pub-XXXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

---

## TAREFA 6: Criar packages/ui (esqueleto)

### `packages/ui/package.json`

```json
{
  "name": "@calculosonline/ui",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@calculosonline/tsconfig": "workspace:*",
    "@types/react": "^19.0.0",
    "typescript": "^5.0.0"
  }
}
```

### `packages/ui/src/index.ts` — Exports placeholders

```typescript
// Componentes implementados na Sprint 1.2
export * from "./CalculatorForm"
export * from "./CalculatorResult"
export * from "./CalculatorLayout"
export * from "./AdSlot"
```

---

## TAREFA 7: GitHub Actions CI

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  ci:
    name: Lint + Test + Build
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Test (core engine — 100% coverage obrigatório)
        run: pnpm --filter @calculosonline/core test:coverage

      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_SITE_URL: https://calculosonline.com.br
```

---

## TAREFA 8: .env.example

```bash
# Site
NEXT_PUBLIC_SITE_URL=https://calculosonline.com.br

# Google Analytics 4
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Google AdSense
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXXX

# Vercel (preenchido automaticamente em produção)
VERCEL_URL=

# Feature flags
NEXT_PUBLIC_ENABLE_ADS=false  # true em produção após aprovação AdSense
```

---

## CRITÉRIOS DE ACEITE DA SPRINT 0.1

A sprint está concluída quando TODOS os itens abaixo passam:

```bash
# 1. Instalar dependências sem erros
pnpm install

# 2. Typecheck passa em todos os workspaces
pnpm typecheck

# 3. Lint sem erros
pnpm lint

# 4. Build do Next.js gera estático sem erros
pnpm build

# 5. Testes do core (zero falhas — coverage report gerado)
pnpm --filter @calculosonline/core test:coverage

# 6. Dev server sobe em localhost:3000
pnpm dev
```

**Verificações adicionais:**
- [ ] `apps/web/app/calculadora/rescisao-trabalhista` renderiza sem erro 404
- [ ] `apps/web/public/robots.txt` acessível em localhost:3000/robots.txt
- [ ] `turbo run build` usa cache corretamente (segunda execução: `>>> FULL TURBO`)
- [ ] Lighthouse score em localhost:3000 com Performance > 90 (app vazio)

---

## O QUE NÃO FAZER NESTA SPRINT

- **Não implementar lógica de cálculo** — isso é Sprint 0.2
- **Não criar componentes UI** — isso é Sprint 1.2
- **Não configurar AdSense** — precisa de conteúdo (Sprint 1.6)
- **Não configurar Tauri, TWA ou Apps Script** — são fases futuras
- **Não criar conteúdo editorial** — é Sprint 1.4
- **Não otimizar SEO** — infraestrutura primeiro

---

## ENTREGA ESPERADA

Ao final da Sprint 0.1, deve existir:

1. **Repositório Git** com estrutura de monorepo funcional
2. **`pnpm install` + `pnpm build`** executando sem erros
3. **CI verde** no GitHub Actions para qualquer PR
4. **Next.js rodando** em localhost:3000 com rota `/calculadora/[slug]` funcional (placeholder)
5. **packages/core** com tipos base e tabelas legislativas 2026 prontos para Sprint 0.2
6. **`.env.example`** documentado para onboarding de futuros colaboradores

> **Próximo passo após esta sprint:** Sprint 0.2 — implementar as 5 primeiras funções de cálculo trabalhistas no `packages/core` com 100% de cobertura de testes.
