/**
 * 背景音乐 UI（第 4.6 节）：设置面板里的入口 + 一个 DOM 覆盖层。
 *
 * 为什么用 DOM 而不是 Canvas：文件选择必须用 `<input type="file">`（WebView2 与
 * 浏览器都原生支持，不需要任何 Tauri 文件对话框插件），而 Canvas 里放不了它。
 * 覆盖层只做展示与事件转发，所有判定都在 music_flow.js / music_store.js 里（纯函数）。
 *
 * 文案全中文；ES5 兼容版由 main.js 传 musicAvailable=false，直接不挂入口。
 */
import { SCENES, SCENE_LABELS } from './music_match.js';
import {
  createMusicFlow, addFiles, confirmScenes, beginConfirm, setTarget, ignoreFile,
  applyFlow, cancelFlow,
} from './music_flow.js';
import {
  sanitizeMusicName, filterImportable, MUSIC_MAX_BYTES, MUSIC_MAX_FILES, MUSIC_EXTS,
} from './music_store.js';

function el(tag, style, textContent) {
  var n = document.createElement(tag);
  if (style) n.style.cssText = style;
  if (textContent !== undefined && textContent !== null) n.appendChild(document.createTextNode(String(textContent)));
  return n;
}

function styleButton(btn, primary) {
  btn.style.cssText = [
    'cursor:pointer', 'border-radius:8px', 'padding:6px 12px', 'font-size:13px',
    'font-family:inherit', 'border:1px solid ' + (primary ? '#c9762a' : '#cbb08a'),
    'background:' + (primary ? '#e08b3c' : '#fdf6e7'),
    'color:' + (primary ? '#fff' : '#5a4630'),
  ].join(';');
  return btn;
}

/** 把 File 读成 base64（去掉 dataURL 前缀） */
function readBase64(file, cb) {
  var reader = new FileReader();
  reader.onload = function () {
    var s = String(reader.result || '');
    var comma = s.indexOf(',');
    cb(comma >= 0 ? s.slice(comma + 1) : s);
  };
  reader.onerror = function () { cb(null); };
  reader.readAsDataURL(file);
}

/**
 * 打开音乐面板。
 * @param {object} ctx {game, player, store, persist, onImported}
 */
export function openMusicPanel(ctx) {
  if (!ctx || !ctx.player || !ctx.store || !ctx.store.available) return null;
  var existing = document.getElementById('mah-music-panel');
  if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

  var game = ctx.game;
  var player = ctx.player;
  var store = ctx.store;
  var files = [];          // 已导入文件名（真实存在）
  var flow = null;         // 当前确认流程
  var message = '';

  var panel = el('div', [
    'position:fixed', 'left:50%', 'top:50%', 'transform:translate(-50%,-50%)',
    'z-index:10000', 'width:min(560px,92vw)', 'max-height:88vh', 'overflow:auto',
    'background:#fffaf0', 'color:#3a2a18', 'border:1px solid #d79b33',
    'border-radius:14px', 'padding:16px 18px',
    'font:13px/1.6 -apple-system,"Microsoft YaHei",sans-serif',
    'box-shadow:0 12px 40px rgba(0,0,0,.3)',
  ].join(';'));
  panel.id = 'mah-music-panel';
  panel.setAttribute('data-mah-music', '1');

  function reload(cb) {
    store.list(function (list) {
      files = list || [];
      if (cb) cb();
    });
  }

  function currentMap() {
    var src = (game && game.saveState) || {};
    return src.musicMap || {};
  }

  function saveMap(map) {
    if (!game) return;
    game.saveState = game.saveState || {};
    game.saveState.musicMap = map;
    player.setMap(map);
    if (ctx.player && player.scene) player.playScene(player.scene, true);
    if (typeof ctx.persist === 'function') ctx.persist(true);
  }

  function render() {
    while (panel.firstChild) panel.removeChild(panel.firstChild);
    var head = el('div', 'display:flex;align-items:center;justify-content:space-between;margin-bottom:6px');
    var t = el('div', 'font-size:17px;font-weight:800;color:#c9762a', '背景音乐');
    var close = styleButton(el('button', null, '关闭'), false);
    close.onclick = function () {
      if (typeof ctx.onClose === 'function') ctx.onClose();
      if (panel.parentNode) panel.parentNode.removeChild(panel);
    };
    head.appendChild(t); head.appendChild(close);
    panel.appendChild(head);
    panel.appendChild(el('div', 'font-size:11px;color:#8b7355;margin-bottom:10px',
      '音乐只来自你自己导入的文件 · 默认关闭 · 不会打包任何音频'));

    /* ---- 开关 / 音量 ---- */
    var row = el('div', 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px');
    var on = styleButton(el('button', null, game.musicOn ? '已开启' : '已关闭'), !!game.musicOn);
    on.onclick = function () {
      game.musicOn = !game.musicOn;
      player.setEnabled(game.musicOn);
      if (typeof ctx.persist === 'function') ctx.persist(true);
      render();
    };
    row.appendChild(el('span', 'font-weight:700', '总开关'));
    row.appendChild(on);
    row.appendChild(el('span', 'margin-left:10px;color:#8b7355', '音量'));
    var minus = styleButton(el('button', null, '−'), false);
    minus.onclick = function () {
      game.musicVol = Math.max(0, Math.round((game.musicVol - 0.1) * 100) / 100);
      player.setVolume(game.musicVol);
      if (typeof ctx.persist === 'function') ctx.persist(true);
      render();
    };
    var plus = styleButton(el('button', null, '＋'), false);
    plus.onclick = function () {
      game.musicVol = Math.min(1, Math.round((game.musicVol + 0.1) * 100) / 100);
      player.setVolume(game.musicVol);
      if (typeof ctx.persist === 'function') ctx.persist(true);
      render();
    };
    row.appendChild(minus);
    row.appendChild(el('span', 'min-width:38px;text-align:center', Math.round((game.musicVol || 0) * 100) + '%'));
    row.appendChild(plus);
    panel.appendChild(row);

    /* ---- 导入 / 清空 ---- */
    var row2 = el('div', 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px');
    var pick = styleButton(el('button', null, '导入音乐…'), true);
    var input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.' + MUSIC_EXTS.join(',.') + ',audio/*';
    input.style.display = 'none';
    pick.onclick = function () { input.click(); };
    input.onchange = function () { handleFiles(input.files); input.value = ''; };
    row2.appendChild(pick);
    row2.appendChild(input);
    var clear = styleButton(el('button', null, '清除全部音乐'), false);
    clear.onclick = function () {
      store.clearAll(function () {
        saveMap({});
        flow = null;
        message = '已清除全部音乐';
        reload(render);
      });
    };
    row2.appendChild(clear);
    row2.appendChild(el('span', 'color:#8b7355;font-size:11px',
      '支持 mp3 / ogg / wav，单个 ≤20MB，最多 ' + MUSIC_MAX_FILES + ' 首'));
    panel.appendChild(row2);

    if (message) {
      panel.appendChild(el('div', 'background:#fff3d6;border:1px solid #e6c07b;border-radius:8px;padding:6px 10px;margin-bottom:10px', message));
    }

    /* ---- 已导入文件 + 当前场景使用情况 ---- */
    var map = currentMap();
    var used = {};
    for (var sk in map) {
      if (!Object.prototype.hasOwnProperty.call(map, sk)) continue;
      for (var ui2 = 0; ui2 < map[sk].length; ui2++) used[map[sk][ui2]] = sk;
    }
    panel.appendChild(el('div', 'font-weight:700;margin:4px 0 4px', '各场景当前音乐'));
    var list = el('div', 'border:1px solid #e8d7b8;border-radius:8px;overflow:hidden;margin-bottom:10px');
    for (var i = 0; i < SCENES.length; i++) {
      var sc = SCENES[i];
      var names = map[sc] || [];
      var line = el('div', 'display:flex;gap:8px;align-items:center;padding:5px 10px;border-top:' + (i ? '1px solid #f0e2c8' : 'none'));
      line.appendChild(el('span', 'width:72px;font-weight:700;color:#7a5c33', SCENE_LABELS[sc]));
      if (!names.length) {
        line.appendChild(el('span', 'color:#a08c72;font-size:12px', '（未设置，静音）'));
      } else {
        for (var n = 0; n < names.length; n++) {
          var chip = el('span', 'background:#f6e6c8;border-radius:6px;padding:2px 6px;font-size:12px', names[n]);
          var off = styleButton(el('button', null, '停用'), false);
          off.style.padding = '1px 6px';
          off.style.fontSize = '11px';
          (function (scene, name) {
            off.onclick = function () {
              var m2 = currentMap();
              var arr = (m2[scene] || []).slice();
              var idx = arr.indexOf(name);
              if (idx >= 0) arr.splice(idx, 1);
              if (arr.length) m2[scene] = arr; else delete m2[scene];
              saveMap(m2);
              message = '已停用 ' + name;
              render();
            };
          })(sc, names[n]);
          chip.appendChild(document.createTextNode(' '));
          chip.appendChild(off);
          line.appendChild(chip);
        }
      }
      list.appendChild(line);
    }
    panel.appendChild(list);

    /* ---- 未分配文件（已导入但没有任何场景在用） ---- */
    var orphan = [];
    for (var f = 0; f < files.length; f++) if (!used[files[f]]) orphan.push(files[f]);
    if (orphan.length) {
      panel.appendChild(el('div', 'font-weight:700;margin:4px 0', '未分配 / 已停用'));
      var ol = el('div', 'border:1px dashed #d9c39b;border-radius:8px;padding:6px 10px;margin-bottom:10px;display:flex;gap:6px;flex-wrap:wrap');
      for (var oi = 0; oi < orphan.length; oi++) {
        var oc = el('span', 'background:#f2ead8;border-radius:6px;padding:2px 6px;font-size:12px', orphan[oi]);
        var del = styleButton(el('button', null, '删除'), false);
        del.style.padding = '1px 6px'; del.style.fontSize = '11px';
        (function (name) {
          del.onclick = function () {
            store.remove(name, function () {
              var m3 = currentMap();
              for (var k3 in m3) {
                if (!Object.prototype.hasOwnProperty.call(m3, k3)) continue;
                var arr3 = m3[k3].filter(function (x) { return x !== name; });
                if (arr3.length) m3[k3] = arr3; else delete m3[k3];
              }
              saveMap(m3);
              message = '已删除 ' + name;
              reload(render);
            });
          };
        })(orphan[oi]);
        oc.appendChild(document.createTextNode(' '));
        oc.appendChild(del);
        ol.appendChild(oc);
      }
      panel.appendChild(ol);
    }

    /* ---- 确认流程 ---- */
    if (!flow) {
      var man = styleButton(el('button', null, '管理 / 匹配…'), true);
      man.onclick = function () {
        flow = createMusicFlow(currentMap());
        message = '';
        render();
      };
      panel.appendChild(man);
    } else {
      panel.appendChild(renderFlow());
    }
  }

  function handleFiles(fileList) {
    if (!fileList || !fileList.length) return;
    var names = [];
    for (var i = 0; i < fileList.length; i++) names.push(fileList[i].name);
    var pre = filterImportable(names, files);
    var rejected = pre.rejected.slice();
    var toImport = [];
    for (var j = 0; j < fileList.length; j++) {
      var f = fileList[j];
      if (f.size > MUSIC_MAX_BYTES) {
        rejected.push({ name: f.name, reason: 'TOO_LARGE' });
        continue;
      }
      if (pre.accepted.indexOf(f.name) < 0) continue;
      toImport.push(f);
    }
    if (!toImport.length) {
      message = '没有可导入的文件：' + rejected.map(function (r) { return r.name + '(' + r.reason + ')'; }).join('、');
      render();
      return;
    }
    var left = toImport.length;
    var okNames = [];
    var failed = [];
    for (var k = 0; k < toImport.length; k++) {
      (function (file) {
        readBase64(file, function (b64) {
          if (!b64) { failed.push(file.name); left--; done(); return; }
          var payload = (store.kind === 'tauri') ? b64 : file;
          store.put(file.name, payload, function (ok, err) {
            if (ok) okNames.push(file.name); else failed.push(file.name + '(' + err + ')');
            left--;
            done();
          });
        });
      })(toImport[k]);
    }
    function done() {
      if (left > 0) return;
      message = '已导入 ' + okNames.length + ' 首'
        + (rejected.length ? '；拒绝 ' + rejected.map(function (r) { return r.name + '(' + r.reason + ')'; }).join('、') : '')
        + (failed.length ? '；失败 ' + failed.join('、') : '');
      flow = createMusicFlow(currentMap());
      addFiles(flow, okNames);
      reload(render);
    }
  }

  function renderFlow() {
    var box = el('div', 'border:1px solid #e0c79a;border-radius:10px;padding:10px 12px;background:#fffdf6');
    box.appendChild(el('div', 'font-weight:800;margin-bottom:6px', '导入 / 匹配流程'));

    if (flow.step === 'select') {
      box.appendChild(el('div', 'color:#8b7355;margin-bottom:6px',
        '第 1 步：已选 ' + flow.files.length + ' 个文件。第 2 步：先勾选要修改的场景。'));
      var wrap = el('div', 'display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px');
      var chosen = {};
      for (var i = 0; i < SCENES.length; i++) {
        var sc = SCENES[i];
        var lab = document.createElement('label');
        lab.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:12px';
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.onchange = function () { /* 收集时读取 */ };
        cb.setAttribute('data-scene', sc);
        lab.appendChild(cb);
        lab.appendChild(document.createTextNode(SCENE_LABELS[sc]));
        wrap.appendChild(lab);
      }
      box.appendChild(wrap);
      var okBtn = styleButton(el('button', null, '确认场景并匹配'), true);
      okBtn.onclick = function () {
        var picked = [];
        var boxes = wrap.getElementsByTagName('input');
        for (var b = 0; b < boxes.length; b++) {
          if (boxes[b].checked) picked.push(boxes[b].getAttribute('data-scene'));
        }
        var r = confirmScenes(flow, picked);
        message = r.ok ? '' : (r.error || '');
        render();
      };
      box.appendChild(okBtn);
      var cancel0 = styleButton(el('button', null, '取消'), false);
      cancel0.style.marginLeft = '8px';
      cancel0.onclick = function () { flow = cancelFlow(flow); flow = null; message = ''; render(); };
      box.appendChild(cancel0);
      void chosen;
      return box;
    }

    if (flow.step === 'match' || flow.step === 'confirm') {
      if (flow.step === 'match') {
        var toConfirm = styleButton(el('button', null, '开始逐条确认'), true);
        toConfirm.onclick = function () { beginConfirm(flow); render(); };
        box.appendChild(el('div', 'color:#8b7355;margin-bottom:6px',
          '第 3 步：文件名匹配建议（' + (flow.step === 'match' ? '可先调整' : '') + '）'));
        box.appendChild(toConfirm);
      }
      var table = el('div', 'margin:8px 0');
      for (var t = 0; t < flow.suggestions.length; t++) {
        var s = flow.suggestions[t];
        var line = el('div', 'display:flex;gap:8px;align-items:center;padding:4px 0;border-bottom:1px solid #f2e6cf');
        line.appendChild(el('span', 'flex:1;word-break:break-all;font-size:12px', s.name));
        var badge = s.confidence === 'exact' ? '明确' : (s.confidence === 'ambiguous' ? '歧义' : '未命中');
        line.appendChild(el('span', 'font-size:11px;color:#8b7355;width:42px', badge));
        var sel = document.createElement('select');
        sel.style.cssText = 'font-size:12px;padding:2px 4px;border-radius:6px;border:1px solid #cbb08a';
        var opt0 = document.createElement('option');
        opt0.value = ''; opt0.text = '（未分配）';
        sel.appendChild(opt0);
        for (var q = 0; q < flow.scenes.length; q++) {
          var op = document.createElement('option');
          op.value = flow.scenes[q];
          op.text = SCENE_LABELS[flow.scenes[q]];
          if (s.target === flow.scenes[q]) op.selected = true;
          sel.appendChild(op);
        }
        (function (name, selectEl) {
          selectEl.onchange = function () {
            var v = selectEl.value;
            if (v) setTarget(flow, name, v); else setTarget(flow, name, null);
            render();
          };
        })(s.name, sel);
        line.appendChild(sel);
        var ig = styleButton(el('button', null, '忽略'), false);
        ig.style.padding = '1px 6px'; ig.style.fontSize = '11px';
        (function (name) {
          ig.onclick = function () { ignoreFile(flow, name); render(); };
        })(s.name);
        line.appendChild(ig);
        table.appendChild(line);
      }
      box.appendChild(table);

      if (flow.unassigned && flow.unassigned.length) {
        box.appendChild(el('div', 'font-size:12px;color:#a4551f;margin-bottom:6px',
          '未分配：' + flow.unassigned.join('、') + '（可在上面下拉框手动指派，或点忽略）'));
      }

      var applyBtn = styleButton(el('button', null, '应用'), true);
      applyBtn.onclick = function () {
        if (flow.step !== 'confirm') { beginConfirm(flow); render(); return; }
        var r = applyFlow(flow);
        if (r.ok) {
          saveMap(r.musicMap);
          message = '已应用：' + flow.scenes.map(function (x) { return SCENE_LABELS[x]; }).join('、');
          flow = null;
        } else {
          message = r.error || '应用失败';
        }
        render();
      };
      box.appendChild(applyBtn);
      var cancel1 = styleButton(el('button', null, '取消'), false);
      cancel1.style.marginLeft = '8px';
      cancel1.onclick = function () { cancelFlow(flow); flow = null; message = '已取消，未写入任何改动'; render(); };
      box.appendChild(cancel1);
      return box;
    }

    box.appendChild(el('div', null, '流程已结束'));
    return box;
  }

  document.body.appendChild(panel);
  reload(render);
  return panel;
}
