# 修改文件清单（本轮）

**项目**：MahLeMah（`mah-le-mah/`）
**日期**：2026-11-12
**上一提交**：`f5a578e858ac1acfad42d3adc3c01d9d1eb27f3d`
**本轮口径**：① 布局重做（几何由 seed 生成、五局内布局不同）② 难度验收转绿 ③ 用户导入背景音乐 + 按文件名匹配场景

---

## 1. 新增源码（5）

| 文件 | 行数 | 职责 |
|---|---:|---|
| `src/game/music_match.js` | 178 | 纯函数 `matchScene(fileName) → {scene, matchedKeyword, confidence}`；`sceneOf(game)` 覆盖 6 种场景；`SCENES` / `SCENE_LABELS` / `isScene` |
| `src/game/music_flow.js` | 246 | 「先确认场景再匹配」五步状态机：`select → scenes → match → confirm → applied`；`addFiles / confirmScenes / beginConfirm / setTarget / ignoreFile / applyFlow / cancelFlow / summarize` |
| `src/game/music_store.js` | 332 | 音乐文件存储抽象：`tauriStore`（invoke 4 个命令）/ `webStore`（IndexedDB，无则退回内存）/ `none`；文件名净化 `sanitizeMusicName`、映射表清洗 `sanitizeMusicMap`、`filterImportable` |
| `src/game/music_player.js` | 222 | `MusicPlayer`：双 `HTMLAudioElement` 交叉淡化（`FADE_MS = 600`），与音效的 `AudioContext` 完全隔离；同场景多首随机且不连续重复；`dispose()` 释放 blob URL |
| `src/game/music_ui.js` | 428 | 「背景音乐」面板 UI：开关 / 音量 / 导入 / 管理匹配 / 每场景当前曲目 / 清除全部；中文文案；ES5 版不显示入口 |

## 2. 删除（1）

| 文件 | 原因 |
|---|---|
| `src/game/layout_templates.js`（390 行） | 第 1.1 节：静态模板路径已无人调用，几何改为 seed 程序化生成。`git status` 显示 `D` |

## 3. 重写 / 大改（7）

| 文件 | 改动要点 |
|---|---|
| `src/game/layout_profiles.js` | 几何彻底 seed 化：删除 `void rng` 与「几何由档位确定」；第二关主堆 = 每层 seed 生长的连通团块（`growBlob`）+ 中段专用 `buildBand`（整行铺满，保证 8–10 列）；盲盒队列 4 条链 44 张，每条链独立 `dy` 候选（修掉「四条链互相压死」）；第一关按 seed 生成 5–7 列紧凑堆，并新增「整堆单连通」候选筛选（修掉 L1 偶尔裂成 2 块） |
| `src/game/generator.js` | 发牌改为**整池 Fisher–Yates**，删除 order / 证书 / 波次 / 三带 / regionBias 分配；`baseCard` 增加 `seg / chain / chainIndex / chainLen`；第一关新增「几何 × 发牌」双重重采 + 32 次 greedy 探测；第二关 `requireSolution = false`、`bands = null`、`scramble = null` |
| `src/game/new_game.js` | `HISTORY_LIMIT` 改 5；新增 `layoutOfRecord()` 按 `(level, difficultyId, seed)` 重放历史牌面（缓存上限 128）算 `layoutSimilarity`；`sim ≥ 0.60` 或 `geometrySignature` 相同即判重复；后段档位确定性轮换；`MAX_ATTEMPTS = 50` 不变 |
| `test.js` | 整体重写为 19 节（约 1732 行）：常量 / 16 牌型 / L2 30×10 几何契约 / L1 几何 / `layoutSimilarity` / Fisher–Yates 静态检查 / 种子池 / 引擎 / 档位表 / 静态验收 / Rust 白名单 / 零内置音频 / 生成耗时 / 池内结构 / 机器人难度 / L1 greedy / rollProfile+存档 / 文案 / 统一入口+五局差异化 / 五局滑窗统计 / `matchScene` 表驱动 / 音乐确认流程 / `sceneOf` / 文件名净化+播放器 |
| `test-random-generation.js` | 整体重写为 200 局/关口径：五局滑窗 `sim < 0.60`（用**真实牌面**两两计算）、`geometrySignature` 不重复、档位轮换、同档位 30 seed ≥25 种几何、seed 可精确重放、失败重试统计；输出 JSON/MD/原始输出 |
| `tools/tune_pool.mjs` | 入池门槛改为「该 seed 上 5 种机器人（greedy/noisy/lookahead/montecarlo/search）合计通关 = 0」；几何门槛改为主堆单连通（队列是独立区域） |
| `tools/browser_smoke.mjs` | 差异化判定更新为第 2.3 节口径：`similarityMax < 0.60` + `geometrySignature` 不重复 + 档位轮换（删掉已作废的「牌数必须不同」） |

## 4. 小改（8）

| 文件 | 改动要点 |
|---|---|
| `src/game/layout.js` | 裁剪为纯几何原语，删除 `generateLayout / generateEasyLayout / planForSeed / layoutReport / templateFor` |
| `src/game/layout_signature.js` | 新增 `layoutShape / cellKey / jaccard / layoutSimilarity`、`SIMILARITY_THRESHOLD = 0.6` |
| `src/game/recent_games.js` | `HISTORY_LIMIT: 3 → 5`，注释与 `sanitizeHistory / appendHistory / checkAgainstRecent` 同步 |
| `src/game/robots.js` | `simulateRobot` 新增 `opt.path`，通关时返回真实点击顺序（第一关当证书用） |
| `src/game/save_data.js` | `SAVE_VERSION: 3 → 4`；新增 `music / musicVol / musicMap`；旧档缺字段可读入 |
| `src/game/engine.js` | 恢复 `musicOn / musicVol` 运行时字段 |
| `src/game/render.js` | 盲盒牌背：`back: c.seg === 'queue' && c.blocked`；设置面板加音乐开关 / 音量 / 「导入 / 管理背景音乐…」；ES5 兼容模式隐藏并用中文说明 |
| `src/game/tiles.js` | 新增 `paintBack()`（青灰底 + 双回纹边框 + 中心四瓣花），压深着色与牌面同规则 |
| `src/game/seed_pool.js` | 全面重生成：10 档 × 40 seed，`POOL_META` 记录机器人闸门统计 |
| `src/main.js` | 接入 `MusicPlayer / sceneOf / detectMusicStore / openMusicPanel`；`applyAudioSettings` 同步 `setEnabled/setVolume/setMap`；`syncMusic()` 按场景切歌 |
| `src-tauri/src/main.rs` | `SAVE_FIELDS: [&str; 12]`（新增 `musicMap`）；`HISTORY_LIMIT: usize = 5`；新增 `list_music / import_music / read_music / delete_music`；文件名净化 / 映射表校验 / 扩展名白名单 / ≤20MB / ≤24 首 / 临时文件 + 原子重命名；存档版本放宽到 v∈{1,2,3,4} |
| `dist/*.html` | 由当前 `src/` 重建（见下） |

## 5. 构建产物

| 文件 | 字节 | SHA-256 |
|---|---:|---|
| `dist/MahLeMah.html` | 134,302 | `5b683891a56e79e27dc0f383f7d8559ecdf58e1d2461f8b73ed4ac4c018967c1` |
| `dist/Mah了个Mah.html` | 134,302 | 同上（同内容副本） |
| `dist/index.html` | 134,302 | 同上（同内容副本） |
| `dist/MahLeMah-legacy.html` | 168,373 | `cca372e4d99ea3791dfa6b716e115f5f18c5c56601763f1efe6fd40653a6cd3b` |

`buildVersion=2.0.0-f5a578e` · `sourceHash=578f26e42009e56bbe186e13597799ed30811719e6a3d1922afd19fe35647aef` · 参与哈希源文件 32 个。

## 6. 报告

| 文件 | 说明 |
|---|---|
| `reports/CODE_AUDIT.md` | 本轮审计：改前的 7 个不符合项与处理结果 |
| `reports/FINAL_ACCEPTANCE.md` | 最终验收：逐条对规格 1–6 节给证据 |
| `reports/MODIFIED_FILES.md` | 本文件 |
| `reports/TEST_OUTPUT_FINAL_FULL.txt` | `node test.js` 完整原始输出（585 通过 / 0 失败 / EXIT=0） |
| `reports/TEST_RANDOM_OUTPUT_FINAL.txt` | `node test-random-generation.js` 完整原始输出（12881 通过 / 0 失败 / EXIT=0） |
| `reports/random-generation-report.{json,md}` | 400 局逐局数据 + 滑窗相似度 + 几何多样性 |
| `reports/random-generation-output.txt` | 同上脚本的控制台输出 |
| `reports/build-consistency-report.{json,md}` / `build-consistency-output.txt` | 两个 HTML ↔ `src/` 逐字节一致性（48 项通过） |
| `reports/browser-smoke-report.json` | Edge 157 真实浏览器实测（两页各 4 局、0 异常、allPassed=true） |
| `reports/CARGO_CHECK_OUTPUT.txt` | Rust `cargo check` 尝试的真实输出（见验收报告「未执行项」） |

## 7. 刻意未改动

| 文件 | 原因 |
|---|---|
| `src/game/config.js` | 档位表 / `layerPlanFor` 基准曲线本轮未变（规格只要求几何由 seed 决定，档位仍决定层数/牌数/牌种数）。其中 `LEVEL_SPEC / LEVEL_MIX / BAND_RATIOS / FUNNEL` 已是历史兼容常量，仍被 `tools/tune.mjs`、`tools/stress_release.mjs` 引用，未删除 |
| `tools/tune.mjs` / `tools/stress_release.mjs` | 旧调参/发布脚本，不在本轮测试链路内；`stress_release.mjs` 仍假设第二关有证书，属于**已知过时脚本**，本轮未修（如实记录） |
| `dist/*.exe` / `*.zip` / `SHA256SUMS.txt` | 桌面安装包本轮未重建（本机无 MSVC / NSIS 环境），保持原冻结产物 |
