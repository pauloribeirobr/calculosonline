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

**Setup de uma vez só do workflow:** criar o secret `INTERNAL_API_KEY` em
*Settings › Secrets and variables › Actions* com o mesmo valor que está na
Vercel (Production). Sem o secret o job roda e falha no script, que exige a
variável.

O script lê o `sitemap.xml` de produção — não há lista de rotas duplicada — e
não tem dependência nenhuma (usa só o `fetch` nativo do Node), por isso o
workflow não precisa de `pnpm install` nem de build.

**3. Google Search Console** — reenviar o sitemap basta. A Inspeção de URL só
antecipa o recrawl em alguns dias e é opcional. O Google não usa IndexNow.

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
