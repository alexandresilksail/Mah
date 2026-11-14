# 第二关最终验收 · 证据索引

> 基准 HEAD：`8a0c434ad1e4a4da2b906a5744105aeac883144a`
> 索引建立时间：2026-11-13（本地 GMT+8）
> 索引原则：**只登记真实存在、真实读取、真实执行过的文件**；不删除、不覆盖原始证据；不伪造或重新计算任何未实际执行的数据；`NOT RUN` 项不生成占位证据。
> 配套报告：`reports/L2_FINAL_ACCEPTANCE.md`、`reports/L2_LAYOUT_FREEZE.md`

---

## 1 · 原始报告路径（只读保留，均未改动）

| # | 路径 | 阶段 / 用途 | 本轮读取 | 大小 |
|---|---|---|---|---|
| R-01 | `reports/L2_LAYOUT_STAGE1_AUDIT.md` | 第一阶段 · 几何规格独立审计 | 全文 179 行 | 18,162 B |
| R-02 | `reports/L2_LAYOUT_STAGE2_VISUAL_AUDIT.md` | 第二阶段 · 真实渲染视觉审计（含 §5.1 的 190 组完整附录） | 全文 470 行 | 40,608 B |
| R-03 | `reports/AUDIT_REPORT.md` | 前序 42 项最终审计（P0/P1、cargo/桌面 NOT RUN 依据） | 全文 425 行 | 25,872 B |
| R-04 | `README.md` | 项目规格 / 档位表 / 验收清单 | 全文 641 行 | — |
| R-05 | `CHANGELOG.md` | 变更日志（`MAH-L2-SPEC-v2` 引入、未运行项） | 全文 319 行 | — |
| R-06 | `reports/FINAL_ACCEPTANCE.md` | 上一轮最终验收（桌面构建与音乐状态） | 关键段落 | 24,586 B |
| R-07 | `reports/MODIFIED_FILES.md` | 修改文件清单（sourceHash / 产物哈希） | `sourceHash` 段落 | 11,836 B |
| R-08 | `reports/CARGO_CHECK_OUTPUT.txt` | `cargo check` 失败取证（`os error 5`） | 全文 | 3,374 B |
| R-09 | `reports/build-consistency-report.json` | **当前 `sourceHash` 的真实构建报告**（110/0、exitCode 0） | 头部字段全文解析 | 5,452 B |
| R-10 | `reports/build-consistency-report.md` / `-output.txt` | 构建一致性人读版（sourceHash 三列一致） | 关键行 | — |
| R-11 | `reports/l2-thumbnails.json` / `.png` / `.html` | 20 套模板缩略图（第一阶段掩膜一致性证据） | 结构字段 / 图像 | 12,731 B / 261,475 B / 894,226 B |
| R-12 | `reports/L1_FROZEN_BASELINE.json` | 第一关冻结基线 | 登记（未改动） | 9,463 B |
| R-13 | `reports/l2-render-guard-output.txt` | 渲染前校验失败 → 整屏错误页取证 | 由 AUDIT_REPORT 21 引用 | 1,241 B |

> 本轮新增的 `L2_FINAL_ACCEPTANCE.md` / `L2_FINAL_EVIDENCE_INDEX.md` / `L2_LAYOUT_FREEZE.md` 为本索引的产出，不覆盖上述任何文件。

---

## 2 · 测试工具路径

### 2.1 第二阶段新增的视觉审计工具（本轮只读引用，未修改）

| 路径 | 职责 | 对应产物 |
|---|---|---|
| `tools/l2_visual_audit.mjs` | 主工具：headless Edge + CDP 驱动真实 `dist/index.html`、60 次真实生成/截图、背景差分 + 5×5 网格逐牌检测、相位晶格、遮挡/绘制顺序/命中区域、190 组比较、跨档位不变性 | `reports/l2-visual-comparison.json`、60 张游戏截图、20 张 diff、20 张 spec 图 |
| `tools/l2_visual_assets.mjs` | 由 `l2-thumbnails.json` 的 `mask` 逐套生成缩略图与规范布局数据 | `*_thumb.png` ×20、`*_spec.json` ×20、逐套 `*_metrics.json` |
| `tools/l2_visual_report.mjs` | 从 `l2-visual-comparison.json` 生成第二阶段报告（数值与实测数据逐字一致） | `reports/L2_LAYOUT_STAGE2_VISUAL_AUDIT.md` |
| `tools/l2_visual_detector_calibration.mjs` | 检测器 5×5 网格阈值负对照标定（真牌 min mean 26.6 / 空位 max 2.4） | 标定输出（阈值写入主工具注释） |

### 2.2 既有测试与工具（`AUDIT_REPORT.md` 附录所列真实执行）

| 路径 | 结果 |
|---|---|
| `test.js` | 632/0（含 20 套 × 10 档 = 200 局三段保真 + 相位篡改回归） |
| `test-l2-templates.js` | 262/0（190 对两两结构比对） |
| `test-l1-frozen.js` | 56/0（第一关冻结 + 9 条旧 L2 记录报错） |
| `test-layout-position.js` | 35/0 |
| `test-music-playback.js` | 69/0（模拟播放） |
| `test-build-consistency.js` | 110/0（4 个 HTML 逐字节 + sourceHash） |
| `test-random-generation.js` | 7788/0 |
| `tools/test_render.mjs` | 27/27（安装 + 渲染） |
| `tools/l2_100_games.mjs` | PASS（100 局去重，20/20 模板，窗口零重复） |
| `tools/music_real_playback.mjs` | 54/54（Edge 真实音频解码播放） |
| `tools/browser_smoke.mjs` | allPassed=true |
| `tools/l2_thumbnails.mjs` | 20 套缩略图生成（第一阶段掩膜一致性证据） |
| `tools/bundle_shared.mjs` | `computeBuildInfo()` 对 38 个源文件计算 `sourceHash` |
| `tools/build_web.mjs` / `tools/build_legacy.mjs` | 4 个 HTML 产物重建（第二阶段**未**调用） |

---

## 3 · 测试结果文件

| 路径 | 内容 |
|---|---|
| `reports/l2-visual-comparison.json` | **第二阶段全量实测数据**（503,488 B）：`templates[20].profiles{0,4,9}`、`pairwise.pairs[190]`、`invariance[20]`、`checks`、`summary`、`commit`、`browserVersion`、`executed`、`errors` |
| `reports/l2-visual-diff/{templateId}_metrics.json` ×20 | 逐套像素检测数据（IoU / 覆盖 / 泄漏 / 检出 / 相位 / 偏移 / 遮挡 / 命中） |
| `reports/l2-visual-diff/{templateId}_spec.json` ×20 | 逐套规范布局数据（templateId / seed / profileId / 规范签名 / 渲染签名 / 判定） |
| `reports/FINAL_*.txt`（`FINAL_test.txt`、`FINAL_test-l2-templates.txt`、`FINAL_l2-100-games.txt`、`FINAL_test-build-consistency.txt`、`FINAL_render.txt`、`FINAL_music_real.txt`、`FINAL_test-l1-frozen.txt` 等） | 前序审计的现场命令输出 |
| `reports/FINAL_RERUN_ALL.txt` | 前序复跑汇总 |
| `reports/l2-templates-report.{json,md}` / `l2-templates-output.txt` | 第一阶段重跑测试刷新（当前为 `M` 状态，未提交） |
| `reports/build-consistency-report.{json,md}` / `build-consistency-output.txt` | 构建一致性与 sourceHash |
| `reports/browser-smoke-report.json` | 浏览器冒烟（**注意：内含旧 `sourceHash=cfce4fbf…`，非当前值**） |
| `reports/random-generation-report.{json,md}` / `music-playback-report.*` / `layout-position-report.*` / `l1-frozen-report.*` | 各专项测试报告 |

---

## 4 · 60 张真实游戏截图（templateId × profileId 对应）

目录：`reports/l2-visual-screenshots/`。文件名规则 `{templateId}_p{profileId}.png`，profileId ∈ {0, 4, 9}（最易 / 主档 / 最难）。
尺寸统一 **720×1280（9:16）**，`deviceScaleFactor=1`，由 `Page.captureScreenshot` 对真实 Canvas 页面截取；括号内为文件字节数，来自本轮真实磁盘读取。

| templateId | profileId=0 | profileId=4（主档） | profileId=9 | 规范轮廓图 |
|---|---|---|---|---|
| L2-P01 | `L2-P01_p0.png` (561,515 B) | `L2-P01_p4.png` (557,695 B) | `L2-P01_p9.png` (561,716 B) | `L2-P01_spec.png` |
| L2-P02 | `L2-P02_p0.png` (564,028 B) | `L2-P02_p4.png` (581,183 B) | `L2-P02_p9.png` (560,412 B) | `L2-P02_spec.png` |
| L2-P03 | `L2-P03_p0.png` (582,407 B) | `L2-P03_p4.png` (574,039 B) | `L2-P03_p9.png` (579,831 B) | `L2-P03_spec.png` |
| L2-P04 | `L2-P04_p0.png` (550,632 B) | `L2-P04_p4.png` (559,067 B) | `L2-P04_p9.png` (570,711 B) | `L2-P04_spec.png` |
| L2-P05 | `L2-P05_p0.png` (555,661 B) | `L2-P05_p4.png` (555,261 B) | `L2-P05_p9.png` (556,432 B) | `L2-P05_spec.png` |
| L2-P06 | `L2-P06_p0.png` (560,098 B) | `L2-P06_p4.png` (561,804 B) | `L2-P06_p9.png` (553,171 B) | `L2-P06_spec.png` |
| L2-P07 | `L2-P07_p0.png` (574,715 B) | `L2-P07_p4.png` (571,790 B) | `L2-P07_p9.png` (561,996 B) | `L2-P07_spec.png` |
| L2-P08 | `L2-P08_p0.png` (559,669 B) | `L2-P08_p4.png` (566,499 B) | `L2-P08_p9.png` (567,411 B) | `L2-P08_spec.png` |
| L2-P09 | `L2-P09_p0.png` (567,162 B) | `L2-P09_p4.png` (556,188 B) | `L2-P09_p9.png` (558,750 B) | `L2-P09_spec.png` |
| L2-P10 | `L2-P10_p0.png` (555,708 B) | `L2-P10_p4.png` (561,094 B) | `L2-P10_p9.png` (567,308 B) | `L2-P10_spec.png` |
| L2-P11 | `L2-P11_p0.png` (552,747 B) | `L2-P11_p4.png` (551,912 B) | `L2-P11_p9.png` (542,341 B) | `L2-P11_spec.png` |
| L2-P12 | `L2-P12_p0.png` (577,718 B) | `L2-P12_p4.png` (570,245 B) | `L2-P12_p9.png` (552,251 B) | `L2-P12_spec.png` |
| L2-P13 | `L2-P13_p0.png` (554,825 B) | `L2-P13_p4.png` (557,131 B) | `L2-P13_p9.png` (563,227 B) | `L2-P13_spec.png` |
| L2-P14 | `L2-P14_p0.png` (565,542 B) | `L2-P14_p4.png` (567,052 B) | `L2-P14_p9.png` (556,185 B) | `L2-P14_spec.png` |
| L2-P15 | `L2-P15_p0.png` (569,470 B) | `L2-P15_p4.png` (552,839 B) | `L2-P15_p9.png` (552,383 B) | `L2-P15_spec.png` |
| L2-P16 | `L2-P16_p0.png` (567,400 B) | `L2-P16_p4.png` (564,485 B) | `L2-P16_p9.png` (564,867 B) | `L2-P16_spec.png` |
| L2-P17 | `L2-P17_p0.png` (567,379 B) | `L2-P17_p4.png` (559,701 B) | `L2-P17_p9.png` (561,102 B) | `L2-P17_spec.png` |
| L2-P18 | `L2-P18_p0.png` (560,557 B) | `L2-P18_p4.png` (562,838 B) | `L2-P18_p9.png` (575,649 B) | `L2-P18_spec.png` |
| L2-P19 | `L2-P19_p0.png` (552,121 B) | `L2-P19_p4.png` (573,105 B) | `L2-P19_p9.png` (564,558 B) | `L2-P19_spec.png` |
| L2-P20 | `L2-P20_p0.png` (563,234 B) | `L2-P20_p4.png` (559,936 B) | `L2-P20_p9.png` (560,088 B) | `L2-P20_spec.png` |

- 60 张游戏截图的 **SHA-256 全部互不相同**（结论来自第二阶段报告 §4，本轮未重算）。
- 20 张 `*_spec.png` 为规范轮廓图（360×640），**不是游戏截图**，不与上列 60 张混用。
- 每套主档（profile 4）的 seed 见 `reports/l2-visual-comparison.json → templates[].profiles[4].seed`（`7000 + (index × 131)`，P01=7000 … P20=9489），三档使用同一 seed。

---

## 5 · 差异图与逐套 JSON（templateId 对应）

目录：`reports/l2-visual-diff/`。所有 PNG 统一 **360×640**（游戏截图等比缩放 0.5，未做非等比拉伸）。

| templateId | 差异图 | 模板缩略图 | 检测数据 | 规范布局数据 |
|---|---|---|---|---|
| L2-P01 | `L2-P01_diff.png` | `L2-P01_thumb.png` | `L2-P01_metrics.json` | `L2-P01_spec.json` |
| L2-P02 | `L2-P02_diff.png` | `L2-P02_thumb.png` | `L2-P02_metrics.json` | `L2-P02_spec.json` |
| L2-P03 | `L2-P03_diff.png` | `L2-P03_thumb.png` | `L2-P03_metrics.json` | `L2-P03_spec.json` |
| L2-P04 | `L2-P04_diff.png` | `L2-P04_thumb.png` | `L2-P04_metrics.json` | `L2-P04_spec.json` |
| L2-P05 | `L2-P05_diff.png` | `L2-P05_thumb.png` | `L2-P05_metrics.json` | `L2-P05_spec.json` |
| L2-P06 | `L2-P06_diff.png` | `L2-P06_thumb.png` | `L2-P06_metrics.json` | `L2-P06_spec.json` |
| L2-P07 | `L2-P07_diff.png` | `L2-P07_thumb.png` | `L2-P07_metrics.json` | `L2-P07_spec.json` |
| L2-P08 | `L2-P08_diff.png` | `L2-P08_thumb.png` | `L2-P08_metrics.json` | `L2-P08_spec.json` |
| L2-P09 | `L2-P09_diff.png` | `L2-P09_thumb.png` | `L2-P09_metrics.json` | `L2-P09_spec.json` |
| L2-P10 | `L2-P10_diff.png` | `L2-P10_thumb.png` | `L2-P10_metrics.json` | `L2-P10_spec.json` |
| L2-P11 | `L2-P11_diff.png` | `L2-P11_thumb.png` | `L2-P11_metrics.json` | `L2-P11_spec.json` |
| L2-P12 | `L2-P12_diff.png` | `L2-P12_thumb.png` | `L2-P12_metrics.json` | `L2-P12_spec.json` |
| L2-P13 | `L2-P13_diff.png` | `L2-P13_thumb.png` | `L2-P13_metrics.json` | `L2-P13_spec.json` |
| L2-P14 | `L2-P14_diff.png` | `L2-P14_thumb.png` | `L2-P14_metrics.json` | `L2-P14_spec.json` |
| L2-P15 | `L2-P15_diff.png` | `L2-P15_thumb.png` | `L2-P15_metrics.json` | `L2-P15_spec.json` |
| L2-P16 | `L2-P16_diff.png` | `L2-P16_thumb.png` | `L2-P16_metrics.json` | `L2-P16_spec.json` |
| L2-P17 | `L2-P17_diff.png` | `L2-P17_thumb.png` | `L2-P17_metrics.json` | `L2-P17_spec.json` |
| L2-P18 | `L2-P18_diff.png` | `L2-P18_thumb.png` | `L2-P18_metrics.json` | `L2-P18_spec.json` |
| L2-P19 | `L2-P19_diff.png` | `L2-P19_thumb.png` | `L2-P19_metrics.json` | `L2-P19_spec.json` |
| L2-P20 | `L2-P20_diff.png` | `L2-P20_thumb.png` | `L2-P20_metrics.json` | `L2-P20_spec.json` |

- `*_diff.png`：真实截图等比缩放 0.5 后叠加红色规范矩形框；互相关最佳平移 (0,0)，无需配准。
- `*_thumb.png`：**由 `l2-thumbnails.json` 的 `mask` 单独绘制的模板缩略图，不是游戏截图**。
- `*_metrics.json`：逐套像素检测数据；`*_spec.json`：逐套规范布局数据（含 seed、profileId、规范/渲染签名、判定）。

---

## 6 · 主 JSON 数据结构（`reports/l2-visual-comparison.json`）

| 顶层字段 | 内容 |
|---|---|
| `commit` | `8a0c434ad1e4a4da2b906a5744105aeac883144a` |
| `generatedAt` | `2026-11-13T15:08:43.017Z` |
| `browser` / `browserVersion` | `Edg/157.0.4341.46` |
| `artifact` | 被渲染的真实构建包（`dist/index.html`） |
| `executed` / `errors` | `true` / `[]` |
| `templates[20]` | 每套含 `templateId`、`verdict`、`reasons`、`checks`（10 项阈值判定）、`profiles{0,4,9}`（seed / profileId / appliedTemplateId / specLayoutSignature / renderSignature / screenshot / iou / coverage / leakage / presentFrac / halfCellMatch / offsetDx,Dy / occlusion / layers / blocked …） |
| `pairwise` | `count=190`、`threshold=0.60`、`maxSimilarity=0.5730`（`L2-P05\|L2-P06`）、`maxPixelSilhouetteJaccard=0.8838`（`L2-P10\|L2-P18`）、`distinctCount=190`、`duplicatePairs=[]`、`allDistinct=true`、`pairs[190]` 全量逐组数值 |
| `invariance[20]` / `invarianceAllPass` | 跨 p0/p4/p9 主体轮廓 Jaccard，20/20 = 1.0000，`true` |
| `summary` | `{"total":20,"pass":20,"fail":0,"notRun":0,"pairwiseAllDistinct":true,"invarianceAllPass":true}` |

> 190 组逐组数值的完整人读版：`reports/L2_LAYOUT_STAGE2_VISUAL_AUDIT.md` §5.1（190 行表格）。本索引与最终报告均**引用**这些实测值，未重新计算。

---

## 7 · 190 组比较数据与跨档位数据的存放位置

| 数据 | 位置 |
|---|---|
| 第一阶段 190 组几何差异（统计） | `reports/L2_LAYOUT_STAGE1_AUDIT.md` §6、§8 T-3；`reports/l2-templates-report.json` |
| 第二阶段 190 组视觉差异（全量 190 行） | `reports/l2-visual-comparison.json → pairwise.pairs[]`；`reports/L2_LAYOUT_STAGE2_VISUAL_AUDIT.md` §5.1 |
| 20 套跨档位一致性 | `reports/l2-visual-comparison.json → invariance[]`；第二阶段报告 §6 |
| 20 套逐套主档明细 | `reports/L2_LAYOUT_STAGE2_VISUAL_AUDIT.md` §2；`reports/l2-visual-diff/{id}_spec.json` |

---

## 8 · 证据完整性校验（本轮真实执行）

| 校验项 | 结果 |
|---|---|
| `reports/l2-visual-screenshots/` PNG 总数 | **80**（60 × 720×1280 游戏截图 + 20 × 360×640 规范轮廓图） |
| `reports/l2-visual-diff/` 文件总数 | **80**（40 × 360×640 PNG + 40 JSON） |
| 逐套 60 张截图 + 20 张 spec 图 + 20 张 diff + 20 张 thumb + 20 份 metrics + 20 份 spec.json 缺失数 | **0** |
| 4 个 HTML 产物内嵌 `sourceHash` 与 `build-consistency-report.json` 一致 | **是（4/4）** |
| `src/` / `dist/` 相对 HEAD 改动 | **无** |

---

## 9 · 索引中不存在的证据（NOT RUN，不得补造）

| 缺失证据 | 原因 |
|---|---|
| Electron / MSI / Portable 桌面真机渲染截图 | 桌面包未用本版源码重建（`cargo` 失败），未执行 |
| DOM 降级路径（`domView`）像素截图 | 第二阶段走 Canvas 路径，未执行 |
| 真实触屏 pointer 事件派发与命中日志 | 第二阶段直接调用 `R.cardAt` API，未派发真实输入事件 |
| 牌面花色逐像素模板匹配结果 | 未做花色 OCR / 模板匹配 |
| 本版 Windows 构建产物 / `SHA256SUMS.txt` / 12000 局 Release 报告 | `dist/` 中的 `.exe` / `.zip` / `SHA256SUMS.txt` 为 2026-11-10/11 旧冻结产物；未重跑 `npm run test:release` |

> 上述项目的结论一律为 `NOT RUN`，详见 `reports/L2_FINAL_ACCEPTANCE.md` §5 与 `reports/L2_LAYOUT_FREEZE.md` 的「已知未完成事项」。
