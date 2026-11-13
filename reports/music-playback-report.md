# 背景音乐集成测试报告

- 资源：5 首 / 7309660 B / sha256 b0a6b8026d1aadf06302d61995aeda9ede21977c8970d66c3da84c62e8e17d10
- 映射：title→标题场景音乐.wav，level1→第一关场景音乐.wav，level2→第二关场景音乐.wav，win→过关场景音乐.wav，lose→失败场景音乐.wav；graduated 留空
- 断言：69 通过 / 0 失败

## 版本集成

| 版本 | 文件 | 字节 | 内嵌载荷 | 载荷逐字节一致 | 映射一致 | 解锁链路 | 无外链路径 |
|---|---|---:|---:|---|---|---|---|
| 网页版 | dist/index.html | 9926380 | 5 | ✓ (5/5) | ✓ | ✓ | ✓ |
| 独立 HTML 版 | dist/MahLeMah.html | 9926380 | 5 | ✓ (5/5) | ✓ | ✓ | ✓ |
| 中文名副本 | dist/Mah了个Mah.html | 9926380 | 5 | ✓ (5/5) | ✓ | ✓ | ✓ |
| ES5 legacy 版 | dist/MahLeMah-legacy.html | 9960549 | 5 | ✓ (5/5) | ✓ | ✓ | ✓ |
| 桌面版前端（静态集成检查） | src/main.js + tauri.conf.json | — | 同一 manifest | ✓ | ✓ | ✓ | ✓ |

## 说明

- 本报告的播放断言用模拟 audio 元素完成，**按规格不能代替真实音频播放验证**；
  真实播放由 Edge 驱动 `tools/music_real_playback.mjs` 实测 currentTime 前进，结果见本报告「真机验证」补充章节。
- 桌面版仅做**静态集成检查**：本机 Rust 编译被系统策略拒绝（build script os error 5），
  exe 未重建，因此桌面版真机播放**未运行**，不计入通过。

## 真机播放验证（Edge · 真实鼠标解锁 · currentTime 实测）

- 浏览器：Edg/157.0.4341.46
- 执行：已执行
- 断言：54 通过 / 0 失败

| 版本 | 通过/总数 | 解锁后 currentTime | 时间推进 | 场景切换 | 结论 |
|---|---|---|---|---|---|
| 网页版 | 18/18 | ✓ | ✓ | 8/8 | PASS |
| 独立 HTML 版 | 18/18 | ✓ | ✓ | 8/8 | PASS |
| ES5 legacy 版 | 18/18 | ✓ | ✓ | 8/8 | PASS |

- 桌面版（Tauri exe / Windows 安装版）：**未运行**。Rust build script 执行被系统拒绝（os error 5），exe 未重建，桌面版真机播放未运行。
