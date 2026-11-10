/**
 * v2.1.0 —— 原创背景音乐曲目数据（纯数据，零 DOM / 零音频文件）。
 *
 * 【版权边界 · 重要】
 * 本项目不含、也不复制任何现有商业游戏或唱片的旋律、和声序列或音频素材。
 * 所有旋律动机、和声进行、节奏型与配器均为本项目重新编写的原创内容，
 * 工程内没有任何 .mp3/.wav/.ogg 文件 —— 一切声音由 Web Audio API 实时合成。
 * 这里借鉴的只是「休闲消除类 BGM」的通用**体裁特征**（明快、短动机反复、
 * 强拍律动、卡点循环、段落对比），这些属于不受版权保护的风格与技法，
 * 而非任何具体作品可识别的音符序列。
 *
 * 【这一版为什么更好听 —— 曲谱层面】
 *  1. Hook 优先：每首曲子以一个 2 小节短动机为核心，前半问句、后半答句，
 *     音域控制在五度~八度内，重复 + 尾音变化，形成记忆点（而不是音阶跑动）。
 *  2. 段落对比：每首含 A / B 两段（variation），B 段音区上移、句尾变化，
 *     整段循环周期翻倍，避免机械重复。
 *  3. 节奏化琶音：arpPattern 用八分位 0/1 定义切分，不再每八分「叮叮叮」满击。
 *  4. 和声进行统一走 I–V–vi–IV 家族（休闲品类最顺耳的循环），
 *     贝斯严格跟随和弦根音/五度，不与铺底打架。
 *  5. 延迟时间按 bpm 推导（附点八分），与节拍同步，不产生浑浊拖尾。
 *
 * 记谱模型：
 *  · chords：每小节一个和弦符号，引擎据此生成持续铺底（pad）与琶音（arp）。
 *  · melody / variation / bass：拍数总和必须 = bars * beatsPerBar。
 *  · drums：kick/snare/hat 八分位打击（0/1），长度 = beatsPerBar*2。
 *  · arpPattern：八分位 0/1，长度 = beatsPerBar*2。
 *  · 各声部独立增益用于混音平衡；lead 参数定义主旋律音色。
 */

/** 十二平均律频率表（A4 = 440Hz） */
export const NOTE_FREQ = {
  E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760.00,
};

/** 和弦表：符号 → 三个和弦音 */
export const CHORD_TONES = {
  C:  ['C4', 'E4', 'G4'],
  Cm: ['C4', 'D#4', 'G4'],
  Dm: ['D4', 'F4', 'A4'],
  Em: ['E4', 'G4', 'B4'],
  F:  ['F3', 'A3', 'C4'],
  G:  ['G3', 'B3', 'D4'],
  Am: ['A3', 'C4', 'E4'],
  A:  ['A3', 'C#4', 'E4'],
  E:  ['E4', 'G#4', 'B4'],
};

/* v2.3.0：程序化作曲会在 12 个调上即兴，静态表只覆盖了常用白键。
 * 这里按十二平均律把 C2..B7 的全部半音、以及 12 个大三 + 12 个小三和弦补齐；
 * 已存在的条目保留原值（静态曲目依赖它们，不能改动），只补空缺。 */
const _PITCH_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const _midiName = (m) => _PITCH_NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
for (let m = 36; m <= 107; m++) {
  const key = _midiName(m);
  if (NOTE_FREQ[key] === undefined) {
    NOTE_FREQ[key] = +(440 * Math.pow(2, (m - 69) / 12)).toFixed(2);
  }
}
for (let pc = 0; pc < 12; pc++) {
  const root = 60 + pc;
  const maj = _PITCH_NAMES[pc];
  const min = _PITCH_NAMES[pc] + 'm';
  if (!CHORD_TONES[maj]) CHORD_TONES[maj] = [_midiName(root), _midiName(root + 4), _midiName(root + 7)];
  if (!CHORD_TONES[min]) CHORD_TONES[min] = [_midiName(root), _midiName(root + 3), _midiName(root + 7)];
}

/** 把一个音名升高/降低一个八度（用于琶音上移八度增加亮度） */
export function shiftOct(n, up) {
  return n.replace(/(\d)$/, (d) => String(Math.max(1, Math.min(7, +d + (up ? 1 : -1)))));
}

export const TRACKS = {
  /* ============ 标题 / 大厅：晴日序曲（明亮、松弛、带记忆点） ============ */
  title: {
    id: 'title',
    name: '标题 · 晴日序曲',
    bpm: 96,
    bars: 4,
    beatsPerBar: 4,
    chords: ['C', 'G', 'Am', 'F'],
    // A 段主钩子：核心节奏型「哒哒 哒— 哒哒 哒—」，问句上行、答句收束回落
    melody: [
      { n: 'E5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'A5', d: 1 }, { n: 'G5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'D5', d: 1 },
      { n: 'D5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'G5', d: 1 }, { n: 'A5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'E5', d: 1 },
      { n: 'C5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'A5', d: 1 }, { n: 'G5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'C5', d: 1 },
      { n: 'A5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'E5', d: 1 }, { n: 'D5', d: 1 }, { n: 'C5', d: 1 },
    ],
    // B 段变奏：音区上移、句尾改写，与 A 段形成问答
    variation: [
      { n: 'G5', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'C6', d: 1 }, { n: 'A5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'E5', d: 1 },
      { n: 'A5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'E5', d: 1 }, { n: 'G5', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'D5', d: 1 },
      { n: 'E5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'C6', d: 1 }, { n: 'A5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'E5', d: 1 },
      { n: 'G5', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'G5', d: 1 }, { n: 'E5', d: 1 }, { n: 'C5', d: 1 },
    ],
    // 贝斯：根音 + 五度，四分推进，稳而不抢
    bass: [
      { n: 'C3', d: 1 }, { n: 'G2', d: 1 }, { n: 'C3', d: 1 }, { n: 'G2', d: 1 },
      { n: 'G2', d: 1 }, { n: 'D3', d: 1 }, { n: 'G2', d: 1 }, { n: 'D3', d: 1 },
      { n: 'A2', d: 1 }, { n: 'E2', d: 1 }, { n: 'A2', d: 1 }, { n: 'E2', d: 1 },
      { n: 'F2', d: 1 }, { n: 'C3', d: 1 }, { n: 'F2', d: 1 }, { n: 'C3', d: 1 },
    ],
    drums: {
      kick:  [1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hat:   [1, 0, 1, 0, 1, 0, 1, 0],
    },
    arpOn: true,
    arpStyle: 'up',
    arpPattern: [1, 0, 0, 1, 0, 1, 0, 0], // 切分，避免满击
    padGain: 0.10, arpGain: 0.075, bassGain: 0.24, melodyGain: 0.30, drumGain: 0.55,
  },

  /* ============ 第一关：糖果冲刺（跳跃、卡点、洗脑） ============ */
  1: {
    id: 'L1',
    name: '第一关 · 糖果冲刺',
    bpm: 112,
    bars: 4,
    beatsPerBar: 4,
    chords: ['C', 'G', 'Am', 'F'],
    // A 段：同音反复起句（最抓耳的 hook 手法）+ 大跳收句
    melody: [
      { n: 'G5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'E5', d: 1 }, { n: 'C5', d: 1 },
      { n: 'D5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'G5', d: 1 }, { n: 'D5', d: 1 },
      { n: 'A5', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'C6', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'G5', d: 1 }, { n: 'E5', d: 1 },
      { n: 'A5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'F5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'D5', d: 1 }, { n: 'C5', d: 1 },
    ],
    // B 段：整体抬到高音区，尾句拉回主音，制造「再来一遍」的期待
    variation: [
      { n: 'C6', d: 0.5 }, { n: 'C6', d: 0.5 }, { n: 'D6', d: 0.5 }, { n: 'C6', d: 0.5 }, { n: 'A5', d: 1 }, { n: 'G5', d: 1 },
      { n: 'A5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'C6', d: 0.5 }, { n: 'D6', d: 1 }, { n: 'G5', d: 1 },
      { n: 'E5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'C6', d: 0.5 }, { n: 'A5', d: 1 }, { n: 'G5', d: 1 },
      { n: 'C6', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'D5', d: 1 }, { n: 'C5', d: 1 },
    ],
    // 贝斯：八分跳音，根-五度交替，活泼有弹性
    bass: [
      { n: 'C3', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'C3', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'C3', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'C3', d: 0.5 }, { n: 'G2', d: 0.5 },
      { n: 'G2', d: 0.5 }, { n: 'D3', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'D3', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'D3', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'D3', d: 0.5 },
      { n: 'A2', d: 0.5 }, { n: 'E2', d: 0.5 }, { n: 'A2', d: 0.5 }, { n: 'E2', d: 0.5 }, { n: 'A2', d: 0.5 }, { n: 'E2', d: 0.5 }, { n: 'A2', d: 0.5 }, { n: 'E2', d: 0.5 },
      { n: 'F2', d: 0.5 }, { n: 'C3', d: 0.5 }, { n: 'F2', d: 0.5 }, { n: 'C3', d: 0.5 }, { n: 'F2', d: 0.5 }, { n: 'C3', d: 0.5 }, { n: 'F2', d: 0.5 }, { n: 'C3', d: 0.5 },
    ],
    drums: {
      kick:  [1, 0, 0, 0, 1, 0, 1, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hat:   [1, 1, 1, 1, 1, 1, 1, 1],
    },
    arpOn: true,
    arpStyle: 'updown',
    arpPattern: [1, 0, 1, 0, 1, 0, 1, 1],
    padGain: 0.09, arpGain: 0.070, bassGain: 0.26, melodyGain: 0.31, drumGain: 0.58,
  },

  /* ============ 第二关：暗流（紧张推进 / 小调，仍有清晰 hook） ============ */
  2: {
    id: 'L2',
    name: '第二关 · 暗流',
    bpm: 128,
    bars: 4,
    beatsPerBar: 4,
    chords: ['Am', 'F', 'C', 'G'],
    // A 段：小调上行 + 悬留回落，压迫但不失旋律性
    melody: [
      { n: 'A4', d: 0.5 }, { n: 'C5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'G5', d: 1 }, { n: 'E5', d: 1 },
      { n: 'F5', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'C6', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'G5', d: 1 }, { n: 'F5', d: 1 },
      { n: 'G5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'C5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'G5', d: 1 }, { n: 'C6', d: 1 },
      { n: 'D5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'B4', d: 0.5 }, { n: 'D5', d: 0.5 }, { n: 'G5', d: 1 }, { n: 'E5', d: 1 },
    ],
    // B 段：高音区密集推进，末句转回 Am 起音形成循环钩子
    variation: [
      { n: 'E5', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'C6', d: 0.5 }, { n: 'E6', d: 0.5 }, { n: 'D6', d: 1 }, { n: 'C6', d: 1 },
      { n: 'C6', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'F5', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'C6', d: 1 }, { n: 'A5', d: 1 },
      { n: 'C6', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'C6', d: 1 }, { n: 'G5', d: 1 },
      { n: 'B4', d: 0.5 }, { n: 'D5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'B4', d: 0.5 }, { n: 'D5', d: 1 }, { n: 'E5', d: 1 },
    ],
    // 贝斯：八分驱动脉冲，严格跟随 [Am,F,C,G] 根音+五度
    bass: [
      { n: 'A2', d: 0.5 }, { n: 'A2', d: 0.5 }, { n: 'A2', d: 0.5 }, { n: 'A2', d: 0.5 }, { n: 'E2', d: 0.5 }, { n: 'E2', d: 0.5 }, { n: 'E2', d: 0.5 }, { n: 'E2', d: 0.5 },
      { n: 'F2', d: 0.5 }, { n: 'F2', d: 0.5 }, { n: 'F2', d: 0.5 }, { n: 'F2', d: 0.5 }, { n: 'C3', d: 0.5 }, { n: 'C3', d: 0.5 }, { n: 'C3', d: 0.5 }, { n: 'C3', d: 0.5 },
      { n: 'C3', d: 0.5 }, { n: 'C3', d: 0.5 }, { n: 'C3', d: 0.5 }, { n: 'C3', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'G2', d: 0.5 },
      { n: 'G2', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'D3', d: 0.5 }, { n: 'D3', d: 0.5 }, { n: 'D3', d: 0.5 }, { n: 'D3', d: 0.5 },
    ],
    drums: {
      kick:  [1, 0, 1, 0, 1, 0, 1, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hat:   [1, 1, 1, 1, 1, 1, 1, 1],
    },
    arpOn: true,
    arpStyle: 'up',
    arpPattern: [1, 0, 1, 1, 0, 1, 0, 1],
    padGain: 0.11, arpGain: 0.065, bassGain: 0.30, melodyGain: 0.29, drumGain: 0.62,
  },
};

/**
 * 自检：保证曲目数据结构正确，防止编辑中走形。
 *  · melody / variation / bass 拍数总和必须等于 bars * beatsPerBar；
 *  · chords 长度必须等于 bars，且每个符号在 CHORD_TONES 中；
 *  · drums 各轨与 arpPattern 长度必须等于 beatsPerBar*2，且每项为 0 或 1；
 *  · 所有出现的音名必须在 NOTE_FREQ 中。
 */
export function validateTracks() {
  const issues = [];
  for (const key of Object.keys(TRACKS)) {
    const t = TRACKS[key];
    const expect = t.bars * t.beatsPerBar;
    const stepsPerBar = t.beatsPerBar * 2;

    for (const voice of ['melody', 'variation', 'bass']) {
      const list = t[voice];
      if (!Array.isArray(list)) continue; // variation 可选
      const sum = list.reduce((a, e) => a + e.d, 0);
      if (Math.abs(sum - expect) > 1e-9) {
        issues.push(`${t.id}.${voice} 拍数 ${sum} ≠ ${expect}`);
      }
      for (const e of list) {
        if (e.n !== null && !NOTE_FREQ[e.n]) issues.push(`${t.id}.${voice} 未知音名 ${e.n}`);
        if (!(e.d > 0)) issues.push(`${t.id}.${voice} 非法时值 ${e.d}`);
      }
    }

    if (!Array.isArray(t.chords) || t.chords.length !== t.bars) {
      issues.push(`${t.id}.chords 长度 ${t.chords && t.chords.length} ≠ bars(${t.bars})`);
    } else {
      for (const s of t.chords) {
        if (!CHORD_TONES[s]) issues.push(`${t.id}.chords 未知和弦 ${s}`);
      }
    }

    const dp = t.drums || {};
    for (const k of ['kick', 'snare', 'hat']) {
      const arr = dp[k];
      if (!Array.isArray(arr) || arr.length !== stepsPerBar) {
        issues.push(`${t.id}.drums.${k} 长度 ${arr && arr.length} ≠ ${stepsPerBar}`);
      } else if (!arr.every((v) => v === 0 || v === 1)) {
        issues.push(`${t.id}.drums.${k} 含非法值（仅允许 0/1）`);
      }
    }
    if (t.arpOn) {
      const ap = t.arpPattern;
      if (!Array.isArray(ap) || ap.length !== stepsPerBar || !ap.every((v) => v === 0 || v === 1)) {
        issues.push(`${t.id}.arpPattern 必须是长度 ${stepsPerBar} 的 0/1 数组`);
      }
    }
  }
  return { ok: issues.length === 0, issues };
}
