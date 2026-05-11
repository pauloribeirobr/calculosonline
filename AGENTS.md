# AGENTS.md — calculosonline.com.br

> Memória do projeto para assistentes de IA (Claude Code, Codex, Cursor, Aider, etc.).
> Mantenha este arquivo atualizado quando decisões arquiteturais ou de escopo mudarem.

## Projeto
Plataforma de calculadoras online para o mercado brasileiro.
Stack: **Next.js + TypeScript** em monorepo **Turborepo**, com aplicativos **Tauri** (desktop), **TWA** (Android) e plugin **Google Apps Script** (Sheets).

## Arquivos-chave (documentação)
- [docs/Plano_Negocios_CalculosOnline.md](docs/Plano_Negocios_CalculosOnline.md) — plano de negócios completo
- [docs/PLANO_IMPLEMENTACAO.md](docs/PLANO_IMPLEMENTACAO.md) — fases, checklists e loops de retroalimentação
- [docs/IDENTIDADE_VISUAL.md](docs/IDENTIDADE_VISUAL.md) — espelho do Recibo Fácil + tokens + estrutura de pastas
- [prompts/](prompts/) — `sprint-*.md`: prompts de IA por sprint (0.1 a 2.4)

## Projeto irmão — Recibo Fácil
- Localização: `/home/paulo/projects/next/recibofacil` (em produção em recibofacil.com.br)
- Stack visual: Next.js 16 + React 19 + Tailwind 3 + Inter Variable + Heroicons + Headless UI
- O calculosonline **reaproveita ~70% do sistema visual** do Recibo Fácil. Componentes a portar:
  `Header`, `Footer`, `Button`, `Input` (com máscaras), `Modal`, `Loading`, `Hero`, `HowItWorks`,
  `Features`, `Stats`, `Testimonials`, `FAQ`, `FinalCta`, `PageSeo`, `JsonLd`, `MicrosoftClarity`, `ErrorLogger`.
- **Não portar** (específicos de geração de PDF/login): `AuthContext`, `ExpirationBanner`,
  `A4Container`, `DocumentForm`, `SignatureField`, `WatermarkToggle`.
- **Decisão:** usar **Tailwind 3** (não 4) por compatibilidade com a base já existente do Recibo Fácil.

## Estrutura de pastas (definida no plano)
```
calculosonline/
├── packages/core/      — funções de cálculo TypeScript puras
├── packages/ui/        — componentes React reutilizáveis
├── apps/web/           — Next.js (site principal)
├── apps/android/       — TWA (bubblewrap)
├── apps/desktop/       — Tauri
├── apps/sheets-plugin/ — Google Apps Script
└── content/            — conteúdo editorial MDX
```

## Fases do roadmap
- **Fase 0** (Sem 1–2): Setup monorepo + core engine + 5 calculadoras trabalhistas
- **Fase 1** (Sem 3–12): 20 calculadoras + SEO + PWA + Android + AdSense
- **Fase 2** (Sem 9–24): +30 calculadoras + Desktop Tauri + Plugin Sheets + afiliados
- **Fase 3** (Sem 25–52): 100+ calculadoras + API pública + liderança de nicho

## Stack técnica
- **Web:** Next.js 14+ App Router, SSG/ISR, Tailwind CSS 3
- **Core Engine:** TypeScript puro, funções exportadas, testado com Vitest
- **Android:** TWA via bubblewrap
- **Desktop:** Tauri (binário ~5–10MB)
- **Plugin Sheets:** Google Apps Script + clasp

## Preferências de colaboração
- **Idioma:** comunicação em **português (pt-BR)**.
- **Commits e PRs:** mensagens em pt-BR; seguir convenção `feat:`, `fix:`, `chore:` etc.
- **Código:** identificadores e comentários em inglês quando técnicos; comentários de domínio (regras CLT, INSS, IRRF) podem ficar em pt-BR.

---

## Estado atual das sprints (atualizado em 2026-05-11)

### ✅ Sprint 0.1 — Setup do monorepo
Turborepo + pnpm workspaces configurados. Pacotes `@calculosonline/core` e `@calculosonline/ui` criados.

### ✅ Sprint 0.2 — Core engine
Funções de cálculo TypeScript puras em `packages/core/src/`. Cobertura de testes com Vitest.
Módulos: `trabalhista/`, `impostos/`, `financeiro/`, `investimentos/`, `saude/`, `negocios/`.

### ✅ Sprint 1.1 — 20 calculadoras (forms + lógica)
Formulários em `apps/web/src/components/calculadoras/forms/`. Registry canônico em
`apps/web/src/lib/calculators.ts` (`calculatorRegistry`).

Calculadoras implementadas:
`rescisao-trabalhista`, `ferias`, `decimo-terceiro`, `hora-extra`, `fgts`, `salario-liquido`,
`inss`, `irrf`, `irpf`, `das-mei`, `juros-compostos`, `porcentagem`, `emprestimo`,
`financiamento`, `cdb`, `poupanca`, `tesouro-direto`, `imc`, `calorias`, `margem-lucro`

### ✅ Sprint 1.2 — Componentes UI
Pacote `@calculosonline/ui` com: `CalculatorLayout`, `CalculatorForm`, `CalculatorResult`,
`Breadcrumb`, `AdSlot`, `LegalBadge`, `RelatedCalculators`, `UpdatedBadge`.

### ✅ Sprint 1.3 — Páginas web
Todas as rotas do site implementadas:
- `/` — home com Hero, Features, Stats, Calculadoras em destaque, FAQ, CTA
- `/calculadora/[slug]` — SSG com ISR, 20 paths gerados
- `/categorias` e `/categoria/[categoria]` — listagem por categoria
- `/sobre`, `/contato`
- `/politica-de-privacidade`, `/termos-de-uso`, `/privacidade` (redirect)

Componentes globais: `Header`, `Footer`, `PageSeo`, `JsonLd`.

### ✅ Sprint 1.4 — SEO + Conteúdo editorial
- **20 arquivos MDX** criados em `apps/web/content/calculadoras/[slug].mdx` com conteúdo
  editorial rico (fórmulas, tabelas legais atualizadas para 2026, FAQ).
- **ContentLoader** (`apps/web/src/components/ContentLoader.tsx`) renderiza MDX dinamicamente
  por slug abaixo do formulário de cada calculadora.
- **MDX configurado** em `next.config.ts` com remark-gfm, rehype-slug, rehype-autolink-headings.
- **`@tailwindcss/typography`** configurado — classe `prose` usada no ContentLoader.
- **next-sitemap** configurado em `apps/web/next-sitemap.config.js`; script `postbuild` no
  `apps/web/package.json`; gera `public/sitemap.xml` com 33 URLs (prioridade 0.9 para calculadoras).
- **IndexNow** — rota `apps/web/src/app/api/indexnow/route.ts` (POST autenticado por `INTERNAL_API_KEY`).

### ✅ Sprint 1.4.1 — Memória de cálculo + identidade visual
- Prompt documentado em `prompts/sprint-1.4.1-memoria-calculo-identidade.md`.
- Tipografia numérica dos resultados corrigida: valores usam Inter com `tabular-nums`; `font-mono`
  fica reservado para fórmulas.
- `ResultadoCalculo` aceita `memoriaCalculo?: MemoriaCalculo`; tipos `PassoCalculo`,
  `MemoriaCalculo` e `TipoPassoCalculo` criados em `packages/core/src/types.ts`.
- Módulo `packages/core/src/explainability/` cria memória de cálculo a partir do detalhamento,
  com IDs estáveis para futura API pública.
- `CalculatorResult` voltou a exibir o detalhamento compacto linha a linha (“Ver detalhamento
  do cálculo”), pois ficou mais claro na prática. O contrato `MemoriaCalculo` permanece no core
  para futura API pública/auditoria, mas não é a UI principal do MVP.
- Formatos de resultado por calculadora adicionados ao registry (`currency`, `number`,
  `percent`, `integer`, `kcal`) para evitar `R$` em IMC, calorias e porcentagem.
- Logo e favicon próprios criados em `apps/web/public/images/`, `apps/web/public/favicon*.svg`
  e PNGs em `apps/web/public/icons/`, seguindo o padrão visual do Recibo Fácil.
- Componente `apps/web/src/components/common/CalculatorIcon.tsx` criado; emojis removidos dos
  cards/listas e substituídos por ícones vetoriais estilizados por calculadora/categoria.
- Hero da home usa stack descentralizado de cards de calculadora com animação contínua em fases
  diferentes e suporte a `prefers-reduced-motion`.
- Validação executada: `pnpm --filter @calculosonline/core test`, `pnpm --filter @calculosonline/core typecheck`,
  `pnpm --filter @calculosonline/ui typecheck`, `pnpm --filter web typecheck` e `pnpm --filter web build`.

### ⏭️ Sprint 1.5 — PWA + Android (próxima)

---

## Decisões técnicas registradas

- **Tailwind 3** (não v4) — compatibilidade com Recibo Fácil.
- **`exactOptionalPropertyTypes: true`** no TypeScript — não passar `undefined` para props
  opcionais; construir objetos condicionalmente antes de chamar funções do core.
- **MDX em `apps/web/content/`** (não na raiz `content/`) — necessário para o import
  dinâmico do webpack funcionar a partir de `apps/web/src/components/ContentLoader.tsx`.
- **next-sitemap sem `require()` de TS** — o config usa `transform` em vez de `additionalPaths`
  com `require('./src/lib/calculators')`, pois CommonJS não resolve TypeScript.
- **Memória de cálculo como contrato de API** — cada cálculo pode retornar `memoriaCalculo`;
  quando ausente, a UI gera uma versão compatível a partir de `detalhamento` via
  `Explainability.criarMemoriaCalculo`.
- **Ícones do registry são chaves tipadas, não emojis** — `calculatorRegistry[].icone` usa
  `IconeCalculadora`; a renderização visual fica centralizada em `CalculatorIcon.tsx`.
- **Cache local do Next** — erro em dev como `Cannot find module './vendor-chunks/zod@...'`
  normalmente indica `.next` corrompido/misturado entre `next dev` e `next build`; parar o
  servidor antigo e recriar `apps/web/.next` resolve. Em 2026-05-11, o cache quebrado foi movido
  para `/tmp/calculosonline-next-cache-broken-20260511-2301`.

---

## Deploy — Vercel

- **Root Directory:** `apps/web`
- **Build Command:** `cd ../.. && pnpm --filter web build`
- **Install Command:** `pnpm install --frozen-lockfile`
- **Variáveis de ambiente necessárias:**
  - `INDEXNOW_KEY` — chave de 32 chars (gerar em bing.com/indexnow/getstarted)
  - `INTERNAL_API_KEY` — senha aleatória para proteger `/api/indexnow`
- Criar `apps/web/public/<INDEXNOW_KEY>.txt` com o conteúdo da chave para verificação.
