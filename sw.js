/* 背单词小助手 Service Worker
 * 策略：
 * - 核心文件（页面/样式/脚本/图标）：安装时预缓存，此后仅缓存命中。
 * - Vosk 模型（model/…tar.gz，约 40MB）：请求成功后缓存，下载失败不拦截
 *   （首次下载失败要让请求自然报错，页面会提示离线识别不可用）。
 * - 词库 Excel 等大文件按需缓存。
 * - 版本升级：CACHE 版本号变更时旧缓存整体删除。
 *
 * 注意：本应用数据全部在 localStorage / IndexedDB，与 SW 缓存无关；
 * SW 只负责离线打开页面与模型免重复下载。 */

const CACHE = 'seven-a-english-v1.0.1';

const CORE_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './vendor-xlsx.js',
  './vendor-vosk.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './guide.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; /* 只处理同源 */

  /* 模型与其他大文件：网络优先，成功则入缓存（支持断点外的整档缓存） */
  const isModel = url.pathname.includes('/model/');
  if (isModel) {
    event.respondWith(
      fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
        }
        return res;
      }).catch(() =>
        caches.match(req).then(hit => hit || Response.error())
      )
    );
    return;
  }

  /* 核心文件与其他同源请求：缓存优先，未命中回网络并补缓存 */
  event.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.ok && url.protocol.startsWith('http')) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
        }
        return res;
      });
    })
  );
});
