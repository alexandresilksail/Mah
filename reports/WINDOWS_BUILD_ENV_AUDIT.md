# Windows 桌面版发布验收 · 第 1 步：Windows 构建环境只读审计

> **本阶段状态：已完成，已暂停。** 本轮**只执行只读环境检查**，未运行 `cargo check` / `cargo build` / `npm run build` / 任何 Release 测试 / 任何安装卸载操作，未修改任何源码、产物或配置，未提交、未推送。后续构建阶段须等待用户明确确认后启动。

---

## 0. 审计元信息

| 项目 | 值 |
|---|---|
| 基准 HEAD | `8a0c434ad1e4a4da2b906a5744105aeac883144a` |
| 审计开始时间 | 2026-11-13 23:40 GMT+8 |
| 报告生成时间 | 2026-11-13 23:47 GMT+8（`date '+%Y-%m-%d %H:%M:%S %z'` = `2026-11-13 23:47:14 +0800`） |
| 审计模式 | **只读**（Bash / PowerShell 只读查询 + 真实文件读取） |
| 审计范围 | Windows / Rust / Cargo / rustup / MSVC / Windows SDK / `link.exe` / Tauri / Node / MinGW / NSIS / WebView2 / 系统安全策略 / 发布产物现状 |
| 冻结保护 | `src/`、`dist/`、4 个 HTML、第一关、第二关模板与保真机制、音乐与场景：**零改动** |
| 本轮新增文件 | 仅本报告 `reports/WINDOWS_BUILD_ENV_AUDIT.md` |
| 未执行（NOT RUN） | 第 2～6 阶段全部构建、产物重建、Release 测试、实机验收、版本一致性正式判定 |

**HEAD 现场确认**：
```
8a0c434ad1e4a4da2b906a5744105aeac883144a
8a0c434 @ audit(l2): 修复保真校验相位漏检 + 重建产物 + 同步审计与验收报告
```
`git diff --stat HEAD -- src/ dist/ tools/ package.json src-tauri/` → **空**（无改动）。

---

## 1. 环境审计结论速览

| # | 检查项 | 判定 | 关键证据 |
|---|---|---|---|
| E-01 | Windows 操作系统 | **PASS** | Windows 10 专业版 `10.0.19045`，64 位，当前用户 Administrator 且 `IsAdmin=True` |
| E-02 | CPU / 内存 / 磁盘余量 | **PASS（有余量提示）** | i5-8265U / 11.85 GB RAM / C: 14.29 GB 可用、D: 53.62 GB 可用 |
| E-03 | Rust / Cargo / rustup | **PASS** | `rustc 1.99.1`、`cargo 1.99.1`、`rustup 1.29.3`；host `x86_64-pc-windows-msvc` |
| E-04 | rustup 工具链与目标 | **PASS** | `stable-x86_64-pc-windows-gnu` + `stable-x86_64-pc-windows-msvc`（默认），双 target 均已安装 |
| E-05 | MSVC Build Tools / Visual Studio | **FAIL（环境缺失）** | 无任何 VS / BuildTools 安装目录，`vswhere.exe` 不存在，`cl.exe` / `rc.exe` / `mt.exe` 均不在 PATH |
| E-06 | Windows SDK | **FAIL（环境缺失）** | `Windows Kits\Installed Roots` 注册表键不存在；`Windows Kits\10\bin` 及所有常见路径均不存在 |
| E-07 | MSVC `link.exe` | **FAIL（环境缺失）** | `Get-Command link.exe` = NOT FOUND；`LIB` / `INCLUDE` / `VCINSTALLDIR` / `VCToolsInstallDir` / `WindowsSdkDir` 全部 unset |
| E-08 | Git Bash GNU `link` 遮蔽 | **FAIL（叠加风险，有实证）** | `/usr/bin/link` = GNU coreutils 8.32（创建硬链接工具）；`.build/cargo_warm.log` 记录 `link: extra operand ... Try 'link --help'` |
| E-09 | MinGW-w64 GNU 备用工具链 | **PASS** | `D:/tools/mingw/mingw64/bin/` 下 `gcc.exe` / `ar.exe` / `ld.exe` 全在；gcc 16.2.0、GNU ld 2.47，实机 `--version` 执行成功 |
| E-10 | 项目 GNU 构建配置 | **PASS** | `src-tauri/.cargo/config.toml` 已为 `x86_64-pc-windows-gnu` 指定 MinGW linker/ar；`tools/build_portable.mjs:51` 首选 GNU 命令 |
| E-11 | GNU 目标历史 Release 构建能力 | **PASS（历史证据，非本轮执行）** | `.build/build_portable_final.log`：`Finished release profile in 3.50s`，产出 `MahLeMah.exe` 2.85 MB 与 Portable zip；`.build/build_nsis_final.log` 产出 Setup.exe 1.23 MB |
| E-12 | Node / npm | **PASS** | `v22.22.2` / `10.9.7` |
| E-13 | Tauri CLI | **PASS** | `@tauri-apps/cli` 2.12.4；native addon `cli-win32-x64-msvc/cli.win32-x64-msvc.node` 存在；`tauri.conf.json` 2.x 配置完整 |
| E-14 | NSIS amd64 `makensis` | **PASS** | `.build/nsis64/Bin/makensis.exe`（1,051,648 B）已缓存，第 3 阶段无需联网下载 |
| E-15 | WebView2 Runtime（桌面运行依赖） | **PASS** | 注册表 `EdgeUpdate\Clients\{F3017226-...}` → `pv=157.0.4341.46` |
| E-16 | 系统安全策略（第三方 HIPS） | **FAIL（阻断风险）** | 360 主动防御 `ZhuDongFangYu` Running、`360rp` Running；minifilter `360FsFlt` / `360Box64` / `360AvFlt` / `360AntiSteal` 全部加载；`WinDefend` Stopped |
| E-17 | `cargo check` | **NOT RUN** | 本轮纪律：先完成只读环境审计并暂停 |
| E-18 | `cargo build --release` | **NOT RUN** | 同上 |
| E-19 | 桌面产物重建 / Release 测试 / 实机验收 | **NOT RUN** | 第 3～5 阶段任务 |

> **总体判定**：**默认 MSVC Release 构建环境不满足（FAIL）；项目既定的 GNU Release 构建路径具备基础条件，但存在 `os error 5` 复现风险。** 两者都属**环境/系统策略问题**，不是项目代码问题（详见第 3 节）。

---

## 2. 逐项真实取证

### 2.1 Windows / 硬件 / 权限（PowerShell 只读）

```
Microsoft Windows 10 专业版 · Version 10.0.19045 · 64 位
IsAdmin = True · PowerShell 5.1.19041.6456 · CPU Intel i5-8265U · RAM 11.85 GB
C: free=14.29GB  D: free=53.62GB
TEMP = C:\Users\ADMINI~1\AppData\Local\Temp
PROCESSOR_ARCHITECTURE = AMD64
```
`EnableSmartScreen = 0`（`HKLM:\SOFTWARE\Policies\Microsoft\Windows\System`）；`SRPV2` / `AppLocker` 策略键均不存在 → **无域级软件限制策略**。

### 2.2 Rust / Cargo / Node（Bash 只读）

```
rustc 1.99.1 (58cf8f9c3 2026-10-13)      host: x86_64-pc-windows-msvc
cargo 1.99.1 (5f94df478 2026-08-27)      LLVM 23.1.1
rustup 1.29.3
installed toolchains : stable-x86_64-pc-windows-gnu / stable-x86_64-pc-windows-msvc (active, default)
installed targets    : x86_64-pc-windows-gnu / x86_64-pc-windows-msvc
node v22.22.2 · npm 10.9.7
```

`package.json` 中与实际桌面发布相关的脚本（只读引用）：
```
"build:portable": "node tools/build_portable.mjs"
"build:nsis":     "node tools/build_nsis.mjs"
"build":          "npm run build:portable && npm run build:nsis"
"release":        "python tools/make_release.py"
"test:release":   "node tools/stress_release.mjs"
"build:desktop":  "tauri build"
```
> **重要**：项目文档（`README.md:306-308, 391, 402`）与脚本表明，**实际发布构建命令是 `npm run build`（Portable → NSIS）**，其中 `tools/build_portable.mjs` 调用 `cargo build --release --target x86_64-pc-windows-gnu`；`npm run build:desktop`（`tauri build`）是另一条未在本项目发布记录中使用的路径。`tools/make_release.py:78-84` 负责生成 `SHA256SUMS.txt`。

### 2.3 MSVC / Windows SDK / link.exe（PowerShell 只读）

```
link.exe on PATH      : NOT FOUND
cl.exe / rc.exe / mt.exe / vswhere.exe / dumpbin.exe : 全部 NOT FOUND
Visual Studio 安装目录 : 无（Program Files / Program Files (x86) / C:\BuildTools 均无）
vswhere -all          : vswhere.exe NOT FOUND
Windows Kits 注册表   : HKLM\SOFTWARE\Microsoft\Windows Kits\Installed Roots 不存在（WOW6432Node 亦无）
Windows Kits\10\bin   : NOT FOUND
MSVC toolset 目录     : 无
LIB / INCLUDE / VCINSTALLDIR / VCToolsInstallDir / WindowsSdkDir / WindowsSDKVersion / VSINSTALLDIR : 全部 (unset)
PATH 中含 MSVC / Windows Kits 的项 : 无
```

**GNU `link` 遮蔽实证**（`which -a link`）：
```
/usr/bin/link
/d/Users/Administrator/.workbuddy/binaries/PortableGit/versions/1.3.0/usr/bin/link
link (GNU coreutils) 8.32
```
`.build/cargo_warm.log`（历史失败日志，真实读取）关键行：
```
error: linking with `link.exe` failed: exit code: 1
  = note: "link.exe" "/NOLOGO" ... "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-msvc\\lib/{libstd-*,...}"
  = note: link: extra operand 'D:\\...\\build_script_build-3a775daef86c2edf\\...rcgu.o'
          Try 'link --help' for more information.
error: could not compile `icu_properties_data` (build script) due to 1 previous error
```
即 rustc 请求 `link.exe` 时，Git Bash 的 PATH 把 `/usr/bin/link`（GNU 硬链接工具）排在前面，MSVC 链接器命令被 GNU 工具接管并因参数不符报错。

### 2.4 GNU 备用工具链与项目配置（只读）

```
D:/tools/mingw/mingw64/bin/gcc.exe  2,407,950 B  FOUND
D:/tools/mingw/mingw64/bin/ar.exe   1,195,534 B  FOUND
D:/tools/mingw/mingw64/bin/ld.exe   1,823,758 B  FOUND
gcc.exe (MinGW-W64 x86_64-ucrt-posix-seh) 16.2.0
GNU ld (Binutils for MinGW-W64) 2.47.20260726
```
`src-tauri/.cargo/config.toml`（原文，未修改）：
```toml
# 本机没有 MSVC Build Tools（无法提权安装），改用 GNU 工具链交叉编译验证。
# 正式发布建议在装有 VS2022 Build Tools 的机器上直接用默认 msvc 目标构建，
[target.x86_64-pc-windows-gnu]
linker = "D:/tools/mingw/mingw64/bin/gcc.exe"
ar = "D:/tools/mingw/mingw64/bin/ar.exe"
```
`tools/build_portable.mjs:44-56` 的候选构建顺序（原文要点，未修改）：
```js
env.CARGO_TARGET_DIR = join(ROOT, 'target-gnu');
const attempts = [
  ['rustup', ['run','stable-x86_64-pc-windows-gnu','cargo','build','--release','--target','x86_64-pc-windows-gnu','-j','2'], env],
  ['cargo', ['build','--release'], { ...process.env }],
];
```
> 该配置是项目**既有**规避方案，本轮未改动任何一行。

### 2.5 历史 GNU 构建成功证据（只读读取日志，非本轮执行）

`.build/build_portable_final.log`：
```
Finished `release` profile [optimized] target(s) in 3.50s
exe: ...\target-gnu\x86_64-pc-windows-gnu\release\MahLeMah.exe (2.85 MB)
[Portable] 完成: dist\MahLeMah-Portable-v2.0.0.zip
SHA256: 2f6bd9a64112136ac567819c0145ef5470cf8b9874bdc4f06ddeae21431c2458
```
`.build/build_nsis_final.log`：
```
[NSIS] 完成: dist\MahLeMah-Setup-v2.0.0.exe (1.23 MB)
SHA256: 13faa1457b4c8ae745d7ffdbaa703d6c58a317ed0c812d989eb305afef76cb64
```
现存 exe：`target-gnu/x86_64-pc-windows-gnu/release/MahLeMah.exe` 与 `dist/MahLeMah-Portable-v2.0.0/MahLeMah.exe`，均 **2,978,816 B / 2026-11-10 20:39:08**（早于 HEAD，**不得沿用为本轮验收结果**）。

> 该节证明 **项目 Rust/Tauri 源码在本机 GNU 工具链下曾成功完成 Release 链接与打包**，从反面佐证「缺 link.exe / os error 5」不是源码编译错误。但这**不是本轮构建结果**，不计入任何 PASS。

### 2.6 Tauri / NSIS / WebView2（只读）

```
@tauri-apps/cli                 2.12.4
node_modules/.bin/tauri.cmd     存在，指向 @tauri-apps/cli/tauri.js
native addon                    cli-win32-x64-msvc/cli.win32-x64-msvc.node 存在
tauri.conf.json                 productName「Mah了个Mah」/ mainBinaryName MahLeMah / version 2.0.0 / bundle.targets=["nsis"]
.build/nsis64/Bin/makensis.exe 1,051,648 B 存在（tools/build_nsis.mjs:32-33 的缓存路径）
WebView2 Runtime               pv=157.0.4341.46
```

### 2.7 系统安全策略（PowerShell 只读）

```
360rp          | Running | 360 杀毒实时防护加载服务
ZhuDongFangYu  | Running | 主动防御
WinDefend      | Stopped (Manual)      WdNisSvc | Stopped (Manual)      MpsSvc | Running
minifilter : 360AntiSteal / 360Box64 / 360FsFlt / 360AvFlt（均 5 实例，全部加载）
Get-MpComputerStatus : AntivirusEnabled = False
Get-MpPreference     : 0x800106ba（Defender 服务不可用）
```
NTFS ACL（`icacls src-tauri\target\debug`，只读）：
```
BUILTIN\Administrators:(I)(F) / (OI)(CI)(IO)(F)
NT AUTHORITY\SYSTEM:(I)(F) / (OI)(CI)(IO)(F)
NT AUTHORITY\Authenticated Users:(I)(M) / (OI)(CI)(IO)(M)
BUILTIN\Users:(I)(RX) / (OI)(CI)(IO)(GR,GE)
```
抽样验证「D 盘 exe 是否可执行」：`D:\tools\mingw\mingw64\bin\gcc.exe --version` → 成功输出版本号。

---

## 3. 历史 `os error 5` 与 MSVC 链接器缺失：定位与归属判定

### 3.1 `os error 5`（拒绝访问）

**原始证据**（`reports/CARGO_CHECK_OUTPUT.txt` 第 100-104 行，全文已读取）：
```
error: failed to run custom build command for `tauri-utils v2.10.2`
Caused by:
  could not execute process `...\src-tauri\target-gnu\debug\build\tauri-utils-730618620684e466\build-script-build` (never executed)
Caused by:
  拒绝访问。 (os error 5)
warning: build failed, waiting for other jobs to finish...
```

**技术定位**：
- 失败发生在 **Cargo 试图启动刚编译出的 build script 进程** 的时刻，日志明确标注 `(never executed)`；此前 90+ 个 crate 的 `Compiling` / `Checking` 均正常完成。
- 因此它**不是** Rust 源码编译错误、**不是**链接器报错、**不是** Tauri 配置错误，而是 **Windows `CreateProcess` 返回 `ERROR_ACCESS_DENIED`（Win32 error 5）**。
- `tauri-utils` 是 Tauri 官方依赖 crate，其 build script 由 Cargo 自动执行，`src-tauri/Cargo.toml`、`build.rs`（仅 `fn main() { tauri_build::build() }`）、`tauri.conf.json` 中**没有**任何自定义进程启动/权限逻辑。

**排除项（本轮实测）**：
| 可能原因 | 实测结论 |
|---|---|
| NTFS 目录 ACL 拒绝执行 | **排除**：`Authenticated Users:(M)`、`Users:(RX)`，当前用户为 Administrator 且 `IsAdmin=True` |
| D 盘整体禁止执行 exe | **排除**：`D:\tools\mingw\mingw64\bin\gcc.exe --version` 执行成功 |
| 域组策略 AppLocker / SRP | **排除**：`SRPV2` / `AppLocker` 策略键不存在 |
| 磁盘空间不足 | **排除**（非 error 5 语义）：C 14.29 GB / D 53.62 GB 可用 |
| 项目代码编译错误 | **排除**：错误在进程创建阶段，且 GNU 路径历史 Release 构建成功（§2.5） |

**环境侧强证据**：360 主动防御服务 `ZhuDongFangYu` 正在运行，且 `360FsFlt` / `360Box64` / `360AvFlt` / `360AntiSteal` 四个文件系统过滤驱动全部加载、Windows Defender 已被停用。第三方 HIPS 对「构建目录内刚生成的新 exe 首次执行」进行拦截，是 `CreateProcess` 返回 `ERROR_ACCESS_DENIED` 且标注 `never executed` 的典型成因。

> **判定：属环境配置 / 系统安全策略问题，不是项目代码问题。**（置信度：高；本轮按纪律未执行构建复现，故不宣称 100% 归因，需在第 2 阶段首次 `cargo check` 时以实测日志最终确认。）

**最小修复方案（不修改任何源码，待用户授权后执行）**：
1. 将 `D:\Users\Administrator\WorkBuddy\2026-11-02-18-41-41\mah-le-mah\target-gnu\`、`...\src-tauri\target\` 加入 360 信任/白名单；或构建期间临时退出 360 主动防御（**会改变系统安全状态，须用户明确同意**）。
2. 若仍复现，在洁净构建机（无第三方 HIPS）执行同一命令。
3. 禁止采用「跳过 build script」「预置伪造产物」「复用旧 exe」等方式绕过。

### 3.2 MSVC `link.exe` 缺失

**判定：属环境配置问题，不是项目代码问题。**
- 本机**从未安装** Visual Studio / Build Tools 与 Windows SDK（§2.3 全部取证），因此默认 `x86_64-pc-windows-msvc` 目标必然找不到 `link.exe`，`LIB` / `INCLUDE` 亦无法解析。
- 叠加因素：Git Bash 的 `/usr/bin/link`（GNU coreutils 8.32）在 PATH 中优先，`.build/cargo_warm.log` 已实证 rustc 的 `link.exe` 调用被 GNU `link` 接管，产生 `link: extra operand` 报错。这解释了历史报告中「Git Bash 下 GNU link 遮蔽 MSVC link.exe」的表述。
- 项目侧无过错：`src-tauri/Cargo.toml` 未硬编码 MSVC linker；`src-tauri/.cargo/config.toml` 与 `tools/build_portable.mjs:51` 早已提供 GNU 备用路径，且该路径历史 Release 构建成功（§2.5）。

**修复选项（待用户选择，本轮不执行）**：

| 选项 | 内容 | 是否需要改源码 | 前置条件 |
|---|---|---|---|
| **A（推荐，零改动）** | 走项目既定 GNU 路径：`rustup run stable-x86_64-pc-windows-gnu cargo build --release --target x86_64-pc-windows-gnu -j 2`，随后 `npm run build:portable` → `npm run build:nsis` → `npm run release` | **否** | 需先排除 §3.1 的 360 执行拦截 |
| **B** | 安装 VS2022 Build Tools（C++ 生成工具）+ Windows 10/11 SDK，用默认 msvc 目标；同时修正 PATH 顺序避免 GNU `link` 遮蔽 | **否** | 需管理员提权 + 联网下载 + 可能受 360 策略限制；C 盘仅 14.29 GB 可用，需评估体积 |
| **C** | 换用已装 MSVC 的洁净 Windows 构建机 | **否** | 需迁移工作区 |

> 三个选项**均不需要修改冻结源码**。`src-tauri/.cargo/config.toml` 现有内容已足够，本轮未改动。

---

## 4. 版本一致性预检（只读，供第 6 阶段参考，本阶段不作正式判定）

| 项 | 实测值 | 状态 |
|---|---|---|
| Git HEAD | `8a0c434ad1e4a4da2b906a5744105aeac883144a` | 基准 |
| 4 个 HTML 内嵌 `buildVersion` | `2.0.0-e71486e`（4/4 一致） | **比 HEAD 滞后一提交**（`e71486e` 是 HEAD 的前一提交，`8a0c434` 为审计修复提交） |
| 4 个 HTML 内嵌 `gitCommit` | `e71486e75c24154e6bffb64db509a30d0791f416` | 同上 |
| 4 个 HTML 内嵌 `sourceHash` | `b8666bafae0661ee9f73a398729a6bc1824b60e64a7caeec590ba2c7dd452428`（4/4 一致） | 与 `reports/build-consistency-report.json` 一致，`110/0` |
| 当前 modern HTML sha256 | `aa3d28f69c90958396a3881a24280852c6929c75711f34eccf34275598a2c01d` | 11-13 20:41 重建 |
| 当前 legacy HTML sha256 | `3f101399dfe0db31ee6887f04e5afd5c74a9dfd79b4cb5c21fa42e9af7c66558` | 11-13 20:41 重建 |
| `dist/SHA256SUMS.txt`（11-10 20:50）中 HTML 哈希 | `56df003a44b049e1ae693ff9eeb4186f6e3ac48ca3fd1d4f46a99cb42b9ed6bc` | **已过期，与当前 4 个 HTML 均不匹配** |
| `dist/MahLeMah-Portable-v2.0.0.zip` | 11-10 20:39，`f74adb4d…` | 旧产物，不得沿用 |
| `dist/MahLeMah-Setup-v2.0.0.exe` | 11-11 10:36，`0b67e012…` | 旧产物，不得沿用 |
| `MahLeMah.exe`（GNU release） | 11-10 20:39，2,978,816 B | 旧产物，不得沿用 |

> 用户明确禁止修改 4 个 HTML 产物；因此 `buildVersion=2.0.0-e71486e` 与 HEAD 的差异**只能如实记录，不得在本轮擅自修正**。若需消除差异，须另行授权重建 Web 产物（属冻结范围外的决策）。

---

## 5. 冻结保护与执行纪律确认

| 约束 | 本轮状态 |
|---|---|
| 禁止修改第一关全部代码及布局 | ✅ 未修改 |
| 禁止修改第二关 20 套模板 / 生成逻辑 / 三阶段保真 / 最近 10 局去重 | ✅ 未修改 |
| 禁止修改已完成音乐文件及场景分配 | ✅ 未修改 |
| 禁止修改 `src/` / `dist/` / 4 个 HTML | ✅ `git diff --stat HEAD -- src/ dist/` 为空 |
| 禁止无关重构 | ✅ 无 |
| 禁止删除历史证据 | ✅ 未删除任何文件 |
| 禁止自动提交 / 推送 | ✅ HEAD 未移动，`git log --oneline -3` 未变化 |
| 禁止伪造结果 / 把 NOT RUN 写成 PASS | ✅ 第 2～6 阶段全部标 NOT RUN；历史成功日志明确标注「历史证据，非本轮执行」 |
| **先完成只读环境审计 → 报告 → 暂停** | ✅ 本文件即暂停点 |

`git status --short`（现场，含前几阶段遗留，本轮未新增除本报告）：
```
 M reports/l2-templates-output.txt
 M reports/l2-templates-report.json
 M reports/l2-templates-report.md
?? reports/L2_FINAL_ACCEPTANCE.md
?? reports/L2_FINAL_EVIDENCE_INDEX.md
?? reports/L2_LAYOUT_FREEZE.md
?? reports/L2_LAYOUT_STAGE1_AUDIT.md
?? reports/L2_LAYOUT_STAGE2_VISUAL_AUDIT.md
?? reports/l2-visual-comparison.json
?? reports/l2-visual-diff/
?? reports/l2-visual-screenshots/
?? tools/l2_visual_assets.mjs
?? tools/l2_visual_audit.mjs
?? tools/l2_visual_detector_calibration.mjs
?? tools/l2_visual_report.mjs
```

---

## 6. 暂停点：等待用户确认后方可进入第 2 阶段

本轮**不启动**任何构建。进入 Release 构建前需要用户明确答复以下事项：

1. **构建路径选择**：`A` 本机 GNU（推荐，零源码改动）/ `B` 安装 VS2022 Build Tools + Windows SDK 后走 msvc / `C` 换洁净构建机。
2. **是否授权处理 360 主动防御**：为排除 `os error 5`，是否允许将构建目录加入 360 白名单或构建期间临时退出主动防御（**会改变系统安全状态**）；若不授权，则任何构建失败都必须如实记为 FAIL，不得绕过。
3. **Web 产物差异处理**：`buildVersion=2.0.0-e71486e` 与 HEAD `8a0c434` 的差异，是「仅记录」还是「授权重建 4 个 HTML」（用户当前限制为禁止修改，默认按**仅记录**执行）。
4. **`SHA256SUMS.txt` 重建授权**：第 3 阶段 `npm run release` 会覆盖旧清单；按「不得删除历史证据」要求，建议先备份旧清单再覆盖，请确认该做法。
5. **Release 测试口径**：`tools/stress_release.mjs` 为「每关 `--seeds N` × 6 策略」，请确认「500 局」与「100 局专项回归」的具体参数（例如 `--seeds` 取值 / 关卡范围），以免用 Debug 或 Web 测试结果冒充 Release 结果。

---

## 7. 附录：本轮执行的只读命令清单

| 类别 | 命令 / 工具 | 用途 |
|---|---|---|
| Git | `git rev-parse HEAD` / `git log --oneline -5` / `git status --short` / `git diff --stat HEAD -- src/ dist/` | 基线与冻结确认 |
| OS | PowerShell `Get-CimInstance Win32_OperatingSystem` / `Get-PSDrive` / `[WindowsPrincipal]` / `Get-ItemProperty` 策略键 | 系统、权限、磁盘、组策略 |
| 工具链 | `rustc --version` / `rustc -vV` / `cargo --version` / `rustup show` / `rustup target list --installed` / `node -v` / `npm -v` | 版本与 target |
| MSVC | `Get-Command link.exe,cl.exe,rc.exe,mt.exe,vswhere.exe` / `vswhere -all` / VS/SDK 注册表与路径存在性 / 环境变量枚举 | 链接器与 SDK |
| GNU | `which -a link` / `link --version` / `gcc.exe --version` / `ld.exe --version` / MinGW 文件存在性 | 备用工具链与遮蔽 |
| Tauri/发布 | `cat package.json` / `cat src-tauri/Cargo.toml` / `cat tauri.conf.json` / `cat src-tauri/.cargo/config.toml` / `grep` 构建脚本 / `node -e require(...)` | 构建命令与配置 |
| 历史证据 | `cat reports/CARGO_CHECK_OUTPUT.txt` / `sed` 读 `FINAL_ACCEPTANCE.md`、`AUDIT_REPORT.md`、`CHANGELOG.md` / `tail` 读 `.build/*.log` | 失败与成功取证 |
| 安全策略 | `Get-MpComputerStatus` / `Get-MpPreference` / `Get-Service` / `fltmc filters` / `icacls` | HIPS 与 ACL |
| 产物 | `sha256sum dist/*` / `grep -o buildVersion\|sourceHash\|gitCommit` / `cat dist/SHA256SUMS.txt` / `ls -la dist/` | 版本一致性预检 |

**未执行**：`cargo check`、`cargo build --release`、`npm run build*`、`npm run release`、`npm run test:release`、`tauri build`、任何安装/卸载/启动桌面程序、任何修改源码或产物的操作。

---

## 8. 本阶段结论

> **第一步「只读 Windows 构建环境审计」已完成，报告已生成，现暂停等待确认。**
>
> - **默认 MSVC 构建环境：FAIL（环境缺失）** —— 未安装 VS Build Tools / Windows SDK / `link.exe`，且 Git Bash GNU `link` 造成同名遮蔽。
> - **项目既定 GNU 构建环境：具备基础条件（PASS，历史证据）** —— MinGW、rustup GNU target、项目 `.cargo/config.toml`、Portable/NSIS 脚本与 `makensis` 缓存均齐备，但存在 360 主动防御导致 `os error 5` 复现的风险。
> - 两类历史问题**均判定为环境配置 / 系统安全策略问题，不是项目代码问题**；不需要、也未进行任何源码修改。
> - **第 2～6 阶段全部 NOT RUN**；本报告不含任何构建、产物、测试或实机验收结果，也不把浏览器/Web 版通过表述为桌面版通过。
