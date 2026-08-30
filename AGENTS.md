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
- [CHANGELOG.md](CHANGELOG.md) — funcionalidades entregues em produção, versionado por app (mesmo padrão do Recibo Fácil)
- [FEATURES.md](FEATURES.md) — lista numerada de features (`F1`, `F2`, ...), histórico + backlog, mesmo padrão do Recibo Fácil
- [MEMORY.md](MEMORY.md) — diário de decisões/growth (o "porquê" por trás do Changelog/Features), mesmo padrão do Recibo Fácil. **Ao encerrar uma sessão com decisão de growth/negócio ou feature nova, atualizar `FEATURES.md`/`MEMORY.md` em vez de só crescer a seção "Estado atual das sprints" abaixo.**

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
    ├── calculadoras/   — corpo de cada uma das 20 calculadoras
    └── blog/           — posts do blog (F22); registry em `src/lib/blog.ts`
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
- **Quem commita/dá push é o Paulo.** Assistente deixa o working tree pronto
  (código + `FEATURES.md`/`CHANGELOG.md`/`MEMORY.md` atualizados, testes
  passando) e para aí — não roda `git commit`/`git push` por conta própria,
  mesmo quando o pedido foi "implementar"/"vamos fazer". Confirmado
  explicitamente em 2026-08-13.
- **Código:** identificadores e comentários em inglês quando técnicos; comentários de domínio (regras CLT, INSS, IRRF) podem ficar em pt-BR.

---

## Estado atual das sprints (atualizado em 2026-07-19)

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
- ~~next-sitemap configurado em `apps/web/next-sitemap.config.js`~~ — substituído na Sprint 1.4.2
  por `app/sitemap.ts` nativo (ver abaixo).
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

### ✅ Sprint 1.4.2 — Correções de SEO (diagnóstico GSC) + sitemap nativo + Playwright E2E
- **Diagnóstico:** export do Search Console (`gsc/`, 2026-07-17, últimos 3 meses) mostrou
  ~1.120 impressões e apenas 2 cliques — CTR ~0% inclusive em páginas já na 1ª página
  (`margem-lucro` pos. 9.6, `porcentagem` pos. 9.1, `das-mei` pos. 10.3). Causa raiz: title
  genérico e FAQPage com perguntas idênticas em todas as calculadoras.
- **Title por calculadora** — `buildCalculatorTitle()` em `apps/web/src/lib/seo.ts` substitui o
  padrão fixo `"... Online e Gratuita 2026"` por `"... 2026 — Grátis, sem Cadastro"`. Corrige de
  quebra um bug real: `inss`, `irpf` e `das-mei` já tinham "2026" no `tituloLongo`, duplicando o
  ano no title final.
- **FAQPage real** — `apps/web/src/lib/faq.ts` (novo) faz parsing da seção "Perguntas
  frequentes" de cada MDX em `content/calculadoras/[slug].mdx` (101 perguntas nas 20
  calculadoras) e alimenta o schema em `lib/schema.ts`, no lugar das 3 perguntas genéricas
  fixas. Fallback genérico mantido só para calculadora futura sem MDX ainda.
- **Sitemap/robots nativos** — `next-sitemap` removido (dependência, `next-sitemap.config.js`,
  script `postbuild`, `public/sitemap.xml` e `public/robots.txt` estáticos). Substituído por
  `apps/web/src/app/sitemap.ts` e `apps/web/src/app/robots.ts` (`MetadataRoute`), no mesmo
  padrão usado no Recibo Fácil: `lastModified` real por calculadora (`calc.dataAtualizacao` do
  registry, não data de build) e prioridade maior (0.95) para calculadoras `featured`. Também
  corrige um bug do sitemap antigo: incluía `/privacidade` (rota que só redireciona) em vez da
  canônica `/politica-de-privacidade`.
- **Playwright E2E** — `apps/web/playwright.config.ts` + `apps/web/tests/e2e/` (mesmo padrão do
  Recibo Fácil: `testDir: ./tests/e2e`, `webServer` reaproveitando o dev server, projeto único
  `chromium`). Specs: `calculadora-margem-lucro.spec.ts` (fluxo completo do form ao resultado,
  como referência para as demais calculadoras), `seo-metadata.spec.ts` (trava o fix de title e
  FAQPage acima), `sitemap-robots.spec.ts` (trava o sitemap/robots nativos acima),
  `categorias-navegacao.spec.ts`. Scripts `test:e2e`/`test:e2e:ui` em `apps/web/package.json`.

### ✅ Sprint 1.4.3 — Fix lastmod do sitemap + schema HowTo + chips de valor rápido
- **Fix do sitemap:** `dataAtualizacao` (data de revisão das tabelas legislativas, fixa em
  2026-01-01 em todas as 20 calculadoras) estava sendo usada sozinha como `lastmod`, então a
  mudança de title/FAQ da Sprint 1.4.2 não movia o sinal de freshness no sitemap de produção
  (reportado pelo Paulo direto no `calculosonline.com.br/sitemap.xml`). Fix em
  `apps/web/src/app/sitemap.ts`: nova constante `seoRefreshDate`, bumpada manualmente a cada
  mudança de SEO relevante — `lastmod` de cada calculadora usa a mais recente entre as duas
  datas, sem alterar o que é mostrado ao usuário como data de revisão legislativa.
- **Schema `HowTo`** adicionado em `apps/web/src/lib/schema.ts` (3 passos genéricos: preencher,
  calcular, ver detalhamento) — fecha a lacuna do plano de negócios (seção 3.1) que pedia
  `HowTo`/`FAQPage` para rich snippets.
- **Chips de valor rápido** — portado o `CurrencyInputWithQuickAdd` do Recibo Fácil (mesmas
  classes Tailwind: chip cinza "Zerar" + chips azuis "+N") como opção `quickAdd` em `FieldMeta`
  do `CalculatorForm` compartilhado (`packages/ui/src/CalculatorForm/index.tsx`): "Zerar" zera o
  campo, cada chip soma ao valor atual (não substitui, arredondado a 2 casas). Aplicado no campo
  de valor principal de 16 formulários / 17 calculadoras com campo R$ (todas exceto
  IMC/Calorias/Porcentagem), com 3 presets por escala em
  `apps/web/src/lib/quickAddPresets.ts` (`QUICK_ADD_SALARIO`, `QUICK_ADD_INVESTIMENTO`,
  `QUICK_ADD_VALOR_GRANDE`).
- Validação: `pnpm typecheck` + `pnpm lint` + `pnpm build` limpos, 22/22 e2e verdes (17 da
  Sprint 1.4.2 + 5 novos em `quick-add-chips.spec.ts`). Web app versionado 0.3.0. Ver
  [CHANGELOG.md](CHANGELOG.md).

### ⏭️ Sprint 1.5 — PWA + Android (próxima)

---

## Decisões técnicas registradas

- **Sem gate de cobertura 100% no CI** (2026-07-20) — `packages/core/vitest.config.ts` tinha
  `thresholds: { lines/functions/branches/statements: 100 }`, e o CI rodava
  `test:coverage` (falhava a cada branch não coberto, ex.: `explainability/index.ts`).
  Removido (thresholds do vitest.config.ts + step do CI trocado para `test` sem `--coverage`) a
  pedido do Paulo — o Recibo Fácil não usa esse tipo de gate de cobertura, e aqui também não.
  `test:coverage` continua disponível localmente como relatório informativo, só não falha mais.
- **Tailwind 3** (não v4) — compatibilidade com Recibo Fácil.
- **`exactOptionalPropertyTypes: true`** no TypeScript — não passar `undefined` para props
  opcionais; construir objetos condicionalmente antes de chamar funções do core.
- **MDX em `apps/web/content/`** (não na raiz `content/`) — necessário para o import
  dinâmico do webpack funcionar a partir de `apps/web/src/components/ContentLoader.tsx`.
- **Sitemap via `app/sitemap.ts` nativo, não `next-sitemap`** — evita o problema de o config
  CommonJS do next-sitemap não conseguir importar `lib/calculators.ts` (TS) diretamente; o
  sitemap nativo roda no mesmo runtime do app e importa o registry sem fricção.
- **Memória de cálculo como contrato de API** — cada cálculo pode retornar `memoriaCalculo`;
  quando ausente, a UI gera uma versão compatível a partir de `detalhamento` via
  `Explainability.criarMemoriaCalculo`.
- **Ícones do registry são chaves tipadas, não emojis** — `calculatorRegistry[].icone` usa
  `IconeCalculadora`; a renderização visual fica centralizada em `CalculatorIcon.tsx`.
- **Cache local do Next** — erro em dev como `Cannot find module './vendor-chunks/zod@...'`
  normalmente indica `.next` corrompido/misturado entre `next dev` e `next build`; parar o
  servidor antigo e recriar `apps/web/.next` resolve. Em 2026-05-11, o cache quebrado foi movido
  para `/tmp/calculosonline-next-cache-broken-20260511-2301`. **Reincidiu 2x em 2026-07-25/26**
  durante e2e (Playwright, `reuseExistingServer: true`, roda `next dev`): 1ª vez por rodar
  `pnpm build` (produção) antes do `test:e2e` no mesmo `.next`; 2ª vez por matar servidores `next
  dev` concorrentes com `kill -9`/`fuser -k` em vez de deixar encerrar sozinho. Sintoma nos dois
  casos: página renderiza sem CSS nenhum e sem JSON-LD, causando falhas de e2e espalhadas e sem
  relação aparente com o código alterado. **Antes de rodar `test:e2e` depois de um `build` de
  produção, ou depois de matar um `next dev` à força, apagar `apps/web/.next` primeiro.**

---

## Deploy — Vercel

- **Root Directory:** `apps/web`
- **Build Command:** `cd ../.. && pnpm --filter web build`
- **Install Command:** `pnpm install --frozen-lockfile`
- **Variáveis de ambiente necessárias:**
  - `INDEXNOW_KEY` — chave de 32 chars (gerar em bing.com/indexnow/getstarted)
  - `INTERNAL_API_KEY` — senha aleatória para proteger `/api/indexnow`
- Criar `apps/web/public/<INDEXNOW_KEY>.txt` com o conteúdo da chave para verificação.
