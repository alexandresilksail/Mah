/**
 * 微信小程序 Canvas 2D 主渲染器 — 微信端独立实现（指令第七步）。
 *
 * 复用：牌面绘制调用 Core.drawTile（16 种原创 Canvas 图案，原样复用）。
 * 独立：背景 / 槽位面板 / 顶部信息 / 工具按钮 / 特效 / 动画循环全部微信端实现。
 *
 * 生命周期安全性：
 *  · init 只创建一次 canvas 与一次 RAF 循环；destroy 彻底停止循环并解绑；
 *  · onShow 恢复循环，onHide 暂停循环（避免后台仍渲染）；
 *  · 切后台再回来画布不会消失（resize 时重设 DPR 并置 dirty）。
 */
import { CoordinateTransform } from './coordinate-transform';

const Core = require('../core/mah-core.js');

export interface RenderBindings {
  canvasId: string;
  /** 由页面注入：返回当前 Game 实例（可能为 null） */
  getGame: () => any;
  /** 由页面注入：是否显示顶部信息 */
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

  constructor(bindings: RenderBindings) {
    this.bindings = bindings;
  }

  /** 通过 SelectorQuery 获取 2d canvas 节点；只调用一次。
   *  真机加固：① page 实例与 wx 全局两种 query 兜底；② 尺寸为 0 用 windowInfo 补；
   *  ③ exec 回调内 try/catch，避免内部异常导致 Promise 永久 pending（表现为白屏无报错）。 */
  init(pageCtx: any): Promise<void> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const done = (err?: Error) => {
        if (settled) return;
        settled = true;
        if (err) reject(err); else resolve();
      };
      try {
        // 真机部分基础库 pageCtx.createSelectorQuery 取不到自定义节点，wx 全局 + .in(page) 更稳
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
              // 尺寸容错：部分机型首次 exec 拿到 0，用窗口尺寸兜底，避免 0×0 画布白屏
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

  /** 设置 canvas 物理像素尺寸；CSS 尺寸由 WXML 决定。 */
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
    if (this.running || this.destroyed) return;
    this.running = true;
    this.lastFrame = Date.now();
    const loop = () => {
      if (!this.running || this.destroyed) return;
      const now = Date.now();
      let dt = now - this.lastFrame;
      if (dt < 0) dt = 0;
      if (dt > 100) dt = 100; // 切后台回来避免一次推进过大
      this.lastFrame = now;
      this.frame(dt);
      this.rafId = this.canvas.requestAnimationFrame(loop);
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

  /** 页面卸载：停止循环并释放引用，避免动画继续运行 / 重复注册。 */
  destroy(): void {
    this.stop();
    this.destroyed = true;
    this.canvas = null;
    this.ctx = null;
    this.view = null;
  }

  /** 强制重绘一帧（例如点击后立即刷新，不等下一帧）。 */
  invalidate(): void { this.dirty = true; }

  setReducedMotion(v: boolean): void { this.reducedMotion = !!v; }

  /** 触摸 CSS 坐标 → 逻辑坐标（供命中测试使用）。 */
  touchToLogic(x: number, y: number): { x: number; y: number } {
    return this.transform.toLogic(x, y);
  }

  private frame(dt: number): void {
    const game = this.bindings.getGame();
    if (!this.ctx) return;
    // 运行期逻辑推进（延迟三消 / 动画）：与渲染帧解耦，游戏未开始也可安全跳过
    if (game && typeof game.tick === 'function' && game.screen === 'play') {
      game.tick(dt);
    }
    // 有动画或脏标记时重绘；静态时跳过以省电
    if (this.dirty || (game && this.hasActiveFx(game))) {
      this.draw(game);
      this.dirty = false;
    }
  }

  private hasActiveFx(game: any): boolean {
    return !!(game && ((game.fx && game.fx.length) || game.shake > 0 || game.slotFlash > 0 || game.pendingMatch));
  }

  private draw(game: any): void {
    const ctx = this.ctx;
    const dpr = this.dpr;
    const vp = this.transform.getViewport();
    const W = Core.W, H = Core.H;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vp.cssW, vp.cssH);

    ctx.save();
    ctx.translate(vp.offsetX, vp.offsetY);
    ctx.scale(vp.scale, vp.scale);

    // 抖动特效（被压牌点击时）—— 由原版 drawSlot 内部同样处理，这里不再重复 translate
    // 背景与牌区全部交给原版绘制函数（见下方 drawBackground），保证与 Windows 版一致

    if (game && game.screen === 'play') {
      // 画面保真：牌区主体（背景/木纹/桌垫/牌堆阴影/槽位面板/临时区/特效）直接复用原版函数，
      // 与 Windows 桌面版逐像素同源。HUD/道具栏/工具栏仍由 WXML 原生实现（见 index.wxml）。
      // 注意：drawBoard 内部有离屏缓存，微信 ctx 无 ownerDocument 时自动降级为直绘。
      Core.drawBackground(ctx, Date.now() / 1000);
      Core.drawBoard(ctx, game);
      Core.drawSlot(ctx, game, null); // drawSlot 未使用 ui 参数
      Core.drawFx(ctx, game);
    } else {
      // 无牌局时的占位画面（首帧 / 切后台恢复）
      Core.drawBackground(ctx, Date.now() / 1000);
      this.drawIdle();
    }

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

  // 牌区主体绘制已改为直接复用原版 Core.drawBackground/drawBoard/drawSlot/drawFx，
  // 与桌面版同源；此处不再保留微信端自绘的重复实现。
}
