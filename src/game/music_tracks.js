/**
 * v2.0.1 —— 原创背景音乐曲目数据（纯数据，零 DOM / 零音频文件）。
 *
 * 版权边界：全部旋律 / 节奏 / 配器为本项目原创编写，
 * 不复制《羊了个羊》原版音乐或任何受版权保护的音乐，
 * 工程内不含任何 .mp3/.wav/.ogg 音频素材 —— 一切声音由 Web Audio API 实时合成。
 *
 * 风格要求（需求 3）：
 *  · 第一关：轻松、明亮，木琴 / 钟琴 / 钢琴音色（大调五声）；
 *  · 第二关：稍快节奏、低音脉冲、适度紧张感（小调色彩 + 八分低音）。
 *
 * 记谱格式：每条声部是 [{ n: 音名|null, d: 拍数 }] 的序列，
 * 一个循环的总拍数 = bars * beatsPerBar；n 为 null 表示休止。
 * 声部：melody（主旋律）/ counter（副旋律，钟琴点缀）/ bass（低音）。
 */

/** 十二平均律频率表（A4 = 440Hz），只列曲目用到的音 */
export const NOTE_FREQ = {
  E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760.00,
};

/** 声部音色：xylo 木琴 / glocken 钟琴 / piano 钢琴 / bassPulse 低音脉冲 */
export const TIMBRES = ['xylo', 'glocken', 'piano', 'bassPulse'];

export const TRACKS = {
  /* ---------------- 标题 / 大厅：轻快问候（第一关主题的引子变奏） ---------------- */
  title: {
    id: 'title',
    name: '标题 · 微光序曲',
    bpm: 92,
    bars: 2,
    beatsPerBar: 4,
    melody: [
      { n: 'E5', d: 1 }, { n: 'G5', d: 1 }, { n: 'A5', d: 1 }, { n: 'G5', d: 1 },
      { n: 'E5', d: 1 }, { n: 'D5', d: 1 }, { n: 'C5', d: 2 },
    ],
    counter: [
      { n: null, d: 2 }, { n: 'C6', d: 1 }, { n: 'D6', d: 1 },
      { n: null, d: 2 }, { n: 'G6', d: 1 }, { n: 'E6', d: 1 },
    ],
    bass: [
      { n: 'C3', d: 2 }, { n: 'G2', d: 2 }, { n: 'A2', d: 2 }, { n: 'G2', d: 2 },
    ],
    timbre: { melody: 'xylo', counter: 'glocken', bass: 'piano' },
    gain: { melody: 0.42, counter: 0.20, bass: 0.30 },
  },

  /* ---------------- 第一关：晨光木琴（轻松 / 明亮 / 大调五声） ---------------- */
  1: {
    id: 'L1',
    name: '第一关 · 晨光木琴',
    bpm: 96,
    bars: 4,
    beatsPerBar: 4,
    // 主旋律：大调五声（C D E G A），问答式 4 小节
    melody: [
      { n: 'C5', d: 1 }, { n: 'E5', d: 1 }, { n: 'G5', d: 1 }, { n: 'E5', d: 1 },
      { n: 'D5', d: 1 }, { n: 'G5', d: 0.5 }, { n: 'A5', d: 0.5 }, { n: 'G5', d: 1 }, { n: 'E5', d: 1 },
      { n: 'C5', d: 1 }, { n: 'D5', d: 1 }, { n: 'E5', d: 2 },
      { n: 'G5', d: 1 }, { n: 'E5', d: 1 }, { n: 'D5', d: 1 }, { n: 'C5', d: 1 },
    ],
    // 钟琴点缀：在主旋律长音处轻声应答
    counter: [
      { n: null, d: 1 }, { n: 'G6', d: 0.5 }, { n: 'A6', d: 0.5 }, { n: null, d: 1 }, { n: 'E6', d: 1 },
      { n: null, d: 2 }, { n: 'C6', d: 1 }, { n: 'D6', d: 1 },
      { n: null, d: 1 }, { n: 'E6', d: 1 }, { n: null, d: 2 },
      { n: null, d: 2 }, { n: 'G6', d: 1 }, { n: 'C6', d: 1 },
    ],
    // 钢琴低音：和声级进（I - V - vi - iii - IV - I - V）
    bass: [
      { n: 'C3', d: 2 }, { n: 'G2', d: 2 }, { n: 'A2', d: 2 }, { n: 'E2', d: 2 },
      { n: 'F2', d: 2 }, { n: 'C3', d: 2 }, { n: 'G2', d: 4 },
    ],
    timbre: { melody: 'xylo', counter: 'glocken', bass: 'piano' },
    gain: { melody: 0.46, counter: 0.18, bass: 0.30 },
  },

  /* ---------------- 第二关：低音脉冲（稍快 / 小调张力 / 八分低音） ---------------- */
  2: {
    id: 'L2',
    name: '第二关 · 低音脉冲',
    bpm: 128,
    bars: 4,
    beatsPerBar: 4,
    // 主旋律：小调上行+悬留，制造适度紧张感
    melody: [
      { n: 'A4', d: 0.5 }, { n: 'C5', d: 0.5 }, { n: 'E5', d: 1 }, { n: 'D5', d: 1 }, { n: 'C5', d: 1 },
      { n: 'B4', d: 0.5 }, { n: 'A4', d: 0.5 }, { n: 'B4', d: 1 }, { n: 'C5', d: 2 },
      { n: 'E5', d: 1 }, { n: 'D5', d: 1 }, { n: 'C5', d: 0.5 }, { n: 'B4', d: 0.5 }, { n: 'A4', d: 1 },
      { n: 'G4', d: 1 }, { n: 'A4', d: 1 }, { n: null, d: 2 },
    ],
    // 钟琴：稀疏的高音刺点
    counter: [
      { n: null, d: 2 }, { n: 'E6', d: 0.5 }, { n: null, d: 1.5 },
      { n: 'D6', d: 1 }, { n: null, d: 3 },
      { n: null, d: 2 }, { n: 'G6', d: 0.5 }, { n: null, d: 1.5 },
      { n: 'E6', d: 1 }, { n: null, d: 3 },
    ],
    // 低音脉冲：整段八分音符（每小节 8 个半拍），驱动感
    bass: [
      { n: 'A2', d: 0.5 }, { n: 'A2', d: 0.5 }, { n: 'A2', d: 0.5 }, { n: 'A2', d: 0.5 },
      { n: 'A2', d: 0.5 }, { n: 'A2', d: 0.5 }, { n: 'E2', d: 0.5 }, { n: 'E2', d: 0.5 },
      { n: 'E2', d: 0.5 }, { n: 'E2', d: 0.5 }, { n: 'E2', d: 0.5 }, { n: 'E2', d: 0.5 },
      { n: 'E2', d: 0.5 }, { n: 'E2', d: 0.5 }, { n: 'E2', d: 0.5 }, { n: 'E2', d: 0.5 },
      { n: 'F2', d: 0.5 }, { n: 'F2', d: 0.5 }, { n: 'F2', d: 0.5 }, { n: 'F2', d: 0.5 },
      { n: 'F2', d: 0.5 }, { n: 'F2', d: 0.5 }, { n: 'F2', d: 0.5 }, { n: 'F2', d: 0.5 },
      { n: 'G2', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'G2', d: 0.5 }, { n: 'G2', d: 0.5 },
      { n: 'E2', d: 0.5 }, { n: 'E2', d: 0.5 }, { n: 'E2', d: 0.5 }, { n: 'E2', d: 0.5 },
    ],
    timbre: { melody: 'xylo', counter: 'glocken', bass: 'bassPulse' },
    gain: { melody: 0.34, counter: 0.14, bass: 0.42 },
  },
};

/**
 * 自检：每条声部的拍数总和必须等于 bars * beatsPerBar。
 * 供 test.js 断言调用，防止曲目数据在编辑中走形。
 */
export function validateTracks() {
  const issues = [];
  for (const key of Object.keys(TRACKS)) {
    const t = TRACKS[key];
    const expect = t.bars * t.beatsPerBar;
    for (const voice of ['melody', 'counter', 'bass']) {
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
    for (const v of Object.values(t.timbre)) {
      if (!TIMBRES.includes(v)) issues.push(`${t.id} 未知音色 ${v}`);
    }
  }
  return { ok: issues.length === 0, issues };
}
