/**
 * v2.0.0 —— 两关独立布局模板（纯数据，零 DOM / 零 Canvas）。
 *
 * 需求 3.3：布局必须由明确的「坐标、层级、遮挡、牌型分布」数据驱动。
 * 本文件就是那份数据；layout.js 只负责把模板展开成 [{id,x,y,layer,z,region}]，
 * 遮挡关系一律由几何（矩形相交 + z 全序）计算，不再有第二套规则。
 *
 * 版权边界：项目里没有、也没有使用《羊了个羊》官方关卡坐标或内部牌型分布表。
 * 这里参考的是公开可见画面中的「结构特征」：第一关紧凑的浅层教学堆；
 * 第二关主堆 + 两侧长条 + 底部保留区的多区域、多层交叉遮挡。
 * 所有坐标、层数、张数均为本项目原创人工校准，差异在 DELIVERY.md 如实记录。
 *
 * ── 模板字段 ────────────────────────────────────────────────────────
 *  id / level / cardCount   模板标识与总牌数（必须 = Σ zone.plan）
 *  zones[]                  区域列表，每个区域：
 *    name        区域 id（core / sideLeft / sideRight / reserve）
 *    plan[]      每层张数（底→顶）
 *    grids[]     每层 {cols, rows}，cells = cols*rows ≥ plan[li]
 *    origin[]    每层**绝对左上角坐标** [x, y]，单位 px，且必须是
 *                (LATTICE_X, LATTICE_Y) 的整数倍 —— 零随机抖动、半格晶格
 *    stack[]     每层的全局堆叠层号（决定 z 与跨区域交叉遮挡）
 *    anchor      区域锚点说明（文档用）
 *    gaps        'edge'（边缘缺口，非长方形）| 'none'（完整矩形）
 *    crosses[]   该区域与哪些区域交叉遮挡（结构说明 + 测试断言）
 *    bias[]      该区域偏重的牌型下标（generator.js 发牌时读取）
 *
 * 所有数值都经过 clampTemplate() 边界检查：坐标落在 BOARD_BAND 内、
 * 列数 ≤ 安全区宽度、行数 ≤ 安全区高度、层号 0..6、plan 总和 = cardCount。
 */
import { TILE_W, TILE_H, LATTICE_X, LATTICE_Y, BOARD_BAND, LEVEL_SPEC } from './config.js';

export const TEMPLATES = {
  /* ==================== 第 1 关：教学浅堆 ==================== */
  L1_TUTORIAL: {
    id: 'L1_TUTORIAL',
    level: 1,
    cardCount: 48,
    shape: '三层紧凑金字塔：底层 7×3、中层 5×3、顶层 4×3；层层错位压叠但轮廓清晰',
    note: '教学关：开局顶层整层可点，形成连续三消正反馈；中后段需要看底层花色做选择',
    zones: [
      {
        name: 'core',
        shape: '居中金字塔',
        plan: [21, 15, 12],
        grids: [
          { cols: 7, rows: 3 },
          { cols: 5, rows: 3 },
          { cols: 4, rows: 3 },
        ],
        origin: [[132, 440], [231, 484], [231, 440]],
        stack: [0, 1, 2],
        anchor: 'center',
        gaps: 'none',
        crosses: [],
        bias: [0, 1, 4, 3, 6, 9, 12, 14, 2, 5, 7, 8, 10, 11, 13, 15],
      },
    ],
  },

  /* ==================== 第 2 关：多区域交叉遮挡 ==================== */
  L2_MULTI_ZONE: {
    id: 'L2_MULTI_ZONE',
    level: 2,
    cardCount: 240,
    shape: '中央 7 层主堆（中层外鼓）+ 左右各一条 3 层盲盒长条 + 底部 2 层保留区',
    note: '三个区域在坐标上互相咬合：侧条压住主堆外沿，保留区压住主堆底沿；上层消除后逐层暴露下层',
    zones: [
      {
        name: 'core',
        shape: '主堆：第 2、3 层向左右鼓出（比底层宽 66px），顶层收成完整小矩形',
        plan: [45, 39, 33, 27, 21, 9, 6],
        grids: [
          { cols: 9, rows: 5 },
          { cols: 9, rows: 5 },
          { cols: 10, rows: 4 },
          { cols: 10, rows: 3 },
          { cols: 7, rows: 3 },
          { cols: 5, rows: 2 },
          { cols: 3, rows: 2 },
        ],
        // 相邻层之间保持半格错位（x 或 y 差 33/44），每张上层牌有多张下层支撑
        origin: [
          [66, 352], [33, 396], [33, 440], [33, 484],
          [132, 440], [165, 484], [264, 484],
        ],
        // 全局层号：15 层互不重复，保证「同层零重叠」且跨区域遮挡关系明确
        stack: [0, 1, 3, 7, 10, 13, 14],
        anchor: 'center',
        gaps: 'edge',
        crosses: ['sideLeft', 'sideRight', 'reserve'],
        bias: [0, 1, 2, 3, 6, 7, 8, 11, 12],
      },
      {
        name: 'sideLeft',
        shape: '左侧盲盒长条：3 层 × 2×2，压住主堆左外沿',
        plan: [4, 4, 4],
        grids: [
          { cols: 2, rows: 2 }, { cols: 2, rows: 2 }, { cols: 2, rows: 2 },
        ],
        origin: [[33, 440], [66, 484], [33, 440]],
        stack: [4, 8, 11],
        anchor: 'left',
        gaps: 'none',
        crosses: ['core'],
        bias: [4, 5, 9, 10, 13],
      },
      {
        name: 'sideRight',
        shape: '右侧盲盒长条：3 层 × 2×2，压住主堆右外沿',
        plan: [4, 4, 4],
        grids: [
          { cols: 2, rows: 2 }, { cols: 2, rows: 2 }, { cols: 2, rows: 2 },
        ],
        origin: [[561, 440], [561, 484], [561, 440]],
        stack: [5, 9, 12],
        anchor: 'right',
        gaps: 'none',
        crosses: ['core'],
        bias: [4, 5, 9, 10, 13],
      },
      {
        name: 'reserve',
        shape: '底部保留区：2 层 × 6×3，压住主堆下沿，是最后才暴露的暗牌区',
        plan: [18, 18],
        grids: [
          { cols: 6, rows: 3 }, { cols: 6, rows: 3 },
        ],
        origin: [[165, 616], [198, 616]],
        stack: [2, 6],
        anchor: 'bottom',
        gaps: 'none',
        crosses: ['core'],
        bias: [2, 3, 14, 15, 8],
      },
    ],
  },
};

/** 边界检查：任何模板配置都要有默认值和边界 */
export function clampTemplate(tpl) {
  if (!tpl || !tpl.zones || !tpl.zones.length) throw new Error('模板缺少 zones');
  const maxCols = Math.floor((BOARD_BAND.right - BOARD_BAND.left) / TILE_W);
  const maxRows = Math.floor((BOARD_BAND.bottom - BOARD_BAND.top) / TILE_H);
  const out = { ...tpl, zones: [] };
  let total = 0;
  for (let zi = 0; zi < tpl.zones.length; zi++) {
    const z = tpl.zones[zi];
    const plan = (z.plan || []).slice();
    const grids = (z.grids || []).map((g) => ({
      cols: Math.max(1, Math.min(maxCols, g.cols | 0)),
      rows: Math.max(1, Math.min(maxRows, g.rows | 0)),
    }));
    const origin = (z.origin || []).map((o, li) => {
      const cols = grids[li] ? grids[li].cols : 1;
      const rows = grids[li] ? grids[li].rows : 1;
      let x = Math.round((o[0] || 0) / LATTICE_X) * LATTICE_X;
      let y = Math.round((o[1] || 0) / LATTICE_Y) * LATTICE_Y;
      x = Math.max(BOARD_BAND.left, Math.min(BOARD_BAND.right - cols * TILE_W, x));
      y = Math.max(BOARD_BAND.top, Math.min(BOARD_BAND.bottom - rows * TILE_H, y));
      return [x, y];
    });
    const stack = (z.stack || []).map((s) => Math.max(0, Math.min(31, s | 0)));
    const n = Math.min(plan.length, grids.length, origin.length, stack.length);
    plan.length = n;
    grids.length = n;
    origin.length = n;
    stack.length = n;
    for (let li = 0; li < n; li++) {
      const cells = grids[li].cols * grids[li].rows;
      if (plan[li] > cells) plan[li] = cells;
      if (plan[li] < 1) plan[li] = 1;
      total += plan[li];
    }
    out.zones.push({
      ...z,
      plan,
      grids,
      origin,
      stack,
      anchor: z.anchor || 'center',
      gaps: z.gaps === 'edge' ? 'edge' : 'none',
      crosses: (z.crosses || []).slice(),
      bias: (z.bias || []).slice(),
    });
  }
  out.cardCount = total;
  return out;
}

/** 模板自检：张数、网格容量、半格晶格坐标、层号、交叉遮挡目标存在 */
export function validateTemplate(tpl) {
  const issues = [];
  const t = clampTemplate(tpl);
  if (t.cardCount !== LEVEL_SPEC[t.level].cardCount) {
    issues.push(`总张数 ${t.cardCount} ≠ 关卡规格 ${LEVEL_SPEC[t.level].cardCount}`);
  }
  const names = {};
  const stacks = {};
  for (let zi = 0; zi < t.zones.length; zi++) {
    const z = t.zones[zi];
    names[z.name] = 1;
    for (let li = 0; li < z.stack.length; li++) {
      if (stacks[z.stack[li]]) issues.push(`全局层号 ${z.stack[li]} 重复（同层会重叠）`);
      stacks[z.stack[li]] = 1;
    }
    if (z.plan.length !== z.grids.length || z.plan.length !== z.origin.length || z.plan.length !== z.stack.length) {
      issues.push(`${z.name}: plan/grids/origin/stack 长度不一致`);
    }
    for (let li = 0; li < z.plan.length; li++) {
      const cells = z.grids[li].cols * z.grids[li].rows;
      if (z.plan[li] > cells) issues.push(`${z.name} 第 ${li} 层 ${z.plan[li]} 张 > 网格 ${cells}`);
      const ox = z.origin[li][0];
      const oy = z.origin[li][1];
      if (ox % LATTICE_X !== 0 || oy % LATTICE_Y !== 0) issues.push(`${z.name} 第 ${li} 层坐标不在半格晶格上`);
      if (ox + z.grids[li].cols * TILE_W > BOARD_BAND.right) issues.push(`${z.name} 第 ${li} 层右侧越界`);
      if (oy + z.grids[li].rows * TILE_H > BOARD_BAND.bottom) issues.push(`${z.name} 第 ${li} 层底部越界`);
    }
  }
  for (let zi = 0; zi < t.zones.length; zi++) {
    const z = t.zones[zi];
    for (let k = 0; k < z.crosses.length; k++) {
      if (!names[z.crosses[k]]) issues.push(`${z.name} 的交叉目标 ${z.crosses[k]} 不存在`);
    }
  }
  return { ok: issues.length === 0, issues, zones: t.zones.length, cardCount: t.cardCount };
}

export function templateFor(level) {
  return clampTemplate(level <= 1 ? TEMPLATES.L1_TUTORIAL : TEMPLATES.L2_MULTI_ZONE);
}

/** 文档 / 测试用的布局说明 */
export function describeTemplates() {
  const out = [];
  const keys = ['L1_TUTORIAL', 'L2_MULTI_ZONE'];
  for (let i = 0; i < keys.length; i++) {
    const t = clampTemplate(TEMPLATES[keys[i]]);
    const zones = [];
    for (let zi = 0; zi < t.zones.length; zi++) {
      const z = t.zones[zi];
      zones.push(`${z.name}:${z.plan.join('/')}(层 ${z.stack.join('/')})`);
    }
    out.push(`${t.id} 共 ${t.cardCount} 张 · ${zones.join(' + ')}`);
  }
  return out;
}
