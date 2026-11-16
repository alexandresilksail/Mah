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

const Core = require('../../core/mah-core.js');

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

  /** 通过 SelectorQuery 获取 2d canvas 节点；只调用一次。 */
  init(pageCtx: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const query = pageCtx.createSelectorQuery();
        query.select('#' + this.bindings.canvasId)
          .fields({ node: true, size: true })
          .exec((res: any[]) => {
            const item = res && res[0];
            if (!item || !item.node) { reject(new Error('canvas node 未找到')); return; }
            this.canvas = item.node;
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) { reject(new Error('Canvas 2D 上下文不可用')); return; }
            this.view = pageCtx;
            this.resize(item.width, item.height);
            this.start();
            resolve();
          });
      } catch (e) {
        reject(e);
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

    // 背景
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#FFF9EC');
    grad.addColorStop(0.6, '#F7EEDC');
    grad.addColorStop(1, '#EFDFC2');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 抖动特效（被压牌点击时）
    if (game && game.shake > 0 && !this.reducedMotion) {
      const s = game.shake * 6;
      ctx.translate(Math.sin(Date.now() / 18) * s, 0);
    }

    if (game && game.screen === 'play') {
      this.drawBoard(game);
      this.drawSlots(game);
      this.drawTemp(game);
      this.drawFx(game);
    } else {
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

  /** 牌堆：按 z 从低到高绘制，保证上层遮挡下层；被压牌分级压暗。 */
  private drawBoard(game: any): void {
    const ctx = this.ctx;
    const cards = game.cards || [];
    const now = Date.now();
    // 按 z、layer、id 排序（稳定），上层后画
    const ordered = cards.slice().sort((a: any, b: any) =>
      (a.z - b.z) || (a.layer - b.layer) || (a.id - b.id));
    for (const c of ordered) {
      if (c.state !== 'board') continue;
      let alpha = 1;
      if (c.appearAt && c.appearAt > now && !this.reducedMotion) {
        const total = 240;
        const p = 1 - (c.appearAt - now) / total; // 0..1 出现进度
        if (p <= 0) continue;
        alpha = Math.max(0, Math.min(1, p));
      }
      const dimLevel = c.blocked ? Math.max(1, Math.min(3, (game.maxZ - c.z) > 2 ? 2 : 1)) : 0;
      const playable = !c.blocked && game.canPick(c);
      const isHover = game.hoverId === c.id;
      Core.drawTile(ctx, c.x, c.y, Core.TILE_W, Core.TILE_H, c.type, {
        alpha,
        dimLevel,
        playable,
        selected: isHover,
        glow: isHover && !this.reducedMotion ? 0.5 : 0,
        lift: isHover && !this.reducedMotion ? 4 : 0,
      });
    }
  }

  /** 七个槽位：面板 + 已入槽牌 + 飞入动画。 */
  private drawSlots(game: any): void {
    const ctx = this.ctx;
    const panel = { x: 73, y: 1024, w: 574, h: 124 };
    Core.rr(ctx, panel.x, panel.y, panel.w, panel.h, 24);
    ctx.fillStyle = 'rgba(242, 230, 206, 0.9)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(150,112,70,0.28)';
    ctx.stroke();

    const slot = game.slot || [];
    for (let i = 0; i < Core.SLOT_CAPACITY; i++) {
      const pos = game.slotCardPos(i);
      if (i < slot.length) {
        const c = slot[i];
        let ax = pos.x - Core.TILE_W / 2;
        let ay = pos.y - Core.TILE_H / 2;
        // 入槽飞行动画：vx/vy 是牌的起始位置
        if (!this.reducedMotion && c.vx != null && c.vy != null) {
          const k = Math.min(1, (c.vScale || 1) - 1 > 0 ? 1 : 1);
          ax = c.vx + (ax - c.vx) * k;
          ay = c.vy + (ay - c.vy) * k;
        }
        Core.drawTile(ctx, ax, ay, Core.TILE_W, Core.TILE_H, c.type, { selected: true });
      } else {
        // 空槽占位
        Core.rr(ctx, pos.x - Core.TILE_W / 2, pos.y - Core.TILE_H / 2, Core.TILE_W, Core.TILE_H, 8);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fill();
      }
    }
  }

  /**
   * 移出道具的临时区：不占槽位，点击任一张放回槽位。
   * 坐标与 touch-handler 的命中判定共用 Core.TEMP_ZONE，保证「画在哪就点哪」。
   */
  private drawTemp(game: any): void {
    const ctx = this.ctx;
    const temp = game.temp || [];
    if (!temp.length) return;
    const TZ = Core.TEMP_ZONE;
    if (!TZ) return;
    const w = TZ.max * TZ.pitch + 14;
    const x0 = TZ.x - 7;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    Core.rr(ctx, x0, TZ.y - 8, w, Core.TILE_H + 16, 12);
    ctx.fill();
    ctx.strokeStyle = (Core.C && Core.C.goldGhost) || 'rgba(190,150,80,0.6)';
    ctx.lineWidth = 1.2;
    Core.rr(ctx, x0 + 0.6, TZ.y - 7.4, w - 1.2, Core.TILE_H + 14.8, 11.4);
    ctx.stroke();
    ctx.restore();
    for (let i = 0; i < temp.length && i < TZ.max; i++) {
      const tx = TZ.x + i * TZ.pitch;
      Core.drawTile(ctx, tx, TZ.y, Core.TILE_W, Core.TILE_H, temp[i].type, {
        lift: game.hoverId === temp[i].id ? 2 : 0,
      });
    }
    Core.text(ctx, '临时区 · 点击放回槽位', Core.W / 2, TZ.y + Core.TILE_H + 18, {
      size: 15, color: (Core.C && Core.C.textDim) || '#8B7154', align: 'center',
    });
  }

  private drawFx(game: any): void {
    const ctx = this.ctx;
    if (this.reducedMotion) return;
    const fx = game.fx || [];
    for (const p of fx) {
      if (!p || p.life <= 0) continue;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.fillStyle = '#F5C33B';
      Core.circle(ctx, p.x, p.y, 8 + (1 - p.life) * 18);
      ctx.fill();
      ctx.restore();
    }
  }
}
