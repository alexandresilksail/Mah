/**
 * 历史入口 —— 已由根目录 `test.js` 取代。
 *
 * 旧版 429 项断言针对 225 张 / 8 层正交网格 / 三段发牌，玩法层重构为
 * 222 张 / 7 层簇模板 / 反向生成花色之后，那些断言已经过时，直接运行会
 * 误报失败。现在 `npm test` 执行的是 `node test.js && node tools/test_render.mjs`，
 * 逻辑断言入口是 `npm run test:sim`（550 项，含 200 局机器人模拟）。
 *
 * 保留本文件只是为了让旧的 `node tools/test_logic.mjs` 调用仍然可用：
 * 它转发到新的断言集，退出码由 test.js 决定（失败 process.exit(1)）。
 */
await import('../test.js');
