/**
 * 游戏页面 — 把核心引擎（createNewGame / Game）与原版渲染链、微信平台层接线。
 *
 * 画面保真（渲染回归修复）：
 *  · 所有视觉由 Canvas 原版渲染链绘制（src/game/render.js 同源），WXML 只承载 canvas。
 *  · 点击链路与 Windows onDown 一致：先 UI 按钮命中（getUI + hitButton + handleButton），
 *    再判牌（cardAt）；胜负 / 暂停 / 设置面板均由 Canvas 绘制并由 Canvas 按钮驱动。
 *
 * 关键正确性（指令第六步「重开机制」五类场景）：
 *  · 每次进入本页 onLoad 都新建 session，绝不复用旧 Seed；
 *  · 5 类生成原因正确传递：application_restart / title_screen_restart /
 *    failure_restart / new_game / (返回首页再进入 = title_screen_restart)；
 *  · 第二关由 createNewGame 内部保证 20 套模板 + 最近 10 局双重去重。
 */
import { CanvasRenderer } from '../../renderer/canvas-renderer';
import { audio } from '../../services/audio';
import * as store from '../../services/storage';
import { vibrate, setResult, goHome } from '../../services/platform';

const Core = require('../../core/mah-core.js');

type GenReason = 'application_restart' | 'title_screen_restart' | 'failure_restart' | 'new_game';
const LEVEL_COUNT = 2;

Page({
  data: {},

  _renderer: null as CanvasRenderer | null,
  _game: null as any,
  _save: null as store.SaveBlob | null,
  _level: 1,
  _reason: 'new_game' as GenReason,
  _canvasReady: false,
  _startedAt: 0,
  _destroyed: false,

  onLoad(options: any) {
    this._destroyed = false;
    this._level = options.level === '2' ? 2 : 1;
    this._reason = (options.reason as GenReason) || 'title_screen_restart';

    this._save = store.loadSave();
    audio.init(this._save.settings);
    audio.onShow();

    this._renderer = new CanvasRenderer({
      // 真机 SelectorQuery 的 id 选择器大小写敏感：全小写才稳定命中
      canvasId: 'gamecanvas',
      getGame: () => this._game,
    });

    this._startedAt = Date.now();
    this.newGame(this._reason);
  },

  onReady() {
    const doInit = () => this._renderer!.init(this).then(() => {
      this._canvasReady = true;
      this._renderer!.invalidate();
    });
    doInit().catch((e: any) => {
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

  /** 核心：调用原版 createNewGame 生成新牌局，装载到 Game 实例。 */
  newGame(reason: GenReason) {
    try {
      const save = this._save || store.loadSave();
      const game = new Core.Game({
        pick: () => audio.pick(), match: () => audio.match(), deny: () => audio.deny(),
        win: () => audio.win(), lose: () => audio.lose(),
        shuffle: () => audio.shuffle(), undo: () => audio.undo(), remove: () => audio.remove(),
        revive: () => audio.revive(),
      });
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
      // 原版标题页字段：游戏页直接进入 play；暂停/设置初始关闭
      game.screen = 'play';
      game.paused = false;
      game.settingsAsk = false;
      game.uninstallAsk = false;
      game.audioUnlocked = true;
      // levelStartAt 由 createNewGame 内部 startLevel 用 nowMs() 设置，与 render.js 的
      // performance.now() 同一时间基准，此处不可覆盖（否则用时显示错乱）。
      // 内置资源音量为 0，避免设置面板重复暴露无用的音乐开关（与 audio.setMusic 一致）
      game.musicBuiltin = false;
      game.musicAvailable = false;
      game.soundOn = !!(save.settings && save.settings.soundOn);

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

  /** 胜负结算：只做一次（存档 + 结果），不自动跳页；面板由 Canvas overlay 呈现。 */
  recordResult(status: 'win' | 'lose') {
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
    this._save = save;
    audio.stopAll();
  },

  /** 状态轮询：胜负时记录一次结算，交给 Canvas 面板等待玩家点击。 */
  pollStatus() {
    const game = this._game;
    if (!game || this._destroyed) return;
    if (game.status === 'win') { this.recordResult('win'); return; }
    if (game.status === 'lose') { this.recordResult('lose'); return; }
    const self = this;
    setTimeout(() => { self.pollStatus(); }, 120);
  },

  /** Canvas 触摸：与 Windows onDown 一致，先判 UI 按钮，再判牌。 */
  onTouchStart(e: any) {
    const game = this._game;
    if (!game || !this._renderer) return;
    const t = e.touches && e.touches[0];
    if (!t) return;
    const lx = (t.x !== undefined ? t.x : t.clientX);
    const ly = (t.y !== undefined ? t.y : t.clientY);
    const logic = this._renderer.touchToLogic(lx, ly);
    console.log('[mah][touch]', JSON.stringify({ raw: [t.x, t.clientX], logic: [logic.x, logic.y], status: game.status, paused: game.paused, vp: this._renderer.getViewport() }));

    // 1) UI 按钮命中（覆盖层打开时只响应按钮，避免误触牌）
    const ui = Core.getUI(game);
    const btn = Core.hitButton(ui, logic.x, logic.y);
    if (btn) {
      if (btn.enabled === false) { audio.deny(); return; }
      this.handleButton(btn.id);
      return;
    }
    if (game.paused || game.settingsAsk || game.uninstallAsk) return;

    // 2) 牌命中（仅 play 且未暂停）
    if (game.screen !== 'play' || game.status !== 'play') return;
    const card = Core.cardAt(game, logic.x, logic.y);
    if (!card) return;
    if (card.state === 'temp') {
      if (game.pick(card)) {
        vibrate(this._save ? this._save.settings.vibrateOn : true, 'light');
        this._renderer.invalidate();
      }
      return;
    }
    if (game.canPick(card)) {
      game.pick(card);
      vibrate(this._save ? this._save.settings.vibrateOn : true, 'light');
      this._renderer.invalidate();
    } else if (card.state === 'board' && card.blocked) {
      vibrate(this._save ? this._save.settings.vibrateOn : true, 'heavy');
    }
  },

  /** 复刻 Windows src/main.js handleButton 的全部按钮分支。 */
  handleButton(id: string) {
    const game = this._game;
    if (!game) return;
    switch (id) {
      case 'start':
        this.newGame(game.graduated ? 'new_game' : 'title_screen_restart');
        break;
      case 'sound':
        game.soundOn = !game.soundOn;
        if (this._save) { this._save.settings.soundOn = game.soundOn; store.writeSave(this._save); }
        audio.setSound(game.soundOn);
        break;
      case 'settings':
        game._pausedBeforeSettings = game.paused;
        game.paused = true;
        game.settingsAsk = true;
        break;
      case 'settings-close':
        game.settingsAsk = false;
        game.paused = !!game._pausedBeforeSettings;
        break;
      case 'set-sfx':
        game.soundOn = !game.soundOn;
        if (this._save) { this._save.settings.soundOn = game.soundOn; store.writeSave(this._save); }
        audio.setSound(game.soundOn);
        break;
      case 'set-sfx-minus':
        game.sfxVol = Math.max(0, Math.round(((game.sfxVol ?? 0.6) - 0.1) * 100) / 100);
        if (this._save) { this._save.settings.sfxVol = game.sfxVol; store.writeSave(this._save); }
        audio.setVolume(game.sfxVol);
        break;
      case 'set-sfx-plus':
        game.sfxVol = Math.min(1, Math.round(((game.sfxVol ?? 0.6) + 0.1) * 100) / 100);
        if (this._save) { this._save.settings.sfxVol = game.sfxVol; store.writeSave(this._save); }
        audio.setVolume(game.sfxVol);
        break;
      case 'menu':
        game.paused = !game.paused;
        break;
      case 'resume':
        game.paused = false;
        break;
      case 'restart':
      case 'replay': {
        const lv = game.graduated ? 1 : game.level;
        const reason: GenReason = game.status === 'lose'
          ? 'failure_restart'
          : (game.graduated ? 'new_game' : 'title_screen_restart');
        this._level = lv;
        this.newGame(reason);
        break;
      }
      case 'next':
        this._level = Math.min(LEVEL_COUNT, game.level + 1);
        this.newGame('new_game');
        break;
      case 'home':
        goHome();
        break;
      case 'revive':
        if (game.useRevive()) {
          this.pollStatus();
        } else {
          wx.showToast({ title: '无法复活', icon: 'none' });
        }
        break;
      case 'shuffle':
        if (!game.useShuffle()) wx.showToast({ title: '洗牌不可用', icon: 'none' });
        break;
      case 'undo':
        if (!game.useUndo()) wx.showToast({ title: '无法撤销', icon: 'none' });
        break;
      case 'remove':
        if (!game.useRemove()) wx.showToast({ title: '移出不可用', icon: 'none' });
        break;
      case 'uninstall':
        wx.showModal({
          title: '如何卸载',
          content: '请在手机桌面长按小程序图标移除，或在微信「发现-小程序」中删除。',
          showCancel: false,
        });
        break;
      case 'uninstall-no':
        game.uninstallAsk = false;
        game.paused = false;
        break;
      default:
        return;
    }
    if (this._renderer) this._renderer.invalidate();
  },

  onShareAppMessage() {
    const CoreShare = require('../../services/share.js');
    return CoreShare.gameShare({ levelId: String(this._level), totalTiles: (this._game && this._game.cards || []).length });
  },
});
