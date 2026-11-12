# HTML ↔ src 构建一致性报告

> 由 `node test-build-consistency.js` **真实运行**生成。

- 运行时间：2026-11-12T14:00:49.089Z
- Git commit：`cb43412f6f7bca753833448d5823a1f9aad56cda`
- 断言：通过 **71**，失败 **0**
- 判定方法：逐字节比对 HTML 内嵌 bundle 与构建脚本同源函数的现场产物；非文件大小/版本号判断

## 产物

| 文件 | 字节 | SHA256 |
|---|---:|---|
| dist/MahLeMah.html | 9885845 | `5ab697cd761c15808f212051ad587fe6fe8bb3d1f4f5e8b9b113eb02b0d2797f` |
| dist/MahLeMah-legacy.html | 9919967 | `6dfec65af7ee49acdf7c0f8c0697c9bca2c3fd10e64987110ac877a36a10dc5c` |

## bundle 逐字节比对

| 版本 | HTML 内嵌字节 | 现场打包字节 | 相同 |
|---|---:|---:|---|
| 现代版 | 9883713 | 9883713 | PASS |
| legacy | 9889625 | 9889625 | PASS |

## 构建元信息

| 字段 | 现代版 | legacy | 现场计算 |
|---|---|---|---|
| buildVersion | 2.0.0-cb43412 | 2.0.0-cb43412 | 2.0.0-cb43412 |
| gitCommit | cb43412f6f7bca753833448d5823a1f9aad56cda | cb43412f6f7bca753833448d5823a1f9aad56cda | cb43412f6f7bca753833448d5823a1f9aad56cda |
| sourceHash | `7585b01a137a66b1adac54b7d5b3c2dde2ef57e3db4b2f7ff314dd5fcb255576` | `7585b01a137a66b1adac54b7d5b3c2dde2ef57e3db4b2f7ff314dd5fcb255576` | `7585b01a137a66b1adac54b7d5b3c2dde2ef57e3db4b2f7ff314dd5fcb255576` |
| sourceFiles | 33 | 33 | 33 |

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
