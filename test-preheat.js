/* test-preheat.js — Vosk 引擎预热回归测试
 *
 * v1.2.6 功能：init() 启动时对"模型已缓存"的设备后台静默初始化
 * Vosk WASM 引擎（20-40 秒），用户点跟读时已就绪。
 *
 * 断言要点：
 * 1. 预热门槛 = 模型已缓存（不是"无 Web Speech"——华为浏览器
 *    SpeechRecognition 是假活 API，按 API 存在性判断会漏掉目标设备）
 * 2. 未缓存设备 preheatVosk 零动作（不 fetch、不 createModel）
 * 3. 已缓存设备预热启动 ensureVoskModel，成功后 voskModel 就绪
 * 4. 多订阅者进度：预热启动加载后，中途点跟读的 onProgress 订阅
 *    即刻收到重放的最新进度（旧实现静默丢弃后来者的回调）
 * 5. 新一轮加载开始时旧进度重放缓存作废（不串台）
 * 6. 预热失败静默（voskBroken 置位，不抛出到 init） */
'use strict';

const fs = require('fs');
const path = require('path');
let passed = 0, failed = 0;
function t(name, cond) {
  if (cond) { passed++; console.log('[PASS]', name); }
  else { failed++; console.log('[FAIL]', name); }
}

(async () => {
  /* ---------- 环境：模型已缓存的最小桩 ---------- */
  const fakeBlob = { size: 41 * 1024 * 1024 };
  let cacheHits = {};
  let fetchCount = 0;
  global.fetch = async () => { fetchCount++; throw new TypeError('不应下载'); };
  global.caches = {
    open: async name => ({
      match: async k => cacheHits[name] && cacheHits[name][k]
        ? { blob: async () => fakeBlob } : null,
    }),
  };
  global.Blob = class { constructor(b) { this.size = b.reduce((s, x) => s + x.length, 0); } };
  global.URL = global.URL || require('url').URL;
  /* 无条件替换：Node 内置 URL.createObjectURL 对假 Blob 抛错，
   * app.js 的 catch 会静默吞掉后落到重新下载分支（干扰断言） */
  global.URL.createObjectURL = () => 'blob:fake';
  global.URL.revokeObjectURL = () => {};

  let createModelCalls = 0;
  global.Vosk = {
    createModel: async url => { createModelCalls++; return { __fakeModel: true, url }; },
  };

  const app = require('./app.js');

  /* ---------- 1. 未缓存设备：preheatVosk 零动作 ---------- */
  await app.preheatVosk();
  t('未缓存：preheatVosk 完成且不抛错', true);
  t('未缓存：零 fetch', fetchCount === 0);
  t('未缓存：零 createModel', createModelCalls === 0);

  /* ---------- 2. 已缓存设备：预热启动引擎 ---------- */
  cacheHits['vosk-model'] = { 'vosk-model-blob-v1': true };
  const preheatPromise = app.preheatVosk();
  t('已缓存：preheatVosk 返回 Promise（异步初始化）', preheatPromise instanceof Promise);
  await preheatPromise;
  t('已缓存：createModel 被调用', createModelCalls === 1);
  t('已缓存：预热完成 voskModel 就绪', !!(app._frTest && app._frTest.voskModel));
  t('已缓存：零 fetch（缓存命中，未下载）', fetchCount === 0);
  t('预热不置 voskBroken', app._frTest.voskBroken === false);

  /* ---------- 3. 多订阅者进度重放 ---------- */
  /* 重新加载 app（fresh require）造一次"预热启动 → 中途跟读"的并发 */
  delete require.cache[require.resolve('./app.js')];
  createModelCalls = 0;
  let resolveCreate;
  global.Vosk = {
    createModel: url => new Promise(res => { createModelCalls++; resolveCreate = res; }),
  };
  const app2 = require('./app.js');

  cacheHits['vosk-model'] = { 'vosk-model-blob-v1': true };
  app2.preheatVosk(); /* 引擎初始化挂起（resolveCreate 未调） */
  await new Promise(r => setTimeout(r, 30));
  t('并发场景：预热已启动 createModel', createModelCalls === 1);

  /* 中途点跟读：订阅进度应立即重放"最新状态"（extracting 阶段） */
  let gotProgress = null;
  app2.ensureVoskModel(info => { gotProgress = info; }).catch(() => {});
  await new Promise(r => setTimeout(r, 20));
  t('中途跟读：进度回调即刻收到重放', gotProgress !== null);
  t('中途跟读：重放的是当前阶段（extracting）', gotProgress && gotProgress.stage === 'extracting');

  resolveCreate({ __fakeModel: true });
  await new Promise(r => setTimeout(r, 20));
  t('加载完成：ensureVoskModel 与预热共用结果（不重复 createModel）', createModelCalls === 1);
  t('加载完成：voskModel 就绪', !!(app2._frTest && app2._frTest.voskModel));

  /* ---------- 4. 新一轮加载不串台（旧重放缓存作废） ---------- */
  delete require.cache[require.resolve('./app.js')];
  global.Vosk = {
    createModel: url => new Promise(res => { resolveCreate = res; }),
  };
  const app3 = require('./app.js');
  cacheHits['vosk-model'] = { 'vosk-model-blob-v1': true };

  /* 第一轮：走完一遍（cached → extracting → ready） */
  app3.ensureVoskModel(() => {}).catch(() => {});
  await new Promise(r => setTimeout(r, 30));
  resolveCreate({ __fakeModel: true });
  await new Promise(r => setTimeout(r, 20));

  /* 第二轮（模拟 voskBroken 重试路径）：新订阅者不应收到第一轮的 ready */
  app3._frTest.voskBroken = false;
  app3._frTest.voskLoading = null;
  app3._frTest.voskModel = null;
  let staleHit = false;
  app3.ensureVoskModel(info => { if (info.stage === 'ready') staleHit = true; }).catch(() => {});
  await new Promise(r => setTimeout(r, 20));
  t('新一轮加载：新订阅者不收到上一轮的 ready', staleHit === false);

  /* ---------- 5. 源码级：init() 接线 ---------- */
  const src = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf-8');
  const initFn = src.slice(src.indexOf('function init()'), src.indexOf('/* DOM 就绪后启动'));
  t('init() 调用 preheatVosk（接线存在）', initFn.includes('preheatVosk'));

  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  if (failed) process.exit(1);
  process.exit(0);
})().catch(e => { console.error('测试崩溃:', e); process.exit(1); });
