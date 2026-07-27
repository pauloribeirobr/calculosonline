# Features — Calculos Online

Lista numerada de funcionalidades, por ordem cronológica. Cada item recebe um
identificador estável (`F1`, `F2`, ...) para ser referenciado em conversas,
commits e PRs futuros — "faz parte do F12" em vez de reexplicar o contexto.
Mesmo padrão do projeto irmão [Recibo Fácil](../recibofacil/FEATURES.md).

- **Fonte:** cruzamento de `git log` (commits desde 10/05/2026) com
  [`CHANGELOG.md`](CHANGELOG.md) (versionado desde 19/07/2026, mais granular
  para o período recente), [`AGENTS.md`](AGENTS.md) (sprints do plano de
  implementação) e [`MEMORY.md`](MEMORY.md) (decisões/contexto de growth).
- **Granularidade:** feature/entrega, não commit — vários commits da mesma
  sprint viram um único item quando pertencem à mesma entrega.
- **Datas:** data do commit principal (ou do último commit da entrega),
  formato `AAAA-MM-DD`.
- Este arquivo é **complementar** ao `CHANGELOG.md` (detalhe técnico e
  versionamento SemVer por app) e ao `MEMORY.md` (narrativa e decisões
  completas). Aqui o foco é só "que feature, quando, qual número".

---

## 1. Melhorias desenvolvidas (histórico)

| # | Data | Feature |
|---|------|---------|
| F1 | 2026-05-10 | Setup do monorepo — Turborepo + pnpm workspaces, pacotes `@calculosonline/core` e `@calculosonline/ui` (Sprint 0.1) |
| F2 | 2026-05-10 | Core engine — funções de cálculo TypeScript puras em `packages/core/src/` (`trabalhista`, `impostos`, `financeiro`, `investimentos`, `saude`, `negocios`), cobertura Vitest (Sprint 0.2) |
| F3 | 2026-05-10 | 20 calculadoras (formulários + lógica) — registry canônico `calculatorRegistry` em `apps/web/src/lib/calculators.ts` (Sprint 1.1) |
| F4 | 2026-05-10 | Componentes UI compartilhados — `CalculatorLayout`, `CalculatorForm`, `CalculatorResult`, `Breadcrumb`, `AdSlot`, `LegalBadge`, `RelatedCalculators`, `UpdatedBadge` em `@calculosonline/ui` (Sprint 1.2) |
| F5 | 2026-05-10 | Páginas web — home, `/calculadora/[slug]` (SSG+ISR), `/categorias`/`/categoria/[categoria]`, `/sobre`, `/contato`, políticas; `Header`/`Footer`/`PageSeo`/`JsonLd` globais (Sprint 1.3) |
| F6 | 2026-05-10 | SEO + conteúdo editorial — 20 MDX em `content/calculadoras/[slug].mdx`, `ContentLoader`, MDX no `next.config.ts`, `next-sitemap`, rota IndexNow (Sprint 1.4) |
| F7 | 2026-05-10 | Memória de cálculo + identidade visual — `explainability/`, `MemoriaCalculo`/`PassoCalculo`, tipografia numérica (`tabular-nums`), `CalculatorIcon.tsx`, hero com stack de cards (Sprint 1.4.1) |
| F8 | 2026-05-11 | Deploy 1.0.0 (produção) + ajuste de geração do sitemap |
| F9 | 2026-05-11 | Google Analytics |
| F10 | 2026-07-19 | Correções de SEO (diagnóstico GSC 17/07) — `buildCalculatorTitle()`, `FAQPage` real via `lib/faq.ts` (101 perguntas/20 calculadoras) — **v0.1.0** |
| F11 | 2026-07-19 | Playwright E2E (17 testes) + sitemap/robots nativos (`app/sitemap.ts`/`app/robots.ts`, substitui `next-sitemap`) + fix crítico: campo numérico opcional vazio virava `NaN` e travava submissão em quase todas as 20 calculadoras — **v0.2.0** |
| F12 | 2026-07-20 | Fix do `lastmod` do sitemap (`seoRefreshDate`) + schema `HowTo` + chips de valor rápido (`quickAdd`, 16 formulários/17 calculadoras) — **v0.3.0** |
| F13 | 2026-07-20 | Ajuste de CI |
| F25 | 2026-07-25 | Ativação do Microsoft Clarity em produção (Project ID real) + alinhamento com o padrão do Recibo Fácil (`lazyOnload`, preconnect) — **v0.3.1** |
| F27 | 2026-07-25 | Retargeting de SEO da calculadora de Décimo Terceiro — title/H1/FAQ passam a incluir "décimo terceiro" por extenso (antes só "13º"), mesmo padrão do "recibo-simples" no Recibo Fácil — **v0.3.2** |
| F28 | 2026-07-25 | Valores padrão automáticos nos 19 formulários (derivados do `.default()` do próprio schema Zod, fix centralizado em `CalculatorForm`) + navbar simplificada (removidos links duplicados/redundantes "Categorias"/"Blog"/"Sobre"/"Contato" do menu superior) — **v0.4.0** |
| F29 | 2026-07-26 | Detalhamento do cálculo sempre visível (sem toggle) + sinal (+)/(−) em cada linha do detalhamento, além da cor — **v0.4.1** |
| F30 | 2026-07-26 | Fix: `pnpm dev` caindo sozinho após ~1min30 — `turbo.json` `"ui": "tui"` → `"ui": "stream"` (bug conhecido do Turborepo 2.x com tarefas persistentes) — **v0.4.2** |
| F31 | 2026-07-26 | Valor padrão 0 também em campos obrigatórios (reverte decisão da F28/0.4.0, 24 campos/16 formulários) + mês de admissão do 13º com nome do mês (`<select>` numérico, 1º do projeto) — **v0.4.3** |
| F32 | 2026-07-27 | Compartilhamento de cálculo por link (WhatsApp) nas 20 calculadoras — query param `?d=` em base64, reabre repreenchido e já recalculado, sem exigir clique — **v0.5.0** |
| F16 | 2026-07-27 | `llms.txt` + GEO — `apps/web/public/llms.txt`, mesmo padrão do Recibo Fácil (20 calculadoras por categoria, modelo de negócio, diferenciais, FAQ curta) — **v0.6.0** |
| F33 | 2026-07-27 | Fix crítico no 13º salário: 2ª parcela (e 1ª) calculava meses de direito usando o mês real do calendário do sistema em vez de 12 meses fixos para quem já trabalhava antes do ano corrente — resultado errado e dependente da data do cálculo. Corrigido em `packages/core/src/trabalhista/decimo-terceiro.ts` + suíte de 24 testes — **v0.6.1** |

> F25, F27, F28, F29, F30, F31, F32 e F33 saíram de ordem (implementados direto, fora do backlog planejado em F14-F24) e por isso ganharam número novo em sequência em vez de reutilizar um número já reservado — mesmo critério usado no Recibo Fácil para features implementadas fora da fila. F16 manteve o número original porque já estava reservado nesse backlog (P0, GEO/`llms.txt`), só foi implementado fora da ordem relativa a F15. F26 está reservado no backlog (Fase 2, ainda não implementado).

## 2. Próximas melhorias (backlog)

Numeração segue direto de onde a Parte 1 parou (pulando F25, já usado pelo
Clarity) — **a próxima feature nova implementada é a F14.** Fonte:
[`MEMORY.md`](MEMORY.md) (§Backlog ativo) e `AGENTS.md`/
`docs/PLANO_IMPLEMENTACAO.md` (fases do roadmap). Prioridade dentro de cada
grupo segue a ordem do `MEMORY.md`. **Reordenado em 2026-07-25** para trazer
aquisição de tráfego (backlinks + GEO/llms.txt + Google Ads) antes do
AdSense — e **refinado no mesmo dia** depois de cruzar o export novo do GSC
(25/07) com o GA4: o problema não é "site sem tráfego" (há ~230
usuários/mês reais via Bing/Direct/IA), é especificamente o Google não
mandando tráfego — ver `MEMORY.md` §P0 e diário de 2026-07-25 (parte 4).

### P0 — Aquisição de tráfego no Google (antes do AdSense)

| # | Feature | Contexto |
|---|---------|----------|
| ~~F14~~ | ~~Confirmar diagnóstico de tráfego~~ | ✅ **Respondido 25/07** — GA4 (28d) mostra 230 usuários reais/mês (Bing orgânico 179 sessões, Direct 52, Yahoo referral 28, **AI Assistant/ChatGPT+Copilot 17**, Google orgânico: **0**). GSC (3 meses) confirma: 1.133 impressões BR, só 2 cliques. Não é ausência de tráfego, é ausência de tráfego **do Google** especificamente — ver `MEMORY.md` |
| F15 | Backlinks — plano fechado (25/07, ver `MEMORY.md`) | **1º link:** `salario-liquido` (âncora "calculadora de salário líquido") — melhor posição do site (54.8), único clique real no GSC, ~333k buscas/mês, sem risco de calendário (demanda o ano todo), já pronta (title/H1/FAQ corretos, `featured: true`). **2º link:** `decimo-terceiro` (âncora "décimo terceiro salário", já retargetada em F27) — maior cluster (~860k/mês), comprar até setembro pra manter margem antes do pico sazonal nov/dez. Demais 6 candidatas originais (`poupanca`, `ferias`, `fgts`, `rescisao-trabalhista`, `hora-extra`, `financiamento`) ficam como fila depois desses 2 |
| ~~F16~~ | ~~`llms.txt` + GEO (SEO de IA)~~ | ✅ **Entregue 27/07** — ver Parte 1 |
| F17 | Google Ads — piloto de aquisição paga, mesmos alvos do F15 | Produto já está validado (233 `calculator_calculated` em 28 dias via outros canais) — o piloto não precisa provar que o produto funciona, precisa gerar tráfego/dado **especificamente atribuível ao Google** enquanto backlinks maturam. Orçamento/duração/CPC (Keyword Planner ou Semrush) pendentes de decisão do Paulo |
| F18 | Investigar Rich Results (FAQPage/HowTo sem aparecer no GSC) | `Aspecto da pesquisa.csv` do GSC veio **vazio** nos últimos 3 meses — apesar do `FAQPage` (F10) e `HowTo` (F12) já implementados, o Google não concedeu nenhum rich snippet ainda. Rodar o Rich Results Test do Google em 2-3 páginas (ex. `/calculadora/ferias`) pra descartar erro de elegibilidade antes de assumir que é só falta de confiança de domínio novo |
| F19 | Sprint 1.6 — AdSense | Gate `Fase 1 → Fase 2` do `docs/PLANO_IMPLEMENTACAO.md`. Continua depois de F15-F18 — não faz sentido ativar sem tráfego real do Google |

### Prioridade imediata (produto)

| # | Feature | Contexto |
|---|---------|----------|
| F20 | Sprint 1.5 — PWA + Android (TWA/bubblewrap) | Próxima sprint do plano de implementação (`AGENTS.md`). Paulo deve confirmar se ainda fura a fila à frente de F15-F18 |
| F21 | Centralizar SEO como no Recibo Fácil (parcial) | `HowTo` já entrou no F12. Falta `buildMetadata()` com canonical alternates e o resto de `JsonLd.tsx` (`Article`, `ItemList`, `BreadcrumbList` com `@id`) |
| F22 | Blog sazonal | Maior lacuna do plano de negócios (seção 3.2), nunca implementado. GSC mostra cauda longa (“calculadora férias 2025/2026”, “como calcular hora extra”) |

### Growth / SEO (impacto médio, mais barato)

| # | Feature | Contexto |
|---|---------|----------|
| F23 | Cauda longa via páginas programáticas | `Consultas.csv` do GSC mostra 450+ variações de query para os mesmos ~15 conceitos (ex. 37 variações só de "calculadora férias"), quase todas com posição pior que 60 — cuidar de canonical alternates para não gerar duplicate content |
| F24 | Confirmar hreflang/geo-targeting | Tráfego internacional (Índia, Filipinas, Vietnã, 0 cliques) confirmado de novo no export 25/07 — baixa prioridade, só validar que não é bug |

### Estratégico — Fase 2 (pausada)

| # | Feature | Contexto |
|---|---------|----------|
| F26 | Fase 2 do plano de negócios (+30 calculadoras) | **Pausada** (decisão de 2026-07-19, reafirmada em 25/07 com dado real de tráfego) até o Google mandar tráfego para as 20 atuais — ver `MEMORY.md`. Candidatos já registrados: categoria "Tempo" (7 calculadoras) + expansões de Saúde/Negócios/Financeiras — ver `MEMORY.md` §Candidatos de expansão de catálogo. **Nenhum implementado; validação de volume/KD no Semrush ainda não foi feita.** |
