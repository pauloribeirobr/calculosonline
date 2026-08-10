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
| F21 | 2026-08-05 | Centralização de SEO — `buildMetadata()` central em `lib/seo.ts` (canonical alternates, OpenGraph/Twitter consistentes) adotado nas 7 páginas com `Metadata` manual; `JsonLd.tsx` ganha `HowToJsonLd`/`ItemListJsonLd`/`ArticleJsonLd` (paridade com o Recibo Fácil); `BreadcrumbList` das 20 calculadoras migrado para o `BreadcrumbJsonLd` com `@id`; 6 páginas institucionais que não tinham JSON-LD nenhum ganharam `WebPage`+`BreadcrumbList` — **v0.7.0** |
| F34 | 2026-08-05 | **Piloto de UX em formulário — campo de moeda com centavos, stepper e listas itemizadas** (calculadora de Salário Líquido). 3 tipos de campo novos e reutilizáveis no `CalculatorForm` compartilhado (`type: 'currency'`, `'stepper'`, `'itemList'`) + suporte a itens `{descrição, valor}` no motor de cálculo (`ItemValor`, `packages/core/src/types.ts`). Corrige de quebra um bug real: "outras deduções" (plano de saúde, PGBL) só abatia a base do IRRF, sem reduzir o salário líquido de fato. Testes novos incluem o 1º projeto mobile do Playwright (`mobile-chromium`, toque real via `tap()`). Ver F35 no backlog — replicar o padrão nas outras 19 calculadoras — **v0.8.0** |
| F35 | 2026-08-06 | **Replicado o padrão do F34 nas outras 18 calculadoras.** Campos monetários → `currency`; contagens inteiras pequenas (dependentes, dias, prazo em meses, idade) → `stepper` (que ganhou `max` opcional, simétrico ao `min`, usado em férias vencidas 0-2 e dias de abono ≤10). `itemList` só entrou no IRRF ("outras deduções") — único outro campo com o mesmo formato de "bucket" genérico; IRPF tem categorias de dedução legalmente distintas, não viraram lista. Novo helper `apps/web/src/lib/itemListField.ts` reaproveitado pelo salário líquido (refatoração, sem mudar comportamento). Decisão consciente de **não** mexer em campos decimais (horas extras, taxas, markup) nem em `PorcentagemForm`/`IMCForm`. **v0.9.0** |
| F36 | 2026-08-09 | **3º modo da margem de lucro + correções de SEO on-page saídas do export do GSC de 09/08.** (1) `calcularMargemLucro` ganhou `margemDesejadaPercent` — informar custo + margem desejada e obter o preço de venda (`Preço = Custo ÷ (1 − Margem)`), a intenção de maior volume do cluster (`calcular preço de venda`, 480 buscas/mês no Semrush) que a calculadora simplesmente não atendia; era também a query de maior impressão identificada no GSC (`calcular valor baseado na margem de lucro`, posição 66,6 contra 21,5 da query cujo modo já existia). (2) `descricao` da porcentagem estava truncada ("...percentual de e mais") e ia assim pra SERP — reescrita. (3) Nova flag `atemporal` no registry tira o "2026" do title de cálculos que não dependem de tabela anual (porcentagem, margem de lucro). (4) **H1 duplicado eliminado nas 20 calculadoras** — todo MDX abria com `#`, que virava um segundo `<h1>` competindo com o do shell. **v0.10.0** |

> F25, F27, F28, F29, F30, F31, F32, F33, F34, F35 e F36 saíram de ordem (implementados direto, fora do backlog planejado em F14-F24) e por isso ganharam número novo em sequência em vez de reutilizar um número já reservado — mesmo critério usado no Recibo Fácil para features implementadas fora da fila. F16 manteve o número original porque já estava reservado nesse backlog (P0, GEO/`llms.txt`), só foi implementado fora da ordem relativa a F15. F26 está reservado no backlog (Fase 2, ainda não implementado).

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
| F15 | Backlinks — plano fechado (25/07, ver `MEMORY.md`) | **1º link executado (05/08):** Paulo comprou/arranjou placement em `band.com.br` (Grupo Bandeirantes, TV nacional), matéria editorial de 27/07 sobre isenção de IR linkando dofollow para `salario-liquido` (âncora "cálculo salário líquido") — domínio de autoridade bem acima do que o plano original cogitava (diretórios/guest posts). **2º link:** `decimo-terceiro` (âncora "décimo terceiro salário", já retargetada em F27) — maior cluster (~860k/mês), comprar até setembro pra manter margem antes do pico sazonal nov/dez. Demais 6 candidatas originais (`poupanca`, `ferias`, `fgts`, `rescisao-trabalhista`, `hora-extra`, `financiamento`) ficam como fila depois desse |
| ~~F16~~ | ~~`llms.txt` + GEO (SEO de IA)~~ | ✅ **Entregue 27/07** — ver Parte 1 |
| F17 | Google Ads — piloto de aquisição paga, mesmos alvos do F15 | Produto já está validado (233 `calculator_calculated` em 28 dias via outros canais) — o piloto não precisa provar que o produto funciona, precisa gerar tráfego/dado **especificamente atribuível ao Google** enquanto backlinks maturam. Orçamento/duração/CPC (Keyword Planner ou Semrush) pendentes de decisão do Paulo |
| ~~F18~~ | ~~Investigar Rich Results (FAQPage/HowTo sem aparecer no GSC)~~ | ✅ **Respondido 27/07 — não é bug, é o Google inteiro, e só afeta o dropdown visual, não o conteúdo.** `HowTo` rich result foi **descontinuado (desktop e mobile) desde set/2023** — nunca teria chance de aparecer, mesmo com o F12 implementado corretamente. `FAQPage` rich result já estava restrito a domínios "autoritativos" de governo/saúde desde ago/2023 e foi **retirado por completo de todos os sites em 07/05/2026** (~2,5 meses antes desta checagem, dentro da janela de 3 meses analisada no GSC). **Importante: só o dropdown expansível na SERP morreu — o texto das perguntas/respostas (F10, 101 perguntas/20 calculadoras) continua valendo como conteúdo normal de SEO** (casa a página com buscas no formato de pergunta, cobertura semântica do cluster, fonte de citação pra IA/GEO). O JSON-LD `FAQPage`/`HowTo` em si é inofensivo de manter (Google confirma que não precisa remover), só não gera mais exibição visual — ver `MEMORY.md` |
| F19 | Sprint 1.6 — AdSense | Gate `Fase 1 → Fase 2` do `docs/PLANO_IMPLEMENTACAO.md`. Continua depois de F15-F18 — não faz sentido ativar sem tráfego real do Google |

### Prioridade imediata (produto)

| # | Feature | Contexto |
|---|---------|----------|
| F20 | Sprint 1.5 — PWA + Android (TWA/bubblewrap) | Próxima sprint do plano de implementação (`AGENTS.md`). Paulo deve confirmar se ainda fura a fila à frente de F15-F18 |
| ~~F21~~ | ~~Centralizar SEO como no Recibo Fácil~~ | ✅ **Entregue 2026-08-05** — ver Parte 1 (v0.7.0) |
| F22 | Blog sazonal | Maior lacuna do plano de negócios (seção 3.2), nunca implementado. GSC mostra cauda longa (“calculadora férias 2025/2026”, “como calcular hora extra”) |
| ~~F35~~ | ~~Replicar o padrão de UX do F34 nas outras 19 calculadoras~~ | ✅ **Entregue 2026-08-06** — ver Parte 1 (v0.9.0) |

### Growth / SEO (impacto médio, mais barato)

| # | Feature | Contexto |
|---|---------|----------|
| F23 | Cauda longa via páginas programáticas | `Consultas.csv` do GSC mostra 450+ variações de query para os mesmos ~15 conceitos (ex. 37 variações só de "calculadora férias"), quase todas com posição pior que 60 — cuidar de canonical alternates para não gerar duplicate content |
| F24 | Confirmar hreflang/geo-targeting | Tráfego internacional (Índia, Filipinas, Vietnã, 0 cliques) confirmado de novo no export 25/07 — baixa prioridade, só validar que não é bug |

### Estratégico — Fase 2 (pausada)

| # | Feature | Contexto |
|---|---------|----------|
| F26 | Fase 2 do plano de negócios (+30 calculadoras) | **Pausada** (decisão de 2026-07-19, reafirmada em 25/07 com dado real de tráfego) até o Google mandar tráfego para as 20 atuais — ver `MEMORY.md`. Candidatos já registrados: categoria "Tempo" (7 calculadoras) + expansões de Saúde/Negócios/Financeiras — ver `MEMORY.md` §Candidatos de expansão de catálogo. **Nenhum implementado; validação de volume/KD no Semrush ainda não foi feita.** |
