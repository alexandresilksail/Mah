# 修改文件清单（背景音乐集成 + 双关卡布局修复）

**项目**：MahLeMah（`mah-le-mah/`）
**日期**：2026-11-12
**本轮提交**：`dcf9f6e`（完整哈希 `dcf9f6e9d8715e4faef921714b24669d01e2a9ed`），已推送 `origin/main`
**口径**：仅修改与四项问题直接相关的代码；不做全项目审计，不重构无关模块，不改变核心玩法。
**上一轮基线**：`cb43412`（随机生成重构收尾）

---

## 1. 新增文件（20）

### 1.1 音乐资源（5，二进制，未替换 / 未转码 / 未删除）

| 文件 | 字节 | 场景 |
|---|---:|---|
| `src/assets/music/标题场景音乐.wav` | 2,168,492 | title |
| `src/assets/music/第一关场景音乐.wav` | 1,675,628 | level1 |
| `src/assets/music/第二关场景音乐.wav` | 1,440,044 | level2 |
| `src/assets/music/过关场景音乐.wav` | 708,908 | win |
| `src/assets/music/失败场景音乐.wav` | 1,316,588 | lose |

合计 **7,309,660 B**，sha256 `b0a6b8026d1aadf06302d61995aeda9ede21977c8970d66c3da84c62e8e17d10`。5 个文件此前只在开发机桌面，本轮首次纳入仓库与产物。

### 1.2 源码 / 构建脚本（3）

| 文件 | 大小 | 职责 |
|---|---:|---|
| `src/game/music_manifest.js` | 9,748,754 B | 5 首 wav 的 `data:audio/wav;base64,` 清单 + `BUILTIN_MUSIC_MAP`（6 场景）+ `BUILTIN_MUSIC_SRC` + `mergeMusicMap()` + 资源指纹。所有运行版本共用同一份 |
| `tools/gen_music_manifest.mjs` | — | 读 `src/assets/music/*.wav`，复用现有 `matchScene()`，只接受 `confidence==='exact'`，`ambiguous`/`none` 直接抛错不自动指派 |
| `tools/music_real_playback.mjs` | — | Edge headless + CDP + 真实鼠标事件，读 `__MAH_MUSIC_STATUS__()` 验证 `currentTime>0` 且随时间前进；幂等追加报告章节 |

### 1.3 新测试（2）

| 文件 | 结果 |
|---|---|
| `test-layout-position.js` | 35/0；L1 4 档 × 40 seed 的动态包围盒居中、缩放不变性、L2 几何回归 |
| `test-music-playback.js` | 69/0；播放链路单测 + 4 版本集成 + 5 首载荷与 manifest 逐字节一致 |

### 1.4 新报告（10）

`reports/FINAL_RERUN_ALL.txt`、`TEST_LAYOUT_POSITION.txt`、`TEST_MUSIC_PLAYBACK.txt`、`layout-position-report.{json,md}`、`music-playback-report.{json,md}`、`music-real-playback-report.json`、`music-real-playback-output.txt`。

---

## 2. 修改的源码（10）

| 文件 | 改动要点 |
|---|---|
| `src/game/music_player.js` | 整体重写：导出 `MusicPlayer` 与 `MusicManager` 别名；内置 data URI 优先、用户 store 仅回落；首次手势前不建/播 audio，`unlock()` 后按 `pendingScene` 自动播放；删掉双槽交叉淡化改为严格单实例；`setEnabled/setMuted/setVolume` 独立于音效；`onerror` / `play().catch` / `NO_SOURCE` 全捕获；`status()` 暴露真实播放状态 |
| `src/main.js` | 引入 `BUILTIN_MUSIC_MAP / BUILTIN_MUSIC_SRC / mergeMusicMap` 初始化播放器；`game.musicBuiltin = true`；暴露 `__MAH_MUSIC_STATUS__` / `__MAH_MUSIC_PLAYER__`；`applyAudioSettings()` 合并映射；`syncMusic()` 不再因 store 不可用早退、暂停沿用当前曲；`onceUnlock()` 增加 `musicPlayer.unlock()`；调试面板补三项 PASS/FAIL 与音乐状态 |
| `src/game/render.js` | 音乐开关/音量显示条件改为 `musicBuiltin || musicAvailable`；导入按钮仍只在 store 可用时出现；标题页与设置面板文案改为「内置曲目按场景自动切换」 |
| `src/game/layout_profiles.js` | L1 `topCy/botCy` 围绕 `BOARD_CY` 展开；新增 `centerStackVertically()` 按本局真实包围盒动态居中、吸附半格晶格、受 `BOARD_BAND` 安全边距 clamp；保留三层结构、牌型、遮挡与单连通 |
| `src/game/recent_games.js` | `HISTORY_LIMIT: 5 → 3`，注释与 `sanitizeHistory/appendHistory/checkAgainstRecent` 同步 |
| `src/game/new_game.js` | 三重差异化判定（牌数 / 布局签名 / 几何相似度）真正生效，修复旧实现把 `layoutDifferent` 覆盖成相似度判定的缺陷；`legalDifficultyIds()` 合法档位预筛；`CONFIG_CONFLICT` 明确失败；`MAX_ATTEMPTS=50`；`meta.checks` 新增 `tileCountCheck / layoutCheck / geometryCheck`；不增删牌 |
| `src-tauri/src/main.rs` | 仅 `HISTORY_LIMIT: usize = 5 → 3` 与注释同步；上一轮 `SAVE_FIELDS` 12 字段 / v4 / 4 个音乐命令保持不变（本轮无新增存档字段） |
| `src-tauri/tauri.conf.json` | CSP `media-src 'none'` → `media-src 'self' data: blob:`（旧配置会拦住所有音频） |
| `tools/build_web.mjs` | 构建说明改为「内联 5 首内置音乐，离线可播」 |
| `tools/browser_smoke.mjs` | 差异化判定改为最近三局窗口：牌数 / 布局签名 / 几何签名均不重复、档位 ≠ 上一局、`tileCountCheck === 'PASS'` |

---

## 3. 修改的既有测试（4）

| 文件 | 改动要点 |
|---|---|
| `test.js` | `[8c]` 改为「内置音乐进入全部产物」：5 首与 wav 原文件逐字节比对、4 个 HTML 各 5 段载荷、无外链/无开发机路径；`[18]` 重写播放器行为（解锁 / 单实例 / 音量 / 失败处理）；`[19]` 改为每关 100 局最近三局差异化；`[14]` 比较窗口改为最近 `HISTORY_LIMIT` 局；Rust 静态断言改为 `HISTORY_LIMIT: usize = 3`。最终 **616/0** |
| `test-random-generation.js` | `PER_LEVEL=100`、`HISTORY_LIMIT===3`；逐局校验牌数 / 签名 / 几何与最近三局均不同、`meta.checks` 三项 PASS、seed 合法且不重复；重启模拟后仍不同；报告标题改「双关卡各 100 局」。最终 **7285/0** |
| `test-build-consistency.js` | 新增 `[6] 内置背景音乐在所有正式产物中一致`：4 个 HTML 的 5 段载荷 / 文件名 / `__MAH_MUSIC_STATUS__` / `graduated` / 无外链，加 manifest 与 CSP 检查。最终 **71/0** |
| `test-music-playback.js` | 新建（见 §1.3）；版本集成表用真实字节数，并把未断言的诊断字段改成「5 首载荷与 manifest 逐字节一致」硬断言 |

---

## 4. 构建产物（4，全部重建并内嵌音乐）

| 文件 | 字节 | SHA-256 |
|---|---:|---|
| `dist/MahLeMah.html` | 9,885,845 | `5ab697cd761c15808f212051ad587fe6fe8bb3d1f4f5e8b9b113eb02b0d2797f` |
| `dist/index.html` | 9,885,845 | 同上（同内容副本） |
| `dist/Mah了个Mah.html` | 9,885,845 | 同上（同内容副本） |
| `dist/MahLeMah-legacy.html` | 9,919,967 | `6dfec65af7ee49acdf7c0f8c0697c9bca2c3fd10e64987110ac877a36a10dc5c` |

`buildVersion=2.0.0-cb43412` · `sourceHash=7585b01a137a66b1adac54b7d5b3c2dde2ef57e3db4b2f7ff314dd5fcb255576` · 参与哈希源文件 33 个。构建元信息记录构建时 HEAD，本轮新提交不回写（自指循环）；`test-build-consistency.js` 实时重算 `src/` 哈希比对，71/0 通过。

---

## 5. 更新的文档 / 报告（3 + 10）

| 文件 | 说明 |
|---|---|
| `README.md` | 顶部标注「2026-11-12 起内置 5 首用户背景音乐」；第 5 章改为「音效与内置背景音乐」；文件树加入 `music_manifest.js`；新增本轮测试命令与桌面版未重建说明 |
| `CHANGELOG.md` | 新增「2026-11-12 · 内置背景音乐集成 / 第一关布局居中 / 双关卡最近三局差异化」，记录真实测试数与未运行项 |
| `DELIVERY.md` | 新增 `## 0. 2026-11-12 本轮增量`，旧随机生成章节改名 `0.1`；明确安装产物未重建 |
| `reports/FINAL_ACCEPTANCE.md` | 本轮最终验收，逐条对应规格第八节，含完整未运行项 |
| `reports/TEST_OUTPUT_FINAL_FULL.txt` 等 9 份 | 由最终一次合并回归 `reports/FINAL_RERUN_ALL.txt` 拆分，与各 JSON/MD 报告一一对应 |

---

## 6. 刻意未改动 / 未重建

| 文件 | 原因 |
|---|---|
| `dist/MahLeMah-Setup-v2.0.0.exe`、`MahLeMah-Portable-v2.0.0.zip`、`SHA256SUMS.txt` | 本机 Rust build script 执行被系统拒绝（`os error 5`），桌面产物**未重建**，仍是旧冻结版本，不含本轮音乐与布局修复 |
| `src/game/generator.js`、`layout.js`、`engine.js`、`config.js`、`tiles.js`、`seed_pool.js` | 核心玩法 / 发牌 / 难度池与本轮四项问题无关，未改动 |
| `src/game/music_flow.js`、`music_store.js`、`music_ui.js`、`music_match.js`、`save_data.js` | 上传与场景分配功能按要求**不重新开发**，本轮只调用现有 `matchScene()`；无新增存档字段 |
| `.probe/` | 本轮临时脚本目录，交付前已清理 |
| `tools/tune.mjs`、`tools/stress_release.mjs` | 旧调参/发布脚本，不在本轮测试链路内（已知过时，如实记录） |

---

## 7. 真实运行汇总

| 命令 | 结果 |
|---|---|
| `node test.js` | 616 / 0 / EXIT=0 |
| `node test-random-generation.js` | 7285 / 0 / EXIT=0（双关各 100 局） |
| `node test-layout-position.js` | 35 / 0 / EXIT=0 |
| `node test-music-playback.js` | 69 / 0 / EXIT=0 |
| `node test-build-consistency.js` | 71 / 0 / EXIT=0 |
| `node tools/music_real_playback.mjs` | 54 / 54 / EXIT=0（网页版、独立 HTML 版、legacy 版真机播放） |
| `node tools/browser_smoke.mjs` | `allPassed=true`，Edg/157.0.4341.46 |
| Rust `cargo check` / `cargo build` | **未运行** |
| 桌面版 / Windows 安装版真机音乐播放 | **未运行** |

本轮提交：`dcf9f6e`（`dcf9f6e9d8715e4faef921714b24669d01e2a9ed`）。
