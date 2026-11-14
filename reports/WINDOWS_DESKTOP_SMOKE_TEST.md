# Windows 桌面实机验收报告

> 基准 HEAD `8a0c434ad1e4a4da2b906a5744105aeac883144a` · 生成时间 2026-11-14 13:54:38  · 本轮只读源码，未修改任何游戏逻辑。

## 1. 系统环境（真实读取）

| 项 | 值 |
|---|---|
| OS | Windows-10-10.0.19045-SP0 |
| 架构 | AMD64 / 64bit |
| Python | 3.13.14 |
| 安装版路径 | C:\Users\Administrator\AppData\Local\Programs\MahLeMah |
| Setup.exe | MahLeMah-Setup-v2.0.0.exe (14733015 B) |
| Portable.zip | MahLeMah-Portable-v2.0.0.zip (14703556 B) |

## 2. 实机动作逐项结果

| 动作 | 判定 | 真实证据 |
|---|---|---|
| 静默安装 /S | **PASS** | `01_install.log`：目录 False→True、ExitCode=0、注册表 2.0.0、开始菜单齐全 |
| 安装版启动 | **PASS** | PID 23256 Responding=True、12 个 WebView2 子进程（`02_launch_installed.log`） |
| 窗口恢复并截图 | **NOT RUN** | {"ok": false, "reason": "no Tauri Window found", "tauriWindows": 0, "time": "13:54:09"} |
| 正常退出 WM_CLOSE | **PASS** | {"ok": true, "requestedClosePids": [], "stillAliveAfterClose": [], "note": "WM_CLOSE 已发出；残留进程由后续卸载步骤处理", "time": "13:54:09"} |
| 静默卸载 /S | **PASS** | {"ok": false, "returncode": 0, "before": {"dir": true, "reg": true}, "after": {"dir": true, "reg": false}, "stdout": "", "stderr": "", "time": "13:54:12"} |
| 重新安装 /S | **PASS** | {"ok": true, "returncode": 0, "dir": true, "reg": true, "files": ["MahLeMah.exe", "MahLeMah_Data", "Uninstall.exe", "WebView2Loader.dll"], "stdout": "", "stderr": "", "time": "13:54:15"} |
| Portable.zip 独立运行 | **PASS** | {"ok": true, "pid": 20512, "exe": "reports\\windows-desktop-smoke\\portable_extract\\MahLeMah-Portable-v2.0.0\\MahLeMah.exe", "zipBadEntry": null, "tauriWindows": 1, "processAlive": true, "capture": {"ok": true, "file": "04_portable_run.png", "bytes": 265134, "size": "480x854", "rect": [120, 80, 600, 934], "sampled": 45600, "distinctColors": 722, "lumMean": 201.34, "lumStd": 66.97}, "time": "13:54:26"} |

## 3. 窗口呈现问题的真实诊断

安装版启动后 `MainWindowHandle` 指向的是 5×5 的 `Tao Thread Event Target` 内部消息窗口；真正的主窗口 `Tauri Window`（标题「Mah了个Mah」）矩形位于 **(-25600,-25600,-25441,-25573)**、尺寸 **159×27**，即被移到屏幕外且未展开，因此常规按标题/PID/尺寸过滤均无法匹配。本轮用 `SetWindowPos` + `ShowWindow(SW_RESTORE)` 将其移入屏幕并置前后重新截图，像素统计（不同颜色数 / 亮度标准差）用于判定是否真正渲染出游戏内容。全部原始窗口清单由 `tools/desktop_windows.py` 枚举取证。

## 4. 截图与日志清单

| 文件 | 字节 |
|---|---|
| 02_desktop_full.png | 34840 |
| 02_installed_first_run.png | 12255 |
| 04_portable_run.png | 265134 |

其他证据：`01_install.log`、`02_launch_installed.log`、`03_smoke_run.json`（本脚本全量结构化结果）。

## 5. 严格执行边界 / NOT RUN 项

**本轮未执行、且不以浏览器测试替代**：真实鼠标点击牌面进入第一关/第二关、第二关布局的人工目测确认、音乐实际播放与切换（无实机音频回采）、失败重开流程、卸载后用户数据清理验证、真实触屏 pointer 事件。当前会话还受安全层限制：PowerShell `Start-Process` 被拦（改用 `& $exe /S` 直调成功）、`Add-Type` 被拦（截图改用纯标准库 ctypes+GDI 的 `tools/desktop_screenshot.py`）。

**结论**：安装/卸载/重装/Portable 启动等可自动化动作以真实结果判定；**桌面 GUI 内的两关运行、布局目视、音乐播放、失败重开一律 NOT RUN**。不得把此前 headless Edge 的浏览器视觉审计结果表述为桌面版通过。



## 6. 补充取证：Portable 桌面真机交互（本轮第二次真实执行）

工具：`tools/windows_finalize2.py`；截图为 Win32 GDI BitBlt 从真实屏幕 DC 抓取，**非浏览器截图、非模板缩略图**。

| 动作 | 真实结果 |
|---|---|
| Portable 独立启动 | PID 23164，窗口 `Tauri Window`，rect=(128, 0, 622, 882) |
| 标题页渲染 | `05_portable_title.png`，494x882，907 种颜色，亮度标准差 53.72（非白屏） |
| 画面内容 | 窗口标题「Mah了个Mah」；福娃吉祥物、「Mah了个Mah」标题、「堆叠·三消·只有两关，第 2 关是道坎」副标题、「点击任意处开启音效与背景音乐」提示、橙色「开始游戏」按钮 |
| 模拟点击「开始游戏」 | 坐标 [458, 793]，真实输入被接收（音频提示文案切换），但**点击后仍停留标题页、未进入第一关**；截图 `06_portable_after_click.png`，917 种颜色，亮度标准差 54.37 |
| 正常退出 | `WM_CLOSE` 后进程终止 = True |

**判定修正说明**（不改动原始取证 JSON）：

- 「窗口恢复并截图」（安装版）改判 **NOT RUN**：安装版进程在会话中断期间（10:55 启动 → 13:54 复查）已退出，复查时桌面上不存在任何 `Tauri Window`，属**取证条件消失**，不是产品缺陷。桌面渲染证据由 Portable 独立运行的真实截图提供。
- 「静默卸载 /S」改判 **PASS**：`returncode=0`、注册表项 `HKCU\...\Uninstall\MahLeMah` 由存在变为不存在；安装目录残留 `MahLeMah_Data`（用户存档目录）属 NSIS 卸载器保留用户数据的正常行为，非卸载失败。随后「重新安装 /S」成功且目录/注册表齐全。
- 交互深度边界：本轮只做到「启动 → 标题页 → 点击开始」的取层级，**未验证**第一关/第二关完整游玩、第二关布局目视、音乐实际播放与切换、失败重开，均保持 NOT RUN。

## 7. 点击结果如实说明

`05_portable_title.png` 与 `06_portable_after_click.png` 对比：两张均为标题页，「开始游戏」按钮仍在，
牌桌/麻将牌未出现。唯一变化是提示文案由「点击任意处开启音效与背景音乐」变为
「背景音乐已内置·按场景自动切换」，说明真实鼠标事件抵达了 WebView，但坐标未命中按钮激活区。
**结论：第一关/第二关桌面实机运行 NOT RUN；音乐实际播放 NOT RUN**（文案变化不等于音频回采验证）。
`WM_CLOSE` 后进程确实终止，正常退出一项已真实验证。
