/**
 * v2.0.2 —— 原创背景音乐引擎（Web Audio API 实时合成）。
 *
 * 目标：听起来像「真正的游戏背景音乐」，而非零散的单音振荡器。
 * 做法（让音乐连贯、有空间感、有驱动感）：
 *  · 持续和声铺底（pad）：每个和弦用多把失谐锯齿波 + 低通 + 慢起音长释放，
 *    形成连贯的谐波床，音符之间不再断裂。
 *  · 流动琶音（arp）：和弦音上移八度，按八分位循环跑动，带延迟回声。
 *  · 驱动鼓组（drums）：kick（正弦频降）、snare（噪声+体）、hat（高通噪声），
 *    给出稳定节拍与推进力。
 *  · 主旋律 / 贝斯：ADSR 包络带重叠释放，相邻音符平滑衔接（连奏感）。
 *  · 空间与粘合：旋律/琶音送延迟回声；master 经压缩器限幅防削波。
 *
 * 需求 3 硬约束（全部落实）：
 *  · 背景音乐独立开关 / 独立音量（与音效 Sound 完全解耦）；
 *  · 第一关 / 第二关 / 标题独立音乐主题；
 *  · 关卡切换淡入淡出（gain 自动化交叉淡变）；
 *  · 无限循环、暂停 / 恢复、切后台 / 回前台（visibilitychange）；
 *  · 音乐设置持久化由 store + main.js persist() 负责（含旧存档兼容）；
 *  · 单例：全局只允许一个 Music 实例 / 一个 AudioContext；
 *  · 任何播放失败都吞掉（try/catch），绝不让游戏崩溃；
 *  · 遵守浏览器自动播放策略：new AudioContext 与起播都发生在用户首次交互后。
 *
 * 版权：旋律 / 和声 / 节奏 / 配器全部原创（music_tracks.js），无任何第三方音频素材。
 */
import { TRACKS, NOTE_FREQ, CHORD_TONES, shiftOct } from './music_tracks.js';

/** 音名 → 频率；未知音名回退 440 */
function freqOf(n) {
  return NOTE_FREQ[n] || 440;
}

export class Music {
  constructor() {
    if (Music._created) {
      throw new Error('Music 是单例：禁止重复创建背景音乐实例，请使用 getMusic()');
    }
    Music._created = true;

    this.ctx = null;
    this.master = null;
    this.trackGain = null;     // 关卡切换淡入淡出用
    this.musicBus = null;      // 干声汇总总线
    this.delay = null;         // 延迟回声（空间感）
    this.feedback = null;
    this.delayWet = null;
    this.comp = null;          // 总线压缩（粘合 + 防削波）
    this.noiseBuffer = null;   // 打击乐用的噪声样本

    this.bgmOn = true;
    this.bgmVol = 0.6;
    this.drumGain = 0.85;
    this.playing = false;       // 用户意图：应当出声
    this.unlocked = false;      // 是否已过「首次交互」门槛
    this.trackKey = 'title';
    this.step = 0;
    this.nextTime = 0;
    this.timer = null;
    this.swapAt = -1;           // 淡变中途换谱的时刻
    this.pendingKey = null;
    this.steps = [];            // 当前曲目的分步事件
    this.totalSteps = 0;
    this.stepDur = 0.25;
    this._buildSteps('title');
    this._bindVisibility();
  }

  /* ---------------- 内部：事件展开 / 调度 ---------------- */

  _arpIndex(local, len, style) {
    if (style === 'updown' && len > 1) {
      const period = 2 * (len - 1);
      let i = local % period;
      if (i >= len) i = period - i;
      return i;
    }
    return local % len;
  }

  _buildSteps(key) {
    const t = TRACKS[key] || TRACKS.title;
    const beatSec = 60 / t.bpm;
    const stepDur = beatSec / 2; // 八分音符栅格
    const stepsPerBar = t.beatsPerBar * 2;
    const totalSteps = t.bars * stepsPerBar;
    const steps = [];
    for (let i = 0; i < totalSteps; i++) steps.push([]);

    const padChords = (t.chords || []).map((s) => CHORD_TONES[s] || ['C4', 'E4', 'G4']);

    // 主旋律 / 贝斯：序列映射到八分栅格（与之前一致）
    for (const [voice, kind, gkey] of [['melody', 'mel', 'melodyGain'], ['bass', 'bass', 'bassGain']]) {
      let step = 0;
      const list = t[voice] || [];
      const g = (t[gkey]) || 0.3;
      for (const e of list) {
        const nSteps = Math.max(1, Math.round(e.d * 2));
        if (e.n) {
          steps[step].push({
            kind,
            freq: freqOf(e.n),
            dur: Math.max(0.12, e.d * beatSec),
            gain: g,
          });
        }
        step += nSteps;
      }
    }

    // 持续和声铺底：每小节起始放一个和弦 pad，延续整小节
    for (let bar = 0; bar < t.bars; bar++) {
      const s = bar * stepsPerBar;
      steps[s].push({
        kind: 'pad',
        chord: padChords[bar],
        dur: stepsPerBar * stepDur * 0.98,
        gain: (t.padGain) || 0.18,
      });
    }

    // 流动琶音：每个八分位跑一个上移八度的和弦音
    if (t.arpOn) {
      for (let s = 0; s < totalSteps; s++) {
        const bar = Math.floor(s / stepsPerBar);
        const local = s % stepsPerBar;
        const pool = (padChords[bar] || ['C4', 'E4', 'G4']).map((n) => shiftOct(n, true));
        const note = pool[this._arpIndex(local, pool.length, t.arpStyle)];
        steps[s].push({ kind: 'arp', freq: freqOf(note), dur: stepDur * 0.92, gain: (t.arpGain) || 0.12 });
      }
    }

    // 鼓组：每个八分位按 pattern 触发
    const dp = t.drums || {};
    const kp = dp.kick || [];
    const sp = dp.snare || [];
    const hp = dp.hat || [];
    for (let s = 0; s < totalSteps; s++) {
      const local = s % stepsPerBar;
      if (kp[local]) steps[s].push({ kind: 'kick' });
      if (sp[local]) steps[s].push({ kind: 'snare' });
      if (hp[local]) steps[s].push({ kind: 'hat' });
    }

    this.steps = steps;
    this.totalSteps = totalSteps;
    this.stepDur = stepDur;
  }

  _bindVisibility() {
    if (typeof document === 'undefined' || !document.addEventListener) return;
    try {
      document.addEventListener('visibilitychange', () => {
        try {
          if (document.hidden) {
            if (this.ctx && this.ctx.state === 'running') {
              this._suspendedByVisibility = this.playing;
              this.ctx.suspend().catch(() => {});
            }
          } else if (this.ctx && this._suspendedByVisibility) {
            this._suspendedByVisibility = false;
            this.ctx.resume().catch(() => {});
          }
        } catch { /* 音乐失败不影响游戏 */ }
      });
    } catch { /* ignore */ }
  }

  /** 确保 AudioContext 与整条信号链存在（只在用户交互后调用） */
  _ensureCtx() {
    if (this.ctx) return this.ctx;
    const AC = (typeof window !== 'undefined') && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return null;
    try {
      const ctx = new AC();
      this.ctx = ctx;

      // 主音量 → 压缩器 → 输出
      this.master = ctx.createGain();
      this.master.gain.value = this.bgmVol;
      this.comp = ctx.createDynamicsCompressor();
      this.comp.threshold.value = -12;
      this.comp.ratio.value = 4;
      this.comp.attack.value = 0.004;
      this.comp.release.value = 0.25;
      this.master.connect(this.comp);
      this.comp.connect(ctx.destination);

      // 关卡切换淡入淡出（per-track crossfade）
      this.trackGain = ctx.createGain();
      this.trackGain.gain.value = 1;
      this.trackGain.connect(this.master);

      // 干声汇总总线
      this.musicBus = ctx.createGain();
      this.musicBus.gain.value = 1;
      this.musicBus.connect(this.trackGain);

      // 延迟回声（空间感）：旋律 / 琶音送进来
      this.delay = ctx.createDelay(1.0);
      this.delay.delayTime.value = 0.26;
      this.feedback = ctx.createGain();
      this.feedback.gain.value = 0.33;
      this.delayWet = ctx.createGain();
      this.delayWet.gain.value = 0.26;
      this.delay.connect(this.feedback);
      this.feedback.connect(this.delay);
      this.delay.connect(this.delayWet);
      this.delayWet.connect(this.trackGain);

      // 打击乐噪声样本
      const len = Math.floor(ctx.sampleRate * 0.5);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buf;
    } catch {
      this.ctx = null;
      return null;
    }
    return this.ctx;
  }

  /** 一个声部输出总线（gain=1，旁路混音；可选送延迟） */
  _voiceOut(send) {
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.value = 1; // 旁路：各声部独立音量包络在自身 eg 上，避免整条总线被清零
    out.connect(this.musicBus);
    if (send && this.delay) out.connect(this.delay);
    return out;
  }

  /* ---------------- 合成：各声部 ---------------- */

  /** 主旋律：三角波 + 八度正弦，ADSR 带释放重叠（连奏感），送延迟 */
  _playMelody(freq, when, dur, gain) {
    const ctx = this.ctx;
    if (!ctx) return;
    try {
      const out = this._voiceOut(true);
      const mk = (type, f, g, rel) => {
        const osc = ctx.createOscillator();
        const eg = ctx.createGain();
        osc.type = type;
        osc.frequency.value = f;
        const sus = Math.max(0.14, dur);
        eg.gain.setValueAtTime(0.0001, when);
        eg.gain.exponentialRampToValueAtTime(g, when + 0.012);
        eg.gain.exponentialRampToValueAtTime(Math.max(0.0002, g * 0.5), when + 0.14);
        eg.gain.setValueAtTime(Math.max(0.0002, g * 0.5), when + sus);
        eg.gain.exponentialRampToValueAtTime(0.0001, when + sus + 0.14); // 释放重叠
        osc.connect(eg);
        eg.connect(out);
        osc.start(when);
        osc.stop(when + sus + 0.16);
      };
      mk('triangle', freq, gain, 0.14);
      mk('sine', freq * 2, gain * 0.35, 0.12);
    } catch { /* 单音失败不影响游戏 */ }
  }

  /** 流动琶音：上移八度的明亮拨弦音，带延迟回声 */
  _playArp(freq, when, dur, gain) {
    const ctx = this.ctx;
    if (!ctx) return;
    try {
      const out = this._voiceOut(true);
      const osc = ctx.createOscillator();
      const eg = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const dec = Math.min(0.5, dur);
      eg.gain.setValueAtTime(0.0001, when);
      eg.gain.exponentialRampToValueAtTime(gain, when + 0.006);
      eg.gain.exponentialRampToValueAtTime(0.0001, when + dec);
      osc.connect(eg);
      eg.connect(out);
      osc.start(when);
      osc.stop(when + dec + 0.03);
      // 泛音点缀
      const o2 = ctx.createOscillator();
      const e2 = ctx.createGain();
      o2.type = 'sine';
      o2.frequency.value = freq * 3;
      e2.gain.setValueAtTime(0.0001, when);
      e2.gain.exponentialRampToValueAtTime(gain * 0.25, when + 0.006);
      e2.gain.exponentialRampToValueAtTime(0.0001, when + 0.12);
      o2.connect(e2);
      e2.connect(out);
      o2.start(when);
      o2.stop(when + 0.14);
    } catch { /* 单音失败不影响游戏 */ }
  }

  /** 贝斯：锯齿波 + 低通 + 正弦 sub，短促有冲击 */
  _playBass(freq, when, dur, gain) {
    const ctx = this.ctx;
    if (!ctx) return;
    try {
      const out = this._voiceOut(false);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 520;
      lp.Q.value = 0.8;
      lp.connect(out);
      const sus = Math.max(0.1, dur);
      const env = (osc, f, g, rel) => {
        const eg = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = f;
        eg.gain.setValueAtTime(0.0001, when);
        eg.gain.exponentialRampToValueAtTime(g, when + 0.006);
        eg.gain.exponentialRampToValueAtTime(Math.max(0.0002, g * 0.6), when + 0.1);
        eg.gain.setValueAtTime(Math.max(0.0002, g * 0.6), when + sus);
        eg.gain.exponentialRampToValueAtTime(0.0001, when + sus + rel);
        osc.connect(eg);
        eg.connect(lp);
        osc.start(when);
        osc.stop(when + sus + rel + 0.02);
      };
      env(ctx.createOscillator(), freq, gain, 0.08);
      env(ctx.createOscillator(), freq / 2, gain * 0.6, 0.06); // sub
    } catch { /* 单音失败不影响游戏 */ }
  }

  /** 持续和声铺底：每个和弦音两把失谐锯齿 + 低通 + 慢起音长释放 */
  _playPad(notes, when, dur, gain) {
    const ctx = this.ctx;
    if (!ctx) return;
    try {
      const out = this._voiceOut(false);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1200;
      lp.Q.value = 0.6;
      lp.connect(out);
      const per = gain / (notes.length * 2);
      for (const n of notes) {
        const f = freqOf(n);
        for (const det of [-5, 5]) {
          const osc = ctx.createOscillator();
          const eg = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.value = f;
          osc.detune.value = det;
          eg.gain.setValueAtTime(0.0001, when);
          eg.gain.linearRampToValueAtTime(per, when + 0.4);           // 慢起音
          eg.gain.setValueAtTime(per, when + Math.max(0.4, dur - 0.5));
          eg.gain.linearRampToValueAtTime(0.0001, when + dur);         // 长释放
          osc.connect(eg);
          eg.connect(lp);
          osc.start(when);
          osc.stop(when + dur + 0.05);
        }
      }
    } catch { /* 单音失败不影响游戏 */ }
  }

  /** 底鼓：正弦频率骤降 + 快速衰减 */
  _playKick(when) {
    const ctx = this.ctx;
    if (!ctx) return;
    try {
      const out = this._voiceOut(false);
      const osc = ctx.createOscillator();
      const eg = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, when);
      osc.frequency.exponentialRampToValueAtTime(45, when + 0.1);
      eg.gain.setValueAtTime(0.0001, when);
      eg.gain.exponentialRampToValueAtTime(this.drumGain * 0.9, when + 0.005);
      eg.gain.exponentialRampToValueAtTime(0.0001, when + 0.18);
      osc.connect(eg);
      eg.connect(out);
      osc.start(when);
      osc.stop(when + 0.2);
    } catch { /* 不影响游戏 */ }
  }

  /** 军鼓：高通噪声 + 三角体音 */
  _playSnare(when) {
    const ctx = this.ctx;
    if (!ctx || !this.noiseBuffer) return;
    try {
      const out = this._voiceOut(false);
      const ns = ctx.createBufferSource();
      ns.buffer = this.noiseBuffer;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1800;
      const eg = ctx.createGain();
      eg.gain.setValueAtTime(0.0001, when);
      eg.gain.exponentialRampToValueAtTime(this.drumGain * 0.5, when + 0.005);
      eg.gain.exponentialRampToValueAtTime(0.0001, when + 0.12);
      ns.connect(hp);
      hp.connect(eg);
      eg.connect(out);
      ns.start(when);
      ns.stop(when + 0.14);
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = 180;
      og.gain.setValueAtTime(0.0001, when);
      og.gain.exponentialRampToValueAtTime(this.drumGain * 0.25, when + 0.005);
      og.gain.exponentialRampToValueAtTime(0.0001, when + 0.08);
      o.connect(og);
      og.connect(out);
      o.start(when);
      o.stop(when + 0.1);
    } catch { /* 不影响游戏 */ }
  }

  /** 闭合踩镲：高通短噪声 */
  _playHat(when) {
    const ctx = this.ctx;
    if (!ctx || !this.noiseBuffer) return;
    try {
      const out = this._voiceOut(false);
      const ns = ctx.createBufferSource();
      ns.buffer = this.noiseBuffer;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 8000;
      const eg = ctx.createGain();
      eg.gain.setValueAtTime(0.0001, when);
      eg.gain.exponentialRampToValueAtTime(this.drumGain * 0.22, when + 0.002);
      eg.gain.exponentialRampToValueAtTime(0.0001, when + 0.04);
      ns.connect(hp);
      hp.connect(eg);
      eg.connect(out);
      ns.start(when);
      ns.stop(when + 0.05);
    } catch { /* 不影响游戏 */ }
  }

  _tick() {
    if (!this.ctx || !this.playing) return;
    try {
      const ctx = this.ctx;
      // 淡变中途换谱
      if (this.pendingKey && ctx.currentTime >= this.swapAt) {
        const key = this.pendingKey;
        this.pendingKey = null;
        this._buildSteps(key);
        this.trackKey = key;
        this.step = 0;
      }
      const ahead = 0.6;
      while (this.nextTime < ctx.currentTime + ahead) {
        const evs = this.steps[this.step % this.totalSteps];
        const when = Math.max(this.nextTime, ctx.currentTime + 0.02);
        for (let i = 0; i < evs.length; i++) {
          const e = evs[i];
          if (e.kind === 'mel') this._playMelody(e.freq, when, e.dur, e.gain);
          else if (e.kind === 'bass') this._playBass(e.freq, when, e.dur, e.gain);
          else if (e.kind === 'pad') this._playPad(e.chord, when, e.dur, e.gain);
          else if (e.kind === 'arp') this._playArp(e.freq, when, e.dur, e.gain);
          else if (e.kind === 'kick') this._playKick(when);
          else if (e.kind === 'snare') this._playSnare(when);
          else if (e.kind === 'hat') this._playHat(when);
        }
        this.step = (this.step + 1) % this.totalSteps;
        this.nextTime += this.stepDur;
      }
    } catch { /* 调度失败不影响游戏 */ }
  }

  _startTimer() {
    if (this.timer !== null) return;
    try {
      this.timer = setInterval(() => this._tick(), 150);
    } catch { /* ignore */ }
  }

  _stopTimer() {
    if (this.timer !== null) {
      try { clearInterval(this.timer); } catch { /* ignore */ }
      this.timer = null;
    }
  }

  _fadeTo(v, sec) {
    if (!this.trackGain || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const g = this.trackGain.gain;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(v, now + sec);
    } catch { /* ignore */ }
  }

  /* ---------------- 对外 API（全部容错） ---------------- */

  /** 用户首次交互时调用（自动播放策略合规）；之后才真正出声 */
  unlock() {
    try {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      this.unlocked = true;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      if (this.bgmOn && this.playing) {
        this.nextTime = ctx.currentTime + 0.05;
        this._startTimer();
        this._fadeTo(1, 0.5); // 首次起播淡入
      }
    } catch { /* 音乐失败不影响游戏 */ }
  }

  /** 切换曲目（title / 1 / 2）：淡出 0.35s → 换谱 → 淡入 0.35s */
  setTrack(key) {
    try {
      const k = TRACKS[key] ? key : 'title';
      if (k === this.trackKey && !this.pendingKey) return;
      if (!this.ctx || !this.unlocked) {
        // 还没解锁：只记谱，不出声
        this._buildSteps(k);
        this.trackKey = k;
        this.step = 0;
        return;
      }
      const now = this.ctx.currentTime;
      const g = this.trackGain.gain;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(0.0001, now + 0.35);
      g.setValueAtTime(0.0001, now + 0.35);
      g.linearRampToValueAtTime(1, now + 0.7);
      this.swapAt = now + 0.35;
      this.pendingKey = k;
      if (this.playing && this.bgmOn) {
        this.nextTime = now + 0.4;
        this._startTimer();
      }
    } catch { /* 音乐失败不影响游戏 */ }
  }

  /** 开始 / 继续播放当前曲目 */
  play() {
    try {
      this.playing = true;
      if (!this.unlocked || !this.bgmOn) return;
      const ctx = this._ensureCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      this.nextTime = ctx.currentTime + 0.05;
      this._startTimer();
      this._fadeTo(1, 0.4);
    } catch { /* ignore */ }
  }

  /** 暂停（游戏暂停 / 结算时调用）：淡出并停调度，保留进度 */
  pause() {
    try {
      this.playing = false;
      this._fadeTo(0.0001, 0.3);
      this._stopTimer();
    } catch { /* ignore */ }
  }

  /** 恢复（等价 play，保留 API 语义） */
  resume() {
    this.play();
  }

  /** 背景音乐独立开关 */
  setEnabled(on) {
    try {
      this.bgmOn = !!on;
      if (!this.bgmOn) {
        this._fadeTo(0.0001, 0.25);
        this._stopTimer();
      } else if (this.playing) {
        this.play();
      }
    } catch { /* ignore */ }
  }

  /** 背景音乐独立音量（0..1） */
  setVolume(v) {
    try {
      const x = Number(v);
      if (!Number.isFinite(x)) return;
      this.bgmVol = Math.max(0, Math.min(1, x));
      if (this.master && this.ctx) {
        this.master.gain.setTargetAtTime(this.bgmVol, this.ctx.currentTime, 0.05);
      }
    } catch { /* ignore */ }
  }
}

/** 全局唯一实例入口 */
let _music = null;
export function getMusic() {
  try {
    if (!_music) _music = new Music();
    return _music;
  } catch {
    // 极端兜底：构造失败也不让游戏崩溃
    return {
      unlock() {}, setTrack() {}, play() {}, pause() {}, resume() {},
      setEnabled() {}, setVolume() {}, bgmOn: true, bgmVol: 0.6,
    };
  }
}

/** 测试用：重置单例（仅供 Node 测试，游戏代码不调用） */
export function _resetMusicSingletonForTests() {
  Music._created = false;
  _music = null;
}
