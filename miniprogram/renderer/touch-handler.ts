/**
 * 触摸命中判定 — 微信端独立实现。
 * 输入为逻辑坐标（由 CoordinateTransform 变换），命中规则与桌面版 cardAt 一致：
 *  1) 临时区（移出道具）单独判定：牌按 TEMP_ZONE.x + i*pitch 排列，
 *     命中后交给 Game.pick 分流回槽位（returnFromTemp）；
 *  2) 牌堆：从最高层向下命中第一张牌，由调用方 canPick 决定是否可点。
 *
 * 注意：temp 牌自身的 x/y 停留在入槽时的槽位坐标，不能用于命中临时区，
 * 否则会出现「看得见却点不到 / 点到别处」的错位（首版缺陷，此处修正）。
 */
const Core = require('../../core/mah-core.js');

export class TouchHandler {
  /**
   * 命中一张牌。
   * @returns 命中的 Card（无论是否可点），由调用方决定可否 pick；null 表示未命中。
   */
  hitCard(game: any, lx: number, ly: number): any | null {
    // 1) 临时区：按索引坐标命中（与渲染的 TEMP_ZONE 布局严格一致）
    const temp = game.temp || [];
    const TZ = Core.TEMP_ZONE;
    if (TZ) {
      for (let i = 0; i < temp.length && i < TZ.max; i++) {
        const tx = TZ.x + i * TZ.pitch;
        if (lx >= tx && lx <= tx + Core.TILE_W && ly >= TZ.y && ly <= TZ.y + Core.TILE_H) {
          return temp[i];
        }
      }
    }

    // 2) 牌堆：仅 board 状态，按 z 从高到低命中
    const cards = (game.cards || []).filter((c: any) => c.state === 'board');
    cards.sort((a: any, b: any) => (b.z - a.z) || (b.id - a.id));
    for (const c of cards) {
      if (lx >= c.x && lx <= c.x + Core.TILE_W && ly >= c.y && ly <= c.y + Core.TILE_H) {
        return c;
      }
    }
    return null;
  }

  /** 命中槽位索引（点击槽位牌可触发相关操作），返回 -1 表示未命中。 */
  hitSlot(game: any, lx: number, ly: number): number {
    const slot = game.slot || [];
    for (let i = 0; i < slot.length; i++) {
      const pos = game.slotCardPos(i);
      const x0 = pos.x - Core.TILE_W / 2;
      const y0 = pos.y - Core.TILE_H / 2;
      if (lx >= x0 && lx <= x0 + Core.TILE_W && ly >= y0 && ly <= y0 + Core.TILE_H) {
        return i;
      }
    }
    return -1;
  }
}
