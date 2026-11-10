/**
 * v2.3.0 —— 程序化「原创即兴」作曲引擎（纯数据 / 零 DOM / 零音频文件 / ES5 兼容写法）。
 *
 * 【为什么要有这一层】
 * 手写三首固定曲 + 几套编曲变奏，本质上「每次打开听到的还是那几首」。
 * 这里改为 seed 驱动的实时作曲：每次启动随机生成一个种子，为标题 / 第 1 关 /
 * 第 2 关各写一首全新的曲子；调性、和弦进行、核心动机(hook)、节奏型、鼓组、
 * 琶音、速度全部由种子决定。种子空间 2^32，配合各池的组合，实际曲库近乎无限。
 *
 * 【版权边界 · 重要】
 * 不复制任何现有商业游戏 / 唱片的旋律、和声序列或音频素材，工程内也没有音频文件。
 * 这里实现的是「休闲消除类 BGM」的通用体裁技法（大调 / 五声音阶、四小节方整循环、
 * 短动机反复 + 问答句、强拍卡点鼓组、I–V–vi–IV 家族和声、段落对比），
 * 这些属于不受版权保护的风格与作曲法；生成的具体音符序列每次都是全新的原创结果。
 *
 * 【为什么随机生成仍然「好听」而不是乱响】
 *  1. 五声音阶（无半音冲突），任意相邻音组合都协和；
 *  2. 全曲共用同一个 1 小节核心动机，反复出现 + 尾音变化 → 天然记忆点（hook）；
 *  3. 强拍落在当前和弦内音，句尾收束到主音，符合听感预期；
 *  4. 旋律音域锁在两个八度内，级进为主、小跳为辅；
 *  5. 贝斯严格跟随和弦根音 / 五度，pad 低八度只做垫，不与旋律打架；
 *  6. A / B 两段：B 段动机上移 + 节奏加密 + 句尾改写，循环周期翻倍不机械。
 *
 * 【ES5 兼容】刻意只用 var / function / for 下标循环，避免 Map / Set / for...of /
 * 展开运算符（兼容版构建用的是「迭代即数组」降级，这些写法在 IE8 会静默失效）。
 */
import { NOTE_FREQ, CHORD_TONES, shiftOct } from './music_tracks.js';

var NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** 三种场景的「气质」模板：只定风格范围，不写死任何音符 */
export var TRACK_STYLES = {
  title: { bpmMin: 88, bpmMax: 106, minor: false, melodyGain: 0.30, bassGain: 0.24,
    drumGain: 0.50, arpGain: 0.072, padGain: 0.10, label: '标题' },
  1: { bpmMin: 104, bpmMax: 122, minor: false, melodyGain: 0.31, bassGain: 0.26,
    drumGain: 0.56, arpGain: 0.076, padGain: 0.09, label: '第一关' },
  2: { bpmMin: 120, bpmMax: 138, minor: true, melodyGain: 0.30, bassGain: 0.29,
    drumGain: 0.60, arpGain: 0.066, padGain: 0.11, label: '第二关' },
};

/* ---------------- 素材池（全部是通用作曲技法，不含任何具体作品旋律） ---------------- */

// 和弦进行：每项是 4 个 [相对主音半音偏移, 'M'大三/'m'小三]
var PROGRESSIONS_MAJOR = [
  [[0, 'M'], [7, 'M'], [9, 'm'], [5, 'M']],   // I  V  vi IV
  [[0, 'M'], [9, 'm'], [5, 'M'], [7, 'M']],   // I  vi IV V
  [[9, 'm'], [5, 'M'], [0, 'M'], [7, 'M']],   // vi IV I  V
  [[0, 'M'], [5, 'M'], [7, 'M'], [0, 'M']],   // I  IV V  I
  [[0, 'M'], [7, 'M'], [5, 'M'], [7, 'M']],   // I  V  IV V
  [[0, 'M'], [4, 'm'], [5, 'M'], [7, 'M']],   // I  iii IV V
  [[5, 'M'], [0, 'M'], [7, 'M'], [9, 'm']],   // IV I  V  vi
];
var PROGRESSIONS_MINOR = [
  [[0, 'm'], [8, 'M'], [3, 'M'], [10, 'M']],  // i  VI III VII
  [[0, 'm'], [5, 'm'], [8, 'M'], [7, 'M']],   // i  iv VI  V
  [[0, 'm'], [3, 'M'], [10, 'M'], [8, 'M']],  // i  III VII VI
  [[0, 'm'], [8, 'M'], [5, 'm'], [7, 'M']],   // i  VI iv  V
  [[0, 'm'], [10, 'M'], [8, 'M'], [7, 'M']],  // i  VII VI V
];

// 每小节 4 拍的节奏骨架（八分栅格），全部总和 = 4
var RHYTHMS = [
  [0.5, 0.5, 1, 1, 1],
  [0.5, 0.5, 0.5, 0.5, 1, 1],
  [1, 0.5, 0.5, 1, 1],
  [0.5, 0.5, 1, 0.5, 0.5, 1],
  [1, 1, 0.5, 0.5, 1],
  [0.5, 1, 0.5, 1, 1],
  [1, 1, 1, 1],
  [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1],
];
var BASS_RHYTHMS = [
  [1, 1, 1, 1],
  [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  [1, 0.5, 0.5, 1, 1],
  [0.5, 0.5, 1, 1, 1],
];
var KICKS = [
  [1, 0, 0, 0, 1, 0, 0, 0],
  [1, 0, 0, 0, 1, 0, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [1, 0, 0, 0, 1, 0, 0, 1],
];
var SNARES = [
  [0, 0, 1, 0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0, 1, 1, 0],
  [0, 0, 1, 0, 0, 0, 1, 1],
];
var HATS = [
  [1, 0, 1, 0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 0, 1, 1],
  [1, 1, 0, 1, 1, 1, 0, 1],
];
var ARP_PATTERNS = [
  [1, 0, 0, 1, 0, 1, 0, 0],
  [1, 0, 1, 0, 1, 0, 1, 1],
  [1, 0, 1, 1, 0, 1, 0, 1],
  [0, 1, 0, 1, 1, 0, 1, 0],
  [1, 0, 0, 1, 1, 0, 0, 1],
];
var NAME_A = ['晴日', '糖霜', '星屑', '蜜柑', '云雀', '薄荷', '灯火', '潮汐', '松果', '纸鸢',
  '青柠', '绒云', '风铃', '琥珀', '初雪', '花火', '晨露', '柑橘', '木漏', '月台'];
var NAME_B = ['序曲', '圆舞', '小调', '进行曲', '速写', '变奏', '回旋', '随笔', '散策', '练习曲'];

/* ---------------- 基础工具 ---------------- */

/** 确定性伪随机（LCG，乘法不超 2^53，IE8 也不需要 Math.imul） */
export function makeRng(seed) {
  var s = (seed >>> 0) || 1;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function pick(rng, arr) { return arr[Math.floor(rng() * arr.length) % arr.length]; }
function midiToName(midi) {
  var pc = ((midi % 12) + 12) % 12;
  var oct = Math.floor(midi / 12) - 1;
  return NOTE_NAMES[pc] + oct;
}
function chordSymbol(rootPc, offset, quality) {
  return NOTE_NAMES[(rootPc + offset) % 12] + (quality === 'm' ? 'm' : '');
}
/** 和弦内音的 pitch class 集合，用于让强拍落在和声上 */
function chordPcs(sym) {
  var tones = CHORD_TONES[sym] || ['C4', 'E4', 'G4'];
  var out = [];
  for (var i = 0; i < tones.length; i++) {
    var name = tones[i].replace(/\d$/, '');
    out.push(NOTE_NAMES.indexOf(name));
  }
  return out;
}
function shortSeed(seed) {
  var s = (seed >>> 0).toString(16).toUpperCase();
  while (s.length < 6) s = '0' + s;
  return s.slice(-4);
}

/** 生成一段 4 拍旋律小节。scale 是可用的 midi 音列表（五声音阶，两个八度）。 */
function melodyBar(rng, rhythm, scale, tonicMidi, pcs, opts) {
  var notes = [];
  var idx = 2 + Math.floor(rng() * 3); // 起始音级，避开最低音
  var minIdx = 1;
  var maxIdx = scale.length - 2;
  for (var i = 0; i < rhythm.length; i++) {
    var last = (i === rhythm.length - 1);
    var strong = rhythm[i] >= 1;
    if (last) {
      // 句尾收束到主音（同一音级里最靠近当前音的那个主音）
      var best = minIdx;
      for (var k = minIdx; k <= maxIdx; k++) {
        if (scale[k] % 12 === tonicMidi % 12 && Math.abs(k - idx) < Math.abs(best - idx)) best = k;
      }
      idx = best;
    } else {
      var stepPool = [-2, -1, -1, 0, 1, 1, 2];
      if (opts.dense) stepPool = [-2, -1, 1, 1, 2, 2];
      var step = pick(rng, stepPool);
      idx = Math.max(minIdx, Math.min(maxIdx, idx + step));
      // 强拍优先靠拢和弦内音（把音级往最近的和弦音挪一格）
      if (strong && rng() < 0.72) {
        var nearest = idx;
        for (var j = minIdx; j <= maxIdx; j++) {
          var pc = ((scale[j] % 12) + 12) % 12;
          for (var q = 0; q < pcs.length; q++) {
            if (pcs[q] === pc && Math.abs(j - idx) < Math.abs(nearest - idx)) nearest = j;
          }
        }
        idx = nearest;
      }
    }
    notes.push({ n: midiToName(scale[idx]), d: rhythm[i] });
  }
  return notes;
}

/** 把 4 小节拼成一段 16 拍旋律，共用动机节奏形成 hook */
function buildSection(rng, style, chords, scale, tonicMidi, isB) {
  var motif = pick(rng, RHYTHMS);
  var denseRhythm = pick(rng, RHYTHMS);
  while (denseRhythm === motif && RHYTHMS.length > 1) denseRhythm = pick(rng, RHYTHMS);
  var out = [];
  for (var bar = 0; bar < 4; bar++) {
    var sym = chords[bar];
    var pcs = chordPcs(sym);
    var rhythm = motif;
    if (isB && (bar === 1 || bar === 2)) rhythm = denseRhythm;  // B 段加密
    if (bar === 3) rhythm = [1, 1, 1, 1];                        // 每段落末小节放宽收束
    var barNotes = melodyBar(rng, rhythm, scale, tonicMidi, pcs, { dense: isB && bar < 3 });
    for (var i = 0; i < barNotes.length; i++) {
      var e = barNotes[i];
      var nm = e.n;
      // B 段整体移高 2 个音级（约三度），制造段落对比，仍落在同一五声音阶
      if (isB && bar < 3) {
        var pos = -1;
        for (var s = 0; s < scale.length; s++) if (scale[s] === noteMidi(nm)) pos = s;
        if (pos >= 0 && pos + 2 < scale.length) nm = midiToName(scale[pos + 2]);
      }
      // 第 2 小节末音改写为答句（上行邻音），形成「问—答」记忆点
      if (bar === 1 && i === barNotes.length - 1) {
        var p2 = -1;
        for (var s2 = 0; s2 < scale.length; s2++) if (scale[s2] === noteMidi(nm)) p2 = s2;
        if (p2 >= 0 && p2 + 1 < scale.length) nm = midiToName(scale[p2 + 1]);
      }
      out.push({ n: nm, d: e.d });
    }
  }
  return out;
}

/** 音名 → midi（只用于反查音级；NOTE_FREQ 表是频率不是 midi，这里按十二平均律反算） */
function noteMidi(name) {
  var m = /^([A-G]#?)(\d)$/.exec(name);
  if (!m) return 72;
  var pc = NOTE_NAMES.indexOf(m[1]);
  return 12 * (parseInt(m[2], 10) + 1) + pc;
}

function buildBass(rng, chords) {
  var out = [];
  for (var b = 0; b < chords.length; b++) {
    var tones = CHORD_TONES[chords[b]] || ['C3', 'E3', 'G3'];
    var root = shiftOct(tones[0], false);
    var fifth = shiftOct(tones[2], false);
    var rhythm = pick(rng, BASS_RHYTHMS);
    for (var i = 0; i < rhythm.length; i++) {
      out.push({ n: i % 2 === 0 ? root : fifth, d: rhythm[i] });
    }
  }
  return out;
}

/**
 * 生成一首完整原创曲子，结构与 TRACKS 中的静态曲目完全一致，
 * 因此 music.js 的 _buildSteps / 各声部合成器无需任何改动即可演奏。
 */
export function composeTrack(styleKey, seed) {
  var sk = String(styleKey);  // 关卡 key 有时是数字，有时是字符串，统一成字符串比较
  var style = TRACK_STYLES[sk] || TRACK_STYLES.title;
  var rng = makeRng((seed ^ (sk === '2' ? 0x9e3779b9 : sk === '1' ? 0x85ebca6b : 0xc2b2ae35)) >>> 0);

  var bpm = Math.floor(style.bpmMin + rng() * (style.bpmMax - style.bpmMin + 1));
  var tonicPc = Math.floor(rng() * 12);                    // 12 个调随机
  var scaleType = (style.minor || rng() < 0.22) ? [0, 3, 5, 7, 10] : [0, 2, 4, 7, 9]; // 小调/大调五声
  var progPool = style.minor ? PROGRESSIONS_MINOR : PROGRESSIONS_MAJOR;
  var prog = pick(rng, progPool);

  var chords = [];
  for (var i = 0; i < 4; i++) chords.push(chordSymbol(tonicPc, prog[i][0], prog[i][1]));

  // 旋律音域：C5 起的两个八度内，只取属于当前五声音阶的音
  var scale = [];
  for (var m = 72; m <= 96; m++) {
    var pc = m % 12;
    for (var q = 0; q < scaleType.length; q++) {
      if ((tonicPc + scaleType[q]) % 12 === pc) { scale.push(m); break; }
    }
  }
  var tonicMidi = 72 + ((tonicPc - 0 + 12) % 12); // 主音（用于句尾收束的 pitch class 判定）

  var melody = buildSection(rng, style, chords, scale, tonicMidi, false);
  var variation = buildSection(rng, style, chords, scale, tonicMidi, true);
  var bass = buildBass(rng, chords);

  var kick = pick(rng, KICKS);
  var snare = pick(rng, SNARES);
  var hat = pick(rng, HATS);
  var arpPattern = pick(rng, ARP_PATTERNS);

  var fullName = pick(rng, NAME_A) + pick(rng, NAME_B);

  return {
    id: 'gen-' + styleKey + '-' + shortSeed(seed >>> 0),
    name: fullName,
    seed: seed >>> 0,
    styleKey: styleKey,
    bpm: bpm,
    bars: 4,
    beatsPerBar: 4,
    chords: chords,
    melody: melody,
    variation: variation,
    bass: bass,
    drums: { kick: kick, snare: snare, hat: hat },
    arpOn: true,
    arpStyle: rng() < 0.5 ? 'up' : 'updown',
    arpPattern: arpPattern,
    padGain: style.padGain,
    arpGain: style.arpGain,
    bassGain: style.bassGain,
    melodyGain: style.melodyGain,
    drumGain: style.drumGain,
  };
}

/** 为一个 seed 生成整套曲库（标题 / 第一关 / 第二关各一首，彼此独立） */
export function composeLibrary(seed) {
  var s = seed >>> 0;
  return {
    title: composeTrack('title', (s ^ 0x1b873593) >>> 0),
    1: composeTrack('1', (s ^ 0x7f4a7c15) >>> 0),
    2: composeTrack('2', (s ^ 0x632be5ab) >>> 0),
  };
}

/** 严格自检生成的曲子（与 validateTracks 同规格；非法数据必须报错，不静默修正） */
export function validateComposition(t) {
  var issues = [];
  var expect = t.bars * t.beatsPerBar;
  var stepsPerBar = t.beatsPerBar * 2;
  var voices = ['melody', 'variation', 'bass'];
  for (var v = 0; v < voices.length; v++) {
    var list = t[voices[v]];
    if (!Array.isArray(list)) { issues.push(t.id + '.' + voices[v] + ' 不是数组'); continue; }
    var sum = 0;
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      sum += e.d;
      if (!NOTE_FREQ[e.n]) issues.push(t.id + '.' + voices[v] + ' 未知音名 ' + e.n);
      if (!(e.d > 0)) issues.push(t.id + '.' + voices[v] + ' 非法时值 ' + e.d);
    }
    if (Math.abs(sum - expect) > 1e-9) issues.push(t.id + '.' + voices[v] + ' 拍数 ' + sum + ' ≠ ' + expect);
  }
  if (!Array.isArray(t.chords) || t.chords.length !== t.bars) {
    issues.push(t.id + '.chords 长度异常');
  } else {
    for (var c = 0; c < t.chords.length; c++) {
      if (!CHORD_TONES[t.chords[c]]) issues.push(t.id + '.chords 未知和弦 ' + t.chords[c]);
    }
  }
  var dp = t.drums || {};
  var dk = ['kick', 'snare', 'hat'];
  for (var k = 0; k < dk.length; k++) {
    var a = dp[dk[k]];
    if (!Array.isArray(a) || a.length !== stepsPerBar) issues.push(t.id + '.drums.' + dk[k] + ' 长度异常');
    else for (var j = 0; j < a.length; j++) if (a[j] !== 0 && a[j] !== 1) issues.push(t.id + '.drums.' + dk[k] + ' 含非法值');
  }
  var ap = t.arpPattern;
  if (!Array.isArray(ap) || ap.length !== stepsPerBar) issues.push(t.id + '.arpPattern 长度异常');
  else {
    var hasZero = false, hasOne = false;
    for (var z = 0; z < ap.length; z++) { if (ap[z] === 0) hasZero = true; if (ap[z] === 1) hasOne = true; }
    if (!hasZero || !hasOne) issues.push(t.id + '.arpPattern 必须是 0/1 混合的切分');
  }
  if (JSON.stringify(t.variation) === JSON.stringify(t.melody)) issues.push(t.id + ' A/B 段落完全相同');
  if (!(t.bpm > 40 && t.bpm < 220)) issues.push(t.id + ' bpm 非法 ' + t.bpm);
  return { ok: issues.length === 0, issues: issues };
}
