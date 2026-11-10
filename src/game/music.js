/**
 * v2.0.1 —— 原创背景音乐引擎（Web Audio API 实时合成）。
 *
 * 需求 3 硬约束（全部落实）：
 *  · 背景音乐独立开关 / 独立音量（与音效 Sound 完全解耦）；
 *  · 第一关 / 第二关独立音乐主题（曲目数据见 music_tracks.js）；
 *  · 关卡切换淡入淡出（gain 自动化交叉淡变）；
 *  · 无限循环、暂停 / 恢复、切后台 / 回前台（visibilitychange）；
 *  · 音乐设置持久化由 store + main.js persist() 负责（含旧存档兼容）；
 *  · 单例：全局只允许一个 Music 实例 / 一个 AudioContext，重复创建直接 throw；
 *  · 任何播放失败都吞掉（try/catch），绝不让游戏崩溃；
 *  · 遵守浏览器自动播放策略：new AudioContext 与起播都发生在
 *    用户首次交互（unlock()）之后。
 *
 * 版权：全部旋律原创（music_tracks.js），无任何第三方音频素材。
 */
import { TRACKS, NOTE_FREQ, TIMBRES } from './music_tracks.js';

const A4 = 440;
void A4;

/** 极简音名 → 频率（音高差支持 'C4+1' 这类偏移，实际只用 NOTE_FREQ） */
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
    this.trackGain = null;
    this.bgmOn = true;
    this.bgmVol = 0.6;
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

  _buildSteps(key) {
    const t = TRACKS[key] || TRACKS.title;
    const beatSec = 60 / t.bpm;
    const stepDur = beatSec / 2; // 八分音符栅格
    const totalSteps = Math.round(t.bars * t.beatsPerBar * 2);
    const steps = [];
    for (let i = 0; i < totalSteps; i++) steps.push([]);
    for (const voice of ['melody', 'counter', 'bass']) {
      let step = 0;
      const list = t[voice] || [];
      for (const e of list) {
        const nSteps = Math.max(1, Math.round(e.d * 2));
        if (e.n) {
          steps[step].push({
            voice,
            freq: freqOf(e.n),
            dur: Math.max(0.12, e.d * beatSec),
            timbre: t.timbre[voice],
            gain: (t.gain && t.gain[voice]) || 0.3,
          });
        }
        step += nSteps;
      }
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

  /** 确保 AudioContext 存在（只在用户交互后调用） */
  _ensureCtx() {
    if (this.ctx) return this.ctx;
    const AC = (typeof window !== 'undefined') && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return null;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.bgmVol;
      this.master.connect(this.ctx.destination);
      this.trackGain = this.ctx.createGain();
      this.trackGain.gain.value = 1;
      this.trackGain.connect(this.master);
    } catch {
      this.ctx = null;
      return null;
    }
    return this.ctx;
  }

  /** 合成一个音（一次性衰减包络），任何异常都吞掉 */
  _playNote(freq, when, dur, timbre, gain) {
    const ctx = this.ctx;
    if (!ctx) return;
    try {
      const out = ctx.createGain();
      out.gain.value = 1; // 混音总线：纯旁路（各声部独立的音量包络在 eg 上）
      out.connect(this.trackGain);
      const mk = (type, f, g, decay) => {
        const osc = ctx.createOscillator();
        const eg = ctx.createGain();
        osc.type = type;
        osc.frequency.value = f;
        eg.gain.setValueAtTime(0.0001, when);
        eg.gain.exponentialRampToValueAtTime(Math.max(0.0002, g), when + 0.008);
        eg.gain.exponentialRampToValueAtTime(0.0001, when + decay);
        osc.connect(eg);
        eg.connect(out);
        osc.start(when);
        osc.stop(when + decay + 0.03);
      };
      const d = dur;
      if (timbre === 'xylo') {
        mk('sine', freq, gain, Math.min(0.32, d + 0.12));
        mk('triangle', freq * 2, gain * 0.18, Math.min(0.16, d * 0.6));
      } else if (timbre === 'glocken') {
        mk('triangle', freq, gain, Math.min(0.7, d + 0.35));
        mk('sine', freq * 3.5, gain * 0.12, Math.min(0.35, d * 0.5));
      } else if (timbre === 'piano') {
        mk('triangle', freq, gain, Math.min(0.9, d + 0.3));
        mk('sawtooth', freq, gain * 0.12, Math.min(0.5, d + 0.1));
      } else if (timbre === 'bassPulse') {
        mk('square', freq, gain, Math.min(0.24, d + 0.08));
        mk('sine', freq, gain * 0.7, Math.min(0.3, d + 0.1));
      } else {
        mk('sine', freq, gain, Math.min(0.3, d));
      }
    } catch { /* 单音失败不影响游戏 */ }
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
        for (let i = 0; i < evs.length; i++) {
          const e = evs[i];
          this._playNote(e.freq, Math.max(this.nextTime, ctx.currentTime + 0.02), e.dur, e.timbre, e.gain);
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

void TIMBRES;
