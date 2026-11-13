/**
 * 第二关「最近 10 局」双重去重的纯函数判定层。
 *
 * 规格要点（全部基于**最终实际牌局的几何**，不认牌面 / 洗牌 / seed）：
 *  1) 模板级：最近 10 局用过的 templateId 一律排除，候选池 = 50 - 已用；
 *  2) 几何级：
 *     · canonicalGeometrySignature 相同  → 平移 / 左右镜像后的等价结构，拒绝；
 *     · structureSignature 相同          → 坐标、层级、区域、轮廓、遮挡、
 *                                          可操作区、各层牌数与空间分布全同，拒绝；
 *     · geometrySignature 相同           → 既有几何签名兜底，拒绝；
 *     · 与最近 10 局重放出的真实牌面做结构相似度 / 布局相似度，
 *       任一 ≥ 0.60 视为高度相似，拒绝。
 *
 * 牌面图案、牌面顺序、随机种子不同**不参与**「布局不同」的判定：
 * 上面所有签名与相似度都只读 x / y / layer / region / z / seg / blocked / 遮挡关系。
 * seed 只额外做「不得与最近 10 局完全相同」的更严格约束，绝不用它代替几何判定。
 *
 * 本模块不读写 DOM / localStorage，也不生成牌局；重放与生成由 new_game.js 完成，
 * 因此可以在 Node 里对判定表逐条做真实断言。
 */
import { SIMILARITY_THRESHOLD } from './layout_signature.js';
import { L2_TEMPLATE_IDS } from './l2_templates.js';

export const L2_DEDUP_ALGORITHM = 'MAH-L2-DEDUP-v1';
/** 高度相似阈值：与既有 layoutSimilarity 口径一致（0.60） */
export const L2_SIMILARITY_THRESHOLD = SIMILARITY_THRESHOLD;

function idx(arr, v) {
  for (var i = 0; i < arr.length; i++) if (arr[i] === v) return i;
  return -1;
}

/** 最近 10 局已用过的模板 ID（去重、保序） */
export function usedTemplateIds(recent) {
  var out = [];
  var list = recent || [];
  for (var i = 0; i < list.length; i++) {
    var id = list[i] && list[i].templateId;
    if (id && idx(out, id) < 0) out.push(id);
  }
  return out;
}

/** 候选模板池：20 套里排除最近 10 局用过的，顺序保持模板表原序 */
export function availableTemplateIds(recent) {
  var used = usedTemplateIds(recent);
  var out = [];
  for (var i = 0; i < L2_TEMPLATE_IDS.length; i++) {
    if (idx(used, L2_TEMPLATE_IDS[i]) < 0) out.push(L2_TEMPLATE_IDS[i]);
  }
  return out;
}

/**
 * 找出与候选几何等价（或高度相似）的历史记录。
 * 「等价结构」= 平移 / 左右镜像归一化后形状哈希相同 —— 这正是
 * 「不同模板生成的等价结构」必须被识别出来的判定。
 */
export function equivalentRecords(recent, candidate) {
  var out = [];
  var list = recent || [];
  for (var i = 0; i < list.length; i++) {
    var r = list[i];
    var sameCanonical = !!(candidate.canonicalGeometrySignature &&
      r.canonicalGeometrySignature === candidate.canonicalGeometrySignature);
    var sameStructure = !!(candidate.structureSignature &&
      r.structureSignature === candidate.structureSignature);
    var sameGeometry = !!(candidate.geometrySignature &&
      r.geometrySignature === candidate.geometrySignature);
    if (sameCanonical || sameStructure || sameGeometry) {
      out.push({
        index: i,
        gameId: r.gameId,
        templateId: r.templateId || '',
        sameCanonical: sameCanonical,
        sameStructure: sameStructure,
        sameGeometry: sameGeometry,
      });
    }
  }
  return out;
}

/**
 * 双重去重总判定。
 * @param recent    本关最近 10 局历史（sanitizeHistory 输出的合法记录）
 * @param candidate 候选牌局的真实数据：
 *   templateId / structureSignature / canonicalGeometrySignature /
 *   geometrySignature / seed / gameId /
 *   structureSimilarityMax / layoutSimilarityMax（与最近 10 局重放牌面比较所得最大值）
 * @returns {{pass:boolean, checks:object, failedChecks:string[], equivalents:object[]}}
 */
export function checkL2DualDedup(recent, candidate) {
  var c = candidate || {};
  var list = recent || [];
  var used = usedTemplateIds(list);
  var equivalents = equivalentRecords(list, c);

  var templateDifferent = idx(used, c.templateId) < 0 && !!c.templateId;
  var canonicalDifferent = true;
  var structureDifferent = true;
  var geometrySignatureDifferent = true;
  for (var i = 0; i < equivalents.length; i++) {
    if (equivalents[i].sameCanonical) canonicalDifferent = false;
    if (equivalents[i].sameStructure) structureDifferent = false;
    if (equivalents[i].sameGeometry) geometrySignatureDifferent = false;
  }

  var sSim = Number(c.structureSimilarityMax) || 0;
  var lSim = Number(c.layoutSimilarityMax) || 0;
  var similarityDifferent = sSim < L2_SIMILARITY_THRESHOLD && lSim < L2_SIMILARITY_THRESHOLD;

  var seedList = [], idList = [];
  for (var j = 0; j < list.length; j++) {
    seedList.push(list[j].seed);
    idList.push(list[j].gameId);
  }
  var seedFresh = idx(seedList, c.seed) < 0;
  var gameIdUnique = !c.gameId || idx(idList, c.gameId) < 0;

  var failedChecks = [];
  if (!templateDifferent) failedChecks.push('TEMPLATE_ID');
  if (!canonicalDifferent) failedChecks.push('CANONICAL_GEOMETRY');
  if (!structureDifferent) failedChecks.push('STRUCTURE_SIGNATURE');
  if (!geometrySignatureDifferent) failedChecks.push('GEOMETRY_SIGNATURE');
  if (!similarityDifferent) failedChecks.push('GEOMETRY_SIMILARITY');
  if (!seedFresh) failedChecks.push('SEED');
  if (!gameIdUnique) failedChecks.push('GAME_ID');

  return {
    pass: failedChecks.length === 0,
    equivalents: equivalents,
    failedChecks: failedChecks,
    checks: {
      templateDifferent: templateDifferent,
      canonicalDifferent: canonicalDifferent,
      structureDifferent: structureDifferent,
      geometrySignatureDifferent: geometrySignatureDifferent,
      similarityDifferent: similarityDifferent,
      seedFresh: seedFresh,
      gameIdUnique: gameIdUnique,
      structureSimilarityMax: Math.round(sSim * 1000) / 1000,
      layoutSimilarityMax: Math.round(lSim * 1000) / 1000,
      usedTemplateIds: used,
      availableTemplateCount: availableTemplateIds(list).length,
    },
  };
}
