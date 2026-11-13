# MahLeMah · 最终验收报告（第二关规格驱动生成 + 三段几何校验）

**日期**：2026-11-13
**范围**：只修改第二关布局系统（模板 → 落牌的规格层、生成入口、校验链路）及其测试/文档；
**第一关完全冻结**，只做回归测试；不改变牌数配置、三消规则、交互与视觉风格、背景音乐与音效链路。
**流程**：先审计 → 再修改 → 再测试 → 再构建 → 最后验收。
**本版说明**：本版**取代**同日两版更早实现——「50 套参数化结构模板」与「20 套掩膜 + 逐张打分落牌」。
20 套模板与掩膜不变，**变的是「掩膜 → 真实牌位」这一段**：把「每层占哪些格、落在格的哪个
四分之一」抽成与 seed 无关的显式规格（`MAH-L2-SPEC-v2`），生成 / 安装 / 渲染三段拿同一份
规格逐格比对，不一致就明确报错；旧的第二关默认生成路径已删除。

---

## 0. 结论（先说不满足的部分）

**已真实通过**：

- 20 套缩略图 ↔ 实际牌局**逐格一一对应**：20 套 × 10 档位 = **200 局**全部通过三段保真校验，
  生成抛错 0 / 保真失败 0 / 悬空 0 / 开局可点全部 19–25 / 掩膜 27–40 格；
- 旧 50 套模板与旧布局生成逻辑**彻底退出第二关**：`generateLevel(2)` 缺 `templateId` 直接抛错，
  9 条历史旧记录全部明确报错且不重放（`test-l1-frozen.js [3]`）；
- 最近 10 局零重复：连续 100 局实测（`tools/l2_100_games.mjs`，本次重新生成）
  生成失败 0、最大重试 1、任意连续 10 局窗口模板全不同 PASS、
  窗口内结构 sim 最大 **0.5460** / 布局 sim 最大 **0.5130**（阈值 0.60）；
- 第一关 20 条修改前基线逐项零漂移（`test-l1-frozen.js` **56/0**）；
- 全部测试 EXIT=0：`test.js` **631/0**、`test-random-generation.js` **7788/0**、
  `test-l2-templates.js` **262/0**、`test-layout-position.js` **35/0**、
  `test-music-playback.js` **69/0**、`test-build-consistency.js` **110/0**、
  `tools/test_render.mjs` 27/27、`tools/browser_smoke.mjs` `allPassed=true`、
  `tools/music_real_playback.mjs` **54/54**。

**未通过 / 未运行（不标记为通过）**：

1. **Rust `cargo check` / `cargo build`：未运行成功**。Git Bash 下 GNU `link` 遮蔽 MSVC `link.exe`；
   PowerShell 下明确 `linker link.exe not found`（本机未装 VS C++ 链接器）。这是**环境限制**，
   不是源码编译错误；Rust 侧只完成源码静态一致性断言（`test.js [8b]`、`test-build-consistency.js`）。
2. **桌面版 exe / Windows 安装版 / Portable zip / Setup.exe / SHA256SUMS.txt 未用本版源码重建**，
   仍是旧冻结产物；桌面版真机音乐播放**未运行**。
3. 本版未重跑 `npm run test:release`（12000 局发布压力测试）。
4. 原版《羊了个羊》内部布局数据无法获取；20 个形状按需求文字描述实现，不声称复刻原版算法，
   不含任何从原版导出的坐标数据。

---

## 1. 交付项逐条对照

| # | 需求条目 | 位置 / 证据 | 判定 |
|---|---|---|---|
| 1 | 旧 50 套模板与旧布局生成逻辑彻底废弃 | `l2_templates.js` 只剩 20 套；`generator.js` 第二关 `!opt.templateId` 直接抛错；`engine.startLevel/restartLevel` 同；`new_game.js` 无 `templateId` 的旧记录 `replayOk=false` 不重放 | ✓ |
| 2 | 以 20 套缩略图为**唯一**几何设计标准 | `tools/l2_thumbnails.mjs` 由真实牌局画俯视图；生成侧 `l2_spec.js` 的规格由同一份掩膜展开，二者共用一份数据 | ✓ |
| 3 | 严格按缩略图的轮廓 / 区域 / 比例 / 方向 / 间距 / 层级 / 遮挡生成 | `specPlan()` 直接给出每层占哪些格（不是打分近似）；200 局逐格比对零差异 | ✓ |
| 4 | 缩略图与实际布局一一对应，不得自行重设计 / 简化 / 变形 | `checkFidelity` 逐格比对（晶格 / 层形状 / 区域 / 张数 / 同层重叠 / 可点 / 悬空 / 边界） | ✓ |
| 5 | 20 套全部接入正式生成入口，删除旧模板映射与旧分支 | `L2_TEMPLATE_IDS` → `createLevel2Game()` → `generateLevel(2, seed, {templateId})`；无任何旧分支可达 | ✓ |
| 6 | 每局从 20 套选，最近 10 局绝对不重复，跨重启保持 | `l2_recent.js` 模板级 + 几何级双重去重、`L2_HISTORY_LIMIT=10`、存档 15 字段白名单 | ✓ |
| 7 | **生成后**校验实际几何结构 | `buildCandidate` → `checkFidelity()`；不过不验收（`reports/FINAL_test.txt [3]`） | ✓ |
| 8 | **安装后**校验实际几何结构 | `engine.installLevelData()` → `verifyTemplateFidelity()`（重新展开计划逐格比对） | ✓ |
| 9 | **渲染前**校验实际几何结构 | `main.js` `assertLevel2FidelityBeforeDraw()`（按 `boardRev` 缓存） | ✓ |
| 10 | 生成失败必须明确报错，禁止保留上一局布局冒充新布局 | 生成/安装抛错中断；渲染前失败画**整屏错误页**（零牌绘制）；旧记录不重放 | ✓ |
| 11 | 保持现有牌数 / 规则 / 交互 / 视觉风格不变 | 牌数仍取档位（192–321）、`config.js` 与 `tiles.js` 未改、`test.js` 关注项全绿 | ✓ |
| 12 | 第一关完全冻结 | `reports/L1_FROZEN_BASELINE.json` 20 条基线零漂移；`test-l1-frozen.js` 56/0 | ✓ |
| 13 | 连续 100 局任意最近 10 局不重复 | `reports/l2-100-games.txt`（本次重新生成，问题 0 条） | ✓ |
| 14 | 只改第二关布局系统，不做无关重构 | `reports/MODIFIED_FILES.md`；`layout.js` / `tiles.js` / `robots.js` / `audio.js` 未动 | ✓ |

---

## 2. 20 套模板 = 20 份显式轮廓掩膜（模板定义未变）

每套模板定义为一组 `DEFS` 条目，核心是 `mask`：**5 行 × 9 列 ASCII 轮廓**
（`#` 可落牌 / `@` 高密度 / `.` 禁止落牌）。`parseMask()` 展开格位集合，
`labelRegions()` 做 4 邻域连通分量得到区域标签（R1 / R2 / …），
**区域结构由掩膜直接决定**：双核心 = 2 分量、三岛屿 = 3 分量、四角围合 = 4 分量。

| # | templateId | 名称 | 形状族 | 掩膜可落牌格 | 掩膜区域数 | 掩膜（`#` 可落牌 / `.` 禁止） |
|---|---|---|---|---|---|---|
| 1 | `L2-P01` | 中心金字塔 | 核心聚拢型 | 33 | 1 | `...###... / ..#####.. / .#######. / ######### / #########` |
| 2 | `L2-P02` | 双核心 | 核心聚拢型 | 40 | 2 | `####.#### / ####.#### / ####.#### / ####.#### / ####.####` |
| 3 | `L2-P03` | 三岛屿 | 多岛分离型 | 30 | 3 | `##.##.##. / ##.##.##. / ##.##.##. / ##.##.##. / ##.##.##.` |
| 4 | `L2-P04` | 环形围绕 | 围合环抱型 | 30 | 1 | `######### / ##.....## / ##.....## / ##.....## / #########` |
| 5 | `L2-P05` | 十字交叉 | 围合环抱型 | 33 | 1 | `...###... / ######### / ######### / ######### / ...###...` |
| 6 | `L2-P06` | 阶梯上升 | 单向偏置型 | 27 | 1 | `....####. / ..######. / .######## / #####.... / ####.....` |
| 7 | `L2-P07` | 阶梯下降 | 单向偏置型 | 27 | 1 | `.####.... / .######.. / ########. / ....##### / .....####` |
| 8 | `L2-P08` | 左侧巨塔 | 单向偏置型 | 32 | 1 | `####..... / ######... / #######.. / ######### / ######...` |
| 9 | `L2-P09` | 右侧巨塔 | 单向偏置型 | 32 | 1 | `.....#### / ...###### / ..####### / ######### / ...######` |
| 10 | `L2-P10` | 上下双层岛 | 多岛分离型 | 36 | 2 | `######### / ######### / ......... / ######### / #########` |
| 11 | `L2-P11` | 蝴蝶形 | 围合环抱型 | 28 | 2 | `##.....## / ###...### / ####.#### / ###...### / ##.....##` |
| 12 | `L2-P12` | 沙漏形 | 围合环抱型 | 39 | 1 | `######### / ######### / ...###... / ######### / #########` |
| 13 | `L2-P13` | 迷宫形 | 格网迷宫型 | 29 | 1 | `######### / ........# / ######### / #........ / #########` |
| 14 | `L2-P14` | 棋盘形 | 格网迷宫型 | 30 | 2 | `###..###. / ###..###. / ###..###. / .###..### / .###..###` |
| 15 | `L2-P15` | 弧形月牙 | 起伏异形型 | 31 | 1 | `..#####.. / .#######. / ####..### / ###....## / ####..###` |
| 16 | `L2-P16` | 波浪形 | 起伏异形型 | 35 | 1 | `######### / ###...### / ..#####.. / ###...### / #########` |
| 17 | `L2-P17` | 对角双塔 | 多岛分离型 | 27 | 1 | `######... / ######... / ...###... / ...###### / ...######` |
| 18 | `L2-P18` | 四角围合 | 多岛分离型 | 32 | 4 | `####.#### / ####.#### / ......... / ####.#### / ####.####` |
| 19 | `L2-P19` | 中心十字岛 | 围合环抱型 | 29 | 1 | `..#####.. / ..#####.. / ######### / ..#####.. / ..#####..` |
| 20 | `L2-P20` | 不规则大陆形 | 不规则大陆型 | 37 | 1 | `.#######. / ####.#### / .######## / ###..#### / .#######.` |

> 掩膜区域数 1 不等于「没有区域差异」：环形环绕、沙漏、迷宫、月牙是**单连通但轮廓凹陷**，
> 差异体现在内缩与外扩；双核心 / 上下双层岛 / 蝴蝶 / 三岛屿 / 四角围合是**多连通分离**，
> 差异体现在牌岛个数与位置。两类都由掩膜真实决定，不是换 seed。
> 模板里的 `growth` / `layerShape` / `curve` / `offsets` / `density` 自本版起只作**形状说明性元数据**，
> 落牌不再读取它们——落哪一格完全由下面的规格层决定。

### 2.1 规格层：每层占哪些格（`src/game/l2_spec.js`，`MAH-L2-SPEC-v2`）

上一版是「逐张打分挑格」（形状分 + 生长轨迹 + 层号扰动），同一模板换个 seed 就能长成另一个
轮廓，缩略图只在「大致形状」上相符。本版把这一步变成**确定性展开**：

1. **掩膜 → 邻接图**：4 邻域构造 `adj` / `nbr`；连通分量给区域标签。
2. **多源 BFS 走位序** `walk`：`multiSeeds()` 用最远点采样选起点（最多 5 个、半径 10）。
   单起点 BFS 在长走廊（L2-P13 蛇形直径 28 步、档位只有 15 层）会铺不满，
   多起点把最长走廊压到 5 步内，是 20 套 × 10 档位 200 局零失败的前提之一。
3. **逐格相位 + 半格错位极性**：上层压住某格**左侧**子格 → 下层同格必须 `px=0`；
   压**右侧** → `px=1`；上下同理 `py`。极性位编码 `bit0=px0 / bit1=px1 / bit2=py0 / bit3=py1`，
   用 `needMask(spec,key,used)` 与 `phaseBits(ph)` 的点积 `popcount` 打分。
4. **极性紧急度** `polarityUrgency()`：叶子格（度数 1）的落牌相位被唯一邻格唯一决定，
   必须最先满足（权重 100 / 10 / 1），否则会出现「最后一格怎么摆都冲突」。
5. **尾段走位窗口** `tailBlocksFor(layerCount)`：≤16 层切 2 块、否则 3 块，
   块间隔 `hop = blocks===2 ? size/4 : size/2`，相位按轮次 `PHASES[cycle % 4]` 轮转，
   把压深抬过门槛（最低档 L2-8 实测 ≥ **4.23**，门槛 `0.28 × 15 = 4.20`）。
6. **`specPlan(spec, profile, { fillRot, tailPhase })`**：输出每层格集合与实际落点。
   `fillRot` 参与计划展开——所以它必须**跟着牌局走**（`cards.specFillRot`），
   否则复核时按默认 rot 重新展开会得到「格集合同、每层分配不同」的计划，误判 `LAYER_FORM`。

全局 9×5 整格网：`x = 33 + c*66 + px*33`、`y = 220 + r*88 + py*44`
（`TILE_W=66 / TILE_H=88 / LATTICE_X=33 / LATTICE_Y=44`，半格晶格 `x%33=0 / y%44=0`）；
`BOARD_BAND = { top:196, bottom:918, left:20, right:700 }`；44 张盲盒队列（4 条链）不变。

### 2.2 三段校验（生成后 / 安装后 / 渲染前）

| 段 | 入口 | 实现 | 失败表现 |
|---|---|---|---|
| 生成后 | `buildCandidate()` 验收 | `checkFidelity(cards, spec, plan, profile)`：晶格 / 层形状 / 区域 / 张数 / 同层零重叠 / 可点 19–25 / 零悬空 / 牌桌边界 | 候选不验收；全部候选失败 → `generateTemplateLayout` 抛错并带「可点 N / 悬空 M」诊断 |
| 安装后 | `engine.installLevelData()` | `verifyTemplateFidelity(cards, templateId, profile, fillRot)`：从 templateId + 档位**重新展开**计划再逐格比对（不复用生成时缓存） | 抛 `第二关布局安装失败：与模板 X 的缩略图不一致（…）`，不装进牌桌 |
| 渲染前 | `main.js` `assertLevel2FidelityBeforeDraw()` | 同一实现，按 `boardRev` 只算一次 | 画整屏红色错误页（模板 ID + 违规项），**一张牌都不画**；控制台只报一次；rAF 不被打死 |

渲染前校验的独立取证见 `reports/l2-render-guard-output.txt`（Edge headless + CDP）：
`startLevel(2, …, 'L2-P05')` 正常画牌（画布像素 `rgb(237,226,209)`）→ 把一张牌 `x` 挪 +40、
`boardRev+1` → 画布变成错误页底色 `rgb(27,15,12)`、零牌绘制、未捕获异常 **0**、rAF 仍存活，
控制台一次报错：`LATTICE:1 张牌不在半格晶格上 / LAYER_FORM:1 层与规格不一致（4,1 vs 4,0）`。

### 2.3 真实差异指标

| 项 | 实测 |
|---|---|
| 模板 ID / 掩膜 / 结构签名 / 等价几何签名 / 规格签名 唯一数 | 20 / 20 / 20 / 20 / 20 |
| 20 套 × 3 组 (档位, seed) = 60 局真实生成 | 全部 `validateLevel.ok=true`、可点 19–25、零悬空、真实安装成功 |
| 190 对两两结构相似度 | 最大 **0.4438**，≥0.60 共 **0 对** |
| 190 对两两主堆布局相似度 | 最大 **0.4284**，≥0.60 共 **0 对** |
| 各层牌数分布 / 区域结构分布 / 逐层占位格轮廓 | **1 种**（层数由档位唯一决定，这是本版的要求）/ 4 种 / **20/20 种** |
| 主堆包围盒 | 3 种（561×484 / 594×484 / 627×484）—— 区分度低，因此用**逐层占位格轮廓**做主要度量 |

> 「各层牌数分布只有 1 种」不是退化：本版每层占哪些格由档位层数唯一决定，同一档位下 20 套模板
> 的层张数序列本来就该一致，差异全部体现在**每层占的是哪些格**（20/20 种轮廓）与区域结构上。
> 上一版的「18 种层分布」来自逐张打分带来的随机层张数，与本版口径不同。

---

## 3. 最近 10 局双重去重与历史持久化

- **独立窗口**：L1 冻结 3 局（`HISTORY_LIMIT = 3`），L2 独立 10 局（`L2_HISTORY_LIMIT = 10`），
  `historyLimitFor(level)` 是唯一取值入口，两关互不读取。
- **每局几何签名**（`l2_structure.js`）：坐标 / 层级 / 区域 / 层牌数与质心 / 层包围盒 /
  层轮廓占位格 / 整体轮廓 / 遮挡关系 / 可操作区；`canonicalGeometrySignature` 额外做
  平移 + 左右镜像归一化，用于识别「不同模板生成的等价结构」。
- **双重去重**：① 模板级排除最近 10 局用过的 `templateId`（候选池 = 20 − 已用）；
  ② 几何级拒绝任一签名相同，并要求与最近 10 局**重放出的真实牌面**的主堆结构 / 布局相似度都 < 0.60。
- **失败路径**：重复即重试（上限 50 次）；候选池为空抛
  `GenerationFailureError(reason='TEMPLATE_POOL_EXHAUSTED')`；50 次不合格抛
  `MAX_ATTEMPTS_EXCEEDED` 并附逐次失败原因。不清空历史、不改 seed、不微调坐标、不退回重复布局。
- **持久化**：记录含 3 个可选字段 `templateId` / `structureSignature` / `canonicalGeometrySignature`；
  Rust 侧同步 `RECORD_FIELDS[15]`（12 必填 + 3 可选）与 `HISTORY_LIMIT_L1=3 / L2=10`。
- **旧记录不再重放**：`layoutOfRecordL2()` 对无 `templateId` 的记录返回 `replayOk=false`，
  校验里 `fidelityOk` 缺失同样判失败并记 `NO_FIDELITY`——**不静默回退到旧生成器**。

**覆盖的重开入口**：游戏内 `new_game`、失败重开 `failure_restart`、标题页重开
`title_screen_restart`、刷新网页 / 退出重进 `application_restart`（存档 JSON 序列化再读回）。

---

## 4. 连续 100 局实测（`reports/l2-100-games.txt`，本次重新生成）

```
第二关连续 100 局 · 最近 10 局双重去重（最终代码实测 · tools/l2_100_games.mjs）
生成失败=0 最大重试=1 累计尝试=104 最终历史长度=10 用时ms≈3.9s
窗口内重复：template=0 canonical=0 structure=0 geometry=0（逐局独立复核）
窗口内最大相似度：结构=0.5460 布局=0.5130（阈值 0.60）
任意连续 10 局模板全不同：PASS
可点范围=19-25
20 套是否全部用到：是（20/20）
独立复核问题数=0
```

20 套模板在 100 局里全部被用到（最少 3 次、最多 7 次），没有出现「少数模板垄断」。

---

## 5. 第一关冻结回归

审计阶段（修改前）保存 `reports/L1_FROZEN_BASELINE.json`：20 条 L1 基线（4 档位 × 5 seed）
+ 9 条「不带 templateId 的第二关默认路径」基线。

`node test-l1-frozen.js` → **56/0 / EXIT=0**：

- 20 条 L1 基线六个字段（牌数 / 可点 / 层数 / `geometrySignature` / 全序 SHA-256 / validate）**全部零漂移**；
- 给第一关强行传 `templateId='L2-P01'`，返回数据不含 `templateId` 且结果仍与基线一致；
- **9 条旧第二关记录（不带 `templateId`）现在必须全部明确报错**——本版把「旧默认路径」
  当作已删除能力来断言：`generateLevel(2)` 缺 templateId 必抛错、`installLevelData` 缺
  模板信息必失败、`layoutOfRecordL2` 不重放。这与上一版的「9 条基线零漂移」是**相反**的口径，
  因为旧路径已按要求删除，不可能再保持不变；
- `createNewGame(level=1)` 连续 5 局维持 `historyLimit=3`、`tileCountCheck='PASS'`、记录不含模板字段；
- `config.js` / `engine.js` / `render.js` / `layout_signature.js` / `tiles.js` / `seed_pool.js`
  均不引用第二关模板选择逻辑（只允许 `engine.js` 引入保真校验函数）。

第一关居中与音乐链路同步回归：`test-layout-position.js` **35/0**（重心比例 0.520776 在
×0.5–×3 各缩放下不变）、`test-music-playback.js` **69/0**、真机播放 **54/54**。

---

## 6. 自动化测试（最终源码上真实运行，全部 EXIT=0）

| 命令 | 结果 | 原始输出 |
|---|---|---|
| `node test.js` | **631 / 0** | `reports/FINAL_test.txt` |
| `node test-random-generation.js` | **7788 / 0** | `reports/FINAL_test-random-generation.txt` |
| `node test-l2-templates.js` | **262 / 0** | `reports/FINAL_test-l2-templates.txt` |
| `node test-l1-frozen.js` | **56 / 0** | `reports/FINAL_test-l1-frozen.txt` |
| `node test-layout-position.js` | **35 / 0** | `reports/FINAL_test-layout-position.txt` |
| `node test-music-playback.js` | **69 / 0** | `reports/FINAL_test-music-playback.txt` |
| `node test-build-consistency.js` | **110 / 0** | `reports/FINAL_test-build-consistency.txt` |
| `node tools/test_render.mjs` | 27/27 场景 | `reports/FINAL_render.txt` |
| `node tools/browser_smoke.mjs` | `allPassed=true`（两页各 4 局 L1 + 4 局 L2） | `reports/FINAL_browser_smoke.txt` |
| `node tools/music_real_playback.mjs` | **54/54**（网页 / 独立 HTML / ES5 legacy 真机播放） | `reports/FINAL_music_real_playback.txt` |
| `node tools/l2_100_games.mjs` | 问题 **0** 条 · PASS | `reports/l2-100-games.txt` |

关键数值（`reports/FINAL_test.txt`）：

- `[3]` 20 套 × 10 档位 = **200 局全通过** · 掩膜 27–40 格 · 可点 19–25；
- `[9]` L2 分档生成 20 次平均 **8.50 ms/局**（阈值 400ms）；
- `[10]` 压深最低档 `L2-8` 实测 ≥ **4.23**（门槛 0.28 × 15 = 4.20），其余档位 5.76–8.50；
- `[11]` 20000 局机器人仿真通关 0 局（阈值 ≤1%），第一关 greedy 仍 100%。

---

## 7. 构建测试与产物一致性

`node test-build-consistency.js` → **110 / 0**：

- 两个 HTML 内嵌 `<script id="mah-bundle">` 与现场重打包结果**逐字节比对**通过；
- `sourceHash` = 现场对 `src/` 全量 **38** 个文件重算的 SHA-256 =
  `78be7c6f08311bf1da7bb8003a2e9aa54d266717646f042bfde6597d8fbc40d0`（三处一致）；
- `[7]` 节：4 个正式 HTML 均内嵌 **20 个唯一 `templateId`（`L2-P01`…`L2-P20`）**、
  `MAH-L2-SPEC-v2` 规格层标记、双重去重标记与 `TEMPLATE_POOL_EXHAUSTED`；
- legacy 通过 Babel + acorn 纯 ES5 语法校验。

| 产物 | 字节 | SHA-256（本次最终构建） |
|---|---:|---|
| `dist/MahLeMah.html` | 9,925,831 | `03507abf477aa6389af4977baaf53b46be13475c1051d4e5dba244cbdaa3f5a8` |
| `dist/index.html` | 9,925,831 | 同上（同内容副本） |
| `dist/Mah了个Mah.html` | 9,925,831 | 同上（同内容副本） |
| `dist/MahLeMah-legacy.html` | 9,960,000 | `b99c16d0c6d371092bcf277be764aa630ef867ca06bf31c7218a77f9cb6dec2f` |

`buildVersion=2.0.0-66fe78b`、`gitCommit=66fe78bb82954e5efa9551a11234b0d1025a94df`
（构建时 HEAD；产物不回写新提交，避免自指循环，一致性由实时重算保证）。
> 每次构建的 `buildTimestamp` 不同，因此 HTML 的 SHA-256 只对「本次最终构建」有效；
> 真正的可复现性由 `sourceHash`（源文件全量哈希，构建无关）+ 逐字节重打包比对保证。
缩略图由 `node tools/l2_thumbnails.mjs` 重新生成：`reports/l2-thumbnails.{html,json,png}`。

---

## 8. 最终验收标准逐条判定

| 规格「验收」 | 判定 | 依据 |
|---|---|---|
| 旧 50 套模板及其生成路径彻底退出第二关 | ✓ | `generateLevel(2)` 缺 templateId 抛错；9 条旧记录全部报错；`ZONE_ANCHORS` 与失效注释已删 |
| 20 张缩略图与 20 种实际游戏布局逐一对应 | ✓ | 200 局（20×10 档）逐格比对零差异；缩略图由真实牌局绘制 |
| 连续 100 局测试，任意最近 10 局布局均不重复 | ✓ | `reports/l2-100-games.txt`：窗口四类签名重复 0、最大 sim 0.5460 < 0.60 |
| 不允许缩略图与实际布局不一致 | ✓ | 三段校验 + 渲染前整屏报错取证（`reports/l2-render-guard-output.txt`） |
| 第一关完全冻结，不作任何修改 | ✓ | 20 条基线零漂移；`test-l1-frozen.js` 56/0 |
| 保持牌数 / 规则 / 交互 / 视觉风格不变 | ✓ | 牌数仍按档位（192–321）、`config.js` / `tiles.js` / `render.js` 未改、渲染 27/27 |
| 生成失败必须明确报错，不得保留上一局冒充新布局 | ✓ | 生成 / 安装抛错；渲染前失败整屏错误页零牌绘制；旧记录不重放 |
| 只修改第二关布局系统，不做无关重构 | ✓ | `reports/MODIFIED_FILES.md` 逐文件说明 |
| 网页版 / 独立 HTML / 桌面端构建一致性 | **部分** | 网页版 ✓、独立 HTML ✓、ES5 legacy ✓；**桌面端 Rust 构建未运行**（缺 MSVC link.exe） |
| 未实际执行的测试不得标记为通过 | ✓ | 本报告第 0 / 9 节如实列出全部未运行项 |

---

## 9. 未执行 / 未覆盖项（不计入通过）

| 项 | 状态 | 原因 |
|---|---|---|
| Rust `cargo check` / `cargo build` | **未运行成功** | Git Bash 下 GNU `link` 遮蔽；PowerShell 下 `linker link.exe not found`（未安装 VS C++ 链接器） |
| 桌面版 exe 重建与真机音乐播放 | **未运行** | 依赖 Rust 构建 |
| Windows 安装版 / Portable zip / Setup.exe / SHA256SUMS.txt | **未重建** | 依赖 Rust 构建，仍是旧冻结产物 |
| `npm run test:release`（12000 局发布压力测试） | **未重跑** | 本版不属于规格要求的测试链 |
| 原版《羊了个羊》内部布局数据 / 精确算法复刻 | **不可得** | 只参考可观察特征，报告不声称复刻 |

---

## 10. 复现命令

```bash
node test.js                          # 631/0（含第二关 200 局三段保真）
node test-random-generation.js        # 7788/0（双关各 100 局）
node test-l2-templates.js             # 262/0（20 套 / 60 局 / 190 对 / 掩膜覆盖 / 等价几何）
node test-l1-frozen.js                # 56/0（第一关冻结 + 旧第二关路径必须报错）
node test-layout-position.js          # 35/0
node test-music-playback.js           # 69/0
node test-build-consistency.js        # 110/0
node tools/test_render.mjs            # 27/27
node tools/browser_smoke.mjs          # allPassed=true
node tools/music_real_playback.mjs    # 54/54，桌面版未运行
node tools/l2_100_games.mjs           # 连续 100 局去重取证 → reports/l2-100-games.txt
node tools/l2_thumbnails.mjs          # 重新生成 20 套缩略图
npm run build:all                     # 重建 4 个 HTML
```

修改文件清单见 `reports/MODIFIED_FILES.md`。
本轮提交：`7cda8b9`（完整哈希 `7cda8b94d2b7c0c8b38a891bf7159dd8d56e0c3b`），已推送 `origin/main`。
