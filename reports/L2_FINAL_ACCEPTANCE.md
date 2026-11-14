# 第二关 20 套模板布局 · 正式最终验收报告

> 本报告以 HEAD `8a0c434` 为基准，**整合第一阶段几何规格审计**与**第二阶段真实渲染视觉审计**。
> 本轮只生成审计报告、证据索引与版本冻结记录；**未修改任何游戏源码、布局算法、模板定义、第一关、音乐与场景**；
> **未自动提交 Git commit、未推送 GitHub**。
> 所有结论均来自真实读取的原始报告与实测数据；`NOT RUN` 一律如实保留，不改写为 `PASS`。

---

## 1 · 版本与审计范围

### 1.1 基准版本

| 项 | 值 |
|---|---|
| 仓库 | `mah-le-mah`（`D:\Users\Administrator\WorkBuddy\2026-11-02-18-41-41\mah-le-mah`） |
| **基准 HEAD** | **`8a0c434ad1e4a4da2b906a5744105aeac883144a`**（短 `8a0c434`） |
| HEAD 提交说明 | `@ audit(l2): 修复保真校验相位漏检 + 重建产物 + 同步审计与验收报告` |
| 规格算法版本 | `MAH-L2-SPEC-v2`（`src/game/l2_spec.js:40` `SPEC_ALGORITHM`） |
| 模板结构签名版本 | `MAH-L2-TPL-v2`（`src/game/l2_templates.js:337`） |
| 构建产物内嵌版本 | `buildVersion=2.0.0-e71486e`、`gitCommit=e71486e75c24154e6bffb64db509a30d0791f416`、`sourceFiles=38` |
| 当前 `sourceHash` | `b8666bafae0661ee9f73a398729a6bc1824b60e64a7caeec590ba2c7dd452428` |
| 审计时间 | **2026-11-13（本地 GMT+8）**；本轮整合时间 23:28 |
| 第一阶段审计时间 | 2026-11-13（报告 §1） |
| 第二阶段执行时间 | `2026-11-13T15:08:43.017Z`（= 本地 23:08:43，写入 `l2-visual-comparison.json` 的 `generatedAt`） |

> **版本滞后如实说明**：4 个 HTML 产物内嵌的 `buildVersion / gitCommit` 指向 `e71486e`（构建时的 HEAD），
> 而仓库当前 HEAD 为 `8a0c434`，**相差一个提交**。`sourceHash` 经 `reports/build-consistency-report.json`
> 与 4 个 HTML 内嵌值逐一核验一致（见 §1.4），说明**源码内容一致**，仅构建元数据滞后。
> 历史产物 `reports/browser-smoke-report.json` 中保留的 `sourceHash=cfce4fbfa000…` 属于更早一次构建的旧值，
> 不代表当前状态（AUDIT_REPORT.md §0 记录了哈希经历 `78be7c6f → cfce4fbf → b8666baf` 三次漂移）。

### 1.2 审计文件范围（本轮真实读取，非依据聊天摘要）

| # | 文件 / 目录 | 类型 | 读取情况 | 大小 / 数量 |
|---|---|---|---|---|
| 1 | `reports/L2_LAYOUT_STAGE1_AUDIT.md` | 第一阶段原始报告 | **全文读取（179 行）** | 18,162 B |
| 2 | `reports/L2_LAYOUT_STAGE2_VISUAL_AUDIT.md` | 第二阶段原始报告 | **全文读取（470 行）** | 40,608 B |
| 3 | `reports/l2-visual-comparison.json` | 第二阶段全量实测数据 | **真实解析**（顶层字段、20 套 × 3 档、190 组、不变性、checks、summary） | 503,488 B |
| 4 | `reports/l2-visual-screenshots/` | 真实游戏截图 | **目录枚举 + PNG 尺寸/存在性校验** | 80 个 PNG（60 张 720×1280 游戏截图 + 20 张 360×640 规范轮廓图） |
| 5 | `reports/l2-visual-diff/` | 差异图 / 缩略图 / 逐套 JSON | **目录枚举 + 存在性校验，缺失 0** | 80 个文件（40 PNG + 40 JSON） |
| 6 | `reports/AUDIT_REPORT.md` | 前序 42 项最终审计 | **全文读取（425 行）** | 25,872 B |
| 7 | `README.md` | 项目文档 | **全文读取（641 行）** | — |
| 8 | `CHANGELOG.md` | 变更日志 | **全文读取（319 行）** | — |
| 9 | `git log -15` / `git rev-parse HEAD` / `git status --short` / `git diff --stat` | 当前 Git 记录与工作区状态 | **现场执行** | 见 §1.3 |
| 10 | `reports/build-consistency-report.json` / `FINAL_ACCEPTANCE.md` / `MODIFIED_FILES.md` / `CARGO_CHECK_OUTPUT.txt` | 辅助证据（sourceHash、桌面构建状态） | **真实读取** | — |

### 1.3 源码是否发生变化 / 两阶段审计提交状态

| 项 | 结论 | 证据 |
|---|---|---|
| `src/` 相对 HEAD | **零改动** | `git diff --stat HEAD -- src/ dist/` 输出为空 |
| `dist/` 相对 HEAD | **零改动** | 同上；4 个 HTML 产物本轮未修改 |
| 4 个 HTML 产物 | **未修改** | `dist/index.html`、`dist/MahLeMah.html`、`dist/Mah了个Mah.html`、`dist/MahLeMah-legacy.html`（各内嵌 `sourceHash=b8666baf…`） |
| 第一关 / 音乐 / 场景 | **未修改** | 两阶段报告均声明；`git status` 无相关源码文件 |
| 第一阶段审计提交状态 | **未提交、未推送** | 产物 `reports/L2_LAYOUT_STAGE1_AUDIT.md` 为未跟踪文件（`??`）；刷新了 3 个测试输出文件（`M`） |
| 第二阶段审计提交状态 | **未提交、未推送** | 报告、JSON、两个证据目录、4 个 `tools/l2_visual_*.mjs` 均为未跟踪文件（`??`） |
| 本轮（最终报告）提交状态 | **未提交、未推送** | 仅新增 3 个 `reports/*.md`；完成后按要求输出 `git status` |
| HEAD 是否移动 | **否，仍为 `8a0c434`** | `git rev-parse HEAD` 现场取值 |
| 原始报告与证据 | **未删除、未覆盖** | 两阶段目录与文件全部保留 |

### 1.4 `sourceHash` 的真实来源（从构建报告读取，未重算）

| 来源 | 值 | 状态 |
|---|---|---|
| `reports/build-consistency-report.json` → `buildInfo.{modern,legacy,live}.sourceHash` | `b8666bafae0661ee9f73a398729a6bc1824b60e64a7caeec590ba2c7dd452428` | 一致；`assertions 110/0`、`exitCode 0`、`generatedAt 2026-11-13T12:42:06.316Z` |
| `reports/build-consistency-report.md:30` | 同上 | 三列（产物/重打包/现场）一致 |
| `reports/AUDIT_REPORT.md:292` | 同上（第 27 项 PASS） | `sourceFiles=38` |
| 4 个 HTML 内嵌 `sourceHash` | 同上 ×4 | 逐一 grep 核验一致 |

---

## 2 · 第一阶段：几何规格审计（完整保留）

> 来源：`reports/L2_LAYOUT_STAGE1_AUDIT.md`（只读独立代码审计，`8a0c434`），本轮不重复审计、不重新计算。

### 2.1 20 套模板定义

- `l2_templates.js:79-239` 定义 `DEFS` **20 项**，`L2_TEMPLATES` 由 `DEFS` 构建（`:346-350`）；`test-l2-templates.js:85-87` 断言 `length===20` 且 `Set.size===20`；独立探针确认 20 个 ID 全部可按 `templateById()` 反查（`:357-359`）。**PASS**
- ID 清单：`L2-P01` … `L2-P20`，全部 `L2-` 前缀，唯一。
- 形状族 7 类共 20 套：核心聚拢 ×2 / 多岛分离 ×4 / 围合环抱 ×5 / 单向偏置 ×4 / 格网迷宫 ×2 / 起伏异形 ×2 / 不规则大陆 ×1。
- **模板不静态保存逐层格位**；逐层格位由 `specPlan(spec, profile, fillRot)`（`l2_spec.js:424-697`，纯函数）由掩膜唯一确定；掩膜解析 `parseMask`（`l2_templates.js:244-264`）、连通区域 `labelRegions`（`:267-294`）。**PASS（含说明）**

### 2.2 缩略图与源码掩膜一致性

- `tools/l2_thumbnails.mjs:32-61` 以 `generateLevel(2, seed, {profile:0, templateId})` **真实生成**，再按主堆真实 `(x,y,layer)` 绘制（`svgFor` `:78-113`），虚线框为模板掩膜。
- 独立探针比对 `reports/l2-thumbnails.json` 与源码掩膜：`maskMismatch=0`、`maskCellCountMismatch=0`。**PASS**
- 第二阶段进一步确认：`tools/l2_thumbnails.mjs:49` **只读 `tpl.structure.mask`**，装饰参数不进入缩略图。

### 2.3 `specPlan()` 生成逻辑

| 项 | 结论 | 证据 |
|---|---|---|
| 严格按规范生成 | **PASS** | `buildPlan`（`l2_spec.js:424-697`）只基于 `spec`（掩膜/游走序/邻接）与 `profile`（`layerPlanFor`，`config.js:228-249`）；层总数、逐层张数、张数总和内部自校验（`:427-673`） |
| 几何唯一来源 | **PASS** | 实际几何 = 掩膜（`buildSpec` `:225-286`）+ 档位层张数 + `fillRot`；每层格集合 = 多源 BFS 游走序 `walkOrder`（`:190-221`）的确定性展开；计划缓存 `PLAN_CACHE`（`:699`） |
| 无随机选格 / 随机偏移 / 层级重排 | **PASS** | 生成热路径（`l2_spec.js`、`l2_geometry.js`）**无 `Math.random`**；唯一随机性为 ①seed→`fillRot`（确定性）②tail 段相位候选搜索（`buildCandidate` `l2_geometry.js:183-198`，仅挑「开局可点 19–25」的自由旋转，非模板身份）③队列 `makeRng`；层到格由 `plan` 固定 |
| 20 套不可能生成相同布局 | **PASS** | 20 套掩膜两两不同（`test-l2-templates.js:100-101` `maskKeys.size===20`）；profile 0 下 20/20 轮廓唯一 |
| 掩膜 100% 覆盖 | **PASS** | `buildPlan` 末尾 `remaining!==0` 抛错（`:660-667`）；`checkFidelity` 的 `SILHOUETTE`（`:890-902`）；`test.js:308-314` 200 局逐格等于掩膜 |
| 半格晶格 / 边界 / 同层零重叠 | **PASS** | `checkFidelity` 的 `LATTICE`/`CELL_OUT`/`SAME_LAYER`（`:806-928`）；`test.js:316-321` 200 局全过 |

### 2.4 10 档难度主体轮廓一致性

- 独立探针：固定 seed、遍历 10 档，每套模板的**被占掩膜格集合（忽略层号与相位）0 处变化**（200 局 `cellSetMismatches=0`）。**PASS**
- 原理：`SILHOUETTE` 强制掩膜全覆盖且与档位无关；档位仅改变**层内张数分布（垂直深度）**，不改变水平轮廓。
- 说明：「层→格」对应关系随档位变化属正常难度差异，不构成「破坏主体轮廓」。

### 2.5 三阶段布局保真

| 阶段 | 结论 | 调用链证据 |
|---|---|---|
| ① 生成后 | **PASS** | `generateTemplateLayout` → `buildCandidate`（`l2_geometry.js:244-300`）accept 前调用 `checkFidelity`（`:282`）；`test.js:283` 200/200 |
| ② `installLevelData` 安装后 | **PASS** | `engine.js:183-238` 装配前调用 `verifyTemplateFidelity(data.cards, templateId, profile, specFillRot)`（`:193`），不过即抛错、不安装；`engine.js:205` `this.cards = data.cards` 为**引用赋值，不改牌位**；`test-l2-templates.js:210-218` 60 局通过 |
| ③ 渲染前 | **PASS** | `main.js:583-600` `assertLevel2FidelityBeforeDraw` 按 `boardRev` 缓存、调用同一 `verifyTemplateFidelity`（`:593`）；失败画整屏错误页、零牌绘制（`:603-626`）；`test.js:285` 200/200 |
| 签名/牌数/层级/坐标/相位一致 | **PASS** | 三段共用同一实现（`verifyTemplateFidelity`→`checkFidelity`），由 `specFor + specPlan` 确定性重建计划后逐张比对 |

补充（`AUDIT_REPORT.md` 第 06 项）：审计中曾发现并修复 `checkFidelity` **不校验半格相位 px/py** 的真实缺陷（相位翻转后仍在同一格、半格晶格内，`CELL_OUT/LATTICE/LAYER_FORM` 全部漏检）；已在 `l2_spec.js:855-877` 补 `PHASE` 检查（仅校验 fill 段，tail 段为自由旋转不校验），200/200 基础局仍 PASS、铺设段相位篡改 100% 拦截，并写入 `test.js:350-360` 回归断言（`632/0`）。

### 2.6 `specFillRot` 传递

- 生成 `generator.js:425` / `l2_geometry.js:292`（挂在 `cards` 数组对象上）→ 安装 `engine.js:193,209`（`this.specFillRot`）→ 渲染 `main.js:593`（`g.specFillRot`）。**全链路不丢失。PASS**
- 持久化口径（`AUDIT_REPORT.md` 第 12 项）：`save_data.js:20-37` **只存元数据 + 最近 10 局记录，不序列化牌位**；重放由 `new_game.js:270` 用 `seed + templateId` **确定性重建**，故 `cards.specFillRot`（非元素属性、JSON 序列化会丢）无实际丢失风险。
- 独立探针：`verifyAfterGeneration_PASS=true`；fill 段牌 `x` 翻转半格 → `verifyTemplateFidelity` 报 `PHASE` 失败。

### 2.7 190 组几何差异比较

| 项 | 结果 |
|---|---|
| 执行组数 | **190**（`test-l2-templates.js:273-289` 双循环），`pairs===190`、`overThreshold===0` |
| 结构相似度最大 | **0.4438** < 0.60 |
| 主堆布局相似度最大 | **0.4284** < 0.60 |
| 轮廓/层级分布 | `regionShapes.size>=4`（实测 4 种）；`silhouettes.size===20/20`；`layerShapes.size===1`（各层张数由档位统一决定） |
| 无明显重复模板 | **PASS**：`canonicalGeometrySignature`、`structureSignature` 各 20/20 唯一 |
| 数据口径 | `structureSimilarity`（`l2_structure.js:232-270`）、`layoutSimilarity`（`layout_signature.js:249-273`），均为**几何数据层** Jaccard |

### 2.8 F1 / F2 装饰参数问题（完整保留）

- **F1【中危 · 文档/维护】dead config**：`l2_templates.js` 把 `growth / layerShape / layerCurve(CURVES) / offsets / density / phase` 写入 `structure` 并经 `templateSummary` 暴露（`:323-328,374-379`），但 `l2_spec.js` 的 `buildSpec/buildPlan` 与 `l2_geometry.js` 的落牌逻辑**从未读取**（全局 grep 零命中）。影响：① 模板自述「轮廓掩膜 + 成长参数」名不副实；② `structureSignature`（`:337`）与 `test-l2-templates.js:96-99` `paramKeys` 唯一性部分依赖装饰参数——若将来出现「同掩膜、不同装饰参数」会骗过签名唯一性断言却几何完全相同（当前 20 套掩膜各异，暂不触发）；③ 维护者误判。
- **F2【低危 · 信息】模板 `phase` 非生成相位**：模板 `phase:[0,0]` 等不参与生成；实际 fill 段相位 `PHASES[(fillRot+l)%4]`（`l2_spec.js:488`），`fillRot=(seed^0x6c32f1a7)%4`（`l2_geometry.js:176-177`）。探针实测 P01 第 0 层实际相位 `[1,0]` vs 模板 `[0,0]`。**与 seed 派生设计一致，仅字段冗余。**
- 第二阶段复查（只查不改）：6 个核心模块 `l2_spec.js` / `l2_geometry.js` / `generator.js` / `engine.js` / `render.js` / `main.js` 对这 6 个字段 **0 命中**；引用仅限 `l2_templates.js` 自身赋值/摘要、`test-l2-templates.js` 的 `paramKeys`/展示、`tools/l2_thumbnails.mjs:49` 只读 `mask`。`l2_spec.js` 中的 `phase` 是生成派生的半格错位相位，**同名不同物**。
- **处置状态**：两阶段均按约束**未清理、未修改**；保留为已知风险。

### 2.9 F9 视觉验证盲区（完整保留，并在第二阶段被补上）

- **F9【中危 · 覆盖盲区】**：第一阶段所有「20 套差异」断言（含 190 组）均为几何数据层（坐标 Jaccard + SHA-256 哈希签名），`reports/l2-thumbnails.html/.png` 是人工查看产物，`tools/l2_thumbnails.mjs` 不输出任何断言；无法自动捕获「几何正确但渲染出错」（z 序 / 配色 / 图样位移 / Canvas-DOM 降级一致性）。
- 第一阶段据此判定 **T-7 FAIL**、**V-1 PASS**（探针比对 0 处不一致）、**V-2 / V-3 NOT RUN**；另有 N-1（190 组缩略图像素 diff）、N-2（12000 局 Release）、N-3（桌面真机）为 NOT RUN。
- **该 FAIL 属「测试覆盖不足」，不是产品缺陷**；第二阶段已用真实浏览器像素级验证补齐（见 §3），但第一阶段报告中的原始判定 `FAIL` 在本报告中**如实保留，不改写**。

---

## 3 · 第二阶段：真实视觉审计（完整保留）

> 来源：`reports/L2_LAYOUT_STAGE2_VISUAL_AUDIT.md` + `reports/l2-visual-comparison.json`（`executed=true`、`errors=[]`、`commit=8a0c434…`）。

### 3.1 Edge 及 CDP 真实运行方式

| 项 | 值 |
|---|---|
| 被渲染产物 | `dist/index.html`（真实构建包，`git diff HEAD -- dist` 为空） |
| 浏览器 | Edg/157.0.4341.46（headless，CDP :9341） |
| 逻辑画布 | 720 × 1280，`deviceScaleFactor = 1` |
| 执行次数 | 20 套 × 3 档（0 / 4 / 9）= **60 次真实生成 + 60 次真实渲染** |
| 命令链 | `node tools/l2_visual_audit.mjs` → `node tools/l2_visual_assets.mjs` → `node tools/l2_visual_report.mjs` |
| 只读调用 | `window.__mah.game.startLevel(2, seed, templateId)`、`window.__mah.R.cardAt`；递增 `game.boardRev` 强制牌桌缓存重绘（只改缓存键，不改牌位/层级/牌数） |
| 源码改动 | **零**（仅新增 `tools/` 审计工具与 `reports/` 产物） |

三层严格区分：**① 几何正确**（第一阶段结论，作为期望值来源）／**② 真实渲染正确**（真实 Canvas + `Page.captureScreenshot` + `getImageData`）／**③ 像素级视觉验证**（背景差分、5×5 网格、相位晶格、互相关、190 组逐像素 Jaccard）。

### 3.2 60 张截图的生成方式

- 60 张游戏截图全部由 `Page.captureScreenshot` 对真实 Canvas 页面截屏，含完整 UI（标题 / 按钮 / 槽位 / 牌桌绒布垫），尺寸统一 **720×1280（9:16）**；**60 张 SHA-256 互不相同**。
- 20 张模板缩略图 `*_thumb.png`（360×640）由 `l2-thumbnails.json` 的 `mask` 单独绘制；20 张规范轮廓图 `*_spec.png`（360×640）；差异图 `*_diff.png`（360×640）为实拍**等比缩放 0.5** 后叠加红色规范矩形框，**未使用非等比拉伸**；互相关最佳平移为 (0,0)，无需配准补偿。
- 缩略图、规范轮廓图、差异图与游戏截图**分目录/分文件留档，绝不混用**。
- 本轮核验：`reports/l2-visual-screenshots/` 共 80 个 PNG（60 × 720×1280 + 20 × 360×640），`reports/l2-visual-diff/` 共 40 PNG（全部 360×640）+ 40 JSON，**逐套缺失数 0**。

### 3.3 16,980 / 16,980 逐牌检出

- **16,980 / 16,980**（20 套 × 3 档全部牌；每档牌数恒定 p0=321 / p4=273 / p9=255，20×(321+273+255)=16,980）；主档每套 229/229 主堆牌。
- 检测器：牌矩形内 **5×5 采样网格 vs 无牌基准帧**，双条件 `平均差 ≥ 14 且 命中点 ≥ 10/25`。负对照实测（真牌 273 张 min mean **26.6** / min hits **16**；空位 10 处 max mean **2.4** / max hits **4**），阈值裕度充足，`presentFrac=1.0000` 为真实检出，非阈值放水。

### 3.4 IoU、覆盖率、泄漏率

| 指标 | 实测（20 套 × 3 档） |
|---|---|
| 轮廓 IoU | **1.0000**（最小 = 最大） |
| 覆盖率 | **1.0000** |
| 泄漏率 | **0.0000** |
| 差异比例 | **0.0000**（主档逐套） |
| 判定阈值 | `zeroDrawOffset`（\|dx\|,\|dy\| ≤ 4px）、`noLeakage` ≤0.02、`coverageOk` ≥0.90、`presentOk` ≥0.95、`phaseOk` ≥0.98 |

### 3.5 半格相位和绘制偏移

- 半格相位晶格一致 **1.0000**（18×10 晶格，规范 vs 实拍）；`l2_spec.js:43-44,398-399` 定义 `x=33+c*66+px*33`、`y=220+r*88+py*44`。
- 显示偏移 **(0,0) px，20 套 × 3 档全部**（±16px 互相关平移搜索，最佳平移恒为 0）。
- 20 套规范布局签名与实际渲染签名**逐一完全相同**（各自 20/20 唯一），例如 `L2-P01 = 93d925c5800b`、`L2-P20 = 9abcaf5886c2`。
- 阴影分离：`render.js:548-571` 的整堆承托阴影仅在 `alive.length>0` 时绘制；`drawTile`（`:574-597`）在阴影之后绘制，不会被覆盖；`shadowRatio` 0.0676–0.1082 已从主体轮廓判定中排除。

### 3.6 遮挡关系与点击区域

| 检查项 | 实测 |
|---|---|
| 各层牌块位置 | 主档 67 层 / 273 张；p0 72 层 / 321 张；p9 64 层 / 255 张，20 套完全一致 |
| 同层重叠 | **0 对** |
| 跨层重叠（遮挡） | **42,927 对**，全部符合层级覆盖 |
| 绘制顺序 | **42,927 / 42,927**（`render.js:541` 按 layer 升序绘制 + `render.js:167` `cardAt` 按 z 降序取可点牌，交叉核验） |
| 命中区域与实际坐标 | **5,460 / 5,460**（`render.js:148-173`，逐牌中心调用真实 `cardAt` API） |
| 重叠处有真实牌像素 | 38,663 / 42,927（未命中部分落在圆角/近色区域，不作失效判据） |
| 旧牌局残留 / 错误模板 | **60/60** 生效模板 = 请求模板；`totalTiles===cardCount`；同档牌数恒定；60 张截图哈希全唯一；开局无牌滞留槽位 |

### 3.7 20 套模板跨档位一致性

- 每套在档 0 / 4 / 9 各生成真实牌局并截图，用「实拍主堆 9×5 主格集合」跨档位两两比较：**20/20 全部 Jaccard = 1.0000**（p0↔p4 / p4↔p9 / p0↔p9 及规范轮廓跨档）。
- 难度只改垂直深度（层数 72 → 67 → 64，牌数 321 → 273 → 255），与第一阶段 B4 结论一致。`invarianceAllPass=true`。

### 3.8 190 组视觉差异结果

- 权威口径与第一阶段 `layoutSimilarity` 一致（`layout_signature.js:249-273`）：`layoutSimActual = 0.5 × 逐层「层号 \| 精确(x,y)」Jaccard 均值 + 0.5 × 整体精确坐标轮廓 Jaccard`，阈值 **0.60**；区别是**单元取自真实渲染中实际检测到的主堆牌**，队列牌（44 张，模板间相同）按 `mainStackCards` 口径排除。
- **190 组全部执行，无 NOT RUN**：`distinctCount=190`、`duplicatePairs=[]`、`allDistinct=true`；最大 `layoutSimActual` **0.5730**（`L2-P05\|L2-P06`）< 0.60；纯像素轮廓最大 Jaccard **0.8838**（`L2-P10\|L2-P18`，pixelDiffRatio 0.1162）。
- 相近对（>0.45）8 组：`L2-P05\|L2-P06 0.5730`、`L2-P01\|L2-P07 0.5586`、`L2-P17\|L2-P19 0.4854`、`L2-P05\|L2-P19 0.4829`、`L2-P12\|L2-P17 0.4454`、`L2-P06\|L2-P19 0.4211`、`L2-P02\|L2-P20 0.4167`、`L2-P10\|L2-P12 0.4089`。
- **诚实说明**：二维俯视轮廓在多层堆叠后天然趋同（`mainCellJaccard` 最高 0.94、纯像素轮廓 0.8838）；差异主要体现在逐层分布、层级深度与牌面，判定采用含层级信息的 `layoutSimActual`。本轮各套固定 seed，最大相似度较第一阶段 0.44 略上移至 0.5730，仍低于阈值。
- **全量 190 组逐组数值**：`reports/l2-visual-comparison.json` → `pairwise.pairs[]`（190 条，含 `layoutSimActual/layoutSimSpec/layerSimActual/silhouetteSimActual/pixelSilhouetteJaccard/pixelDiffRatio/mainCellJaccard/visuallyDistinct`），以及 `reports/L2_LAYOUT_STAGE2_VISUAL_AUDIT.md` §5.1 的 190 行完整附录。本轮**不复制、不重算**这些实测值。

### 3.9 四个测量陷阱及修正方法（均为审计工具问题，非产品缺陷）

| # | 现象 | 根因 | 修正 |
|---|---|---|---|
| M1 | 早期 ~+25px 垂直偏移 | 把整堆承托阴影算进「牌」质心 | 改为逐牌 5×5 网格检测，阴影单列 `shadowRatio` |
| M2 | 早期 IoU 0.87–1.0 | `engine.js:273-282` 交错入场 240ms + `render.js:577-583` 渐显 300ms，采样落在半透明中间帧 | `startLevel` 后等待 **760ms** 再采样 |
| M3 | 检出率一度仅 0.57 | `render.js:456` `boardCache` key 含 `alive.length\|freeCount`；隐藏→恢复后 key 复原，复用「空牌桌」缓存帧 | 恢复后 `g.boardRev++` 强制重绘（诊断实测 `sameIR=921600, diffIR=0`）；并进一步发现浅色垫与浅色牌单点色差仅 10~32，改用 5×5 网格 + 负对照标定 |
| M4 | 190 组相似度虚高至 0.94 | 把 44 张全模板相同的队列牌与多层堆叠全算进 9×5 主格，掩膜饱和 | 只取主堆，改用与第一阶段同口径的「层号 \| 精确(x,y)」逐层 Jaccard |

> 修正全部发生在审计工具内，`git status` 显示 `src/` 与 `dist/` 无任何改动。

### 3.10 第二阶段 NOT RUN 项目（如实保留）

| 项 | 结论 | 原因 |
|---|---|---|
| 桌面客户端（Electron / MSI / Portable）真机渲染 | **NOT RUN** | 本轮只验证 `dist/index.html` 的 headless Edge 渲染，未构建桌面包 |
| DOM 降级渲染路径（`domView`） | **NOT RUN** | 本轮走 Canvas 路径 |
| 真实触屏 pointer 事件派发后的命中 | **NOT RUN** | 本轮直接调用 `R.cardAt` API 校验命中逻辑，未派发真实输入事件 |
| 牌面花色 / 图样的逐像素模板匹配 | **NOT RUN** | 本轮验证牌体区域、位置、层级，未做花色 OCR / 模板匹配 |
| 缩略图与游戏截图缩放后逐像素全图 diff | **NOT RUN** | 互相关最佳平移已为 0、无需配准；属可选外观守护（报告 §9.1） |

**第二阶段汇总**：`PASS=20 / FAIL=0 / NOT RUN(模板级)=0`；20/20 模板 PASS；`executed=true`、`errors=[]`。

---

## 4 · 综合验收矩阵

> 判定严格区分「已实测的范围」与「未执行的范围」；带范围限定的 PASS 不代表全平台通过。

| # | 验收维度 | 判定 | 依据与范围限定 |
|---|---|---|---|
| 1 | **几何正确性** | **PASS** | 第一阶段 §2.1–§2.4；`test.js` 200 局三段保真 200/200、掩膜逐格覆盖、`test-l2-templates.js 262/0`、`AUDIT_REPORT` 01–07 全 PASS |
| 2 | **生成正确性** | **PASS** | `specPlan()` 纯函数、无 `Math.random`、无随机选格/偏移/层级重排；`generator.js:341-342` 缺 `templateId` 抛错；`test-random-generation.js 7788/0`；100 局 20/20 模板全用 |
| 3 | **安装正确性** | **PASS** | `engine.js:193` 第二道 `verifyTemplateFidelity`；`:205` 引用赋值不改牌位；60 局真实安装校验；`AUDIT_REPORT` 09 PASS |
| 4 | **渲染正确性** | **PASS** | **限 headless Edge 157 + `dist/index.html` Canvas**：60 局、绘制偏移 (0,0)、同层重叠 0、跨层遮挡 42,927 对、绘制顺序 42,927/42,927、命中 5,460/5,460、无错模板/旧局残留。`tools/test_render.mjs 27/27`；**桌面渲染另见附加行** |
| 5 | **像素级视觉正确性** | **PASS** | **限牌体轮廓 / 位置 / 半格相位 / 遮挡**：16,980/16,980 逐牌检出、IoU/覆盖 1.0000、泄漏 0.0000、相位 1.0000、190 组逐像素比较全执行；补齐第一阶段 F9 盲区。**牌面花色逐像素模板匹配仍为 NOT RUN（见 §5）** |
| 6 | **模板差异性** | **PASS** | 第一阶段 190 组几何 max 0.4438/0.4284；第二阶段 190 组视觉 `layoutSimActual` max **0.5730** < 0.60，重复 0 组；20 套签名 20/20 唯一；最近 10 局模板零重复 |
| 7 | **异常恢复** | **PASS** | `AUDIT_REPORT` 21/22 + `reports/l2-render-guard-output.txt`：篡改 → 整屏错误页 `rgb(27,15,12)`、零牌绘制、未捕获异常 0、rAF 存活；合法开局正常绘制（`browser_smoke allPassed=true`、真实播放 54/54）。**限逻辑/单元/浏览器取证级；桌面真机恢复 NOT RUN** |
| 8 | **第一关冻结** | **PASS** | `AUDIT_REPORT` 23–26 全 PASS；`test-l1-frozen.js 56/0`；20 条基线零漂移；`main.js:584` 渲染前校验对非 L2 早返回；本轮 `src/` 零改动 |

**附加维度（不计入上述 8 项，单列以免混淆）**

| 维度 | 判定 | 依据 |
|---|---|---|
| 桌面发布验收（Windows 桌面构建 / Setup.exe / Portable.zip / SHA256SUMS / 桌面真机音乐 / 12000 局 Release） | **NOT RUN** | `AUDIT_REPORT` 29–34 六项全 NOT RUN；`CARGO_CHECK_OUTPUT.txt` `os error 5`；`FINAL_ACCEPTANCE.md:34-39,281-292`；`CHANGELOG.md:84-90` |

**测试计数交叉引用**（`AUDIT_REPORT.md` 附录，均为 `8a0c434` 现场真实执行）：`test.js 632/0` · `test-l2-templates.js 262/0` · `test-l1-frozen.js 56/0` · `test-layout-position.js 35/0` · `test-music-playback.js 69/0`（模拟）· `test-build-consistency.js 110/0` · `test-random-generation.js 7788/0` · `tools/test_render.mjs 27/27` · `tools/l2_100_games.mjs PASS` · `tools/music_real_playback.mjs 54/54`（真实音频）· `tools/browser_smoke.mjs allPassed=true`。

> **关于第一阶段的 `T-7 FAIL`**：该 FAIL 是「现有测试未验证像素级视觉」的覆盖判定，本报告 §2.9 已如实保留，未改写。第二阶段新增的像素级实测消除了该盲区，因此矩阵第 5 项有独立实测支撑而判 PASS；二者记录的是不同阶段、不同对象，不构成「把 FAIL 改成 PASS」。

---

## 5 · 遗留风险

### 5.1 明确要求的 5 项

| # | 风险项 | 状态 | 实际证据 |
|---|---|---|---|
| R1 | **Electron / MSI 桌面真机渲染未执行** | **NOT RUN** | 第二阶段报告 §8；`AUDIT_REPORT` 29–33；`dist/` 中 `MahLeMah-Setup-v2.0.0.exe`（2026-11-11 10:36）、`MahLeMah-Portable-v2.0.0.zip`（2026-11-10 20:39）均为旧冻结产物，**未用本版源码重建** |
| R2 | **DOM 降级路径未执行** | **NOT RUN** | 第二阶段报告 §8（本轮走 Canvas 路径）；legacy/IE8 DOM 降级仅有 README 描述与既有 `tools/test_render.mjs` 冒烟，未在两阶段做像素级核验 |
| R3 | **真实触屏 pointer 事件未执行** | **NOT RUN** | 第二阶段报告 §8：直接调用 `R.cardAt` API 校验命中逻辑，未派发真实输入事件 |
| R4 | **牌面花色逐像素模板匹配未执行** | **NOT RUN** | 第二阶段报告 §8：只验证牌体区域/位置/层级，未做花色 OCR 或模板匹配 |
| R5 | **Windows 桌面构建及 12000 局 Release 测试是否完成（以实际证据为准）** | **未完成 / NOT RUN** | `reports/CARGO_CHECK_OUTPUT.txt` 结尾 `error: failed to run custom build command for tauri-utils v2.10.2` → `拒绝访问。(os error 5)`；`FINAL_ACCEPTANCE.md:34-39` 明确「未运行成功 / 未用本版源码重建 / 未重跑 `npm run test:release`」；`AUDIT_REPORT.md:304-328` 第 29–34 项全部 NOT RUN（缺 MSVC `link.exe`）；`CHANGELOG.md:84-90` 同口径；`dist/SHA256SUMS.txt` 时间戳 2026-11-10 20:50。**Node 套件已覆盖 7788+632+262+… 局，但与 12000 局 Release 非同一执行，不作等价宣称** |

### 5.2 附加已知风险（如实记录，非本轮修复范围）

| # | 风险 | 说明 |
|---|---|---|
| R6 | **产物构建元数据滞后一提交** | 4 个 HTML 内嵌 `buildVersion=2.0.0-e71486e` / `gitCommit=e71486e75c…`，而 HEAD=`8a0c434`。`sourceHash` 与现场源码一致（`test-build-consistency.js 110/0`），但版本号落后。发布前如需严格对齐须重建并同步文档 |
| R7 | **历史证据中的旧 `sourceHash`** | `reports/browser-smoke-report.json` 保留 `cfce4fbfa000…`（更早一次构建），不是当前值；查阅时应以 `build-consistency-report.json` 与 4 个 HTML 内嵌值为准 |
| R8 | **文档历史口径差异** | `README.md:583` 与 `CHANGELOG.md:72` 记 `test.js 631/0`，`AUDIT_REPORT.md` 记 `632/0`（新增相位回归断言后）；`README.md:612-613` 勾选「`npm run build` 真实生成 / 安装卸载真实验证」属 2026-11-10 历史版本记录，与 `FINAL_ACCEPTANCE.md` 的「本版未重建」并存。本轮**不修改、不覆盖**这些原始文档，仅登记差异 |
| R9 | **F1/F2 装饰参数 dead config 未清理** | 中/低危，仅误导性契约；两阶段均按约束未修改 |
| R10 | **二维俯视轮廓天然趋同** | `mainCellJaccard` 最高 0.94、纯像素轮廓 Jaccard 最高 0.8838；辨识度依赖逐层分布与牌面，建议把 `layoutSimActual` 纳入常规回归断言，不要只看二维轮廓 |
| R11 | **缩略图↔截图全图 diff 未做** | 互相关最佳平移为 0、无需配准；如需纯外观一致性守护可追加缩放后全图 diff 断言 |

---

## 6 · 最终结论

### 6.1 第二关核心几何验收 —— **通过（PASS）**

以 `8a0c434` 为基准，20 套 `MAH-L2-SPEC-v2` 规格驱动模板定义真实唯一；`specPlan()` 严格按规范生成、无随机选格/偏移/层级重排；10 档难度不破坏主体轮廓；生成后 / 安装后 / 渲染前三阶段布局保真共用同一 `verifyTemplateFidelity`；`specFillRot` 全链路不丢失、存档经 seed 确定性重建；190 组几何差异全部低于阈值；第一关完全冻结。依据：第一阶段静态审计 + 自动化测试（`632/0`、`262/0`、`56/0`、`7788/0`）+ `AUDIT_REPORT.md` P0 六项全过。

### 6.2 第二关真实浏览器视觉验收 —— **通过（PASS）**

在 **headless Edge 157.0.4341.46 + 真实构建包 `dist/index.html` 的 Canvas 路径**下，20 套 × 3 档共 60 局真实渲染全部符合规范：16,980/16,980 逐牌检出、IoU/覆盖 1.0000 / 泄漏 0.0000、半格相位 1.0000、绘制偏移 (0,0)、同层零重叠、跨层遮挡与绘制顺序一致、命中区域与坐标一致、无旧局残留或错模板；190 组视觉差异全部执行且无明显重复；跨档位主体轮廓 20/20 不变。**第一阶段 F9 的像素级盲区已补齐；产品缺陷：两阶段均未发现。**

### 6.3 桌面发布验收 —— **未完成（NOT RUN），不得表述为通过**

Windows 桌面构建因本机环境失败（`cargo` `os error 5` / 缺 MSVC `link.exe`），`Setup.exe` / `Portable.zip` / `SHA256SUMS.txt` 仍是 2026-11-10/11 的旧冻结产物，未用本版源码重建；桌面真机渲染、桌面真机音乐、`npm run test:release`（12000 局）均未执行。**浏览器 Web 版通过 ≠ 桌面版通过**：桌面发布验收需在具备 MSVC 与完整工具链的 Windows 环境重新构建并单独核验后才能判定。

> 本报告只断言上述三个层次中已实测的部分。所有 `NOT RUN` 项保持原状，未改写为 `PASS`；两阶段原始报告与全部证据均未删除或覆盖。

---

## 7 · 本轮新增文件

| 文件 | 用途 |
|---|---|
| `reports/L2_FINAL_ACCEPTANCE.md` | 本报告（正式最终验收） |
| `reports/L2_FINAL_EVIDENCE_INDEX.md` | 证据索引（原始报告 / 工具 / 结果 / 60 张截图 / 差异图 / JSON 与 templateId、profileId 对应） |
| `reports/L2_LAYOUT_FREEZE.md` | 版本冻结记录（基准 HEAD / 20 个 ID / 规格版本 / sourceHash / 回归清单） |
