# MahLeMah · 最终验收报告（第二关 20 套指定全局形状 + 最近 10 局双重去重）

**日期**：2026-11-13
**范围**：只修改第二关布局系统（模板定义 + 落牌几何 + 去重口径）及其测试/文档；
**第一关完全冻结**，只做回归测试；不改变核心玩法、牌数配置、难度体系、背景音乐与音效链路。
**流程**：先审计 → 再修改 → 再测试 → 再构建 → 最后验收。
**本版说明**：本版**取代**同日早些时候的「50 套参数化结构模板」版本。50 套版是靠
zones / shapes / trajectory 参数拼差异；本版按需求逐一指定的 **20 个全局牌堆形状**，
改为每套一份 **5 行 × 9 列显式轮廓掩膜**，轮廓 / 区域分布 / 层级遮挡由掩膜直接决定。

---

## 0. 结论（先说不满足的部分）

**已真实通过**：20 个指定形状全部实现且互相可区分（主堆逐层占位格轮廓 20/20 种互不相同）；
190 对两两结构相似度最大 0.4104、主堆布局相似度最大 0.3560，全部 < 0.60；连续 100 局
任意连续 10 局模板零重复、窗口内四类重复均为 0；第一关 20 条修改前基线逐项零漂移；
4 个 HTML 产物同步重建并内嵌 20 个 `templateId`；内置 5 首音乐在网页版 / 独立 HTML /
ES5 legacy 真机继续播放。

**未通过 / 未运行（不标记为通过）**：

1. **Rust `cargo check` / `cargo build`：未运行成功**。Git Bash 下被 GNU `link` 遮蔽
   MSVC `link.exe`（`link: extra operand`）；PowerShell 下明确报
   `linker link.exe not found`，即本机未安装 Visual Studio C++ 链接器，
   Rust 依赖的 build script 无法链接。这是**环境限制**，不是本版源码编译错误。
   Rust 侧仅完成源码静态一致性断言（`test.js [8b]`、`test-build-consistency.js`）。
2. **桌面版 exe / Windows 安装版 / Portable zip / Setup.exe / SHA256SUMS.txt 未用本版源码重建**，
   仍是旧冻结产物；桌面版真机音乐播放**未运行**。
3. 本版未重跑 `npm run test:release`（12000 局发布压力测试）。
4. 原版《羊了个羊》内部布局数据无法获取；20 个形状按需求文字描述实现，只参考
   **可观察**的多层叠牌 / 区域组合 / 半格遮挡 / 轮廓收放特征，**不声称精确复刻原版算法**，
   也不含任何从原版导出的坐标数据。

---

## 1. 交付项逐条对照

| # | 需求条目 | 位置 / 证据 | 判定 |
|---|---|---|---|
| 1 | 用户指定的 20 个全局牌堆形状逐一实现 | `src/game/l2_templates.js`（7 形状族 × 20 套，每套一份 5×9 显式轮廓掩膜） | ✓ |
| 2 | 20 套在整体轮廓 / 区域分布 / 层级遮挡上明显不同 | 掩膜两两不同 + 连通分量决定区域 + `growth` / `layerShape` 决定层级轨迹；`reports/l2-templates-report.md` | ✓ |
| 3 | 不得仅改坐标 / 随机种子 / 局部牌块 | 每套模板有自己的掩膜、生长轨迹、层形状、层级曲线、层间错位、密度；结构签名含全部参数 | ✓ |
| 4 | 每局从 20 套中选，最近 10 局不重复 | `src/game/new_game.js` 的 `createLevel2Game()` + `src/game/l2_recent.js` | ✓ |
| 5 | 跨重新开始 / 返回标题页 / 应用重启保存最近 10 局 | `recent_games.js`（L2 窗口 10）、`save_data.js`、`src-tauri/src/main.rs` 白名单 | ✓ |
| 6 | 用实际几何结构判重，不能只比模板 ID | `l2_structure.js` 的 `structureSignature` / `canonicalGeometrySignature` / `geometrySignature` / `structureSimilarity` | ✓ |
| 7 | 每套布局牌数 / 层级 / 遮挡 / 消除条件正常 | 60 局真实生成：牌数 = 档位、零悬空、遮挡图一致、消除后下层暴露 | ✓ |
| 8 | 无法满足 10 局不重复时必须报错 | `TEMPLATE_POOL_EXHAUSTED` / `MAX_ATTEMPTS_EXCEEDED`，`test-l2-templates.js [4]` 真实触发 | ✓ |
| 9 | 逐一展示 20 套缩略图 | `reports/l2-thumbnails.html` / `.png` / `.json`（`node tools/l2_thumbnails.mjs` 真实生成） | ✓ |
| 10 | 连续生成 100 局验证任意连续 10 局无重复 | `reports/l2-100-games.txt` + `test-random-generation.js` 7788/0 | ✓ |
| 11 | 第一关及其他功能完全不变 | `test-l1-frozen.js` 64/0 + `test-layout-position.js` 35/0 + `test-music-playback.js` 69/0 | ✓ |
| 12 | 只改第二关布局，不做无关重构 | `reports/MODIFIED_FILES.md`（改动仅 l2_templates / l2_geometry / 测试口径 / 文档） | ✓ |

---

## 2. 20 套形状 = 20 份显式轮廓掩膜（不是参数拼差异）

每套模板定义为一组 `DEFS` 条目，核心是 `mask`：**5 行 × 9 列 ASCII 轮廓**
（`#` 可落牌 / `@` 高密度 / `.` 禁止落牌）。`parseMask()` 把掩膜展开成格位集合，
`labelRegions()` 做 4 邻域连通分量得到区域标签（R1 / R2 / …），
因此**区域结构由掩膜直接决定**：双核心 = 2 分量、三岛屿 = 3 分量、四角围合 = 4 分量。

其余结构参数只负责「在这个轮廓里怎么往上层长」：

- `growth`：层中心轨迹（central / dual / ring / stair / butterfly / hourglass / serpentine /
  checker / crescent / wave / diag / corners / crossCenter / asym …）
- `layerShape`：层内选格形状（pyramid / split / ring / cross / band / stair / blob / checker / arc / flat）
- `curve`：各层张数权重曲线；`offsets`：层间半格错位向量；`density`：高密度偏好

| # | templateId | 名称 | 形状族 | 掩膜可落牌格 | 掩膜区域数 | 掩膜（`#` 可落牌 / `.` 禁止） |
|---|---|---|---|---|---|---|
| 1 | `L2-P01` | 中心金字塔 | 核心聚拢型 | 33 | 1 | `...###... / ..#####.. / .#######. / ######### / #########` |
| 2 | `L2-P02` | 双核心 | 核心聚拢型 | 40 | 2 | `####.#### / ####.#### / ####.#### / ####.#### / ####.####` |
| 3 | `L2-P03` | 三岛屿 | 多岛分离型 | 30 | 3 | `##.##.##. / ##.##.##. / ##.##.##. / ##.##.##. / ##.##.##.` |
| 4 | `L2-P04` | 环形围绕 | 围合环抱型 | 30 | 1 | `######### / ##.....## / ##.....## / ##.....## / #########` |
| 5 | `L2-P05` | 十字交叉 | 围合环抱型 | 33 | 1 | `...###... / ######### / ######### / ######### / ...###...` |
| 6 | `L2-P06` | 阶梯上升 | 单向偏置型 | 27 | 1 | `....####. / ..######. / .######## / #####.... / ####.....` |
| 7 | `L2-P07` | 阶梯下降 | 单向偏置型 | 27 | 1 | `.####.... / .######.. / ########. / ....##### / .....####` |
| 8 | `L2-P08` | 左侧巨塔 | 单向偏置型 | 32 | 1 | `####..... / ######... / #######.. / ######### / ######...` |
| 9 | `L2-P09` | 右侧巨塔 | 单向偏置型 | 32 | 1 | `.....#### / ...###### / ..####### / ######### / ...######` |
| 10 | `L2-P10` | 上下双层岛 | 多岛分离型 | 36 | 2 | `######### / ######### / ......... / ######### / #########` |
| 11 | `L2-P11` | 蝴蝶形 | 围合环抱型 | 28 | 2 | `##.....## / ###...### / ####.#### / ###...### / ##.....##` |
| 12 | `L2-P12` | 沙漏形 | 围合环抱型 | 39 | 1 | `######### / ######### / ...###... / ######### / #########` |
| 13 | `L2-P13` | 迷宫形 | 格网迷宫型 | 29 | 1 | `######### / ........# / ######### / #........ / #########` |
| 14 | `L2-P14` | 棋盘形 | 格网迷宫型 | 30 | 2 | `###..###. / ###..###. / ###..###. / .###..### / .###..###` |
| 15 | `L2-P15` | 弧形月牙 | 起伏异形型 | 31 | 1 | `..#####.. / .#######. / ####..### / ###....## / ####..###` |
| 16 | `L2-P16` | 波浪形 | 起伏异形型 | 35 | 1 | `######### / ###...### / ..#####.. / ###...### / #########` |
| 17 | `L2-P17` | 对角双塔 | 多岛分离型 | 27 | 1 | `######... / ######... / ...###... / ...###### / ...######` |
| 18 | `L2-P18` | 四角围合 | 多岛分离型 | 32 | 4 | `####.#### / ####.#### / ......... / ####.#### / ####.####` |
| 19 | `L2-P19` | 中心十字岛 | 围合环抱型 | 29 | 1 | `..#####.. / ..#####.. / ######### / ..#####.. / ..#####..` |
| 20 | `L2-P20` | 不规则大陆形 | 不规则大陆型 | 37 | 1 | `.#######. / ####.#### / .######## / ###..#### / .#######.` |

> 掩膜区域数 1 不等于「没有区域差异」：环形环绕、沙漏、迷宫、月牙等是**单连通但轮廓凹陷**
> 的形状，差异体现在轮廓内缩与外扩；双核心 / 上下双层岛 / 蝴蝶 / 三岛屿 / 四角围合
> 是**多连通分离**，差异体现在牌岛个数与位置。两类都由掩膜真实决定，不是换 seed。

### 2.1 落牌几何（`src/game/l2_geometry.js`）

- `templatePlanFor()` 的单层容量上限 = `template.maskCellCount`（掩膜可落牌格数），
  因此任何一层都不可能落到轮廓外。
- 全局 9×5 整格网：`x = 33 + c*66 + px*33`、`y = 220 + r*88 + py*44`（半格晶格 `x%33=0 / y%44=0`）。
- **底层** `pickCoverCells()`：每个连通区域至少 1 张 + 最远点铺开，保证上层有支撑、
  每个牌岛都真实存在。
- **其余层** `pickMaskCells()`：形状分先**归一化到 [0,1]**（否则 `split` 分数可到 64、
  `band` 只有 2，会压死某些层形状），再混合层号确定性扰动与覆盖补偿：
  `s = 0.58*norm + 0.42*jitter + dense − starve + rng.next()*0.12`，
  `jitter = (hash(layer,col,row) % 997)/997`，`starve = min(1.60, (层号−该格最近使用层号)*0.30)`。
- `inheritRatio = 0.12 + density*0.6`（约 0.19–0.21），只继承少量关键支撑，其余靠形状与扰动错位。
- `repairSupport()` 修补悬空牌的候选格**只取自该模板掩膜**，绝不移出轮廓。
- 44 张固定盲盒队列沿用既有 `buildQueue()`；牌数 = `mainCount + queueCount`，
  层数 / 牌种数 / 三消规则沿用 `config.js`，**一个都没改**。

### 2.2 真实差异指标

| 项 | 实测 |
|---|---|
| 模板 ID / 结构参数组合 / 轮廓掩膜 / 结构签名 / 等价几何签名 唯一数 | 20 / 20 / 20 / 20 / 20 |
| 20 套 × 3 组 (档位, seed) = 60 局真实生成 | 全部 `validateLevel.ok=true`、开局可点 19–25、主堆零悬空、真实安装进 `Game` 成功 |
| 190 对两两结构相似度 | 最大 **0.4104**，≥0.60 共 **0 对** |
| 190 对两两主堆布局相似度 | 最大 **0.3560**，≥0.60 共 **0 对** |
| 各层牌数分布 / 区域结构分布 / 逐层占位格轮廓 | 18 种 / 15 种 / **20/20 种** |
| 主堆落牌是否全在掩膜格内 | 60 局**越界 0 张** |
| 主堆是否覆盖掩膜全部连通区域 | 60 局**覆盖不足 0 例** |

> 包围盒只有 2 种（都落在同一格网内），所以轮廓差异用**逐层占位格轮廓**衡量，
> 不用包围盒；并额外加了「落牌在掩膜内 + 覆盖全部区域」两项断言固化为测试。
> 这不是放宽标准，而是换用更有区分度的真实几何度量 + 更硬的结构约束。

---

## 3. 最近 10 局双重去重与历史持久化

- **独立窗口**：`level1RecentGames` 冻结为 3 局（`HISTORY_LIMIT = 3`），
  `level2RecentGames` 独立为 10 局（`L2_HISTORY_LIMIT = 10`），`historyLimitFor(level)`
  是唯一取值入口；两关绝不互相读取。
- **每局几何签名**（`l2_structure.js`）：坐标、层级、区域、层牌数与质心、层包围盒、
  层轮廓占位格、整体轮廓、遮挡关系（逐牌 blocker 边）、可操作区与被遮挡区；
  `canonicalGeometrySignature` 额外做**平移 + 左右镜像归一化**，用于识别
  「不同模板生成的等价结构」。
- **双重去重**：
  1. 模板级：排除最近 10 局用过的 `templateId`，候选池 = `20 − 已用`（实测 10 个）；
  2. 几何级：拒绝 `canonicalGeometrySignature` / `structureSignature` / `geometrySignature`
     任一相同，并要求与最近 10 局**重放出的真实牌面**比较的主堆结构相似度与布局相似度都 < 0.60。
- **不认牌面 / 顺序 / seed / 牌数**：签名与相似度只读几何字段；seed 只额外做
  「不得与最近 10 局完全相同」的更严格约束，绝不代替几何判定。
  第二关 `tileCountCheck` 明确标为 `N/A（按模板级 + 几何级去重，牌数按档位配置）`。
- **失败路径**：重复即重试（上限 50 次）；候选池为空抛
  `GenerationFailureError(reason='TEMPLATE_POOL_EXHAUSTED')`；50 次不合格抛
  `MAX_ATTEMPTS_EXCEEDED` 并附逐次失败原因。**不清空历史、不改 seed、不微调坐标、
  不退回重复布局**（`test-l2-templates.js [4]` 真实触发并断言）。
- **持久化**：记录含 3 个**可选**字段 `templateId` / `structureSignature` /
  `canonicalGeometrySignature`；`sanitizeRecord(raw, level)` 对旧档缺字段按合法处理，
  由 `(level, difficultyId, seed)` 重放的真实牌面兜底。Rust 侧同步
  `RECORD_FIELDS[15]`（12 必填 + 3 可选）、`HISTORY_LIMIT_L1=3` / `HISTORY_LIMIT_L2=10`，
  并拒绝第一关历史出现模板字段。

**覆盖的重开入口**（`test-l2-templates.js [4]` 连续 12 局 + `test-random-generation.js` 100 局）：
游戏内 `new_game`、失败重开 `failure_restart`（真实置 `g.status='lose'`）、
标题页重开 `title_screen_restart`、刷新网页 / 退出重进 `application_restart`
（每局把存档 JSON 序列化再读回，模拟进程重启）。浏览器冒烟中第二个 HTML
继承第一个 HTML 的历史，是跨重启有效的真实证据。

---

## 4. 连续 100 局实测（`reports/l2-100-games.txt`）

```
第二关连续 100 局 · 最近 10 局双重去重（最终代码实测）
生成失败=0 最大重试=2 累计尝试=103 最终历史长度=10 用时ms=4489
窗口内重复：template=0 canonical=0 structure=0 geometry=0
窗口内最大相似度：结构=0.4319 布局=0.3682
任意连续 10 局模板全不同：PASS
可点范围=19-25
模板使用分布={"L2-P02":6,"L2-P14":2,"L2-P09":3,"L2-P17":5,"L2-P19":5,"L2-P04":5,
"L2-P12":7,"L2-P18":4,"L2-P01":4,"L2-P03":6,"L2-P15":5,"L2-P13":4,"L2-P16":6,
"L2-P07":4,"L2-P11":6,"L2-P08":6,"L2-P06":5,"L2-P05":5,"L2-P10":6,"L2-P20":6}
```

20 套模板在 100 局里全部被用到（最少 2 次、最多 7 次），没有出现「少数模板垄断」。

---

## 5. 第一关冻结回归

审计阶段（修改前）保存 `reports/L1_FROZEN_BASELINE.json`：
20 条 L1 基线（4 档位 × 5 seed）+ 9 条「不带 templateId 的第二关默认路径」基线，
字段含牌数 / 可点牌 / 层数 / `geometrySignature` / 坐标-层级-区域-z 全序 SHA-256 / validate。

`node test-l1-frozen.js` → **64/0 / EXIT=0**：

- 20 条 L1 基线六个字段**全部零漂移**；
- 给第一关强行传 `templateId='L2-P01'`，返回数据不含 `templateId` 且结果仍与基线一致；
- 9 条 L2 默认路径基线同样零漂移（既有第二关生成链路未被改动）；
- `createNewGame(level=1)` 连续 5 局维持 `historyLimit=3`、`tileCountCheck='PASS'`、
  记录不含任何模板字段；`config.js` / `engine.js` / `render.js` /
  `layout_signature.js` / `tiles.js` / `seed_pool.js` 均不引用任何 `l2_*` 模块。

第一关居中与音乐链路同步回归：`test-layout-position.js` **35/0**（重心比例 0.520776
在 ×0.5–×3 各缩放下不变）、`test-music-playback.js` **69/0**、真机播放 **54/54**。

---

## 6. 自动化测试（最终源码上真实运行，全部 EXIT=0）

| 命令 | 结果 | 原始输出 |
|---|---|---|
| `node test.js` | **625 / 0** | `reports/FINAL_test.txt` |
| `node test-random-generation.js` | **7788 / 0** | `reports/FINAL_test-random-generation.txt` |
| `node test-l2-templates.js` | **262 / 0** | `reports/FINAL_test-l2-templates.txt` |
| `node test-l1-frozen.js` | **64 / 0** | `reports/FINAL_test-l1-frozen.txt` |
| `node test-layout-position.js` | **35 / 0** | `reports/FINAL_test-layout-position.txt` |
| `node test-music-playback.js` | **69 / 0** | `reports/FINAL_test-music-playback.txt` |
| `node test-build-consistency.js` | **110 / 0** | `reports/FINAL_test-build-consistency.txt` |
| `node tools/test_render.mjs` | 27/27 场景 | `reports/FINAL_render.txt` |
| `node tools/browser_smoke.mjs` | `allPassed=true`（两页各 4 局 L1 + 4 局 L2，`exceptions=0`） | `reports/FINAL_browser_smoke.txt` |
| `node tools/music_real_playback.mjs` | **54/54**（网页 / 独立 HTML / ES5 legacy 真机播放） | `reports/FINAL_music_real_playback.txt` |

合并汇总：`reports/FINAL_RERUN_ALL.txt`。专项报告：`l2-templates-report.{json,md}`、
`l1-frozen-report.{json,md}`、`random-generation-report.{json,md}`、
`build-consistency-report.{json,md}`、`layout-position-report.{json,md}`、
`music-playback-report.{json,md}`。

双关各 100 局窗口内相似度：L1 最大 **0.5934**（3 局窗口，冻结口径，随机 seed 每次略有浮动）、
L2 最大 **0.4554**，全部 < 0.60。

---

## 7. 构建测试与产物一致性

`node test-build-consistency.js` → **110 / 0**：

- 用 `tools/bundle_shared.mjs`（构建脚本同源函数）现场重打包，与两个 HTML 内嵌
  `<script id="mah-bundle">` **逐字节比对**通过；
- `sourceHash` = 现场对 `src/` 全量文件重算的 SHA-256 = `e3f1aba2f8dd2b3e…`，
  参与哈希源文件 **37** 个；
- `[7]` 节：4 个正式 HTML 均内嵌 **20 个唯一 `templateId`（`L2-P01`…`L2-P20`）**、
  `MAH-L2-STRUCT-v1/SHA-256`、`MAH-L2-CANON-v1/SHA-256`、`MAH-L2-DEDUP-v1`、
  `canonicalGeometrySignature`、`structureSignature`、`TEMPLATE_POOL_EXHAUSTED`；
  网页版 3 个副本与 `dist/MahLeMah.html` 逐字节相同；
- legacy 通过 Babel + acorn 纯 ES5 语法校验。

| 产物 | 字节 | SHA-256 |
|---|---:|---|
| `dist/MahLeMah.html` | 9,916,421 | `61f322e503b256a6e66e487d311574a7f5e2cef29fb4bda6c931588a6fddb3fd` |
| `dist/index.html` | 9,916,421 | 同上（同内容副本） |
| `dist/Mah了个Mah.html` | 9,916,421 | 同上（同内容副本） |
| `dist/MahLeMah-legacy.html` | 9,950,536 | `d9dac7d73741585082853fcf529bccf2a7030084bfd71e6e4a53babaeb852f73` |

`buildVersion=2.0.0-f17b73b`、`gitCommit=f17b73bce482fae522a43c1df8cd2ca6ebf51b34`
（构建时 HEAD；产物不回写新提交，避免自指循环，一致性由实时重算保证）。

---

## 8. 最终验收标准逐条判定

| 规格「验收」 | 判定 | 依据 |
|---|---|---|
| 逐一展示 20 套布局缩略图 | ✓ | `reports/l2-thumbnails.html` / `.png`；每套固定 seed 真实生成一局，按真实 `x/y/layer` 俯视绘制，虚线格为 5×9 掩膜 |
| 20 套是真正不同的全局几何结构 | ✓ | 掩膜两两不同、占位格轮廓 20/20 种、190 对 sim 全部 < 0.60、层/区域分布各 18/15 种 |
| 不得仅改坐标 / 种子 / 局部牌块 | ✓ | 差异来自掩膜 + 生长轨迹 + 层形状 + 层级曲线 + 层间错位 + 密度；去重基于真实几何 |
| 每局从 20 套选，最近 10 局不重复 | ✓ | 100 局实测：模板 / 等价几何 / 结构 / 几何签名重复均为 0 |
| 跨重新开始 / 标题页 / 应用重启保存 10 局 | ✓ | 4 种 `generationReason` 全覆盖 + 存档序列化重载 + 两个 HTML 共用持久化历史 |
| 用实际几何判重，不只比模板 ID | ✓ | 4 类几何签名 + 主堆结构/布局相似度双阈值，模板 ID 只是其中一环 |
| 牌数 / 层级 / 遮挡 / 消除条件正常 | ✓ | 60 局：牌数 = 档位、`validateLevel.ok`、零悬空、遮挡图一致、消除后下层暴露 ≥1 |
| 无法满足 10 局不重复时必须报错 | ✓ | `TEMPLATE_POOL_EXHAUSTED` 真实触发并断言，不清空历史、不复用重复布局 |
| 连续 100 局任意连续 10 局无重复 | ✓ | `reports/l2-100-games.txt`（0 失败、最大重试 2、PASS） |
| 第一关及其他功能完全不变 | ✓ | `test-l1-frozen.js` 64/0、`test-layout-position.js` 35/0、`test-music-playback.js` 69/0、真机 54/54 |
| 网页版 / 独立 HTML / 桌面端构建一致性 | **部分** | 网页版 ✓、独立 HTML ✓、ES5 legacy ✓；**桌面端 Rust 构建未运行**（缺 MSVC link.exe），仅源码静态一致性通过 |
| 未实际执行的测试不得标记为通过 | ✓ | 本报告第 0 / 9 节如实列出全部未运行项 |

---

## 9. 未执行 / 未覆盖项（不计入通过）

| 项 | 状态 | 原因 |
|---|---|---|
| Rust `cargo check` / `cargo build` | **未运行成功** | Git Bash 下 GNU `link` 遮蔽；PowerShell 下明确 `linker link.exe not found`（未安装 VS C++ 链接器） |
| 桌面版 exe 重建与真机音乐播放 | **未运行** | 依赖 Rust 构建 |
| Windows 安装版 / Portable zip / Setup.exe / SHA256SUMS.txt | **未重建** | 依赖 Rust 构建，仍是旧冻结产物 |
| `npm run test:release`（12000 局发布压力测试） | **未重跑** | 本版不属于规格要求的测试链 |
| 原版《羊了个羊》内部布局数据 / 精确算法复刻 | **不可得** | 只参考可观察特征，报告不声称复刻 |

---

## 10. 复现命令

```bash
node test.js                          # 625/0
node test-random-generation.js        # 7788/0（双关各 100 局）
node test-l2-templates.js             # 262/0（20 套 / 60 局 / 190 对 / 掩膜覆盖 / 等价几何 / 重开入口）
node test-l1-frozen.js                # 64/0（第一关冻结回归）
node test-layout-position.js          # 35/0
node test-music-playback.js           # 69/0
node test-build-consistency.js        # 110/0
node tools/test_render.mjs            # 27/27
node tools/browser_smoke.mjs          # allPassed=true
node tools/music_real_playback.mjs    # 54/54，桌面版未运行
node tools/l2_thumbnails.mjs          # 生成 20 套缩略图 reports/l2-thumbnails.html
npm run build:all                     # 重建 4 个 HTML
```

修改文件清单见 `reports/MODIFIED_FILES.md`。
本轮提交：`0344ad7`（完整哈希 `0344ad7281b16ba785ad24d99eb9e36f8f5d1401`），已推送 `origin/main`。
