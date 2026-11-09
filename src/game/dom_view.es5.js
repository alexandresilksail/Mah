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
 *     悬停高亮只改已有节点的边框，避免 IE8 每帧重建 240 个节点；
 *   · v2.0.0：16 种牌型的短标签 / 独立配色内嵌在此（ES5 不能 import），
 *     与 src/game/tile_types.js 的 TILE_TYPES 一一对应；被压牌做灰化压暗，
 *     背景与按钮统一换成暖白 / 奶油底 + 橙珊瑚红蓝。
 * ========================================================================== */
(function (win, doc) {
  'use strict';

  /* 与 tile_types.js 的 16 个稳定 ID 一一对应：短标签 / 图案主色 / 牌面底色 */
  var TILE_LABEL = {
    'sparrow':       { text: '雀', color: '#176B4A', face: '#E6F6EC' },
    'red-centre':    { text: '中', color: '#A82C1C', face: '#FDE9E4' },
    'green-fa':      { text: '發', color: '#27621F', face: '#E8F4D9' },
    'blue-frame':    { text: '框', color: '#1E4E8C', face: '#E4F0FD' },
    'coin-1':        { text: '金', color: '#8A5E12', face: '#FFF3D6' },
    'coin-3':        { text: '三', color: '#593389', face: '#F1E8FB' },
    'bamboo-2':      { text: '竹', color: '#2F6B21', face: '#E9F6E2' },
    'bamboo-5':      { text: '五', color: '#12645A', face: '#DEF2EE' },
    'flower-plum':   { text: '梅', color: '#9B2F5C', face: '#FDE8F0' },
    'flower-orchid': { text: '兰', color: '#49308A', face: '#F0E9FC' },
    'flower-chrys':  { text: '菊', color: '#945413', face: '#FFF0DA' },
    'fish':          { text: '鲤', color: '#A83A24', face: '#FFE9DF' },
    'moon':          { text: '月', color: '#2A357A', face: '#E7EAFB' },
    'sun':           { text: '日', color: '#9A6B12', face: '#FFF4CF' },
    'cloud':         { text: '云', color: '#1D6389', face: '#E3F4FB' },
    'star':          { text: '星', color: '#5F3086', face: '#F6EBFF' }
  };
  /* 旧版 ID 兜底，避免老存档在兼容版里显示 '?' */
  var LEGACY_LABEL = {
    'yaoji':     { text: '雀', color: '#176B4A', face: '#E6F6EC' },
    'zi-zhong':  { text: '中', color: '#A82C1C', face: '#FDE9E4' },
    'zi-fa':     { text: '發', color: '#27621F', face: '#E8F4D9' },
    'zi-bai':    { text: '框', color: '#1E4E8C', face: '#E4F0FD' }
  };

  function tileLabel(id) {
    var key = String(id || '');
    if (Object.prototype.hasOwnProperty.call(TILE_LABEL, key)) return TILE_LABEL[key];
    if (Object.prototype.hasOwnProperty.call(LEGACY_LABEL, key)) return LEGACY_LABEL[key];
    return { text: '?', color: '#4A3524', face: '#FFFDF6' };
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
    root.style.backgroundColor = '#F7EEDC';
    root.style.color = '#4A3524';
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
      d.style.color = color || '#4A3524';
      d.style.lineHeight = Math.round(h * s) + 'px';
      d.style.overflow = 'hidden';
      d.innerHTML = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return d;
    }

    function tileDiv(parent, x, y, w, h, type, blocked, isSmall, expose) {
      var lab = tileLabel(type);
      var d = el(parent);
      box(d, x, y, w, h, s);
      /* 被压牌：牌面压暗（IE8 无 rgba，用手动混出的灰化实色）+ 灰边框 */
      d.style.backgroundColor = blocked ? '#D9D2C2' : lab.face;
      var bw = Math.max(2, Math.round(2 * s));
      d.style.border = bw + 'px solid ' + (blocked ? '#9B8D77' : lab.color);
      d.style.overflow = 'hidden';
      /* 阴影只给可点的顶层牌：IE8 的 Shadow filter 很贵，240 个会卡死 */
      if (!blocked) {
        d.style.boxShadow = Math.round(3 * s) + 'px ' + Math.round(4 * s) + 'px ' + Math.round(8 * s) + 'px #C4A985';
        try { d.style.filter = "progid:DXImageTransform.Microsoft.Shadow(color='#C4A985',Direction=135,Strength=4)"; } catch (e) {}
      }
      var fs = Math.min(w, h) * (isSmall ? 0.40 : 0.35);
      var inner = doc.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '100%';
      inner.style.textAlign = 'center';
      /* 不换行：IE8 里两个字一旦折到第二行就会被 overflow 裁掉半个字 */
      inner.style.whiteSpace = 'nowrap';
      inner.style.fontWeight = 'bold';
      inner.style.color = blocked ? '#7A6F5C' : lab.color;
      inner.innerHTML = lab.text;
      /* 被压住时把文字挪进「露出来的那条缝」里，避免上层牌压住字 */
      if (blocked && expose) {
        var bandH = Math.max(10, expose.y1 - expose.y0);
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
      /* 坐标 / 牌尺寸全部从 game.layout.slot 读，ES5 降级视图不能 import。 */
      var S = game.layout.slot;
      var panel = el(root);
      box(panel, S.x, S.y, S.w, S.h, s);
      panel.style.backgroundColor = '#FFFDF6';
      panel.style.border = '1px solid #D8C6A8';
      panel.style.zIndex = '300';
      var g, i;
      for (i = 1; i < S.capacity; i++) {
        g = el(panel);
        g.style.left = Math.round((12 + i * S.pitch) * s) + 'px';
        g.style.top = '0';
        g.style.width = '1px';
        g.style.height = '100%';
        g.style.backgroundColor = '#E3D5BC';
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
          ? (enabled ? '#F08A3C' : '#D8C6A8')
          : (danger ? (enabled ? '#E4634A' : '#D8C6A8') : (enabled ? '#3E7FC1' : '#D8C6A8'));
        d.style.border = '1px solid ' + (primary ? '#C4651F' : (danger ? '#B8452F' : '#2D5E92'));
        d.style.color = enabled ? '#FFFFFF' : '#8B7154';
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
          /* 必须显式给宽高和行高：父按钮的 line-height 会被继承 */
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
          badge.style.backgroundColor = b.count > 0 ? '#E4634A' : '#A9987E';
          badge.innerHTML = String(b.count);
          d.appendChild(badge);
        }
      }
    }

    function drawHUD(game) {
      textDiv(root, 0, 22, W, 52, 'Mah 了个 Mah', 34, '#C4651F');
      if (game.screen === 'play') {
        var left = 0;
        for (var i = 0; i < game.cards.length; i++) if (game.cards[i].state === 'board') left++;
        textDiv(root, 0, 76, W, 30, '第 ' + game.level + ' 关 · 共 2 关　剩 ' + left + ' 张', 18, '#8B7154');
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
      p.style.backgroundColor = '#FFFDF6';
      p.style.border = '2px solid #F08A3C';
      p.style.textAlign = 'center';
      p.style.color = '#C4651F';
      p.style.fontWeight = 'bold';
      p.style.fontSize = Math.max(12, Math.round(28 * s)) + 'px';
      p.style.lineHeight = Math.round(150 * s) + 'px';
      p.innerHTML = msg;
    }

    function rebuild(game, ui) {
      root.innerHTML = '';
      /* 背景：IE8 不支持 CSS 渐变，用实色 + 顶部暖白标题带 */
      var band = el(root);
      box(band, 0, 0, W, 160, s);
      band.style.backgroundColor = '#FFFDF6';
      band.style.zIndex = '0';

      if (game.screen === 'title') {
        textDiv(root, 0, 300, W, 80, 'Mah 了个 Mah', 56, '#C4651F');
        textDiv(root, 0, 400, W, 50, '堆叠卡牌三消 · 两关制', 22, '#8B7154');
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
        var lab = c ? tileLabel(c.type) : { color: '#2E8B62' };
        cardNodes[id].style.borderColor = hovered ? '#F08A3C' : (c && c.blocked ? '#9B8D77' : lab.color);
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
