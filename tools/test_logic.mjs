/**
 * 历史入口 —— 已由根目录 `test.js` 取代，保留仅为兼容旧调用。
 *
 * v2.0.0 的逻辑断言集在 `test.js`：16 种牌型注册表、两关独立布局模板、
 * 30 seed × 2 关几何契约、证书 / verify、120 个验收 seed 池、
 * 六种机器人难度报告、Tauri 最小权限静态检查。
 *
 * `npm test` = `node test.js && node tools/test_render.mjs`；
 * `npm run test:sim` = `node test.js`。
 * 本文件只做转发，退出码由 test.js 决定（失败 process.exit(1)）。
 */
await import('../test.js');
