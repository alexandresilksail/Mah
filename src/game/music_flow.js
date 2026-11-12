/**
 * 背景音乐导入 / 匹配确认流程（第 4.3 节）。
 *
 * 严格五步，任何一步都不能跳过，**未点「应用」之前不写任何存档**：
 *   1. select   用户选择或拖入音乐文件（可多选）
 *   2. scenes   先显示 6 个场景清单，用户勾选并确认
 *   3. match    只对已勾选场景做文件名匹配，产出建议表
 *   4. confirm  用户逐条确认或改场景；未分配的进「未分配」区，可手工指派或忽略
 *   5. applied  点「应用」才返回 musicMap；点「取消」什么都不写
 *
 * 全部是纯函数（同一份 flow 对象进、出），零 DOM、零 I/O，
 * 所以可以在 Node 里直接跑状态机测试，也保证「取消不写」是结构性的而不是靠 UI 自觉。
 */
import { SCENES, isScene, matchScene, MAX_NAME_LEN } from './music_match.js';

export const FLOW_STEPS = ['select', 'scenes', 'match', 'confirm', 'applied', 'cancelled'];

function isArray(v) {
  return Object.prototype.toString.call(v) === '[object Array]';
}
function cloneMap(src) {
  var out = {};
  if (!src || typeof src !== 'object') return out;
  for (var k in src) {
    if (!Object.prototype.hasOwnProperty.call(src, k)) continue;
    if (!isScene(k)) continue;
    var list = src[k];
    if (!isArray(list)) continue;
    var keep = [];
    for (var i = 0; i < list.length; i++) {
      if (typeof list[i] === 'string' && list[i].length) keep.push(list[i]);
    }
    if (keep.length) out[k] = keep;
  }
  return out;
}

/** 新建一份空白流程；existingMap = 当前存档里的 musicMap（只作为 apply 的合并基础） */
export function createMusicFlow(existingMap) {
  return {
    step: 'select',
    files: [],          // 原始文件名（去重）
    scenes: [],         // 用户勾选的场景
    suggestions: [],    // { name, scene, matchedKeyword, confidence, target, auto }
    assignments: {},    // scene → [fileName]
    ignored: [],        // 用户显式忽略的文件
    baseMap: cloneMap(existingMap),
    error: '',
  };
}

function indexOf(arr, v) {
  for (var i = 0; i < arr.length; i++) if (arr[i] === v) return i;
  return -1;
}

function fail(flow, msg) {
  flow.error = msg;
  return { ok: false, error: msg, step: flow.step };
}

/**
 * 第 1 步：加入待导入文件。
 * 只在 select 步可用；重复文件名忽略；空名 / 超长名直接拒绝（不静默改名）。
 */
export function addFiles(flow, names) {
  if (!flow || flow.step !== 'select') return fail(flow || {}, '当前步骤不接受新文件');
  if (!isArray(names)) return fail(flow, '文件列表格式错误');
  var added = [];
  var rejected = [];
  for (var i = 0; i < names.length; i++) {
    var n = names[i];
    if (typeof n !== 'string' || !n.length || n.length > MAX_NAME_LEN) { rejected.push(String(n)); continue; }
    if (indexOf(flow.files, n) >= 0) continue;
    flow.files.push(n);
    added.push(n);
  }
  flow.error = '';
  return { ok: true, step: flow.step, added: added, rejected: rejected, total: flow.files.length };
}

/**
 * 第 2 步：先确认场景清单（可多选，但至少一个）。
 * 确认后立刻进入 match 步，并且**只对已勾选场景**做匹配。
 */
export function confirmScenes(flow, scenes) {
  if (!flow || flow.step !== 'select') return fail(flow || {}, '场景清单只能在选择文件之后确认');
  if (!isArray(scenes) || !scenes.length) return fail(flow, '至少要勾选一个场景');
  var picked = [];
  for (var i = 0; i < scenes.length; i++) {
    if (!isScene(scenes[i])) return fail(flow, '非法场景：' + scenes[i]);
    if (indexOf(picked, scenes[i]) < 0) picked.push(scenes[i]);
  }
  if (!flow.files.length) return fail(flow, '还没有选择任何音乐文件');
  flow.scenes = picked;
  flow.step = 'match';
  buildSuggestions(flow);
  flow.error = '';
  return { ok: true, step: flow.step, scenes: picked.slice(), suggestions: flow.suggestions.slice() };
}

/** 第 3 步：只对已勾选场景匹配；未勾选场景的命中一律不自动指派 */
function buildSuggestions(flow) {
  var list = [];
  for (var i = 0; i < flow.files.length; i++) {
    var name = flow.files[i];
    var m = matchScene(name);
    var target = null;
    if (m.scene && indexOf(flow.scenes, m.scene) >= 0) target = m.scene;
    list.push({
      name: name,
      scene: m.scene,
      matchedKeyword: m.matchedKeyword,
      matchedScenes: m.matchedScenes,
      confidence: m.confidence,
      target: target,
      auto: !!target,
    });
  }
  flow.suggestions = list;
}

function findSuggestion(flow, name) {
  for (var i = 0; i < flow.suggestions.length; i++) {
    if (flow.suggestions[i].name === name) return flow.suggestions[i];
  }
  return null;
}

function rebuildAssignments(flow) {
  var map = {};
  var unassigned = [];
  for (var i = 0; i < flow.scenes.length; i++) map[flow.scenes[i]] = [];
  for (var j = 0; j < flow.suggestions.length; j++) {
    var s = flow.suggestions[j];
    // 被显式忽略的文件既不进任何场景，也不留在「未分配」区（用户已经做过决定）
    if (indexOf(flow.ignored, s.name) >= 0) continue;
    if (s.target && isScene(s.target) && indexOf(flow.scenes, s.target) >= 0) {
      if (!map[s.target]) map[s.target] = [];
      map[s.target].push(s.name);
    } else {
      unassigned.push(s.name);
    }
  }
  flow.assignments = map;
  flow.unassigned = unassigned;
  return map;
}

/** 第 4 步：逐条确认或改场景；scene=null 表示放回未分配区 */
export function setTarget(flow, name, scene) {
  if (!flow || (flow.step !== 'match' && flow.step !== 'confirm')) {
    return fail(flow || {}, '当前步骤不能修改匹配');
  }
  var s = findSuggestion(flow, name);
  if (!s) return fail(flow, '未知文件：' + name);
  if (scene !== null && scene !== undefined) {
    if (!isScene(scene)) return fail(flow, '非法场景：' + scene);
    if (indexOf(flow.scenes, scene) < 0) return fail(flow, '场景未勾选：' + scene);
  }
  s.target = scene === undefined ? null : scene;
  s.auto = false;
  var ig = indexOf(flow.ignored, name);
  if (ig >= 0) flow.ignored.splice(ig, 1);
  rebuildAssignments(flow);
  flow.error = '';
  return { ok: true, step: flow.step, assignments: flow.assignments, unassigned: flow.unassigned };
}

/** 第 4 步：忽略某个文件（不写进任何场景） */
export function ignoreFile(flow, name) {
  if (!flow || (flow.step !== 'match' && flow.step !== 'confirm')) {
    return fail(flow || {}, '当前步骤不能忽略文件');
  }
  var s = findSuggestion(flow, name);
  if (!s) return fail(flow, '未知文件：' + name);
  if (indexOf(flow.ignored, name) < 0) flow.ignored.push(name);
  s.target = null;
  s.auto = false;
  rebuildAssignments(flow);
  flow.error = '';
  return { ok: true, step: flow.step, assignments: flow.assignments, unassigned: flow.unassigned, ignored: flow.ignored.slice() };
}

/** 进入 confirm 步（把 match 的建议表变成逐条确认表） */
export function beginConfirm(flow) {
  if (!flow || flow.step !== 'match') return fail(flow || {}, '当前步骤不能进入确认');
  rebuildAssignments(flow);
  flow.step = 'confirm';
  flow.error = '';
  return {
    ok: true, step: flow.step,
    assignments: flow.assignments,
    unassigned: flow.unassigned,
  };
}

/**
 * 第 5 步：应用。只有 confirm 步能应用，返回合并后的 musicMap。
 * 没被勾选的场景保持原样（不清空、不覆盖），这是「只对已勾选场景生效」的落点。
 */
export function applyFlow(flow) {
  if (!flow || flow.step !== 'confirm') {
    return { ok: false, reason: 'NOT_CONFIRMED', error: '尚未确认，不能写入', musicMap: null };
  }
  rebuildAssignments(flow);
  var map = cloneMap(flow.baseMap);
  for (var i = 0; i < flow.scenes.length; i++) {
    var sc = flow.scenes[i];
    var list = flow.assignments[sc] || [];
    if (list.length) map[sc] = list.slice();
    else if (Object.prototype.hasOwnProperty.call(map, sc)) delete map[sc];
  }
  flow.step = 'applied';
  flow.error = '';
  return {
    ok: true,
    reason: 'APPLIED',
    musicMap: map,
    assigned: flow.assignments,
    unassigned: flow.unassigned,
    ignored: flow.ignored.slice(),
  };
}

/** 取消：不改任何东西，也不返回任何可写入的数据 */
export function cancelFlow(flow) {
  if (!flow) return { ok: false, reason: 'CANCELLED', musicMap: null };
  flow.step = 'cancelled';
  return { ok: false, reason: 'CANCELLED', musicMap: null };
}

/** UI 用：把 flow 摊平成「场景 → 文件列表」的展示结构 */
export function summarize(flow) {
  rebuildAssignments(flow);
  var rows = [];
  for (var i = 0; i < SCENES.length; i++) {
    var sc = SCENES[i];
    rows.push({
      scene: sc,
      checked: indexOf(flow.scenes, sc) >= 0,
      files: (flow.assignments[sc] || []).slice(),
    });
  }
  return { step: flow.step, rows: rows, unassigned: flow.unassigned.slice(), ignored: flow.ignored.slice() };
}
