# 交付说明 · 玩法层重做（单堆半格晶格 + 漏斗三带）

> 本文件早期是「簇模板 + 侧堆 + 四段陷阱」版本的**全文件代码快照**。
> 那套实现已整体删除，快照里的 54×72 / 18 张 / 主堆 150 + 侧堆 36 /
> `DECOY_GROUPS` / `TRAP_SPAN` / `LONG_TRAP` / 550 项断言等描述全部作废。
> 为避免仓库里留下一份会误导人的旧代码，本文件已重写为**当前规格的交付说明**；
> 代码的唯一真实来源是仓库里的源文件，完整实现请直接看对应文件，不在此处再贴全文。

---

## 1. 文件清单

| 类型 | 文件 | 说明 |
|---|---|---|
| 修改 | `src/game/config.js` | 重写为单一常量源：`TILE_W=66 / TILE_H=88`、半格晶格 `33×44`、`LEVEL_SPEC`、`FUNNEL`、删掉侧堆后用 `SLOT_PANEL / SLOT_PITCH / TOOL_*` 重排的界面坐标；保留 `SLOT_SIZE / layoutFor / levelParams` 等仍被引用的旧导出名 |
| 修改 | `src/game/layout.js` | 整文件重写：单堆随机生长几何、半格晶格、支撑、居中防溢出、`countComponents / hasSupport / isHalfLattice / peelOrder`（带 `waves`）；删除 `generateSidePiles / CLUSTER_TEMPLATES / buildCluster / templateCells / 抖动` |
| 修改 | `src/game/generator.js` | 整文件重写：`replayTypes` 证书、`buildFunnelSequence` 三带、`buildEasySequence`、`simulateRobot / simulatePlayer`、`hillClimb`（方案 a，默认关闭）、`pickPoolSeed`（方案 b）；删除 `buildGroupSequence / groupSuits / side / phases` 四段式 |
| 修改 | `test.js` | 整文件重写为 8 节验收：常量源、50 种子几何契约、50 种子 `order` 回放、槽位/道具/200ms、200 局机器人表格、硬指标 assert、软指标如实报告、运行时耗时 |
| **新增** | `src/game/seed_pool.js` | 方案 b 的 240 个验收 seed + `POOL_META`（离线扫描 10783 个候选 / 6 种贪心走法） |
| **新增** | `tools/tune_pool.mjs` | 方案 b 离线调优工具，`npm run tune:pool`，扫描候选 seed 并写 `seed_pool.js` |
| 修改 | `src/game/render.js` | 删除 `side` 排序分支与「225 张 · 12 条牌链」旧文案；`cardAt` 改为从最高 z 往下取第一张可点牌 |
| 修改 | `src/game/dom_view.es5.js` | 槽位面板 / 格线 / 槽位牌尺寸改从 `game.layout.slot` 读，不再硬编码旧坐标 |
| 修改 | `tools/tune.mjs` | 删除按 GRID 改写 `tileW/tileH` 的旧代码，改为两关 × random/greedy 现场体检 |
| 修改 | `tools/test_logic.mjs` | 历史转发壳的说明同步到当前规格 |
| 修改 | `tools/test_render.mjs` | 34 种牌统一按 `TILE_W/TILE_H` 绘制，删除「按关卡分大小牌」的旧冒烟写法 |
| 修改 | `tools/make_release.py` | 发布包 `README.txt` 的玩法说明同步到 66×88 / 24 张 / 222 张单堆 / 漏斗三带 / seed 池 |
| 修改 | `package.json` | 新增 `tune` / `tune:pool` 脚本 |
| 修改 | `README.md` | 第 5/6/8 章及目录结构、截图引用、产物体积全部同步 |
| 修改 | `DELIVERY.md` | 本文件 |
| 修改 | `dist/*.html` / `dist/Play-MahLeMah.cmd` | 重新构建（`build:web` + `build:legacy`） |
| 新增 | `.shots/funnel_l1.png`、`funnel_l2.png`、`funnel_legacy_l1.png`、`funnel_legacy_l2.png` | 当前版本实机截图 |
| **未改动** | `src/game/engine.js` / `store.js` / `tiles.js` / `audio.js` / `main.js` / `src-tauri/` | 槽位规则、道具、200ms 延迟、存档、花色素材、音频、绿色单文件架构按要求保留 |

**删除的符号（全仓库已无引用）**：`generateSidePiles`、`SIDE_*`、`SIDE_ZONES`、`side` 字段、
`buildCluster`、`templateCells`、`CLUSTER_TEMPLATES`、`buildGroupSequence`、`groupSuits`、
`DECOY_GROUPS`、`TRAP_SPAN`、`LONG_TRAP`、`DIFFICULTY`、`MAIN_ZONE`、`SLOT_BUDGET`、
全局随机抖动、按网格缩放 `tileW/tileH` 的调参代码。

---

## 2. 硬规格落地

- 两关各**一个牌堆**；矩形各外扩 4px 后连通分量 = 1；包围盒落在 `BOARD_BAND` 内且居中。
- 全项目唯一牌尺寸 `66×88`（严格 3:4），半格晶格 `LATTICE_X=33 / LATTICE_Y=44`；
  同层坐标 = `层原点 + (u·TILE_W, v·TILE_H)`，同层相交面积恒为 0；零随机抖动。
- 层原点逐层累加 `LAYER_OFFSETS = [[1,1],[0,1],[1,0]]`（半格单位）；
  连通团块由 4-邻接随机生长得到，边缘留缺口；每张非底层牌有 >10% 相交的支撑。
- 槽位 7 格、几何遮挡阈值 10%、道具各 3 次、复活 1 次、200ms 延迟消除，**全部未改**。
- L2：222 张 / 7 层 / `56/50/42/34/20/12/8` / 15 种花色 / 开局可点 ≥20（最小 35）；
  L1：24 张 / 3 层 / `12/8/4` / 8 种花色各 3 张 / 前 9 张只用 3 种。

## 3. 漏斗三带与可解性证书

`peelOrder()` 按几何遮挡波次剥离出合法全消除顺序 `order`，波内随机打散。
`buildFunnelSequence()` 把三带边界对齐到 `order.waves` 的波次边界、段长对齐到 3 的倍数：

| 带 | 占比 | 花色池 | 三张间距 | 效果 |
|---|---|---|---|---|
| 上带 | ~30% | 3 种（隔离） | 紧邻 | 开局可同时点，槽位基本 ≤5 |
| 中带 | ~40% | 另 3 种（隔离） | `MID_SPAN` 批次轮转 | 常停在 5~6 格 |
| 底带 | ~30% | 剩余 9 种全放开 | 低并发 + 跨带陷阱 | `CROSS_GROUPS` 组第一张在中带尾部、第二三张埋在 `order` 最深处 |

`replayTypes()` 沿 `order` 重放真实槽位规则，要求全程槽位 `<7` 且最终清空；
`verify()` 再带几何复核一次。每种花色张数必然 `%3 == 0`。

## 4. 难度调优的三个参数

全部在 `src/game/config.js` 的 `FUNNEL` 对象里：

| 参数 | 当前值 | 作用 |
|---|---|---|
| `TOP_SUITS` | `3` | 上带允许的花色种类数，越少开局越顺（L2 规格 3~4，L1 固定 3） |
| `MID_SPAN` | `3` | 中带每批同时推进的组数 = 同花色三张在 `order` 里的间距，越大槽位越常停在 5~6 |
| `CROSS_GROUPS` | `3` | 底带跨带陷阱组数，越大越容易让槽位被半成品塞满 |

结构参数 `TOP_RATIO=0.30` / `MID_RATIO=0.40` 调难度不用动；
`HILL_STEPS=0` / `HILL_PROBES=3` 是方案 a 生成期爬山的开关（默认关闭）。

**最终采用方案 b**：`tools/tune_pool.mjs` 离线扫描 → `src/game/seed_pool.js`（240 个 seed）
→ 运行时 `generateLevel(2)` 不传 seed 时从池里抽。方案 a 的 `hillClimb()` 已实现并保留，
但实测小探针集会过拟合探针随机源、避开验收源后贪心通关率仍约 55%，泛化不足，故不启用。
运行时 L2 生成实测平均 1.7ms / 最大 3ms（预算 400ms）。

---

## 5. `node test.js` 真实完整输出

```
============================================================================
 MahLeMah 玩法层验证 · 单堆半格晶格 + 漏斗发牌 · test.js
============================================================================

[1] 单一常量源
   TILE 66x88 · 半格 33x44 · 槽位 7 · 遮挡阈值 0.1
   漏斗参数 TOP_SUITS=3 MID_SPAN=3 CROSS_GROUPS=3
   验收 seed 池 240 个（离线扫描 10783 个候选 / 6 种贪心走法）

[2] 几何与结构契约（50 个种子 × 两关）
   L2 样例 10：222 张 / 7 层 / 15 花色 / 包围盒 627x660 / 居中偏移 14,7
   安全区 680x722 · 连通分量恒为 1 · 同层重叠恒为 0
   几何判定：50% 相交=遮挡 / 5% 相交=可点（阈值 10%）

[3] 可解性证书：沿 order 重放（50 个种子）
   通关路径 50/50 · 开局可点最小 35 张（要求 ≥20）

[4] 槽位规则 / 道具 / 200ms 延迟消除
   入槽插入 / 三消 / 200ms 延迟防重入 / 撤销 / 移出临时区 / 洗牌 / 复活 全部通过

[5] 机器人模拟（均不使用道具；各 200 局，固定 seed 组）
   关卡 / 机器人                通关率       死局率       平均进度        中位进度
   L1 随机机器人                2.0%      98.0%     10.3%       0.0%
   L1 贪心机器人                99.5%     0.5%      99.5%       100.0%
   L2 随机机器人                0.0%      100.0%    15.2%       14.9%
   L2 贪心机器人                0.0%      100.0%    59.4%       56.8%

[6] 硬指标（assert，失败即 exit 1）
   ✓ L1 greedy 通关率 ≥ 95% · 实测 99.5%
   ✓ L2 random 通关率 = 0% · 实测 0.0%
   ✓ L2 greedy 通关率 ≤ 5% · 实测 0.0%
   ✓ L2 漏斗形状：进度 <25% 前死亡 ≤ 10% · 实测 0/200 = 0.0%
   ✓ L2 沿 order 重放 50/50 · 实测 50/50
   ✓ L2 开局可点 ≥20 · 实测 最小 35
   ✓ seed 池 ≥100 个 · 实测 240 个

[7] 软指标（如实报告，不改写阈值，不改写实测值）
   L2 greedy 失败局死亡进度分布（共 200 局）：
     0~10%     0
     10~20%    0
     20~30%    0
     30~40%    0
     40~50%    30    ######
     50~60%    94    ###################
     60~70%    43    #########
     70~80%    27    #####
     80~90%    5     #
     90~100%   1
   ✓ L2 greedy 失败进度中位数 56.8%（目标 55%~90%）
   ✗ L1 随机机器人通关率 2.0%（目标 ≥60%）
     说明：L1 开局可点 8~12 张，横跨「上带 3 种 + 其余 5 种」共 8 种花色；
     随机点法会在 7 格槽位里攒出 7 种单张，远早于凑齐三消，因此通关率偏低。
     规格要求「前 9 张只用 3 种花色、其余 15 张用另外 5 种」，该前提与
     「随机点法 ≥60%」不能同时成立；硬指标 L1 greedy ≥95% 已达标。

[8] 运行时生成耗时（第 2 关，不传 seed → 从验收池抽）
   20 局：平均 1.7ms · 中位 2ms · 最大 3ms · 预算 400ms
   调优方案 b（离线工具 tools/tune_pool.mjs + seed 池），运行时只查表 + 确定性生成

============================================================================
 断言：通过 1142 项，失败 0 项
============================================================================
```

> 唯一未达标的是**软指标**「L1 随机机器人通关率 ≥60%」，实测 2.0%，如实标 `✗`。
> 阈值没改、测试没改、实测值没改；原因与规格冲突见上方 `[7]` 段说明。

## 6. 构建与回归

| 命令 | 结果 |
|---|---|
| `node test.js` | 1142 项断言通过，0 失败，`EXIT=0` |
| `npm test` | `node test.js` + `tools/test_render.mjs`；渲染冒烟 44 场景、卸载 UI 4 项 PASS，`EXIT=0` |
| `npm run build:web` | `dist/Mah了个Mah.html` 59.4 KB，`EXIT=0` |
| `npm run build:legacy` | `dist/MahLeMah-legacy.html` 90.9 KB，acorn `ecmaVersion:5` 全通过，`EXIT=0` |
| 实机截图 | CDP 720×1280：L1 24 张 / L2 222 张，牌堆居中、牌面 3:4 不变形、槽位与道具栏无空洞 |

---

## 7. 复现命令

```bash
node test.js                 # 1142 项断言 + 200 局 × 4 组机器人模拟
npm test                     # 上面 + 渲染冒烟
npm run build:web            # 现代单文件网页版
npm run build:legacy         # ES5 兼容版
node tools/tune.mjs 40 7000  # 现场难度体检
npm run tune:pool            # 重新离线扫描 seed 池（耗时约 60s，会覆写 seed_pool.js）
```
