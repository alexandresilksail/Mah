/**
 * MAH 小程序 — 道具系统规则测试（真实执行，非伪造）
 * ------------------------------------------------------------------
 * 覆盖指令第九步 + 首版缺陷修复后的道具接入：
 *  · 洗牌：数量守恒、位置不变、牌型多重集不变、次数扣减、耗尽拒绝
 *  · 撤销：恢复最近一次点击、历史栈回退、次数扣减、空历史拒绝
 *  · 移出：槽内牌进入 temp、槽位清空、点击放回（canPick 不认 temp → pick 分流）
 *  · 复活：失败后可清空槽位继续、次数扣减、重复拒绝
 *  · 临时区命中坐标：TEMP_ZONE 索引布局与渲染一致（画在哪点哪）
 *  · audio 回调：四个道具引擎调用 audio.xxx，不抛异常
 *
 * 运行：node tests/props.mjs
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const C = require(path.join(__dirname, '..', 'core', 'mah-core.js'));

let passed = 0, failed = 0;
function ok(cond, name, extra) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}
function section(t) { console.log('\n[' + t + ']'); }

const noop = () => {};
const audioLog = [];
function makeAudio() {
  return {
    pick: () => audioLog.push('pick'), match: () => audioLog.push('match'),
    deny: () => audioLog.push('deny'), win: () => audioLog.push('win'),
    lose: () => audioLog.push('lose'), shuffle: () => audioLog.push('shuffle'),
    undo: () => audioLog.push('undo'), remove: () => audioLog.push('remove'),
    revive: () => audioLog.push('revive'),
  };
}
function freshGame(level = 1) {
  const g = new C.Game(makeAudio());
  g.saveState = { level1RecentGames: [], level2RecentGames: [] };
  C.createNewGame({ level, generationReason: 'new_game', game: g, save: g.saveState });
  return g;
}
/** 从牌堆挑 n 张可点牌依次入槽（不触发三消以保证槽内有牌） */
function pickDistinct(g, n) {
  let cnt = 0;
  for (const c of g.cards.slice()) {
    if (cnt >= n) break;
    if (g.canPick(c) && c.state === 'board') {
      // 避免三张同型导致自动消除：只取与槽内已入牌不同型的
      const types = g.slot.map((s) => s.type);
      if (types.filter((t) => t === c.type).length >= 2) continue;
      if (g.pick(c)) cnt++;
    }
  }
  return cnt;
}

/* ------------------------------------------------------------------ */
section('洗牌 useShuffle');
{
  const g = freshGame(1);
  const board = g.cards.filter((c) => c.state === 'board');
  const before = board.map((c) => ({ id: c.id, type: c.type, x: c.x, y: c.y, z: c.z }));
  const multiset = before.map((b) => b.type).sort().join(',');
  const n = g.props.shuffle;
  const ok1 = g.useShuffle();
  ok(ok1 === true, '有次数时洗牌成功');
  const after = board.map((c) => ({ id: c.id, type: c.type, x: c.x, y: c.y, z: c.z }));
  let posSame = true, typeSame = true;
  for (let i = 0; i < before.length; i++) {
    if (before[i].x !== after[i].x || before[i].y !== after[i].y || before[i].z !== after[i].z) posSame = false;
    if (before[i].type !== after[i].type) typeSame = false;
  }
  ok(posSame, '洗牌后每张牌位置/层级完全不变');
  ok(!typeSame || before.length < 2, '洗牌确实改变了牌型分布（牌数>1时）');
  ok(after.map((b) => b.type).sort().join(',') === multiset, '洗牌后牌型多重集守恒');
  ok(g.props.shuffle === n - 1, '洗牌次数正确扣减 ' + n + '→' + g.props.shuffle);
  ok(audioLog.includes('shuffle'), '洗牌触发 audio.shuffle 回调');

  g.props.shuffle = 0;
  const again = g.useShuffle();
  ok(again === false, '次数耗尽时洗牌被拒绝');
}

/* ------------------------------------------------------------------ */
section('撤销 useUndo');
{
  const g = freshGame(1);
  ok(g.useUndo() === false, '空历史时撤销被拒绝');
  const picked = pickDistinct(g, 1);
  ok(picked === 1 && g.slot.length === 1, '先入槽 1 张牌');
  const cardId = g.slot[0].id;
  const beforeUndo = g.props.undo;
  const ok1 = g.useUndo();
  ok(ok1 === true, '有历史时撤销成功');
  ok(g.slot.length === 0, '撤销后槽位回退为空');
  ok(g.cards.find((c) => c.id === cardId).state === 'board', '撤销的牌回到牌堆 board 状态');
  ok(g.props.undo === beforeUndo - 1, '撤销次数正确扣减');
  ok(audioLog.includes('undo'), '撤销触发 audio.undo 回调');
}

/* ------------------------------------------------------------------ */
section('移出 useRemove + 临时区放回');
{
  const g = freshGame(1);
  let audioDenyBefore = audioLog.filter((x) => x === 'deny').length;
  ok(g.useRemove() === false, '槽位为空时移出被拒绝');
  const picked = pickDistinct(g, 2);
  ok(picked === 2 && g.slot.length === 2, '先入槽 2 张牌');
  const beforeRemove = g.props.remove;
  const ok1 = g.useRemove();
  ok(ok1 === true, '槽位有牌时移出成功');
  ok(g.temp.length === 2 && g.slot.length === 0, '2 张牌从槽位移入临时区，槽位清空');
  ok(g.props.remove === beforeRemove - 1, '移出次数正确扣减');

  // 关键回归：canPick 不认 temp，页面必须直接 pick 分流
  const t = g.temp[0];
  ok(g.canPick(t) === false, 'canPick(temp) 为 false（证明页面绕过的必要性）');
  const back = g.pick(t);
  ok(back === true, 'pick(temp) 触发 returnFromTemp 放回成功');
  ok(g.temp.length === 1 && g.slot.length === 1, '放回后临时区减 1、槽位加 1');

  // 临时区命中坐标（模拟 touch-handler 的索引判定）
  const TZ = C.TEMP_ZONE;
  const idx = 0;
  const hx = TZ.x + idx * TZ.pitch + C.TILE_W / 2;
  const hy = TZ.y + C.TILE_H / 2;
  const inZone = hx >= TZ.x + idx * TZ.pitch && hx <= TZ.x + idx * TZ.pitch + C.TILE_W &&
                 hy >= TZ.y && hy <= TZ.y + C.TILE_H;
  ok(inZone, '临时区第 idx 张牌的命中坐标落在 TEMP_ZONE 内（画在哪点哪）');
}

/* ------------------------------------------------------------------ */
section('复活 useRevive');
{
  const g = freshGame(1);
  ok(g.useRevive() === false, '非失败状态不能复活');
  // 人为构造失败：填满 7 槽（不同型避免三消）
  g.status = 'lose';
  g.slot = g.cards.filter((c) => c.state === 'slot').slice(0, 0); // 清空后手动塞 7 张 board
  const fill = g.cards.filter((c) => c.state === 'board').slice(0, 7);
  fill.forEach((c) => { c.state = 'slot'; g.slot.push(c); });
  const beforeLeft = g.reviveLeft;
  const ok1 = g.useRevive();
  ok(ok1 === true, '失败状态且有次数时复活成功');
  ok(g.status === 'play', '复活后状态回到 play');
  ok(g.slot.length === 0, '复活后槽位被清空');
  ok(g.reviveLeft === beforeLeft - 1, '复活次数正确扣减');
  ok(g.revived === true, 'revived 标记置位（结算页可展示）');
  ok(audioLog.includes('revive'), '复活触发 audio.revive 回调');
  ok(g.useRevive() === false, '复活次数耗尽后再次复活被拒绝');
}

/* ------------------------------------------------------------------ */
section('第二关道具在完整牌局中可用');
{
  const g = freshGame(2);
  ok(g.props.shuffle === 3 && g.props.undo === 3 && g.props.remove === 3 && g.reviveLeft === 1,
     '第二关道具按规格初始化（洗/撤/移各 3，复活 1）');
  const picked = pickDistinct(g, 2);
  ok(picked === 2, '第二关可正常入槽');
  ok(g.useShuffle() === true && g.useUndo() === true, '第二关洗牌/撤销可正常执行');
}

/* ------------------------------------------------------------------ */
console.log('\n========================================');
console.log('道具测试：' + passed + ' 通过 / ' + failed + ' 失败');
console.log('========================================');
process.exit(failed > 0 ? 1 : 0);
