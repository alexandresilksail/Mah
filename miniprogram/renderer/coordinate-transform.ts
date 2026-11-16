/**
 * 坐标变换：游戏逻辑坐标系（Core.W × Core.H = 720 × 1280，竖屏）↔ 屏幕像素。
 *
 * 需求对应（指令第七步）：
 *  · 适配不同屏幕宽高：等比缩放 + 居中（letterbox），保持牌面宽高比；
 *  · 正确处理设备像素比：canvas.width = cssW * dpr，绘制时先 scale(dpr)；
 *  · 牌面坐标与点击区域一致：screen↔logic 双向变换共用同一组参数。
 */
const Core = require('../core/mah-core.js');

export interface Viewport {
  cssW: number; cssH: number; dpr: number;
  scale: number; offsetX: number; offsetY: number;
}

export class CoordinateTransform {
  private vp: Viewport = { cssW: 720, cssH: 1280, dpr: 2, scale: 1, offsetX: 0, offsetY: 0 };

  /** 依据 canvas 的 CSS 尺寸与 DPR 重算视口。 */
  configure(cssW: number, cssH: number, dpr: number): Viewport {
    const logicW = Core.W;   // 720
    const logicH = Core.H;   // 1280
    const scale = Math.min(cssW / logicW, cssH / logicH);
    const offsetX = (cssW - logicW * scale) / 2;
    const offsetY = (cssH - logicH * scale) / 2;
    this.vp = { cssW, cssH, dpr, scale, offsetX, offsetY };
    return this.vp;
  }

  getViewport(): Viewport { return this.vp; }

  /** 逻辑坐标 → CSS 像素（canvas 上下文已 scale(dpr)，所以这里是 CSS 单位） */
  toScreenX(logicX: number): number { return this.vp.offsetX + logicX * this.vp.scale; }
  toScreenY(logicY: number): number { return this.vp.offsetY + logicY * this.vp.scale; }

  /** 触摸点（相对 canvas 的 CSS 坐标）→ 逻辑坐标 */
  toLogic(touchX: number, touchY: number): { x: number; y: number } {
    return {
      x: (touchX - this.vp.offsetX) / this.vp.scale,
      y: (touchY - this.vp.offsetY) / this.vp.scale,
    };
  }
}
