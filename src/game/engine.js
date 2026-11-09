/**
 * 游戏核心逻辑：槽位 / 遮挡 / 道具 / 胜负（纯 JS，零 DOM 依赖）。
 *
 * 第 7 步要求「槽位逻辑放在不依赖 DOM 的纯 JS 模块」：下面的
 * slotInsert / slotMatchTypes / resolveSlot / isCovered 都是可直接在 Node 里
 * import 的纯函数，test.js 与机器人模拟共用同一份规则。
 *
 * 规则（对标原作）：
 *   1. 槽位 7 格；点击一张可点牌，牌飞入槽位；
 *   2. 入槽位置 = 最右侧那张同花色牌之后；没有同花色就放最右端；
 *   3. 同花色满 3 张则消除（先播放入槽，再延迟 MATCH_DELAY_MS ≈ 200ms 消除，
 *      期间由 resolving / pendingMatch 防重复触发）；
 *   4. 入槽后 7 格已满且未触发消除 → 判负；
 *   5. 遮挡 = 存在 z 更高的牌、矩形交集 / TILE_AREA > OVERLAP_THRESHOLD；
 *   6. 洗牌 / 撤销 / 移出各 3 次，复活 1 次（只清空槽位，不送道具）。
 */
import {
  TILE_W,
  TILE_H,
  SLOT_CAPACITY,
  SLOT_X0,
  SLOT_PITCH,
  SLOT_CARD_W,
  SLOT_CARD_H,
  SLOT_Y,
  MATCH_DELAY_MS,
  LEVEL_COUNT,
  layoutFor,
  levelParams,
} from './config.js';
import { generateLevel, refreshBlocked, isCovered } from './generator.js';

/** 时间源：浏览器优先 performance，老浏览器 / Node 自动降级 */
function nowMs() {
  if (typeof performance !== 'undefined' && performance.now) return performance.now();
  return Date.now();
}

/* ==================== 纯函数：槽位 ==================== */

/**
 * 入槽位置：若槽内已有同花色牌，插入到最右侧那张同花色牌之后；否则放最右端。
 * @returns {number} 插入下标
 */
export function slotInsert(slot, card) {
  let idx = slot.length;
  for (let i = slot.length - 1; i >= 0; i--) {
    if (slot[i].type === card.type) {
      idx = i + 1;
      break;
    }
  }
  slot.splice(idx, 0, card);
  return idx;
}

/** 当前槽里哪些花色已经攒够 3 张 */
export function slotMatchTypes(slot) {
  const count = {};
  const out = [];
  for (let i = 0; i < slot.length; i++) {
    const t = slot[i].type;
    if (count[t] === undefined) count[t] = 0;
    count[t]++;
    if (count[t] === 3) out.push(t);
  }
  return out;
}

/**
 * 执行消除：每种满 3 张的花色移走其中 3 张（按从左到右）。
 * @returns {Array} 被消除的牌
 */
export function resolveSlot(slot) {
  const types = slotMatchTypes(slot);
  const removed = [];
  for (let k = 0; k < types.length; k++) {
    const t = types[k];
    let need = 3;
    for (let i = 0; i < slot.length && need > 0; i++) {
      if (slot[i].type === t) {
        removed.push(slot.splice(i, 1)[0]);
        i--;
        need--;
      }
    }
  }
  return removed;
}

/** 纯几何遮挡判定（转发给 layout.js 的单一实现） */
export { isCovered };

/** 槽位第 i 个位置的左上角 x（保持旧签名） */
export function slotTargetX(i) {
  return SLOT_X0 + i * SLOT_PITCH + (SLOT_PITCH - SLOT_CARD_W) / 2;
}

/* ==================== Game ==================== */

export class Game {
  constructor(audio) {
    this.audio = audio;
    this.screen = 'title';
    this.cards = [];
    this.layersMeta = [];
    this.maxZ = 0;
    this.slot = [];
    this.temp = []; // 移出道具的临时区（不占槽位）
    this.history = [];
    this.props = { shuffle: 0, undo: 0, remove: 0 };
    this.status = 'play';
    this.level = 1;
    this.best = 1;
    this.graduated = false;
    this.layout = layoutFor(1);
    this.soundOn = true;
    this.seed = 0;
    this.reviveLeft = 1;
    this.revived = false;
    this.fx = [];
    this.shake = 0;
    this.slotFlash = 0;
    this.levelStartAt = 0;
    this.time = 0;
    this.hoverId = -1;
    this.generatorMode = '-';
    this.paused = false;
    this._topPool = null;
    this.boardRev = 0;
    this.uninstallAsk = false;
    this.pendingMatch = null; // { due, dueClock, types } —— 200ms 延迟消除
    this.resolving = false; // 防止重复触发
    this.clock = 0; // 帧累加的游戏时钟（毫秒），让无 DOM 的模拟也能推进延迟消除
    this.solution = null;
  }

  /* -------------------- 生命周期 -------------------- */

  startLevel(level, seed) {
    const lv = Math.min(LEVEL_COUNT, Math.max(1, level | 0));
    const data = generateLevel(lv, seed === undefined ? undefined : seed);
    this.cards = data.cards;
    this.layersMeta = data.layers || [];
    this.solution = data.solution;
    this.seed = data.seed;
    this.generatorMode = data.mode;
    this.level = lv;
    this.layout = data.params.layout;
    this.slot = [];
    this.temp = [];
    this.history = [];
    this.props = { ...data.params.props };
    this.reviveLeft = data.params.reviveMax;
    this.revived = false;
    this.graduated = false;
    this.status = 'play';
    this.screen = 'play';
    this.paused = false;
    this.pendingMatch = null;
    this.resolving = false;
    this.clock = 0;
    this.fx.length = 0;
    this.shake = 0;
    this.slotFlash = 0;
    this.hoverId = -1;
    this._topPool = null;
    this.maxZ = this.cards.reduce((m, c) => Math.max(m, c.z), 0);
    this.levelStartAt = nowMs();
    this.refresh(true);
  }

  refresh(withIntro = false) {
    this.boardRev++;
    const alive = refreshBlocked(this.cards);
    if (withIntro) {
      const n = alive.length;
      const span = Math.min(240, n * 6);
      const t0 = nowMs();
      alive.forEach((c, i) => {
        c.appearAt = t0 + (n > 1 ? (i / (n - 1)) * span : 0);
      });
    }
    this.maxZ = this.cards.reduce((m, c) => Math.max(m, c.z), 0);
    return alive;
  }

  remaining() {
    return this.cards.reduce((n, c) => n + (c.state === 'cleared' ? 0 : 1), 0);
  }

  boardCount() {
    return this.cards.reduce((n, c) => n + (c.state === 'board' ? 1 : 0), 0);
  }

  progress() {
    const total = this.cards.length || 1;
    return 1 - this.remaining() / total;
  }

  /* -------------------- 历史栈 -------------------- */

  pushHistory() {
    this.history.push({
      cards: this.cards.map((c) => ({
        id: c.id,
        type: c.type,
        state: c.state,
        layer: c.layer,
        z: c.z,
        x: c.x,
        y: c.y,
      })),
      slot: this.slot.map((c) => c.id),
      temp: this.temp.map((c) => c.id),
      status: this.status,
      revived: this.revived,
    });
    if (this.history.length > 60) this.history.shift();
  }

  restore(h) {
    for (const sc of h.cards) {
      const c = this.cards[sc.id];
      c.type = sc.type;
      c.state = sc.state;
      c.layer = sc.layer;
      c.z = sc.z;
      c.x = sc.x;
      c.y = sc.y;
    }
    this.slot = h.slot.map((id) => this.cards[id]);
    this.temp = (h.temp || []).map((id) => this.cards[id]);
    for (const c of this.slot) {
      c.vx = null;
      c.vy = null;
    }
    this.pendingMatch = null;
    this.resolving = false;
    this.status = h.status;
    this.revived = h.revived;
    this._topPool = null;
    this.refresh();
  }

  /* -------------------- 核心操作 -------------------- */

  canPick(card) {
    return (
      this.screen === 'play' &&
      this.status === 'play' &&
      card &&
      card.state === 'board' &&
      !card.blocked
    );
  }

  /** 点击临时区里的牌 → 放回槽位 */
  returnFromTemp(card) {
    if (this.status !== 'play' || !card || card.state !== 'temp') return false;
    if (this.pendingMatch) this.flushResolve();
    if (this.slot.length >= SLOT_CAPACITY) return false;
    this.pushHistory();
    const i = this.temp.indexOf(card);
    if (i >= 0) this.temp.splice(i, 1);
    card.state = 'slot';
    card.vx = card.x;
    card.vy = card.y;
    card.vScale = 1.14;
    slotInsert(this.slot, card);
    this.audio?.pick();
    this.refresh();
    this.queueResolve();
    return true;
  }

  pick(card) {
    if (card && card.state === 'temp') return this.returnFromTemp(card);
    if (!this.canPick(card)) {
      if (card && card.state === 'board' && card.blocked) {
        this.shake = 1;
        this.audio?.deny();
      }
      return false;
    }
    // 上一次的延迟消除该结算了（连续点牌时不让 200ms 把槽位算错）
    if (this.pendingMatch) this.flushResolve();
    if (this.status !== 'play' || this.slot.length >= SLOT_CAPACITY) return false;

    this.pushHistory();
    card.state = 'slot';
    card.vx = card.x;
    card.vy = card.y;
    card.vScale = 1.14;
    slotInsert(this.slot, card);
    this.audio?.pick();
    this.refresh();
    this.queueResolve();
    return true;
  }

  /** 发现三张同花色 → 排一个 200ms 后的消除，期间不重复触发 */
  queueResolve() {
    const types = slotMatchTypes(this.slot);
    if (types.length) {
      this.pendingMatch = {
        due: nowMs() + MATCH_DELAY_MS,
        dueClock: this.clock + MATCH_DELAY_MS,
        types,
      };
      return;
    }
    // 未触发消除且 7 格已满 → 判负
    if (this.slot.length >= SLOT_CAPACITY) this.lose();
  }

  /** 真正执行消除（由 tick 或下一次点击推进），resolving 防重入 */
  flushResolve() {
    if (this.resolving || !this.pendingMatch) return false;
    this.resolving = true;
    const removed = resolveSlot(this.slot);
    this.pendingMatch = null;
    if (removed.length) {
      for (let i = 0; i < removed.length; i++) {
        removed[i].state = 'cleared';
        const p = this.slotCardPos(i);
        this.spawnBurst(p.x, p.y);
      }
      this.audio?.match();
      this.slotFlash = 1;
    }
    this.refresh();
    this.resolving = false;

    const allClear = this.cards.every((c) => c.state === 'cleared');
    if (allClear) {
      this.status = 'win';
      this.graduated = this.level >= LEVEL_COUNT;
      this.best = Math.max(this.best, this.graduated ? LEVEL_COUNT : this.level + 1);
      this.audio?.win();
    } else if (this.slot.length >= SLOT_CAPACITY) {
      this.lose();
    }
    return removed.length > 0;
  }

  lose() {
    this.status = 'lose';
    this.audio?.lose();
  }

  /** 保留旧方法名：一次性把当前结算做完（测试 / 调试用） */
  resolve() {
    if (this.pendingMatch) return this.flushResolve();
    const removed = resolveSlot(this.slot);
    if (removed.length) {
      for (let i = 0; i < removed.length; i++) removed[i].state = 'cleared';
      this.slotFlash = 1;
    }
    this.refresh();
    if (this.cards.every((c) => c.state === 'cleared')) this.status = 'win';
    else if (this.slot.length >= SLOT_CAPACITY) this.lose();
    return removed.length > 0;
  }

  slotCardPos(index) {
    return { x: slotTargetX(index) + SLOT_CARD_W / 2, y: SLOT_Y + SLOT_CARD_H / 2 };
  }

  /* -------------------- 道具 -------------------- */

  /** 洗牌：只重新分配盘面剩余牌的花色，每种花色数量不变，位置完全不动 */
  useShuffle() {
    if (this.status !== 'play' || this.props.shuffle <= 0) {
      this.audio?.deny();
      return false;
    }
    this.pushHistory();
    this.props.shuffle -= 1;
    const board = this.cards.filter((c) => c.state === 'board');
    const types = board.map((c) => c.type);
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = types[i];
      types[i] = types[j];
      types[j] = t;
    }
    board.forEach((c, i) => {
      c.type = types[i];
    });
    this.refresh();
    this.audio?.shuffle();
    return true;
  }

  /** 撤销：撤回最近一次点击，牌回到原位（历史栈） */
  useUndo() {
    if (this.status !== 'play' || this.props.undo <= 0 || this.history.length === 0) {
      this.audio?.deny();
      return false;
    }
    if (this.pendingMatch) this.flushResolve();
    this.props.undo -= 1;
    const h = this.history.pop();
    this.restore(h);
    this.audio?.undo();
    return true;
  }

  /**
   * 移出：把槽内最左 3 张（不足 3 张则全部）移到临时区。
   * 临时区不占槽位；点击临时区的牌可放回槽位。
   */
  useRemove() {
    if (this.status !== 'play' || this.props.remove <= 0 || this.slot.length === 0) {
      this.audio?.deny();
      return false;
    }
    if (this.pendingMatch) this.flushResolve();
    this.pushHistory();
    this.props.remove -= 1;
    const take = this.slot.splice(0, Math.min(3, this.slot.length));
    for (let i = 0; i < take.length; i++) {
      take[i].state = 'temp';
      take[i].vx = null;
      take[i].vy = null;
      this.temp.push(take[i]);
    }
    this.refresh();
    this.audio?.shuffle();
    return true;
  }

  /** 复活：只清空槽位（临时区里的牌也一并清空），不补道具，不动牌堆 */
  useRevive() {
    if (this.status !== 'lose' || this.reviveLeft <= 0) return false;
    this.reviveLeft -= 1;
    this.revived = true;
    const take = this.slot.slice();
    this.slot = [];
    for (let i = 0; i < take.length; i++) {
      take[i].state = 'cleared';
      const p = this.slotCardPos(0);
      this.spawnBurst(p.x, p.y);
    }
    this.temp = [];
    this.pendingMatch = null;
    this.status = 'play';
    this.refresh();
    this.audio?.revive();
    return true;
  }

  /** 兼容旧接口：把一张牌放回牌堆最上层（落点一定在所有牌之上，必然可点） */
  placeBack(card) {
    const cell = this.nextTopCell();
    const z = this.maxZ + 1;
    card.layer = 6;
    card.z = z;
    card.x = cell.x;
    card.y = cell.y;
    card.state = 'board';
    card.vx = null;
    card.vy = null;
    card.appearAt = nowMs();
    this.maxZ = z;
    this.refresh();
  }

  /** 塔顶的空格，打乱后依次取用，避免两张牌叠在同一个点上 */
  nextTopCell() {
    if (!this._topPool || !this._topPool.length) {
      const cells = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) cells.push({ x: 190 + c * 90, y: 250 + r * 100 });
      }
      for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = cells[i];
        cells[i] = cells[j];
        cells[j] = t;
      }
      this._topPool = cells;
    }
    return this._topPool.pop();
  }

  /* -------------------- 特效 / 帧推进 -------------------- */

  spawnBurst(x, y) {
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
      const sp = 90 + Math.random() * 130;
      this.fx.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: 0.55 + Math.random() * 0.25,
        t: 0,
        r: 2 + Math.random() * 3,
      });
    }
  }

  tick(dt) {
    this.time += dt;
    this.clock += dt * 1000;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 4);
    if (this.slotFlash > 0) this.slotFlash = Math.max(0, this.slotFlash - dt * 3);

    // 200ms 到了就结算消除（先播放入槽动画，再消除）。
    // 游戏时钟由帧累加，无 DOM 的 Node 模拟也能精确推进；真实浏览器再叠一个
    // 墙钟兜底，切后台回来也不会漏结算。
    if (this.pendingMatch &&
        (this.clock >= this.pendingMatch.dueClock || nowMs() >= this.pendingMatch.due)) {
      this.flushResolve();
    }

    const k = Math.min(1, dt * 15);
    this.slot.forEach((c, i) => {
      const tx = slotTargetX(i);
      if (c.vx == null) {
        c.vx = tx;
        c.vy = SLOT_Y;
      }
      c.vx += (tx - c.vx) * k;
      c.vy += (SLOT_Y - c.vy) * k;
      const ddx = tx - c.vx;
      const ddy = SLOT_Y - c.vy;
      const d = Math.sqrt(ddx * ddx + ddy * ddy);
      c.vScale = 1 + Math.min(0.14, d / 700);
      if (d < 0.4) {
        c.vx = tx;
        c.vy = SLOT_Y;
        c.vScale = 1;
      }
    });

    for (let i = this.fx.length - 1; i >= 0; i--) {
      const p = this.fx[i];
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 620 * dt;
      if (p.t >= p.life) this.fx.splice(i, 1);
    }
  }

  /** 关卡参数预览（标题页展示） */
  nextLevelPreview() {
    return levelParams(this.level + 1);
  }
}
