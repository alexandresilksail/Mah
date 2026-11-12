/**
 * 背景音乐：场景定义 + 场景判定 + 文件名匹配（第 4.1 / 4.2 节）。
 *
 * 设计原则：
 *  · 全部是纯函数，零 DOM、零 I/O、零全局状态，Node 里可以直接表驱动测试；
 *  · 场景固定 6 个，不许多也不许少（存档 / Rust 白名单 / UI 都以此为准）；
 *  · matchScene 只产出「建议」，绝不自动写存档：`ambiguous` 与 `none`
 *    必须由用户在确认流程里手工指派（第 4.3 节）。
 */

/** 六个固定场景（顺序即 UI 显示顺序） */
export const SCENES = ['title', 'level1', 'level2', 'win', 'lose', 'graduated'];

/** 场景中文名（UI 文案） */
export const SCENE_LABELS = {
  title: '标题页',
  level1: '第一关',
  level2: '第二关',
  win: '过关',
  lose: '失败',
  graduated: '全部通关',
};

export function isScene(v) {
  for (var i = 0; i < SCENES.length; i++) if (SCENES[i] === v) return true;
  return false;
}

/**
 * 由 Game 实例推导当前场景（覆盖全部状态，不许出现 undefined）。
 *
 *   screen === 'title'        → title
 *   graduated                  → graduated（优先于 win：毕业也是一种通关）
 *   status === 'lose'          → lose
 *   status === 'win'           → win
 *   其余（status==='play'）     → level 2 ? level2 : level1
 *
 * 未知/空对象一律回落到 title，保证调用方永远拿到 6 个场景之一。
 */
export function sceneOf(game) {
  if (!game || typeof game !== 'object') return 'title';
  if (game.screen === 'title') return 'title';
  if (game.graduated) return 'graduated';
  if (game.screen !== 'play') return 'title';
  if (game.status === 'lose') return 'lose';
  if (game.status === 'win') return 'win';
  return game.level === 2 ? 'level2' : 'level1';
}

/* ==================== 文件名 → 场景建议 ==================== */

/**
 * 关键词表（第 4.2 节）。
 * 中文关键词按子串匹配（中文没有词分隔），英文关键词按「词边界」匹配，
 * 避免 `vol1` 里的 `l1`、`finale` 里的 `final` 这类误命中。
 */
const KEYWORDS = [
  { scene: 'title', words: ['title', 'menu', 'home', '标题', '主页', '菜单'] },
  { scene: 'level1', words: ['level1', 'lv1', 'l1', 'stage1', '第一关', '一关'] },
  { scene: 'level2', words: ['level2', 'lv2', 'l2', 'stage2', '第二关', '二关'] },
  { scene: 'win', words: ['win', 'victory', 'clear', '过关', '胜利'] },
  { scene: 'lose', words: ['lose', 'fail', 'gameover', 'defeat', '失败'] },
  { scene: 'graduated', words: ['graduate', 'ending', 'complete', 'final', '毕业', '结局', '全部通关'] },
];

/** 名字长度上限：超过这个长度按「无法判断」处理，防止恶意超长文件名拖慢匹配 */
export const MAX_NAME_LEN = 200;

function isCJK(s) {
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    if (c > 0x2e80) return true;
  }
  return false;
}

/**
 * 拆词：把「不含扩展名的文件名」转小写后按 非字母数字汉字 切成 token。
 * 纯数字 token（`01`、`2024` 这类序号）**不进词表**（第 4.2 节「数字序号视为分隔」），
 * 但仍保留在拼串里，这样 `level-1` / `level_1` 能拼回 `level1`；
 * 同时记录每个 token 在拼串里的起止位置，用于英文关键词的边界判定。
 */
function tokenize(name) {
  var lower = String(name).toLowerCase();
  var raw = lower.split(/[^a-z0-9\u4e00-\u9fff]+/);
  var tokens = [];
  var joined = '';
  var starts = [];
  var ends = [];
  for (var i = 0; i < raw.length; i++) {
    var t = raw[i];
    if (!t) continue;
    starts.push(joined.length);
    joined += t;
    ends.push(joined.length);
    if (!/^[0-9]+$/.test(t)) tokens.push(t); // 纯序号不进词表
  }
  return { lower: lower, tokens: tokens, joined: joined, starts: starts, ends: ends };
}

function hasNum(arr, v) {
  for (var i = 0; i < arr.length; i++) if (arr[i] === v) return true;
  return false;
}

/** 英文/拼音关键词：在 joined 里找，起点必须是某个 token 的起点、终点必须是某个 token 的终点 */
function matchLatin(tk, kw) {
  var from = 0;
  for (;;) {
    var p = tk.joined.indexOf(kw, from);
    if (p < 0) return false;
    if (hasNum(tk.starts, p) && hasNum(tk.ends, p + kw.length)) return true;
    from = p + 1;
  }
}

/** 中文关键词：直接在原名里做子串匹配（中文无空格分词） */
function matchCJK(tk, kw) {
  return tk.lower.indexOf(kw) >= 0;
}

/**
 * 从文件名推断场景（第 4.2 节）。
 *
 * @param {string} fileName 原始文件名（可带路径之外的扩展名）
 * @returns {{scene: string|null, matchedKeyword: string, matchedScenes: string[],
 *            confidence: 'exact'|'ambiguous'|'none'}}
 *   exact     —— 恰好命中一个场景，可以自动建议
 *   ambiguous —— 命中多个场景（如 level1_win.ogg），**绝不自动指派**
 *   none      —— 一个都没命中（如 bgm.mp3），**绝不自动指派**
 */
export function matchScene(fileName) {
  var none = { scene: null, matchedKeyword: '', matchedScenes: [], confidence: 'none' };
  if (typeof fileName !== 'string') return none;
  if (!fileName.length || fileName.length > MAX_NAME_LEN) return none;

  // 去掉目录部分与扩展名（只认最后一个点之后 <=8 位的扩展名）
  var base = fileName;
  var slash = Math.max(base.lastIndexOf('/'), base.lastIndexOf('\\'));
  if (slash >= 0) base = base.slice(slash + 1);
  var dot = base.lastIndexOf('.');
  if (dot > 0 && base.length - dot - 1 <= 8) base = base.slice(0, dot);
  if (!base.length) return none;

  var tk = tokenize(base);
  if (!tk.tokens.length && !/[a-z0-9]/.test(tk.joined)) {
    // 全是分隔符 / 序号
    if (!tk.joined) return none;
  }

  var scenes = [];
  var firstKeyword = '';
  for (var i = 0; i < KEYWORDS.length; i++) {
    var entry = KEYWORDS[i];
    for (var k = 0; k < entry.words.length; k++) {
      var kw = entry.words[k];
      var hit = isCJK(kw) ? matchCJK(tk, kw) : matchLatin(tk, kw);
      if (!hit) continue;
      if (scenes.indexOf(entry.scene) < 0) scenes.push(entry.scene);
      if (!firstKeyword) firstKeyword = kw;
      break;
    }
  }

  if (scenes.length === 1) {
    return {
      scene: scenes[0], matchedKeyword: firstKeyword,
      matchedScenes: scenes, confidence: 'exact',
    };
  }
  if (scenes.length > 1) {
    return {
      scene: null, matchedKeyword: firstKeyword,
      matchedScenes: scenes, confidence: 'ambiguous',
    };
  }
  return none;
}
