/* test-articles.js — 阶段 4（句子离线朗读）回归测试
 *
 * 覆盖：
 * 1. 包格式 v2：article:aN / ga: 模板条目存在，词条目不受影响
 * 2. 安装 v2 包后 playArticle('a1') 命中且字节与源 m4a 一致
 * 3. playGeneratedArticle 拼接链：开头→(前缀→词→后缀)×N→结尾，
 *    播放的条目序列与 GA 模板表一致
 * 4. generateArticle 返回拼接参数（openIdx/wordIds/wordTmplIdxs/closeIdx），
 *    与文本模板同构（三方同源约定：app.js / wordaudio.js / gen-articles.py）
 * 5. 未装包时 playArticle/playGeneratedArticle 返回 miss（回退兜底） */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
require('fake-indexeddb/auto');

let passed = 0, failed = 0;
function t(name, cond) {
  if (cond) { passed++; console.log('[PASS]', name); }
  else { failed++; console.log('[FAIL]', name); }
}

(async () => {
  /* ---------- 本地 HTTP 服务真实 v2 包 ---------- */
  const PACK_DIR = path.join(__dirname, 'tts-audio', 'audio-pack');
  if (!fs.existsSync(path.join(PACK_DIR, 'pack.index'))) {
    console.log('跳过：tts-audio/audio-pack/pack.index 不存在（先跑 build-pack.py）');
    process.exit(0);
  }
  const server = http.createServer((req, res) => {
    const file = path.join(PACK_DIR, req.url.replace(/^\//, ''));
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Length': data.length });
      res.end(data);
    });
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  global.__WA_INDEX_URLS = [
    `http://127.0.0.1:${port}/pack.index`,
  ];
  const playedOrder = [];
  global.Audio = class {
    constructor(url) { this.url = url; playedOrder.push(url); }
    play() { return Promise.resolve(); }
    set onended(fn) { setTimeout(fn, 0); }
    set onerror(fn) { this._onerror = fn; }
  };

  new Function(fs.readFileSync(path.join(__dirname, 'wordaudio.js'), 'utf-8'))();
  const WA = globalThis.WordAudio;

  /* ---------- 1. 包格式 ---------- */
  const indexBuf = fs.readFileSync(path.join(PACK_DIR, 'pack.index'));
  const idxLen = indexBuf[4] | (indexBuf[5] << 8) | (indexBuf[6] << 16) | (indexBuf[7] << 24);
  const meta = JSON.parse(new TextDecoder().decode(indexBuf.slice(8, 8 + idxLen)));
  t('包版本 v2', meta.version === 2);
  t('article 条目 7 篇', ['a1','a2','a3','a4','a5','a6','a7'].every(id => meta.files['article:' + id]));
  const gaKeys = Object.keys(meta.files).filter(k => k.startsWith('ga:'));
  t('ga 模板条目 15 个', gaKeys.length === 15);
  t('词条目 2696 仍在', Object.keys(meta.files).filter(k => /^g(pri|7|8|9)/i.test(k)).length === 2696);

  /* ---------- 2. 安装 + playArticle 字节一致 ---------- */
  await WA.ensureWordAudioPack(() => {});
  t('安装完成', WA.status.installed && WA.status.count === meta.count);

  const url = await WA.getWordAudioURL('article:a1');
  t('playArticle 命中 a1', !!url);
  if (url) {
    const src = fs.readFileSync(path.join(PACK_DIR, '..', 'pack-m4a', 'articles', 'a1.m4a'));
    const buf = await (await fetch(url)).arrayBuffer();
    t('a1 字节与源一致', buf.byteLength === src.length &&
      Buffer.from(buf).equals(src));
  }

  /* ---------- 3. 生成式文章拼接链 ---------- */
  /* blob URL 无法直接比对条目 id → 预先建立 url→key 映射 */
  const urlToKey = {};
  for (const k of ['ga:ga_open_0','ga:ga_open_1','ga:ga_open_2',
    'ga:ga_tmp_0_a','ga:ga_tmp_0_b','ga:ga_tmp_1_a','ga:ga_tmp_1_b',
    'ga:ga_tmp_2_a','ga:ga_tmp_2_b','ga:ga_tmp_3_a','ga:ga_tmp_3_b',
    'ga:ga_tmp_4_a','ga:ga_tmp_4_b','ga:ga_close_0','ga:ga_close_1',
    'g7b-u1-1','g7b-u1-2']) {
    const u = await WA.getWordAudioURL(k);
    if (u) urlToKey[u] = k;
  }
  playedOrder.length = 0;
  const how = await WA.playGeneratedArticle(1, ['g7b-u1-1', 'g7b-u1-2'], [0, 3], 0);
  t('生成式文章播放完成', how === 'played');
  const keyOrder = playedOrder.map(u => urlToKey[u]);
  const expected = [
    'ga:ga_open_1',
    'ga:ga_tmp_0_a', 'g7b-u1-1', 'ga:ga_tmp_0_b',
    'ga:ga_tmp_3_a', 'g7b-u1-2', 'ga:ga_tmp_3_b',
    'ga:ga_close_0',
  ];
  t('拼接条目序列正确', JSON.stringify(keyOrder) === JSON.stringify(expected));

  /* ---------- 4. generateArticle 拼接参数 ---------- */
  const app = require('./app.js');
  app._setState(app.buildBaseState());
  const ga = app.generateArticle(['hello', 'bye']);
  t('generateArticle 返回拼接参数', ga && typeof ga.openIdx === 'number' &&
    Array.isArray(ga.wordIds) && Array.isArray(ga.wordTmplIdxs) &&
    typeof ga.closeIdx === 'number');
  t('模板序号与文本一致（2 词 → 0,1）', ga.wordTmplIdxs.join(',') === '0,1');
  t('词 id 可解析（hello → gPri-u1-1）', ga.wordIds[0] === 'gPri-u1-1');
  t('closeIdx 分支（≤5 词 → 1）', ga.closeIdx === 1);
  const ga6 = app.generateArticle(['a','b','c','d','e','f']);
  t('closeIdx 分支（>5 词 → 0）', ga6.closeIdx === 0);
  t('文本含开头', ga.text.startsWith('Today I learned') || ga.text.startsWith('This is my') || ga.text.startsWith('Let me tell'));

  /* ---------- 5. 未装包 miss 兜底 ---------- */
  await WA.deleteWordAudioPack();
  const miss = await WA.playArticle('a1');
  t('删包后 playArticle 返回 miss', miss === 'miss');
  const missGa = await WA.playGeneratedArticle(0, ['x'], [0], 0);
  t('删包后 playGeneratedArticle 返回 miss', missGa === 'miss');

  server.close();
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  if (failed) process.exit(1);
  process.exit(0);
})().catch(e => { console.error('测试崩溃:', e); process.exit(1); });
