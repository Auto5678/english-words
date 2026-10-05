/* 把 model/ 下的 Vosk 模型拆成 ≤20MB 分卷（jsDelivr 单文件上限 20MB）。。
 * 用法：node split-model.js
 * 产出 model-cdn/vosk-model.partN，全部上传到 GitHub 仓库的 model-cdn/ 目录。 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'model', 'vosk-model-small-en-us-0.15.tar.gz');
const OUT_DIR = path.join(__dirname, 'model-cdn');
const CHUNK = 14 * 1024 * 1024; /* 14MB × 3 卷，留足余量 */

const stat = fs.statSync(SRC);
console.log('源文件:', (stat.size / 1048576).toFixed(2), 'MB');

fs.mkdirSync(OUT_DIR, { recursive: true });

const fd = fs.openSync(SRC, 'r');
const buf = Buffer.alloc(CHUNK);
let part = 0;
let total = 0;
while (true) {
  const read = fs.readSync(fd, buf, 0, CHUNK, null);
  if (read === 0) break;
  part++;
  const out = path.join(OUT_DIR, 'vosk-model.part' + part);
  fs.writeFileSync(out, buf.slice(0, read));
  console.log('写出', out, (read / 1048576).toFixed(2), 'MB');
  total += read;
}
fs.closeSync(fd);

/* 校验：分卷总字节 = 源文件 */
if (total !== stat.size) {
  console.error('校验失败！', total, '!=', stat.size);
  process.exit(1);
}
console.log('完成：', part, '卷，总计', total, '字节，与源文件一致 ✓');
console.log('下一步：把 model-cdn/ 目录整体上传到 GitHub 仓库根目录');
