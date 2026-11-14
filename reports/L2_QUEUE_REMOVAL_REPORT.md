# 第二关布局重构报告：彻底取消固定四链盲盒队列

- 基准 HEAD：`8a0c434ad1e4a4da2b906a5744105aeac883144a`
- 任务范围：仅第二关完整布局重构，第一关冻结（零改动）
- 执行模式：Agent 直接修改源码 + 测试 + 重建产物
- 本轮结论：**全部自动化测试通过；HTML 产物与源码一致；第一关零改动**

---

## 一、七个必答问题（逐项明确）

1. **是否彻底取消第二关固定四链结构？**
   ✅ 是。已从源码彻底删除 `QUEUE_SHAPE`（左竖 7 + 右竖 7 + 中横 15 + 底横 15）与 `buildQueue()` 函数；`layout_profiles.js` 的 `generateProfileLayout` 对第二关显式抛错（不再有"悄悄回退"分支）；`l2_geometry.js` 第二关生成路径不再 import/调用 `buildQueue`。源码级检查（`test.js` 源字符串断言）+ 运行级检查（20 套外廓坐标签名互不相同、无任何一套等于旧四链坐标集合）双重确认。

2. **是否取消固定 44 张队列追加机制？**
   ✅ 是。旧机制是"模板主体 + 共享 `buildQueue()` 固定 44 张"；新机制是"每套模板自带一份显式外廓牌位段（44 张，11–16 层塔群）"，由模板规格 `outerPlanFor()` 确定，不再有跨模板共享队列。

3. **原 44 张牌是否全部融入 20 套完整模板？**
   ✅ 是。`l2_templates.js` 为 L2-P01…P20 各新增 `outer` 定义（mask 2 行×9 列、layers 分配、turn 相位）。`generateTemplateLayout` 把 44 张外廓牌按模板真实落位到主堆之上（baseLayer = 档位层数），不再作为独立固定队列追加。`test.js` 逐张校验 `outer.length===44` 且每张坐标/层/相位等于该模板完整布局规格。

4. **20 套模板是否具有真实完整布局差异？**
   ✅ 是。20 套 `outer` 掩膜两两不同；`canonicalGeometrySignature` 20/20 唯一；`structureSignature` 20/20 唯一；190 对两两 `structureSimilarity` 与 `layoutSimilarity` 全部低于阈值（结构 sim 最大 0.5730、主堆布局 sim 最大 0.8838，详见 `test-l2-templates.js`）。差异来自真实空间结构（金字塔/双核心/三岛/环形/十字/阶梯/巨塔/蝴蝶/沙漏/迷宫/棋盘/月牙/波浪/对角双塔/四角围合/十字岛/大陆形），不是旋转/平移/缩放同一套布局，也不是随机牌面顺序。

5. **是否保留原牌数、花色配额和难度机制？**
   ✅ 是。每局总牌数 = `mainCount + queueCount`（queueCount 仍记 44，代表外廓牌数），各档位总牌数/层数/花色数不变；`layerPlanFor` 沙漏曲线决定层张数，三消配额 `mixFor` 不变；10 档难度保留，同模板跨档位仅调垂直层级与深度，主体平面轮廓一致；开局可点 19–25 张区间保留；压深门槛、最长遮挡链、最近 10 局模板去重全部保留。

6. **第一关是否零改动？**
   ✅ 是。`layout_profiles.js` 第一关（isL1 / `queueCount===0`）生成分支一字未动；`LEVEL1_PROFILES` 与 `generateProfileLayout` 第一关路径原样保留。`test-l1-frozen.js` 56/56 通过；`test.js` 第一关相关断言全部通过。

7. **所有测试是否通过？**
   ✅ 是。见下表。未降低任何原有校验阈值，未用改测试凑数；旧的"固定坐标 y=616/748 横排 + x=33/627 竖列"启发式已替换为更精确的"模板感知"判定（外廓坐标签名互异 + 不等于旧四链集合），反而更强地抓住了"跨模板共享固定链"这一真实禁止项。

---

## 二、修改文件清单（12 个，均在 src/tools/tests，dist 为重建产物）

| 文件 | 改动要点 |
|---|---|
| `src/game/l2_templates.js` | 新增 `OUTER_SEG='outer'`、`OUTER_TILE_COUNT=44`、`GRID_X0/GRID_Y0/OUTER_ROWS/OUTER_R0`；为 20 套模板各加 `outer`（mask / layers / turn），新增 `outerSignature`；`structure` 暴露 `outer` 段 |
| `src/game/l2_spec.js` | 新增纯函数 `outerPlanFor(spec, profile)`（确定性计算 44 张外廓牌坐标/层/相位）；`specFor/specPlan` 签名纳入外廓；`checkFidelity` 新增 OUTER 段校验（张数/坐标/层/相位/轮廓/同层零重叠/外廓顶层可点） |
| `src/game/l2_geometry.js` | 重写 `generateTemplateLayout`：主堆 + 外廓完整落牌，彻底移除 `buildQueue` 依赖；候选搜索 PHASES×fillRot = 64 组，保证可点 19–25、零悬空、三段保真 |
| `src/game/layout_profiles.js` | 删除 `QUEUE_SHAPE`、`buildQueue()`、旧第二关分支与 `globalLayers`；`generateProfileLayout` 对 L2 显式抛错；`describeProfileLayout` 返回 `mainLayers/outerTiles/layoutMode` |
| `src/game/generator.js` | `baseCard` 映射 `seg/outerLayer/outerIndex`，删除旧 chain/chainIndex/chainLen 四链字段 |
| `src/game/render.js` | `back: c.seg === 'outer' && c.blocked`（外廓塔群被压显示牌背，剥开自动翻开） |
| `src/game/l2_structure.js` | `mainStackCards` 过滤口径改为 `seg !== 'outer'` |
| `src/game/l2_visual_audit.mjs`(tools) | 牌位采样过滤改为 `seg !== OUTER_SEG` |
| `tools/l2_thumbnails.mjs` | 缩略图改为绘制"主体 + 模板外廓"完整布局（不再是只画主堆） |
| `test.js` | ① 源字符串断言确认 `QUEUE_SHAPE`/`buildQueue`/`seg:'queue'` 已从第二关源码消失；② 第 [3] 节新增外廓逐张校验、外廓坐标签名互异、无旧四链匹配；③ `describeProfileLayout` 与 `generateProfileLayout(L2)` 断言更新 |
| `test-l2-templates.js` | 主堆过滤 `seg==='queue'` → `seg===OUTER_SEG` |
| `test-random-generation.js` | 外廓牌校验 `seg==='queue'` → `seg==='outer'`，期望值 `OUTER_TILE_COUNT` |
| `test-layout-position.js` | 第 [3] 节改用 `generateTemplateLayout`（原 `generateProfileLayout` 已对 L2 拒绝） |

---

## 三、关键函数

- `outerPlanFor(spec, profile)` — `l2_spec.js` 纯函数：给定模板规格与档位，确定性输出 44 张外廓牌的 `x/y/layer/phase/region/zoneLayer`，逐层嵌套（层集合严格递增 ⇒ 低层必被高层压住）。
- `generateTemplateLayout(seed, profile, templateId)` — `l2_geometry.js`：主堆（沿用 `assignZ`/连通团块）+ 外廓（调 `outerPlanFor`）完整落牌；64 组候选迭代满足可点 19–25 + 零悬空 + `verifyTemplateFidelity`。
- `checkFidelity(spec, profile, cards, fillRot)` — `l2_spec.js`：三段保真之"生成后"校验，新增 OUTER 段校验（不降低任何主堆校验）。
- `describeProfileLayout(profile)` — 现返回 `layoutMode:'L2-full-template'`、`mainLayers`、`outerTiles`，不再有"每张队列各占一层"的 `globalLayers` 口径。

---

## 四、测试结果（全部通过，零失败）

| 测试 | 断言 | 关键覆盖 |
|---|---:|---|
| `test.js` | 639 / 0 | 200 局（20×10）三段保真、外廓逐张、外廓签名互异、无旧四链、相位篡改拦截、源级四链清除、第 [19] 节 L2 100 局差异化 |
| `test-l2-templates.js` | 262 / 0 | 20 套 × 3 seed 真实生成、掩膜/区域覆盖、190 对结构差异、最近 10 局去重 |
| `test-l1-frozen.js` | 56 / 0 | 第一关冻结回归（几何/牌数/坐标/牌面分布） |
| `test-layout-position.js` | 35 / 0 | 第一关重心/缩放；第二关 10 档×8 seed×20 套包围盒/边界/晶格/重叠（最小 561×484） |
| `test-build-consistency.js` | 110 / 0 | 4 个 HTML 内嵌 JS 与 src 逐字节一致、sourceHash 一致 |
| `test-random-generation.js` | 7788 / 0 | L1/L2 各 100 局发牌/校验/配额/遮挡/可见，L2 重试 1 次、失败 0 次 |

小计：**639 + 262 + 56 + 35 + 110 + 7788 = 8890 项断言，全部通过。**

---

## 五、HTML 产物重建与一致性

- 重建命令：`npm run build:all`（`build:web` → `dist/index.html`、`dist/MahLeMah.html`、`dist/Mah了个Mah.html`；`build:legacy` → `dist/MahLeMah-legacy.html`）。
- 四份产物内嵌 `sourceHash = 8845ba553f6344f3`，与"对 src 全量文件重新计算的 SHA-256"完全一致（`test-build-consistency.js` 通过）。
- `tools/l2_thumbnails.mjs` 已重跑，生成 `reports/l2-thumbnails.html` + `.json`，20 套缩略图改为绘制"主体 + 外廓"完整布局。

---

## 六、未执行 / 待办（如实标注，未伪造为通过）

- **浏览器/Canvas 真实视觉审计**（`tools/l2_visual_audit.mjs`）：仅更新了牌位过滤口径（`seg !== OUTER_SEG`），**未在本轮重新跑浏览器截图审计**。建议在有 headless Edge + CDP 的环境重跑一遍，确认外廓塔群与主堆的像素级遮挡与缩略图一致。该工具此前依赖"只画主堆"的口径，本轮已改为画完整布局，需重新校准检测阈值。
- **Windows 桌面版重建/发布**：不在本任务范围（本任务仅第二关布局重构）；此前 Windows 验收结论保持不变。
- **Git 提交/推送**：按惯例未自动提交。`HEAD` 仍为 `8a0c434`；本轮改动仅在工作区（src/tools/tests + dist 重建），未产生 commit。

---

## 七、结论

第二关旧的"固定 44 张四链盲盒队列"已从源码、数据、生成路径、渲染口径、测试断言五处彻底移除；原 44 张牌全部融入 20 套模板各自独立、互不相同、可验证的显式外廓布局。总牌数、花色配额、10 档难度、压深/遮挡/可点门槛、最近 10 局去重、三段保真等原有机制全部保留；第一关零改动；全部 8890 项自动化断言通过；HTML 产物与源码一致。
