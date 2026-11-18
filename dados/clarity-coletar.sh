#!/usr/bin/env bash
# F89 — coleta diária do Clarity (Data Export API) NO SERVIDOR, para existir histórico: a API só devolve as últimas
# 72 h e aceita 10 chamadas por dia. Porte do ../recibofacil/dados/clarity-coletar.sh (F284), que já roda no mesmo
# servidor para o Recibo Fácil desde 14/11/2026. O Cálculos Online está na Vercel e não tem servidor próprio: a coleta
# usa a máquina do Recibo Fácil, com token, pasta e linha de cron separados.
#
# Instalação (uma vez, no servidor: ssh paulo@69.62.94.73):
#   mkdir -p ~/dados ~/.config/calculosonline
#   (copiar este arquivo para ~/dados/clarity-coletar-calculosonline.sh; chmod +x)
#   printf 'CLARITY_TOKEN=%s\n' '<token do projeto Calculos Online>' > ~/.config/calculosonline/clarity.env
#   chmod 600 ~/.config/calculosonline/clarity.env
#   crontab -e   →   10 0 * * * /home/paulo/dados/clarity-coletar-calculosonline.sh >> /home/paulo/dados/clarity-calculosonline.log 2>&1
#   (o relógio do servidor está em Brasília, −03: 00:10 de Brasília, 5 minutos depois da coleta do Recibo Fácil.)
#
# Saída: ~/dados/clarity-calculosonline/AAAA-MM-DD/<nome>.json, um arquivo por chamada (o dia de Brasília que acabou).
# Usa 4 das 10 chamadas do dia do projeto; sobram 6 para olhadas na hora (dados/clarity.mjs). Arquivo que já existe não
# é pedido de novo: rodar duas vezes no mesmo dia não gasta chamada. Só precisa de bash e curl.
set -euo pipefail
# shellcheck disable=SC1091
. "$HOME/.config/calculosonline/clarity.env"
: "${CLARITY_TOKEN:?CLARITY_TOKEN não definido em ~/.config/calculosonline/clarity.env}"

DIA=$(TZ=America/Sao_Paulo date -d yesterday +%F)
DEST="${CLARITY_DEST:-$HOME/dados/clarity-calculosonline}/$DIA"
mkdir -p "$DEST"

pedir() {
  local nome=$1; shift
  local arq="$DEST/$nome.json"
  [ -s "$arq" ] && return 0
  local q="numOfDays=1" i=1 d
  for d in "$@"; do q="$q&dimension$i=${d// /%20}"; q="${q//\//%2F}"; i=$((i + 1)); done
  if curl -sS --fail --max-time 60 -H "Authorization: Bearer $CLARITY_TOKEN" \
       "https://www.clarity.ms/export-data/api/v1/project-live-insights?$q" -o "$arq.tmp"; then
    mv "$arq.tmp" "$arq"; echo "$(date -Is) ok $DIA $nome"
  else
    rm -f "$arq.tmp"; echo "$(date -Is) FALHOU $DIA $nome"
  fi
}

pedir total
pedir url-aparelho URL Device
pedir origem-midia-canal Source Medium Channel
pedir aparelho-so-navegador Device OS Browser
