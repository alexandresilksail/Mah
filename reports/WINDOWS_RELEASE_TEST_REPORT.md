# Windows 桌面版发布验收 · 第 4 步：Release 自动化测试报告

> 承接第 2/3 步：本轮 GNU Release 构建与三个发布产物重建成功后执行。全部测试**真实运行**，日志在 `reports/windows-release-test-logs/`，测试前的 54 个报告/数据文件已备份到 `reports/windows-release-backup/reports-before-tests/`。**未修改任何游戏源码**，仅新增独立验收工具 `tools/windows_release_500.mjs`。

---

## 0. 基线

| 项目 | 值 |
|---|---|
| 基准 HEAD | `8a0c434ad1e4a4da2b906a5744105aeac883144a` |
| 执行时间 | 2026-11-14 10:45 – 10:52 GMT+8 |
| 前置条件 | 第 2 步 `cargo build --release` EXIT=0；第 3 步 Setup.exe / Portable.zip / SHA256SUMS.txt 已由本轮重建 |
| Release 含义 | 项目发布测试脚本 `tools/stress_release.mjs`（`npm run test:release` 同源）+ 新增 500 局生成专项；**在 Release 构建完成后执行**，未使用任何 Debug 构建 exe 的结果 |
| 逻辑同源说明 | 桌面 Tauri `frontendDist: ../src` 与 4 个 HTML 共用同一份 `src/`；`test-build-consistency.js` **110/0** 逐字节验证产物与源码一致。但**逻辑测试 ≠ 桌面真机运行**，后者在第 5 步单独判定，不互相替代 |

---

## 1. 500 局 Release 测试（真实通过数 / 失败数 / 异常样本）

### 1.1 主项 A · 发布压力测试 504 局
```
node tools/stress_release.mjs --seeds 42 --levels 1,2    → EXIT=0
每关 42 seed × 6 策略 = 252 局 × 2 关 = 504 局（≥ 500 局目标）· 总耗时 1.5s
L1: random/greedy/noisy/lookahead/montecarlo/search 通关率 0% / 100% / 97.6% / 100% / 100% / 100%
L2: 六种策略通关率均 0%，死局率 100%
证书/verify 通过 0/42（0.0%）· 日志 01_stress_release_504.log
```

### 1.2 主项 B · 500 局生成专项（正确口径）
```
node tools/windows_release_500.mjs    → EXIT=0 · 耗时 3.03s · 判定 PASS
生成成功 500/500 · 抛错 0 · validateLevel 失败 0
三段保真：checkFidelity 失败 0 · verifyTemplateFidelity 失败 0
布局异常：牌数 0 · 坐标 0 · 重复ID 0 · 悬空 0 · 开局可点越界 0
第一关冻结漂移 0 · L1 100 局 / L2 400 局
覆盖：模板 20/20 · 档位 10/10 · 牌数 24-321 · L2 开局可点 19-25
异常样本 0 条
数据：reports/windows-release-test-logs/500_game_validation.json
```

### 1.3 关于 `证书/verify 0/42 (0.0%)` 的如实说明（**不作 PASS 宣称**）
- 现场实测：
  ```
  L1 requireSolution=true  certificate.ok=true   validateLevel.ok=true  issues=[]  verify=true
  L2 requireSolution=false certificate.ok=false  validateLevel.ok=true  issues=[]  verify=false
  ```
- `tools/stress_release.mjs:34` 的 `realVerify = validateLevel(d).ok && verify(d) && d.certificate.ok && replayTypes(d.typeSeq).ok`；而 `src/game/generator.js:313` 明确「**L2 不做可解性门槛：solvable 恒记 false，certificate 记峰值**」，`src/game/generator.js:440` 在 L2 返回 `certificate: { ok:false, peak:0 }`。因此该指标对 L2 恒为 0，L1 也因 `replayTypes(typeSeq)` 口径不适用而归零。
- **结论：这是压测工具的验证口径与当前生成器设计不匹配，不是生成失败、不是布局异常。** 该子指标记为「工具口径不适用（0/42，如实保留）」；生成正确性改由主项 B 的 `validateLevel` 500/500 + 三段保真 0 失败证明。
- **未修改** `stress_release.mjs` 或生成器来「修绿」该指标（属超出本轮授权的代码修改）。

### 1.4 工具自身两次失败（如实记录，未删除日志）
| 项 | 结果 | 处理 |
|---|---|---|
| 500 局脚本首次运行 | **EXIT=1 FAIL**：模板覆盖 16/20、档位 8/10 | 根因是我写的采样用 `i%20`/`i%10`，而 L1 每 5 局插一局导致部分索引被跳过（**工具采样缺陷，非产品问题**）。改用独立 `l2Index` 计数器后重跑 EXIT=0 / 20/20 / 10/10。首次日志 `05_windows_release_500.log` 保留 |
| `stress_release` verify 指标 | 0/42 | 见 §1.3，保留原值不改写 |

---

## 2. 100 局专项回归（真实执行）
```
node tools/l2_100_games.mjs    → EXIT=0
窗口内重复：template=0 canonical=0 structure=0 geometry=0
任意连续 10 局模板全不同：PASS
窗口内最大相似度：结构 0.5730 / 布局 0.5270（阈值 0.60）
可点范围 19-25 · 20 套模板全部用到：是（20/20）
独立复核问题数 0 · [mah] l2-100-games：PASS
```
另有 `test.js` 内 L2 100 局复核：窗口对 4,215、最大相似度 0.5284、重试合计 2 次、异常 0。

---

## 3. 六项检查逐项对照（用户要求）

| # | 检查项 | 判定 | 真实证据 |
|---|---|---|---|
| 1 | 生成成功率及异常退出 | **PASS** | 500/500 生成成功，抛错 0、异常退出 0；504 局压测 EXIT=0 无崩溃；`validateLevel` 失败 0 |
| 2 | 第二关 20 套模板正常使用 | **PASS** | 500 局覆盖 20/20；100 局专项 20/20；`test-l2-templates.js` 262/0 |
| 3 | 最近 10 局模板不重复 | **PASS** | 100 局专项四类签名窗口内重复全 0、连续 10 局模板全不同；`test.js` 632/0（L2 100 局窗口对 4215，最大相似度 0.5284） |
| 4 | 三阶段布局保真 | **PASS** | 500 局 `checkFidelity` 失败 0 + `verifyTemplateFidelity` 失败 0；262/0；`test-build-consistency.js` 110/0（4 产物与 src 逐字节一致） |
| 5 | 第一关冻结 | **PASS** | 500 局中 100 局 L1 同 seed 二次生成逐牌坐标零漂移；`test-l1-frozen.js` 56/0 |
| 6 | 牌数及布局异常 | **PASS** | 500 局牌数/坐标/重复 ID/悬空/可点越界全 0；`test-random-generation.js` 7788/0（L2 牌数 192–321）；`test-layout-position.js` 35/0（最小包围盒 660×616、异常 0） |

---

## 4. 补充测试套件（全部真实执行，EXIT=0）

| 测试 | 断言 | 结果 | 日志 |
|---|---|---|---|
| `node tools/l2_100_games.mjs` | 100 局专项 | PASS / 问题 0 | `02_l2_100_games.log` |
| `node test-l2-templates.js` | 262 / 0 | PASS | `03_test_l2_templates.log` |
| `node test-l1-frozen.js` | 56 / 0 | PASS | `04_test_l1_frozen.log` |
| `node test.js` | 632 / 0 | PASS | `07_test_js.log` |
| `node test-random-generation.js` | 7,788 / 0 | PASS | `08_test_random_generation.log` |
| `node test-layout-position.js` | 35 / 0 | PASS | `09_test_layout_position.log` |
| `node test-build-consistency.js` | 110 / 0 | PASS | `10_test_build_consistency.log` |

> 合计断言 **8,883 项通过 / 0 项失败**（不含 504 局压测与 500 局专项的逐局计数）。所有 EXIT 汇总见 `reports/windows-release-test-logs/summary.txt`。

---

## 5. 异常样本清单

| 类别 | 数量 | 明细 |
|---|---|---|
| 生成抛错 / 异常退出 | 0 | — |
| `validateLevel` 失败 | 0 | — |
| 三段保真失败 | 0 | — |
| 牌数 / 坐标 / 重复 ID / 悬空 / 可点越界 | 0 | — |
| 最近 10 局重复 | 0 | — |
| 第一关冻结漂移 | 0 | — |
| **工具层异常（非产品）** | 2 | ① 500 局脚本首次采样覆盖不足 16/20、8/10（已修工具并重跑 PASS）；② `stress_release` 证书/verify 0/42（口径不匹配，见 §1.3） |

---

## 6. 边界声明（防止把 Web/逻辑测试冒充桌面实机）

- 本节所有结论属于 **游戏逻辑与发布压力测试**，在 Release 构建产物已生成的前提下真实执行；**没有**使用 Debug 构建的 exe 结果，也**没有**把浏览器/几何签名测试当作桌面运行结果。
- 桌面 Tauri 可执行文件的**真实启动、安装、卸载、音乐播放、失败重开、退出**等，一律在第 5 步 `WINDOWS_DESKTOP_SMOKE_TEST.md` 单独判定；本节不替其作 PASS 宣称。
- 第 5 步未实际执行的项目将标 **NOT RUN**，最终验收矩阵会分别列出。

---

## 7. 本步判定

> **500 局 Release 测试：PASS**（500/500 生成成功、0 异常样本、六项检查全 PASS；附 `stress_release` 证书/verify 0/42 为工具口径不适用，已如实保留）
> **100 局专项回归：PASS**（问题 0 条、20/20 模板覆盖、窗口零重复）
