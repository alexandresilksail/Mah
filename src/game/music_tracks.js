/**
 * v2.0.2 —— 原创背景音乐曲目数据（纯数据，零 DOM / 零音频文件）。
 *
 * 版权边界：全部旋律 / 和声 / 节奏 / 配器为本项目原创编写，
 * 不复制《羊了个羊》原版音乐或任何受版权保护的音乐，
 * 工程内不含任何 .mp3/.wav/.ogg 音频素材 —— 一切声音由 Web Audio API 实时合成。
 *
 * 风格要求（需求 3 升级版）：
 *  · 标题 / 大厅：舒缓问候，大调（C-Am-F-G），轻鼓点 + 流动琶音 + 钢琴主旋律。
 *  · 第一关：明亮欢快，大调（C-G-Am-F），跳跃贝斯 + 明亮琶音 + 钢琴主旋律。
 *  · 第二关：紧张推进，小调（Am-F-C-G），八分驱动贝斯 + 重鼓点 + 阴郁和声铺底。
 *
 * 记谱模型（让音乐"连贯"而非零散单音）：
 *  · chords：每小节一个和弦符号，引擎据此实时生成「持续和声铺底（pad）」+
 *            「流动琶音（arp）」——这是让 BGM 连贯、有空间感的核心。
 *  · melody / bass：主旋律与贝斯，长度必须等于 bars * beatsPerBar。
 *  · drums：kick/snare/hat 每个八分位的打击（0/1），长度 = beatsPerBar*2（一小节，循环重复）。
 *  · 各声部独立增益（padGain/arpGain/bassGain/melodyGain/drumGain）用于混音平衡。
 */

/** 十二平均律频率表（A4 = 440Hz），只列曲目用到的音 */
export const NOTE_FREQ = {
  E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760.00,
};

/** 和弦表：符号 → 三个和弦音（用于铺底与琶音） */
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

/** 把一个音名升高/降低一个八度（用于琶音上移八度增加亮度） */
export function shiftOct(n, up) {
  return n.replace(/(\d)$/, (d) => String(Math.max(1, Math.min(7, +d + (up ? 1 : -1)))));
}

export const TRACKS = {
  /* ---------------- 标题 / 大厅：微光序曲（舒缓问候） ---------------- */
  title: {
    id: 'title',
    name: '标题 · 微光序曲',
    bpm: 88,
    bars: 4,
    beatsPerBar: 4,
    chords: ['C', 'Am', 'F', 'G'],
    // 主旋律：温柔问答式，落在大调和弦上
    melody: [
      { n: 'C5', d: 1 }, { n: 'E5', d: 1 }, { n: 'G5', d: 1 }, { n: 'E5', d: 1 },
      { n: 'A5', d: 1 }, { n: 'G5', d: 1 }, { n: 'E5', d: 1 }, { n: 'C5', d: 1 },
      { n: 'F5', d: 1 }, { n: 'A5', d: 1 }, { n: 'C6', d: 1 }, { n: 'A5', d: 1 },
      { n: 'G5', d: 1 }, { n: 'D5', d: 1 }, { n: 'B4', d: 1 }, { n: 'D5', d: 1 },
    ],
    // 贝斯：根音与五度交替，温和推进
    bass: [
      { n: 'C3', d: 2 }, { n: 'G2', d: 2 }, { n: 'A2', d: 2 }, { n: 'E2', d: 2 },
      { n: 'F2', d: 2 }, { n: 'C3', d: 2 }, { n: 'G2', d: 2 }, { n: 'D3', d: 2 },
    ],
    drums: {
      kick:  [1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 0, 0],
      hat:   [1, 0, 1, 0, 1, 0, 1, 0],
    },
    arpOn: true, arpStyle: 'up',
    padGain: 0.16, arpGain: 0.10, bassGain: 0.30, melodyGain: 0.30, drumGain: 0.80,
  },

  /* ---------------- 第一关：晨光木琴（明亮欢快） ---------------- */
  1: {
    id: 'L1',
    name: '第一关 · 晨光木琴',
    bpm: 104,
    bars: 4,
    beatsPerBar: 4,
    chords: ['C', 'G', 'Am', 'F'],
    // 主旋律：大调跳跃，I-V-vi-IV 进行上欢快跑动
    melody: [
      { n: 'C5', d: 1 }, { n: 'D5', d: 1 }, { n: 'E5', d: 1 }, { n: 'G5', d: 1 },
      { n: 'G5', d: 1 }, { n: 'A5', d: 1 }, { n: 'G5', d: 1 }, { n: 'E5', d: 1 },
      { n: 'A5', d: 1 }, { n: 'C6', d: 1 }, { n: 'A5', d: 1 }, { n: 'G5', d: 1 },
      { n: 'F5', d: 1 }, { n: 'E5', d: 1 }, { n: 'D5', d: 1 }, { n: 'C5', d: 1 },
    ],
    // 贝斯：根-五度八分跳音，活泼
    bass: [
      { n: 'C3', d: 1 }, { n: 'G2', d: 1 }, { n: 'C3', d: 1 }, { n: 'G2', d: 1 },
      { n: 'G2', d: 1 }, { n: 'D3', d: 1 }, { n: 'G2', d: 1 }, { n: 'D3', d: 1 },
      { n: 'A2', d: 1 }, { n: 'E2', d: 1 }, { n: 'A2', d: 1 }, { n: 'E2', d: 1 },
      { n: 'F2', d: 1 }, { n: 'C3', d: 1 }, { n: 'F2', d: 1 }, { n: 'C3', d: 1 },
    ],
    drums: {
      kick:  [1, 0, 0, 0, 1, 0, 1, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hat:   [1, 1, 1, 1, 1, 1, 1, 1],
    },
    arpOn: true, arpStyle: 'updown',
    padGain: 0.18, arpGain: 0.12, bassGain: 0.30, melodyGain: 0.32, drumGain: 0.85,
  },

  /* ---------------- 第二关：低音脉冲（紧张推进 / 小调） ---------------- */
  2: {
    id: 'L2',
    name: '第二关 · 低音脉冲',
    bpm: 132,
    bars: 4,
    beatsPerBar: 4,
    chords: ['Am', 'F', 'C', 'G'],
    // 主旋律：小调上行 + 悬留，制造紧张感
    melody: [
      { n: 'A4', d: 1 }, { n: 'C5', d: 1 }, { n: 'E5', d: 1 }, { n: 'C5', d: 1 },
      { n: 'F5', d: 1 }, { n: 'A5', d: 1 }, { n: 'C6', d: 1 }, { n: 'A5', d: 1 },
      { n: 'C5', d: 1 }, { n: 'E5', d: 1 }, { n: 'G5', d: 1 }, { n: 'E5', d: 1 },
      { n: 'G5', d: 1 }, { n: 'B4', d: 1 }, { n: 'D5', d: 1 }, { n: 'B4', d: 1 },
    ],
    // 贝斯：八分驱动脉冲，严格跟随和弦进行 [Am,F,C,G] 的根音+五度（每小节 8 个半拍）
    bass: [
      { n: 'A2', d: 0.5 }, { n: 'A2', d: 0.5 }, { n: 'A2', d: 0.5 }, { n: 'A2', d: 0.5 },
      { n: 'E2', d: 0.5 }, { n: 'E2', d: 0.5 }, { n: 'E2', d: 0.5 }, { n: 'E2', d: 0.5 },
      { n: 'F2', d: 0.5 }, { n: 'F2', d: 0.5 }, { n: 'F2', d: 0.5 }, { n: 'F2', d: 0.5 },
      { n: 'C3', d: 0.5 }, { n: 'C3', d: 0.5 }, { n: 'C3', d: 0.5 }, { n: 'C3', d: 0.5 },
      { n: 'C3', d: 0.5 }, { n: 'C3', d: 0.5 }, { n: 'C3', d: 0.5 }, { n: 'C3', d: 0.5 },
      { n: 'G2', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'G2', d: 0.5 },
      { n: 'G2', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'G2', d: 0.5 },
      { n: 'D3', d: 0.5 }, { n: 'D3', d: 0.5 }, { n: 'D3', d: 0.5 }, { n: 'D3', d: 0.5 },
    ],
    drums: {
      kick:  [1, 0, 1, 0, 1, 0, 1, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hat:   [1, 1, 1, 1, 1, 1, 1, 1],
    },
    arpOn: true, arpStyle: 'up',
    padGain: 0.20, arpGain: 0.10, bassGain: 0.34, melodyGain: 0.30, drumGain: 0.90,
  },
};

/**
 * 自检：保证曲目数据结构正确，防止编辑中走形。
 *  · melody / bass 拍数总和必须等于 bars * beatsPerBar；
 *  · chords 长度必须等于 bars，且每个符号在 CHORD_TONES 中；
 *  · drums 各轨长度必须等于 beatsPerBar*2，且每项为 0 或 1；
 *  · 所有出现的音名必须在 NOTE_FREQ 中。
 */
export function validateTracks() {
  const issues = [];
  for (const key of Object.keys(TRACKS)) {
    const t = TRACKS[key];
    const expect = t.bars * t.beatsPerBar;
    const stepsPerBar = t.beatsPerBar * 2;

    for (const voice of ['melody', 'bass']) {
      const list = t[voice] || [];
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
  }
  return { ok: issues.length === 0, issues };
}
