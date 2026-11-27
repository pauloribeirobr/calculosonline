#!/usr/bin/env python3
"""Narração dos vídeos do canal com a voz autoral (clone "RF narração", ElevenLabs). Porte do Recibo Fácil para o canal Calculos Online (F91): a mesma voz e a mesma chave, que ficam na pasta do RF; regras em docs/roteiros/README.md.

⚠️ GASTA CRÉDITO (AGENTS.md §3.11): só rodar depois do ok do Paulo, dizendo antes quantos caracteres
e o saldo. O script mostra o saldo antes e depois (o contador do ElevenLabs atualiza com atraso de
alguns minutos; reconfira com --saldo).

Uso:
  python3 -I narrar.py roteiro.json            # gera o texto inteiro num pedido só e corta fala a fala
  python3 -I narrar.py roteiro.json --so 03,07 # regera só essas falas (um pedido por fala)
  python3 -I narrar.py --saldo                 # só consulta o saldo (não gasta)
  python3 -I narrar.py roteiro.json --contar   # só conta os caracteres (não gasta)
  python3 -I narrar.py roteiro.json --recortar # refaz os recortes do áudio já gerado (não gasta)

roteiro.json: {"saida": "<pasta>", "falas": [{"id": "01-gancho", "texto": "..."}, ...]}
  opcionais: "voz" (padrão: RF narração), "modelo" (padrão: eleven_v4).
  O "texto" é o que a voz fala: siglas e endereços escritos como se pronunciam
  ("ponto com ponto bê-érre"); a legenda, se houver, sai do roteiro, não daqui.

Saída em <pasta>: completa.mp3 (o pedido inteiro), falas/<id>.wav (cada fala recortada, 44,1 kHz
mono) e falas.json (início e fim de cada fala no áudio inteiro e a duração do recorte).
Chave: ~/.config/recibofacil/elevenlabs.env (ELEVENLABS_API_KEY), nunca no repositório.
"""
import base64, json, os, subprocess, sys, urllib.error, urllib.request

VOZ = '69ENLgn9dwk5BuQvEVce'  # RF narração (clone da voz do Paulo, privada)
MODELO = 'eleven_v4'
API = 'https://api.elevenlabs.io'


def chave():
    for linha in open(os.path.expanduser('~/.config/recibofacil/elevenlabs.env')):
        if linha.startswith('ELEVENLABS_API_KEY='):
            return linha.split('=', 1)[1].strip()
    sys.exit('ELEVENLABS_API_KEY ausente em ~/.config/recibofacil/elevenlabs.env')


def chamar(caminho, corpo=None):
    req = urllib.request.Request(API + caminho, headers={'xi-api-key': chave(), 'Content-Type': 'application/json'},
                                 data=json.dumps(corpo).encode() if corpo is not None else None)
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f'ElevenLabs {e.code}: {e.read().decode()[:300]}')


def saldo():
    u = chamar('/v1/user/subscription')
    return u['character_count'], u['character_limit']


def falar(texto, voz, modelo, guardar):
    """Um pedido com tempos por caractere. Devolve (mp3 em bytes, inícios, fins).
    A resposta crua vai para `guardar` antes de qualquer conferência: crédito gasto não se perde."""
    r = chamar(f'/v1/text-to-speech/{voz}/with-timestamps?output_format=mp3_44100_128',
               {'text': texto, 'model_id': modelo})
    json.dump(r, open(guardar, 'w'))
    al = r.get('alignment') or r.get('normalized_alignment')
    assert al and len(al['characters']) == len(texto), 'alinhamento não bate com o texto enviado'
    return base64.b64decode(r['audio_base64']), al['character_start_times_seconds'], al['character_end_times_seconds']


def ff(*args):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)


def duracao(arq):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                          '-of', 'csv=p=0', arq]).decode())


def silencios(wav):
    """Trechos de silêncio (< -45 dB por 40 ms ou mais), pelo silencedetect."""
    p = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', wav, '-af', 'silencedetect=n=-45dB:d=0.04',
                        '-f', 'null', '-'], capture_output=True, text=True).stderr
    sil, s0 = [], None
    for linha in p.splitlines():
        if 'silence_start:' in linha: s0 = float(linha.split('silence_start:')[1].split()[0])
        if 'silence_end:' in linha: sil.append((s0, float(linha.split('silence_end:')[1].split()[0]))); s0 = None
    if s0 is not None: sil.append((s0, duracao(wav)))
    return sil


def cortar(wav, ch, ini, fim, a, z, sil, saida):
    """Recorta a fala ch[a..z] de `wav`. Fim: 0,05 s depois de a voz entrar em silêncio (nunca no meio da
    inspiração que a voz faz antes da frase seguinte — em 06/11 o corte no meio do silêncio + 0,35 s
    deixava um pedaço de respiração no fim das falas dos Shorts). Começo: no fim do silêncio que
    acaba logo antes da 1ª letra, ou 0,04 s antes dela (sem levar a inspiração). Devolve (c0, c1)."""
    letras = [k for k in range(a, z + 1) if ch[k].isalnum()]
    t0, t1 = ini[letras[0]], fim[letras[-1]]
    depois = [s for s in sil if t1 - 0.08 <= s[0] <= t1 + 0.5]
    c1 = min(depois[0][0] + 0.05, depois[0][1]) if depois else t1 + 0.12
    antes = [s for s in sil if t0 - 0.15 <= s[1] <= t0 + 0.05]
    c0 = max(antes[-1][1] - 0.02, 0.0) if antes else max(t0 - 0.04, 0.0)
    ff('-i', wav, '-ss', f'{c0:.3f}', '-to', f'{c1:.3f}',
       '-af', 'afade=t=in:d=0.01,areverse,afade=t=in:d=0.06,areverse', saida)
    return c0, c1, t0, t1


def recortar_completa(out, falas, meta):
    """Corta fala a fala o áudio do pedido inteiro (completa.wav + resposta-completa.json). Não gasta crédito."""
    al = json.load(open(f'{out}/resposta-completa.json'))['alignment']
    ch = ''.join(al['characters']); ini = al['character_start_times_seconds']; fim = al['character_end_times_seconds']
    sil = silencios(f'{out}/completa.wav'); pos = 0
    for f in falas:
        if meta.get(f['id'], {}).get('origem') == 'avulsa': pos = ch.index(f['texto'], pos) + len(f['texto']); continue
        a = ch.index(f['texto'], pos); z = a + len(f['texto']) - 1; pos = z + 1
        c0, c1, t0, t1 = cortar(f'{out}/completa.wav', ch, ini, fim, a, z, sil, f"{out}/falas/{f['id']}.wav")
        meta[f['id']] = {'texto': f['texto'], 'fala_de': round(t0, 3), 'fala_ate': round(t1, 3),
                         'corte_de': round(c0, 3), 'corte_ate': round(c1, 3), 'origem': 'completa'}


def main():
    if '--saldo' in sys.argv:
        usado, lim = saldo(); print(f'crédito usado {usado} de {lim} (saldo {lim - usado})'); return
    cfg = json.load(open(sys.argv[1]))
    falas = cfg['falas']; voz = cfg.get('voz', VOZ); modelo = cfg.get('modelo', MODELO)
    so = next((a.split(',') for a in sys.argv[2:] if not a.startswith('--')), None) if '--so' in sys.argv else None
    alvo = [f for f in falas if so is None or f['id'] in so]
    n = sum(len(f['texto']) for f in alvo) + (len(alvo) - 1 if so is None else 0)
    out = cfg['saida']; os.makedirs(f'{out}/falas', exist_ok=True)
    meta_arq = f'{out}/falas.json'
    meta = json.load(open(meta_arq)) if os.path.exists(meta_arq) else {}
    if '--recortar' in sys.argv:
        # Só refaz os recortes a partir do áudio já gerado: não chama a API, não gasta crédito.
        recortar_completa(out, falas, meta); antes = None
    else:
        print(f'{len(alvo)} fala(s), {n} caracteres, modelo {modelo}')
        if '--contar' in sys.argv: return
        antes, lim = saldo()
        if so is None:
            # Um pedido só: a entonação corre de uma fala para a outra. Separador = espaço.
            texto = ' '.join(f['texto'] for f in falas)
            mp3, ini, fim = falar(texto, voz, modelo, f'{out}/resposta-completa.json')
            open(f'{out}/completa.mp3', 'wb').write(mp3)
            ff('-i', f'{out}/completa.mp3', '-ar', '44100', '-ac', '1', f'{out}/completa.wav')
            meta = {}
            recortar_completa(out, falas, meta)
        else:
            os.makedirs(f'{out}/avulsas', exist_ok=True)
            for f in alvo:
                mp3, ini, fim = falar(f['texto'], voz, modelo, f"{out}/resposta-{f['id']}.json")
                tmp = f"{out}/avulsas/{f['id']}.mp3"; cru = f"{out}/avulsas/{f['id']}.wav"
                open(tmp, 'wb').write(mp3); ff('-i', tmp, '-ar', '44100', '-ac', '1', cru); os.remove(tmp)
                c0, c1, t0, t1 = cortar(cru, f['texto'], ini, fim, 0, len(f['texto']) - 1, silencios(cru),
                                        f"{out}/falas/{f['id']}.wav")
                meta[f['id']] = {'texto': f['texto'], 'fala_de': round(t0, 3), 'fala_ate': round(t1, 3),
                                 'corte_de': round(c0, 3), 'corte_ate': round(c1, 3), 'origem': 'avulsa'}

    for f in falas:
        if f['id'] in meta and os.path.exists(f"{out}/falas/{f['id']}.wav"):
            meta[f['id']]['duracao'] = round(duracao(f"{out}/falas/{f['id']}.wav"), 3)
            fala = meta[f['id']]['fala_ate'] - meta[f['id']]['fala_de']
            print(f"  {f['id']:16s} recorte {meta[f['id']]['duracao']:5.2f} s  fala {fala:5.2f} s  "
                  f"{len(f['texto'].split()) / max(fala, 0.1):.2f} palavras/s")
    json.dump(meta, open(meta_arq, 'w'), indent=1, ensure_ascii=False)
    if antes is not None:
        depois, lim = saldo()
        print(f'crédito: {antes} → {depois} (o contador atrasa alguns minutos; reconfira com --saldo); limite {lim}')


if __name__ == '__main__':
    main()
