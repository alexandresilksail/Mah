# Mah 了个 Mah

> 一款原创的「堆叠卡牌三消」休闲小游戏：点击未被遮挡的麻将牌收入底部槽位，三张相同自动消除。
> Tauri 2 + 原生 HTML/CSS/JS + Canvas，全部美术与音效都由代码实时生成。
> **2026-11-12 起内置 5 首用户背景音乐**（data URI 打进所有产物，离线可播；音效仍完全独立）。
> **2026-11-11 随机生成系统重构**：动态档位 + 每关独立「最近三局」差异化约束 +
> 统一生成入口 `createNewGame()` + 基于实际几何的 SHA-256 布局签名 + 开发调试面板。
> `dist/MahLeMah.html` 与 `dist/MahLeMah-legacy.html` 已由当前 `src/` 重新构建，
> 一致性由 `node test-build-consistency.js` 逐字节验证。
> **2026-11-12 本轮**：背景音乐真正集成并真机验证播放、第一关布局按包围盒动态居中、
> 双关卡最近三局「牌数 + 布局签名 + 几何相似度」三重差异化（历史窗口回到 3 局）。
> **2026-11-13 本轮（第三次改版）**：第二关落牌改为**规格驱动**（`MAH-L2-SPEC-v2`）——
> 每层占哪些格、落在格的四分之一，全部由与 seed 无关的显式规格决定，缩略图与实际牌局
> 逐格一一对应；生成后 / 安装后 / 渲染前三段都做几何校验，不一致就整屏明确报错；
> 旧的第二关默认生成路径已删除（缺 `templateId` 直接抛错）。第一关完全冻结。
> **2026-11-13 上一版**：第二关按用户指定的 20 个**全局牌堆形状**重做布局系统
> （显式轮廓掩膜），沿用最近 10 局「模板级 + 几何级」双重去重。

---

## 0.00 第二关规格驱动生成 + 三段几何校验（2026-11-13 本轮）

| 要求 | 实现 | 证据 |
|---|---|---|
| 20 套缩略图与实际布局**逐一对应** | `src/game/l2_spec.js`：掩膜 → 4 邻接图 → 多源 BFS 走位序 → 逐格相位 + 半格错位极性 → `specPlan()` 给出每层占哪些格；落牌完全照规格执行，不再逐张打分 | 200 局（20 套 × 10 档位）逐格比对零差异（`reports/FINAL_test.txt` [3]） |
| 生成后校验 | `checkFidelity(cards, spec, plan, profile)`：晶格 / 层形状 / 区域 / 张数 / 同层零重叠 / 可点 / 悬空 / 边界 | 200 局保真失败 0 |
| 安装后校验 | `engine.installLevelData()` → `verifyTemplateFidelity()`（从 templateId + 档位重新展开再比对） | `test.js` [12] 真实安装入口 |
| 渲染前校验 | `main.js` `assertLevel2FidelityBeforeDraw()`：按 `boardRev` 缓存；失败整屏错误页写明模板与违规项，不画牌、不保留上一帧 | `reports/l2-render-guard-output.txt`（篡改一张牌 → 整屏报错、零牌绘制、异常 0） |
| 生成失败必须明确报错 | `generator.js` 第二关缺 `templateId` 抛错；`startLevel` / `restartLevel` 同；`new_game.js` 无 `templateId` 的旧记录不重放 | `test-l1-frozen.js` [3] 9 条旧记录全部报错 |
| 最近 10 局不重复（跨重启） | 沿用 `l2_recent.js` 模板级 + 几何级双重去重，窗口 10，持久化 | `reports/l2-100-games.txt` |
| 第一关完全冻结 | 不改 `layout.js` / 第一关生成分支；`L1_FROZEN_BASELINE.json` 逐项回归 | `node test-l1-frozen.js` **56/0** |
| 20 套形状可肉眼核对 | `tools/l2_thumbnails.mjs` 每套真实生成一局画俯视缩略图 | `reports/l2-thumbnails.html` + `.png` |

**测试命令**：`node test.js`（含 200 局三段保真）、`node test-l2-templates.js`、
`node test-random-generation.js`、`node test-l1-frozen.js`、`node test-build-consistency.js`。

---

## 0.0 第二关 20 套全局形状布局 + 最近 10 局双重去重（2026-11-13 上一版）

> 20 套模板 / 掩膜体系仍有效；「掩膜 → 牌位」的落牌算法已被 0.00 节的规格驱动取代，
> 模板里的 `growth` / `layerShape` / `curve` / `offsets` / `density` 现在只作形状说明。

| 要求 | 实现 | 证据 |
|---|---|---|
| 20 套指定全局形状 | `src/game/l2_templates.js`：7 个形状族共 20 套，每套一份 **5 行 × 9 列显式轮廓掩膜**（`#` 可落牌 / `@` 高密度 / `.` 禁止落牌） | `reports/l2-templates-report.md`（20 套 ID、掩膜清单） |
| 轮廓 / 区域 / 层级三方面真正不同 | 掩膜的 4 邻域连通分量直接决定区域结构（双核心 2 分量、三岛屿 3 分量、四角围合 4 分量）；落牌只在掩膜格内 | 190 对两两结构 sim 最大 0.4438、主堆布局 sim 最大 0.4284，全部 < 0.60（主堆逐层占位格轮廓 **20/20** 种互不相同） |
| 差异来自结构而非 seed / 牌面 | `l2_structure.js` 用坐标 / 层级 / 区域 / 轮廓 / 遮挡 / 可操作区算结构签名，并做平移 + 左右镜像归一化得到等价几何签名 | `test-l2-templates.js` 20 套 × 3 组 = 60 局 + 190 对比较，越界 0 对 |
| 最近 10 局实际布局零重复 | 第二关独立 `level2RecentGames` 窗口 = 10；模板级排除已用模板，几何级比较等价结构；候选池不足 10 个可选模板时直接报 `TEMPLATE_POOL_EXHAUSTED`，不静默复用 | `reports/l2-100-games.txt`（连续 100 局：任意连续 10 局模板零重复，4 类窗口内重复均为 0） |
| 跨应用重启有效 | 记录含 `templateId` / `structureSignature` / `canonicalGeometrySignature`，Rust 白名单同步且旧档缺字段合法 | `test-l1-frozen.js` 与浏览器冒烟（两个 HTML 共用持久化历史） |
| 第一关完全不变 | `reports/L1_FROZEN_BASELINE.json` 修改前基线逐项回归；模板分支严格限定 `lv === 2 && opt.templateId` | `node test-l1-frozen.js` **56/0** |
| 音乐 / 音效 / 三消规则不受影响 | 只改第二关生成与去重链路，5 首内置音乐原样打进全部重建产物 | `test-music-playback.js` 69/0、Edge 真机播放 54/54 |
| 20 套形状可肉眼核对 | `tools/l2_thumbnails.mjs` 每套真实生成一局，按真实 `x/y/layer` 画俯视缩略图 | `reports/l2-thumbnails.html` + `.png` |

**测试命令**：`node test-l2-templates.js`（20 模板 / 60 局 / 190 对）、`node test-random-generation.js`（双关各 100 局）、
`node test-l1-frozen.js`（第一关冻结）、`node test-build-consistency.js`（产物一致性）。
缩略图：`node tools/l2_thumbnails.mjs`。

> 原版《羊了个羊》内部数据无法获取，模板只参考**可观察**的多层叠牌、区域组合、
> 半格遮挡与轮廓收放特征，不声称精确复刻原版算法，也不含任何从原版导出的坐标数据。

---

## 0.1 本轮升级速览（2026-11-11）

| 要求 | 实现 | 证据 |
|---|---|---|
| 每次新开局牌数与布局都不同于本关最近三局（**第一关**；第二关见 0.0） | `createNewGame()` 生成后真实计算总牌数与布局签名，冲突即重试（上限 50 次） | `test-random-generation.js` 两关各 100 局 |
| 不允许换 seed 就当作换布局 | 几何签名只纳入坐标 / 层级 / 区域 / 遮挡 / 可操作区，与洗牌无关 | `layout_signature.js` + `test.js [14]` |
| 三种重新开局统一入口 | `case 'start'` / `'restart'|'replay'` / `'next'` / 键盘 `r` / `?lv=` 全部走 `newGame()` → `createNewGame()` | `test-build-consistency.js` + 200 局报告的入口审计 |
| 重启后历史不丢 | 存档 `v:3` 新增 `level1RecentGames` / `level2RecentGames`（L1 最多 3 条、L2 最多 10 条） | 100 局测试中的磁盘往返重启模拟 + 浏览器两个 HTML 共用持久化历史实测 |
| 两个 HTML 与源码一致 | 构建脚本与一致性检查共用 `tools/bundle_shared.mjs`，逐字节比对内嵌 bundle | `reports/build-consistency-report.md` |
| 调试面板真实数据 | `?dev=1` 显示 gameId / 签名 / 四项 PASS-FAIL / 最近三局 | Edge CDP 实测两个 HTML |

> **牌数口径澄清**：旧文档里的「第一关 24 张 / 第二关 222 张」是历史版本数据。
> 当前源码中 `24` 只是第 1 关 4 个合法档位之一（`24 / 30 / 36 / 48`）；
> `222` 从未出现在当前配置中。第 2 关实际牌数范围是 `192–321`（10 档，9 个不同值）。

---

## 0.2 动态档位系统（本轮修订）

> 下文各章节出现的「L1 48 张 / L2 240 张 / 15 层 / 16 种」是**无档位兼容路径**
> （`levelParams(level)` 不传 `profileId`）的基线规格，供旧工具与旧存档回放使用；
> 实际游玩的层数、牌种类、张数一律由当前档位决定。

`game.profile = { l1, l2 }` 保存两关当前档位 id。`rollProfile(level, rand, current)`
按权重抽取且结果必定 ≠ 当前档位。

**本轮（2026-11-11）起，所有 UI 新开局统一由 `createNewGame()` 负责抽档位、抽 seed、
生成牌局、计算签名、对比最近三局、校验并写历史**；`main.js` 里的
`case 'start'` / `case 'restart'|'replay'` / `case 'next'` / 键盘 `r` / `?lv=`
都只调用同一个 `newGame()` 包装，不再各自实现随机生成。`boot()` 仍在读入存档后
对两关各重抽一次（≠ 存档里的 `p1`/`p2`），作为「应用重启」路径的初始档位。

`generationReason` 明确区分 `application_restart` / `title_screen_restart` /
`failure_restart` / `new_game`；每局开始打印
`[mah] level=… profileId=… seed=… gameId=… reason=… tiles=… sig=…`。

`config.RETRY_KEEPS_PROFILE = false` 仍保留为兼容开关（只影响 `engine.restartLevel()`
这条兼容 API，UI 入口一律走统一规则）。

### 第 2 关档位表（`LEVEL2_PROFILES`，10 个预设；队列固定 44 张）

| id | 层数 N | 牌种 T | 主堆 | 总张数 | 组数 G | 权重 | 备注 |
|---|---|---|---|---|---|---|---|
| 0 | 28 | 15 | 277 | **321** | 107 | 0.0875 | 原作基准档 |
| 1 | 24 | 13 | 238 | 282 | 94 | 0.0875 | 大盘 |
| 2 | 26 | 14 | 256 | 300 | 100 | 0.0875 | 大盘 |
| 3 | 27 | 16 | 268 | 312 | 104 | 0.0875 | 大盘 |
| 4 | 23 | 13 | 229 | 273 | 91 | 0.0875 | 大盘 |
| 5 | 25 | 13 | 247 | 291 | 97 | 0.0875 | 大盘 |
| 6 | 22 | 13 | 217 | 261 | 87 | 0.0875 | 大盘 |
| 7 | 27 | 14 | 268 | 312 | 104 | 0.0875 | 大盘 |
| 8 | 15 | 15 | 148 | **192** | 64 | 0.15 | 轻量 A：11 种×4 组 + 4 种×5 组 |
| 9 | 20 | 15 | 211 | **255** | 85 | 0.15 | 轻量 B：10 种×6 组 + 5 种×5 组 |

- 大盘档 8 个由 `tools/gen_profiles.mjs` 枚举固化：`mainCount ≈ round(9.9·N)`，
  总数对齐 3 的倍数，`G/T ∈ [6.5, 8.0]`，每种花色组数只取 `floor/ceil(G/T)`；
  大盘权重合计 0.70，轻量档合计 0.30。
- 轻量档层数（15 / 20）是按 9.9 张/层**估算**的，不是原作数据。
- 档 B 规格原文写「256 张 = 85 组 / 主堆 212」，与三消规则冲突（85×3=255）；
  经确认按 **255 张 = 211 + 44** 实现。
- 主堆层张数由 28 层基准曲线按顶部 25% / 中段 36% / 底部核心 39% 插值到 N 层，
  再归一化到 `mainCount`；半格晶格、沙漏轮廓、44 张盲盒队列、同层零重叠、z 全序不变。
  全局堆叠层数 = N + 8（队列 8 层不占 N）。

### 第 1 关档位表（`LEVEL1_PROFILES`，4 个预设；无队列，每种花色 1 组）

| id | 层数 | 牌种 | 张数 | 层张数 | 权重 |
|---|---|---|---|---|---|
| 0 | 2 | 8 | 24 | 60 / 40 | 0.25 |
| 1 | 3 | 10 | 30 | 50 / 33 / 17 | 0.25 |
| 2 | 3 | 12 | 36 | 50 / 33 / 17 | 0.25 |
| 3 | 3 | 16 | 48 | 50 / 33 / 17 | 0.25 |

### 存档字段与 seed 池

- 存档当前版本 **`v:3`**：`v/level/best/sound/sfxVol/p1/p2` +
  `level1RecentGames` / `level2RecentGames`（每关最多 3 条元数据）。
  最后一关通关那一刻就写 `level=1`、`best` 保持 2（修复「通关后从第 2 关开始」）。
- `src-tauri/src/main.rs` 的 `SAVE_FIELDS` 扩为 **11 个字段**，新增两关历史并做
  「数组 ≤3 条 / 12 字段完整 / 签名 64 位小写 SHA-256 / 整数范围 / reason 枚举」校验；
  旧存档（v1/v2）缺这些字段按缺省处理，不判非法；64 KB 上限、JSON 校验、
  字段白名单、固定路径、原子写入（`tmp → sync_all → rename`）全部保留、未放宽。
- seed 池按档位分库 `SEED_POOL['L2-<id>']`（`src/game/seed_pool.js`），
  运行时只从当前档位的池里抽；由 `node tools/tune_pool.mjs 200 40` 离线生成。

---

## 0.3 差异化 / 布局签名 / 调试面板

### 两关独立历史（2026-11-13 起按关卡分窗口）

`level1RecentGames` 与 `level2RecentGames` 绝不互相读取：

- **第一关冻结为最近 3 局**（`HISTORY_LIMIT = 3`），每条记录 12 个基础字段；
- **第二关独立维护最近 10 局**（`L2_HISTORY_LIMIT = 10`），额外持久化
  `templateId` / `structureSignature` / `canonicalGeometrySignature`；
  旧存档缺这 3 个字段仍合法（由 seed 重放的真实牌面兜底）。

历史只存元数据、不存牌面，存档体积有上界；`historyLimitFor(level)` 是唯一窗口取值入口。

**滚动窗口规则（按关卡分流）**：

- **L1（完全冻结）**：新局的总牌数、布局签名、几何签名都必须 ≠ 最近 3 局中任意一局；
  L1 恰好 4 个牌数（24/30/36/48）够连续 4 局互不重复。
- **L2（本轮新规格）**：模板级排除最近 10 局用过的 `templateId`；几何级比较最终实际布局，
  拒绝等价几何（平移 / 左右镜像归一化后签名相同）、相同结构签名、相同几何签名，
  并要求与最近 10 局重放牌面的主堆结构相似度与布局相似度都 < 0.60。
  牌面图案、牌面顺序、随机种子与总牌数都**不能**作为布局不同的依据。
  发现重复必须重试（上限 50 次），仍无法满足则抛 `GenerationFailureError`：
  不清空历史、不改 seed、不微调坐标、不退回重复布局。

### 统一生成流程 `createNewGame()`（`src/game/new_game.js`）

识别关卡 → 读本关最近三局 → 选合法档位（加权、排除当前）→ 生成新 seed
（L2 从该档位自己的 seed 池抽）→ 生成实际牌局 → 计算总牌数与布局签名 →
与本关最近三局对比 → 冲突则重试 → `validateLevel` / `verify` / 半格晶格 /
同层零重叠 / 可点牌校验 → 生成唯一 `gameId` → 写历史 → 返回游戏实例。
**上限 50 次**，仍不合格抛 `GenerationFailureError`（带逐次失败原因），
绝不自动接受重复牌局。

> **第二关（2026-11-13 起）**走 `createLevel2Game()` 独立分支：从「最近 10 局未用过的
> 20 套模板」候选池取模板 → 选档位 → 抽 seed → **按该模板的规格（`l2_spec.js`：
> 每层占哪些格、落在格的哪个四分之一）逐层落牌** → 校验保真（晶格 / 层形状 / 区域 /
> 张数 / 同层零重叠 / 可点 / 悬空 / 边界）→ 计算 `structureSignature` /
> `canonicalGeometrySignature` → 与最近 10 局重放牌面做模板级 + 几何级双重判定 →
> 完整校验 → 写历史。第一关代码路径逐字未改。
> 第二关**没有**「不带 templateId 的默认路径」：缺 templateId 一律抛错，不存在回退到旧布局生成器的分支。
> 候选池不足（20 套已被 10 局占用到无可选）时抛 `TEMPLATE_POOL_EXHAUSTED`，不清空历史、不退回重复布局。

### 布局签名（`src/game/layout_signature.js`）

`calculateLayoutSignature()` 从**实际牌局数据**计算，不从 seed 推导。
`sha256.js` 是纯 ES5 同步 SHA-256，现代版 / legacy / Node 三处结果一致。

| 签名 | 纳入内容 | 用途 |
|---|---|---|
| `geometrySignature` | 每张牌标准化坐标 / 层级 / 区域 / z 全序、遮挡关系、可操作区与被遮挡区、层结构与区域结构 | **布局差异化的硬判定**；几何由 seed 程序化生成，同档位换 seed 必不同 |
| `distributionSignature` | 每种牌型张数 + 沿 z 全序的牌型序列 | 独立记录，不冒充几何变化 |
| `layoutSignature` | SHA-256(geometry + distribution) | 主签名，满足「纳入布局相关牌型分布信息」 |

差异化判定同时检查 `layoutSignature` 与 `geometrySignature`：即使只换花色排列
（主签名变了），只要位置 / 层级 / 遮挡结构没变，仍判为同一布局而拒绝。

### 三种重新开局

| 入口 | generationReason | 行为 |
|---|---|---|
| 应用重启后第一次点开始 | `application_restart` | 读回存档历史 → 生成全新 gameId / 档位 / seed / 布局 |
| 返回标题再次点开始 | `title_screen_restart` | 同上；毕业时按 `new_game` 从第 1 关开始 |
| 失败面板重开 / 暂停重开 / 重玩本关 | `failure_restart`（失败）/ `title_screen_restart` | 同上，绝不恢复初始牌面 |

当前版本**不保存牌面**，因此没有「Continue 恢复未完成牌局」入口；暂停菜单的
「继续游戏」只是解除暂停。自动读回旧存档不会把「开始新局」变成恢复旧局。

### 开发调试面板

`?dev=1`（或 `window.__MAH_DEV__ = true`）显示，**正式版默认隐藏**。
字段全部来自 `game.meta` 真实运行数据：gameId / buildVersion / gitCommit / sourceHash /
level / difficultyId / seed / totalTiles / tileTypeCount / layerCount / layoutSignature /
geometrySignature / distributionSignature / generatedAt / generationReason /
previousThreeChecks / attempts / retries，以及四项
「牌数检查 / 布局检查 / 难度档位检查 / 历史记录保存」PASS-FAIL。
构建时注入 `buildVersion / gitCommit / sourceHash / buildTimestamp / sourceFiles`。

### 200 局测试与构建一致性

- `node test-random-generation.js` → 两关各 100 局，报告
  `reports/random-generation-report.json` / `.md` / `-output.txt`（含逐局 200 条记录）。
- `node test-build-consistency.js` → 42+ 项断言，报告
  `reports/build-consistency-report.json` / `.md` / `-output.txt`。
- `node tools/browser_smoke.mjs` → Edge CDP 真实浏览器打开两个 HTML 各生成 4 局，
  报告 `reports/browser-smoke-report.json`。
- 两个 HTML 由 `npm run build:all` 从当前 `src/` 构建；`tools/bundle_shared.mjs`
  是构建脚本与一致性检查**共同**使用的唯一打包实现，检查方式是内嵌 bundle
  逐字节比对，不依赖文件大小或版本号。

---

## 0. 直接开玩（网页版，推荐）

`dist/Mah了个Mah.html` 是**单个 HTML 文件**（约 112 KB，零外部依赖）；同目录还有
`Play-MahLeMah.cmd`——双击后会用 Edge/Chrome 的**无边框窗口**（`--app` 模式）打开游戏，
观感接近桌面程序，不需要安装任何东西。

- 双击即用浏览器打开就能玩，不需要装 Node、Rust、WebView2，也不需要起服务器；
- 手机浏览器打开同一个文件/链接也能玩（720×1280 自适应缩放）；
- 想放到网上：把 `dist/index.html` 丢到任意静态空间（GitHub Pages / 对象存储 / 腾讯云 COS）即可。

**浏览器兼容性**：任意 2020 年之后的现代浏览器都能直接跑 —— Chrome / Edge / Firefox /
Safari / 360 / QQ / 夸克 / Opera / Brave / Vivaldi 等，包括 `file://` 本地双击。
游戏不加载任何外部资源（无 `<img>` / `<link>` / `@font-face` / fetch），不用 ES module，
也不发起网络请求，所以没有跨域和 MIME 类型问题；`localStorage` 和 Web Audio 都做了
`try/catch` 降级，被浏览器禁用时只是不存档 / 不发声，不会白屏。

Edge / Chrome 只在 `Play-MahLeMah.cmd` 里被用来开 `--app` 无边框窗口；**找不到它们时会
自动退回系统默认浏览器，玩法与功能完全一样**。主产物用了可选链 `?.`、空值合并 `??` 和
`ctx.ellipse()`，**IE 系列请改用下面的兼容版**。

---

## 0.1 老浏览器兼容版（IE8 / IE9 / IE10 / IE11）

`dist/MahLeMah-legacy.html`（约 116 KB）是**纯 ES5 的第二个单文件产物**，零外部依赖、
可离线双击。它不替换现代版：现代版保持 60fps 与完整像素美术，兼容版负责把门槛压到 IE8。

| 环境 | 渲染 | 结果 |
|---|---|---|
| 现代浏览器 / IE11 | Canvas 2D | 完整画面（兼容版也通吃，只是体积更大） |
| IE10 / IE9 | Canvas 2D + 垫片 | 完整牌面；无 Web Audio → 静音；无 `ctx.filter` → 投影退化为硬边 |
| **IE8 / IE7** | **无 Canvas → DOM 降级** | 方块牌 + 系统字体文字；玩法、关卡、遮挡判定、道具、存档、音效开关全部一致，只是没有圆角 / 渐变 / 柔化投影 / 音效 |
| IE6 及更早 | — | 不保证（盒模型与 `position:fixed` 都不完整） |

360 / QQ / 搜狗等双核浏览器请切「极速模式」；「兼容模式」是 IE 内核，会走 DOM 降级。
安装包里同时带两个 HTML，桌面快捷方式仍指向现代版；老 IE 里直接双击
`MahLeMah-legacy.html` 即可。

重新生成：

```bash
npm install             # esbuild + Babel + acorn（仅开发期）
npm run build:web       # → dist/Mah了个Mah.html / index.html / MahLeMah.html
npm run build:legacy    # → dist/MahLeMah-legacy.html（含 ES5 语法校验）
npm run build:all       # 两个一起
```

> 网页版存档走 `localStorage`；桌面版走安装目录下的 `MahLeMah_Data/save.json`。

---

## 0.5 两种 Windows 交付物（Portable 绿色版 + NSIS 安装版）

v2.0.0 提供**两种相互独立、分别命名、分别构建**的 Windows 产物，绝不混淆：

| 交付物 | 文件 | 形态 | 卸载方式 | 数据策略 |
|---|---|---|---|---|
| **A · Portable 绿色版** | `dist/MahLeMah-Portable-v2.0.0.zip` | 解压即得 `MahLeMah.exe` + `WebView2Loader.dll`，零安装 | 删整个解压目录 | 删目录即净；要留档先备份 `MahLeMah_Data` |
| **B · NSIS 安装版** | `dist/MahLeMah-Setup-v2.0.0.exe` | 标准 NSIS 安装程序（amd64 原生） | 设置→应用 / 开始菜单「卸载」 | 标准卸载入口 + 卸载确认流程，**默认保留存档** |

两种产物共用同一份 `MahLeMah.exe`，文件清单一致（主程序 + WebView2 运行依赖）；
区别只在**分发形态与卸载入口**。

```bash
npm run build:portable   # → dist/MahLeMah-Portable-v2.0.0.zip
npm run build:nsis       # → dist/MahLeMah-Setup-v2.0.0.exe（需 64 位 makensis）
npm run build            # = build:portable && build:nsis
npm run release          # → dist/SHA256SUMS.txt（为全部交付物生成校验和）
```

> 关于「绿色版不写注册表」：桌面端数据全部落在 `<exe 同级>/MahLeMah_Data`，不写
> `%APPDATA%` / `%LOCALAPPDATA%`（WebView2 缓存也用 `WEBVIEW2_USER_DATA_FOLDER` 重定向进该目录）。
> 安装版会用 `HKCU\...\Uninstall\MahLeMah` 写一条**标准卸载注册表项**（这是安装程序的职责，不是游戏本身），
> 提供「设置 → 应用和功能」里可见的卸载入口——这是 NSIS 安装版的规范行为，与「游戏内自删除」无关。

---

## 1. 目录结构

```
mah-le-mah/
├── package.json                  # devDeps: @tauri-apps/cli / esbuild / babel / acorn
├── README.md  DELIVERY.md  RELEASE_NOTES.md
├── TEST_REPORT.md  SECURITY_AUDIT.md  reports/DIFFICULTY.md
├── src/                          # 前端（Tauri frontendDist 直接指向这里，零打包）
│   ├── index.html  styles.css
│   ├── compat.es5.js             # ES5 垫片：Map/Set/事件/计时/Canvas 补丁
│   ├── main.js                   # 启动、缩放、输入、主循环、存档、音效解锁
│   └── game/
│       ├── config.js             # 单一常量源：66×88 / 半格晶格 / 槽位 / 遮挡阈值 / 按钮坐标
│       ├── tile_types.js         # ★ v2.0.0：16 种牌型的唯一注册表（ID/名称/配色）
│       ├── music_manifest.js      # ★ 内置 5 首音乐清单（data URI）+ 统一场景映射
│       ├── l2_templates.js        # ★ 2026-11-13：20 套第二关全局形状（7 族）+ 5×9 显式轮廓掩膜
│       ├── l2_spec.js             # ★ 2026-11-13 本轮：规格层 MAH-L2-SPEC-v2（每层占哪些格 / 半格极性 / 三段校验）
│       ├── l2_geometry.js         # ★ 2026-11-13 本轮：按规格落牌 + verifyTemplateFidelity（安装后 / 渲染前复用）
│       ├── l2_structure.js        # ★ 2026-11-13：结构签名 / 等价几何 / 主堆相似度
│       ├── l2_recent.js           # ★ 2026-11-13：最近 10 局模板级 + 几何级双重去重判定
│       ├── recent_games.js        # 两关独立历史（L1=3 / L2=10），字段白名单
│       ├── layout.js             # 模板 → 牌坐标；几何遮挡判定；peelOrder
│       ├── generator.js          # 漏斗发牌 / 可解性证书 / 六策略机器人模拟
│       ├── seed_pool.js          # 离线验收 seed 池（L2 用）
│       ├── robots.js             # ★ v2.0.0：六种难度评估机器人
│       ├── tiles.js              # 16 种牌面绘制 + 分级压暗 + 离屏精灵缓存
│       ├── engine.js             # 槽位函数 + Game 类（规则、道具、延迟消除）
│       ├── render.js             # 界面绘制 + 设置面板 + 音效图标
│       ├── audio.js              # Web Audio 合成音效（独立开关/音量；生产版唯一音频模块）
│       └── dom_view.es5.js       # 无 Canvas 时的 DOM 降级渲染器
├── test.js                       # Node 纯逻辑验证（当前 11 项 Wilson 断言失败，见 TEST_REPORT.md）
├── test-random-generation.js     # 第一关 100 局冻结回归 + 第二关 100 局新规格压力测试
├── test-l2-templates.js          # ★ 2026-11-13：20 套全局形状 / 60 局 / 190 对差异 / 等价几何
├── test-l1-frozen.js             # ★ 2026-11-13：第一关修改前基线逐项冻结回归
├── test-layout-position.js       # 第一关布局动态居中专项
├── test-music-playback.js        # 内置背景音乐集成专项
├── test-build-consistency.js     # 两个 HTML 与 src 逐字节一致性检查
├── src-tauri/
│   ├── Cargo.toml                # release 体积优化 + serde_json（存档校验）
│   ├── tauri.conf.json           # bundle.targets=["nsis"]；最小权限
│   ├── capabilities/default.json # core:default，无任何 fs 删除 capability
│   ├── icons/
│   └── src/main.rs              # 零注册表写；4 个白名单 IPC（load/save/reset/data_dir）；存档加固
├── dist/                         # 产物（构建后生成）
│   ├── MahLeMah-Portable-v2.0.0.zip  # ★ A·便携版（exe + WebView2Loader + 说明）
│   ├── MahLeMah-Setup-v2.0.0.exe    # ★ B·NSIS 安装版
│   ├── MahLeMah.html  MahLeMah-legacy.html  Mah了个Mah.html  index.html
│   └── SHA256SUMS.txt
└── tools/
    ├── gen_icon.py  build_web.mjs  build_legacy.mjs
    ├── build_portable.mjs  build_nsis.mjs  make_installer.nsi  make_release.py
    ├── test_logic.mjs  test_render.mjs
    ├── tune.mjs  tune_pool.mjs  stress_release.mjs
```

## 2. 环境要求

> 只想玩网页版 / 只想改前端，**下面这些都不用装**，有浏览器就够。

| 组件 | 版本 | 说明 |
|---|---|---|
| Node.js | ≥ 18 | 只用来跑构建脚本与测试 |
| Rust | ≥ 1.77.2 | `rustup` 安装；**本机用 GNU 工具链**（`stable-x86_64-pc-windows-gnu`） |
| MinGW-w64 | winlibs 16.x | 提供 GNU 链接器（`ld.exe` / `dlltool.exe` / `windres`） |
| **64 位 makensis** | negrutiu/nsis ≥ 3.13 | 编译 NSIS 安装包。**官方 NSIS 只有 32 位，在「系统禁跑 32 位 PE」的机器上不可用**，脚本会自动下载 amd64 版本 |
| WebView2 Runtime | 任意 | Win11 自带；Win10 若缺失，程序启动时弹原生提示并打开官方下载页 |

## 3. 构建两种 Windows 产物

```bash
cd mah-le-mah
npm install
npm run build            # 先 build:portable（cargo 编译 exe），再 build:nsis（makensis 编译安装包）
npm run release          # 为 dist/ 全部交付物生成 SHA256SUMS.txt
```

产物：

```
dist/MahLeMah-Portable-v2.0.0.zip   # 解压 → MahLeMah.exe + WebView2Loader.dll + 便携版说明.txt
dist/MahLeMah-Setup-v2.0.0.exe      # NSIS 安装程序（amd64）
```

`build:portable.mjs` 会用 `cargo build --release --target x86_64-pc-windows-gnu` 编译
`MahLeMah.exe`（已做 LTO/strip/opt-level=z 瘦身，约 2.9 MB），连同 `WebView2Loader.dll`
装进绿色目录后打 zip。`build_nsis.mjs` 调用 64 位 `makensis` 把同一份文件编译成安装包。

> 若机器只有 MSVC 工具链，把 `build:portable.mjs` 第一候选改成 `cargo build --release`
> 即可；Tauri 官方 NSIS 打包器同理需要 64 位 makensis，本仓库统一改用 negrutiu 的 amd64 构建。

纯前端预览（不启动 Tauri）：

```bash
cd src && python -m http.server 8765
# http://127.0.0.1:8765/index.html
# 调试：?lv=2 | ?lv=2&demo=lose | ?demo=win | ?demo=pause | ?demo=used
```

---

## 4. 玩法与关卡（断崖式两关制）

**只有两关**，通关第 2 关即「毕业」。两关都包含**完整的 16 种牌型**。

| 关卡 | 牌数 | 结构 | 牌型 | 洗牌 | 撤销 | 移出 3 张 | 复活 | 定位 |
|---|---|---|---|---|---|---|---|---|
| 1 | **48** | 三层紧凑金字塔（7×3 / 5×3 / 4×3，单区域） | **16** | 3 | 3 | 3 | 1 | 教学关，正常玩必过 |
| 2 | **240** | 多区域交叉遮挡（中央主堆 + 左右盲盒长条 + 底部保留区） | **16** | 3 | 3 | 3 | 1 | 正式关，强难度 |

牌型为原创 16 种（见 `src/game/tile_types.js` 唯一注册表），全部为 Canvas 路径绘制、独立配色：

```
幺鸡 红中 青發 蓝框 金筒 三筒 双竹 五竹 梅花 兰花 金菊 锦鲤 弯月 朝阳 祥云 星芒
```

每种牌型在两关里 ID 与配色完全一致；缩小到手机尺寸靠「色相 + 图案形状」双重区分。
L1 每种 3 张（16×3=48）；L2 各类型组数不同（共 80 组 ×3 = 240）。

### 4.1 布局由 seed 程序化生成（旧 `layout_templates.js` 已删除）

> **历史数据标注**：本节的 `L1_TUTORIAL 48 张 / L2_MULTI_ZONE 240 张` 是
> **无档位兼容路径**（`levelParams(level)` 不传 `profileId`）的旧版静态模板，
> 仅供旧工具与旧存档回放使用，**不是当前实际游玩的牌数**。
> 当前实际牌局由 `src/game/layout_profiles.js` 按档位生成
> （L1 `24/30/36/48` 张、L2 `192–321` 张，见 §0.2）。

两关由**明确的模板数据**驱动，不靠手写坐标散落各处：

- **L1_TUTORIAL**（旧静态模板）：单区域 `core`，3 层 `[21,15,12]`，紧凑金字塔，无跨区域遮挡；
- **L2_MULTI_ZONE**（旧静态模板）：4 区域 `core[45,39,33,27,21,9,6]`（7 层）+ `sideLeft[4,4,4]` +
  `sideRight[4,4,4]` + `reserve[18,18]`，共 240 张；区域在坐标上互相咬合，
  主堆外沿被两侧条压住、底沿被保留区压住，上层消除后逐层暴露下层。
- **当前档位路径**：`generateProfileLayout(seed, profile)` 按 `layerPlanFor(profile)`
  生成主堆 + 44 张盲盒队列，L1 为单区域紧凑堆，L2 为主堆 + `sideLeft/sideRight/reserve`。

**校验与归一职责分离（测试有效性核心）**：

- `validateTemplate(原始模板)`：**严格校验，不修改任何数值**。数组长度不一致、牌数非法、
  网格容量不足、坐标不在半格晶格 / 越界、全局层号重复、`crosses` 目标不存在或与几何不符
  —— 一律直接报错，**不静默修正、不自动截断**。
- `clampTemplate(原始模板)`：先跑 `validateTemplate`，非法直接 `throw`；合法时只做默认值填充与
  数组复制。它是运行时防御性归一（`templateFor` 用），**不再被 validateTemplate 调用**。

所有坐标落在半格晶格整数倍上（零随机抖动），同层相交面积恒为 0，外扩 4px 后连通分量 = 1。

### 4.2 核心规则（`src/game/engine.js`）

- 点击可点牌 → 飞入 7 格槽位；**若槽内已有同花色牌，插到最右侧那张同花色之后**，否则放最右端；
- 同花色满 3 张 → 先播入槽动画，**延迟 200ms 再消除**，`pendingMatch` + `resolving` 防重入；
- 入槽后 7 格已满且未触发消除 → 判负；
- 遮挡是**几何判定**：存在 `z` 更高且仍在盘面的牌，与本牌矩形交集 `> TILE_AREA * 0.10`
  即被压住，不可点、渲染时整牌叠 `rgba(0,0,0,0.45)` 起的分级压暗
  （压深每多一层 +0.05，上限 0.62）；可点牌保持亮度并加浅色描边；
- 道具：洗牌（只重排盘面剩余牌的 `type`，每种花色数量不变）、撤销（历史栈回退一步）、
  移出（槽内最左 3 张，不足 3 张则全部移入临时区，点击临时区可放回）各 3 次；
- 复活 1 次：**只清空槽位与临时区，不赠送 / 不重置道具**。

`slotInsert` / `slotMatchTypes` / `resolveSlot` / `isCovered` 都是不依赖 DOM 的纯函数，
Node 里可直接 `import` 做断言。

### 4.3 六种难度评估机器人（`src/game/robots.js`）

难度系统用六种策略机器人量化关卡可解性与难度，每种策略**只实现一次**、互不重复：

| 策略 | 行为 | 用途 |
|---|---|---|
| `random` | 随机点可点牌 | 难度门槛下限（必败证明「不乱点不行」） |
| `greedy` | 优先凑三消（完整信息） | 证明「关卡可解」 |
| `noisy` | greedy + 10% 失误 | 衡量失误惩罚 |
| `lookahead` | 1 步前瞻，避免把自己逼进死局 | 强策略上界 |
| `montecarlo` | 随机浅模拟选最优即时动作 | 中等偏强 |
| `search` | 受限回溯搜索 | 强策略上界（决策最慢） |

发布压力测试每关 **1000 seed × 6 策略 = 6000 局**（见 `reports/DIFFICULTY.md`）：
L1 贪心 98.7% 通关，L2 贪心 72.7% / 前瞻 91.2% 通关，random 在两关均 0%。
**证书 / 可解性 verify 1000/1000 全过**——即每局生成的牌堆都保证可解，不会产出死局牌堆。

> 口径：随机机器人 100% 失败**不构成**「难度成功」的证据，只是难度门槛之一；
> 完整信息贪心的高通关率只证明「关卡可解」，不代表真实玩家难度。

---

## 5. 音效与内置背景音乐（2026-11-12 起）

音效与音乐是**两条完全独立的链路**：音效由 Web Audio API 实时合成、自建唯一
AudioContext；音乐只用一个 `HTMLAudioElement`。点击音效不会被音乐加载 / 淡入拖慢，
音量、开关、静音各自独立。

### 内置音乐资源

| 场景 | 曲目 | 来源 |
|---|---|---|
| `title` 标题页 | 标题场景音乐.wav | 用户提供的 5 个 wav，原文件保留在 `src/assets/music/` |
| `level1` 第一关 | 第一关场景音乐.wav | 同上 |
| `level2` 第二关 | 第二关场景音乐.wav | 同上 |
| `win` 胜利 | 过关场景音乐.wav | 同上 |
| `lose` 失败 | 失败场景音乐.wav | 同上 |
| `graduated` 全部通关 | （无内置曲目，静音） | 可后续导入 |

`tools/gen_music_manifest.mjs` 用**现有的** `matchScene()` 按文件名做 exact 匹配，
生成 `src/game/music_manifest.js`：5 首 wav 以 `data:audio/wav;base64,` 内嵌，
所有运行版本（网页版 `index.html`、独立 `MahLeMah.html`、中文名副本、
`MahLeMah-legacy.html`、Tauri 的 `src/` 前端）共用同一份文件与同一份映射。
产物不含外部音频 src、不依赖开发机路径、不发起网络请求；Tauri CSP 的
`media-src` 已放行 `data:` / `blob:`（旧值 `none` 会拦住所有音频）。
用户后来通过「导入 / 管理背景音乐」加入的曲目只追加，不替换 / 删除内置资源。

### 播放链路

```
首次 pointerdown / keydown / touchstart
  → Sound.ensure()（音效解锁）
  → MusicPlayer.unlock()（音乐解锁）→ 自动按当前场景播放
之后每帧 syncMusic()：sceneOf(game) 变化时 playScene(scene)
```

- 首次点击前不创建、不播放 audio（遵守浏览器自动播放限制）；
- `playScene()` 先停旧曲再起新曲，**任意时刻最多一个实例**，禁止双曲重叠；
- 600ms 淡入、单曲循环；同场景多首随机且不连续重复；
- 加载 / 解码 / `play()` 被拒绝全部捕获：记录 `lastError`，自动尝试同场景下一首，
  整场失败才静音，不让异常冒泡进游戏；
- 暂停：现有配置没有 `pause` 场景，沿用当前关卡曲目（不误切回标题曲）；
- `window.__MAH_MUSIC_STATUS__()` 暴露真实播放状态（paused / currentTime / 实例数 /
  当前曲目），供调试面板与真机验证读取。

### 验收

- `node test-music-playback.js`：69 项模拟音频 + 四版本集成断言（含 5 首载荷与 manifest 逐字节一致）；
- `node tools/music_real_playback.mjs`：**Edge 真实鼠标解锁 + `currentTime` 实测前进**，
  网页版 / 独立 HTML 版 / ES5 legacy 版共 54/54 通过；
- `test.js [8c]` 与 `test-build-consistency.js [6]` 检查 4 个产物的内嵌载荷、
  场景映射一致性、无外链音频、资源指纹。

> 桌面版 exe / Windows 安装版因本机 Rust 编译被系统策略拒绝（build script
> `os error 5`）**未重建**，其真机播放**未运行**，见 `reports/FINAL_ACCEPTANCE.md`。

---

## 6. 体积控制

| 手段 | 效果 |
|---|---|
| 无前端框架、无 UI 库、无打包器 | 前端资源 ≈ 80 KB 纯文本（移除 BGM 后较上一版 −27 KB） |
| 无任何图片/字体/音频文件 | 0 KB 资源，全部代码 / 实时合成生成 |
| Rust `opt-level="z"` + `lto` + `strip` + `panic="abort"` + `codegen-units=1` | 主程序约 2.9 MB |
| 不捆绑 WebView2 | 直接用系统运行时，避免 +100 MB |

---

## 7. 验收清单

**结构断言（`node test.js`，失败即 `process.exit(1)`；当前真实结果见 `TEST_REPORT.md` / `reports/TEST_OUTPUT_DYNAMIC_PROFILES.txt`）**
> 2026-11-10 冻结版曾实测 1012 项全过；当前源码新增分档难度验收后，
> 有 **11 项 Wilson 上界断言因规格 5.1 与 5.2 数学互斥而失败**，按「不许放宽阈值」如实保留，
> 详见 `TEST_REPORT.md §6`。本轮新增的 `[14]` 节（统一入口 / 签名 / 最近三局）全部通过。
- [x] 16 种牌型注册表：ID/名称/配色三元组唯一，`validateRegistry()` 通过
- [x] 第 1 关 4 个档位（24/30/36/48 张）、第 2 关 10 个档位（192–321 张），全部按档位配额三消
- [x] 第一关最近三局牌数 / 布局签名 / 几何签名差异化（冻结口径，100 局回归）
- [x] 第二关 20 套全局形状：ID / 轮廓掩膜 / 结构参数 / 结构签名 / 等价几何签名全部唯一（`test-l2-templates.js` 262/0）
- [x] 第二关 20 套 × 3 组档位共 60 局：牌数 / 层级 / 坐标 / 遮挡 / 零悬空 / 消除后暴露 / 真实开局安装全部合法
- [x] 第二关 190 对两两结构差异全部 < 0.60（结构 sim 最大 0.4438 / 主堆布局 sim 最大 0.4284 / 越界 0）
- [x] 主堆落牌全部在模板掩膜格内，且覆盖掩膜全部连通区域（60 局实测越界 0 张 / 覆盖不足 0 例）
- [x] 第二关最近 10 局模板级 + 几何级零重复；双关各 100 局连续生成零失败，历史跨重启有效
- [x] 第一关完全冻结：修改前 20 条基线逐项零漂移，强传 templateId 也不进入模板路径（`test-l1-frozen.js` **56/0**）
- [x] 第二关 20 套 × 10 档位共 200 局：生成后 / 安装后 / 渲染前三段几何校验全部与缩略图模板逐格一致，保真失败 0（`test.js` 631/0）
- [x] 第二关旧布局生成路径已彻底删除：`generateLevel(2)` 缺 templateId 必抛错，9 条旧记录（无 templateId / 缺保真结论）全部明确报错，不重放、不回退
- [x] 渲染前校验失败时整屏报错且零牌绘制（`reports/l2-render-guard-output.txt`：篡改一张牌 → 错误页、异常 0、rAF 存活）
- [x] 4 个 HTML 产物均内嵌 20 个 templateId 与双重去重逻辑，构建一致性 110/0
- [x] 两个 HTML 与 `src/` 内嵌 bundle 逐字节一致（`test-build-consistency.js`）
- [x] 第二关掩膜定义合法：5 行 × 9 列、只含 `# @ .`、可落牌格 ≥ 20（20/20 实测通过）
- [x] 同层相交面积恒为 0；坐标落半格晶格整数倍；零随机抖动
- [x] 连通性口径：L1 主堆单连通；第二关主堆连通分量数 == 掩膜 4 邻域分量数（双核心 2 / 三岛屿 3 / 四角围合 4），每区域均有牌。**「L2 默认（非模板）路径」已删除，不再有该路径的连通性口径**
- [x] L1 / L2 可解性证书 + 几何复核 1000/1000（发布测试）
- [x] 槽位插入 / 三消 / 200ms 延迟防重入 / 撤销 / 移出临时区 / 洗牌 / 复活
- [x] Tauri 配置 `bundle.targets=["nsis"]`；Rust 存档加固（64KB 上限 + 字段白名单 + 版本校验 + 原子写）
- [x] 音频最终态：生产源码零 BGM 模块、四个 HTML 零 BGM 标记、仅音效且真机可发声、旧档兼容

**硬指标（全部达标）**
- [x] L1 greedy 通关率 ≥ 50%（实测 98.7%）；L1 可解性 1000/1000
- [x] L2 证书 verify 1000/1000（每局可解，零死局牌堆）
- [x] random 两关均 0%（难度门槛成立）
- [x] 验收 seed 池存在（L2 用，240 个）；运行时生成平均 35ms ≤ 400ms

**软指标（如实报告，不改阈值、不改测试让它变绿）**
- [ ] **✗ 带 10% 失误玩家通关率 ≤30%** —— L2 noisy 实测 54.8%（失误惩罚已体现：greedy 72.7% > noisy 54.8%）
- [ ] **✗ 失败局进度中位数 ≥50%** —— L2 greedy 实测 28.7%（死局相对后置，但阈值偏严）
- [ ] **✗ 平均槽位占用 ≥3.0** —— L2 实测 2.71（结构上限使然）
- [ ] **✗ 开局可点花色 ≥10 种** —— L2 实测 9.0（仍在合理区间）
- 阈值、测试逻辑、实测值均未改写；详见 `reports/DIFFICULTY.md` 与 `TEST_REPORT.md`。

**构建与兼容**
- [x] `npm test` = `node test.js && node tools/test_render.mjs`；渲染冒烟全过
- [x] `npm run build:web` / `build:legacy`：两个单文件 HTML 均生成
- [x] `npm run build`：Portable zip + NSIS exe 均真实生成
- [x] 安装→卸载真实验证：标准卸载入口 / 注册表 / 开始菜单均正确创建与清理；卸载默认保留存档

---

## 8. 知识产权自查

1. **无任何外部素材**：仓库内不存在图片、音频、字体、视频文件；`icons/` 下的 PNG/ICO 由
   `tools/gen_icon.py` 现场生成。
2. **16 种牌型为原创符号集**：幺鸡 / 红中 / 青發 / 蓝框 / 金筒 / 三筒 / 双竹 / 五竹 / 梅花 / 兰花 /
   金菊 / 锦鲤 / 弯月 / 朝阳 / 祥云 / 星芒——均为本项目 Canvas 路径绘制，未参考任何商业游戏。
3. **不含任何背景音乐**：生产包已移除全部音乐引擎与曲谱，不复制、不引用、不改编任何
   第三方游戏 / 唱片旋律，彻底回避 BGM 版权边界问题。
4. **Logo / 文案 / 算法 / 音效** 均为本项目原创实现，音效由 Web Audio 实时合成。

---

## 9. 常见问题

| 现象 | 处理 |
|---|---|
| `cargo: command not found` | 安装 Rust：<https://rustup.rs>，并 `rustup toolchain install stable-x86_64-pc-windows-gnu` |
| NSIS 安装包没生成 | 需要 64 位 makensis；`build_nsis.mjs` 会自动下载 negrutiu/nsis（amd64） |
| 启动白屏 | 检查 `frontendDist` 是否指向 `src`；dev 构建按 `F12` 看控制台 |
| 提示缺少 WebView2 | 程序弹原生提示并打开官方下载页，安装后重启即可 |
| 存档不生效 | 确认 exe 所在目录可写（不要放在 `C://Program Files` 下）；浏览器预览用 localStorage |
| `MahLeMah_Data` 出现在桌面 | 因为 exe 就放在桌面。数据永远跟着 exe 走，这是绿色版的设计 |
| SmartScreen 拦截 | 未签名程序的正常提示，点「更多信息 → 仍要运行」 |
| 安装版卸载后残留 | 默认保留 `MahLeMah_Data`；如需一并删除，卸载时在询问框选「是」 |
