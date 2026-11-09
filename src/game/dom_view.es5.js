/* ==========================================================================
 * 无 Canvas 时的 DOM 降级渲染器（纯 ES5，零依赖）
 *
 * 适用：IE8 / IE7（根本没有 <canvas>.getContext）、以及任何被策略禁用了
 * Canvas 的环境。IE9+ 有 Canvas，会走原来的完整像素渲染，不进这个文件。
 *
 * 设计要点：
 *   · 只做「渲染」，游戏逻辑、命中判定 (cardAt / hitButton) 仍复用 engine.js
 *     与 render.js 的纯函数 —— 逻辑坐标始终是 720×1280，所以点击换算不变；
 *   · 用绝对定位 div 代替 Canvas 绘制，按 z 顺序 append 即天然层叠；
 *   · 只有离散状态变化（点牌 / 撤销 / 洗牌 / 切屏）才全量重建 DOM，
 *     悬停高亮只改已有节点的边框，避免 IE8 每帧重建 210 个节点；
 *   · 视觉是「方块牌 + 系统字体文字」的简化版：IE8 没有 border-radius、
 *     rgba、box-shadow、渐变、Web Audio、Canvas，无法还原像素级美术。
 *     玩法、关卡、遮挡判定、道具、存档全部保持一致。
 * ========================================================================== */
(function (win, doc) {
  'use strict';

  var CN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  /* 第 3 轮：万子已删除，字牌 id 改为名字（zi-zhong / zi-fa / ...），
     一条是幺鸡（yaoji）。这里只用汉字，不出现阿拉伯数字。 */
  var HONOR_LABEL = {
    'zi-zhong': { text: '中', color: '#B5342B' },
    'zi-fa': { text: '發', color: '#2E7D32' },
    'zi-bai': { text: '白', color: '#26558F' },
    'zi-dong': { text: '東', color: '#20261F' },
    'zi-nan': { text: '南', color: '#20261F' }
  };

  function tileLabel(id) {
    var key = String(id || '');
    if (key === 'yaoji') return { text: '幺鸡', color: '#2E7D32' };
    if (Object.prototype.hasOwnProperty.call(HONOR_LABEL, key)) return HONOR_LABEL[key];
    var p = key.split('-');
    var n = parseInt(p[1], 10) || 0;
    if (p[0] === 'tiao') return { text: CN[n] + '条', color: '#2E7D32' };
    if (p[0] === 'tong') return { text: CN[n] + '筒', color: '#26558F' };
    return { text: '?', color: '#333333' };
  }

  function el(parent, css) {
    var d = doc.createElement('div');
    d.style.position = 'absolute';
    d.style.cssText = 'position:absolute;' + (css || '');
    parent.appendChild(d);
    return d;
  }

  /* 逻辑坐标 -> 显示像素 */
  function box(d, x, y, w, h, s) {
    d.style.left = Math.round(x * s) + 'px';
    d.style.top = Math.round(y * s) + 'px';
    d.style.width = Math.round(w * s) + 'px';
    d.style.height = Math.round(h * s) + 'px';
  }

  win.__MAH_DOM_VIEW__ = function (stage, canvas, W, H) {
    if (canvas) canvas.style.display = 'none';

    var root = doc.createElement('div');
    root.id = 'mah-dom-view';
    root.style.position = 'absolute';
    root.style.overflow = 'hidden';
    root.style.backgroundColor = '#171310';
    root.style.color = '#F0E5D2';
    root.style.fontFamily = '"Microsoft YaHei", "SimHei", "Segoe UI", sans-serif';
    stage.appendChild(root);

    var s = 1;
    var lastSig = '';
    var cardNodes = {};

    function resize(shownW, shownH, vw, vh) {
      root.style.width = Math.round(shownW) + 'px';
      root.style.height = Math.round(shownH) + 'px';
      root.style.left = Math.round((vw - shownW) / 2) + 'px';
      root.style.top = Math.round((vh - shownH) / 2) + 'px';
      var ns = shownW / W;
      if (Math.abs(ns - s) > 0.0001) { s = ns; lastSig = ''; }
    }

    function textDiv(parent, x, y, w, h, text, size, color, align) {
      var d = el(parent);
      box(d, x, y, w, h, s);
      d.style.textAlign = align || 'center';
      d.style.fontSize = Math.max(9, Math.round(size * s)) + 'px';
      d.style.fontWeight = 'bold';
      d.style.color = color || '#F0E5D2';
      d.style.lineHeight = Math.round(h * s) + 'px';
      d.style.overflow = 'hidden';
      d.innerHTML = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return d;
    }

    function tileDiv(parent, x, y, w, h, type, blocked, isSmall, expose) {
      var lab = tileLabel(type);
      var d = el(parent);
      box(d, x, y, w, h, s);
      d.style.backgroundColor = blocked ? '#DDD7C6' : '#FFFDF5';
      var bw = Math.max(2, Math.round(2 * s));
      d.style.border = bw + 'px solid ' + (blocked ? '#4E7A52' : '#2E7D32');
      d.style.overflow = 'hidden';
      /* 阴影只给可点的顶层牌：IE8 的 Shadow filter 很贵，210 个会卡死 */
      if (!blocked) {
        d.style.boxShadow = Math.round(4 * s) + 'px ' + Math.round(6 * s) + 'px ' + Math.round(9 * s) + 'px #000000';
        try { d.style.filter = "progid:DXImageTransform.Microsoft.Shadow(color='#000000',Direction=135,Strength=5)"; } catch (e) {}
      }
      var fs = Math.min(w, h) * (isSmall ? 0.40 : 0.35);
      var inner = doc.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '100%';
      inner.style.textAlign = 'center';
      /* 不换行：IE8 里「三萬」两字一旦折到第二行就会被 overflow 裁掉半个字 */
      inner.style.whiteSpace = 'nowrap';
      inner.style.fontWeight = 'bold';
      inner.style.color = blocked ? '#8A836E' : lab.color;
      inner.innerHTML = lab.text;
      /* 被压住时把文字挪进"露出来的那条缝"里 —— 否则上层牌正好压在字上，
         IE8 玩家看到的永远是半个字，认不出是什么牌 */
      if (blocked && expose) {
        var bandH = Math.max(10, expose.y1 - expose.y0);
        /* 缝里放不下两个字，只留前一个字：四萬→四 / 3条→3 / 東→東。
           颜色仍在（红=万、绿=条、蓝=筒），所以不会认错花色种类 */
        if (bandH < h * 0.62) {
          inner.innerHTML = String(lab.text).charAt(0);
          fs = Math.min(w, bandH) * 0.72;
        }
        inner.style.height = Math.round(bandH * s) + 'px';
        inner.style.paddingTop = Math.round(Math.max(0, expose.y0) * s) + 'px';
        inner.style.lineHeight = Math.max(1, Math.round(bandH * s)) + 'px';
      } else {
        inner.style.lineHeight = Math.max(1, Math.round(h * s) - bw * 2) + 'px';
      }
      inner.style.fontSize = Math.max(9, Math.round(fs * s)) + 'px';
      d.appendChild(inner);
      return d;
    }

    function drawBoard(game) {
      var L = game.layout;
      var alive = [], i;
      for (i = 0; i < game.cards.length; i++) {
        if (game.cards[i].state === 'board') alive.push(game.cards[i]);
      }
      alive.sort(function (a, b) { return a.z - b.z || a.y - b.y || a.x - b.x; });

      cardNodes = {};
      for (i = 0; i < alive.length; i++) {
        var c = alive[i];
        var d = tileDiv(root, c.x, c.y, L.tileW, L.tileH, c.type, !!c.blocked, false, c.expose);
        d.style.zIndex = String(100 + c.z * 10);
        cardNodes[c.id] = d;
      }
    }

    function drawSlot(game) {
      /* 删掉侧堆后槽位面板重新排布：坐标 / 牌尺寸全部从 game.layout.slot 读，
         它直接来自 config.js 的 SLOT_PANEL / SLOT_PITCH / TILE_W / TILE_H。
         ES5 降级视图不能 import，所以这里不再硬编码任何数字。 */
      var S = game.layout.slot;
      var panel = el(root);
      box(panel, S.x, S.y, S.w, S.h, s);
      panel.style.backgroundColor = '#161311';
      panel.style.border = '1px solid #3A3128';
      panel.style.zIndex = '300';
      var g, i;
      for (i = 1; i < S.capacity; i++) {
        g = el(panel);
        g.style.left = Math.round((12 + i * S.pitch) * s) + 'px';
        g.style.top = '0';
        g.style.width = '1px';
        g.style.height = '100%';
        g.style.backgroundColor = '#3A3128';
      }
      for (i = 0; i < game.slot.length && i < S.capacity; i++) {
        tileDiv(panel, S.padX + i * S.pitch, S.padY, S.cardW, S.cardH,
          game.slot[i].type, false, true).style.zIndex = '310';
      }
    }

    function drawButtons(ui) {
      for (var i = 0; i < ui.buttons.length; i++) {
        var b = ui.buttons[i];
        var d = el(root);
        box(d, b.x, b.y, b.w, b.h, s);
        d.style.zIndex = '400';
        d.style.textAlign = 'center';
        d.style.overflow = 'hidden';
        var enabled = b.enabled !== false;
        var primary = b.kind === 'primary';
        var danger = b.kind === 'danger' || b.kind === 'danger-ghost';
        d.style.backgroundColor = primary
          ? (enabled ? '#C79A4A' : '#5C4A2E')
          : (danger ? (enabled ? '#5A2018' : '#241512') : (enabled ? '#2A241E' : '#211D19'));
        d.style.border = '1px solid ' + (primary ? '#EBCB86' : (danger ? '#C8452F' : '#6A5B45'));
        d.style.color = enabled ? (danger && !primary ? '#F0A08C' : '#F5E9D2') : '#7A7365';
        d.style.fontWeight = 'bold';
        d.style.fontSize = Math.max(9, Math.round((b.size || 20) * s)) + 'px';
        d.style.lineHeight = Math.round(b.h * s) + 'px';
        if (!b.label) {
          d.innerHTML = b.id === 'menu' ? '≡' : (b.id === 'sound' ? '♪' : '');
        } else {
          d.innerHTML = String(b.label);
        }
        if (b.kind === 'tool' && b.count != null) {
          var badge = doc.createElement('div');
          badge.style.position = 'absolute';
          /* 必须显式给宽高和行高：父按钮的 line-height 会被继承，
             不设的话 IE8 会把徽章拉成一条红色竖柱。 */
          var bs = Math.max(14, Math.round(18 * s));
          badge.style.right = Math.round(2 * s) + 'px';
          badge.style.top = Math.round(2 * s) + 'px';
          badge.style.width = bs + 'px';
          badge.style.height = bs + 'px';
          badge.style.lineHeight = bs + 'px';
          badge.style.textAlign = 'center';
          badge.style.overflow = 'hidden';
          badge.style.fontSize = Math.max(9, Math.round(11 * s)) + 'px';
          badge.style.fontWeight = 'bold';
          badge.style.color = '#FFFFFF';
          badge.style.backgroundColor = b.count > 0 ? '#C8452F' : '#6A6258';
          badge.innerHTML = String(b.count);
          d.appendChild(badge);
        }
      }
    }

    function drawHUD(game) {
      textDiv(root, 0, 22, W, 52, 'Mah 了个 Mah', 34, '#EBCB86');
      if (game.screen === 'play') {
        var left = 0;
        for (var i = 0; i < game.cards.length; i++) if (game.cards[i].state === 'board') left++;
        textDiv(root, 0, 76, W, 30, '第 ' + game.level + ' 关 · 共 2 关　剩 ' + left + ' 张', 18, '#D8C9AF');
      }
    }

    function drawOverlay(game) {
      if (game.screen !== 'play') return;
      var msg = '';
      if (game.paused) msg = '已暂停';
      else if (game.status === 'win') msg = game.graduated ? '毕业！全部通关' : '本关通关！';
      else if (game.status === 'lose') msg = '槽位已满 · 挑战失败';
      if (!msg) return;
      var p = el(root);
      box(p, 90, 520, 540, 150, s);
      p.style.zIndex = '390';
      p.style.backgroundColor = '#241D18';
      p.style.border = '2px solid #C79A4A';
      p.style.textAlign = 'center';
      p.style.color = '#EBCB86';
      p.style.fontWeight = 'bold';
      p.style.fontSize = Math.max(12, Math.round(28 * s)) + 'px';
      p.style.lineHeight = Math.round(150 * s) + 'px';
      p.innerHTML = msg;
    }

    function rebuild(game, ui) {
      root.innerHTML = '';
      /* 背景：IE8 不支持 CSS 渐变，用实色 + 顶部暖色带 */
      var band = el(root);
      box(band, 0, 0, W, 160, s);
      band.style.backgroundColor = '#2A1C13';
      band.style.zIndex = '0';

      if (game.screen === 'title') {
        textDiv(root, 0, 300, W, 80, 'Mah 了个 Mah', 56, '#EBCB86');
        textDiv(root, 0, 400, W, 50, '堆叠卡牌三消 · 两关制', 22, '#C9B694');
      } else {
        drawBoard(game);
        drawSlot(game);
        drawOverlay(game);
      }
      drawHUD(game);
      drawButtons(ui);
    }

    function render(game, ui) {
      var sig = [
        game.screen, game.status, game.paused ? 1 : 0,
        game.boardRev || 0, game.slot.length,
        game.props.shuffle, game.props.undo, game.props.remove,
        game.level, s.toFixed(3), ui.buttons.length
      ].join('|');
      if (sig !== lastSig) { rebuild(game, ui); lastSig = sig; }

      /* 悬停高亮：不重建，只改边框 */
      for (var id in cardNodes) {
        if (!Object.prototype.hasOwnProperty.call(cardNodes, id)) continue;
        var c = null, i;
        for (i = 0; i < game.cards.length; i++) if (String(game.cards[i].id) === String(id)) { c = game.cards[i]; break; }
        var hovered = c && !c.blocked && String(game.hoverId) === String(c.id);
        cardNodes[id].style.borderColor = hovered ? '#EBCB86' : (c && c.blocked ? '#4E7A52' : '#2E7D32');
        cardNodes[id].style.borderWidth = (hovered ? Math.max(3, Math.round(3 * s)) : Math.max(2, Math.round(2 * s))) + 'px';
      }
    }

    return {
      root: root,
      resize: resize,
      render: render,
      getRect: function () { return root.getBoundingClientRect(); }
    };
  };
})(window, document);
