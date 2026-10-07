/* gen-article-list.js — 导出内置文章清单给 Python 合成侧
 * 用法：node tts-audio/gen-article-list.js
 * 产出：tts-audio/article-list.json（[{id, title, text}]）
 * 文本来源 app.js 的 BUILT_IN_ARTICLES——单一事实源，避免两处维护漂移。 */
'use strict';
const fs = require('fs');
const path = require('path');

const app = require(path.join(__dirname, '..', 'app.js'));
const list = app.BUILT_IN_ARTICLES.map(a => ({ id: a.id, title: a.title, text: a.text }));
const out = path.join(__dirname, 'article-list.json');
fs.writeFileSync(out, JSON.stringify(list, null, 2), 'utf-8');
console.log('导出', list.length, '篇文章 →', out);
list.forEach(a => console.log(' ', a.id, a.title, '(' + a.text.length + ' chars)'));
