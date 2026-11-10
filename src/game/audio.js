/**
 * 最终生产版（2026-11-10）：**只保留音效，不提供背景音乐**。
 *
 * 全部音效由 Web Audio API 实时合成，工程内不含任何音频文件。
 * 音乐引擎（music.js / music_tracks.js / music_composer.js）已从生产源码中整体移除，
 * 网页版与桌面版都不会加载、创建或播放任何 BGM。
 *
 * 音频链路（自建、完全独立）：
 *   Sound.master → 1600Hz 高通 → ctx.destination
 *  · 首次用户手势（pointerdown / keydown）时才 new AudioContext()，遵守自动播放策略；
 *  · 音效是极短极轻的高频反馈（1.8–4.2kHz / 0.10 电平 / 20–110ms），
 *    不再需要与任何背景音乐做频段或响度避让；
 *  · 独立开关 setEnabled() / 独立音量 setVolume()，设置写入存档。
 *
 * 全链路 try/catch 兜底：AudioContext 不可用只是无声，绝不影响游戏。
 */

/** 音效高通截止：只保留清脆高频，做成轻巧的点击反馈 */
const HP_HZ = 1600;

/** 音效总线上限（轻量反馈，不刺耳） */
const SFX_LEVEL = 0.10;

export class Sound {
  constructor() {
    this.ctx = null;
    this.master = null;      // 音效独立音量
    this.hp = null;          // 频段避让高通
    this.enabled = true;
    this.volume = 1;         // 音效独立音量（0..1），与背景音乐完全解耦
  }

  /** 首次用户手势时自建唯一 AudioContext：master → 高通 → destination */
  ensure() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AC = (typeof window !== 'undefined') && (window.AudioContext || window.webkitAudioContext);
      if (!AC) return null;
      let ctx = null;
      try { ctx = new AC(); } catch { return null; }
      try {
        this.ctx = ctx;
        this.master = ctx.createGain();
        this.master.gain.value = this.enabled ? SFX_LEVEL * this.volume : 0;
        this.hp = ctx.createBiquadFilter();
        this.hp.type = 'highpass';
        this.hp.frequency.value = HP_HZ;
        this.hp.Q.value = 0.7;
        this.master.connect(this.hp);
        this.hp.connect(ctx.destination);
      } catch {
        // 极端兜底：滤波器创建失败也要保证音效可用
        try {
          this.master = this.master || ctx.createGain();
          this.master.gain.value = this.enabled ? SFX_LEVEL * this.volume : 0;
          this.master.connect(ctx.destination);
        } catch { this.ctx = null; return null; }
      }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  /** 音效独立开关 */
  setEnabled(on) {
    this.enabled = on;
    if (this.master) this.master.gain.value = on ? SFX_LEVEL * this.volume : 0;
  }

  /** 音效独立音量（0..1） */
  setVolume(v) {
    const x = Number(v);
    if (!Number.isFinite(x)) return;
    this.volume = Math.max(0, Math.min(1, x));
    if (this.master) this.master.gain.value = this.enabled ? SFX_LEVEL * this.volume : 0;
  }

  tone({ freq = 440, to = null, dur = 0.1, type = 'sine', vol = 0.5, delay = 0, attack = 0.004 }) {
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

  /* ---- 以下全部是轻量反馈音：极短、极轻、高频 ---- */

  click() {
    this.tone({ freq: 2100, to: 1750, dur: 0.022, type: 'triangle', vol: 0.07 });
  }

  pick() {
    this.tone({ freq: 1900, to: 2400, dur: 0.030, type: 'triangle', vol: 0.11 });
    this.tone({ freq: 3100, dur: 0.020, type: 'sine', vol: 0.035, delay: 0.012 });
  }

  match() {
    [2200, 2640, 3136].forEach((f, i) => {
      this.tone({ freq: f, dur: 0.055, type: 'triangle', vol: 0.10, delay: i * 0.022 });
    });
  }

  deny() {
    this.noise({ dur: 0.045, vol: 0.06, from: 3000, to: 1900 });
  }

  undo() {
    this.tone({ freq: 2200, to: 1500, dur: 0.042, type: 'sine', vol: 0.10 });
  }

  shuffle() {
    this.noise({ dur: 0.11, vol: 0.07, from: 3600, to: 2100 });
  }

  revive() {
    [1960, 2640, 3136, 3800].forEach((f, i) => {
      this.tone({ freq: f, dur: 0.085, type: 'sine', vol: 0.10, delay: i * 0.032 });
    });
  }

  win() {
    [2640, 3136, 3520, 3900, 4200].forEach((f, i) => {
      this.tone({ freq: f, dur: 0.10, type: 'triangle', vol: 0.10, delay: i * 0.038 });
    });
  }

  lose() {
    [1960, 1760, 1568, 1400].forEach((f, i) => {
      this.tone({ freq: f, dur: 0.075, type: 'sine', vol: 0.07, delay: i * 0.040 });
    });
  }
}
