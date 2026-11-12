# 交付说明 · v2.0.0（16 牌型 / 双关卡 / 仅音效 / 双 Windows 产物）+ 2026-11-12 随机生成重构

> 本文件是交付的权威说明。代码的唯一真实来源是仓库源文件，本文件不贴源码全文。
> **牌数口径**：旧版的「第一关固定 24 张 / 第二关 222 张、8/15 种牌型、葫芦单堆」是
> 历史数据。当前源码第 1 关有 4 个合法档位（24 / 30 / 36 / 48 张），
> 第 2 关有 10 个合法档位（192–321 张）；222 张从未出现在当前配置中。
> 「游戏内自删除卸载」已彻底移除。详见 `RELEASE_NOTES.md` / `CHANGELOG.md`。

---

## 0. 2026-11-12 本轮增量交付（随机生成系统重构）

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
