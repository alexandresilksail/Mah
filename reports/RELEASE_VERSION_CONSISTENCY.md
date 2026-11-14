# Windows 发布版本一致性检查报告

> 基准 HEAD `8a0c434ad1e4a4da2b906a5744105aeac883144a` · 2026-11-14 13:54:38 

## 1. Git 与产物

| 项 | 值 |
|---|---|
| Git HEAD | `8a0c434ad1e4a4da2b906a5744105aeac883144a` |
| 4 个 HTML 内嵌 buildVersion | 2.0.0-e71486e |
| 4 个 HTML 内嵌 gitCommit | e71486e75c24154e6bffb64db509a30d0791f416 |
| 4 个 HTML 内嵌 sourceHash | b8666bafae0661ee… |
| SHA256SUMS.txt 行数 | 8 |
| `sha256sum -c` 退出码 | 0 |

## 2. 4 个 HTML 产物（只读核验，未修改）

| 产物 | 字节 | sha256(前16) | buildVersion | sourceHash(前16) |
|---|---|---|---|---|
| dist/index.html | 9926380 | aa3d28f69c909583 | 2.0.0-e71486e | b8666bafae0661ee |
| dist/MahLeMah.html | 9926380 | aa3d28f69c909583 | 2.0.0-e71486e | b8666bafae0661ee |
| dist/Mah了个Mah.html | 9926380 | aa3d28f69c909583 | 2.0.0-e71486e | b8666bafae0661ee |
| dist/MahLeMah-legacy.html | 9960549 | 3f101399dfe0db31 | 2.0.0-e71486e | b8666bafae0661ee |

## 3. 发布产物哈希

| 产物 | 字节 | sha256(前20) |
|---|---|---|
| dist/MahLeMah-Setup-v2.0.0.exe | 14733015 | 67529672f8239edf8f01 |
| dist/MahLeMah-Portable-v2.0.0.zip | 14703556 | d2be478e48e7da0e0954 |
| dist/SHA256SUMS.txt | 677 | 64fedb05e01fb6ff8268 |
| target-gnu/x86_64-pc-windows-gnu/release/MahLeMah.exe | 16305152 | 55ccfc481323daa79216 |

## 4. `sha256sum -c SHA256SUMS.txt` 真实输出

```
MahLeMah-Portable-v2.0.0.zip: OK
MahLeMah-Setup-v2.0.0.exe: OK
MahLeMah-legacy.html: OK
MahLeMah.html: OK
Mah了个Mah.html: OK
Play-MahLeMah.cmd: OK
_tiles.html: OK
index.html: OK
```

## 5. 已知差异（如实登记，未擅自修改）

- 4 个 HTML 内嵌 `buildVersion=2.0.0-e71486e`、`gitCommit` 指向 `e71486e…`，**比 HEAD `8a0c434a` 滞后一提交**（`8a0c434` 为后续审计修复提交）；`sourceHash` 4/4 一致，构建一致性测试 110/0。按本轮限制**未重建、未修改** 4 个 HTML。
- 桌面 exe / Setup.exe / Portable.zip 均由本轮 `cargo build --release` 重新产出，与 `target-gnu/.../release/MahLeMah.exe` 同源；`SHA256SUMS.txt` 已由 `npm run release` 重新生成，旧清单已备份至 `reports/windows-release-backup/`，未沿用旧产物。
- 判定：**版本一致性 = CONDITIONAL / 未完成**。源码与产物本身哈希自洽、清单校验通过，但 Web 产物内嵌的构建版本号与 HEAD 不一致，需在授权后统一重建才能标记 PASS。

