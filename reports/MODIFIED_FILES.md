# 修改文件清单（第二关规格驱动生成 + 三段几何校验）

**项目**：MahLeMah（`mah-le-mah/`）
**日期**：2026-11-13
**本版口径**：只改第二关布局系统（规格层 + 落牌 + 生成入口 + 保真校验）及其测试 / 产物 / 文档；
**第一关完全冻结**，只做回归测试；不改核心玩法、牌数配置、难度体系、音乐与音效链路。
**取代关系**：本版取代同日更早的两个实现——「50 套参数化结构模板」（`f17b73b`）与
「20 套掩膜 + 逐张打分落牌」（`66fe78b`）。20 套模板 / 掩膜不变，改的是「掩膜 → 牌位」这一段。
**上一轮基线**：`66fe78b`

---

## 1. 新增源码（1）

| 文件 | 职责 |
|---|---|
| `src/game/l2_spec.js` | **规格层**（`SPEC_ALGORITHM = 'MAH-L2-SPEC-v2'`）。把「第 L 层占哪些格、每张牌落在格的哪个四分之一」变成与 seed 无关的显式规格：`buildSpec()`（掩膜 → 4 邻接图 → `multiSeeds()` 最远点采样多源 BFS 走位序 → 逐格相位 + 半格错位极性 → `polarityUrgency()` 叶子格优先 → `tailBlocksFor()` 尾段走位窗口）、`specFor()`（带缓存，20 套各一个 `signature`）、`specPlan(spec, profile, {fillRot, tailPhase})`、`checkFidelity()`（生成后校验）、`specSummary()`（报告取证）。常量：`SPEC_FORM_SIZE=18` / `KEEP_REUSE=3` / `TAIL_BLOCKS=2` / `SPEC_SEED_MAX=5` / `SPEC_SEED_RADIUS=10` / `PHASES` / `GRID_X0=33` / `GRID_Y0=220` |

## 2. 重写的源码（1）

| 文件 | 改动要点 |
|---|---|
| `src/game/l2_geometry.js`（净 −722 行） | 落牌改为**规格驱动**：删除 `pickMaskCells()` / `pickCoverCells()` / `biasFor()` / 形状打分链路，改为 `specPlan()` 直接给出每层格集合后逐格落牌；`buildCandidate()` 验收时把 `plan.fillRot` 写进 `cards.specFillRot`（复核必须复用同一 rot，否则 `LAYER_FORM` 误判）。**新增 `verifyTemplateFidelity(cards, templateId, profile, fillRot)`**：从 templateId + 档位重新展开计划再逐格比对，安装后 / 渲染前共用。`describeTemplateLayout()` 新增 `mainBox`（主堆包围盒，避免盲盒队列把形状差异抹平）与 `visible`（开局可点） |

## 3. 修改的源码（5）

| 文件 | 改动要点 |
|---|---|
| `src/game/generator.js` | 第二关**必须**显式 `templateId`，缺失直接抛 `第二关生成失败：必须显式指定 20 套模板之一（templateId），旧布局生成路径已废弃`；分支改为 `lv === 2 ? generateTemplateLayout(...) : generateProfileLayout(...)`；返回对象新增 `templateId` / `specFillRot` |
| `src/game/engine.js` | `startLevel(level, seed, templateId)` / `restartLevel(rand, templateId)` 第二关缺 templateId 抛错；`installLevelData(data, meta, opt)` 第二关安装后调用 `verifyTemplateFidelity()`，不一致抛 `第二关布局安装失败：与模板 X 的缩略图不一致（…）`；记录 `templateId` / `layoutProfile` / `specFillRot` / `fidelity`；测试用合成牌局可传 `{ skipFidelityCheck: true }` |
| `src/main.js` | 新增第三道（**渲染前**）校验 `assertLevel2FidelityBeforeDraw()`：按 `boardRev` 只算一次、结论缓存；失败时 `drawFidelityError()` 画整屏错误页（模板 ID + 违规项，**一张牌都不画**），控制台只报一次，DOM 降级通道输出文字报错；不把 `requestAnimationFrame` 打死。仅当确实装上了第二关牌局（有 `templateId`）才校验 |
| `src/game/new_game.js` | `layoutOfRecordL2()`：无 `templateId` 的旧记录**不再重放**（`replayOk=false`，不静默回退旧生成器）；校验新增 `fidelityOk`，失败时记录 `fidelityFailed`（`violations` 明细或 `NO_FIDELITY`） |
| `src/game/config.js` / `src/game/l2_templates.js` | 修正指向已删模块 `layout_templates.js` 的失效注释（改为 `l2_spec.js` / `layout_profiles.js`）；删除已无引用的 `ZONE_ANCHORS` |

## 4. 新增工具与取证（2）

| 文件 | 职责 |
|---|---|
| `tools/l2_100_games.mjs` | 连续 100 局真实调用统一入口 `createNewGame()`，逐局独立复核「任意连续 10 局窗口内 template / canonical / structure / geometry 四类签名零重复」+ 相似度 < 0.60 + 可点 19–25 + 去重检查全 PASS，输出 `reports/l2-100-games.txt`；不达标 exit 1 |
| `reports/l2-render-guard-output.txt` | 渲染前校验的行为取证（Edge headless + CDP）：正常开局画牌 → 人为把一张牌挪出半格晶格 → 整屏错误页 `rgb(27,15,12)`、零牌绘制、未捕获异常 0、rAF 存活 |

## 5. 修改的既有测试与工具（8）

| 文件 | 改动要点 | 最终 |
|---|---|---|
| `test.js` | `[3]` 整段重写为「20 套模板：缩略图 ↔ 实际布局一一对应（20 套 × 10 档位 = 200 局）」：生成不抛错 / 生成后保真 / 真实牌位复核 / 零悬空 / 可点 19–25 / 张数 / 层数 / 掩膜逐格相等 / 牌桌边界 / 半格晶格 / 同层零重叠 / 队列 44 张 4 链 / 20 个规格签名互异 / 缺 templateId 必须报错；`[10]` 连通性口径改为「主堆连通分量数 == 掩膜区域数」；`[12]` 补 templateId（合成小牌局用 `skipFidelityCheck`）；新增 `gen()` 包装（第二关按 seed 确定性挑模板） | **631 / 0** |
| `test-l1-frozen.js` | `[3]` 从「9 条旧路径基线零漂移」改为「第二关旧默认路径已彻底删除：9 条历史记录必须全部明确报错」；`[5]` 静态检查先剥注释再匹配，engine.js 断言放行新增 `verifyTemplateFidelity` 导入并单独断言 `if (lv === 2 && !skipCheck)` 包裹；generator 断言改为 `lv === 2 && !opt.templateId` + `lv === 2) ? generateTemplateLayout` | **56 / 0** |
| `test-l2-templates.js` | 口径改为「层张数由档位唯一决定」（`layerShapes.size === 1`，比旧的「≥6 种」更严）；区域分布取 `L2_TEMPLATE_MAP` 的 `maskRegionCount`；报告表新增「主堆包围盒」「开局可点」两列（`describeTemplateLayout` 传入实测 `visible`） | **262 / 0** |
| `test-random-generation.js` | 新增 `gen()` 包装并替换 4 处 `generateLevel(2, …)` 调用，补 templateId | **7788 / 0** |
| `tools/test_render.mjs` | `startLevel` 补 `'L2-P01'`，循环内 `lv === 2 ? 'L2-P01' : undefined` | 27 / 27 |
| `tools/stress_release.mjs` | 补 `L2_TEMPLATE_IDS` 导入与 templateId | 未在本轮跑 release 全量 |
| `tools/tune.mjs` / `tools/tune_pool.mjs` | 同上（种子池调参脚本适配第二关必须带 templateId） | 仅用于调参 |
| `tools/browser_smoke.mjs` | 无源码改动；本轮重跑确认真实页面开局/去重/无异常 | `allPassed=true` |

## 6. 重建产物（4）

| 文件 | 字节 | SHA-256 |
|---|---:|---|
| `dist/MahLeMah.html` | 9,925,831 | `03507abf477aa6389af4977baaf53b46be13475c1051d4e5dba244cbdaa3f5a8` |
| `dist/index.html` | 9,925,831 | 同上（同内容副本） |
| `dist/Mah了个Mah.html` | 9,925,831 | 同上（同内容副本） |
| `dist/MahLeMah-legacy.html` | 9,960,000 | `b99c16d0c6d371092bcf277be764aa630ef867ca06bf31c7218a77f9cb6dec2f` |

`sourceHash=78be7c6f08311bf1da7bb8003a2e9aa54d266717646f042bfde6597d8fbc40d0`（38 个源文件）、
`buildVersion=2.0.0-66fe78b`。4 个产物均内嵌 20 个 `templateId`（`L2-P01`…`L2-P20`）、
`MAH-L2-SPEC-v2` 规格层与 5 首内置背景音乐，由 `npm run build:all` 从当前 `src/` 重建。

## 7. 新增 / 刷新的报告

| 文件 | 说明 |
|---|---|
| `reports/l2-thumbnails.{html,json,png}` | 20 套布局缩略图（每套真实生成一局后按真实 `x/y/layer` 俯视绘制） |
| `reports/l2-100-games.txt` | 第二关连续 100 局实测（本次重新生成；窗口内四类签名重复 0，问题 0 条） |
| `reports/l2-render-guard-output.txt` | 渲染前校验失败时的整屏报错取证 |
| `reports/l2-templates-report.{json,md}` / `-output.txt` | 20 套 ID / 掩膜 / 主堆包围盒 / 开局可点 / 代表布局指标 + 190 对差异（真实运行自动生成） |
| `reports/l1-frozen-report.{json,md}` / `-output.txt` | 第一关冻结回归 + 「旧第二关路径必须报错」结果 |
| `reports/FINAL_*.txt` / `FINAL_RERUN_ALL.txt` | 最终一次全套真实运行输出（7 个 Node 测试 + render + browser smoke + music real playback） |
| `reports/FINAL_ACCEPTANCE.md` / `MODIFIED_FILES.md` | 本版验收报告与本清单 |

## 8. 更新的文档

| 文件 | 说明 |
|---|---|
| `README.md` | 顶部说明改为「规格驱动 + 三段校验」；新增 `## 0.00` 本轮章节（要求 ↔ 实现 ↔ 证据），旧 `## 0.0` 标注「20 套模板仍有效，落牌算法已被取代」；统一生成流程改「按规格逐层落牌 + 无默认路径」；文件树补 `l2_spec.js`；验收清单补 200 局三段保真 / 旧路径删除 / 渲染前报错取证三项，数值同步 631/0、56/0、0.4438 / 0.4284、连通性口径 |
| `CHANGELOG.md` | 新增本版章节（规格层、三段校验、旧路径删除、真实数值、未运行项）；上一节标注仍有效部分 |
| `DELIVERY.md` | 标题与新增 `## 0.00` 本轮增量表 + 真实运行结果表；`## 0.0` 标注落牌算法已被取代 |

## 9. 刻意未改动

| 文件 | 原因 |
|---|---|
| `src/game/layout.js`、`layout_profiles.js`、`layout_signature.js`、`tiles.js`、`tile_types.js`、`render.js`、`audio.js`、`robots.js`、`seed_pool.js` | 第一关布局、发牌、渲染、音效、机器人、种子池一律不动（牌数 / 规则 / 交互 / 视觉风格保持不变） |
| `src/game/l2_templates.js`（除删 `ZONE_ANCHORS`） | 20 套模板与掩膜是上一轮已确认的设计标准，本版不改形状定义；`growth` / `layerShape` / `curve` 等字段保留为形状说明性元数据 |
| `src/game/l2_structure.js` | 几何级去重算法本版无需改动 |
| `src/game/recent_games.js`、`save_data.js`、`src-tauri/src/main.rs` | 历史窗口（L1=3 / L2=10）、15 字段白名单与旧档兼容已在上轮完成 |
| `src/game/music_player.js`、`music_manifest.js`、`src/assets/music/*`、`src-tauri/tauri.conf.json` | 音乐与音效链路按要求保留 |
| `reports/L1_FROZEN_BASELINE.json` | 第一关冻结基线不得改动（改了就不再是冻结回归） |
| `dist/MahLeMah-Setup-v2.0.0.exe`、`MahLeMah-Portable-v2.0.0.zip`、`SHA256SUMS.txt` | 本机缺 MSVC `link.exe`，Rust 构建不可用，桌面产物**未重建**，仍是旧冻结版本 |
| `npm run test:release`（12000 局） | 本版未重跑，如实标注 |

## 10. 真实运行汇总

| 命令 | 结果 |
|---|---|
| `node test.js` | 631 / 0 / EXIT=0 |
| `node test-random-generation.js` | 7788 / 0 / EXIT=0（双关各 100 局） |
| `node test-l2-templates.js` | 262 / 0 / EXIT=0 |
| `node test-l1-frozen.js` | 56 / 0 / EXIT=0 |
| `node test-layout-position.js` | 35 / 0 / EXIT=0 |
| `node test-music-playback.js` | 69 / 0 / EXIT=0 |
| `node test-build-consistency.js` | 110 / 0 / EXIT=0 |
| `node tools/test_render.mjs` | 27 / 27 |
| `node tools/browser_smoke.mjs` | `allPassed=true` |
| `node tools/music_real_playback.mjs` | 54 / 54（桌面版未运行） |
| `node tools/l2_100_games.mjs` | PASS（问题 0 条） |
| `node tools/l2_thumbnails.mjs` | 20 / 20 套缩略图生成 |
| `cargo check` / `cargo build` | **未运行成功**（缺 MSVC `link.exe`） |
| 桌面版 / Windows 安装版重建与真机播放 | **未运行** |

Node 断言合计 **8951 项，0 失败**（631 + 7788 + 262 + 56 + 35 + 69 + 110 = 8951），
另有 `tools/test_render.mjs` 的 27 个渲染场景全部通过（场景不是断言，单列统计）。

---

**本版提交**：`<待回填>`（提交后刷新此行与 `reports/FINAL_ACCEPTANCE.md` 末尾）。
