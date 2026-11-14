# Windows 桌面版发布验收 · 第 2 步：Release 构建报告

> 承接 `reports/WINDOWS_BUILD_ENV_AUDIT.md`。用户回复「继续」后，按环境审计的默认方案 **A 路径（本机 GNU，零源码改动）** 执行；**未修改 360 安全设置**、**未修改 4 个 HTML**、**未修改任何冻结源码**、**未提交/推送**。全部命令真实执行，完整日志保留在 `reports/windows-build-logs/`。

---

## 0. 基线

| 项目 | 值 |
|---|---|
| 基准 HEAD | `8a0c434ad1e4a4da2b906a5744105aeac883144a`（构建前后一致，未移动） |
| 执行日期 | 2026-11-14 10:28 – 10:45 GMT+8 |
| 构建路径 | **A · GNU**：`rustup run stable-x86_64-pc-windows-gnu cargo build --release --target x86_64-pc-windows-gnu`（项目 `tools/build_portable.mjs:51` 既定首选） |
| MSVC 路径 | 未使用（环境审计判定缺 VS Build Tools / Windows SDK / `link.exe`） |
| 环境变量（仅命令行，不落盘） | `PATH` 前置 `D:\tools\mingw\mingw64\bin` 与 Python 3.13.12 目录；`CARGO_TARGET_DIR=<root>\target-gnu` |
| 源码改动 | **无**（`git diff --stat HEAD -- src/ dist/` 在第 2 步结束时仅反映第 3 步重建的 dist 产物；`src/` 零改动） |
| 未提交的授权事项 | 360 白名单/临时停用（**未执行**）；4 个 HTML 重建（**未执行**） |

---

## 1. 完整命令序列与逐次真实结果

| # | 命令 | 环境 | 结果 | 日志 |
|---|---|---|---|---|
| 1 | `rustup run … cargo check --target x86_64-pc-windows-gnu -j 2` | Bash，未设 MinGW PATH | **EXIT=101 FAIL**：`error calling dlltool 'dlltool.exe': program not found` | `01_cargo_check_gnu.log` (2,031 B) |
| 2 | 同上 | Bash，`PATH="D:/tools/mingw/mingw64/bin:$PATH"` | **EXIT=101 FAIL**：同样 `dlltool.exe not found` | `02_cargo_check_gnu_with_mingw_path.log` (285 B) |
| 3 | 同上 | Bash，`PATH="/d/tools/mingw/mingw64/bin:$PATH"`（MSYS 格式） | **EXIT=101 FAIL**：`getrandom` build script `never executed` / `拒绝访问 (os error 5)` | `03_cargo_check_gnu_ok.log` (538 B) |
| 4 | 同上 | **原生 PowerShell**，纯反斜杠 `CARGO_TARGET_DIR` | **EXIT=101 FAIL**：`crossbeam-utils` build script `os error 5` | `04_cargo_check_powershell.log` (5,141 B) |
| 5 | **`rustup run … cargo build --release --target x86_64-pc-windows-gnu -j 2`** | 原生 PowerShell + MinGW PATH | **EXIT=0 PASS**，`Finished release profile in 1m 48s`，产出 `MahLeMah.exe` 16,305,152 B | `05_cargo_build_release_gnu.log` (856 B) |
| 6 | `npm run build:portable`（项目实际命令） | PowerShell，未含 Python 目录 | **EXIT=1 FAIL**：内部 cargo 成功（1.20s），但 `spawnSync('python')` 找不到解释器 → `[Portable] zip 打包失败` | `06_npm_build_portable.log` (1,031 B) |
| 7 | `npm run build:portable` 重跑 | PowerShell + Python 3.13.12 目录加入 PATH | **EXIT=0 PASS**：zip 生成，SHA256 `d2be478e…` | `07_npm_build_portable_retry.log` (1,268 B) |
| 8 | `npm run build:nsis` | 同上 | **EXIT=0 PASS**：Setup.exe 14.05 MB，SHA256 `67529672…` | `08_npm_build_nsis.log` (2,181 B) |
| 9 | `npm run release`（`tools/make_release.py`） | 同上 | **EXIT=0 PASS**：`SHA256SUMS.txt` 8 项重新生成 | `09_npm_release.log` (1,454 B) |
| 10 | **cargo check 增量重试 `-j 1`** | 原生 PowerShell + MinGW PATH | **EXIT=0 PASS**，`Finished dev profile in 2m 33s` | `10_cargo_check_retry.log` (3,548 B) |

> **所有日志均保留原件，未删除、未改写**。失败项不作 PASS 宣称；最终成功项是重新真实执行得到的，不是把失败改判。

---

## 2. 三次失败的根因与处理（全部为环境配置，非项目代码）

### 2.1 `dlltool.exe not found`（#1 / #2）
- 实测 `D:/tools/mingw/mingw64/bin/dlltool.exe` **存在**，`dlltool.exe --version` 在正确 PATH 下输出 GNU Binutils 2.47。
- 根因：Git Bash 中 `export PATH="D:/tools/mingw/mingw64/bin:$PATH"` 的**盘符冒号被当作 PATH 分隔符**，PATH 实际被拆成 `D` 与 `/tools/mingw/mingw64/bin`（`which dlltool.exe` 明确报错并打印了被拆坏的 PATH）。
- 处理：改用 MSYS 路径 `/d/tools/mingw/mingw64/bin`；`tools/build_portable.mjs:45` 本身用的是 Windows 分号格式 `env.PATH = mingw + ';' + env.PATH`，无此问题。
- **归属：环境 PATH 格式，非源码。**

### 2.2 `os error 5`（#3 / #4）
- 与历史 `reports/CARGO_CHECK_OUTPUT.txt` **完全一致**：Cargo 启动刚编译出的 build script 时 `could not execute process …\build-script-build (never executed)` → `拒绝访问。 (os error 5)`。
- 本轮新增诊断证据（PowerShell 只读）：
  - 失败文件 `target-gnu\debug\build\getrandom-…\build-script-build.exe` **确实存在**（5,238,253 B，10:30:51），`Attributes=Normal`，仅 `:$DATA` 流（**无 Zone.Identifier**）；
  - ACL 为 `Administrators:(F)` / `Authenticated Users:(M)` / `Users:(RX)` → 执行权限正常；
  - **同一个 exe 在原生 PowerShell 下直接调用成功**，输出 `cargo:rerun-if-changed=build.rs`；
  - 换用原生 PowerShell + 纯反斜杠目标目录后，**仍在另一个 crate（`crossbeam-utils`）复现** ⇒ 排除 MSYS 路径格式；
  - 环境审计已确认 360 主动防御 `ZhuDongFangYu` Running + 4 个 360 minifilter、Defender 停用。
- 结论：**第三方 HIPS 对构建目录内「新写入 exe 首次执行」的选择性/间歇性拦截**（CreateProcess 返回 `ERROR_ACCESS_DENIED`），不是 Rust 编译错误、不是 Tauri 配置错误、不是 ACL 问题。
- 佐证：**Release profile 首次构建即 EXIT=0**（增量缓存免于重新执行大量 build script）；**`cargo check` 增量重试（#10）EXIT=0**，说明拦截是间歇性的，重试即可完成，不需也不允许改系统安全设置。
- **归属：环境/系统安全策略，非项目代码。本轮未对 360 做任何修改。**

### 2.3 `zip 打包失败`（#6）
- `tools/build_portable.mjs:114` 用 `spawnSync('python', ['-c', 'import shutil; shutil.make_archive(...)'])`；PowerShell 会话的 PATH 中不含 WorkBuddy 注入的 Python 3.13.12（该路径只存在于 Bash PATH）。
- 处理：把 `D:\Users\Administrator\.workbuddy\binaries\python\versions\3.13.12` 前置到 PATH 后重跑（#7）成功；`Get-Command python` 确认解析到该目录的 `python.exe`，`python --version` = 3.13.14。
- **归属：环境 PATH，非源码。未修改 `build_portable.mjs`。**

---

## 3. 链接器警告（如实记录，非编译错误）

`cargo build --release` 与 `npm run build:portable` 均输出：
```
warning: linker stderr: D:/tools/mingw/mingw64/bin/.../ld.exe: .rsrc merge failure: multiple non-default manifests
  = note: `#[warn(linker_messages)]` on by default
warning: `mah-le-mah` (bin "MahLeMah") generated 1 warning
    Finished `release` profile [optimized] target(s) in 1m 48s
```
- 这是 MinGW `ld` 在合并 Windows 资源（manifest）时的警告，**构建仍 EXIT=0**，历史上 `.build/build_portable_final.log` 也有同类 `#[warn(linker_messages)]`。
- **潜在风险**：应用清单（DPI 感知 / 执行级别）可能不是预期版本，需在第 5 步实机验收中观察窗口显示与启动行为。本轮**未修改** `build.rs` / `Cargo.toml` / 资源文件来消除警告（属无关重构，且需另行授权）。

---

## 4. 最终构建结果

| 项目 | 结果 |
|---|---|
| `cargo check --target x86_64-pc-windows-gnu` | **PASS**（#10，EXIT=0，2m33s；前 4 次环境失败日志保留） |
| `cargo build --release --target x86_64-pc-windows-gnu` | **PASS**（#5，EXIT=0，1m48s） |
| 项目实际命令 `npm run build:portable` | **PASS**（#7，EXIT=0；#6 环境失败日志保留） |
| 项目实际命令 `npm run build:nsis` | **PASS**（#8，EXIT=0） |
| `npm run release`（SHA256SUMS） | **PASS**（#9，EXIT=0） |
| 原生 exe | `target-gnu/x86_64-pc-windows-gnu/release/MahLeMah.exe`，16,305,152 B，2026-11-14 10:38:33，SHA256 `55ccfc481323daa79216f7fc90b9faf2849dc7a1fd13a941f8e622d1d1e92c55` |
| 与便携目录内 exe 一致性 | **哈希完全相同**（`55ccfc48…`） |
| PE 架构 | `MZ` + `machine=0x8664`（amd64 64 位），Setup.exe / MahLeMah.exe 均为 64 位 |
| 编译警告 | 1 条 linker manifest 警告（见 §3），**0 编译错误** |

---

## 5. 冻结保护与执行纪律

| 约束 | 状态 |
|---|---|
| 第一关 / 第二关模板与生成逻辑 / 三阶段保真 / 最近 10 局去重 / 音乐场景 | ✅ 零改动 |
| 禁止修改 `src/` | ✅ `src/` 零改动；仅构建产物落在 `target-gnu/`（被 `.gitignore` 忽略） |
| 禁止修改 4 个 HTML | ✅ 构建前后哈希不变：`aa3d28f6…`（3 个 modern）、`3f101399…`（legacy） |
| 禁止删除历史证据 | ✅ 10 份日志全部保留；旧 3 个发布产物与 54 个报告/数据文件已备份到 `reports/windows-release-backup/` |
| 禁止绕过编译错误 | ✅ 未跳过 build script、未预置伪造产物、未复用旧 exe；全部失败如实记录 |
| 禁止自动提交 / 推送 | ✅ HEAD 未移动 |
| `os error 5` 处理 | ✅ **未修改 360 任何设置**；通过增量重试得到真实 EXIT=0 |

---

## 6. 本步判定

> **Cargo check / Cargo build --release / 项目实际桌面构建命令：PASS**
> （附：首次尝试中 4 次 `cargo check` 与 1 次 `build:portable` 因环境 PATH / 第三方 HIPS 失败，均为真实记录；最终成功均由重新真实执行获得，非改判。链接器 manifest 警告列为待实机观察风险。）

**下一步**：第 3 步发布产物重建（`reports/WINDOWS_RELEASE_ARTIFACTS.md`）→ 第 4 步 Release 测试 → 第 5 步实机验收 → 第 6 步版本一致性 → 最终验收报告。
