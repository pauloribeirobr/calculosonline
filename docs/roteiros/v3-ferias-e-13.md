# Roteiro de gravação — V3 Férias e 13º juntos em dezembro

**Página:** https://calculosonline.com.br/calculadora/ferias-e-decimo-terceiro
**Feature:** F91. Pauta V1–V10 aprovada pelo Paulo em 25/11; ritmo de um vídeo a cada 2 dias, então a V3 sai em **29/11**.
**Escrito em:** 27/11/2026, no molde da V2 | **Status:** ⏳ **texto para o Paulo aprovar**

Duas versões: **vídeo normal** (horizontal, ~1:40 + 10 s de tela final) e **Short** (vertical, ~30 s), que também vira
Reel. O público é quem vai tirar férias no fim do ano e quer saber quanto entra no total. A página do 13º e esta foram as
mais visitadas do site em novembro.

---

## Fatos que o roteiro respeita

Conferidos no código e na página em produção em 27/11/2026 (só leitura). Conferir de novo antes de gravar:

| Fato | Onde |
|---|---|
| Campos: **Salário Bruto** (R$, digitado em centavos: `300000` → R$ 3.000,00), **Mês de admissão** (lista; padrão "0 — Já trabalhava antes do ano corrente"), **Dias de faltas injustificadas** (stepper), **Dias de férias vendidos (abono)** (stepper, atalho `+10`), **Dependentes (IRRF)**, **Receber a 1ª parcela do 13º junto das férias?** (lista). Botão **Calcular Férias + 13º** | `FeriasDecimoTerceiroForm.tsx`, página |
| Férias + 1/3 e 13º são **tributados em separado**, cada um com a sua tabela; a soma das duas contas é legítima (pagamentos independentes) | motor `ferias-decimo-terceiro.ts`, página |
| **O total não inclui o salário do mês**: quem sai de férias recebe o salário daquele mês menor, porque os dias de férias foram pagos antes, no recibo. Aparece como aviso logo abaixo do resultado | motor (avisos), página |
| Prazos: recibo de férias até **2 dias antes** do início (CLT art. 145); 1ª parcela do 13º até **30/11**, sem descontos; 2ª até **20/12**, com os descontos do 13º inteiro (Lei 4.749/1965) | página ("Quando cada dinheiro cai") |
| Em 2026, o 20/12 cai num domingo e a 2ª parcela antecipa para 18/12 | página — **fica fora da fala** (só vale este ano) |
| Abono pecuniário: até 1/3 das férias vendido (CLT art. 143), **isento de INSS e IRRF** (Lei 8.212/1991, art. 28, §9º); os dias vendidos são trabalhados | página, motor |

**Números do motor** (salário R$ 3.000, ano inteiro, 30 dias de férias, sem dependentes; os mesmos da "Resposta rápida" da
página). Só na tela e na descrição; a fala diz o mecanismo (as tabelas mudam todo ano):

| Linha | Padrão | Vendendo 10 dias |
|---|---|---|
| Férias (30 dias + 1/3) | + R$ 4.000,00 | "Férias (20 dias + 1/3 e 10 vendidos)" + R$ 4.000,00 |
| INSS e IRRF sobre as férias | − R$ 368,60 | − R$ 215,69 |
| Recibo de férias, líquido | **+ R$ 3.631,40** | + R$ 3.784,31 |
| 13º proporcional (12/12) | + R$ 3.000,00 | igual |
| 1ª parcela do 13º (50%, sem descontos) | **+ R$ 1.500,00** | igual |
| INSS e IRRF sobre o 13º (cobrados na 2ª parcela) | − R$ 248,60 | igual |
| 2ª parcela do 13º | **+ R$ 1.251,40** | igual |
| Total líquido (férias + 13º) | **+ R$ 6.382,80** | **+ R$ 6.535,71** |

**Não fale no vídeo:** valores de desconto, de imposto ou de resultado (mudam com a tabela); "INSS" e "IRRF" (a voz erra a
sigla no meio da frase: dizer "o desconto da Previdência" e "o imposto de renda"; regra de 27/11); a data de 18/12; nome
de empresa ou de banco.

**Na gravação:** salário `300000`; mês de admissão, faltas, dependentes e o adiantamento ficam no padrão. A venda de dias
usa o atalho `+10` do stepper do abono. O aviso do salário do mês é destacado pela caixa âmbar, como as linhas.

---

# 1. VÍDEO NORMAL (~1:40 + tela final)

### Gancho  ·  27 palavras ≈ 9,5 s
**Tela:** topo da página, H1 visível; o cursor desce até o formulário.
> "Vai tirar férias em dezembro? São três pagamentos em semanas diferentes, e o salário do mês vem menor. Vamos fazer a conta inteira."

> **Abertura de 1 s.**

### Os três pagamentos  ·  37 palavras ≈ 13 s
**Tela:** rolagem até "Quando cada dinheiro cai"; destaque em cada linha da tabela, na ordem da fala.
> "O recibo de férias sai até dois dias antes de você sair. A primeira parcela do décimo terceiro, até trinta de novembro, sem desconto. E a segunda, até vinte de dezembro, com os descontos."

### Preencher  ·  33 palavras ≈ 11,5 s
**Tela:** volta ao formulário; o cursor passa por salário, mês de admissão e dias vendidos; salário `3000`; **Calcular Férias + 13º**.
> "Aqui no Cálculos Online, você põe o salário, o mês em que entrou na empresa e os dias de férias vendidos, se for o caso. Três mil reais, ano inteiro, trinta dias."

### As férias  ·  26 palavras ≈ 9 s
**Tela:** o resultado; destaque em "Férias (30 dias + 1/3)", depois em "INSS e IRRF sobre as férias", depois em "Recibo de férias, líquido".
> "As férias vêm com um terço a mais e já saem com o desconto da Previdência e o imposto de renda. Esse é o recibo de férias."

### O décimo terceiro  ·  21 palavras ≈ 7,5 s
**Tela:** destaque em "1ª parcela do 13º", depois em "INSS e IRRF sobre o 13º", depois em "2ª parcela do 13º".
> "No décimo terceiro, a primeira parcela vem sem desconto. Os descontos do décimo terceiro inteiro saem de uma vez, na segunda."

### O total  ·  21 palavras ≈ 7,5 s
**Tela:** destaque em "Total líquido (férias + 13º)".
> "Somando tudo, este é o total que entra: férias mais décimo terceiro, cada um com os seus descontos, calculados em separado."

### O salário do mês  ·  31 palavras ≈ 11 s
**Tela:** destaque no aviso "O total acima é férias + 13º e NÃO inclui o salário do mês…".
> "Mas atenção: esse total não inclui o salário do mês. Quem sai de férias recebe o salário daquele mês menor, porque os dias de férias já foram pagos antes, no recibo."

### Vender dez dias  ·  31 palavras ≈ 11 s
**Tela:** "Dias de férias vendidos" → `+10`, Calcular; destaque em "Férias (20 dias + 1/3 e 10 vendidos)", depois em "Total líquido".
> "E se você vender dez dias de férias? O valor vendido não tem desconto da Previdência nem imposto de renda, por isso o total sobe. Em troca, você trabalha esses dias."

### Compartilhar  ·  12 palavras ≈ 4,5 s
**Tela:** o botão "Compartilhar via WhatsApp" destacado (sem clicar).
> "O botão do WhatsApp manda essa conta pronta para quem você quiser."

### Fechamento  ·  20 palavras ≈ 7 s
**Tela:** volta ao topo; H1.
> "Então, antes de sair de férias, faça a sua conta aqui. É grátis, sem cadastro. O link está na descrição."

> **Tela final de 10 s.**

---

# 2. SHORT (~30 s)

Celular emulado, como o da V2: resultado logo abaixo da pílula e da legenda, nada importante abaixo de ~500 px CSS.

| Bloco | Pílula | Fala | Tela |
|---|---|---|---|
| gancho | texto grande `FÉRIAS + 13º|QUANTO CAI?` | "Férias e décimo terceiro em dezembro? Quanto cai na conta?" | o formulário |
| salario | `R$ 3.000` | "Três mil reais de salário." | salário, Calcular |
| ferias | `FÉRIAS` | "As férias vêm com um terço a mais." | "Recibo de férias, líquido" |
| decimo | `13º` | "O décimo terceiro, em duas parcelas." | as duas parcelas |
| total | `TOTAL` | "Este é o total." | "Total líquido (férias + 13º)" |
| atencao | `ATENÇÃO` | "Mas o salário do mês vem menor: as férias foram pagas antes." | o aviso do salário do mês |
| fecho | — | "Faça a sua conta antes de sair." | o total |
| cta | cartão final (`/calculadora/ferias-e-decimo-terceiro`) | o fecho gravado na V1 (`10-cta`), sem crédito | |

---

## Metadados

### Vídeo normal
- **Título:** `Férias e 13º em dezembro: quanto cai na conta (e por que o salário do mês vem menor)`
- **Descrição:**
  ```
  Calculadora de férias + 13º, grátis e sem cadastro:
  https://calculosonline.com.br/calculadora/ferias-e-decimo-terceiro?utm_source=youtube&utm_medium=video&utm_campaign=v3-ferias-e-13

  Quem tira férias no fim do ano recebe três pagamentos em semanas diferentes: o recibo de férias
  (até 2 dias antes de sair), a 1ª parcela do 13º (até 30 de novembro, sem descontos) e a 2ª parcela
  (até 20 de dezembro, com o INSS e o IRRF do 13º inteiro). Férias e 13º são tributados em separado,
  cada um com a sua tabela, e podem ser somados. O que não entra nessa soma é o salário do mês, que
  vem menor porque os dias de férias já foram pagos no recibo.

  Exemplo do vídeo: salário de R$ 3.000, ano inteiro, 30 dias de férias, sem dependentes, pelas
  tabelas de 2026. Vendendo 10 dias (abono), o valor vendido é isento de INSS e IRRF.
  A calculadora do site usa sempre a tabela do ano.

  [capítulos pelo corte final]

  Fontes:
  Férias e abono (CLT, arts. 129 a 145): https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm
  Terço de férias (Constituição, art. 7º, XVII): https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm
  Prazos do 13º (Lei 4.749/1965): https://www.planalto.gov.br/ccivil_03/leis/l4749.htm
  Abono fora do salário de contribuição (Lei 8.212/1991, art. 28): https://www.planalto.gov.br/ccivil_03/leis/l8212cons.htm
  Tabela do INSS 2026: https://www.gov.br/inss/pt-br/assuntos/com-reajuste-de-3-9-teto-do-inss-chega-a-r-8-475-55-em-2026
  Redutor do IR (Receita Federal): https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/exemplos-de-aplicacao-da-lei-15-270-2025

  Conteúdo educativo. Confira os valores no seu holerite.
  ```
- **Tags:** `férias e 13º`, `férias em dezembro`, `calcular férias`, `13º salário`, `vender férias`, `abono pecuniário`, `salário depois das férias`
- **Thumbnail:** fundo escuro, `FÉRIAS + 13º: QUANTO CAI?`, recorte do resultado com o "Total líquido" destacado; selo `SALÁRIO VEM MENOR`.
- **Categoria:** Educação. **Uso de IA:** Não. **Público:** não é para crianças.

### Short
- **Título:** `Férias e 13º em dezembro: quanto cai? #ferias #13salario`
- **Descrição:** `Férias + 13º no fim do ano: o total e por que o salário do mês vem menor.` + link (`utm_campaign=v3-ferias-e-13`)
- **Comentário fixado:** `Calcule o seu em https://calculosonline.com.br/calculadora/ferias-e-decimo-terceiro`
- **Vídeo relacionado:** a V3 normal.

---

## Andamento

- 27/11: roteiro escrito; números conferidos em produção (só leitura). **Falta:** aprovação do texto → voz (com o ok do
  crédito; ~1.360 caracteres no normal e ~270 no Short) → gravação → montagem → thumbnail.
