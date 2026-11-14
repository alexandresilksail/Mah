# Windows 桌面版最终发布验收报告

> 基准 HEAD `8a0c434ad1e4a4da2b906a5744105aeac883144a` · 生成时间 2026-11-14 13:54:38 
> 本报告仅汇总前序各报告的真实执行结果，未重新计算任何未执行数据。

## 1. 验收矩阵

| 项目 | 判定 | 依据 | 报告 |
|---|---|---|---|
| Windows 构建环境 | **FAIL** | MSVC/Windows SDK/`link.exe` 缺失（环境配置），GNU 备用链路可用；360 主动防御间歇拦截 | `WINDOWS_BUILD_ENV_AUDIT.md` |
| Cargo 及桌面 Release 构建 | **PASS** | `cargo build --release` EXIT=0；`cargo check` 增量重试 EXIT=0；`build:portable`/`build:nsis`/`release` 全成功 | `WINDOWS_RELEASE_BUILD_REPORT.md` |
| Setup.exe | **PASS** | 本轮重建 14,733,015 B，PE amd64，静默安装 ExitCode=0 | `WINDOWS_RELEASE_ARTIFACTS.md` |
| Portable.zip | **PASS** | 本轮重建 14,703,556 B，CRC/testzip 通过，新旧哈希不同 | `WINDOWS_RELEASE_ARTIFACTS.md` |
| SHA256 校验 | **PASS** | `sha256sum -c` 退出码 0 | `RELEASE_VERSION_CONSISTENCY.md` |
| 500 局 Release 测试 | **PASS** | `stress_release --seeds 42` 504 局 + `windows_release_500.mjs` 500 局专项（修正采样后 PASS） | `WINDOWS_RELEASE_TEST_REPORT.md` |
| 100 局专项回归 | **PASS** | `l2_100_games` 100 局：20 套全用到、最近 10 局模板零重复 | `WINDOWS_RELEASE_TEST_REPORT.md` |
| 桌面实机运行 | **PASS** | Portable.zip 解压后独立启动，真实桌面窗口渲染标题页（`04_portable_run.png`/`05_portable_title.png`），真实鼠标点击被应用接收；安装版窗口截图 NOT RUN | `WINDOWS_DESKTOP_SMOKE_TEST.md` |
| 安装与卸载 | **PASS** | 静默安装/卸载/重装真实执行，注册表与目录状态取证 | `WINDOWS_DESKTOP_SMOKE_TEST.md` |
| 音乐播放 | **NOT RUN** | 无实机音频回采，未执行；不得用 Web 模拟测试代替 | — |
| 版本一致性 | **NOT RUN / 未完成** | 4 个 HTML 内嵌 `buildVersion` 比 HEAD 滞后一提交，按限制未重建 | `RELEASE_VERSION_CONSISTENCY.md` |

## 2. 测试执行摘要（真实日志）

```
[01_stress_release_504] EXIT=0
[02_l2_100_games] EXIT=0
[03_test_l2_templates] EXIT=0
[04_test_l1_frozen] EXIT=0
[07_test_js] EXIT=0
[08_test_random_generation] EXIT=0
[09_test_layout_position] EXIT=0
[10_test_build_consistency] EXIT=0
```

500 局专项验收日志尾部：

```
============================================================================
 Windows Release · 500 局生成专项  (HEAD 8a0c434)
============================================================================
 生成成功 500/500 · 抛错 0 · validateLevel 失败 0
 三段保真：checkFidelity 失败 0 · verifyTemplateFidelity 失败 0
 布局异常：牌数 0 · 坐标 0 · 重复ID 0 · 悬空 0 · 可点越界 0
 第一关冻结漂移 0 · L1 100 局 / L2 400 局
 覆盖：模板 20/20 · 档位 10/10 · 牌数 24-321 · 开局可点(全) 14-25 / (L2) 19-25
 异常样本 0 条
 耗时 3.03s · 判定 PASS
 报告：reports/windows-release-test-logs/500_game_validation.json
============================================================================
```

## 3. 遗留风险

- **Tauri 桌面真机 GUI 内验收未完成**：两关实际游玩、布局目视、失败重开未执行（NOT RUN）。已真实验证 `WM_CLOSE` 正常退出（进程终止），菜单退出路径未验证。
- **音乐播放与切换未实机验证**（仅有历史 Web 模拟 69/0 与真实音频 54/54 的浏览器侧证据）。
- **DOM 降级路径 / 真实触屏 pointer 事件**未执行。
- **牌面花色逐像素模板匹配**未执行（第二阶段仅验证牌体轮廓/位置/相位）。
- **Windows 构建环境不完整**：无 MSVC/SDK，依赖 MinGW GNU 链路；`os error 5` 由第三方防护间歇触发，本轮通过增量重试绕过，但环境本身未修复。
- **版本漂移**：4 个 HTML 内嵌构建版本号滞后 HEAD 一提交。

## 4. 最终结论

**NOT READY**

判定理由：Release 构建、发布产物、SHA256 校验、500 局与 100 局 Release 测试均已真实通过；但音乐播放、版本一致性未完成，桌面 GUI 交互仅验证到标题页（点击未进入第一关/第二关），且构建环境存在未修复的 MSVC 缺失与间歇性 `os error 5`。**浏览器端视觉审计通过不等于 Windows 桌面版通过**。

三层区分：① 第二关核心几何与浏览器视觉验收 → PASS（前序阶段）；② 本轮 Windows Release 构建与自动化测试 → PASS；③ Windows 桌面发布验收 → **NOT READY**。

解除条件：补齐桌面 GUI 实机验收（含音乐）、授权统一重建 4 个 HTML 使 `buildVersion` 对齐 HEAD、修复或规避构建环境拦截，并将全部 NOT RUN 项转为真实执行后重新出具本报告。



## 5. 补充取证后的判定校正（2026-11-14 13:56:34 ）

- 「安装与卸载」由 **FAIL** 校正为 **PASS**：卸载 `returncode=0` 且注册表项移除，重装成功；目录残留 `MahLeMah_Data` 为用户数据保留，非失败。
- 「桌面实机运行」保持 **PASS**，依据收紧为：**Portable.zip 解压后独立启动 + 真实桌面窗口渲染标题页 + 真实鼠标点击**（`04_portable_run.png` / `05_portable_title.png` / `06_portable_after_click.png`），而非浏览器或几何签名。
- 「安装版窗口恢复截图」为 **NOT RUN**（进程在会话中断期间退出，取证条件消失）。
- 其余 NOT RUN 项（两关完整游玩、音乐播放与切换、失败重开、真实触屏、版本统一）**不变**。

最终结论仍为 **NOT READY**：存在明确 FAIL 项（Windows 构建环境缺 MSVC/SDK/`link.exe`）与多项 NOT RUN（音乐、桌面 GUI 交互深度、版本一致性）。已完成的桌面真机取证只证明「可安装、可卸载/重装、可独立启动并渲染」，不足以支撑 READY FOR RELEASE。

## 6. 点击取证口径更正（重要）

`06_portable_after_click.png` 显示点击后**仍停留在标题页**，「开始游戏」按钮依旧可见，未进入第一关牌桌。
画面变化仅为提示文案由「点击任意处开启音效与背景音乐」变为「背景音乐已内置·按场景自动切换」，
证明真实鼠标输入被应用接收（音频解锁已触发），但**点击坐标未命中按钮的激活区域**。
因此：

- **不得**把该项表述为「第一关运行通过」；两关游玩、布局目视、失败重开一律 **NOT RUN**。
- 音频文案变化仅为状态提示，**不等于音乐实际播放已验证**，「音乐播放」仍为 **NOT RUN**。
- 桌面实机运行的 PASS 仅覆盖：安装/卸载/重装、独立启动、真实桌面窗口渲染、输入被接收、`WM_CLOSE` 正常退出。
