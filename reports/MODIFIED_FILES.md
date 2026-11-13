# 修改文件清单（第二关 50 套布局模板 + 最近 10 局双重去重）

**项目**：MahLeMah（`mah-le-mah/`）
**日期**：2026-11-13
**本轮提交**：`c410239`（完整哈希 `c410239b1ca9e9b4c3e3c0d969bc4adad5ec2801`），已推送 `origin/main`
**口径**：只改第二关生成 / 去重 / 历史持久化及其测试、产物、文档；**第一关完全冻结**，只允许回归测试。
**上一轮基线**：`a4340d1`（背景音乐集成 + 双关卡布局修复收尾）

---

## 1. 新增源码（4）

| 文件 | 职责 |
|---|---|
| `src/game/l2_templates.js` | **50 套第二关结构模板的唯一定义源**：10 类 × 5 套，唯一 `templateId`、独立 `zones / shapes / trajectory / layerCurve / env / offsets / density`，结构参数 SHA-256 签名。导出 `L2_TEMPLATES` / `L2_TEMPLATE_IDS` / `templateById()` / `templateSummary()` / `templateCategoryStats()` |
| `src/game/l2_geometry.js` | 按模板结构参数在 9×5 半格格网真实落牌；`windowFor()` 区域窗口、`shapeCells()` 轮廓、`buildTemplateStack()` 层级堆叠、`repairSupport()` 悬空修补；候选筛选保证开局可点 19–25；复用既有 `buildQueue()` 生成 44 张盲盒队列 |
| `src/game/l2_structure.js` | `calculateStructureSignature()`（坐标 / 层级 / 区域 / 层牌数与质心 / 包围盒 / 轮廓 / 遮挡边 / 可操作区）、`canonicalGeometrySignature()`（平移 + 左右镜像归一化）、`structureSimilarity()`（只比主堆）、`mainStackCards()`、`structureFields()` |
| `src/game/l2_recent.js` | 第二关「最近 10 局」双重去重纯函数层：`usedTemplateIds()` / `availableTemplateIds()` / `equivalentRecords()` / `checkL2DualDedup()`；`L2_DEDUP_ALGORITHM`、`L2_SIMILARITY_THRESHOLD = 0.60` |

## 2. 新增测试（2）

| 文件 | 结果 | 覆盖 |
|---|---|---|
| `test-l2-templates.js` | **539 / 0** | 50 模板定义唯一性、50×3=150 局真实生成与合法性（含消除后暴露、真实安装进 Game）、1225 对两两差异、平移/镜像/换牌面的等价几何识别、模板级与几何级拒绝路径、12 局五种重开入口、模板池耗尽明确报错 |
| `test-l1-frozen.js` | **64 / 0** | 修改前 20 条 L1 基线 + 9 条 L2 默认路径基线逐字段回归、强传 templateId 不影响 L1、L1 统一入口口径、源码冻结边界静态检查 |

## 3. 新增基线 / 报告 / 日志

| 文件 | 说明 |
|---|---|
| `reports/L1_FROZEN_BASELINE.json` | 审计阶段（修改前）保存的 20 条 L1 + 9 条 L2 默认路径几何基线 |
| `reports/l2-templates-report.{json,md}` | **50 套模板完整 ID / 结构参数 / 代表布局指标清单** + 差异测试结果 |
| `reports/l2-templates-output.txt` | 上述测试真实 stdout |
| `reports/l1-frozen-report.{json,md}` / `l1-frozen-output.txt` | 第一关冻结回归结果与真实 stdout |
| `reports/FINAL_test.txt` 等 10 份 `FINAL_*.txt` | 最终一次全套真实运行输出（7 个 Node 测试 + render + browser smoke + music real playback） |
| `reports/FINAL_RERUN_ALL.txt` | 本轮最终运行汇总（由上述日志汇总，非手写 PASS 模板） |

## 4. 修改的源码（7）

| 文件 | 改动要点 |
|---|---|
| `src/game/new_game.js` | 新增第二关独立分支 `createLevel2Game()`：50 套模板候选池 → 抽档位/seed → 生成真实牌局 → 结构签名与等价几何签名 → 与最近 10 局重放牌面做模板级 + 几何级双重判定 → 完整校验（含零悬空、开局可点 19–25）→ 写历史；`meta` 增加 `templateId` / `structureSignature` / `canonicalGeometrySignature` / `dedupAlgorithm` / `availableTemplateCount` 与 4 项去重检查；**第一关主体代码路径逐字未改** |
| `src/game/generator.js` | 新增 `generateTemplateLayout` 导入；模板分支严格限定 `lv === 2 && opt.templateId`；返回 `templateId` / `floatingCount`；不带模板的第二关默认路径与几何逐字节不变 |
| `src/game/recent_games.js` | 按关卡分窗口：`HISTORY_LIMIT = 3`（L1 冻结）、`L2_HISTORY_LIMIT = 10`、`historyLimitFor(level)`；新增 `L2_EXTRA_FIELDS` / `L2_RECORD_FIELDS`；`sanitizeRecord(raw, level)` 对 L2 三个可选字段校验、旧档缺字段合法；`sanitizeHistory` / `appendHistory` / `previousFrom` 按关卡取窗口 |
| `src/game/layout_profiles.js` | **仅**把 `buildQueue` 改为 `export function buildQueue` 供模板路径复用；第一关布局逻辑一行未改 |
| `src/game/save_data.js` | 存档说明与 `historyFor()` 调用同步为按关卡窗口；L2 历史经 `sanitizeHistory(raw, 2)` 读取，旧档兼容 |
| `src/main.js` | 调试面板第二关附加 `templateId` / `structureSignature` / `canonicalGeometrySignature` / `dedupAlgorithm` / `availableTemplateCount` 与四项双重去重 PASS-FAIL；第一关输出逐字不变 |
| `src-tauri/src/main.rs` | `RECORD_FIELDS[15]`（12 必填 + 3 个 L2 可选）、`REQUIRED_RECORD_FIELDS[12]`、`L2_OPTIONAL_RECORD_FIELDS[3]`；`HISTORY_LIMIT_L1 = 3` / `HISTORY_LIMIT_L2 = 10`；`validate_history_field(obj, key, limit)` 按关卡校验并拒绝第一关历史出现模板字段；旧档兼容 |

## 5. 修改的既有测试与工具（4）

| 文件 | 改动要点 | 最终 |
|---|---|---|
| `test.js` | `[1]` 增加分关卡窗口 / 50 模板常量断言；`[8b]` Rust 断言改为 15 字段白名单与 L1=3 / L2=10 双窗口；`[14]` 按关卡分流（L1 三局口径逐字保留，L2 用 10 局 + 主堆结构相似度 + 模板/等价几何零重复）；`[19]` 双关各 100 局按各自窗口统计，L2 增加模板 / 等价几何 / 结构签名零重复与「牌数不作差异依据」断言 | **625 / 0** |
| `test-random-generation.js` | 标题改为「第一关 100 局冻结回归 + 第二关 100 局新规格压力测试」；L1 判定逐字保留；L2 改为主堆 `structureSimilarity`、10 局窗口、模板/等价几何/结构签名零重复、`seed + templateId` 精确重放、多区域分散型合法性（零悬空 / 无异常重叠 / 消除后暴露 / 真实开局）、跨重启历史字段持久化；汇总与 Markdown 报告按关卡分流 | **7788 / 0** |
| `test-build-consistency.js` | 新增 `[7]` 节：4 个正式 HTML 均内嵌 50 个唯一 `templateId` 与全部第二关升级标记，网页版 3 个副本逐字节相同，4 个新模块源码齐备 | **110 / 0** |
| `tools/browser_smoke.mjs` | 每个 HTML 在原有 4 局 L1 之外再真实开 4 局 L2，校验 `templateId` / 两种几何签名、四项双重去重 PASS、模板与等价几何零重复、历史按持久化起始值递增且 ≤10；历史跨页面继承被如实纳入判定 | `allPassed=true` |

## 6. 重建产物（4）

| 文件 | 字节 | SHA-256 |
|---|---:|---|
| `dist/MahLeMah.html` | 9,924,128 | `61eb93fc932cd5f29524f1fc64ccd7fd40e0d9ae66af9070dc3efdb13eddb9b2` |
| `dist/index.html` | 9,924,128 | 同上（同内容副本） |
| `dist/Mah了个Mah.html` | 9,924,128 | 同上（同内容副本） |
| `dist/MahLeMah-legacy.html` | 9,958,241 | `0d5c00475d929545e50b5149cab3bb6d8e8e6fd4a7cb1c3c608c8778519e2f8c` |

`sourceHash=f6d0bbf4fd6932a1…`（37 个源文件）、`buildVersion=2.0.0-a4340d1`。
4 个产物同时保留 5 首内置背景音乐（data URI），由 `npm run build:all` 从当前 `src/` 重建。

## 7. 更新的文档 / 既有报告

| 文件 | 说明 |
|---|---|
| `README.md` | 新增 `## 0.0` 本轮规格速览；0.3 节改为按关卡分窗口说明；文件树加入 4 个新模块与 4 个测试；验收清单新增 6 条本轮断言 |
| `CHANGELOG.md` | 新增「2026-11-13 · 第二关 50 套布局模板 + 最近 10 局双重去重」章节，含真实测试数与未运行项 |
| `DELIVERY.md` | 新增 `## 0.0` 本轮增量、真实运行结果表与未重建项 |
| `reports/FINAL_ACCEPTANCE.md` | 重写为本轮最终验收（9 项交付对照 + 逐条验收判定 + 未执行项） |
| `reports/MODIFIED_FILES.md` | 本文件 |
| 自动生成的既有报告 | `random-generation-report.{json,md}` / `-output.txt`、`build-consistency-report.{json,md}` / `-output.txt`、`browser-smoke-report.json`、`layout-position-report.json`、`music-playback-report.{json,md}`、`music-real-playback-report.json`、`FINAL_RERUN_ALL.txt` 均由最终真实运行刷新 |

## 8. 刻意未改动 / 未重建

| 文件 | 原因 |
|---|---|
| `src/game/config.js`、`engine.js`、`layout.js`、`layout_signature.js`、`tiles.js`、`seed_pool.js`、`robots.js` | 牌数配置、难度体系、三消规则、发牌、几何签名、渲染与核心玩法一律不动 |
| `src/game/music_player.js`、`music_manifest.js`、`render.js`、`src/assets/music/*`、`tools/gen_music_manifest.mjs`、`src-tauri/tauri.conf.json` | 背景音乐与音效链路按要求保留，未重新导入、未重新分配场景、未改 CSP |
| `dist/MahLeMah-Setup-v2.0.0.exe`、`MahLeMah-Portable-v2.0.0.zip`、`SHA256SUMS.txt` | 本机缺 MSVC `link.exe`，Rust 构建失败，桌面产物**未重建**，仍是旧冻结版本 |
| `npm run test:release`（12000 局） | 本轮未重跑，如实标注 |

## 9. 真实运行汇总

| 命令 | 结果 |
|---|---|
| `node test.js` | 625 / 0 / EXIT=0 |
| `node test-random-generation.js` | 7788 / 0 / EXIT=0（双关各 100 局） |
| `node test-l2-templates.js` | 539 / 0 / EXIT=0 |
| `node test-l1-frozen.js` | 64 / 0 / EXIT=0 |
| `node test-layout-position.js` | 35 / 0 / EXIT=0 |
| `node test-music-playback.js` | 69 / 0 / EXIT=0 |
| `node test-build-consistency.js` | 110 / 0 / EXIT=0 |
| `node tools/test_render.mjs` | 27 / 27 |
| `node tools/browser_smoke.mjs` | `allPassed=true` |
| `node tools/music_real_playback.mjs` | 54 / 54（桌面版未运行） |
| `cargo check` / `cargo build` | **尝试后失败**（缺 MSVC `link.exe`） |
| 桌面版 / Windows 安装版重建与真机播放 | **未运行** |

本轮提交：`c410239`（`c410239b1ca9e9b4c3e3c0d969bc4adad5ec2801`）。
