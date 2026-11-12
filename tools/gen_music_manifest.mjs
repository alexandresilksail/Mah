/**
 * 生成 src/game/music_manifest.js —— 所有运行版本共用的内置背景音乐清单。
 *
 *   node tools/gen_music_manifest.mjs
 *
 * 作用：
 *  1. 读取 src/assets/music/*.wav（用户已提供的 5 首，原文件不改动、不转码）；
 *  2. 用**现有的** matchScene() 做场景匹配（不重新开发上传 / 场景分配逻辑），
 *     只有 confidence === 'exact' 才纳入，ambiguous / none 一律不自动指派；
 *  3. 把音频以 data URI 内嵌进一个 ES module，构建时由 esbuild 直接打进
 *     MahLeMah.html / index.html / MahLeMah-legacy.html / Tauri 的 src/ 前端，
 *     因此产物不依赖任何开发机临时路径。
 *
 * 生成物是源码的一部分（会提交），不是构建缓存；重新构建 HTML 不需要再跑本脚本。
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { matchScene, SCENES } from '../src/game/music_match.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'src/assets/music');
const outFile = path.join(root, 'src/game/music_manifest.js');

const files = readdirSync(dir).filter((n) => /\.(wav|mp3|ogg)$/i.test(n)).sort();
if (!files.length) throw new Error('src/assets/music/ 里没有音乐文件');

/** scene → [fileName]，与现有 matchScene 的 exact 结果完全一致 */
const map = {};
for (const s of SCENES) map[s] = [];
const src = {};
const sha = createHash('sha256');
let totalBytes = 0;

for (const name of files) {
  const buf = readFileSync(path.join(dir, name));
  totalBytes += buf.length;
  sha.update(name);
  sha.update(buf);
  const ext = name.slice(name.lastIndexOf('.') + 1).toLowerCase();
  const mime = ext === 'ogg' ? 'audio/ogg' : ext === 'mp3' ? 'audio/mpeg' : 'audio/wav';
  src[name] = 'data:' + mime + ';base64,' + buf.toString('base64');

  const m = matchScene(name);
  if (m.confidence !== 'exact' || !m.scene || SCENES.indexOf(m.scene) < 0) {
    throw new Error('音乐文件未能唯一匹配场景（不自动指派）: ' + name + ' → ' + JSON.stringify(m));
  }
  map[m.scene].push(name);
}

const resourceHash = sha.digest('hex');

const header = `/**
 * 内置背景音乐清单 —— 由 tools/gen_music_manifest.mjs 生成，请勿手工编辑。
 *
 * 资源来自 src/assets/music/（5 个用户提供的 wav，未替换、未转码、未删除）。
 * 场景映射直接取 matchScene() 的 exact 结果，与导入面板使用同一套规则。
 * 音频以 data URI 内嵌，所有运行版本（网页版 / 独立 HTML / legacy / Tauri）
 * 共用本文件，不依赖开发机路径，也不发起网络请求。
 *
 * 资源总字节: ${totalBytes}
 * 资源指纹:   ${resourceHash}
 */
`;

const body =
  '\nexport const BUILTIN_MUSIC_MAP = ' + JSON.stringify(map, null, 2) + ';\n' +
  '\nexport const BUILTIN_MUSIC_SCENE_COUNT = ' + SCENES.length + ';\n' +
  '\nexport const MUSIC_RESOURCE_HASH = ' + JSON.stringify(resourceHash) + ';\n' +
  '\nexport const MUSIC_RESOURCE_BYTES = ' + totalBytes + ';\n' +
  '\nexport const BUILTIN_MUSIC_FILES = ' + JSON.stringify(files) + ';\n' +
  '\nexport const BUILTIN_MUSIC_SRC = {\n' +
  files.map((n) => '  ' + JSON.stringify(n) + ': ' + JSON.stringify(src[n])).join(',\n') +
  '\n};\n' +
  '\n/** 合并用户导入的 musicMap：内置曲目在前，用户新增曲目追加在后（不删除任何资源） */\n' +
  'export function mergeMusicMap(userMap) {\n' +
  '  var out = {};\n' +
  '  for (var s in BUILTIN_MUSIC_MAP) {\n' +
  '    if (!Object.prototype.hasOwnProperty.call(BUILTIN_MUSIC_MAP, s)) continue;\n' +
  '    out[s] = BUILTIN_MUSIC_MAP[s].slice();\n' +
  '  }\n' +
  '  if (userMap && typeof userMap === "object") {\n' +
  '    for (var k in userMap) {\n' +
  '      if (!Object.prototype.hasOwnProperty.call(userMap, k)) continue;\n' +
  '      if (!Object.prototype.hasOwnProperty.call(out, k)) continue;\n' +
  '      var list = userMap[k];\n' +
  '      if (Object.prototype.toString.call(list) !== "[object Array]") continue;\n' +
  '      for (var i = 0; i < list.length; i++) {\n' +
  '        if (typeof list[i] !== "string" || !list[i]) continue;\n' +
  '        var seen = false;\n' +
  '        for (var j = 0; j < out[k].length; j++) if (out[k][j] === list[i]) seen = true;\n' +
  '        if (!seen) out[k].push(list[i]);\n' +
  '      }\n' +
  '    }\n' +
  '  }\n' +
  '  return out;\n' +
  '}\n';

writeFileSync(outFile, header + body, 'utf8');

console.log('生成 ' + path.relative(root, outFile));
console.log('  音乐文件 ' + files.length + ' 首 / ' + totalBytes + ' B / sha256=' + resourceHash.slice(0, 16));
for (const s of SCENES) console.log('  ' + s.padEnd(10) + ' → ' + (map[s].join('、') || '（无内置曲目，静音）'));
