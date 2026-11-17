/**
 * 游戏页面 — 把核心引擎（createNewGame / Game）与微信平台层（Canvas / 触摸 / 存储）接线。
 *
 * 关键正确性（对应指令第六步「重开机制」五类场景）：
 *  · 每次进入本页 onLoad 都新建 session，绝不复用旧 Seed；
 *  · 5 类生成原因正确传递：application_restart / title_screen_restart /
 *    failure_restart / new_game / (返回首页再进入 = title_screen_restart)；
 *  · 第二关由 createNewGame 内部保证 20 套模板 + 最近 10 局双重去重，
 *    并记录 templateId / seed / difficultyId / 牌数。
 *
 * 道具（洗牌/撤销/移出/复活）：引擎已实现，本页暴露按钮并正确接线。
 *  · 移出产生的临时区牌：命中后直接 game.pick() 分流回槽位（canPick 只认 board，
 *    不能用于 temp，否则「点得到却点不动」）；
 *  · 复活：失败时若 reviveLeft>0，先弹窗询问，确认后 useRevive 继续本局，
 *    否则才进结算。
 */
import { CanvasRenderer } from '../../renderer/canvas-renderer';
import { TouchHandler } from '../../renderer/touch-handler';
import { audio } from '../../services/audio';
import * as store from '../../services/storage';
import { vibrate, setResult, goHome } from '../../services/platform';

const Core = require('../../core/mah-core.js');

type GenReason = 'application_restart' | 'title_screen_restart' | 'failure_restart' | 'new_game';

Page({
  data: {
    levelId: '1',
    levelName: '第一关',
    templateId: '' as string,
    seedText: '' as string,
    remaining: 0,
    total: 0,
    progress: 0,
    status: 'play',
    // 道具数量与可用性（由 _syncProps 从引擎同步）
    propShuffle: 0,
    propUndo: 0,
    propRemove: 0,
    reviveLeft: 0,
    canUndo: false,
    canRemove: false,
    // 弹窗状态
    showRestartConfirm: false,
    showReviveAsk: false,
    hudText: '' as string,
  },

  _renderer: null as CanvasRenderer | null,
  _touch: null as TouchHandler | null,
  _game: null as any,
  _save: null as store.SaveBlob | null,
  _level: 1,
  _reason: 'new_game' as GenReason,
  _canvasReady: false,
  _startedAt: 0,
  _destroyed: false,
  _reviveAsked: false,

  onLoad(options: any) {
    this._destroyed = false;
    this._reviveAsked = false;
    this._level = options.level === '2' ? 2 : 1;
    // 「返回首页后再次进入」= title_screen_restart（独立新 session）
    this._reason = (options.reason as GenReason) || 'title_screen_restart';
    this.setData({ levelId: String(this._level), levelName: this._level === 1 ? '第一关' : '第二关' });

    this._save = store.loadSave();
    audio.init(this._save.settings);
    audio.onShow();

    this._touch = new TouchHandler();
    this._renderer = new CanvasRenderer({
      // 真机 SelectorQuery 的 id 选择器大小写敏感：全小写才稳定命中（模拟器大小写均可，掩盖了此问题）
      canvasId: 'gamecanvas',
      getGame: () => this._game,
    });

    this._startedAt = Date.now();
    // 生成新牌局（onLoad 同步完成，canvas 就绪后再首帧绘制）
    this.newGame(this._reason);
  },

  onReady() {
    const doInit = () => this._renderer!.init(this).then(() => {
      this._canvasReady = true;
      this._renderer!.invalidate();
    });
    doInit().catch((e: any) => {
      // 首次失败常见于真机首帧节点未布局完成，延迟 300ms 重试一次
      console.warn('[mah] canvas init 首次失败，重试', e);
      setTimeout(() => {
        if (this._destroyed || !this._renderer) return;
        doInit().catch((e2: any) => {
          console.error('[mah] canvas init failed', e2);
          wx.showModal({
            title: '画布初始化失败',
            content: '请截图此信息反馈：' + (e2 && e2.message ? e2.message : String(e2)),
            showCancel: false,
          });
        });
      }, 300);
    });
  },

  onShow() {
    audio.onShow();
    if (this._renderer) this._renderer.onShow();
  },

  onHide() {
    audio.onHide();
    if (this._renderer) this._renderer.onHide();
  },

  onUnload() {
    this._destroyed = true;
    audio.stopAll();
    if (this._renderer) { this._renderer.destroy(); this._renderer = null; }
    this._game = null;
  },

  /** 把引擎内道具数量 / 可用性同步到 WXML，保证视觉与真实槽位数据一致。 */
  _syncProps() {
    const game = this._game;
    if (!game) return;
    this.setData({
      propShuffle: game.props.shuffle,
      propUndo: game.props.undo,
      propRemove: game.props.remove,
      reviveLeft: game.reviveLeft,
      canUndo: game.props.undo > 0 && (game.history ? game.history.length : 0) > 0 && game.status === 'play',
      canRemove: game.props.remove > 0 && (game.slot ? game.slot.length : 0) > 0 && game.status === 'play',
    });
  },

  /** 核心：调用原版 createNewGame 生成新牌局，装载到 Game 实例。 */
  newGame(reason: GenReason, keepProfile = false) {
    try {
      const save = this._save || store.loadSave();
      const game = new Core.Game({
        pick: () => audio.pick(), match: () => audio.match(), deny: () => audio.deny(),
        win: () => audio.win(), lose: () => audio.lose(),
        shuffle: () => audio.shuffle(), undo: () => audio.undo(), remove: () => audio.remove(),
        revive: () => audio.revive(),
      });
      // 恢复档位（影响难度分布）；保留 profile 时不改
      if (save.profile && !keepProfile) {
        // profile 由 createNewGame 依据历史自行决定「≠ 当前档位」，这里注入历史最后档位
      }
      game.saveState = {
        level1RecentGames: save.level1RecentGames,
        level2RecentGames: save.level2RecentGames,
      };

      const result = Core.createNewGame({
        level: this._level,
        generationReason: reason,
        game,
        save: game.saveState,
      });

      this._game = game;
      this._startedAt = Date.now();
      this._reviveAsked = false;

      // 同步历史与新档位到存档
      save.profile = { l1: game.profile.l1, l2: game.profile.l2 };
      store.syncCoreHistory(save, result.nextSave);

      const meta = result.meta || {};
      const session: store.RecentSession = {
        sessionId: meta.gameId || ('s-' + Date.now()),
        levelId: String(this._level),
        templateId: meta.templateId || (this._level === 2 ? (game.templateId || null) : null),
        seed: String(meta.seed),
        difficultyId: String(meta.difficultyId),
        totalTiles: meta.totalTiles,
        createdAt: Date.now(),
      };
      store.pushRecentSession(save, session);
      store.writeSave(save);
      this._save = save;

      this.setData({
        templateId: session.templateId || '—',
        seedText: session.seed,
        remaining: game.remaining(),
        total: (game.cards || []).length,
        progress: 0,
        status: 'play',
        showReviveAsk: false,
      });
      this._syncProps();
      if (this._renderer) this._renderer.invalidate();
      this.pollStatus();
    } catch (e: any) {
      console.error('[mah] createNewGame failed', e);
      wx.showModal({
        title: '牌局生成失败',
        content: '无法生成合法牌局，请重试。' + (e && e.message ? '\n' + e.message : ''),
        showCancel: false,
        success: () => { goHome(); },
      });
    }
  },

  /** 轮询游戏状态：处理胜利 / 失败（含复活询问）/ 道具可用性刷新。 */
  pollStatus() {
    const game = this._game;
    if (!game || this._destroyed) return;
    const remaining = game.remaining();
    const total = (game.cards || []).length;
    this.setData({
      remaining,
      total,
      progress: total ? Math.round((1 - remaining / total) * 100) : 0,
    });
    // 道具可用性随槽位 / 历史变化（温和刷新）
    this._syncProps();

    if (game.status === 'win') {
      this.finish('win');
      return;
    }
    if (game.status === 'lose') {
      // 失败：若还有复活机会且未询问过，先弹窗；否则进结算
      if (game.reviveLeft > 0 && !this._reviveAsked) {
        this._reviveAsked = true;
        this.setData({ showReviveAsk: true });
      }
      return; // 等待用户复活/放弃，不自动跳转
    }
    // 持续轮询直到离开本页（频率温和，避免耗电）
    const self = this;
    setTimeout(() => { self.pollStatus(); }, 120);
  },

  finish(status: 'win' | 'lose') {
    const game = this._game;
    if (!game || game._resultShown) return;
    game._resultShown = true;
    const meta = game.meta || {};
    const durationMs = Date.now() - this._startedAt;
    const result = {
      won: status === 'win',
      levelId: String(this._level),
      templateId: game.templateId || meta.templateId || null,
      seed: String(meta.seed ?? game.seed),
      sessionId: meta.gameId || '',
      totalTiles: meta.totalTiles ?? (game.cards || []).length,
      durationMs,
      difficultyId: meta.difficultyId,
      revived: !!game.revived,
    };
    setResult(result);
    // 更新战绩存档
    const save = this._save || store.loadSave();
    if (status === 'win') {
      save.wins += 1;
      save.bestLevel = Math.max(save.bestLevel, Math.min(2, this._level + 1));
    } else {
      save.losses += 1;
    }
    const recent = save.recentSessions;
    if (recent.length) { recent[recent.length - 1].result = status; recent[recent.length - 1].durationMs = durationMs; }
    store.writeSave(save);
    audio.stopAll();
    wx.navigateTo({ url: '/pages/result/index' });
  },

  /** Canvas 触摸：微信小程序原生 bindtouchstart，坐标相对 canvas CSS 像素。 */
  onTouchStart(e: any) {
    const game = this._game;
    if (!game || game.status !== 'play' || !this._renderer) return;
    const t = e.touches && e.touches[0];
    if (!t) return;
    const lx = (t.x !== undefined ? t.x : t.clientX);
    const ly = (t.y !== undefined ? t.y : t.clientY);
    // SelectorQuery 返回的 touch.x/y 已是相对组件左上角的 CSS 坐标
    const logic = this._renderer.touchToLogic(lx, ly);
    const card = this._touch!.hitCard(game, logic.x, logic.y);
    if (!card) return;
    if (card.state === 'temp') {
      // 临时区牌：canPick 只认 board，直接交给 pick 分流到 returnFromTemp
      if (game.pick(card)) {
        vibrate(this._save ? this._save.settings.vibrateOn : true, 'light');
        this._syncProps();
        if (this._renderer) this._renderer.invalidate();
      }
      return;
    }
    if (game.canPick(card)) {
      game.pick(card);
      vibrate(this._save ? this._save.settings.vibrateOn : true, 'light');
      this._syncProps();
      if (this._renderer) this._renderer.invalidate();
    } else if (card.state === 'board' && card.blocked) {
      vibrate(this._save ? this._save.settings.vibrateOn : true, 'heavy');
    }
  },

  /* -------------------- 道具操作 -------------------- */

  onShuffle() {
    const game = this._game;
    if (!game || game.status !== 'play') return;
    if (game.useShuffle()) {
      this._syncProps();
      if (this._renderer) this._renderer.invalidate();
    } else {
      wx.showToast({ title: '洗牌不可用', icon: 'none' });
    }
  },

  onUndo() {
    const game = this._game;
    if (!game || game.status !== 'play') return;
    if (game.useUndo()) {
      this._syncProps();
      if (this._renderer) this._renderer.invalidate();
    } else {
      wx.showToast({ title: '无法撤销', icon: 'none' });
    }
  },

  onRemove() {
    const game = this._game;
    if (!game || game.status !== 'play') return;
    if (game.useRemove()) {
      this._syncProps();
      if (this._renderer) this._renderer.invalidate();
    } else {
      wx.showToast({ title: '移出不可用', icon: 'none' });
    }
  },

  /** 复活：确认后清空槽位继续本局，不跳转结算。 */
  onConfirmRevive() {
    const game = this._game;
    this.setData({ showReviveAsk: false });
    if (!game) return;
    if (game.useRevive()) {
      this._syncProps();
      if (this._renderer) this._renderer.invalidate();
      wx.showToast({ title: '已复活，继续', icon: 'success' });
      // 复活后 game.status 回到 play，重新启动轮询
      this.pollStatus();
    } else {
      // 极端情况：复活失败则直接结算
      this.finish('lose');
    }
  },

  /** 放弃复活：进入结算。 */
  onDeclineRevive() {
    this.setData({ showReviveAsk: false });
    this.finish('lose');
  },

  /** 重新开始：根据当前 status 选择正确原因，重开必换新 seed / 模板。 */
  onRestart() {
    const reason: GenReason = this._game && this._game.status === 'lose' ? 'failure_restart' : 'new_game';
    this.newGame(reason);
  },

  onBack() {
    goHome();
  },

  onShareAppMessage() {
    const CoreShare = require('../../services/share.js');
    return CoreShare.gameShare({
      levelId: String(this._level), totalTiles: this.data.total,
    });
  },
});
