# 变更日志 · Mah 了个 Mah

> 版本号沿用 `package.json` / `src/game/config.js` 的 `2.0.0`；本文件按日期记录增量。
> 所有「已通过」均有真实运行输出支撑，见 `reports/` 下对应报告；未执行项见 `reports/FINAL_ACCEPTANCE.md`。

---

## 2026-11-11 · 双关卡随机生成机制重构 / 最近三局差异化 / 双 HTML 一致性

### 新增

- `src/game/sha256.js`：纯 ES5 同步 SHA-256，现代版 / legacy(IE8) / Node 三处共用同一实现
  （与 `node:crypto` 10 组样例逐字节对照通过）。
- `src/game/layout_signature.js`：`calculateLayoutSignature()` 从实际牌局数据计算
  `geometrySignature`（坐标 / 层级 / 区域 / 遮挡 / 可操作区）、
  `distributionSignature`（牌型分布）、`layoutSignature`（两者合成）。
- `src/game/recent_games.js`：`level1RecentGames` / `level2RecentGames` 独立历史、
  字段白名单、损坏记录安全丢弃、最近 3 条滚动窗口、`checkAgainstRecent()`。
- `src/game/new_game.js`：**唯一**新牌局生成入口 `createNewGame()`，
  最多重试 50 次，失败抛 `GenerationFailureError` 并记录逐次原因。
- `src/game/build_info.js`：读取构建注入的 `buildVersion/gitCommit/sourceHash/buildTimestamp`。
- `src/main.js`：`?dev=1` 开发调试面板（正式版隐藏），显示真实运行数据与四项 PASS-FAIL。
- `tools/bundle_shared.mjs`：构建链单一实现，供两个构建脚本与一致性检查共用。
- `test-random-generation.js`：两关各 100 局压力测试 + JSON/MD/stdout 三份报告。
- `test-build-consistency.js`：两个 HTML 与 `src/` 的逐字节 bundle 一致性检查。
- `tools/browser_smoke.mjs`：Edge CDP 真实浏览器打开两个 HTML 各生成 4 局。
- `CHANGELOG.md`（本文件）、`reports/CODE_AUDIT.md`、`reports/FINAL_ACCEPTANCE.md`、
  `reports/MODIFIED_FILES.md`、三份自动报告。

### 修改

- `src/main.js`：所有新开局入口（`case 'start'` / `'restart'|'replay'` / `'next'` /
  键盘 `r` / `?lv=`）收敛到 `newGame()` → `createNewGame()`；
  `generationReason` 区分 4 种；`saveState` 链式传递与持久化。
- `src/game/engine.js`：新增 `installLevelData(data, meta)`，一次安装已生成牌局，
  不再二次生成；`meta` 携带调试面板与测试所需的真实运行数据。
- `src/game/save_data.js`：存档升级 `v:3`，写入 / 读回两关最近三局历史；旧档兼容。
- `src/game/render.js`：HUD 的张数 / 牌型数 / 层数全部从当前实际牌局读取，无硬编码。
- `src-tauri/src/main.rs`：`SAVE_FIELDS` 9 → 11 键，新增 `validate_history_field()`
  （≤3 条 / 12 字段完整 / 64 位小写签名 / 整数范围 / reason 枚举），`v ∈ {1,2,3}`；
  64 KB 上限、JSON 校验、白名单、固定路径、原子写入均未放宽。
- `tools/build_web.mjs` / `tools/build_legacy.mjs`：从 `src/` 重新构建两个 HTML，
  注入 `<script id="mah-build-info">` 与 `<script id="mah-bundle">`。
- `test.js`：`[8b]` 同步 Rust 白名单 / 版本断言；`[13]` 改为统一入口真实行为断言；
  新增 `[14]` 覆盖签名、历史、统一入口、失败路径、存档 v3。
- `README.md` / `DELIVERY.md` / `RELEASE_NOTES.md` / `TEST_REPORT.md` /
  `reports/DIFFICULTY.md`：同步当前真实档位、牌数、测试与构建方式，标注历史数据。

### 修复

- 审计发现两个 HTML 停留在 2026-11-10 冻结版（内嵌 JS 82,461 B ≠ 当前源码 92,825 B），
  重建后由 `test-build-consistency.js` 逐字节验证一致。
- 审计发现「换 seed 不改布局」：`layout_profiles.js` 的几何只由档位决定；
  本轮通过「几何签名硬判定 + 冲突重试换档位」修复差异化，不把 seed 变化冒充布局变化。
- 应用重启后 `game.profile` 为默认档位导致「当前档位」误判、50 次重试耗尽；
  改为以本关历史最后一局的 `difficultyId` 为准（200 局测试实测发现并修复）。
- `LEVEL2_PROFILES` 的 id 3 / id 7 同为 312 张且几何相同：统一入口将两者判为同一布局，
  拒绝在最近三局窗口内连续出现（配置本身保留，未增删牌）。

### 已知未通过 / 未执行（如实记录）

- `node test.js` 的 11 项 Wilson 上界断言仍失败：规格 5.1「池内每种子强策略可解」
  与 5.2「通关率上界 ≤3%」在证书可解性设计下数学互斥。按「不许放宽阈值」原样保留，
  未改测试凑数。其余断言（含本轮新增 `[14]`）全部通过。
- `dist/MahLeMah-Setup-v2.0.0.exe` / Portable zip / 桌面 exe 仍是 2026-11-10 冻结产物，
  本轮**未重建**；因此 Windows 真机安装 / 卸载测试对应的是旧构建，未对本轮代码重新执行。
- `npm run test:release`（12000 局发布压力测试）本轮未重新执行；
  `reports/DIFFICULTY.md` 是旧版静态规格下的历史报告，已标注。

---

## 2026-11-11（早）· 动态档位系统

- `LEVEL2_PROFILES` 10 档 / `LEVEL1_PROFILES` 4 档、`rollProfile()` 加权抽取、
  28 层基准曲线插值、`generateProfileLayout()`、分档 seed 池、存档 `p1/p2`、
  通关后从第 1 关重新开始。提交 `1f95db0`。
- `node test.js` 真实输出 `1301 通过 / 11 失败 / EXIT=1`，完整输出见
  `reports/TEST_OUTPUT_DYNAMIC_PROFILES.txt`。

## 2026-11-10 · 最终生产版（取消 BGM，只保留音效）

- 从生产构建彻底移除背景音乐模块，只保留独立 SFX 链路；
- 重建网页版、桌面 exe、Portable zip、NSIS Setup、SHA256 与文档；提交 `79523ce`。

## 2026-11-09 · v2.0.0 双关卡模板

- 16 牌型统一注册表、两关布局模板、六机器人难度模型、Rust 存档加固、Windows 双产物。
