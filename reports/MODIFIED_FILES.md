# 修改文件清单

**项目**：MahLeMah（`mah-le-mah/`）
**日期**：2026-11-12
**源码提交**：`04374993a51d29cec465d596de0a6d0e92199856`
**统计**：36 个文件，+10,359 / −233 行（19 新增 + 17 修改）；另有本报告与 `TEST_REPORT.md` §7 单独提交

---

## 1. 新增源码 / 模块（9）

| 文件 | 行数量级 | 职责 |
|---|---:|---|
| `src/game/new_game.js` | ~330 | 统一新局入口 `createNewGame()`：选档 → 抽 seed → 生成 → 签名 → 比对近三局 → 最多 50 次 → 校验 → 落历史；失败抛 `GenerationFailureError` |
| `src/game/recent_games.js` | ~150 | `level1RecentGames` / `level2RecentGames` 独立维护最近 3 条：读取、裁剪、写入、损坏容错 |
| `src/game/layout_signature.js` | ~150 | `calculateLayoutSignature()`：几何签名 + 分布签名 + 主签名，全部 SHA-256 |
| `src/game/sha256.js` | ~170 | 纯 ES5 同步 SHA-256（浏览器 / legacy / Node 三端同一实现） |
| `src/game/build_info.js` | ~40 | 运行期读取构建注入的 `buildVersion / gitCommit / sourceHash / buildTimestamp` |
| `tools/bundle_shared.mjs` | ~175 | 构建共享层：esbuild 打包、构建元信息计算与注入、ES5 语法校验 |
| `tools/browser_smoke.mjs` | ~236 | Edge CDP 真实浏览器冒烟：加载两个 HTML、跑四种 reason、读调试面板 |
| `test-random-generation.js` | ~520 | 200 局压力测试（两关各 100 局）+ 逐局明细 + JSON/MD 报告生成 |
| `test-build-consistency.js` | ~230 | 两个 HTML ↔ `src/` 逐字节一致性 + 构建元信息 + 旧版残留检查 |

## 2. 新增文档 / 报告（10）

| 文件 | 说明 |
|---|---|
| `CHANGELOG.md` | 从无到有；按版本记录，本次为「双关卡随机生成重构」条目 |
| `reports/CODE_AUDIT.md` | 第一阶段审计报告：文件清单、版本、commit、SHA256、10 个审计问题逐条回答、修复前后差异表 |
| `reports/FINAL_ACCEPTANCE.md` | 最终验收报告：五类验证矩阵、15 项验收表、200 局明细、未执行项 |
| `reports/MODIFIED_FILES.md` | 本文件 |
| `reports/random-generation-report.json` | 200 局逐局数据（gameId / 档位 / seed / 牌数 / 牌型数 / 三种签名 / reason / 耗时 / 校验结果） |
| `reports/random-generation-report.md` | 同上的可读版（含牌数、档位、牌型分布、重复检查、重试统计） |
| `reports/random-generation-output.txt` | `node test-random-generation.js` 控制台原始输出 |
| `reports/build-consistency-report.json` | 一致性检查结构化结果（bundle 哈希、构建元信息、逐项断言） |
| `reports/build-consistency-report.md` | 同上的可读版 |
| `reports/build-consistency-output.txt` | `node test-build-consistency.js` 控制台原始输出 |
| `reports/browser-smoke-report.json` | 真实浏览器实测结果（浏览器版本、逐局 gameId 与四项检查、异常数） |
| `reports/TEST_OUTPUT_FINAL_FULL.txt` | `node test.js` 完整原始输出（1337 通过 / 11 失败 / EXIT=1） |

> 说明：`reports/TEST_OUTPUT_DYNAMIC_PROFILES.txt` 属上一轮（`1f95db0`）提交，本次未改动。

## 3. 修改（17）

| 文件 | 改动要点 |
|---|---|
| `src/main.js` | 所有新局入口汇聚到 `newGame()`；`boot()` 不再直接 `startLevel`；`?dev=1` 调试面板；`window.__mah` 暴露 `meta` 与调试接口 |
| `src/game/engine.js` | 新增 `installGeneratedLevel()` 一次性安装已生成牌局（避免二次生成导致签名不一致）；`nextLevelPreview()` 走当前档位 |
| `src/game/render.js` | 张数 / 层数 / 牌型数全部读 `game.meta` 与当前档位，去掉旧固定文案 |
| `src/game/save_data.js` | 存档升到 `v:3`，新增两关历史字段的读写、裁剪与损坏容错 |
| `src-tauri/src/main.rs` | `SAVE_FIELDS` 扩为 11 键；新增历史数组逐字段校验（类型 / ≤3 条 / 十六进制签名）；64 KB 上限、原子写入、路径限制均未放宽 |
| `test.js` | 新增 `[13]` 界面文案一致性、`[14]` 统一入口/签名/差异化；更新 `[8b]` 白名单断言为 11 键 |
| `tools/build_web.mjs` | 改用 `bundle_shared.mjs`，注入构建元信息，`<script id="mah-bundle">` 分段输出 |
| `tools/build_legacy.mjs` | 同上，另保留 Babel + 压缩 + ES5 校验，业务段独立分段 |
| `package.json` | 新增 `test:random` / `test:build` / `test:browser` / `test:all` |
| `README.md` | 新增统一入口、最近三局规则、布局签名、调试面板、200 局结果说明；清除过期牌数描述 |
| `DELIVERY.md` | 新增 2026-11-12 增量交付章节；纠正历史「24 张 / 222 张」表述 |
| `RELEASE_NOTES.md` | 新增本轮条目；指向审计与验收报告 |
| `TEST_REPORT.md` | 新增 §7 本轮真实结果（1337/11、5053、48、浏览器实测） |
| `reports/DIFFICULTY.md` | 旧固定牌数标题加「历史冻结版」标注，不伪造新数据 |
| `dist/MahLeMah.html` | 由当前 `src/` 重建，114,279 B |
| `dist/Mah了个Mah.html` | 同上（同内容副本） |
| `dist/index.html` | 同上（同内容副本） |
| `dist/MahLeMah-legacy.html` | 由当前 `src/` 重建（ES5），149,684 B |

## 4. 刻意未改动的文件

| 文件 | 原因 |
|---|---|
| `src/game/config.js` | 档位表（10 个 L2 / 4 个 L1）本轮已符合需求，牌数来源不变，避免引入新配置风险 |
| `src/game/generator.js` / `layout_profiles.js` / `layout.js` | 几何与发牌算法未变；本轮只在外层加统一入口与签名 |
| `src/game/seed_pool.js` / `tools/tune_pool.mjs` | 分档 seed 池仍由上一轮生成，本轮不重跑（不伪造新数据） |
| `dist/MahLeMah-Setup-v2.0.0.exe` / `MahLeMah-Portable-v2.0.0.zip` / `SHA256SUMS.txt` | 桌面产物本轮未重建，保持 2026-11-10 冻结版 |
| `reports/TEST_OUTPUT_DYNAMIC_PROFILES.txt` | 上一轮真实输出，保留为历史证据 |
