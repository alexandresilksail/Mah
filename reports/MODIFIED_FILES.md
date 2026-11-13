# 修改文件清单（第二关 20 套指定全局形状 + 最近 10 局双重去重）

**项目**：MahLeMah（`mah-le-mah/`）
**日期**：2026-11-13
**本版口径**：只改第二关布局系统（模板定义 + 落牌几何 + 去重口径）及其测试 / 产物 / 文档；
**第一关完全冻结**，只做回归测试；不改核心玩法、牌数配置、难度体系、音乐与音效链路。
**取代关系**：本版取代同日早些时候的「50 套参数化结构模板」版本（`f17b73b`）。
**上一轮基线**：`f17b73b`

---

## 1. 重写的源码（2）

| 文件 | 改动要点 |
|---|---|
| `src/game/l2_templates.js` | **20 套指定全局形状的唯一定义源**。新增 `MASK_COLS=9` / `MASK_ROWS=5`、`parseMask()`（`#` 可落牌 / `@` 高密度 / `.` 禁止，非法字符直接抛错）、`labelRegions()`（4 邻域连通分量 → 区域标签 R1/R2/…）、`maskBox()`。每套模板新增 `mask` / `maskCells` / `maskCellCount` / `maskRegion` / `maskRegionCount` / `maskBox` 与结构参数 `growth` / `layerShape` / `curve` / `offsets` / `density` / `phase` / `feature`。形状族改为 7 族（`core` / `island` / `frame` / `dir` / `grid` / `wave` / `irregular`）。结构签名算法标签 `MAH-L2-TPL-v1` → `MAH-L2-TPL-v2`。`ZONE_ANCHORS` 仅为旧引用兼容保留 |
| `src/game/l2_geometry.js` | 落牌改为**只在掩膜格内**进行。`templatePlanFor()` 的 `capPerLayer` 改为 `template.maskCellCount`；新增 `pickCoverCells()`（底层每区域至少 1 张 + 最远点铺开）；重写 `pickMaskCells()`（形状分归一化 [0,1] × 0.58 + 层号确定性扰动 × 0.42 + 高密度加成 − 覆盖补偿 + 微随机）；`biasFor()` 扩到 20 种生长轨迹；`repairSupport()` 候选格只取自 `tpl.maskCells`；`shareScore()` 新增 `flat` 分支。移除 `zoneFor()` / `windowFor()` / `shapeCells()` 与 `ZONE_ANCHORS` 依赖 |

## 2. 新增工具（1）

| 文件 | 职责 |
|---|---|
| `tools/l2_thumbnails.mjs` | 20 套模板各固定 `(profile 0, seed = 7077 + i*131)` 真实生成一局，取主堆真实 `x/y/layer` 按 z 顺序绘制 SVG 俯视图（虚线格 = 5×9 掩膜），输出 `reports/l2-thumbnails.html` / `.json`，供逐一核对形状 |

## 3. 修改的源码注释 / 文案（4，逻辑零改动）

| 文件 | 改动 |
|---|---|
| `src/game/new_game.js` | 「50 套」→「20 套掩膜模板」注释 3 处；`TEMPLATE_POOL_EXHAUSTED` 错误文案改 20 套。**`createLevel2Game()` 与第一关主体一行未改** |
| `src/game/generator.js` | 模板分支注释「50 套模板」→「20 套掩膜模板」；`lr === 2 && opt.templateId` 判定与默认路径逐字节不变 |
| `src/game/l2_recent.js` | `availableTemplateIds()` 注释「50 套」→「20 套」；判定逻辑不变 |
| `src/main.js` | 调试面板 `availableTemplateCount` 分母 `/ 50` → `/ 20` |

## 4. 修改的既有测试与工具（6）

| 文件 | 改动要点 | 最终 |
|---|---|---|
| `test-l2-templates.js` | 按 20 套 / 7 族 / 5×9 掩膜重写判定口径：`[0]` 20 个唯一 ID + 7 族均有模板 + 掩膜两两不同 + 每套 5×9 且可落牌格 ≥ 20 + 结构签名唯一；`[1]` 20×3=60 局合法性；`[2]` 190 对两两差异（层分布 ≥6 / 区域分布 ≥4 / 占位格轮廓 ≥16 种）；`[4]` 候选池断言 `availableTemplateIds(recent10).length === 10`；**新增两项聚合断言**「60 局主堆落牌全部位于掩膜格内」「60 局主堆覆盖掩膜全部连通区域」；报告 Markdown 增加掩膜表格 | **262 / 0** |
| `test-l1-frozen.js` | 强传 `templateId` 的取值 `'L2-C01'` → `'L2-P01'`（旧 ID 已不存在）。判定逻辑与基线文件一字未改 | **64 / 0** |
| `test.js` | `[1]` 模板数量断言 50 → 20（`L2_TEMPLATES.length` / `L2_TEMPLATE_IDS.length` / `new Set(...).size` 三者均为 20）。**`[3]` 第二关默认路径段逐字未改** | **625 / 0** |
| `test-random-generation.js` | 注释与 `L2_TEMPLATE_IDS.length === 50` 断言改为 20；L1 判定逐字保留 | **7788 / 0** |
| `test-build-consistency.js` | `[7]` 标题与 `ids.size` 断言 50 → 20；`indexOf('L2-C01')` → `indexOf('L2-P01')`；报告文案同步 | **110 / 0** |
| `tools/browser_smoke.mjs` | 仅注释「50 套 → 20 套」；L2 每页仍真实开 4 局并校验模板 / 两种几何签名 / 四项双重去重 | `allPassed=true` |

## 5. 重建产物（4）

| 文件 | 字节 | SHA-256 |
|---|---:|---|
| `dist/MahLeMah.html` | 9,916,421 | `61f322e503b256a6e66e487d311574a7f5e2cef29fb4bda6c931588a6fddb3fd` |
| `dist/index.html` | 9,916,421 | 同上（同内容副本） |
| `dist/Mah了个Mah.html` | 9,916,421 | 同上（同内容副本） |
| `dist/MahLeMah-legacy.html` | 9,950,536 | `d9dac7d73741585082853fcf529bccf2a7030084bfd71e6e4a53babaeb852f73` |

`sourceHash=e3f1aba2f8dd2b3e…`（37 个源文件）、`buildVersion=2.0.0-f17b73b`。
4 个产物均内嵌 20 个 `templateId`（`L2-P01`…`L2-P20`）与 5 首内置背景音乐，
由 `npm run build:all` 从当前 `src/` 重建。

## 6. 新增 / 刷新的报告

| 文件 | 说明 |
|---|---|
| `reports/l2-thumbnails.{html,json,png}` | **20 套布局缩略图**（HTML 可交互俯视 + Edge 截图 PNG） |
| `reports/l2-100-games.txt` | 第二关连续 100 局实测（任意连续 10 局零重复） |
| `reports/l2-templates-report.{json,md}` / `-output.txt` | 20 套模板 ID / 掩膜 / 结构参数 / 代表布局指标 + 差异测试结果（真实运行自动生成） |
| `reports/l1-frozen-report.{json,md}` / `-output.txt` | 第一关冻结回归结果与真实 stdout |
| `reports/FINAL_*.txt`（10 份） | 最终一次全套真实运行输出（7 个 Node 测试 + render + browser smoke + music real playback） |
| `reports/FINAL_RERUN_ALL.txt` | 本版最终运行汇总（由上述日志汇总，非手写 PASS 模板） |
| `reports/FINAL_ACCEPTANCE.md` / `MODIFIED_FILES.md` | 本版验收报告与本清单 |

## 7. 更新的文档

| 文件 | 说明 |
|---|---|
| `README.md` | `## 0.0` 章节重写为「20 套全局形状 + 掩膜」；统一生成流程说明改 20 套 + 池耗尽报错；文件树与验收清单数值同步（262/0、60 局、190 对、0.4104 / 0.3560、20/20 种）；补「落牌在掩膜内 + 覆盖全部连通区域」断言；修正三处早期遗留的 `validateTemplate` / 「连通分量 = 1」口径 |
| `CHANGELOG.md` | 新增本版章节（取代 50 套版，含掩膜体系说明、新数值、未运行项）；旧 50 套章节标注「已被取代」保留为历史记录 |
| `DELIVERY.md` | `## 0.0` 本轮增量表与真实运行结果表全部改 20 套口径；标题同步 |

## 8. 刻意未改动

| 文件 | 原因 |
|---|---|
| `src/game/config.js`、`engine.js`、`layout.js`、`layout_profiles.js`、`layout_signature.js`、`tiles.js`、`seed_pool.js`、`robots.js` | 牌数配置、难度体系、三消规则、第一关布局、发牌、几何签名、渲染与核心玩法一律不动 |
| `src/game/l2_structure.js` | 几何级去重算法本版无需改动，仍按真实坐标 / 层级 / 区域 / 轮廓 / 遮挡 / 可操作区计算 |
| `src/game/recent_games.js`、`save_data.js`、`src-tauri/src/main.rs` | 历史窗口（L1=3 / L2=10）、15 字段白名单与旧档兼容已在上轮完成，本版无改动 |
| `src/game/music_player.js`、`music_manifest.js`、`render.js`、`src/assets/music/*`、`src-tauri/tauri.conf.json` | 音乐与音效链路按要求保留 |
| `reports/L1_FROZEN_BASELINE.json` | 第一关冻结基线不得改动（改了就不再是冻结回归） |
| `dist/MahLeMah-Setup-v2.0.0.exe`、`MahLeMah-Portable-v2.0.0.zip`、`SHA256SUMS.txt` | 本机缺 MSVC `link.exe`，Rust 构建不可用，桌面产物**未重建**，仍是旧冻结版本 |
| `npm run test:release`（12000 局） | 本版未重跑，如实标注 |

## 9. 真实运行汇总

| 命令 | 结果 |
|---|---|
| `node test.js` | 625 / 0 / EXIT=0 |
| `node test-random-generation.js` | 7788 / 0 / EXIT=0（双关各 100 局） |
| `node test-l2-templates.js` | 262 / 0 / EXIT=0 |
| `node test-l1-frozen.js` | 64 / 0 / EXIT=0 |
| `node test-layout-position.js` | 35 / 0 / EXIT=0 |
| `node test-music-playback.js` | 69 / 0 / EXIT=0 |
| `node test-build-consistency.js` | 110 / 0 / EXIT=0 |
| `node tools/test_render.mjs` | 27 / 27 |
| `node tools/browser_smoke.mjs` | `allPassed=true`（`exceptions=0`） |
| `node tools/music_real_playback.mjs` | 54 / 54（桌面版未运行） |
| `node tools/l2_thumbnails.mjs` | 20 / 20 套缩略图生成 |
| `cargo check` / `cargo build` | **未运行成功**（缺 MSVC `link.exe`） |
| 桌面版 / Windows 安装版重建与真机播放 | **未运行** |

Node 断言合计 **8953 项，0 失败**。

---

**本版提交**：`0344ad7`（完整哈希 `0344ad7281b16ba785ad24d99eb9e36f8f5d1401`），已推送 `origin/main`。
