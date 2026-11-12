# MahLeMah 完整代码审计报告（第一阶段）

> 审计时间：2026-11-11 22:1x GMT+8
> 审计方式：读取磁盘真实文件 + esbuild 重新打包比对 + 关键字/常量交叉检查。
> **没有**仅凭「HTML 能打开」判断一致性。
> 本文件为「修复前」快照；修复后的差异见文末 §7（最终验收时补全）。

---

## 1. 基本信息

| 项 | 值 |
|---|---|
| 项目版本 | `2.0.0`（`package.json` / `src/game/config.js` 的 `VERSION`） |
| 审计基线 commit | `1f95db08e60c74c21a0aa8dff85877e61e55f9f4` (`1f95db0`) |
| 分支 / 远端 | `main` / `git@github.com:alexandresilksail/Mah.git` |
| 工作区状态 | 干净（`git status --short` 为空，已推送） |
| 上次构建产物时间 | 2026-11-10 20:35（两个 HTML） |
| 上次源码修改时间 | 2026-11-11 21:11（动态档位系统） |

### 1.1 关键文件 SHA256（修复前）

| 文件 | 大小 | SHA256 |
|---|---:|---|
| `dist/MahLeMah.html` | 84,283 | `56df003a44b049e1ae693ff9eeb4186f6e3ac48ca3fd1d4f46a99cb42b9ed6bc` |
| `dist/index.html` | 84,283 | `56df003a44b049e1ae693ff9eeb4186f6e3ac48ca3fd1d4f46a99cb42b9ed6bc` |
| `dist/Mah了个Mah.html` | 84,283 | `56df003a44b049e1ae693ff9eeb4186f6e3ac48ca3fd1d4f46a99cb42b9ed6bc` |
| `dist/MahLeMah-legacy.html` | 118,830 | `deb3d7f604bec13eecce4f29dc94e8b8fdf8a2ed62a3da662b32b8b832623443` |
| `src/main.js` | — | `09bc8b553656388f84235f27a50f69069dae2308ab3bbf85fc9b7cc7a51ee868` |
| `src/game/config.js` | — | `f4a9418967b895f9c14e17cfa4dd37de1a79472c5d45c515eebf680c479d494a` |
| `src/game/generator.js` | — | `147691fcb0f93fd918ef9b16bf5e1844faa91693ebafb9af0e51560961763d89` |
| `src/game/engine.js` | — | `d409a32f6d6eb71fa869d586c68ad8e0adb79bc54013ed34e6788c8556541ed1` |
| `src/game/layout_profiles.js` | — | `82c0f986508e2c34ef418af7d681a83323fa0bad715803f1067f24d76174cb44` |
| `src/game/seed_pool.js` | — | `0c54e334ecfd35cff9c2f573996eb223e44a0624a6b552bfe35d54d46ad0cd16` |
| `src/game/save_data.js` | — | `81c47d6d0f74878565fec2429c670b307f9c708f446ad4b631b437f813e1b740` |
| `test.js` | 54,374 | `f9e405f472db5132ff30b1e8b71f0faa7eb6be98dda97d10bca4b2a61624054e` |
| `package.json` | 1,097 | `5b1c64b9e48bf24cd031377cff4796ae9683bee58a9588f444bd33f9ee5b1a5f` |

### 1.2 文件清单（按子系统）

- 入口 / 模板：`src/main.js`、`src/index.html`、`src/styles.css`、`src/legacy.css`、`src/compat.es5.js`
- 游戏核心：`src/game/{config,engine,generator,layout,layout_templates,layout_profiles,rng,seed_pool,tile_types,tiles,robots,render,draw,logo,audio,store,save_data,dom_view.es5}.js`
- 桌面：`src-tauri/src/main.rs`、`src-tauri/tauri.conf.json`、`src-tauri/capabilities/`
- 构建：`tools/{build_web,build_legacy,build_portable,build_nsis,make_release,test_render,tune_pool,gen_profiles,stress_release,tune,test_logic,art_preview}.mjs`、`tools/make_installer.nsi`、`tools/gen_icon.py`、`tools/make_release.py`
- 测试：`test.js`、`tools/test_render.mjs`、`tools/stress_release.mjs`
- 产物：`dist/MahLeMah.html`（= `index.html` = `Mah了个Mah.html`）、`dist/MahLeMah-legacy.html`、`dist/MahLeMah-Portable-v2.0.0.zip`、`dist/MahLeMah-Setup-v2.0.0.exe`、`dist/SHA256SUMS.txt`
- 文档：`README.md`、`RELEASE_NOTES.md`、`DELIVERY.md`、`TEST_REPORT.md`、`SECURITY_AUDIT.md`、`reports/DIFFICULTY.md`、`reports/TEST_OUTPUT_DYNAMIC_PROFILES.txt`
- **`CHANGELOG.md` 不存在**（本轮需新建）

---

## 2. 两个 HTML 与 `src/` 的一致性报告（修复前）

比对方法：用 `tools/build_web.mjs` 完全相同的 esbuild 参数
（`bundle:true, format:iife, target:es2020, minify:true, legalComments:none, charset:utf8`）
现场重新打包 `src/main.js`，取 `dist/MahLeMah.html` 里唯一的 `<script>` 内容做逐字节比对。

| 检查项 | 结果 |
|---|---|
| 现代版内嵌 JS 字节数 | 82,461 |
| 当前 `src/` 重新打包 JS 字节数 | 92,825 |
| 内嵌 JS sha256（前 16） | `9d602382a3867eb8` |
| 当前源码打包 sha256（前 16） | `377f096b94e4c579` |
| **逐字节相同** | **否** |
| legacy 内嵌 script 段 | 3 段（compat 15,021 / dom_view 13,666 / 业务 88,832 字节） |

关键字/常量交叉检查（`modernHTML` = `dist/MahLeMah.html`，`legacyHTML` = `dist/MahLeMah-legacy.html`，`src` = 现场打包）：

| 标记 | modernHTML | legacyHTML | 当前 src | 结论 |
|---|---|---|---|---|
| `profileId` | ✗ | ✗ | ✓ | 两 HTML 均无档位系统 |
| `groupsPerType` | ✗ | ✗ | ✓ | 两 HTML 无档位花色配额 |
| `L2-0`（分档 seed 池键） | ✗ | ✗ | ✓ | 两 HTML 用旧版单一 seed 池 |
| `p1` / `p2` | ✗ | ✗ | ✓ | 两 HTML 无档位存档字段 |
| `开始新一轮` / `重玩本关` | ✗ | ✗ | ✓ | 两 HTML 无新 UI 分支 |
| `rollProfile` / `LEVEL2_PROFILES` | ✗ | ✗ | （压缩后符号被改名） | 一致地缺失 |
| `240` | 9 处 | 11 处 | 存在 | 两 HTML 仍是「第 2 关 240 张」旧规格 |
| `calculateLayoutSignature` / `createNewGame` / `level1RecentGames` / `difficultyId` | ✗ | ✗ | ✗ | 本轮要求的功能全部不存在 |

> 注：`LEVEL2_PROFILES` / `rollProfile` 在压缩产物里会被改名，因此单独用符号名判断不可靠；
> 但 `profileId` / `groupsPerType` / `L2-0` / `p1` / `开始新一轮` 是字符串与对象键，压缩不改其内容，
> 它们集体缺失是「HTML 为 11-10 冻结版」的确凿证据，再加上逐字节 bundle 比对不等，结论确定。

---

## 3. 十个审计问题的回答（修复前）

| # | 问题 | 回答 | 证据 |
|---|---|---|---|
| 1 | 两个 HTML 是否为当前 `src/` 构建生成的产物？ | **否** | 产物 11-10 20:35，源码 11-11 21:11；现场打包 92,825 B ≠ 内嵌 82,461 B；哈希不同 |
| 2 | 两个 HTML 是否包含过期 JavaScript？ | **是** | 内嵌 82,461 B 旧 bundle；不含 `profileId`/`p1`/`p2`/`L2-0`/新 UI 文案 |
| 3 | 两个 HTML 的游戏生成算法是否一致？ | **是，但都是旧版** | 两者都由同一 `src/main.js` 在 11-10 构建；互相一致，与当前源码不一致 |
| 4 | 两个 HTML 的难度档位是否一致？ | **是，但都是旧版固定规格** | 两者都含 `240` 旧规格；均无 10 档 L2 / 4 档 L1 表 |
| 5 | 两个 HTML 的随机数生成机制是否一致？ | **是（同源）** | 共用 `rng.js` 的 mulberry32；但都缺分档 seed 池 |
| 6 | 两个 HTML 的重新开局机制是否一致？ | **是，但都是旧版各自实现** | 旧版 `case 'start'` / `case 'restart'` / `case 'replay'` / 键盘 `r` 各自直接调 `game.startLevel()`，无统一入口 |
| 7 | 是否存在 HTML 内嵌代码与 `src/` 脱节？ | **是，严重** | bundle 哈希不等，见 §2 |
| 8 | 是否存在旧版本配置覆盖新版配置？ | **是（在 HTML 里）** | HTML 内嵌 `LEVEL_SPEC` 的 L1 48 张 / L2 240 张固定规格覆盖一切；源码里 `LEVEL_SPEC` 仅作为「不传档位」的兼容路径保留，`levelParams(level, rand, profileId)` 才读档位 |
| 9 | 是否存在存档恢复导致重新开局仍用旧牌局？ | **部分：无牌面存档，但档位被旧值覆盖** | `store.js` 只存 `level/best/sound/sfxVol/p1/p2`，**不存牌面**，所以不会恢复旧牌局；但 `boot()` 里 `applySave(loadSave())` 会先读回 `p1/p2`，再 `rollProfile` 重抽；`case 'start'` 在非毕业分支直接 `game.startLevel(game.level)`，**不走重抽、不换档位、不做差异化**，属于「复用当前档位」 |
| 10 | 是否存在随机种子变化但牌数和实际布局仍重复？ | **是，且是设计使然** | `layout_profiles.js:107-109`：`const s = seed ^ ...; const rng = makeRng(s); void rng;` —— 布局形状完全由 `profile` 决定，seed 只影响发牌序列。因此同一档位下换 seed，牌数、坐标、层级、遮挡结构完全相同 |

补充发现（审计中额外识别）：

- **档位牌数碰撞**：L2 档 id 3 与 id 7 都是 `27 层 / mainCount 268 / queue 44 / 312 张`，且 `layerPlanFor()` 与 `queueZones()` 输入相同 → 几何完全相同，仅 `types` 与 `groupsPerType` 不同（16 种 vs 14 种）。即 10 个档位只有 **9 种牌数 / 9 种几何**。
- **L1 恰好 4 种牌数**：24 / 30 / 36 / 48，对应 4 种几何。滚动窗口「最近三局不同」要求连续 4 局覆盖全部 4 档，随机抽取必须用重试保证。
- **无 `generationReason`、无 `gameId`、无布局签名、无历史记录**。
- **无 `CHANGELOG.md`**。
- **测试有效性**：`test.js` 共 198 处 `ok(...)`，未发现 `|| true`、`ok(true, ...)`、`resolveSlot(...) === 0 || ... || true` 一类恒真断言；但测试只覆盖 `engine.restartLevel()` / `startNewRun()` 的档位变化，**没有覆盖 main.js 的三种真实重开入口，也没有覆盖任何「最近三局差异化」逻辑**（功能尚不存在）。

---

## 4. 真实档位配置（从 `src/game/config.js` 读取，非凭空编造）

### 第一关 `LEVEL1_PROFILES`（4 档，权重各 0.25）

| difficultyId | 层数 | 牌型数 | 主堆 | 队列 | **总牌数** | 组数 |
|---:|---:|---:|---:|---:|---:|---:|
| 0 | 2 | 8 | 24 | 0 | **24** | 8 |
| 1 | 3 | 10 | 30 | 0 | **30** | 10 |
| 2 | 3 | 12 | 36 | 0 | **36** | 12 |
| 3 | 3 | 16 | 48 | 0 | **48** | 16 |

牌数范围 **24–48**，共 **4** 个不同值（恰好满足最近三局滚动窗口的最低要求 4）。

### 第二关 `LEVEL2_PROFILES`（10 档，权重 0.70 大盘 + 0.30 轻量）

| difficultyId | 层数 | 牌型数 | 主堆 | 队列 | **总牌数** | 组数 | kind |
|---:|---:|---:|---:|---:|---:|---:|---|
| 0 | 28 | 15 | 277 | 44 | **321** | 107 | large（原作基准） |
| 1 | 24 | 13 | 238 | 44 | **282** | 94 | large |
| 2 | 26 | 14 | 256 | 44 | **300** | 100 | large |
| 3 | 27 | 16 | 268 | 44 | **312** | 104 | large |
| 4 | 23 | 13 | 229 | 44 | **273** | 91 | large |
| 5 | 25 | 13 | 247 | 44 | **291** | 97 | large |
| 6 | 22 | 13 | 217 | 44 | **261** | 87 | large |
| 7 | 27 | 14 | 268 | 44 | **312** | 104 | large ← 与 id3 碰撞 |
| 8 | 15 | 15 | 148 | 44 | **192** | 64 | lite |
| 9 | 20 | 15 | 211 | 44 | **255** | 85 | lite |

牌数范围 **192–321**，共 **9** 个不同值（id3 / id7 同为 312）。

### 配置冲突判定（第六阶段）

> 「最近三局牌数不同」= 连续 4 局需要 4 个互不相同的牌数。
> L1 有 4 个 → **刚好够用，无冲突**；L2 有 9 个 → **足够，无冲突**。
> 因此**不需要**、也**不允许**通过增删牌来扩展档位；本轮保留全部 14 个合法档位原样。
> 唯一需要报告的是 id3/id7 的牌数与几何碰撞：由统一生成入口把两者视为「同一牌数 + 同一几何」而拒绝连续出现。

---

## 5. 问题清单与严重程度

| ID | 问题 | 严重度 | 影响 |
|---|---|---|---|
| P0-1 | 两个 HTML 内嵌旧 bundle，与当前 `src/` 完全脱节 | **致命** | 用户拿到的网页版没有动态档位/存档字段/新 UI；打开正常 ≠ 一致 |
| P0-2 | 没有统一新牌局生成入口，`start` / `restart` / `replay` / `next` / 键盘 `r` 各自直接调 `startLevel` | **致命** | 无法保证三种重开走同一规则 |
| P0-3 | 没有最近三局历史，更没有按关卡隔离；无持久化 | **致命** | 核心需求完全缺失 |
| P0-4 | 没有布局签名；seed 变化不改变几何（审计问题 10） | **致命** | 无法判断「实际布局」是否不同 |
| P1-1 | `case 'start'` 非毕业分支不重抽档位、不换 seed、不做差异化 | 高 | 标题页重新开始可能复用上一局档位 |
| P1-2 | 无 `generationReason` / `gameId` / `generatedAt` / 调试面板 | 高 | 无法复现与审计 |
| P1-3 | Rust 白名单只有 9 键，无法保存历史；存档 `v:2` | 高 | 桌面端历史无法持久化 |
| P1-4 | 无 `CHANGELOG.md`；文档里仍有未标注的旧牌数（README L261/L376、RELEASE_NOTES L125、reports/DIFFICULTY.md L25） | 中 | 文档与源码不符 |
| P2-1 | `LEVEL2_PROFILES` id3 / id7 牌数与几何完全碰撞 | 中 | 档位表有效多样性只有 9 |
| P2-2 | 无 `test-random-generation.js` / `test-build-consistency.js`；无 200 局报告 | 中 | 无法验收 |
| P2-3 | 存档 `applySave` 会覆盖刚抽好的档位（当前已用 `preserveProfile` 兜底异步路径，但同步路径仍读回 p1/p2） | 中 | 启动档位来自旧存档 |
| P3-1 | `nextLevelPreview()` 仍返回无档位的旧固定规格 | 低 | 标题页预览潜在硬编码 |

---

## 6. 现有安全边界（第十二阶段核对，修复前）

| 项 | 状态 |
|---|---|
| 存档大小上限 | `MAX_SAVE_BYTES = 64 * 1024`，本轮不放宽 |
| JSON 格式验证 | `serde_json::from_str` + 必须为对象 |
| 字段白名单 | 9 键，未知字段拒绝 |
| 路径访问限制 | 固定 `<exe 同级>/MahLeMah_Data/save.json`，前端不能指定路径 |
| 原子写入 | `save.json.tmp` → `write_all` → `sync_all` → `rename` |
| 错误处理 | 损坏存档 `load_state` 返回空串，不进游戏 |
| 版本号 | 只允许 `v ∈ {1,2}` |
| 前端删除/系统命令 | 已彻底移除 |

---

## 7. 修复前后差异报告

### 7.1 修复前

见 §2 / §3 / §5。一句话：**源码有动态档位，网页产物停留在冻结版；无差异化机制、无历史、无签名、无统一入口、无调试面板、无对应测试与报告。**

### 7.2 修复后（2026-11-11，全部有真实运行证据）

| 维度 | 修复前 | 修复后 |
|---|---|---|
| 现代版 HTML | 84,283 B，内嵌 JS 82,461 B（11-10 冻结版） | **114,279 B**，内嵌 JS **112,147 B**，与现场打包逐字节相同 |
| 现代版 SHA256 | `56df003a44b049e1a…` | `c08d60afaa85a8f5c1d6d49ca5d196cc9528dae09250f445a6e5432ca6093b9f` |
| legacy HTML | 118,830 B，业务段 88,832 B（11-10 冻结版） | **149,684 B**，业务段 **119,342 B**，与现场 Babel+压缩产物逐字节相同 |
| legacy SHA256 | `deb3d7f604bec13e…` | `4776ad9ea4a8016b6547dd0cc2731cd9f6fab744826e340580cb603ee6575578` |
| 构建元信息 | 无 | 注入 `buildVersion=2.0.0-1f95db0`、`gitCommit`、`sourceHash=864943bcb18854b6…`、`buildTimestamp`、`sourceFiles` |
| 统一生成入口 | 无，5 处各自直接调 `startLevel` | `createNewGame()` 唯一入口；`main.js` 的 `start`/`restart`/`replay`/`next`/键盘 `r`/`?lv=` 全部走 `newGame()` |
| 最近三局历史 | 无 | `level1RecentGames` / `level2RecentGames`，存档 `v:3`，Rust 白名单 11 键，≤3 条并逐字段校验 |
| 布局签名 | 无 | `calculateLayoutSignature()`（几何 / 分布 / 主签名三个 SHA-256），纯 ES5 实现三端一致 |
| 调试面板 | 无 | `?dev=1`，正式版隐藏，真实 `game.meta` + 四项 PASS-FAIL；Edge CDP 实测两个 HTML 均渲染 |
| 200 局测试 | 无 | `test-random-generation.js`：**5053 通过 / 0 失败 / EXIT=0**，两关各 100 局，滚动窗口重复 0 次 |
| 构建一致性测试 | 无 | `test-build-consistency.js`：**46 通过 / 0 失败 / EXIT=0**，逐字节比对而非大小/版本号 |
| 浏览器实测 | 无本轮记录 | Edge `157.0.4341.42` CDP 真实打开两个 HTML 各生成 4 局，`allPassed=true`，零 JS 异常 |
| 存档版本 | `v:2`（9 字段） | `v:3`（11 字段），64 KB 上限 / 原子写入 / 白名单均未放宽 |

**修复过的真实缺陷（测试中发现并定位）**：应用重启后 `game.profile` 是构造默认值，
与「上一局档位」不一致，导致唯一合法档位被误判为重复而耗尽 50 次重试。
已改为以本关历史最后一局的 `difficultyId` 作为当前档位依据；200 局测试与浏览器实测均复验通过。

**仍未通过 / 未执行**：`node test.js` 的 11 项 Wilson 上界断言（规格 5.1/5.2 数学互斥，
阈值未放宽）；桌面 exe / Portable zip / NSIS Setup 未重建；Windows 真机安装卸载测试本轮未执行。
详见 `reports/FINAL_ACCEPTANCE.md`。
