# 交付说明 · v2.0.0（16 牌型 / 双关卡 / 内置背景音乐 / 双 Windows 产物）+ 2026-11-13 本轮增量（第二关规格驱动生成 / 三段几何校验 / 旧布局生成路径删除）

> 本文件是交付的权威说明。代码的唯一真实来源是仓库源文件，本文件不贴源码全文。
> **牌数口径**：旧版的「第一关固定 24 张 / 第二关 222 张、8/15 种牌型、葫芦单堆」是
> 历史数据。当前源码第 1 关有 4 个合法档位（24 / 30 / 36 / 48 张），
> 第 2 关有 10 个合法档位（192–321 张）；222 张从未出现在当前配置中。
> 「游戏内自删除卸载」已彻底移除。详见 `RELEASE_NOTES.md` / `CHANGELOG.md`。

---

## 0.00 2026-11-13 本轮增量（第二关规格驱动生成 + 三段几何校验 + 旧路径删除）

> 20 套模板与掩膜不变，**变的是「掩膜 → 真实牌位」这一段**：上一版逐张打分挑格，
> 同一模板换 seed 就能长成另一个轮廓；本版把「每层占哪些格、落在格的哪个四分之一」
> 抽成与 seed 无关的显式规格，生成 / 安装 / 渲染三段都拿同一份规格逐格比对。
> 旧的第二关默认生成路径已删除，缺 `templateId` 一律明确报错。

| 类别 | 文件 | 说明 |
|---|---|---|
| 规格层（新增） | `src/game/l2_spec.js` | `MAH-L2-SPEC-v2`：掩膜 → 4 邻接图 → 多源 BFS 走位序（最多 5 起点、半径 10）→ 逐格相位 + 半格错位极性 → `specPlan()` 给出每层格集合；`checkFidelity()` 逐格比对；`specSummary()` 供报告取证 |
| 生成 | `src/game/l2_geometry.js` | 完全按 `specPlan()` 落牌（不再逐张打分）；接受时写入 `specFillRot`；新增 `verifyTemplateFidelity()`（安装后 / 渲染前共用，从 templateId + 档位重新展开再比对）；`describeTemplateLayout()` 增 `mainBox` / `visible` |
| 入口 | `src/game/generator.js` | 第二关**必须显式** `templateId`，缺失即抛错；返回 `templateId` / `specFillRot` |
| 引擎 | `src/game/engine.js` | `startLevel` / `restartLevel` 第二关缺 templateId 抛错；`installLevelData()` 安装后再校验一次，不一致抛错并列出违规项 |
| 渲染 | `src/main.js` | 第三道（渲染前）校验，按 `boardRev` 缓存；失败整屏错误页写明模板与违规项，不画牌、不保留上一帧；错误只报一次控制台，不打死 rAF |
| 存档校验 | `src/game/new_game.js` | 无 `templateId` 的旧记录不再重放；校验新增 `fidelityOk`，失败记 `violations` / `NO_FIDELITY` |
| 清理 | `src/game/config.js` / `l2_templates.js` | 删除无引用的 `ZONE_ANCHORS` 与失效注释；`growth` / `layerShape` / `curve` 等字段保留为形状说明性元数据，不再参与落牌 |
| 取证 | `reports/l2-render-guard-output.txt` | 人为把一张牌挪出半格晶格后：整屏错误页、零牌绘制、未捕获异常 0、rAF 存活 |

**真实运行结果（本轮最终复跑，全部 EXIT=0）**

| 命令 | 结果 |
|---|---|
| `node test.js` | **631 通过 / 0 失败**（含第二关 20 套 × 10 档位 = 200 局三段保真；L2 平均 8.50 ms/局；压深最低档 L2-8 ≥ 4.23 ≥ 门槛 4.20） |
| `node test-random-generation.js` | **7788 / 0**（第一关 100 局 + 第二关 100 局） |
| `node test-l2-templates.js` | **262 / 0**（60 局、190 对：结构 sim 最大 0.4438、主堆布局 sim 最大 0.4284、越界 0） |
| `node test-l1-frozen.js` | **56 / 0**（第一关基线零漂移 + 「9 条旧第二关记录必须全部报错」） |
| `node test-layout-position.js` | **35 / 0** |
| `node test-music-playback.js` | **69 / 0** |
| `node test-build-consistency.js` | **110 / 0**（4 个 HTML 的 templateId 集合与源码一致） |
| `node tools/test_render.mjs` | 27/27 场景 |
| `node tools/browser_smoke.mjs` | `allPassed=true` |
| `node tools/music_real_playback.mjs` | 54/54（网页版 / 独立 HTML / ES5 legacy） |

200 局中：生成抛错 0、保真失败 0、悬空 0、开局可点全部 19–25、掩膜 27–40 格、
20 套规格签名两两互异；4 个 HTML 产物由当前 `src/` 重建（`buildVersion=2.0.0-66fe78b`）。

**未运行 / 未重建（如实标注）**

- `cargo check` / `cargo build` **未运行成功**：本机缺 MSVC `link.exe`
  （Git Bash 下还被 GNU `link` 遮蔽），Rust 依赖 build script 无法链接。
- 桌面版 exe / Windows 安装版 / Portable zip / Setup.exe / SHA256SUMS.txt
  **未用本轮源码重建**，仍是旧冻结产物；桌面版真机音乐播放未运行。
- 本轮未重跑 `npm run test:release`（12000 局发布压力测试）。

---

## 0.0 2026-11-13 增量（第二关 20 套指定全局形状 + 最近 10 局双重去重）

> 本节描述的 20 套模板 / 掩膜体系仍然有效，但「掩膜 → 牌位」的落牌算法已被上面
> 0.00 节的**规格驱动 + 三段校验**取代（`growth` / `layerShape` / `curve` 不再参与落牌）。
> **本节下列数值是上一版口径**（`test.js` 625/0、`test-l1-frozen.js` 64/0、结构 sim 0.4104 /
> 布局 sim 0.3560、9 条 L2 默认路径「零漂移」），与当前状态不同：当前为 631/0、56/0、
> 0.4438 / 0.4284，且那 9 条旧记录现在必须**报错**。以 `## 0.00` 与
> `reports/FINAL_ACCEPTANCE.md` 为准。

> 本版取代同日早些时候的「50 套参数化结构模板」版本：不再靠 zones / shapes / trajectory
> 参数拼差异，而是每套模板一份 **5 行 × 9 列显式轮廓掩膜**，轮廓、区域分布、层级遮挡
> 由掩膜直接决定。20 个形状按需求逐一落实：中心金字塔 / 双核心 / 三岛屿 / 环形围绕 /
> 十字交叉 / 阶梯上升 / 阶梯下降 / 左侧巨塔 / 右侧巨塔 / 上下双层岛 / 蝴蝶形 / 沙漏形 /
> 迷宫形 / 棋盘形 / 弧形月牙 / 波浪形 / 对角双塔 / 四角围合 / 中心十字岛 / 不规则大陆形。

| 类别 | 文件 | 说明 |
|---|---|---|
| 20 套形状 | `src/game/l2_templates.js` | 7 个形状族共 20 套，唯一 `templateId` + 5×9 显式轮廓掩膜 + 结构参数与结构签名；完整 ID / 掩膜清单见 `reports/l2-templates-report.md` |
| 真实落牌 | `src/game/l2_geometry.js` | 只在掩膜格内逐层落牌；底层覆盖全部连通区域，其余层按形状分 + 层号扰动 + 覆盖补偿选格；开局可点 19–25 张、主堆零悬空、44 张盲盒队列不变 |
| 几何签名 | `src/game/l2_structure.js` | 坐标 / 层级 / 区域 / 轮廓 / 遮挡 / 可操作区 + 平移与镜像归一化的等价几何签名 |
| 去重判定 | `src/game/l2_recent.js` | 模板级 + 几何级双重去重纯函数；候选池不足时抛 `TEMPLATE_POOL_EXHAUSTED`，不静默复用 |
| 生成入口 | `src/game/new_game.js` / `generator.js` | 第二关独立分支；第一关代码路径逐字未改，L2 默认路径逐字节不变 |
| 历史持久化 | `src/game/recent_games.js` / `save_data.js` / `src-tauri/src/main.rs` | L1 窗口 3（冻结）/ L2 窗口 10；15 字段白名单（12 必填 + 3 可选），旧档兼容 |
| 调试面板 | `src/main.js` | 第二关显示模板 ID、结构签名、等价几何、去重算法与四项 PASS-FAIL |
| 产物 | `dist/MahLeMah.html`、`index.html`、`Mah了个Mah.html`、`MahLeMah-legacy.html` | 全部由当前 `src/` 重建，各内嵌 20 个 `templateId` 与 5 首内置音乐 |
| 形状缩略图 | `tools/l2_thumbnails.mjs` | 20 套各真实生成一局并画俯视图：`reports/l2-thumbnails.html` / `.json` / `.png` |
| 新测试 | `test-l2-templates.js` / `test-l1-frozen.js` | 20 套 262/0、第一关冻结 64/0 |
| 报告 | `reports/l2-templates-report.*`、`l1-frozen-report.*`、`random-generation-report.*`、`build-consistency-report.*`、`l2-100-games.txt` | 全部由真实运行生成 |

**真实运行结果（本轮最终复跑）**

| 命令 | 结果 |
|---|---|
| `node test.js` | **625 通过 / 0 失败 / EXIT=0** |
| `node test-random-generation.js` | **7788 / 0**（第一关 100 局 + 第二关 100 局） |
| `node test-l2-templates.js` | **262 / 0**（20 套 × 3 组 = 60 局、190 对差异、掩膜与区域覆盖、等价几何、12 局重开入口） |
| `node test-l1-frozen.js` | **64 / 0**（20 条 L1 基线 + 9 条 L2 默认路径基线零漂移） |
| `node test-layout-position.js` | **35 / 0** |
| `node test-music-playback.js` | **69 / 0** |
| `node test-build-consistency.js` | **110 / 0**（4 个 HTML 模板 ID 集合一致） |
| `node tools/test_render.mjs` | 27/27 场景通过 |
| `node tools/browser_smoke.mjs` | `allPassed=true`（两个 HTML 各 4 局 L1 + 4 局 L2，历史跨页继承） |
| `node tools/music_real_playback.mjs` | 54/54（网页版 / 独立 HTML / ES5 legacy 真机播放） |

20 套 190 对结构 sim 最大 **0.4104**、主堆布局 sim 最大 **0.3560**，全部 < 0.60；
主堆逐层占位格轮廓 **20/20** 种互不相同；第二关连续 100 局任意连续 10 局模板零重复、
窗口内 4 类重复均为 0（`reports/l2-100-games.txt`）；第一关 20 条修改前基线逐项零漂移。

**未运行 / 未重建（如实标注）**

- `cargo check` / `cargo build` **未运行成功**：本机缺 MSVC `link.exe`
  （Git Bash 下还被 GNU `link` 遮蔽），Rust 依赖 build script 无法链接。
- 桌面版 exe / Windows 安装版 / Portable zip / Setup.exe / SHA256SUMS.txt
  **未用本轮源码重建**，仍是旧冻结产物；桌面版真机音乐播放未运行。
- 本轮未重跑 `npm run test:release`（12000 局发布压力测试）。

> 修改文件清单、Git commit ID 与最终验收结论见 `reports/FINAL_ACCEPTANCE.md`
> 与 `reports/MODIFIED_FILES.md`。

---

## 0. 2026-11-12 本轮增量（音乐集成 + 布局修复）

| 类别 | 文件 | 说明 |
|---|---|---|
| 音乐资源 | `src/assets/music/*.wav`（5 首） | 用户原有音频，未替换 / 删除 |
| 音乐清单 | `src/game/music_manifest.js` + `tools/gen_music_manifest.mjs` | data URI 内嵌，6 场景统一映射，所有产物同源 |
| 播放链路 | `src/game/music_player.js` / `src/main.js` / `src/game/render.js` | 首次点击解锁、单实例、自动切场景、失败降级、音量与音效隔离 |
| 桌面配置 | `src-tauri/tauri.conf.json` | `media-src` 放行 `data:` / `blob:` |
| 布局 | `src/game/layout_profiles.js` | 第一关按真实包围盒动态居中（重心 550–572 / 中心 557） |
| 差异化 | `src/game/recent_games.js` / `new_game.js` / `src-tauri/src/main.rs` | `HISTORY_LIMIT=3`，牌数 + 签名 + 几何相似度三重判定 |
| 产物 | `dist/MahLeMah.html`、`index.html`、`Mah了个Mah.html`、`MahLeMah-legacy.html` | 全部重建，各内嵌 5 首音乐；逐字节一致性 71/0 |
| 新测试 | `test-layout-position.js`、`test-music-playback.js`、`tools/music_real_playback.mjs` | 布局 35/0、音乐 69/0、Edge 真机播放 54/54 |
| 报告 | `reports/layout-position-report.*`、`music-playback-report.*`、`music-real-playback-report.json`、`random-generation-report.*`、`build-consistency-report.*` | 全部由真实运行生成 |

**未运行（如实标注）**：桌面版 / Windows 安装版 exe 因本机 Rust build script 执行被系统
拒绝（`os error 5`）未重建，其音乐真机播放未验证；旧 exe 不含本轮音乐功能。

---

## 0.1 2026-11-11 增量（随机生成系统重构，历史）

| 类别 | 文件 | 说明 |
|---|---|---|
| 统一生成模块 | `src/game/new_game.js` | `createNewGame()`，50 次重试上限、明确失败错误 |
| 历史模块 | `src/game/recent_games.js` | 两关独立最近三局、白名单、损坏容错 |
| 签名模块 | `src/game/layout_signature.js` / `sha256.js` | 几何 / 分布 / 主签名，纯 ES5 同步 SHA-256 |
| 调试面板 | `src/main.js` | `?dev=1`，正式版隐藏，全部真实运行数据 |
| 构建元信息 | `src/game/build_info.js` / `tools/bundle_shared.mjs` | 注入 buildVersion / gitCommit / sourceHash / buildTimestamp |
| 网页产物 | `dist/MahLeMah.html` / `dist/MahLeMah-legacy.html` | 由当前 `src/` 重新构建（另含 `index.html`、`Mah了个Mah.html` 同内容副本） |
| 自动化测试 | `test-random-generation.js` / `test-build-consistency.js` / `tools/browser_smoke.mjs` | 200 局 / 一致性 / 真实浏览器 |
| 报告 | `reports/random-generation-report.{json,md}`、`reports/build-consistency-report.{json,md}`、`reports/browser-smoke-report.json`、`reports/CODE_AUDIT.md`、`reports/FINAL_ACCEPTANCE.md`、`reports/MODIFIED_FILES.md` | 全部由真实运行生成 |
| 文档 | `README.md` / `CHANGELOG.md` / `DELIVERY.md` / `RELEASE_NOTES.md` / `TEST_REPORT.md` | 与当前源码、实际测试报告同步 |

**真实运行结果（详见各报告）**

- `node test-random-generation.js`：两关各 100 局，**5053 项断言通过 / 0 失败 / EXIT=0**。
- `node test-build-consistency.js`：**48 项断言通过 / 0 失败 / EXIT=0**，两个 HTML 内嵌 bundle 与 `src/` 逐字节相同。
- `node tools/browser_smoke.mjs`：Edge `157.0.4341.42` 真实打开两个 HTML 各生成 4 局，
  `allPassed=true`，零 JS 异常；调试面板与构建注入信息均已验证。
- `node tools/test_render.mjs`：27 个渲染场景全部通过。
- `node test.js`：本轮新增 `[14]` 节与 `[13]` / `[8b]` 更新断言全部通过；
  **11 项 Wilson 上界断言仍失败**（规格 5.1/5.2 数学互斥，按「不许放宽阈值」原样保留）。

**未执行 / 未重建（如实说明）**：桌面 exe、Portable zip、NSIS Setup 仍是 2026-11-10
冻结产物，本轮未重建；Windows 真机安装 / 卸载测试未对本轮代码重新执行；
`npm run test:release`（12000 局）本轮未重跑。

---

## 1. 本次交付清单

| 类别 | 文件 | 说明 |
|---|---|---|
| 源码 | `src/game/*` | 16 牌型注册表、双关卡模板、六机器人、音效引擎（无 BGM）、严格模板校验 |
| 桌面外壳 | `src-tauri/*` | Tauri 2，4 个白名单 IPC，存档加固，最小权限 |
| A·便携版 | `dist/MahLeMah-Portable-v2.0.0.zip` | exe + WebView2Loader.dll + 说明，解压即玩 |
| B·安装版 | `dist/MahLeMah-Setup-v2.0.0.exe` | NSIS（amd64），标准卸载入口 + 确认流程 |
| 网页版 | `dist/MahLeMah.html` / `MahLeMah-legacy.html` / `Mah了个Mah.html` / `index.html` | 单文件，离线可玩 |
| 校验 | `dist/SHA256SUMS.txt` | 全部交付物 SHA256 |
| 文档 | `README.md` / `DELIVERY.md` / `RELEASE_NOTES.md` | 本交付 |
| 报告 | `TEST_REPORT.md` / `SECURITY_AUDIT.md` / `reports/DIFFICULTY.md` | 测试 / 安全 / 难度 |

> 未实际运行的测试在本文第 6 节如实标注；未实际生成的 EXE 绝不在本文声称已交付。

---

## 2. 核心数据结构

### 2.1 16 种牌型（`src/game/tile_types.js` 唯一注册表）

顺序即下标 0..15，L2 的 `mixFor(2)` 按此顺序分配组数（每组 3 张）：

```
 0 幺鸡(sparrow)    1 红中(red-centre)  2 青發(erfa)       3 蓝框(blue-frame)
 4 金筒(coin-1)     5 三筒(coin-3)      6 双竹(bamboo-2)    7 五竹(bamboo-5)
 8 梅花(flower-plum) 9 兰花(flower-orchid) 10 金菊(flower-chrys) 11 锦鲤(fish)
12 弯月(moon)       13 朝阳(sun)        14 祥云(cloud)     15 星芒(star)
```

- 三种校验：`validateRegistry()` —— ID 唯一、名称唯一、配色三元组（face/rim/ink）唯一、字段齐全、数量 = 16。
- 每种牌型在两关里 ID 与配色完全一致；缩小到手机尺寸靠「色相 + 图案形状」双重区分。

### 2.2 两关独立布局模板（`src/game/layout_templates.js`）

| 模板 | 关卡 | 总张数 | 区域 | 层计划（底→顶） | 跨区域交叉遮挡 |
|---|---|---|---|---|---|
| `L1_TUTORIAL` | 1 | **48** | 1（`core`） | `[21,15,12]`，3 层 | 无 |
| `L2_MULTI_ZONE` | 2 | **240** | 4（`core`+`sideLeft`+`sideRight`+`reserve`） | `core[45,39,33,27,21,9,6]` / 两侧条各 `[4,4,4]` / `reserve[18,18]` | core↔三区、两侧条↔reserve 双向声明且几何一致 |

- 遮挡关系一律由**几何**（矩形相交 + z 全序）计算，无第二套规则。
- 区域在坐标上互相咬合：侧条压主堆外沿，保留区压主堆底沿与侧条内下角，上层消除后逐层暴露下层。
- 全部坐标落半格晶格整数倍（零随机抖动），同层相交面积恒为 0，外扩 4px 后连通分量 = 1。

### 2.3 模板校验与归一职责分离（测试有效性）

- `validateTemplate(原始模板)`：**严格校验，不修改任何数值**。非法坐标 / 牌数非法 / 网格容量不足 /
  数组长度不一致 / 全局层号重复 / `crosses` 目标不存在或与几何不符 —— 一律直接报错，**不静默修正、不自动截断**。
- `clampTemplate(原始模板)`：先跑 `validateTemplate`，非法直接 `throw`；合法时只做默认值填充与数组复制。
- 两者不再互相调用，职责互不渗透；`test.js` 用正反例验证（合法模板通过、5 类反例全部被拒）。

---

## 3. 六策略难度机器人（`src/game/robots.js`）

每种策略只实现一次、互不重复：

| 策略 | 行为 | 在难度报告中的角色 |
|---|---|---|
| `random` | 随机点可点牌 | 难度门槛下限（两关均 0% 通关，证明「不乱点不行」） |
| `greedy` | 优先凑三消（完整信息） | 证明「关卡可解」 |
| `noisy` | greedy + 10% 失误 | 失误惩罚度量 |
| `lookahead` | 1 步前瞻避死局 | 强策略上界 |
| `montecarlo` | 随机浅模拟选最优即时动作 | 中等偏强 |
| `search` | 受限回溯搜索 | 强策略上界（决策最慢） |

**测试样本量分离**：
- 快速回归（`npm test` 的 `[7]` 段）：**40 个固定池内 seed**，每次改动即时反馈；
- 发布压力测试（`npm run test:release`）：**每关 1000 seed × 6 策略 = 6000 局 / 关，共 12000 局**。

---

## 4. 音频最终态：仅音效，无背景音乐（2026-11-10）

**用户决定**：生产包取消全部背景音乐，只保留音效；项目至此冻结，不再改动。

- 从生产源码**整体删除** `src/game/music.js`、`music_tracks.js`、`music_composer.js`；
  `main.js` / `render.js` / `config.js` / `engine.js` 中所有音乐导入、调用、按钮、设置项、
  曲目信息与标题提示一并移除。桌面 exe 与安装包重新编译，不再嵌入任何音乐资源。
- 唯一音频模块 `src/game/audio.js` 自建唯一 AudioContext：
  `master(0.10 × sfxVol) → 1600Hz 高通 → destination`；音源 1.8–4.2kHz、20–110ms。
  无 `setInterval` 调度器、无循环播放、无后台常驻音源、无压缩器与共享总线。
- 音效独立开关 `soundOn` / 音量 `sfxVol`，写入存档 `sound` / `sfxVol`；
  旧档中的 `music` / `musicVol` 读入时忽略，Rust 白名单仍保留两键以兼容旧档。
- 首次 `pointerdown` / `keydown` 才创建 AudioContext（自动播放策略合规）；
  全链路 `try/catch`，AudioContext 不可用只是无声，不影响游戏。
- **验收（2026-11-10 冻结版历史结果，非当前源码）**：`npm test` 1012 项断言全过（含「生产源码零 BGM 模块」「四个生产 HTML 零 BGM 标记」
  「音效运行时自建 ctx 并真实发声」）；headless Edge 真机实测启动后 AudioContext 数 0、
  定时器数 0、`window.__mah` 无 music 实例，点击后仅 1 个 AudioContext + 1 个音效振荡器。
- 网页版体积随之下降：`MahLeMah.html` 109.7 KB → **82.3 KB**，
  `MahLeMah-legacy.html` 145.2 KB → **116.0 KB**。

---

## 5. Windows 构建环境要求（重要）

| 组件 | 说明 |
|---|---|
| Node.js ≥ 18 | 跑构建脚本与测试 |
| Rust ≥ 1.77.2 + `stable-x86_64-pc-windows-gnu` | 编译 `MahLeMah.exe`（本机用 GNU 工具链） |
| MinGW-w64（winlibs 16.x） | GNU 链接器 `ld.exe` / `dlltool.exe` / `windres` |
| **64 位 makensis**（negrutiu/nsis ≥ 3.13） | 编译 NSIS 安装包。**官方 NSIS 只有 32 位，在「系统禁跑 32 位 PE」的机器上不可用**；`build_nsis.mjs` 会自动下载 amd64 版本 |

构建命令：`npm install && npm run build`（= `build:portable` 编译 exe 后 `build:nsis` 编译安装包），
再用 `npm run release` 生成 `SHA256SUMS.txt`。

---

## 6. 未执行 / 未达标项（如实上报，不谎报）

- **4 项难度软指标未达标**（阈值与实测值均未改写，在 `npm test` 中以 `✗` 标注）：
  - 带 10% 失误玩家通关率 ≤30% —— L2 noisy 实测 54.8%
  - 失败局进度中位数 ≥50% —— L2 greedy 实测 28.7%
  - 平均槽位占用 ≥3.0 —— L2 实测 2.71
  - 开局可点花色 ≥10 种 —— L2 实测 9.0
- **无 EXE 谎报**：`MahLeMah.exe`（便携与安装版共用）已在本机真实编译（GNU 工具链，`opt-level=z` 约 2.9 MB），
  Portable zip 与 NSIS exe 均已真实生成并校验（`SHA256SUMS.txt`）。安装→卸载已真实验证通过。
- **Tauri 官方 NSIS 打包器未使用**：受「系统禁跑 32 位 PE」限制，改用 negrutiu 的 64 位 makensis
  经 `tools/make_installer.nsi` 编译安装包；`tauri.conf.json` 仍声明 `bundle.targets=["nsis"]` 表达交付意图，测试据此验收。

---

## 7. 复现命令

```bash
npm install                                  # 安装开发依赖
npm test                                     # node test.js + 27 个渲染场景冒烟（当前 11 项 Wilson 断言失败，见 TEST_REPORT.md §6）
node test-random-generation.js               # 两关各 100 局 → reports/random-generation-report.{json,md}
node test-build-consistency.js               # 两个 HTML ↔ src 逐字节一致性 → reports/build-consistency-report.{json,md}
node tools/browser_smoke.mjs                 # Edge CDP 真实浏览器 → reports/browser-smoke-report.json
npm run build:all                            # 从当前 src 重建两个单文件网页版
npm run build                                # Portable zip + NSIS exe（本轮未执行）
npm run test:release                         # 每关 1000 seed × 6 机器人 = 12000 局（本轮未执行）
npm run release                              # dist/SHA256SUMS.txt
```

---

## 8. 本轮修订：动态档位系统（源码层，未重新发版）

> `dist/` 下的网页版 / Portable zip / NSIS Setup 仍是 2026-11-10 冻结产物，
> 本轮**未重新构建**，`SHA256SUMS.txt` 与本文件 §1–§4 的校验和继续有效。
> 档位表、存档字段、抽取时机详见 `README.md` §0.2。

### 8.1 修改文件清单

| 文件 | 状态 | 变更 |
|---|---|---|
| `src/game/config.js` | 改 | 10 个 L2 / 4 个 L1 静态档位表、`rollProfile`、层张数插值、`levelParams(level, rand, profileId)`、`RETRY_KEEPS_PROFILE` live binding |
| `src/game/layout_profiles.js` | **新增** | 档位驱动布局：半格晶格 / 沙漏轮廓 / 44 张盲盒队列 / 同层零重叠 / z 全序 |
| `src/game/save_data.js` | **新增** | `makeSaveData` / `applySaveToGame`：毕业写 `level=1`、`best` 保持、`p1`/`p2` 容错 |
| `tools/gen_profiles.mjs` | **新增** | 大盘档枚举脚本，17 个合法 (N,T) 组合中选 8 个固化 |
| `src/game/tile_types.js` | 改 | `mixFor(level, profile)` 支持档位花色配额 |
| `src/game/generator.js` | 改 | `generateLevel(level, seed, {profile})`、按档位配额发牌、`validateLevel` 按当前档位校验；L1 档位路径改三张紧邻 |
| `src/game/engine.js` | 改 | `profile`、`startNewRun`、`rollCurrentProfile`、`restartLevel`、`console.info` 复现日志 |
| `src/main.js` | 改 | 启动重抽、重开重抽、毕业继续重抽、`persist(true)`、桌面异步存档不覆盖档位 |
| `src/game/render.js` | 改 | 标题页「开始新一轮」判据统一为 `graduated`；动态「下一关」文案；「重玩本关」 |
| `src/game/seed_pool.js` | 改 | 由扁平数组改为 `SEED_POOL['L2-<id>']` 分库 + `POOL_META.profiles` |
| `tools/tune_pool.mjs` | 改 | 按 10 档离线筛选，每档 40 个合格种子，缺口如实上报 |
| `src-tauri/src/main.rs` | 改 | `SAVE_FIELDS` 扩为 9 个字段，`p1`/`p2` 校验整数 `0..=63`，旧档缺字段不判非法 |
| `test.js` | 改 | 重写为 13 个节区，覆盖第 1–5 节全部断言 |
| `tools/test_render.mjs` | 改 | 截图分支适配分档 seed 池 |
| `README.md` / `RELEASE_NOTES.md` / `DELIVERY.md` / `TEST_REPORT.md` | 改 | 同步档位系统、存档字段、测试结果 |

### 8.2 `tune_pool` 生成结果（`node tools/tune_pool.mjs 200 40`）

总耗时 **116906 ms（116.9 s）**；每档 200 候选，录取 40，全档**零缺口**。
门槛：`minPending > 4`、`SOLVABLE_SHARE` 偏差 ≤3%、开局可点 19–25、
平均压深 ≥ 0.28·N、最长遮挡链 ≥ N−8、random 0 通关、强策略可解。

| 档位 | 合格种子 | 录取 | 缺口 | 耗时 |
|---|---|---|---|---|
| L2-0 | 174 | 40 | 0 | 14.8s |
| L2-1 | 167 | 40 | 0 | 10.6s |
| L2-2 | 163 | 40 | 0 | 13.0s |
| L2-3 | 171 | 40 | 0 | 13.9s |
| L2-4 | 172 | 40 | 0 | 12.1s |
| L2-5 | 171 | 40 | 0 | 13.7s |
| L2-6 | 151 | 40 | 0 | 9.8s |
| L2-7 | 180 | 40 | 0 | 12.8s |
| L2-8 | 169 | 40 | 0 | 6.4s |
| L2-9 | 173 | 40 | 0 | 9.7s |

### 8.3 存档字段变更

| 字段 | 变更 |
|---|---|
| `v` | 仍为 2 |
| `level` | 最后一关通关（`graduated`）即写 **1**，不再残留 2 |
| `best` | 保持 2，用于「已毕业」徽标 |
| `sound` / `sfxVol` | 不变 |
| **`p1` / `p2`** | **新增**：两关当前档位 id，整数 `0..=63` |
| `music` / `musicVol` | 前端不再写入；Rust 白名单保留以兼容旧档 |

`SAVE_FIELDS` 由 7 个键扩为 9 个键；旧档缺 `p1`/`p2` 时按缺省档位 0 处理，不判非法。

### 8.4 未达标项（如实上报，未放宽阈值）

规格 5.2 的通关率 Wilson 上界阈值（每档 ≤3% / 合计 ≤1%）与规格 5.1
「池内每个种子至少一条强策略可通关」互斥；真实逐档数据与断言结果见
`TEST_REPORT.md` §6。按「不许放宽阈值」要求，阈值按字面写死在 `test.js`，
未改阈值、未改测试凑数。
