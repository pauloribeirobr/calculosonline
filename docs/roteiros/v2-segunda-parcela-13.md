# Roteiro de gravação — V2 Segunda parcela do 13º

**Página:** https://calculosonline.com.br/calculadora/decimo-terceiro
**Feature:** F91. Pauta V1–V10 aprovada pelo Paulo em 25/11; ritmo de um vídeo a cada 2 dias (25/11), então a V2 sai em **27/11**.
**Escrito em:** 25/11/2026, no molde da V1 | **Status:** ✅ **texto aprovado pelo Paulo em 25/11** (*"aprovado"*)

Duas versões: **vídeo normal** (horizontal, ~1:30 + 10 s de tela final) e **Short** (vertical, ~25 s), que também vira
Reel. O público é quem recebe o 13º e estranha a 2ª parcela menor que a 1ª. A 1ª parcela sai até 30/11, então o vídeo
chega antes do pagamento das duas.

---

## Fatos que o roteiro respeita

Conferidos no código, na página e na fonte em 25/11/2026. Conferir em produção antes de gravar:

| Fato | Onde |
|---|---|
| Campos: **Salário Bruto** (R$, com atalhos), **Mês de admissão** (lista; padrão "0 — Já trabalhava antes do ano corrente"), **Parcela** (lista: Total (1ª + 2ª) · 1ª parcela (até 30/nov) · 2ª parcela (até 20/dez)), **Dependentes (IRRF)** (− e +). Botão **Calcular 13º** | `DecimoTerceiroForm.tsx` |
| 1ª parcela: metade, **sem descontos**; 2ª parcela: o 13º inteiro, menos INSS e IRRF calculados sobre o 13º todo, menos a 1ª já recebida | página do 13º ("Prazos de pagamento"), motor |
| Prazos: o 13º é pago **até 20 de dezembro** (Lei 4.749/1965, art. 1º); o adiantamento de **metade**, **entre fevereiro e novembro** (art. 2º). Conferido no Planalto em 25/11 | [Planalto](https://www.planalto.gov.br/ccivil_03/leis/l4749.htm) |
| Em 2026, o 20/12 cai num domingo e a 2ª parcela antecipa para 18/12 | página do 13º — **fica fora da fala** (só vale este ano) |
| **Redutor da Lei 15.270/2025**: com 13º bruto até R$ 5.000, o IRRF zera; vale para o 13º (Receita Federal) | página do 13º, [Receita](https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/exemplos-de-aplicacao-da-lei-15-270-2025) |
| Tabela do INSS 2026 | página, [INSS](https://www.gov.br/inss/pt-br/assuntos/com-reajuste-de-3-9-teto-do-inss-chega-a-r-8-475-55-em-2026) |

**Números do motor** (salário R$ 4.000, ano inteiro, sem dependentes; os mesmos do "Exemplo 1" da página). Só na tela e
na descrição; a fala diz o mecanismo (a tabela do INSS muda todo ano):

| Parcela | Resultado | Linhas |
|---|---|---|
| 1ª parcela | **R$ 2.000,00** | 13º proporcional (12/12) R$ 4.000 · 1ª Parcela (50%) R$ 2.000 |
| 2ª parcela | **R$ 1.631,40** | INSS 7,5% R$ 121,58 + 9% R$ 115,36 + 12% R$ 131,66 (= R$ 368,60) · Desconto simplificado R$ 607,20 · Base do IRRF R$ 3.392,80 · IRRF pela tabela R$ 114,76 · **Redutor da Lei 15.270/2025 R$ 114,76** · Desconto IRRF (isento) R$ 0 · 1ª Parcela (já recebida) R$ 2.000 · 2ª Parcela líquida |
| Total | **R$ 3.631,40** | as mesmas, com "13º Líquido" |

**Não fale no vídeo:** valores de INSS ou de IR (mudam com a tabela); a data de 18/12 (só deste ano); nome de empresa ou
de banco; "o seu patrão errou" (o vídeo mostra a regra, não acusa).

**Na gravação:** a "Parcela" é lista nativa, que não sai no screencast: o cursor vai até ela, o anel do clique aparece e o
valor muda pelo `selectOption` (como no RF). O mês de admissão fica no padrão.

---

# 1. VÍDEO NORMAL (~1:30 + tela final)

### Gancho  ·  24 palavras ≈ 8,6 s
**Tela:** topo da página do 13º, H1 visível.
> "A primeira parcela do décimo terceiro cai inteira. A segunda vem menor. Não é erro: é que todos os descontos ficam para ela."

> **Abertura de 1 s.**

### As duas parcelas  ·  37 palavras ≈ 13,2 s
**Tela:** rolagem até "Prazos de pagamento", com a tabela das duas parcelas em quadro (destaque em "sem descontos" e em "Saldo + INSS + IRRF").
> "A primeira parcela sai até novembro, e é metade do décimo terceiro, sem desconto nenhum. A segunda sai até vinte de dezembro, e é nela que entram o desconto da Previdência e o imposto de renda."

### Preencher  ·  27 palavras ≈ 9,6 s
**Tela:** salário `4000`; o mês de admissão no padrão; a "Parcela" muda para "1ª parcela"; **Calcular 13º**.
> "Aqui no Cálculos Online, você põe o salário, o mês em que entrou na empresa, e escolhe a parcela. Quatro mil reais, primeira parcela."

### A primeira  ·  12 palavras ≈ 4,3 s
**Tela:** o resultado: R$ 2.000,00, linha "1ª Parcela (50%)" destacada.
> "Metade do décimo terceiro, sem nenhum desconto. Agora, a segunda."

### A segunda  ·  35 palavras ≈ 12,5 s
**Tela:** "Parcela" → "2ª parcela", Calcular; destaque nas três linhas do INSS, depois na "1ª Parcela (já recebida)", depois na "2ª Parcela líquida".
> "Olha a conta: o décimo terceiro inteiro, menos o desconto da Previdência, calculado sobre o valor todo, menos a primeira parcela, que você já recebeu. Por isso a segunda vem menor que a primeira."

### O imposto de renda  ·  32 palavras ≈ 11,4 s
**Tela:** destaque em "IRRF pela tabela", depois em "Redutor da Lei 15.270/2025" e em "Desconto IRRF (isento)".
> "E o imposto de renda? Desde dois mil e vinte e seis, quem tem décimo terceiro de até cinco mil reais não paga, por causa do redutor da lei nova. Está aqui."

### O total  ·  17 palavras ≈ 6,1 s
**Tela:** "Parcela" → "Total (1ª + 2ª)", Calcular; destaque em "13º Líquido".
> "Escolhendo o total, você vê quanto entra no ano, somando as duas parcelas, já com os descontos."

### Compartilhar  ·  19 palavras ≈ 6,8 s
**Tela:** o botão "Compartilhar via WhatsApp" destacado (sem clicar); o link do cálculo aberto, já no resultado.
> "Quer conferir com alguém de casa? O botão do WhatsApp manda o link, e o cálculo abre pronto."

### Fechamento  ·  25 palavras ≈ 8,9 s
**Tela:** volta ao topo; H1.
> "Então, se a segunda parcela vier menor, confira aqui se o desconto bate com o seu salário. É grátis, sem cadastro. O link está na descrição."

> **Tela final de 10 s.**

---

# 2. SHORT (~25 s)

Celular emulado, como o da V1: resultado logo abaixo da pílula e da legenda.

| Bloco | Pílula | Fala | Tela |
|---|---|---|---|
| gancho | texto grande `A 2ª PARCELA|VEIO MENOR?` | "A segunda parcela do décimo terceiro veio menor?" | o formulário |
| erro | (gancho) | "Não é erro." | idem |
| salario | `R$ 4.000` | "Quatro mil reais de salário." | salário, 1ª parcela, Calcular |
| primeira | `1ª PARCELA` | "A primeira vem inteira, sem desconto." | o resultado da 1ª |
| segunda | `2ª PARCELA` | "Na segunda, sai o desconto da Previdência do décimo terceiro todo." | 2ª parcela, Calcular; as linhas do INSS |
| ir | `IMPOSTO` | "E, até cinco mil reais, não tem imposto de renda." | a linha do redutor |
| fecho | — | "Confira a sua conta antes do pagamento." | a 2ª parcela líquida |
| cta | cartão final (`/calculadora/decimo-terceiro`) | o fecho gravado na V1 (`10-cta`), sem crédito | |

---

## Metadados

### Vídeo normal
- **Título:** `Por que a segunda parcela do 13º vem menor? A conta, com INSS e imposto de renda`
- **Descrição:**
  ```
  Calculadora do 13º salário, grátis e sem cadastro:
  https://calculosonline.com.br/calculadora/decimo-terceiro?utm_source=youtube&utm_medium=video&utm_campaign=v2-segunda-parcela-13

  A primeira parcela do 13º é metade do valor, sem descontos. Na segunda, o INSS e o imposto de renda
  são calculados sobre o 13º inteiro e saem de uma vez, junto com o que já foi adiantado. Por isso ela
  vem menor. Desde 2026, com o redutor da Lei 15.270/2025, quem tem 13º de até R$ 5.000 não paga
  imposto de renda sobre ele.

  Exemplo do vídeo: salário de R$ 4.000, ano inteiro, sem dependentes, pelas tabelas de 2026.
  A calculadora do site usa sempre a tabela do ano.

  [capítulos pelo corte final]

  Fontes:
  Prazos do 13º (Lei 4.749/1965): https://www.planalto.gov.br/ccivil_03/leis/l4749.htm
  Tabela do INSS 2026: https://www.gov.br/inss/pt-br/assuntos/com-reajuste-de-3-9-teto-do-inss-chega-a-r-8-475-55-em-2026
  Redutor do IR (Receita Federal): https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/exemplos-de-aplicacao-da-lei-15-270-2025

  Conteúdo educativo. Confira os valores no seu holerite.
  ```
- **Tags:** `13º salário`, `segunda parcela do 13`, `décimo terceiro`, `desconto do 13º`, `INSS 13º`, `imposto de renda 13º`, `calcular décimo terceiro`
- **Thumbnail:** fundo escuro, `A 2ª PARCELA VEIO MENOR?`, recorte do resultado da 2ª parcela com as linhas do INSS destacadas; selo `NÃO É ERRO`.
- **Categoria:** Educação. **Uso de IA:** Não. **Público:** não é para crianças.

### Short
- **Título:** `A 2ª parcela do 13º veio menor? #13salario #decimoterceiro`
- **Descrição:** `Por que a segunda parcela do 13º vem menor que a primeira.` + link (`utm_campaign=v2-segunda-parcela-13`)
- **Comentário fixado:** `Calcule o seu em https://calculosonline.com.br/calculadora/decimo-terceiro`
- **Vídeo relacionado:** a V2 normal.

---

## Andamento (pausado em 26/11/2026, a pedido do Paulo: *"pare. voltamos amanhã"*)

- **Voz gerada** com o ok do Paulo (*"sim"*): normal 1.184 caracteres, 9 falas, 84 s de fala (`~/Vídeos/calculosonline-v2/voz/`);
  Short 276 caracteres, 7 falas (`~/Vídeos/calculosonline-v2-short/voz/`; o fecho é o `10-cta` da V1). INSS escrito como
  "í ene ésse ésse" (trocado por "í êne ésse ésse" em 27/11, ver abaixo) (a legenda mostra "INSS": `GRAFIA` do `short-voz.py`). **O Paulo ainda não ouviu.**
- **Página conferida em produção (só leitura):** `#salarioBruto`, `#mesAdmissao` (lista), `#parcela` (lista: `primeira`,
  `segunda`, `total`), botão "Calcular 13º"; 1ª parcela R$ 2.000,00 e 2ª R$ 1.631,40 com as linhas do roteiro.
- **Falta:** `ferramentas/v2/gravar-v2.cjs` (a partir do da V1, com os tempos das palavras já tirados), montar, mixar,
  thumbnail; Short (`ferramentas/v2-short/`, a partir do da V1). Publicação prevista: 27/11.

## Andamento (26–27/11/2026): vídeo normal pronto

Retomado em 26/11 com a V1 em 159 visualizações e 7 VPH no 1º dia (Paulo: *"interessante adiantar o video de amanhã pra hj"*).

- **Gravação em produção:** `ferramentas/v2/gravar-v2.cjs`, duas tomadas (26/11, 20:59–21:00 e 21:08–21:10, horário de
  Brasília); vale a 2ª. Na 1ª, a troca para "2ª parcela" dentro da cena 05 atrasava o destaque do INSS em ~1 s; na 2ª, ela
  passou para o "Agora, a segunda" da cena 04. O salário se digita em centavos (`400000` → R$ 4.000,00), como na V1.
- **Montagem e mixagem:** `ferramentas/v2/montar-v2.py` + `mixar.py` → **`~/Vídeos/calculosonline-v2/v2-final-voz.mp4`**
  (1920×1080, **1:32,3** com a tela final; voz −14 LUFS, trilha 8 LU abaixo, final −15,9 LUFS, pico −4,0 dBTP).
- **Thumbnail:** `ferramentas/v2/thumbnail-v2.cjs` → `~/Vídeos/calculosonline-v2/v2-thumbnail.png` (recorte do card da
  2ª parcela tirado da página em produção em 27/11, ~08:38, escala 2, sem cursor; as três linhas do INSS destacadas).
- **Na tela, fora da fala:** a tabela "Prazos de pagamento" mostra a coluna "Em 2026" com o 18/12; a fala não cita a data.
- **Link com UTM** conferido em 27/11: 200, `canonical` limpo.
- **Capítulos** (do `cenas-voz.json`; o YouTube pede ≥ 10 s por capítulo, por isso as cenas curtas se juntam):
  ```
  0:00 Por que a 2ª parcela vem menor
  0:10 As duas parcelas e os prazos
  0:22 O cálculo da 1ª parcela
  0:37 A 2ª parcela e o INSS
  0:49 O imposto de renda e o redutor
  0:59 O total e o link do cálculo
  1:12 Confira o seu
  ```
- **Voz regerada inteira em 27/11** (Paulo: o INSS saía "í, ene, êsse, ésse"; o certo é **"í, êne, ésse, ésse"**, agora a
  grafia nos `voz/v2*.json`; a legenda continua "INSS" pelo `GRAFIA` do `short-voz.py`). 1.184 + 276 caracteres; contador
  12.500 → 13.084 de 40.000. Os tempos das palavras mudaram ≤ 0,3 s: a gravação da tela continua valendo, só remontada e
  remixada (normal **1:31,7**, −16,0 LUFS; Short 25,9 s, −15,4 LUFS). Capítulos acima já pelo corte novo.
- **Short pronto (27/11):** `ferramentas/v2-short/` (gravador, `short.json`, `sobreposicoes.json`) → **`~/Vídeos/calculosonline-v2-short/v2-short-final-voz.mp4`**
  (1080×1920, **25,9 s**, legenda queimada, final −15,5 LUFS; o fecho é o `10-cta` do Short da V1, copiado para `voz/falas/`
  com `origem: reaproveitada`). Gravações em produção: 27/11 ~08:47 (falhou: no celular o formulário passa da tela e o toque
  fora dela não pega; o `tocar` agora rola antes), 08:49 e **08:53 (a que vale: as três linhas do INSS sobem para logo abaixo
  da legenda, fora da interface do YouTube)**. `short-voz.py`: "do" e "da" entraram nas quebras de legenda ("menor?" ficava
  sozinho).
- **Falta:** o Paulo ouvir e publicar o normal e, depois, o Short (com a V2 normal em "Vídeo relacionado" e o comentário fixado).
- **A voz não fala mais "INSS" (27/11, decisão do Paulo).** Mesmo com "í êne ésse ésse", o ElevenLabs fechava o "ésse" no
  meio da frase: 9 versões avulsas (3 por fala, com e sem vírgulas) saíram erradas; sozinha, a sigla saía certa, mas colada na
  frase dava para perceber que era IA. Texto trocado nas três falas por **"o desconto da Previdência"** (Paulo: *"soa mais
  natural"*); a tela, a legenda do bloco, o título, a descrição e a thumbnail seguem com INSS. Voz inteira regerada
  (1.200 + 284 caracteres; contador 14.394 de 40.000 depois de todos os testes). Tempos: "menos o desconto da Previdência"
  em 3,3 s na cena 05, com o destaque do INSS em 3,0 s; a gravação da tela continua valendo. **Normal 1:32,4 (−15,8 LUFS);
  Short 25,9 s (−15,5 LUFS).** Capítulos acima pelo corte novo.

## Publicado (27/11/2026)

- **Normal:** https://youtu.be/3GV6z9MdQig
- **Short:** https://youtube.com/shorts/mFvF4lDTv88
- **Leitura em 28 dias (25/12):** visualizações no Studio e sessões da campanha `v2-segunda-parcela-13` no GA4.
