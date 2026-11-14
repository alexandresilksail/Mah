# Windows 桌面版发布验收 · 第 3 步：发布产物重建报告

> 承接 `reports/WINDOWS_RELEASE_BUILD_REPORT.md`。三个发布产物均由本轮 **GNU Release 构建（`8a0c434`）真实重新生成**，未沿用旧安装包。完整构建日志见 `reports/windows-build-logs/`。

---

## 0. 基线与保护

| 项目 | 值 |
|---|---|
| 基准 HEAD | `8a0c434ad1e4a4da2b906a5744105aeac883144a` |
| 重建时间 | 2026-11-14 10:40 – 10:41 GMT+8 |
| 版本来源（只读） | `src-tauri/tauri.conf.json` `version=2.0.0`、`Cargo.toml` `version=2.0.0`、`package.json` `version=2.0.0` |
| 构建命令 | `npm run build:portable` → `npm run build:nsis` → `npm run release`（均 EXIT=0） |
| 旧产物备份 | `reports/windows-release-backup/`（`SHA256SUMS.txt`、`MahLeMah-Setup-v2.0.0.exe`、`MahLeMah-Portable-v2.0.0.zip`，均 `cp -p` 保留时间戳） |
| 历史报告备份 | `reports/windows-release-backup/reports-before-tests/`（54 个 `.md/.json/.txt`，测试覆盖前留存） |
| 4 个 HTML | **未改动**（哈希见 §4） |

---

## 1. 新旧产物对比（证明未沿用旧包）

| 产物 | 旧（备份） | 新（本轮） | 结论 |
|---|---|---|---|
| `MahLeMah-Setup-v2.0.0.exe` | 1,282,452 B · 2026-11-11 10:36:15 · `0b67e012…` | **14,733,015 B** · 2026-11-14 10:41 · `67529672…` | **哈希不同，全新生成** |
| `MahLeMah-Portable-v2.0.0.zip` | 1,386,077 B · 2026-11-10 20:39:15 · `f74adb4d…` | **14,703,556 B** · 2026-11-14 10:40 · `d2be478e…` | **哈希不同，全新生成** |
| `SHA256SUMS.txt` | 677 B · 2026-11-10 20:50 · `3fc3e1af…` | **677 B** · 2026-11-14 10:41 · `64fedb05…` | **哈希不同，全新生成** |

> 体积增大原因：本轮 GNU Release 完整重新链接产出 `MahLeMah.exe` = 16,305,152 B（历史 11-10 的 exe 为 2,978,816 B），`build_nsis.mjs` / `build_portable.mjs` 直接打包该新 exe。**不是**沿用旧 exe。新旧 exe 哈希：`55ccfc48…`（新） vs 历史 2.98 MB 旧文件（已备份于原路径被覆盖前，见构建报告 §5）。

---

## 2. 产物完整性与哈希校验（现场执行）

### 2.1 `SHA256SUMS.txt` 逐项核对
```
$ cd dist && sha256sum -c SHA256SUMS.txt
MahLeMah-Portable-v2.0.0.zip: OK
MahLeMah-Setup-v2.0.0.exe: OK
MahLeMah-legacy.html: OK
MahLeMah.html: OK
Mah了个Mah.html: OK
Play-MahLeMah.cmd: OK
_tiles.html: OK
index.html: OK
CHECK_EXIT=0
```
**8 / 8 OK**。新清单全文（8 项）：
```
d2be478e48e7da0e09546c4dd6812eb5ca697f6ff7d8dd9607e20f26304559da  MahLeMah-Portable-v2.0.0.zip
67529672f8239edf8f016af66bc478f224b3d2ca9d505972b9cd7a3eb14003af  MahLeMah-Setup-v2.0.0.exe
3f101399dfe0db31ee6887f04e5afd5c74a9dfd79b4cb5c21fa42e9af7c66558  MahLeMah-legacy.html
aa3d28f69c90958396a3881a24280852c6929c75711f34eccf34275598a2c01d  MahLeMah.html
aa3d28f69c90958396a3881a24280852c6929c75711f34eccf34275598a2c01d  Mah了个Mah.html
53c21b1f15f90ab3121ca61a24650e8d3a5b16a507db9d6e4ae32cf7113aa562  Play-MahLeMah.cmd
761747d626e43e524805081f1aa653b486d531d681b5686e5f82f3d510c96398  _tiles.html
aa3d28f69c90958396a3881a24280852c6929c75711f34eccf34275598a2c01d  index.html
```

### 2.2 Portable.zip 内容与 CRC
```
entries 4
  MahLeMah-Portable-v2.0.0/                              0 B
  MahLeMah-Portable-v2.0.0/MahLeMah.exe        16,305,152 B  crc=c044686c  2026-11-14 10:38:32
  MahLeMah-Portable-v2.0.0/WebView2Loader.dll     160,880 B  crc=51314bec
  MahLeMah-Portable-v2.0.0/便携版说明.txt             859 B  crc=5a775d5c  2026-11-14 10:40:20
testzip(bad file or None): None      ← 全部 CRC 通过，压缩包无损坏
```
便携目录内 `MahLeMah.exe` 与构建产物 `target-gnu/x86_64-pc-windows-gnu/release/MahLeMah.exe` **SHA256 完全相同**（`55ccfc481323daa79216f7fc90b9faf2849dc7a1fd13a941f8e622d1d1e92c55`）。

### 2.3 PE 架构（现场读取 PE 头）
| 文件 | MZ | PE Machine | 判定 |
|---|---|---|---|
| `MahLeMah-Setup-v2.0.0.exe` | `MZ` | `0x8664` | amd64 64 位 |
| `MahLeMah-Portable-v2.0.0/MahLeMah.exe` | `MZ` | `0x8664` | amd64 64 位 |
| `target-gnu/.../release/MahLeMah.exe` | `MZ` | `0x8664` | amd64 64 位 |

> 与 `README.md:383` 的历史约束一致：本机「系统禁跑 32 位 PE」，因此必须 amd64 原生 `makensis`；本轮使用的是已缓存的 `.build/nsis64/Bin/makensis.exe`，**未联网下载**。

### 2.4 NSIS 打包日志（`08_npm_build_nsis.log`）
```
Using lzma (compress whole) compression.
Install data: 16,534,530 bytes
Compressed data: 14,576,851 / 16,595,030 bytes
CRC (0xCDC0EFDC)
Total size: 14,733,015 / 16,736,346 bytes (88.0%)
[NSIS] 完成：…\dist\MahLeMah-Setup-v2.0.0.exe (14.05 MB)
  SHA256: 67529672f8239edf8f016af66bc478f224b3d2ca9d505972b9cd7a3eb14003af
```

---

## 3. 4 个 HTML 产物未改动（冻结保护）

| 文件 | 构建前 SHA256 | 构建后 SHA256 |
|---|---|---|
| `dist/index.html` | `aa3d28f6…` | `aa3d28f6…` |
| `dist/MahLeMah.html` | `aa3d28f6…` | `aa3d28f6…` |
| `dist/Mah了个Mah.html` | `aa3d28f6…` | `aa3d28f6…` |
| `dist/MahLeMah-legacy.html` | `3f101399…` | `3f101399…` |

`tools/make_release.py:78-84` 只重写 `SHA256SUMS.txt`，不改写 HTML；三个构建脚本亦不触碰 HTML。

---

## 4. 逐项判定

| 检查项 | 判定 | 证据 |
|---|---|---|
| Setup.exe 由本轮构建生成 | **PASS** | 14.05 MB，`67529672…`，NSIS 日志 EXIT=0，与旧 `0b67e012…` 不同 |
| Portable.zip 由本轮构建生成 | **PASS** | 14.70 MB，`d2be478e…`，4 项 CRC 全通过，与旧 `f74adb4d…` 不同 |
| SHA256SUMS.txt 由本轮生成 | **PASS** | `64fedb05…`，8 项，`sha256sum -c` 8/8 OK |
| 版本号（2.0.0） | **PASS** | 三处配置一致，文件名均为 `-v2.0.0` |
| 文件完整性 | **PASS** | zip `testzip()=None`、PE `MZ` + amd64、exe 哈希跨路径一致 |
| 哈希一致性 | **PASS** | 清单与 8 个实际文件逐项 OK |
| 未沿用旧安装包 | **PASS** | 三个产物哈希与备份旧件全部不同，时间戳均为本轮 |
| 4 个 HTML 未改动 | **PASS** | 构建前后哈希逐一比对相同 |
| 安装包实际安装/卸载 | **NOT RUN** | 属第 5 步实机验收，本报告只做产物静态校验 |

---

## 5. 遗留风险

1. `cargo build --release` 的 MinGW 链接器警告 `.rsrc merge failure: multiple non-default manifests` 未在源码层处理（避免无关重构）；可能影响应用清单/DPI 行为，需第 5 步实机观察。
2. 新 exe 体积 16.3 MB（历史 2.98 MB），来自本轮完整重新链接；未做体积优化，不影响功能判定。
3. `SHA256SUMS.txt` 中 4 个 HTML 的哈希对应 `buildVersion=2.0.0-e71486e` 的 Web 产物，而 HEAD 为 `8a0c434` —— 版本差异将在第 6 步如实登记，**本轮未擅自重建 HTML**。
4. 静态校验不能替代安装/启动/卸载等实机行为，见第 5 步。

---

## 6. 本步判定

> **Setup.exe / Portable.zip / SHA256SUMS.txt 重建与校验：PASS**（安装与卸载行为另见第 5 步，本步标 NOT RUN，不混入 PASS）。
