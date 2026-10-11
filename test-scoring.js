/* test-scoring.js — 阶段 2 评分修复 A 的回归测试
 *
 * 修复目标（家长反馈"发音很不标准也评 100 分"）：
 * 1. speakableWordText：词面清洗与 amy 音频包同规则
 *    （swing(swung)→swing、make sb's/the bed→make somebody's bed、a / an→a）
 * 2. confusableWords：易混词近邻筛选（编辑距离阈值随词长、上限 12、短语不混单词）
 * 3. buildRecognizerGrammar：语法表 = [unk] + 清洗后目标词 + 易混词
 * 4. scoreFollowRead：
 *    - 短语目标按整句比对（旧 bug：逐 token 与整短语比，短语永远低分）
 *    - 错读成近音词应低于读对（虚高压制的核心断言）
 * 5. 语法缓存：词库导入/编辑后失效重建 */
'use strict';
const assert = require('assert');
const app = require('./app.js');

let passed = 0, failed = 0;
function t(name, cond) {
  if (cond) { passed++; console.log('[PASS]', name); }
  else { failed++; console.log('[FAIL]', name); }
}

/* ---- 1. speakableWordText ---- */
t('括号注记删除: swing(swung) → swing', app.speakableWordText('swing(swung)') === 'swing');
t('斜杠取第一项: a / an → a', app.speakableWordText('a / an') === 'a');
t('斜杠无空格: theater/ theatre → theater', app.speakableWordText('theater/ theatre') === 'theater');
t("sb's 展开: make sb's/the bed → make somebody's bed",
  app.speakableWordText("make sb's/the bed") === "make somebody's bed");
t('sb 展开: help sb with sth → help somebody with something',
  app.speakableWordText('help sb with sth') === 'help somebody with something');
t('sth 展开: succeed in doing sth → succeed in doing something',
  app.speakableWordText('succeed in doing sth') === 'succeed in doing something');
t('省略号删除: too ... to → too to',
  app.speakableWordText('too ... to') === 'too to');
t('普通词原样: hello → hello', app.speakableWordText('hello') === 'hello');
t('大写归一: What about ...? → what about',
  app.speakableWordText('What about ...?') === 'what about');
t('连字符保留: ping-pong → ping-pong', app.speakableWordText('ping-pong') === 'ping-pong');
t('撇号保留: Dr (= doctor) → dr', app.speakableWordText('Dr (= doctor)') === 'dr');

/* 与音频包词表对照。v1.3.1 起 word-list.json 的 text 字段由
 * speakableWordText 导出（同源）——评分口径与音频包口径完全一致，
 * 不允许任何 mismatch。历史上这里曾用 PL_DIRTY 豁免 5 个
 * "knife pl. knives" 类脏词（word-list 未清洗、amy 把 pl 读出来），
 * v1.3.1 修源数据后豁免废除。 */
const wl = require('./tts-audio/word-list.json');
let mismatch = 0;
const realMismatch = [];
wl.forEach(w => {
  const mine = app.speakableWordText(w.raw);
  if (mine !== w.text) {
    mismatch++;
    if (realMismatch.length < 8) realMismatch.push(w.raw + ': 评分=' + JSON.stringify(mine) + ' 包=' + JSON.stringify(w.text));
  }
});
t('评分口径与音频包完全同源（' + wl.length + ' 词，不一致 ' + mismatch + '）', mismatch === 0);
realMismatch.forEach(m => console.log('    ', m));
t('pl. 脏数据清洗: knife (pl. knives) → knife', app.speakableWordText('knife (pl. knives)') === 'knife');
t('pl 连写脏数据清洗: yourselfpl.yourselves → yourself', app.speakableWordText('yourselfpl.yourselves') === 'yourself');
t('词库源已修复: 5 个 pl 词的包内文本不再含 pl', !wl.some(w =>
  /(^|\s)pl(\.|\s|$)/.test(w.text) || /[a-z]pl[a-z]*\.|[a-z]pl\./i.test(w.text) && !/apple|people|place|plant|plate|planet|plenty|example|simple|couple|temple|purple|reply|explore|explain|complete|explore/.test(w.text)));

/* ---- 2. confusableWords ---- */
const st = app.buildBaseState();
app._setState(st);
const texts = app.libraryTextsForGrammar();
t('词库清洗文本缓存非空', texts.length > 2000);

const cf = app.confusableWords('good', texts);
t('good 的易混词含 god/food 类近邻', cf.includes('god') || cf.includes('food') || cf.includes('wood'));
t('易混词不含自身', !cf.includes('good'));
t('易混词上限 12', cf.length <= 12);

const cf2 = app.confusableWords('pick up', texts);
t('短语目标易混词不含单词（pick up vs pick 不混）', !cf2.includes('pick'));

/* ---- 3. buildRecognizerGrammar ---- */
const wordObj = { id: 'test-1', text: 'good' };
const grammar = JSON.parse(app.buildRecognizerGrammar(wordObj));
t('语法表首项 [unk]', grammar[0] === '[unk]');
t('语法表含目标词', grammar.includes('good'));
t('语法表含易混词（长度 > 2）', grammar.length > 2);

/* ---- 4. scoreFollowRead ---- */
/* 虚高压制核心断言：同样高置信，读对 vs 读错必须拉开差距 */
const rightScore = app.scoreFollowRead('good', 'good', 0.95);
const wrongScore = app.scoreFollowRead('good', 'god', 0.95);
t('读对高分（' + rightScore + '）', rightScore >= 90);
t('读错近音词显著低于读对（' + wrongScore + ' < ' + rightScore + '）', wrongScore < rightScore - 10);

const farScore = app.scoreFollowRead('good', 'elephant', 0.95);
t('读离谱词低分（' + farScore + ' < 60）', farScore < 60);

/* 短语整句比对（旧 bug 修复） */
const ph = app.scoreFollowRead('pick up', 'pick up', 0.9);
t('短语读对高分（' + ph + '）', ph >= 85);
const phPart = app.scoreFollowRead('pick up', 'pick', 0.9);
t('短语只读一半低于读全（' + phPart + ' < ' + ph + '）', phPart < ph);
const phWrong = app.scoreFollowRead('pick up', 'look up', 0.9);
t('短语读错低于读对（' + phWrong + ' < ' + ph + '）', phWrong < ph);

/* 清洗后目标词可评分（变体注记词不再永远低分） */
const sw = app.scoreFollowRead('swing(swung)', 'swing', 0.9);
t('带注记词读对可高分（' + sw + '）', sw >= 85);

/* 兼容旧行为 */
t('空识别 0 分', app.scoreFollowRead('good', '', 0.9) === 0);
t('句中识别到目标词', app.scoreFollowRead('good', 'this is good', 0.9) >= 75);
t('完全不对低分', app.scoreFollowRead('good', 'banana apple', 0.9) < 60);

/* 撇号一致性（v1.2.1 修复：所有格词不再差一字符） */
t("所有格读对满分路径: make somebody's bed",
  app.scoreFollowRead("make sb's/the bed", "make somebody's bed", 0.95) >= 90);
t("弯撇号归一: somebody’s",
  app.scoreFollowRead("sb's", "somebody’s", 0.95) >= 90);

/* ---- 5. 语法缓存失效 ---- */
app._setState(app.buildBaseState()); /* _setState 直接换 state，缓存保留 */
app.libraryTextsForGrammar(); /* 建立缓存 */
/* 模拟 Excel 导入换库：applyGradeImport 会置空缓存 */
const g7a = st.grades.find(g => g.id === 'g7a');
const parsed = {
  unitOrder: [{ title: '导入单元', words: [{ text: 'zzztestword', phon: '', pos: '', meaning: '测试词' }] }],
  wordCount: 1, skipped: 0,
};
app.applyGradeImport('g7a', parsed);
const texts2 = app.libraryTextsForGrammar();
t('词库导入后缓存重建（含新词）', texts2.includes('zzztestword'));

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
