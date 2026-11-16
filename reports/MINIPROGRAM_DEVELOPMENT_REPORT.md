# MAH 小程序 — 开发报告

> 版本：首个可运行版本 v0.1.0　日期：2026-11-16
> 增量更新 v0.2.0　日期：2026-11-16 —— 接入道具 UI（洗牌/撤销/移出/复活）并修复临时区渲染/命中缺陷
> 基线 HEAD：`2b137dab794149263b74e29c8fec8a4795eb7801`（main 分支，克隆时工作区干净）

## 一、开发目标与策略

在本仓库新增独立 `miniprogram/` 目录，把现有 Windows 桌面版游戏迁移为微信小程序。**不新建仓库、不重写游戏规则、不破坏桌面版**。目标：微信开发者工具可直接打开运行，首页与第一关/第二关可玩，20 套布局真实接入。

策略：**纯逻辑字节级复用 + 平台层独立重写**。经核查，原 `src/game/` 中 engine/generator/new_game/l2_*/tile_types/layout/rng/sha256 等均为零 DOM 依赖的纯 JS 模块，因此直接复制并用 esbuild 打出 CommonJS bundle；渲染/触摸/音频/存储/页面全部按微信原生 API 重写。

## 二、新增文件清单

### 核心复用层（`miniprogram/core/`）
- `shared/*.js`（21 个文件）：从 `src/game/` 字节级复制的纯逻辑（config、engine、generator、new_game、l2_templates、l2_spec、l2_geometry、l2_structure、l2_recent、layout、layout_profiles、layout_signature、tile_types、tiles、draw、rng、seed_pool、sha256、robots、recent_games、build_info）。
- `index.js`：核心门面，统一聚合导出。
- `mah-core.js`：esbuild 产出的 CJS bundle（221.8 KB，108 导出）。
- `mah-core.d.ts`：供 TS 页面调用的类型声明。

### 平台独立层（`miniprogram/`）
- 工程配置：`app.ts`、`app.json`、`app.wxss`、`sitemap.json`、`project.config.json`、`tsconfig.json`、`package.json`。
- 页面：`pages/home/`、`pages/game/`、`pages/result/`、`pages/settings/`（各含 .ts/.wxml/.wxss）。
- 渲染：`renderer/canvas-renderer.ts`、`renderer/touch-handler.ts`、`renderer/coordinate-transform.ts`。
- 服务：`services/storage.ts`、`services/audio.ts`、`services/platform.ts`、`services/share.ts`。
- 类型：`typings/wx.d.ts`。
- 构建：`tools/build-core.mjs`。
- 测试：`tests/run-tests.mjs`、`tests/random-1000.mjs`、`tests/lifecycle.mjs`、`tests/props.mjs`（道具系统，v0.2 新增）。

### 报告（`reports/`）
- `MINIPROGRAM_MIGRATION_INVENTORY.md`、`MINIPROGRAM_TEST_REPORT.md`、`MINIPROGRAM_DEVELOPMENT_REPORT.md`、`MINIPROGRAM_RELEASE_CHECKLIST.md`、`MINIPROGRAM_RANDOM_1000.json`。

## 三、修改的原有文件

**无。** 未修改 `src/`、`src-tauri/`、`dist/`、根目录测试脚本或任何原有文件。所有新增内容仅位于 `miniprogram/` 与 `reports/`。安装 esbuild/typescript 时使用了 `npm install --no-save`，未改动 `package.json`/`package-lock.json`（见下方"环境说明"）。

## 四、复用 vs 重写

| 类别 | 处理 | 说明 |
|---|---|---|
| 游戏规则 / 三消 / 七槽 / 遮挡 | 复用 | engine.js 原样，SLOT_CAPACITY=7、OVERLAP_THRESHOLD=0.10 不变 |
| 第一关 | 复用 | layout_profiles.js 冻结逻辑原样，牌数档位 24/30/36/48 |
| 第二关 20 套布局 | 复用 | l2_templates.js 20 套掩膜 + l2_spec/l2_geometry 三段保真校验 |
| Seed / 难度 / 去重 | 复用 | rng/seed_pool/config/recent_games 原样，两关窗口 L1=3/L2=10 |
| 牌面绘制 | 复用 | tiles.js 16 种原创 Canvas 图案，无 ownerDocument 时降级直绘 |
| Canvas 主渲染 | 重写 | canvas-renderer.ts（微信 Canvas 2D，DPR/命中/生命周期） |
| 触摸 / 坐标 | 重写 | touch-handler.ts + coordinate-transform.ts |
| 存储 | 重写 | storage.ts（wx Storage，带版本号与坏档恢复） |
| 音频 | 重写 | audio.ts（开关/前后台/释放/降级；**5首BGM 不接入**） |
| 页面 / UI / 分享 | 新建 | 四个原生页面 + share.ts |

## 五、完成的功能

- ✅ 独立小程序工程创建，游客 AppID（`touristappid`）占位，本地预览不阻断。
- ✅ 首页（品牌、双关入口、规则、设置、战绩）。
- ✅ 第一关 / 第二关可玩（Canvas 2D 渲染 + 原生触摸 + 三消引擎）。
- ✅ 16 种牌型正常显示（原创 Canvas 图案）。
- ✅ 七槽位 / 三消 / 遮挡逻辑（复用，测试通过）。
- ✅ 第二关 20 套布局真实接入，最近 10 局不重复，记录 templateId/seed/难度/牌数。
- ✅ 5 类重开/进入场景均生成新 session（生命周期测试通过）。
- ✅ Canvas DPR 适配、层级绘制、触摸坐标变换、单实例动画循环、前后台暂停、卸载清理。
- ✅ 本地存储（版本号、坏档恢复、旧记录保留、离线可玩、无需登录）。
- ✅ 结算页（胜负/耗时/编号/模板/再玩/分享）、设置页（音效/震动/规则/版本；BGM 标注未开放）。
- ✅ 音频独立适配层，5 首 BGM 未打包。
- ✅ 独立构建（`tools/build-core.mjs`，输出到 core/，不触碰根 dist/）。
- ✅ 自动化测试：44 项规则 + 8 项生命周期 + 1000 局随机生成，全部真实执行通过；TS 编译 0 错误。

## 五·补、增量迭代 v0.2.0 —— 道具系统接入与缺陷修复

首版审查发现「道具 UI 未接入」外，还隐藏三个环环相扣的缺陷，本轮一并修复。**核心规则引擎零改动，全部改动位于微信平台层与导出门面。**

### 修复的缺陷（真实根因）

| # | 缺陷 | 根因 | 修复 |
|---|---|---|---|
| 1 | 移出道具的牌不可见 | 微信渲染器 `drawBoard` 只画 `state==='board'`，未绘制 `temp` 临时区 | 新增 `drawTemp()`，复用原版 `TEMP_ZONE` 坐标与样式 |
| 2 | 临时区牌点不到 | 触摸层用 temp 牌自身 `x/y` 命中，但该坐标停留在入槽时的槽位位置，与绘制位置错位；且 `canPick()` 只认 `board`，对 temp 返回 false | 触摸层改为按 `TEMP_ZONE.x + i*pitch` 命中；页面对 `state==='temp'` 直接调 `pick()` 分流到 `returnFromTemp` |
| 3 | Core 未导出临时区常量 | `config.js` 导出了 `TEMP_ZONE`，但门面 `core/index.js` 未聚合，小程序无法引用 | 门面补导出 `TEMP_ZONE / SLOT_CARD_W / SLOT_CARD_H`，d.ts 同步，重建 bundle（导出 108→111） |
| 4 | 复活道具无使用机会 | 首版失败判定后立即跳结算页，复活按钮无处触发 | 失败时若 `reviveLeft>0` 先弹「复活继续 / 结束本局」选择框，确认复活则 `useRevive()` 清空槽位继续本局 |
| 5 | `audio.revive` 回调缺失 | 引擎 `useRevive()` 调用 `audio.revive()`，但微信 audio 服务与 Game 注入对象均无该方法 | `audio.ts` 补 `revive` 音效类型与方法，Game 注入补 `revive` 回调 |

### 本轮新增/修改文件

- 修改：`core/index.js`、`core/mah-core.d.ts`、`core/mah-core.js`（重建）、`renderer/canvas-renderer.ts`、`renderer/touch-handler.ts`、`pages/game/index.{ts,wxml,wxss}`、`pages/result/index.{ts,wxml}`、`services/audio.ts`
- 新增：`tests/props.mjs`（34 项道具断言）

### 本轮真实测试

| 测试 | 命令 | 结果 |
|---|---|---|
| 道具规则 | `node tests/props.mjs` | 34 通过 / 0 失败 |
| 核心规则回归 | `node tests/run-tests.mjs` | 44 通过 / 0 失败 |
| 生命周期回归 | `node tests/lifecycle.mjs` | 8 通过 / 0 失败 |
| TS 编译 | `tsc --noEmit -p tsconfig.json` | 0 错误 |

## 六、未完成 / 待验证的功能

- ⚠️ 微信开发者工具打开与真机运行验证（当前环境无该工具）。
- ⚠️ 真机 Canvas 渲染、DPR/屏幕适配、触摸精度、前后台恢复的实机确认。
- ⚠️ 音效素材：首期无原创音效文件，所有音效安全降级为静音（接口已预留）。
- ⚠️ 背景音乐：版权未授权，首期无音乐模式，界面明确标注。
- ⚠️ 道具按钮的**真机触摸手感**与顶部道具栏在异形屏/小屏上的排版，仍需微信开发者工具确认（逻辑与可见性已自动化验证）。
- ⚠️ 帧率与包体的真机实测数据（未伪造）。

## 七、真实测试执行与结果

| 测试 | 命令 | 结果 |
|---|---|---|
| 核心规则 | `node tests/run-tests.mjs` | 44 通过 / 0 失败 |
| 道具规则（v0.2） | `node tests/props.mjs` | 34 通过 / 0 失败 |
| 生命周期 | `node tests/lifecycle.mjs` | 8 通过 / 0 失败 |
| 1000 局随机 | `node tests/random-1000.mjs` | PASS，30.3s，20/20 模板覆盖，去重 0 重复（v0.2 重建 bundle 后复测见测试报告） |
| TS 编译 | `tsc --noEmit -p tsconfig.json` | 0 错误 |
| 桌面版回归 | `node test.js` / `node test-l2-templates.js` | 见测试报告第 5 节 |

## 八、环境说明

- 环境无微信开发者工具 → 无法完成真机验证，已在测试报告第 6 节逐项列明。
- 为打包与类型检查临时安装了 `esbuild` 与 `typescript`（`--no-save`，未写入依赖清单）。
- 核心 bundle 已提交在 `core/mah-core.js`，运行小程序**不需要** node_modules 或 npm install。
