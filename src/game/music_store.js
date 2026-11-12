/**
 * 背景音乐存储层（第 4.4 节）。
 *
 * 三种运行环境，各自一套落盘方式，**都不碰注册表、不碰 AppData**：
 *   · tauri  桌面版：调用 Rust 命令 list_music / import_music / read_music / delete_music，
 *            文件存放在 <exe 同级>/MahLeMah_Data/music/；
 *   · web    网页版：<input type="file" multiple accept="audio/*"> 读成 Blob 存 IndexedDB；
 *            没有 IndexedDB 时退化为「本次会话有效」（内存），刷新即失效；
 *   · none    ES5 兼容版：不显示音乐入口、不报错。
 *
 * 安全约束（与 src-tauri/src/main.rs 里的 Rust 实现逐条对应，测试会交叉核对）：
 *   · 扩展名白名单 mp3 / ogg / wav；
 *   · 单文件 ≤ 20MB；总数 ≤ 24 首；
 *   · 文件名净化：拒绝路径分隔符、`..`、Windows 保留名（CON/NUL/COM1…）、空名、超长名；
 *   · 写入先写临时文件再原子重命名（Rust 侧）；网页侧先写 Blob 再写索引。
 *
 * 全部 API 都是回调式（不用 Promise），这样 ES5 兼容层不需要 regenerator。
 */

export const MUSIC_EXTS = ['mp3', 'ogg', 'wav'];
export const MUSIC_MAX_BYTES = 20 * 1024 * 1024;
export const MUSIC_MAX_FILES = 24;
export const MUSIC_MAX_NAME = 96;
/** musicMap 序列化后的整体上限（与 Rust 侧 MUSIC_MAP_MAX_BYTES 一致） */
export const MUSIC_MAP_MAX_BYTES = 4 * 1024;
/** 存档里允许的 6 个场景名（与 Rust 侧 MUSIC_SCENES 一致） */
export const MUSIC_SCENES = ['title', 'level1', 'level2', 'win', 'lose', 'graduated'];

/** Windows 保留设备名（不区分大小写，含扩展名前的部分） */
const RESERVED = [
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
];

export function extOf(name) {
  var s = String(name || '');
  var dot = s.lastIndexOf('.');
  if (dot <= 0 || dot === s.length - 1) return '';
  return s.slice(dot + 1).toLowerCase();
}

/** 去掉扩展名的文件名主干 */
export function stemOf(name) {
  var s = String(name || '');
  var dot = s.lastIndexOf('.');
  return dot > 0 ? s.slice(0, dot) : s;
}

/**
 * 文件名净化：返回 {ok, name, reason}。
 * 只做「拒绝」，不做「悄悄改名」——非法名一律拒绝，让用户自己改。
 */
export function sanitizeMusicName(name) {
  if (typeof name !== 'string') return { ok: false, name: '', reason: 'NOT_STRING' };
  var s = name;
  if (!s.length) return { ok: false, name: '', reason: 'EMPTY' };
  if (s.length > MUSIC_MAX_NAME) return { ok: false, name: s, reason: 'TOO_LONG' };
  if (s.indexOf('/') >= 0 || s.indexOf('\\') >= 0) return { ok: false, name: s, reason: 'PATH_SEPARATOR' };
  if (s.indexOf('..') >= 0) return { ok: false, name: s, reason: 'DOT_DOT' };
  // 控制字符 / Windows 非法字符
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    if (c < 0x20 || c === 0x7f) return { ok: false, name: s, reason: 'CONTROL_CHAR' };
  }
  if (/[<>:"|?*]/.test(s)) return { ok: false, name: s, reason: 'ILLEGAL_CHAR' };
  if (s.charAt(0) === '.' || s.charAt(s.length - 1) === '.' || s.charAt(0) === ' ') {
    return { ok: false, name: s, reason: 'BAD_EDGE' };
  }
  var ext = extOf(s);
  if (!ext) return { ok: false, name: s, reason: 'NO_EXT' };
  var okExt = false;
  for (var k = 0; k < MUSIC_EXTS.length; k++) if (MUSIC_EXTS[k] === ext) okExt = true;
  if (!okExt) return { ok: false, name: s, reason: 'BAD_EXT' };
  var stem = stemOf(s).toUpperCase();
  for (var r = 0; r < RESERVED.length; r++) {
    if (stem === RESERVED[r]) return { ok: false, name: s, reason: 'RESERVED_NAME' };
  }
  return { ok: true, name: s, reason: '' };
}

/**
 * 存档里的 musicMap 清洗：只保留 6 个固定场景 + 合法文件名 + 每个场景 ≤24 首，
 * 整体序列化 ≤4KB。任何非法内容一律丢弃而不是让整份存档判非法（旧存档能读）。
 */
export function sanitizeMusicMap(raw) {
  var out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (var k in raw) {
    if (!Object.prototype.hasOwnProperty.call(raw, k)) continue;
    if (MUSIC_SCENES.indexOf(k) < 0) continue;
    var list = raw[k];
    if (Object.prototype.toString.call(list) !== '[object Array]') continue;
    var keep = [];
    for (var i = 0; i < list.length && keep.length < MUSIC_MAX_FILES; i++) {
      if (sanitizeMusicName(list[i]).ok) keep.push(list[i]);
    }
    if (keep.length) out[k] = keep;
  }
  var s;
  try { s = JSON.stringify(out); } catch (e) { return {}; }
  if (s.length > MUSIC_MAP_MAX_BYTES) return {};
  return out;
}

/**
 * 一组合法性检查（导入前用）：返回 {ok, accepted:[], rejected:[{name,reason}]}。
 * 去重 + 扩展名/保留名/长度校验 + 总数上限 24 首，任一不合格只拒绝该文件。
 */
export function filterImportable(names, existing) {
  var accepted = [];
  var rejected = [];
  var have = {};
  var list = existing || [];
  for (var i = 0; i < list.length; i++) have[list[i]] = 1;
  for (var j = 0; j < names.length; j++) {
    var r = sanitizeMusicName(names[j]);
    if (!r.ok) { rejected.push({ name: String(names[j]), reason: r.reason }); continue; }
    if (have[r.name]) { rejected.push({ name: r.name, reason: 'DUPLICATE' }); continue; }
    if (list.length + accepted.length >= MUSIC_MAX_FILES) {
      rejected.push({ name: r.name, reason: 'TOO_MANY' });
      continue;
    }
    have[r.name] = 1;
    accepted.push(r.name);
  }
  return { ok: rejected.length === 0, accepted: accepted, rejected: rejected };
}

/**
 * 创建存储适配器。
 * @param {object} opt {kind:'tauri'|'web'|'none', invoke, idbName}
 * @returns {{kind, available, persistent, list, put, getUrl, remove, clearAll}}
 */
export function createMusicStore(opt) {
  var o = opt || {};
  var kind = o.kind || 'none';
  if (kind === 'tauri') return tauriStore(o.invoke);
  if (kind === 'web') return webStore(o.idbName || 'mahlemah-music');
  return memoryStore('none', false);
}

/* ---------------- 桌面版：Rust 命令 ---------------- */

function tauriStore(invoke) {
  var api = {
    kind: 'tauri',
    available: !!invoke,
    persistent: true,
  };
  api.list = function (cb) {
    if (!invoke) return cb([], 'NO_INVOKE');
    invoke('list_music').then(function (r) {
      var out = [];
      var raw = r && r.files ? r.files : (r || []);
      for (var i = 0; i < raw.length; i++) {
        var f = raw[i];
        if (typeof f === 'string') out.push(f);
        else if (f && f.name) out.push(f.name);
      }
      cb(out, null);
    }, function (e) { cb([], String(e)); });
  };
  api.put = function (name, bytes, cb) {
    if (!invoke) return cb(false, 'NO_INVOKE');
    invoke('import_music', { name: name, base64: bytes }).then(function () {
      cb(true, null);
    }, function (e) { cb(false, String(e)); });
  };
  api.getUrl = function (name, cb) {
    if (!invoke) return cb(null, 'NO_INVOKE');
    invoke('read_music', { name: name }).then(function (b64) {
      cb('data:audio/' + (extOf(name) === 'ogg' ? 'ogg' : extOf(name)) + ';base64,' + b64, null);
    }, function (e) { cb(null, String(e)); });
  };
  api.remove = function (name, cb) {
    if (!invoke) return cb(false, 'NO_INVOKE');
    invoke('delete_music', { name: name }).then(function () { cb(true, null); },
      function (e) { cb(false, String(e)); });
  };
  api.clearAll = function (cb) {
    api.list(function (list) {
      var left = list.length;
      if (!left) return cb(true, null);
      var failed = null;
      for (var i = 0; i < list.length; i++) {
        api.remove(list[i], function (ok, err) {
          if (!ok && !failed) failed = err;
          left--;
          if (left === 0) cb(!failed, failed);
        });
      }
    });
  };
  return api;
}

/* ---------------- 网页版：IndexedDB（无则内存） ---------------- */

function memoryStore(kind, persistent) {
  var mem = {};
  return {
    kind: kind,
    available: kind !== 'none',
    persistent: persistent,
    list: function (cb) {
      var out = [];
      for (var k in mem) if (Object.prototype.hasOwnProperty.call(mem, k)) out.push(k);
      out.sort();
      cb(out, null);
    },
    put: function (name, blob, cb) {
      mem[name] = blob;
      cb(true, null);
    },
    getUrl: function (name, cb) {
      if (!mem[name]) return cb(null, 'NOT_FOUND');
      try { cb(URL.createObjectURL(mem[name]), null); } catch (e) { cb(null, String(e)); }
    },
    remove: function (name, cb) {
      delete mem[name];
      cb(true, null);
    },
    clearAll: function (cb) {
      mem = {};
      cb(true, null);
    },
  };
}

function webStore(dbName) {
  var idb = (typeof indexedDB !== 'undefined') ? indexedDB : null;
  if (!idb) return memoryStore('web', false);
  var db = null;
  var opening = false;
  var queue = [];

  function withDb(fn) {
    if (db) return fn(db);
    queue.push(fn);
    if (opening) return;
    opening = true;
    var req;
    try { req = idb.open(dbName, 1); } catch (e) {
      opening = false;
      var q0 = queue; queue = [];
      for (var z = 0; z < q0.length; z++) q0[z](null);
      return;
    }
    req.onupgradeneeded = function () {
      var d = req.result;
      if (!d.objectStoreNames.contains('files')) d.createObjectStore('files');
    };
    req.onsuccess = function () {
      db = req.result;
      opening = false;
      var q = queue; queue = [];
      for (var i = 0; i < q.length; i++) q[i](db);
    };
    req.onerror = function () {
      opening = false;
      var q2 = queue; queue = [];
      for (var j = 0; j < q2.length; j++) q2[j](null);
    };
  }

  function tx(mode, fn, cb) {
    withDb(function (d) {
      if (!d) return cb(null, 'IDB_UNAVAILABLE');
      var t;
      try { t = d.transaction('files', mode); } catch (e) { return cb(null, String(e)); }
      var store = t.objectStore('files');
      fn(store);
      t.oncomplete = function () { cb(true, null); };
      t.onerror = function () { cb(null, 'IDB_TX_ERROR'); };
    });
  }

  var api = { kind: 'web', available: true, persistent: true };
  api.list = function (cb) {
    withDb(function (d) {
      if (!d) return cb([], 'IDB_UNAVAILABLE');
      var out = [];
      var t = d.transaction('files', 'readonly');
      var req = t.objectStore('files').openCursor();
      req.onsuccess = function () {
        var cur = req.result;
        if (cur) { out.push(String(cur.key)); cur.continue(); } else { out.sort(); cb(out, null); }
      };
      req.onerror = function () { cb([], 'IDB_READ_ERROR'); };
    });
  };
  api.put = function (name, blob, cb) {
    tx('readwrite', function (store) { store.put(blob, name); }, cb);
  };
  api.getUrl = function (name, cb) {
    withDb(function (d) {
      if (!d) return cb(null, 'IDB_UNAVAILABLE');
      var t = d.transaction('files', 'readonly');
      var req = t.objectStore('files').get(name);
      req.onsuccess = function () {
        var blob = req.result;
        if (!blob) return cb(null, 'NOT_FOUND');
        try { cb(URL.createObjectURL(blob), null); } catch (e) { cb(null, String(e)); }
      };
      req.onerror = function () { cb(null, 'IDB_READ_ERROR'); };
    });
  };
  api.remove = function (name, cb) {
    tx('readwrite', function (store) { store.delete(name); }, cb);
  };
  api.clearAll = function (cb) {
    tx('readwrite', function (store) { store.clear(); }, cb);
  };
  return api;
}

/** 环境探测：决定用哪套适配器（main.js 只调用这个） */
export function detectMusicStore(win) {
  var w = win || (typeof window !== 'undefined' ? window : null);
  if (!w) return createMusicStore({ kind: 'none' });
  if (w.__MAH_LEGACY__ === true) return createMusicStore({ kind: 'none' });
  var tauri = w.__TAURI__ || w.__TAURI_INTERNALS__;
  var invoke = null;
  if (tauri) {
    if (tauri.core && typeof tauri.core.invoke === 'function') invoke = tauri.core.invoke;
    else if (tauri.tauri && typeof tauri.tauri.invoke === 'function') invoke = tauri.tauri.invoke;
    else if (typeof tauri.invoke === 'function') invoke = tauri.invoke;
  }
  if (invoke) return createMusicStore({ kind: 'tauri', invoke: invoke });
  return createMusicStore({ kind: 'web' });
}
