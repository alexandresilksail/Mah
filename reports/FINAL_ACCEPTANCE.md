# MahLeMah · 最终验收报告（背景音乐集成 + 双关卡布局修复）

**日期**：2026-11-12
**范围**：只修改与四项问题直接相关的代码；不做全项目审计，不重构无关模块，不改变核心玩法。
**四项问题**：① 已上传并分配好场景的背景音乐无法播放 ② 第一关整体布局偏上 ③ 第一关反复重开布局重复 ④ 第二关反复重开布局始终相同或高度相似。
**流程**：先审计 → 再修改 → 再测试 → 再构建 → 最后验收。
**本轮提交**：`__COMMIT__`（功能 + 测试 + 产物 + 报告），完整哈希 `__COMMIT_FULL__`，已推送 `origin/main`。

---

## 0. 结论（先说不满足的部分）

**已真实通过**：网页版 / 独立 HTML 版 / ES5 legacy 版的背景音乐**实际解码播放**（Edge 真机，`currentTime` 从 >0 且随时间前进）、场景自动切换、第一关动态居中、双关最近三局差异化、双关各 100 局自动化测试、四个 HTML 产物同步内嵌 5 首音乐。

**未通过 / 未运行（不标记为通过）**：

1. **桌面版（Tauri exe）与 Windows 安装版的背景音乐真机播放：未运行**。本机 `cargo check` / `cargo build` 在 `tauri-utils-*\build-script-build` 处被系统拒绝执行（`os error 5`），exe 无法用本轮源码重建；桌面侧只完成了**前端静态集成**（`src/main.js` 直接引用同一份 manifest、`tauri.conf.json` 的 `media-src` 放行 `data:`/`blob:`），没有在 Tauri 运行时里听过声音。
2. **`dist/MahLeMah-Setup-v2.0.0.exe`、`MahLeMah-Portable-v2.0.0.zip`、`SHA256SUMS.txt` 仍是旧冻结产物**（2026-11-10/11），不含本轮音乐与布局修复。因此「所有正式发布产物均包含最新修复」**只完成了 4 个 HTML 版本**，安装版 **✗**。
3. **Rust `cargo check` / `cargo build`：未运行**。Rust 侧只有静态断言（`test.js [8]` 校验 `SAVE_FIELDS`、v4、4 个音乐命令、`HISTORY_LIMIT: usize = 3`）。
4. `graduated` 场景没有内置曲目（5 个原始文件里没有对应文件名，按「`ambiguous`/`none` 不自动指派」保持静音）；`pause` 没有独立曲目，按现有配置沿用当前关卡曲目。这两点已在真机验证中按实际行为记录。

> 规格第八节「网页版、桌面版、独立 HTML 版背景音乐均能正常播放」→ **部分通过**：网页版 ✓、独立 HTML 版 ✓（含 legacy ✓）、桌面版 ✗ 未运行。

---

## 1. 修改范围（只改直接相关代码）

| 类别 | 文件 |
|---|---|
| 音乐资源 | `src/assets/music/*.wav`（5 个，首次纳入仓库） |
| 音乐清单 / 生成 | `src/game/music_manifest.js`、`tools/gen_music_manifest.mjs` |
| 播放链路 | `src/game/music_player.js`、`src/main.js`、`src/game/render.js` |
| 桌面配置 | `src-tauri/tauri.conf.json`、`src-tauri/src/main.rs`（仅历史窗口 5→3） |
| 布局 | `src/game/layout_profiles.js` |
| 差异化 | `src/game/recent_games.js`、`src/game/new_game.js` |
| 构建 / 测试 | `tools/build_web.mjs`、`test.js`、`test-random-generation.js`、`test-layout-position.js`、`test-music-playback.js`、`test-build-consistency.js`、`tools/browser_smoke.mjs`、`tools/music_real_playback.mjs` |
| 文档 / 报告 | `README.md`、`CHANGELOG.md`、`DELIVERY.md`、`reports/*` |

未改动：`generator.js` / `layout.js` / `engine.js` / `config.js` / `tiles.js` / `seed_pool.js` / `music_flow.js` / `music_store.js` / `music_ui.js` / `music_match.js` / `save_data.js` 等无关模块与核心玩法。

---

## 2. 问题① 背景音乐无法播放 → 已修复（网页 / 独立 HTML / legacy 真机通过）

### 2.1 根因

- 5 个 wav 一直只躺在开发机桌面，**从未进入仓库、产物或存档**；`dist/` 里没有任何音频载荷。
- `MusicPlayer` 只从 `musicStore` 的 blob URL 取源，store 不可用就静音；`syncMusic()` 也因 store 不可用提前 return。
- 桌面版 `tauri.conf.json` 的 CSP 是 `media-src 'none'`，会拦住所有媒体。
- 旧实现用双 audio 槽交叉淡化，切场景时两首会重叠；首次点击只解锁了音效的 `AudioContext`，没解锁 BGM。

### 2.2 修复

| 项 | 实现 | 证据 |
|---|---|---|
| 资源入产物 | 5 个 wav 复制到 `src/assets/music/`，`tools/gen_music_manifest.mjs` 用现有 `matchScene()` 做 exact 匹配，生成 `music_manifest.js`（`data:audio/wav;base64,` 内嵌），esbuild 打进所有 HTML | 7,309,660 B / sha256 `b0a6b8026d1a…`；`test.js [8c]` 逐字节比对 5 个原文件 0 差异；`test-music-playback.js [4]` 4 个 HTML 各 5/5 载荷与 manifest 逐字节一致 |
| 统一映射 | `BUILTIN_MUSIC_MAP`：title / level1 / level2 / win / lose 各 1 首，graduated 空；`mergeMusicMap()` 只追加用户导入曲目，不替换/删除内置资源 | `test.js [8c]`、`test-music-playback.js [1]` |
| 播放链路 | 重写 `music_player.js`，导出 `MusicPlayer` 与 `MusicManager`（同类别名）；内置 data URI 优先，用户 store 仅回落；`syncMusic()` 不再因 store 不可用早退；`playScene()` 切场景先 `_silence()` 停旧曲 | `test.js [18]`、`test-music-playback.js [2]` |
| 首次点击解锁 | `onceUnlock()` 同时调用 `musicPlayer.unlock()`；解锁前只记 `pendingScene`、不创建 audio | Edge 真机：点击前 `unlocked=false, playing=false, instances=0`；点击后 `playing=true, instances=1` |
| 严格单实例 | 删除双槽交叉淡化，复用同一个 audio 槽 | 真机 8 次场景切换每次 `instances=1` |
| 音量/开关/静音独立 | `setEnabled/setMuted/setVolume` 只作用于 BGM；音效走独立 `AudioContext` | `test-music-playback.js [2]` 69/0 |
| 失败处理 | `el.onerror`、`play().catch`、`NO_SOURCE` 全捕获写入 `lastError`/`playErrors` | `test-music-playback.js [2]` |
| 桌面 CSP | `media-src 'self' data: blob:` | `test-music-playback.js [4]` 静态断言 |
| 状态可观测 | `window.__MAH_MUSIC_STATUS__()` / `__MAH_MUSIC_PLAYER__` 暴露 `playing / paused / currentTime / instances / track / lastError` | 真机脚本据此判定 |

### 2.3 真实播放验证（Edge 157 headless + CDP + 真实鼠标事件）

`node tools/music_real_playback.mjs` → **54 通过 / 0 失败 / EXIT=0**（`reports/music-real-playback-report.json`）。

| 版本 | 断言 | 解锁前 | 首次点击后 | `currentTime` 推进 | 场景切换 |
|---|---|---|---|---|---|
| 网页版 `dist/index.html` | 18/18 | 未解锁、未播放 | `playing=true, instances=1`，标题曲 | `0.83s → 2.04s` | 8/8 |
| 独立 HTML `dist/MahLeMah.html` | 18/18 | 同上 | 同上 | ✓ | 8/8 |
| ES5 legacy `dist/MahLeMah-legacy.html` | 18/18 | 同上 | 同上 | ✓ | 8/8 |
| 桌面版 Tauri exe | **未运行** | — | — | — | — |

> 验证口径是 `currentTime > 0` 且随时间前进，不是「文件存在」或「`play()` 被调用」。自动化测试（模拟 audio）按规格**不能代替**本节真机验证，两份报告分开放置。

---

## 3. 问题② 第一关布局偏上 → 已修复

根因：L1 档位 `topCy` 写死 `240`，而牌桌可视区 `BOARD_BAND.top=196 / bottom=918 / BOARD_CY=557`。

修复（`src/game/layout_profiles.js`）：

1. 档位中心改为围绕 `BOARD_CY` 展开：`topCy = BOARD_CY − 150·(N−1)/2`、`botCy = BOARD_CY + 150·(N−1)/2`。
2. 新增 `centerStackVertically(cards)`：**量本局真实 `minY/maxY` 包围盒**，按 `BOARD_BAND` 高度与包围盒高度算目标顶边，位移吸附 `LATTICE_Y` 半格晶格，再用上下安全边距 clamp。不是给全部牌加固定 Y 偏移。
3. 保留三层结构、牌型、遮挡规则与整堆单连通。

`node test-layout-position.js` → **35/0 / EXIT=0**（`reports/layout-position-report.{json,md}`）：

| 档位 | 张数 | 实测重心范围 | 包围盒高 | 最大偏差 | 不同位移种数 |
|---|---:|---|---|---|---|
| L1-0 | 24 | 550–572（中心 557） | 308–440 | 15px | 2 |
| L1-1 | 30 | 550–572 | 396–528 | 15px | 2 |
| L1-2 | 36 | 550–572 | 440–572 | 15px | 3 |
| L1-3 | 48 | 550–572 | 484–616 | 15px | 2 |

- 逐局断言「实际顶边 = 按本局包围盒动态求得的目标顶边（允许半格吸附误差）」**0 异常**，证明是动态计算而非固定偏移。
- 缩放 ×0.5 / 0.75 / 1 / 1.5 / 2 / 3 下重心比例恒为 `0.520776`。
- 第二关几何回归：最小包围盒 660×616、异常 0（确认未被连带破坏）。

---

## 4. 问题③④ 双关布局重复 → 已修复（各 100 局）

- **统一入口**：所有新开局（应用重启、返回标题重开、失败重开、主动新建、进入下一关、毕业再玩、键盘 r、`?lv=`）都走 `createNewGame()`。
- **历史**：`HISTORY_LIMIT = 3`（`recent_games.js` 唯一定义，`new_game.js` re-export，`main.rs` 同步 `usize = 3`），两关历史 `level1RecentGames` / `level2RecentGames` 完全隔离，落盘后重启有效。
- **三重判定**（修复旧实现把 `layoutDifferent` 覆盖成相似度判定的缺陷）：`tileCountDifferent` + `layoutDifferent`（真实坐标/层级/牌面位置/遮挡关系算出的 `layoutSignature`）+ `similarityDifferent` / `geometrySignatureDifferent` / `geometryDifferent`，另加 `seedFresh`、`difficultyValid`、`gameIdUnique`。
- **不靠 seed 冒充布局**：`layoutSimilarity()` = 层占位格 Jaccard 均值 ×0.5 + 整体轮廓 Jaccard ×0.5，阈值 `0.60`。
- **合法档位预筛**：`legalDifficultyIds()` 排除「牌数落在最近三局占用集合」的档位；档位不足时抛 `GenerationFailureError(reason='CONFIG_CONFLICT')`，**不增删牌伪造牌数差异**。
- **重试上限 50**（`MAX_ATTEMPTS`），超限明确报 `MAX_ATTEMPTS_EXCEEDED` 并带 `legalDifficultyIds / bannedTileCounts / failures`。

`node test-random-generation.js` → **7285 通过 / 0 失败 / EXIT=0**（`reports/TEST_RANDOM_OUTPUT_FINAL.txt`、`random-generation-report.{json,md}`）：

| 关卡 | 局数 | 牌数范围 | sim 均值 / P95 / 最大 | 最近三局牌数重复 | 签名重复 | 几何签名重复 | 重试 | 失败 | 重启历史有效 |
|---|---:|---|---|---:|---:|---:|---:|---:|---|
| L1 | 100 | 24–48 | 0.2481 / 0.4950 / **0.5830** | 0 | 0 | 0 | 9 | 0 | ✓ |
| L2 | 100 | 192–321 | 0.3864 / 0.5163 / **0.5718** | 0 | 0 | 0 | 3 | 0 | ✓ |

- 4 种 `generationReason` 各 25 局；L1 档位分布 25/25/25/25，L2 覆盖全部 10 档。
- `node test.js [19]` 独立重跑：L1 100 局最大 sim 0.5928（重试 14）、L2 100 局最大 sim 0.5775（重试 1），窗口对 295，均无 ≥0.60。
- **如实说明**：L2 在 100 局全局范围内有 9 次 `layoutSignature` 重复，但都**不在最近三局窗口内**（滚动窗口重复 = 0）。规格要求的是「与本关最近三局比较」，不是 100 局全局唯一，报告 `meta.note` 已写明这一点，没有拿 seed 不同冒充布局不同。

---

## 5. 调试信息（规格第五节）

调试面板 `src/main.js` 输出全部要求字段：`gameId / buildVersion / gitCommit / sourceHash / level / difficultyId / seed / totalTiles / tileTypeCount / layerCount / layoutSignature / geometrySignature / distributionSignature / generatedAt / generationReason / attempts / retries`，外加：

- `最近三局牌数检查 : PASS/FAIL`
- `最近三局布局检查 : PASS/FAIL`
- `几何相似度检查 : PASS/FAIL`（带最大 sim 与阈值 0.6）
- `难度档位检查` / `历史记录保存`
- `--- 背景音乐播放状态 ---`：状态 / 场景 / 曲目 / 解锁 / 音量 / 实例数 / 进度 / 错误

Edge 冒烟 `tools/browser_smoke.mjs`（`reports/browser-smoke-report.json`）：`Edg/157.0.4341.46`，两页各 4 局，`summary.allPassed=true`，`errors=[]`；每局 `tileCountCheck / layoutCheck / geometryCheck / difficultyCheck / historyCheck` 均 PASS。

---

## 6. 自动化测试（真实输出，全部在最终源码上重跑）

`node` 五项合并回归日志：`reports/FINAL_RERUN_ALL.txt`（含每条 `EXIT=0`）。

| 命令 | 结果 | 原始输出 |
|---|---|---|
| `node test.js` | **616 通过 / 0 失败 / EXIT=0** | `reports/TEST_OUTPUT_FINAL_FULL.txt` |
| `node test-random-generation.js` | **7285 通过 / 0 失败 / EXIT=0** | `reports/TEST_RANDOM_OUTPUT_FINAL.txt` |
| `node test-layout-position.js` | **35 通过 / 0 失败 / EXIT=0** | `reports/TEST_LAYOUT_POSITION.txt` |
| `node test-music-playback.js` | **69 通过 / 0 失败 / EXIT=0** | `reports/TEST_MUSIC_PLAYBACK.txt` |
| `node test-build-consistency.js` | **71 通过 / 0 失败 / EXIT=0** | `reports/build-consistency-output.txt` |
| `node tools/music_real_playback.mjs` | **54/54 通过 / EXIT=0**（网页/独立 HTML/legacy 真机播放） | `reports/music-real-playback-report.json` / `music-real-playback-output.txt` |
| `node tools/browser_smoke.mjs` | `allPassed=true`，两页各 4 局、0 异常 | `reports/browser-smoke-report.json` |

专项报告：`reports/layout-position-report.{json,md}`、`music-playback-report.{json,md}`、`random-generation-report.{json,md}`、`build-consistency-report.{json,md}`。

---

## 7. 构建产物与一致性

| 产物 | 字节 | SHA-256 | 5 首音乐 | 最新修复 |
|---|---:|---|---|---|
| `dist/MahLeMah.html` | 9,885,845 | `5ab697cd761c1580…` | ✓ 内嵌 | ✓ |
| `dist/index.html` | 9,885,845 | 同上（同内容副本） | ✓ | ✓ |
| `dist/Mah了个Mah.html` | 9,885,845 | 同上（同内容副本） | ✓ | ✓ |
| `dist/MahLeMah-legacy.html` | 9,919,967 | `6dfec65af7ee49a…` | ✓ | ✓ |
| `dist/MahLeMah-Setup-v2.0.0.exe` | 1,282,452 | 旧冻结产物 | ✗ | ✗ |
| `dist/MahLeMah-Portable-v2.0.0.zip` | 1,386,077 | 旧冻结产物 | ✗ | ✗ |

- `buildVersion=2.0.0-cb43412`、`sourceHash=7585b01a137a66…`、参与哈希源文件 33 个。**说明**：这两个元信息记录的是构建时的 HEAD，本轮新提交不会回写进产物（否则形成自指循环）；`test-build-consistency.js` 的 `live` 校验会实时重算 `src/` 哈希与产物比对，本轮 71/0 通过。
- legacy 通过 Babel + acorn 纯 ES5 语法校验；4 个 HTML 均无外链音频 `src`、无开发机路径、无旧版 JS 残留。
- `README.md` / `CHANGELOG.md` / `DELIVERY.md` 已按本轮功能更新，并明确写出桌面版未重建。

---

## 8. 最终验收逐条判定

| 规格第八节条目 | 判定 | 依据 |
|---|---|---|
| 网页版背景音乐正常播放 | ✓ | Edge 真机 `currentTime` 0.83→2.04s，18/18 |
| 独立 HTML 版背景音乐正常播放 | ✓ | 18/18（含中文名副本与 legacy 同源） |
| 桌面版背景音乐正常播放 | **✗ 未运行** | Rust build script `os error 5`，exe 未重建；仅前端静态集成 + CSP 完成 |
| 音乐按场景自动切换 | ✓ | 真机 title/level1/level2/win/lose/title/graduated 8 次切换，每次单实例；pause 沿用当前曲 |
| 第一关不再偏上 | ✓ | 4 档重心 550–572，中心 557，最大偏差 15px；动态包围盒居中 |
| 第一/第二关重开产生不同牌数与不同布局 | ✓ | 各 100 局，最近三局牌数/签名/几何重复均为 0 |
| 两关满足最近三局差异化、重启后历史有效 | ✓ | `HISTORY_LIMIT=3` + 两关隔离 + `restartVerified=true` |
| 双关各 100 局测试通过 | ✓ | 7285/0（另 `test.js [19]` 独立 100 局） |
| 所有正式发布产物包含最新修复 | **部分 / ✗** | 4 个 HTML ✓；Setup.exe / Portable.zip / SHA256SUMS ✗ 未重建 |
| 不得宣称未执行的测试已通过 | ✓ | 本报告第 0 / 9 节明确列出全部未运行项 |
| 不得用不同 seed 或不同文件版本冒充布局变化 | ✓ | 判定基于真实坐标/层级/牌面/遮挡的签名 + Jaccard 几何相似度；报告如实写出 L2 全局 9 次签名重复但窗口内 0 |

---

## 9. 未执行 / 未覆盖项（不计入通过）

| 项 | 状态 | 原因 |
|---|---|---|
| Rust `cargo check` / `cargo build` | **未运行** | `tauri-utils-*\build-script-build` 执行被系统拒绝（`os error 5`），多次尝试（MSVC / GNU / 换 `CARGO_TARGET_DIR`）均同 |
| Tauri 桌面端真机音乐播放 | **未运行** | 同上，没有用本轮源码构建出的 exe |
| Windows 安装版 / Portable 重建与安装卸载测试 | **未执行** | 依赖 Rust 构建 |
| 桌面版音乐真机听感（淡入淡出、混音隔离） | **未执行** | 需要可运行的桌面产物 |
| `graduated` 场景曲目 | 配置为空（静音） | 5 个原始文件无对应文件名，按「不自动指派」保持现状；未替换/删除任何资源 |

---

## 10. 复现命令

```bash
node tools/gen_music_manifest.mjs        # 由 src/assets/music/*.wav 重生成本清单
node test.js                             # 616/0
node test-random-generation.js           # 7285/0，双关各 100 局
node test-layout-position.js             # 35/0
node test-music-playback.js              # 69/0（模拟音频，不代替真机）
node test-build-consistency.js           # 71/0
node tools/music_real_playback.mjs       # Edge 真机 54/54，桌面版未运行
node tools/browser_smoke.mjs             # Edge 冒烟 allPassed=true
node tools/build_web.mjs && node tools/build_legacy.mjs   # 重建 4 个 HTML
```

修改文件清单见 `reports/MODIFIED_FILES.md`；本轮提交 `__COMMIT__`（`__COMMIT_FULL__`）。
