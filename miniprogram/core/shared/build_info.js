/**
 * 构建元信息（第十一阶段）。
 *
 * 两个 HTML 构建时由 tools/build_info.mjs 注入一段独立的
 * `<script id="mah-build-info">window.__MAH_BUILD__ = {...}</script>`，
 * 业务代码这里读取。Node（test.js / 200 局压力测试）没有 window，
 * 返回 dev 默认值 —— 报告里的 gitCommit 由测试脚本现场读 git，不引用这里的默认值。
 *
 * 元信息单独成段、不混进业务 bundle，才能让 test-build-consistency.js
 * 对 `<script id="mah-bundle">` 做逐字节比较而不被时间戳干扰。
 */
export const BUILD_INFO_DEFAULTS = {
  buildVersion: 'dev',
  gitCommit: 'unknown',
  sourceHash: 'unknown',
  buildTimestamp: '',
  sourceFiles: 0,
};

export function readBuildInfo() {
  var out = {};
  var k;
  for (k in BUILD_INFO_DEFAULTS) {
    if (Object.prototype.hasOwnProperty.call(BUILD_INFO_DEFAULTS, k)) out[k] = BUILD_INFO_DEFAULTS[k];
  }
  if (typeof window !== 'undefined' && window.__MAH_BUILD__ && typeof window.__MAH_BUILD__ === 'object') {
    var raw = window.__MAH_BUILD__;
    for (k in BUILD_INFO_DEFAULTS) {
      if (Object.prototype.hasOwnProperty.call(raw, k) && raw[k] !== undefined) out[k] = raw[k];
    }
  }
  return out;
}
