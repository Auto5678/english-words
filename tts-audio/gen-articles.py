# -*- coding: utf-8 -*-
# 阶段 4：预合成内置文章音频 + 生成式文章的模板片段（amy 音色，与单词包一致）
#
# 产出（wav，后续 convert-articles.sh 转 m4a、build-pack.py 并入主包）：
#   pack/articles/a1.wav .. a7.wav       —— 7 篇内置文章整篇朗读
#   pack/articles/tpl-{key}.wav          —— 生成式文章模板片段（前缀/后缀/开头/结尾）
#
# 模板片段与 app.js generateArticle() 的句式严格一一对应：
#   app 端播放生成式文章 = 开头 → (前缀 → 单词 → 后缀)×N → 结尾
#   单词音频来自单词包（已装）。改 generateArticle 的句式必须同步改这里的
#   TEMPLATES 表 + 前后缀 id（wordaudio.js 的 GA_TEMPLATES 同源约定）。
import os, json, wave, array, time
import sherpa_onnx

BASE = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE, 'vits-piper-en_US-amy-medium')
OUT_DIR = os.path.join(BASE, 'pack', 'articles')
os.makedirs(OUT_DIR, exist_ok=True)

# 与 app.js BUILT_IN_ARTICLES 同步：整篇合成（id → 文本从 Node 导出，见 gen-article-list.js）
LIST = os.path.join(BASE, 'article-list.json')

# 生成式文章模板片段（与 app.js generateArticle 的 openers/tmpl/closers 一一对应）
# key 命名：GA_OPEN_0..2 / GA_TMP_{i}_A(前缀) / GA_TMP_{i}_B(后缀) / GA_CLOSE_0..1
# 文本中双引号朗读为自然停顿（piper 对 " 会略过，语调仍自然）
TEMPLATES = [
    ('GA_OPEN_0',  'Today I learned some new words.'),
    ('GA_OPEN_1',  'This is my English story.'),
    ('GA_OPEN_2',  'Let me tell you about my day.'),
    # 句式 i=0: I saw the word "X" in my book, and I wrote it down.
    ('GA_TMP_0_A', 'I saw the word'),
    ('GA_TMP_0_B', 'in my book, and I wrote it down.'),
    # 句式 i=1: My teacher said "X" is easy to remember.
    ('GA_TMP_1_A', 'My teacher said the word'),
    ('GA_TMP_1_B', 'is easy to remember.'),
    # 句式 i=2: I use the word "X" when I talk with my friends.
    ('GA_TMP_2_A', 'I use the word'),
    ('GA_TMP_2_B', 'when I talk with my friends.'),
    # 句式 i=3: Can you make a sentence with the word "X"?
    ('GA_TMP_3_A', 'Can you make a sentence with the word'),
    ('GA_TMP_3_B', '?'),          # 仅问号：合成会得到近零长音频，播放时跳过
    # 句式 i=4: The word "X" is very useful in English.
    ('GA_TMP_4_A', 'The word'),
    ('GA_TMP_4_B', 'is very useful in English.'),
    # 结尾（按 n>5 分支）
    ('GA_CLOSE_0', 'These words help me read and write. English is fun!'),
    ('GA_CLOSE_1', 'I will review them tomorrow. See you!'),
]

tts = sherpa_onnx.OfflineTts(
    sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=os.path.join(MODEL_DIR, 'en_US-amy-medium.onnx'),
                tokens=os.path.join(MODEL_DIR, 'tokens.txt'),
                data_dir=os.path.join(MODEL_DIR, 'espeak-ng-data'),
                lexicon='',
            )
        )
    )
)

SR = 22050
HEAD_MS = 120   # 片段头静音（片段拼接时作为自然间隔；整篇 300）
TAIL_MS = 160

def synth(path, text, head_ms, tail_ms):
    if os.path.exists(path):
        return False  # 断点续传
    audio = tts.generate(text)
    head = [0.0] * int(SR * head_ms / 1000)
    tail = [0.0] * int(SR * tail_ms / 1000)
    samples = head + list(audio.samples) + tail
    buf = array.array('h', [int(max(-32768, min(32767, s * 32767))) for s in samples])
    with wave.open(path, 'wb') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(audio.sample_rate)
        f.writeframes(buf.tobytes())
    return True

done = 0
t0 = time.time()

# 1) 内置文章（整篇）
with open(LIST, encoding='utf-8') as f:
    articles = json.load(f)
print(f'内置文章: {len(articles)} 篇')
for a in articles:
    out = os.path.join(OUT_DIR, a['id'] + '.wav')
    made = synth(out, a['text'], 300, 400)
    if made:
        done += 1
        print(f'  合成 {a["id"]}（{len(a["text"])} 字符）')

# 2) 模板片段
print(f'模板片段: {len(TEMPLATES)} 个')
for key, text in TEMPLATES:
    out = os.path.join(OUT_DIR, key.lower() + '.wav')
    made = synth(out, text, HEAD_MS, TAIL_MS)
    if made:
        done += 1
        print(f'  合成 {key}: {text[:40]}')

total_kb = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in os.listdir(OUT_DIR)) / 1024
print(f'\n完成: {done} 个新文件, 目录总大小 {total_kb/1024:.1f} MB, 耗时 {(time.time()-t0)/60:.1f} 分钟')
