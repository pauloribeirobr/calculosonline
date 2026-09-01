# Calculos Online

Plataforma de calculadoras online para o mercado brasileiro —
[calculosonline.com.br](https://calculosonline.com.br). 20 calculadoras
trabalhistas, de impostos, financeiras, de investimentos, saúde e negócios,
todas grátis, sem cadastro e com a memória de cálculo aberta.

Monorepo **Turborepo** com **Next.js 15 + React 19 + TypeScript**.

| Pacote              | O que é                                                              |
| ------------------- | -------------------------------------------------------------------- |
| `apps/web`          | site Next.js (App Router, SSG + ISR)                                 |
| `packages/core`     | motor de cálculo — funções puras, sem UI, cobertas por Vitest        |
| `packages/ui`       | componentes compartilhados (`CalculatorForm`, `CalculatorResult`, …) |
| `packages/tsconfig` | configurações de TypeScript da casa                                  |

## Começando

Requer **Node ≥ 20** e **pnpm 9**.

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

| Comando                      | O que faz                                                      |
| ---------------------------- | -------------------------------------------------------------- |
| `pnpm dev`                   | sobe o site em modo desenvolvimento                            |
| `pnpm build`                 | build de produção                                              |
| `pnpm typecheck`             | `tsc --noEmit` nos 3 pacotes — **rode ao mexer em mais de um** |
| `pnpm lint`                  | ESLint                                                         |
| `pnpm test`                  | testes unitários do `core` (Vitest)                            |
| `pnpm --filter web test:e2e` | testes de ponta a ponta (Playwright)                           |

O CI (`.github/workflows/ci.yml`) roda, nesta ordem: `typecheck`, `lint`,
`test` do core e `build`. O Vitest transpila sem checar tipos, então testes
verdes **não** substituem o `typecheck`.

## Documentação

Quatro arquivos, cada um com um papel:

- **[AGENTS.md](AGENTS.md)** — stack, convenções, estrutura de pastas e roadmap (o "onde/padrão"). É também a memória compartilhada para assistentes de IA.
- **[FEATURES.md](FEATURES.md)** — lista numerada de features (`F1`, `F2`, …), entregues e no backlog (o "quê/quando").
- **[CHANGELOG.md](CHANGELOG.md)** — detalhe técnico versionado por SemVer (o "como").
- **[MEMORY.md](MEMORY.md)** — diário de decisões de produto e growth (o "porquê").

Convenção de commit: **um commit por feature**, no formato
`feat: F<n> - <descrição>`, para que o `git log` continue servindo de fonte
ao `FEATURES.md`.

## Operação

### Avisar os buscadores após um deploy com conteúdo novo

Só vale a pena quando **o conteúdo mudou de fato** — title, description, MDX,
FAQ, calculadora nova. Deploy de CSS, refactor ou ajuste de teste não precisa
de nada.

**1. Bumpe o `seoRefreshDate`** em [`apps/web/src/app/sitemap.ts`](apps/web/src/app/sitemap.ts).
É o `<lastmod>` do sitemap e o único sinal de "esta página mudou" que os
buscadores leem. Sem esse bump, reenviar o sitemap não produz efeito nenhum.

**2. Dispare o IndexNow** (Bing, Yandex, Seznam, Naver) — **depois** de o deploy
estar no ar, nunca antes. O aviso é um convite imediato: os buscadores chegam
em minutos, e se a versão nova ainda não estiver publicada eles rastreiam o
conteúdo antigo. Confirme antes com um `curl` na página que mudou:

```bash
curl -s https://calculosonline.com.br/calculadora/tesouro-direto | grep -o '<title>[^<]*</title>'
```

**Desde o F46 esse passo é automático:** o workflow
[`.github/workflows/indexnow.yml`](.github/workflows/indexnow.yml) escuta o
evento `deployment_status` e submete o sitemap inteiro assim que o deploy de
**produção** da Vercel volta `success` — que é exatamente a ordem correta.
Não é preciso rodar nada à mão no caminho normal.

Para submeter fora desse fluxo (ou só algumas calculadoras), há dois caminhos:

```bash
# local
INTERNAL_API_KEY=<segredo> pnpm --filter web indexnow

# local, só algumas calculadoras
INTERNAL_API_KEY=<segredo> pnpm --filter web indexnow ferias inss
```

Ou pelo GitHub: **Actions › IndexNow › Run workflow**, com o campo `slugs`
vazio (sitemap inteiro) ou com os slugs separados por espaço.

**Setup de uma vez só do workflow (feito em 30/08):** criar o secret `INTERNAL_API_KEY` em
*Settings › Secrets and variables › Actions* com o mesmo valor que está na
Vercel (Production). Sem o secret o job roda e falha no script, que exige a
variável.

O script lê o `sitemap.xml` de produção — não há lista de rotas duplicada — e
não tem dependência nenhuma (usa só o `fetch` nativo do Node), por isso o
workflow não precisa de `pnpm install` nem de build.

**3. Google Search Console** — reenviar o sitemap basta. A Inspeção de URL só
antecipa o recrawl em alguns dias e é opcional. O Google não usa IndexNow.

### Publicar um post no blog

O F22 montou a infra; **um post novo não exige código**. São dois passos:

1. **Entrada em [`apps/web/src/lib/blog.ts`](apps/web/src/lib/blog.ts)** — slug,
   títulos (o `titulo` é o H1, o `tituloSeo` é o da SERP), descrição, resumo do
   card, datas, palavras-chave, a `calculadoraPrincipal` que o post alimenta e
   as `calculadorasRelacionadas` que ele cita.
2. **O corpo em `apps/web/content/blog/[slug].mdx`**, mesmo formato dos MDX de
   calculadora.

Rota, canonical, `Article`/`Breadcrumb` JSON-LD, imagem social, entrada no
sitemap e os links recíprocos com a calculadora saem automaticamente do
registry.

**Duas regras que valem a pena não quebrar:**

- **Número no artigo sai do motor, não de conta à mão** (mesma disciplina do
  F47/F49). Gere com um script descartável em `packages/core/src/__scratch__`,
  apague depois, e trave os valores principais em `tests/e2e/blog.spec.ts`. Se
  uma regra legal mudar, o teste quebra antes de o artigo mentir em produção.
- **Post sazonal precisa de revisão anual.** O campo `sazonalidade` do registry
  existe para essa decisão não se perder — o guia do 13º, por exemplo, tem de
  ser revisto todo agosto: as datas mudam de dia da semana (20/12/2026 cai num
  domingo) e as tabelas de INSS/IRRF mudam de valor.

**Este é um dos deploys que pedem IndexNow** — conteúdo novo de verdade, ao
contrário de um deploy de CSS. Bumpe o `seoRefreshDate` se o post alterar
title/description de calculadora existente; senão o `lastModified` do post já
sai do próprio registry.

### Manter o hub trabalhista

O F58 criou `/calculadora-trabalhista-completa`, que **não está no
`calculatorRegistry`** — ele mora em
[`apps/web/src/lib/hubTrabalhista.ts`](apps/web/src/lib/hubTrabalhista.ts),
com o conteúdo em `apps/web/content/hub/trabalhista-completa.mdx` e o
encadeamento em `packages/core/src/trabalhista/panorama.ts`.

**Três coisas que não podem ser quebradas ao mexer nele:**

- **Nunca oferecer um "total geral".** A rescisão já embute o 13º proporcional,
  as férias proporcionais e a multa do FGTS — somar os quatro blocos dá mais que
  o dobro do valor real. O consolidado sai inteiro como `neutro` justamente para
  não parecer uma soma, e há teste travando isso.
- **A projeção do FGTS roda com `saldoAtual: 0`.** O saldo que o usuário digita
  já contém os depósitos do contrato; passá-lo somaria os mesmos 8% duas vezes.
- **Campo novo no formulário precisa de justificativa.** O hub tem de custar
  *menos* preenchimento que abrir quatro calculadoras — é o motivo de os 7
  campos serem exatamente os da rescisão.

Se o hub ganhar irmãos (um hub de impostos, por exemplo), o padrão a repetir é
este: registry próprio fora do `calculatorRegistry`, encadeamento como função
pura no core, e link recíproco a partir das calculadoras que ele agrega.

### Keyword research semanal pelo painel de IA do Clarity

O Microsoft Clarity tem um painel de **Share of Authority (SoA)** que lista as
queries em que o site foi **citado por IA**, com a contagem por query e por
página. É a única fonte de keyword research do projeto com ciclo de **7 dias** —
o Search Console leva 90, porque a posição média que ele reporta é média da
janela inteira e não move com um deploy de dias atrás.

Ele já pagou o próprio custo uma vez. O F38 (20/08) apostou no vocabulário
"simulador/simulação" para o Tesouro Direto, escolhido pelo volume de busca do
Semrush. Uma semana depois as citações da página tinham triplicado (15 → 47) —
**mas nas variações de "calculadora de investimento em tesouro direto"**, que o
F38 não tinha mirado. A palavra "simulação" não aparecia na lista. O ganho era
real e a atribuição era outra; sem esse painel, a conclusão registrada teria
sido a errada.

**Como ler, a cada rodada de análise:**

1. No Clarity, exportar o painel do projeto (inclui o bloco de SoA) para `gsc/`.
2. Na tabela de **queries**, procurar vocabulário que o site **não usa**: no
   export de 27/08 apareceram "calculadora de investimento em tesouro direto"
   (47 citações somadas), "calcule ir 2026" (21), "cálculo de dependente no IR"
   (6) e "calculadora irrf 2026 aluguel" (4).
3. Separar em dois destinos: **vocabulário** (a página já faz aquilo, só não
   chama assim → tratamento do F38/F53: title, H1, MDX e FAQ) e **lacuna de
   produto** (a página não faz aquilo → feature, como o IRRF sobre aluguel do
   F54).
4. Na tabela de **páginas**, ver quem concentra citação. Em 27/08 o `irrf` tinha
   158 de 295 — é a página em que investir GEO rende mais.
5. Registrar os números brutos no [`MEMORY.md`](MEMORY.md): a pasta `gsc/` está
   no `.gitignore` e é sobrescrita a cada export, então a série temporal só
   existe se estiver escrita lá.

**Duas armadilhas de leitura:**

- **"SoA 24%" quer dizer "24% no Copilot", não "24% na IA."** O Clarity é da
  Microsoft e mede o ecossistema Bing. O Semrush, que mede ChatGPT, Gemini e AI
  Overview, reporta zero para o mesmo site no mesmo período. Os dois estão
  certos — é a mesma assimetria do tráfego orgânico (462 sessões do Bing contra
  4 do Google desde janeiro).
- **Citação não é clique.** O `AI referral traffic` do mesmo painel saiu de 0
  para 0,83% entre 20/08 e 27/08 — real, mas pequeno. GEO aqui constrói
  autoridade e presença; converter isso em visita é outra batalha.

### Marcar a conversão no GA4 (passo manual, feito no painel)

O evento **`calculator_calculated`** já é disparado corretamente pelo site —
`analytics.calculatorCalculated()` em
[`apps/web/src/lib/analytics.ts`](apps/web/src/lib/analytics.ts), chamado a
cada cálculo concluído (385 eventos em 28 dias no último export). O que falta
não é código: é marcá-lo como **key event** no painel do GA4, coisa que a API
de coleta não faz.

Sem isso o GA4 reporta "Leads qualificados 0" em todas as semanas (é o caso
desde janeiro) e **o Google Ads não tem o que otimizar** — motivo pelo qual o
piloto pago (F17) está bloqueado.

Caminho no painel: **Administrador › Exibir dados › Eventos**, localizar
`calculator_calculated` na lista e ligar a chave **"Marcar como evento
principal"**. Vale marcar também `calculator_shared` como secundário, se o
objetivo for medir alcance.

Duas ressalvas:

- O GA4 **não retroage** — a contagem começa na data em que a chave é ligada.
- O evento aparece na lista só depois de ter sido coletado ao menos uma vez
  nas últimas 48h; se não estiver lá, é porque não houve cálculo no período,
  não porque o tracking quebrou.

### A chave do IndexNow

[`apps/web/public/7a2b357b3e5402cd1a0b1d9931a28185.txt`](apps/web/public/7a2b357b3e5402cd1a0b1d9931a28185.txt)
é o arquivo de prova de posse do domínio, exigido pelo protocolo. **Ninguém
da equipe precisa acessá-lo** — quem busca é a API do IndexNow, ao receber uma
submissão. Ele só precisa continuar sendo servido.

A chave é pública por definição e por isso vive como constante em
[`apps/web/src/app/api/indexnow/route.ts`](apps/web/src/app/api/indexnow/route.ts),
e não em variável de ambiente: assim ela não tem como divergir do nome do
arquivo — divergência que a API rejeita com um erro opaco. Se um dia mudar,
troque nos dois lugares e no `tests/e2e/indexnow.spec.ts`, que trava essa
sincronia.

O segredo de verdade é o **`INTERNAL_API_KEY`**, configurado na Vercel, que
impede terceiros de submeterem URLs em nome do site. Não está no repositório.
