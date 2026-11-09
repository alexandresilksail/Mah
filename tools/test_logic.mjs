/**
 * 历史入口 —— 已由根目录 `test.js` 取代。
 *
 * 旧版断言针对 225 张 / 8 层网格 / 三段发牌，后来又针对 222 张簇模板 +
 * 侧堆 + 四段陷阱；玩法层重做为「单堆半格晶格 + 漏斗三带」之后，
 * 那些断言都已过时。现在 `npm test` 执行的是
 * `node test.js && node tools/test_render.mjs`，逻辑断言入口是
 * `npm run test:sim`（当前 1142 项，含 50 种子几何契约与每种 200 局机器人模拟）。
 *
 * 保留本文件只是为了让旧的 `node tools/test_logic.mjs` 调用仍然可用：
 * 它转发到新的断言集，退出码由 test.js 决定（失败 process.exit(1)）。
 */
await import('../test.js');
