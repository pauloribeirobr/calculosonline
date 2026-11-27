#!/usr/bin/env python3
"""Junta a tela montada (sem áudio), as falas da voz autoral e a música do canal num MP4 pronto
para o YouTube. Não gasta crédito do ElevenLabs.

Uso: python3 -I mixar.py posicoes.json
posicoes.json:
  {"video": "<tela montada.mp4>", "saida": "<final.mp4>", "musica": "<faixa do canal>",
   "falas": [{"arquivo": "<fala.wav>", "inicio": 0.1}, ...],
   opcionais: "voz_lufs" (-14: o YouTube abaixa o que passa de ~-14 LUFS e não sobe o que fica
   abaixo; a -16, a V1 tocaria mais baixo que os outros vídeos), "musica_abaixo" (8 neste canal; no RF, 18: a música sozinha fica N LU abaixo da voz;
   com o ducking, ~26–28 dB abaixo enquanto há fala — docs/roteiros/README.md "Música de fundo"),
   "fade" (2 s no fim), "musica_desde" (0 s)}

Vídeo: copiado sem recompressão (a montagem já sai em CRF 16). Áudio: AAC 48 kHz estéreo 256 kb/s.
"""
import json, os, shutil, subprocess, sys, tempfile


def ff(*args):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)


def duracao(arq):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                          '-of', 'csv=p=0', arq]).decode())


def loudness(arq):
    """Medida EBU R128 (I em LUFS, TP em dBTP) pelo loudnorm."""
    p = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', arq, '-af',
                        'loudnorm=print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
    txt = p.stderr[p.stderr.rindex('{'):p.stderr.rindex('}') + 1]
    d = json.loads(txt)
    return float(d['input_i']), float(d['input_tp'])


cfg = json.load(open(sys.argv[1]))
# musica_abaixo: 8 no Calculos Online (a trilha lo-fi some a 18, o padrão do RF; Paulo, 25/11/2026).
voz_lufs = cfg.get('voz_lufs', -14.0); abaixo = cfg.get('musica_abaixo', 8.0); fade = cfg.get('fade', 2.0)
total = duracao(cfg['video'])
tmp = tempfile.mkdtemp(prefix='mixar-')

# 1. Faixa da voz: cada fala no seu instante, silêncio no resto, do tamanho do vídeo.
entradas, filtros = [], []
for i, f in enumerate(cfg['falas']):
    entradas += ['-i', f['arquivo']]
    ms = int(round(f['inicio'] * 1000))
    filtros.append(f'[{i}]aresample=48000,aformat=channel_layouts=mono,adelay={ms}:all=1[f{i}]')
n = len(cfg['falas'])
filtros.append(''.join(f'[f{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0:duration=longest,apad=whole_dur={total:.3f},atrim=0:{total:.3f}[v]')
ff(*entradas, '-filter_complex', ';'.join(filtros), '-map', '[v]', '-c:a', 'pcm_s24le', f'{tmp}/voz-crua.wav')

# 2. Voz em voz_lufs (ganho linear; o limitador só segura pico acima de -1,5 dBTP).
i_voz, _ = loudness(f'{tmp}/voz-crua.wav')
ff('-i', f'{tmp}/voz-crua.wav', '-af', f'volume={voz_lufs - i_voz:.2f}dB,alimiter=limit=0.84:level=false',
   '-c:a', 'pcm_s24le', f'{tmp}/voz.wav')

# 3. Música: do início (ou de musica_desde) ao fim, abaixo da voz, com ducking pela voz e fade no fim.
desde = cfg.get('musica_desde', 0.0)
ff('-i', cfg['musica'], '-t', f'{total - desde:.3f}', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s24le', f'{tmp}/musica-crua.wav')
i_mus, _ = loudness(f'{tmp}/musica-crua.wav')
ganho_mus = (voz_lufs - abaixo) - i_mus
fc = (f'[1]volume={ganho_mus:.2f}dB,adelay={int(desde * 1000)}:all=1,apad=whole_dur={total:.3f},'
      f'afade=t=out:st={total - fade:.3f}:d={fade}[m];'
      f'[0]asplit=2[vmix][vkey];[vkey]aformat=channel_layouts=stereo[k];'
      f'[m][k]sidechaincompress=threshold=0.02:ratio=6:attack=40:release=600:knee=4[md];'
      f'[vmix]aformat=channel_layouts=stereo[vs];'
      f'[vs][md]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.84:level=false[a]')
ff('-i', f'{tmp}/voz.wav', '-i', f'{tmp}/musica-crua.wav', '-filter_complex', fc, '-map', '[a]',
   '-c:a', 'pcm_s24le', f'{tmp}/mix.wav')

# 4. MP4 final: vídeo copiado + áudio AAC.
ff('-i', cfg['video'], '-i', f'{tmp}/mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
   '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-movflags', '+faststart', '-shortest', cfg['saida'])
shutil.rmtree(tmp, ignore_errors=True)
i_fim, tp_fim = loudness(cfg['saida'])
print(f"voz {i_voz:.1f} → {voz_lufs} LUFS | música {i_mus:.1f} → {voz_lufs - abaixo:.1f} LUFS antes do ducking | "
      f"final {i_fim:.1f} LUFS, pico {tp_fim:.1f} dBTP | {cfg['saida']} ({total:.1f} s)")
