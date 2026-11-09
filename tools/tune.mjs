/**
 * 难度调参脚本：跑 N 局"AI 玩家"，统计通关率 / 步数 / 死局比例 / 开局可点数。
 * 用法：node tools/tune.mjs [局数] [maxVisibleTriples]
 */
import { generateLevel, simulatePlayer } from '../src/game/generator.js';
import { makeRng } from '../src/game/rng.js';
import { levelParams } from '../src/game/config.js';

const N = parseInt(process.argv[2] || '40', 10);
const MAXT = parseInt(process.argv[3] || '2', 10);
const MINP = parseInt(process.argv[4] || '0', 10);
const TYPES = parseInt(process.argv[5] || '0', 10);
const GRID = process.argv[6] || '';
const NOISE = parseFloat(process.argv[7] || '0');
if (GRID) {
  const [c, r] = GRID.split('x').map(Number);
  const L = levelParams(2).layout;
  L.cols = c;
  L.rows = r;
  L.cellW = Math.floor(668 / c);
  L.cellH = Math.floor(696 / r);
  L.tileW = L.cellW - 10;
  L.tileH = L.cellH - 12;
}
const rng = makeRng(987654321);

let wins = 0;
let hard = 0;
let forced = 0;
let losses = 0;
const moves = [];
const visibles = [];
const cardsN = [];
const typesN = [];

for (let i = 0; i < N; i++) {
  const seed = (i * 2654435761 + 12345) >>> 0;
  const lvl = generateLevel(2, seed, { maxVisibleTriples: MAXT, minVisiblePairs: MINP, types: TYPES || undefined });
  cardsN.push(lvl.cards.length);
  typesN.push(new Set(lvl.cards.map((c) => c.type)).size);
  visibles.push(lvl.visible);

  const r = simulatePlayer(lvl, rng, { noise: NOISE });
  if (r.win) wins++;
  else {
    losses++;
    if (r.deadlock) hard++;
    if (r.forced) forced++;
  }
  moves.push(r.moves);
}

const sum = (a) => a.reduce((x, y) => x + y, 0);
const avg = (a) => sum(a) / a.length;
const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
const pct = (a, p) => a.slice().sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * p))];

console.log(`局数 ${N}  maxTriples=${MAXT}  minPairs=${MINP}  types=${TYPES||'12~15'}  grid=${GRID||'6x5'} noise=${NOISE}`);
console.log(`通关            ${wins}  (${((wins / N) * 100).toFixed(0)}%)`);
console.log(`失败            ${losses}`);
console.log(`  其中硬死局    ${hard}  (${((hard / Math.max(1, losses)) * 100).toFixed(0)}%)`);
console.log(`  其中被迫死    ${forced}  (${((forced / Math.max(1, losses)) * 100).toFixed(0)}%)`);
console.log(`步数 均值/中位  ${avg(moves).toFixed(0)} / ${med(moves)}`);
console.log(`步数 p10~p90    ${pct(moves, 0.1)} ~ ${pct(moves, 0.9)}`);
console.log(`步数 最小/最大  ${Math.min(...moves)} / ${Math.max(...moves)}`);
console.log(`开局可点        ${Math.min(...visibles)}~${Math.max(...visibles)}`);
console.log(`牌数            ${Math.min(...cardsN)}~${Math.max(...cardsN)}  牌型 ${Math.min(...typesN)}~${Math.max(...typesN)}`);
console.log(`估算时长(1.6s/步) ${(avg(moves) * 1.6 / 60).toFixed(1)} 分钟`);
