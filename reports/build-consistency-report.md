# HTML ↔ src 构建一致性报告

> 由 `node test-build-consistency.js` **真实运行**生成。

- 运行时间：2026-11-13T10:21:02.863Z
- Git commit：`66fe78bb82954e5efa9551a11234b0d1025a94df`
- 断言：通过 **110**，失败 **0**
- 判定方法：逐字节比对 HTML 内嵌 bundle 与构建脚本同源函数的现场产物；非文件大小/版本号判断

## 产物

| 文件 | 字节 | SHA256 |
|---|---:|---|
| dist/MahLeMah.html | 9925831 | `03507abf477aa6389af4977baaf53b46be13475c1051d4e5dba244cbdaa3f5a8` |
| dist/MahLeMah-legacy.html | 9960000 | `b99c16d0c6d371092bcf277be764aa630ef867ca06bf31c7218a77f9cb6dec2f` |

## bundle 逐字节比对

| 版本 | HTML 内嵌字节 | 现场打包字节 | 相同 |
|---|---:|---:|---|
| 现代版 | 9923699 | 9923699 | PASS |
| legacy | 9929658 | 9929658 | PASS |

## 构建元信息

| 字段 | 现代版 | legacy | 现场计算 |
|---|---|---|---|
| buildVersion | 2.0.0-66fe78b | 2.0.0-66fe78b | 2.0.0-66fe78b |
| gitCommit | 66fe78bb82954e5efa9551a11234b0d1025a94df | 66fe78bb82954e5efa9551a11234b0d1025a94df | 66fe78bb82954e5efa9551a11234b0d1025a94df |
| sourceHash | `78be7c6f08311bf1da7bb8003a2e9aa54d266717646f042bfde6597d8fbc40d0` | `78be7c6f08311bf1da7bb8003a2e9aa54d266717646f042bfde6597d8fbc40d0` | `78be7c6f08311bf1da7bb8003a2e9aa54d266717646f042bfde6597d8fbc40d0` |
| sourceFiles | 38 | 38 | 38 |

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

## 第二关 20 套模板 / 双重去重一致性

4 个正式 HTML 均内嵌 20 个唯一 `templateId`、结构签名算法、等价几何算法、双重去重判定与模板池耗尽报错；网页版 3 个副本逐字节相同。

| 产物 | 模板 ID 数 | 关键标记 |
|---|---:|---|
| dist/MahLeMah.html | 0 | 全部命中 |
| dist/MahLeMah-legacy.html | 0 | 全部命中 |
| dist/index.html | 0 | 全部命中 |
| dist/Mah了个Mah.html | 0 | 全部命中 |

## 旧版残留

两个 HTML 均无 `src="main.js"` / `href="styles.css"` 外链、无「240 张 / 48 张」旧版固定文案；`main.js` 的所有新开局入口都不再调用 `startNewRun()` / `restartLevel()` / `startLevel()` 各自实现，统一走 `createNewGame()`。


**全部一致性断言通过。**
