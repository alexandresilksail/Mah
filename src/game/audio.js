/**
 * 全部音效由 Web Audio API 实时合成，工程内不含任何音频文件。
 *
 * v2.2.0 混音改造 —— 解决「点击鼠标的声音与背景音乐相互干扰」：
 *  1) 共用 AudioContext：复用 Music 的唯一 ctx，并把输出接到 music.sfxBus，
 *     与 BGM 共用同一个总线压缩器，不再有两路独立输出叠加、无法统一限幅。
 *  2) 频段避让：音效总线串 1000Hz 高通，音源频率整体上移到 1.0–4.2kHz，
 *     把 523–1047Hz 的中频让给 BGM 主旋律，消除频谱掩蔽（旧版 pick/match/click
 *     全落在这段，等于和主旋律同时唱）。
 *  3) 自动闪避：每次音效触发请求 BGM 短暂让路（music.duck），点击声清晰、
 *     音乐不中断；幅度小（0.10–0.30）、恢复快，听感自然。
 *  4) 更短更轻：所有音效的时长与音量下调，不再「叮叮当当」盖过音乐。
 */
import { getMusic } from './music.js';

/** 音效高通截止：把中频留给 BGM 主旋律，音效只保留清脆高频 */
const HP_HZ = 1000;

export class Sound {
  constructor() {
    this.ctx = null;
    this.master = null;      // 音效独立音量
    this.hp = null;          // 频段避让高通
    this.enabled = true;
    this.volume = 1;         // 音效独立音量（0..1），与背景音乐完全解耦
  }

  /** 取得（或复用）AudioContext：优先复用音乐的 ctx 与共享限幅总线 */
  ensure() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      let ctx = null;
      let out = null;
      try {
        const music = getMusic();
        ctx = music && music.getContext ? music.getContext() : null;
        out = music && music.getSfxBus ? music.getSfxBus() : null;
      } catch { /* 音乐不可用时退回独立 ctx */ }
      if (!ctx) {
        const AC = (typeof window !== 'undefined') && (window.AudioContext || window.webkitAudioContext);
        if (!AC) return null;
        try { ctx = new AC(); } catch { return null; }
        out = ctx.destination;
      }
      if (!out) out = ctx.destination;
      try {
        this.ctx = ctx;
        this.master = ctx.createGain();
        this.master.gain.value = this.enabled ? 0.2 * this.volume : 0;
        this.hp = ctx.createBiquadFilter();
        this.hp.type = 'highpass';
        this.hp.frequency.value = HP_HZ;
        this.hp.Q.value = 0.7;
        this.master.connect(this.hp);
        this.hp.connect(out);
      } catch {
        // 极端兜底：滤波器创建失败也要保证音效可用
        try {
          this.master = this.master || ctx.createGain();
          this.master.gain.value = this.enabled ? 0.2 * this.volume : 0;
          this.master.connect(out);
        } catch { this.ctx = null; return null; }
      }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  /** 请求背景音乐短暂让路；音效关闭 / 静音时不触发 */
  _duck(strength) {
    if (!this.enabled || this.volume <= 0) return;
    try {
      const music = getMusic();
      if (music && music.duck) music.duck(strength);
    } catch { /* 闪避失败不影响游戏 */ }
  }

  /** 音效独立开关 */
  setEnabled(on) {
    this.enabled = on;
    if (this.master) this.master.gain.value = on ? 0.2 * this.volume : 0;
  }

  /** 音效独立音量（0..1） */
  setVolume(v) {
    const x = Number(v);
    if (!Number.isFinite(x)) return;
    this.volume = Math.max(0, Math.min(1, x));
    if (this.master) this.master.gain.value = this.enabled ? 0.2 * this.volume : 0;
  }

  tone({ freq = 440, to = null, dur = 0.1, type = 'sine', vol = 0.5, delay = 0, attack = 0.006 }) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (to && to !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noise({ dur = 0.2, vol = 0.25, from = 900, to = 300, delay = 0 }) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(from, t0);
    bp.frequency.exponentialRampToValueAtTime(Math.max(80, to), t0 + dur);
    bp.Q.value = 1.6;
    const g = ctx.createGain();
    g.gain.value = vol;
    src.connect(bp);
    bp.connect(g);
    g.connect(this.master);
    src.start(t0);
  }

  click() {
    this._duck(0.10);
    this.tone({ freq: 1650, to: 1250, dur: 0.035, type: 'triangle', vol: 0.10 });
  }

  pick() {
    this._duck(0.12);
    this.tone({ freq: 1500, to: 2050, dur: 0.05, type: 'triangle', vol: 0.16 });
    this.tone({ freq: 2700, dur: 0.035, type: 'sine', vol: 0.05, delay: 0.02 });
  }

  match() {
    this._duck(0.26);
    [1760, 2093, 2637].forEach((f, i) => {
      this.tone({ freq: f, dur: 0.10, type: 'triangle', vol: 0.14, delay: i * 0.035 });
    });
  }

  deny() {
    this._duck(0.12);
    this.noise({ dur: 0.07, vol: 0.09, from: 2600, to: 1500 });
  }

  undo() {
    this._duck(0.14);
    this.tone({ freq: 1800, to: 1100, dur: 0.07, type: 'sine', vol: 0.14 });
  }

  shuffle() {
    this._duck(0.22);
    this.noise({ dur: 0.20, vol: 0.10, from: 3200, to: 1600 });
  }

  revive() {
    this._duck(0.28);
    [1568, 2093, 2637, 3136].forEach((f, i) => {
      this.tone({ freq: f, dur: 0.14, type: 'sine', vol: 0.14, delay: i * 0.045 });
    });
  }

  win() {
    this._duck(0.30);
    [2093, 2637, 3136, 3520, 4186].forEach((f, i) => {
      this.tone({ freq: f, dur: 0.17, type: 'triangle', vol: 0.15, delay: i * 0.055 });
    });
  }

  lose() {
    this._duck(0.22);
    [1568, 1318, 1174, 1046].forEach((f, i) => {
      this.tone({ freq: f, dur: 0.13, type: 'sawtooth', vol: 0.09, delay: i * 0.06 });
    });
  }
}
