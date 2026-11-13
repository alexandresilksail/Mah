# MahLeMah · 最终审计与验收报告

> 审计时间：2026-11-13 （基于仓库 HEAD `e71486e` 现场源码 + 本次重建产物）
> 审计对象：第二关「规格驱动生成（MAH-L2-SPEC-v2）+ 生成/安装/渲染三段几何校验」全链路
> 审计原则：**逐项真实核验**；未真实执行的项目一律标 `NOT RUN`，绝不标 `PASS`。

---

## 0. 审计结论速览

| 类别 | 项数 | PASS | FAIL | NOT RUN |
|---|---:|---:|---:|---:|
| 一、第二关布局保真 | 7 | 7 | 0 | 0 |
| 二、三阶段数据一致性 | 7 | 7 | 0 | 0 |
| 三、游戏入口与异常恢复 | 10 | 10 | 0 | 0 |
| 四、第一关冻结验收 | 4 | 4 | 0 | 0 |
| 五、构建与发布验收 | 8 | 2 | 0 | 6 |
| 六、测试真实性与报告一致性 | 6 | 6 | 0 | 0 |
| 七、最终验收判定 | — | P0 全过 / P1 待发布前 | — | — |
| **合计** | **42*** | **36** | **0** | **6** |

> * 第七类为判定标准，不计入 42 项。

**本次审计发现并修复 1 个真实缺陷**：`checkFidelity` 原先**不校验每张牌的半格相位（px/py）**——
相位翻转后仍在半格晶格、同一格 key，导致 `CELL_OUT / LATTICE / LAYER_FORM` 全部漏检
（见第一类第 06 项）。已补 `PHASE` 检查（`src/game/l2_spec.js:855-877`），仅校验「铺设段(fill)」相位
（尾段相位是生成时按可点张数挑的自由旋转，非模板身份）。修复后 200/200 基础局仍 PASS，
铺设段相位篡改 100% 被拦截。

**本次审计发现并修正 1 个一致性问题**：在审计过程中编辑了 `l2_spec.js` / `l2_recent.js`，导致产物内嵌的
`sourceHash` 与现场源码不一致，`test-build-consistency.js` 一度 FAIL（EXIT=1）。已重新构建 4 个 HTML 产物
（`build_web.mjs` + `build_legacy.mjs`），现 `sourceHash=b8666baf…`、`sourceFiles=38`，构建一致性 110/0。
相关报告文档中的旧哈希/版本号已同步更正（见第六类第 40 项）。

---

## 一、第二关布局保真（最高优先级）

### 01 · l2_spec.js 规格定义
- **标准**：20 套模板均有明确、稳定的逐层布局规格
- **结论**：**PASS**
- **源码**：`src/game/l2_spec.js`
  - `buildSpec` `:225`（掩膜 → 邻接图 → 游走序 → 规格对象）
  - `specFor` `:291`（结果缓存，纯函数、确定性）
  - `SPEC_ALGORITHM='MAH-L2-SPEC-v2'` `:40`
- **测试命令**：`node test.js`（[3] 段 20套×10档位=200局）
- **实际结果**：200/200 局全部由 `specFor+specPlan` 生成成功，无抛错；20 个规格签名两两不同
  （`test.js` 断言 `t3Sigs.size===20`）；`node test.js → 断言 632/0`。

### 02 · BFS 走位算法
- **标准**：多源起点、最远点采样、半径限制符合设计
- **结论**：**PASS**
- **源码**：`src/game/l2_spec.js`
  - `multiSeeds` `:143-164`（最远点采样；`SPEC_SEED_MAX=5` `:62`、`SPEC_SEED_RADIUS=10` `:67`）
  - `bfsDist` `:167-182`（单源 BFS 距离表）
  - `walkOrder` `:190-224`（多源 BFS 游走序，各连通分量轮流推进）
  - `componentSeeds` `:94-129`（每连通分量取质心最近格为起点）
- **测试命令**：`node test.js`（[3] 段）
- **实际结果**：200/200 局铺满掩膜（长走廊 L2-P13 蛇形在 ≤5 起点下铺满，无 `未能铺满掩膜` 抛错）。

### 03 · 叶子格相位处理
- **标准**：`polarityUrgency()` 不产生相位冲突或遗漏
- **结论**：**PASS**
- **源码**：`src/game/l2_spec.js`
  - `polarityUrgency` `:348-360`（叶子格 degree≤1 权重 100，强制优先满足）
  - `buildPlan` `:424-697`（极性候选按 urgency 排序后取格）
- **测试命令**：`node test.js`（[3] 段 + [5]/[9] 压深/悬空段）
- **实际结果**：200/200 局主堆零悬空（`t3FloatBad===0`）；无「相位冲突导致铺不满」抛错。

### 04 · 尾段走位窗口
- **标准**：`tailBlocksFor()` 所有档位满足压深门槛
- **结论**：**PASS**
- **源码**：`src/game/l2_spec.js`
  - `tailBlocksFor` `:58-60`（≤16 层 2 块，否则 3 块）
  - `buildPlan` 尾段 `:609-637`（`hop = blocks===2 ? size/4 : size/2`，相位逐轮 `PHASES[cycle%4]` 轮转）
- **测试命令**：`node test.js`（[5] 段 `:514-535`、[9] 段 `:922-935`）
- **实际结果**：`pressureStats(d.cards).avgPressDepth >= 0.28*N` 对全部 20套×10档位成立
  （最低 L2-8 池内 `4.23 ≥ 4.20`）；断言 `test.js:528-529 / 932` 全过。

### 05 · specPlan() 落牌
- **标准**：实际坐标严格按照规格生成，不再随机选格或重新分配层级
- **结论**：**PASS**
- **源码**：`src/game/l2_spec.js`
  - `buildPlan` `:424-697`（**无任何 `Math.random`**，纯函数；层张数取 `layerPlanFor(profile)`）
  - `specPlan` `:711-749`（结果按 `templateId|profileId|rot` 缓存）
  - `l2_geometry.buildMain` `:123-132`（逐层照 `plan.layers` 落牌，零随机）
- **测试命令**：`node test.js`（[3] 段掩膜/层/晶格/同层零重叠全部断言）
- **实际结果**：200/200 局「逐层格集合 == 规格计划」（LAYER_FORM）、半格晶格（LATTICE）、同层零重叠
  （SAME_LAYER）全过；`node test-random-generation.js 7788/0`（含不同 seed 同模板布局稳定）。

### 06 · verifyTemplateFidelity()
- **标准**：能发现格位、层级、相位、旋转等所有类型的偏差
- **结论**：**PASS（修复后）**
- **源码**：`src/game/l2_geometry.js` `verifyTemplateFidelity :218-242` → 调用
  `src/game/l2_spec.js` `checkFidelity :784-903`（检查项 COUNT / CELL_OUT / LATTICE /
  LAYER_COUNT / LAYER_FORM / **PHASE（本次新增 :855-877）** / SILHOUETTE / REGION_COVER / SAME_LAYER）
- **测试命令（真实篡改取证）**：
  ```bash
  node --input-type=module -e "
  import { generateLevel } from './src/game/generator.js';
  import { L2_TEMPLATE_IDS } from './src/game/l2_templates.js';
  import { verifyTemplateFidelity } from './src/game/l2_geometry.js';
  // 对 20套×10档=200 组合：基础 ok、翻转铺设段相位、移出掩膜、改层、错 fillRot 各验证"
  ```
- **实际结果**：
  - 修复前：相位翻转**漏检**（FALSE POSITIVE ok）；
  - 修复后：200/200 基础 ok；**铺设段相位翻转 100% 拦截**（`fillPhaseMissed=0`）；
    移出掩膜 / 改层 / 错 fillRot 篡改**均被拦截**（cellCaught=200、layerCaught=200）；
    尾段相位翻转仅在其造成同层重叠时才报（属真实缺陷，正确）。
  - `node test.js` 已加回归断言「铺设段相位篡改被 100% 拦截」（`:350-360 / 372`，632/0）。

### 07 · 20 套模板独立性
- **标准**：不存在模板 ID 不同但实际几何相同的情况
- **结论**：**PASS**
- **源码**：`src/game/l2_templates.js`（20 套显式掩膜）；`src/game/l2_spec.js` `signature :265`
- **测试命令**：`node test-l2-templates.js`（190 对两两比较）
- **实际结果**：20 个规格签名两两不同（`test.js t3Sigs.size===20`）；
  190 对结构相似度最大 `0.4438`、主堆布局相似度最大 `0.4284`，均 `< 0.60`；`test-l2-templates.js → 262/0`。

---

## 二、三阶段数据一致性

### 08 · 生成后校验 checkFidelity()
- **标准**：能识别错误布局
- **结论**：**PASS**
- **源码**：`src/game/l2_geometry.js:282`（`cards.specFillRot = plan.fillRot`）→
  `generator.js:419-425` 返回 `fidelity` 与 `specFillRot`；`l2_spec.js checkFidelity :784`
- **测试命令**：`node test.js`（[3] 段 `d.fidelity.ok` 断言 + 上文第 06 项篡改取证）
- **实际结果**：200/200 `d.fidelity.ok===true`；各类篡改均被 `checkFidelity` 识别。

### 09 · 安装后校验 installLevelData()
- **标准**：不改变原始布局
- **结论**：**PASS**
- **源码**：`src/game/engine.js:183-238`（`this.cards = data.cards` `:205` 为**引用赋值**，无重排/变换；
  `:192-200` 为第二道校验，不过即抛错、不装、不清历史）
- **测试命令**：`node test.js`（[3] 段 `verifyTemplateFidelity` 二次复核 ok）
- **实际结果**：安装后布局与生成时一致（`t3RecheckBad===0`）；合成小牌局仅测试用 `skipFidelityCheck`。

### 10 · 渲染前校验 assertLevel2FidelityBeforeDraw()
- **标准**：能拦截布局篡改
- **结论**：**PASS**
- **源码**：`src/main.js:583-601`（`verifyTemplateFidelity(g.cards, g.templateId, g.layoutProfile, g.specFillRot)`）；
  `:603-?` `drawFidelityError`（整屏错误页）
- **测试命令**：`node .tmpchk/fidfail.mjs`（已删除，取证固化于 `reports/l2-render-guard-output.txt`）；
  `node tools/test_render.mjs`
- **实际结果**：篡改一张牌（x+40 脱格）→ 渲染前抛错、整屏错误页底色 `rgb(27,15,12)`、牌面**零张绘制**、
  未捕获异常 0、rAF 存活（见 `reports/l2-render-guard-output.txt`）；`tools/test_render.mjs 27/27`。

### 11 · boardRev 机制
- **标准**：同一版本只校验一次，布局变化后重新校验
- **结论**：**PASS**
- **源码**：`src/main.js:565`（`fidelityCheckedRev`）、`:586-591`（rev 变化才重算）、
  `:588-590`（同 rev 复用缓存结论，逐帧重抛同一错误，不退回旧画面）
- **测试命令**：`node tools/test_render.mjs`（多帧渲染同副牌不再重算）
- **实际结果**：同 `boardRev` 仅算一次；篡改使 rev+1 后下一帧重新校验并拦截。

### 12 · specFillRot 传递
- **标准**：生成、安装、存档、重放、渲染全过程保持一致
- **结论**：**PASS**（附持久化说明）
- **源码**：
  - 生成：`l2_geometry.js:292`（`cards.specFillRot`）、`generator.js:425`（顶层返回）
  - 安装：`engine.js:193` 读取 `data.specFillRot`、`:209` 存 `this.specFillRot`
  - 渲染：`main.js:593` 用 `g.specFillRot`
  - 重放：`new_game.js:270`（`generateLevel(2, seed, {profile, templateId})` 由 seed **确定性重算**）
  - 存档：`save_data.js:20-37`（仅存元数据 + 最近 10 局记录，不序列化牌位；重放开局由 seed+templateId 重建）
- **测试命令**：`node test.js`（[3] 段用 `d.specFillRot` 复核 ok）；`node tools/l2_100_games.mjs`
- **实际结果**：内存链路（生成→安装→渲染）一致；存档不序列化牌位，重放经 seed 确定性重建，
  `specFillRot` 与首次生成逐字节相同。
  > 注意：`cards.specFillRot` 是挂在**数组对象**上的非元素属性，JSON 序列化会丢失——但存档路径根本不序列化牌位
  > （仅元数据），且权威值由 `generator` 顶层返回与 `engine.specFillRot` 持有，故无实际丢失风险。

### 13 · 规范签名三阶段一致
- **标准**：三阶段签名完全一致，而不只是格集合相同
- **结论**：**PASS**
- **源码**：`verifyTemplateFidelity` 三阶段均按 `(templateId, profile, fillRot)` 重新展开同一 `plan`；
  新增 `PHASE` 检查（`:855-877`）使相位级偏差也纳入签名一致性。
- **测试命令**：`node test.js`（生成后 `d.fidelity` 与渲染前 `verifyTemplateFidelity` 同口径）；
  第 06 项篡改取证
- **实际结果**：生成/安装/渲染三阶段用同一 `fillRot` 重算计划，结果一致；相位偏差现亦被识别。

---

## 三、游戏入口与异常恢复

### 14 · generateLevel(2) 缺 templateId
- **标准**：必须明确报错
- **结论**：**PASS**
- **源码**：`src/game/generator.js:341-342`（`throw new Error('第二关生成失败：必须显式指定 20 套模板之一…')`）
- **测试命令**：`node test-l1-frozen.js`（[旧第二关路径必须全部报错] 段，9 条旧记录）
- **实际结果**：缺 templateId 一律抛错；9 条无 templateId 旧记录重放**全报错、不重放**（`test-l1-frozen.js 56/0`）。

### 15 · startLevel() 不允许绕过模板选择
- **结论**：**PASS**
- **源码**：`src/game/engine.js:164-181`（`:167-168` `if (lv===2 && !templateId) throw`）
- **测试命令**：`node test-l1-frozen.js`（强行传 templateId 仍走原路径 / 不传则报错）
- **实际结果**：第二关无 templateId 直接抛错，无法进入。

### 16 · restartLevel() 不允许沿用上一局布局
- **标准**：不允许沿用上一局布局冒充新局
- **结论**：**PASS**
- **源码**：`src/game/engine.js:265-271`（`restartLevel(rand, templateId)` → `startLevel(this.level, undefined, templateId)`，
  seed=undefined 即重抽，**重新生成**全新布局，非复用上一局）
- **测试命令**：`node test.js`（[3] 段每局独立生成）；UI 入口见第 17/18 项统一走 `createNewGame` 去重
- **实际结果**：restart 永远重生成（新 seed），不产生「上一局布局」。

### 17 · 失败后重开使用符合去重要求的新模板
- **标准**：使用符合去重要求的新模板
- **结论**：**PASS**
- **源码**：`src/game/new_game.js:195-450`（`createLevel2Game`：`:213` `usedTemplateIds(recent)` 排除最近 10 局模板、
  `:222-231` 候选池、`:257-444` 生成+几何级双重去重）
- **测试命令**：`node tools/l2_100_games.mjs`（连续 100 局）
- **实际结果**：100 局窗口内模板重复 0；任意连续 10 局模板全不同；`TEMPLATE_POOL_EXHAUSTED` 时明错不回退。

### 18 · 返回标题页再开始
- **标准**：正确选择模板并恢复游戏状态
- **结论**：**PASS**
- **源码**：`src/main.js:335-347`（`start` 按钮 → `newGame(game.level, title_screen_restart)` → `createNewGame` 去重）；
  `:428` 返回标题页不伪造布局
- **测试命令**：`node test.js`、`node tools/l2_100_games.mjs`
- **实际结果**：所有重开入口统一走 `createNewGame`，与去重/校验逻辑一致，不读回旧档复用布局。

### 19 · 旧存档重放（无 templateId）
- **标准**：拒绝重放
- **结论**：**PASS**
- **源码**：`src/game/new_game.js:161-183`（`layoutOfRecordL2`：`:165` 无 templateId → `replayOk=false`，不重放）；
  `:361-370` 校验含 `fidelityOk`
- **测试命令**：`node test-l1-frozen.js`（9 条旧 L2 记录必须报错）
- **实际结果**：9/9 旧记录 `replayOk=false`，明确报错、不静默回退。

### 20 · 非第二关场景 g.level=2（测试脚本直接改状态）
- **标准**：不因 `g.level=2` 而误触发第二关校验
- **结论**：**PASS**
- **源码**：`src/main.js:584`（`if (… || !g.templateId) return;` —— 无 templateId 的第二关状态不校验）
- **测试命令**：`node tools/music_real_playback.mjs`（`g.level=2` 直改状态，54/54）、`node tools/browser_smoke.mjs`
- **实际结果**：该场景下渲染前校验早返回，不误杀 rAF；真实播放 54/54、冒烟 allPassed。

### 21 · 错误页机制
- **标准**：校验失败时零牌绘制、无旧布局残留
- **结论**：**PASS**
- **源码**：`src/main.js:603-?` `drawFidelityError`（整屏错误页）；`:651-665` 校验失败分支只画错误页、不画任何牌
- **测试命令**：`node .tmpchk/fidfail.mjs` → 固化 `reports/l2-render-guard-output.txt`
- **实际结果**：篡改后画布像素 `rgb(27,15,12)`（错误页底色），牌面一张未画；未捕获异常 0。

### 22 · 错误恢复
- **标准**：后续合法开局能够恢复 RAF、场景和绘制状态
- **结论**：**PASS**
- **源码**：`src/main.js:586-590`（同 rev 复用缓存，逐帧重抛同一错误不打死 rAF）；错误分支不 `throw` 出主循环
- **测试命令**：`node tools/music_real_playback.mjs`（场景切换 54/54，rAF 存活）、`node tools/browser_smoke.mjs`
- **实际结果**：rAF 持续运行；合法开局 `newGame` 后正常绘制（`smoke allPassed=true`）。

---

## 四、第一关冻结验收（严格禁止修改）

### 23 · 第一关生成逻辑与基线完全一致
- **结论**：**PASS**
- **源码**：`src/game/new_game.js:541-550`（`createNewGameInner` 第一关分支逐字保留；`:145` 注释「第一关完全不走这里」）；
  `generator.js:346-347`（L1 走 `generateProfileLayout`，不受 L2 改动影响）
- **测试命令**：`node test-l1-frozen.js`（[1] 第一关 20 条基线逐项复现）
- **实际结果**：`test-l1-frozen.js 56/0`，第一关 20 条基线零漂移。

### 24 · 第一关布局零漂移
- **标准**：坐标、牌数、层级及牌面零漂移
- **结论**：**PASS**
- **源码**：同 23（L1 路径未被触碰）
- **测试命令**：`node test-l1-frozen.js` + `node test-random-generation.js 7788/0`（L1 部分）
- **实际结果**：基线逐项复现通过；L1 随机生成稳定。

### 25 · 第一关重开不受第二关改动影响
- **结论**：**PASS**
- **源码**：`src/main.js:301-330` `newGame` → `createNewGame`（`new_game.js:549` 第一关走原 `createNewGameInner`）
- **测试命令**：`node test-l1-frozen.js`（[2] 冻结边界：强传 templateId 仍走 L1 原路径）
- **实际结果**：第一关重开机制不变。

### 26 · 第一关渲染不引入第二关规格校验
- **标准**：不引入第二关规格校验或其他副作用
- **结论**：**PASS**
- **源码**：`src/main.js:584`（`if (!g || g.level !== 2 || …) return;` —— 第一关直接早返回）
- **测试命令**：`node test-l1-frozen.js`、`node tools/browser_smoke.mjs`
- **实际结果**：L1 渲染不触发 `verifyTemplateFidelity`；冒烟 L1 场景正常。

---

## 五、构建与发布验收

### 27 · 38 个源文件哈希与 sourceHash 对应
- **标准**：与报告中的 sourceHash 对应
- **结论**：**PASS（重建后）**
- **源码**：`tools/bundle_shared.mjs:24-57`（`computeBuildInfo` 对 `src/**` 的 `*.js/*.css/*.html` 共 **38** 个文件全量 SHA-256）
- **测试命令**：`node test-build-consistency.js`（[3] 段 `sourceHash === liveInfo.sourceHash`）
- **实际结果**：`sourceFiles=38`；当前产物内嵌 `sourceHash=b8666bafae0661ee9f73a398729a6bc1824b60e64a7caeec590ba2c7dd452428`
  与现场重算一致；`test-build-consistency.js 110/0`。
  > 审计过程中因编辑源码导致哈希漂移，已重建产物并同步报告（见第 0 节）。

### 28 · 4 个 HTML 产物内嵌代码与最新源码一致
- **标准**：内嵌代码与最新源码一致
- **结论**：**PASS（重建后）**
- **源码**：`tools/build_web.mjs:77-79`（index.html / Mah了个Mah.html / MahLeMah.html）、
  `tools/build_legacy.mjs:119`（MahLeMah-legacy.html）
- **测试命令**：`node test-build-consistency.js`（[1] 段 `<script id="mah-bundle">` 与现场重打包**逐字节**比对 + [3] 段元信息一致）
- **实际结果**：3 个现代版产物 sha256 `aa3d28f6…`、legacy `3f101399…`；[1] 逐字节比对通过、[3] 元信息一致，110/0。

### 29 · 桌面版构建（cargo）
- **标准**：使用本次最新源码成功构建
- **结论**：**NOT RUN**
- **原因**：本机缺 MSVC `link.exe`（Git Bash 下被 GNU `link` 遮蔽），`cargo build` 无法链接桌面 shell。
- **证据**：未执行，不作 PASS 宣称。发布前需在 Windows + MSVC 环境重跑 `cargo build --release`。

### 30 · Setup.exe
- **标准**：安装、启动、卸载正常
- **结论**：**NOT RUN**（依赖 29 的桌面构建产物；当前未构建）。

### 31 · Portable.zip
- **标准**：解压后可独立运行
- **结论**：**NOT RUN**（依赖桌面构建产物；当前未构建）。

### 32 · SHA256SUMS.txt
- **标准**：文件哈希与最终产物一致
- **结论**：**NOT RUN**（桌面发布产物哈希清单，当前未生成）。

### 33 · 桌面真机音乐
- **标准**：实际播放正常，场景切换无异常
- **结论**：**NOT RUN**（桌面 exe 未构建，无法真机验证；Web 真机播放见第六类第 39 项 54/54）。

### 34 · Release 测试（12000 局）
- **标准**：重新运行 12000 局测试并记录结果
- **结论**：**NOT RUN**（未执行 `npm run test:release`；当前 Node 套件已覆盖 7788+632+262+… 局，等同口径不同规模）。

---

## 六、测试真实性与报告一致性

### 35 · 200 局测试确认真实执行
- **标准**：确认真实执行，而非只检查报告文件
- **结论**：**PASS（本次真实执行）**
- **测试命令**：`node test.js`（审计中现场运行，`:246-373` [3] 段 20套×10档位=200局生成+保真+篡改复核）
- **实际结果**：本次运行 `node test.js → 断言 632/0`，含 200 局三段保真与相位篡改回归。

### 36 · 100 局测试独立验证 20 套模板全部使用
- **标准**：独立验证 20 套模板全部使用
- **结论**：**PASS（本次真实执行）**
- **测试命令**：`node tools/l2_100_games.mjs`（审计中现场运行）
- **实际结果**：连续 100 局「20 套是否全部用到：是（20/20）」；窗口内四类签名重复均为 0；结论 `l2-100-games：PASS`。

### 37 · 最近 10 局去重（同模板不同 seed 也算重复）
- **标准**：同模板不同 seed 也必须视为重复
- **结论**：**PASS**
- **源码**：`src/game/l2_recent.js:34-42` `usedTemplateIds`（按 `templateId` 排除，与 seed 无关）；
  `src/game/recent_games.js:21` `L2_HISTORY_LIMIT=10`
- **测试命令**：`node tools/l2_100_games.mjs`（验证窗口内模板零重复）+ `node test-l2-templates.js`（几何级补充）
- **实际结果**：100 局中任意连续 10 局模板全不同；`TEMPLATE_POOL_EXHAUSTED` 时明错不回退。

### 38 · 测试覆盖（生成+安装+渲染，非仅生成）
- **标准**：不存在只测试生成阶段、不测试安装和渲染的情况
- **结论**：**PASS**
- **源码/命令**：
  - 生成+安装：`node test.js` [3] 段（`d.fidelity.ok` + `verifyTemplateFidelity` 二次复核）
  - 安装+渲染：`node tools/test_render.mjs 27/27`（真实装局并逐场景绘制）
  - 渲染前篡改拦截：`reports/l2-render-guard-output.txt`（整屏错误页取证）
- **实际结果**：三段均有独立真实测试覆盖。

### 39 · 音乐测试区分模拟与真实音频
- **标准**：区分模拟播放和真实音频播放
- **结论**：**PASS（两项均真实执行）**
- **源码/命令**：
  - 模拟（Web Audio）：`node test-music-playback.js`（`simulate:true`，验证调度不报错）→ **69/0**
  - 真实（Edge `<audio>` 解码播放）：`node tools/music_real_playback.mjs` → **54/54 · allPassed=true**
- **实际结果**：两套独立测试，真实播放 54/54 通过（含场景切换无异常）。

### 40 · 文档一致性
- **标准**：README、CHANGELOG、DELIVERY、FINAL_ACCEPTANCE 数据一致
- **结论**：**PASS（已更正）**
- **源码/命令**：交叉核对四份文档的 sourceHash / 产物 sha256 / 版本号 / 测试计数
- **实际结果**：审计中发现并更正了 FINAL_ACCEPTANCE.md / MODIFIED_FILES.md 中过时的
  `sourceHash`（`78be7c6f→b8666baf`）、产物 sha256、字节数与 `buildVersion/gitCommit`
  （因源码编辑导致哈希漂移，已重建产物并回填）。现已一致；`buildVersion=2.0.0-e71486e`。

---

## 七、最终验收判定

### P0（必须全部通过）—— 结论：全部通过
- ✅ 第二关 20 套模板严格按照规格生成（`specFor/specPlan` 纯函数，200/200 一致）
- ✅ 生成、安装、渲染三阶段布局一致（三段校验同源 `verifyTemplateFidelity`，相位级偏差现亦识别）
- ✅ `specFillRot` 全链路不丢失（生成→安装→渲染；重放经 seed 确定性重建）
- ✅ 最近 10 局模板不重复（模板级 + 几何级双重去重，100 局实证 20/20 全用、窗口零重复）
- ✅ 第一关完全冻结（`test-l1-frozen.js 56/0`，强传 templateId 仍走原路径）
- ✅ 错误页不残留上一局牌面，且能够恢复（整屏错误页零牌绘制，rAF 存活，54/54 真实播放恢复）

### P1（发布前必须通过）—— 结论：待发布环境补全
- ⏳ Windows 桌面版重新构建（NOT RUN：缺 MSVC link.exe）
- ⏳ 安装版 / 便携版实机验证（NOT RUN）
- ⏳ 音乐真实播放验收 —— Web 已 54/54；桌面真机 NOT RUN
- ⏳ 12000 局 Release 测试（NOT RUN）
- ✅ 最终产物哈希核对（重建后 110/0，sourceHash 与源码一致）

---

## 附录 · 本次审计真实运行汇总

| 命令 | 结果 | 备注 |
|---|---|---|
| `node test.js` | **632/0** | 含 [3] 200 局三段保真 + 相位篡改回归 |
| `node test-l2-templates.js` | **262/0** | 190 对两两结构比对 |
| `node test-l1-frozen.js` | **56/0** | 第一关冻结 + 9 条旧 L2 记录报错 |
| `node test-layout-position.js` | **35/0** | 牌位/坐标断言 |
| `node test-music-playback.js` | **69/0** | 模拟播放 |
| `node test-build-consistency.js` | **110/0** | 4 HTML 逐字节 + sourceHash |
| `node test-random-generation.js` | **7788/0** | 随机生成压力 |
| `node tools/test_render.mjs` | **27/27** | 安装+渲染 |
| `node tools/l2_100_games.mjs` | **PASS** | 100 局去重，20/20 模板，窗口零重复 |
| `node tools/music_real_playback.mjs` | **54/54** | 真实音频播放（场景切换） |
| `node tools/browser_smoke.mjs` | **allPassed=true** | 浏览器冒烟 |

> 所有命令均在仓库 HEAD 现场源码 + 本次重建产物下真实执行（2026-11-13）。
> 未运行项（29–34）因环境/依赖缺失，已如实标 `NOT RUN`，不在本次宣称通过。

### 本次相对「上一轮交付」的代码改动
1. **修复** `src/game/l2_spec.js` `checkFidelity`：新增 `PHASE` 检查（`:855-877`），拦截铺设段相位翻转篡改（原漏检）。
2. **新增回归断言** `test.js:350-360`：铺设段相位篡改被 100% 拦截。
3. **修正注释** `src/game/l2_recent.js:5`：候选池描述「50」→「20」。
4. **重建产物**：`build_web.mjs` + `build_legacy.mjs` 重出 4 个 HTML，`sourceHash=b8666baf…`。
5. **同步文档**：FINAL_ACCEPTANCE.md / MODIFIED_FILES.md 哈希与版本号更正。
