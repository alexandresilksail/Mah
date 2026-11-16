# MAH 微信小程序迁移 — 模块盘点清单

> 生成时间：2026-11-16　基线 HEAD：`2b137dab794149263b74e29c8fec8a4795eb7801`（分支 `main`，工作区克隆时干净）
> 说明：本清单基于对现有仓库源码的逐文件核查，不是历史审计的复制。

## 一、基线快照

| 项目 | 值 |
|---|---|
| 仓库 | https://github.com/alexandresilksail/Mah（public） |
| 默认分支 | main |
| HEAD SHA | 2b137dab794149263b74e29c8fec8a4795eb7801 |
| 克隆时工作区状态 | 干净（无未提交修改） |
| 最后推送 | 2026-11-14T09:11:28Z |
| 原仓库规模 | 约 57 MB（含 dist/ 发行产物与 src/assets/music/） |

## 二、模块盘点表

| 模块 | 原有文件 | 是否可复用 | 微信端处理方式 |
|---|---|---|---|
| 游戏规则（引擎） | src/game/engine.js | 是（纯逻辑，零 DOM） | 迁移：字节级复制到 core/shared/，esbuild 打包 |
| 牌型（16种注册表） | src/game/tile_types.js | 是 | 迁移：复用注册表，牌面 ID/配色完全一致 |
| 第一关（布局生成） | src/game/layout_profiles.js + config.js | 是 | 迁移：第一关冻结逻辑原样复用 |
| 第二关（20套模板） | src/game/l2_templates.js（561行） | 是 | 迁移：20 套掩膜模板全部原样复用 |
| 第二关几何规格 | src/game/l2_spec.js（1194行）/ l2_geometry.js | 是 | 迁移：规格驱动 + 三段保真校验原样复用 |
| 第二关去重 | src/game/l2_recent.js / l2_structure.js / layout_signature.js | 是 | 迁移：最近10局双重去重原样复用 |
| 三消 / 七槽位 | src/game/engine.js（slotInsert/resolveSlot） | 是 | 迁移：原样复用，SLOT_CAPACITY=7 |
| 遮挡判定 | src/game/layout.js / generator.js（isCovered） | 是 | 迁移：真实几何遮挡，非 z-index 替代 |
| Seed 随机 | src/game/rng.js / seed_pool.js / sha256.js | 是 | 迁移：mulberry32 + seed 池 + SHA-256 |
| 难度系统 | src/game/config.js（LEVEL2_PROFILES 10 档） | 是 | 迁移：档位与权重原样复用 |
| 新局统一入口 | src/game/new_game.js（createNewGame） | 是 | 迁移：5 类生成原因 + 差异化校验 |
| 最近牌局历史 | src/game/recent_games.js | 是 | 迁移：两关独立窗口（L1=3 / L2=10） |
| 随机可达性验证 | src/game/generator.js（verify/solvePath） | 是 | 迁移：verify 与证书体系复用 |
| 牌面 Canvas 绘制 | src/game/tiles.js / draw.js | 是（传入 ctx 即可） | 迁移：16 种原创 Canvas 图案；离屏缓存在无 ownerDocument 时自动降级为直绘 |
| 机器人难度模拟 | src/game/robots.js | 是 | 迁移：打进 bundle（供测试；UI 不暴露） |
| 游戏主渲染 | src/game/render.js（1036行） | 否（依赖 DOM/浏览器事件） | 重写：微信端 canvas-renderer.ts（Canvas 2D 原生） |
| Canvas 绘制基础 | src/game/draw.js | 部分 | 迁移（纯 ctx 函数）+ 微信端补充 |
| 音效 / 音乐 | src/game/audio.js + music_*.js | 否 | 重写：微信 services/audio.ts；**5首BGM 不打包**（版权未授权） |
| 本地存储 | src/game/store.js（localStorage/Tauri IPC） | 否 | 重写：微信 services/storage.ts（wx.setStorageSync + 版本号） |
| 分享 | 无（原版无） | — | 新建：微信 services/share.ts |
| UI / 触摸 | src/game/dom_view.es5.js / main.js | 否 | 重写：微信 pages/* + renderer/touch-handler.ts |
| 资源（图片/图标/字体） | 全部由 Canvas 代码实时生成，无外部图片 | — | 无需迁移二进制素材；原创图案随 tiles.js 复用 |

## 三、迁移边界说明

- **可复用的判定标准**：模块为纯 JS、无 `document`/`window`/`localStorage`/`Audio` 依赖（或仅在 `typeof` 保护下降级）。这类模块的规则代码字节级复用，避免重写引入偏差。
- **必须重写的部分**：任何直接操作浏览器 DOM、Web Audio、localStorage、鼠标事件、window 尺寸的代码。
- **未因"用了浏览器 API"而否定核心**：engine/generator/new_game/l2_* 虽在原项目中被 DOM 层调用，但其自身零平台依赖，因此完整复用。

## 四、知识产权核查

- 原仓库 5 首背景音乐（`src/assets/music/*.wav`）被安全审计列为商业发行阻断项 → **不进入小程序**。
- 牌面图案、图标、Logo 全部为 Canvas 原创路径（`tiles.js` / `logo.js`），无外部第三方素材。
- 小程序未引入任何未经核实的第三方游戏素材。
