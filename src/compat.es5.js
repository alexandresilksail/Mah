/* ==========================================================================
 * Mah 了个 Mah —— 老浏览器兼容垫片（纯 ES5，零依赖）
 *
 * 这段脚本必须写在所有业务脚本之前，且本身只能用 ES5 语法：
 * IE8 及以下遇到一个箭头函数 / let / 模板字符串就会整段 SyntaxError。
 *
 * 覆盖范围：IE7/IE8 的 ES5 内置方法、事件模型、视口尺寸、计时器；
 *           IE9/IE10 的 PointerEvent / Web Audio 缺失（业务层已做降级）；
 *           IE9 Canvas 缺少的 ellipse。
 * 不覆盖：IE6（连 position:fixed / 盒模型都不完整）、IE 的 Web Audio（静音）。
 * ========================================================================== */
(function (win, doc) {
  'use strict';

  var OP = Object.prototype;
  var AP = Array.prototype;
  var SP = String.prototype;
  var noop = function () {};

  /* ---------- console：IE 未开 F12 时 console 根本不存在 ---------- */
  if (!win.console) {
    win.console = { log: noop, info: noop, warn: noop, error: noop, debug: noop, dir: noop };
  } else {
    var c = win.console;
    if (!c.log) c.log = noop;
    if (!c.info) c.info = noop;
    if (!c.warn) c.warn = noop;
    if (!c.error) c.error = noop;
    if (!c.debug) c.debug = noop;
  }

  /* ---------- 计时 ---------- */
  if (!Date.now) Date.now = function () { return new Date().getTime(); };

  var t0 = Date.now();
  var perfNow = function () { return Date.now() - t0; };
  /* 有些宿主把 window.performance 暴露成只读属性，直接赋值会抛异常。
     整段垫片必须容错：一处失败不能连累后面的 Map/Set/数组方法补丁。 */
  try {
    if (!win.performance) win.performance = { now: perfNow };
    else if (typeof win.performance.now !== 'function') win.performance.now = perfNow;
  } catch (e) { /* ignore */ }
  win.__mahNow = perfNow;

  var rafImpl =
    win.msRequestAnimationFrame ||
    win.webkitRequestAnimationFrame ||
    win.mozRequestAnimationFrame ||
    function (fn) { return setTimeout(function () { fn(Date.now()); }, 16); };
  try { if (!win.requestAnimationFrame) win.requestAnimationFrame = rafImpl; } catch (e) { /* ignore */ }
  try {
    if (!win.cancelAnimationFrame) {
      win.cancelAnimationFrame = win.msCancelAnimationFrame || win.mozCancelAnimationFrame || clearTimeout;
    }
  } catch (e) { /* ignore */ }
  win.__mahRaf = function (fn) {
    return (win.requestAnimationFrame || rafImpl).call(win, fn);
  };

  try { if (win.devicePixelRatio == null) win.devicePixelRatio = 1; } catch (e) { /* ignore */ }

  /* ---------- Function.prototype.bind ---------- */
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (ctx) {
      var self = this;
      var a = AP.slice.call(arguments, 1);
      var F = function () {};
      var bound = function () {
        return self.apply(this instanceof F ? this : ctx, a.concat(AP.slice.call(arguments)));
      };
      F.prototype = self.prototype;
      bound.prototype = new F();
      return bound;
    };
  }

  /* ---------- Object ---------- */
  if (!Object.keys) {
    Object.keys = function (o) {
      var out = [], k;
      for (k in o) if (OP.hasOwnProperty.call(o, k)) out.push(k);
      return out;
    };
  }
  if (!Object.create) {
    Object.create = function (proto) {
      var F = function () {};
      F.prototype = proto || null;
      return new F();
    };
  }
  if (!Object.assign) {
    Object.assign = function (t) {
      if (t == null) throw new TypeError('Object.assign target is null');
      var to = Object(t), i, k, src;
      for (i = 1; i < arguments.length; i++) {
        src = arguments[i];
        if (src == null) continue;
        for (k in src) if (OP.hasOwnProperty.call(src, k)) to[k] = src[k];
      }
      return to;
    };
  }
  if (!Object.fromEntries) {
    Object.fromEntries = function (pairs) {
      var out = {}, i;
      for (i = 0; i < pairs.length; i++) out[pairs[i][0]] = pairs[i][1];
      return out;
    };
  }
  if (!Object.freeze) Object.freeze = function (o) { return o; };
  if (!Object.seal) Object.seal = function (o) { return o; };
  if (!Object.isFrozen) Object.isFrozen = function () { return false; };

  /* IE8 带 Object.defineProperty，但它**只对 DOM 对象有效**：拿它给普通 JS 对象
     定义属性会直接抛异常。Babel 的 _createClass 和 esbuild 的 __export 都会用，
     不修就整个脚本在 class 定义处崩掉。IE≤8 一律改成普通赋值。 */
  if (doc.documentMode && doc.documentMode < 9) {
    Object.defineProperty = function (obj, key, desc) {
      if (!obj) return obj;
      try {
        if (desc && OP.hasOwnProperty.call(desc, 'value')) obj[key] = desc.value;
        else if (desc && typeof desc.get === 'function') obj[key] = desc.get.call(obj);
      } catch (e) { /* ignore */ }
      return obj;
    };
  }

  /* ---------- Array 静态方法 ---------- */
  if (!Array.isArray) {
    Array.isArray = function (a) { return OP.toString.call(a) === '[object Array]'; };
  }
  if (!Array.from) {
    Array.from = function (a) {
      var out = [], i;
      for (i = 0; i < a.length; i++) out.push(a[i]);
      return out;
    };
  }

  /* ---------- Array.prototype（IE8 一个都没有） ---------- */
  function def(name, fn) {
    if (!AP[name]) AP[name] = fn;
  }
  def('indexOf', function (v, from) {
    var i = from == null ? 0 : (from < 0 ? Math.max(0, this.length + from) : from);
    for (; i < this.length; i++) if (this[i] === v) return i;
    return -1;
  });
  def('lastIndexOf', function (v) {
    for (var i = this.length - 1; i >= 0; i--) if (this[i] === v) return i;
    return -1;
  });
  def('forEach', function (fn, ctx) {
    for (var i = 0; i < this.length; i++) if (i in this) fn.call(ctx, this[i], i, this);
  });
  def('map', function (fn, ctx) {
    var out = [];
    for (var i = 0; i < this.length; i++) if (i in this) out.push(fn.call(ctx, this[i], i, this));
    return out;
  });
  def('filter', function (fn, ctx) {
    var out = [];
    for (var i = 0; i < this.length; i++) if (i in this && fn.call(ctx, this[i], i, this)) out.push(this[i]);
    return out;
  });
  def('some', function (fn, ctx) {
    for (var i = 0; i < this.length; i++) if (i in this && fn.call(ctx, this[i], i, this)) return true;
    return false;
  });
  def('every', function (fn, ctx) {
    for (var i = 0; i < this.length; i++) if (i in this && !fn.call(ctx, this[i], i, this)) return false;
    return true;
  });
  def('reduce', function (fn, init) {
    var i = 0, acc = init, has = arguments.length > 1;
    if (!has) {
      if (!this.length) throw new TypeError('reduce of empty array');
      acc = this[0]; i = 1;
    }
    for (; i < this.length; i++) if (i in this) acc = fn(acc, this[i], i, this);
    return acc;
  });
  def('reduceRight', function (fn, init) {
    var i = this.length - 1, acc = init, has = arguments.length > 1;
    if (!has) {
      if (!this.length) throw new TypeError('reduceRight of empty array');
      acc = this[i--];
    }
    for (; i >= 0; i--) if (i in this) acc = fn(acc, this[i], i, this);
    return acc;
  });
  def('find', function (fn, ctx) {
    for (var i = 0; i < this.length; i++) if (fn.call(ctx, this[i], i, this)) return this[i];
    return undefined;
  });
  def('findIndex', function (fn, ctx) {
    for (var i = 0; i < this.length; i++) if (fn.call(ctx, this[i], i, this)) return i;
    return -1;
  });
  def('includes', function (v) {
    for (var i = 0; i < this.length; i++) if (this[i] === v || (this[i] !== this[i] && v !== v)) return true;
    return false;
  });

  /* ---------- String ---------- */
  if (!SP.trim) SP.trim = function () { return this.replace(/^\s+|\s+$/g, ''); };
  if (!SP.includes) SP.includes = function (s) { return this.indexOf(s) !== -1; };
  if (!SP.startsWith) SP.startsWith = function (s) { return this.indexOf(s) === 0; };
  if (!SP.endsWith) SP.endsWith = function (s) { return this.slice(-s.length) === s; };
  if (!SP.repeat) {
    SP.repeat = function (n) {
      var out = '', k = 0, s = String(this);
      for (; k < n; k++) out += s;
      return out;
    };
  }
  if (!SP.padStart) {
    SP.padStart = function (n, ch) {
      var s = String(this), pad = ch == null ? ' ' : String(ch);
      while (s.length < n) s = pad + s;
      return s;
    };
  }

  /* ---------- Number / Math ---------- */
  if (!Number.isFinite) Number.isFinite = function (v) { return typeof v === 'number' && isFinite(v); };
  if (!Number.isNaN) Number.isNaN = function (v) { return typeof v === 'number' && v !== v; };
  if (!Number.isInteger) Number.isInteger = function (v) { return Number.isFinite(v) && Math.floor(v) === v; };
  if (!Math.hypot) {
    Math.hypot = function () {
      var sum = 0, i;
      for (i = 0; i < arguments.length; i++) sum += arguments[i] * arguments[i];
      return Math.sqrt(sum);
    };
  }
  if (!Math.sign) Math.sign = function (v) { return v > 0 ? 1 : (v < 0 ? -1 : 0); };
  if (!Math.trunc) Math.trunc = function (v) { return v < 0 ? Math.ceil(v) : Math.floor(v); };

  /* ---------- Map（业务里只用 set/get/has/forEach/size/delete/clear） ---------- */
  if (!win.Map) {
    win.Map = function () { this._k = []; this._v = []; this.size = 0; };
    win.Map.prototype._i = function (k) {
      for (var i = 0; i < this._k.length; i++) if (this._k[i] === k || (this._k[i] !== this._k[i] && k !== k)) return i;
      return -1;
    };
    win.Map.prototype.get = function (k) { var i = this._i(k); return i < 0 ? undefined : this._v[i]; };
    win.Map.prototype.has = function (k) { return this._i(k) >= 0; };
    win.Map.prototype.set = function (k, v) {
      var i = this._i(k);
      if (i < 0) { i = this._k.length; this.size++; }
      this._k[i] = k; this._v[i] = v;
      return this;
    };
    win.Map.prototype.delete = function (k) {
      var i = this._i(k);
      if (i < 0) return false;
      this._k.splice(i, 1); this._v.splice(i, 1); this.size--;
      return true;
    };
    win.Map.prototype.clear = function () { this._k = []; this._v = []; this.size = 0; };
    win.Map.prototype.forEach = function (fn, ctx) {
      for (var i = 0; i < this._k.length; i++) fn.call(ctx, this._v[i], this._k[i], this);
    };
    win.Map.prototype.keys = function () { return this._k.slice(); };
    win.Map.prototype.values = function () { return this._v.slice(); };
    win.Map.prototype.entries = function () {
      var out = [], i;
      for (i = 0; i < this._k.length; i++) out.push([this._k[i], this._v[i]]);
      return out;
    };
  }

  /* ---------- Set ---------- */
  if (!win.Set) {
    win.Set = function (a) {
      this._a = []; this.size = 0;
      if (a) for (var i = 0; i < a.length; i++) this.add(a[i]);
    };
    win.Set.prototype.add = function (v) {
      if (this._a.indexOf(v) < 0) { this._a.push(v); this.size++; }
      return this;
    };
    win.Set.prototype.has = function (v) { return this._a.indexOf(v) >= 0; };
    win.Set.prototype.delete = function (v) {
      var i = this._a.indexOf(v);
      if (i < 0) return false;
      this._a.splice(i, 1); this.size--; return true;
    };
    win.Set.prototype.clear = function () { this._a = []; this.size = 0; };
    win.Set.prototype.forEach = function (fn, ctx) {
      for (var i = 0; i < this._a.length; i++) fn.call(ctx, this._a[i], this._a[i], this);
    };
    win.Set.prototype.values = function () { return this._a.slice(); };
  }

  /* ---------- URLSearchParams（业务只用 has / get） ---------- */
  if (!win.URLSearchParams) {
    win.URLSearchParams = function (s) {
      this._m = {};
      var q = String(s == null ? win.location.search : s).replace(/^\?/, '');
      if (!q) return;
      var parts = q.split('&'), i, kv;
      for (i = 0; i < parts.length; i++) {
        kv = parts[i].split('=');
        if (!kv[0]) continue;
        try { this._m[decodeURIComponent(kv[0].replace(/\+/g, ' '))] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' ')); }
        catch (e) { this._m[kv[0]] = kv[1] || ''; }
      }
    };
    win.URLSearchParams.prototype.has = function (k) { return OP.hasOwnProperty.call(this._m, k); };
    win.URLSearchParams.prototype.get = function (k) { return this.has(k) ? this._m[k] : null; };
    win.URLSearchParams.prototype.set = function (k, v) { this._m[k] = String(v); };
    win.URLSearchParams.prototype.toString = function () {
      var out = [], k;
      for (k in this._m) if (OP.hasOwnProperty.call(this._m, k)) out.push(encodeURIComponent(k) + '=' + encodeURIComponent(this._m[k]));
      return out.join('&');
    };
  }

  /* ---------- 视口尺寸（IE8 没有 innerWidth / innerHeight） ---------- */
  win.__mahViewport = function () {
    var de = doc.documentElement, b = doc.body;
    return {
      w: win.innerWidth || (de && de.clientWidth) || (b && b.clientWidth) || 720,
      h: win.innerHeight || (de && de.clientHeight) || (b && b.clientHeight) || 1280
    };
  };

  /* ---------- 事件绑定：IE8 attachEvent 桥接 + 事件对象补 shape ---------- */
  function wrapEvent(e) {
    if (!e) e = win.event;
    if (!e) return { preventDefault: noop, stopPropagation: noop, target: null, clientX: 0, clientY: 0 };
    if (!e.target) e.target = e.srcElement;
    if (!e.preventDefault) e.preventDefault = function () { this.returnValue = false; };
    if (!e.stopPropagation) e.stopPropagation = function () { this.cancelBubble = true; };
    if (e.pageX == null) e.pageX = e.clientX + ((deScrollLeft()));
    if (e.pageY == null) e.pageY = e.clientY + (deScrollTop());
    return e;
  }
  function deScrollLeft() { return (doc.documentElement && doc.documentElement.scrollLeft) || (doc.body && doc.body.scrollLeft) || 0; }
  function deScrollTop() { return (doc.documentElement && doc.documentElement.scrollTop) || (doc.body && doc.body.scrollTop) || 0; }

  win.__mahOn = function (node, type, fn) {
    if (!node) return;
    if (node.addEventListener) { node.addEventListener(type, fn, false); return; }
    if (node.attachEvent) {
      node.attachEvent('on' + type, function () { return fn.call(node, wrapEvent(win.event)); });
    }
  };

  /* ---------- IE9 Canvas 缺 ellipse（logo 的承托阴影用到） ---------- */
  if (win.CanvasRenderingContext2D && !win.CanvasRenderingContext2D.prototype.ellipse) {
    win.CanvasRenderingContext2D.prototype.ellipse = function (x, y, rx, ry, rot, a0, a1, ccw) {
      this.save();
      this.translate(x, y);
      if (rot) this.rotate(rot);
      if (rx && ry) this.scale(rx, ry);
      this.arc(0, 0, 1, a0, a1, !!ccw);
      this.restore();
    };
  }

  /* ---------- 给 IE8 一个最小的 JSON（IE8 标准模式其实自带，IE7 没有） ---------- */
  if (!win.JSON) win.JSON = { parse: function () { return null; }, stringify: function () { return ''; } };

  win.__MAH_LEGACY__ = true;
  /* IE 自报家门：main.js 用它决定走 mouse 事件而不是 Pointer Events */
  win.__MAH_IS_IE__ = !!doc.documentMode;
})(window, document);
