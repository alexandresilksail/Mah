# HTML ↔ src 构建一致性报告

> 由 `node test-build-consistency.js` **真实运行**生成。

- 运行时间：2026-11-12T04:21:58.958Z
- Git commit：`f5a578e858ac1acfad42d3adc3c01d9d1eb27f3d`
- 断言：通过 **48**，失败 **0**
- 判定方法：逐字节比对 HTML 内嵌 bundle 与构建脚本同源函数的现场产物；非文件大小/版本号判断

## 产物

| 文件 | 字节 | SHA256 |
|---|---:|---|
| dist/MahLeMah.html | 134302 | `5b683891a56e79e27dc0f383f7d8559ecdf58e1d2461f8b73ed4ac4c018967c1` |
| dist/MahLeMah-legacy.html | 168373 | `cca372e4d99ea3791dfa6b716e115f5f18c5c56601763f1efe6fd40653a6cd3b` |

## bundle 逐字节比对

| 版本 | HTML 内嵌字节 | 现场打包字节 | 相同 |
|---|---:|---:|---|
| 现代版 | 132170 | 132170 | PASS |
| legacy | 138031 | 138031 | PASS |

## 构建元信息

| 字段 | 现代版 | legacy | 现场计算 |
|---|---|---|---|
| buildVersion | 2.0.0-f5a578e | 2.0.0-f5a578e | 2.0.0-f5a578e |
| gitCommit | f5a578e858ac1acfad42d3adc3c01d9d1eb27f3d | f5a578e858ac1acfad42d3adc3c01d9d1eb27f3d | f5a578e858ac1acfad42d3adc3c01d9d1eb27f3d |
| sourceHash | `578f26e42009e56bbe186e13597799ed30811719e6a3d1922afd19fe35647aef` | `578f26e42009e56bbe186e13597799ed30811719e6a3d1922afd19fe35647aef` | `578f26e42009e56bbe186e13597799ed30811719e6a3d1922afd19fe35647aef` |
| sourceFiles | 32 | 32 | 32 |

> 两个 HTML 的 buildTimestamp 允许相差数秒（两次独立构建），其余字段必须完全一致。

## 关键业务标记

| 标记 | 现代版 | legacy |
|---|---|---|
| `MAH-LAYOUT-SIG-v1/SHA-256` | PASS | PASS |
| `MAH-GEOM-v1/SHA-256` | PASS | PASS |
| `MAH-DIST-v1/SHA-256` | PASS | PASS |
| `application_restart` | PASS | PASS |
| `title_screen_restart` | PASS | PASS |
| `failure_restart` | PASS | PASS |
| `level1RecentGames` | PASS | PASS |
| `level2RecentGames` | PASS | PASS |
| `mah-dev-panel` | PASS | PASS |
| `createNewGame` | PASS | PASS |
| `GenerationFailureError` | PASS | PASS |

真实档位的总牌数（运行时由 mainCount + queueCount 得出，从 config 读取）：24 / 30 / 36 / 48 / 321 / 282 / 300 / 312 / 273 / 291 / 261 / 192 / 255 张；其主堆张数常量 24 / 30 / 36 / 48 / 277 / 238 / 256 / 268 / 229 / 247 / 217 / 148 / 211 全部同时存在于两个 bundle（逐字节比对才是主判定）。

## 旧版残留

两个 HTML 均无 `src="main.js"` / `href="styles.css"` 外链、无「240 张 / 48 张」旧版固定文案；`main.js` 的所有新开局入口都不再调用 `startNewRun()` / `restartLevel()` / `startLevel()` 各自实现，统一走 `createNewGame()`。


**全部一致性断言通过。**
