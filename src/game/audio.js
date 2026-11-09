/** 全部音效由 Web Audio API 实时合成，工程内不含任何音频文件 */
export class Sound {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
  }

  ensure() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        this.ctx = new AC();
      } catch {
        return null;
      }
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.2;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.master) this.master.gain.value = on ? 0.2 : 0;
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
    this.tone({ freq: 880, to: 660, dur: 0.06, type: 'triangle', vol: 0.25 });
  }

  pick() {
    this.tone({ freq: 520, to: 760, dur: 0.09, type: 'triangle', vol: 0.35 });
    this.tone({ freq: 1040, dur: 0.05, type: 'sine', vol: 0.12, delay: 0.02 });
  }

  match() {
    const notes = [659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      this.tone({ freq: f, dur: 0.16, type: 'triangle', vol: 0.3, delay: i * 0.045 });
    });
  }

  deny() {
    this.tone({ freq: 220, to: 150, dur: 0.14, type: 'sawtooth', vol: 0.18 });
  }

  undo() {
    this.tone({ freq: 620, to: 320, dur: 0.14, type: 'sine', vol: 0.3 });
  }

  shuffle() {
    this.noise({ dur: 0.3, vol: 0.22, from: 1600, to: 320 });
  }

  revive() {
    [392, 523.25, 659.25, 880].forEach((f, i) => {
      this.tone({ freq: f, dur: 0.22, type: 'sine', vol: 0.28, delay: i * 0.07 });
    });
  }

  win() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      this.tone({ freq: f, dur: 0.28, type: 'triangle', vol: 0.3, delay: i * 0.085 });
    });
  }

  lose() {
    [392, 330, 262, 196].forEach((f, i) => {
      this.tone({ freq: f, dur: 0.26, type: 'sawtooth', vol: 0.16, delay: i * 0.1 });
    });
  }
}
