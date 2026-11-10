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
 * ── 校验与归一的职责分离（v2.0.1 测试有效性修复） ──────────────────────
 *  · validateTemplate(原始模板)：严格校验，不修改任何数值。
 *    数组长度不一致、牌数非法、网格容量不足、坐标不在半格晶格 / 越界、
 *    全局层号重复、crosses 目标不存在或与实际几何不符 —— 一律直接报错，
 *    不做静默修正、不做自动截断。
 *  · clampTemplate(原始模板)：先跑 validateTemplate，非法直接 throw；
 *    合法时只做「默认值填充 + 数组复制」，不改坐标、不改牌数。
 *    它是运行时防御性归一（templateFor / describeTemplates 用），
 *    不再被 validateTemplate 调用，两者职责互不渗透。
 *
 * ── 模板字段 ────────────────────────────────────────────────────────
 *  id / level / cardCount   模板标识与总牌数（必须 = Σ zone.plan）
 *  zones[]                  区域列表，每个区域：
 *    name        区域 id（core / sideLeft / sideRight / reserve）
 *    plan[]      每层张数（底→顶），整数且 ≥1
 *    grids[]     每层 {cols, rows}，cells = cols*rows ≥ plan[li]
 *    origin[]    每层**绝对左上角坐标** [x, y]，单位 px，且必须是
 *                (LATTICE_X, LATTICE_Y) 的整数倍 —— 零随机抖动、半格晶格
 *    stack[]     每层的全局堆叠层号（0..31，全部区域合起来互不重复）
 *    anchor      区域锚点说明（文档用）
 *    gaps        'edge'（边缘缺口，非长方形）| 'none'（完整矩形）
 *    crosses[]   该区域与哪些区域交叉遮挡；必须与实际几何双向一致
 *                （声明了的必须真有几何交叉遮挡；有几何交叉遮挡的必须声明，
 *                  且 A 列出 B 时 B 也必须列出 A）
 *    bias[]      该区域偏重的牌型下标 0..15（generator.js 发牌时读取）
 */
import {
  TILE_W, TILE_H, LATTICE_X, LATTICE_Y,
  BOARD_BAND, LEVEL_SPEC, OVERLAP_THRESHOLD, TILE_AREA,
} from './config.js';

const THRESH_AREA = OVERLAP_THRESHOLD * TILE_AREA;

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
    note: '三个区域在坐标上互相咬合：侧条压住主堆外沿，保留区压住主堆底沿与侧条内下角；上层消除后逐层暴露下层',
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
        shape: '左侧盲盒长条：3 层 × 2×2，压住主堆左外沿；内下角与保留区交叉',
        plan: [4, 4, 4],
        grids: [
          { cols: 2, rows: 2 }, { cols: 2, rows: 2 }, { cols: 2, rows: 2 },
        ],
        origin: [[33, 440], [66, 484], [33, 440]],
        stack: [4, 8, 11],
        anchor: 'left',
        gaps: 'none',
        crosses: ['core', 'reserve'],
        bias: [4, 5, 9, 10, 13],
      },
      {
        name: 'sideRight',
        shape: '右侧盲盒长条：3 层 × 2×2，压住主堆右外沿；内下角与保留区交叉',
        plan: [4, 4, 4],
        grids: [
          { cols: 2, rows: 2 }, { cols: 2, rows: 2 }, { cols: 2, rows: 2 },
        ],
        origin: [[561, 440], [561, 484], [561, 440]],
        stack: [5, 9, 12],
        anchor: 'right',
        gaps: 'none',
        crosses: ['core', 'reserve'],
        bias: [4, 5, 9, 10, 13],
      },
      {
        name: 'reserve',
        shape: '底部保留区：2 层 × 6×3，压住主堆下沿与两侧条内下角，是最后才暴露的暗牌区',
        plan: [18, 18],
        grids: [
          { cols: 6, rows: 3 }, { cols: 6, rows: 3 },
        ],
        origin: [[165, 616], [198, 616]],
        stack: [2, 6],
        anchor: 'bottom',
        gaps: 'none',
        crosses: ['core', 'sideLeft', 'sideRight'],
        bias: [2, 3, 14, 15, 8],
      },
    ],
  },
};

/* ==================== 几何工具（只依赖模板数据） ==================== */

function overlapArea(a, b) {
  const ix = Math.min(a.x + TILE_W, b.x + TILE_W) - Math.max(a.x, b.x);
  const iy = Math.min(a.y + TILE_H, b.y + TILE_H) - Math.max(a.y, b.y);
  return ix > 0 && iy > 0 ? ix * iy : 0;
}

/** 一层的全部格点（按网格容量展开，坐标 = origin + 格距） */
function layerCells(z, li) {
  const ox = z.origin[li][0];
  const oy = z.origin[li][1];
  const { cols, rows } = z.grids[li];
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) out.push({ x: ox + c * TILE_W, y: oy + r * TILE_H });
  }
  return out;
}

/**
 * 由模板几何计算真实存在的「跨区域交叉遮挡」无序对集合。
 * 两个区域交叉 ⇔ 存在各自一层（层号不同）的格点对相交面积 > 阈值。
 */
function geometricCrossPairs(zones) {
  const pairs = new Set();
  for (let i = 0; i < zones.length; i++) {
    for (let j = i + 1; j < zones.length; j++) {
      const A = zones[i];
      const B = zones[j];
      let hit = false;
      for (let la = 0; la < A.stack.length && !hit; la++) {
        for (let lb = 0; lb < B.stack.length && !hit; lb++) {
          if (A.stack[la] === B.stack[lb]) continue;
          const ca = layerCells(A, la);
          const cb = layerCells(B, lb);
          for (let x = 0; x < ca.length && !hit; x++) {
            for (let y = 0; y < cb.length; y++) {
              if (overlapArea(ca[x], cb[y]) > THRESH_AREA) { hit = true; break; }
            }
          }
        }
      }
      if (hit) pairs.add([A.name, B.name].sort().join('|'));
    }
  }
  return pairs;
}

/** crosses 声明的无序对集合 */
function declaredCrossPairs(zones) {
  const byName = {};
  for (const z of zones) byName[z.name] = z;
  const pairs = new Set();
  for (const z of zones) {
    for (const t of (z.crosses || [])) {
      pairs.add([z.name, t].sort().join('|'));
    }
  }
  return pairs;
}

/* ==================== 严格校验（不修改输入） ==================== */

/**
 * 严格校验「原始模板」：所有非法输入直接进 issues，不做任何静默修正。
 * 返回 { ok, issues, zones, cardCount }；cardCount = Σ plan（实测值，便于对照）。
 */
export function validateTemplate(tpl) {
  const issues = [];
  const push = (m) => issues.push(m);
  if (!tpl || typeof tpl !== 'object') {
    return { ok: false, issues: ['模板不是对象'], zones: 0, cardCount: 0 };
  }
  if (!tpl.id || typeof tpl.id !== 'string') push('模板缺少 id');
  if (tpl.level !== 1 && tpl.level !== 2) push(`level 必须是 1 或 2（实测 ${tpl.level}）`);
  if (!Array.isArray(tpl.zones) || tpl.zones.length === 0) {
    push('模板缺少 zones');
    return { ok: false, issues, zones: 0, cardCount: 0 };
  }

  const names = {};
  let total = 0;

  for (let zi = 0; zi < tpl.zones.length; zi++) {
    const z = tpl.zones[zi];
    const tag = (z && z.name) || `zones[${zi}]`;
    if (!z || typeof z !== 'object') { push(`${tag} 不是对象`); continue; }
    if (!z.name || typeof z.name !== 'string') push(`zones[${zi}] 缺少 name`);
    else if (names[z.name]) push(`区域名 ${z.name} 重复`);
    else names[z.name] = 1;

    const { plan, grids, origin, stack } = z;
    const arrays = [plan, grids, origin, stack];
    if (!arrays.every(Array.isArray)) {
      push(`${tag}: plan/grids/origin/stack 必须都是数组`);
      continue;
    }
    // 数组长度必须一致 —— 不一致直接报错，不截断
    const n = plan.length;
    if (n < 1) push(`${tag}: 至少 1 层`);
    if (grids.length !== n || origin.length !== n || stack.length !== n) {
      push(`${tag}: plan(${n})/grids(${grids.length})/origin(${origin.length})/stack(${stack.length}) 长度不一致`);
      continue;
    }

    for (let li = 0; li < n; li++) {
      const p = plan[li];
      const g = grids[li];
      const o = origin[li];
      const s = stack[li];
      // 牌数：必须是 ≥1 的整数，且不超过网格容量 —— 不截断、不兜底
      if (!Number.isInteger(p) || p < 1) {
        push(`${tag} 第 ${li} 层牌数非法（${p}）`);
        continue;
      }
      if (!g || !Number.isInteger(g.cols) || !Number.isInteger(g.rows) || g.cols < 1 || g.rows < 1) {
        push(`${tag} 第 ${li} 层网格非法（${JSON.stringify(g)}）`);
        continue;
      }
      const cells = g.cols * g.rows;
      if (p > cells) push(`${tag} 第 ${li} 层 ${p} 张 > 网格容量 ${cells}（不自动截断）`);
      // 坐标：必须是半格晶格整数倍且在版面内 —— 不吸附、不夹取
      if (!Array.isArray(o) || o.length !== 2 || !Number.isFinite(o[0]) || !Number.isFinite(o[1])) {
        push(`${tag} 第 ${li} 层坐标非法（${JSON.stringify(o)}）`);
        continue;
      }
      const [ox, oy] = o;
      if (ox % LATTICE_X !== 0 || oy % LATTICE_Y !== 0) {
        push(`${tag} 第 ${li} 层坐标 (${ox},${oy}) 不在半格晶格上（不静默修正）`);
      }
      if (ox < BOARD_BAND.left || oy < BOARD_BAND.top ||
          ox + g.cols * TILE_W > BOARD_BAND.right || oy + g.rows * TILE_H > BOARD_BAND.bottom) {
        push(`${tag} 第 ${li} 层网格 (${ox},${oy}) ${g.cols}×${g.rows} 越出牌桌 ${JSON.stringify(BOARD_BAND)}`);
      }
      if (!Number.isInteger(s) || s < 0 || s > 31) push(`${tag} 第 ${li} 层层号非法（${s}）`);
      total += p;
    }
  }

  // 全局层号互不重复（跨区域共享同层会导致同层重叠）
  const stackSeen = {};
  for (const z of tpl.zones) {
    if (!Array.isArray(z.stack)) continue;
    for (const s of z.stack) {
      if (stackSeen[s]) push(`全局层号 ${s} 重复（同层会重叠）`);
      stackSeen[s] = 1;
    }
  }

  // 总张数与关卡规格
  if (tpl.cardCount !== total) push(`cardCount ${tpl.cardCount} ≠ Σ plan ${total}`);
  const spec = LEVEL_SPEC[tpl.level];
  if (spec && total !== spec.cardCount) push(`总张数 ${total} ≠ 关卡规格 ${spec.cardCount}`);

  // bias：牌型下标必须是 0..15 的整数
  for (const z of tpl.zones) {
    if (!Array.isArray(z.bias)) continue;
    for (const b of z.bias) {
      if (!Number.isInteger(b) || b < 0 || b > 15) push(`${z.name}.bias 含非法牌型下标 ${b}`);
    }
  }

  // crosses：目标存在 + 对称 + 与实际几何双向一致
  for (const z of tpl.zones) {
    if (!Array.isArray(z.crosses)) continue;
    for (const t of z.crosses) {
      if (t === z.name) push(`${z.name}.crosses 不应包含自己`);
      else if (!names[t]) push(`${z.name} 的交叉目标 ${t} 不存在`);
    }
  }
  if (issues.length === 0) {
    const declared = declaredCrossPairs(tpl.zones);
    const actual = geometricCrossPairs(tpl.zones);
    // 对称性：A 声明 B ⇒ B 声明 A
    for (const z of tpl.zones) {
      for (const t of (z.crosses || [])) {
        const other = tpl.zones.find((o) => o.name === t);
        if (other && !(other.crosses || []).includes(z.name)) {
          push(`交叉声明不对称：${z.name} → ${t}，但 ${t}.crosses 未包含 ${z.name}`);
        }
      }
    }
    for (const p of declared) {
      if (!actual.has(p)) push(`声明的交叉遮挡 ${p.replace('|', ' ↔ ')} 与实际几何不符（无 >10% 重叠遮挡）`);
    }
    for (const p of actual) {
      if (!declared.has(p)) push(`区域对 ${p.replace('|', ' ↔ ')} 存在实际交叉遮挡但未在 crosses 声明`);
    }
  }

  return { ok: issues.length === 0, issues, zones: tpl.zones.length, cardCount: total };
}

/**
 * 运行时防御性归一：先严格校验，非法直接 throw；
 * 合法时只做默认值填充与数组复制 —— 不改坐标、不改牌数、不截断。
 */
export function clampTemplate(tpl) {
  const v = validateTemplate(tpl);
  if (!v.ok) throw new Error('布局模板非法：' + v.issues.join('；'));
  const out = { ...tpl, zones: [] };
  for (const z of tpl.zones) {
    out.zones.push({
      ...z,
      plan: z.plan.slice(),
      grids: z.grids.map((g) => ({ cols: g.cols, rows: g.rows })),
      origin: z.origin.map((o) => [o[0], o[1]]),
      stack: z.stack.slice(),
      anchor: z.anchor || 'center',
      gaps: z.gaps === 'edge' ? 'edge' : 'none',
      crosses: (z.crosses || []).slice(),
      bias: (z.bias || []).slice(),
    });
  }
  out.cardCount = v.cardCount;
  return out;
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
