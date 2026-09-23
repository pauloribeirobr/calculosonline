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

- **F65 (22/09) — "Salário depois das férias", o post que responde a maior
  pergunta do relatório do Bing**, numa página em que o índice da Microsoft já
  nos põe na página 1. Junto vieram **7 correções de conteúdo**: a `ferias.mdx`
  era a pior página do site em direito (Súmula 450 derrubada pelo STF na ADPF
  501, art. 138 citado fora de contexto, duas atribuições erradas), e a
  calculadora prometia **"descontos de INSS e IRRF" que ela não calcula**.
  Detalhe no Diário de 22/09 (parte 6).
- **F67 (22/09) — vocabulário da cauda média entregue** em `hora-extra`
  ("Online" no title, 7 sinônimos, 3 perguntas novas na FAQ) e `decimo-terceiro`
  (forma curta, sem o "terceiro"). **F68 (calculadora de datas), F69 (página
  "férias + 13º") e F70 (cliques mortos) cadastradas no P0, nessa ordem.**
- **Decisão de fundo: o roadmap sai do trabalhista.** Três sites independentes
  — dois com 7x e 12x a nossa autoridade — ficam em 26-58 na cabeça desse
  cluster. O que vem depois do F67 é **datas** (sem lei para manter, KD de um
  dígito em parte da cauda) e a **intenção combinada** de férias + 13º, que
  ninguém cobre. Detalhe no Diário de 22/09 (parte 11).
- **F66 (22/09) — a calculadora de férias devolve o líquido.** O recibo tem três
  regras próprias que o contracheque não tem: **IRRF em separado** do salário do
  mês, **abono fora da base** dos dois e **dobra do art. 137 sem tributo** (o
  ponto em que folhas divergem, declarado em aviso). **O hub do F58 segue em
  bruto de propósito** — lá as férias são projeção, não recibo. Achado que virou
  copy: vender 10 dias dá o mesmo bruto e **R$ 998,15 a mais de líquido**.
  Detalhe no Diário de 22/09 (parte 8).
- **Estratégia do Google, decidida em 22/09:** parar de perseguir head term
  este ano; escrever para **pergunta longa com número** (serve aos dois
  índices); **pedir indexação manual no GSC** do hub, dos 5 posts e do F65, que
  é a última hipótese barata (o IndexNow não fala com o Google); e **checkpoint
  em ~27/10** — se rescisão e 13º continuarem em 85-95 com o Bing em 7, vale a
  decisão de ordem de grandeza de 14/09. **Não comprar o link 5 antes disso.**
- **`calculadora.com.br` (22/09) é o comparável que importa: 247 domínios
  referentes e 653 backlinks — a nossa ordem de grandeza — e 21.700 visitas/mês
  contra a nossa 1.** Duas páginas de **datas** fazem 66% disso, uma delas
  rankeando para **49 keywords sozinha**. O trabalhista dele é 0,9% do tráfego,
  com `calculo de ferias` em 36 e `calculo salario liquido` em 48 — **terceiro
  site independente travado na mesma faixa**. Detalhe no Diário de 22/09
  (parte 10).
- **Datas vira a principal aposta de expansão** (não é mais "candidato"):
  `contador de dias` 165K/KD 35, `calculadora de dias` 40,5K/39, **`diferença
  entre datas` 4,4K/KD 16**, `somar dias` 3,6K/25. Sem legislação para manter,
  KD alcançável e uma página cobrindo dezenas de sinônimos. A lista de julho
  media a keyword errada.
- **Hora extra é ganhável, com prova de terceiro:** o `calculadora.com.br`
  está em **pos. 5** em `calcular hora extra online` (KD 25) **com AS 14**,
  onde nós estamos em 58. É a única página trabalhista que rankeia para ele.
- **Comparação com `calculaonline.com.br` (22/09): 72% do tráfego dele vem de
  UMA keyword** (`calculadora online`, 368K/mês, KD 67, pos. 8, na home, casando
  com o domínio dele). **E no nosso tema ele está travado como nós, com AS 24:**
  `calculo de ferias` pos. 54, `calculo salario liquido` 58, `calculo decimo
  terceiro` 41, `cálculo rescisão` 26. **Autoridade de 2 → 24 não ganha a cabeça
  do cluster trabalhista** — o teto dele é KD ~25-30, o nosso é abaixo de 20.
  Detalhe no Diário de 22/09 (parte 9).
- **O alvo de menor KD que já apareceu neste projeto: uma página "férias + 13º"
  juntos.** O `ferias-13` do concorrente ocupa **posição 1-3** em ~18 keywords
  de **KD 11-24** (~350 visitas/mês), atendendo a intenção combinada que
  calculadora de item único não atende. Temos as duas peças e o líquido do F66.
- **A categoria Tempo estava subavaliada no backlog:** as keywords certas são
  `contador de dias` (165K), `calculadora de dias` (40,5K) e `dias uteis`
  (18,1K, **KD 4-21**), não as que ficaram registradas em julho (110-170/mês).
- **Semrush de 21/09: +76 domínios referentes (122 → 198) e +104 backlinks, e o
  Authority Score continua 2.** Quarta fonte confirmando que os domínios que ele
  conta são scraper. **O AS é grosso demais para medir os links do F15** — a
  medida é posição no BWT. Keywords 201 → 240 com **1 visita/mês**: o Google
  descobre mais e continua em 50-100.
- **A IA do Google é zero, e isso fecha a tese dos dois índices.** Semrush: AI
  Visibility 0, **0 no AI Overview, 0 no AI Mode, 0 no Gemini**, 1 página citada
  (ChatGPT) — enquanto o Clarity mede 994 citações no ecossistema Microsoft.
  Não é contradição: são superfícies diferentes. **AI Overviews: 0% das
  aparições.** Detalhe no Diário de 22/09 (parte 7).
- **Cauda média é o alvo do Google, não a cabeça:** `calculo hora extra online`
  pos. 54 (KD 18, 390/mês), `calculo décimo` 57 (KD 20, 480), `calcular meu
  decimo` 52 (KD 24). `simulador cdb` (pos. 47) segue sendo **a única keyword
  com tráfego do site**.
- **Fora da fila (Paulo, 22/09):** Vínculos regressivos do BWT e `description` do
  `exception` no GA4. **Não pedir a cada rodada.** *(O Authority Score saiu
  dessa lista: ele mandou o Semrush na mesma sessão.)*
- **BWT por página (08→20/09): o Bing põe o site na página 1 em tudo, com
  posição média ~7.** IRRF 507 impressões @ 7,0, rescisão 401 @ 7,3 (11 dos 39
  cliques), INSS 353 @ 7,9, férias 292 @ 8,1. No Google as mesmas páginas estão
  em 75-91. Detalhe no Diário de 22/09 (parte 4).
- **"IA" e "Bing" não são dois públicos, são o mesmo índice (Microsoft).** Os 4
  temas do topo do Bing são os 4 da IA, com o mesmo vocabulário com ano, e o
  relatório de consultas do BWT traz **prompt do Copilot** misturado com busca.
  A divisão real é Microsoft × Google. **Isso corrige 14/09:** o conteúdo
  trabalhista não foi desperdiçado. Rescisão é a página com mais cliques no
  Bing e os posts do F60 estão em 5,5-5,7 lá (zero no Google).
- **Base do Bing para medir os links, pela posição:** rescisão **7,29** (link 3,
  base limpa) e 13º **8,39** (link 4; a impressão do 13º vai subir sozinha com a
  sazonalidade). **O Bing é 99,4% desktop.**
- **Candidato mais barato da rodada: férias.** É a 4ª página do Bing e o tema de
  IA com o menor SoA (14,5%), e o maior prompt do relatório é "quanto receberia
  no próximo mês pós férias". O `ferias.mdx` não trata disso. Não abri feature.
- **Export de 22/09: a posição do Google "foi de 61 para 25" na semana, e não é
  ranking.** **Confirmado pelo comparativo de 7 dias:** `margem-lucro` (21 →
  170) e `porcentagem` (15 → 101), em posição ~10 e sem clique, são **69%** das
  impressões de 13→19/09 (eram 15%). Sem elas o resto está em 65,8 (era 72,9).
  **Rescisão caiu 49% e 13º 37% em impressão**, com a posição igual: sumiu a
  cauda de 78-100. **Zero clique no Google nas duas semanas.** Detalhe no
  Diário de 22/09 (partes 3 e 5).
- **Na mesma semana, os canais que já funcionavam cresceram:** Bing **+48% de
  impressão por dia útil** (275 contra 186, 24 cliques em 5 dias), citações de
  IA **+59%** (625 → 994, SoA 21,5%) e ChatGPT **3,5x** em sessões no GA4 (8 →
  28). **Férias entrou no vocabulário da IA** (`cálculo de férias 2026`, 75
  citações) com o menor SoA dos temas grandes (14,5%).
- **Duas correções de leitura:** "Leads qualificados = 0" no GA4 conta
  `qualify_lead` e vai ser sempre 0. **O F45 funciona, e o número certo é
  "Eventos principais" (235).** E o Bing tem padrão de dia útil (~235
  impressões/dia) contra fim de semana (~51); o "12/09 parcial" de 14/09 era
  sábado.
- **Export de 14/09 — o CSV solto na raiz da `gsc/` não era do Search Console,
  era do Bing Webmaster Tools.** Data `08/09/2026 00:00:00` e decimal com
  vírgula, sem coluna de posição — o GSC usa ISO e ponto. Descoberto porque as
  duas fontes cobrem os **mesmos 5 dias** e discordam por 5,7x.
- **Primeira medição lado a lado dos dois buscadores, 4 dias completos: Bing 743
  impressões e 15 cliques (CTR 2,0%); Google 130 impressões e ZERO cliques.**
  A ressalva de 10/09 ("é 1 dia e 9 linhas") caiu. O Bing não é o outro
  buscador; é **o** buscador deste site.
- **A suspeita de pipeline de 08/09 estava errada e está fechada.** O hub do F58
  está em `apps/web/src/app/sitemap.ts:67`, está no `sitemap.xml` de produção
  (39 URLs, com os 5 posts), e o `indexnow.mjs:42` monta a lista lendo esse
  mesmo sitemap. **Hub e posts são submetidos — o que falta é autoridade, não
  rota.** Não gastar rodada nisso de novo.
- **O desalinhamento que reordena o roadmap: o site tem dois públicos.** `irrf`
  (224 citações de IA em 7 dias) e `inss` (223) fazem **71% das citações** e
  somam **31 impressões no Google em 3 meses**. O vocabulário da IA tem ano e é
  fiscal (`calculo inss`, `calculadora irrf 2026`); o do GSC é trabalhista sem
  ano. *(22/09: o BWT mostrou que o público da IA é o mesmo do Bing, e que no
  Bing o trabalhista também rende. Ver parte 4.)*
- **Mas o Semrush corrigiu a conclusão fácil: não é pivô, são dois jogos.**
  `inss` tem **ZERO keyword no top 100**, e `irpf`+`irrf` somam 10,3K/mês contra
  **78,6K** do cluster trabalhista. GEO já funciona **sem posição no Google** (é
  só continuar alimentando); o Google está travado no cluster certo, com KD
  baixo (16-28) e posição 84-100 — **falta autoridade, não conteúdo** (F15, AS 2).
- **Links 3 e 4 do F15 decididos em 14/09 (Paulo compra conforme conseguir os
  placements; nada mais muda até lá).** **Link 3: `rescisao-trabalhista`** —
  maior cluster sem link (34.290/mês, 54 kws) e centro do grafo interno (hub
  F58 + 4 posts F60 + guia F22 apontam para lá), âncora "calcular rescisão do
  contrato de trabalho" (KD 17). **Link 4: `decimo-terceiro` de novo**, âncora
  "cálculo 13 proporcional" (KD 16) — segundo link na mesma página **de
  propósito**, porque com um link por página não dá para separar "link não
  funciona" de "um link não basta", e é essa dúvida que trava o orçamento do
  F15. Detalhe e descartes em "Plano de backlink", parte 7.
- **Veículos encomendados (14/09): `msnoticias.com.br`** (jornal regional do MS,
  mesmo perfil do `acritica`) → rescisão, e **`mercadohoje.uai.com.br`**
  (editoria de finanças do portal UAI, **Diários Associados**) → 13º, que
  tematicamente é o melhor placement dos quatro. **Risco específico do nº 4: o
  `mercadohoje` tem blocos "Publicidade" e nenhuma política visível de rotulagem
  de patrocinado — se a matéria cair em slot publieditorial, o link pode vir
  com `sponsored`/`nofollow`.** Conferir `rel` no HTML bruto é a primeira coisa
  a fazer quando publicar.
- **O link 4 publicou em 15/09 e o risco não se confirmou: veio dofollow, sem
  `rel` nenhum, em matéria editorial.** Âncora exata do plano ("cálculo 13
  proporcional"), 3º parágrafo do corpo, página indexável e no
  `sitemap-news.xml`, destino 200 — e **é o único link externo editorial da
  matéria** (os outros 8 externos são do próprio grupo Diários Associados).
  Ressalva: é subdomínio do UAI, não o domínio raiz. **Placar: 3 backlinks
  reais**; falta o `msnoticias` → rescisão. Detalhe no Diário de 15/09.
- **O link 3 publicou em 21/09, mas no `jornaldebrasilia.com.br` e não no
  `msnoticias`.** Destino e âncora são os do plano, é dofollow, é o único link
  externo do corpo e a matéria (demissão por acordo, simulando as três
  modalidades) é o melhor encaixe temático dos quatro. **Ressalva séria: saiu na
  `/brasil-7/`, um balde de conteúdo pago** (972 posts, "10 melhores…", post em
  inglês, e cada vizinho com um link comercial). No Google pode ser
  neutralizado; no Bing deve contar. Os sitemaps do jornal estão congelados
  desde 18/03, então a descoberta também é risco. **Placar: 4 placements
  publicados.** **O `msnoticias` não vem** (Paulo, 22/09): o Jornal de Brasília
  o substituiu, e **o plano de 14/09 fecha em 4 links**. Regra
  nova no checklist: **olhar a seção e os vizinhos, não só a página.** Detalhe
  no Diário de 22/09 (parte 1).
- **O dado que motivou essa escolha: os 2 primeiros links não moveram
  posição.** `salario-liquido` 54,8 → 69,4; `decimo-terceiro` 76,6 → 86,5 (com
  impressões de 87 → 277). Medir o efeito dos próximos **no BWT, não no GSC** —
  o Bing responde em semanas e é quem manda tráfego. **Paulo encomendou os dois
  em 14/09.**
- **Correção de método (14/09): `GSC → Links` não é detector confiável de
  ausência.** O `acritica.com` não aparece lá 33 dias depois, e o critério de
  20/08 mandava concluir "o link não conta". **Fui verificar a matéria: ela está
  no ar (200), o link continua lá com a âncora exata, sem `nofollow`, sem
  `noindex`, sem `X-Robots-Tag`, self-canonical, e `/economia/` não é bloqueado
  no `robots.txt`.** O placement está perfeito — o clássico "editam a matéria e
  tiram o link depois do pagamento" **não aconteceu**. Só a verificação do HTML
  bruto decide se um link conta; o GSC amostra e atrasa. **E o BWT confirmou na
  hora: "Vínculos regressivos" lista `acritica.com` E `band.com.br`.** Caso
  encerrado — o link conta, quem falhou foi o relatório do Google.
- **O BWT é o placar correto de backlink deste projeto.** Semrush diz 122
  domínios, GSC diz 1, **BWT diz 2 — exatamente os dois placements editoriais
  reais**. Terceira fonte independente confirmando a hipótese de 09/08 de que os
  122 do Semrush são scraper/agregador. **O site tinha 2 backlinks reais; os
  dois encomendados em 14/09 dobram isso, de 2 para 4** — o nº 4
  (`mercadohoje`) publicou em 15/09 e já está validado, então o placar hoje é
  **3, a caminho de 4**. *(22/09: o 4º publicou no `jornaldebrasilia`, com a
  ressalva da seção paga.)*
- **A leitura desconfortável do mesmo dado: os MESMOS 2 links convivem com
  posição 4-9 no Bing e 85-95 no Google.** O que difere não é o link, é o
  limiar de confiança de cada buscador. **O risco dos links 3 e 4 não é "vão
  contar" (vão) — é "4 ainda ser longe demais do limiar do Google".** Se não
  moverem nada enquanto o Bing segue em 4-9, a decisão vira de ordem de
  grandeza: ou o orçamento sobe muito, ou o Google sai do plano e o projeto se
  organiza em torno de Bing + IA, onde já ganha.
- **Tríplice validação de que o canal Google não existe:** GSC 2 cliques/3 meses,
  GA4 0 sessão/28 dias, Semrush **1 visita/mês** sobre 130.160 buscas
  endereçadas. Mediana de posição 84; 2 keywords de 201 em top 50.
- **Único alvo de Google ganhável, com o produto já pronto: `calculo irrf
  aluguel 2026`** — KD **12** (o menor de 201), pos. 65, 140/mês. O F54 já trata
  aluguel com RIR/2018 art. 42, e `#origemRendimento` é o campo mais clicado da
  página (22,7%) — mas `tituloLongo` e `palavrasChave` não mencionam aluguel
  (`calculators.ts:270-278`). Falta endereçamento, não trabalho. **Ressalva:
  140/mês é a mais ganhável, não a mais valiosa.**
- **A página mais usada do site é invisível no Google.** O hub do F58 empata com
  a home em sessões no Clarity e é a de maior interação (45 cliques em 7
  pageviews), com **0 impressão no GSC**.
- **Correção barata achada no heatmap: ~45% dos cliques nos cards de resultado
  do hub erram o alvo** (4 caem no `LI`, 5 no `SUMMARY`), e o Clarity acusa
  "Clique inativo" em 17,86% das sessões. O gatilho do `<details>` tem de ser o
  cabeçalho inteiro do card.
- **`porcentagem` e `margem-lucro`: questão fechada por três fontes.** 497
  impressões em página 1 (pos. 9,1 e 11,4) e zero clique; e `porcentagem` tem
  **zero keyword no Semrush** — nem ele rastreia aquelas buscas. Não investir.
- **Performance sai da lista de suspeitos:** score 90, LCP 1,572s, INP 182ms,
  CLS 0,00025, zero erro de JS.
- **Cuidado com os números do Clarity desta janela: 16 das 28 sessões são bot.**
  Serve como fonte qualitativa (heatmap, Share of Authority), não de volume.
- **F64 (13/09) — o motor estava calculando 2025: tabela do INSS de 2025
  rotulada como 2026, e nem o redutor da Lei 15.270/2025 nem o desconto
  simplificado de R$ 607,20 existiam no código.** Consequência publicada: 13º de
  R$ 5.000 saía com R$ 334,85 de IRRF, onde a lei de 2026 cobra **zero** — na
  página que carrega o único backlink do cluster do 13º, a seis semanas do pico.
  9 calculadoras mudaram de resultado; 11 MDX e 5 posts regerados pelo motor.
- **A regra, em uma linha:** deduções legais **ou** R$ 607,20 (o que for maior)
  → tabela progressiva → redutor sobre o **rendimento bruto**, limitado ao
  imposto apurado. O redutor máximo (R$ 312,89) foi calibrado sobre o
  simplificado: implementar um sem o outro deixa R$ 23,78 de imposto num 13º de
  R$ 5.000 e desmente a manchete da própria página.
- **Como conferir a fórmula do redutor sem depender de fonte secundária:** em
  R$ 5.000 ela devolve exatamente o redutor máximo e em R$ 7.350 exatamente
  zero. Os dois extremos só fecham se a entrada for o bruto — foi assim que a
  dúvida "bruto ou base após INSS?" ficou respondida, e é o que os testes travam.
- **Os 5 exemplos oficiais da Receita ("Exemplos de Aplicação da Lei
  15.270/2025") são teste no repo.** Ressalva ao ler aquela página: ela usa a
  tabela do **INSS de 2025** (foi publicada em dez/2025), então o INSS dos
  exemplos não bate com o de 2026 — o que o teste trava é a ordem do cálculo.
- **Expectativa alinhada com o Paulo, que perguntou se isso traz acesso:** o
  F64 é **defesa, não aquisição**. Onde há tese de tráfego é **GEO** — em set/2026
  quase todo conteúdo de 13º publicado ainda está na regra de 2025, e o site já
  recebe ~17 usuários/mês de IA. Ter a única página com o número certo e a norma
  nomeada é o que vira fonte citada.
- **Link para norma oficial só entra verificado.** As duas URLs do `gov.br`
  responderam 200 e entraram nas páginas; as leis do Planalto ficaram nomeadas
  **sem hyperlink** (o domínio não respondeu do ambiente de trabalho). Numa
  página de cálculo, link quebrado para a lei é pior que lei sem link.
- **O primeiro dia de Bing Webmaster Tools (10/09) já vale mais que o export
  trimestral do GSC: 3 cliques em 1 dia, contra 3 cliques em 3 meses no
  Google.** E as posições são de outro planeta — 4,0 em `calculo de rescisão
  trabalhista online gratis`, 6,0 em `calculos de rescisão de trabalho gratis`,
  9,0 em `calculadora de férias 2026`, com CTR de 50%, 33% e 12,5%. **O site
  não tem problema de CTR; tem problema de posição no Google.** Toda leitura
  feita a partir do GSC sobre "CTR ~0%" descrevia o Google, não o produto.
- **Primeiro alvo acionável saído do BWT: `calculadora irrf 2026` — 12
  impressões (a maior do dia), posição 6,67 e ZERO clique.** É a única query
  de topo sem clique, e o `irrf` já é a página nº 1 em citação por IA (F55).
  Título e descrição na SERP do Bing são o próximo experimento barato.
- **Ressalva de método sobre esse print: é 1 dia e 9 linhas.** Tem ruído óbvio
  (`gorditas near me`, `galaxy s22 plus to buy`) e não dá base para nenhuma
  decisão de investimento. O que ele já autoriza é **parar de tratar o GSC como
  o termômetro do projeto**.
- **F63 (10/09) — `aposentadoria` na rescisão era um apelido de "sem justa
  causa" e afirmava R$ 11.310,64 onde o correto na saída a pedido é
  R$ 2.692,91.** A premissa (aposentar-se encerra o contrato) foi derrubada
  pelo STF (ADI 1.721/1.770) e pela **OJ 361 da SDI-1 do TST**. Corrigido, com
  o cenário de dispensa preservado como linha `neutro` fora da soma.
- **A confusão que provavelmente gerou o bug, e que vale guardar: aposentadoria
  libera o SAQUE do FGTS (art. 20, III), não a MULTA de 40%.** Sacar o que já é
  seu e receber a multa do empregador são coisas diferentes.
- **As três pendências de painel que travavam o ciclo foram fechadas pelo Paulo
  em 10/09:** `calculator_calculated` marcado como evento principal no GA4
  (F45, aberto desde 27/08), **site verificado no Bing Webmaster Tools** (o
  furo de método de 08/09) e AdSense agora em **"Preparando" com `ads.txt`
  "Autorizado"** — posse confirmada, site em revisão.
- **Nenhum dos três dá dado retroativo.** O GA4 só conta evento principal a
  partir da marcação, o BWT não traz histórico e a revisão do AdSense tem
  prazo próprio. **O próximo export só vale a partir do fim de setembro** — até
  lá, ler os três é gastar rodada à toa.
- **Achado de fora do repositório, no painel do AdSense: `recibofacil.com.br`
  está "Pronto" com `ads.txt` "Não encontrado".** É exatamente a divergência
  que o `adsense.spec.ts` daqui trava (F19) — site aprovado sem `ads.txt`
  válido. Correção de 5 minutos no repo irmão.
- **F62 (10/09) — a suspeita sobre os 286 `exception` estava certa na captura e
  errada na atribuição.** O `capture: true` de fato recolhe erro de recurso,
  mas esse caminho sempre mandou `fatal: false`; **quem marcava fatal era o
  `unhandledrejection`**. Eram duas misturas independentes. Vale como regra:
  antes de caçar a causa no painel, conferir quem chama o quê — a atribuição
  estava a duas linhas de distância no código.
- **Regra que sai do F62: `fatal` do GA4 quer dizer "a pessoa perdeu a
  página", não "o erro é grave".** Só error boundary sabe disso. E falha de
  carregamento de recurso não é exceção — virou evento `resource_error`
  próprio, porque o suspeito nº 1 é adblock derrubando Clarity e gtag, que não
  é erro do site.
- **F61 (08/09) tinha subido sem registro e foi documentado em 10/09** — o
  commit `b61fec7` misturou a cauda do F60 com feature nova, e por isso **F61
  divide a versão 0.31.0 com o F60**. Fica como lembrete do porquê da regra de
  um commit por feature.
- **Bug do F61 que vale para qualquer projeto brasileiro em Vercel:
  `new Date().toISOString()` é UTC.** A partir das 21h de Brasília o site
  exibia a data de **amanhã** no rótulo "Tabelas:" — flagrado às 22h de 08/09
  no FGTS mostrando `2026-09-09`. `hojeISO()` (`en-CA` + `America/Sao_Paulo`)
  em 11 módulos do core. Data em rótulo de confiança é justamente onde o erro
  não aparece como erro.
- **Export de 08/09 analisado. O diagnóstico central não mudou e ficou mais
  duro: `google / organic` entregou ZERO sessão em 28 dias**, contra 109 do
  Bing. 2.562 impressões e 3 cliques no GSC, **95,7% delas em posição pior que
  60**. Nada de on-page move isso; a alavanca é autoridade (F15).
- **Furo de método achado em 08/09, e é o item nº 1 da próxima rodada: o ciclo
  "avalie a pasta gsc" lê o console do buscador que manda zero tráfego.** O
  **Bing Webmaster Tools não existe em lugar nenhum do repositório** — só o
  IndexNow, que fala com o Bing mas não escuta. O Bing é ~60% dos usuários, o
  BWT é grátis e não tem a média de 90 dias que trava a leitura do GSC.
  Verificar e exportar para `gsc/` é setup de uma tarde.
- **Achado que inverte uma leitura óbvia: `porcentagem` (pos. 9,0) e
  `margem-lucro` (pos. 11,0) somam 509 impressões em página 1 e ZERO cliques** —
  e as queries delas somam 12 impressões no relatório; o resto está no bucket
  anonimizado. São perguntas aritméticas únicas que o Google responde na própria
  SERP com a calculadora dele. **As duas melhores posições do site são as duas
  páginas menos valiosas — não investir mais nelas.**
- **F56 teve a primeira medição e funcionou: mobile foi de 7,7% para 16,3%** dos
  usuários. A correção de viewport destravou metade do público que o site tinha
  e não atendia.
- **F45 continua pendente e já custou duas rodadas.** "Leads qualificados: 0" com
  242 `calculator_calculated` coletados. Cinco minutos de painel, e é o que
  bloqueia o F17 — agora mais caro de adiar, porque a conta do AdSense existe.
- **286 `exception` para 323 `page_view`** (quase um por pageview, marcados
  `fatal: true`). Suspeita: `ErrorLogger.tsx` usa `capture: true` e captura erro
  de **carregamento de recurso** junto. **Paulo ficou de mandar o breakdown por
  `description` — pendência aberta desde 20/08.**
- **F19 pela metade (08/09): conta do AdSense verificada, exibição desligada.**
  **O Publisher ID é constante em `lib/seo.ts`, não env** — mesmo motivo da
  chave do IndexNow: público por design, e o `ads.txt` é estático, então env
  criaria duas fontes de verdade com falha silenciosa.
  `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` agora só **liga a exibição**. Falta o Paulo
  clicar em "Verificar" no painel **depois do deploy**, decidir onde o `AdSlot`
  entra, e reescrever o gate (pendente desde 20/08).
- **F60 entregue (08/09) — 4 posts do cluster 13º/rescisão.** Saíram do próprio
  export: `rescisao-trabalhista` +93% e `decimo-terceiro` +84% de impressão, as
  duas em posição ~86-92. Custaram o que o F22 prometeu: 4 entradas em
  `lib/blog.ts` + 4 `.mdx`.
- **Campo `ctaHub` novo no blog:** post de intenção agregada manda o CTA para o
  hub do F58, não para uma calculadora. `postsDoHub()` é a metade recíproca —
  sem ela o post nasceria órfão (F43).
- **Terceira confirmação do padrão do F58: quando uma página junta cálculos que
  já se contêm, a soma é o bug.** O guia agregado abre com os R$ 36.681,33 da
  soma ingênua contra os R$ 15.558,57 reais. É a conta errada que o leitor faz
  sozinho e que nenhum concorrente desfaz — virou diferencial de conteúdo.
- **Achado no motor que NÃO foi corrigido e precisa de decisão:** na rescisão,
  `aposentadoria` devolve resultado **idêntico a `sem_justa_causa`** (40% de
  multa, aviso integral). Certo para rescisão indireta, contestado para
  aposentadoria. Omiti a modalidade das tabelas dos posts em vez de publicar
  afirmação que não se sustenta.
- **Conferir em 3-4 semanas:** o post do 13º proporcional e o guia de 30/08
  podem estar competindo pela mesma query. Se estiverem, encurtar a seção do
  antigo e apontar para o novo.
- **F59 entregue (01/09) — abrir cálculo salvo/compartilhado cai direto no
  resultado, com botão "Editar cálculo".** Ideia do Paulo; o que acrescentei foi
  **foco, não só scroll**. Vale como regra geral: **navegação programática é
  scroll + foco** — `scrollIntoView` sozinho move a tela e deixa o cursor de
  teclado/leitor de tela parado no topo. Alvos `tabIndex={-1}` +
  `focus({ preventScroll: true })`.
- **Limite que protege o SEO no F59: só com `?d=`/`?calc=` na URL.** Visita
  normal continua abrindo no H1 — direcionar sempre ao resultado desfaria na
  prática o conteúdo do F47 e a escultura de link do F43.
- **Pergunta em aberto do F59, a responder com dado:** o botão "Editar cálculo"
  deveria aparecer em toda abertura com resultado, ou só na de cálculo pronto?
  Hoje é só na de cálculo pronto, e o evento `calculator_edited` foi criado
  para medir. **Depende do F45** (key events no GA4) para aparecer no painel.
- **Achado colateral do F59, que nada no código avisa:** `calorias` mede altura
  em **centímetros** (100–250) e `imc` mede em **metros**. Duas calculadoras da
  mesma categoria com unidades diferentes — quem escrever fixture ou conteúdo
  para elas precisa saber.
- **F58 entregue (01/09) — o hub trabalhista, e com ele o último item de P1 que
  não dependia de decisão do Paulo.** `/calculadora-trabalhista-completa`:
  7 campos, quatro blocos (rescisão, 13º, férias, FGTS), encadeamento em
  `calcularPanoramaTrabalhista` no core (19 testes Vitest). **O que sobra no
  backlog implementável agora depende do próximo export** — F56, F22 e F58
  subiram em quatro dias e nenhum teve tempo de dar sinal.
- **Padrão que sai do F58, reaproveitável em qualquer agregação: quando uma
  página junta cálculos que já se contêm, a soma é o bug.** A rescisão já embute
  13º proporcional, férias proporcionais e multa do FGTS — somar os quatro
  blocos dá **R$ 36.681,33** contra os **R$ 15.558,57** reais (salário R$ 3.000,
  5 anos), mais que o dobro. Três defesas: não existe "total geral"; o
  consolidado sai **inteiro como `neutro`** (a UI só desenha sinal em
  crédito/débito, então neutro é o que impede a lista de parecer soma); e o
  aviso fica **acima** dos números, com teste comparando `boundingBox().y`.
- **Segunda soma indevida do F58, mais sutil: o saldo do FGTS informado já
  contém os depósitos do contrato.** Passá-lo como `saldoAtual` na projeção
  somaria os mesmos 8% duas vezes — a projeção roda com `saldoAtual: 0` e usa a
  outra metade da conta (quanto *deveria* ter sido depositado) para comparar com
  o extrato. Virou recurso: sinaliza depósito faltando.
- **Regra de escopo do F58: o hub tem de custar MENOS preenchimento que abrir
  quatro calculadoras.** Por isso os campos são exatamente os da rescisão e
  `diasFaltas`/`diasAbono` ficaram de fora, mesmo com o motor aceitando os dois.
- **Lição de teste do F58: teste de link interno precisa excluir o rodapé.**
  Assim que o rodapé passou a linkar o hub em 100% das páginas, "a página X
  linka o hub" virou verdade em toda parte. A correção é recortar o escopo
  (`getByRole('main')`), não afrouxar a asserção.
- **O plano de tráfego de 27/08 está numerado no [`FEATURES.md`](FEATURES.md)
  como F43-F56** (Blocos A-D), a pedido do Paulo. **Blocos A, B e C entregues
  no mesmo dia (F43-F55 + F57, `v0.26.0`)**, e o **F56 (mobile) em 29/08
  (`v0.27.0`)** e o **F22 (blog) em 30/08 (`v0.28.0`)**. Do Bloco D sobram
  **F15 (backlinks) e F19 (gate do AdSense)**, os dois decisão do Paulo.
- **F22 entregue (30/08) — o blog existe, com o guia do 13º publicado dentro da
  janela sazonal.** Infra completa no padrão das calculadoras, então **o
  próximo post custa uma entrada em `lib/blog.ts` e um `.mdx`** — rota, SEO,
  schema, og-image, sitemap e links recíprocos saem de graça. O gancho do
  artigo é de calendário: **20/12/2026 cai num domingo**, então a 2ª parcela
  antecipa para 18/12. Números todos gerados pelo core, 9 travados em e2e.
- **Padrão que sai do F22: quando um teste fica obsoleto porque a premissa
  mudou, procurar a invariante que ele protegia.** O teste do F44 travava "o
  rodapé não linka `/blog`" (rota inexistente na época); virou **"nenhum link
  do rodapé pode responder diferente de 200"**, que pega o próximo link morto.
- **F56 entregue (29/08) — e ele derrubou a própria hipótese.** O item existia
  porque o Google rankeia o site **16 posições melhor no celular** (765 impr.,
  pos. 54,6) e mesmo assim dá 0 clique; a suspeita registrada era performance.
  **Lighthouse mobile deu 94, LCP 2,9 s — não era.** O real: **9 das 20 páginas
  rolavam na horizontal**, porque `mdx-components.tsx` mora na raiz de
  `apps/web` e estava **fora dos globs de `content` do Tailwind** — nenhuma
  classe dele era gerada, e o `overflow-x-auto` das tabelas do F47 era classe
  morta. **Classe morta do Tailwind falha em silêncio:** sem erro de build, com
  o `class=` visível no DevTools e a regra inexistente no CSS.
- **Lição de teste que sai do F56: teste de conteúdo não é teste de layout.** As
  tabelas do F47 tinham `tabelas-referencia.spec.ts` conferindo os números e
  passaram meses quebradas no celular. Agora há `viewport-mobile.mobile.spec.ts`
  travando "cabe na viewport" e "campo ≥ 16px" nas 20 calculadoras.
- **Regra nova para campo de formulário: 16px no celular, sempre.** O Safari no
  iOS dá zoom automático abaixo disso, e **iOS é 27 dos 50 usuários mobile**. O
  padrão da casa passou a ser `text-base md:text-sm`.
- **Bloco C entregue (27/08) — e ele corrigiu uma conclusão anterior.** O F38
  (20/08) apostou em "simulador/simulação" pelo volume do Semrush, e as
  citações de IA do tesouro triplicaram em 7 dias. **Mas nas variações de
  "calculadora de investimento em tesouro direto"** — "simulação" não aparece
  uma única vez na lista do Clarity. **O F38 funcionou; a hipótese sobre por
  que funcionou é que estava errada**, e a explicação mais provável é que ele
  reescreveu title/H1/MDX inteiros e aumentou a recuperabilidade geral da
  página, não o casamento com a palavra específica. O F53 aplicou o vocabulário
  medido em 7 calculadoras.
- **Método novo registrado no `README.md` (F52): o painel de SoA do Clarity é
  etapa fixa do ciclo "avalie a pasta gsc".** É a única fonte de keyword
  research com ciclo de 7 dias. O procedimento separa o achado em dois
  destinos: **vocabulário** (a página faz, só não chama assim → tratamento do
  F38/F53) e **lacuna de produto** (a página não faz → feature, como o IRRF
  sobre aluguel do F54, que saiu de 4 citações medidas).
- **Bloco B entregue (27/08) — e o achado que reordena a leitura de conteúdo:
  o gargalo não é profundidade, é granularidade.** Os MDX já tinham 800-2.205
  palavras, 7-13 H2 e artigo de lei citado; isso é competitivo. O que faltava
  era o que o concorrente publica e a calculadora escondia atrás do formulário:
  **8 tabelas de referência numéricas** (F47) e **14 exemplos resolvidos com
  números fechados** (F49) nas 5 páginas de maior impressão. Todos os números
  saíram de execuções do próprio core, não de conta à mão — se uma regra mudar,
  o e2e quebra em vez de a tabela divergir da calculadora em silêncio.
- **Dois bugs reais achados pelo caminho do Bloco B.** (1) **A hora extra
  noturna cobrava 1,50× enquanto o MDX da própria página afirmava 1,80×** — o
  adicional noturno de 20% do art. 73 nunca foi aplicado no motor, e o conteúdo
  é que estava certo. Corrigido no F48 (mesmo padrão do F39/F40: divergência
  entre conteúdo e motor, e o conteúdo ganhou). (2) **Data inexistente passava
  silenciosamente** — `31/02` virava 03/03 via `new Date`; o campo mascarado do
  F51 valida contra o calendário e o Zod reprova.
- **Fix de precisão das férias (F57, `v0.23.1`) — corrigido no mesmo dia, a
  pedido do Paulo.** `calcularFerias` arredondava o valor diário antes de
  multiplicar pelos dias, então **R$ 2.000 de salário rendia R$ 2.000,10 de
  férias**. Não era padrão da casa: `decimo-terceiro.ts` e `rescisao.ts` sempre
  arredondaram no fim. **A lição de método vale mais que o bug:** a suíte tinha
  17 testes de férias e nenhum pegou, porque **todos usavam salário divisível
  por 30**. Ao escolher número de teste, escolher o que expõe a operação, não o
  que sai redondo.
- **Invariante registrada no F57: o detalhamento exibido tem de somar o total
  exibido.** É por isso que os três componentes das férias (gozados, terço,
  abono) seguem arredondados um a um, e não saem de um arredondamento único no
  fim — o usuário vê as linhas e vê o total. A consequência é **um centavo** de
  diferença entre vender e não vender dias, que é correto e agora está
  explicitado em teste. Vale para qualquer calculadora nova.
- **Bloco A entregue (27/08).** A inversão de link interno acabou:
  `financiamento` foi de **1 para 6** links internos recebidos, `fgts` de 2
  para 6, `hora-extra` de 2 para 5, enquanto `juros-compostos` caiu de 8 para
  4 e `salario-liquido` de 7 para 3. O rodapé deixou de listar as 20
  calculadoras em toda página (8 destaques + categorias + hub `/categorias`), e
  os MDX ganharam **20 links contextuais onde havia exatamente zero**. Os
  redirects do F44 fecharam `/site` e o prefixo de ano, e o `Footer` parou de
  linkar **`/blog`** — rota inexistente servida em 100% das páginas, achada ao
  ler o código, não nos dados. **Duas pendências de painel/fora do repo:** o
  F45 exige marcar `calculator_calculated` como *key event* no GA4 (o evento já
  é disparado certo). **O secret `INTERNAL_API_KEY` do F46 foi criado pelo
  Paulo em 30/08 — essa pendência está fechada e o workflow de IndexNow está
  armado.** Procedimento dos dois na §Operação do `README.md`.
- **Ao ler o próximo export, lembrar que o marco do F43 é 27/08.** O que deve
  mover primeiro é a posição de `financiamento` (hoje **298 impressões, pos.
  81,8**) — é a página que mais ganhou link interno. `fgts` (207, pos. 90,0) e
  `hora-extra` (240, pos. 84,7) são os outros dois. Se em 4-6 semanas nenhuma
  das três mexer, a hipótese de que PageRank interno compensa AS 2 está errada
  e o peso volta todo para backlink (F15).
- **Export de 27/08 (ver [diário
  2026-08-27](#2026-08-27--export-novo-gscga4clarity-comparação-com-concorrentes-e-plano-de-tráfego)).**
  **4º clique do Google em 25/08** — o intervalo entre cliques caiu de 59 dias
  (11/06→09/08) para **16 dias** (09/08→25/08). A posição segue em **platô de
  4 semanas em ~59** (W32 59,7 · W33 59,9 · W34 58,4 · W35 58,8), e a W34 real
  foi **58,4**, não 62,5 — aquele número era de 2 dias parciais. **Mas as
  impressões caíram**: pico de ~41/dia em W27-W29 (julho) para **~23/dia** em
  W32-W35. O Google está mostrando menos e melhor.
- **Primeiro efeito medido do F38 — e veio pelo Copilot, não pelo Google.** As
  citações de IA do `tesouro-direto` no Clarity saltaram **15 → 47 em 7 dias
  (3,1×)**, e o total do site foi 256 → **295**. **`AI referral traffic` saiu de
  0 e virou 0,83%** — a primeira vez que citação virou clique. Ressalva de
  método: as queries citadas são variações de **"calculadora de investimento
  (em) tesouro direto"** (47 citações somadas), **não** "simulação tesouro
  direto" — o vocabulário que o F38 mirou não é o que puxou. O ganho é real,
  a atribuição é parcial.
- **O canal com evidência de crescimento é IA/Bing, e o ciclo de medição dele é
  de 7 dias, não de 3 meses.** O Google segue em **4 sessões desde janeiro**
  contra **462 do Bing** (115:1, dado de vida inteira do GA4). Toda ação de
  GEO/IndexNow é validável em uma semana; toda ação de SEO do Google leva um
  trimestre. Isso deveria pesar na ordem do backlog.
- **Achado novo: o mobile está sendo servido melhor que o desktop e não
  converte nada.** GSC: 765 impressões no celular em **posição 54,6** contra
  1.413 no desktop em **posição 71** — e **0 cliques no celular**. No GA4 o
  mobile é **50 de 648 usuários (7,7%)**, porque o tráfego real vem do Bing no
  Windows (Edge 61%). É a única fatia do funil em que o Google já rankeia
  melhor e o site não colhe nada. Nunca foi investigada.
- **404s em produção com tráfego real.** O Clarity (3 dias, 25 sessões) lista
  **`/site` com 4 sessões (16%)** e `/2026/calculadora/cdb` com 1 — nenhuma
  das duas rotas existe no `app/`, e não há `redirects` no `next.config.ts`.
  Origem externa (link errado de terceiro ou de diretório). **E um terceiro,
  pior, achado ao ler o código: o `Footer.tsx` linka `/blog` em TODAS as
  páginas do site, e essa rota nunca existiu** — 404 interno que o Google
  segue em 100% das páginas. Custo de correção: duas regras de redirect + um
  link do rodapé.
- **Regressão de INP.** Clarity: score 92 → **84**, INP 140ms → **248ms**
  (acima do limiar de 200ms do Google), LCP melhorou (0,98s → **0,408s**), CLS
  0,003, **0 erros de JS** de novo. Amostra pequena (25 sessões), mas o F41/F42
  entrou em produção exatamente entre as duas medições — vale conferir antes de
  assumir ruído.
- **Escultura de link interno continua NÃO implementada** e a inversão está
  medida de novo, agora pior: `financiamento` é a maior página do site
  (**298 impressões**) e tem **1** link interno; `juros-compostos` (3
  impressões) tem **8**; `hora-extra` (240) e `fgts` (207) têm **2**. Segue
  sendo o item de maior confiança e menor custo do backlog.
- **Concorrência (verificada na SERP em 27/08): o gargalo de conteúdo não é
  profundidade, é granularidade de intenção.** Os MDX do site têm 800-2.200
  palavras e cobertura legal boa. Quem rankeia tem o que o site não tem:
  **tabela numérica de referência** ("quanto vale sua hora extra por faixa de
  salário"), **exemplos nomeados com números fechados**, **variações de
  parâmetro que viram query** (hora extra 60%/70%/personalizado, DSR, minutos)
  e **intenção no slug** (`/simulador-tesouro-direto`, `/financiamento-
  imobiliario`) — o site tem "simulador" no title desde o F38, mas não na URL.
- **Export de 20/08 + Semrush (ver [diário
  2026-08-20](#2026-08-20--export-novo-gscga4claritysemrush-f38-f42-e-indexnow-no-ar)).**
  O **3º clique do Google saiu em 09/08**, quebrando a seca de 59 dias — mas a
  melhora de posição **parou**: W32 59,7 → W33 59,9 → W34 62,5, platô em ~60
  há três semanas. O degrau foi todo entre W30 e W32, janela do link da Band.
  Semrush: **AS continua 2**, e os domínios referentes subiram 122→140 em 10
  dias sem Paulo fazer nada — confirma que são scrapers. **GSC → Links mostra
  1 domínio só (band.com.br), com a âncora registrada**; a pendência de 09/08
  está encerrada. **`acritica.com` (link de 12/08) ainda não aparece — se não
  aparecer até meados de setembro, não está sendo contado.**
- **Achado grande: o site é forte no ecossistema Microsoft e invisível no do
  Google/OpenAI, em tudo ao mesmo tempo.** Clarity (que é da Microsoft) mostra
  **SoA 24%, 256 citações em 7 dias, com o `irrf` em 177 (69%)**; o Semrush,
  que mede ChatGPT/Gemini/AI Overview, mostra 0. Igual ao tráfego (Bing 158
  sessões, Google 1). Ao ler "SoA 24%", ler "24% no Copilot". E **AI referral =
  0**: citação não vira clique.
- **F38-F42 entregues (20/08).** Vocabulário "simulador" nas 5 financeiras
  (`simulação tesouro direto` = **2.9K buscas/mês**, a maior keyword do site,
  e a palavra não existia em nenhum title/H1/MDX); vocabulário de
  demissão/acerto na rescisão (pior posição do site, 93,7); as duas leituras
  do aviso prévio no acordo mútuo; identidade visual unificada; og-image por
  calculadora — que **fechou um 404 em produção desde o início**, quebrando o
  preview de todo link do F32 no WhatsApp.
- **IndexNow no ar (pendência desde 25/07).** 1 variável na Vercel
  (`INTERNAL_API_KEY`), chave pública virou constante no código. Primeira
  submissão em 20/08: **32 URLs, resposta 202**. Comando: `pnpm --filter web
  indexnow` — **manual, e sempre DEPOIS do deploy**. Ver §Operação do
  `README.md` (que estava vazio).
- **Próximo trabalho de código já decidido: escultura de link interno.** O GSC
  mostra 31 links internos idênticos para todas as páginas (o Footer lista as
  20 em todo lugar), e o `relacionadas` está invertido — `financiamento` (264
  impressões, a maior) tem **1** link, `juros-compostos` (3 impressões) tem
  **8**. Com AS 2, o PageRank interno é o único capital que o Paulo controla
  100%. Ver P0 abaixo.
- **Pendências de dado (Paulo ficou de mandar):** GA4 → `exception` por
  `description` (**334 eventos** contra 433 pageviews, hipótese de ruído do
  `ErrorLogger`), e GSC → performance por página antes/depois de 03/08 e 12/08.
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

**Acrescentado em 27/08 (ver diário) — Bloco A entregue no mesmo dia:**

- ~~**Redirects dos 404 com tráfego real.**~~ ✅ **F44, 27/08.** `/site` teve **4 das 25 sessões
  (16%)** do Clarity em 3 dias e `/2026/calculadora/cdb` teve 1 — nenhuma
  existe no `app/`, e o `next.config.ts` não tem bloco `redirects`. Origem é
  link externo errado. Custo: duas regras. **Item mais barato do backlog.**
- **Investigar o mobile.** GSC: **765 impressões no celular em posição 54,6**
  (contra 1.413 no desktop em 71) e **0 cliques**; GA4 mostra mobile em 7,7%
  dos usuários. É a única parte do funil em que o Google já rankeia melhor e o
  site não colhe nada. Rodar Lighthouse mobile + GSC filtrado por dispositivo.
- **Lacunas de produto que a SERP dos concorrentes expõe** (ver diário, §6):
  `HoraExtraForm` sem adicional personalizado (60%/70%/livre), sem minutos e
  sem **DSR sobre horas extras**; nenhuma calculadora publica **tabela
  numérica de referência** (faixa de entrada × resultado), que é como os
  concorrentes capturam a cauda longa sem página nova.
- **Painel de SoA do Clarity como keyword research semanal.** Foi ele que
  mostrou que o vocabulário que gera citação de IA no tesouro é
  "**investimento**", não "simulador" (o que o F38 mirou) — e que existe
  demanda por **IRRF sobre aluguel**, que a calculadora não faz. Ciclo de
  medição de 7 dias, contra 90 dias do GSC.
- **Regressão de INP** (140ms → **248ms**, acima do limiar de 200ms) medida
  entre 20/08 e 27/08, exatamente a janela do deploy F41/F42. Amostra pequena
  (25 sessões) — confirmar antes de tratar como bug.

**Acrescentado em 20/08 (ver diário):**

0. ~~**Escultura de link interno — próximo trabalho de código.**~~ ✅ **F43,
   entregue 27/08** (`financiamento` 1→6 links, `fgts` 2→6, `hora-extra` 2→5;
   rodapé reduzido a 8 destaques; 20 links contextuais novos nos MDX). Texto
   original mantido abaixo como registro do diagnóstico.
   **Escultura de link interno.** O GSC mostra
   **31 links internos idênticos** para todas as páginas, porque o `Footer.tsx`
   lista as 20 calculadoras em todo lugar: quando tudo linka tudo, nenhum link
   interno significa nada. E o único diferencial real (`relacionadas` do
   registry) está invertido — `financiamento` (264 impressões, a maior página)
   tem **1** link; `juros-compostos` (3 impressões, pos. 97,7) tem **8**;
   `porcentagem`, descartada como alvo em 09/08, tem 5; `fgts` e `hora-extra`,
   alvos do P0, têm 2. **Com AS 2 e 1 backlink reconhecido, o PageRank interno
   é o único capital de autoridade sob controle total.** Escopo: reordenar
   `relacionadas` para os alvos do P0 + `financiamento` + `tesouro-direto`,
   quebrar a planura do rodapé (destacar 6-8 e mandar o resto para
   `/categorias`) e acrescentar links contextuais dentro dos MDX.
1. **Configurar evento de conversão no GA4** (`calculator_calculated` como key
   event) — **F45: procedimento documentado em 27/08 na §Operação do
   `README.md`, mas o clique no painel do GA4 é do Paulo e ainda não foi
   dado.** O evento já é disparado corretamente pelo código. **Bloqueia o F17** — Google Ads sem conversão configurada é dinheiro
   jogado fora — e é o motivo de "Leads qualificados 0" desde janeiro.
2. **Investigar os 334 `exception` do GA4** (0,77 por pageview). Hipótese: o
   `ErrorLogger.tsx` escuta `error` em fase de captura e conta falha de
   carregamento de recurso como exceção de JS. Depende do breakdown por
   `description` que o Paulo ficou de mandar.

Racional original (25/07), mantido:

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
6. **Sprint 1.6 — AdSense** — **gate a rever (20/08).** Era "esperar tráfego
   do Google"; passaram 3 meses e o Google entregou **1 sessão em 28 dias**,
   enquanto há 207 usuários/mês reais e LCP de 0,98s. Trocar o gate para "N
   usuários/mês de qualquer canal", senão a espera é indefinida.
7. ~~**IndexNow — disparo manual e fácil de esquecer**~~ — ✅ **automatizado
   27/08 (F46).** `.github/workflows/indexnow.yml` escuta `deployment_status` e
   submete o sitemap quando o deploy de **produção** volta `success`. Falta o
   Paulo criar o secret `INTERNAL_API_KEY` no GitHub (mesmo valor da Vercel),
   senão o job roda e falha. Histórico do conserto original abaixo.
7. ~~**IndexNow quebrado em produção**~~ — ✅ **resolvido 20/08.** A chave é
   pública por design (o protocolo exige `/<chave>.txt` legível), então virou
   constante no código em vez de env var — restou **uma** variável
   (`INTERNAL_API_KEY`), configurada na Vercel. 1ª submissão: 32 URLs, 202.
   `pnpm --filter web indexnow`, manual e sempre **depois** do deploy. Vale
   mais que qualquer ação no GSC aqui: o Bing é ~95% do tráfego real.

### P1 — próximas 2-3 semanas

**Acrescentado em 20/08 (ver diário):**
- ~~**Campos de data com máscara + atalhos**~~ ✅ **F51, 27/08** — e o escopo
  real era menor: só a rescisão tem campo de data (férias e 13º trabalham com
  meses e dias). Diagnóstico original abaixo.
  **Campos de data com máscara + atalhos** na rescisão, férias e 13º. Maior
  atrito medido do site: **11 dos 24 cliques** da `rescisao-trabalhista` no
  Clarity foram nos dois campos de data. `input[type=date]` nativo é ruim no
  Edge/Windows, que é 65% do público. É o F34 aplicado ao tipo de campo que
  ficou de fora.
- ~~**Chips de valor rápido nos campos que viraram stepper no F35.**~~ ✅
  **F50, 27/08** — a terceira janela (`cdb`, 48% dos cliques da página num
  campo só) encerrou a dúvida de sinal fraco. Diagnóstico original abaixo.
  **Chips de valor rápido nos campos que viraram stepper no F35.** O
  `quickAdd` do F12 existe, mas 69 de 105 cliques em `ferias` foram nos +/− —
  padrão que se repetiu em duas janelas independentes, agora com tráfego
  orgânico. Sinal fraco (poucos pageviews), custo baixo.
- ~~**Hub "Calculadora Trabalhista Completa".**~~ ✅ **F58, 01/09** — rota
  `/calculadora-trabalhista-completa`, encadeamento no core, e as duas somas
  indevidas fechadas com teste (ver diário). Diagnóstico original abaixo.
  **Hub "Calculadora Trabalhista Completa".** Dezenas de queries de intenção
  agregada (`calculo trabalhista completo`, `como calcular direitos
  trabalhistas`) que nenhuma das 10 calculadoras trabalhistas atende — cada
  uma responde um pedaço. A `/categoria/trabalhista` existe e teve **1
  pageview**. Fluxo único encadeando rescisão + férias + 13º + FGTS.
- ~~**GEO do IRRF.**~~ ✅ **F55, 27/08** — schema `Dataset` (não `Table`) em
  `irrf`, `inss`, `irpf` e `das-mei`, com `temporalCoverage` aberto e
  `dateModified` real. **A ressalva de 20/08 ficou mais fraca, não caiu:** o AI
  referral saiu de 0 para 0,83%, e `Dataset` não gera rich result no Google
  (só aparece no Dataset Search). Diagnóstico original abaixo.
  **GEO do IRRF.** Única página com tração real de IA (177 citações em 7 dias,
  69% do total do site). Marcar a tabela IRRF 2026 com schema `Table`/`Dataset`
  e data de atualização explícita. Ressalva honesta: **AI referral = 0**, então
  isso constrói autoridade no Copilot, não cliques — decidir se vale.
- **Despriorizar formalmente o F20 (PWA/Android).** Retenção de coorte
  62→3→2→1, e 58→0 na semana de 02-08/08. O F37 já testou a hipótese de
  usuário recorrente e deu 3 usos em 6 dias contra 385 cálculos.

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

### 2026-09-22 (parte 11) — F67 entregue e F68-F70 cadastradas: o roadmap saiu do trabalhista

Paulo mandou cadastrar as features novas e implementar o F67. Feito.

**F67 — vocabulário da cauda média (entregue).** É o molde do F38/F39/F53, mas
o que muda é a qualidade do alvo: **três medições independentes apontando para
a mesma faixa**. O nosso Semrush põe `calculo hora extra online` em 54 (KD 18)
e `calcular hora extra online` em 58 (KD 25); o `calculadora.com.br`, com AS
14, está em **pos. 5** na segunda — e é a **única página trabalhista que
rankeia para ele**; e o GSC mostra `calculadora de horas extras`,
`calculadora hora extra noturna` e `calculo exato horas extras` com impressão
em 77-95. No 13º, o padrão é a **forma curta**: `calcular meu decimo` (52) e
`calculo décimo` (57) omitem o "terceiro" — e **toda a copy do site escrevia
"décimo terceiro"**.

Entregue: `tituloLongo` da hora extra virou "Calculadora de Hora Extra
**Online**", 7 sinônimos medidos no registry dela e 5 no 13º, e — porque a
lição do F38 é que `keywords` no `<head>` não ranqueia nada desde 2009 — **o
vocabulário entrou na copy**: parágrafo de abertura e três perguntas novas na
FAQ da hora extra, mais "Como calcular meu décimo?" no 13º. A resposta da
noturna documenta o campo do F48 que quase ninguém entende (hora de relógio do
cartão de ponto × hora já convertida do holerite). Achei e corrigi um inglês
vazado na copy: "com o adicional **due**".

**F68, F69 e F70 cadastradas no backlog do P0.** A ordem reflete o que as
partes 9 e 10 mostraram:

1. **F68 — calculadora de datas.** A maior aposta, e a primeira feature sem
   legislação para manter. Dois concorrentes tiram a maior parte do tráfego
   disso, com KD 16-25 na cauda e uma única página rankeando para 49 keywords.
2. **F69 — página "férias + 13º".** O menor KD já visto neste projeto (11-24),
   com janela sazonal out-dez, e já temos todas as peças (F58, F64, F66).
3. **F70 — cliques mortos.** A mais barata, e melhora o tráfego que já existe.

**A mudança de fundo, que vale registrar como decisão:** até hoje o roadmap
inteiro era trabalhista/fiscal, e as três medições de 22/09 mostram que **essa
é a vizinhança errada para um site de AS 2** — três sites independentes,
inclusive dois com 7x e 12x a nossa autoridade, ficam em 26-58 na cabeça desse
cluster. **O que vem depois do F67 sai do cluster**: datas (F68) não tem
concorrente grande, não tem lei para acompanhar e tem KD de um dígito em parte
da cauda; e a única exceção trabalhista que continua na fila (F69) é a
intenção combinada, que ninguém cobre.

### 2026-09-22 (parte 10) — `calculadora.com.br`: autoridade parecida com a nossa, 21.700x o nosso tráfego, e duas páginas de datas explicam 66% disso

Paulo mandou o terceiro Semrush: **`calculadora.com.br`** (21/09, BR, desktop),
Domain Overview + 100 keywords. **Dados colados na conversa; números brutos
aqui.** É o mais revelador dos três, e por um motivo específico: **o perfil de
link dele é da nossa ordem de grandeza.**

| Métrica | `calculosonline` | `calculadora.com.br` | `calculaonline` |
|---|---|---|---|
| Authority Score | 2 | **14** | 24 |
| Domínios referentes | 198 | **247** | 621 |
| Backlinks | 324 | **653** | 4.100 |
| Keywords orgânicas | 240 | **2.800** | 7.500 |
| Tráfego orgânico/mês | **1** | **21.700** | 13.900 |
| AI Visibility | 0 | 16 | 15 |

**1. O número que derruba a explicação fácil.** Ele tem **1,25x os nossos
domínios referentes e 2x os nossos backlinks** — e **21.700 visitas contra 1**.
Ele até tem mais tráfego que o `calculaonline`, que tem 6x mais backlinks. **A
diferença entre nós e ele não é tamanho de perfil de link; é o que cada um
escolheu rankear.** (Ressalva que não muda a conclusão: os 198 domínios nossos
são scraper, por isso o AS 2 contra 14 — mas 12 pontos de AS não explicam
21.700x.)

**2. Duas páginas de datas fazem 66% do tráfego dele.**

| Página | Tráfego (amostra) | % | Keywords | Melhor |
|---|---|---|---|---|
| `/data/operacao-datas` | 8.227 | **44,4%** | **49** | `calculadora de datas` pos. 4 (33,1K, KD 37) |
| HOME | 5.668 | 30,6% | 6 | `calculadora` pos. 28 (**6,1M**, KD 61) |
| `/data/diferenca-datas` | 4.054 | **21,9%** | **37** | `diferença entre datas` **pos. 1** (4,4K, KD 16) |
| `/data/dia-semana` | 396 | 2,1% | 3 | `que dia da semana` pos. 8 |
| `/trabalhista/*` (3 páginas) | 171 | **0,9%** | 5 | — |

**Uma única página rankeia para 49 keywords.** É o oposto das nossas 20
calculadoras de propósito único: `operacao-datas` é uma ferramenta flexível
(somar, subtrair, contar) e a cauda inteira de sinônimos cai nela —
`calculadora de datas`, `contador de datas`, `somar dias`, `calcular datas`,
`calculo de datas`, `contagem de datas`, `soma dias`, `contar datas`... quase
todas em **posição 3-5**, com KD 25-40.

**3. E o trabalhista dele é 0,9% do tráfego, com as mesmas posições ruins de
todo mundo:** `calculo de ferias` pos. **36**, `calculadora salario liquido`
**37**, `calculo salario liquido` **48**. **Terceiro site independente na mesma
faixa.** A cabeça do cluster trabalhista não é ganhável nem com AS 14, nem com
24 — está decidido por três medições, não por opinião.

**4. A exceção que valida o F67 (hora extra) com número de terceiro:** ele está
em **posição 5** em `calcular hora extra online` (720/mês, KD 25) e **10** em
`calculador hora extra` (1,3K, KD 24) — **com AS 14**. Nós estamos em **58** e
**54** nessas mesmas buscas (parte 7). **Hora extra é ganhável na faixa de
autoridade de um site pequeno**, e é a única página trabalhista dele que
rankeia. Sobe a confiança no F67.

**5. A categoria Tempo deixa de ser candidata e vira a principal aposta de
expansão.** Dois sites independentes tiram a maior parte do tráfego de datas.
Os números que interessam (volume/KD): `contador de dias` 165K/35,
`calculadora de dias` 40,5K/39, `calculadora de datas` 33,1K/37,
`contador de datas` 9,9K/33, `calculadora entre datas` 8,1K/34,
**`diferença entre datas` 4,4K/16**, `somar dias` 3,6K/25,
`dias entre datas` 3,6K/21, `diferença de datas` 880/22,
`diferença entre duas datas` 170/**12**. A lista registrada em julho
(`diferenca-entre-datas` "110/mês") estava medindo a keyword errada — o volume
real do mesmo produto é **duas ordens de grandeza maior**.

**Por que essa categoria é diferente de tudo que já tentamos aqui:**
- **KD 16-25 existe de verdade** na cauda, que é a faixa que o AS 2 alcança —
  contra KD 30-40 do trabalhista, onde três sites empacam.
- **Não tem legislação para manter.** Data é aritmética: zero tabela anual,
  zero risco de o motor "calcular 2025" como no F64.
- **Uma página cobre dezenas de keywords**, se a copy carregar os sinônimos —
  exatamente a disciplina que o F38/F39/F53 já aplicaram no vocabulário.
- **Serve os dois índices.** O painel de SoA do Clarity já mostrou pergunta de
  data em linguagem natural ("se o dia 20 cai no domingo em que dia eu tenho
  que receber meu vale"), e o BWT trouxe prompts do mesmo tipo.

**Ressalva antes de empolgar:** os dois concorrentes têm domínio de casamento
exato (`calculadora`, 6,1M; `calcula online`), que sozinho explica 20-30% do
tráfego deles e **não é replicável**. O que é replicável é a escolha de tema e
o formato de página única com cauda ampla.

### 2026-09-22 (parte 9) — `calculaonline.com.br`: 72% do tráfego dele é uma keyword, e no NOSSO tema ele está tão travado quanto nós

Paulo mandou o Semrush de **`calculaonline.com.br`** (nome quase idêntico ao
nosso) e pediu a comparação: Domain Overview + 194 keywords em dois CSVs.
**Dados colados na conversa, então os números ficam aqui.** Mesma janela
(21/09, BR, desktop) do nosso da parte 7.

| Métrica | `calculosonline` | `calculaonline` |
|---|---|---|
| Authority Score | **2** | **24** |
| Domínios referentes | 198 | **621** |
| Backlinks | 324 | **4.100** |
| Keywords orgânicas | 240 | **7.500** |
| Tráfego orgânico/mês | **1** | **13.900** |
| AI Visibility | 0 | **15** |
| Páginas citadas por IA | 1 (só ChatGPT) | **28** (ChatGPT 18, AI Overview 9, AI Mode 7, Gemini 7) |

**1. O número que explica quase tudo: 72% do tráfego dele vem de UMA keyword.**
`calculadora online` — 368.000 buscas/mês, KD 67, **posição 8**, na home —
rende **8.800 das 12.735 visitas** da amostra. O domínio dele é casamento
quase exato com a busca (`calcula online`). **Isso não é replicável para nós**:
a keyword tem KD 67, a posição 8 dele já é o teto de quem não é Google/Microsoft
naquela SERP, e o nosso domínio casa com "cálculos online", que é outra ordem de
grandeza de volume. **Comparar o total de tráfego dos dois sites é comparar uma
sorte de domínio, não duas estratégias.**

**2. O achado que mais muda a nossa cabeça: no NOSSO tema, ele está tão travado
quanto nós — com 12x mais autoridade.**

| Keyword | Volume | KD | Posição dele |
|---|---|---|---|
| `calculo salario liquido` | 90.5K | 35 | **58** |
| `calculo de ferias` | 74K | 33 | **54** |
| `calculo decimo terceiro` | 40.5K | 32 | **41** |
| `calculadora de salario liquido` | 33.1K | 28 | **47** |
| `cálculo rescisão` | 14.8K | 35 | **26** |
| `calculadora trabalhista` | 8.1K | 15 | **28** |

**AS 24, 621 domínios referentes e 4.100 backlinks não colocam ninguém na
página 1 dessas buscas.** A leitura de 14/09 ("falta autoridade") estava certa
no diagnóstico e errada na dose: **não é autoridade de 2 para 24, é muito mais
que isso** — essas SERPs são de portal grande. Reforça, com número de terceiro,
a decisão A da parte 6: **parar de perseguir a cabeça do cluster trabalhista**.

**3. Onde ele ganha de verdade (tirando a home):**

| Página | Tráfego | Melhor posição | KD |
|---|---|---|---|
| `hp-12c` (emulador da HP 12C) | 903 | 6 | 22-24 |
| `juros-boletos` (juros e multa de boleto) | 797 | **2** | 24 |
| `dias-entre-datas` | 762 | 10 | 21 |
| `ferias-13` (férias **e** 13º juntos) | 348 | **1** | 13-16 |
| `dias-uteis` | 143 | 17 | **4-21** |
| `recibo-aluguel` (gerador) | 86 | **3** | 11 |
| `nota-promissoria` (gerador) | 85 | 5 | 13 |
| `prescricao` | 68 | **2** | 11 |
| `cheque-especial` | 56 | **1** | 15 |

**O padrão, medido:** o KD mediano das keywords dele em top 10 é **24**; o das
que estão em 25+ é **33,5**. Com AS 24, o teto fica em KD ~25-30. **Com AS 2,
o nosso teto é mais baixo ainda — KD abaixo de 20.** É exatamente a faixa da
cauda média que a parte 7 apontou (`calculo hora extra online`, KD 18).

**4. A oportunidade que está na nossa mão hoje: a página "férias + 13º".** O
`ferias-13` dele é **uma página que junta os dois cálculos** e ocupa a posição
**1-3** numa família de ~18 keywords de **KD 11-24**: `calcular decimo terceiro
e ferias` (390/mês, KD 15, **pos. 1**), `calculo de 13 e ferias` (110, KD 13,
pos. 1), `calculadora de 13 e ferias` (90, KD 11, pos. 1), `calculo ferias e
decimo terceiro` (110, KD 28, pos. 2). São ~350 visitas/mês de uma intenção que
**nenhuma calculadora de item único atende**: "vou tirar férias e receber o 13º,
quanto dá no total". Nós temos as duas calculadoras, o hub do F58 (que junta
quatro e mira "rescisão") e agora o líquido das férias (F66) — **falta a página
da combinação**. É o alvo de menor KD que já apareceu em qualquer análise deste
projeto.

**5. Correção do backlog: a categoria Tempo estava subavaliada.** A lista de
candidatos registrada em julho escolheu as keywords erradas —
`diferenca-entre-datas` (110/mês), `dia-da-semana` (170), `idade` (40). O que o
concorrente mostra é **`contador de dias` (165K), `calculadora de dias`
(40.5K), `dias entre datas` (3.6K) e `dias uteis` (18.1K, KD 4-21)**. É o mesmo
produto com outro nome — e KD de um dígito em parte da cauda. **Se a Fase 2 for
retomada, é por aqui, não por mais calculadora trabalhista.**

**6. E os geradores.** `recibo-aluguel` (pos. 3, KD 11) e `nota-promissoria`
(pos. 5, KD 13) são **documentos, não cálculos** — e rankeiam fácil. É o
território do projeto irmão [Recibo Fácil](../recibofacil/MEMORY.md); vale
cruzar as duas análises antes de decidir quem ataca o quê.

**7. IA: o nicho é citado no Google, e quem não está somos nós.** Ele tem
presença em **AI Overview (5 menções, 9 páginas citadas), AI Mode (5/7) e
Gemini (2/7)**; nós temos zero nas três e 1 página no ChatGPT. Some-se a isso
que 100% das nossas citações medidas vêm do ecossistema Microsoft (parte 7):
**a ausência nas superfícies de IA do Google é nossa, não do nicho.**

**Ressalva de método:** tudo acima é estimativa do Semrush para **Google BR
desktop**. Ele não mede Bing, que é de onde vem o nosso tráfego real — os 223
usuários/mês do GA4 não aparecem em lugar nenhum dessa comparação. O que a
comparação mede é o canal Google, e nele a diferença é real.

### 2026-09-22 (parte 8) — F66: a calculadora de férias passa a responder a pergunta que ela dizia responder

Paulo subiu o F65 e pediu a sequência; propus três features e ele escolheu o
F66 — descontos de INSS e IRRF nas férias. **É a correção nº 7 da parte 6
resolvida no lugar certo:** de manhã eu tinha ajustado o texto para parar de
prometer o que a ferramenta não fazia; agora a ferramenta faz, e a promessa
voltou.

**O argumento, em uma linha:** `ferias` é a 4ª página do site no Bing e o 3º
tema em citação de IA, e **"quanto vou receber de férias" é pergunta de
líquido** — o sinônimo já estava declarado no registry desde o F53.

**Por que não deu para reaproveitar o `calcularSalarioLiquido`.** O recibo de
férias tem três regras que o contracheque não tem, e são elas que o motor
passou a aplicar:

1. **O IRRF é calculado em separado** do salário do mês, sobre a própria
   remuneração de férias. Não é o mesmo que jogar tudo numa base só.
2. **O abono pecuniário fica fora da base** de INSS e IRRF (Lei 8.212/1991,
   art. 28, §9º).
3. **A dobra do art. 137 também fica** — ela indeniza o atraso na concessão,
   não remunera trabalho. **É o ponto em que sistemas de folha divergem**, e
   por isso saiu declarado em `avisos` em vez de virar número silencioso.

**A decisão de escopo que segurou o raio de impacto: o hub do F58 continua em
bruto.** Ele usa `dados.totalBruto` e a legenda sempre disse "valor bruto" —
ali as férias são **projeção de um período futuro**, tributável na competência
em que for gozado, não um recibo a pagar agora. Mexer nisso teria quebrado os
números publicados do post agregado do F60 e as travas do hub, sem ganhar
precisão. Ficou comentado no `panorama.ts` para a próxima pessoa não "consertar".

**O caso que virou argumento editorial, e que só apareceu porque o cálculo
ficou completo:** R$ 5.100 vendendo 10 dias dá **o mesmo bruto** de quem goza
os 30 (R$ 6.800) — mas **R$ 6.363,82 líquidos contra R$ 5.365,67**. São
**R$ 998,15 a mais só pela isenção do abono**, antes ainda dos 10 dias
trabalhados que continuam na folha. O texto antigo dizia que vender dava "o
mesmo total"; dá quase mil reais a mais, e agora a página mostra por quê.

**O que o conteúdo ganhou** (tudo regerado pelo motor): tabela de referência
com INSS, IRRF e líquido nas 8 faixas; exemplos nomeados fechando no líquido;
duas perguntas novas na FAQ — "as férias têm desconto?" e "por que o desconto
não bate com o do meu contracheque?", que é exatamente a dúvida do F65.

**E o e2e achou um erro que estava em todas as calculadoras com faixa de
INSS.** Ao ler o detalhamento renderizado, o rótulo saía **"Até R$ 1621.00"** —
ponto decimal e sem separador de milhar, num site em pt-BR. Era `toFixed(2)` em
`tabelas/index.ts:246`, e aparecia no salário líquido, na rescisão, no 13º, no
INSS e agora nas férias. Passou a usar `formatarBRL`. **Nenhum teste pegava
isso porque nenhum lia o rótulo da faixa** — o novo lê.

**Trava de teste:** 8 casos novos no core (o arquivo foi de 21 para 29) e
`ferias-liquido.spec.ts` no e2e. **A invariante do F57 teve de ser reescrita:**
agora são dois totais na lista, então o teste verifica que os créditos acima do
"Total Bruto" somam o bruto e que o bruto menos os débitos fecha o "Total
Líquido". Era a parte mais fácil de quebrar em silêncio.

### 2026-09-22 (parte 7) — Semrush: 76 domínios referentes novos não moveram o Authority Score, e a IA do Google é zero

Paulo mandou quatro telas do Semrush (Domain Overview e Positions, BR/desktop,
dado de 21/09) — o Authority Score era um dos três pedidos que ele tinha tirado
da fila, e veio assim mesmo. **Telas coladas na conversa, números brutos aqui.**

| Métrica | 09/08 | 20/08 | 14/09 | **21/09** |
|---|---|---|---|---|
| Authority Score | 2 | 2 | 2 | **2** |
| Domínios referentes | 122 | — | — | **198** |
| Backlinks | 220 | 247 | — | **324** |
| Keywords orgânicas | — | — | 201 | **240 (+26%)** |
| Tráfego orgânico estimado | — | — | 1 | **1** |
| Melhor posição | — | — | 46 | **47** |

**1. O achado que fecha a discussão do placar de backlink: +76 domínios
referentes e +104 backlinks em seis semanas, e o AS não subiu um ponto.** É a
quarta fonte dizendo a mesma coisa — os domínios que o Semrush conta são
scraper e agregador, e não valem autoridade nenhuma. **E a leitura dura:** se 76
domínios não movem o AS, os 2 links pagos publicados não vão mover também. O AS
não é o instrumento para medir os links do F15; ele é grosso demais. **A medida
continua sendo posição no BWT** (base na parte 4). Ressalva honesta: o
`mercadohoje` tem 6 dias e o `jornaldebrasilia` tem 1 — cedo para qualquer um
deles aparecer aqui.

**2. As keywords crescem e o tráfego não sai de 1 visita/mês.** 201 → 240
keywords (+26%) com **US$ 0,00 de traffic cost** e 1 visita. A série mensal de
keywords mostra o salto em jun→jul (de ~70 para ~210) e depois um platô. É o
mesmo fenômeno do GSC lido pelo outro lado: **o Google descobre o site para
cada vez mais buscas e o mantém em posição 50-100.** Descoberta não é o
problema; posição é.

**3. A tela de IA do Semrush parece contradizer o Clarity, e não contradiz —
ela separa os dois mundos.** Semrush: AI Visibility **0**, Mentions **0**,
**1 cited page** (ChatGPT), e **0 no AI Overview, 0 no AI Mode, 0 no Gemini**.
Clarity: 994 citações em 7 dias, SoA 21,5%. Não são medidas concorrentes: o
Clarity mede citação real no ecossistema **Microsoft** (Copilot/Bing), e o
Semrush cobre justamente as superfícies de IA **do Google**, onde o site é
zero. **É a confirmação mais direta da tese da parte 4:** o site existe no
índice da Microsoft e não existe no do Google — nem na busca, nem na IA dele.
A distribuição de SERP confirma: **AI Overviews 0%** das aparições.

**4. O que o Semrush diz sobre onde o Google ainda é atacável.** As 6 melhores
posições do domínio:

| Keyword | Pos | Volume | KD | Página |
|---|---|---|---|---|
| `simulador cdb` | **47** | 4.4K | 53 | `cdb` |
| `calcular meu decimo` | 52 | 110 | 24 | `decimo-terceiro` |
| `calculo hora extra online` | 54 | 390 | 18 | `hora-extra` |
| `calculo décimo` | 57 | 480 | 20 | `decimo-terceiro` |
| `calcular hora extra online` | 58 | 720 | 25 | `hora-extra` |
| `calcular cdb prefixado` | 59 | 110 | 28 | `cdb` |

**`simulador cdb` segue sendo a única keyword com tráfego do site inteiro** (1
visita, 100% do total), e é a de maior KD da lista — chegou lá sem link, o que
sugere SERP fraca, não autoridade. **O ajuste fino que isso traz para a
estratégia da parte 6:** dentro do cluster trabalhista, o alvo não é a cabeça em
85-95, é a **cauda média em 52-58** — `calculo hora extra online` (KD 18),
`calculo décimo` (KD 20), `calcular meu decimo` (KD 24). São as únicas que já
estão a uma página de distância, e `hora-extra` tem volume (390-720/mês) com o
menor KD do conjunto. O resto do movimento (B, C, D) fica de pé sem mudança.

### 2026-09-22 (parte 6) — F65: o post que a pergunta do Copilot pediu, 7 erros de conteúdo e a estratégia do lado do Google

Paulo mandou fazer a página sugerida na parte 4, registrar como feature,
corrigir todos os erros encontrados e responder o que fazer do lado do Google.
**E tirou da fila os três pedidos pendentes** (Vínculos regressivos do BWT,
`description` do `exception` no GA4 e Authority Score do Semrush): não vai
conseguir agora. **Não pedir de novo a cada rodada** — voltam quando ele
trouxer, e a checagem dos links no BWT é a única que tem data (parte 1).

**1. O F65 saiu do dado, não de intuição.** A maior pergunta em linguagem
natural do relatório do BWT era *"vou tirar 10 dias de férias somente, quanto
receberia no proximo mês pós ferias"* (17 impressões, posição 6,8), e a página
de férias — 4ª do site no Bing, 3º tema da IA, menor SoA dos grandes (14,5%) —
não tinha **uma linha** sobre isso. O post
`/blog/salario-depois-das-ferias-por-que-vem-menor` responde exatamente essa
pergunta: os dias de férias saem da folha porque já foram pagos adiantados no
recibo (CLT art. 145 contra art. 459, §1º), então o contracheque seguinte vem
menor — mas a soma dos dois pagamentos é **maior** que um mês normal, por causa
do terço.

**Os números que ficam** (salário R$ 3.000, sem dependentes, motor):

| Dias | Recibo antes | Contracheque depois | Soma | Mês normal |
|---|---|---|---|---|
| 10 | R$ 1.233,33 | R$ 1.811,40 | R$ 3.044,73 | R$ 2.751,40 |
| 30 | R$ 3.631,40 | R$ 0,00 | R$ 3.631,40 | R$ 2.751,40 |
| 20 + 10 vendidos | R$ 3.784,31 | R$ 887,09 | R$ 4.671,40 | R$ 2.751,40 |

**O achado que virou seção, e que nenhum concorrente tem:** em 2026 um salário
de R$ 4.000 **não paga IRRF**, mas 30 dias de férias desse mesmo salário pagam
**R$ 122,45** — o terço leva o recibo a R$ 5.333,33 e tira o valor da faixa em
que o redutor da Lei 15.270/2025 zera o imposto. Vendendo 10 dias, o imposto
volta a zero. É consequência direta do F64: só quem tem o motor de 2026 certo
enxerga isso.

**2. Sete erros de conteúdo achados na apuração — a página de férias era a pior
do site em direito.** Nenhum deles tinha teste, e nenhum apareceria numa
revisão de copy:

| # | Onde | Erro |
|---|---|---|
| 1-2 | `ferias.mdx` (texto e FAQ) | "acréscimo de 50%" por atraso no pagamento, citando a **Súmula 450 do TST**. A súmula falava em **dobro**, não em 50% — e **o STF a derrubou na ADPF 501** |
| 3 | `ferias.mdx` | "férias em dobro" citando o **art. 138 da CLT** (que trata de trabalhar para outro empregador durante as férias) e uma terceira hipótese inventada. Trocado por art. 137 + **Súmula 81 do TST** |
| 4 | `ferias.mdx` | férias do doméstico atribuídas à EC 72/2013; quem assegura é a **LC 150/2015, art. 17** |
| 5 | `ferias.mdx` | férias no aviso prévio justificadas pela **Súmula 261**, que trata de férias proporcionais no pedido de demissão |
| 6 | `ferias.mdx` | o exemplo da venda de 10 dias dizia render "o mesmo total" — ignora que os dias vendidos são **trabalhados** e continuam pagos na folha (R$ 1.700 no caso) |
| 7 | `calculators.ts`, meta description e `llms.txt` | a calculadora de férias prometia **"descontos de INSS e IRRF"**, e `calcularFerias` devolve **bruto** |
| + | `decimo-terceiro.mdx` | 13º do doméstico atribuído à EC 72/2013; vem da CF/88, art. 7º, parágrafo único |

**O nº 7 é o mais caro, e é de produto, não de texto.** A promessa estava nos
três lugares que alimentam Google e IA, e a ferramenta não cumpria. Corrigi o
texto — **mas a pergunta certa é a inversa: por que a calculadora de férias não
calcula o líquido?** "Quanto vou receber de férias" já é sinônimo declarado dela
no registry, e é exatamente o que o público do Bing/IA pergunta. **Candidato a
feature (não abri): descontos no `calcularFerias`.** O F65 já deixou o método
pronto (INSS sobre o mês inteiro, IRRF em separado).

**E um teste quebrado em silêncio desde o F64:** `blog.spec.ts` travava o
`dateModified` do post do 13º na data literal de 30/08, e o F64 moveu a
`dataAtualizacao` para 13/09. **Toda revisão legítima de conteúdo quebrava o
teste** — a asserção agora sai do registry. Lição: data literal em teste só
serve para `datePublished`, que não muda.

**3. A estratégia do lado do Google, que o Paulo perguntou.** O quadro, sem
rodeio: AS 2, 4 links, posição 85-95 no cluster trabalhista, KD 16-28, zero
clique em 3 meses e, na semana passada, impressão caindo (parte 5). **O Google
não é um canal que está quase lá; é um canal que não começou.** Quatro
movimentos, em ordem:

- **A. Parar de perseguir head term este ano.** `calculadora de férias`,
  `calculadora decimo terceiro` e afins têm KD 16-28 e volume alto, e o site
  está em 85-95 com AS 2. Não se ganha isso antes do pico de nov/dez, por mais
  conteúdo que se escreva. Conteúdo não é o gargalo — autoridade é, e está
  registrado desde 09/08.
- **A2. (parte 7) Dentro do cluster, mirar a cauda média, não a cabeça.** O
  Semrush de 21/09 mostra que o site já está em **52-58** em
  `calculo hora extra online` (KD 18), `calculo décimo` (KD 20) e
  `calcular meu decimo` (KD 24) — uma página de distância, contra as 8-9
  páginas da cabeça. `hora-extra` é a melhor combinação de volume e KD baixo
  que sobrou.
- **B. Ir onde autoridade pesa menos: pergunta longa e específica.** O próprio
  GSC mostra o site aparecendo (em 78-100, mas aparecendo) em
  `trabalhei 5 meses quanto vou receber de rescisão`,
  `trabalhei 8 meses quanto vou receber de acerto`,
  `como calcular rescisão sem justa causa`. São buscas de cauda, com pouca
  concorrência e intenção exata, e **o mesmo conteúdo serve aos dois índices** —
  é o molde do F65. Regra editorial que fica: **um post responde uma pergunta
  com número, não cobre um tema.**
- **C. Resolver o que talvez nem seja autoridade: o Google não testou as
  páginas novas.** O hub do F58 e os 4 posts do F60 seguem com **zero
  impressão**, 14 e 21 dias depois. Sitemap e IndexNow estão certos (fechado em
  14/09), mas **o IndexNow não fala com o Google**. O que falta é Inspeção de
  URL → "Solicitar indexação" no GSC, para o hub, os 5 posts e o F65 — cinco
  minutos de painel, e a única hipótese barata que ainda não foi testada. Se
  depois de indexadas elas continuarem em zero, aí é autoridade e está provado.
- **D. Checkpoint com data: ~27/10** (6 semanas do link 4, 5 semanas do link 3).
  Se `rescisao-trabalhista` e `decimo-terceiro` continuarem em 85-95 no Google
  enquanto o Bing segue em 7, aplicar a decisão de ordem de grandeza já
  registrada em 14/09: **parar de comprar link para o Google** e organizar o
  projeto em torno de Bing + IA, com o Google como subproduto do conteúdo.

**O que NÃO fazer, e por quê:**
- **Não comprar o link 5 antes do checkpoint.** Compraram-se 4 para responder
  "um link não basta?" — comprar mais antes de medir joga fora o teste.
- **Não investir em `porcentagem`/`margem-lucro`.** Fechado por três fontes, e
  a parte 5 mostrou que o crescimento delas é justamente o que não clica.
- **Google Ads (F17) não resolve isto.** Ads compra clique, não posição, e com
  AdSense como monetização é arbitragem de margem negativa. Só valeria como
  pesquisa de palavra-chave paga — que o Semrush já dá de graça aqui.

### 2026-09-22 (parte 5) — GSC 7 dias × 7 anteriores: a mistura se confirma, e o trabalhista encolheu no Google

Paulo mandou o comparativo que a parte 3 pediu (colado na conversa, fora da
pasta `gsc/`). **Janela: 13→19/09 contra 06→12/09.** Confere com a série diária
do export de 3 meses: 394 e 224 impressões. O relatório de páginas soma 394 e
233.

**1. A leitura de mistura estava certa, e o efeito é maior do que eu estimei.**
Na parte 3 o piso calculado era 54%; o número real é 69%:

| | Total | Pos. | `margem-lucro` + `porcentagem` | Resto | Pos. do resto |
|---|---|---|---|---|---|
| 06→12/09 | 233 | 63,0 | 36 (15%) | 197 | 72,9 |
| **13→19/09** | **394** | **27,6** | **271 (69%)** | 123 | **65,8** |

- **`margem-lucro` 21 → 170 (8x) @ 10,5** e **`porcentagem` 15 → 101 (6,7x)
  @ 9,9.** Zero clique nas duas.
- As consultas nomeadas de `margem-lucro` estão em 78-84 ("calcular valor
  baseado na margem de lucro", "porcentagem de lucro"). **Então o grosso das
  170 impressões em posição ~10 é consulta anonimizada**: o mesmo padrão de
  "aritmética única" que o 08/09 diagnosticou para `porcentagem`. **A
  `margem-lucro` entra na mesma gaveta, e a questão fechada em 14/09 continua
  fechada.**
- O celular foi de 63 para 190 impressões, com posição 41,6 → 14,2. É a mesma
  mistura, conta de cabeça feita no telefone.

**2. O que o pico escondia: o cluster trabalhista encolheu no Google.**

| Página | 06→12/09 | 13→19/09 | Pos. |
|---|---|---|---|
| `rescisao-trabalhista` | 83 | **42 (−49%)** | 91,4 → 86,1 |
| `decimo-terceiro` | 51 | **32 (−37%)** | 88,5 → 90,2 |

A posição não mudou. **O que sumiu foi a cauda mais funda:** a semana
anterior tinha dezenas de consultas de 1-3 impressões em 78-100 ("como calcular
rescisão trabalhista" @ 99,5, "calculo de rescisão contratual" @ 98, "calculadora
13" @ 99,7), e elas não aparecem na semana nova. **O Google testou menos o site
nessas buscas, não o rebaixou.** Com uma semana só, é flutuação até prova em
contrário. Mas é o contrário do que a sazonalidade do 13º deveria fazer, então
vale acompanhar.

**Link 4 (`mercadohoje`, 15/09):** o 13º foi de 88,5 para 90,2, com 5 dias de
link. **Sem efeito mensurável, como esperado.** A medida dele é o BWT (base
8,39, parte 4).

**3. Sinal descartado: o `salário líquido` em 18-20 da parte 3 não é recente.**
`salario-liquido` **não aparece em nenhuma das duas semanas**, então aquelas
impressões são de antes de 06/09. **Não acompanhar como tendência.**

**4. Resto, para a próxima comparação:** **zero clique nas duas semanas.**
`tesouro-direto` 6 → 10 @ 36, `cdb` 6 → 9 @ 53, `financiamento` 14 → 6 @ 41,
`hora-extra` 6 → 5 (96,7 → 56,6), `ferias` 2 → 5 @ 7,2, `inss` 0 → 3 @ 11,3,
`irpf` 3 → 3 (82 → 5) e `irrf` 3 → 1 @ 63. `calculo irrf aluguel 2026` segue lá
(1 @ 63; eram 2 @ 66,5). Nenhuma dessas passa de 10 impressões, então as
posições são ruído.

**Leitura:** o Google continua onde estava. **A única coisa que cresceu nele foi
tráfego sem valor** (aritmética em posição 10, que não clica), e o cluster em que
os links foram investidos perdeu impressão na semana. Nada disso muda o plano:
**a medida dos links é o BWT, pela posição**, e é lá que o site já está na
página 1.

### 2026-09-22 (parte 4) — BWT por consulta e página: o Bing põe o site na página 1, e "IA" e "Bing" são o mesmo público

Paulo colou os quatro relatórios do Bing Webmaster Tools que faltavam desde
08/09: consultas, páginas, países e dispositivos. **Vieram colados na conversa
e não estão na pasta `gsc/`**, então os números brutos ficam aqui. **Janela:
08→20/09 (13 dias).** Confirmado pela soma: países e dispositivos dão
**2.322 impressões e 43 cliques**, exatamente o total do overview diário da
parte 3. O relatório de páginas soma 1.879/39.

**1. Posição média ~7 em todas as páginas.** No Google as mesmas páginas estão
em 75-91. Por dia, porque as janelas são diferentes (Google 92 dias, Bing 13):

| Página | Bing impr (13d) | Cliq | Pos | Bing /dia | Google /dia | Google pos |
|---|---|---|---|---|---|---|
| `irrf` | **507** | 9 | 6,97 | **39,0** | 0,2 | 74,6 |
| `rescisao-trabalhista` | **401** | **11** | 7,29 | 30,8 | 4,0 | 91,4 |
| `inss` | **353** | 5 | 7,85 | 27,2 | 0,1 | 42,1 |
| `ferias` | **292** | 5 | 8,07 | 22,5 | 2,3 | 85,5 |
| `cdb` | 66 | 1 | 6,38 | 5,1 | 0,5 | 42,3 |
| `decimo-terceiro` | 51 | 0 | 8,39 | 3,9 | 3,3 | 86,9 |
| `poupanca` | 47 | 0 | 6,57 | 3,6 | 2,2 | 64,4 |
| `salario-liquido` | 39 | 2 | 7,33 | 3,0 | 0,8 | 69,0 |
| `emprestimo` | 33 | 2 | 8,76 | 2,5 | 0,2 | 25,4 |
| home | 26 | 0 | 8,58 | | | |
| blog `acerto-trabalhista…` (F60) | 23 | 1 | 5,48 | | 0 | — |
| blog `rescisao-por-acordo-mutuo…` (F60) | 20 | 1 | 5,70 | | 0 | — |
| `hora-extra` | 9 | 0 | 5,44 | 0,7 | 2,8 | 85,1 |
| `financiamento` | 4 | 0 | 7 | 0,3 | 3,9 | 78,4 |
| `margem-lucro` | 3 | 0 | 7,67 | 0,2 | 3,4 | 11,1 |
| blog `direitos-trabalhistas…` (F60) | 3 | 0 | 6 | | 0 | — |
| `tesouro-direto` | 1 | 0 | 7 | | | |
| `das-mei` | 1 | 2 | 1 | | | |

**As 4 primeiras fazem 83% das impressões do Bing.** CTR geral 1,85%.

**2. O achado que reescreve o "dois públicos" de 14/09: IA e Bing são o mesmo
público.** As 4 páginas do topo do Bing (IRRF, rescisão, INSS, férias) são os
mesmos temas que lideram as citações de IA da parte 3 (INSS 353, IRRF 311,
férias 112). O vocabulário também é o mesmo, com o ano no nome:
`calculadora inss`, `cálculo irrf 2026`, `calculadora de férias 2026`. **E o
relatório de consultas do BWT tem prompt de chat misturado com busca:**
- "vou tirar 10 dias de férias somente, quanto receberia no proximo mês pós
  ferias" (17 @ 6,8)
- "faça esse cálculo para um salário de 6200 sem dependentes" (3 @ 6,7)
- "fazer uma simulação de emprestimo de 140mil com pagamento de r$3mil
  mensais…" (4 @ 4,5)

Isso ninguém digita numa busca; é conversa com o Copilot. O painel de SoA do
Clarity também é da Microsoft. **A divisão real não é "IA × busca", é índice
da Microsoft (Bing + Copilot) × índice do Google.** O ChatGPT usa o Bing como
uma de suas fontes de busca, o que explicaria o 3,5x dele no GA4. É
provável, mas não medi.

**A correção que isso impõe a 14/09:** lá ficou registrado que o conteúdo
trabalhista dos últimos três meses (F22, F58, F60) foi investido no mercado do
Google, que entrega zero clique. **No Bing ele funciona:** `rescisao-trabalhista`
é a página com mais cliques do site (11 de 39, 28%), e **os posts do F60, com
zero impressão no Google, estão em 5,5-5,7 no Bing e já deram clique.** O post
do F22 (13º) não aparece no Bing.

**3. Fenômenos só do Google:** `porcentagem` (zero no Bing), `margem-lucro` (3),
`hora-extra` (9 contra 259) e `financiamento` (4 contra 356). No Google essas
páginas somam 1.323 impressões e 1 clique (o de `hora-extra`). O Bing
simplesmente não as mostra.

**4. Base do Bing para medir os links 3 e 4 (08→20/09):**

| Página | Impr | Cliq | Pos | Link |
|---|---|---|---|---|
| `rescisao-trabalhista` | 401 | 11 | **7,29** | nº 3 publicou em 21/09, depois da janela: **base limpa** |
| `decimo-terceiro` | 51 | 0 | **8,39** | nº 4 publicou em 15/09: 5 dos 13 dias já têm o link, cedo demais para efeito |

**Ressalva do 13º:** a página com dois links pagos tem pouca demanda no Bing
agora (51 impressões), e ela vai subir sozinha com a sazonalidade de
outubro-dezembro. **Medir o link 4 pela posição, nunca pela impressão.**

**5. Consultas de página 1 com zero clique:**

| Consulta | Impr | Pos |
|---|---|---|
| `calculadora inss` | 59 | 9,5 |
| `cálculo irrf 2026` | 55 | 7,4 |
| `cálculo verbas rescisórias sem justa causa brasil 2026` | 40 | **3,3** |
| `calcular inss` | 39 | 7,8 |
| `calculadora irpf 2026` | 30 | 8,8 |
| `calculo de rescisão trabalhista` | 25 | 9,4 |

Somam ~248 impressões. As que deram clique ficam ao lado:
`calculadora irrf 2026` 27 @ 6,2 (2 cliques), `calcular férias 2026` 10 @ 6,6
(2), `calculadora de férias 2026` 40 @ 8,6 (1). **A anomalia é a posição 3,3
com 40 impressões e zero clique.** Tem a forma de citação dentro de resposta do
Copilot (aparece, mas ninguém clica), e não de link azul. **É hipótese.**
Também: não há `/calculadora/irpf` na lista de páginas, embora a consulta
`calculadora irpf 2026` exista. O Bing provavelmente mostra o IRRF para quem
busca IRPF.

**6. O Bing é desktop: 2.307 impressões contra 15 no celular (99,4%).** Isso
bate com o Clarity (Edge em 40% das sessões) e com o resumo do Copilot de hoje
("usuários de desktop"). **Para este canal, UX de desktop é a que importa.** O
F56 (mobile) não o afeta.

**7. Países:** Brasil 2.168 e 40 cliques (93%). EUA 118 e zero clique, com
consulta lixo em posição 10 ("cheap hotels in paris", "panini near me", "how to
get rid of fruit flies"). Ignorar.

**8. A lacuna concreta: férias.** É a 4ª página do Bing (292 @ 8,1) e o 3º tema
da IA, com o **menor SoA** (14,5%). E o maior prompt do relatório é
exatamente sobre ela: *"vou tirar 10 dias de férias somente, quanto receberia
no próximo mês pós férias"* (17 @ 6,8). **O `ferias.mdx` não trata do
salário do mês seguinte às férias**: não há nenhuma ocorrência de "mês
seguinte", "próximo mês" ou "depois das férias". Ele cobre abono e venda de 10
dias, mas não a dúvida clássica de quem volta e recebe um contracheque menor,
porque as férias foram pagas adiantadas. **Candidato mais barato da rodada:**
uma seção/FAQ (ou um post no molde do F60) sobre o salário do mês depois das
férias, numa página em que o índice da Microsoft já nos põe na página 1. Não
abri feature; é decisão do Paulo.

**O que checar no próximo export do BWT:**
- `rescisao-trabalhista` contra a base 7,29 (link 3) e `decimo-terceiro` contra
  8,39, por posição (link 4).
- Se os posts do F60 sobem de 5,5 e se o post do F22 aparece.
- Se a consulta em 3,3 com zero clique continua. Se continuar, é citação
  do Copilot.
- Mesma janela de 13 dias ou exportar "últimos 28 dias". Sempre ler o
  período antes de comparar.

### 2026-09-22 (parte 3) — Export novo: a "melhora de posição" do Google é mistura, e quem cresceu foi Bing e IA

Paulo pediu para incluir a pasta `gsc/` junto do resumo do Clarity. Vieram as
quatro fontes: GSC (`...-2026-09-22/`, 20/06→19/09), BWT (CSV solto, 08→20/09),
GA4 (4 relatórios, 25/08→21/09, 28 dias) e Clarity (2 painéis e 2 exports de
clique, 20→22/09; SoA 16→22/09).

**1. O GSC parece ter dado um salto, e não deu.** A série semanal:

| Semana | Impr | Impr/dia | Pos. ponderada |
|---|---|---|---|
| W35 (24/08) | 186 | 26,6 | 68,1 |
| W36 (31/08) | 265 | 37,9 | 66,2 |
| W37 (07/09) | 218 | 31,1 | 61,3 |
| **W38 (14/09, 6d)** | **360** | **60,0** | **25,3** |

Impressão dobrou e a posição foi de 61 para 25. A diária de 14 a 19/09 ficou
em 28,4 · 19,1 · 22,1 · 19,6 · 30,3 · 34,0. **A explicação está nas páginas, não
no ranking:**

| Página | 14/09 | 22/09 | Δ |
|---|---|---|---|
| `porcentagem` | 293 @ 9,09 | **394 @ 9,30** | **+101** |
| `margem-lucro` | 204 @ 11,35 | **314 @ 11,11** | **+110** |
| `rescisao-trabalhista` | 330 @ 91,8 | 370 @ 91,39 | +40 |
| `decimo-terceiro` | 277 @ 86,5 | 308 @ 86,93 | +31 |
| `salario-liquido` | 74 | 73 @ 68,96 | −1 |
| `cdb` | 52 | 43 @ 42,26 | −9 |
| `irrf` | 26 | 23 @ 74,61 | −3 |
| `inss` | 5 | 8 @ 42,12 | +3 |

A janela andou 7 dias: entraram 13→19/09 (394 impressões) e saíram 13→19/06
(~110, deduzido de 2.683 → 2.967). **`porcentagem` e `margem-lucro` somam +211
líquidas, ou seja, ao menos 54% das impressões da semana nova, em posição
9-11.** Tirando as duas, o resto da semana fica em torno de 48-62, a mesma
faixa de antes. **É mudança de mistura, não ganho de ranking.** Rescisão e 13º
não mexeram (91 e 87). O "sinal fraco a favor" de 14/09 (29,8 em 12/09) fica
respondido: era o começo desse mesmo pico de `porcentagem`/`margem-lucro`, que
continuam com **zero clique**, como fechado em 14/09.

Outros números da rodada, para a próxima comparação:
- **2.967 impressões, 2 cliques em 3 meses** (os mesmos de 09/08 e 25/08, então
  zero clique novo). Dispositivo: computador 1.877 @ 71,7, celular 1.074 @ 49,1.
  14% das impressões são de fora do Brasil.
- **798 consultas nomeadas, 1.997 impressões: 73,5% em 80+, 98,3% pior que 50.**
  Bucket anonimizado: 970 (32,7%).
- **Única cauda boa entre as nomeadas: `salário líquido` em 18-20**, com 11
  variantes ("calculo de salario liquido", "calculadora salário líquido" etc.)
  de 1-2 impressões cada. É a página do link da Band, e o F64 deixou o motor em
  2026. Pouco demais para concluir; **acompanhar.** *(Parte 5: descartado. A
  página não aparece em nenhuma das duas últimas semanas, então essas
  impressões são de antes de 06/09.)*
- `calculo rescisão comum acordo`: 9 @ 94,8. É o tema exato da matéria do Jornal
  de Brasília (parte 1).
- **O F58 e os 4 posts do F60 continuam com zero impressão.** O post do F22
  segue sozinho: 13 @ 15,46.

**2. BWT: 13 dias, e a semana nova cresceu.** Uma correção de método antes:
**12/09 não era dia parcial, era sábado.** O Bing tem padrão forte de dia útil:

| | Dias | Impr/dia | Cliq/dia |
|---|---|---|---|
| Dias úteis | 9 | **235** | **4,3** |
| Fim de semana | 4 | 51 | 1,0 |

| Semana (dias úteis) | Cliques | Impr | Impr/dia |
|---|---|---|---|
| 08→11/09 (ter-sex) | 15 | 743 | 186 |
| **14→18/09 (seg-sex)** | **24** | **1.375** | **275 (+48%)** |

Pico em 15/09 (341). **Não atribuir ao link do `mercadohoje`**: ele publicou às
15:00 UTC desse mesmo dia, e o Bing leva semanas. **Semana nova: 27 cliques no
Bing contra zero no Google.** Continua faltando o export de consultas e páginas
do BWT (só veio o overview diário).

**3. GA4 (25/08→21/09): 223 usuários, +26% sobre 177 (11/08→07/09).** As
janelas se sobrepõem em duas semanas. Sessões por origem:

| Origem | 08/09 | 22/09 |
|---|---|---|
| direto | 76 | 111 |
| `bing` | 109 | 89 |
| **`chatgpt.com`** | **8** | **28 (3,5x)** |
| Yahoo | 10 | 16 |
| `band.com.br` | 15 | 12 |
| `qmix` | 6 | 5 |
| Copilot | 5 | 5 |
| `mercadohoje.uai.com.br` | — | **3 (1ª semana)** |
| DuckDuckGo | 2 | 2 |
| **`google / organic`** | **0** | **0** |

- **Os links pagos mandam gente de verdade**, além de autoridade: `band.com.br`
  com 12 sessões e `mercadohoje` com 3 na primeira semana. O `acritica.com` não
  aparece.
- **O direto está inflado por bot:** 25 usuários da China (Zhangjiajie, Wuxi) e
  25 dos EUA, vários em cidades de datacenter (Ashburn, Council Bluffs,
  Boardman, Santa Clara). Brasil: **156 usuários**.
- Páginas: home 81 views, **IRRF 49 (41 usuários)**, rescisão 45, hub 37,
  Tesouro 21. O IRRF tem 41 usuários no mês e 23 impressões no Google em 3
  meses: são os "dois públicos" de 14/09 de novo.
- `calculator_calculated` **271** (242 em 08/09).
- **Correção sobre o F45: "Leads qualificados" vai continuar 0, e isso não
  indica falha.** Esse relatório conta o evento recomendado `qualify_lead`, que o
  site não dispara. Marcar `calculator_calculated` como evento principal
  aparece em outro lugar: **"Eventos principais: 235"** no mesmo export. **O F45
  está funcionando; parar de ler "Leads qualificados"** (a nota de 10/09 dizia
  que ele deixaria de ser 0, e não deixa).
- **Erros:** `exception` 165 + `resource_error` 132 para 382 `page_view`. A
  janela mistura antes e depois do F62 (10/09), então ainda não dá para ler a
  proporção. **O `description` continua fora do export padrão.** É a 4ª rodada
  sem ele. Para lê-lo, o Paulo precisa abrir um relatório Explorar com o evento
  `exception` e a dimensão `description`.

**4. Clarity (20→22/09): o dado mais limpo até agora.** 25 sessões, **5 de bot
(20%, contra 57% em 14/09)**, 23 usuários únicos. Páginas: **rescisão 10
sessões**, IRRF 8, e 2 cada para home, hub e poupança. Referenciadores: `bing`
10, `chatgpt` 2, e **Google zero de novo**. "Enviar formulário" em 48% das
sessões. Performance **95** (LCP 0,596s, INP 112ms, CLS 0,002), zero erro de JS.
Clique inativo em 16% (4 sessões).

**Heatmap da rescisão (15 pageviews, 147 cliques):**
- Botão de calcular 31 (**2,1 por pageview**, contra 2,8 em 14/09). `#dataRescisao`
  20, `#motivoRescisao` 14, `#dataAdmissao` 7, `#saldoFGTS` 6.
- **Cliques em coisa que não é clicável:** o valor grande do resultado
  (`P.text-result-lg`) leva 10, e as linhas do `#detalhamento-lista` ~15. É a
  mesma família do achado do hub em 14/09. A leitura mais provável é gente
  querendo copiar o valor ou esperando uma explicação da linha. **Ver um replay
  antes de decidir.**
- Chips de atalho ~8 cliques e botões de +/− ~15: estão sendo usados.

**Heatmap do IRRF:** está na parte 2 (`#origemRendimento` 16 de 34, breadcrumb
"Impostos" 2).

**5. GEO cresceu 59% numa semana.** Share of Authority **21,48%** (era 20,6%),
**994 citações** em 7 dias (eram 625). O tráfego de IA medido pelo Clarity foi de
11 para 7, mas o GA4 do mês mostra o ChatGPT em 3,5x. Por tema (963 das 994
citações estão nas queries listadas):

| Tema | Citações | Destaques |
|---|---|---|
| INSS | 353 | `calculo inss` 144 (SoA 26,7%), `calcular inss` 94 (37,6%) |
| IRRF/IR | 311 | `cálculo irrf 2026` 70, `base de calculo irrf` 36 (33,3%) |
| **Férias** | **112** | **`cálculo de férias 2026` 75 (SoA 14,5%)**, `calcular horas de férias` 25 |
| CDB | 48 | |
| Tesouro | 30 | incluindo 2 perguntas longas de simulação |
| 13º | 30 | `calcular decimo` 18 (46,2%) |
| Rescisão/trabalhista | 20 | `calculo rescisão trabalhista 2026` 10, igual a 14/09 |

**Férias entrou no vocabulário da IA.** Em 14/09 não havia uma query de férias
na lista; agora é o 3º tema, e com o **menor SoA** dos grandes (14,5%, contra
27-38% do INSS). Tem demanda e a gente divide com muita gente. Na mesma lista,
`calcule net ir` (28 citações, SoA 35%) é a **marca de um concorrente** sendo
buscada na IA, e a resposta cita a gente em um terço das vezes.

**Leitura da rodada:** nada mudou no Google (a melhora é mistura), e **os dois
canais que já funcionavam cresceram na mesma semana**: Bing +48% por dia útil e
citações de IA +59%. O F64 (13/09) é o candidato natural para a parte da IA,
porque INSS e IRRF 2026 são exatamente o que ele corrigiu. Mas é uma semana e
não prova causa.

**O que checar no próximo export:**
- ~~**GSC com filtro de data, por página: últimos 7 dias × 7 anteriores.**~~ ✅
  veio na mesma sessão (parte 5). A mistura se confirmou (69% da semana), e o
  `salario-liquido` em 18-20 não é recente.
- ~~**BWT → consultas e páginas**~~ ✅ veio na mesma sessão (parte 4). Falta
  **BWT → Vínculos regressivos**: `mercadohoje` e `jornaldebrasilia` devem
  entrar (parte 1).
- Se o SoA de férias sobe e se INSS/IRRF sustentam o patamar pós-F64.
- GA4: `exception` por `description` num relatório Explorar (4ª rodada).
  Com a janela inteira depois do F62 (a partir de ~08/10), comparar
  `exception` com `resource_error`.
- Semrush Domain Overview (AS): em 09/08 era 2, e com 4 links publicados é a
  hora de medir de novo.

### 2026-09-22 (parte 2) — Resumo do Clarity sobre a calculadora de IRRF

Paulo colou o resumo que o próprio Clarity gerou (Copilot). O resumo não diz a
janela nem o número de sessões. Página: `/calculadora/irrf`, reconhecida pelo
botão "Calcular IRRF". Texto original:

> **Comportamentos do usuário**
> - Usuários de desktop clicaram primeiro em Origem do rendimento e depois em
>   Impostos.
> - Últimos cliques foram em Salário bruto e no botão de envio (Calcular IRRF).
> - Poucos usuários rolaram além de 20% da página, nenhum chegou ao final.
>
> **Principais conclusões**
> - Para melhorar a interação, destacar campos como Origem do rendimento e
>   Salário bruto.
> - Otimizar conteúdo acima da dobra média (728px), pois poucos rolam mais que
>   20%.
> - Reduzir cliques mortos em Impostos para evitar frustração.

**Contexto para ler isso:**
- **Origem do rendimento em primeiro confirma o dado de 14/09**: `#origemRendimento`
  já era o campo mais clicado da página (5 de 22 cliques, 22,7%). No export de
  cliques desta rodada são **16 de 34 (47%)** em 13 pageviews. Parte disso é
  mecânica: é um `<select>` nativo, e abrir e escolher contam dois cliques. Ainda
  assim, o default é `salario` e só há outra opção (`aluguel`), então quem
  clica ali está olhando a alternativa. Isso reforça a tese do `calculo irrf
  aluguel 2026` (ver "Ao voltar").
- **"Impostos" é o breadcrumb, e ele funciona.** O export de cliques localiza o
  elemento: `NAV > OL > LI:nth-of-type(2) > A`, que é o segundo item do
  breadcrumb (`Início > Impostos > IRRF`), com 2 cliques. É um `<Link>` para
  `/categoria/impostos`, que responde 200 e aparece no painel do Clarity como
  página visitada na mesma janela. Minha primeira leitura (o dropdown do menu
  do topo, `Navigation.tsx:59`) estava errada; o menu fica fora do `MAIN` e não
  aparece no export. **O "clique morto" do Copilot é fraco:** o link navega. O
  mais provável é um dos dois cliques ter sido marcado como inativo pela
  navegação client-side do Next, que não recarrega a página. **Não mexer.** Na
  verdade é sinal bom: quem chega pelo IRRF vai procurar outras calculadoras de
  imposto.
- **Rolagem abaixo de 20% casa com o fluxo esperado**: a pessoa preenche,
  calcula e vai embora, e o F59 já abre o resultado. O que fica abaixo da dobra
  é FAQ e conteúdo, que existem para o Google e para a IA, não para quem usa a
  calculadora. Não é sinal de problema por si só.
- **Cuidado com o volume**: na janela de 14/09, 16 das 28 sessões do Clarity
  eram bot. Tratar o resumo como qualitativo até ver quantas sessões ele cobre.

Nenhuma feature aberta. O único candidato, se o padrão se repetir no próximo
export, é o endereçamento de aluguel no IRRF (já registrado em "Ao voltar"). O
`origemRendimento` já é o primeiro campo do formulário. Números brutos deste
Clarity e do resto do export na parte 3, logo acima.

### 2026-09-22 (parte 1) — Link 3 publicado, mas no Jornal de Brasília e numa seção de link pago

Paulo mandou a URL e pediu "avalie e registre esse novo backlink". É o **link 3
do plano**: destino `/calculadora/rescisao-trabalhista` e âncora
`calcular rescisão do contrato de trabalho`, os dois exatamente como decidido em
14/09. **Só que o veículo não é o encomendado:** o plano registrou
`msnoticias.com.br`, e o link saiu em **`jornaldebrasilia.com.br`** (Jornal de
Brasília, jornal tradicional do DF). Publicado em **21/09 às 12:16 (BRT)**, 7
dias depois da encomenda.

**URL:** `https://jornaldebrasilia.com.br/brasil-7/demissao-por-acordo-o-que-o-trabalhador-do-df-recebe-e-o-que-perde/`

Anchor extraído do HTML bruto:

```html
<a href="https://calculosonline.com.br/calculadora/rescisao-trabalhista">calcular rescisão do contrato de trabalho</a>
```

**O checklist de 14/09 passa inteiro:**

| Critério | Resultado |
|---|---|
| Link no HTML servido (SSR) | ✅ não depende de JS |
| `rel` nofollow/sponsored/ugc | ✅ ausente → dofollow. O único `rel="nofollow noopener"` da página é dos 12 botões de compartilhar do AddToAny |
| Posição | ✅ 21º de 29 blocos do corpo: fecha a seção "Simulação: o mesmo trabalhador em três saídas" |
| Âncora | ✅ a do plano, em frase natural ("Antes de assinar, vale calcular rescisão do contrato de trabalho nas três modalidades com os próprios números…") |
| Destino | ✅ HTTP 200, sem redirect |
| Indexável | ✅ `robots: index, follow`, sem `X-Robots-Tag`, `Disallow:` vazio no `robots.txt` |
| Canonical | ✅ self-canonical |
| Rotulagem | ✅ nenhum "patrocinado"/"publieditorial"/"informe publicitário" |
| Links externos no corpo | ✅ **o nosso é o único**; o outro link do corpo é interno do jornal (FGTS) |

**O encaixe temático é o melhor dos quatro placements.** A matéria tem 1.392
palavras sobre demissão por acordo (art. 484-A, Lei 13.467, Lei 12.506, art. 477)
e monta uma simulação comparando **dispensa sem justa causa, pedido de demissão e
acordo**. A frase do link manda o leitor calcular "nas três modalidades", e o
`RescisaoForm` tem as três (`sem_justa_causa`, `pedido_demissao` e `acordo_mutuo`,
esta com as duas leituras do aviso desde o F40). A promessa da âncora é cumprida
na página de destino. Ainda existe o post do F60
`rescisao-por-acordo-mutuo-quanto-voce-recebe` para quem quiser o texto.

**O problema está na seção onde a matéria saiu, não no link.** `brasil-7` não é
editoria do jornal, é **um balde de conteúdo pago**:

- O noticiário de verdade fica em `/noticias/economia/` (categoria 38). A
  `brasil-7` (categoria 444297, "brasil") tem **972 posts** e **não é linkada nem
  pela home nem pela própria matéria**.
- Os vizinhos do mesmo dia e da mesma semana: "10 melhores especialistas em
  cirurgia da mão em Goiânia e Brasília", "10 melhores espaços de coworking em
  Brasília", "Maxim no Brasil… 3", "Melhores ERPs para comércio" e um post
  **em inglês** ("best portable monitors for home office…").
- Abri três deles e **cada um tem exatamente um link comercial de saída com
  âncora de palavra-chave**: `conceptoffices.com.br` ("espaço de coworking em
  Brasília"), `certifica.com.br` ("certificadora digital online") e
  `internationalenglishtest.com` ("teste de nível de inglês"). É o mesmo padrão
  do nosso link.

**O que isso significa, sem exagerar:** nenhum dos três placements anteriores
estava numa seção assim (`acritica` em `/economia/`, `mercadohoje` no
`sitemap-news.xml`). Seção de notícia com um post pago atrás do outro, cada um
com um link comercial, é exatamente o que a política de *site reputation abuse*
do Google (2024) e os sistemas de link spam procuram. **O efeito provável não é
punição para o `calculosonline`, é o link ser neutralizado no Google.** No Bing,
que é quem manda tráfego e rankeia o site em 4-9, a expectativa é contar.
**Consequência para o F15:** este link é **pior evidência** que os outros para
responder "link move o Google?". Se `rescisao-trabalhista` não sair do lugar no
Google, a leitura é "este link pode não ter contado", e não "link não funciona".

**Segundo risco: descoberta.** Os sitemaps do jornal **pararam em 18/03/2026**
(o último `post-sitemap1275.xml` termina aí e o `news-sitemap.xml` está vazio).
Isso vale para o site inteiro, não só para esta matéria, mas deixa a página sem
nenhum caminho de sitemap. Ela também não está no `/feed/` nem na home. **O único
caminho de rastreio é a página 1 da `/brasil-7/`**, e ela recebe ~5 posts por dia
(só em 21/09 foram 5). Em poucos dias a matéria cai para a paginação. IndexNow
não ajuda, porque só submete URL do próprio host. **Se o `jornaldebrasilia.com.br`
não aparecer no BWT → Vínculos regressivos em ~4 semanas, suspeitar da descoberta
antes de suspeitar do link.**

**O `msnoticias` não vem (confirmado pelo Paulo na mesma sessão).** O
Jornal de Brasília **substituiu** o MS Notícias como link 3; destino e âncora
idênticos já indicavam troca de veículo pelo fornecedor (`qmix`). **O plano de
14/09 fecha em 4 links**, e `rescisao-trabalhista` fica com um só.

**Placar: 4 placements publicados** (`band.com.br`, `acritica.com`,
`mercadohoje.uai.com.br` e `jornaldebrasilia.com.br`). O 4º vale com a ressalva da
seção. No BWT o esperado é ir de 2 para 4 domínios quando o `mercadohoje` e o
`jornaldebrasilia` forem descobertos.

**Regra nova para as próximas compras:** o checklist de 14/09 confere a página e
não a seção. **Item 6: abrir a categoria da matéria e 2-3 vizinhos. Se cada
vizinho tem um link comercial de saída, é balde de link pago, mesmo que o domínio
seja de jornal de verdade.** E, antes de pagar, pedir ao fornecedor a URL da
seção onde a matéria vai sair. Só com o nome do veículo não dá para saber se ela
cai numa editoria ou num balde.

**Agenda deste link:**
1. ~~Paulo confirmar se o `msnoticias` ainda vem~~ ✅ não vem, foi substituído.
2. Reconferir o HTML bruto em ~30 dias (~21/10).
3. BWT → Vínculos regressivos: `jornaldebrasilia.com.br` deve entrar. Se não
   entrar em ~4 semanas, o suspeito é a descoberta (sitemap congelado).
4. Posição de `rescisao-trabalhista` no **BWT**. No Google, qualquer leitura
   deste link sai com a ressalva da seção.

### 2026-09-15 — Link 4 publicado: o `mercadohoje` veio dofollow, e o risco de `sponsored` não se confirmou

Paulo mandou a URL e pediu "valide o backlink". É o **link 4 do plano** —
`mercadohoje.uai.com.br`, editoria de finanças do portal UAI (Diários
Associados), apontando para `/calculadora/decimo-terceiro`. Encomendado em
14/09, publicado em **15/09 às 15:00 UTC**, ou seja, menos de 24h entre pedido
e publicação.

**URL:** `https://mercadohoje.uai.com.br/2026/09/15/13o-salario-ferias-e-horas-extras-as-contas-que-mais-geram-duvida`

O anchor, extraído do HTML bruto (não do markdown renderizado, justamente para
ver o `rel`):

```html
<a href="https://calculosonline.com.br/calculadora/decimo-terceiro">cálculo 13 proporcional</a>
```

**O risco específico que eu tinha registrado em 14/09 não aconteceu.** A
ressalva era que o `mercadohoje` tem blocos "Publicidade" e nenhuma política
visível de rotulagem de patrocinado, e que o link podia vir com
`sponsored`/`nofollow` se a matéria caísse em slot publieditorial. **Não veio
atributo `rel` nenhum** — é dofollow limpo, em matéria editorial normal, com a
âncora exata que o plano pediu ("cálculo 13 proporcional", KD 16).

Checklist completo, aplicando o método de 14/09 (**só o HTML bruto decide se um
link conta**, o `GSC → Links` amostra e atrasa):

| Critério | Resultado |
|---|---|
| Link no HTML servido (SSR) | ✅ não depende de JS |
| `rel` nofollow/sponsored/ugc | ✅ ausente → dofollow |
| Posição | ✅ 3º parágrafo do corpo editorial, não footer/sidebar |
| Âncora | ✅ `cálculo 13 proporcional` — a do plano |
| Destino | ✅ HTTP 200, sem redirect |
| Relevância temática | ✅ matéria sobre 13º → calculadora de 13º |
| Indexável | ✅ `robots: index, follow` + `Disallow:` vazio no `robots.txt` |
| Canonical | ✅ self-canonical (só difere pela barra final) |
| Sitemap | ✅ no `sitemap-news.xml` |

**O detalhe que faz esse placement valer mais que os anteriores: é o único link
externo editorial da página.** São 33 links no total — 24 internos e 9
externos, e desses 9, oito são propriedades do próprio grupo (em.com.br,
uai.com.br, alterosa, lugarcerto, vrum, superesportes, revista encontro) mais
um institucional (a4d.com.br). Nenhum outro site de fora divide o link juice.
Nada de link farm.

**Ressalva de autoridade:** é *subdomínio* do UAI, não o domínio raiz. Herda
força do `uai.com.br`, mas não é o mesmo que um link em `uai.com.br/economia`.
Vale como link editorial real; não vale como se fosse home do portal.

**Placar de backlink agora: 3 reais** (`acritica.com`, `band.com.br`,
`mercadohoje.uai.com.br`), com o 4º (`msnoticias.com.br` → rescisão) ainda
pendente de publicação. **Medir no BWT, não no GSC** — o Bing responde em
semanas, o Google amostra e atrasa, e foi exatamente isso que o caso
`acritica` de 14/09 provou.

**Agenda deste link:**
1. Reconferir o HTML bruto em ~30 dias (portal pode editar e tirar o link
   depois do pagamento — foi a suspeita que motivou o método, e que no
   `acritica` se mostrou infundada).
2. Acompanhar `decimo-terceiro` em "Vínculos regressivos" do BWT e a posição
   do cluster do 13º — **este é o segundo link na mesma página, de propósito**,
   para separar "link não funciona" de "um link não basta". É essa resposta
   que destrava o orçamento do F15.
3. A janela é curta: seis semanas até o pico de nov/dez. O F64 já consertou o
   motor da página que recebe o link.

### 2026-09-14 — Export novo: o arquivo solto na raiz é do Bing, e ele mede o mesmo dia que o Google

Paulo pediu "avalie a pasta gsc". Vieram três fontes: a pasta datada do GSC
(`...-Performance-on-Search-2026-09-14/`, 13/06→12/09), **sete arquivos do
Clarity** (voltaram depois de faltarem em 08/09) e um CSV solto na raiz,
`calculosonline.com.br_SearchPerformanceOverview_All_14_09_2026.csv`.

**1. O achado de método: aquele CSV solto NÃO é do GSC — é do Bing Webmaster
Tools.** Foi o furo de 08/09 sendo fechado, e passou despercebido porque o
arquivo tem cara de export do Search Console. As assinaturas que separam os dois:

| | Pasta GSC | CSV solto |
|---|---|---|
| Data | `2026-06-13` (ISO) | `08/09/2026 00:00:00` |
| Decimal | `40.9` (ponto) | `2,29` (vírgula) |
| Coluna posição | sim | **não existe** |

E o teste que não deixa dúvida: **os dois cobrem os mesmos 5 dias e discordam
por 5,7x.** Se fossem a mesma propriedade seriam iguais.

| Dia | Bing impr | Bing cliq | Google impr | Google cliq |
|---|---|---|---|---|
| 08/09 | 175 | 4 | 47 | 0 |
| 09/09 | 186 | 0 | 22 | 0 |
| 10/09 | 194 | 4 | 24 | 0 |
| 11/09 | 188 | 7 | 37 | 0 |
| 12/09 | 35 (parcial) | 1 | 11 (parcial) | 0 |

*(Correção de 22/09: 12/09 não era parcial, era **sábado**. O export seguinte
manteve 35 e 11, e o Bing tem ~51 impressões/dia no fim de semana contra ~235
em dia útil.)*

**Nos 4 dias completos: Bing 743 impressões e 15 cliques (CTR 2,0%); Google 130
impressões e ZERO cliques.** Confere com a nota de 10/09 (lá o primeiro dia do
BWT tinha 3 cliques; aqui 10/09 aparece com 4 — o BWT consolida para cima, o que
é mais uma confirmação de que a fonte é ele).

**O que isso muda:** a leitura de 10/09 ficou registrada com ressalva ("é 1 dia e
9 linhas, não dá base para decisão"). **A ressalva caiu.** São 5 dias, série
contínua, medindo os mesmos dias que o Google — e a conclusão é a mesma. O Bing
não é "o outro buscador"; é **o** buscador deste site.

**2. GSC: 2.683 impressões e 2 cliques em 3 meses.** Contra 2.562/3 em 08/09 —
janela rolante, então o volume está estável e o clique é ruído em torno de zero.

| Semana | Impr | Impr/dia | Pos. ponderada |
|---|---|---|---|
| W33 (10/08) | 168 | 24,0 | 59,9 |
| W34 (17/08) | 167 | 23,9 | 58,4 |
| W35 (24/08) | 186 | 26,6 | 68,1 |
| W36 (31/08) | 265 | 37,9 | 66,2 |
| W37 (07/09, 6d) | 184 | 30,7 | 62,9 |

As quatro primeiras linhas batem **exatamente** com a tabela de 08/09 — o export
é consistente entre rodadas, o que valida o método de comparar pelas séries
semanais.

**Distribuição por posição, medida agora sobre as 772 consultas nomeadas
(1.933 impressões): 73,4% em posição 80+ e 98,3% pior que 50.** Só **1
impressão** do site inteiro em top 10 por consulta nomeada. O bucket anonimizado
é 750 impressões (28,0%).

**Sinal fraco a favor:** os 4 últimos dias da janela têm posição 60,0 → 43,1 →
50,6 → 29,8, bem melhor que a média da semana. Pode ser o F58/F60/F64 assentando
ou ruído de dia parcial. **Não decidir nada com isso** — conferir na próxima.

**3. Os itens que a rodada de 08/09 mandou checar, respondidos.**

- **`porcentagem` e `margem-lucro`: confirmado pela 2ª rodada seguida.**
  `porcentagem` 293 impr @ **9,09** e `margem-lucro` 204 @ **11,35**, as duas com
  **zero clique**. 497 impressões em página 1 que não viram nada. **Questão
  fechada pelo critério combinado — não investir mais nessas duas.**
- **`rescisao-trabalhista` 266 → 330 (+24%) e `decimo-terceiro` 239 → 277
  (+16%).** As impressões continuam subindo e **a posição não mexeu** (91,8 e
  86,5, contra 91,5 e 85,8). Era o esperado: 6 dias de F60.
- **O F58 continua com ZERO impressão no GSC**, 13 dias depois.
- **Os 4 posts do F60 também têm zero impressão no GSC.** O único post que
  aparece é o do F22 (30/08): 12 impressões @ 15,83.
- **O breakdown de `exception` por `description` não veio.** Pendência aberta
  desde 20/08 — **terceira rodada**.
- **O GA4 não veio nesta rodada.** Sem ele não há sessão nem conversão.

**4. A suspeita de pipeline de 08/09 estava ERRADA, e isso é bom saber.** A
hipótese registrada era que o hub do F58 pudesse estar fora do `sitemap.xml` e,
por consequência, fora do IndexNow. Verificado nos três pontos:
`apps/web/src/app/sitemap.ts:67` inclui o hub com prioridade 0,9; o
`sitemap.xml` **em produção** traz as 39 URLs, o hub e os 5 posts; e
`apps/web/scripts/indexnow.mjs:42` monta a lista de URLs lendo o próprio
sitemap de produção. **O hub e os posts são submetidos. Não há bug de rota** —
o que há é o Google não rankeando. Fechar essa suspeita evita gastar a próxima
rodada nela.

**5. O achado que reordena a prioridade: a página mais usada do site é invisível
no Google.** No Clarity (12→14/09) `/calculadora-trabalhista-completa` empata em
1º lugar em sessões com a home (7 cada) e é **a página com mais interação do
site** — 45 cliques em 7 pageviews no PC, 13 toques em 3 no celular. E tem 0
impressão no GSC. O F58 funciona; quem chega nele não vem do Google.

**6. GEO: o site tem dois públicos e só um deles aparece no GSC.** Share of
Authority de **20,6%**, **625 citações** em 7 dias, 11 sessões de AI referral.

| Página | Citações (7d) | Impressões GSC (3 meses) |
|---|---|---|
| `calculadora/irrf` | **224** | 26 |
| `calculadora/inss` | **223** | 5 |
| `calculadora/cdb` | 35 | 52 |
| `calculadora/salario-liquido` | 30 | 74 |

**Duas páginas fazem 71% das citações de IA e somam 31 impressões no Google em
três meses.** E os vocabulários são de mercados diferentes:

- **Vocabulário da IA** — com ano, e financeiro/fiscal: `calculo inss` (204),
  `calculadora irrf 2026` (66), `calculo de salario liquido online` (30),
  `calcular ir 2026` (28), `calculo de irrf 2026` (24), `calculadora de
  investimento tesouro direto` (15), `calcular rendimento cdb` (14).
- **Vocabulário do GSC** — sem ano, e trabalhista: `calculadora hora extra` (61),
  `calculadora de décimo terceiro` (50), `calculadora ferias` (41),
  `calculadora de financiamento` (38).

**A consequência incômoda: os últimos três meses de conteúdo (F22, F58, F60 — o
cluster 13º/rescisão) foram todos investidos no mercado do Google, que entrega
zero clique.** O mercado que entrega — Bing + IA — pede INSS/IRRF/salário
líquido com o ano no nome, que é exatamente o que o F64 acabou de deixar certo e
que quase nenhum concorrente atualizou. O cluster trabalhista aparece na IA, mas
pequeno (`calculo rescisão trabalhista 2026`, 10 citações).

**7. UX concreto do heatmap: quase metade dos cliques nos cards de resultado do
hub erra o alvo.** No `/calculadora-trabalhista-completa`, dos cliques em cards
de resultado, **5 caem no `SUMMARY`** (funcionam) e **4 caem no `LI` do card**
(não fazem nada). Mais 8 cliques em containers puros (`MAIN.flex-grow`,
`DIV.mx-auto`, `SECTION.rounded-xl`). O painel do Clarity confirma por outro
caminho: **"Clique inativo" em 17,86% das sessões**. A correção é barata —
o gatilho do `<details>` tem de ser o cabeçalho inteiro do card, não só o texto
do `summary`.

Dois sinais menores da mesma fonte: na rescisão, **`#dataAdmissao-hint` levou 3
cliques** (gente clicando no texto de dica, que não é interativo), e o botão de
calcular levou **14 cliques em 5 pageviews**. Recalcular é uso normal de
calculadora, mas 2,8x por visita merece um replay de sessão antes de assumir que
é iteração e não botão que não responde.

**8. Performance não é gargalo e pode sair da lista:** score 90, LCP 1,572s,
INP 182ms, CLS 0,00025, **zero erro de JavaScript**.

**9. Dado sujo a registrar antes que a pasta seja sobrescrita: 16 das 28 sessões
do Clarity (57%) são bot.** Sobram ~12 sessões reais em 3 dias. **Nesta janela o
Clarity é fonte qualitativa (heatmap e Share of Authority), não quantitativa** —
nenhuma conclusão de volume sai dele. Os referenciadores das sessões reais:
`bing` 6, `chatgpt` 4, `yahoo` 2, `copilot` 2, e uma da própria preview da
Vercel (Paulo testando). **Google: zero, de novo.**

**10. Semrush (mesma sessão): 201 keywords, 130.160 buscas/mês endereçadas, 1
visita.** Paulo mandou 3 páginas de posições. Deduplicado por keyword (o Semrush
repete a mesma com SERPs diferentes), mantendo a melhor posição:

| Página | Kws | Volume/mês | Melhor pos |
|---|---|---|---|
| `decimo-terceiro` | 55 | **44.310** | 47 |
| `rescisao-trabalhista` | 54 | **34.290** | 74 |
| `financiamento` | 26 | 12.390 | 60 |
| `irpf` | 13 | 8.890 | 81 |
| `tesouro-direto` | 3 | 7.690 | 67 |
| `salario-liquido` | 10 | 5.650 | 66 |
| `hora-extra` | 18 | 5.160 | 54 |
| `cdb` | 3 | 4.620 | **46** |
| `ferias` | 9 | 3.910 | 77 |
| `irrf` | 3 | 1.450 | 65 |

**Mediana de posição 84. Duas keywords de 201 em top 50.** A melhor posição do
domínio inteiro é 46 (`simulador cdb`), e é a única linha com tráfego: **1
visita/mês**, que é o total do site.

**A tríplice validação que encerra a dúvida de medição:** GSC diz 2 cliques em 3
meses, GA4 disse 0 sessão em 28 dias, Semrush estima 1 visita/mês sobre 130 mil
buscas endereçadas. **Três fontes independentes, mesma resposta.** O canal
Google não está mal medido — ele não existe.

**11. O Semrush CORRIGIU a recomendação que eu tinha acabado de dar.** Eu havia
proposto mover o conteúdo para INSS/IRRF/salário líquido porque é lá que estão
71% das citações de IA. Como jogada de **Google** isso não se sustenta:

- **`inss` tem ZERO keyword no top 100 do Semrush.** A 2ª página mais citada por
  IA do site (223 citações em 7 dias) não tem rastro nenhum no Google.
- `irpf` + `irrf` somam ~10,3K de volume/mês, contra **78,6K** do cluster
  trabalhista (`decimo-terceiro` + `rescisao-trabalhista`).

**A leitura certa não é pivô, são dois jogos diferentes:**
- **IA/GEO — já está funcionando, e funciona SEM posição no Google.** `irrf` e
  `inss` rendem 447 citações/semana com zero e 26 impressões. Citação de IA não
  depende de ranking, então não há o que "destravar" aqui: é só continuar
  alimentando, e o F64 é exatamente o insumo certo.
- **Google — o cluster trabalhista tem o volume E o KD baixo** (16-28 em boa
  parte: `décimo terceiro 2025 calcular` 1K/KD 18, `calculador decimo terceiro`
  480/KD 17, `cálculo de 13 proporcional` 320/KD 16) **e mesmo assim está em
  84-100.** Quando o KD é 17 e a posição é 92, o que falta não é conteúdo nem
  keyword — **é autoridade**, como está registrado desde 09/08 (F15, Authority
  Score 2). O Semrush fecha essa porta em vez de abrir outra.

**12. O único alvo de Google realmente ganhável do conjunto, e o produto já está
pronto: `calculo irrf aluguel 2026`.** KD **12** (o menor de todas as 201), SF 4,
**posição 65** (a 2ª melhor do site), 140 buscas/mês. E:

- O recurso **existe e está completo** — F54, `packages/core/src/impostos/irrf.ts`
  trata `origemRendimento: 'aluguel'` com RIR/2018 art. 42 e IN RFB 1.500 art. 31,
  INSS zerado e despesas dedutíveis.
- É **o campo mais clicado da página** no Clarity: `#origemRendimento`, 5 de 22
  cliques (22,7%).
- Mas o `tituloLongo` é só "Calculadora de IRRF" e `palavrasChave` não menciona
  aluguel (`calculators.ts:270-278`) — aluguel só aparece na `descricao` e num
  `sinonimos`.

**É o único caso do dataset em que falta só endereçamento, não trabalho.**
Ressalva honesta para não superestimar: **140 buscas/mês é pouco** — é a mais
ganhável, não a mais valiosa.

**13. Terceira confirmação independente sobre `porcentagem`: ela tem ZERO
keyword no Semrush**, apesar das 293 impressões @ pos. 9,09 no GSC. Nem o
Semrush rastreia aquelas buscas. É aritmética única e anonimizada, como
diagnosticado em 08/09. **A questão está fechada por três fontes.**

**14. Detalhes menores que valem guardar.** O site rankeia para bastante cauda
**datada em 2025** (`décimo terceiro 2025 calcular` 1K, `calculadora férias 2025`
1,3K, `calculadora irpf 2025` 590) — cauda velha em set/2026. E as keywords
fiscais têm **SF 2-4** contra **SF 5-8** das trabalhistas: menos recurso de SERP
disputando o clique do lado fiscal. Sazonalidade: `calculadora decimo terceiro`
é 12,1K/mês com KD 22, a ~6-10 semanas do pico — KD baixo, mas partindo da
posição 89 com AS 2 não dá para pegar este ano.

**Arquivo ignorado de propósito:** `~/Downloads/semrush_positions_2026-03-01.csv`
é de **`cnpj.biz`**, outro domínio (provavelmente pesquisa de concorrente). Não
entra nesta análise.

**O que checar no próximo export (marco: 14/09):**
- **Domain Overview do Semrush (Authority Score)** — em 09/08 era **2**. É a
  métrica que explica a mediana de posição 84 com KD 17, e a única cujo
  movimento mudaria o plano.
- **Export de consultas e páginas do BWT** — esta rodada só trouxe o overview
  diário, que não tem posição nem query. É o dado que falta para agir no
  buscador que entrega.
- **Se a melhora de posição dos últimos 4 dias (29,8 em 12/09) se sustenta.**
- **Se o F58 e os 4 posts do F60 saíram de zero impressão** — agora sabendo que
  o sitemap e o IndexNow estão corretos, se continuar zero a causa é autoridade.
- **Se as citações de IA de `irrf`/`inss` crescem depois do F64** (base: 224 e
  223 em 7 dias).
- **GA4** e o **breakdown de `exception` por `description`** (3ª rodada pedindo).

### 2026-09-13 — O F64: a copy do 13º estava melhor que o motor, e o motor estava em 2025

Paulo colou a copy completa da página `/calculadora/decimo-terceiro` e pediu
"Avalie". A copy vinha com dois pontos marcados para conferir antes de publicar
(a constante do redutor e qual base entra na fórmula) — e foi puxando esse fio
que apareceu o problema real, que não era a copy.

**Os dois pontos, respondidos.** A constante certa é `978,62 − (0,133145 ×
base)`; a outra versão que circulava (`908,73 − 0,133 × base`) é confusão com a
**parcela a deduzir da última faixa do IRRF**, que é exatamente R$ 908,73 e já
estava na tabela do projeto. E a base da fórmula é o **rendimento tributável
bruto**, não a base líquida de INSS — o que a copy tinha errado. Isso não
depende de interpretação: `978,62 − 0,133145 × 5.000` dá exatamente os R$ 312,89
do redutor máximo, e `× 7.350` dá exatamente zero. Os dois extremos da faixa só
fecham com o bruto. **Guardar esse raciocínio:** quando uma fórmula legal tem os
limites publicados junto, os limites servem de teste da própria fórmula.

**O que a avaliação achou de fato.** O motor não tinha nada disso. A tabela do
INSS era a de 2025 rotulada como 2026, o redutor da Lei 15.270/2025 não existia
no código oito meses depois da vigência, e o desconto simplificado de R$ 607,20
— que é de 2023 — também não. Somados, os três cobravam IRRF onde a lei não
cobra mais: R$ 334,85 num 13º de R$ 5.000 que hoje é isento. **Na página que
carrega o único backlink do cluster do 13º**, a seis semanas do pico de nov/dez.

**A inversão de prioridade que isso forçou, e que vale como método.** O pedido
era avaliar uma copy; o certo era dizer que publicar aquela copy sobre aquele
motor colocaria no ar uma página afirmando "IR zero até R$ 5.000" logo acima de
um formulário cobrando IR de quem ganha R$ 3.000. Primeiro o motor, depois os
números publicados, depois a copy — foi o que o Paulo mandou fazer ("Faça os 3").

**O desconto simplificado é o que faz a isenção existir.** R$ 312,89 é
precisamente `(5.000 − 607,20) × 22,5% − 675,49`. Sem ele, um 13º de R$ 5.000
sobra com **R$ 23,78** de imposto e a isenção anunciada pela lei não fecha. Ou
seja: o redutor foi calibrado sobre o simplificado, e implementar um sem o outro
produz um erro pequeno o suficiente para passar desapercebido e grande o
suficiente para desmentir a manchete da própria página.

**Validação contra a fonte primária, não contra a imprensa.** A Receita publicou
"Exemplos de Aplicação da Lei 15.270/2025" com cinco casos resolvidos; os cinco
viraram teste parametrizado e batem casa por casa. Um detalhe útil sobre essa
página: os exemplos usam a tabela do **INSS de 2025**, porque foram publicados
em dez/2025 — o INSS deles não bate com o de 2026, e é isso que explica a única
diferença em relação aos nossos números. Por isso o teste passa o INSS
explícito, em vez de deixar a tabela vigente entrar: o que ele trava é a
**ordem** do cálculo, que não depende do ano da tabela previdenciária.

**Dois bugs de centavo, ambos já publicados.** `arredondar()` devolvia
R$ 121,57 para `1.621 × 7,5%` (a tabela oficial publica R$ 121,58) porque
`121.575 * 100` dá `121.57499...` em ponto flutuante; e o INSS era arredondado
faixa por faixa, somando quatro erros e fechando o teto em R$ 988,10 contra os
R$ 988,09 da portaria. O segundo é irmão do F57: a diferença é que lá o erro
vinha de arredondar antes de multiplicar, e aqui de arredondar cada parcela em
vez do acumulado. **A invariante do F57 foi preservada de propósito** — as
linhas exibidas continuam somando exatamente o total exibido, por isso cada
linha recebe a diferença entre dois acumulados já arredondados, e não o seu
próprio valor arredondado.

**A pergunta do Paulo no meio da execução: "isso aumenta o acesso? não é um
nicho mega específico?"** Resposta registrada porque a expectativa importa: os
passos 1 e 2 **não trazem tráfego**, são defesa — evitam perder quem já chegou
e proteger a página do backlink. O nicho, porém, é o oposto de específico: o
redutor passa por 5 das calculadoras de maior volume do site. E a tese de
aquisição real aqui é **GEO**, não Google: assistentes citam quem tem o número
certo com a norma nomeada, o site já recebe ~17 usuários/mês de IA, e em
setembro de 2026 quase todo conteúdo de 13º publicado ainda está na regra de
2025. Ter a única página com o redutor certo é o que vira fonte citada.

**Segunda pergunta dele, também no meio: linkar as páginas oficiais não ajuda o
E-E-A-T?** Ajuda, e foi feito — mas só com link verificado. As duas URLs do
`gov.br` (exemplos da Receita e teto do INSS) responderam 200 e entraram; as
leis do Planalto **ficaram nomeadas sem hyperlink** porque o domínio não
respondeu deste ambiente, nem por `curl` nem por fetch. **Regra que fica:** numa
página de cálculo, link quebrado para a norma é pior que norma sem link — o
leitor que clica para conferir é exatamente o que a página quer convencer.

**O conteúdo publicado estava mentindo junto.** 11 MDX e 5 posts regerados pelo
motor (F47/F49). Dois achados de conteúdo que valem por si: a tabela de
dependentes do post do 13º usava salário de R$ 4.000, faixa em que **declarar
dependente não muda mais nada** (o redutor zera com ou sem, e o simplificado já
substituía a dedução) — foi para R$ 8.000; e o hub ainda afirmava aviso prévio e
multa de 40% na linha de **Aposentadoria**, premissa que o F63 derrubou no motor
em 10/09. O texto tinha ficado três dias atrás do cálculo, o que é o próprio
argumento para os números do conteúdo saírem sempre do motor.

**O e2e cobrou uma decisão de SEO que eu não sabia que estava tomando.** Ao
fechar o interlink do cluster do 13º com as seis calculadoras que a copy pedia,
`hora-extra` saiu da lista — e `link-interno.spec.ts` (F43) quebrou, porque a
escultura por impressão exige que `hora-extra` receba mais links internos que
`juros-compostos`. **O teste do F43 sabia de uma restrição que nenhum documento
registrava.** `hora-extra` voltou, agora com comentário no registry dizendo por
quê.

**Ressalvas registradas, para não virarem surpresa depois:**

1. **A rescisão soma saldo de salário e 13º proporcional numa base de IRRF
   única.** O 13º é tributado exclusivamente na fonte e deveria ser apurado
   separado; com o redutor isso passou a custar dinheiro visível, porque a base
   somada pode estourar os R$ 5.000 que, separados, seriam isentos. É
   preexistente e ficou fora deste escopo.
2. **O IRPF anual (`irpf`) não recebeu a Lei 15.270.** A lei também criou
   tributação mínima para altas rendas, que não está implementada.
3. **Pisos regionais de SP, RS e DF** seguem com o valor da última lei estadual
   conhecida; os três estão acima do mínimo federal novo, então o fallback não
   fica ilegal, mas o número exato pede conferência antes de virar conteúdo.
4. **A calculadora do 13º não tem os campos que a copy previa** (média de horas
   extras/comissões, adicionais fixos, pensão alimentícia). O MDX foi escrito
   sem prometê-los. Seria a continuação natural: são os campos que separam o
   "13º do salário base" do 13º real de quem tem verba variável.

### 2026-09-10 — As três pendências de painel fechadas, o F61 registrado com atraso e o F62

Paulo abriu com "o que tem pra hj?". Levantamento do estado do repo antes de
propor qualquer coisa, e o levantamento em si já rendeu o primeiro item.

**O commit que não estava documentado.** `b61fec7` ("ajuste FGTS + Chips",
08/09) estava em produção desde o merge do PR #27 e **não tinha entrada em
`FEATURES.md` nem no `CHANGELOG.md`** — e o bump para `0.31.0` tinha sido
consumido pelo F60, então a feature ficou sem versão própria. O nome do commit
subestima o conteúdo: 42 arquivos, headline do FGTS por modalidade,
`rotuloResultado` novo no contrato do core, `hojeISO()` aplicado a 11 módulos e
`modo: 'definir'` nos chips com 10 presets novos. Registrado como **F61**,
assumindo no texto que divide a `0.31.0` com o F60 em vez de inventar uma
versão que nunca existiu em produção. É a segunda vez que um commit agregado
custa rastreabilidade — a regra de **um commit por feature** existe por isto.
E custou mais do que registro: o mesmo commit deixou **o `typecheck` do
`packages/core` vermelho no HEAD desde 08/09** (TS2556 em `utils.test.ts` — um
spread de união de tuplas em `super`), coisa que passou porque o Vitest não
faz checagem de tipo e a validação da entrega parou no teste. Corrigido em
10/09; vale como lembrete de que `pnpm test` verde não substitui `typecheck`.

**O bug de fuso que o F61 fecha merece registro à parte porque não é específico
desta calculadora.** `new Date().toISOString().slice(0, 10)` devolve data
**UTC**, e a Vercel roda em UTC: das 21h de Brasília em diante, o site exibia a
data de amanhã. Apareceu no rótulo "Tabelas:" do FGTS (`2026-09-09` numa tela
das 22h do dia 08/09), que é o pior lugar possível — é um selo de confiança,
ninguém confere, e ele estava afirmando tanto que a página é do futuro quanto,
por ser `new Date()`, que as regras do FGTS mudam todo dia. A correção tem duas
metades: `hojeISO()` para quando a data de hoje é mesmo o que se quer, e
constante de vigência (`VIGENCIA_REGRAS_FGTS = '2020-01-01'`, da Lei
13.932/2019) para quando não é — FGTS não tem tabela anual como INSS e IRRF.

**As três pendências de painel, fechadas na mesma sessão pelo Paulo.**
(1) **F45** — `calculator_calculated` marcado como evento principal no GA4,
aberto desde 27/08 e já custando duas rodadas; é o que destrava o F17 e a
leitura do `calculator_edited` do F59. (2) **Bing Webmaster Tools** verificado,
fechando o furo de método achado em 08/09: o ciclo "avalie a pasta gsc" lia o
console do buscador que manda **zero** tráfego enquanto o Bing responde por
~60% dos usuários. (3) **AdSense** em "Preparando" com `ads.txt` "Autorizado" —
a verificação de posse do F19 passou e o `ads.txt` foi lido e aceito; conferido
também direto em produção (`curl`), meta e `ads.txt` batendo no mesmo
`pub-6380398318603111`, que é a invariante do `adsense.spec.ts`.

**A consequência de método das três juntas: nenhuma dá dado retroativo.** O GA4
não conta evento principal para trás, o BWT não traz histórico e a revisão do
AdSense tem prazo próprio. Isso define o calendário da próxima rodada — **antes
do fim de setembro, "avalie a pasta gsc" não tem o que dizer de novo.**

**Achado colateral no painel do AdSense, fora deste repositório:**
`recibofacil.com.br` aparece "Pronto" com `ads.txt` **"Não encontrado"**. É
exatamente a falha que o `adsense.spec.ts` daqui existe para travar — site
aprovado servindo anúncio sem `ads.txt` válido, que é dinheiro deixado na mesa
e nada no site acusa.

**F62 — o relatório de erro do GA4.** Os 286 `exception` para 323 `page_view`
estavam registrados aqui como suspeita de o `capture: true` do `ErrorLogger`
recolher erro de carregamento de recurso. **A leitura do código confirmou a
captura e desmentiu a atribuição:** o caminho do recurso chama
`analytics.jsError`, que sempre mandou `fatal: false`; os fatais vêm de
`errorOccurred`, usado pelos error boundaries **e pelo `unhandledrejection`**.
Duas misturas independentes, e a lição é de método — a resposta estava a duas
linhas de código de distância, não no painel, e o breakdown por `description`
que ficou de vir do Paulo desde 20/08 teria confirmado o sintoma sem apontar
nenhuma das duas causas.

Corrigido na origem, porque é o único lugar onde ainda dá: um `exception` com
`description` vazia não tem como ser reclassificado depois. Falha de recurso
virou evento próprio **`resource_error`** (o suspeito nº 1 é adblock derrubando
Clarity e gtag — não é erro do site e não pode contaminar o relatório de erro
do site); `unhandledrejection` e recuperação de chunk passaram a `fatal: false`,
deixando **`fatal` com o significado que o GA4 lhe dá: "a pessoa perdeu a
página"**, coisa que só error boundary sabe; e `exception` não sai mais sem
`description` — erro de script cross-origin chega com `message` vazia e sem
`filename`, e era a linha em branco do painel. Somados, dedupe por assinatura e
teto de 10 eventos por sessão: **proporção de ~1:1 com pageview nunca é "um
erro diferente por visita"**, é o mesmo erro repetindo, afogando o relatório e
gastando cota de evento.

**O que o F62 deliberadamente não faz é adivinhar a causa** — ele faz o próximo
export dizer sozinho qual é. Se em outubro o `resource_error` dominar, é
bloqueio de tracker e não há o que corrigir no site; se sobrarem `exception`
não-fatais com `description` real, aí sim há bug de JavaScript para caçar.

**E a suíte e2e deu o primeiro exemplo real antes mesmo do deploy:** a execução
completa quebrou o teste novo porque apareceu um `resource_error` a mais —
`va.vercel-scripts.com/v1/script.debug.js`, o próprio script do Vercel
Analytics falhando em dev. É exatamente o tipo de evento que antes entrava como
`exception` e inflava a contagem. O teste é que estava errado ao contar o total
em vez de filtrar pelo recurso do caso; corrigido, e a falha virou a melhor
evidência de que a separação faz sentido.

**O primeiro dia de Bing Webmaster Tools, e ele reescreve o diagnóstico do
projeto.** Paulo mandou o print de 24h ainda durante a sessão: **3 cliques em
1 dia**, contra os 3 cliques em 3 meses do GSC. As posições não se parecem em
nada com as do Google — `calculo de rescisão trabalhista online gratis` em
**4,0** com CTR de 50%, `calculos de rescisão de trabalho gratis` em 6,0 com
33%, `calculadora de férias 2026` em 9,0 com 12,5% — enquanto o export de 08/09
mostrava 95,7% das impressões do Google em posição pior que 60. **A conclusão
de método é dura e vale para trás: tudo o que este arquivo registrou como
"CTR ~0%" desde 19/07 era uma descrição do Google, não do produto.** Quando o
site aparece em 1ª página, as pessoas clicam. O problema nunca foi title,
snippet ou proposta de valor — é posição, e posição no Google é autoridade
(F15).

Uma ressalva para não repetir o erro na direção oposta: **é 1 dia e 9 linhas**,
com ruído evidente (`gorditas near me`, `galaxy s22 plus to buy`, `best
merengon near me` — o Bing conta impressão em contexto amplo). Não dá base para
decisão de orçamento. O que ele já autoriza é parar de usar o GSC como
termômetro do projeto. **O alvo acionável que dá para tirar dele agora:**
`calculadora irrf 2026`, 12 impressões (a maior do dia), posição **6,67** e
**zero clique** — a única query de topo sem clique nenhum, e logo na página que
é a nº 1 do site em citação por IA (F55). Título e descrição do IRRF na SERP do
Bing são o próximo experimento barato, e agora com um painel de 7 dias para
medir em vez de 90.

### 2026-09-10 — F63: a aposentadoria não encerra o contrato

Pendência registrada em 08/09 como "achado no motor que NÃO foi corrigido e
precisa de decisão". Paulo mandou atacar.

**O que estava errado.** `percentualMultaFGTS` colocava `aposentadoria` na
mesma faixa de `sem_justa_causa`, e `calcularDiasAvisoPrevio` lhe dava aviso
proporcional integral — o resultado saía **idêntico** ao da demissão sem justa
causa. A premissa embutida é a de que aposentar-se é, por si, um modo de
terminar o contrato, e ela foi derrubada duas vezes: o STF declarou
inconstitucionais os §§ 1º e 2º do art. 453 da CLT (**ADI 1.721 e 1.770**) e a
**OJ 361 da SDI-1 do TST** fixou que a aposentadoria espontânea não extingue o
contrato se o empregado continua trabalhando, sendo a multa de 40% devida **na
dispensa imotivada**, sobre a totalidade dos depósitos. Quem encerra o contrato
é a empresa ou o trabalhador — e é isso que define as verbas.

**O tamanho do erro, com os números do próprio motor:** salário de R$ 3.000,
R$ 9.000 de saldo de FGTS e 3 anos de casa davam **R$ 11.310,64** contra os
**R$ 2.692,91** da saída a pedido. R$ 8.617,73 de diferença, num número que a
pessoa leva para uma conversa de desligamento.

**A decisão de produto, e ela repete um padrão que já é do projeto.** O
formulário **não pergunta de quem partiu a saída**, que é o fato que decide
tudo. Em vez de escolher em silêncio, o cálculo assume o sentido usual de "vou
me aposentar e sair" (saída a pedido), **diz que assumiu** em três `avisos`, e
mantém o cenário oposto visível como **linha `neutro` fora da soma** — "Multa
de 40% — só se o desligamento partir da empresa". É o mesmo desenho do F40 (as
duas leituras do aviso prévio no acordo mútuo) e do F58 (`neutro` é o que
impede a linha de ser lida como dinheiro a receber).

**A confusão que provavelmente produziu o `0.4` original, e que vale guardar
porque vai reaparecer:** a aposentadoria **libera o saque** do saldo do FGTS
(Lei 8.036/1990, art. 20, III) mesmo sem multa nenhuma. Sacar o que já é seu e
receber os 40% pagos pelo empregador são coisas diferentes — e o conteúdo novo
diz isso com todas as letras, porque é o erro mais comum sobre o tema.

**Achado colateral de escopo:** a opção "Aposentadoria" era oferecida no
`select` desde o F3 e **a palavra não aparecia uma única vez no MDX** da
rescisão — nem na tabela de tipos, nem na seção "Cálculo por motivo de saída"
do F39. Uma modalidade que o formulário oferece e o conteúdo não explica é
lacuna de produto e de SEO ao mesmo tempo. Ganhou seção própria com os dois
cenários e 2 perguntas de FAQ (que entram no `FAQPage` do F10).

O hub do F58 acompanhou sem mudança de lógica — sua linha de multa já derivava
de `percentualMultaFGTS` —, mas passou a **herdar os `avisos` da rescisão**,
porque a premissa de quem encerrou o contrato muda os quatro blocos, não só o
primeiro.

### 2026-09-08 — Export novo (GSC+GA4), AdSense verificado e o F60

Paulo pediu "avalie a pasta gsc", depois mandou o Publisher ID do AdSense e por
fim mandou executar a pauta de conteúdo que saiu da análise. Três coisas numa
sessão: diagnóstico, F19 pela metade e F60 inteiro.

**Método / qualidade do export.** GSC veio em pasta datada
(`...-Performance-on-Search-2026-09-08/`, 07/06→06/09) e o GA4 solto na raiz,
como sempre — a pendência de mover para pasta datada segue aberta desde 20/08.
**O Clarity não veio desta vez**, e ele é a etapa 1 do procedimento do F52 (a
única fonte de keyword research com ciclo de 7 dias). Sem ele, esta rodada não
teve leitura de GEO/citação de IA.

**1. GSC: 2.562 impressões, 3 cliques, e as impressões voltaram a subir.**

| Semana | Impr | Impr/dia | Pos |
|---|---|---|---|
| W33 (10/08) | 168 | 24,0 | 59,9 |
| W34 (17/08) | 167 | 23,9 | **58,4** |
| W35 (24/08) | 186 | 26,6 | 68,1 |
| W36 (31/08) | **265** | **37,9** | 66,2 |

W36 é a semana de maior volume desde 13/07, e a posição piorou de 58,4 para
66,2. **É reexpansão, não regressão** — o mesmo padrão já registrado em 27/08:
quando o Google volta a testar o site em cauda longa nova, impressão sobe e
posição média cai. Bate com o cronograma de deploys (F56 em 29/08, F22 em
30/08, F58 em 01/09).

**95,7% das impressões estão em posição pior que 60.** Em posição 66 não existe
CTR — nenhum trabalho de title resolve isso.

Páginas, com delta contra 27/08:

| Página | 27/08 → 08/09 | Pos |
|---|---|---|
| `rescisao-trabalhista` | 138 → **266** (+93%) | 91,5 |
| `decimo-terceiro` | 130 → **239** (+84%) | 85,8 |
| `porcentagem` | 208 → 279 | 9,0 |
| `financiamento` | 298 → 342 | 80,1 |
| `cdb` | — → 52 (**1 clique**) | 56,4 |
| `das-mei` | 36 → 20 | 15,9 |

**Correção de registro:** a tabela de 27/08 atribuiu "88 impressões, pos. 81" ao
`irrf`. Este export separa os dois — `irpf` 91 @ 80,2 e `irrf` 24 @ 82,5. Os 88
eram do `irpf`.

**2. Achado novo: 20% das impressões do site são estruturalmente inclicáveis.**
`porcentagem` (279 impr. @ pos. **9,0**) e `margem-lucro` (230 @ **11,0**) somam
**509 impressões em página 1 e zero cliques** — e as queries delas somam só
**12 impressões** no relatório de consultas. O resto está no bucket
**anonimizado** (761 impressões, 29% do site), que é onde o GSC joga query feita
por pouquíssima gente. A assinatura é clara: são perguntas aritméticas únicas
("quanto é 37% de 4.820") em que o Google responde na própria SERP com a
calculadora dele.

**Consequência de leitura, que vale mais que o achado:** olhar a tabela de
páginas sem esse filtro leva à conclusão oposta — "porcentagem é a melhor
página do site, pos. 9". É a pior em valor. **Não investir mais nessas duas.**

**3. GA4 (28 dias, 11/08→07/09): 177 usuários, e o Google é zero.**
`bing` 109 sessões · direto 76 · `band.com.br` 15 · Yahoo 10 · ChatGPT 8 ·
`qmix` 6 · Copilot 5 · DuckDuckGo 2. **`google / organic` não aparece na
lista.** O ecossistema Bing (Bing+Yahoo+DDG) é ~60% dos usuários.

**Mobile foi de 7,7% para 16,3%** (29 de 178). É a primeira medição do F56, e
ele funcionou: a correção de viewport destravou metade do público que o site
tinha e não atendia.

**4. Duas pendências de medição que não andaram.**
- **F45 continua pendente.** "Leads qualificados: 0" em todos os 28 dias, com
  242 `calculator_calculated` coletados. Mesmo achado de 27/08, duas semanas
  depois. Cinco minutos de painel, e é o que bloqueia o F17.
- **286 eventos `exception` para 323 `page_view`** — quase um por pageview, e
  `errorOccurred` os marca como `fatal: true`. O export do GA4 não traz a
  dimensão `description`. Suspeita concreta a checar primeiro:
  `ErrorLogger.tsx` registra o listener com `capture: true`, o que captura
  também **erro de carregamento de recurso** e o manda para `jsError` com
  mensagem vazia. Se for isso, é ruído poluindo o dado; se não for, é quebra em
  quase toda sessão. **Paulo ficou de mandar o breakdown por `description` — é
  a mesma pendência aberta em 20/08 (na época eram 334).**

**5. `calculator_edited` não aparece no export, e não é bug.**
`calculator_saved` = 8 e `calculator_shared` = 4 em 28 dias: o caminho que o F59
otimiza é percorrido ~12 vezes por mês. **A pergunta em aberto do F59 ("o botão
deveria aparecer em toda abertura com resultado?") não vai ser respondida por
dado neste volume** — decidir por julgamento e seguir.

**6. O F58 tem 9 pageviews no GA4 e ZERO impressões no GSC.** Seis dias na
janela. Vale conferir se o IndexNow do F46 pegou a rota — ela não está no
`calculatorRegistry`, mora em `lib/hubTrabalhista.ts`, e se o `sitemap.xml` não
a incluir o script não a submete.

**7. O furo de método: o ciclo lê o console do buscador que manda zero
tráfego.** O procedimento do `README.md` cobre GSC + GA4 + Clarity. O **Bing
Webmaster Tools não aparece em lugar nenhum do repositório** — só o IndexNow,
que fala com o Bing mas não escuta. O Bing é ~100% do tráfego orgânico real, o
BWT é grátis, e dá query/posição/clique **sem a média de 90 dias que trava a
leitura do GSC** (a armadilha registrada em 27/08). Verificar o site no BWT e
exportá-lo para `gsc/` é o maior ganho de qualidade de sinal do ciclo inteiro, e
é setup de uma tarde. **Item nº 1 da próxima rodada.**

**8. F19 pela metade — conta do AdSense verificada.** Paulo mandou a meta tag
com o Publisher ID no meio da sessão. Entregue só a verificação de posse: meta
`google-adsense-account` no `<head>` e `ads.txt` real. **Nenhum `AdSlot` foi
posicionado** — onde colocar anúncio continua sendo decisão dele.

**A decisão que vale registrar: o Publisher ID é constante em `lib/seo.ts`, não
env.** Mesmo raciocínio da chave do IndexNow — é público por design (sai no
`<head>`, no `ads.txt` e em cada unidade) e o `ads.txt` é arquivo estático que
não interpola env. Tirá-lo do código criaria **duas fontes de verdade para o
mesmo valor**, e a falha seria silenciosa. `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`
mudou de papel: deixou de guardar o ID e passou a ser a chave que **liga a
exibição**; vazia até a aprovação. `adsense.spec.ts` trava a invariante que
machuca — **meta e `ads.txt` não podem divergir**, que é a falha clássica em que
a verificação passa, o `ads.txt` é marcado inválido semanas depois e nada no
site acusa.

**Sequência que a conta nova cria:** com o AdSense existindo, o **F45 ficou mais
barato de fazer e mais caro de adiar** — são dois produtos Google que passam a
conversar, e o GA4 não retroage.

**9. F60 — 4 posts do cluster 13º/rescisão.** Paulo mandou executar a pauta. Os
quatro custaram exatamente o que o F22 prometeu: uma entrada em `lib/blog.ts` e
um `.mdx` cada.

- `rescisao-por-acordo-mutuo-quanto-voce-recebe` — publica as **duas leituras do
  aviso prévio do F40** lado a lado (aos 10 anos, R$ 1.500 de diferença).
- `acerto-trabalhista-o-que-entra-e-quando-recebo` — derruba o "na justa causa
  não recebe nada": saldo e férias vencidas nunca se perdem, **R$ 4.489,58** no
  exemplo.
- `13-salario-proporcional-como-calcular` — o degrau dos 15 dias em junho, em
  que **um dia de admissão vale R$ 227,77**.
- `direitos-trabalhistas-na-demissao-guia-completo` — construído em torno da
  armadilha do F58.

**Campo `ctaHub` novo no registry do blog.** O post agregado manda o CTA de topo
para o hub, não para uma calculadora: quem pergunta "quais são todos os meus
direitos" precisa das quatro contas, e mandá-lo para a rescisão o obrigaria a
abrir outras três. `calculadoraPrincipal` continua preenchida porque é ela que
dá a identidade visual da og-image (F41/F42) — o hub não está no
`calculatorRegistry` de propósito. A metade recíproca é `postsDoHub()`, que faz
o hub apontar de volta; **sem isso o post nasceria órfão**, que é o erro que o
F43 existe para não repetir.

**O padrão que se confirma pela terceira vez (F58, e agora o post agregado):
quando uma página junta cálculos que já se contêm, a soma é o bug.** O guia
abre com "O erro de somar: R$ 36.681 que não existem" contra os R$ 15.558,57
reais, e um teste compara `boundingBox().y` para o aviso ficar **acima** da
tabela. É a conta errada que o leitor faz sozinho, e nenhum concorrente a
desfaz — vira diferencial de conteúdo, não só correção.

**Números todos do motor** (script descartável em `packages/core/src/__scratch__`,
removido depois), disciplina do F47/F49/F22: 11 tabelas, 9 exemplos nomeados, 23
valores travados em `blog-cluster-trabalhista.spec.ts`.

**Dois testes que a premissa nova quebrou, e o que eles ensinam.** O teste do
F22 exigia "Guia sobre este tema" na calculadora do 13º; ela ganhou um segundo
guia e o título virou plural. Corrigido para `Guias?` — **a invariante protegida
é o link de volta, não a quantidade**. E `GuiasRelacionados` ganhou `className`
opcional: na calculadora ele é irmão de topo e traz o próprio container, no hub
já está dentro de um, e repetir `px-4` recuava só aquela seção.

**Achado no motor que NÃO foi corrigido, e precisa de decisão.** Na tabela por
modalidade, `aposentadoria` devolve resultado **idêntico a `sem_justa_causa`** —
40% de multa de FGTS e aviso prévio integral. Para rescisão indireta está certo;
para aposentadoria é juridicamente contestado. **Omiti a modalidade das tabelas
dos posts** em vez de publicar afirmação que não se sustenta. Merece revisão à
parte de `packages/core/src/trabalhista/rescisao.ts`.

**Risco de canibalização registrado.** O post do 13º proporcional cobre
território que a seção "13º proporcional" do guia de 30/08 já tocava. Os dois
foram ligados nos dois sentidos e as intenções são distintas ("quando cai" ×
"quanto recebo se não trabalhei o ano todo"), mas **conferir no GSC em 3-4
semanas se estão competindo pela mesma query**; se estiverem, encurtar a seção
do post antigo e apontar para o novo.

**O que checar no próximo export (marco: 08/09):**
- **Posição de `rescisao-trabalhista` (91,5) e `decimo-terceiro` (85,8)** e se as
  impressões do cluster continuaram subindo — os 4 posts do F60 precisam de
  60-90 dias, então o export de outubro é cedo para posição, mas não para
  impressão do blog.
- **Se o F58 saiu de zero impressão** e se os 4 posts novos foram indexados.
- **`porcentagem` e `margem-lucro`:** confirmar que seguem em pos. ~10 com 0
  clique. Se confirmado duas rodadas seguidas, fechar a questão.
- **Breakdown de `exception` por `description`** — pendente desde 20/08.
- **Bing Webmaster Tools**, se o Paulo verificar o site.

### 2026-09-01 (parte 2) — F59: abrir cálculo pronto cai no resultado

Paulo notou o atrito e propôs a solução junto: abrir um cálculo salvo em
`/meus-calculos` ou por link compartilhado (F32/F37) leva a
`/calculadora/[slug]?d=…&calc=…`, o `autoSubmit` calcula — **e a viewport fica
no topo**. A pessoa pede um número e recebe o formulário de novo, com o
resultado abaixo da dobra. Nas calculadoras longas (rescisão, hora extra,
salário líquido) é meia tela de rolagem até o que ela veio buscar.

**O que acrescentei à ideia dele: foco, não só scroll.** `scrollIntoView`
sozinho move a tela e deixa o cursor de teclado e de leitor de tela parado onde
estava — a tela anda, o cursor não. A região do resultado já existia com
`role="region"` e `aria-label="Resultado do cálculo"`; faltava `tabIndex={-1}`
(focável por código, fora da ordem de Tab) e o `.focus()`. Mesmo tratamento no
contêiner do formulário, para o caminho de volta. `focus({ preventScroll: true })`
porque senão o navegador dá um segundo pulo depois do `scrollIntoView`.
**Regra geral que vale registrar: navegação programática é scroll + foco; só
scroll é meia implementação, e é a metade que exclui quem mais precisa dela.**

**Três limites deliberados, cada um com teste próprio:**

1. **Só com `?d=`/`?calc=` na URL.** Em visita normal a página tem de abrir no
   H1. O tráfego é praticamente todo orgânico — direcionar sempre ao resultado
   desfaria na prática o conteúdo editorial do F47 e a escultura de link do
   F43, que são o investimento de SEO dos últimos dois meses.
2. **Uma vez só**, no primeiro resultado auto-calculado (guarda em `useRef`).
   Sem isso, recalcular depois de editar rolaria a página de novo, e a rolagem
   programática brigaria com a restauração de scroll do botão "voltar".
3. **O botão "Editar cálculo" não aparece em cálculo feito na hora.** Ali o
   formulário está logo acima, na mesma tela. Foi a dúvida de escopo que
   levantei antes de implementar e o Paulo mandou seguir o palpite: limitar ao
   caso que originou a ideia e medir depois. Daí o evento `calculator_edited`
   novo — a pergunta "deveria aparecer sempre?" tem de ser respondida com uso
   medido, não com palpite. **Isso depende do F45** (marcar key events no GA4)
   para valer alguma coisa no painel.

**Decisão de teste, a pedido do Paulo: uma cobertura por página, não uma
amostra.** À primeira vista é redundante — o comportamento mora num componente
só (`CalculadoraPageClient`), então uma calculadora provaria a lógica. Mas o
que varia é a **altura do formulário**: 2 campos no IMC, 11 na hora extra. Numa
página curta o resultado pode já estar visível sem rolagem nenhuma, e é
justamente nas longas que a regressão passaria despercebida. Mesmo critério que
o F56 usou para cobrir as 20 páginas.

**O fixture pagou por si na primeira execução.** Para abrir 20 cálculos prontos
sem preencher 20 formulários, os links são montados direto com
`encodeShareData` (o alvo do teste é a abertura; o preenchimento já está no
`share-link.spec.ts`). Isso exigiu um mapa de entrada válida por calculadora —
e ele pegou de cara que **`calorias` mede altura em centímetros (100–250) e
`imc` mede em metros**. Duas calculadoras da mesma categoria, unidades
diferentes, nada no código avisando. Há trava de cobertura do fixture contra o
`calculatorRegistry`, para a 21ª calculadora não passar batido.

### 2026-09-01 — F58: o hub trabalhista, e as duas somas que não podem acontecer

Paulo mandou implementar o F58 — o hub "Calculadora Trabalhista Completa", que
era o **último item de P1 sem dependência de decisão dele**. O item existia
desde 20/08 com o diagnóstico já pronto: dezenas de queries de intenção
agregada (`calculo trabalhista completo`, `como calcular direitos
trabalhistas`) que nenhuma das 10 calculadoras trabalhistas atende sozinha,
porque cada uma responde um pedaço, e o único candidato que o site tinha para
elas era `/categoria/trabalhista` — um índice de links, com **1 pageview em 3
meses**. Índice não calcula nada; quem busca "cálculo trabalhista completo" não
quer escolher uma calculadora.

**O que ficou pronto.** Rota `/calculadora-trabalhista-completa`, formulário de
7 campos e quatro blocos de resultado (rescisão, 13º, férias, FGTS), cada um com
detalhamento linha a linha, base legal e link para a calculadora dedicada.

**Decisão 1 — o encadeamento é core, não página.** `calcularPanoramaTrabalhista`
mora em `packages/core/src/trabalhista/panorama.ts` e não inventa regra nenhuma:
deriva os parâmetros das quatro funções que já existem. Isso deu 19 testes
Vitest que rodam sem browser, e mantém o hub reaproveitável pelo Tauri, pelo
plugin do Sheets e por uma API futura — que é o motivo de o `packages/core`
existir. A alternativa (montar o encadeamento dentro do componente React) teria
custado e2e para testar aritmética.

**Decisão 2 — o hub NÃO entrou no `calculatorRegistry`.** Ele mora em
`lib/hubTrabalhista.ts`. Entrar no registry parecia tentador (ganharia rota,
og-image, sitemap e schema de graça), mas: (a) mudaria a contagem de "20
calculadoras" que o site declara em home, `/sobre`, FAQ, `SeoContent`,
`HowItWorks`, `FinalCta` e na og-image do site; (b) o colocaria na listagem de
`/categoria/trabalhista` **concorrendo com as quatro que ele agrega**; e (c) o
registry casa 1-para-1 com um formulário em `forms/` e um MDX em
`content/calculadoras/`, e o hub não é nem uma coisa nem outra. Registry é para
ferramenta de uma conta só.

**A armadilha central, e o motivo de o módulo existir: os quatro números não se
somam.** A rescisão já embute o 13º proporcional, as férias proporcionais e a
multa de 40% do FGTS. Um agregador ingênuo somaria os quatro blocos e mostraria
um "total geral" — e o erro não é pequeno: para salário de R$ 3.000 com 5 anos
de casa, a soma dá **R$ 36.681,33** contra os **R$ 15.558,57** que realmente
entram na conta. **Mais que o dobro.** Três defesas, e vale registrar as três
porque são reaproveitáveis em qualquer agregação futura:

1. A página **não oferece** total geral. Nenhum campo do resultado é uma soma.
2. O consolidado sai **inteiro como `neutro`**. A UI (`CalculatorResult` e o
   bloco novo) só desenha o sinal (+)/(−) em `credito`/`debito` — marcar tudo
   como neutro é o que impede a lista de *parecer* uma soma. Há teste travando
   que nenhuma linha do consolidado é crédito ou débito.
3. O aviso aparece **acima** dos números, não em rodapé de letra miúda. A
   leitura errada acontece no primeiro olhar, então é aí que ela é
   interceptada — e há teste comparando `boundingBox().y` do aviso com o do
   primeiro bloco.

**A segunda soma indevida, mais sutil, também fechada com teste.** O saldo do
FGTS que o usuário digita **já contém** os depósitos do contrato. Passá-lo como
`saldoAtual` para o `calcularFGTS` na hora de projetar somaria os mesmos 8%
duas vezes. A projeção roda com `saldoAtual: 0` de propósito, e o bloco usa a
outra metade da conta — *quanto deveria ter sido depositado* — para comparar
com o extrato. Isso virou um recurso: depósito faltando é problema comum e
quase ninguém confere. A ressalva honesta está no código, no aviso e no texto:
a estimativa usa o salário atual em todos os meses e ignora o rendimento do
fundo, então saldo real **acima** do estimado é normal (aumentos + rendimento);
o sinal de alerta é o contrário.

**Escopo do formulário — a regra que fechou a discussão.** Os 7 campos são
exatamente os da rescisão, nada a mais. `diasFaltas` (que reduz os dias de
férias pelo art. 130) e `diasAbono` ficaram de fora mesmo com o motor
aceitando os dois: **o hub tem de custar menos preenchimento que abrir quatro
calculadoras, não mais**. A página avisa que assumiu zero faltas e manda quem
tem faltas para a calculadora de férias. É a mesma lógica do F34/F50 sobre
atrito, aplicada a "que campo nem deveria existir aqui".

**Link recíproco (F43) — sem ele o hub nasceria órfão.** Com Authority Score 2
e um backlink reconhecido, o PageRank interno é o único capital de autoridade
sob controle. O hub recebe link do CTA no fim das quatro calculadoras
encadeadas (`HubTrabalhistaCta`, que renderiza `null` nas outras 16 — bloco
fora do tema é o link sem sinal que o F43 removeu do rodapé), do destaque em
`/categoria/trabalhista` e de uma entrada no rodapé. **No rodapé ele entrou na
seção de hubs**, junto de `/categorias` e `/blog`, e não em "Mais buscadas":
aquela lista é ordenada por impressão medida no GSC e o hub não tem impressão
nenhuma ainda. Colocá-lo lá seria inventar prioridade.

**Efeito colateral nos testes que vale como padrão.** Assim que o rodapé passou
a linkar o hub em 100% das páginas, quatro testes novos quebraram: "a página X
linka o hub" passou a ser verdade em toda parte. A correção não foi afrouxar a
asserção, foi recortar o escopo — `getByRole('main')` em vez da página inteira.
**Teste de link interno precisa excluir o rodapé, senão mede o rodapé.**

**Disciplina do F47 mantida:** as 3 tabelas do conteúdo e todos os valores
citados na FAQ saíram de um script descartável que roda o próprio motor
(criado em `packages/core/src/__scratch__`, removido depois), não de conta à
mão. Seis deles estão travados em e2e, incluindo o **R$ 36.681,33** — o
contraexemplo da soma indevida é justamente o número que dá o tamanho do erro,
e se ele mudar o texto passa a mentir.

**O que checar no próximo export:** se `/calculadora-trabalhista-completa`
começa a aparecer em impressão para as queries agregadas, e se
`/categoria/trabalhista` sobe junto (a hipótese é que o hub dê à categoria um
destino que ela não tinha). E o de sempre: F56 (29/08), F22 (30/08) e agora o
F58 subiram em quatro dias — nenhum teve tempo de dar sinal, então o próximo
ciclo "avalie a pasta gsc" é medição, não implementação.

### 2026-08-30 — F22: o blog existe, e começou pelo 13º

Paulo mandou fazer o F22 depois de eu apontar que era a única coisa do Bloco D
que é trabalho de construir (F15 e F19 são decisão de orçamento/critério) **e a
única com prazo**. Eu havia levantado a pergunta de escopo — blog inteiro ou só
o primeiro artigo no menor arcabouço? — e a resposta foi "faça o F22", então
entreguei a infra completa.

**Por que o 13º, e por que agora.** A busca pica em nov/dez e o diário de 25/07
já tinha registrado o risco de calendário deste cluster: se atrasar, a janela
passa e o retorno só volta em dezembro do ano seguinte — **quase um ano
perdido**. Foi exatamente por esse risco que o 1º backlink foi para
`salario-liquido` e não para o 13º. Publicando em 30/08 sobram 60-90 dias de
maturação antes do pico. É também o maior cluster do site (~860k/mês), com a
página já retargetada no F27 e um backlink real da `acritica.com` apontando
para ela.

**O gancho do artigo saiu de olhar o calendário, não a SERP: 20 de dezembro de
2026 cai num domingo.** A Lei 4.749/1965 fixa esse dia como prazo da 2ª parcela
e não prevê prorrogação para o dia útil seguinte, então o pagamento antecipa
para sexta, **18/12**. É um fato específico, verificável e com data de validade
— o tipo de coisa que responde "quando cai o 13º 2026" melhor que um texto
genérico, e que nenhum artigo perene tem.

**Disciplina do F47/F49 mantida: nenhum número foi escrito à mão.** As 3
tabelas, os 4 exemplos nomeados e o degrau da regra dos 15 dias saíram de
execuções do `calcularDecimoTerceiro`, por script descartável em
`packages/core/src/__scratch__` (removido depois). O achado mais vendável do
artigo saiu disso: **um dia de diferença na data de admissão vale R$ 246,81**
(admitido dia 17 vs dia 18 de março, salário R$ 3.600 — 10 meses contra 9).
Nove desses valores estão travados em e2e: se uma regra de INSS/IRRF mudar, o
artigo não pode divergir da calculadora em silêncio.

**O blog não é uma ilha.** O link é recíproco nos dois sentidos (F43): o post
tem CTA para a calculadora acima do conteúdo — quem já sabe a data e quer o
número não deveria rolar o artigo inteiro — e cita outras 4; a calculadora
ganhou o bloco `GuiasRelacionados`. **Ele não renderiza nada nas 19
calculadoras sem post**, e isso é decisão, não descuido: um bloco vazio em 19
páginas seria exatamente o link sem sinal que o F43 removeu do rodapé. A
identidade visual também não é própria — a og-image e os cards herdam ícone e
cor da calculadora que o post alimenta, então o blog entra dentro do sistema do
F41 em vez de criar uma paleta paralela.

**Bug de estilo achado ao olhar a página pronta — e ele afetava as 20
calculadoras.** Com `behavior: 'wrap'` no `rehype-autolink-headings`, todo H2
dos MDX vem embrulhado num `<a>`, e a regra `.prose a` do `globals.css`
pintava **todos os títulos de azul sublinhado**, com cara de link de corpo de
texto. Eu tinha registrado isso no F56 como "decisão de design, não é mobile" e
deixado para o Paulo. **Estava certo em sinalizar e errado em deixar parado:**
num artigo os H2 são a estrutura inteira da página, então o que era cosmético
numa calculadora virou defeito da entrega. A âncora continua clicável (é assim
que se copia o link de uma seção); ela só voltou a parecer um título.

**Um teste obsoleto foi substituído, não apagado.** O do F44 travava "o rodapé
não linka `/blog`" — e o próprio comentário dizia "enquanto o F22 não existir,
o link não pode voltar". O F22 existe. Em vez de deletar, virou a invariante
durável e mais forte: **nenhum link do rodapé pode responder diferente de
200**, varrendo todos os hrefs. Pega o próximo link morto, não só aquele.
Vale como padrão: quando um teste fica obsoleto porque a premissa mudou,
procurar a invariante que ele estava tentando proteger.

**Custo marginal do próximo post é quase zero:** uma entrada em `lib/blog.ts` e
um `.mdx` em `content/blog/`. Rota, SEO, schema, og-image, sitemap e links
recíprocos são automáticos. **O que checar no próximo export:** impressões de
`/blog/decimo-terceiro-2026-quando-cai-e-quanto-voce-recebe` e se a
`decimo-terceiro` (130 impr., pos. 81,5 em 27/08) sobe junto — a hipótese é que
o post capture a busca informacional e passe autoridade para a calculadora.
**Revisar o artigo todo ano em agosto**, antes da janela: as datas mudam de dia
da semana e as tabelas de INSS/IRRF mudam de valor (o campo `sazonalidade` do
registry existe para não deixar essa decisão se perder).

### 2026-08-29 — F56: o celular, e por que a hipótese estava errada

Paulo mandou executar o F56 (D1 do Bloco D). O item existia porque o GSC de
27/08 mostrou a assimetria mais estranha do export: **765 impressões no celular
em posição 54,6** contra 1.413 no desktop em posição 71 — o Google rankeia o
site **16 posições melhor no celular** — e **zero cliques**. É a única fatia do
funil em que o Google já entrega e o site não colhe nada, e nunca tinha sido
olhada: todas as medições de Core Web Vitals do Clarity são de sessão desktop,
porque o tráfego real vem do Bing no Windows (Edge 61%).

**A hipótese registrada em 27/08 era performance. Ela morreu na primeira
medição.** Lighthouse mobile em `hora-extra` (build de produção, não dev):
**94** de performance, 100 de acessibilidade, 100 de SEO, LCP 2,9 s, TBT 140 ms,
CLS 0,002. Não há problema de velocidade para resolver. Vale registrar como
método: **a auditoria começou pela hipótese barata de descartar, e descartá-la
em 3 minutos é o que liberou o resto da sessão para achar o problema real.**

**O problema é render, e a causa raiz é uma linha de configuração.** Auditoria
de viewport nas 22 rotas em Pixel 7 achou **9 das 20 calculadoras rolando na
horizontal**: `financiamento` com 606px de conteúdo numa viewport de 412,
`das-mei` 514, `fgts` 508, `poupanca` 462, `rescisao-trabalhista` 448, `cdb`
434, `emprestimo` 432, `calorias` e `salario-liquido` 418. A culpada era sempre
a mesma — a tabela do MDX — e o wrapper `overflow-x-auto` que deveria contê-la
**estava escrito certo em `mdx-components.tsx` desde sempre**.

**`apps/web/mdx-components.tsx` mora na raiz de `apps/web` (exigência do App
Router) e estava fora de TODOS os globs de `content` do `tailwind.config.ts`,
que cobriam `./src/pages`, `./src/components`, `./src/app`, `./content/**.mdx`
e `packages/ui/src`. Nenhuma classe daquele arquivo era gerada.** Conferido no
bundle, uma a uma: `overflow-x-auto`, `min-w-full`, `border-collapse`,
`scroll-mt-20`, `border-l-4`, `border-brand-500` e `italic` — todas ausentes do
CSS. O `class=` estava no HTML; a regra não existia.

**A lição que vale além deste bug: classe morta do Tailwind falha em silêncio.**
Não há erro de build, não há aviso, o atributo aparece no DevTools e o elemento
só não tem o estilo. Foi por isso que sobreviveu meses sem ninguém notar — e
por isso as tabelas do F47 (27/08) **nasceram desktop-only sem ninguém ver**:
elas foram escritas, testadas por conteúdo (`tabelas-referencia.spec.ts` checa
os números) e nunca olhadas num viewport pequeno. **Teste de conteúdo não é
teste de layout.** Efeito colateral do mesmo bug: o blockquote nunca teve a
borda de marca, e o `scroll-mt-20` dos H2 nunca compensou o cabeçalho — todo
link de âncora dos MDX caía com o título colado no topo.

**Segundo achado, independente do primeiro: o zoom do iOS.** Todos os campos de
formulário eram `text-sm` (14px), e o Safari no iOS dá **zoom automático** ao
focar um campo com fonte menor que 16px — e sair do zoom depois é manual. **iOS
é 27 dos 50 usuários mobile do GA4 (54%)**, mesmo sendo 4% do site inteiro.
Os 6 tipos de campo passaram a `text-base md:text-sm`: 16px no celular, a
densidade do desktop preservada. Isso vale para qualquer campo novo daqui pra
frente.

**O que foi entregue** (v0.27.0): a linha no glob do Tailwind, os campos a 16px,
o wrapper de tabela promovido a `role="region"` com `tabIndex` e rótulo (região
rolável precisa ser alcançável por teclado, senão quem navega por Tab não chega
às colunas escondidas), e os 6 links "Ver todas" de `/categorias` de 20px para o
piso de 24px da WCAG 2.2. A suíte `viewport-mobile.mobile.spec.ts` trava as duas
invariantes **nas 20 calculadoras**, e não só nas 9 quebradas, porque a causa era
global — 30 testes no projeto `mobile-chromium` que já existia desde o F34.
Verificado contra build de produção limpo: as 22 rotas cabem na viewport, nenhum
campo abaixo de 16px, e a tabela larga do FGTS rola dentro da própria caixa
(491px de conteúdo em 380px). Suíte desktop segue em 107 testes, core em 380.

**Ressalva honesta sobre o retorno esperado.** Isto remove um defeito real de
usabilidade que o Google mede, mas **não há prova de que era a causa dos 0
cliques** — CTR em posição 54 é próximo de zero de qualquer jeito, e as 765
impressões estão quase todas fora da 1ª página. O ganho provável é indireto
(sinal de usabilidade, e não perder o clique quando a posição melhorar), não um
salto de CTR. **O que checar no próximo export:** cliques no celular saindo de
0, e a posição média do celular contra os 54,6 de partida.

**Achado que NÃO foi corrigido, porque é decisão de design e não é mobile.** Com
`behavior: 'wrap'` no `rehype-autolink-headings`, todo H2 dos MDX é embrulhado
num `<a>`, e a regra `.prose a` do `globals.css` (`text-blue-600 underline`)
pinta **todos os títulos de azul sublinhado**, com cara de link. Vale nos dois
viewports e é anterior a esta sessão (o `globals.css` não foi tocado aqui).
Fica registrado para o Paulo decidir se títulos devem parecer links.

### 2026-08-27 — Export novo (GSC+GA4+Clarity), comparação com concorrentes e plano de tráfego

Paulo pediu "avalie a pasta gsc" com quatro perguntas explícitas: avaliar os
dados, comparar com commits/features pendentes, comparar com concorrentes e
gerar um plano para aumentar tráfego. **Nada foi implementado nesta sessão** —
é diagnóstico + plano.

**Método / qualidade do export.** GSC veio em pasta datada
(`...-Performance-on-Search-2026-08-27/`, 3 meses: 26/05→25/08), como
combinado. GA4 e Clarity continuam **soltos na raiz de `gsc/`** — a pendência
de 20/08 de movê-los para pasta datada não foi feita. **Armadilha nova:** o
export do GA4 desta vez é de **01/01→27/08 (vida inteira)**, não de 28 dias
como o anterior — os totais **não** são comparáveis com os 207 usuários de
20/08. O que dá para comparar é a série semanal, que veio junto.

**1. GSC: 4º clique, platô de posição em 4 semanas, impressões caindo.**
2.191 impressões, **3 cliques na janela** (11/06, 09/08 e **25/08 — novo**),
CTR 0,14%, posição 65,2. Contando a vida inteira são **4 cliques**, e o
intervalo entre eles está encurtando: 25/05 → 11/06 (17d) → 09/08 (59d) →
25/08 (16d).

Série semanal completa, corrigindo a tabela de 20/08 (a W34 lá tinha só 2 dias):

| Semana | Impr | Impr/dia | Posição |
|---|---|---|---|
| W27 (29/06) | 286 | 40,9 | 82,3 |
| W28 (06/07) | 275 | 39,3 | 75,4 |
| W29 (13/07) | 299 | 42,7 | 80,0 |
| W30 (20/07) | 157 | 22,4 | 78,5 |
| W31 (27/07) | 263 | 37,6 | 65,3 |
| W32 (03/08) | 119 | 17,0 | **59,7** |
| W33 (10/08) | 168 | 24,0 | 59,9 |
| W34 (17/08) | 167 | 23,9 | **58,4** |
| W35 (24/08, 2d) | 37 | 18,5 | 58,8 |

Duas leituras que se sustentam juntas: a posição **estabilizou em ~59 por
quatro semanas** (o degrau do link da Band ficou de pé, não regrediu), e as
**impressões caíram 45%** frente ao pico de julho (41/dia → 23/dia). O padrão
é consistente: quando a posição era 80, o Google testava o site em muito mais
cauda longa ruim; ao consolidar em ~59, ele mostra menos e mais focado. Não é
queda de tráfego (não havia tráfego), é o Google refinando o entendimento.

**Páginas (3 meses), com delta contra o export de 20/08 onde havia número:**

| Página | Impr | Δ 7d | Posição |
|---|---|---|---|
| `financiamento` | **298** | +34 | 81,8 |
| `hora-extra` | 240 | +3 | 84,7 |
| `margem-lucro` | 218 | — | **11,2** |
| `porcentagem` | 208 | +31 | **9,1** |
| `fgts` | 207 | +1 | 90,0 |
| `ferias` | 205 | — | 88,1 |
| `poupanca` | 195 | — | 65,5 |
| `rescisao-trabalhista` | 138 | — | 90,8 |
| `decimo-terceiro` | 130 | — | 81,5 |
| `irrf` | 88 | −1 | 81,0 |
| `salario-liquido` | 76 | −2 | 69,0 |
| `tesouro-direto` | 53 | — | 53,7 |
| `das-mei` | 36 | — | **12,3** |
| `/` (home) | **6** | — | 3,5 |

`financiamento` (+34) e `porcentagem` (+31) sozinhas absorveram **~metade de
todas as impressões novas da semana**. E a **home tem 6 impressões em 3
meses** — o site é 100% páginas de calculadora; a marca não existe em busca.

**F38/F39 no Google: cedo demais para medir, e o formato do export esconde.**
O cluster "simulador/simulação" está em pos. **83,6** (era 83,3 em 20/08) e o
cluster rescisão/demissão em **93,6** (era 93,7). Parece "não moveu", mas o
número é média de **3 meses** e o deploy tem **5 dias** dentro da janela —
matematicamente não teria como aparecer. **Para medir F38/F39 no Google é
preciso filtrar o GSC por data (26/08 em diante) ou esperar o export de
outubro.** Registrado para não repetir a leitura errada.

**2. O único efeito medido do F38 veio pelo Copilot — em 7 dias.**

| Clarity (Share of Authority, 7d) | 20/08 | 27/08 |
|---|---|---|
| SoA | 24,29% | **20,86%** |
| Citações de página | 256 | **295** (+15%) |
| `irrf` | 177 (69%) | 158 (54%) |
| `ferias` | 57 | 56 |
| `tesouro-direto` | **15** | **47 (3,1×)** |
| `inss` / `cdb` / `calorias` / `emprestimo` | — | 13 / 11 / 7 / 3 |
| AI referral traffic | **0** | **0,83%** |

O `tesouro-direto` triplicou de citação na semana seguinte ao F38, e o site
saiu de 1 página citada para 7. O SoA caiu (20,9%) porque o denominador
cresceu, não porque o site perdeu — as citações absolutas subiram.

**Ressalva honesta de atribuição:** as queries que geraram as citações do
tesouro são `calculadora de investimento tesouro direto` (15),
`calculadora de investimentos tesouro direto` (15), `calculadora de
investimento em tesouro direto` (10) e `calculadora investimento tesouro
direto` (7) — **47 citações no vocabulário "investimento", que o F38 não
mirou**. O F38 mirou "simulador/simulação", que não aparece na lista.
Hipótese mais provável: o F38 reescreveu title/H1/MDX da página inteira e
aumentou a recuperabilidade geral dela, não o casamento com a palavra
específica. **Consequência prática: o vocabulário que converte em citação de
IA é descobrível no painel do Clarity semana a semana** — é dado de otimização
com ciclo de 7 dias, contra 90 dias do GSC.

Outras queries do painel que valem como pauta: `calcule ir 2026` (21),
`calcular irpf 2026` (14), `calcule net irrf 2026` (14), `calculo dependente
ir` (6), `como calcular ir folha 2026?` (6), `calculadora irrf 2026 aluguel`
(4 — **IRRF sobre aluguel, que a calculadora não faz**), `benchmark do cdb`
(4), `calorias diárias recomendadas homem 1,65m` (3).

**3. GA4 (vida inteira, 01/01→27/08): 648 usuários, e o Google é 4 sessões.**

| Origem (sessões) | Total |
|---|---|
| bing / organic | **462** |
| (direct) | 172 |
| br.search.yahoo.com | 77 |
| chatgpt.com (3 variantes) | 66 |
| band.com.br (referral) | 21 |
| duckduckgo | 10 |
| acesso.qmix.com.br (fornecedor de link) | 7 |
| **google / organic** | **4** |

Bing:Google = **115:1**. O link da Band segue mandando gente de verdade (21
sessões acumuladas). Série semanal de usuários ativos: W29 62 · W30 64 · W31
64 · **W32 40** · W33 45 · W34 36 em 5 dias (7,2/dia, acima da W33) — houve
uma queda em 09-15/08 e uma recuperação parcial desde então.

**Achado novo — o site é desktop porque o canal é desktop, e o mobile está
intocado.** GA4: **599 desktop / 50 mobile (7,7%)**, Windows 555, **Edge 394
(61%)**. Mas o GSC diz o contrário sobre a oportunidade:

| Dispositivo | Impressões | Posição | Cliques |
|---|---|---|---|
| Computador | 1.413 | 71,0 | 3 |
| **Celular** | **765** | **54,6** | **0** |

O Google **já rankeia o site 16 posições melhor no celular** e o site não tira
um clique de lá. Num nicho de calculadora no Brasil, a busca é
majoritariamente mobile. Isso nunca foi olhado — nem o render mobile, nem
Core Web Vitals mobile (todas as medições do Clarity são de sessão desktop).

Pendências antigas do GA4 seguem abertas: **nenhum evento de conversão
configurado** ("Leads qualificados" 0 em todas as semanas desde janeiro — e
isso continua bloqueando o F17), e o breakdown de `exception` por
`description` que o Paulo ficou de mandar (o Clarity reporta **0 erros de JS**
pela terceira vez, o que reforça a hipótese de ruído do `ErrorLogger`).

**4. Clarity (25-27/08, 25 sessões): duas coisas para consertar.**
1,4 páginas/sessão, rolagem 43%, **44% das sessões enviam formulário**, 16%
com clique inativo, 0 erros de JS. Bing 8 · Copilot 3 · DuckDuckGo 2 · Google
2 · ChatGPT 1.

- **404s com tráfego real:** `https://calculosonline.com.br/site` com **4
  sessões (16% do total)** e `/2026/calculadora/cdb` com 1. Nenhuma das duas
  existe em `apps/web/src/app/`, e o `next.config.ts` **não tem bloco
  `redirects`**. Nada no repo aponta para elas — é link externo errado
  (diretório, agregador ou o próprio fornecedor de backlink). Duas regras de
  redirect resolvem e recuperam 16% das sessões que hoje batem em 404.
  **Terceiro 404, encontrado ao ler o código e não nos dados — e o pior dos
  três:** o `Footer.tsx` tem `{ name: 'Blog', href: '/blog' }` na seção
  Institucional, ou seja, **todas as páginas do site linkam para `/blog`, que
  nunca existiu**. Ao contrário dos outros dois, este é interno: o Google
  rastreia esse link em 100% das páginas, e ele desperdiça exatamente o
  PageRank interno que o F43 quer redistribuir. Some ao F44.
- **Regressão de INP:** score 92 → **84**, INP 140ms → **248ms** (o limiar
  "bom" do Google é 200ms). LCP melhorou muito (0,98s → **0,408s**) e o CLS
  está ótimo (0,003). Amostra pequena, mas o F41/F42 subiu exatamente entre as
  duas medições — checar antes de descartar.
- **Terceira confirmação do atrito de stepper.** Heatmap do `cdb`: 4
  pageviews, **133 cliques**, sendo **64 (48%) só no `#prazoMeses`** e 16 no
  botão +/− de outro campo. Quem quer 24 meses saindo de 12 clica 12 vezes. Já
  era item de P1 ("chips de valor rápido nos campos que viraram stepper");
  agora são três janelas independentes (`ferias` 20/08, `ferias` 09/08, `cdb`
  hoje). Deixa de ser sinal fraco.
- Heatmap do `irrf` (10 pageviews, 23 cliques): distribuição saudável —
  `#salarioBruto` 8, botão calcular 9. A página que a IA cita é também a de
  uso mais limpo.
- `meus-calculos` (F37): **1 sessão / 6 pageviews na vida inteira**. Confirma
  a decisão de 20/08 de despriorizar o F20 (PWA/Android).

**5. Comparação com commits e backlog.**
Desde 20/08 não houve commit novo (`743f22f feat: indexNow` é o HEAD). Ou
seja: **todo o backlog de 20/08 continua aberto**, e o export de hoje
re-mediu dois itens dele com números piores:

| Item de backlog (20/08) | Estado hoje |
|---|---|
| P0.0 escultura de link interno | **não feito** — inversão confirmada e ampliada (`financiamento` 298 impr / 1 link; `juros-compostos` 3 impr / 8 links) |
| P0.1 evento de conversão no GA4 | **não feito** — bloqueia F17 |
| P0.2 investigar `exception` | **não feito** — falta o dado do Paulo |
| P1 chips nos steppers | **não feito** — 3ª confirmação (`cdb`, 48% dos cliques) |
| P1 máscara nos campos de data | **não feito** |
| P1 hub trabalhista | **não feito** |
| P1 GEO do IRRF | **não feito** — e o dado de hoje reforça (IA é o único canal medível em 7 dias) |
| F15 backlinks | **parado** — decisão de orçamento |
| F22 blog sazonal | **não feito** — e a janela do 13º é agora (busca pica em nov/dez) |

O grafo de `relacionadas` continua exatamente como estava:

| Página | Links internos recebidos | Impressões |
|---|---|---|
| `juros-compostos` | **8** | **3** |
| `salario-liquido` | 7 | 76 |
| `irpf` / `cdb` | 6 | 88 / — |
| `porcentagem` | 5 | 208 |
| `ferias` | 4 | 205 |
| `fgts` / `hora-extra` | **2** | 207 / 240 |
| `financiamento` | **1** | **298** |

**6. Concorrentes (SERP verificada em 27/08).**
O conjunto que rankeia para os clusters do site são sites pequenos e
especializados, não portais grandes — o mesmo diagnóstico de 09/08 ("o
benchmark realista é um concorrente pequeno"). Exemplos: `calcule.net`,
`calculadorabrasil.com.br`, `calculomania.com`, `salariotransparente.com.br`,
`planilhadefluxo.com.br`, `calculadoradeferias.com`, `horascalc.com`,
`calculadorahora.com`; em financeiras, `calculadorapricesac.com.br`,
`calculafin.com.br`, `simuladortesourodireto.com.br`, `calculainvest.com.br`,
`valorfinal.com.br`, além de Serasa e Mobills.

**O gargalo NÃO é profundidade de conteúdo.** Os MDX do site têm 800-2.205
palavras, 7-13 H2 cada, cobertura legal com artigo de lei citado. Isso é
competitivo. O que os concorrentes têm e o site não tem:

1. **Tabela numérica de referência.** `calcule.net/trabalhista/calculo-hora-extra`
   publica uma "Tabela de Referência 2026" com salário bruto × valor da hora ×
   hora extra 50% × 100%, e uma tabela de conversão de minutos. Isso captura
   sozinho a cauda "quanto vale a hora extra de quem ganha R$ 2.000" — que o
   site só responde depois que a pessoa preenche o formulário, e o Google não
   preenche formulário.
2. **Variações de parâmetro que são queries.** O mesmo concorrente tem H2
   separados para "hora extra 50%", "60%", "70%", "100%" e "noturna", e aceita
   **adicional personalizado**. O `HoraExtraForm` do site tem um `select` fixo
   (útil/domingo/feriado/noturna) — não faz 60% (acordo coletivo), não faz
   percentual livre, não faz **DSR sobre horas extras** e não aceita minutos.
   São 4 intenções de busca reais que o produto não atende.
3. **Exemplos nomeados com números fechados.** `calculadorabrasil.com.br`
   traz 5 casos ("Carlos, vendedor…") com o cálculo inteiro escrito. É o
   formato que a IA generativa cita e que o Google usa para snippet.
4. **Intenção no slug.** `/simulador-tesouro-direto`,
   `/simulador-de-financiamento-imobiliario`, `/calculo-hora-extra`. O F38 pôs
   "simulador" no title e no H1, mas a URL segue `/calculadora/tesouro-direto`.
   E **"financiamento imobiliário" é intenção separada de "financiamento"** —
   o GSC mostra as duas na lista de queries.
5. **Frescor de dado.** Vários simuladores de Tesouro anunciam "taxas ao vivo
   da API oficial da B3". O site é 100% client-side com taxa digitada pelo
   usuário — o que é uma decisão de arquitetura defensável, mas custa o sinal
   de atualização que o Google e a IA premiam nesse cluster.

Onde o site **ganha** dos concorrentes e não comunica: cálculo 100% no
navegador (privacidade), memória de cálculo passo a passo, ausência de
cadastro/anúncio, e conteúdo legal correto (o F39 corrigiu um erro de 80% do
FGTS que vários concorrentes ainda publicam errado).

**7. Plano proposto (não executado — Paulo escolhe).**

*Ordenado por (confiança × impacto) ÷ esforço. Os quatro primeiros não
dependem de orçamento nem de terceiro.*

**Bloco A — barato, alta confiança, ciclo curto**
- **A1 (F43). Escultura de link interno** (já era P0.0). Reordenar `relacionadas`
  para financiamento/hora-extra/fgts/ferias/rescisão/tesouro, quebrar a planura
  do `Footer` (6-8 destaques + resto em `/categorias`) e pôr links contextuais
  dentro dos MDX. Único capital de autoridade 100% sob controle com AS 2.
- **A2 (F44). Redirects dos 404** (`/site` → `/`, `/:ano(\d{4})/calculadora/:slug` →
  `/calculadora/:slug`). 16% das sessões do Clarity. ~15 minutos.
- **A3 (F45). Evento de conversão no GA4** (`calculator_calculated` como key event).
  Desbloqueia o F17 e encerra "Leads qualificados 0". ~1 hora.
- **A4 (F46). Rodar `pnpm --filter web indexnow` após cada deploy.** Já existe e é
  manual; com Bing sendo 95% do tráfego, é o menor custo por clique do site.

**Bloco B — atacar o que a SERP mostra que falta (produto + conteúdo)**
- **B1 (F47). Tabelas de referência numéricas** nas 5 páginas de maior impressão
  (`financiamento`, `hora-extra`, `fgts`, `ferias`, `poupanca`): faixa de
  entrada × resultado, renderizadas em HTML no MDX. É o item que os
  concorrentes usam para capturar a cauda longa sem página nova.
- **B2 (F48). Completar o `HoraExtraForm`**: adicional personalizado (60%, 70%,
  livre), entrada em minutos e **DSR sobre horas extras**. 240 impressões,
  posição 84,7, e o único clique do site na lista de queries veio de "calculo
  hora extra".
- **B3 (F49). Exemplos nomeados com números fechados** nos MDX dos alvos do P0 —
  formato que a IA cita.
- **B4 (F50). Chips de valor rápido nos steppers** (P1, 3ª confirmação: 48% dos
  cliques do `cdb` num campo só).
- **B5 (F51). Máscara + atalhos nos campos de data** (P1, maior atrito medido em
  20/08).

**Bloco C — canal com crescimento provado (IA/Bing), ciclo de 7 dias**
- **C1 (F52). Tratar o painel de SoA do Clarity como ferramenta de keyword
  research semanal.** Foi ele que revelou que o vocabulário vencedor era
  "investimento", não "simulador". Rodar a cada export.
- **C2 (F53). Aplicar o tratamento do F38 ao vocabulário que o Clarity mostrou:**
  "calculadora de investimento em X", "calcule/calcular IR 2026", "cálculo de
  dependente no IR", "IR na folha".
- **C3 (F54). IRRF sobre aluguel** — query citada (4×) que a calculadora não
  atende. Modo novo no formulário existente, não página nova.
- **C4 (F55). GEO do IRRF** (P1): schema `Table`/`Dataset` na tabela IRRF 2026 +
  data de atualização explícita. Com AI referral saindo de 0 para 0,83%, a
  ressalva de 20/08 ("citação não vira clique") ficou mais fraca.

**Bloco D — depende de decisão do Paulo**
- **D1 (F56). Investigar o mobile** (765 impressões, pos. 54,6, 0 clique). Rodar
  PageSpeed/Lighthouse mobile e olhar o render real. Achado novo, sem custo,
  mas precisa de sessão dedicada.
- **D2 (F22). Blog sazonal começando pelo 13º salário.** A busca pica em
  nov/dez; publicar em setembro dá 60-90 dias de maturação. Se for para fazer
  algum dia, a janela é agora.
- **D3 (F15). Mais backlinks.** Pipeline existe (`acesso.qmix.com.br`), fila
  de 6 alvos definida; é decisão de orçamento. **Antes de comprar, conferir se
  `acritica.com` apareceu no GSC → Links** (prazo dado em 20/08: meados de
  setembro).
- **D4 (F19). Rever o gate do AdSense** — pendente desde 20/08.

*Numerados como **F43-F56** no [`FEATURES.md`](FEATURES.md) em 27/08 (Blocos
A-D); D2/D3/D4 reaproveitam F22/F15/F19, que já existiam.*

**O que checar no próximo export (marco: 27/08):**
- **Marco do Bloco C (F52-F55) é 27/08, e é o de retorno mais rápido.** As
  citações de IA se medem em **7 dias**, não em trimestre. Números de partida
  no Clarity: total do site **295** citações, `irrf` **158**, `tesouro-direto`
  **47**, `inss` 13, `cdb` 11, `calorias` 7, `emprestimo` 3; SoA **20,86%** e
  AI referral **0,83%**. Se o F53 funcionar, quem deve subir primeiro é `inss`,
  `ferias`, `calorias` e `irpf` — as que ganharam vocabulário e partiam de
  pouco. E vale procurar no painel se **"aluguel"** passa a citar o `irrf`
  depois do F54.
- **Marco do Bloco B (F47-F51) também é 27/08.** As 5 páginas com tabela de
  referência partem de: `financiamento` 298 impr / pos. 81,8, `hora-extra` 240
  / 84,7, `fgts` 207 / 90,0, `ferias` 205 / 88,1, `poupanca` 195 / 65,5. A
  hipótese do F47/F49 é que tabela e exemplo capturam cauda longa **sem página
  nova** — se as impressões dessas 5 não subirem em 4-6 semanas, a hipótese cai
  e o peso volta para o F23 (páginas programáticas).
- **Filtrar o GSC por data ≥ 26/08** para isolar F38/F39 — números de partida:
  cluster "simulador" **83,6**, cluster rescisão **93,6**, `tesouro-direto`
  **53,7**, `rescisao-trabalhista` **90,8**.
- Citações de IA do `tesouro-direto` (hoje **47**) e o AI referral (hoje
  **0,83%**) — o F38 se sustenta ou foi pico?
- Impressões/dia: o platô de ~23/dia sobe ou continua?
- INP (hoje **248ms**) — regressão real ou amostra?
- `acritica.com` no GSC → Links.
- Se algum item do Bloco A for executado: `financiamento` (298 impr, pos.
  81,8) é a página com mais a ganhar da escultura de link interno.

**Pendências de dado (repetidas de 20/08, Paulo não mandou):**
- GA4 → `exception` por `description`.
- GSC → performance por página antes/depois de 03/08 e 12/08.
- **Novo:** Semrush — Keyword Gap contra `calcule.net` e
  `calculadorabrasil.com.br` (os dois concorrentes cuja estrutura foi
  analisada hoje), e volume de `financiamento imobiliário` vs `financiamento`
  para decidir se o B1 vira página separada.
- **Novo:** GSC → Performance filtrado por **dispositivo = celular**, para
  entender por que posição 54,6 dá 0 clique.

---

### 2026-08-20 — Export novo (GSC+GA4+Clarity+Semrush), F38-F42 e IndexNow no ar

Paulo pediu para avaliar a pasta `gsc/` (export de 20/08: GSC 3 meses, GA4
23/07→19/08, 6 CSVs do Clarity), comparar com o backlog e sugerir features.
Depois pediu para implementar as sugestões, e a sessão virou cinco entregas.

**Método:** desta vez o export do GSC veio em pasta datada
(`calculosonline.com.br-Performance-on-Search-2026-08-20/`), como decidido em
09/08. Mas os CSVs de GA4 e Clarity continuam soltos na raiz de `gsc/` e serão
sobrescritos no próximo export — **mover todos para uma pasta datada.**
Atenção também: o export de 09/08 era de **12 meses** e este é de **3 meses**;
como o site só vive desde 10/05, as janelas quase coincidem, mas número de
3 meses é mais recente-pesado e não é comparável linha a linha.

**1. O 3º clique existiu — e a melhora de posição parou.**
2.084 impressões, **3 cliques**, CTR 0,14%, posição 65,7. O clique novo foi em
**09/08** — dois dias depois da análise anterior, quebrando a seca de 59 dias
(os outros dois foram 25/05 e 11/06).

A narrativa de 09/08 ("posição melhorando há 3 semanas") **não se sustentou**:

| Semana | Impr | Impr/dia | Posição |
|---|---|---|---|
| W30 (20/07) | 157 | 22,4 | 78,5 |
| W31 (27/07) | 263 | 37,6 | 65,3 |
| W32 (03/08) | 119 | 17,0 | **59,7** |
| W33 (10/08) | 168 | 24,0 | 59,9 |
| W34 (17/08, 2d) | 88 | 44,0 | 62,5 |

O degrau real foi entre W30 e W32 — exatamente a janela do link da Band
(rastreado 03/08) — e depois **platô em ~60 por três semanas**. É o
comportamento normal de um backlink único: dá um degrau e para. Não é fracasso
da estratégia, é amostra de tamanho 1.

Cuidado ao ler `salario-liquido`: posição piorou (54,8 → 67,6) mas as
impressões **mais que dobraram** (31 → 78), e as 9 queries head de "salário
líquido" seguem em **posição 18-20**. É expansão de cobertura diluindo a
média, não queda. Mesmo padrão no `irrf` (26 → 89 impressões).

**2. Semrush (19/08): AS continua 2, e os domínios referentes explicam-se.**

| Métrica | 09/08 | 19/08 |
|---|---|---|
| Authority Score | 2 | **2** |
| Domínios referentes | 122 | **140** |
| Backlinks | 220 | **247** |
| Organic Keywords | 220 | **231 (+12%)** |
| Organic Traffic | 0 | **0** |

**+18 domínios em 10 dias sem Paulo ter feito nada além de 2 links** confirma
a hipótese de 09/08: são scrapers/agregadores que o Google não conta. O GSC →
Links mostra **um único domínio: `band.com.br`**, com a âncora "cálculo
salário líquido" registrada em "Principais termos com links" — prova de que o
Google processou e atribuiu o link inteiro, não só rastreou. **Pendência
encerrada: pode-se dizer "o site tem 1 backlink que conta" como fato.**

**`acritica.com` (link de 12/08) ainda NÃO aparece no GSC.** Provavelmente lag
do relatório (é notoriamente defasado). **Se não aparecer até meados de
setembro, o link não está sendo contado** — informação crítica antes de
comprar mais placements do mesmo fornecedor.

A curva de Organic Keywords sobe forte (de ~0 em junho para 244 em agosto)
com tráfego 0 — cobertura crescendo, tudo entre posição 50 e 100. Reforça:
não falta relevância, falta autoridade para converter cobertura em posição.

**3. `simulação tesouro direto` = 2.900 buscas/mês, posição 78.**
Maior keyword do site por volume em toda a lista do Semrush — e é exatamente
o vocabulário que não existia em nenhum title, H1, MDX ou FAQ. Virou o F38.
Para comparar: o cluster inteiro de margem de lucro, que virou alvo legítimo
em 09/08, soma 1.520 buscas/mês.

**4. O Clarity ganhou painel de IA (Share of Authority) — e ele explica o IRRF.**
Em 7 dias: **SoA 24,29%, 256 citações de página**, sendo **`irrf` com 177
(69%)**, `ferias` 57, `tesouro-direto` 15. Ou seja, a página nº1 em uso real e
invisível no Google é a nº1 do site em citação por IA.

Mas Semrush e Clarity parecem se contradizer, e não se contradizem:

| Fonte | O que mede | Resultado |
|---|---|---|
| Semrush | ChatGPT, Gemini, AI Overview, AI Mode | Visibility 0, Mentions 0, **1** cited page |
| Clarity | Copilot / ecossistema Bing (é da Microsoft) | **SoA 24%, 256 citações** |

É o mesmo padrão do tráfego (Bing 158 sessões, Google 1). **O site é forte no
ecossistema Microsoft e invisível no do Google/OpenAI** — no orgânico, nas
citações de IA e no AI Overview (0%), tudo ao mesmo tempo. Deixou de ser
coincidência e virou característica estrutural do domínio. Ao ler "SoA 24%",
ler "24% no Copilot", não "24% na IA". E **AI referral traffic = 0**: citação
não vira clique.

**5. GA4 (28d): usuários caem, uso sobe, e dois achados novos.**

| Métrica | jul (28d) | ago (28d) |
|---|---|---|
| Usuários | 230 | **207** |
| `calculator_calculated` | 333 | **385** |
| AI Assistant | 17 | **10** |
| Google orgânico | 0 | **1 sessão** |

Origem nova: **`band.com.br` = 19 sessões**. O link do F15 não é só sinal de
SEO, manda gente de verdade — benefício que o plano de 25/07 não previa.
`acesso.qmix.com.br` (6 sessões) é o **fornecedor dos backlinks**, validando
entrega — descontar da leitura de canais (real fica ~201).

Dois achados que não estavam em nenhum diário:
- **`exception` = 334 eventos** contra 433 `page_view` (0,77 por pageview).
  Hipótese: `ErrorLogger.tsx` registra `error` em fase de captura, o que pega
  **erro de carregamento de recurso** (imagem/script bloqueado por adblock) e
  dispara `jsError` com mensagem vazia. Reforçada pelo Clarity, que reporta
  **0 erros de JS**. **Falta o breakdown por `description` no GA4** para
  confirmar — Paulo ficou de mandar e não mandou.
- **Nenhum evento de conversão configurado** desde janeiro ("Leads
  qualificados 0" em todas as semanas). Bloqueia o F17 (Ads sem conversão é
  dinheiro jogado fora). Já registrado em 09/08, segue aberto.

**6. Clarity (17 sessões): performance ótima, atrito concentrado em datas.**
Edge 65% / Chrome 35% (100% Bing/Yahoo), **76% das sessões enviam formulário**,
1,29 páginas/sessão, rolagem média 34%, score 92, LCP 0,98s, INP 140ms,
CLS 0,003, 0 erros de JS. **41% das sessões com clique inativo.**

No heatmap de `rescisao-trabalhista`, **11 dos 24 cliques foram nos dois
campos de data** (`#dataAdmissao` 7, `#dataRescisao` 4) — maior ponto de
atrito medido do site. `input[type=date]` nativo é ruim no Edge/Windows, que
é 65% do público. Em `ferias`, 69 de 105 cliques foram nos botões +/− do
stepper: **o mesmo padrão descartado como QA em 09/08 se repetiu com tráfego
orgânico real**, então não dá mais para descartar de bandeira (ainda são
poucos pageviews — tratar como sinal fraco, não como fato).

**7. Link interno estava 100% plano — e o pouco que não era, estava invertido.**
O GSC → Links mostra **31 links internos para todas as páginas, idêntico**,
porque o `Footer.tsx` lista as 20 calculadoras em todas as páginas. Quando
tudo linka tudo, nenhum link interno significa nada. O único diferencial real
(`relacionadas` do registry) apontava para o lado errado:

| Página | `relacionadas` | Impressões |
|---|---|---|
| `juros-compostos` | **8** (máximo) | **3** (pos. 97,7) |
| `porcentagem` | 5 | 177 (alvo descartado em 09/08) |
| `fgts` | 2 | 206 (alvo P0) |
| `hora-extra` | 2 | 237 (alvo P0) |
| `financiamento` | **1** (mínimo) | **264** (maior do site) |

Inversão quase perfeita. **Com AS 2 e 1 backlink, o PageRank interno é o único
capital de autoridade que o Paulo controla 100%** — e estava sendo distribuído
de forma plana e invertida. Virou item de backlog (P0), **ainda não
implementado**.

**Entregue nesta sessão (ver `FEATURES.md` F38-F42 e `CHANGELOG.md`):**
- **F38** (v0.12.0) — vocabulário "simulador/simulação" nas 5 financeiras.
- **F39** (v0.13.0) — vocabulário de demissão/acerto trabalhista na rescisão
  (cluster de pior posição do site: 116 impressões, 84 queries, pos. 93,7).
  Corrigiu de quebra erro factual: no acordo mútuo o FGTS é liberado até
  **80%** (art. 484-A, §1º), não integralmente, como o MDX afirmava em 2 pontos.
- **F40** (v0.14.0) — as duas leituras do aviso prévio no acordo mútuo, lado a
  lado. Divergência de **R$ 1.500** no líquido aos 10 anos de casa.
- **F41** (v0.15.0) — identidade visual unificada; 4 tabelas paralelas viraram
  `lib/identidadeVisual.ts`, e o ícone chegou às 20 páginas de calculadora.
- **F42** (v0.16.0) — og-image por calculadora. Fechou um **404 que estava em
  produção desde o início**: `seo.ts` apontava toda página para
  `/images/og-image.png`, arquivo que nunca existiu — preview quebrado em
  todo link do F32 compartilhado no WhatsApp.

**IndexNow finalmente no ar (pendência aberta desde 25/07).** A chave do
IndexNow é **pública por design** (o protocolo exige que ela seja legível em
`/<chave>.txt`), então guardá-la em env var não protegia nada e criava um modo
de falha silencioso — virou constante no código. Restou **uma** variável na
Vercel (`INTERNAL_API_KEY`), que o Paulo configurou. Primeira submissão feita
em 20/08: **32 URLs, resposta 202**. Script novo em
`apps/web/scripts/indexnow.mjs` (`pnpm --filter web indexnow`), que lê o
`sitemap.xml` de produção em vez de duplicar a lista de rotas. **Nada dispara
sozinho — não há hook nem cron; é comando manual, e deve ser rodado DEPOIS do
deploy** (senão os buscadores rastreiam o conteúdo antigo). O `README.md`,
que estava **vazio**, ganhou a seção "Operação" com esse procedimento.

Também: `seoRefreshDate` do `sitemap.ts` bumpado para 2026-08-20 — sem isso o
sitemap declararia que nada mudou desde 19/07 e todo o resto seria inócuo.

**Decisões tomadas:**
- **Um commit por feature** é a convenção; o commit agregado F38-F42
  (`60befbe`) foi exceção pontual autorizada pelo Paulo, não o padrão.
- **`porcentagem` e `juros-compostos` perdem link interno** para os alvos do
  P0 (a implementar).
- **F20 (PWA/Android) deve ser despriorizado formalmente**: retenção de coorte
  é 62→3→2→1, e a semana de 02-08/08 foi 58→0. O F37 (salvar cálculos) já foi
  o teste dessa hipótese e deu **3 usos em 6 dias** contra 385 cálculos —
  público de sessão única não tem por que salvar nem instalar.
- **O gargalo do F15 é orçamento, não execução.** `acesso.qmix.com.br` é o
  fornecedor dos dois links, ou seja há pipeline pronto — a fila de 6 alvos é
  decisão de quanto gastar, não projeto de prospecção.
- **Reavaliar o gate do F19 (AdSense).** Era "esperar tráfego do Google";
  passaram 3 meses e o Google entregou 1 sessão em 28 dias, enquanto há 207
  usuários/mês reais. Trocar o gate para "N usuários/mês de qualquer canal".

**Pendências (Paulo ficou de mandar e não mandou):**
- **GA4 → `exception` por `description`** — decide se os 334 são ruído ou bug.
- **GSC → performance por página, antes/depois de 03/08 e 12/08** — única
  forma de isolar o efeito de cada backlink e embasar o orçamento do F15.

**O que checar no próximo export (marco: 20/08):**
- Posição do cluster "simulador" (hoje **83,3**) e da `rescisao-trabalhista`
  (hoje **93,7**, pior do site). São os dois alvos do F38/F39 com número de
  partida registrado; o resto do deploy é visual e não deve mover ranking.
- Se `acritica.com` apareceu no GSC → Links.
- **Efeito no Bing antes do Google.** Como o Bing é ~95% do tráfego real e
  agora recebe IndexNow, o F38 pode ser validado lá em semanas — medir no
  GA4/Clarity (sessões do Bing para `/calculadora/tesouro-direto`), não no GSC.

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

### Revisão de 14/09 (parte 7) — links 3 e 4 escolhidos

Paulo pediu "qual o próximo backlink? aliás, 2 próximos?" depois da análise de
14/09 (GSC + Clarity + BWT + Semrush). **Decidido e aprovado por ele; ele compra
conforme conseguir os placements, sem prazo fixo. Nada mais muda no roadmap até
lá.**

**O dado que precisa estar na mesa antes de gastar de novo: os dois primeiros
links não moveram posição.**

| Página | Link | Pos. antes | Pos. em 14/09 | Impressões |
|---|---|---|---|---|
| `salario-liquido` | `band.com.br` (05/08) | 54,8 (25/07) | **69,4** | 74 |
| `decimo-terceiro` | `acritica.com` (12/08) | 76,6 (09/08) | **86,5** | 87 → **277** |

As impressões do 13º triplicaram (reexpansão, o padrão já registrado), mas
**nenhuma das duas melhorou de posição em 4-6 semanas**. Isso não prova que
link não funciona nessa SERP — prova que **um** link por página não resolve, e
é exatamente essa ambiguidade que trava a decisão de orçamento do F15 desde
agosto. A escolha de 3 e 4 foi feita para desfazê-la.

**Link 3 — `/calculadora/rescisao-trabalhista`.** Maior cluster ainda sem link:
**34.290 buscas/mês e 54 keywords** no Semrush, 330 impressões no GSC. E é o
**centro do grafo interno** — o hub do F58, os 4 posts do F60 e o guia do F22 já
apontam todos para lá, então com AS 2 (onde o PageRank interno é o único capital
de autoridade) é o nó em que autoridade externa mais se redistribui. Sem risco
de calendário, que é a mesma lógica que elegeu `salario-liquido` como link 1.
Entradas de KD baixo para medir efeito: `cálculo rescisão gratuito` KD 11,
`calcular rescisão do contrato de trabalho` KD 17 (590/mês),
`trabalhei 8 anos quanto vou receber de acerto` KD 19.
- **Âncora: "calcular rescisão do contrato de trabalho"** (590/mês, KD 17).
  Alternativa se a frase ficar forçada: "cálculo trabalhista online" (720/mês,
  KD 23).

**Link 4 — `/calculadora/decimo-terceiro` OUTRA VEZ, de propósito.** É o segundo
link na mesma página, contra a intuição de espalhar. **A razão é de método: com
um link por página nunca se distingue "link não funciona nessa SERP" de "um link
não basta".** O 13º é o melhor lugar para testar — maior cluster do site
(44.310/mês, 55 keywords, KD 17-28), já tem um link de referência para comparar,
o F64 acabou de deixá-la como a única página com os números de 2026 certos e o
F60 construiu 4 posts em volta dela.
- **Âncora: "cálculo de 13 proporcional"** (320/mês, KD 16) ou "calculadora
  décimo terceiro proporcional" (210/mês, KD 15). **Tem de diferir de "calcular
  décimo terceiro"**, que foi a do `acritica.com` — variação de âncora, regra de
  11/08.
- **Ressalva registrada junto com a decisão: de posição 86,5 não se chega à
  página 1 até novembro.** Este link não é aposta no pico deste ano; é a
  resposta à pergunta de orçamento, e o efeito vale para os anos seguintes.

**Por que não as outras, com o número que descarta cada uma:**
- **`financiamento`** — 351 impressões e 12.390/mês, mas **KD 49-65 no cluster
  inteiro**. Termo comercial de banco e fintech; o mais caro de todos.
- **`hora-extra`** — alternativa legítima ao link 4 (melhor posição do
  trabalhista não linkado: Semrush 54; KD 17-25; `calculo hora extra online` com
  SF 2). **Trocar o 13º por ela só se a escolha for espalhar em vez de testar
  profundidade** — mas aí não se aprende nada sobre orçamento.
- **`irrf` e `inss`** — fora. O `inss` não tem **uma keyword sequer no top 100**
  e o `irrf` tem 3. Link ali não tem em que se apoiar, e os dois já ganham no
  canal que não depende de posição (447 citações de IA por semana).

**Mudança no jeito de medir, que sai do achado de 14/09: acompanhar o efeito no
Bing Webmaster Tools, não no GSC.** O site já rankeia em posição 4-9 no Bing nas
queries que viram clique, e o BWT não tem a média de 90 dias que trava a leitura
do GSC. Se o link fizer efeito, o Bing mostra semanas antes — e é o buscador que
de fato manda tráfego. O GSC continua como confirmação lenta.

**Disciplina mantida dos dois primeiros:** conferir **dofollow no HTML bruto**
(não confiar no que o vendedor diz), âncora embutida em frase natural (nunca
isolada), e veículo editorial de finanças/RH/notícia regional — `band.com.br` e
`acritica.com` são o patamar de referência.

**Paulo encomendou os dois links em 14/09**, na mesma sessão da decisão, nas
duas páginas recomendadas e com as âncoras recomendadas:

| # | Veículo | Destino | Âncora |
|---|---|---|---|
| 3 | **MS Notícias** (`msnoticias.com.br`) | `/calculadora/rescisao-trabalhista` | `calcular rescisão do contrato de trabalho` |
| 4 | **Mercado Hoje** (`mercadohoje.uai.com.br`) | `/calculadora/decimo-terceiro` | `cálculo 13 proporcional` |

> **Atualização 22/09:** o nº 4 publicou em 15/09 como planejado. **O nº 3 saiu
> em 21/09 em outro veículo, o `jornaldebrasilia.com.br`**, com o destino e a
> âncora do plano, mas na seção `/brasil-7/`, que é um balde de link pago. Ver
> o Diário de 22/09 (parte 1). **O MS Notícias não vem:** o Jornal de Brasília
> o substituiu, e o plano fecha com os 4 links.

**Checagem dos dois veículos feita antes da publicação** (único momento em que
achar problema ainda permite trocar):

- **MS Notícias** — jornal regional de Mato Grosso do Sul, no ar (200). **Mesmo
  perfil exato do `acritica.com`** (jornal regional do Amazonas), que é o
  padrão já validado duas vezes.
- **Mercado Hoje** — é **subdomínio do `uai.com.br`**, portal dos **Diários
  Associados** (mesmo grupo do Estado de Minas e da TV Alterosa), e é uma
  **editoria de finanças/mercado**. Tematicamente é **o melhor placement dos
  quatro**: uma vertical de finanças linkando calculadora de 13º é mais
  relevante que um jornal regional generalista, e é exatamente o perfil que o
  plano de 25/07 pedia ("blog de finanças pessoais, RH, contabilidade").

**O único risco identificado, e é específico do nº 4:** o `mercadohoje` exibe
blocos "Publicidade" e **não declara política visível de rotulagem de conteúdo
patrocinado**. Se a matéria cair num slot publieditorial, o link pode sair com
`rel="sponsored"` ou `nofollow` — e aí não passa autoridade nenhuma. **É a
primeira coisa a conferir no HTML bruto quando publicar**, antes de qualquer
outra. Nos quatro links, `rel` é o que decide se o dinheiro virou autoridade.

**Checklist de verificação quando cada um publicar** (a disciplina que já pegou
coisa antes):
1. `rel` do `<a>` no **HTML bruto** — sem `nofollow`, `sponsored` nem `ugc`.
2. Âncora exata e **embutida em frase natural**, não isolada.
3. Página sem `noindex`, sem `X-Robots-Tag`, canonical self-referencing, e a
   seção não bloqueada no `robots.txt`.
4. **Conferir no BWT → Vínculos regressivos** (não no GSC), que é o placar
   correto deste projeto. O esperado é a contagem ir de **2 para 4** domínios —
   e o `mercadohoje.uai.com.br` deve entrar como domínio próprio, por ser
   subdomínio.
5. Posição no **BWT**, não no GSC — o Bing responde em semanas.
6. *(acrescentado 22/09)* **Seção e vizinhos:** abrir a categoria da matéria e
   2-3 posts vizinhos. Se cada um tem um link comercial de saída, é balde de
   link pago, mesmo em domínio de jornal. Antes de pagar, pedir ao fornecedor a
   URL da seção.

### O critério de 20/08 sobre o `acritica.com` estava errado, e isso é método

Ficou registrado em 20/08: *"se não aparecer no GSC → Links até meados de
setembro, o link não está sendo contado — informação crítica antes de comprar
mais placements do mesmo fornecedor."* Em 14/09 Paulo conferiu: **continua não
aparecendo**, 33 dias depois da publicação (o `band.com.br` levou ~1-2 semanas).

Pelo critério, a conclusão seria "o link não conta". **Fui verificar a matéria e
o critério é que não se sustenta.** URL:
`acritica.com/economia/cinco-pontos-que-reduzem-o-13-sem-o-trabalhador-perceber-1.412123`

| Checagem | Resultado |
|---|---|
| Página no ar | HTTP **200** |
| Link ainda presente | ✅ `<a href="https://calculosonline.com.br/calculadora/decimo-terceiro" target="_blank" rel="noreferrer">calcular décimo terceiro</a>` |
| `nofollow`/`sponsored`/`ugc` | **nenhum** na página inteira |
| `noindex` no HTML | **0 ocorrências** |
| `X-Robots-Tag` no header | ausente |
| Canonical | self-referencing |
| `robots.txt` bloqueia `/economia/` | não |

**O placement está tecnicamente perfeito.** O modo de falha que eu temia — a
matéria ser editada e o link sumir depois do pagamento, que é o clássico de
placement pago — **não aconteceu**. Detalhe que fecha a dúvida do `noreferrer`:
ele aparece **12 vezes** na página, ou seja é o padrão do template do site para
todo link externo, não algo aplicado ao link pago.

**A correção de método, que vale mais que o caso:** o relatório **GSC → Links
não é detector confiável de ausência**. Ele amostra e atrasa, e tratá-lo como
placar levou a um critério que quase matou um link que está perfeito. **Nunca
mais concluir "o link não conta" a partir de o GSC não mostrá-lo** — só a
verificação do HTML bruto decide isso.

**O Bing respondeu na hora, e encerra o caso.** Paulo abriu "Vínculos
regressivos" no BWT: **os dois domínios estão lá**, `acritica.com` (1 vínculo) e
`band.com.br` (1 vínculo). O crawler do Bing rastreou a matéria e atribuiu o
link. **O `acritica` é real e conta — o que falhou foi o relatório do Google, e
o critério de 20/08 que confiava nele.** Não há mais o que investigar.

### O achado maior: o BWT é o placar correto de backlink deste projeto

As três fontes discordam sobre a mesma pergunta, e agora dá para dizer qual está
certa:

| Fonte | Domínios referentes | O que está contando |
|---|---|---|
| Semrush (20/08) | **122** (247 links) | inclui scraper/agregador |
| GSC → Links (14/09) | **1** (só `band.com.br`) | amostra e atrasa |
| **BWT (14/09)** | **2** — `acritica` + `band` | **exatamente os 2 links editoriais reais** |

**A hipótese de 09/08 ("os 122 domínios do Semrush são lixo que o Google não
conta") está confirmada por uma terceira fonte independente.** Um buscador de
verdade, com crawler e filtro de qualidade próprios, foi contar e achou **2** —
precisamente os dois placements pagos, nada mais. O Semrush infla, o GSC
subnotifica, e o BWT acerta.

**Consequência prática: o site tem exatamente 2 backlinks reais.** Os dois
encomendados hoje **dobram** o perfil de links do site, de 2 para 4. É assim que
a expectativa deve ser dimensionada — não é "mais 2 entre 122".

**E a leitura desconfortável que sai do mesmo dado:** esses **mesmos 2 links**
convivem com posição **4-9 no Bing** e **85-95 no Google**. Não é o link que
difere entre os dois buscadores — é o patamar de confiança que cada um exige.
Google não deu sinal nenhum com 2 links de jornal; nada garante que dê com 4.
**O risco a monitorar nos links 3 e 4 não é "o link vai contar" (vai), é "4
links ainda é longe demais do limiar do Google".** Se os dois próximos também
não moverem posição no Google enquanto o Bing segue em 4-9, a conclusão a tirar
é de ordem de grandeza: ou o orçamento de links sobe muito, ou o Google sai do
plano e o projeto se organiza em torno de Bing + IA, que é onde ele já ganha.

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
