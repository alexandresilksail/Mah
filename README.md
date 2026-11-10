# Mah 了个 Mah

> 一款原创的「堆叠卡牌三消」休闲小游戏：点击未被遮挡的麻将牌收入底部槽位，三张相同自动消除。
> Tauri 2 + 原生 HTML/CSS/JS + Canvas，全部美术、音效与背景音乐都由代码实时生成。

---

## 0. 直接开玩（网页版，推荐）

`dist/Mah了个Mah.html` 是**单个 HTML 文件**（约 76 KB，零外部依赖）；同目录还有
`Play-MahLeMah.cmd`——双击后会用 Edge/Chrome 的**无边框窗口**（`--app` 模式）打开游戏，
观感接近桌面程序，不需要安装任何东西。

- 双击即用浏览器打开就能玩，不需要装 Node、Rust、WebView2，也不需要起服务器；
- 手机浏览器打开同一个文件/链接也能玩（720×1280 自适应缩放）；
- 想放到网上：把 `dist/index.html` 丢到任意静态空间（GitHub Pages / 对象存储 / 腾讯云 COS）即可。

**浏览器兼容性**：任意 2020 年之后的现代浏览器都能直接跑 —— Chrome / Edge / Firefox /
Safari / 360 / QQ / 夸克 / Opera / Brave / Vivaldi 等，包括 `file://` 本地双击。
游戏不加载任何外部资源（无 `<img>` / `<link>` / `@font-face` / fetch），不用 ES module，
也不发起网络请求，所以没有跨域和 MIME 类型问题；`localStorage` 和 Web Audio 都做了
`try/catch` 降级，被浏览器禁用时只是不存档 / 不发声，不会白屏。

Edge / Chrome 只在 `Play-MahLeMah.cmd` 里被用来开 `--app` 无边框窗口；**找不到它们时会
自动退回系统默认浏览器，玩法与功能完全一样**。主产物用了可选链 `?.`、空值合并 `??` 和
`ctx.ellipse()`，**IE 系列请改用下面的兼容版**。

---

## 0.1 老浏览器兼容版（IE8 / IE9 / IE10 / IE11）

`dist/MahLeMah-legacy.html`（约 110 KB）是**纯 ES5 的第二个单文件产物**，零外部依赖、
可离线双击。它不替换现代版：现代版保持 60fps 与完整像素美术，兼容版负责把门槛压到 IE8。

| 环境 | 渲染 | 结果 |
|---|---|---|
| 现代浏览器 / IE11 | Canvas 2D | 完整画面（兼容版也通吃，只是体积更大） |
| IE10 / IE9 | Canvas 2D + 垫片 | 完整牌面；无 Web Audio → 静音；无 `ctx.filter` → 投影退化为硬边 |
| **IE8 / IE7** | **无 Canvas → DOM 降级** | 方块牌 + 系统字体文字；玩法、关卡、遮挡判定、道具、存档、音乐开关全部一致，只是没有圆角 / 渐变 / 柔化投影 / 音效 |
| IE6 及更早 | — | 不保证（盒模型与 `position:fixed` 都不完整） |

360 / QQ / 搜狗等双核浏览器请切「极速模式」；「兼容模式」是 IE 内核，会走 DOM 降级。
安装包里同时带两个 HTML，桌面快捷方式仍指向现代版；老 IE 里直接双击
`MahLeMah-legacy.html` 即可。

重新生成：

```bash
npm install             # esbuild + Babel + acorn（仅开发期）
npm run build:web       # → dist/Mah了个Mah.html / index.html / MahLeMah.html
npm run build:legacy    # → dist/MahLeMah-legacy.html（含 ES5 语法校验）
npm run build:all       # 两个一起
```

> 网页版存档走 `localStorage`；桌面版走安装目录下的 `MahLeMah_Data/save.json`。

---

## 0.5 两种 Windows 交付物（Portable 绿色版 + NSIS 安装版）

v2.0.0 提供**两种相互独立、分别命名、分别构建**的 Windows 产物，绝不混淆：

| 交付物 | 文件 | 形态 | 卸载方式 | 数据策略 |
|---|---|---|---|---|
| **A · Portable 绿色版** | `dist/MahLeMah-Portable-v2.0.0.zip` | 解压即得 `MahLeMah.exe` + `WebView2Loader.dll`，零安装 | 删整个解压目录 | 删目录即净；要留档先备份 `MahLeMah_Data` |
| **B · NSIS 安装版** | `dist/MahLeMah-Setup-v2.0.0.exe` | 标准 NSIS 安装程序（amd64 原生） | 设置→应用 / 开始菜单「卸载」 | 标准卸载入口 + 卸载确认流程，**默认保留存档** |

两种产物共用同一份 `MahLeMah.exe`，文件清单一致（主程序 + WebView2 运行依赖）；
区别只在**分发形态与卸载入口**。

```bash
npm run build:portable   # → dist/MahLeMah-Portable-v2.0.0.zip
npm run build:nsis       # → dist/MahLeMah-Setup-v2.0.0.exe（需 64 位 makensis）
npm run build            # = build:portable && build:nsis
npm run release          # → dist/SHA256SUMS.txt（为全部交付物生成校验和）
```

> 关于「绿色版不写注册表」：桌面端数据全部落在 `<exe 同级>/MahLeMah_Data`，不写
> `%APPDATA%` / `%LOCALAPPDATA%`（WebView2 缓存也用 `WEBVIEW2_USER_DATA_FOLDER` 重定向进该目录）。
> 安装版会用 `HKCU\...\Uninstall\MahLeMah` 写一条**标准卸载注册表项**（这是安装程序的职责，不是游戏本身），
> 提供「设置 → 应用和功能」里可见的卸载入口——这是 NSIS 安装版的规范行为，与「游戏内自删除」无关。

---

## 1. 目录结构

```
mah-le-mah/
├── package.json                  # devDeps: @tauri-apps/cli / esbuild / babel / acorn
├── README.md  DELIVERY.md  RELEASE_NOTES.md
├── TEST_REPORT.md  SECURITY_AUDIT.md  reports/DIFFICULTY.md
├── src/                          # 前端（Tauri frontendDist 直接指向这里，零打包）
│   ├── index.html  styles.css
│   ├── compat.es5.js             # ES5 垫片：Map/Set/事件/计时/Canvas 补丁
│   ├── main.js                   # 启动、缩放、输入、主循环、存档、音乐接管
│   └── game/
│       ├── config.js             # 单一常量源：66×88 / 半格晶格 / 槽位 / 遮挡阈值 / 音乐按钮
│       ├── tile_types.js         # ★ v2.0.0：16 种牌型的唯一注册表（ID/名称/配色）
│       ├── layout_templates.js    # ★ v2.0.0：两关独立布局模板 + 严格校验（validate/clamp 分离）
│       ├── layout.js             # 模板 → 牌坐标；几何遮挡判定；peelOrder
│       ├── generator.js          # 漏斗发牌 / 可解性证书 / 六策略机器人模拟
│       ├── seed_pool.js          # 离线验收 seed 池（L2 用）
│       ├── robots.js             # ★ v2.0.0：六种难度评估机器人
│       ├── tiles.js              # 16 种牌面绘制 + 分级压暗 + 离屏精灵缓存
│       ├── engine.js             # 槽位函数 + Game 类（规则、道具、延迟消除）
│       ├── render.js             # 界面绘制 + 设置面板 + 音乐/音效图标
│       ├── audio.js              # Web Audio 合成音效（独立开关/音量）
│       ├── music.js              # ★ v2.0.0：原创背景音乐引擎（Web Audio 合成）
│       ├── music_tracks.js       # ★ v2.0.0：两关原创旋律数据
│       └── dom_view.es5.js       # 无 Canvas 时的 DOM 降级渲染器
├── test.js                       # Node 纯逻辑验证（npm test，996 项断言）
├── src-tauri/
│   ├── Cargo.toml                # release 体积优化 + serde_json（存档校验）
│   ├── tauri.conf.json           # bundle.targets=["nsis"]；最小权限
│   ├── capabilities/default.json # core:default，无任何 fs 删除 capability
│   ├── icons/
│   └── src/main.rs              # 零注册表写；4 个白名单 IPC（load/save/reset/data_dir）；存档加固
├── dist/                         # 产物（构建后生成）
│   ├── MahLeMah-Portable-v2.0.0.zip  # ★ A·便携版（exe + WebView2Loader + 说明）
│   ├── MahLeMah-Setup-v2.0.0.exe    # ★ B·NSIS 安装版
│   ├── MahLeMah.html  MahLeMah-legacy.html  Mah了个Mah.html  index.html
│   └── SHA256SUMS.txt
└── tools/
    ├── gen_icon.py  build_web.mjs  build_legacy.mjs
    ├── build_portable.mjs  build_nsis.mjs  make_installer.nsi  make_release.py
    ├── test_logic.mjs  test_render.mjs
    ├── tune.mjs  tune_pool.mjs  stress_release.mjs
```

## 2. 环境要求

> 只想玩网页版 / 只想改前端，**下面这些都不用装**，有浏览器就够。

| 组件 | 版本 | 说明 |
|---|---|---|
| Node.js | ≥ 18 | 只用来跑构建脚本与测试 |
| Rust | ≥ 1.77.2 | `rustup` 安装；**本机用 GNU 工具链**（`stable-x86_64-pc-windows-gnu`） |
| MinGW-w64 | winlibs 16.x | 提供 GNU 链接器（`ld.exe` / `dlltool.exe` / `windres`） |
| **64 位 makensis** | negrutiu/nsis ≥ 3.13 | 编译 NSIS 安装包。**官方 NSIS 只有 32 位，在「系统禁跑 32 位 PE」的机器上不可用**，脚本会自动下载 amd64 版本 |
| WebView2 Runtime | 任意 | Win11 自带；Win10 若缺失，程序启动时弹原生提示并打开官方下载页 |

## 3. 构建两种 Windows 产物

```bash
cd mah-le-mah
npm install
npm run build            # 先 build:portable（cargo 编译 exe），再 build:nsis（makensis 编译安装包）
npm run release          # 为 dist/ 全部交付物生成 SHA256SUMS.txt
```

产物：

```
dist/MahLeMah-Portable-v2.0.0.zip   # 解压 → MahLeMah.exe + WebView2Loader.dll + 便携版说明.txt
dist/MahLeMah-Setup-v2.0.0.exe      # NSIS 安装程序（amd64）
```

`build:portable.mjs` 会用 `cargo build --release --target x86_64-pc-windows-gnu` 编译
`MahLeMah.exe`（已做 LTO/strip/opt-level=z 瘦身，约 2.9 MB），连同 `WebView2Loader.dll`
装进绿色目录后打 zip。`build_nsis.mjs` 调用 64 位 `makensis` 把同一份文件编译成安装包。

> 若机器只有 MSVC 工具链，把 `build:portable.mjs` 第一候选改成 `cargo build --release`
> 即可；Tauri 官方 NSIS 打包器同理需要 64 位 makensis，本仓库统一改用 negrutiu 的 amd64 构建。

纯前端预览（不启动 Tauri）：

```bash
cd src && python -m http.server 8765
# http://127.0.0.1:8765/index.html
# 调试：?lv=2 | ?lv=2&demo=lose | ?demo=win | ?demo=pause | ?demo=used
```

---

## 4. 玩法与关卡（断崖式两关制）

**只有两关**，通关第 2 关即「毕业」。两关都包含**完整的 16 种牌型**。

| 关卡 | 牌数 | 结构 | 牌型 | 洗牌 | 撤销 | 移出 3 张 | 复活 | 定位 |
|---|---|---|---|---|---|---|---|---|
| 1 | **48** | 三层紧凑金字塔（7×3 / 5×3 / 4×3，单区域） | **16** | 3 | 3 | 3 | 1 | 教学关，正常玩必过 |
| 2 | **240** | 多区域交叉遮挡（中央主堆 + 左右盲盒长条 + 底部保留区） | **16** | 3 | 3 | 3 | 1 | 正式关，强难度 |

牌型为原创 16 种（见 `src/game/tile_types.js` 唯一注册表），全部为 Canvas 路径绘制、独立配色：

```
幺鸡 红中 青發 蓝框 金筒 三筒 双竹 五竹 梅花 兰花 金菊 锦鲤 弯月 朝阳 祥云 星芒
```

每种牌型在两关里 ID 与配色完全一致；缩小到手机尺寸靠「色相 + 图案形状」双重区分。
L1 每种 3 张（16×3=48）；L2 各类型组数不同（共 80 组 ×3 = 240）。

### 4.1 布局模板系统（`src/game/layout_templates.js`）

两关由**明确的模板数据**驱动，不靠手写坐标散落各处：

- **L1_TUTORIAL**：单区域 `core`，3 层 `[21,15,12]`，紧凑金字塔，无跨区域遮挡；
- **L2_MULTI_ZONE**：4 区域 `core[45,39,33,27,21,9,6]`（7 层）+ `sideLeft[4,4,4]` +
  `sideRight[4,4,4]` + `reserve[18,18]`，共 240 张；区域在坐标上互相咬合，
  主堆外沿被两侧条压住、底沿被保留区压住，上层消除后逐层暴露下层。

**校验与归一职责分离（测试有效性核心）**：

- `validateTemplate(原始模板)`：**严格校验，不修改任何数值**。数组长度不一致、牌数非法、
  网格容量不足、坐标不在半格晶格 / 越界、全局层号重复、`crosses` 目标不存在或与几何不符
  —— 一律直接报错，**不静默修正、不自动截断**。
- `clampTemplate(原始模板)`：先跑 `validateTemplate`，非法直接 `throw`；合法时只做默认值填充与
  数组复制。它是运行时防御性归一（`templateFor` 用），**不再被 validateTemplate 调用**。

所有坐标落在半格晶格整数倍上（零随机抖动），同层相交面积恒为 0，外扩 4px 后连通分量 = 1。

### 4.2 核心规则（`src/game/engine.js`）

- 点击可点牌 → 飞入 7 格槽位；**若槽内已有同花色牌，插到最右侧那张同花色之后**，否则放最右端；
- 同花色满 3 张 → 先播入槽动画，**延迟 200ms 再消除**，`pendingMatch` + `resolving` 防重入；
- 入槽后 7 格已满且未触发消除 → 判负；
- 遮挡是**几何判定**：存在 `z` 更高且仍在盘面的牌，与本牌矩形交集 `> TILE_AREA * 0.10`
  即被压住，不可点、渲染时整牌叠 `rgba(0,0,0,0.45)` 起的分级压暗
  （压深每多一层 +0.05，上限 0.62）；可点牌保持亮度并加浅色描边；
- 道具：洗牌（只重排盘面剩余牌的 `type`，每种花色数量不变）、撤销（历史栈回退一步）、
  移出（槽内最左 3 张，不足 3 张则全部移入临时区，点击临时区可放回）各 3 次；
- 复活 1 次：**只清空槽位与临时区，不赠送 / 不重置道具**。

`slotInsert` / `slotMatchTypes` / `resolveSlot` / `isCovered` 都是不依赖 DOM 的纯函数，
Node 里可直接 `import` 做断言。

### 4.3 六种难度评估机器人（`src/game/robots.js`）

难度系统用六种策略机器人量化关卡可解性与难度，每种策略**只实现一次**、互不重复：

| 策略 | 行为 | 用途 |
|---|---|---|
| `random` | 随机点可点牌 | 难度门槛下限（必败证明「不乱点不行」） |
| `greedy` | 优先凑三消（完整信息） | 证明「关卡可解」 |
| `noisy` | greedy + 10% 失误 | 衡量失误惩罚 |
| `lookahead` | 1 步前瞻，避免把自己逼进死局 | 强策略上界 |
| `montecarlo` | 随机浅模拟选最优即时动作 | 中等偏强 |
| `search` | 受限回溯搜索 | 强策略上界（决策最慢） |

发布压力测试每关 **1000 seed × 6 策略 = 6000 局**（见 `reports/DIFFICULTY.md`）：
L1 贪心 98.7% 通关，L2 贪心 72.7% / 前瞻 91.2% 通关，random 在两关均 0%。
**证书 / 可解性 verify 1000/1000 全过**——即每局生成的牌堆都保证可解，不会产出死局牌堆。

> 口径：随机机器人 100% 失败**不构成**「难度成功」的证据，只是难度门槛之一；
> 完整信息贪心的高通关率只证明「关卡可解」，不代表真实玩家难度。

---

## 5. 原创背景音乐系统（v2.0.0）

保留现有 `audio.js` 音效系统（程序化合成，独立开关与音量），**新增**原创背景音乐，
全部用 Web Audio API **实时合成，不复制任何版权音乐、不含任何音频文件**：

- `src/game/music_tracks.js`：两关独立旋律数据——
  - **第 1 关**：轻松明亮，木琴 / 钟琴 / 钢琴音色；
  - **第 2 关**：稍快节奏、低音脉冲、适度紧张感。
- `src/game/music.js`：背景音乐引擎，关键约束全部落地：

| 需求 | 实现 |
|---|---|
| 背景音乐独立开关 | `bgmOn` 与音效 `sfxOn` 分离 |
| 音效独立开关 | `audio.js` 的 `sfxOn` |
| 背景音乐独立音量 | `musicVol`（0~1），独立于 `sfxVol` |
| 音效独立音量 | `sfxVol`（0~1） |
| 两关独立主题 | `setTrack(1/2)` 切换旋律数据 |
| 关卡切换淡入淡出 | `crossfade()` 200ms 增益过渡 |
| 循环 | 旋律序列循环播放 |
| 暂停 / 恢复 | `pause()` / `resume()`（增益渐变） |
| 切换后台 / 恢复 | 监听 `visibilitychange`，后台静音、回前台恢复 |
| 设置持久化 | 写入存档 `music` / `musicVol`（与旧档兼容：缺字段默认开） |
| 不允许重复实例 | `getMusic()` 单例，第二次 `new` 直接抛错 |
| 失败不崩溃 | 全部 `try/catch`，AudioContext 不可用只是无声 |
| 首次交互后启动 | 首个 `pointerdown` 时 `resume()`，兼容自动播放限制 |

`test.js` 静态验收：音乐系统含 `catch` 容错、不含任何 `.mp3/.wav/.ogg` 文件、单例不重复创建、
持久化与旧档兼容均逐项断言通过。

---

## 6. 体积控制

| 手段 | 效果 |
|---|---|
| 无前端框架、无 UI 库、无打包器 | 前端资源 ≈ 70 KB 纯文本 |
| 无任何图片/字体/音频文件 | 0 KB 资源，全部代码 / 实时合成生成 |
| Rust `opt-level="z"` + `lto` + `strip` + `panic="abort"` + `codegen-units=1` | 主程序约 2.9 MB |
| 不捆绑 WebView2 | 直接用系统运行时，避免 +100 MB |

---

## 7. 验收清单

**结构断言（`node test.js`，失败即 `process.exit(1)`，实测 996 项全过）**
- [x] 16 种牌型注册表：ID/名称/配色三元组唯一，`validateRegistry()` 通过
- [x] 第 1 关 48 张 / 单区域 3 层 / 16 种各 3 张
- [x] 第 2 关 240 张 / 4 区域 / 16 种（组数不同，共 80 组 ×3）
- [x] 两关模板 `validateTemplate` 严格校验通过（无静默修正）
- [x] 模板反例全部被拒：非法坐标 / 容量不足 / 长度不一致 / 层号重复 / 漏声明交叉遮挡
- [x] 同层相交面积恒为 0；坐标落半格晶格整数倍；零随机抖动；连通分量 = 1
- [x] L1 / L2 可解性证书 + 几何复核 1000/1000（发布测试）
- [x] 槽位插入 / 三消 / 200ms 延迟防重入 / 撤销 / 移出临时区 / 洗牌 / 复活
- [x] Tauri 配置 `bundle.targets=["nsis"]`；Rust 存档加固（64KB 上限 + 字段白名单 + 版本校验 + 原子写）
- [x] 音乐系统：单例不重复、零音频文件、容错、持久化、旧档兼容

**硬指标（全部达标）**
- [x] L1 greedy 通关率 ≥ 50%（实测 98.7%）；L1 可解性 1000/1000
- [x] L2 证书 verify 1000/1000（每局可解，零死局牌堆）
- [x] random 两关均 0%（难度门槛成立）
- [x] 验收 seed 池存在（L2 用，240 个）；运行时生成平均 35ms ≤ 400ms

**软指标（如实报告，不改阈值、不改测试让它变绿）**
- [ ] **✗ 带 10% 失误玩家通关率 ≤30%** —— L2 noisy 实测 54.8%（失误惩罚已体现：greedy 72.7% > noisy 54.8%）
- [ ] **✗ 失败局进度中位数 ≥50%** —— L2 greedy 实测 28.7%（死局相对后置，但阈值偏严）
- [ ] **✗ 平均槽位占用 ≥3.0** —— L2 实测 2.71（结构上限使然）
- [ ] **✗ 开局可点花色 ≥10 种** —— L2 实测 9.0（仍在合理区间）
- 阈值、测试逻辑、实测值均未改写；详见 `reports/DIFFICULTY.md` 与 `TEST_REPORT.md`。

**构建与兼容**
- [x] `npm test` = `node test.js && node tools/test_render.mjs`；渲染冒烟全过
- [x] `npm run build:web` / `build:legacy`：两个单文件 HTML 均生成
- [x] `npm run build`：Portable zip + NSIS exe 均真实生成
- [x] 安装→卸载真实验证：标准卸载入口 / 注册表 / 开始菜单均正确创建与清理；卸载默认保留存档

---

## 8. 知识产权自查

1. **无任何外部素材**：仓库内不存在图片、音频、字体、视频文件；`icons/` 下的 PNG/ICO 由
   `tools/gen_icon.py` 现场生成。
2. **16 种牌型为原创符号集**：幺鸡 / 红中 / 青發 / 蓝框 / 金筒 / 三筒 / 双竹 / 五竹 / 梅花 / 兰花 /
   金菊 / 锦鲤 / 弯月 / 朝阳 / 祥云 / 星芒——均为本项目 Canvas 路径绘制，未参考任何商业游戏。
3. **背景音乐原创**：两关旋律由 `music_tracks.js` 的音符数据 + `music.js` 的 Web Audio 合成实时生成，
   不复制《羊了个羊》或其他受版权保护的音乐。
4. **Logo / 文案 / 算法 / 音效** 均为本项目原创实现。

---

## 9. 常见问题

| 现象 | 处理 |
|---|---|
| `cargo: command not found` | 安装 Rust：<https://rustup.rs>，并 `rustup toolchain install stable-x86_64-pc-windows-gnu` |
| NSIS 安装包没生成 | 需要 64 位 makensis；`build_nsis.mjs` 会自动下载 negrutiu/nsis（amd64） |
| 启动白屏 | 检查 `frontendDist` 是否指向 `src`；dev 构建按 `F12` 看控制台 |
| 提示缺少 WebView2 | 程序弹原生提示并打开官方下载页，安装后重启即可 |
| 存档不生效 | 确认 exe 所在目录可写（不要放在 `C://Program Files` 下）；浏览器预览用 localStorage |
| `MahLeMah_Data` 出现在桌面 | 因为 exe 就放在桌面。数据永远跟着 exe 走，这是绿色版的设计 |
| SmartScreen 拦截 | 未签名程序的正常提示，点「更多信息 → 仍要运行」 |
| 安装版卸载后残留 | 默认保留 `MahLeMah_Data`；如需一并删除，卸载时在询问框选「是」 |
