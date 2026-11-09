/**
 * v2.0.0 —— 16 种牌型的唯一注册表（纯数据，零 DOM / 零 Canvas 依赖）。
 *
 * 设计约束（对应需求 4.1 / 2.2）：
 *  · 每种牌型有稳定唯一 ID、唯一名称、独立图案 icon、独立配色（face/rim/ink/accent）；
 *  · 16 种配色的「牌面底色 + 边框主色 + 图案主色」三元组互不相同，
 *    缩小到手机尺寸靠「色相 + 图案形状」双重区分，不靠细微色差；
 *  · 同一种牌型在两关里 ID 与配色完全一致；
 *  · 图案全部为原创 Canvas 路径（tiles.js 里的 drawIcon），不使用任何外部素材。
 *
 * 「唯一注册表」= 只有这里定义 ID / 名称 / 配色；tiles.js 只负责绘制，
 * generator.js 只负责按 LEVEL_MIX 分配数量，test.js 从这里读元数据做断言。
 */

/** 16 种牌型，顺序即下标；generator.js 的 LEVEL_MIX.groups 与这里一一对应 */
export const TILE_TYPES = [
  { id: 'sparrow',      name: '幺鸡',   short: '雀', family: 'bird',    icon: 'bird',      face: '#E6F6EC', rim: '#2E8B62', ink: '#176B4A', accent: '#F2A03D' },
  { id: 'red-centre',   name: '红中',   short: '中', family: 'honor',   icon: 'diamond',   face: '#FDE9E4', rim: '#D64B36', ink: '#A82C1C', accent: '#FFCE5C' },
  { id: 'green-fa',     name: '青發',   short: '發', family: 'honor',   icon: 'leaf',      face: '#E8F4D9', rim: '#4F9A3C', ink: '#27621F', accent: '#F0C64C' },
  { id: 'blue-frame',   name: '蓝框',   short: '框', family: 'honor',   icon: 'frame',     face: '#E4F0FD', rim: '#3B7BC8', ink: '#1E4E8C', accent: '#FF9E5E' },
  { id: 'coin-1',       name: '金筒',   short: '金', family: 'coin',    icon: 'coin1',     face: '#FFF3D6', rim: '#D9A227', ink: '#8A5E12', accent: '#D9533B' },
  { id: 'coin-3',       name: '三筒',   short: '三', family: 'coin',    icon: 'coin3',     face: '#F1E8FB', rim: '#8A5FC0', ink: '#593389', accent: '#4FC0A8' },
  { id: 'bamboo-2',     name: '双竹',   short: '竹', family: 'bamboo',  icon: 'bamboo2',   face: '#E9F6E2', rim: '#62A83F', ink: '#2F6B21', accent: '#E4573D' },
  { id: 'bamboo-5',     name: '五竹',   short: '五', family: 'bamboo',  icon: 'bamboo5',   face: '#DEF2EE', rim: '#2E9C8C', ink: '#12645A', accent: '#F4B63C' },
  { id: 'flower-plum',  name: '梅花',   short: '梅', family: 'flower',  icon: 'blossom',   face: '#FDE8F0', rim: '#D65A8C', ink: '#9B2F5C', accent: '#FFD25E' },
  { id: 'flower-orchid',name: '兰花',   short: '兰', family: 'flower',  icon: 'orchid',    face: '#F0E9FC', rim: '#7A5FC8', ink: '#49308A', accent: '#5FC0A8' },
  { id: 'flower-chrys', name: '金菊',   short: '菊', family: 'flower',  icon: 'chrys',     face: '#FFF0DA', rim: '#E08A2C', ink: '#945413', accent: '#D9533B' },
  { id: 'fish',         name: '锦鲤',   short: '鲤', family: 'animal',  icon: 'fish',      face: '#FFE9DF', rim: '#E4634A', ink: '#A83A24', accent: '#4E9ED6' },
  { id: 'moon',         name: '弯月',   short: '月', family: 'sky',     icon: 'moon',      face: '#E7EAFB', rim: '#4A5BAE', ink: '#2A357A', accent: '#F2C14E' },
  { id: 'sun',          name: '朝阳',   short: '日', family: 'sky',     icon: 'sun',       face: '#FFF4CF', rim: '#E6B12F', ink: '#9A6B12', accent: '#E4573D' },
  { id: 'cloud',        name: '祥云',   short: '云', family: 'sky',     icon: 'cloud',     face: '#E3F4FB', rim: '#3E97C1', ink: '#1D6389', accent: '#F0A04B' },
  { id: 'star',         name: '星芒',   short: '星', family: 'sky',     icon: 'star',      face: '#F6EBFF', rim: '#9B5BC4', ink: '#5F3086', accent: '#F5C33B' },
];

export const TYPE_IDS = [];
export const TYPE_BY_ID = {};
for (let i = 0; i < TILE_TYPES.length; i++) {
  const t = TILE_TYPES[i];
  t.index = i;
  TYPE_IDS.push(t.id);
  TYPE_BY_ID[t.id] = t;
}

export const TYPE_COUNT = TILE_TYPES.length;

export function tileType(id) {
  return TYPE_BY_ID[id] || null;
}

/** 注册表自检：ID 唯一、名称唯一、配色三元组唯一、字段齐全 */
export function validateRegistry() {
  const ids = {};
  const names = {};
  const colors = {};
  const issues = [];
  for (let i = 0; i < TILE_TYPES.length; i++) {
    const t = TILE_TYPES[i];
    if (!t.id || !t.name || !t.icon || !t.face || !t.rim || !t.ink || !t.accent) {
      issues.push(`第 ${i} 项字段缺失`);
    }
    if (ids[t.id]) issues.push(`ID 重复：${t.id}`);
    if (names[t.name]) issues.push(`名称重复：${t.name}`);
    const key = t.face + '|' + t.rim + '|' + t.ink;
    if (colors[key]) issues.push(`配色重复：${t.id} / ${colors[key]}`);
    ids[t.id] = 1;
    names[t.name] = 1;
    colors[key] = t.id;
  }
  if (TILE_TYPES.length !== 16) issues.push(`牌型数量应为 16，实测 ${TILE_TYPES.length}`);
  return { ok: issues.length === 0, issues, count: TILE_TYPES.length };
}

/** 每关的牌型组数配额（单位：三消组，不是张数） */
export function mixFor(level) {
  const raw = level <= 1
    ? [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    : [7, 7, 6, 6, 6, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4];
  return raw.slice();
}

/** ES5 兼容视图的短标签表（纯数据，避免兼容版再解析 ID） */
export const ES5_LABELS = {};
for (let i = 0; i < TILE_TYPES.length; i++) {
  ES5_LABELS[TILE_TYPES[i].id] = { text: TILE_TYPES[i].short, color: TILE_TYPES[i].rim, face: TILE_TYPES[i].face };
}
