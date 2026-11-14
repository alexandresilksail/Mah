# 第二关布局验收基线 · 版本冻结记录

> 本文件记录**验收基线锁定**，**不代表禁止后续经授权的修复**。
> 冻结仅锁定「当前被验收通过的这一版规格与实现」；任何后续修改都应按 §7 重新执行回归测试并重新验收。

---

## 1 · 冻结基准

| 项 | 值 |
|---|---|
| **冻结基准 HEAD** | **`8a0c434ad1e4a4da2b906a5744105aeac883144a`**（短 `8a0c434`） |
| HEAD 提交说明 | `@ audit(l2): 修复保真校验相位漏检 + 重建产物 + 同步审计与验收报告` |
| 冻结登记时间 | 2026-11-13（本地 GMT+8） |
| 冻结依据 | 第一阶段几何规格审计 + 第二阶段真实渲染视觉审计（见 §5） |
| 冻结时 `src/` / `dist/` 状态 | 相对 HEAD **零改动**；4 个 HTML 产物未修改；第一关 / 音乐 / 场景未改 |
| 本轮提交状态 | **未提交 Git commit、未推送 GitHub**；HEAD 未移动 |

---

## 2 · 20 套 templateId（冻结清单）

来源：`src/game/l2_templates.js:81-239` 的 `DEFS`；`l2_templates.js:346-350` 构建 `L2_TEMPLATES`；`templateById()` 在 `:357-359`。
形状族共 **7 族 20 套**：核心聚拢 ×2 / 多岛分离 ×4 / 围合环抱 ×5 / 单向偏置 ×4 / 格网迷宫 ×2 / 起伏异形 ×2 / 不规则大陆 ×1。

| # | templateId | 族 key | 形状族 | 名称 |
|---|---|---|---|---|
| 1 | `L2-P01` | `core` | 核心聚拢型 | 中心金字塔 |
| 2 | `L2-P02` | `core` | 核心聚拢型 | 双核心 |
| 3 | `L2-P03` | `island` | 多岛分离型 | 三岛屿 |
| 4 | `L2-P04` | `frame` | 围合环抱型 | 环形围绕 |
| 5 | `L2-P05` | `frame` | 围合环抱型 | 十字交叉 |
| 6 | `L2-P06` | `dir` | 单向偏置型 | 阶梯上升 |
| 7 | `L2-P07` | `dir` | 单向偏置型 | 阶梯下降 |
| 8 | `L2-P08` | `dir` | 单向偏置型 | 左侧巨塔 |
| 9 | `L2-P09` | `dir` | 单向偏置型 | 右侧巨塔 |
| 10 | `L2-P10` | `island` | 多岛分离型 | 上下双层岛 |
| 11 | `L2-P11` | `frame` | 围合环抱型 | 蝴蝶形 |
| 12 | `L2-P12` | `frame` | 围合环抱型 | 沙漏形 |
| 13 | `L2-P13` | `grid` | 格网迷宫型 | 迷宫形 |
| 14 | `L2-P14` | `grid` | 格网迷宫型 | 棋盘形 |
| 15 | `L2-P15` | `wave` | 起伏异形型 | 弧形月牙 |
| 16 | `L2-P16` | `wave` | 起伏异形型 | 波浪形 |
| 17 | `L2-P17` | `island` | 多岛分离型 | 对角双塔 |
| 18 | `L2-P18` | `island` | 多岛分离型 | 四角围合 |
| 19 | `L2-P19` | `frame` | 围合环抱型 | 中心十字岛 |
| 20 | `L2-P20` | `irregular` | 不规则大陆型 | 不规则大陆形 |

**验收事实**：20 个 ID 真实存在且唯一（`test-l2-templates.js:85-87`）；20 套掩膜两两不同；20 套规格签名 / 结构签名 / 等价几何签名各 20/20 唯一；190 组几何差异最大 0.4438/0.4284、190 组视觉差异最大 `layoutSimActual` 0.5730，均 < 0.60，重复 0 组。

---

## 3 · 规格版本与构建标识

| 项 | 值 | 来源 |
|---|---|---|
| **规格算法版本** | **`MAH-L2-SPEC-v2`** | `src/game/l2_spec.js:40` `SPEC_ALGORITHM`；用于 `signature`（`:265`）、`specSummary`（`:936`） |
| 模板结构签名版本 | `MAH-L2-TPL-v2` | `src/game/l2_templates.js:337` |
| **当前 `sourceHash`** | **`b8666bafae0661ee9f73a398729a6bc1824b60e64a7caeec590ba2c7dd452428`** | **真实构建报告** `reports/build-consistency-report.json → buildInfo.{modern,legacy,live}.sourceHash`；`reports/build-consistency-report.md:30`；`reports/AUDIT_REPORT.md:292`。本轮另逐一核验 4 个 HTML 产物内嵌值 4/4 一致 |
| 源文件数 | `sourceFiles = 38` | `tools/bundle_shared.mjs computeBuildInfo()` 对 `src/**` 全量 SHA-256 |
| 构建一致性 | `assertions 110/0`、`exitCode 0` | `reports/build-consistency-report.json`（`generatedAt 2026-11-13T12:42:06.316Z`） |
| 产物内嵌版本 | `buildVersion=2.0.0-e71486e`、`gitCommit=e71486e75c24154e6bffb64db509a30d0791f416` | 4 个 HTML 产物；`build-consistency-report.json.buildInfo` |
| 产物哈希 | 现代版 `aa3d28f69c90958396a3881a24280852c6929c75711f34eccf34275598a2c01d`（9,926,380 B）；legacy `3f101399dfe0db31ee6887f04e5afd5c74a9dfd79b4cb5c21fa42e9af7c66558`（9,960,549 B） | `reports/build-consistency-report.json.files` |
| 4 个 HTML 产物 | `dist/index.html`、`dist/MahLeMah.html`、`dist/Mah了个Mah.html`、`dist/MahLeMah-legacy.html` | 由 `tools/build_web.mjs` + `tools/build_legacy.mjs` 重建 |

> **已知不一致（如实记录，未修改）**：产物内嵌 `buildVersion / gitCommit` 指向 `e71486e`，比冻结基准 HEAD `8a0c434` **滞后一个提交**；`sourceHash` 与现场源码一致，故属构建元数据滞后而非源码不一致。历史证据 `reports/browser-smoke-report.json` 中另有更早的 `sourceHash=cfce4fbfa000…`，非当前值。详见 `reports/L2_FINAL_ACCEPTANCE.md` §5 R6/R7。

---

## 4 · 冻结范围（验收基线锁定的对象）

| # | 冻结对象 | 文件 / 函数 |
|---|---|---|
| 1 | **第二关 20 套模板定义** | `src/game/l2_templates.js`（`DEFS` `:79-239`、掩膜解析 `:244-294`、`L2_TEMPLATES` `:346-350`） |
| 2 | **`l2_spec.js`** | `src/game/l2_spec.js`（`buildSpec` `:225-286`、`walkOrder` `:190-221`、`buildPlan` `:424-697`、`specPlan` `:711-749`、`checkFidelity` `:784-928`、含新增 `PHASE` 检查 `:855-877`） |
| 3 | **`l2_geometry.js`** | `src/game/l2_geometry.js`（`generateTemplateLayout` / `buildCandidate` / `buildMain`） |
| 4 | **`specPlan()`** | `src/game/l2_spec.js:711-749`（按 `templateId\|profileId\|rot` 缓存的规格计划） |
| 5 | **`verifyTemplateFidelity()`** | `src/game/l2_geometry.js:218-242`（安装后 / 渲染前共用的第二、三道校验） |
| 6 | **`checkFidelity()`** | `src/game/l2_spec.js:784-928`（生成后第一道校验；`COUNT/CELL_OUT/LATTICE/LAYER_COUNT/LAYER_FORM/PHASE/SILHOUETTE/REGION_COVER/SAME_LAYER`） |
| 7 | **`specFillRot` 机制** | `l2_geometry.js:292` → `generator.js:425` → `engine.js:193,209` → `main.js:593`；存档 `save_data.js:20-37` 只存元数据、重放 `new_game.js:270` 由 seed 确定性重建 |

**一并锁定的关联基线**：10 档难度 `LEVEL2_PROFILES`（`config.js:228-249`）、最近 10 局模板级去重（`l2_recent.js` / `recent_games.js:21`）、三阶段校验入口（`main.js:583-600`）、**第一关完全冻结**（`L1_FROZEN_BASELINE.json`）、音乐与场景。

> **冻结仅表示验收基线锁定，不代表禁止后续经授权的修复。** 如需修改上述任一对象，按 §7 重新执行完整回归并重新出具验收结论。

---

## 5 · 第一阶段与第二阶段报告路径

| 阶段 | 报告 | 数据 / 证据 |
|---|---|---|
| 第一阶段 · 几何规格审计 | `reports/L2_LAYOUT_STAGE1_AUDIT.md` | `reports/l2-templates-report.{json,md}`、`reports/l2-thumbnails.{json,png,html}`、`test-l2-templates.js` / `test.js` |
| 第二阶段 · 真实渲染视觉审计 | `reports/L2_LAYOUT_STAGE2_VISUAL_AUDIT.md` | `reports/l2-visual-comparison.json`、`reports/l2-visual-screenshots/`（60 张真实截图）、`reports/l2-visual-diff/`（差异图/缩略图/逐套 JSON）、`tools/l2_visual_*.mjs` |
| 前序 42 项最终审计 | `reports/AUDIT_REPORT.md` | `reports/FINAL_*.txt`、`reports/build-consistency-report.*`、`reports/l2-render-guard-output.txt` |
| **本轮最终验收** | `reports/L2_FINAL_ACCEPTANCE.md` | `reports/L2_FINAL_EVIDENCE_INDEX.md`、本文件 |

---

## 6 · 已知未完成事项（NOT RUN，冻结基线不覆盖）

| # | 事项 | 状态 | 证据 |
|---|---|---|---|
| U1 | Electron / MSI / Portable 桌面真机渲染 | **NOT RUN** | 第二阶段报告 §8；桌面包为 2026-11-10/11 旧冻结产物，未用本版源码重建 |
| U2 | DOM 降级渲染路径（`domView`） | **NOT RUN** | 第二阶段报告 §8（本轮 Canvas 路径） |
| U3 | 真实触屏 pointer 事件派发后的命中 | **NOT RUN** | 第二阶段报告 §8（直接调用 `R.cardAt` API） |
| U4 | 牌面花色 / 图样逐像素模板匹配 | **NOT RUN** | 第二阶段报告 §8 |
| U5 | Windows 桌面构建（`cargo build --release`） | **未成功 / NOT RUN** | `reports/CARGO_CHECK_OUTPUT.txt`：`os error 5`；`FINAL_ACCEPTANCE.md:34-39`；缺 MSVC `link.exe` |
| U6 | `Setup.exe` / `Portable.zip` / `SHA256SUMS.txt` 用本版源码重建与实机验证 | **NOT RUN** | `AUDIT_REPORT.md` 30–32；`dist/` 产物时间戳为 11-10/11-11 |
| U7 | 桌面真机音乐播放 | **NOT RUN** | `AUDIT_REPORT.md` 33（Web 真机 54/54 已过，桌面未验证） |
| U8 | `npm run test:release`（12000 局 Release 压力测试） | **NOT RUN** | `AUDIT_REPORT.md` 34；`CHANGELOG.md:90` |
| U9 | 产物构建元数据与 HEAD 对齐（`buildVersion` / `gitCommit` 滞后一提交） | **未处理** | 见 §3 说明 |
| U10 | F1/F2 装饰参数 dead config 清理；`layoutSimActual` 纳入常规回归断言；缩略图↔截图全图 diff | **未处理** | 第一阶段 §7、第二阶段 §9.1；两阶段按约束未修改 |

> 上述项目**不得**因本冻结记录而被表述为通过。冻结只覆盖「已实测的几何 + 真实浏览器视觉」范围。

---

## 7 · 后续修改必须重新执行的回归测试

> 只要修改 §4 冻结范围内的任一文件（或任何 `src/` 源文件），以下链条必须重新执行；未执行完不得沿用本冻结结论。

### 7.1 构建链（`src/` 有改动时强制）

```bash
node tools/build_web.mjs            # 重建 index.html / MahLeMah.html / Mah了个Mah.html
node tools/build_legacy.mjs         # 重建 MahLeMah-legacy.html（含 ES5 语法校验）
node test-build-consistency.js      # 目标 110/0：4 HTML 逐字节 + sourceHash 与现场源码一致
```

- 必须重新读取新的 `sourceHash` / 产物 sha256 / 字节数 / `buildVersion` / `gitCommit`，并同步 `FINAL_ACCEPTANCE.md`、`MODIFIED_FILES.md`、`build-consistency-report.*` 与**本冻结记录 §3**，避免再次出现元数据滞后。
- 若改动影响模板掩膜：重跑 `node tools/l2_thumbnails.mjs`，复核 `l2-thumbnails.json` 与源码掩膜 `maskMismatch=0`。

### 7.2 功能与几何回归（全部必须重跑）

| 命令 | 基线结果（冻结时） | 重点检查 |
|---|---|---|
| `node test.js` | 632/0 | [3] 20 套 × 10 档 = 200 局三段保真；相位篡改 100% 拦截 |
| `node test-l2-templates.js` | 262/0 | 20 ID 唯一、60 局、190 对差异 < 0.60、等价几何识别 |
| `node test-l1-frozen.js` | 56/0 | **第一关 20 条基线零漂移**（`L1_FROZEN_BASELINE.json`）、9 条旧 L2 记录报错 |
| `node test-layout-position.js` | 35/0 | 第一关动态居中 |
| `node test-music-playback.js` | 69/0 | 模拟播放 + 4 产物内嵌载荷 |
| `node test-random-generation.js` | 7788/0 | 双关各 100 局、同模板不同 seed 布局稳定 |
| `node tools/test_render.mjs` | 27/27 | 安装 + 渲染、多场景 |
| `node tools/l2_100_games.mjs` | PASS | 100 局去重、20/20 模板全用、最近 10 局窗口零重复 |
| `node tools/music_real_playback.mjs` | 54/54 | Edge 真实音频、场景切换、rAF 存活 |
| `node tools/browser_smoke.mjs` | allPassed=true | 两个 HTML 各生成 4 局、错误恢复 |
| `tools/l2-render-guard-output.txt` 对应取证 | 零牌绘制 / 异常 0 | 渲染前校验失败 → 整屏错误页、无残留、可恢复 |

### 7.3 视觉回归（第二阶段工具链，必须整链重跑）

```bash
node tools/l2_visual_detector_calibration.mjs   # 5x5 网格阈值负对照标定（若检测逻辑或配色变更）
node tools/l2_visual_audit.mjs                  # 60 次真实渲染 + 60 张截图 + 像素分析 + 190 组 + 不变性
node tools/l2_visual_assets.mjs                 # 20 套缩略图 / 规范数据 / 逐套 metrics
node tools/l2_visual_report.mjs                 # 由实测 JSON 重新生成第二阶段报告
```

复核门槛：20/20 PASS；16,980/16,980 逐牌检出；IoU/覆盖 1.0000、泄漏 0.0000；半格相位 1.0000；偏移 (0,0)；同层重叠 0；绘制顺序与命中全数通过；190 组 `layoutSimActual` 全部 < 0.60；跨 p0/p4/p9 轮廓 Jaccard = 1.0000；60 张截图哈希互不相同；`executed=true`、`errors=[]`。

### 7.4 发布前（P1，尚未执行，不得跳过）

- 在具备 MSVC 链接器的 Windows 环境重跑 `cargo build --release`（或项目既定的 GNU 工具链构建），重建 `Setup.exe` / `Portable.zip` / `SHA256SUMS.txt`；
- 桌面真机渲染与桌面真机音乐播放验证；
- `npm run test:release`（12000 局）并单独出具报告；
- 补做 DOM 降级路径、真实触屏 pointer 事件、牌面花色逐像素模板匹配（如纳入验收范围）。

---

## 8 · 冻结声明

1. 本记录以 `8a0c434` 为**唯一验收基线**；第一阶段与第二阶段的原始报告及全部证据**保留不动**，不删除、不覆盖。
2. 冻结结论区分三层：**几何正确（PASS）** / **真实浏览器视觉正确（PASS）** / **桌面发布验收（NOT RUN）**；**浏览器通过不等于桌面版通过**。
3. 冻结**不禁止**经授权的后续修复；任何改动均须按 §7 重新回归、重新核验 `sourceHash`、重新出具验收结论，并更新本文件的基准 HEAD 与 §3 构建标识。
4. 本轮未提交 Git commit、未推送 GitHub；HEAD 保持 `8a0c434`。
