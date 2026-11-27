#!/usr/bin/env python3
"""Short com a voz autoral: põe cada fala gerada (narrar.py) no instante em que a tela mostra o
passo de que ela fala, mixa com a música do canal e queima a legenda da fala. Não gasta crédito.

Rodar na pasta do Short:  cd ~/Vídeos/calculosonline-v1-short && python3 -I <repo>/docs/roteiros/ferramentas/short-voz.py
Entradas: <nome>-tela-montada.mp4, <nome>-fala.srt e cenas.json (montar-short.py: a fala ancorada nos
passos) e voz/ (narrar.py com docs/roteiros/voz/<nome>.json: falas.json, falas/*.wav, resposta-completa.json).
Cada fala começa onde começa, no .srt, a frase com que ela abre.
Saídas: <nome>-final-voz.mp4 (com a legenda queimada), <nome>-legenda-voz.srt (a mesma legenda, para
conferir ou subir como legenda no Studio) e legendas/ (os PNGs).

Legenda (roteiro dos Shorts: "legenda queimada obrigatória — a maioria assiste sem som"): sai do tempo
de cada palavra devolvido pelo ElevenLabs; frases cortadas em pedaços de até 42 caracteres (duas
linhas), quebrando de preferência em vírgula ou antes de "e"/"que"/"no"; cada pedaço aparece com a 1ª
palavra e fica até o próximo. No bloco do cartão final ("cta") não há legenda: o
cartão já mostra o endereço e o "Link fixado nos comentários".
Short não tem abertura nem tela final (README "Identidade do canal"); a música vai até o fim, com fade.
"""
import glob, json, os, re, subprocess, sys

REPO = '/home/paulo/projects/next/calculosonline'
FERR = f'{REPO}/docs/roteiros/ferramentas'
MUSICA = '/home/paulo/Vídeos/calculosonline-musica/calculosonline-trilha.mp3'
nome = os.path.basename(glob.glob('*-tela-montada.mp4')[0]).replace('-tela-montada.mp4', '')
total = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0',
                                       f'{nome}-tela-montada.mp4']).decode())


def srt_itens(arq):
    out = []
    for bloco in open(arq, encoding='utf-8').read().strip().split('\n\n'):
        linhas = bloco.split('\n')
        h, m, s = linhas[1].split(' --> ')[0].replace(',', '.').split(':')
        out.append((int(h) * 3600 + int(m) * 60 + float(s), ' '.join(linhas[2:])))
    return out


def norm(t):  # o texto da voz escreve a pronúncia ("bê-érre"); a legenda do roteiro, a grafia ("b-r")
    return re.sub(r'\W+', ' ', t.replace('bê-érre', 'b-r').lower()).strip()


MAX_CHARS = 42                     # duas linhas da tarja (render-legendas.cjs)
# "do": Short da V2, 27/11/2026 — sem ele, "A segunda parcela do décimo terceiro veio | menor?" deixava "menor?" sozinho.
QUEBRA_ANTES = {'e', 'que', 'mas', 'ou', 'no', 'na', 'do', 'da', 'com', 'sem', 'pra', 'para', 'antes', 'depois'}


# A voz escreve a pronúncia; a legenda mostra a grafia (Calculos Online, 25/11/2026: "í ó éfe" na voz, "IOF" na tela).
GRAFIA = {'í ó éfe': 'IOF', 'í êne ésse ésse': 'INSS', 'í ene ésse ésse': 'INSS', 'cê dê bê': 'CDB', 'cê dê í': 'CDI', 'bê três': 'B3'}


def limpar(t):
    t = re.sub(r'[.,;:—\s]+$', '', t)
    for falado, escrito in GRAFIA.items():
        t = t.replace(falado, escrito)
    return t


def dividir(palavras):
    """Pedaços de até MAX_CHARS. Quando precisa quebrar, volta até a última quebra boa (depois de vírgula
    ou dois-pontos, ou antes de "e", "que", "no"…) que deixe pelo menos 12 caracteres no pedaço."""
    grupos, atual = [], []
    for p in palavras:
        if atual and len(' '.join(x[1] for x in atual + [p])) > MAX_CHARS:
            corte = len(atual)
            for j in range(len(atual) - 1, 0, -1):
                boa = re.search(r'[,:;]$', atual[j - 1][1]) or atual[j][1].lower() in QUEBRA_ANTES
                if boa and len(' '.join(x[1] for x in atual[:j])) >= 12: corte = j; break
            grupos.append(atual[:corte]); atual = atual[corte:]
        atual.append(p)
    return grupos + [atual]


def srt_t(s):
    h, r = divmod(s, 3600); m, s2 = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s2):02d},{int(round((s2 % 1) * 1000)):03d}"


# 1. Onde entra cada fala.
itens = srt_itens(f'{nome}-fala.srt')
voz = json.load(open('voz/falas.json'))
posicoes, usados, fim_anterior, colocadas = [], 0, 0.0, []
for fid, f in voz.items():
    alvo = norm(f['texto'])
    k = next(k for k in range(usados, len(itens)) if alvo.startswith(norm(itens[k][1])))
    usados = k + 1
    inicio = max(itens[k][0], fim_anterior + 0.15)
    fim_anterior = inicio + f['duracao']
    assert fim_anterior <= total + 0.01, f'{fid}: a fala passa do fim do Short'
    posicoes.append({'arquivo': f'voz/falas/{fid}.wav', 'inicio': round(inicio, 3)})
    colocadas.append((fid, f, inicio))
    print(f'{fid:15s} {inicio:5.2f}s → {fim_anterior:5.2f}s  "{f["texto"][:50]}"')

# 2. Legenda pelo tempo de cada palavra.
al = json.load(open('voz/resposta-completa.json'))['alignment']
CH_COMPLETA = ''.join(al['characters']); INI_COMPLETA = al['character_start_times_seconds']
cta = next((c for c in json.load(open('cenas.json')) if c['id'] == 'cta'), None)
pedacos, pos = [], 0
for n_fala, (fid, f, inicio) in enumerate(colocadas):
    # O cartão final não tem legenda. Pular antes de procurar o texto: o fecho pode vir de outro Short
    # (V4, 12/11/2026: o 08-cta é o fecho da V2, `origem: reaproveitada`) e não estar na voz deste.
    if cta and inicio >= cta['inicio'] - 0.01:
        continue
    if f.get('origem') == 'avulsa':
        # Fala regerada sozinha (narrar.py --so): os tempos das letras estão na resposta dela, e o corte_de
        # já é medido no áudio dela. Short da V2, 08/11/2026: só o 04-parcelas foi regerado.
        r = json.load(open(f'voz/resposta-{fid}.json')); al_f = r.get('alignment') or r.get('normalized_alignment')
        CH = ''.join(al_f['characters']); INI = al_f['character_start_times_seconds']; a = CH.index(f['texto'])
    else:
        CH, INI = CH_COMPLETA, INI_COMPLETA
        a = CH.index(f['texto'], pos); pos = a + len(f['texto'])
    desloc = inicio - f['corte_de']                    # tempo no áudio inteiro → tempo no Short
    fim_fala = f['fala_ate'] + desloc
    prox = colocadas[n_fala + 1][2] if n_fala + 1 < len(colocadas) else total
    for frase in re.split(r'(?<=[.?!])\s+', f['texto']):
        b = CH.index(frase, a); a = b + len(frase)
        # Palavras com o instante da 1ª letra; travessão e pontuação soltos vão colados na anterior.
        palavras = []
        for m in re.finditer(r'\S+', frase):
            if palavras and not re.search(r'\w', m.group()): palavras[-1][1] += ' ' + m.group(); continue
            palavras.append([INI[b + m.start()] + desloc, m.group()])
        # Frase de uma palavra ("Pronto.") vai junto do pedaço anterior da mesma fala: sozinha, piscaria.
        if len(palavras) == 1 and pedacos and pedacos[-1]['fala'] == n_fala:
            pedacos[-1]['texto'] = limpar(pedacos[-1]['texto_cru'] + ' ' + palavras[0][1]); continue
        for grupo in dividir(palavras):
            cru = ' '.join(p[1] for p in grupo)
            pedacos.append({'de': grupo[0][0] - 0.05, 'texto': limpar(cru), 'texto_cru': cru, 'fala': n_fala,
                            'fim_fala': fim_fala, 'prox': prox})
for i, p in enumerate(pedacos):
    seguinte = pedacos[i + 1] if i + 1 < len(pedacos) else None
    if seguinte and seguinte['fala'] == p['fala']:
        ate = seguinte['de'] - 0.02                    # o próximo pedaço da mesma fala entra no lugar
    else:                                              # último pedaço da fala: fica 0,3 s depois dela
        ate = min(max(p['fim_fala'] + 0.3, p['de'] + 0.8), p['prox'] - 0.05)
        if seguinte: ate = min(ate, seguinte['de'] - 0.02)
    p['ate'] = round(ate, 3); p['de'] = round(max(p['de'], 0.0), 3); p['png'] = f'leg-{i + 1:02d}.png'
with open(f'{nome}-legenda-voz.srt', 'w', encoding='utf-8') as s:
    for i, p in enumerate(pedacos, 1): s.write(f"{i}\n{srt_t(p['de'])} --> {srt_t(p['ate'])}\n{p['texto']}\n\n")
json.dump([{'png': p['png'], 'texto': p['texto']} for p in pedacos], open('legendas.json', 'w'), ensure_ascii=False)
subprocess.run(['node', f'{FERR}/shorts/render-legendas.cjs', 'legendas.json', 'legendas'], check=True)
for p in pedacos: print(f"  legenda {p['de']:5.2f}–{p['ate']:5.2f}s  {p['texto']}")

# 3. Áudio (voz + música) e legenda queimada.
json.dump({'video': f'{nome}-tela-montada.mp4', 'saida': f'{nome}-mix.mp4', 'musica': MUSICA,
           'fade': 1.5, 'falas': posicoes}, open('posicoes-voz.json', 'w'), indent=1, ensure_ascii=False)
subprocess.run([sys.executable, '-I', f'{FERR}/mixar.py', 'posicoes-voz.json'], check=True)
entradas, filtros, ult = ['-i', f'{nome}-mix.mp4'], [], '0:v'
for i, p in enumerate(pedacos):
    entradas += ['-i', f"legendas/{p['png']}"]
    filtros.append(f"[{ult}][{i + 1}:v]overlay=0:0:enable='between(t,{p['de']:.3f},{p['ate']:.3f})'[l{i}]"); ult = f'l{i}'
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *entradas, '-filter_complex', ';'.join(filtros),
                '-map', f'[{ult}]', '-map', '0:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
                '-r', '30', '-c:a', 'copy', '-movflags', '+faststart', f'{nome}-final-voz.mp4'], check=True)
os.remove(f'{nome}-mix.mp4')
print(f'{nome}-final-voz.mp4 com {len(pedacos)} legendas')
