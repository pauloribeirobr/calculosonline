# Prompt: Raio-X semanal (para cadastrar em outros projetos)

Criado em 27/11/2026, a partir do Raio-X do Calculos Online. Copie o bloco abaixo e cole como instrução no projeto novo
(no `AGENTS.md`/`CLAUDE.md` dele, ou como primeira mensagem). Ele é genérico: o assistente de cada projeto descobre o site,
as propriedades e o que já existe, e usa este repositório como modelo.

```text
# Raio-X semanal

Quero neste projeto o "Raio-X semanal": a avaliação semanal de tráfego, busca e saúde do site, com o mesmo nome, as mesmas
seções e o mesmo ritual do projeto Calculos Online. O modelo completo (código, configuração e documentação) está em
/home/paulo/projects/next/calculosonline. Entre lá e leia antes de começar:

- AGENTS.md, seção "Raio-X semanal" (o ritual) e "GSC, GA4 e Clarity: a leitura sai da API" (credenciais e cuidados).
- dados/README.md (comandos, credenciais, coleta diária do Clarity no servidor, cuidados de leitura).
- dados/semana.mjs (o gerador) e dados/lib/*.mjs (config, google, clarity, serp, tabela).
- dados/leituras/videos.json, acompanhamento.json, calendario.json (os arquivos editados à mão).
- docs/semanas/2026-11-27.md (um Raio-X completo, com a seção 10 escrita, como exemplo de saída e de leitura).

## O que construir aqui

1. Se este projeto ainda não tem uma pasta `dados/`, copiar a do Calculos Online e adaptar. Se já tem (o Recibo Fácil é a
   origem dela), acrescentar só o que falta, sem duplicar nada.
2. Trocar tudo o que é do site: domínio, propriedade do GA4, site do GSC, token do Clarity, lista de palavras do Serper,
   nomes de eventos do GA4 e o funil do produto (no Calculos Online é página → cálculo → compartilhar/salvar; aqui, o que
   for o uso principal). Descobrir os IDs pela API (`ga4.mjs --propriedades`, `gsc.mjs --sites`) e confirmar comigo.
3. O comando `node dados/semana.mjs [--serp] [--sem-inspecao] [--cwv]` gera `docs/semanas/<dia>.md` com 10 seções:
   Também: conferir o JSON-LD do site (toda referência {"@id": …} precisa apontar para um nó publicado na mesma página,
   e uma BreadcrumbList só por página) — no Calculos Online isso gerou erro crítico no teste de resultados aprimorados.

   1. Site (GA4): sessões, usuários, engajadas, uso do produto, canais, origens, páginas de entrada, e **robôs**: o Direct
      separado por país (Brasil × exterior) e a linha "sessões de gente" = total − Direct do exterior.
   2. IA e vídeo: sessões vindas de assistentes de IA (ChatGPT, Perplexity, Gemini, Copilot, Claude…); para cada vídeo de
      `dados/leituras/videos.json`, as visualizações (lidas da página pública do YouTube, `"viewCount"`) e as sessões da
      campanha (utm_campaign) no GA4. Sem canal de vídeo, a parte de vídeo some.
   3. Search Console: cliques, impressões, CTR, posição; páginas e consultas que ganharam e perderam; consultas perto da
      página 1.
   4. Indexação no Google: inspeção de URL pela API (`urlInspection.index.inspect`, escopo `webmasters.readonly`) em todas
      as URLs do sitemap, contagem por estado, lista do que está fora do índice e o que mudou desde a rodada anterior.
   5. Bing, pela API do Bing Webmaster Tools (BWT_CHAVE): cliques e impressões dos últimos 7 dias × os 7 anteriores
      (GetRankAndTrafficStats), páginas e consultas da última semana × a anterior (GetPageStats, GetQueryStats) e rastreio
      do Bingbot com 4xx/5xx (GetCrawlStats). O Desempenho de IA não está na API: o boletim avisa e dá o passo a passo do
      export manual.
   6. Concorrência e posição no Google (Serper, só com `--serp`; o crédito é dividido entre os projetos).
   7. Saúde, comportamento e velocidade: erros do GA4, Clarity (clique morto, volta rápida, rolagem, por página) e
      PageSpeed das 5 maiores páginas de entrada, uma vez por mês.
   8. Acompanhamento das entregas: `dados/leituras/acompanhamento.json` (entrega, o que medir, linha de base, data de
      leitura, status), marcando o que vence na semana e o que venceu.
   9. Calendário das próximas 6 semanas: `dados/leituras/calendario.json` (datas que mexem no tráfego deste negócio, com a
      fonte; "aprox." quando a data ainda não foi publicada).
   10. Leitura e propostas: em branco, para escrever na sessão.

## Credenciais (nunca no repositório)

- Google (GA4, GSC, inspeção de URL): o cliente OAuth e o token são da minha conta e já existem em
  ~/.config/recibofacil/ (google-oauth-cliente.json, google-oauth-token.json). Reaproveitar como o
  dados/lib/config.mjs do Calculos Online faz; só criar token próprio se aquele parar de valer.
- Serper (SERPER_CHAVE), PageSpeed (PAGESPEED_CHAVE) e Bing Webmaster Tools (BWT_CHAVE): chaves da conta, já no
  ~/.config/recibofacil/dados.env; servem a todos os sites (o site só precisa estar verificado no BWT da mesma conta).
- Clarity: um token por projeto (Clarity → projeto → Configurações → Data Export). A API só devolve 72 h, então a coleta
  diária roda no servidor do Recibo Fácil (cron), como está descrito no dados/README.md do Calculos Online.
- Chaves próprias do projeto em ~/.config/<projeto>/dados.env, chmod 600.

## O ritual, toda vez que eu pedir "faça o Raio-X"

1. Rodar `node dados/semana.mjs --serp`.
2. Ler junto o que é manual (Desempenho de IA do BWT, mapa de calor do Clarity). Faltando, me pedir com o passo a passo.
3. Escrever a seção 10: o que os números dizem (números absolutos junto das porcentagens: volume pequeno engana), até 3
   mudanças com hipótese, métrica, linha de base e data de leitura, a manutenção da vez e 1 a 3 possibilidades novas.
   Mudança aprovada entra em `acompanhamento.json`.
4. Registrar no diário do projeto (MEMORY.md ou equivalente) com os números brutos, e uma linha no resumo de retorno.
5. Me entregar: o achado principal, um resumo por fonte, as propostas e o que preciso fazer (pedidos manuais, exports).

Regras: não fazer commit nem push (eu faço); não rodar suíte de testes (eu rodo); não expor chaves; descontar das leituras
os acessos de teste e as gravações feitas em produção. Registre este ritual no AGENTS.md deste projeto com o nome
"Raio-X semanal" e rode o primeiro Raio-X ao terminar.
```
