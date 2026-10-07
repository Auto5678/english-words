#!/bin/bash
# 阶段 4：文章/模板 wav → m4a（与单词包同参数：aac 48k 单声道）
FF=/c/Work/Claude/english-1/tts-audio/bin/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe
SRC=/c/Work/Claude/english-1/tts-audio/pack/articles
DST=/c/Work/Claude/english-1/tts-audio/pack-m4a/articles
mkdir -p "$DST"
n=0
for f in "$SRC"/*.wav; do
  base=$(basename "$f" .wav)
  out="$DST/$base.m4a"
  [ -f "$out" ] && { n=$((n+1)); continue; }
  "$FF" -y -loglevel error -i "$f" -c:a aac -b:a 48k -ac 1 -movflags +faststart "$out"
  n=$((n+1))
done
echo "done: $n files, $(du -sh "$DST" | cut -f1)"
