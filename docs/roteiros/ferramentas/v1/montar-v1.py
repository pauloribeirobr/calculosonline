#!/usr/bin/env python3
"""V1 (Tesouro Reserva) montada sobre a voz autoral — 25/11/2026. Não gasta crédito. Porte do montar-v6-voz.py do RF.

Rodar na pasta da V1:  cd ~/Vídeos/calculosonline-v1 && python3 -I <repo>/docs/roteiros/ferramentas/v1/montar-v1.py
Entradas: frames/ + quadros.json + marcas.json (gravar-v1.cjs), a identidade do canal e voz/ (narrar.py com
docs/roteiros/voz/v1.json: falas/*.wav, falas.json).
Saídas: v1-tela-bruta.mp4, marcas-video.json, seg-voz/, v1-tela-voz.mp4 (sem áudio), cenas-voz.json e posicoes-voz.json
(para o mixar.py).

A voz veio ANTES da tela (o gravar-v1.cjs põe cada ação no instante da fala), então cada cena entra em velocidade normal,
do tamanho da gravação (ou segura o último quadro até a voz acabar). Abertura de 1 s depois do gancho e tela final de 10 s.
"""
import json, os, shutil, subprocess

REPO = '/home/paulo/projects/next/calculosonline'
ID = f'{REPO}/docs/roteiros/identidade'
MUSICA = '/home/paulo/Vídeos/calculosonline-musica/calculosonline-trilha.mp3'
ENC = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', '30', '-an']
OUT = 'seg-voz'


def run(args):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)


q = json.load(open('quadros.json')); mj = json.load(open('marcas.json'))
t0 = q[0]['ts']
M = {x['nome']: round(x['epoch'] - t0, 3) for x in mj['marcas']}
json.dump(M, open('marcas-video.json', 'w'), indent=1)
if not os.path.exists('v1-tela-bruta.mp4') or os.path.getmtime('v1-tela-bruta.mp4') < os.path.getmtime('quadros.json'):
    with open('concat.txt', 'w') as f:
        for i, x in enumerate(q):
            d = (q[i + 1]['ts'] - x['ts']) if i + 1 < len(q) else (M['fim'] + t0 - x['ts'])
            f.write(f"file '{x['nome']}'\nduration {max(d, 0.001):.4f}\n")
        f.write(f"file '{q[-1]['nome']}'\n")
    run(['-f', 'concat', '-safe', '0', '-i', 'concat.txt', '-vf', 'fps=30,format=yuv420p', *ENC, 'v1-tela-bruta.mp4'])
BRUTA = 'v1-tela-bruta.mp4'
shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
VOZ = json.load(open('voz/falas.json'))


def bruta(a, b, dur, saida):
    vf = (f'trim=start={a:.3f}:end={b:.3f},setpts=PTS-STARTPTS,'
          f'tpad=stop_mode=clone:stop_duration={dur:.3f},trim=duration={dur:.3f},fps=30')
    run(['-i', BRUTA, '-vf', vf, *ENC, saida])


def juntar(partes, saida):
    lista = f'{saida}.txt'
    base = os.path.dirname(lista) or '.'
    open(lista, 'w').writelines(f"file '{os.path.relpath(p, base)}'\n" for p in partes)
    run(['-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', saida])
    os.remove(lista)


def atraso(nome):
    return 0.1 if nome == '01-gancho' else 0.3


def fim_voz(nome):
    return atraso(nome) + VOZ[nome]['duracao']


ORDEM = ['01-gancho', '02-o-que-e', '03-preencher', '04-iof', '05-tabela', '06-trinta-dias', '07-doze-meses',
         '08-custodia', '09-compartilhar', '10-fechamento']
CENAS = []
for i, n in enumerate(ORDEM):
    prox = ORDEM[i + 1] if i + 1 < len(ORDEM) else 'fim'
    CENAS.append((n, 'bruta', M[n], M[prox]))
    if n == '01-gancho':
        CENAS.append(('abertura', 'abertura', None, None))
CENAS.append(('tela-final', 'final', None, None))

partes, t, cenas, posicoes = [], 0.0, [], []
for i, (nome, origem, a, b) in enumerate(CENAS):
    saida = f'{OUT}/{i:02d}-{nome}.mp4'
    if origem == 'bruta':
        dur = round(max(b - a, fim_voz(nome) + 0.35), 3)
        bruta(a, b, dur, saida)
        print(f'{nome:16s} bruta {b - a:5.1f}s → {dur:4.1f}s')
    elif origem == 'abertura':
        dur = 1.0
        run(['-i', f'{ID}/abertura-1s.mp4', '-vf', 'scale=1920:1080,fps=30', '-t', str(dur), *ENC, saida])
    else:
        dur = 10.0
        run(['-i', f'{ID}/tela-final-10s.mp4', '-vf', 'scale=1920:1080,fps=30', '-t', str(dur), *ENC, saida])
    if nome in VOZ:
        posicoes.append({'arquivo': f'voz/falas/{nome}.wav', 'inicio': round(t + atraso(nome), 3)})
        fv = fim_voz(nome)
        assert fv <= dur + 0.05, f'{nome}: a voz ({fv:.1f}s) passa da cena ({dur:.1f}s)'
    else:
        fv = None
    cenas.append({'cena': nome, 'inicio': round(t, 2), 'duracao': dur, 'voz_ate': None if fv is None else round(fv, 2)})
    t += dur
    partes.append(saida)

juntar(partes, 'v1-tela-voz.mp4')
json.dump(cenas, open('cenas-voz.json', 'w'), indent=1, ensure_ascii=False)
json.dump({'video': 'v1-tela-voz.mp4', 'saida': 'v1-final-voz.mp4', 'musica': MUSICA, 'falas': posicoes},
          open('posicoes-voz.json', 'w'), indent=1, ensure_ascii=False)
for c in cenas:
    print(f"  {int(c['inicio'] // 60)}:{c['inicio'] % 60:04.1f}  {c['cena']:16s} {c['duracao']:5.1f}s  voz até {c['voz_ate']}")
print(f'total {int(t // 60)}:{t % 60:04.1f}')
