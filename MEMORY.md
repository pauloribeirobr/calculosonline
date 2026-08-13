# Memory — Calculos Online

Diário de decisões e contexto de growth (GSC/GA4/Clarity/negócio), no mesmo
espírito do `MEMORY.md` do projeto irmão
[Recibo Fácil](../recibofacil/MEMORY.md). Complementar a:

- [`FEATURES.md`](FEATURES.md) — lista numerada de features (o "quê/quando").
- [`CHANGELOG.md`](CHANGELOG.md) — detalhe técnico versionado (o "como").
- [`AGENTS.md`](AGENTS.md) — stack, convenções, estrutura de pastas e fases
  do roadmap (o "onde/padrão").

Este arquivo é o "porquê" — decisões, diagnósticos e o histórico narrativo
que não cabe em nenhum dos outros três.

---

## Ao voltar (resumo rápido)

- **Export do GSC de 09/08 + Semrush (ver [diário
  2026-08-09](#2026-08-09--export-novo-do-gsc--investigação-de-ctr--semrush)).**
  O Google segue em **2 cliques em 12 meses**, e os 2 são de maio/junho —
  **~70 dias sem clique nenhum**, já contando o pós-Band. Impressões
  estagnadas em ~38/dia desde julho, mas **posição média melhorando há 3
  semanas** (76,9 → 65,3 → 58,2) e o cluster de salário líquido em
  **posição 18-20** — é o efeito esperado do link da Band, e o indicador
  a checar no próximo export. Semrush: **Authority Score 2**, tráfego
  orgânico 0. O `porcentagem` saiu da lista de alvos (SERP com 3 EMDs +
  4Devs + Serasa, cauda numérica que o Google responde sozinho) e o
  **`margem-lucro` entrou** (1.520 buscas/mês, KD 20-26, benchmark
  vencível). **Pendências:** conferir domínios referentes no GSC (Semrush
  diz 122, GSC diz 1), revisar os 7 alvos do P0 com dados de 12 meses, e
  investigar por que o **IRRF** — página nº1 em uso real, 334 views no
  GA4 — está invisível no Google.
- **F36 entregue (09/08):** 3º modo em margem-lucro (custo + margem
  desejada → preço de venda, a intenção de maior volume do cluster que a
  calculadora não atendia), description quebrada da porcentagem
  corrigida, flag `atemporal` tirando "2026" do title de porcentagem e
  margem-lucro, e **H1 duplicado eliminado nas 20 calculadoras** (o MDX
  abria com `#` e brigava com o H1 do shell).
- **Padrão de UX de formulário entregue no salário líquido (05/08, F34) e
  replicado nas outras 18 calculadoras no dia seguinte (06/08, F35 —
  `v0.9.0`).** 3 tipos de campo do `CalculatorForm` compartilhado
  (`packages/ui`): `currency` (moeda com centavos, máscara dígitos-como-
  centavos) em todo campo monetário; `stepper` (botões +/-, ganhou `max`
  opcional no F35) em toda contagem inteira pequena (dependentes, dias,
  prazo em meses, idade); `itemList` (lista livre `descrição + valor`) só
  no IRRF ("outras deduções") — os outros 17 formulários não tinham um
  campo equivalente de "bucket" genérico (IRPF tem categorias de dedução
  legalmente distintas, não viram lista). Decisão consciente de não mexer
  em campos decimais (horas extras, taxas, markup) nem em
  `PorcentagemForm`/`IMCForm`. Ver `FEATURES.md` F34/F35 e `CHANGELOG.md`
  0.8.0/0.9.0 para o detalhe técnico completo.
- **1º link do plano do F15 executado (05/08) — `band.com.br` (Grupo
  Bandeirantes), pago pelo Paulo.** Matéria editorial de 27/07 sobre a
  isenção de IR até R$5 mil ("Isenção do IR até R$ 5 mil confunde quem lê o
  próprio holerite") linka dofollow para
  `calculosonline.com.br/calculadora/salario-liquido`, âncora "cálculo
  salário líquido", contexto genuíno ("Plataformas gratuitas de cálculo
  salário líquido publicam o passo a passo com as tabelas vigentes...").
  Confirmado no HTML bruto (sem `rel="nofollow"`) — exatamente o alvo (a
  página, não necessariamente a âncora exata) e o tipo de placement que o
  plano de 25/07 desenhou para o 1º link, e num domínio de autoridade bem
  acima do que se cogitava (diretórios/guest posts).
- **2º link executado (12/08): `acritica.com` → `decimo-terceiro`**,
  âncora "calcular décimo terceiro", `rel="noreferrer"` (não é
  `nofollow`, conta normal pra SEO) — ver detalhe completo na seção
  "Plano de backlink e página". **Os 2 links do plano original (F15)
  estão fechados.** **Falta:** conferir GSC → Links > Links externos pra
  confirmar os dois domínios como referring domain, e acompanhar se a
  posição de `salario-liquido` (54,8) e `decimo-terceiro` (76,57) melhora
  nos próximos exports.
- **F18 respondido (27/07): rich results (FAQPage/HowTo) não é bug — e só
  afeta o dropdown visual, não o conteúdo.** `HowTo` foi descontinuado
  pelo Google desde set/2023 (nunca teria chance de aparecer); `FAQPage`
  foi **removido de todo o Google Search em 07/05/2026** (~2,5 meses antes
  desta checagem, dentro da janela de 3 meses vazia no GSC). O que morreu
  foi só o dropdown expansível na SERP — **o texto das perguntas/respostas
  em si (F10) continua tendo valor normal de SEO** (casa a página com
  buscas no formato de pergunta, cobertura semântica, fonte de citação pra
  IA/GEO), e o JSON-LD é inofensivo de manter. Nada a corrigir no código.
  Rich snippet visual sai de vez da lista de alavancas de CTR; autoridade
  (backlinks + GEO) continua sendo a aposta certa.
- **`llms.txt` entregue (27/07, F16)** — `apps/web/public/llms.txt`
  criado no padrão do Recibo Fácil. Item 3 do P0 abaixo já fechado; restam
  Backlinks (item 2) e Google Ads (item 4), ambos pendentes de
  decisão/orçamento do Paulo.
- **Bug real corrigido no 13º salário (27/07, F33):** a 2ª parcela (e a 1ª,
  em menor grau) calculava o número de meses de direito usando o mês real
  do calendário do sistema em vez de sempre 12 meses para quem já
  trabalhava antes do ano corrente — resultado errado e dependente da data
  em que se calculava. Corrigido em
  `packages/core/src/trabalhista/decimo-terceiro.ts`; suíte de teste
  completa criada (24 testes, incluindo regressão explícita de
  independência de data). Ver diário [2026-07-27 (parte
  10)](#2026-07-27-parte-10-llmstxt-f16--bug-real-no-13-salário-2ª-parcela-f33).
- **Correção importante (25/07, parte 4):** a hipótese "site com ~0 visitas
  há 3 meses" **não é o que os dados mostram**. Cruzando o export novo do
  GSC (25/07) com um export de GA4 que apareceu em `gsc/` na mesma sessão:
  o site tem **230 usuários ativos reais nos últimos 28 dias** (2.352
  eventos, 333 `calculator_calculated` — gente usando as calculadoras de
  verdade), vindos de **Bing orgânico (179 sessões), Direto (52), Yahoo
  referral (28) e — chamativo — "AI Assistant" via ChatGPT/Copilot (17
  sessões, de graça, sem nenhuma otimização de GEO feita ainda)**. O que é
  realmente ~0 é **especificamente o Google**: GA4 não registra nenhuma
  sessão de "google / organic" no período, e o GSC (3 meses) mostra 1.133
  impressões no Brasil mas só **2 cliques totais**. Ou seja: produto e
  conteúdo já estão validados por uso real em outros canais — o problema é
  autoridade/confiança especificamente no Google, não o site estar "morto".
  Isso muda a leitura de risco (menos "está tudo quebrado", mais "falta
  construir autoridade pro Google confiar") — ver detalhe completo em
  [2026-07-25 (parte 4)](#2026-07-25-parte-4).
- **Decisão de reestruturação (25/07): antes do AdSense, o roadmap prioriza
  aquisição de tráfego no Google — Backlinks + `llms.txt`/GEO + Google
  Ads** — ver seção P0 abaixo, agora com alvos específicos (as calculadoras
  de trabalhista de maior volume/pior posição, não as 4 que já estão perto
  da página 1).
- **GA4 verificado (25/07) e ativo em produção** — `G-DZ6CT8JSZW` correto
  (`NEXT_PUBLIC_GA_ID`), confirmado tanto pelo HTML de produção quanto pelos
  230 usuários reais do export. Não há bug de tracking.
- **Sprint atual:** 1.4.3 entregue (v0.3.0), Clarity ativado em 0.3.1.
  Próxima planejada: **Sprint 1.5 — PWA + Android** (`AGENTS.md`) — Paulo
  deve confirmar se ainda fura a fila à frente da aquisição (P0 abaixo).
- **Fase 2 do plano de negócios (+30 calculadoras) está PAUSADA** desde
  2026-07-19, reafirmada em 25/07 com dado real — até o Google mandar
  tráfego para as 20 atuais. Não iniciar calculadoras novas sem revisitar
  essa decisão.
- **AdSense ainda não está ativo** — é a Sprint 1.6
  (`docs/PLANO_IMPLEMENTACAO.md`), gate formal de `Fase 1 → Fase 2`, e
  continua explicitamente **depois** de Backlinks + `llms.txt` + Google Ads
  no roadmap (P0 abaixo).
- **Nenhum "Aspecto de pesquisa" (rich result) registrado no GSC em 3
  meses**, apesar de `FAQPage` (F10) e `HowTo` (F12) já implementados —
  investigar com o Rich Results Test do Google antes de assumir que é só
  falta de autoridade de domínio (ver F18 no `FEATURES.md`).

---

## Backlog ativo

### P0 — Aquisição de tráfego no Google (antes do AdSense)

Inserido em 2026-07-25 por pedido do Paulo, **refinado no mesmo dia** depois
de cruzar o export novo do GSC com um export de GA4 (ver diário, parte 4).
Racional revisado: o problema não é "site sem tráfego" (230 usuários/mês
reais via Bing/Direct/AI), é o **Google especificamente** não confiar/
rankear as páginas — GSC mostra 1.133 impressões/3 meses no Brasil e só 2
cliques. AdSense sem tráfego do Google não serve pra nada; backlinks e GEO
(`llms.txt`) atacam diretamente autoridade/confiança, que é o gargalo real,
não só on-page (title/FAQ já foram corrigidos em F10/F12 e não resolveram
sozinhos).

**Alvos priorizados (não são as 4 calculadoras já perto da página 1):** as
calculadoras com **mais impressão e pior posição** no GSC — ou seja, o
Google já entende que são relevantes para a busca (aparecem), só não confia
autoridade suficiente pra rankear bem. **Atualizado em 13/08** com o export
de 12 meses (09/08), substituindo a tabela de 3 meses (25/07) que não existe
mais:

| Calculadora | Impressões (12m, até 09/08) | Posição média | Status |
|---|---|---|---|
| `hora-extra` | 213 | 84.5 | pendente |
| `fgts` | 205 | 90.1 | pendente |
| `ferias` | 202 | 87.5 | pendente |
| `poupanca` | 195 | 65.5 | pendente — melhor posição do grupo |
| `financiamento` | 161 | 84.8 | pendente |
| `rescisao-trabalhista` | 136 | 90.7 | pendente |
| `decimo-terceiro` | 87 | 76.6 | ✅ link executado 12/08 (`acritica.com`) |

Mudança de composição frente à tabela antiga: `hora-extra` (109→213) e
`financiamento` (68→161) dobraram de impressão; `poupanca` (191→195) e
`rescisao` (134→136) praticamente estagnaram. **`porcentagem` saiu da
lista de alvos** (SERP dominada por 3 EMDs + 4Devs AS 54 + Serasa; cauda
numérica que o Google já responde sozinho, sem chance real de ranquear —
ver F36). Para contraste, calculadoras já perto da página 1 (não precisam
de campanha de autoridade, só CTR/backlink leve): `margem-lucro` pos.
11.1, `porcentagem` pos. 9.4, `das-mei` pos. 12.3, `calorias` pos. 10.6.

**Fora dessa tabela, dois casos à parte:**
- **`salario-liquido`** não entrou aqui (só tinha 31 impressões em 25/07,
  critério era impressão) mas foi o **1º link executado** (05/08,
  `band.com.br`) — melhor posição de todas as páginas do site (56.9) e
  única com clique real, decisão registrada em "Plano de backlink e
  página" abaixo.
- **`irrf`** também fora da tabela pelo mesmo motivo (só 26 impressões),
  mas é a página nº1 em uso real (334 views no GA4) e investigada à parte
  em 11/08: SERP saturada com 10+ concorrentes dedicados, mesmo
  diagnóstico de autoridade — candidata a entrar na fila se o Paulo topar,
  falta rodar Keyword Gap no Semrush pra número exato (ver diário
  2026-08-11 e 2026-08-09).

1. ~~Confirmar o diagnóstico de tráfego~~ — ✅ resolvido nesta sessão (ver
   "Ao voltar" e diário parte 4).
2. **Backlinks — plano de link building**, focado nas 7 calculadoras acima:
   - Diretórios BR de ferramentas/utilidades online e listas "melhores
     calculadoras grátis" — baixo esforço, primeiro passo natural.
   - Parcerias/guest posts em blogs de finanças pessoais, contabilidade e RH
     linkando especificamente para férias/FGTS/rescisão/hora-extra/décimo
     terceiro (o cluster trabalhista é 10 das 20 calculadoras e o de maior
     volume de busca real, segundo o próprio GSC).
   - **Cross-link editorial com o Recibo Fácil** (mesmo autor, público
     adjacente): link contextual pontual em posts do blog do Recibo Fácil,
     não footer-wide (evitar parecer PBN aos olhos do Google).
   - Menções orgânicas em fóruns/comunidades BR quando genuinamente
     relevantes, nunca spam.
   - **Falta:** priorizar por esforço/impacto e decidir quem executa.
3. ~~`llms.txt` + GEO~~ — ✅ **entregue 27/07** (F16, ver `FEATURES.md`).
   `apps/web/public/llms.txt` criado no mesmo formato do Recibo Fácil
   (`frontend/public/llms.txt`): as 20 calculadoras agrupadas por categoria,
   modelo de negócio, diferenciais (cálculo 100% client-side, memória de
   cálculo, compartilhamento por link) e FAQ curta. Nenhuma métrica nova
   ainda pra confirmar impacto no canal "AI Assistant" — acompanhar próximo
   export do GA4.
4. **Google Ads — piloto de aquisição paga**, mesmos alvos do item 2:
   - Objetivo: gerar tráfego/dado **atribuível ao Google especificamente**
     (o produto já está validado via outros canais — 333
     `calculator_calculated` em 28 dias), não "provar que o site funciona".
   - Focar nas 7 calculadoras trabalhistas acima (maior volume real de
     busca, ainda sem posição boa) em vez dos 4 termos já quase na página 1.
   - **Falta decidir com o Paulo:** orçamento mensal, duração (referência:
     4-6 semanas), e validar CPC real via Keyword Planner/Semrush antes de
     criar as campanhas.
5. ~~Investigar Rich Results~~ — ✅ **respondido 27/07 (F18), não é bug —
   e só afeta o dropdown visual, não o conteúdo.**
   `HowTo` foi descontinuado (desktop+mobile) desde set/2023; `FAQPage` já
   era restrito a domínios gov/saúde desde ago/2023 e foi **removido de
   todo o Google Search em 07/05/2026** — ~2,5 meses antes desta checagem,
   dentro da própria janela de 3 meses vazia no GSC. Não há erro de
   elegibilidade pra corrigir: o schema continua válido, só não gera mais
   exibição visual em lugar nenhum. **O que não morreu:** o texto das
   perguntas/respostas do F10 (101 perguntas/20 calculadoras) continua
   valendo como conteúdo normal de SEO — casa a página com buscas no
   formato de pergunta, cobertura semântica do cluster, fonte de citação
   pra IA/GEO (o mesmo raciocínio do Recibo Fácil ao investir em FAQ). É só
   a "cereja do bolo" (dropdown na SERP) que sumiu. Ver diário 27/07
   (parte 11) e `FEATURES.md` (F18). **Consequência pro roadmap:** rich
   snippet visual nunca vai ser alavanca de CTR aqui — a aposta de
   autoridade continua sendo backlinks (item 2) e GEO (item 3, já
   entregue), não schema markup.
6. **Sprint 1.6 — AdSense** — continua depois dos itens acima. Só ativar
   quando houver tráfego real e atribuível ao Google.

### P1 — próximas 2-3 semanas
- **Centralizar SEO como no Recibo Fácil (parcial).** `HowTo` já portado
  (F12, 2026-07-20). Falta: `buildMetadata()` com canonical alternates (evita
  canibalização — relevante quando existirem páginas quase-duplicadas, ver
  cauda longa em P2) e o resto de `JsonLd.tsx` do Recibo Fácil (`Article`,
  `ItemList`, `BreadcrumbList` com `@id` — hoje o `BreadcrumbList` do
  calculosonline não usa `@id`).
- **Blog sazonal** — maior lacuna do plano de negócios (seção 3.2), nunca
  implementado. GSC mostra cauda longa que um blog capturaria (variações de
  "calculadora férias 2025/2026", "como calcular hora extra" etc.). Recibo
  Fácil tem padrão pronto: `(marketing)/blog/*` + páginas segmentadas por
  público. Decisão de escopo (quantos posts, quais temas primeiro) pendente.

### P2 — impacto médio, mais barato
- ~~`llms.txt` (SEO de IA/GEO)~~ — **promovido para P0** em 25/07 (canal AI
  Assistant já validado com tráfego real, ver acima).
- **Cauda longa via páginas programáticas** — `Consultas.csv` do GSC mostra
  450+ variações de query para os mesmos ~15 conceitos (ex. 37 variações só
  de "calculadora férias", quase todas com posição pior que 60). Recibo
  Fácil resolve algo parecido com o pipeline de "modelos estáticos" via
  Playwright (`frontend/scripts/check-modelos.mjs`); adaptar a ideia para
  variações de título/H1 por calculadora, cuidando de canonical alternates.
- **Tráfego internacional irrelevante** (Índia, Filipinas, Vietnã etc., 0
  cliques) — baixa prioridade, só confirmar que não há problema de
  hreflang/geo-targeting no Search Console.

### P3 — decisão estratégica de roadmap
- **Fase 2 pausada** (+30 calculadoras, prevista mês 3-6 no plano de
  negócios) até resolver CTR/conteúdo das 20 atuais — cada calculadora nova
  hoje herda o mesmo gargalo de conversão em vez de ajudar a resolvê-lo. Ver
  candidatos já levantados na seção abaixo.
- ~~Criar `docs/GROWTH.md`~~ — resolvido criando este próprio `MEMORY.md` na
  raiz, no padrão do Recibo Fácil, em vez de um doc à parte em `docs/`.

---

## Candidatos de expansão de catálogo (Fase 2 — não priorizados)

Registrado a pedido do Paulo em 2026-07-25 (ver [diário](#2026-07-25)).
**Nenhuma dessas calculadoras foi implementada.** Padrão de componente a
reutilizar é o mesmo das 20 atuais em todos os casos: registro em
`calculatorRegistry` (`apps/web/src/lib/calculators.ts`), formulário +
`CalculatorForm`/`CalculatorResult` (`@calculosonline/ui`), MDX editorial em
`content/calculadoras/[slug].mdx` (fórmula + FAQ + base legal quando
aplicável), `RelatedCalculators` no rodapé — **sem arquitetura nova**.

**Bloqueios antes de priorizar a ordem final:**
1. Fase 2 pausada (P3 acima) — revisitar só depois do CTR melhorar.
2. ~~Validação de volume de busca e KD no Semrush~~ — ✅ **feita em 13/08**
   (Bulk Keyword Analysis, database Brasil, 22 termos). Números nas tabelas
   abaixo. 5 termos não calcularam no Semrush (pediam refresh individual):
   `dias-ate-fim-de-semana`, `custo-funcionario-clt`, `meta-economia-diaria`,
   `divisor-conta-gorjeta`, `aposentadoria-simples` — **tratados como
   volume 0 por decisão do Paulo (13/08)**, sem rodar o refresh. Se algum
   desses virar candidato sério no futuro, vale reconferir antes de
   descartar de vez (pode ser só cauda mais longa que o Semrush não
   estimou, não necessariamente demanda zero de verdade).
3. Confirmado nesta sessão: `calorias.mdx` já cobre TMB/TDEE/macros — as
   novas calculadoras de Saúde abaixo não duplicam esse conteúdo.

**Destaques do Semrush (13/08):** `idade-gestacional` tem de longe o maior
volume do Grupo 3 inteiro (8.100/mês) mas KD 50 (laranja, mais disputado) e
CPC 0,66 — concorrência de clínicas/apps de gravidez. `markup-precificacao`
é o melhor custo-benefício (KD 18, verde, o mais fácil do grupo com volume
real — mesmo patamar do `margem-lucro` já validado como vencível — e faz
par natural com a calculadora de Negócios existente). `prazo-processual`
tem o CPC mais alto de todos (R$1,73, público jurídico/B2B) com volume
pequeno (1.000). O resto do Grupo 3 é cauda pequena (10-170/mês), maioria
sem KD calculável — nicho demais pra priorizar sozinho, mas barato de
implementar se entrar como pacote de categoria.

### Categoria nova: Tempo (`/categoria/tempo`)

| Ordem | Calculadora | Slug proposto | Volume | KD | CPC (BRL) |
|---|---|---|---|---|---|
| 1 | Diferença entre datas | `diferenca-entre-datas` | 110 | 30 | 0,00 |
| 2 | Calculadora de idade (anos/meses/dias/horas) — maior potencial de tráfego orgânico/viral | `idade` | 40 | n/a | 0,00 |
| 3 | Dia da semana de uma data | `dia-da-semana` | 170 | 30 | 0,00 |
| 4 | Conversor de fuso horário | `fuso-horario` | 140 | 25 (fácil) | 0,00 |
| 5 | Dias até o fim de semana | `dias-ate-fim-de-semana` | 0 (assumido, sem refresh) | n/a | 0,00 |
| 6 | Semana do ano (ISO) | `semana-do-ano` | 20 | n/a | 0,00 |
| 7 | Prazo processual/dias úteis | `prazo-processual` | 1.000 | 47 | 1,73 |

Item 7 reaproveita a mesma base legal (`LegalBadge`) já usada nas
calculadoras de Trabalhistas.

### Categoria Saúde (hoje: IMC, Calorias)

| Calculadora | Slug proposto | Volume | KD | CPC (BRL) |
|---|---|---|---|---|
| Água recomendada por peso | `agua-diaria` | 480 | 30 | 0,00 |
| Ritmo de corrida (pace) | `ritmo-corrida` | 110 | 22 (fácil) | 0,91 |
| 1RM (musculação) | `1rm` | 170 | 12 (mais fácil do grupo todo) | 0,05 |
| Dias férteis | `dias-ferteis` | 20 | n/a | 0,46 |
| Idade gestacional | `idade-gestacional` | **8.100 (maior do Grupo 3)** | 50 | 0,66 |
| Frequência cardíaca máxima | `frequencia-cardiaca-maxima` | 0 | n/a | 0,00 |
| Percentual de gordura corporal | `percentual-gordura-corporal` | 70 | n/a | 0,61 |

### Categoria Negócios (hoje: Margem de Lucro)

| Calculadora | Slug proposto | Volume | KD | CPC (BRL) |
|---|---|---|---|---|
| Ponto de equilíbrio | `ponto-equilibrio` | 10 | n/a | 0,00 |
| Markup e precificação | `markup-precificacao` | 320 | **18 (melhor custo-benefício do grupo)** | 0,76 |
| Custo por funcionário (CLT) | `custo-funcionario-clt` | 0 (assumido, sem refresh) | n/a | 0,00 |

### Categoria Financeiras (dia a dia — hoje: 4 já existentes)

| Calculadora | Slug proposto | Volume | KD | CPC (BRL) |
|---|---|---|---|---|
| Quanto economizar por dia para uma meta | `meta-economia-diaria` | 0 (assumido, sem refresh) | n/a | 0,00 |
| Calculadora de troco (notas/moedas) | `troco` | 70 | n/a | 0,00 |
| Divisor de conta/gorjeta entre amigos | `divisor-conta-gorjeta` | 0 (assumido, sem refresh) | n/a | 0,00 |
| Quanto vale seu tempo por hora (baseado em salário) | `valor-hora-trabalho` | 20 | n/a | 0,00 |
| Simulador de aposentadoria simples | `aposentadoria-simples` | 0 (assumido, sem refresh) | n/a | 0,00 |

---

## Palavras-chave pendentes de validação no Semrush

Consolidado em 2026-07-25 (antes estava espalhado em menções soltas de
"validação de volume/KD pendente" em várias entradas). Paulo tem acesso ao
Semrush e vai rodar volume de busca BR + KD para essas; assim que tiver os
números, reordenar as prioridades abaixo de acordo.

**Grupo 1 — decisão de backlink (mais urgente):** calculadora de décimo
terceiro salário · calculadora 13º salário · calculadora de décimo terceiro
· calculadora de férias · calculadora de férias clt · calcular férias
online. Recomendação atual: décimo terceiro como alvo primário (posição
atual melhor no GSC, 75.9, e timing sazonal — pico de busca nov/dez,
backlink comprado em julho tem ~4 meses para maturar antes do pico); férias
como alternativa/complemento (mais demanda total, evergreen, mas mais longe
da página 1, 87.3). Concorrência checada via busca (25/07): sites
independentes de porte parecido (meutudo.com.br, calcule.net, genyo.com.br,
mobills.com.br, calcularferias.com.br, investnews.com.br, infinitepay.io)
— não é bancão nem gov.br, disputa vencível.

**Dados reais (25/07, Keyword Surfer do Paulo — volume BR, algumas com
CPC):**

| Termo | Volume/mês | CPC |
|---|---|---|
| decimo terceiro salario | **550.000** | — |
| calculadora salario liquido (+ variantes: calcular/calculo, líquido/liquido) | **246.000** | — |
| calculadora de ferias (+ variantes: calculadora/calcule/calculo, ferias/férias) | **201.000** | — |
| calcular decimo terceiro | 135.000 | US$0,06 |
| calculadora decimo terceiro / calcular décimo terceiro / cálculo décimo terceiro / décimo terceiro cálculo | 135.000 | — |
| calcular ferias | ≥135.000 (corte na captura) | — |
| calcular 13 salario | 40.500 | US$0,05 |

**Leitura:** décimo terceiro é de longe o maior cluster (550k no termo-
cabeça sozinho) — mantém a recomendação de alvo primário, reforçada pelo
timing sazonal (nov/dez) já registrado acima. **Achado novo importante:**
`salario-liquido` **não estava nos 7 alvos originais** (esses foram
escolhidos só por impressão no GSC, e essa página tinha só 31) — mas é a
**única página com clique real no GSC** e a **melhor posição de todas
(54,8, bem menos distância até a página 1 que as outras)**, e agora sabemos
que a demanda é de 246k/mês. Isso a torna uma concorrente séria ao décimo
terceiro para o link primário — potencialmente mais rápida de mover (menos
distância + já converte um pouco) mesmo tendo menos volume total. CPC
baixíssimo (US$0,05-0,06) nos termos com dado confirma perfil informacional
ideal pra AdSense.

**Grupo 1 e 2 fechados (13/08, Semrush oficial — Bulk Keyword Analysis,
database Brasil).** Paulo rodou os 8 termos pendentes de uma vez:

| Termo | Volume | KD | CPC (BRL) |
|---|---|---|---|
| calculadora de férias | 18.100 | 35 | 0,05 |
| calcular férias online | 1.300 | 32 | 0,05 |
| calculadora de férias clt | 90 | 28 | 0,05 |
| simulador de financiamento | 74.000 | 56 (difícil) | 2,49 |
| calculadora de rescisão trabalhista | 12.100 | 21 (fácil) | 0,10 |
| calculadora de hora extra | 6.600 | 27 (fácil) | 0,10 |
| calculadora de fgts | 2.900 | 30 | 0,10 |
| calculadora de poupança | 1.300 | 36 | 0,41 |

> **Atenção — divergência grande de metodologia.** Os números de 25/07
> vieram do Keyword Surfer (extensão de navegador, estimativa própria);
> estes de 13/08 vêm do Semrush oficial. `calculadora de férias` no
> Keyword Surfer: **201.000**; no Semrush oficial: **18.100** — 11x menor.
> Isso levanta dúvida sobre os números de décimo terceiro/salário líquido
> registrados acima (550k/246k), que também são do Keyword Surfer e nunca
> foram reconferidos no Semrush oficial — mas como os 2 links desses
> clusters já foram executados (F15), não é ação corretiva, só um
> lembrete: **usar sempre o Semrush oficial daqui pra frente**, o Keyword
> Surfer superestima.

**Leitura pra prioridade do Grupo 2 (cruzando com posição no GSC de
12 meses, ver tabela do P0 acima):** `rescisao-trabalhista` tem o menor KD
do grupo (21, "fácil" — mesmo patamar que fez `margem-lucro` virar alvo
válido) com volume relevante (12.100) e já 136 impressões/pos. 90,7 no
GSC — Google já considera relevante, só falta autoridade. `financiamento`
tem o maior volume (74.000) mas KD quase 3x mais alto (56) e CPC 25-50x
mais caro que o resto do grupo — sinal de intenção mais comercial/
concorrida (bancos disputando), pior custo-benefício apesar do volume.
`ferias` seria a 2ª melhor opção por volume (18.100) com KD médio (35),
evergreen. Sem decisão tomada — Paulo optou por não decidir a 3ª
calculadora-alvo ainda (13/08).

**Grupo 3 — candidatos de expansão de catálogo** (Fase 2 pausada, ver
§Candidatos de expansão de catálogo acima — validação já pendente desde a
reestruturação de 25/07, prioridade mais baixa que grupos 1-2):
- Tempo: calculadora de diferença entre datas · calcular idade exata · que
  dia da semana foi · conversor de fuso horário · quantos dias faltam para
  o fim de semana · que semana do ano é hoje · calculadora de prazo
  processual (dias úteis)
- Saúde: quanto de água devo beber por dia · calculadora de ritmo de
  corrida (pace) · calculadora de 1RM · calculadora de dias férteis ·
  calculadora de idade gestacional · calculadora de frequência cardíaca
  máxima · calculadora de percentual de gordura corporal
- Negócios: calculadora de ponto de equilíbrio · calculadora de markup ·
  calculadora de custo por funcionário CLT
- Financeiras: calculadora quanto economizar por dia · calculadora de
  troco · divisor de conta entre amigos · quanto vale minha hora de
  trabalho · simulador de aposentadoria simples

## Diário

### 2026-08-13 — F37: histórico local de cálculos (IndexedDB)

Paulo perguntou se fazia sentido salvar cálculos em IndexedDB pra acesso
posterior, inspirado no módulo `history`/`LocalStorageRepository` do Recibo
Fácil (que persiste documentos gerados, com página de histórico própria).
Avaliação: faz sentido e é **mais barato de implementar aqui** do que foi
lá — o Recibo Fácil precisou de `Blob` de PDF + migração de/para
`localStorage` porque o gargalo era quota; aqui cada registro é só JSON
pequeno (sem Blob). Achado-chave que baixou o custo de implementação: o
**F32 (compartilhamento por link) já resolve a serialização** — o
`inputData` salvo é o mesmo payload de `encodeShareData`/`buildShareUrl`,
então reabrir um cálculo salvo é só navegar pra `/calculadora/[slug]?d=...`,
zero lógica nova de reidratação de formulário.

**Decisão de escopo do Paulo:** ao contrário da minha sugestão inicial
(começar só por salário líquido/13º/férias, calculadoras com uso
recorrente), ele pediu **todas as 20 calculadoras de saída, sem seleção
prévia — o usuário decide** por cálculo se quer salvar. Implementado assim.

**Entregue (ver `FEATURES.md` F37 e `CHANGELOG.md` 0.11.0):**
`apps/web/src/lib/calculationHistory.ts` (repositório IndexedDB),
`CalculatorResult` (`packages/ui`) ganhou botão "Salvar cálculo", nova
página `/meus-calculos` (listar/abrir/remover), link novo no Header
(`ClockIcon`, único acréscimo à navegação desde a simplificação da F28 —
justificado por ser funcionalidade nova). Evento de analytics
`calculator_saved`. e2e novo (`calculation-history.spec.ts`, 4 testes).
Validação: typecheck limpo em `ui`/`web`, build limpo (40 páginas), 345/345
testes do core, 42/42 e2e (suíte completa).

**Não fiz:** não adicionei limite de itens/retenção automática (o Recibo
Fácil também não tinha isso na v1) — se o uso real mostrar histórico
crescendo demais, é o próximo ajuste natural, não antecipado agora.

**Ajuste de UX + bug real, achados no teste manual do Paulo (mesma
sessão):** ele testou localmente e reportou que abrir um cálculo salvo
mantinha "Salvar cálculo" ativo, sem indicar que aquele resultado já
estava salvo, e sem opção de excluir ali mesmo. Fix: `CalculatorResult`
ganhou `salvo`/`onExcluirCalculo` — resultado já salvo mostra "Cálculo
salvo" + "Excluir" em vez do botão de salvar; editar e recalcular volta ao
normal. Rastreado via `calc=<id>` na URL do "Abrir". **Bug pego pelo
próprio teste e2e que escrevi pra validar isso:** a 1ª tentativa lia o id
de uma `ref` dentro de um callback inline (`onCalcId={(id) => { ref.current
= id }}`) passado pro `SharedDataReader` — como a função inline muda de
referência a cada render, o `useEffect` (que tem essa prop na dependency
array) reexecutava a cada re-render do componente pai e "ressuscitava" o
id ainda presente na URL, mesmo depois de já consumido no primeiro
resultado. Sintoma: editar e recalcular um cálculo salvo continuava
marcado como salvo. Corrigido trocando a `ref` por `state`
(`setPendingCalcId`, setter estável) — mesmo padrão que `onData`/
`setSharedData` já usava sem esse problema, e é exatamente por isso que só
o `calc` teve o bug, não o `d`. Lição: **callback inline como prop de
efeito é um jeito fácil de reintroduzir esse tipo de bug** — preferir
sempre passar o setter direto quando possível.

**Polimento visual dos botões (mesma sessão, print do Paulo):** as 3
opções nasceram como "pills" coloridas do mesmo peso (verde/azul/vermelho
lado a lado, parecendo 3 botões igualmente clicáveis). Redesenhado por
hierarquia: "Compartilhar via WhatsApp" continua botão pleno (ação
principal); "Cálculo salvo" virou texto simples + check verde (não é
ação, não devia parecer botão); "Excluir" virou botão "fantasma" (só
ganha fundo no hover) — ação secundária/destrutiva, menos peso visual.

**Registrado em `AGENTS.md` (Preferências de colaboração):** confirmado
explicitamente pelo Paulo que **commit/push é sempre ele quem faz** —
qualquer sessão futura (Claude Code ou outro assistente) deixa o working
tree pronto (código + docs + testes verdes) e para aí, sem rodar `git
commit`/`git push` por conta própria mesmo quando o pedido foi
"implementar"/"vamos fazer".

### 2026-08-11 — Investigação do IRRF invisível no Google (não é bug)

Enquanto o Paulo negocia o 2º backlink (decimo-terceiro, F15), adiantei a
pendência registrada em 09/08: por que `irrf` é a página nº1 em uso real
(334 views GA4) mas quase invisível no Google (26 impressões, pos. 80,7).

**Auditoria técnica on-page — tudo limpo, não é bug:**
- Title/meta description/H1 corretos e sem duplicação.
- `<link rel="canonical">` self-referencing correto.
- Sem `noindex` (nenhum meta robots presente = index,follow padrão).
- `robots.txt` permite `/` geral, sem bloqueio a `/calculadora/`.
- Presente no `sitemap.xml` com `lastmod` igual a todas as outras páginas
  (2026-07-19 — não é o motivo, todas as calculadoras têm a mesma data).
- 3 links internos apontando pra ela via `relacionadas` (salario-liquido,
  inss, irpf) — cobertura de link interno normal, não isolada.
- Conteúdo do MDX com 819 palavras — comparável a margem-lucro (943) e
  porcentagem (860), não é conteúdo raso.

**A causa real, confirmada por WebSearch ao vivo:** a SERP de
"calculadora IRRF" / "tabela IRRF 2026" é muito mais disputada do que os
outros clusters do site — pelo menos **10 concorrentes dedicados**
aparecem nas primeiras posições (meutudo.com.br, acalculadoras.com.br,
investnews.com.br, calculabrasilonline.com.br, idinheiro.com.br,
ecalculos.com.br, pontoicarus.com.br, calculadora.app, calcularclt.com.br,
contcontec.com.br, transp.net, além do dieese.org.br institucional) —
`calculosonline.com.br` **não aparece em nenhuma das duas buscas**, batendo
com a posição 80,7 do GSC. Vários são domínios de correspondência quase-
exata (`calcularclt`, `calculabrasilonline`, `ecalculos`) — sinal de
relevância forte pro Google, igual ao padrão já visto em `porcentagem`
(F36/09-08). Com Authority Score 2 (Semrush), o site simplesmente não
compete nesse volume de concorrência dedicada.

**Conclusão — mesmo diagnóstico do resto do P0, não um caso à parte.**
Não é falta de on-page (já está tudo certo) nem bug de indexação — é
autoridade de domínio numa SERP mais concorrida que a média do site. Não
muda a priorização: continua sendo os backlinks (P0) que resolvem isso,
não uma correção pontual no IRRF. **Ainda pendente, se o Paulo quiser
número exato:** rodar Keyword Gap no Semrush pra ter volume/KD real do
cluster IRRF antes de decidir se vira 3º candidato a backlink (hoje é só
evidência qualitativa de SERP, não validado como os outros clusters).

**Também confirmado nesta sessão (sem mudança, só reforço):** o CSV
`Latest links` da pasta `gsc/` de 09/08 mostra `band.com.br` (03/08) como
único link externo reconhecido pelo GSC — mesmo achado já registrado no
diário de 09/08 (item 2), a discrepância com os 122 domínios do Semrush
segue precisando da checagem completa em GSC → Links > Domínios
referentes (não resolvida ainda, só re-confirmada).

### 2026-08-09 — Export novo do GSC + investigação de CTR + Semrush

Paulo pediu pra avaliar a pasta `gsc/` (export de 09/08: GSC 12 meses,
GA4 01/01→09/08, 3 CSVs do Clarity) e depois pra investigar a fundo o
"CTR 0 em posição de página 1" de `margem-lucro` e `porcentagem`.

**Aviso de método:** o export anterior (`...2026-07-25/`) foi
sobrescrito — a pasta está no `.gitignore` (linha 47) e não guarda
histórico. Os números de 25/07 abaixo vêm deste `MEMORY.md`, não de
arquivo. **Guardar exports datados daqui pra frente**, senão cada
comparação futura depende do que sobrou escrito aqui.

**1. O quadro do Google não melhorou — piorou de leve.**
1.810 impressões e **2 cliques em 12 meses**. Dados reais só de 10/05 a
07/08 (89 dias — é toda a vida indexada do site). Os "2 cliques" são os
mesmos de sempre: aconteceram em **maio e junho**. Estão **~70 dias sem
um único clique do Google**, incluindo todo o pós-F21/F34/F35 e o
pós-backlink da Band.

| Mês | Impressões | Cliques | Posição média |
|---|---|---|---|
| mai (a partir do dia 10) | 44 | 1 | 9,7 |
| jun | 528 | 1 | 33,2 |
| jul | 1.065 | 0 | 75,5 |
| ago (7 dias) | 173 | 0 | 61,4 |

Impressões **estagnaram em ~38/dia desde a W27** (início de julho) e não
crescem mais. A queda aparente na última semana (17/dia) é lag de
reporte do GSC nos últimos 2-3 dias, **não** colapso. O lado bom: a
posição média melhora de forma consistente há 3 semanas (W30 76,9 → W31
65,3 → W32 58,2), e o cluster de salário líquido aparece em **posição
18-20** contra 56,9 de média da página — janela exata do link da Band
(rastreado 03/08). **É o indicador a acompanhar no próximo export.**

**2. Backlinks — GSC e Semrush discordam, e isso importa.**
O `Latest links` do GSC tem **uma linha só** (band.com.br, 03/08) —
respondendo o pendente que estava em "Ao voltar". Mas o Semrush (09/08)
diz **220 backlinks / 122 domínios referentes** para
`calculosonline.com.br`, com **Authority Score 2**. As duas coisas
podem ser verdade ao mesmo tempo se os 122 domínios forem lixo
(scrapers/agregadores) que o Google não conta — e AS 2 com 122 domínios
é exatamente o perfil disso. **Falta confirmar em GSC → Links > Domínios
referentes** (relatório completo, não o export "Latest links") antes de
concluir. Não repetir "o site tem 1 backlink" como fato até essa
checagem.

**3. A tese do "CTR 0" que eu levantei estava errada.**
Achei que 318 impressões em posição 9-11 com 0 clique fosse anomalia de
CTR a corrigir com title/description. Fazendo a conta, não é: a posição
9-11 é rodapé da página 1 / topo da página 2, CTR esperado 0,8-1,5%, ou
seja **~3,5 cliques esperados no total**. P(0 cliques) = 15% em
`porcentagem` e 21% em `margem-lucro`. Não havia CTR a recuperar.

**4. O achado real: essas duas páginas quase não têm query
identificada.** Das 1.810 impressões, 512 (28%) são de queries
anonimizadas pelo GSC. E elas se concentram brutalmente:

- `porcentagem`: 124 impressões e **zero** queries com "porcentagem" no
  `Consultas.csv`. Todas anonimizadas.
- `margem-lucro`: 194 impressões, só 4 queries identificadas somando 11.

Ou seja, ~307 das 512 impressões anonimizadas do site (60%) são dessas
duas páginas. A leitura: elas rankeiam em ~9-11 para uma cauda infinita
de queries numéricas únicas ("quanto é 15% de 300"), que é justamente o
tipo de query que **o Google responde sozinho no topo com a calculadora
dele**. Se o CTR real for 0,2-0,3%, P(0 cliques em 318 impressões) sobe
pra 38-53% — normal. Confirmação pelo outro lado: para o head term
`calculadora de porcentagem` a página **não aparece nenhuma vez em 12
meses**. Não é "ranqueia mal", é "não ranqueia".

**5. Semrush fechou o diagnóstico de autoridade.**

| Domínio | AS | Tráfego org. | KW org. | Backlinks | Dom. ref. |
|---|---|---|---|---|---|
| 4devs.com.br | 54 | 688,9K | 36,1K | 9,5K | 2,5K |
| cora.com.br | 45 | 174,1K | 41,4K | 101,9K | 3,6K |
| **balancinho.com.br** | **12** | **3,5K** | 1,5K | 471 | **113** |
| calculosonline.com.br | **2** | **0** | 220 | 220 | 122 |

O `balancinho.com.br` é o **benchmark realista, não a Cora nem a
4Devs**: com AS 12 e 113 domínios referentes ele tira 3,5K de tráfego
orgânico. O calculosonline tem **número parecido de domínios (122) e AS
2 com tráfego 0** — o que reforça a hipótese do item 2 (os 122 não
valem nada) e mostra que **a barreira de entrada dessa SERP é bem mais
baixa do que o topo sugere**.

**6. Volume validado do cluster margem de lucro (Semrush BR):**

| Keyword | Volume/mês | KD | CPC (BRL) |
|---|---|---|---|
| calculadora de margem de lucro | 720 | 25 | 1,02 |
| calcular preço de venda | 480 | 20 | 1,47 |
| calcular markup | 320 | 26 | 0,46 |

~1.520 buscas/mês com KD 20-26 (fácil/possível). E a query de maior
impressão identificada do cluster no GSC — `calcular valor baseado na
margem de lucro`, posição 66,6 — pedia exatamente o modo que a
calculadora **não tinha**. A query cujo modo existia rankeava 21,5.
Gap de produto, não de SEO.

**Entregue nesta sessão (ver `FEATURES.md` F36 e `CHANGELOG.md`):**
3º modo em margem-lucro (custo + margem desejada → preço), description
quebrada da porcentagem corrigida, flag `atemporal` tirando o ano do
title das duas, H1 duplicado eliminado nos 20 MDX.

**Decisões tomadas, a executar depois:**

- **`porcentagem` deixa de ser alvo de SEO.** SERP com 3 domínios de
  correspondência exata dedicados (`calculo-porcentagem.com.br`,
  `porcentagemcalculadora.com`, `calculadora-porcentagem.com`) + 4Devs
  (AS 54) + Serasa, e o tráfego que existe é cauda numérica que o
  Google responde sozinho. Teto baixo, custo alto. A página fica no
  catálogo pelo valor de produto e link interno, não como aposta de
  aquisição.
- **P0 continua nos alvos trabalhistas.** A investigação reforça: o
  gargalo lá é autoridade (AS 2), não on-page. Nada no export de 09/08
  muda a priorização de backlinks — só a reforça.
- **Rever a lista de 7 alvos do P0 com os números de 12 meses.**
  `hora-extra` (109→213 impressões) e `financiamento` (68→161) dobraram;
  `poupanca` (191→195) e `rescisao` (134→136) pararam. Os alvos foram
  escolhidos com dados de 3 meses que não existem mais.
- **`margem-lucro` virou alvo legítimo** (não era): 1.520 buscas/mês,
  KD 20-26, benchmark vencível (balancinho AS 12) e o produto agora
  atende as 3 intenções. Falta backlink e acompanhar posição.
- **IRRF precisa de investigação própria.** É a página nº1 em uso real
  (334 views no GA4, disparado à frente) e está invisível no Google (26
  impressões, posição 80,7) — e **não está entre os 7 alvos do P0**,
  porque os alvos saíram de impressão do GSC, que só enxerga o Google.
  Pedir Keyword Gap no Semrush.
- **Guardar exports do GSC datados** em vez de sobrescrever.

**GA4 (01/01→09/08) reconfirma o diagnóstico de 25/07:** 538 usuários,
**503 desktop / 36 mobile**, Edge 323 vs Chrome 174, Windows 466. Para
calculadora trabalhista no Brasil isso é o inverso do normal — o
"Organic Search 391" do GA4 é **Bing**, não Google. Canal AI Assistant:
35 usuários (vivo, mas o `llms.txt` de 27/07 é recente demais pra
avaliar). Nenhum lead qualificado em nenhuma semana — não há evento de
conversão configurado.

**Clarity desta pasta é descartável:** os 3 CSVs são de 07-09/08, ou
seja, logo depois do deploy do F35 (06/08), com 7 pageviews em férias, 7
em IRRF e 4 na home — e 104 cliques em 7 pageviews de férias (15 por
visita, 49 deles nos botões +/− do stepper). Isso é padrão de QA, quase
certamente o próprio Paulo testando o F35. **Não tirar conclusão de UX
daqui.** Se quiser sinal real sobre o stepper, esperar 3-4 semanas de
tráfego orgânico — e vale lembrar que o `StepperField` já aceita
digitação direta (`packages/ui/src/CalculatorForm/index.tsx`), então o
risco de "usuário preso clicando +" é menor do que o CSV sugere.

### 2026-07-27 (parte 11) — F18 respondido: rich results não é bug, é política do Google

Paulo pediu pra investigar por que `FAQPage`/`HowTo` nunca geraram rich
snippet no GSC (3 meses vazios em "Aspecto da pesquisa"), mesmo com F10/F12
implementados corretamente. Pesquisa (WebSearch, cruzando várias fontes
independentes incluindo Search Engine Journal e a atualização da
documentação oficial do Google Search Central) confirma que **não é
problema de elegibilidade nem bug de implementação**:

- **`HowTo` rich result:** descontinuado por completo (desktop **e**
  mobile) desde **setembro de 2023** — quase 3 anos antes do F12
  (20/07/2026). Nunca teve chance nenhuma de aparecer, com marcação
  perfeita ou não.
- **`FAQPage` rich result:** já vinha restrito desde agosto/2023 a
  domínios "autoritativos" de governo e saúde (calculosonline nunca se
  qualificaria) e foi **retirado por completo de todo o Google Search em
  07/05/2026** — inclusive dos sites gov/saúde que ainda tinham. Isso foi
  há só ~2,5 meses desta checagem, ou seja, **dentro da própria janela de
  3 meses** que o GSC mostrava vazia — a causa raiz do "não aparece nada"
  é exatamente essa retirada, não falta de confiança de domínio novo.
  Google também vai tirar o suporte a FAQ do Rich Results Test e do
  relatório do Search Console em junho/2026, e da API em agosto/2026.

Ambos os schemas continuam válidos e não precisam ser removidos (o próprio
Google documenta que markup não usado não prejudica em nada), só deixaram
de ter qualquer efeito visual de rich snippet — não vale a pena investir
mais esforço de engenharia neles com esse objetivo. Nenhuma mudança de
código feita (não havia nada a corrigir); só atualizada a leitura do
backlog (`FEATURES.md` F18, `MEMORY.md` §P0 item 5).

**Correção/esclarecimento (mesmo dia):** Paulo notou que o Recibo Fácil
também investiu em FAQ "por causa de SEO" e questionou se esse achado
jogava fora aquele trabalho. Resposta: não — são duas coisas distintas.
O que morreu em 07/05/2026 foi só o **dropdown expansível na SERP**
(gerado pelo JSON-LD `FAQPage`). O **texto das perguntas/respostas em si**
(conteúdo visível na página, F10 aqui e o equivalente no Recibo Fácil)
continua tendo valor de SEO normal, independente do schema: casa a página
com buscas no formato de pergunta ("como calcular X"), aumenta a
cobertura semântica do cluster de palavras-chave, e serve de fonte de
citação pra assistentes de IA (que leem o texto da página, não dependem
do JSON-LD pra isso) — o mesmo racional de GEO do `llms.txt` (F16).
Atualizado `FEATURES.md` (F18) e os itens acima pra deixar essa distinção
explícita, já que a resposta original dava a entender (incorretamente)
que o investimento inteiro em FAQ tinha perdido o sentido.

### 2026-07-27 (parte 10) — `llms.txt` (F16) + bug real no 13º salário (2ª parcela, F33)

**F16 — `llms.txt`.** Paulo pediu pra seguir o P0 do backlog; escolhida a
opção mais barata e sem dependência de decisão externa (compra de link,
orçamento de Ads). `apps/web/public/llms.txt` criado a partir do
`frontend/public/llms.txt` do Recibo Fácil (mesma estrutura: intro, seções
por categoria/produto, modelo de negócio, diferenciais, FAQ curta) — as 20
calculadoras listadas por categoria (trabalhista, impostos, financeiras,
investimentos, saúde, negócios), com destaque para o que já é real e
verificado no código: cálculo 100% client-side (nenhum form chama API,
todos são `'use client'` puro), detalhamento sempre visível, e o
compartilhamento por link do F32. Sem métrica de validação própria (é um
arquivo estático); acompanhar se o canal "AI Assistant" do GA4 (~17
sessões/mês antes desta mudança) se move nos próximos exports.

**F33 — bug real no 13º salário, achado pelo Paulo ("os cálculos das
parcelas estão com problema especialmente a segunda").** Causa: em
`calcularMesesDireito` (`packages/core/src/trabalhista/decimo-terceiro.ts`),
para quem já trabalhava antes do ano corrente (`mesAdmissao: null` — opção
padrão do formulário), o número de meses de direito das parcelas
`'primeira'` e `'segunda'` usava `Math.min(12, mesReferencia)`, e
`mesReferencia` **nunca é enviado pelo `DecimoTerceiroForm`** (não existe
esse campo na UI) — caía sempre no default `new Date().getMonth() + 1`,
ou seja, **o mês real do calendário no momento em que a pessoa calcula**.
Rodar a calculadora em julho (mês 7) fazia a 2ª parcela considerar só
7/12 do 13º em vez de 12/12 — resultado errado e, pior, **dependente da
data em que se calcula** (só ficaria certo, por acidente, calculando em
dezembro). A parcela `'total'` não tinha esse problema (12 meses
hardcoded), o que tornava o sintoma mais visível: 1ª + 2ª parcela nunca
batiam com o total. **Fix:** `calcularMesesDireito` agora retorna sempre
12 meses quando `mesAdmissao` é `null`, para qualquer tipo de parcela —
removida a dependência do mês real do sistema (`mesReferencia` continua
aceito/validado na API do core, só não influencia mais o número de meses
de direito). Quem foi admitido no ano corrente (`mesAdmissao` != null)
nunca teve esse bug — a lógica de meses ali nunca dependeu de
`mesReferencia`. Escrita suíte de teste completa
(`decimo-terceiro.test.ts`, 24 testes): cobre validação, `mesAdmissao`
null com todas as parcelas e várias faixas salariais (1.518 a 12.000,
cruzando as faixas de isenção/alíquota de INSS e IRRF), consistência
1ª+2ª=total, efeito de dependentes no IRRF, admissão no ano corrente
(dias trabalhados ≥15/<15, mês 1 a 12, inclusive borda em dezembro com
direito a 0 meses), e **teste de regressão explícito** que roda o mesmo
cálculo simulando o sistema em janeiro/junho/julho/novembro/dezembro
(`vi.setSystemTime`) e confirma que o resultado não muda mais com a data.
Validação: `pnpm --filter @calculosonline/core test` (332/332), `pnpm
typecheck` + `pnpm lint` + `pnpm build` limpos.

### 2026-07-26 (parte 9) — `pnpm dev` caindo sozinho (falso alarme de "navbar quebrada")

Paulo reportou navbar e depois FAQ "não funcionando" (prints do dropdown de
categorias e do accordion de FAQ na home). Testei os dois via Playwright
num servidor recém-subido e **ambos funcionaram normalmente** — dropdown
abre com os 6 itens certos, FAQ expande a resposta. Antes de descartar como
"não reproduz", Paulo mandou o print decisivo: o terminal dele mostrando
`pnpm dev` (via `turbo run dev`) **encerrando sozinho** depois de ~1min35,
voltando pro prompt do shell.

**Causa real:** `turbo.json` tinha `"ui": "tui"` — o modo de terminal
interativo do Turborepo 2.x, com bug conhecido de encerrar tarefas
`persistent: true` (como `dev`) sem aviso em certos terminais. Quando o
servidor morre no meio da sessão, qualquer interação para de responder —
exatamente o sintoma que parecia "navbar/FAQ quebrados", mas era o site
inteiro órfão de servidor. Como hoje só `web` tem script `dev` (nem `core`
nem `ui` têm), o TUI não coordena nada em paralelo aqui — era overhead
puro. **Fix (F30, v0.4.2):** `"ui": "stream"` (log sequencial clássico,
sem essa instabilidade). Validado: processo `pnpm dev` ficou vivo 100s+
(antes morria ~90s); navbar e FAQ retestados no servidor saudável, ambos
OK — confirma que o código deles nunca teve o bug.

**Erro de processo encontrado e corrigido nesta entrada:** um edit meu
anterior (registro do F29) tinha apagado sem querer a linha de cabeçalho
da tabela do `CHANGELOG.md` (`old_string`/`new_string` da edição não
preservou o cabeçalho) — passou despercebido até eu conferir a estrutura
do arquivo agora. Restaurado. **Lição:** ao inserir uma linha nova no topo
de uma tabela markdown via edição, sempre incluir o cabeçalho inteiro no
`new_string`, não só a âncora da linha anterior — conferir a saída depois
de edições em sequência rápida no mesmo arquivo.

### 2026-07-26 (parte 8) — Detalhamento sempre aberto + sinal (+)/(−)

Continuação da parte 7: Paulo mandou um print do resultado de
`salario-liquido` achando que tinha visto "3000" preenchido no Salário
Bruto com um erro "Required" ao mesmo tempo — parecia bug de sincronismo.
Comecei a reproduzir com Playwright (`type` char a char) antes de concluir
qualquer coisa, mas o próprio Paulo confirmou que "3000" era só o
placeholder (texto cinza) — sem bug, só uma leitura errada do print.
**Anotado como sugestão de UX pendente:** placeholder com número plausível
(ex. "3000") pode ser confundido com valor real preenchido — considerar
estilo mais claramente "exemplo" (ex. prefixo "Ex:") numa próxima rodada de
UX, não feito nesta sessão.

**Implementado (F29, v0.4.1):** (1) `CalculatorResult` — removido o toggle
"Ver detalhamento do cálculo" (useState + botão); a lista de detalhamento
agora renderiza sempre aberta, sem clique necessário, virando um header
estático "Detalhamento do cálculo". (2) Cada linha ganhou prefixo "+ "
(crédito) ou "− " (débito) além da cor já existente — `sinalNatureza()`
usa o mesmo campo `tipo` do `ItemDetalhamento` que já alimentava
`corNatureza()`. Linha final/neutra (ex. "Salário Líquido") continua sem
sinal. Ajustado 1 e2e que clicava no botão removido.

**`.next` corrompeu de novo, causa diferente desta vez:** 1ª rodada pós-fix
veio com falhas espalhadas de novo (mesmo padrão de 25/07 — sem CSS, sem
JSON-LD). Desta vez não foi `build`+`dev` misturado — foi eu matando
servidores `next dev` concorrentes (das minhas próprias verificações
ad-hoc com Playwright) via `kill -9`/`fuser -k` em vez de deixar encerrar
sozinho, deixando o `.next` num estado inconsistente de novo. Resolvido do
mesmo jeito (apagar `.next`), reforçado no `AGENTS.md` com a causa nova.
22/22 e2e verdes na rodada limpa.

### 2026-07-25/26 (parte 7) — UX de preenchimento + limpeza de navbar

Paulo notou que o preenchimento das 20 calculadoras não é amigável — nenhum
campo tem valor padrão visível (nem 0) — e pediu pra comparar com
calculadoras/sistemas de boa UX e sugerir mudanças.

**Fix implementado (F28, v0.4.0):** auditoria achou que os 19 formulários já
declaravam `.default(0)`/`.default('nao')`/etc. nos schemas Zod, mas nenhum
form passava `defaultValues` pro `CalculatorForm` — o default só valia no
cálculo pós-envio, nunca aparecia visualmente. Corrigido de forma
centralizada: `CalculatorForm` (`packages/ui/src/CalculatorForm/index.tsx`)
ganhou `extractSchemaDefaults()`, que lê os `.default()` do próprio schema
via introspecção e pré-popula o form — uma única mudança beneficia as 19
calculadoras, sem duplicar valor em cada uma (fonte única de verdade = o
schema). Campos obrigatórios (sem `.default()`, ex. Salário Bruto) ficam
em branco de propósito, só com placeholder — pré-preencher um valor falso
num campo que representa a situação real do usuário (salário, valor de
empréstimo) seria arriscado numa calculadora trabalhista/legal, ao contrário
de calculadoras "de brincar com número" tipo hipoteca do NerdWallet.
Verificado com Playwright ad-hoc (sem `chromium-cli` no ambiente, script
`.mjs` direto contra `playwright-core` do pnpm store) + screenshot real:
campos opcionais renderizam pré-preenchidos, campo obrigatório continua
vazio. Navbar também simplificada no mesmo commit (pedido à parte, mesma
sessão): removidos "Categorias" (duplicava o botão em destaque já
existente), "Blog", "Sobre", "Contato" do menu superior (`Navigation.tsx`)
— os 3 últimos continuam no rodapé, mesma decisão já tomada no Recibo Fácil.

**Susto de CI que não era bug:** 1ª rodada de e2e pós-mudança veio com 18/22
falhas espalhadas (categoria, JSON-LD, margem-lucro, chips) — screenshot
mostrou página renderizando **sem CSS nenhum**. Causa: rodei `pnpm build`
(produção) antes do `pnpm test:e2e` (que sobe `next dev`) — reincidência
exata do gotcha já documentado em `AGENTS.md` ("Cache local do Next"):
misturar `build`/`dev` no mesmo `.next` corrompe o cache. Resolvido
apagando `apps/web/.next` antes de rodar e2e de novo — 22/22 verdes.
**Reforça a lição:** sempre limpar/isolar `.next` antes de rodar e2e depois
de um `build` de produção na mesma sessão.

**Sugestões de UX ainda não implementadas** (comparação com Omni
Calculator, NerdWallet, TurboTax — registradas pra decisão futura, não
executadas ainda):
- **Cálculo ao vivo** (sem clicar em "Calcular"): resultado atualiza
  enquanto o usuário digita (debounced), como Omni Calculator/NerdWallet.
  Mudança estrutural maior — afeta a semântica do evento
  `calculator_calculated` (hoje disparado só no submit) e precisa de
  debounce cuidadoso pra não gerar evento a cada tecla.
- **Progressive disclosure** nos formulários mais longos (Calorias tem 16
  campos, IRPF 8, Rescisão 13): esconder campos opcionais/avançados atrás
  de um "Mais opções ▾", reduzindo a sensação de formulário grande — padrão
  comum em calculadoras fiscais (TurboTax) e no próprio Omni Calculator.
- Ambas ficam como candidatas de UX pra retomar quando o foco não estiver
  em aquisição de tráfego (P0 continua prioridade).

### 2026-07-25 (parte 5) — Plano de backlink + retargeting de SEO

Paulo perguntou se dá pra replicar aqui o que funcionou no Recibo Fácil:
página + FAQ + snippets 100% focados em SEO antes de comprar o backlink de
autoridade (lá foi `/recibo-simples`, retargetado para "Recibo de Pagamento
Simples" antes do link com âncora "recibo online").

**Auditoria da página-alvo (`/calculadora/decimo-terceiro`) encontrou o
mesmo tipo de descasamento** que motivou o retargeting do Recibo Fácil:
title, H1, corpo inteiro e FAQ usavam só "13º salário" — nenhuma menção a
"décimo terceiro" por extenso em lugar nenhum da página. Mas os dados do
Keyword Surfer (parte 4) mostram que o termo de **maior volume do cluster
inteiro é "decimo terceiro salario" (550.000/mês)**, com "calculadora/
calcular decimo terceiro" (135.000/mês cada) logo atrás — a página não
tinha praticamente nenhum sinal textual pra Google casar com a busca de
maior volume. **Corrigido nesta sessão** (F27, v0.3.2): `tituloLongo` do
registry retargetado para "Calculadora de Décimo Terceiro Salário (13º)",
H1/abertura do MDX reescritos pra introduzir "décimo terceiro salário" na
primeira frase, 2 perguntas novas na FAQ ("é a mesma coisa que 13º?", "como
calcular o proporcional?") — entram no `FAQPage` automaticamente via
`lib/faq.ts`. `titulo` curto (cards/nav) mantido "13º Salário" de propósito,
pra não confundir quem já usa o produto.

**Diferença estrutural vs. Recibo Fácil, registrada pra não se perder:** lá
o backlink apontou pra **raiz do domínio** porque "recibo online" É o que a
home representa. Aqui não existe um "modelo estático pra baixar" (PNG/PDF/
Word) equivalente — calculosonline é calculadora com resultado na tela, não
gerador de documento — então a tática de "capturar intenção de modelo
pronto pra baixar" do Recibo Fácil não se aplica 1:1. O que replica 100% é
a parte de **title/H1/FAQ retargetados pro termo de maior volume antes do
link**, que é o que foi feito agora.

## Plano de backlink e página (revisado 25/07, parte 6 — sazonalidade)

Paulo trouxe um ponto que revisou a escolha inicial: décimo terceiro tem
**risco de calendário** — autoridade de backlink demora de semanas a meses
pra maturar (imprevisível), e se atrasar, a janela sazonal (nov/dez) passa
e o retorno só viria em dezembro do ano seguinte, quase um ano perdido.
`salario-liquido` não tem esse risco (demanda o ano inteiro) e além disso já
é a página mais "quente" do site: posição 54,8 (melhor de todas as
candidatas, incluindo as 7 originais do P0), único clique real em 3 meses
no GSC, `featured: true` no registry, e title/H1/FAQ **já corretos** (não
teve o problema de descasamento que o décimo terceiro tinha — auditado
nesta sessão, sem necessidade de fix).

- **Página do primeiro link (revisado): `/calculadora/salario-liquido`.**
  Palavra-chave/âncora: "calculadora de salário líquido" ou "calcular
  salário líquido", embutida numa frase natural (ex.: "...descubra quanto
  cai na conta com uma **calculadora de salário líquido** como a do
  Calculos Online"). Evitar âncora isolada.
- **Por quê:** posição já é a melhor do site (54,8, menor distância até a
  página 1), único sinal de conversão real, demanda de ~333k/mês
  (246k + 60,5k + 27,1k, CPC US$0,02 — perfil informacional ainda mais
  limpo que décimo terceiro), sem risco de calendário, pronta pro link hoje
  sem precisar de fix de conteúdo antes.
- **Página do segundo link: `/calculadora/decimo-terceiro`** (já retargetada,
  F27/v0.3.2). Maior cluster de todos (~860k/mês) — comprar **até
  setembro no mais tardar**, pra manter margem de segurança antes do pico
  de nov/dez (a lógica de timing sazonal continua válida, só não é mais o
  primeiro/único link).
  - **Âncora decidida (11/08): "calcular décimo terceiro"** — não o
    termo-cabeça "décimo terceiro salário" (550k/mês, já era a opção A
    cogitada). Escolhida em vez dele porque (a) confirma o dado do Semrush
    de 25/07 já registrado abaixo (135.000 buscas/mês, CPC US$0,06) e (b)
    evita repetir a mesma âncora exata do termo-cabeça, que já é alvo
    natural de outras páginas/links do site — variação de âncora é sinal
    mais saudável pro Google do que âncora exata repetida.
  - ✅ **Link executado (12/08).** Paulo fechou o placement em
    `acritica.com` (A Crítica, jornal do Amazonas) — matéria "Cinco pontos
    que reduzem o 13º sem o trabalhador perceber", publicada 12/08.
    Verificado no HTML bruto:
    `<a href="https://calculosonline.com.br/calculadora/decimo-terceiro" target="_blank" rel="noreferrer">calcular décimo terceiro</a>`
    — âncora exata como decidido, embutida numa frase natural ("Simuladores
    gratuitos de folha permitem calcular décimo terceiro com as tabelas em
    vigor..."), `rel="noreferrer"` (só remove o header Referer, **não** é
    `nofollow` — o link conta normalmente pra SEO), página indexável (sem
    `noindex`, canonical self-referencing), e é o **único link editorial em
    texto** da página (outros 12 links externos são boilerplate de
    template: redes sociais, fontes, CDN, parceiro de e-edição). Mesmo
    patamar de autoridade do 1º link (jornal regional consolidado, como o
    `band.com.br`) e dentro do prazo (antes de setembro). **Ambos os 2
    links do plano original agora estão executados** — ver `FEATURES.md`
    F15. **Falta:** acompanhar posição de `decimo-terceiro` no próximo
    export do GSC (baseline 09/08: pos. 76,57, 87 impressões) e confirmar
    depois em GSC → Links → Links externos.
- **Tipo de site ideal para os posts pagos:** blog de finanças pessoais,
  RH, contabilidade ou carreira — mesmo perfil de quem já rankeia bem pros
  dois termos (meutudo.com.br, calcule.net, genyo.com.br, mobills.com.br,
  investnews.com.br) — não precisa ser gigante, precisa ser editorialmente
  relevante ao tema.
- **Pendente do Paulo:** escolher o(s) veículo(s) e executar a compra;
  validar números de férias (Grupo 1) se quiser um terceiro candidato.
- **Após a compra:** acompanhar posição de `salario-liquido` (referência:
  pos. 54,8 em 25/07) no próximo export do GSC — sinal mais rápido que
  décimo terceiro pra validar se a estratégia de backlink está funcionando,
  já que não depende de esperar a sazonalidade de fim de ano.

### 2026-07-25 (parte 4)
Paulo pediu para avaliar a pasta `gsc/` e combinar com as estratégias já
definidas (parte 2) para os próximos passos. A pasta tinha 2 coisas novas:
um **export de GSC atualizado** (`calculosonline.com.br-Performance-on-Search-2026-07-25/`,
substituindo o de 17/07) e, inesperadamente, **4 exports de GA4** na raiz de
`gsc/` (relatórios padrão em pt-BR: tráfego, resumo, geração de leads,
engajamento/retenção — últimos 28 dias, 27/06 a 24/07).

**Achado principal — corrige a premissa "0 visitas há 3 meses":** o GA4
mostra **230 usuários ativos, 226 novos, 2.352 eventos, 333
`calculator_calculated`** nos últimos 28 dias. Tráfego real existe e as
pessoas realmente usam as calculadoras. Por origem/mídia de sessão: **bing /
organic 179**, (direct) 52, **br.search.yahoo.com / referral 28**, **chatgpt.com
/ ai-assistant 16 + copilot.com / ai-assistant 1** (canal "AI Assistant" do
GA4, 14-17 usuários novos), duckduckgo/organic 2, vercel.com/referral 2,
yahoo/organic 1 — e **nenhuma linha de "google / organic"**. O agrupamento
de canais confirma: "Organic Search: 174 novos usuários" bate com
Bing+DuckDuckGo+Yahoo, não com Google. Cruzando com o GSC (3 meses,
Web-only): 1.133 impressões no Brasil, **2 cliques totais** (`salario-liquido`
1 clique/31 impr./CTR 3.23%, `inss` 1 clique/5 impr./CTR 20%). **Conclusão:
o site não está sem tráfego — está sem tráfego do Google, especificamente.**
Bing, Yahoo, direto e assistentes de IA já validam produto/conteúdo; falta
confiança/autoridade no Google.

**Achado secundário — granularidade por página muda o diagnóstico de
"CTR" para "autoridade":** só 4 calculadoras estão perto da página 1
(`margem-lucro` pos. 10.2, `porcentagem` pos. 9.3, `das-mei` pos. 12.3,
`calorias` pos. 13.6) — essas sim se beneficiam de CTR/title, já corrigido
em F10. Mas as calculadoras com **mais impressões** (ou seja, que o Google
já considera relevantes para a busca) estão **enterradas** em posições
75-92: `poupanca` (191 impr., pos. 65.9), `ferias` (173, pos. 87.3), `fgts`
(166, pos. 90.7), `rescisao-trabalhista` (134, pos. 91.9), `hora-extra`
(109, pos. 86.2), `decimo-terceiro` (83, pos. 75.9), `financiamento` (68,
pos. 87.1). Isso é autoridade de domínio, não title/FAQ — reforça backlinks
como a alavanca certa, com alvo específico (não as 4 que já estão bem).

**Achados menores:**
- `Aspecto da pesquisa.csv` (rich results) veio **vazio** — nenhum FAQPage/
  HowTo rich snippet concedido em 3 meses apesar de já implementados
  (F10/F12). Registrado como F18 no `FEATURES.md` para investigar via Rich
  Results Test antes de assumir que é só falta de autoridade.
- Home (`/`) rankeia muito bem (pos. 2.8) mas só tem 5 impressões — a marca
  "calculosonline" ainda não é buscada, esperado para um domínio de ~2,5
  meses de conteúdo real.
- `Gráfico.csv` mostra posição oscilando muito dia a dia (de 4 a 95) e um
  pico de 105 impressões em 19/07 (dia da correção de title/FAQ) — sinal de
  que mudanças on-page têm efeito rápido de re-avaliação do Google, mas não
  bastam sozinhas.
- Tráfego internacional (Índia, Filipinas, Vietnã etc., 0 cliques)
  reconfirmado irrelevante no export novo — já era P2/baixa prioridade,
  sem mudança.

**Decisão:** `FEATURES.md` reordenado (P0 vira F14-F19: diagnóstico
resolvido, backlinks e Ads ganham alvo específico — as 7 calculadoras
trabalhistas de cima —, `llms.txt`/GEO promovido de P2 para P0 dado o canal
AI Assistant já funcionando de graça, e novo item de investigar rich
results). `MEMORY.md` atualizado com a correção do diagnóstico em "Ao
voltar" e a tabela de alvos na seção P0.

### 2026-07-25 (parte 3)
Paulo pediu para "implementar o Clarity assim como no Recibo Fácil" — achado:
o componente `MicrosoftClarity.tsx` **já existia** no calculosonline (mesmo
padrão condicionado a `NODE_ENV`/env var), mas nunca tinha um Project ID
real configurado — o `curl` de produção confirmou que o script não estava
carregando. Paulo forneceu o ID real (`xs93eywu1y`, já criado no painel do
Clarity). Comparado com o `MicrosoftClarity.tsx` do Recibo Fácil (fonte da
verdade, ver `[[calculosonline-base-project]]` na memória pessoal) e
corrigidas 2 diferenças reais: **estratégia de carregamento** — Recibo Fácil
usa `lazyOnload` (não `afterInteractive`), decisão documentada lá por custar
~80-130ms de bloqueio da main thread no Lighthouse; calculosonline
carregava com `afterInteractive`, agora alinhado. **Preconnect** —
`<link rel="preconnect" href="https://www.clarity.ms" />` adicionado no
`<head>` do `layout.tsx` (calculosonline não tinha `<head>` manual
nenhum antes). **Diferença mantida de propósito, não copiada:** o Recibo
Fácil tem um ID hardcoded como fallback no código
(`PROVIDED_CLARITY_PROJECT_ID`) caso a env var não esteja setada; decidido
não replicar isso no calculosonline — o padrão atual (só renderiza com env
var presente, igual ao GA4) é mais limpo e evita ID de tracking commitado no
código. `apps/web/.env.local` criado localmente com o ID para builds de
produção locais (o componente só renderiza com `NODE_ENV=production`, então
não aparece em `next dev`). **Pendente do Paulo:** configurar
`NEXT_PUBLIC_CLARITY_PROJECT_ID=xs93eywu1y` no Vercel (Production, e Preview
se quiser gravação em PRs) e redeployar — sem isso o Clarity continua
inativo em produção. `pnpm --filter web typecheck` limpo após as mudanças.

### 2026-07-25 (parte 2)
Paulo reportou o site com **~0 visitas há 3 meses** e pediu para reestruturar
o roadmap incluindo **backlinks e Google Ads antes do AdSense**. Antes de
mexer na priorização, checagem técnica rápida para descartar bug óbvio de
tracking: `apps/web/src/app/layout.tsx` só renderiza `<GoogleAnalytics>`
quando `process.env.NEXT_PUBLIC_GA_ID` existe; o HTML de produção
(`curl https://calculosonline.com.br/`) mostra o measurement ID real
(`G-DZ6CT8JSZW`) no preload do `gtag/js`, então a env var está configurada
certo no Vercel. **Achado à parte (não é a causa):** o `.env.example` da
raiz do repo documenta a variável errada (`NEXT_PUBLIC_GA4_MEASUREMENT_ID`),
divergente da que o código realmente lê (`NEXT_PUBLIC_GA_ID`, em
`apps/web/.env.example`) — inofensivo hoje porque o Vercel já está com o
nome certo, mas pode confundir uma reconfiguração futura; vale alinhar os
dois arquivos numa próxima limpeza. `robots.txt` também está saudável
(`Allow: /`, sitemap referenciado). Como o `curl` só vê o HTML estático (o
script real do gtag é injetado client-side pelo Next), a confirmação
definitiva fica pendente: comparar **Vercel Analytics** (menos afetado por
ad-blocker) com o GA4 — registrado como ação pendente do Paulo em "Ao
voltar". **Decisão de reestruturação:** nova seção P0 no backlog
(Confirmar tráfego → Backlinks → Google Ads → só então AdSense), com o
racional de que ativar AdSense sem tráfego real não serve pra nada e que
autoridade de domínio (backlinks) provavelmente é o que trava as posições
borderline (9-10) vistas no GSC mesmo com on-page corrigido. `FEATURES.md`
renumerado (F15-F18) para refletir a nova ordem.

### 2026-07-25 (parte 1)
Paulo pediu para avaliar um prompt de expansão de catálogo (categoria Tempo
+ 22 calculadoras novas em Tempo/Saúde/Negócios/Financeiras) contra
`CHANGELOG.md`, memória e `README.md`. Achado principal: o prompt conflita
com a decisão P3 de 2026-07-19 de **pausar a Fase 2** até resolver o CTR
~0% — nenhuma calculadora nova ajuda enquanto o problema de conversão das 20
atuais não for endereçado, e o gate formal `Fase 1 → Fase 2`
(`docs/PLANO_IMPLEMENTACAO.md`) exige AdSense ativo, que ainda não existe
(próxima sprint é 1.5, PWA/Android; AdSense é 1.6). Confirmado por leitura
direta do MDX que `calorias.mdx` já cobre TMB/TDEE/macros, então a checagem
anti-duplicação pedida no prompt passa. Decisão: registrar os candidatos
(nomes/slugs/categoria/padrão de componente) na seção acima **sem
implementar nada**, sinalizando os dois bloqueios (Fase 2 pausada, Semrush
não rodado). Na mesma sessão, Paulo pediu para portar os controles de
processo do Recibo Fácil (`FEATURES.md` + `MEMORY.md`) para cá, "para ter a
mesma forma de pensamento" — este arquivo e `FEATURES.md` nasceram dessa
conversa, reconstruídos a partir do `git log`, `CHANGELOG.md` e do backlog de
SEO já em andamento.

### 2026-07-20
**Fix do `lastmod` do sitemap** — `dataAtualizacao` sozinha (fixa em
2026-01-01 em todas as 20 calculadoras, também exibida ao usuário como selo
de confiança) não refletia mudanças de SEO; nova constante `seoRefreshDate`
em `app/sitemap.ts` (mesmo padrão do Recibo Fácil), usa a mais recente entre
as duas datas. **Schema `HowTo`** adicionado (3 passos genéricos) — fecha a
parte "HowTo" do item de SEO centralizado (o resto, `buildMetadata`/canonical
alternates/`Article`/`ItemList`, ainda não foi portado). **Chips de valor
rápido** (pedido à parte, fora do escopo original de SEO) — `quickAdd` em
`FieldMeta` do `CalculatorForm`, aplicado em 16 formulários/17 calculadoras
com campo R$, mesmo CSS do `CurrencyInputWithQuickAdd` do Recibo Fácil.
22/22 e2e verdes. Web app 0.3.0 (F12). Ajuste de CI no mesmo dia (F13).

### 2026-07-19
**Diagnóstico Search Console** (`gsc/`, export de 2026-07-17, últimos 3
meses): ~1.120 impressões e só 2 cliques (CTR ~0%), inclusive em páginas já
na 1ª página (`margem-lucro` pos. 9.6, `porcentagem` pos. 9.1, `das-mei` pos.
10.3, home pos. 3.3). Comparado com o código do calculosonline e com os
padrões técnicos mais maduros do Recibo Fácil (mesmo autor). **P0 — Title
único + FAQPage real** (F10, v0.1.0): `buildCalculatorTitle()` substitui o
padrão fixo "Online e Gratuita 2026" por "... 2026 — Grátis, sem Cadastro"
(corrige de quebra a duplicação de "2026" em inss/irpf/das-mei); `lib/faq.ts`
extrai as perguntas reais dos MDX (101 perguntas, 20 calculadoras) para o
schema `FAQPage`, no lugar das 3 genéricas fixas. **P1 (parcial) — Sitemap/
robots nativos** (F11, v0.2.0): `next-sitemap` removido, `app/sitemap.ts` +
`app/robots.ts` nativos no padrão do Recibo Fácil (`lastModified` real,
prioridade maior para `featured`); corrige bug de `/privacidade` (redirect)
no lugar da canônica `/politica-de-privacidade`. **Playwright E2E** no mesmo
padrão do Recibo Fácil (17 testes) — o próprio teste revelou que campo
numérico opcional em branco virava `NaN` (não `undefined`), quebrando o
`.default(0)` do Zod em quase todas as 20 calculadoras; corrigido na raiz em
`packages/ui/src/CalculatorForm/index.tsx`. **Decisão P3:** pausar a Fase 2
do plano de negócios (+30 calculadoras, prevista mês 3-6) até o CTR/conteúdo
das 20 atuais melhorar — registrado aqui para não ser esquecido em sessões
futuras.

### 2026-05-10 → 2026-05-11
Sprints 0.1 a 1.4.1 (setup do monorepo, core engine, 20 calculadoras, UI
compartilhada, páginas, SEO/conteúdo editorial, memória de cálculo e
identidade visual — ver F1–F7 no `FEATURES.md`), deploy 1.0.0 e Google
Analytics (F8–F9). Detalhe técnico de cada sprint documentado em
`AGENTS.md` (§Estado atual das sprints). Sem atividade registrada entre
2026-05-11 e 2026-07-19.

---

**Como aplicar:** ao retomar este projeto, ler primeiro "Ao voltar" acima.
Ao adicionar uma feature nova (implementada ou só planejada), criar/atualizar
a entrada correspondente em `FEATURES.md` e, se envolver uma decisão de
growth/negócio (não só técnica), registrar o racional aqui no Diário.
