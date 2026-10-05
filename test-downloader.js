/* 下载管理器专项测试：失败重试 / 持久缓存命中 */
const fs = require('fs');
const parts = [1, 2, 3].map(n => fs.readFileSync(__dirname + '/model-cdn/vosk-model.part' + n));

let fetchCount = 0;
let failMode = null;
global.fetch = async (url) => {
  fetchCount++;
  if (failMode === 'network' && url.includes('part2')) throw new TypeError('Failed to fetch');
  const idx = Number(url.match(/part(\d)/)[1]) - 1;
  const data = parts[idx];
  let pos = 0;
  return {
    ok: true, status: 200,
    headers: { get: k => k === 'Content-Length' ? String(data.length) : null },
    body: { getReader: () => ({ read: async () => {
      if (pos >= data.length) return { done: true, value: undefined };
      const chunk = data.slice(pos, pos + 1024 * 512);
      pos += chunk.length;
      return { done: false, value: chunk };
    } }) },
  };
};
const cacheStore = {};
global.caches = {
  open: async () => ({
    match: async k => cacheStore[k] ? { blob: async () => cacheStore[k] } : null,
    put: async (k, resp) => { cacheStore[k] = await resp.blob(); },
  }),
};
global.Blob = class {
  constructor(buffers) { this.data = buffers; this.size = buffers.reduce((s, b) => s + b.length, 0); }
};
global.URL = { createObjectURL: blob => 'blob:fake-' + blob.size };
global.Response = class { constructor(b) { this.blob = async () => b; } };

const app = require('./app.js');

(async () => {
  /* 用例 4：网络失败 → 抛错且不写缓存 */
  failMode = 'network';
  try { await app.downloadModelBlob(() => {}); console.log('用例4 失败抛错: FAIL'); }
  catch (e) { console.log('用例4 失败抛错: PASS (' + e.message + ')'); }
  console.log('用例4 失败不写缓存:', !cacheStore['vosk-model-blob-v1'] ? 'PASS' : 'FAIL');

  /* 用例 5：恢复网络后重试成功 */
  failMode = null;
  try { await app.downloadModelBlob(() => {}); console.log('用例5 重试成功: PASS'); }
  catch (e) { console.log('用例5 重试成功: FAIL'); }

  /* 用例 6：新会话（重新 require）命中持久缓存，不再 fetch */
  const fetchBefore = fetchCount;
  delete require.cache[require.resolve('./app.js')];
  const app2 = require('./app.js');
  try {
    await app2.downloadModelBlob(() => {});
    console.log('用例6 新会话命中持久缓存(0 fetch):', fetchCount === fetchBefore ? 'PASS' : 'FAIL', '(fetch=' + (fetchCount - fetchBefore) + ')');
  } catch (e) {
    console.log('用例6 新会话命中持久缓存: FAIL (' + e.message + ')');
  }
  process.exit(0);
})().catch(e => { console.error('EXCEPTION:', e.message); process.exit(1); });
