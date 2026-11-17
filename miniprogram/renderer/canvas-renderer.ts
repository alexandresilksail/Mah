/**
 * 微信小程序 Canvas 2D 主渲染器 — 严格复刻 Windows 桌面版 frame() 渲染链。
 *
 * 画面保真原则（渲染回归修复）：
 *  · 所有界面元素（背景 / 牌堆 / 槽位 / 道具 / HUD / 特效 / 胜负·暂停·设置覆盖层）
 *    全部调用 src/game/render.js 的原版函数（经 mah-core.js 导出，字节级同源）；
 *    微信端不重写任何外观相似的实现，杜绝新旧两套界面叠加。
 *  · 渲染顺序、逻辑坐标系（720×1280）、缩放与命中矩阵与 Windows 完全一致。
 *
 * 时间单位：Windows frame() 用秒（dt = min(0.05,(now-prev)/1000)），
 * 引擎 tick(dt) 也按秒推进（time+=dt, clock+=dt*1000, shake-=dt*4）。
 * 本渲染器 RAF 回调收到毫秒，统一在 frame() 内换算为秒再传给 tick —— 与桌面版一致。
 *
 * 健壮性：单帧绘制分阶段 try/catch，记录阶段 / 错误名 / 堆栈；任一阶段异常都不终止
 * RAF 循环；切后台暂停、回前台恢复、页面卸载彻底停止，全周期只有一个 RAF 循环。
 */
import { CoordinateTransform } from './coordinate-transform';

const Core = require('../core/mah-core.js');

// 原版 render.js 多处用 performance.now() 计算用时/动画；部分小程序基础库无全局
// performance，缺失时提供最小实现，避免整页绘制抛错导致画面缺失。
if (typeof (globalThis as any).performance === 'undefined') {
  (globalThis as any).performance = { now: () => Date.now() };
}

export interface RenderBindings {
  canvasId: string;
  getGame: () => any;
  getShowHud?: () => boolean;
}

export class CanvasRenderer {
  private view: any = null;
  private ctx: any = null;
  private canvas: any = null;
  private transform = new CoordinateTransform();
  private bindings: RenderBindings;
  private rafId: any = null;
  private running = false;
  private destroyed = false;
  private lastFrame = 0;
  private dpr = 2;
  private dirty = true;
  private reducedMotion = false;
  private diagLogged = false;
  private frameErrors = 0;

  constructor(bindings: RenderBindings) {
    this.bindings = bindings;
  }

  /** 通过 SelectorQuery 获取 2d canvas 节点；只调用一次。
   *  真机加固：page 实例与 wx 全局两种 query 兜底；尺寸为 0 用 windowInfo 补；
   *  exec 回调内 try/catch，避免内部异常导致 Promise 永久 pending（白屏无报错）。 */
  init(pageCtx: any): Promise<void> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const done = (err?: Error) => {
        if (settled) return;
        settled = true;
        if (err) reject(err); else resolve();
      };
      try {
        const query = (typeof wx !== 'undefined' && (wx as any).createSelectorQuery)
          ? (wx as any).createSelectorQuery().in(pageCtx)
          : pageCtx.createSelectorQuery();
        query.select('#' + this.bindings.canvasId)
          .fields({ node: true, size: true })
          .exec((res: any[]) => {
            try {
              const item = res && res[0];
              if (!item || !item.node) { done(new Error('canvas node 未找到')); return; }
              this.canvas = item.node;
              this.ctx = this.canvas.getContext('2d');
              if (!this.ctx) { done(new Error('Canvas 2D 上下文不可用')); return; }
              this.view = pageCtx;
              let cssW = item.width, cssH = item.height;
              if (!cssW || cssW <= 0 || !cssH || cssH <= 0) {
                try {
                  const info = (wx as any).getWindowInfo ? (wx as any).getWindowInfo()
                    : (wx as any).getSystemInfoSync();
                  cssW = info.windowWidth || info.screenWidth || 375;
                  cssH = info.windowHeight || info.screenHeight || 667;
                } catch (e) { cssW = 375; cssH = 667; }
              }
              this.resize(cssW, cssH);
              this.start();
              done();
            } catch (e: any) {
              done(e instanceof Error ? e : new Error('canvas exec: ' + String(e)));
            }
          });
      } catch (e: any) {
        done(e instanceof Error ? e : new Error('canvas init: ' + String(e)));
      }
    });
  }

  resize(cssW: number, cssH: number): void {
    if (!this.canvas || !this.ctx) return;
    let dpr = 2;
    try { dpr = wx.getSystemInfoSync().pixelRatio || 2; } catch (e) { /* ignore */ }
    this.dpr = dpr;
    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
    this.transform.configure(cssW, cssH, dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.dirty = true;
  }

  private start(): void {
    if (this.running || this.destroyed || !this.canvas) return;
    this.running = true;
    this.lastFrame = Date.now();
    const loop = () => {
      if (!this.running || this.destroyed) return;
      try {
        const now = Date.now();
        let dtMs = now - this.lastFrame;
        if (dtMs < 0) dtMs = 0;
        if (dtMs > 100) dtMs = 100; // 切后台回来避免一次推进过大
        this.lastFrame = now;
        this.frame(dtMs);
      } catch (e: any) {
        // 兜底：即便 frame 内部漏捕，也不能让 RAF 永久停止
        this.frameErrors++;
        console.error('[mah][frame] 未捕获异常(循环继续)', e && e.name, e && e.message, e && e.stack);
      }
      if (this.running && !this.destroyed && this.canvas && this.canvas.requestAnimationFrame) {
        try { this.rafId = this.canvas.requestAnimationFrame(loop); } catch (e) { /* ignore */ }
      }
    };
    this.rafId = this.canvas.requestAnimationFrame(loop);
  }

  private stop(): void {
    this.running = false;
    if (this.rafId != null && this.canvas && this.canvas.cancelAnimationFrame) {
      try { this.canvas.cancelAnimationFrame(this.rafId); } catch (e) { /* ignore */ }
    }
    this.rafId = null;
  }

  onShow(): void { if (!this.destroyed) { this.dirty = true; this.start(); } }
  onHide(): void { this.stop(); }

  destroy(): void {
    this.stop();
    this.destroyed = true;
    this.canvas = null;
    this.ctx = null;
    this.view = null;
  }

  invalidate(): void { this.dirty = true; }
  setReducedMotion(v: boolean): void { this.reducedMotion = !!v; }

  touchToLogic(x: number, y: number): { x: number; y: number } {
    return this.transform.toLogic(x, y);
  }

  getViewport(): any { return this.transform.getViewport(); }

  /** 渲染前一次性输出规格要求的全部诊断字段（真机 Console 可见）。 */
  private logDiagnostics(game: any, ui: any): void {
    if (this.diagLogged) return;
    this.diagLogged = true;
    const vp = this.transform.getViewport();
    const cards = game ? (game.cards || []) : [];
    const first = cards[0] || {};
    const count = (st: string) => cards.filter((c: any) => c.state === st).length;
    const diag = {
      'game.screen': game && game.screen,
      'game.status': game && game.status,
      'game.level': game && game.level,
      'game.cards.length': cards.length,
      'game.boardCount()': game && typeof game.boardCount === 'function' ? game.boardCount() : 'n/a',
      'board状态牌数': count('board'),
      'slot状态牌数': count('slot'),
      'temp状态牌数': count('temp'),
      '第一张牌': { x: first.x, y: first.y, layer: first.layer, state: first.state, type: first.type },
      'Canvas CSS宽高': [vp.cssW, vp.cssH],
      'Canvas物理宽高': [this.canvas ? this.canvas.width : 0, this.canvas ? this.canvas.height : 0],
      'DPR': this.dpr,
      'viewport': { scale: vp.scale, offsetX: vp.offsetX, offsetY: vp.offsetY },
      'UI按钮数': ui && ui.buttons ? ui.buttons.length : 0,
    };
    console.log('[mah][render-diag]', JSON.stringify(diag));
  }

  /** RAF 回调：dtMs 为毫秒，统一换算为秒后推进引擎（与 Windows frame() 一致）。 */
  private frame(dtMs: number): void {
    const game = this.bindings.getGame();
    if (!this.ctx) return;
    const dtSec = Math.min(0.05, dtMs / 1000);
    if (game && typeof game.tick === 'function' && game.screen === 'play') {
      try { game.tick(dtSec); }
      catch (e: any) { this.frameErrors++; console.error('[mah][frame] tick失败', e && e.name, e && e.message, e && e.stack); }
    }
    if (this.dirty || (game && this.hasActiveFx(game))) {
      this.draw(game);
      this.dirty = false;
    }
  }

  private hasActiveFx(game: any): boolean {
    return !!(game && (
      (game.fx && game.fx.length) || game.shake > 0 || game.slotFlash > 0 ||
      game.pendingMatch || game.resolving ||
      (game.slot && game.slot.some((c: any) => c.vx != null && c.vScale != null && c.vScale > 1.0001))
    ));
  }

  /** 分阶段绘制；每阶段独立 try/catch，单阶段失败不影响其余阶段与 RAF。 */
  private draw(game: any): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const dpr = this.dpr;
    const vp = this.transform.getViewport();
    const stage = (name: string, fn: () => void) => {
      try { fn(); }
      catch (e: any) {
        this.frameErrors++;
        console.error('[mah][draw] 阶段失败: ' + name, e && e.name, e && e.message, e && e.stack);
      }
    };

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vp.cssW, vp.cssH);

    let ui: any = { buttons: [] };
    if (game) stage('getUI', () => { ui = Core.getUI(game) || ui; });
    if (game) this.logDiagnostics(game, ui);
    const t = Date.now() / 1000;

    ctx.save();
    ctx.translate(vp.offsetX, vp.offsetY);
    ctx.scale(vp.scale, vp.scale);

    // ===== 与 Windows src/main.js frame() 完全相同的绘制顺序 =====
    stage('drawBackground', () => Core.drawBackground(ctx, t));

    if (game && game.screen === 'title') {
      stage('drawTitleScreen', () => Core.drawTitleScreen(ctx, game, ui, t));
    } else if (game) {
      stage('drawBoard', () => Core.drawBoard(ctx, game));
      stage('drawSlot', () => Core.drawSlot(ctx, game, ui));
      stage('drawTools', () => Core.drawTools(ctx, game, ui));
      stage('drawHUD', () => Core.drawHUD(ctx, game, ui));
      stage('drawFx', () => Core.drawFx(ctx, game));
      stage('drawOverlay', () => Core.drawOverlay(ctx, game, ui));
    } else {
      stage('drawIdle', () => this.drawIdle());
    }

    if (game && game.uninstallAsk) stage('drawUninstallConfirm', () => Core.drawUninstallConfirm(ctx, game, ui));
    if (game && game.settingsAsk) stage('drawSettingsPanel', () => Core.drawSettingsPanel(ctx, game, ui));

    ctx.restore();
  }

  private drawIdle(): void {
    const ctx = this.ctx;
    Core.text(ctx, 'MAH', Core.W / 2, Core.H / 2, {
      size: 96, color: '#D79B33', align: 'center', weight: 'bold',
    });
    Core.text(ctx, '麻了个麻', Core.W / 2, Core.H / 2 + 90, {
      size: 40, color: '#8B7154', align: 'center',
    });
  }
}
