/**
 * 档位驱动布局生成器（本轮修订 · 第 1.2 / 2.5 节）。
 *
 * 与 v2 静态模板并行存在：generateLevel() 带 profile 时走这里，不带时仍走
 * layout.js 的静态模板，保证旧工具 / 旧存档回放不受影响。
 *
 * 保持不变的硬规则：
 *  · 半格晶格：所有坐标都是 (LATTICE_X, LATTICE_Y) = (33, 44) 的整数倍；
 *  · 沙漏轮廓：主堆层张数由 config.layerPlanFor(profile) 给出
 *    （28 层基准曲线按顶部 25% / 中段 36% / 底部核心 39% 插值到 N 层，
 *     再归一化到 mainCount）；
 *  · 同层零重叠：同一全局层号内格点间距 = 牌宽 / 牌高；
 *  · 盲盒队列：sideLeft 3 层 × 4 + sideRight 3 层 × 4 + reserve 2 层 × 10
 *    = 44 张，层号排在主堆之后，与主堆边缘半格咬合形成跨区域交叉遮挡；
 *  · z 全序 = layer 升序 → y 升序 → x 升序（与 generator.assignZ 一致）。
 *
 * 队列的 8 个全局层不占用 profile.layers：规格 1.2 的「N 层」指主堆层数，
 * 因此全局堆叠层数 = N + 8（最大 28 + 8 = 36）。
 */
import {
  TILE_W, TILE_H, LATTICE_X, LATTICE_Y, BOARD_BAND, layerPlanFor,
} from './config.js';
import { makeRng } from './rng.js';

const QUEUE = 44;

/** 主堆每层网格：6×3 = 18 格，足够容纳归一化后最大的一层（≤16 张） */
const CORE_COLS = 6;
const CORE_ROWS = 3;
/** 相邻层半格错位（x 差 33、y 差 44），保证上层牌都有下层支撑 */
const CORE_ORIGINS = [[132, 440], [165, 484]];

/** 第一关没有队列，单独用紧凑金字塔网格（容量按需扩张） */
function l1Cells(li, need, cols) {
  const o = CORE_ORIGINS[li % 2];
  const rows = Math.ceil(need / cols);
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ x: o[0] + c * TILE_W, y: o[1] + r * TILE_H });
    }
  }
  return cells.slice(0, need);
}

function coreCells(li, need) {
  const o = CORE_ORIGINS[li % 2];
  const cells = [];
  // 先取靠下的行：主堆上沿留给盲盒队列压住，让开局可点数稳定在 19–25 张。
  for (let r = CORE_ROWS - 1; r >= 0; r--) {
    for (let c = 0; c < CORE_COLS; c++) {
      cells.push({ x: o[0] + c * TILE_W, y: o[1] + r * TILE_H });
    }
  }
  return cells.slice(0, Math.min(need, cells.length));
}

/**
 * 队列区域：固定半格晶格坐标，与主堆边缘重叠 33px（>10% 牌面积）。
 * 奇数层数的档位，主堆顶层的错位方向与偶数档不同，会多露出 4 张可点牌；
 * 因此把两侧盲盒顶层的 4 张各减 1 张、补到底层（每侧仍 12 张，队列仍 44 张），
 * 让全部 10 个档位的开局可点数稳定落在规格 5.2 的 19–25 张区间。
 */
function queueZones(oddTopLayer) {
  const sidePlan = oddTopLayer ? [5, 4, 3] : [4, 4, 4];
  const sideGrids = oddTopLayer ? [[3, 2], [2, 2], [2, 2]] : [[2, 2], [2, 2], [2, 2]];
  return [
    {
      name: 'sideLeft', plan: sidePlan.slice(), grids: sideGrids,
      origins: [[33, 440], [66, 484], [33, 440]],
    },
    {
      name: 'sideRight', plan: sidePlan.slice(), grids: sideGrids,
      origins: [[495, 440], [528, 484], [495, 440]],
    },
    {
      // 顶层收窄到 6 张；两层合计 20，队列总数 44 不变。
      name: 'reserve', plan: [14, 6], grids: [[7, 2], [3, 2]],
      origins: [[165, 616], [198, 616]],
    },
  ];
}

/** 队列层号：交错排在主堆之后，保持跨区域交叉遮挡的层次感 */
const QUEUE_STACK_OFFSETS = {
  sideLeft: [0, 2, 4],
  sideRight: [1, 3, 5],
  reserve: [6, 7],
};

function pushCards(out, cells, layer, region, zoneLayer) {
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    out.push({
      x: c.x, y: c.y, layer, region, zoneLayer,
      w: TILE_W, h: TILE_H,
    });
  }
}

/**
 * 生成一关的牌位。返回与 layout.generateLayout 相同形状的数组（不含 z/id，
 * 由调用方按 z 全序统一编号），另附 plan / regions 元信息便于验收。
 */
export function generateProfileLayout(seed, profile) {
  if (!profile) throw new Error('generateProfileLayout 需要 profile');
  const s = (seed >>> 0) ^ 0x50def1ce;
  const rng = makeRng(s >>> 0);
  void rng; // 布局形状由档位确定性决定；seed 只影响 generator 的发牌序列
  const plan = layerPlanFor(profile);
  const N = profile.layers;
  const out = [];

  if (profile.queueCount === 0) {
    // 第 1 关：单区域紧凑堆，层张数按 60/40 或 50/33/17
    // 固定 6 列（不随档位张数扩张）：每个几何解锁批次的牌数更贴近 3 的倍数，
    // 三张同花色的牌更容易同时可点，第一关 greedy 通关率才能稳定 ≥95%。
    // 实测档 3：cols=ceil(24/3)=8 时 94.25%，cols=6 时 97.50%。
    // 6 列 × 最多 4 行仍完整落在牌桌内（最右 x=561、最下 y=792，边界 700/918）。
    const cols = 6;
    for (let li = 0; li < N; li++) {
      pushCards(out, l1Cells(li, plan[li], cols), li, 'core', li);
    }
  } else {
    for (let li = 0; li < N; li++) {
      pushCards(out, coreCells(li, plan[li]), li, 'core', li);
    }
    let queueTotal = 0;
    for (const z of queueZones((N - 1) % 2 === 0)) {
      const offs = QUEUE_STACK_OFFSETS[z.name];
      for (let li = 0; li < z.plan.length; li++) {
        const [cols, rows] = z.grids[li];
        const [ox, oy] = z.origins[li];
        const cells = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            cells.push({ x: ox + c * TILE_W, y: oy + r * TILE_H });
          }
        }
        pushCards(out, cells.slice(0, z.plan[li]), N + offs[li], z.name, li);
        queueTotal += z.plan[li];
      }
    }
    if (queueTotal !== QUEUE || queueTotal !== profile.queueCount) {
      throw new Error(`队列张数 ${queueTotal} ≠ ${QUEUE}/${profile.queueCount}`);
    }
  }

  // 半格晶格 / 版面边界硬校验
  for (const c of out) {
    if (c.x % LATTICE_X !== 0 || c.y % LATTICE_Y !== 0) {
      throw new Error(`坐标 (${c.x},${c.y}) 不在半格晶格上`);
    }
    if (c.x < BOARD_BAND.left || c.y < BOARD_BAND.top ||
        c.x + TILE_W > BOARD_BAND.right || c.y + TILE_H > BOARD_BAND.bottom) {
      throw new Error(`坐标 (${c.x},${c.y}) 越出牌桌`);
    }
  }
  const expect = profile.mainCount + profile.queueCount;
  if (out.length !== expect) {
    throw new Error(`布局张数 ${out.length} ≠ 档位 ${expect}`);
  }
  // z 全序：layer 升序 → y 升序 → x 升序
  out.sort((a, b) => a.layer - b.layer || a.y - b.y || a.x - b.x);
  for (let i = 0; i < out.length; i++) {
    out[i].id = i;
    out[i].z = i;
  }
  return out;
}

/** 档位布局说明（UI / 测试用） */
export function describeProfileLayout(profile) {
  const plan = layerPlanFor(profile);
  return {
    profileId: profile.id,
    layers: profile.layers,
    types: profile.types,
    mainCount: profile.mainCount,
    queueCount: profile.queueCount,
    total: profile.mainCount + profile.queueCount,
    plan,
    globalLayers: profile.layers + (profile.queueCount ? 8 : 0),
  };
}
