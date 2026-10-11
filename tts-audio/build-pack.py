# -*- coding: utf-8 -*-
# 打包 m4a → 单文件音频包（EAP1 格式）+ 分卷
#
# 格式：
#   [4B magic "EAP1"][4B indexLen LE][index JSON][音频数据块...]
#   index: { version, voice, count, totalBytes, files: { 条目id: {off, len} } }
#   off 相对数据区（index JSON 之后）起点。
# 分卷：数据区按 4MB 切片 → pack.part1..N（索引头单独 pack.index），
#   app 端先拉 index，再按需/批量拉分卷，切片重组后入 IndexedDB。
#
# 条目命名空间（v2 起支持句子层）：
#   g7b-u1-1          单词音频（词 id）
#   article:a1        内置文章整篇（7 篇）
#   ga:tpl/ga_open_0  生成式文章模板片段（ga_open_0..2, ga_tmp_{i}_a/b, ga_close_0..1）
import os, json, struct

SRC = r'C:\Work\Claude\english-1\tts-audio\pack-m4a'
ART_SRC = os.path.join(SRC, 'articles')
OUT = r'C:\Work\Claude\english-1\tts-audio\audio-pack'
os.makedirs(OUT, exist_ok=True)

files = sorted(f for f in os.listdir(SRC) if f.endswith('.m4a'))
# v2：文章条目（article:aN）与模板片段（ga:ga_open_0 等，键即文件名）。
# 旧客户端（v1 包）只认词 id，多余条目按 miss 跳过，无兼容问题
art_files = sorted(f for f in os.listdir(ART_SRC) if f.endswith('.m4a')) if os.path.isdir(ART_SRC) else []
entries = [(f[:-4], os.path.join(SRC, f)) for f in files]
entries += [('article:' + f[:-4], os.path.join(ART_SRC, f)) for f in art_files if not f.startswith('ga_')]
entries += [('ga:' + f[:-4], os.path.join(ART_SRC, f)) for f in art_files if f.startswith('ga_')]
n_words = len(files)
n_arts = len([f for f in art_files if not f.startswith('ga_')])
n_ga = len([f for f in art_files if f.startswith('ga_')])
print('单词条目:', n_words, ' 文章条目:', n_arts, ' 模板条目:', n_ga)

index = {}
offset = 0
blobs = []
for key, path in entries:
    with open(path, 'rb') as fh:
        data = fh.read()
    index[key] = {'off': offset, 'len': len(data)}
    blobs.append(data)
    offset += len(data)

meta = {
    'version': 3,
    'voice': 'amy-medium',
    'count': n_words + n_arts + n_ga,
    'totalBytes': offset,
    'partSize': 4 * 1024 * 1024,  # 客户端按此切分请求分卷，勿与 wordaudio.js 各自硬编码
    'files': index,
}
metaBytes = json.dumps(meta, separators=(',', ':')).encode('utf-8')

# 整包（本机调试用）
with open(os.path.join(OUT, 'audio-pack.bin'), 'wb') as f:
    f.write(struct.pack('<4sI', b'EAP1', len(metaBytes)) + metaBytes + b''.join(blobs))

# 分卷（部署用）：index 单独 + 数据区 4MB/卷
with open(os.path.join(OUT, 'pack.index'), 'wb') as f:
    f.write(struct.pack('<4sI', b'EAP1', len(metaBytes)) + metaBytes)

data = b''.join(blobs)
PART = 4 * 1024 * 1024
n = 0
for i in range(0, len(data), PART):
    n += 1
    with open(os.path.join(OUT, f'pack.part{n}'), 'wb') as f:
        f.write(data[i:i+PART])

print(f'总数据 {offset/1048576:.1f} MB, 分卷 {n} 个（{PART/1048576:.0f}MB/卷）')
print(f'索引 {len(metaBytes)} bytes, 条目 {len(index)}（词 {n_words} + 文章 {n_arts} + 模板 {n_ga}）')
