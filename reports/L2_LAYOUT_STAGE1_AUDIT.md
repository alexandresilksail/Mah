# 第二关 20 套模板布局规格 · 第一阶段独立审计报告

> 本次为**只读独立代码审计**：不修改任何源码、不重构、不构建发布包。
> 审计对象仅限第二关 20 套模板的布局规格、生成逻辑与实际坐标一致性。
> 第一关保持冻结，未触碰其任何逻辑。

---

## 1 · 审计版本与 Commit SHA

| 项 | 值 |
|---|---|
| 审计仓库 | `mah-le-mah`（路径 `D:\Users\Administrator\WorkBuddy\2026-11-02-18-41-41\mah-le-mah`） |
| 审计 HEAD | `8a0c434ad1e4a4da2b906a5744105aeac883144a` |
| 提交说明 | `@ audit(l2): 修复保真校验相位漏检 + 重建产物 + 同步审计与验收报告` |
| 审计时间 | 2026-11-13（本地） |
| 审计方式 | 静态源码逐行追踪 + 运行既有测试（`test-l2-templates.js`、`test.js` 第二关段）+ 独立探针脚本（运行后已删除，未留痕） |

**源码改动状态**：除重新运行测试导致 `reports/l2-templates-{report.json,report.md,output.txt}` 三个产物被刷新（反映本次 `8a0c434` 的真实运行结果）外，`git status` 显示**无任何源码文件被修改**。被锁定的文件（`l2_spec.js`、`l2_geometry.js`、`specPlan()`、`checkFidelity()`、`specFillRot`、20 套模板定义、渲染/游戏逻辑）零改动。

---

## 2 · 20 套模板定义检查结果（审计项 A）

| 子项 | 结论 | 证据 |
|---|---|---|
| A1 · 20 个 `templateId` 真实存在且唯一 | **PASS** | `l2_templates.js:79-239` 定义 `DEFS` 共 20 项，`L2_TEMPLATES` 由 `DEFS` 构建（`:346-350`）；`test-l2-templates.js:85-87` 断言 `length===20` 且 `Set.size===20`；独立探针确认 `L2_TEMPLATES.length===20`、`Set(L2_TEMPLATE_IDS).size===20`、全部可按 ID 反查 |
| A2 · 每套模板的逐层格位定义 | **PASS（含说明）** | 模板文件**不静态保存逐层格位**；逐层格位由 `specPlan(spec, profile, fillRot)`（纯函数，`l2_spec.js:424-697`）从掩膜唯一确定。掩膜解析见 `parseMask`（`l2_templates.js:244-264`）、连通区域 `labelRegions`（`:267-294`） |
| A3 · 每套的 px/py 相位与错位极性 | **PASS（含发现 F2）** | 详见 §7-F2：模板 `phase` 字段未被生成使用；实际相位由 `fillRot`（源自 seed，`generateTemplateLayout` `l2_geometry.js:176-177`）决定，`PHASES[(fillRot+l)%4]`（fill 段）/ `PHASES[cycle%4]`（tail 段）（`l2_spec.js:488,633`） |
| A4 · 缩略图 ↔ 规范数据对应关系 | **PASS** | 缩略图由 `tools/l2_thumbnails.mjs:32-61` 以 `generateLevel(2, seed, {profile:0, templateId})` **真实生成**，再按主堆真实 `(x,y,layer)` 绘制（`svgFor` `:78-113`），虚线框为模板掩膜。独立探针比对 `reports/l2-thumbnails.json` 与源码：`maskMismatch=0`、`maskCellCountMismatch=0` |

**形状族分布（来自 `test-l2-templates.js` 运行输出）**：核心聚拢型 ×2 / 多岛分离型 ×4 / 围合环抱型 ×5 / 单向偏置型 ×4 / 格网迷宫型 ×2 / 起伏异形型 ×2 / 不规则大陆型 ×1，共 7 族 20 套，全部覆盖。

**模板 ID 清单**：`L2-P01`…`L2-P20`，全部 `L2-` 前缀，可被 `templateById()` 反查（`l2_templates.js:357-359`）。

---

## 3 · 逐层布局规格检查结果（审计项 A2 延伸 / B1）

| 子项 | 结论 | 证据 |
|---|---|---|
| 轮廓掩膜为唯一结构来源 | **PASS** | 实际几何仅由「掩膜（cells + region + box）」(`l2_spec.js:225-286` `buildSpec`) + 档位层张数 `layerPlanFor` (`config.js:228-249`) + `fillRot` 决定。模板的 `growth/layerShape/layerCurve/offsets/density/phase` 在生成路径中**零读取**（见 §7-F1） |
| 每层格集合 = 掩膜游走序的确定性展开 | **PASS** | `buildPlan` (`l2_spec.js:424-697`) 为纯函数：无 `Math.random`；逐层格来自多源 BFS 游走序 `walkOrder` (`:190-221`) 与确定性相位 `PHASES[(fillRot+l)%4]`。计划缓存 `PLAN_CACHE` (`:699`) 保证同 `(spec,profile,fillRot)` 恒定 |
| 掩膜 100% 覆盖（俯视轮廓 = 缩略图） | **PASS** | `buildPlan` 末尾 `remaining!==0` 抛错 (`:660-667`)；`checkFidelity` 的 `SILHOUETTE` 检查 (`:890-902`)；`test.js:308-314` 200 局「俯视轮廓逐格等于掩膜，无一格简化」全部通过 |
| 半格晶格 / 牌桌边界 / 同层零重叠 | **PASS** | `checkFidelity` 的 `LATTICE`/`CELL_OUT`/`SAME_LAYER`（`:806-928`）；`test.js:316-321` 200 局全过；独立探针 `verifyAfterGeneration_PASS=true` |

---

## 4 · 布局生成逻辑检查结果（审计项 B）

| 子项 | 结论 | 证据 |
|---|---|---|
| B1 · `specPlan()` 严格按规范生成 | **PASS** | `buildPlan` 完全基于 `spec`（掩膜/游走序/邻接）与 `profile`（`layerPlanFor` 层张数），不引入任何外部随机或二次决策；层总数、逐层张数、张数总和均与档位一致（`:427-673` 内部自校验） |
| B2 · 不存在随机选格 / 随机偏移 / 重新分配层级 | **PASS** | 整个生成热路径（`l2_spec.js`、`l2_geometry.js`）**无 `Math.random`**。唯一随机性来自：①seed→`fillRot`（确定性）；②tail 段相位候选搜索（`buildCandidate` `l2_geometry.js:183-198`），仅在 4×4 确定性相位选项中挑「开局可点 19–25」者，**只影响 tail 相位（非模板身份）**；③队列布局 `makeRng`。层到格的分配由 `plan` 固定，无重排 |
| B3 · 20 套模板不可能生成相同布局 | **PASS** | 20 套掩膜两两不同（`test-l2-templates.js:100-101` `maskKeys.size===20`），而几何 = 掩膜驱动 ⇒ 任意两套无法生成相同轮廓。独立探针：profile 0 下 20/20 轮廓唯一；`test-l2-templates.js:286-289` 190 对最大结构相似度 0.4438 / 主堆布局 0.4284，均 < 0.60 |
| B4 · 10 档难度不破坏主体轮廓 | **PASS** | 独立探针：固定 seed、遍历 10 档，每套模板的**主体轮廓（被占掩膜格集合，忽略层号与相位）** 0 处变化（200 局 `cellSetMismatches=0`）。原理：`SILHOUETTE` 检查强制掩膜全覆盖，与档位无关；档位仅改变**层内张数分布（垂直深度）**，不改变水平轮廓 |

> **说明**：B4 中「层→格」的对应关系会随档位变化（层数/层张数不同 ⇒ 同一掩膜格被分配到不同层索引），这是难度应有的垂直深度差异，不属于「破坏主体轮廓」。

---

## 5 · 三阶段布局一致性检查结果（审计项 C）

| 阶段 | 结论 | 证据（函数调用链） |
|---|---|---|
| C1 · 生成后（第 1 道） | **PASS** | `generateTemplateLayout` → `buildCandidate`（`l2_geometry.js:244-300`）在 accept 前调用 `checkFidelity` (`:282`)。`test.js:283` 200/200「生成后规格保真」通过 |
| C2 · `installLevelData` 安装后（第 2 道） | **PASS** | `engine.js:183-238` 在装配前调用 `verifyTemplateFidelity(data.cards, templateId, profile, specFillRot)` (`:193`)；不通过即抛错、不安装。`test-l2-templates.js:210-218` 60 局真实安装校验通过 |
| C3 · 渲染前（第 3 道） | **PASS** | `main.js:583-600` `assertLevel2FidelityBeforeDraw` 每 `boardRev` 缓存一次，调用同一 `verifyTemplateFidelity` (`:593`)；失败画整屏错误页、零牌绘制 (`:603-626`)。`test.js:285` 200/200「牌桌真实牌位复核」通过 |
| C4 · 几何签名/牌数/层级/坐标/相位一致 | **PASS** | `specFillRot` 全链路传递：`generator.js:425` → `engine.js:209` → `main.js:593`。独立探针：`verifyAfterGeneration_PASS=true`；将一张 fill 段牌 `x` 翻转半格（相位篡改）→ `verifyTemplateFidelity` 报 `PHASE` 失败（`checkFidelity:857-888` 仅校验 fill 段相位，tail 段为自由旋转，不校验，属设计口径） |

**三阶段结论**：三段使用**同一实现**（`verifyTemplateFidelity`→`checkFidelity`），由 `specFor+specPlan` 确定性重建计划后逐张比对，且 `specFillRot` 不丢失，故三阶段几何一致性成立。

---

## 6 · 190 组模板差异检查结果（审计项 D）

| 子项 | 结论 | 证据 |
|---|---|---|
| D1 · 190 组两两比较已执行 | **PASS** | `test-l2-templates.js:273-289` 双循环 190 对；`pairs===190`、`overThreshold===0` |
| D2 · 轮廓与层级分布检查 | **PASS** | `regionShapes.size>=4`（实测 4 种区域数）；`silhouettes.size===20/20`（占位格轮廓全不同）；`layerShapes.size===1`（各层张数由档位统一决定，符合「缩略图=唯一几何标准」） |
| D3 · 无明显重复模板 | **PASS** | 20 套 `canonicalGeometrySignature` 唯一（`:268`）、`structureSignature` 唯一（`:270`）；最大相似度 0.44 < 0.60 阈值 |
| D4 · 现有测试是否真正验证「视觉差异」而非仅「数据签名」 | **FAIL / 重要发现（见 §7-F9）** | 现有测试仅验证**几何数据**：`structureSignature`/`canonicalGeometrySignature`（坐标数据的 SHA-256 哈希）、`structureSimilarity`/`layoutSimilarity`（坐标单元 Jaccard，`l2_structure.js:232-270`、`layout_signature.js:249-273`）、轮廓/区域唯一性。**无自动化像素级视觉比对**；`l2-thumbnails.html/.png` 由 `tools/l2_thumbnails.mjs` 生成，属人工查看产物，无断言 |

> **诚实说明（D4 的判定）**：几何数据差异是「视觉差异」的强代理（渲染直接依据几何），但**不等于像素级视觉验证**。若存在「几何数据正确但渲染出错」的缺陷（如绘制顺序、颜色、图样偏移），现有布局测试无法捕获。这构成「视觉」维度的覆盖盲区，但不影响「布局正确性」结论。

---

## 7 · 已发现问题与风险等级

### F1 ·【中危 · 文档/维护】模板「成长参数」为无效配置（dead config）
- **事实**：`l2_templates.js` 把 `growth/layerShape/layerCurve(CURVES)/offsets/density/phase` 写入 `structure` 并经由 `templateSummary` 暴露（`:323-328,374-379`），但 `l2_spec.js` 的 `buildSpec`/`buildPlan` 与 `l2_geometry.js` 的落牌逻辑**从未读取这些字段**（全局 grep 零命中）。
- **影响**：① 实际几何只由「掩膜 + 档位 + fillRot」决定，模板文件自述「轮廓掩膜 + 成长参数」**名不副实**；② `structureSignature`（`:337`）与 `test-l2-templates.js:96-99` 的 `paramKeys` 唯一性部分依赖这些装饰参数——若将来出现「同掩膜、不同装饰参数」的模板，会**骗过 [0] 的签名唯一性断言却几何完全相同**（当前 20 套掩膜各不相同，暂不可能触发）；③ 维护者若误以为这些参数生效，会做出错误修改。
- **风险等级**：中（功能无直接影响，但属误导性契约，需文档澄清）。
- **处置**：本轮按约束**不改代码**；建议第二阶段以注释/审计说明澄清，或删除无效字段。

### F2 ·【低危 · 信息】模板 `phase` 字段非生成相位（与 F1 同源）
- **事实**：模板定义中的 `phase:[0,0]` 等**不参与生成**。实际 fill 段相位为 `PHASES[(fillRot+l)%4]`（`:488`），`fillRot=(seed^0x6c32f1a7)%4`（`l2_geometry.js:176-177`）。独立探针：P01 实际第 0 层相位 `[1,0]` vs 模板 `phase [0,0]`。
- **影响**：「px/py 相位与错位极性」是 **seed 派生**，非每套模板身份；同模板不同 seed 相位不同（轮廓掩膜格不变）。这与设计注释「seed 决定每层半格相位」一致，但模板 `phase` 字段具误导性。
- **风险等级**：低（与设计意图一致，仅字段冗余）。

### F3 ·【中危 · 覆盖盲区】缺少像素级视觉验证（同 D4 / F9）
- 见 F9。

### F4 ·【低危 · 观察】整局包围盒区分度低
- **事实**：`test-l2-templates.js` 输出的 `boxes`（整局包围盒，含固定位置 44 张队列）仅 2 种不同值。
- **影响**：包围盒不是布局区分指标；主堆 `mainBox` 区分度更高（缩略图已体现）。无功能风险，仅说明「包围盒」不适合作为唯一性判据。
- **风险等级**：低（信息性）。

### F5 ·【信息 · 已确认安全】三阶段保真校验的 tail 段相位不校验
- **事实**：`checkFidelity` 的 `PHASE` 检查（`:857-888`）显式 `if (plan.layers[lp].kind !== 'fill') continue`，tail 段相位为生成时按「可点 19–25」挑选的自由旋转，非模板身份。
- **影响**：设计口径正确，不会误判（verify 用默认 tail 相位重展开仍通过）。已确认非缺陷。

### F9 ·【中危 · 覆盖盲区】「视觉差异」无自动化像素验证
- **事实**：所有「20 套布局差异」断言（含 190 组）均为**几何数据层**（坐标单元 Jaccard + 哈希签名）。`reports/l2-thumbnails.html/.png` 是人工查看产物，`tools/l2_thumbnails.mjs` 不输出任何断言。
- **影响**：无法自动捕获「几何正确但渲染表现错误」类缺陷（绘制层级/z 序、配色、图样位移、Canvas/DOM 降级一致性等）。
- **风险等级**：中（布局正确性已充分验证；但「视觉体验」维度未被自动化守护）。
- **处置**：建议第二阶段引入缩略图渲染产物的像素级 diff/相似度断言（或至少对 `l2-thumbnails.html` 做结构快照比对）。

---

## 8 · PASS / FAIL / NOT RUN 清单

### 静态源码审计（SRC）
| 编号 | 检查项 | 结论 |
|---|---|---|
| S-1 | 20 个 templateId 存在且唯一（`l2_templates.js`） | PASS |
| S-2 | 逐层格位由 `specPlan` 确定性生成，无随机（`l2_spec.js:424-697`） | PASS |
| S-3 | 模板 `growth/layerShape/layerCurve/offsets/density/phase` 在生成路径零读取（F1/F2） | PASS* |
| S-4 | 生成路径无 `Math.random`（B2） | PASS |
| S-5 | 三阶段共用 `verifyTemplateFidelity→checkFidelity`（C1-C3） | PASS |
| S-6 | `specFillRot` 经 generator→engine→main 不丢失（C4） | PASS |

> S-3 结论为「PASS（字段冗余、无害）」；其冗余本身记为 F1/F2 风险。

### 自动化测试（TEST）
| 编号 | 检查项 | 结论 | 运行证据 |
|---|---|---|---|
| T-1 | `test-l2-templates.js` 全部断言 | PASS | 262/0（本次重跑，commit 8a0c434） |
| T-2 | 60 局（20×3 档位/seed）真实生成 + 安装（[1]） | PASS | maskOut=0、regionShort=0 |
| T-3 | 190 对两两差异 < 0.60（[2]） | PASS | overThreshold=0，max 0.44/0.43 |
| T-4 | 等价几何/镜像/换牌面归一 + 模板级/几何级去重（[3]） | PASS | — |
| T-5 | 5 种重开入口 × 12 局去重 + 持久化（[4]） | PASS | 最近 10 局零重复 |
| T-6 | `test.js` 第二关段 [3]：200 局（20×10）全口径 | PASS | 生成保真 200/200、复核 200/200、相位篡改 100% 拦截 |
| T-7 | 现有测试验证「视觉差异」而非仅数据签名（D4） | **FAIL** | 仅几何数据哈希/Jaccard，无像素比对（F9） |

### 真实视觉验证（VISUAL）
| 编号 | 检查项 | 结论 |
|---|---|---|
| V-1 | 20 张缩略图与规范掩膜/真实几何一致 | PASS（探针比对 `thumbnails.json` 与源码掩膜，0 处不一致；缩略图由真实几何绘制） |
| V-2 | 缩略图之间像素级差异（190 组） | **NOT RUN**（无自动化像素比对工具；按用户要求本阶段不强制生成全部截图） |
| V-3 | Canvas / DOM 降级 / 多浏览器实际渲染表现一致性 | **NOT RUN**（超出本阶段范围） |

### 未运行（NOT RUN）
| 编号 | 项 | 原因 |
|---|---|---|
| N-1 | 190 组缩略图像素级 diff | 无自动化视觉断言工具；用户明确「不要求立即生成全部截图」 |
| N-2 | 12000 局 Release 布局压力测试 | 属发布阶段；本阶段只审计不构建 |
| N-3 | 桌面端真机渲染/音乐视觉验证 | 属 P1 发布前项；本阶段不构建发布包 |

---

## 9 · 第二阶段需要继续核验的事项

1. **F1/F2**：澄清或清理模板装饰参数（`growth/layerShape/layerCurve/offsets/density/phase`）——确认是否应保留为文档元数据（并修正 `structureSignature`/`paramKeys` 唯一性语义），或彻底移除，避免「参数生效」的误读。
2. **F9/V-2**：为「20 套视觉差异」补一套**像素级**验证：对 `tools/l2_thumbnails.mjs` 产出做渲染后快照比对（或独立截取 20 张俯视图做 SSIM/哈希），确保「几何正确」不等于「渲染正确」。
3. **C3 真机**：在 Canvas 与 DOM 降级两条渲染通道、以及桌面端真机，确认渲染前校验失败时的整屏错误页在真实浏览器中不残留、可恢复（当前仅静态审计 + 单元逻辑，未做真机）。
4. **B4 跨档位垂直深度**：虽主体轮廓不变，建议第二阶段抽样确认 10 档下「平均压深」「开局可点 19–25」在每档每套均稳定命中（现有 [1]/[3] 已覆盖 3/10 档与 10 档各一次，可补全 60 组逐档记录）。
5. **等价几何去重边界**：确认 `canonicalGeometrySignature` 在「不同模板生成等价结构」场景下的拒绝是否足够（[3] 已单点验证，可补一对真实跨模板等价示例）。
6. **发布链路（P1）**：桌面构建 / Setup.exe / Portable.zip / SHA256SUMS / 真机音乐 / 12000 局 Release 仍为 NOT RUN，需在发布前单独核验。

---

### 附：结论维度区分（最终口径）
- **静态源码审计（SRC）**：逐行追踪 `l2_templates.js`/`l2_spec.js`/`l2_geometry.js`/`generator.js`/`engine.js`/`main.js`/`config.js`，确认几何由「掩膜 + 档位 + fillRot」唯一决定、生成无随机、三阶段共用同一校验实现、`specFillRot` 不丢失。
- **自动化测试（TEST）**：重跑 `test-l2-templates.js`（262/0）与 `test.js` 第二关段（200/200），全部通过；唯一 FAIL 为「测试仅验证几何数据、未验证像素视觉」（F9）。
- **真实视觉验证（VISUAL）**：仅完成「缩略图 ↔ 规范掩膜/真实几何一致性」（探针比对 0 处不一致）；190 组像素级视觉 diff 与真机渲染为 NOT RUN。

**总体结论**：第二关 20 套模板的**布局规格、生成逻辑、三阶段几何一致性均已通过静态审计与自动化测试**；除「模板装饰参数冗余」与「缺乏像素级视觉守护」两项中危观察外，未发现破坏布局正确性的缺陷。
