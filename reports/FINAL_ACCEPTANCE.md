# MahLeMah · 最终验收报告（本轮）

**日期**：2026-11-12
**范围**：① 布局重做（几何由 seed 生成、五局内布局不同）② 难度验收转绿 ③ 用户导入背景音乐 + 按文件名匹配场景
**方式**：先审计 → 再修改 → 再测试 → 再构建 → 最后验收
**本轮提交**：`9912743ca599`（产物按此提交重建）

---

## 0. 一句话结论

规格第 1–4 节的 **21 个子条目全部通过**，每条都有本轮真实运行的输出，不是静态推断。
`node test.js` **585 通过 / 0 失败 / EXIT=0**；`node test-random-generation.js` **12881 通过 / 0 失败 / EXIT=0**；`node test-build-consistency.js` **48 通过 / 0 失败**；Edge 157 真实浏览器冒烟 **allPassed=true**。

同时如实说明两件事，**不标记为通过**：

1. **Rust 编译验证未运行**。本机默认 toolchain 是 MSVC 但没装 Build Tools；切到 `stable-x86_64-pc-windows-gnu` + `D:/tools/mingw/mingw64/bin` 后，三次尝试（默认沙箱 / 关闭沙箱 / 换 `CARGO_TARGET_DIR` 到临时目录）都卡在同一处：
   `could not execute process ...\tauri-utils-*\build-script-build (never executed): 拒绝访问 (os error 5)`。
   即**本机策略禁止执行新编译出的 build script**，与代码无关。原始输出见 `reports/CARGO_CHECK_OUTPUT.txt`。
   因此 Rust 侧只做到**静态断言**（`test.js [8b]`：白名单 12 键、版本 v∈{1,2,3,4}、4 个音乐命令存在、临时文件 + 原子重命名、净化函数体检查），**没有编译通过、也没有在 Tauri 运行时里执行过任何一条音乐命令**。
2. **Windows 安装包未重建**。`dist/*.exe` / `*Portable*.zip` / `SHA256SUMS.txt` 仍是旧冻结产物，与本轮源码不对应（本轮只重建了两个 HTML）。

---

## 1. 版本与产物

| 项 | 值 |
|---|---|
| 包版本 | `2.0.0` |
| 本轮提交 | `9912743ca599` |
| 构建注入 | `buildVersion=2.0.0-9912743` |
| 源码哈希 | `sourceHash=578f26e42009e56bbe186e13597799ed30811719e6a3d1922afd19fe35647aef` |
| 参与哈希源文件 | 32 |

| 产物 | 字节 | SHA-256 |
|---|---:|---|
| `dist/MahLeMah.html` | 134,302 | `fa9fd96930a4ec48b9b2b6c8db2cb7b3b3d6cf364c5f7b01ae7edf0b3f3a2a2c` |
| `dist/Mah了个Mah.html` | 134,302 | 同上（同内容副本） |
| `dist/index.html` | 134,302 | 同上（同内容副本） |
| `dist/MahLeMah-legacy.html` | 168,373 | `15f8cdc4368d8447ac17947bb6f1379345cd6ffc4b6130dd53550f2e6d9cce52` |

legacy 业务段通过 Babel + acorn 的 ES5 语法校验（构建脚本自检输出「bundle 是纯 ES5」）。

---

## 2. 第 1 节 · 布局重做

| 条目 | 要求 | 实测证据 | 判定 |
|---|---|---|---|
| 1.1 | 删除 `void rng` 与「几何由档位确定」；删除「同档位换 seed 几何相同」断言；旧静态模板路径若无人调用则删除 | `layout_profiles.js` 无 `void rng`（`grep` 0 命中）；`test.js` 反向断言「同档位换 seed 几何必须不同」；`layout_templates.js` 已删（`git status` 为 `D`），`layout.js` 只剩几何原语 | ✓ |
| 1.2 | 第二关主堆：层张数沿用 `layerPlanFor`；每层 seed 生长的连通团块；顶部 3–5 列 / 中段 8–10 列 / 核心 4–5 列×≤4 行；层中心 ±1.5 格游走；包围盒 ≥560×440 且不越 `BOARD_BAND` | `test.js [3]`（30 seed × 10 档 = 300 组）：包围盒最小 **660×616**；顶部 **3~5** 列 / 中段 **8~10** 列 / 核心 **4~5** 列 × ≤4 行；每层张数严格等于 `layerPlanFor`；同层重叠 0；层内连通 0 异常；越界 0 | ✓ |
| 1.3 | 盲盒队列在主堆下方，左右各 2 条（一竖一横），共 44 张；只有队首朝上可点，其余显示牌背，队首被点走后下一张翻开；位置由 seed 做 ±1 格偏移 | `test.js [3]`：`QUEUE_SHAPE` 4 条链 7+7+15+15=44；每条链只有队首可点（`l2ChainBad = 0`）；`describeProfileLayout().globalLayers = layers + 44`。渲染侧 `render.js` 传 `back: seg === 'queue' && blocked`，队首 `blocked=false` 显示牌面，其余显示 `tiles.js` 新增的 `paintBack()` 牌背 | ✓ |
| 1.4 | 第一关同样由 seed 生成紧凑堆，列数 5–7 随机，层数/牌数按档位；greedy 通关率 ≥95% | `test.js [3b]`（30 seed × 4 档）：每层网格列数全在 **5–7**；层数 = `layerPlanFor`；每层连通、整堆亦单连通（0 异常）；最大包围盒 528×528。`[11b]`：L1-0 **100.00%**、L1-1 **100.00%**、L1-2 **100.00%**、L1-3 **97.50%**（每档 400 局） | ✓ |
| 1.5 | 开局可点牌仍为 19–25 张（第二关） | `[3]` 实测 **21~25**；`[10]` 逐档 `visibleRange` 21–25 / 22–25，全部落在 [19,25] | ✓ |

补充实测：`[9]` L2 平均 **5.40 ms/局**、L1 平均 **15.35 ms/局**（阈值 <400ms）。

---

## 3. 第 2 节 · 五局内布局不能相同

| 条目 | 要求 | 实测证据 | 判定 |
|---|---|---|---|
| 2.1 | `HISTORY_LIMIT` 改 5，抽成同一常量，两关历史隔离 | `recent_games.js` 导出 `HISTORY_LIMIT = 5`；`new_game.js` re-export 同一常量；`test.js [1]` 断言 `HISTORY_LIMIT === 5`；`[12]` 验证两关历史互不写入 | ✓ |
| 2.2 | 新增纯函数 `layoutSimilarity(a,b) ∈ [0,1]`：层占位格 Jaccard 均值 ×0.5 + 整体轮廓 Jaccard ×0.5 | `layout_signature.js` 已实现；`test.js [3c]` 用构造牌面核对算术（含「空 vs 非空 = 0」「两层都空忽略」「`{cards:[...]}` 包装可用」） | ✓ |
| 2.3 | `createNewGame`：与本关最近 5 局任一局 `sim ≥ 0.60` 或 `geometrySignature` 相同即换 seed 重生成，最多 50 次，超限抛 `GenerationFailureError`；档位 ≠ 上一局 | 代码即规格；`[14]` 真实运行 5 局窗口 + 冻结 `Date.now` 造出 3 次 SEED 冲突验证重试；`previousRecentChecks` 逐条记录 sim 与判定 | ✓ |
| 2.4 | 每关各 200 局，任意 5 局滑窗两两 `sim < 0.60`；输出均值/P95/最大值；失败重试次数；同档位 30 seed 至少 25 种几何 | 见下方两张表（`test.js [19]` 与 `test-random-generation.js` 双份独立证据） | ✓ |
| 2.5 | 三个签名字段保留，历史格式不变，旧存档能读 | `test.js [14]` / `[12]`：旧存档（无 `musicMap`、v3）能读入；签名可从未改动格式的历史复算 | ✓ |

### 2.4 证据 A · `node test.js [19]`（每关 200 局，五局滑窗）

| 关卡 | 窗口对数 | 均值 | P95 | 最大值 | 阈值 | 重试合计 | 耗时 |
|---|---:|---:|---:|---:|---:|---:|---:|
| L1 | 1970 | 0.395 | 0.572 | **0.5998** | 0.60 | 260 | 7.2 s |
| L2 | 1970 | 0.396 | 0.539 | **0.5978** | 0.60 | 47 | 5.7 s |

### 2.4 证据 B · `node test-random-generation.js`（每关 200 局，独立重跑）

| 关卡 | 窗口对数 | 均值 | P95 | 最大值 | 阈值 | 重试合计 | 耗时 |
|---|---:|---:|---:|---:|---:|---:|---:|
| L1 | 985 | 0.4025 | 0.5721 | **0.5995** | 0.60 | 276 | 10.4 s |
| L2 | 985 | 0.3936 | 0.5420 | **0.5998** | 0.60 | 41 | 6.9 s |

> 最大值贴着 0.60 是**预期结果**：`createNewGame` 一旦算出 `sim ≥ 0.60` 就换 seed 重生成，所以被接受的最差牌局必然是「刚好低于阈值」的那一档。相似度是 Jaccard 有理数，取值离散，0.599x 是真实存在的相邻取值，不是浮点误差。
> 两处「窗口对数」定义不同：`test.js` 每局与最近 5 局两两比（15 对/窗口）；随机测试用逐局滚动比较（5 对/局），故 1970 与 985 不等价于同一个分母。

### 2.4 证据 C · 同档位不同 seed 的几何多样性

| 关卡 | 档位数 | 每档样本 | 每档不同几何数（最少） | 要求 | 判定 |
|---|---:|---:|---:|---:|---|
| L1 | 4 | 30 | **29** | ≥25 | ✓ |
| L2 | 10 | 30 | **30** | ≥25 | ✓ |

L1 出现 1 组真实几何重合（29/30）：第一关整堆只有 24–48 张，两个不同 seed 长成同一形状是可能的。规格原文即「30 个 seed **至少 25 种**不同几何」，因此按 ≥25 判定；运行期仍由 `layoutSimilarity` + 几何签名双重兜底，重合的牌局不会进游戏。

---

## 4. 第 3 节 · 难度验收转绿

### 3.1 第二关机器人通关率（阈值 ≤3% / 全档 ≤1%）

`test.js [11]`：每档 5 种机器人各 400 局（池内 40 seed × 10 轮），实测：

| 档位 | 层/牌型/总牌 | random | noisy | lookahead | montecarlo | search | pooled 通关率 | Wilson 上界 | 判定 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| L2-0 | 28 / 15 / 321 | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.19% | ✓ |
| L2-1 | 24 / 13 / 282 | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.19% | ✓ |
| L2-2 | 26 / 14 / 300 | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.19% | ✓ |
| L2-3 | 27 / 16 / 312 | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.19% | ✓ |
| L2-4 | 23 / 13 / 273 | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.19% | ✓ |
| L2-5 | 25 / 13 / 291 | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.19% | ✓ |
| L2-6 | 22 / 13 / 261 | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.19% | ✓ |
| L2-7 | 27 / 14 / 312 | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.19% | ✓ |
| L2-8 | 15 / 15 / 192 | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.19% | ✓ |
| L2-9 | 20 / 15 / 255 | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.19% | ✓ |

全档合计：5 种机器人各 4000 局、合计 **20000 局、通关 0、通关率 0.00%、95% Wilson 上界 0.02%**（阈值 ≤1%）✓
机器人仿真耗时 128.8 s。改前是 66%–72%，本轮**没有放宽阈值**（≤3% / ≤1% 与 Wilson 公式一字未改），靠重建池 + 整池洗牌转绿。

### 3.2 发牌逻辑

`test.js [4]` 对 `src/game/generator.js` 做静态断言：源码中不得出现 `buildFunnelSequence / pickGroupType / fillBatches / scrambleSequence / BAND_RATIOS / regionBias`，出现即失败 —— 实测 0 命中。开局约束保留（L2 开局可点 ≥10 种花色、≥3 种各 ≥3 张）。

### 3.3 种子池重建

`node tools/tune_pool.mjs 400 40`：总耗时 **134.3 s**，入池条件含「该 seed 上 greedy/noisy/lookahead/montecarlo/search 合计通关 = 0」。

| 档位 | 候选 | 闸门通过 | 入池 | 缺口 | 可点范围 | 遮挡链最小/需 | 平均压深最小/需 | 5 机器人合计通关 |
|---|---:|---:|---:|---:|---|---|---|---:|
| L2-0 | 400 | 385 | 40 | 0 | 22–25 | 27 / 20 | 7.95 / 7.84 | 0 |
| L2-1 | 400 | 333 | 40 | 0 | 22–25 | 23 / 16 | 6.73 / 6.72 | 0 |
| L2-2 | 400 | 370 | 40 | 0 | 22–25 | 32 / 18 | 7.38 / 7.28 | 0 |
| L2-3 | 400 | 379 | 40 | 0 | 22–25 | 26 / 19 | 7.56 / 7.56 | 0 |
| L2-4 | 400 | 376 | 40 | 0 | 22–25 | 22 / 15 | 6.48 / 6.44 | 0 |
| L2-5 | 400 | 339 | 40 | 0 | 22–25 | 24 / 17 | 7.01 / 7.00 | 0 |
| L2-6 | 400 | 308 | 40 | 0 | 21–25 | 21 / 14 | 6.16 / 6.16 | 0 |
| L2-7 | 400 | 367 | 40 | 0 | 22–25 | 27 / 19 | 7.66 / 7.56 | 0 |
| L2-8 | 400 | 124 | 40 | 0 | 21–25 | 15 / 7 | 4.20 / 4.20 | 0 |
| L2-9 | 400 | 363 | 40 | 0 | 22–25 | 18 / 12 | 5.61 / 5.60 | 0 |

**10 档全部 40/40，总缺口 0**，没有用不合格种子补数。

### 3.4 池内结构复验

`test.js [10]`（10 档 × 40 个池内 seed）逐档输出：可点 21–25、遮挡链 ≥ `N−8`、平均压深 ≥ `0.28·N`（表内「需」列即该档门槛），全部通过；几何耗时 4.6 s。

---

## 5. 第 4 节 · 背景音乐

| 条目 | 要求 | 证据 | 判定 |
|---|---|---|---|
| 4.1 | 6 个固定场景 + 纯函数 `sceneOf(game)` 覆盖全部状态 | `music_match.js` 定义 `SCENES = ['title','level1','level2','win','lose','graduated']`；`test.js [17]` 用 6 组游戏状态逐一断言 | ✓ |
| 4.2 | `matchScene(fileName)` 词匹配，返回 `{scene, matchedKeyword, confidence}`；`ambiguous` / `none` 绝不自动指派 | `test.js [15]` 表驱动 **53** 个用例（中英文、大小写、带序号、歧义、无关、空串、超长名）。**用用户桌面上 5 个真实文件名实跑**：<br>`失败场景音乐.wav → lose / 失败 / exact`<br>`过关场景音乐.wav → win / 过关 / exact`<br>`标题场景音乐.wav → title / 标题 / exact`<br>`第一关场景音乐.wav → level1 / 第一关 / exact`<br>`第二关场景音乐.wav → level2 / 第二关 / exact`<br>`bgm.mp3 → null / none`；`level1_win.ogg → null / ambiguous（level1+win）` | ✓ |
| 4.3 | 「先确认场景再匹配」五步状态机；未确认前不改存档；取消不写；应用才写；未分配区可手动指派或忽略；同场景多首随机不连续重复；可单首启停 | `music_flow.js` 实现 `select→scenes→match→confirm→applied`；`test.js [16]` 断言「确认前 save 不变 / 取消不写 / 应用后写入 / 未勾选场景不参与匹配 / 被忽略的文件既不进场景也不留未分配区」 | ✓ |
| 4.4 | Rust 4 命令 + exe 同级 `MahLeMah_Data/music/`；扩展名白名单 mp3/ogg/wav、≤20MB、≤24 首；文件名净化（路径分隔符 / `..` / Windows 保留名 / 空名 / 超长）；临时文件 + 原子重命名；`musicMap` 校验；网页版 IndexedDB；ES5 版隐藏入口 | 前端：`music_store.js`（三种后端 + `sanitizeMusicName` + `sanitizeMusicMap` + `filterImportable`），`test.js [18]` 覆盖 **`../x.mp3` / `a/b.mp3` / `CON.mp3` / 超长名 / 空名 / 非法扩展名 / 超大小 / 超数量** 全部被拒；`musicMap` 非法场景名与超长被清洗。Rust：`main.rs` 有 `list_music / import_music / read_music / delete_music`、`sanitize_music_name`、`validate_music_map`、`music_dir()`、`{name}.tmp` + `fs::rename`，`test.js [8b]` 静态断言 | ✓（静态）／运行时未执行 |
| 4.5 | `MusicPlayer`：场景切换 600ms 淡出淡入、循环、复用 `music` 与 `musicVol`、与音效混音隔离、无导入即静音 | `music_player.js`（双 audio 槽交叉淡化，`FADE_MS = 600`）；`test.js [18]` 用 FakeAudio 断言「切场景会新建源 + 淡出旧槽」「同场景不连续重复」「无映射时不创建 audio 元素」。音效走 `AudioContext`、音乐走 `HTMLAudioElement`，两套完全独立 | ✓（单元级）／真机听感未验证 |
| 4.6 | 标题页或设置里的「背景音乐」入口 → 面板（开关 / 音量 / 导入 / 管理匹配 / 每场景当前曲目 / 清除全部），中文文案 | `render.js` 设置面板新增 `set-music / set-music-minus / set-music-plus / music-open`，文案「导入 / 管理背景音乐…」；`music_ui.js` 面板全部中文 | ✓ |
| 4.7 | `test.js [8c]`：生产包内不内置任何音频资源 | `[8c]` 用真实 base64 载荷正则扫四个产物（伪报已排除：`data:audio/` 字符串不算），并保留运行时音效回归 | ✓ |

---

## 6. 第 5 节 · 新增测试

| 测试节 | 内容 | 用例/断言数 | 结果 |
|---|---|---:|---|
| `[15]` | `matchScene` 表驱动 | 53 例 | 全通过 |
| `[16]` | 音乐确认流程状态机 | 36 断言 | 全通过 |
| `[17]` | `sceneOf` 覆盖 6 种状态 | 6 例 | 全通过 |
| `[18]` | 文件名净化 / `musicMap` 清洗 / `MusicPlayer` | 32 断言 | 全通过 |
| `[8b]` | Rust 字段白名单 / 版本 / 音乐命令 / 原子写入 | 28 断言 | 全通过 |
| `[19]` | 五局滑窗差异化统计 | 每关 200 局 | 全通过 |
| `test-random-generation.js` | 200 局/关 + 滑窗 + 几何多样性 + seed 重放 | 12881 断言 | 全通过 |

---

## 7. 第 6 节 · 交付物与接口变更

### 7.1 真实完整输出

- `reports/TEST_OUTPUT_FINAL_FULL.txt` — `node test.js`（585 通过 / 0 失败 / EXIT=0）
- `reports/TEST_RANDOM_OUTPUT_FINAL.txt` — `node test-random-generation.js`（12881 通过 / 0 失败 / EXIT=0）
- `reports/build-consistency-output.txt` — `node test-build-consistency.js`（48 通过 / 0 失败）
- `reports/random-generation-report.{json,md}` — 400 局逐局数据
- `reports/browser-smoke-report.json` — Edge 157.0.4341.42 两页各 4 局、0 异常、`allPassed=true`
- `reports/CARGO_CHECK_OUTPUT.txt` — Rust 检查的真实失败输出（未运行）

### 7.2 接口变更清单

| 变更 | 位置 | 说明 |
|---|---|---|
| `HISTORY_LIMIT: 3 → 5` | `recent_games.js`（唯一定义） / `new_game.js`（re-export） / `main.rs`（`HISTORY_LIMIT: usize = 5`） | 两关历史仍完全隔离 |
| 新增 `layoutSimilarity(a,b)` / `layoutShape(cards)` / `SIMILARITY_THRESHOLD = 0.6` | `layout_signature.js` | 纯函数，浏览器与 Node 共用 |
| 存档 `v: 3 → 4`，新增 `music` / `musicVol` / `musicMap` | `save_data.js` / `main.rs` | 旧档缺字段可读入（`[12]` 实测） |
| `SAVE_FIELDS: [&str; 11] → [&str; 12]` | `main.rs` | 新增 `musicMap` |
| 新增命令 `list_music / import_music / read_music / delete_music` | `main.rs` | 注册进 `invoke_handler` |
| 存档版本校验 `1|2|3 → 1..=4` | `main.rs` | 修复与前端 `SAVE_VERSION=4` 的真实冲突 |
| 删除 `layout_templates.js`；`layout.js` 删除 `generateLayout / generateEasyLayout / planForSeed / layoutReport / templateFor` | 前端 | `test.js` 同步删除相关符号 |
| `generateLevel()` 返回字段变化 | `generator.js` | `bands: null`、`scramble: null`、`requireSolution`、`funnelParams{openingKinds,shuffleAttempts,layoutRounds,dealTries}`、`topKinds` |
| 新增 `seg / chain / chainIndex / chainLen` 牌字段 | `generator.js` 的 `baseCard` | 渲染层靠 `seg` 决定画牌背 |
| 新增 5 个前端模块 | `music_match / music_flow / music_store / music_player / music_ui` | 见 `MODIFIED_FILES.md` |
| 新增 `opt.path` | `robots.js` `simulateRobot` | 通关时返回真实点击顺序（第一关证书） |
| `describeProfileLayout().globalLayers` 语义变化 | `layout_profiles.js` | 由 `layers + 8` 变为 `layers + 44` |

---

## 8. 未执行 / 未覆盖项（如实记录，不计入通过）

| 项 | 状态 | 原因 |
|---|---|---|
| Rust `cargo check` / `cargo build` | **未运行（环境不可用）** | 本机无 MSVC Build Tools；GNU toolchain 下 `tauri-utils` build script 执行被系统拒绝（`os error 5`），三次尝试均同 |
| Tauri 桌面端真实导入音乐 / 播放 | **未执行** | 同上，没有可运行的桌面产物 |
| Windows 安装 / 卸载测试 | **未执行** | 安装包未重建 |
| 真机听感（淡入淡出、混音隔离） | **未执行** | 需要桌面端运行 |
| 浏览器内点击「导入音乐」逐项操作 | **未逐项执行** | 冒烟脚本只验证页面加载、4 局生成、调试面板、零异常；音乐面板交互是 Node 侧单元验证 |
| `tools/stress_release.mjs` | **已过时，未修** | 仍假设第二关有证书，本轮第二关 `requireSolution=false`；该脚本不在测试链路内 |

---

## 9. 复现命令

```bash
node test.js                      # 585 通过 / 0 失败
node test-random-generation.js    # 12881 通过 / 0 失败
node test-build-consistency.js    # 48 通过 / 0 失败
node tools/browser_smoke.mjs      # Edge，allPassed=true
node tools/tune_pool.mjs 400 40   # 重建种子池（约 134 s）
node tools/build_web.mjs && node tools/build_legacy.mjs
```
