# `dados/` — GA4, Search Console, Clarity e concorrência por API (F89)

Porte do `dados/` do Recibo Fácil (F284, F285, F289 e F290 de `../recibofacil/FEATURES.md`), pedido do Paulo em
17/11/2026: *"Foi implementada a validação por API do GSC, Clarity e Google… implemente aqui. Foco é rodarmos esses
relatórios para melhorar o projeto."* Substitui o export manual da pasta `gsc/` para GSC, GA4 e Clarity. BWT, Semrush e o
mapa de calor do Clarity continuam manuais.

- **Sem dependência:** Node 24 (tem `fetch`), nada de `pnpm install`. Fora do build do site.
- **Chaves fora do repo**, em `~/.config/calculosonline/` (`chmod 600`), só leitura.
- **Saídas** em `dados/saida/` (fora do git): CSV e JSON de cada consulta. O que precisa virar série fica versionado:
  `docs/semanas/<dia>.md` (boletim) e `docs/concorrentes/serp/<dia>.json` (rodada do Serper).

| Comando | Para quê |
|---|---|
| `node dados/semana.mjs [--fim AAAA-MM-DD] [--serp]` | **Boletim da semana** (GA4 + GSC + Clarity; `--serp` inclui a concorrência) em `docs/semanas/<dia>.md` |
| `node dados/gsc.mjs --dias 28 --dims query,page` | Desempenho na Pesquisa, sem o corte de 1.000 linhas; `--filtro "page~/calculadora/cdb"` |
| `node dados/gsc.mjs --sites` | Lista as propriedades do GSC |
| `node dados/ga4.mjs dados/leituras/<leitura>.json` | Uma leitura do GA4 (Linhas / Colunas / Valores / filtros, como a Exploração) |
| `node dados/ga4.mjs --metadados --filtro calculator` | Nomes de dimensões e métricas na API |
| `node dados/ga4.mjs --propriedades` | Lista as propriedades do GA4 |
| `node dados/clarity.mjs --dias 3 --dims URL,Device` | Números do painel do Clarity agora (gasta 1 das 10 chamadas do dia) |
| `node dados/clarity-dias.mjs [--de …] [--ate …]` | Traz a coleta diária do servidor (rsync) e resume: dia a dia × GA4, aparelho, canal, atrito por página (não gasta chamada) |
| `node dados/palavras-chave.mjs` | Lista de palavras-chave da concorrência (fixas + GSC de 90 dias) em `dados/leituras/palavras-chave.json` (uma vez por mês) |
| `node dados/serp.mjs [--so "a,b"]` | Top 10 do Google Brasil de cada palavra, pelo Serper (1 crédito por palavra; uma rodada por dia) |
| `node dados/autorizar.mjs` | Token OAuth próprio deste projeto (só se o do Recibo Fácil parar de valer) |

Leituras prontas em `dados/leituras/`: `calculos-por-calculadora.json` (uso por calculadora, 28 dias) e
`validacao-ga4-2026-10-25.json` (a validação abaixo).

## Credenciais

**Google (GA4 e GSC): nada a fazer.** O cliente OAuth e o token são da conta Google do Paulo, criados para o Recibo Fácil
(`~/.config/recibofacil/google-oauth-cliente.json` e `google-oauth-token.json`, projeto `recibofacil-dados` no Google Cloud),
e a conta já é dona das duas propriedades daqui. O `lib/config.mjs` usa esses arquivos quando `~/.config/calculosonline/`
não tem os seus. As propriedades têm padrão no código: GA4 `537095884` ("calculosonline", conta "Meus Sites") e GSC
`sc-domain:calculosonline.com.br`, conferidas pela API em 17/11/2026. Token vencido ou revogado: `node dados/autorizar.mjs`
(grava em `~/.config/calculosonline/`).

**Serper: nada a fazer.** `SERPER_CHAVE` é da conta e vem do `~/.config/recibofacil/dados.env`. O saldo é **dividido com o
Recibo Fácil** (2.418 créditos em 17/11/2026, e o boletim de lá gasta ~81 por semana): a rodada daqui fica fora do boletim
por padrão (`--serp` liga) e tem teto de 120 por rodada.

**Clarity: um token por projeto** (o do Recibo Fácil não serve). Clarity → projeto "Calculos Online" → Configurações →
Data Export → Gerar novo token de API → `CLARITY_TOKEN=` em `~/.config/calculosonline/dados.env` (`chmod 600`). Gravado
em 17/11/2026.

## Validação (antes de confiar) — 17/11/2026

Refeito pela API o que o Paulo exportou do console em 25/10/2026 (`gsc/`):

- **GA4** (`node dados/ga4.mjs dados/leituras/validacao-ga4-2026-10-25.json`, 27/09 → 24/10): 216 usuários ativos, 209
  novos, 1.671 eventos. **3 de 3 iguais.**
- **GSC** (`node dados/gsc.mjs --de 2026-07-24 --ate 2026-10-23 --dims page`): 10 cliques e 6.307 impressões no total, e
  as páginas iguais ao export (`/calculadora/tesouro-direto` 4 / 243 @ 22,46; `/calculadora/datas` 2 / 2.442 @ 9,03).
  A soma das linhas por página dá 6.382: uma busca que mostra duas páginas do site conta nas duas, e o total que vale é o
  da consulta sem dimensão, que o `gsc.mjs` imprime à parte.

## Cuidados de leitura (o que este site tem de diferente do Recibo Fácil)

- **Volume pequeno:** com dezenas de sessões por semana, variação percentual engana (77 → 150 sessões é "+95%"). Ler o
  número absoluto junto.
- **GSC quase todo anonimizado:** em 90 dias, as consultas visíveis somam 2.208 das 10.398 impressões (21%). O resto é
  sobretudo a cauda de datas exatas do `/calculadora/datas`. Por isso o boletim mede **impressão por página**, e o
  `palavras-chave.mjs` tira as consultas de data exata e trabalha com corte baixo (10 impressões em 90 dias).
- **O tráfego vem do Bing**, não do Google: nos 28 dias até 16/11, `bing` + `br.search.yahoo.com` (que usa o índice do
  Bing) são ~60% das sessões. O GSC só mede o Google. O Bing Webmaster Tools continua manual (export do Paulo).
- **`calculator_slug` não é dimensão no GA4** (não foi cadastrada como personalizada). Cada calculadora tem URL própria, então
  `pagePath` resolve; cadastrar a dimensão só valeria para o hub, que calcula quatro coisas na mesma URL.
- **Posição no Serper × GSC:** o Serper é busca de computador; o GSC mistura aparelhos. O Serper diz **quem** aparece; a
  posição do site que vale é a do GSC.

## Clarity: a coleta diária no servidor

A Data Export API só devolve as últimas 72 h e aceita 10 chamadas por dia, com até 3 dimensões e 1.000 linhas. Sem guardar
todo dia, não existe histórico. O site está na Vercel e não tem servidor, então a coleta roda **no servidor do Recibo Fácil**
(`paulo@69.62.94.73`), ao lado da de lá:

- script `~/dados/clarity-coletar-calculosonline.sh` (cópia de `dados/clarity-coletar.sh`), token em
  `~/.config/calculosonline/clarity.env` (`chmod 600`);
- cron `10 0 * * *` (00:10 de Brasília, 5 minutos depois do Recibo Fácil; o relógio do servidor está em Brasília), log em
  `~/dados/clarity-calculosonline.log`, saída em `~/dados/clarity-calculosonline/<dia>/`;
- 4 chamadas por dia (total; URL × aparelho; origem × mídia × canal; aparelho × sistema × navegador), sobram 6 para
  `dados/clarity.mjs`. **Instalado em 17/11/2026**; o primeiro dia coletado é 17/11.

Atualizar o script no servidor depois de mudar `dados/clarity-coletar.sh`:
`scp dados/clarity-coletar.sh paulo@69.62.94.73:dados/clarity-coletar-calculosonline.sh`. **O mapa de calor (cliques e
toques por página) não sai pela API**: quando precisar, continua manual.
