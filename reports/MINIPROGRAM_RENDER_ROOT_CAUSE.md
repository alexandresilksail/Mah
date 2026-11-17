# 牌面不显示 / 画面变样 — 根因报告

分支：`miniprogram/v0.2`　时间：2026-11-17

## 根因（已定位，非猜测）

### 根因 1：原版渲染函数从未完整导出到微信 bundle（主因）
- `miniprogram/core/shared/render.js` 与 Windows `src/game/render.js` **字节级完全相同**（1036 行，diff 0）。
- 但 `core/index.js` 只导出了 `drawBackground/drawBoard/drawSlot/drawFx/getUI/hitButton/cardAt/drawTitleScreen`。
- esbuild tree-shaking 把未导出的 `drawTools/drawHUD/drawOverlay/drawSettingsPanel/drawUninstallConfirm/drawButtons(部分保留)` **从 bundle 中摇掉**（实测 `mah-core.js` 内 `function drawTools` 计数=0）。
- 结果：微信端根本无法调用原版的道具、HUD、胜负/暂停/设置绘制。这些界面改由 WXML 自建一套，视觉结构与 Windows 不同 → 用户所见"画面变样"。

### 根因 2：WXML 自建界面与原版 Canvas 界面叠加/不一致
- 原 `index.wxml` 自建 HUD、道具栏、工具栏、复活弹窗，与 Canvas 绘制的牌区拼接，形成"新旧两套界面"。
- 违反规格三（原版 Canvas 已绘制的内容不得由 WXML 重复绘制）。

### 根因 3：tick(dt) 时间单位错误（动画/三消异常）
- Windows `frame()`：`dt = Math.min(0.05, (now-prev)/1000)` → **秒**。
- 微信旧代码：`game.tick(dtMs)` 直接传毫秒。
- 引擎 `tick`：`time += dt`、`clock += dt*1000`、`shake -= dt*4`、`p.x += p.vx*dt`。
- 传毫秒会让动画推进快 ~1000 倍、三消延时瞬间结算、粒子速度异常 → 表现为"游戏不能正常进行"。

### 根因 4：点击只判牌、不判 UI 按钮
- Windows `onDown`：先 `getUI + hitButton` 判按钮，未命中才 `cardAt` 判牌。
- 微信旧代码：只 `hitCard` 判牌。Canvas 若绘制按钮则点不到 → "能进入不能游戏"的另一半原因。

### 根因 5：真机首测历史 bug（已在 v0.2.1 修复）
- canvas id 曾为 `gameCanvas`（大写），真机 SelectorQuery 大小写敏感导致节点找不到 → 画布初始化失败/白屏。已改小写 `gamecanvas`。

## 排除项（实测证明不是这些原因）

| 怀疑项 | 验证 | 结论 |
|---|---|---|
| createNewGame 生成失败 | Node 直跑：关卡1=30张/关卡2=255~273张，均成功 | 排除 |
| 牌坐标越界 | 第一关 x165~495/y352~704，第二关 x33~594/y308~704，均在 720×1280 内 | 排除 |
| 命中判定错误 | 两关中心点命中同一张牌，pick 成功（槽位 0→1） | 排除 |
| drawBoard 无牌可画 | boardCount 与 cards 一致，筛选后有余牌 | 排除 |
| Canvas 2D 绘制函数不兼容 | 4 万+ 次绘制调用、0 异常，含胜负/暂停/设置面板（见 `MINIPROGRAM_RENDER_DIAGNOSTIC.log`） | 排除 |

## 修复措施

1. `core/index.js` 补全 15 个原版渲染/交互函数导出，`tools/build-core.mjs` 重打包。
2. `renderer/canvas-renderer.ts` 按 Windows `frame()` 顺序重制：
   drawBackground → [title? drawTitleScreen : drawBoard→drawSlot→drawTools→drawHUD→drawFx→drawOverlay] → drawUninstallConfirm/drawSettingsPanel。
3. 删除 WXML 自建 HUD/道具栏/工具栏/弹窗，只留全屏 canvas（index.wxml/wxss）。
4. `pages/game/index.ts` 的 `onTouchStart` 复刻 Windows `onDown`：先 UI 按钮命中 + `handleButton`（全部按钮分支），再判牌；胜负/暂停/设置面板由 Canvas overlay 呈现并通过 Canvas 按钮驱动。
5. `frame()` 时间单位毫秒→秒；分阶段 try/catch + 阶段日志；RAF 单帧异常不终止；onShow/onHide/onUnload 正确管理；performance 全局兜底。
6. 渲染前输出规格四要求的全部诊断字段（`[mah][render-diag]`）。

## 修复后验证

- 完整原版渲染链：12 个绘制阶段全部通过，41926 次绘制调用，0 错误（见 `MINIPROGRAM_RENDER_DIAGNOSTIC.log`）。
- TypeScript：`tsc --noEmit` 0 错误。
- 规则/生命周期/道具/预检/1000 局等回归测试：见 `MINIPROGRAM_TEST_REPORT.md`。
- 真机（Android/iOS）：**未验证**（本环境无微信开发者工具、无真机，需用户在真机确认）。
