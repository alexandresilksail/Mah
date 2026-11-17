# MAH 微信小程序渲染回归 — 原版/微信版差异对照审计

分支：`miniprogram/v0.2`
审计时间：2026-11-17
基准：Windows 桌面版 `src/main.js` + `src/game/render.js` + `config.js` + `tiles.js` + `engine.js`

## 结论先行

| 项 | 结论 |
|---|---|
| 原版渲染源码是否在微信工程内 | ✅ 在。`miniprogram/core/shared/render.js` 与 `src/game/render.js` **字节级完全相同**（1036 行，`diff -q` 无差异） |
| 原版渲染函数是否导出给微信 | ❌ 否。`core/index.js` 只导出 8 个（含 4 个绘制函数），缺 7 个关键绘制函数 |
| 微信 bundle 是否含这些函数体 | ❌ 否。esbuild tree-shaking 把未导出的 `drawTools/drawHUD/drawOverlay/drawSettingsPanel/drawUninstallConfirm` 摇掉了 |
| 微信渲染顺序是否与 Windows 一致 | ❌ 否。Windows 7 步，微信只调用 4 步 |
| WXML 是否重复绘制界面 | ❌ 是。WXML 自建 HUD/道具栏/工具栏，与 Canvas 内容叠加（违反规格三） |
| tick(dt) 时间单位 | ❌ 错。Windows 秒，微信传毫秒 |
| 点击是否支持 Canvas 按钮 | ❌ 否。微信只判牌、不判 UI 按钮 |

---

## 一、渲染函数调用顺序对照

**Windows（`src/main.js` frame()，权威基准）：**
```
drawBackground(ctx, t)
if screen==='title': drawTitleScreen(ctx, game, ui, t)
else:
  drawBoard(ctx, game)
  drawSlot(ctx, game, ui)
  drawTools(ctx, game, ui)
  drawHUD(ctx, game, ui)
  drawFx(ctx, game)
  drawOverlay(ctx, game, ui)
// 最上层
if game.uninstallAsk: drawUninstallConfirm(...)
if game.settingsAsk:  drawSettingsPanel(...)
```

**微信现状（`renderer/canvas-renderer.ts` draw()）：**
```
drawBackground(ctx, t)
drawBoard(ctx, game)
drawSlot(ctx, game, null)   // ui 传 null（该函数实测不使用 ui，此项无视觉影响）
drawFx(ctx, game)
// 缺 drawTools / drawHUD / drawOverlay / drawSettingsPanel / drawUninstallConfirm / drawTitleScreen
```

差异：缺失道具按钮、HUD（标题/关卡进度/剩余张数）、胜负/暂停/设置覆盖层的 Canvas 绘制。
当前这些界面由 WXML 另画一套，视觉结构与 Windows 不同 → 违反规格「画面完全一致」。

## 二、core/index.js 导出缺口

`src/game/render.js` 导出 15 个函数；`core/index.js` 仅导出 8 个：

| 函数 | Windows 导出 | 微信 core 导出 | bundle 函数体 |
|---|---|---|---|
| getUI | ✅ | ✅ | ✅ |
| hitButton | ✅ | ✅ | ✅ |
| cardAt | ✅ | ✅ | ✅ |
| drawBackground | ✅ | ✅ | ✅ |
| drawBoard | ✅ | ✅ | ✅ |
| drawSlot | ✅ | ✅ | ✅ |
| drawFx | ✅ | ✅ | ✅ |
| drawTitleScreen | ✅ | ✅ | ✅ |
| **drawIcons** | ✅ | ❌ | ✅（被其它函数间接引用保留） |
| **drawHUD** | ✅ | ❌ | ❌ 被摇掉 |
| **drawTools** | ✅ | ❌ | ❌ 被摇掉 |
| **drawButtons** | ✅ | ❌ | ✅（被 drawTitleScreen 间接引用） |
| **drawOverlay** | ✅ | ❌ | ❌ 被摇掉 |
| **drawUninstallConfirm** | ✅ | ❌ | ❌ 被摇掉 |
| **drawSettingsPanel** | ✅ | ❌ | ❌ 被摇掉 |

修复：在 `core/index.js` 补全 7 个导出 → esbuild 重打包后函数体回归。

## 三、坐标体系

- Windows 逻辑画布 720×1280，微信 `core/config.js` 同源（W=720 H=1280 TILE_W=66 TILE_H=88）。✅ 一致。
- 微信 `CoordinateTransform` 等比缩放 + 居中（letterbox），触摸 `toLogic` 与绘制共用同一 scale/offset。✅ 一致。
- `drawBoard` 的牌坐标用 `c.x/c.y`（格点左上角），`cardAt`/微信 `hitCard` 同样用左上角矩形判定。✅ 一致（脚本实测命中成功）。
- **未发现拉伸/挤压/重排**。此项符合规格六。

## 四、时间单位

- Windows：`const dt = Math.min(0.05, (now - prev) / 1000)` → 秒。
- 微信 `CanvasRenderer.frame(dt)`：`dt` 来自 `now - lastFrame`（毫秒），直接 `game.tick(dt)`。
  → **引擎动画/三消延时按秒计，传入毫秒会导致动画快 1000 倍**（表现为三消/入场动画异常）。必须修复。

## 五、点击链路

- Windows `onDown`：`R.getUI(game)` → `hitButton(ui,x,y)` 先判按钮；命中按钮走 `handleButton`；否则 `cardAt` 判牌。
- 微信 `onTouchStart`：只 `hitCard` 判牌，**无 UI 按钮命中**。
  → Canvas 绘制的道具/菜单/胜负按钮将无法点击。修复时必须补 `getUI/hitButton` + `handleButton` 等价逻辑。

## 六、牌面不显示排查（规格四）

诊断脚本（Node 直跑 `core/mah-core.js`）实测：

| 关卡 | screen/status | 牌数 | 坐标范围 | 可点牌命中 | pick |
|---|---|---|---|---|---|
| 1 | play/play | 30 | x 165~495, y 352~704 | ✅ | ✅ 槽位 0→1 |
| 2 | play/play | 273 | x 33~594, y 308~704 | ✅ | ✅ 槽位 0→1 |

牌均在 720×1280 画布内，无越界。`Core.drawBoard/drawSlot/drawFx` 均为 function。
→ **牌面消失并非生成/坐标/命中问题**。最可能根因：真机首测时的 `id="gameCanvas"` 大小写（已在 v0.2.1 修复为小写 `gamecanvas`）与 `drawBoard` 内部离屏缓存对微信 ctx 的降级路径。本次进一步加渲染前全量诊断日志以在真机确认。

## 七、需修复项汇总（对应规格）

1. 补 `core/index.js` 7 个渲染导出并重打包 → 规格二
2. `CanvasRenderer` 恢复 Windows 完整渲染顺序 + 标题页分支 → 规格二
3. 移除 WXML 自建 HUD/道具栏/工具栏，只留 canvas + 弹窗容器 → 规格三
4. `onTouchStart` 增加 UI 按钮命中与 `handleButton` 等价处理 → 规格三/六
5. `tick(dt)` 毫秒改秒 → 规格五
6. `frame()` 异常捕获 + 阶段日志 + RAF 单帧容错 → 规格五
7. 渲染前输出规格四要求的全部诊断字段
8. 补齐设置/胜负/暂停面板的 Canvas 绘制与交互
