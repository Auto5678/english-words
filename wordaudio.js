/* wordaudio.js — 离线单词音频包（第 1 层离线语音）
 *
 * 数据流：
 *   1) 家长页点"下载离线音频包" → ensureWordAudioPack()：
 *      pack.index（索引头，几 KB）→ pack.part1..N（各 4MB，多源切换）
 *      → 切片重组 → 每词一个 Blob 存 IndexedDB（库 wordaudio，仓 words）
 *   2) speakWordAudio(word) 调用时：IndexedDB 命中 → blob URL → Audio 播放
 *      未下载/未命中 → 返回 null，app 回退原链路（系统 TTS → 在线 Youdao）
 *
 * 分卷格式 EAP1：
 *   [4B "EAP1"][4B indexLen LE][index JSON][音频数据块...]
 *   index.files[wordId] = { off, len }（off 相对数据区）
 *
 * 与 Vosk 模型管线共用多源故障转移思路（fetchModelPart 同款），
 * 但音频包是纯数据下载（无需 tar 解包），且逐词 Blob 更省——
 * 播放时零拷贝、无解压。 */
(function (global) {
  'use strict';

  const DB_NAME = 'wordaudio';
  const STORE = 'words';
  /* 测试钩子：Node 端可用 __WA_INDEX_URLS 指向本地服务器跑端到端测试 */
  const INDEX_URLS = (typeof global !== 'undefined' && global.__WA_INDEX_URLS) || [
    'https://cdn.jsdelivr.net/gh/Auto5678/english-words@main/audio-pack/pack.index',
    'https://fastly.jsdelivr.net/gh/Auto5678/english-words@main/audio-pack/pack.index',
    'https://raw.githubusercontent.com/Auto5678/english-words/main/audio-pack/pack.index',
  ];
  const partUrl = (src, n) => src.replace('/pack.index', '/pack.part' + n);

  /* ---- IndexedDB 薄封装 ---- */
  let dbPromise = null;
  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  function idbPut(store, key, value) {
    return openDB().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    }));
  }

  function idbGet(store, key) {
    return openDB().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const rq = tx.objectStore(store).get(key);
      rq.onsuccess = () => resolve(rq.result);
      rq.onerror = () => reject(rq.error);
    }));
  }

  function idbCount(store) {
    return openDB().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const rq = tx.objectStore(store).count();
      rq.onsuccess = () => resolve(rq.result);
      rq.onerror = () => reject(rq.error);
    }));
  }

  function idbClear(store) {
    return openDB().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    }));
  }

  /* ---- 包状态 ---- */
  const status = {
    installed: false,   /* IndexedDB 已有音频 */
    version: null,      /* 包版本 */
    count: 0,           /* 已装词数 */
    voice: null,
  };

  async function refreshStatus() {
    try {
      status.count = await idbCount(STORE);
      const meta = await idbGet('meta', 'packMeta');
      if (meta) { status.version = meta.version; status.voice = meta.voice; }
      status.installed = status.count > 0;
    } catch (e) { /* IndexedDB 不可用：保持未安装态 */ }
    return status;
  }

  /* ---- 下载 ---- */
  async function fetchWithSources(urls, onBytes) {
    let lastErr = null;
    for (let s = 0; s < urls.length; s++) {
      try {
        const res = await fetch(urls[s], { cache: 'no-store' });
        if (!res.ok) { lastErr = new Error('HTTP ' + res.status + '（源' + (s + 1) + '）'); continue; }
        const total = parseInt(res.headers.get('Content-Length'), 10) || 0;
        if (!res.body || !res.body.getReader) {
          const buf = await res.arrayBuffer();
          if (onBytes) onBytes(buf.byteLength, buf.byteLength);
          return new Uint8Array(buf);
        }
        const reader = res.body.getReader();
        const chunks = [];
        let got = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          got += value.length;
          if (onBytes) onBytes(got, total);
        }
        if (got === 0) { lastErr = new Error('空响应（源' + (s + 1) + '）'); continue; }
        const out = new Uint8Array(got);
        let off = 0;
        chunks.forEach(c => { out.set(c, off); off += c.length; });
        return out;
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('全部下载源失败');
  }

  /* 解析 EAP1 索引头 */
  function parseIndex(buf) {
    if (buf.length < 8) throw new Error('索引文件过短');
    const magic = String.fromCharCode(buf[0], buf[1], buf[2], buf[3]);
    if (magic !== 'EAP1') throw new Error('索引格式不对（magic=' + magic + '）');
    const idxLen = buf[4] | (buf[5] << 8) | (buf[6] << 16) | (buf[7] << 24);
    const json = new TextDecoder().decode(buf.slice(8, 8 + idxLen));
    return JSON.parse(json);
  }

  /**
   * 下载并安装音频包。
   * onProgress(info)：{ stage, part, parts, loaded, total, pct, installed }
   */
  async function ensureWordAudioPack(onProgress) {
    await refreshStatus();

    /* 1) 索引 */
    let index;
    let indexSrcUsed = null;
    let lastErr = null;
    for (let s = 0; s < INDEX_URLS.length; s++) {
      try {
        const buf = await fetchWithSources([INDEX_URLS[s]]);
        index = parseIndex(buf);
        indexSrcUsed = s;
        break;
      } catch (e) { lastErr = e; }
    }
    if (!index) throw lastErr || new Error('索引下载失败');

    /* 2) 已装同版本 → 跳过 */
    if (status.installed && status.version === index.version && status.count >= index.count) {
      if (onProgress) onProgress({ stage: 'cached', pct: 100 });
      return status;
    }

    /* 3) 分卷下载（卷大小以索引声明为准，避免与打包端各自硬编码漂移） */
    const dataLen = index.totalBytes;
    const PART = index.partSize || 4 * 1024 * 1024;
    const parts = Math.ceil(dataLen / PART);
    const buffers = new Array(parts);
    let loaded = 0;
    for (let p = 0; p < parts; p++) {
      const urls = INDEX_URLS.map(src => partUrl(src, p + 1));
      const buf = await fetchWithSources(urls, (got) => {
        if (onProgress) onProgress({
          stage: 'downloading', part: p + 1, parts,
          loaded: loaded + got, total: dataLen,
          pct: Math.min(99, Math.round((loaded + got) / dataLen * 100)),
        });
      });
      buffers[p] = buf;
      loaded += buf.length;
    }

    /* 4) 切片入库（每词一个 Blob，一次事务批量写） */
    if (onProgress) onProgress({ stage: 'installing', pct: 99 });
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const ids = Object.keys(index.files);
      ids.forEach(id => {
        const { off, len } = index.files[id];
        let buf = null;
        /* 定位所在分卷 */
        let pos = 0;
        for (let p = 0; p < parts; p++) {
          if (off >= pos && off + len <= pos + buffers[p].length) {
            buf = buffers[p].subarray(off - pos, off - pos + len);
            break;
          }
          pos += buffers[p].length;
        }
        if (!buf) { /* 跨卷（分卷按固定 partSize 切，不按词边界，会真实发生） */
          const tmp = new Uint8Array(len);
          let ppos = 0, covered = 0;
          for (let p = 0; p < parts; p++) {
            const pStart = ppos, pEnd = ppos + buffers[p].length;
            const wStart = off, wEnd = off + len;
            if (pEnd > wStart && pStart < wEnd) {
              const from = Math.max(wStart, pStart) - pStart;
              const to = Math.min(wEnd, pEnd) - pStart;
              tmp.set(buffers[p].subarray(from, to), Math.max(0, pStart - wStart));
              covered += to - from;
            }
            ppos = pEnd;
          }
          if (covered !== len) { tx.abort(); reject(new Error('词 ' + id + ' 数据不完整（缺 ' + (len - covered) + 'B，可能分卷缺失）')); return; }
          buf = tmp;
        }
        store.put(new Blob([buf], { type: 'audio/mp4' }), id);
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    /* 5) 元数据 */
    await idbPut('meta', 'packMeta', { version: index.version, voice: index.voice, count: index.count, ts: Date.now() });
    await refreshStatus();
    if (onProgress) onProgress({ stage: 'ready', pct: 100, installed: status.count });
    return status;
  }

  /* ---- 播放 ---- */
  const urlCache = new Map(); /* wordId → blob URL（会话级） */

  async function getWordAudioURL(wordId) {
    if (urlCache.has(wordId)) return urlCache.get(wordId);
    let blob;
    try { blob = await idbGet(STORE, wordId); } catch (e) { return null; }
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    urlCache.set(wordId, url);
    return url;
  }

  /* 播放某词：返回 Promise<'played'|'miss'>，miss 时调用方回退 */
  function playWord(wordId, onEnd) {
    return getWordAudioURL(wordId).then(url => {
      if (!url) return 'miss';
      return new Promise(resolve => {
        const a = new Audio(url);
        let settled = false;
        const finish = (how) => {
          if (settled) return;
          settled = true;
          clearTimeout(guard);
          if (how === 'ok' && onEnd) onEnd();
          resolve('played');
        };
        const guard = setTimeout(() => { try { a.pause(); } catch (e) {} finish('timeout'); }, 8000);
        a.onended = () => finish('ok');
        a.onerror = () => finish('err');
        a.play().catch(() => finish('err'));
      });
    }).catch(() => 'miss');
  }

  /* ---- 管理 ---- */
  async function deleteWordAudioPack() {
    await idbClear(STORE);
    await idbClear('meta');
    urlCache.forEach(u => URL.revokeObjectURL(u));
    urlCache.clear();
    await refreshStatus();
    return status;
  }

  /* Node 测试桩：无 indexedDB 环境下 ensure 直接失败而非崩溃 */
  if (typeof indexedDB === 'undefined') {
    global.WordAudio = {
      ensureWordAudioPack: async () => { throw new Error('此环境无 IndexedDB'); },
      playWord: async () => 'miss',
      getWordAudioURL: async () => null,
      deleteWordAudioPack: async () => status,
      refreshStatus: async () => status,
      status,
    };
    return;
  }

  global.WordAudio = {
    ensureWordAudioPack, playWord, getWordAudioURL,
    deleteWordAudioPack, refreshStatus, status,
  };
})(typeof window !== 'undefined' ? window : globalThis);
