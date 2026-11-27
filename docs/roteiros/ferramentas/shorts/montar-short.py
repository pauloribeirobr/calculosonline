#!/usr/bin/env python3
# Montagem de um Short (1080×1920, 30 fps, sem áudio) a partir da gravação do celular emulado.
# Uso (na pasta do Short): python3 -I <repo>/docs/roteiros/ferramentas/shorts/montar-short.py short.json
# Lê frames/ + quadros.json + marcas.json do gravador, o PDF baixado e as sobreposições
# (render-sobreposicoes.cjs). Gera <nome>-tela-bruta.mp4, <nome>-tela-montada.mp4, <nome>-fala.srt,
# cenas.json e guia-narracao.md.
import json, os, re, shutil, subprocess, sys

cfg = json.load(open(sys.argv[1]))
NOME = cfg['nome']
RITMO = 2.4
q = json.load(open('quadros.json')); mj = json.load(open('marcas.json'))
t0 = q[0]['ts']
M = {x['nome']: x['epoch'] - t0 for x in mj['marcas']}
ENC = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', '30', '-an']

def run(args): subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)
def mmss(t): return f"{int(t // 60)}:{t % 60:04.1f}"

# 1. Bruta a 30 fps (o screencast só manda quadro quando a tela muda: o último é segurado até o fim).
fim = M['fim']
with open('concat.txt', 'w') as f:
    for i, x in enumerate(q):
        d = (q[i + 1]['ts'] - x['ts']) if i + 1 < len(q) else (fim + t0 - x['ts'])
        f.write(f"file '{x['nome']}'\nduration {max(d, 0.001):.4f}\n")
    f.write(f"file '{q[-1]['nome']}'\n")
bruta = f'{NOME}-tela-bruta.mp4'
run(['-f', 'concat', '-safe', '0', '-i', 'concat.txt', '-vf', 'fps=30,format=yuv420p', *ENC, bruta])

# 2. Blocos: cada um tira um trecho da bruta (ou o PDF / o cartão final) e ocupa a sua janela.
shutil.rmtree('seg', ignore_errors=True); os.makedirs('seg')
SOB = cfg['sobreposicoes']
partes, cenas, t = [], [], 0.0
for i, b in enumerate(cfg['blocos']):
    saida = f"seg/{i:02d}-{b['id']}.mp4"; dur = b['duracao']
    if b['origem'] == 'bruta':
        a, z = M[b['de']] + b.get('desloc_de', 0), M[b['ate']] + b.get('desloc_ate', 0)
        fator = max((z - a) / dur, 1.0)
        entradas = ['-i', bruta]; filtros = [f"[0]trim=start={a:.3f}:end={z:.3f},setpts=(PTS-STARTPTS)/{fator:.4f},tpad=stop_mode=clone:stop_duration={dur:.3f},trim=duration={dur:.3f},fps=30[v0]"]
        ult = 'v0'
        # Sobreposições: (png, marca de início, marca de fim) em tempo da bruta → tempo do bloco.
        # O 4º e o 5º itens (opcionais) ajustam a marca em segundos: a marca de um passo novo é
        # registrada depois da espera que segue o toque no "Próximo", e o rótulo troca com a tela.
        for k, (png, de, ate, *aj) in enumerate(b.get('rotulos', [])):
            aj_de, aj_ate = (aj + [0, 0])[:2]
            ini = 0 if de is None else max((M[de] + aj_de - a) / fator, 0)
            fi = dur if ate is None else min((M[ate] + aj_ate - a) / fator, dur)
            entradas += ['-i', f'{SOB}/{png}']
            filtros.append(f"[{ult}][{k + 1}]overlay=0:0:enable='between(t,{ini:.3f},{fi:.3f})'[v{k + 1}]"); ult = f'v{k + 1}'
        run([*entradas, '-filter_complex', ';'.join(filtros), '-map', f'[{ult}]', *ENC, saida])
        print(f"{b['id']:12s} bruta {z - a:5.1f}s → {dur:4.1f}s ({fator:.2f}×{' + quadro parado' if z - a < dur else ''})")
    elif b['origem'] == 'pdf':
        # O PDF baixado em tela cheia, como abre no celular: página na largura, desce devagar.
        # "pagina" (opcional, 1 por padrão): a folha mostrada. V6, 19/11/2026: o distrato tem as assinaturas e as
        # testemunhas na folha 2.
        pg = b.get('pagina', 1)
        subprocess.run(['pdftoppm', '-png', '-f', str(pg), '-l', str(pg), '-singlefile', '-scale-to-x', '1000', '-scale-to-y', '-1',
                        cfg['pdf'], f'pdf-{pg}'], check=True)
        k = f'min(t/{dur},1)'
        run(['-f', 'lavfi', '-i', f'color=c=0x2B2B2E:s=1080x1920:r=30:d={dur}', '-loop', '1', '-i', f'pdf-{pg}.png',
             '-filter_complex', f"[1]scale=1000:-1[p];[0][p]overlay=x=40:y='300-120*({k})':shortest=1,fps=30", '-t', str(dur), *ENC, saida])
    elif b['origem'] == 'pdf-notas':
        # As notas de todas as páginas em cascata (V2, 07/11/2026): cada página recortada na caixa da
        # nota ("caixa_pt": x, y, largura, altura em pontos do PDF), na "largura" em px, entrando uma
        # a uma; a de baixo fica inteira por cima das outras. O recorte sai pequeno direto do
        # pdftoppm: nada de página 4× em loop num ffmpeg só (em 07/11 isso derrubou a IDE).
        x_pt, y_pt, w_pt, h_pt = b['caixa_pt']; larg = b.get('largura', 800)
        dpi = larg / w_pt * 72; esc = dpi / 72
        alt = round(h_pt * esc); passo_y = b.get('passo', 112); topo = b.get('topo', 480)
        n_pag = int(re.search(r'Pages:\s+(\d+)', subprocess.check_output(['pdfinfo', cfg['pdf']]).decode()).group(1))
        for n in range(1, n_pag + 1):
            subprocess.run(['pdftoppm', '-png', '-r', f'{dpi:.3f}', '-f', str(n), '-l', str(n), '-singlefile',
                            '-x', str(round(x_pt * esc)), '-y', str(round(y_pt * esc)), '-W', str(larg), '-H', str(alt),
                            cfg['pdf'], f'nota-{n}'], check=True)
        x0 = (1080 - larg) // 2
        ent = ['-f', 'lavfi', '-i', f'color=c={b.get("fundo", "0x2B2B2E")}:s=1080x1920:r=30:d={dur}']
        fc, ult = [], '0'
        for n in range(n_pag):
            ent += ['-loop', '1', '-framerate', '30', '-i', f'nota-{n + 1}.png']
            fc.append(f'[{n + 1}]pad={larg + 6}:{alt + 6}:3:3:color=0x15151A[n{n}]')
            fc.append(f"[{ult}][n{n}]overlay=x={x0 - 3}:y={topo + n * passo_y - 3}:shortest=1:"
                      f"enable='gte(t,{0.1 + b.get('entra', 0.16) * n:.2f})'[o{n}]")
            ult = f'o{n}'
        run([*ent, '-filter_complex', ';'.join(fc) + f';[{ult}]fps=30,format=yuv420p[v]', '-map', '[v]', '-t', str(dur), *ENC, saida])
    elif b['origem'] == 'cta':
        run(['-loop', '1', '-i', f'{SOB}/cta.png', '-vf', 'fps=30,format=yuv420p', '-t', str(dur), *ENC, saida])
    fala = ' '.join(x[2] for x in b['falas']) if b.get('falas') else b.get('fala', '')
    cenas.append({'id': b['id'], 'inicio': round(t, 2), 'duracao': dur, 'fala': fala})
    partes.append(saida); t += dur

with open('seg/lista.txt', 'w') as f: f.writelines(f"file '{os.path.basename(p)}'\n" for p in partes)
montada = f'{NOME}-tela-montada.mp4'
run(['-f', 'concat', '-safe', '0', '-i', 'seg/lista.txt', '-c', 'copy', montada])
json.dump(cenas, open('cenas.json', 'w'), indent=1, ensure_ascii=False)

# 3. Legenda da fala (.srt). Cada frase começa no início do bloco ou, com "falas", na marca do passo
#    de que ela fala (a voz acompanha a tela), e nunca antes do fim da anterior; dura o que leva a
#    2,4 palavras/s. Frases longas viram pedaços equilibrados de até 7 palavras.
import math
def srt_t(s): h, r = divmod(s, 3600); m, s2 = divmod(r, 60); return f"{int(h):02d}:{int(m):02d}:{int(s2):02d},{int(round((s2 % 1) * 1000)):03d}"
def pedacos(frase):
    # Travessão e pontuação soltos vão colados na palavra anterior: não contam como palavra.
    w = []
    for tok in frase.split():
        if w and not re.search(r'\w', tok): w[-1] += ' ' + tok
        else: w.append(tok)
    n = max(1, math.ceil(len(w) / 7)); tam = math.ceil(len(w) / n)
    return [' '.join(w[i:i + tam]) for i in range(0, len(w), tam)]
def juntar_curtas(frases):
    # "Pronto." sozinho piscaria na tela: frase de uma palavra vai junto com a anterior.
    out = []
    for q_, fr in frases:
        if out and len(re.findall(r'\w+', fr)) <= 1: out[-1] = (out[-1][0], out[-1][1] + ' ' + fr)
        else: out.append((q_, fr))
    return out
itens = []
for c, b in zip(cenas, cfg['blocos']):
    if not c['fala']: continue
    if b.get('falas'):
        a0 = M[b['de']] + b.get('desloc_de', 0); z0 = M[b['ate']] + b.get('desloc_ate', 0); fator = max((z0 - a0) / c['duracao'], 1.0)
        frases = [(c['inicio'] + (0 if mk is None else max((M[mk] + aj - a0) / fator, 0)), tx) for mk, aj, tx in b['falas']]
    else:
        frases = [(c['inicio'], fr) for fr in re.split(r'(?<=[.?!])\s+', c['fala'])]
    ini = c['inicio'] + 0.2
    for quando, fr in juntar_curtas(frases):
        ini = max(ini, quando + 0.2)
        for p in pedacos(fr):
            fi = min(ini + max(len(re.findall(r'\w+', p)) / RITMO, 0.9), c['inicio'] + c['duracao'])
            itens.append((ini, fi, p)); ini = fi
with open(f'{NOME}-fala.srt', 'w', encoding='utf-8') as f:
    for n, (a, z, p) in enumerate(itens, 1): f.write(f"{n}\n{srt_t(a)} --> {srt_t(z)}\n{p}\n\n")

# 4. Guia de narração.
linhas = ['| Início | Janela | Bloco (tela) | Fala | Palavras → fala prevista |', '|---:|---:|---|---|---:|']
for c, b in zip(cenas, cfg['blocos']):
    w = len(re.findall(r'\w+', c['fala']))
    # Com a voz gerada antes da tela ("voz_antes", da V2 em diante), quem confere se a fala cabe é o
    # short-voz.py, com a duração real; a conta a 2,4 palavras/s era para a narração ao vivo.
    if w and not cfg.get('voz_antes'): assert w / RITMO <= c['duracao'], f"{c['id']}: fala {w / RITMO:.1f}s > janela {c['duracao']}s"
    linhas.append(f"| {mmss(c['inicio'])} | {str(c['duracao']).replace('.', ',')} s | {b['tela']} | {'“' + c['fala'] + '”' if w else '—'} | {f'{w} → {w / RITMO:.1f} s'.replace('.', ',') if w else '—'} |")
open('guia-narracao.md', 'w', encoding='utf-8').write(cfg['guia_cabecalho'].replace('{TOTAL}', mmss(t)) + '\n## Linha do tempo\n\n' + '\n'.join(linhas) + '\n\n' + cfg['guia_rodape'] + '\n')
print('total', mmss(t))
