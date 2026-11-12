/**
 * 背景音乐播放器（内置音乐集成版）。
 *
 * 硬约束：
 *  · **只用 HTMLAudioElement**，完全不碰 Sound 的 AudioContext —— 音乐与音效
 *    互不影响，点击音效不会被音乐加载 / 淡入拖住；音量 / 开关 / 静音各自独立；
 *  · 音乐资源内嵌为 data URI（src/game/music_manifest.js），没有文件路径、
 *    没有网络请求、桌面版不依赖 Rust 的音乐命令即可发声；用户后来导入的
 *    曲目仍可叠加（内置曲目不会被替换或删除）；
 *  · **任意时刻最多一个 audio 实例在播**：切场景先停旧曲再起新曲，不做
 *    两槽重叠播放（旧版交叉淡化会让两个实例同时出声，已修掉）；
 *  · 浏览器自动播放限制：首次用户手势前不调用 play()，只记 pendingScene；
 *    unlock() 后自动按当前场景开始播放，之后切场景自动跟随；
 *  · 加载 / 解码 / 播放失败全部有处理：记录 lastError，自动尝试同场景下一首，
 *    整场都失败才静音，不让异常冒泡打断游戏；
 *  · status() 暴露真实播放状态（currentTime / paused / 实例数），供调试面板
 *    与真机播放验证读取，不是「play() 被调用过」的假信号。
 */

export const FADE_MS = 600;
export const MAX_PLAY_RETRY = 3;

function nowMs() {
  return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
}

export class MusicPlayer {
  constructor(opt) {
    var o = opt || {};
    this.enabled = o.enabled !== false;
    this.volume = typeof o.volume === 'number' ? o.volume : 0.6;
    this.fadeMs = o.fadeMs === undefined ? FADE_MS : o.fadeMs;
    this.map = {};
    this.store = o.store || null;
    this.builtinMap = (o.builtin && o.builtin.map) || {};
    this.builtinSrc = (o.builtin && o.builtin.src) || {};
    this.scene = null;
    this.pendingScene = null;
    this.slots = [null, null];
    this.active = 0;
    this.urlCache = {};
    this.lastPick = {};
    this.timer = null;
    this.unlocked = false;
    this.track = '';
    this.trackScene = '';
    this.lastError = '';
    this.playErrors = 0;
    this.switchCount = 0;
    this.startedAt = 0;
    this._targetVol = this.volume * 0.9;
    this._retry = 0;
    this.setMap(o.map || {});
  }

  setStore(store) {
    this.store = store;
  }

  /** 内置曲目 + 用户导入曲目合并；用户 map 只追加，不覆盖、不删除内置资源 */
  setMap(map) {
    this.userMap = map && typeof map === 'object' ? map : {};
    this.map = {};
    var scenes = ['title', 'level1', 'level2', 'win', 'lose', 'graduated'];
    for (var s = 0; s < scenes.length; s++) {
      var key = scenes[s];
      var list = [];
      var builtin = this.builtinMap[key];
      if (Object.prototype.toString.call(builtin) === '[object Array]') {
        for (var i = 0; i < builtin.length; i++) if (builtin[i]) list.push(builtin[i]);
      }
      var user = this.userMap[key];
      if (Object.prototype.toString.call(user) === '[object Array]') {
        for (var j = 0; j < user.length; j++) {
          if (typeof user[j] !== 'string' || !user[j]) continue;
          var seen = false;
          for (var k = 0; k < list.length; k++) if (list[k] === user[j]) seen = true;
          if (!seen) list.push(user[j]);
        }
      }
      if (list.length) this.map[key] = list;
    }
  }

  setEnabled(on) {
    this.enabled = !!on;
    if (!this.enabled) { this.stop(); return; }
    if (this.scene) this.playScene(this.scene, true);
  }

  setVolume(v) {
    var x = Number(v);
    if (!isFinite(x)) return;
    this.volume = Math.max(0, Math.min(1, x));
    this._targetVol = this.volume * 0.9;
    for (var i = 0; i < this.slots.length; i++) {
      var el = this.slots[i];
      if (!el) continue;
      try { el.volume = this._targetVol; } catch (e) {}
    }
  }

  /** 静音（独立于音效，不改游戏音效状态） */
  setMuted(muted) {
    for (var i = 0; i < this.slots.length; i++) {
      if (!this.slots[i]) continue;
      try { this.slots[i].muted = !!muted; } catch (e) {}
    }
  }

  current() {
    return this.slots[this.active];
  }

  filesFor(scene) {
    var list = this.map[scene];
    return list && list.length ? list : [];
  }

  pick(scene, skipName) {
    var list = this.filesFor(scene);
    if (!list.length) return null;
    if (list.length === 1) return list[0] === skipName ? null : list[0];
    var last = this.lastPick[scene];
    for (var tries = 0; tries < 8; tries++) {
      var name = list[Math.floor(Math.random() * list.length)];
      if (name !== last && name !== skipName) { this.lastPick[scene] = name; return name; }
    }
    for (var i = 0; i < list.length; i++) {
      if (list[i] !== last && list[i] !== skipName) { this.lastPick[scene] = list[i]; return list[i]; }
    }
    for (var j = 0; j < list.length; j++) if (list[j] !== skipName) return list[j];
    return null;
  }

  _makeAudio() {
    if (typeof Audio === 'function') return new Audio();
    if (typeof document !== 'undefined' && document.createElement) return document.createElement('audio');
    return null;
  }

  /** 内置 data URI 优先；用户导入曲目才回落到 store 的 blob URL */
  _url(name, cb) {
    if (Object.prototype.hasOwnProperty.call(this.builtinSrc, name)) {
      return cb(this.builtinSrc[name] || null);
    }
    if (this.urlCache[name]) return cb(this.urlCache[name]);
    var self = this;
    if (!this.store || !this.store.getUrl) return cb(null);
    try {
      this.store.getUrl(name, function (url) {
        if (url) self.urlCache[name] = url;
        cb(url || null);
      });
    } catch (e) {
      this.lastError = 'STORE_GETURL: ' + e;
      cb(null);
    }
  }

  /**
   * 首次用户手势调用。解锁前不创建 / 播放 audio；解锁后按最后请求的场景开始。
   */
  unlock() {
    if (this.unlocked) return false;
    this.unlocked = true;
    var sc = this.pendingScene || this.scene;
    if (sc && this.enabled) {
      this.pendingScene = null;
      this.playScene(sc, true);
    }
    return true;
  }

  /** 切场景；force=true 时即使场景没变也重播（例如刚改了映射或音量） */
  playScene(scene, force) {
    if (!scene) { this.stop(); return false; }
    this.scene = scene;
    if (!this.enabled) { this.pendingScene = scene; return false; }
    var list = this.filesFor(scene);
    if (!list.length) { this.stop(); this.pendingScene = null; return false; }
    var cur = this.current();
    if (!force && this.trackScene === scene && cur && !cur.paused && this.unlocked) return true;
    if (!this.unlocked) { this.pendingScene = scene; return false; }
    this.pendingScene = null;
    var name = this.pick(scene);
    if (!name) { this.stop(); return false; }
    var self = this;
    this._url(name, function (url) {
      if (!url) {
        self.lastError = 'NO_SOURCE: ' + name;
        self._fallback(scene, name);
        return;
      }
      if (self.scene !== scene || !self.enabled) return; // 期间又切了场景或已关闭
      self._start(url, name, scene);
    });
    return true;
  }

  /** 某一首加载 / 播放失败时，换同场景的下一首；全部失败才停 */
  _fallback(scene, failedName) {
    if (this.scene !== scene || !this.enabled) return;
    this._retry++;
    if (this._retry > MAX_PLAY_RETRY) { this.stop(); return; }
    var next = this.pick(scene, failedName);
    if (!next) { this.stop(); return; }
    var self = this;
    this._url(next, function (url) {
      if (!url) { self.lastError = 'NO_SOURCE: ' + next; self._fallback(scene, next); return; }
      if (self.scene !== scene || !self.enabled) return;
      self._start(url, next, scene);
    });
  }

  /** 停掉所有槽 —— 保证任意时刻最多一个实例在播 */
  _silence() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    for (var i = 0; i < this.slots.length; i++) {
      var el = this.slots[i];
      if (!el) continue;
      try { el.pause(); el.removeAttribute('src'); } catch (e) {}
      try { el.volume = 0; } catch (e2) {}
    }
  }

  _start(url, name, scene) {
    // 先彻底停旧曲，再复用同一个槽；不做双槽重叠（禁止多实例同时播放）
    this._silence();
    var el = this.slots[this.active];
    if (!el) {
      el = this._makeAudio();
      if (!el) { this.lastError = 'NO_AUDIO_ELEMENT'; return; }
      this.slots[this.active] = el;
    }
    var self = this;
    try {
      el.onerror = function () {
        self.lastError = 'MEDIA_ERROR: ' + name + ' code=' + (el.error ? el.error.code : '?');
        self._fallback(scene, name);
      };
      el.src = url;
      el.loop = true;
      el.volume = 0;
      el.muted = false;
      if (el.setAttribute) el.setAttribute('data-track', name);
      var p = el.play();
      if (p && typeof p['catch'] === 'function') {
        p['catch'](function (err) {
          self.playErrors++;
          self.lastError = 'PLAY_REJECTED: ' + name + ' ' + String(err && err.name ? err.name : err);
          if (self.scene === scene) self._fallback(scene, name);
        });
      }
    } catch (e) {
      this.lastError = 'PLAY_THREW: ' + e;
      this._fallback(scene, name);
      return;
    }
    this.track = name;
    this.trackScene = scene;
    this.lastError = '';
    this._retry = 0;
    this.startedAt = nowMs();
    this.switchCount++;
    this._fadeIn(el);
  }

  _fadeIn(el) {
    var self = this;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    var ms = this.fadeMs;
    var target = this._targetVol;
    var t0 = nowMs();
    if (ms <= 0) { try { el.volume = target; } catch (e) {} return; }
    this.timer = setInterval(function () {
      var k = Math.min(1, (nowMs() - t0) / ms);
      try { el.volume = target * k; } catch (e) {}
      if (k >= 1) { clearInterval(self.timer); self.timer = null; }
    }, 40);
    if (this.timer && typeof this.timer.unref === 'function') this.timer.unref();
  }

  fadeOutAll() { this.stop(); }

  stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this._silence();
    this.track = '';
    this.trackScene = '';
  }

  /** 供调试面板与真实播放验证读取的真实状态 */
  status() {
    var playing = 0, t = 0, paused = true;
    for (var i = 0; i < this.slots.length; i++) {
      var el = this.slots[i];
      if (!el || !el.src) continue;
      if (!el.paused) { playing++; t = el.currentTime || 0; paused = false; }
    }
    return {
      enabled: this.enabled,
      unlocked: this.unlocked,
      scene: this.scene,
      track: this.track,
      playing: playing > 0 && !paused,
      instances: playing,
      currentTime: t,
      volume: this.volume,
      lastError: this.lastError,
      playErrors: this.playErrors,
      switchCount: this.switchCount,
      trackCount: (function (m) {
        var n = 0;
        for (var k in m) if (Object.prototype.hasOwnProperty.call(m, k)) n += m[k].length;
        return n;
      })(this.map),
    };
  }

  dispose() {
    this.stop();
    for (var k in this.urlCache) {
      if (!Object.prototype.hasOwnProperty.call(this.urlCache, k)) continue;
      if (String(this.urlCache[k]).indexOf('blob:') === 0) {
        try { URL.revokeObjectURL(this.urlCache[k]); } catch (e) {}
      }
    }
    this.urlCache = {};
    this.slots = [null, null];
  }
}

/** 兼容 spec 里使用的名称：MusicManager 就是同一个播放器，不新增实例 */
export { MusicPlayer as MusicManager };
