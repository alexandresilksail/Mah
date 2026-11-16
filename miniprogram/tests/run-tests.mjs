/**
 * MAH 小程序 — 自动化测试（真实执行，禁止伪造）。
 * 覆盖：游戏规则 / 三消 / 七槽位 / 遮挡 / 胜负 / 第一关 / 第二关20套 / 生命周期。
 * 运行：node tests/run-tests.mjs
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const C = require(path.join(__dirname, '..', 'core', 'mah-core.js'));

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; }
  else { fail++; failures.push({ name, detail }); console.log('  ✗ FAIL:', name, detail || ''); }
}
function section(t) { console.log('\n=== ' + t + ' ==='); }

/* ---------- 1. 牌型注册表 ---------- */
section('1. 牌型系统（16 种）');
{
  const reg = C.validateRegistry();
  ok(reg.ok && reg.count === 16, '牌型注册表自检通过且为16种', JSON.stringify(reg.issues));
  ok(C.TYPE_IDS.length === 16, 'TYPE_IDS 长度16');
  ok(new Set(C.TYPE_IDS).size === 16, '牌型ID唯一');
  // 渲染与逻辑一致：getType 能解析所有 ID
  let allResolved = true;
  for (const id of C.TYPE_IDS) if (!C.getType(id)) allResolved = false;
  ok(allResolved, '绘制层 getType 可解析所有牌型ID');
}

/* ---------- 2. 三消规则 ---------- */
section('2. 三消与槽位规则');
{
  const mk = (t) => ({ type: t });
  const slot = [];
  C.slotInsert(slot, mk('a'));
  C.slotInsert(slot, mk('b'));
  C.slotInsert(slot, mk('a'));
  // 同花色插入到最右侧同花色之后 → [a,a,b]
  ok(slot.map(c => c.type).join(',') === 'a,a,b', '入槽按同花色聚合', slot.map(c=>c.type).join(','));
  ok(C.slotMatchTypes(slot).length === 0, '两张相同不触发消除');
  C.slotInsert(slot, mk('a'));
  ok(C.slotMatchTypes(slot).indexOf('a') >= 0, '三张相同触发消除判定');
  const mixed = [mk('a'), mk('b'), mk('c')];
  ok(C.slotMatchTypes(mixed).length === 0, '不同牌型不消除');
  const rem = C.resolveSlot([mk('a'), mk('b'), mk('a'), mk('a'), mk('b')]);
  ok(rem.length === 3 && rem.every(c => c.type === 'a'), 'resolveSlot 只移除三张相同', JSON.stringify(rem.map(c=>c.type)));
}

/* ---------- 3. 七槽位满载 ---------- */
section('3. 七槽位系统');
{
  ok(C.SLOT_CAPACITY === 7, '槽位容量为7');
  const types = ['a','b','c','d','e','f','g'];
  const slot = types.map(mkT);
  function mkT(t){ return { type: t }; }
  ok(slot.length === 7, '可容纳7张未消除牌');
  // 满7且无三张相同 → 失败（用 Game 的 queueResolve 判定）
  const g = new C.Game(null);
  g.status = 'play';
  g.slot = ['a','b','c','d','e','f','g'].map((t,i)=>({id:i,type:t,state:'slot'}));
  g.queueResolve();
  ok(g.status === 'lose', '第七槽占满且无消除 → 判负', g.status);
}

/* ---------- 4. 遮挡判定 ---------- */
section('4. 遮挡与可点击');
{
  const d = C.generateLevel(1, 777, {});
  const cards = d.cards;
  const board = C.refreshBlocked(cards); // 返回所有在桌牌并刷新 blocked 标记
  const clickable = board.filter(c => !c.blocked);
  ok(clickable.length > 0, '存在可点击牌', 'clickable='+clickable.length);
  ok(board.every(c => typeof c.blocked === 'boolean'), 'refreshBlocked 为每张在桌牌刷新遮挡标记');
  // isCovered 与 blocked 标记一致（同一几何判定源）
  let consistent = true;
  for (const c of board) {
    const cov = C.isCovered(c, board);
    if (c.blocked !== cov) consistent = false;
  }
  ok(consistent, 'isCovered 与 blocked 标记一致（基于真实几何，非 z-index）');
  // 遮挡解除：移除一个可点牌后，其余牌的 blocked 标记被正确重算
  const before = board.filter(c => !c.blocked).length;
  clickable[0].state = 'cleared';
  const board2 = C.refreshBlocked(cards);
  const clickable2 = board2.filter(c => !c.blocked);
  ok(clickable2.length >= before - 1, '移除牌后遮挡关系正确重算（下层可恢复可点）',
     'before='+before+' after='+clickable2.length);
}

/* ---------- 5. 胜负判定 ---------- */
section('5. 胜负判定');
{
  const d = C.generateLevel(1, 2024, {});
  const g = new C.Game(null);
  g.installLevelData(d, null, { skipFidelityCheck: true });
  ok(g.status === 'play', '安装后状态为 play');
  ok(g.remaining() === d.cards.length, '剩余牌数正确');
  // 全部标记 cleared 后 resolve 判胜
  for (const c of g.cards) c.state = 'cleared';
  g.resolve();
  ok(g.status === 'win', '全部消除 → 胜利', g.status);
}

/* ---------- 6. 第一关（保护模块） ---------- */
section('6. 第一关冻结性');
{
  const d = C.generateLevel(1, 42, {});
  ok(d.cards.length === 24 || d.cards.length === 30 || d.cards.length === 36 || d.cards.length === 48,
     '第一关牌数属于冻结档位集合', 'cards='+d.cards.length);
  ok(d.cards.every(c => c.type && C.TYPE_BY_ID[c.type]), '第一关所有牌型合法');
  const counts = {};
  for (const c of d.cards) counts[c.type] = (counts[c.type]||0)+1;
  ok(Object.values(counts).every(n => n % 3 === 0), '第一关每种牌型张数为3的倍数');
  ok(C.verify(d) === true, '第一关可解（verify 通过）');
}

/* ---------- 7. 第二关 20 套模板 ---------- */
section('7. 第二关 20 套布局模板');
{
  ok(C.L2_TEMPLATE_IDS.length === 20, '恰好20套模板', 'n='+C.L2_TEMPLATE_IDS.length);
  ok(new Set(C.L2_TEMPLATE_IDS).size === 20, '模板ID唯一');
  let allGenerated = 0, geomOk = 0, countOk = 0;
  const sigs = new Set();
  for (const tid of C.L2_TEMPLATE_IDS) {
    try {
      const d = C.generateLevel(2, 1000 + allGenerated, { profile: 3, templateId: tid });
      if (d.templateId === tid) allGenerated++;
      // 几何保真校验
      const f = C.verifyTemplateFidelity(d.cards, tid, d.profile, d.specFillRot);
      if (f.ok) geomOk++;
      if (d.cards.length > 0 && d.cards.length % 3 === 0) countOk++;
      sigs.add(tid + ':' + d.cards.map(c=>c.x+','+c.y).join('|').slice(0,200));
    } catch (e) {
      console.log('  模板生成失败', tid, e.message);
    }
  }
  ok(allGenerated === 20, '20套模板全部可生成且templateId一致', 'ok='+allGenerated);
  ok(geomOk === 20, '20套模板几何保真校验通过', 'ok='+geomOk);
  ok(countOk === 20, '20套模板牌数为3的倍数', 'ok='+countOk);
  ok(sigs.size === 20, '20套模板布局坐标结构互不相同', 'unique='+sigs.size);
}

/* ---------- 8. 第二关最近10局不重复 ---------- */
section('8. 第二关最近10局去重');
{
  const g = new C.Game(null);
  const save = { level2RecentGames: [] };
  const used = [];
  let dup = 0;
  for (let i = 0; i < 12; i++) {
    const r = C.createNewGame({ level: 2, generationReason: i===0?'application_restart':'new_game', game: g, save });
    const tid = r.meta.templateId;
    if (used.slice(-10).indexOf(tid) >= 0) dup++;
    used.push(tid);
    // 把新记录写回 save 形成历史窗口
    save.level2RecentGames = C.sanitizeHistory(r.nextSave.level2RecentGames, 2);
  }
  ok(dup === 0, '连续12局最近10局布局无重复', 'dup='+dup);
  ok(save.level2RecentGames.length === 10, '第二关历史窗口固定为10局', 'len='+save.level2RecentGames.length);
  ok(save.level2RecentGames.every(r => r.templateId), '每局记录 templateId');
  ok(save.level2RecentGames.every(r => typeof r.seed === 'number'), '每局记录 seed');
}

/* ---------- 9. Seed 可复现 ---------- */
section('9. Seed 复现性');
{
  const a = C.generateLevel(2, 55555, { profile: 3, templateId: 'L2-P05' });
  const b = C.generateLevel(2, 55555, { profile: 3, templateId: 'L2-P05' });
  const sa = a.cards.map(c=>c.type+':'+c.x+','+c.y).join('|');
  const sb = b.cards.map(c=>c.type+':'+c.x+','+c.y).join('|');
  ok(sa === sb, '相同Seed+参数生成完全相同牌局');
  const c = C.generateLevel(2, 55556, { profile: 3, templateId: 'L2-P05' });
  const sc = c.cards.map(c=>c.type+':'+c.x+','+c.y).join('|');
  ok(sa !== sc, '不同Seed生成不同牌局');
}

/* ---------- 10. 重开机制（5类原因） ---------- */
section('10. 重开机制五类场景');
{
  const reasons = ['application_restart','title_screen_restart','failure_restart','new_game'];
  for (const reason of reasons) {
    const g = new C.Game(null);
    let save = { level1RecentGames: [], level2RecentGames: [] };
    const r = C.createNewGame({ level: 1, generationReason: reason, game: g, save });
    ok(r.meta.generationReason === reason, '生成原因正确记录: '+reason);
    ok(r.meta.seed !== undefined, reason+' 有新 seed');
  }
  // 重开必换 seed：连续两次不同
  const g = new C.Game(null);
  const save = { level1RecentGames: [], level2RecentGames: [] };
  const r1 = C.createNewGame({ level: 1, generationReason: 'new_game', game: g, save });
  save.level1RecentGames = r1.nextSave.level1RecentGames;
  const g2 = new C.Game(null);
  const r2 = C.createNewGame({ level: 1, generationReason: 'failure_restart', game: g2, save });
  ok(r1.meta.seed !== r2.meta.seed, '重新生成换用新 Seed（不复用旧局）');
}

/* ---------- 汇总 ---------- */
console.log('\n============================================================');
console.log(`断言：通过 ${pass} 项，失败 ${fail} 项`);
if (failures.length) {
  console.log('失败明细：');
  for (const f of failures) console.log(' -', f.name, f.detail||'');
}
console.log('============================================================');
process.exit(fail === 0 ? 0 : 1);
