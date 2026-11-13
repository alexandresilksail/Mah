# MahLeMah · 最终验收报告（第二关 50 套布局模板 + 最近 10 局双重去重）

**日期**：2026-11-13
**范围**：只修改与第二关布局模板 / 去重 / 历史持久化直接相关的代码；**第一关完全冻结**，
只允许回归测试；不改变核心玩法、牌数配置、难度体系、背景音乐与音效链路。
**流程**：先审计 → 再修改 → 再测试 → 再构建 → 最后验收。
**本轮提交**：`c410239`（提交后回填，见文末）。

---

## 0. 结论（先说不满足的部分）

**已真实通过**：50 套结构不同的第二关模板全部可生成、可正常开始游戏；最近 10 局
「模板级 + 几何级」零重复且跨应用重启有效；第一关 20 条修改前基线逐项零漂移；
4 个 HTML 产物同步重建；内置 5 首背景音乐在网页版 / 独立 HTML / ES5 legacy 真机继续播放。

**未通过 / 未运行（不标记为通过）**：

1. **Rust `cargo check` / `cargo build`：尝试后失败**。在 Git Bash 下被 GNU `link` 遮蔽
   MSVC `link.exe`（`link: extra operand`）；换 PowerShell 后明确报
   `linker link.exe not found`，即本机未安装 Visual Studio C++ 链接器，
   Rust 依赖的 build script 无法链接。这是**环境限制**，不是本轮源码编译错误。
   Rust 侧仅完成源码静态一致性断言（`test.js [8b]`、`test-build-consistency.js`）。
2. **桌面版 exe / Windows 安装版 / Portable zip / Setup.exe / SHA256SUMS.txt 未用本轮源码重建**，
   仍是旧冻结产物；桌面版真机音乐播放**未运行**。
3. 本轮未重跑 `npm run test:release`（12000 局发布压力测试）。
4. 原版《羊了个羊》内部布局数据无法获取，50 套模板只参考**可观察**布局特征，
   **不声称精确复刻原版算法**，也不含任何从原版导出的坐标数据。

---

## 1. 交付项逐条对照

| # | 规格交付项 | 位置 / 证据 | 判定 |
|---|---|---|---|
| 1 | 第二关 50 套布局模板 | `src/game/l2_templates.js`（10 类 × 5 套） | ✓ |
| 2 | 50 套模板结构及 ID 清单 | `reports/l2-templates-report.md`（ID / 名称 / 类别 / 区域 / 轮廓 / 层级曲线 / 包络 / 半格错位 / 代表布局指标） | ✓ |
| 3 | 最近 10 局去重功能 | `src/game/l2_recent.js` + `src/game/new_game.js` 的 `createLevel2Game()` | ✓ |
| 4 | 几何签名及历史持久化机制 | `src/game/l2_structure.js`、`recent_games.js`、`save_data.js`、`src-tauri/src/main.rs` | ✓ |
| 5 | 修改文件清单 | `reports/MODIFIED_FILES.md` | ✓ |
| 6 | 50 套模板差异测试结果 | `test-l2-templates.js` **539/0**、`reports/l2-templates-report.{json,md}` | ✓ |
| 7 | 连续 100 局测试报告 | `test-random-generation.js` **7788/0**、`test.js` **625/0**、`reports/random-generation-report.{json,md}` | ✓ |
| 8 | 第一关回归测试结果 | `test-l1-frozen.js` **64/0**、`reports/l1-frozen-report.{json,md}` | ✓ |
| 9 | 构建测试结果及未解决问题 | `test-build-consistency.js` **110/0**、本报告第 0 / 8 节 | ✓（未解决项已如实列出） |

---

## 2. 50 套模板（结构，而非 seed / 牌面 / 微偏移）

`src/game/l2_templates.js` 定义 `TEMPLATE_CATEGORIES` 10 类，每类 5 套：

中央集中型 / 多区域分散型 / 双核心叠层型 / 横向及纵向延展型 / 环形包围型 /
十字交错型 / 阶梯递进型 / 多层嵌套型 / 非对称复杂叠层型 / 混合组合型。

每套模板是**一组结构参数**，不是随机种子：`zones`（区域集合）、`shapes`（逐层轮廓）、
`trajectory`（层中心轨迹）、`layerCurve`（独立层级分布）、`env`（每层网格包络）、
`offsets`（层间半格错位向量）、`pin / align / spread / density / phase`。
`structureSignature = SHA-256(templateId + 结构参数)`，50 套两两不同。

`src/game/l2_geometry.js` 按这些参数在 **9×5 半格格网**（`x = 33 + c·66 + px·33`，
`y = 220 + r·88 + py·44`）真实落牌；`windowFor()` 把不同区域映射到不同网格子矩形，
`repairSupport()` 就近修补主堆悬空牌；44 张固定盲盒队列沿用既有 `buildQueue()`。
牌数 = `mainCount + queueCount`，层数 / 牌种数 / 三消规则全部沿用 `config.js` 既有档位，
**一个都没改**。

**真实差异指标**（`reports/FINAL_test-l2-templates.txt`）：

| 项 | 实测 |
|---|---|
| 模板 ID / 结构参数组合 / 结构签名 / 等价几何签名唯一数 | 50 / 50 / 50 / 50 |
| 50 套 × 3 组 (档位, seed) = 150 局真实生成 | 全部 `validateLevel.ok=true`、开局可点 19–25、主堆零悬空、真实安装进 `Game` 成功 |
| 1225 对两两结构相似度 | 最大 **0.4354**，≥0.60 共 **0 对** |
| 1225 对两两主堆布局相似度 | 最大 **0.4426**，≥0.60 共 **0 对** |
| 各层牌数分布 / 区域分布 / 逐层占位格轮廓 | 36 种 / 49 种 / **50/50 种** |

> 「包围盒宽高」只有 4 种（都落在同一格网内），因此专项测试用**逐层占位格轮廓**
> 而不是包围盒作为轮廓差异判据；这不是放宽标准，而是换用更有区分度的真实几何度量。

---

## 3. 最近 10 局双重去重与历史持久化

- **独立窗口**：`level1RecentGames` 冻结为 3 局（`HISTORY_LIMIT = 3`），
  `level2RecentGames` 独立为 10 局（`L2_HISTORY_LIMIT = 10`），`historyLimitFor(level)`
  是唯一取值入口；两关绝不互相读取。
- **每局几何签名**（`l2_structure.js`）：坐标、层级、区域、层牌数与质心、层包围盒、
  层轮廓占位格、整体轮廓、遮挡关系（逐牌 blocker 边）、可操作区与被遮挡区。
- **双重去重**：
  1. 模板级：排除最近 10 局用过的 `templateId`，候选池 = `50 − 已用`；
  2. 几何级：拒绝 `canonicalGeometrySignature` 相同（平移 / 左右镜像归一化的等价结构）、
     `structureSignature` 相同、`geometrySignature` 相同，并要求与最近 10 局
     **重放出的真实牌面**比较的主堆结构相似度与布局相似度都 < 0.60。
- **不认牌面 / 顺序 / seed / 牌数**：上述签名与相似度只读几何字段；seed 只额外做
  「不得与最近 10 局完全相同」的更严格约束，绝不代替几何判定。
  第二关 `tileCountCheck` 明确标为 `N/A（按模板级 + 几何级去重，牌数按档位配置）`。
- **失败路径**：重复即重试（上限 50 次）；模板池耗尽抛
  `GenerationFailureError(reason='TEMPLATE_POOL_EXHAUSTED')`；50 次不合格抛
  `MAX_ATTEMPTS_EXCEEDED` 并附逐次失败原因。**不清空历史、不改 seed、不微调坐标、
  不退回重复布局**（`test-l2-templates.js [3]/[4]` 真实触发并断言）。
- **持久化**：记录新增 3 个**可选**字段 `templateId` / `structureSignature` /
  `canonicalGeometrySignature`；`sanitizeRecord(raw, level)` 对旧档缺字段按合法处理，
  由 `(level, difficultyId, seed)` 重放的真实牌面兜底。Rust 侧同步
  `RECORD_FIELDS[15]`（12 必填 + 3 可选）、`HISTORY_LIMIT_L1=3` /
  `HISTORY_LIMIT_L2=10`，并拒绝第一关历史出现模板字段。

**覆盖的重开入口**（`test-l2-templates.js [4]` 连续 12 局 + `test-random-generation.js` 100 局）：
游戏内 `new_game`、失败重开 `failure_restart`（真实置 `g.status='lose'`）、
标题页重开 `title_screen_restart`、刷新网页 / 退出重进 `application_restart`
（每局把存档 JSON 序列化再读回，模拟进程重启）。浏览器冒烟中第二个 HTML
继承第一个 HTML 的历史（1–4 → 5–8），是跨重启有效的真实证据。

---

## 4. 第一关冻结回归

审计阶段（修改前）保存 `reports/L1_FROZEN_BASELINE.json`：
20 条 L1 基线（4 档位 × 5 seed）+ 9 条「不带 templateId 的第二关默认路径」基线，
字段含牌数 / 可点牌 / 层数 / `geometrySignature` / 坐标-层级-区域-z 全序 SHA-256 / validate。

`node test-l1-frozen.js` → **64/0 / EXIT=0**：

- 20 条 L1 基线六个字段**全部零漂移**；
- 给第一关强行传 `templateId='L2-C01'`，返回数据 `templateId=null` 且结果仍与基线一致；
- 9 条 L2 默认路径基线同样零漂移（既有第二关生成链路未被改动）；
- `createNewGame(level=1)` 连续 5 局维持 `historyLimit=3`、`tileCountCheck='PASS'`、
  记录不含任何模板字段；`config.js` / `engine.js` / `render.js` /
  `layout_signature.js` / `tiles.js` / `seed_pool.js` 均不引用任何 `l2_*` 模块。

---

## 5. 连续 100 局测试报告

| 数据 | L1（冻结口径，3 局窗口） | L2（本轮规格，10 局窗口） |
|---|---|---|
| 局数 | 100 | 100 |
| 生成失败 | 0 | 0 |
| 最近 N 局模板 ID 重复 | 不适用 | **0** |
| 最近 N 局等价几何 / 结构签名重复 | 不适用 | **0 / 0** |
| 最近 N 局布局签名 / 几何签名重复 | 0 / 0 | 0 / 0 |
| 窗口内 sim 最大值 | 0.5889（`test.js [19]`） | 0.4160（主堆结构 sim） |
| 窗口对数 | 295 | 4215 |
| 中途磁盘往返重启模拟 | 历史仍有效 | 历史仍有效（10 条） |

`node test-random-generation.js` → **7788/0**；`node test.js` → **625/0**
（L1 100 局最大 sim 0.5889、L2 100 局最大 sim 0.4160，全部 < 0.60）。
4 种 `generationReason` 均覆盖；真实「失败重开」与「50 次上限必败路径」均有断言。

---

## 6. 自动化测试（最终源码上真实运行，全部 EXIT=0）

| 命令 | 结果 | 原始输出 |
|---|---|---|
| `node test.js` | **625 / 0** | `reports/FINAL_test.txt` |
| `node test-random-generation.js` | **7788 / 0** | `reports/FINAL_test-random-generation.txt` |
| `node test-l2-templates.js` | **539 / 0** | `reports/FINAL_test-l2-templates.txt` |
| `node test-l1-frozen.js` | **64 / 0** | `reports/FINAL_test-l1-frozen.txt` |
| `node test-layout-position.js` | **35 / 0** | `reports/FINAL_test-layout-position.txt` |
| `node test-music-playback.js` | **69 / 0** | `reports/FINAL_test-music-playback.txt` |
| `node test-build-consistency.js` | **110 / 0** | `reports/FINAL_test-build-consistency.txt` |
| `node tools/test_render.mjs` | 27/27 场景 | `reports/FINAL_render.txt` |
| `node tools/browser_smoke.mjs` | `allPassed=true`（两页各 4 局 L1 + 4 局 L2） | `reports/FINAL_browser_smoke.txt` |
| `node tools/music_real_playback.mjs` | **54/54**（网页 / 独立 HTML / ES5 legacy 真机播放，`currentTime` 真实推进） | `reports/FINAL_music_real_playback.txt` |

合并汇总：`reports/FINAL_RERUN_ALL.txt`。专项报告：`l2-templates-report.{json,md}`、
`l1-frozen-report.{json,md}`、`random-generation-report.{json,md}`、
`build-consistency-report.{json,md}`、`layout-position-report.{json,md}`、
`music-playback-report.{json,md}`。

**原有功能保护**：`test-music-playback.js` 69/0、`test-layout-position.js` 35/0、
真机音乐播放 54/54 全部重跑通过；5 首内置 wav 原样打进重建产物，
音效 / 音量 / 静音 / 场景切换链路未改动。

---

## 7. 构建测试与产物一致性

`node test-build-consistency.js` → **110 / 0**：

- 用 `tools/bundle_shared.mjs`（构建脚本同源函数）现场重打包，与两个 HTML 内嵌
  `<script id="mah-bundle">` **逐字节比对**通过；
- `sourceHash` = 现场对 `src/` 全量文件重算的 SHA-256，
  `f6d0bbf4fd6932a1…`，参与哈希源文件 **37** 个；
- 新增 `[7]` 节：4 个正式 HTML 均内嵌 **50 个唯一 `templateId`**、
  `MAH-L2-STRUCT-v1/SHA-256`、`MAH-L2-CANON-v1/SHA-256`、`MAH-L2-DEDUP-v1`、
  `canonicalGeometrySignature`、`structureSignature`、`TEMPLATE_POOL_EXHAUSTED`；
  网页版 3 个副本与 `dist/MahLeMah.html` 逐字节相同；
- legacy 通过 Babel + acorn 纯 ES5 语法校验。

| 产物 | 字节 | SHA-256 |
|---|---:|---|
| `dist/MahLeMah.html` | 9,924,128 | `61eb93fc932cd5f29524f1fc64ccd7fd40e0d9ae66af9070dc3efdb13eddb9b2` |
| `dist/index.html` | 9,924,128 | 同上（同内容副本） |
| `dist/Mah了个Mah.html` | 9,924,128 | 同上（同内容副本） |
| `dist/MahLeMah-legacy.html` | 9,958,241 | `0d5c00475d929545e50b5149cab3bb6d8e8e6fd4a7cb1c3c608c8778519e2f8c` |

`buildVersion=2.0.0-a4340d1`、`gitCommit=a4340d167ff6b185a0f59ee0ecda7d3901b82cf8`
（构建时 HEAD；产物不回写新提交，避免自指循环，一致性由实时重算保证）。

---

## 8. 最终验收标准逐条判定

| 规格「最终验收标准」 | 判定 | 依据 |
|---|---|---|
| 第一关完全不变 | ✓ | 20 条修改前基线零漂移 + 强传 templateId 不影响 + 源码冻结检查，`test-l1-frozen.js` 64/0 |
| 第二关拥有 50 套真正不同的原著风格布局模板 | ✓ | 10 类 × 5 套、50/50 唯一结构签名与占位格轮廓、1225 对全部 < 0.60 |
| 最近 10 局实际几何布局零重复 | ✓ | 双关各 100 局 + 12 局重开入口 + 浏览器冒烟，模板/等价几何/结构/几何签名重复均为 0 |
| 历史记录跨重启有效 | ✓ | 磁盘往返 + 序列化重载 + 两个 HTML 共用持久化历史（1–4 → 5–8） |
| 所有布局合法且能够正常运行 | ✓ | 150 局真实生成：牌数 / 层级 / 坐标 / 半格晶格 / 同层零重叠 / 遮挡图 / 零悬空 / 消除后下层暴露 / 真实安装进 Game |
| 网页版 / 独立 HTML / 桌面端构建一致性 | **部分** | 网页版 ✓、独立 HTML ✓、ES5 legacy ✓；**桌面端 Rust 构建未运行**（缺 MSVC link.exe），仅源码静态一致性通过 |
| 未实际执行的测试不得标记为通过 | ✓ | 本报告第 0 / 9 节如实列出全部未运行项 |
| 不得用不同 seed / 不同文件版本冒充真实布局变化 | ✓ | 模板差异来自结构参数；去重基于真实坐标、层级、区域、轮廓、遮挡与可操作区；等价几何会被归一化识别并拒绝 |

---

## 9. 未执行 / 未覆盖项（不计入通过）

| 项 | 状态 | 原因 |
|---|---|---|
| Rust `cargo check` / `cargo build` | **尝试后失败** | Git Bash 下 GNU `link` 遮蔽；PowerShell 下明确 `linker link.exe not found`（未安装 VS C++ 链接器） |
| 桌面版 exe 重建与真机音乐播放 | **未运行** | 依赖 Rust 构建 |
| Windows 安装版 / Portable zip / Setup.exe / SHA256SUMS.txt | **未重建** | 依赖 Rust 构建，仍是旧冻结产物 |
| `npm run test:release`（12000 局发布压力测试） | **未重跑** | 本轮不属于规格要求的测试链 |
| 原版《羊了个羊》内部布局数据 / 精确算法复刻 | **不可得** | 只参考可观察特征，报告不声称复刻 |

---

## 10. 复现命令

```bash
node test.js                          # 625/0
node test-random-generation.js        # 7788/0（双关各 100 局）
node test-l2-templates.js             # 539/0（50 模板 / 150 局 / 1225 对 / 等价几何 / 重开入口）
node test-l1-frozen.js                # 64/0（第一关冻结回归）
node test-layout-position.js          # 35/0
node test-music-playback.js           # 69/0
node test-build-consistency.js        # 110/0
node tools/test_render.mjs            # 27/27
node tools/browser_smoke.mjs          # allPassed=true
node tools/music_real_playback.mjs    # 54/54，桌面版未运行
npm run build:all                     # 重建 4 个 HTML
```

修改文件清单见 `reports/MODIFIED_FILES.md`。
本轮提交：`c410239`（完整哈希 `c410239b1ca9e9b4c3e3c0d969bc4adad5ec2801`），已推送 `origin/main`。
