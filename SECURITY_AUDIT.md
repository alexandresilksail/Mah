# 安全审计报告 · Mah 了个 Mah v2.0.0

> 审计对象：桌面端 Rust 存档接口、Tauri 权限模型、前端能力面、数据保留策略。
> 结论：**没有发现可利用的高危漏洞**；以下为逐项核查与保留的主动加固。

## 1. 存档接口（`src-tauri/src/main.rs`）

`save_state(data: String)` 是本次重点加固对象，全部要求已落地：

| 要求 | 实现 | 核查 |
|---|---|---|
| 输入大小上限 64 KB | `MAX_SAVE_BYTES = 64*1024`，超长直接拒绝 | ✓ |
| 验证 JSON 合法性 | `serde_json::from_str` 失败即拒 | ✓ |
| 版本号校验 | `v` 必须为整数且 ∈ {1, 2}（v1 旧档兼容，v2 当前） | ✓ |
| 字段白名单 | `SAVE_FIELDS = [v, level, best, sound, sfxVol, music, musicVol]`，未知字段一律拒绝 | ✓ |
| 类型/范围检查 | level/best 非负整数且 ≤上限；sound/music 布尔；sfxVol/musicVol ∈ [0,1] | ✓ |
| 原子写入 | 先写 `save.json.tmp` 再 `rename`，避免断电/崩溃损坏存档 | ✓ |
| 禁止前端指定路径 | 保存路径固定为 `<exe 同级>/MahLeMah_Data/save.json`，`data` 参数只承载内容 | ✓ |

- `load_state` 同样跑 `validate_save_json`，损坏/异常存档视作无存档，不把脏数据喂给游戏。
- `reset_state` 只删除 `save.json` / `save.json.tmp`，不触碰其他文件。
- 4 个 IPC 命令全部白名单化：`load_state` / `save_state` / `reset_state` / `data_dir_path`。

## 2. Tauri 权限模型（`src-tauri/capabilities/default.json`）

- **不注册 `tauri-plugin-fs`**：前端没有任何文件系统 capability（无读/写/删除任意路径的权限）。
- 能力面仅 `core:default` + 上述 4 个本地白名单命令。
- **未引入任何文件删除权限**，未注册自删除 / 系统命令调用权限。

## 3. 自删除 / 系统命令（已彻底移除）

- 已删除 `uninstall_app` 命令与 `schedule_self_delete()` 逻辑（旧版游戏内自删除、启动分离 cmd 删 exe）。
- 前端（`src/main.js` / `src/game/store.js`）不再调用任何自删除 IPC；卸载完全交给 NSIS 安装器生成的 `Uninstall.exe`。
- 静态验收（`test.js`）：源码中无 `uninstall_app|schedule_self_delete|invoke('uninstall_app')` 残留。

## 4. 注册表与系统目录

- 游戏运行时**不读写** `HKLM` / `HKCU`（连 WebView2 是否安装都不查注册表，改为启动失败时弹原生 MessageBox）。
- 存档与 WebView2 缓存全部落在 `<exe 同级>/MahLeMah_Data`，未写 `%APPDATA%` / `%LOCALAPPDATA%`。
- NSIS 安装器写入的 `HKCU\...\Uninstall\MahLeMah` 是**安装程序的规范行为**（提供"设置→应用"卸载入口），
  与游戏运行时无关；卸载时由安装器清理。

## 5. 用户数据保留策略（明确）

- **便携版**：删整个解压目录即净；保留存档需先备份 `MahLeMah_Data`。
- **安装版**：标准卸载流程 + 卸载确认；**默认保留存档**（`/SD IDNO` 静默卸载默认选"否"）。
  已真实验证：植入假存档后静默卸载，存档保留、程序文件清除。
- 游戏内不提供任何文件删除能力。

## 6. 供应链 / 构建

- 64 位 makensis（negrutiu/nsis）经 `tools/build_nsis.mjs` 自动下载并静默安装；脚本校验产物存在性，
  下载失败有明确报错，不静默跳过。
- 原生 exe 用 `opt-level="z"` + `lto` + `strip` + `panic="abort"` 构建，已 strip 符号。
- 仓库无外部二进制依赖（WebView2Loader.dll 由 Tauri 构建链随 exe 产出，随附分发）。

## 7. 残留风险与建议
- 未签名程序在 SmartScreen / 杀软下会被提示"未知发布者"——属正常，非漏洞；如要消除需代码签名证书（不在本仓库范围）。
- 存档明文 JSON 未加密：内容为进度/音量，无敏感信息；如后续加入账号等敏感数据，应改为加密存储。
