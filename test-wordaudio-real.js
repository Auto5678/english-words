/* test-wordaudio-real.js — 用真实构建的 EAP1 包做端到端验证
 *
 * 本地 HTTP 服务 tts-audio/audio-pack/（pack.index + pack.part1..5），
 * 走完整 ensureWordAudioPack() 安装，然后抽查：
 * - 随机若干词 + 跨分卷边界的词
 * - 与源 m4a 文件逐字节比对
 * - 校验 m4a 魔数（ftyp）确保是合法音频而非零填充 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;
const failures = [];
function check(name, cond) {
  if (cond) { passed++; console.log('[PASS]', name); }
  else { failed++; failures.push(name); console.log('[FAIL]', name); }
}

(async () => {
  require('fake-indexeddb/auto');
  if (!global.indexedDB) throw new Error('无 indexedDB 替身');

  const PACK_DIR = path.join(__dirname, 'tts-audio', 'audio-pack');
  const M4A_DIR = path.join(__dirname, 'tts-audio', 'pack-m4a');

  /* 解析真实索引，找跨卷词 */
  const idxBuf = fs.readFileSync(path.join(PACK_DIR, 'pack.index'));
  const magic = idxBuf.subarray(0, 4).toString('ascii');
  check('真实索引 magic=EAP1', magic === 'EAP1');
  const idxLen = idxBuf.readUInt32LE(4);
  const index = JSON.parse(idxBuf.subarray(8, 8 + idxLen).toString('utf-8'));
  console.log('  包信息: version=' + index.version + ' voice=' + index.voice +
    ' count=' + index.count + ' totalBytes=' + index.totalBytes + ' partSize=' + index.partSize);
  check('索引含 partSize', index.partSize === 4 * 1024 * 1024);
  check('条目数 2718（词 2696 + 文章 7 + 模板 15）', index.count === 2718);
  check('totalBytes = 各词长度和', Object.values(index.files).reduce((s, f) => s + f.len, 0) === index.totalBytes);

  const PART = index.partSize;
  const parts = Math.ceil(index.totalBytes / PART);
  /* 找跨卷词（首尾边界附近各找几个） */
  const entries = Object.entries(index.files);
  const crossers = entries.filter(([id, f]) =>
    Math.floor(f.off / PART) !== Math.floor((f.off + f.len - 1) / PART));
  console.log('  跨卷词数: ' + crossers.length + ' / ' + entries.length);
  /* 4MB 卷 × ~7.6KB/词：只有骑在卷边界的词跨卷，约每卷边界 1 个 */
  check('存在跨卷词（边界词走重组路径）', crossers.length >= 1 && crossers.length <= parts * 2);

  /* 本地服务器（回真实分卷文件） */
  const server = http.createServer((req, res) => {
    const file = path.join(PACK_DIR, path.basename(req.url));
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      const data = fs.readFileSync(file);
      res.setHeader('Content-Length', data.length);
      res.end(data);
    } else { res.statusCode = 404; res.end('no'); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;

  global.__WA_INDEX_URLS = ['http://127.0.0.1:' + port + '/pack.index'];
  const src = fs.readFileSync(path.join(__dirname, 'wordaudio.js'), 'utf-8');
  new Function(src)();

  const WA = globalThis.WordAudio;
  check('WordAudio 挂载', !!WA);

  const t0 = Date.now();
  const st = await WA.ensureWordAudioPack(info => {
    if (info.stage === 'downloading') process.stdout.write('\r  下载 part' + info.part + '/' + info.parts + ' ' + info.pct + '%   ');
  });
  console.log('\n  安装耗时 ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
  check('installed', st.installed === true);
  check('count=2718', st.count === 2718);
  check('version=2', st.version === 2);
  check('voice=amy-medium', st.voice === 'amy-medium');

  /* v2 包条目命名空间：词 id（gPri-…）/ article:aN / ga:ga_*
   * 源文件定位：词在 pack-m4a/，文章与模板在 pack-m4a/articles/
   * （文件名即条目去掉前缀，ga:ga_open_0 → articles/ga_open_0.m4a） */
  function srcPathOf(id) {
    if (id.startsWith('article:')) return path.join(M4A_DIR, 'articles', id.slice(8) + '.m4a');
    if (id.startsWith('ga:')) return path.join(M4A_DIR, 'articles', id.slice(3) + '.m4a');
    return path.join(M4A_DIR, id + '.m4a');
  }

  /* 打开 DB 读回抽查 */
  const db = await new Promise((resolve, reject) => {
    const rq = global.indexedDB.open('wordaudio');
    rq.onsuccess = () => resolve(rq.result);
    rq.onerror = () => reject(rq.error);
  });

  async function readBack(id) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['words'], 'readonly');
      const rq = tx.objectStore('words').get(id);
      rq.onsuccess = () => resolve(rq.result);
      rq.onerror = () => reject(rq.error);
    });
  }

  /* 抽查：头 3 词、尾 3 词、随机 6 词、跨卷词 4 个 */
  const picks = [
    entries[0][0], entries[1][0], entries[2][0],
    entries[entries.length - 1][0], entries[entries.length - 2][0], entries[entries.length - 3][0],
    ...crossers.slice(0, 2).map(e => e[0]),
    ...crossers.slice(-2).map(e => e[0]),
    ...[500, 1200, 1800, 2400].map(i => entries[i][0]),
  ];
  for (const id of picks) {
    const blob = await readBack(id);
    if (!blob) { check('读回 ' + id, false); continue; }
    const buf = Buffer.from(await blob.arrayBuffer());
    const srcFile = fs.readFileSync(srcPathOf(id));
    const same = buf.equals(srcFile);
    /* m4a 盒子魔数：字节 4-7 应为 'ftyp' */
    const isM4a = buf.subarray(4, 8).toString('ascii') === 'ftyp';
    check(id + ' 一致 ' + buf.length + 'B m4a=' + isM4a, same && isM4a);
  }

  /* URL 命中 */
  const url = await WA.getWordAudioURL(picks[0]);
  check('getWordAudioURL 命中', typeof url === 'string' && url.startsWith('blob:'));

  /* 指纹校验：全量比对（2718 条太多，抽样 50 个均匀分布） */
  let bad = 0;
  for (let i = 0; i < entries.length; i += Math.ceil(entries.length / 50)) {
    const id = entries[i][0];
    const blob = await readBack(id);
    const buf = Buffer.from(await blob.arrayBuffer());
    if (!buf.equals(fs.readFileSync(srcPathOf(id)))) bad++;
  }
  check('指纹抽样 50 条全部一致', bad === 0);

  server.close();
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  if (failed) { failures.forEach(f => console.log('  失败: ' + f)); process.exit(1); }
  process.exit(0);
})().catch(e => { console.error('测试崩溃:', e); process.exit(1); });
