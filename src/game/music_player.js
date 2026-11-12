/**
 * 背景音乐播放器（第 4.5 节）。
 *
 * 关键约束：
 *  · **只用 HTMLAudioElement**，不碰 Sound 的 AudioContext —— 音乐与音效天然
 *    完全隔离，点一下音效不会被音乐加载/淡入拖住（这是上一轮踩过的坑）；
 *  · 场景切换做 600ms 交叉淡出淡入；单曲循环；
 *  · 同一场景可挂多首，播放时随机取一首，且不会连续重复同一首；
 *  · 没有任何导入音乐时完全静音（不创建 audio 元素、不请求 URL）；
 *  · 所有 URL 用 store 给的 objectURL / dataURL，用完即 revoke，不泄漏。
 */

export const FADE_MS = 600;

function nowMs() {
  return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
}

export class MusicPlayer {
  constructor(opt) {
    var o = opt || {};
    this.enabled = o.enabled !== false;
    this.volume = typeof o.volume === 'number' ? o.volume : 0.6;
    this.fadeMs = o.fadeMs === undefined ? FADE_MS : o.fadeMs;
    this.map = {};            // scene → [fileName]
    this.store = o.store || null;
    this.scene = null;
    this.slots = [null, null]; // 两个 audio 槽用于交叉淡化
    this.active = 0;
    this.urlCache = {};
    this.lastPick = {};        // scene → 上次播放的文件名（避免连续重复）
    this.timer = null;
    this.available = !!(typeof Audio !== 'undefined' || (typeof document !== 'undefined'));
  }

  setStore(store) {
    this.store = store;
  }

  setMap(map) {
    this.map = {};
    if (map && typeof map === 'object') {
      for (var k in map) {
        if (!Object.prototype.hasOwnProperty.call(map, k)) continue;
        var list = map[k];
        if (Object.prototype.toString.call(list) !== '[object Array]') continue;
        var keep = [];
        for (var i = 0; i < list.length; i++) {
          if (typeof list[i] === 'string' && list[i].length) keep.push(list[i]);
        }
        if (keep.length) this.map[k] = keep;
      }
    }
  }

  setEnabled(on) {
    this.enabled = !!on;
    if (!this.enabled) this.stop();
    else if (this.scene) this.playScene(this.scene, true);
  }

  setVolume(v) {
    var x = Number(v);
    if (!isFinite(x)) return;
    this.volume = Math.max(0, Math.min(1, x));
    var el = this.current();
    if (el && this._targetVol) el.volume = Math.max(0, Math.min(1, this.volume * 0.9));
  }

  current() {
    return this.slots[this.active];
  }

  other() {
    return this.slots[1 - this.active];
  }

  /** 该场景可播列表（空数组 = 不播） */
  filesFor(scene) {
    var list = this.map[scene];
    return list && list.length ? list : [];
  }

  /** 随机取一首，尽量不与上一次相同 */
  pick(scene) {
    var list = this.filesFor(scene);
    if (!list.length) return null;
    if (list.length === 1) return list[0];
    var last = this.lastPick[scene];
    for (var tries = 0; tries < 8; tries++) {
      var name = list[Math.floor(Math.random() * list.length)];
      if (name !== last) { this.lastPick[scene] = name; return name; }
    }
    for (var i = 0; i < list.length; i++) if (list[i] !== last) { this.lastPick[scene] = list[i]; return list[i]; }
    return list[0];
  }

  _makeAudio() {
    if (typeof Audio === 'function') return new Audio();
    if (typeof document !== 'undefined' && document.createElement) return document.createElement('audio');
    return null;
  }

  _url(name, cb) {
    if (this.urlCache[name]) return cb(this.urlCache[name]);
    var self = this;
    if (!this.store || !this.store.getUrl) return cb(null);
    this.store.getUrl(name, function (url) {
      if (url) self.urlCache[name] = url;
      cb(url || null);
    });
  }

  /**
   * 切场景。force=true 时即使场景没变也重放（例如刚导入新音乐）。
   */
  playScene(scene, force) {
    if (!this.enabled) { this.scene = scene || null; return false; }
    if (!scene) { this.stop(); return false; }
    if (!force && scene === this.scene && this.current() && !this.current().paused) return true;
    this.scene = scene;
    var name = this.pick(scene);
    if (!name) { this.fadeOutAll(); return false; }
    var self = this;
    this._url(name, function (url) {
      if (!url) { self.fadeOutAll(); return; }
      if (self.scene !== scene) return; // 期间又切了场景
      self._start(url, name);
    });
    return true;
  }

  _start(url, name) {
    var el = this.other();
    if (!el) {
      el = this._makeAudio();
      if (!el) return;
      this.slots[1 - this.active] = el;
    }
    try {
      el.src = url;
      el.loop = true;
      el.volume = 0;
      el.setAttribute('data-track', name);
      var p = el.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    } catch (e) {
      return;
    }
    // 交换活跃槽：新曲淡入，旧曲淡出
    var oldIndex = this.active;
    this.active = 1 - this.active;
    this._crossfade(this.slots[oldIndex], el);
  }

  _crossfade(from, to) {
    var self = this;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    var ms = this.fadeMs;
    var target = Math.max(0, Math.min(1, this.volume * 0.9));
    var t0 = nowMs();
    if (from) {
      try { from.volume = Math.min(1, from.volume); } catch (e) {}
    }
    var fromStart = from ? from.volume : 0;
    this.timer = setInterval(function () {
      var k = ms <= 0 ? 1 : Math.min(1, (nowMs() - t0) / ms);
      try {
        if (to) to.volume = target * k;
        if (from) from.volume = Math.max(0, fromStart * (1 - k));
      } catch (e) {}
      if (k >= 1) {
        clearInterval(self.timer);
        self.timer = null;
        if (from) {
          try { from.pause(); from.removeAttribute('src'); from.load(); } catch (e) {}
        }
      }
    }, 40);
    if (this.timer && typeof this.timer.unref === 'function') this.timer.unref();
  }

  fadeOutAll() {
    var self = this;
    var el = this.current();
    if (!el) return;
    var fromStart = el.volume || 0;
    var ms = this.fadeMs;
    var t0 = nowMs();
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.timer = setInterval(function () {
      var k = ms <= 0 ? 1 : Math.min(1, (nowMs() - t0) / ms);
      try { el.volume = Math.max(0, fromStart * (1 - k)); } catch (e) {}
      if (k >= 1) {
        clearInterval(self.timer);
        self.timer = null;
        try { el.pause(); el.removeAttribute('src'); el.load(); } catch (e) {}
      }
    }, 40);
    if (this.timer && typeof this.timer.unref === 'function') this.timer.unref();
  }

  stop() {
    this.scene = null;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    for (var i = 0; i < this.slots.length; i++) {
      var el = this.slots[i];
      if (!el) continue;
      try { el.pause(); el.removeAttribute('src'); el.load(); } catch (e) {}
    }
  }

  dispose() {
    this.stop();
    for (var k in this.urlCache) {
      if (!Object.prototype.hasOwnProperty.call(this.urlCache, k)) continue;
      try { URL.revokeObjectURL(this.urlCache[k]); } catch (e) {}
    }
    this.urlCache = {};
    this.slots = [null, null];
  }
}
