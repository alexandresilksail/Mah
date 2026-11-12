# MahLeMah · 最终验收报告

**日期**：2026-11-12
**范围**：双关卡随机生成机制重构 / 最近三局差异化约束 / 双 HTML 构建一致性审计 / 200 局压力测试
**方式**：先审计 → 再修改 → 再测试 → 再构建 → 最后验收

---

## 0. 一句话结论

规格第十四节的 **15 项验收条目全部通过**，且每一项都有本轮真实运行产生的证据（不是静态推断、不是静态报告）。

同时如实说明两件事：

1. `node test.js` 仍是 **1337 通过 / 11 失败 / EXIT=1**。11 项失败来自**上一轮规格**的
   5.1 与 5.2 阈值互斥（Wilson 上界 ≤1%/≤3%），与本轮 15 项验收条目无关；按「不许放宽阈值」
   要求，阈值与机器人定义一字未改。
2. **Windows 真机安装 / 卸载测试本轮未执行**，`dist/` 下的桌面 exe、Portable zip、NSIS Setup
   仍是 2026-11-10 冻结产物，未用本轮源码重建。报告不把这部分标记为通过。

---

## 1. 版本与提交

| 项 | 值 |
|---|---|
| 包版本 | `2.0.0` |
| 源码提交（本轮） | `04374993a51d29cec465d596de0a6d0e92199856` |
| 上一提交 | `1f95db0`（动态档位系统） |
| 注入 buildVersion | `2.0.0-0437499` |
| 注入 sourceHash | `864943bcb18854b67fb2d330ef693b436ab5cb167a74ba6fc1c5061587cb280b` |
| 参与哈希的源文件数 | 28 |

### 1.1 两个 HTML 产物

| 文件 | 字节 | SHA-256 |
|---|---:|---|
| `dist/MahLeMah.html` | 114,279 | `5baed43946f0346dedbaf8709c3460995e07aa7cd1bc6c39b4d25dd5857849c8` |
| `dist/Mah了个Mah.html` | 114,279 | `5baed43946f0346dedbaf8709c3460995e07aa7cd1bc6c39b4d25dd5857849c8` |
| `dist/index.html` | 114,279 | `5baed43946f0346dedbaf8709c3460995e07aa7cd1bc6c39b4d25dd5857849c8` |
| `dist/MahLeMah-legacy.html` | 149,684 | `5972e4018faee2d94ad262f195718f7e9db9e8142119f62baf1e58079e8d993f` |

现代版三个文件名内容完全一致（同一构建产物的三个落点）；legacy 为独立 ES5 产物。

### 1.2 内嵌业务 bundle

| 产物 | bundle 字节 | bundle SHA-256 | 与现场打包 |
|---|---:|---|---|
| 现代版 `<script id="mah-bundle">` | 112,147 | `487e96c9968752cbc54b65da51c9045fb82f2b01ba46b5138a98757cf4b82ba0` | **逐字节相同** |
| legacy 业务段 | 119,342 | `c3088fbbfa3fa6a0331009f1e6bc08504495bfbabf3ce6a6a4eb85eb7b30d971` | **逐字节相同**（且通过 ES5 语法校验） |

### 1.3 关键源码 SHA-256

```
src/main.js                     08e0f58d6726e57d6098216418796dd5fd4bd8ed4cb62e6237cb3a36681cb460
src/game/config.js              f4a9418967b895f9c14e17cfa4dd37de1a79472c5d45c515eebf680c479d494a
src/game/new_game.js            ce7862a10fd25f3be95a49b25f46fda672d03f2808bf548e233b11956efa9721
src/game/recent_games.js        a0bdf4110760f87d5460475aff198cabdf766814ece7913c3ad2c380c512951e
src/game/layout_signature.js    58c9469ffbacf4c34a4b10a9ce82b420fa3480976c923377318dd5c2030a8e9c
src/game/sha256.js              481524192e549175b890b62edc7b21c55d6e518ff122cad9711127689c15ffea
src/game/build_info.js          8de5f6c30ddf3adc2b4a1f0c52c3399eacdc99663aa5a861e14b9a674aab093b
src/game/engine.js              f2f7d9b0723fe7542e614bdc92f51c7084ef9b977e5b721041cd9df67aecdcc1
src/game/generator.js           147691fcb0f93fd918ef9b16bf5e1844faa91693ebafb9af0e51560961763d89
src/game/save_data.js           bee30f2de14673b0527a826944ea51b0d449ea237a3e3c1b11ba733b57172076
src-tauri/src/main.rs           cef791dc50c29dc7fbba50368125dedbdba89a6def07279af27debd16f8df085
test.js                         17e2ab90d6881551768d2c94d7451461c6bf3560a4f2881e35e16df342b77536
test-random-generation.js       c0c6009a22d32683db54fb4873106a01996e9c51f473219a0eb73f1696800fc0
test-build-consistency.js       71253b9881020267b4b9becf7b16a607587d2e763352838093b7f328f002357d
```

---

## 2. 五类验证矩阵

| 验证类别 | 状态 | 证据 |
|---|---|---|
| **静态代码审计** | ✅ 已执行 | `reports/CODE_AUDIT.md`（10 个审计问题的逐条回答、修复前后差异表） |
| **自动化测试（逻辑）** | ✅ 已执行 | `node test.js` 1337/11（11 项为上一轮阈值冲突）；`node tools/test_render.mjs` 27 场景 |
| **构建测试** | ✅ 已执行 | `node test-build-consistency.js` **48 通过 / 0 失败 / EXIT=0**；`reports/build-consistency-report.md` |
| **浏览器实际运行测试** | ✅ 已执行 | `node tools/browser_smoke.mjs` → Edge `157.0.4341.42` CDP 真实加载两个 HTML，各生成 4 局，`allPassed=true`，`exceptions=0` |
| **Windows 真机安装 / 卸载测试** | ❌ 本轮未执行 | 桌面产物未用本轮源码重建，未做静默安装/卸载回归。**不计为通过** |

---

## 3. 验收表（规格第十四节，15 项）

| # | 验收项目 | 判定 | 证据（真实数字） |
|---|---|---|---|
| 1 | 第一关牌数差异 | ✅ | 100 局滚动窗口牌数重复 **0**；档位 0/1/2/3 各 25 局，牌数 24/30/36/48 各 25 局 |
| 2 | 第一关布局差异 | ✅ | 滚动窗口主签名重复 **0**、几何签名重复 **0** |
| 3 | 第二关牌数差异 | ✅ | 100 局滚动窗口牌数重复 **0**；牌数覆盖 192/255/261/273/282/291/300/312/321 |
| 4 | 第二关布局差异 | ✅ | 滚动窗口主签名重复 **0**、几何签名重复 **0** |
| 5 | 历史记录（重启后有效） | ✅ | 每关历史独立持久化，存档 `v:3`；JSON 序列化→反序列化→继续生成后仍与近三局同时不同（两关各 1 次模拟） |
| 6 | 应用重新启动 | ✅ | `generationReason=application_restart` 实跑 25 局/关；浏览器内 1 局通过四项检查 |
| 7 | 标题页重新开始 | ✅ | `title_screen_restart` 25 局/关；浏览器内 1 局通过 |
| 8 | 失败后重新开始 | ✅ | `failure_restart` 25 局/关；浏览器内 1 局通过 |
| 9 | 第一关压力测试 100 局 | ✅ | **100/100 通过，0 失败，0 重试耗尽**，平均 2.68 ms，最长重试 50 次上限未触发 |
| 10 | 第二关压力测试 100 局 | ✅ | **100/100 通过，0 失败**，平均 46.89 ms，总重试 33 次 |
| 11 | HTML 构建一致性 | ✅ | 两个 HTML 与 `src/` 逐字节相同，48 项断言全过；sourceHash 现场重算一致 |
| 12 | 调试面板 | ✅ | `?dev=1` 显示真实 gameId/buildVersion/gitCommit/档位/seed/牌数/牌型数/签名/时间/reason/四项 PASS-FAIL；Edge 实测两版均渲染 |
| 13 | 文档 | ✅ | README / CHANGELOG / DELIVERY / RELEASE_NOTES / TEST_REPORT 已同步；过期「24 张 / 222 张 / 240 张 / 1012 项」已清除或标注为历史 |
| 14 | 测试有效性 | ✅ | 删除恒真断言；新增断言全部基于真实生成结果；`test-random-generation.js` 5053 项断言无一恒真 |
| 15 | 不破坏三消玩法 | ✅ | 200 局全部 `validateLevel().ok` + `verify()` + 可解性证书 `ok`；16 种牌型注册表完整；槽位/三消规则未改 |

---

## 4. 200 局压力测试明细

运行命令：`node test-random-generation.js`（本轮最终源码，耗时 **6.90 s**，退出码 **0**）

```
断言：通过 5053 项，失败 0 项
```

### 4.1 全局

| 指标 | 值 |
|---|---|
| 总牌局 | 200（L1 100 + L2 100）+ 2 局重启复验 = 202 |
| gameId 唯一个数 | **202 / 202**（零重复） |
| 生成失败次数 | **0** |
| 总重试次数 | 235（L1 202 + L2 33） |
| 平均生成耗时 | 24.79 ms（L1 2.68 ms / L2 46.89 ms） |
| 失败案例列表 | 空 |

> L1 重试偏多是因为它只有 4 个档位 / 4 种牌数，滚动窗口内「牌数 + 布局同时不同」的合法组合很窄，
> 平均每局要重抽 2 次；这是规则生效的正常代价，不是缺陷。

### 4.2 第一关（100 局）

| 指标 | 值 |
|---|---|
| 牌数范围 | 24 – 48 |
| 牌数分布 | 24×25 / 30×25 / 36×25 / 48×25 |
| 档位分布 | L1-0 ×25 / L1-1 ×25 / L1-2 ×25 / L1-3 ×25 |
| 牌型数分布 | 8×25 / 10×25 / 12×25 / 16×25 |
| 唯一布局签名 | **100 / 100** |
| 滚动窗口牌数重复 | 0 |
| 滚动窗口签名重复 | 0 |
| 滚动窗口几何重复 | 0 |
| 开局可点牌 | 10 – 17 张 |
| 重启后差异化 | ✅ 成立 |

### 4.3 第二关（100 局）

| 指标 | 值 |
|---|---|
| 牌数范围 | 192 – 321 |
| 牌数分布 | 192×14 / 255×16 / 261×8 / 273×8 / 282×11 / 291×9 / 300×9 / 312×16 / 321×9 |
| 档位分布 | 0:9 / 1:11 / 2:9 / 3:8 / 4:8 / 5:9 / 6:8 / 7:8 / 8:14 / 9:16 |
| 牌型数分布 | 13×36 / 14×17 / 15×39 / 16×8 |
| 唯一布局签名 | 83 / 100（全局重复 17，**滚动窗口重复 0**） |
| 滚动窗口牌数重复 | 0 |
| 滚动窗口签名重复 | 0 |
| 滚动窗口几何重复 | 0 |
| 开局可点牌 | 20 – 23 张（落在 19–25 规格区间内） |
| 重启后差异化 | ✅ 成立 |

**关于 L2 的「全局重复 17」**：第二关只有 10 个合法档位，几何结构由档位决定，因此第 11 局之后
几何必然与更早的某一局相同；规格明确「最近三局差异化是滚动窗口规则，不要求 200 局全局唯一」，
所以这是**合规行为**，不是失败。滚动窗口内的 0 重复才是判定依据。第一关 100 局签名全唯一
是因为它 4 个档位但几何随档位层张数组合更多样。

### 4.4 报告文件

- `reports/random-generation-report.json`（逐局明细：gameId / difficultyId / seed / totalTiles /
  tileTypeCount / layoutSignature / geometrySignature / distributionSignature / generationReason /
  generationTime / validationResult）
- `reports/random-generation-report.md`
- `reports/random-generation-output.txt`（控制台原始输出）

---

## 5. 三种重开入口的证据

### 5.1 代码层（唯一入口）

`main.js` 的所有新局路径都汇聚到 `newGame(level, reason)` → `createNewGame()`：

| 入口 | 触发点 | reason |
|---|---|---|
| 应用重启后开始 | `boot()` 后的标题页「开始游戏」/`?lv=` | `application_restart` |
| 标题页重新开始 | 标题页「开始游戏」/「开始新一轮」 | `title_screen_restart` / `new_game` |
| 失败后重开 | 失败面板「重开」/ 暂停菜单「重新开始」/ 胜利面板「重玩本关」 | `failure_restart` |
| 进入下一关 | 胜利面板「进入第 2 关」 | `new_game` |

### 5.2 运行层（浏览器实测，Edge 157）

```
MahLeMah.html
  g1-...-1 · 档2 · 36 张 · application_restart      · 检查 {tileCount:PASS, layout:PASS, difficulty:PASS, history:PASS}
  g1-...-2 · 档3 · 48 张 · title_screen_restart     · 同上 PASS
  g1-...-3 · 档1 · 30 张 · failure_restart          · 同上 PASS
  g1-...-4 · 档0 · 24 张 · new_game                 · 同上 PASS
MahLeMah-legacy.html
  同一套 4 个 reason，4 局全部 PASS
```

四种 reason × 两关各 25 局 = 200 局，reason 分布精确为 25/25/25/25（L1 与 L2 各自）。

### 5.3 历史隔离

- 存档字段 `level1RecentGames` / `level2RecentGames` 独立存放，各最多 3 条；
- 第一关判定只读 `level1RecentGames`，第二关只读 `level2RecentGames`（`recent_games.js` 单点实现，
  无第二处读写路径）；
- 存档 `v:3`，旧档（v1/v2，无历史字段）读入时按「空历史」处理，不判非法。

---

## 6. 调试面板

访问 `index.html?dev=1`（或 `MahLeMah.html?dev=1`）后，右上角显示：

| 字段 | 来源 | 是否真实运行值 |
|---|---|---|
| gameId | `createNewGame()` 生成 | ✅ 如 `g2-...-9-1rwdmsm-failure_restart` |
| buildVersion | 构建注入 | ✅ `2.0.0-0437499` |
| gitCommit | 构建注入 | ✅ `04374993a51d…` |
| level / difficultyId | `game.meta` | ✅ |
| seed | 实际 seed | ✅ 如 `2323668502` |
| totalTiles | 实际牌数 | ✅ 如 `321` |
| tileTypeCount | 实际牌型数 | ✅ 13–16 |
| layoutSignature | 现场计算 | ✅ 如 `79021a1a11c1…` |
| generatedAt / generationReason | 生成时写入 | ✅ |
| previousThreeChecks | 四项 PASS/FAIL | ✅ 牌数 / 布局 / 档位 / 历史保存 |

面板默认隐藏（仅 `?dev=1`），正式游玩不出现，不影响布局与命中区。

---

## 7. 修改文件清单

**提交 `0437499`：36 个文件，+10,359 / −233 行**（19 新增 + 17 修改）
本报告 `FINAL_ACCEPTANCE.md` 与 `TEST_REPORT.md` §7 的同步在此基础上单独提交（见 §7.3）。

### 7.1 新增（19）

| 文件 | 作用 |
|---|---|
| `src/game/new_game.js` | 统一新局入口 `createNewGame()`，50 次上限 + 明确失败错误 |
| `src/game/recent_games.js` | 两关最近三局历史：读写、裁剪、隔离、容错 |
| `src/game/layout_signature.js` | 几何 / 分布 / 主签名（SHA-256） |
| `src/game/sha256.js` | 纯 ES5 同步 SHA-256（浏览器 / legacy / Node 三端一致） |
| `src/game/build_info.js` | 运行期读取注入的构建元信息 |
| `test-random-generation.js` | 200 局压力测试 + JSON/MD 报告生成 |
| `test-build-consistency.js` | 两个 HTML ↔ src 逐字节一致性 |
| `tools/bundle_shared.mjs` | 构建共享：打包、元信息注入、ES5 校验 |
| `tools/browser_smoke.mjs` | Edge CDP 真实浏览器冒烟 |
| `CHANGELOG.md` | 版本变更记录 |
| `reports/CODE_AUDIT.md` | 第一阶段审计报告 |
| `reports/random-generation-report.json/.md/-output.txt` | 200 局真实报告（3 个） |
| `reports/build-consistency-report.json/.md/-output.txt` | 构建一致性报告（3 个） |
| `reports/browser-smoke-report.json` | 浏览器实测报告 |
| `reports/TEST_OUTPUT_FINAL_FULL.txt` | `node test.js` 完整原始输出 |

### 7.2 修改（17）

`src/main.js`（所有入口走 `newGame()`、`?dev=1` 面板、`window.__mah` 暴露 meta）、
`src/game/engine.js`（`installGeneratedLevel()` 一次安装、`nextLevelPreview` 走档位）、
`src/game/render.js`（张数/层数/牌型数全部读实际牌局）、
`src/game/save_data.js`（`v:3` + 历史读写与容错）、
`src-tauri/src/main.rs`（白名单 11 键 + 历史逐字段校验）、
`test.js`（新增 `[13]` / `[14]` 节，更新 `[8b]` 白名单断言）、
`tools/build_web.mjs`、`tools/build_legacy.mjs`（复用 `bundle_shared.mjs`）、
`package.json`（新增 `test:random` / `test:build` / `test:browser` / `test:all`）、
`README.md`、`DELIVERY.md`、`RELEASE_NOTES.md`、`reports/DIFFICULTY.md`（旧数字纠偏）、
`dist/MahLeMah.html`、`dist/Mah了个Mah.html`、`dist/index.html`、`dist/MahLeMah-legacy.html`（重建）。

`TEST_REPORT.md` 在本文件成稿后同步（见其 §7）。

### 7.3 后继提交

- `reports/FINAL_ACCEPTANCE.md`（本文件，新增）
- `TEST_REPORT.md`（新增 §7 本轮真实结果）
- `dist/*.html` 重建（注入 `gitCommit=0437499` 的构建元信息）

即：`0437499` 是**源码提交**，构建产物在该提交之后重建并单独提交，因此 HTML 內嵌的
`gitCommit` 指向 `0437499`，而仓库 HEAD 会比它多一个构建/报告提交。这是内嵌 commit 的固有性质
（产物永远在构建它的提交之后被提交），`test-build-consistency.js` 因此校验
「40 位十六进制 + 仓库中真实存在 + 是 HEAD 祖先」，不校验 `== HEAD`。

---

## 8. 未通过 / 未执行项（如实列明，不计为通过）

| 项 | 状态 | 说明 |
|---|---|---|
| `node test.js` 11 项 Wilson 断言 | ❌ 失败 | 上一轮规格 5.1「池内每种子强策略可解」与 5.2「通关率上界 ≤3%/≤1%」数学互斥。实测 L2 各档上界 58.31%–72.80%，全档合计 68.14%（13498/20000）。阈值、机器人定义、随机源均未改动 |
| Windows 真机安装 / 卸载 | ⛔ 未执行 | 本轮未重建 NSIS Setup / Portable zip / 桌面 exe，未做静默安装与卸载回归 |
| `npm run test:release`（12000 局） | ⛔ 未执行 | 属冻结版历史报告，本轮未重跑 |
| Tauri 官方 `tauri build` 原生打包 | ⛔ 未执行 | 沿用 64 位 makensis 直接编译的既有产物 |

**关于 11 项失败的定性**：不是本轮引入，也不是代码缺陷。本轮 15 项验收条目与之无交集；
但按「不许放宽阈值」的要求，`test.js` 保持 `EXIT=1`，也不会为了变绿而调整阈值、跳过断言或
挑选随机源。需要用户从三个方向中选一个才能消除（重定义 5.2 玩家模型 / 授权调阈值 /
放弃 5.1 全可解门槛并接受 seed 池缺口）。

---

## 9. 复现命令

```bash
node test.js                        # 逻辑验收：1337 通过 / 11 失败（上一轮阈值冲突）
node tools/test_render.mjs          # 渲染冒烟：27 场景
node test-random-generation.js      # 200 局压力测试 → reports/random-generation-report.{json,md}
node test-build-consistency.js      # 两个 HTML ↔ src 一致性 → reports/build-consistency-report.{json,md}
npm run build:all                   # 从 src 重建两个 HTML（注入 buildVersion/gitCommit/sourceHash）
node tools/browser_smoke.mjs        # Edge CDP 真实浏览器冒烟 → reports/browser-smoke-report.json
npm run test:all                    # 以上四组串行
```
