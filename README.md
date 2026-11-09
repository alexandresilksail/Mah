# Mah 了个 Mah

> 一款原创的「堆叠卡牌三消」休闲小游戏：点击未被遮挡的麻将牌收入底部槽位，三张相同自动消除。
> Tauri 2 + 原生 HTML/CSS/JS + Canvas，全部美术与音效由代码实时生成。

---

## 0. 直接开玩（网页版，推荐）

`dist/Mah了个Mah.html` 是**单个 HTML 文件**（约 67 KB，零外部依赖）；同目录还有
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

`dist/MahLeMah-legacy.html`（约 99.7 KB）是**纯 ES5 的第二个单文件产物**，零外部依赖、
可离线双击。它不替换现代版：现代版保持 60fps 与完整像素美术，兼容版负责把门槛压到 IE8。

| 环境 | 渲染 | 结果 |
|---|---|---|
| 现代浏览器 / IE11 | Canvas 2D | 完整画面（兼容版也通吃，只是体积更大） |
| IE10 / IE9 | Canvas 2D + 垫片 | 完整牌面；无 Web Audio → 静音；无 `ctx.filter` → 投影退化为硬边 |
| **IE8 / IE7** | **无 Canvas → DOM 降级** | 方块牌 + 系统字体文字；玩法、关卡、遮挡判定、道具、存档全部一致，只是没有圆角 / 渐变 / 柔化投影 / 音效 |
| IE6 及更早 | — | 不保证（盒模型与 `position:fixed` 都不完整） |

360 / QQ / 搜狗等双核浏览器请切「极速模式」；「兼容模式」是 IE 内核，会走 DOM 降级。
安装包里同时带两个 HTML，桌面快捷方式仍指向现代版；老 IE 里直接双击
`MahLeMah-legacy.html` 即可。

**兼容层怎么做的**（`src/compat.es5.js` / `src/game/dom_view.es5.js` / `tools/build_legacy.mjs`）：

- **构建**：esbuild 打成 IIFE → Babel `preset-env(targets: ie 8)` 转 ES5 →
  **acorn 以 `ecmaVersion: 5` 逐段解析验证** → 压缩后再验一次。Babel 8 已移除 `loose`，
  改用显式 `assumptions`（`iterableIsArray`、`set*` 系列）避免 `Symbol.iterator` 和
  `Object.defineProperty`；压缩必须指定 **`target: 'es5'`**：不给 target 时 esbuild 会把空的
  `catch(e){}` 压成 ES2019 的 `catch{}`，给 `es2015` 时它又有权把 `{c: c}` 打回对象简写 `{c}`，
  两种都是 IE8 语法错（后者还会静默退回"未压缩版"，产物从 87 KB 涨到 143 KB）。
- **两个只有兼容版才会踩的坑（都踩过，都已加自动体检）**：
  1. **`iterableIsArray` 把 Map/Set 当数组**。`for (const [k, v] of someMap)` 和
     `[...someMap.keys()]` 在现代构建里完全正常，转成 ES5 后却**一次都不进循环、也不报错**。
     本轮的真实事故：`tripletAssign` 里 `[...counts.keys()]` 变成 `[MapIterator]`、
     结尾的 `for (const [suit, n] of counts)` 直接空转 —— 结果（旧版三段发牌时期）**平稳期 140 张牌一张都没分到花色**
     （`type` 还是初始的 0），在画面上就是整片看不见的空位。
     现在 `build_legacy.mjs` 会先扫源码：只要发现"用 for...of 遍历一个 `new Map()`/`new Set()` 变量"
     或"展开 `.keys()/.values()/.entries()`"就直接点名文件行号。
  2. **迭代器相关的隐蔽性**：同样的写法在 `simulatePlayer` 里会让 `hard` 永远为 `true`
     （每一局都被误判成硬死局），在数据上表现为"难度统计莫名其妙变差"，而不是报错。
  除此之外，牌型分配的末尾加了一道兜底：任何一张牌只要 `type` 不是合法牌型，
  就强制从本局花色池里补一个 —— 宁可分布略微走样，也不能出现**看不见、又永远消不掉的隐形牌**。
- **垫片**：`Map`/`Set`/`URLSearchParams`/ES5 数组方法/`Object.fromEntries`/`Math.hypot`、
  `requestAnimationFrame`、`performance.now`、`console`、`Function.bind`、`ctx.ellipse`，
  以及 IE8 的 `Object.defineProperty` 降级（IE8 只对 DOM 对象支持它，Babel 的
  `_createClass` 和 esbuild 的 `__export` 都会踩到）。
- **事件与布局**：IE 全系列走 `mousedown`/`mousemove` + `touch`，不用 Pointer Events；
  视口尺寸用 `documentElement.clientWidth` 兜底；CSS 不用 `flex`/`min()`/`aspect-ratio`/`inset`，
  画布尺寸由 JS 算。
- **存档**：`async/await` 已从源码移除（否则转译要引入 regenerator + Promise）；
  同步走 `localStorage`，Tauri 的异步 IPC 改成不阻塞启动的兜底。
- **DOM 降级渲染器只负责「画」**：命中判定仍复用 `render.js` 的 `cardAt()` / `hitButton()`，
  逻辑坐标恒为 720×1280；只在离散状态变化时重建牌堆 div（第 2 关 222 个），悬停只改边框（IE8 扛得住）。

**验证方式**：本机 IE11 已被系统重定向到 Edge，开不了真文档模式，所以分两路 ——
① acorn `ecmaVersion:5` 保证 IE8 能**解析**；② CDP 在页面所有脚本之前注入
「IE8/9/10 的 API 环境」（抹掉 `Map`/`Set`/`Promise`/`Symbol`/rAF/Web Audio/Canvas），
实测 IE8 档 `hasCanvas=false`、222 张牌全部渲染、点牌进槽 `0→1`、零 JS 异常；
IE9/10 档走 Canvas 路径同样零异常。截图见 `.shots/ie8_sim.png` / `.shots/ie9_sim.png`，
本轮葫芦轮廓第二关的实机开局截图为 `.shots/l2_gourd_12.png`、
`.shots/l2_gourd_4621.png`、`.shots/l2_gourd_9473.png`。

重新生成：

```bash
npm install             # esbuild + Babel + acorn（仅开发期）
npm run build:web       # → dist/Mah了个Mah.html / index.html / MahLeMah.html
npm run build:legacy    # → dist/MahLeMah-legacy.html（含 ES5 语法校验）
npm run build:all       # 两个一起
```

> 网页版存档走 `localStorage`；桌面版走安装目录下的 `data/save.json`。

---

## 0.5 绿色单文件版（Windows，无安装、无注册表）

> 本轮重构彻底取消了安装包：**没有 MSI、没有 NSIS、没有 setup.exe，也不写任何注册表键值。**

构建产物是一个 `MahLeMah.exe`（Tauri 2，`bundle.targets = ["app"]`）：

1. 双击运行，没有安装向导、不请求管理员权限、不写 `%APPDATA%` / `%LOCALAPPDATA%`；
2. 首次启动在 **exe 同级**创建 `MahLeMah_Data`：
   - `MahLeMah_Data\save.json` —— 存档（原子写：先 `.tmp` 再 rename）
   - `MahLeMah_Data\webview\` —— WebView2 缓存（用 `WEBVIEW2_USER_DATA_FOLDER` 重定向，
     默认会落到 `%LOCALAPPDATA%`，本项目显式改掉）
3. 卸载：标题页或暂停面板里的红色 **「卸载并删除数据」** → 二次确认
   「确定要彻底删除本游戏及所有存档吗？」→ 清内存 → 删 `MahLeMah_Data` →
   退出进程 → 由分离的 cmd 进程删除 exe 自身。

```bash
npm run build      # Tauri 构建，产出 src-tauri/target/release/MahLeMah.exe
npm run release    # 打包 dist/MahLeMah-1.0.0-portable.zip（exe + README.txt）
```

> ⚠️ 当前这台开发机没有 MSVC 生成工具、且安全策略会拦截新编译出的构建脚本，
> 所以仓库里**暂时只有网页版产物**（`dist/MahLeMah.html`，双击即玩）。
> exe 需在装有 VS2022 C++ 生成工具的 Windows 上 `npm run build` 得到，
> 细节与已排查记录见 [3.1 本机构建限制](#31-本机构建限制重要换机器即可解决)。

> **为什么没有注册表**：WebView2 是否安装不再用 `reg query` 探测；启动失败时直接弹原生
> MessageBox 并打开官方下载页。安装器、快捷方式、`HKCU\...\Uninstall` 全部移除，
> 卸载完全由程序自己完成。`rg -i "HKCU|HKLM|winreg|reg query"` 在源码里应当只剩注释。

---

## 1. 目录结构

```
mah-le-mah/
├── package.json                  # devDeps: @tauri-apps/cli / esbuild / babel / acorn
├── README.md
├── src/                          # 前端（Tauri frontendDist 直接指向这里，零打包）
│   ├── index.html
│   ├── styles.css                # 纯 CSS 渐变背景，无位图
│   ├── legacy.css                # 兼容版专用 CSS
│   ├── compat.es5.js             # ES5 垫片：Map/Set/事件/计时/Canvas 补丁
│   ├── main.js                   # 启动、缩放、输入、主循环、卸载流程
│   └── game/
│       ├── config.js             # 单一常量源：66×88 / 半格晶格 / 槽位 / 遮挡阈值
│       │                          + LAYER_SHAPE / BAND_RATIOS / FUNNEL
│       ├── rng.js                # mulberry32 可复现随机
│       ├── draw.js               # 圆角矩形/文字/缓动/矩形重叠度
│       ├── tiles.js              # 15 种传统麻将牌面（含幺鸡路径）+ 分级压暗 +
│       │                          可点描边 + 离屏精灵缓存
│       ├── logo.js               # 原创「小福神」Logo
│       ├── layout.js             # 葫芦轮廓几何：层基准按 seed 浮动 / 肚子 / 支撑 /
│       │                          压迫感统计 / peelOrder
│       ├── generator.js          # 25/30/45 三带漏斗发牌 / 证书 / 四种机器人
│       ├── seed_pool.js          # 方案 b 的 240 个离线验收 seed
│       ├── engine.js             # 槽位函数 + Game 类（规则、道具、200ms 延迟，未改动）
│       ├── render.js             # 界面绘制 + 分级压暗 + 牌堆离屏缓存 + 卸载面板
│       ├── dom_view.es5.js       # 无 Canvas 时的 DOM 降级渲染器（槽位坐标读 game.layout.slot）
│       ├── audio.js              # Web Audio 合成音效（未改动）
│       └── store.js              # Tauri IPC：MahLeMah_Data 存档 / 一键卸载（未改动）
├── test.js                       # Node 纯逻辑验证（npm run test:sim，1905 项断言）
├── src-tauri/
│   ├── Cargo.toml                # release 体积优化（opt-level=z / LTO / strip / panic=abort）
│   ├── build.rs
│   ├── tauri.conf.json           # bundle.targets=["app"] → 单文件 exe，无安装包
│   ├── capabilities/default.json # core:default + fs:allow-remove（卸载用）
│   ├── icons/                    # 由 tools/gen_icon.py 生成
│   └── src/main.rs               # 零注册表；5 个 IPC 命令；数据目录；退出后自删 exe
├── dist/                         # 产物
│   ├── MahLeMah-1.0.0-portable.zip  # ★ exe + README（构建后生成）
│   ├── MahLeMah.html             # 单文件网页版：双击即玩
│   ├── MahLeMah-legacy.html      # ES5 兼容版（IE8 起可用）
│   └── index.html                # 可直接部署到静态托管
└── tools/
    ├── gen_icon.py               # 纯 Python 生成 PNG/ICO（不依赖 PIL）
    ├── build_web.mjs             # esbuild 打包 + 内联 CSS/JS → 单文件 HTML
    ├── build_legacy.mjs          # Babel → ES5 兼容版
    ├── test_logic.mjs            # 历史入口：转发到 test.js
    ├── test_render.mjs           # 渲染冒烟（25 场景）+ 卸载 UI 断言 + --shots 实机 PNG
    ├── tune.mjs                  # 现场体检：两关 × 四种机器人批量模拟
    ├── tune_pool.mjs             # 方案 b：离线扫描候选 seed → 生成 seed_pool.js
    └── make_release.py           # 打包 dist/MahLeMah-1.0.0-portable.zip
```

## 2. 环境要求（仅构建桌面 exe 需要）

> 只想玩网页版 / 只想改前端，**下面这些都不用装**，有浏览器就够。

| 组件 | 版本 | 说明 |
|---|---|---|
| Node.js | ≥ 18 | 只用来跑 `@tauri-apps/cli` |
| Rust | ≥ 1.77.2 | `rustup` 安装，**必须 MSVC 工具链** |
| Visual Studio Build Tools | 2022 | 勾选「使用 C++ 的桌面开发」（含 MSVC linker + Windows SDK） |
| WebView2 Runtime | 任意 | Win11 自带；Win10 若缺失，程序启动时弹原生提示并打开官方下载页 |

确认：`cargo -V`、`rustc -V`、以及 `where link`（应指向 MSVC 的 `link.exe`）。

## 3. 构建绿色单文件 exe

```bash
cd mah-le-mah
npm install          # 只装开发依赖
npm run icons        # 可选：重新生成图标
npm run build        # = tauri build；bundle.targets=["app"] → 只出 exe
```

产物（**只有一个文件**，没有安装包）：

```
src-tauri/target/release/MahLeMah.exe
```

`tauri.conf.json` 的关键配置就是这一行：

```json
"bundle": { "active": true, "targets": ["app"] }
```

- `["app"]` = 只产出应用二进制，不调用 NSIS / WiX，不生成 `*-setup.exe`；
- 若写成 `"all"` 或包含 `"nsis"`，Tauri 会重新生成安装器，并写入
  `HKCU\...\Uninstall` —— 本项目的「零注册表」承诺会被破坏，所以刻意锁定为 `["app"]`。

打包分发 zip：

```bash
npm run release      # → dist/MahLeMah-1.0.0-portable.zip（MahLeMah.exe + README.txt）
```

### 3.1 本机构建限制（重要，换机器即可解决）

当前开发机**没能产出 `MahLeMah.exe`**，原因都在环境侧，与源码无关：

1. **没有 MSVC 生成工具**：`vswhere.exe` 不存在，`winget install Microsoft.VisualStudio.2022.BuildTools`
   在非交互会话里被 UAC 拦截（`0x800704c7`），无法提权安装 C++ 工作负载。
2. **改走 GNU 工具链后，仍被安全策略拦住**：已装好
   `rustup toolchain install stable-x86_64-pc-windows-gnu` + winlibs MinGW 16.2，
   交叉/宿主两种方式都试过，编译到第三方 crate 的构建脚本时报
   `拒绝访问。 (os error 5)`，且该 `.exe` 随后**连读取都被拒绝**
   （`OpenRead` → 访问被拒绝，`Test-Path` → 路径不存在）：

   ```
   error: failed to run custom build command for `serde_core v1.0.229`
   error: failed to run custom build command for `web_atoms v0.2.6`
   could not execute process `...\build\serde_core-*\build-script-build` (never executed)
     Caused by: 拒绝访问。 (os error 5)
   ```

   换成工作区外的 `CARGO_TARGET_DIR`、关闭沙箱、把 serde 固定到 1.0.219
   绕开 `serde_core`，都只是把拦截点推到下一个 crate（`web_atoms`），
   说明是本机对「新编译出来的可执行文件」做了访问控制，不是依赖冲突。

**因此**：本仓库交付的是可直接运行的 `dist/MahLeMah.html`（单文件、双击开玩）；
原生 exe 请在**任意一台装了 VS2022「使用 C++ 的桌面开发」**的 Windows 上执行
`npm install && npm run build`，产物即 `src-tauri/target/release/MahLeMah.exe`，
单文件、绿色、零注册表。

（若那台机器也只有 MinGW，可走 GNU 路线：
`rustup toolchain install stable-x86_64-pc-windows-gnu`，
把 MinGW 的 `bin` 加进 `PATH`，然后
`cargo +stable-x86_64-pc-windows-gnu build --release`。
但 Tauri 官方只支持 MSVC，GNU 产物未经官方验证，仅作应急。）

纯前端快速预览（不启动 Tauri）：

```bash
cd src && python -m http.server 8765
# http://127.0.0.1:8765/index.html
# 调试：?lv=2 | ?lv=2&demo=lose | ?demo=win | ?demo=pause | ?demo=used
```

## 4. 运行 / 卸载行为

- **没有安装步骤**：exe 放在任意目录（桌面、U 盘、`D://Games` 都行），双击就能玩；
  不请求管理员权限，不创建快捷方式，不写注册表。
- **数据目录**：`<exe 同级>\MahLeMah_Data`
  - `save.json`：`{ v, level, best, sound }`，原子写入；
  - `webview\`：WebView2 的 user data（缓存 / IndexedDB / GPU cache），
    通过 `WEBVIEW2_USER_DATA_FOLDER` 环境变量在创建窗口前重定向。
- **卸载（游戏内）**：标题页底部 / 暂停面板底部 → 红色「卸载并删除数据」→
  二次确认「确定要彻底删除本游戏及所有存档吗？」→
  1. 清空 `game.cards / slot / history / fx` 等运行时内存；
  2. `localStorage` 存档清除；
  3. Tauri `fs` 插件删除 `MahLeMah_Data`（失败则由 Rust 兜底）；
  4. `uninstall_app` 命令删除数据文件、启动分离的 cmd、`app.exit(0)`；
  5. cmd 等 3 秒后 `rmdir /s /q MahLeMah_Data` + `del /f /q MahLeMah.exe`。
- **手动卸载**：直接删 `MahLeMah.exe` 和 `MahLeMah_Data` 文件夹即可，系统里不留残留。

## 5. 玩法与关卡曲线（断崖式两关制）

**只有两关**，通关第 2 关即「毕业」。第 1 关到第 2 关的落差本身就是设计目标。

| 关卡 | 牌数 | 结构 | 牌型 | 洗牌 | 撤销 | 移出 3 张 | 复活 | 定位 |
|---|---|---|---|---|---|---|---|---|
| 1 | **24** | 3 层单堆（12 / 8 / 4） | **8** | 3 | 3 | 3 | 1 | 教学关，正常玩必过 |
| 2 | **222** | **7 层单堆**（基准 54/48/44/36/22/12/6，按 seed ±2 浮动） | **15** | **3** | **3** | **3** | 1 | 正式关，葫芦轮廓 + 三带漏斗 + 验收 seed 池 |

两关都**只有一个牌堆**：没有侧堆、没有多簇、没有簇间压叠、没有任何 x/y 随机抖动。
牌面已改为传统麻将 15 / 8 种（删除万子与数字牌），一条画成幺鸡；被压牌分级压暗、
可点牌加浅色描边。

### 5.1 单一常量源（`src/game/config.js`）

全项目只有一处定义牌面尺寸，任何层、任何关卡、任何数量都不缩放：

```js
TILE_W = 66;  TILE_H = 88;            // 严格 3:4，全项目唯一一对
LATTICE_X = 33;  LATTICE_Y = 44;      // 半格晶格步长
SLOT_CAPACITY = 7;
OVERLAP_THRESHOLD = 0.10;            // 与上层牌相交面积 / 牌面积 > 10% 即被压住
MATCH_DELAY_MS = 200;
CONNECT_PAD = 4;                     // 判定单堆连通时每张牌矩形外扩像素
```

`TILE_AREA = TILE_W * TILE_H` 由常量推导。第 2 关的层相位是固定表
`PHASE_X = [0,0,33,33,33,33,0]` / `PHASE_Y = [0,44,0,44,0,44,0]`（单位就是
`LATTICE_X / LATTICE_Y`），**零随机抖动**；第 1 关仍走逐层累加半格向量的旧几何。
仍被引用的旧导出名（`SLOT_SIZE` / `LAYOUTS[].tileW/tileH`）只作为指向同一常量的别名，
DOM 降级视图通过 `game.layout.slot` 读槽位坐标，不再硬编码。

| | 第 1 关 | 第 2 关 |
|---|---|---|
| **牌尺寸** | **66 × 88** | **66 × 88**（完全一致） |
| 层结构 | 3 层，层计划 12 / 8 / 4 | 7 层，基准 54/48/44/36/22/12/6（seed ±2 浮动，总和恒 222） |
| 上下层关系 | 层原点逐层累加半格错位向量，整数倍晶格 | 固定半格相位表，零抖动 |
| 外形 | 上窄下宽单堆 | **葫芦轮廓**：第 2、3 层比底层宽 ≥33px；第 5、6 层完整矩形 |
| 同层相交面积 | **恒为 0** | **恒为 0** |
| 单堆连通分量（矩形各外扩 4px） | **1** | **1** |
| 包围盒 | 落在 `BOARD_BAND` 内且整体居中 | 样例 660×616，居中偏移数像素 |
| 开局可点 | 10~14 张 | **32~33 张**（约束为总数 14%~20%） |

### 5.2 核心规则（`src/game/engine.js`）

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

### 5.3 教学关：可解但「随便点」仍可能死

L1 的规格前提是「`order` 前 9 张只用 3 种花色、其余 15 张用另外 5 种」，
共 8 种花色各 3 张；开局可点 8~12 张，横跨这 8 种花色。因此随机点法会在
7 格槽位里攒出 7 种单张，远早于凑齐三消 —— **随机机器人通关率实测 2.0%**，
软指标「≥30%」未达标，测试里如实标 `✗`，阈值和实测值都不改。
守住教学关的是两条可验证的硬保证：

1. `verify(l1)`：沿 `order` 用真实槽位规则回放，24 张全部清空且槽位归零；
2. 贪心机器人（优先凑三消）通关率 **99.5% ≥ 95%**。

### 5.4 实测难度（`node test.js`，每种 200 局固定种子组，均不使用道具）

```
关卡 / 机器人                  通关率       死局率       平均进度        中位进度
L1 随机机器人                  2.0%      98.0%     10.3%       0.0%
L1 贪心机器人                  99.5%     0.5%      99.5%       100.0%
L2 随机机器人                  0.0%      100.0%    0.1%        0.0%
L2 贪心机器人                  0.0%      100.0%    70.5%       70.3%
L2 贪心+10%失误               0.0%      100.0%    36.5%       32.4%
L2 浅层优先贪心                 0.0%      100.0%    1.0%        0.0%
```

硬指标全部达标：L2 四种机器人通关率全为 0%、进度 <30% 前死亡 0/200、
失败进度中位数 70.3%（目标 ≥65%）。死亡进度分档：
`60~70%: 93 / 70~80%: 98 / 80~90%: 9`，前 60% 一局都没死 ——
这就是「漏斗」形状：宽进、窄出、死局后置。

两项软指标未达标并如实标 `✗`：**L1 随机机器人 2.0%（目标 ≥30%）**，
以及「朴素点法同时挂起花色常 ≥8」—— 槽位只有 7 格，字面不可能成立，
实测峰值 5 种；「朴素点法槽位经常停在 5–6 格」实测仅 19.4%，也如实标 `✗`。
阈值、测试逻辑和实测值都没改。


## 6. 葫芦轮廓单堆 + 25/30/45 三带漏斗

### 6.1 几何：`generateLayout(seed, opt)`（`src/game/layout.js`）

整文件重写为第 3 轮的葫芦轮廓，旧的写死 plan / 多簇 / 抖动代码全部删除：

- **半格晶格**：`LATTICE_X = 33`、`LATTICE_Y = 44`；同层坐标 =
  `层原点 + (u·TILE_W, v·TILE_H)`，同层相交面积**恒为 0**；层原点只取
  固定相位表 `PHASE_X/PHASE_Y` 的 0 / 半格值，**零随机抖动**；
- **层张数按 seed 浮动**：`planForSeed(seed)` 以基准
  `LAYER_SHAPE.planBase = [54,48,44,36,22,12,6]` 为起点，每层 ±2 浮动后
  归一化回 222；`test.js` 对 50 个池内 seed 逐个断言 delta 不全为 0 且总和 222；
- **葫芦肚子**：第 2、3 层包围盒宽度 ≥ 第 0 层宽度 +
  `LAYER_SHAPE.bellyExtraPx = TILE_W/2 = 33`，且不越出 `BOARD_BAND`；
- **上层简单**：第 5、6 层各自完整无缺口矩形并水平居中；第 4 层填充率 ≥85%；
  第 0–3 层填充率 80%~90%，每层 ≥2 处边缘缺口，不做长方形；
- **支撑 / 连通 / 居中**：每张非底层牌与下一层至少一张牌相交 `> TILE_AREA*10%`；
  删除缺口时保护上一层支撑；`countComponents()` 外扩 4px 后连通分量恒为 1；
  包围盒 clamp 在 `BOARD_BAND` 内并居中；
- **压迫感** `pressureStats(cards)`：开局可点 14%~20%、其中 ≥40% 位于第 4–6 层、
  第 0–1 层开局被压 ≥90%、平均压深 ≥4.0、遮挡图最长链 = 7；
  50 个池内 seed 逐个 assert 全过（50/50）。

### 6.2 剥离顺序 `peelOrder`

先用 `buildBlockerGraph()` 建遮挡图（唯一定义：存在更高 `z` 且相交面积 > 10% 的牌），
再按波次拓扑剥离：每一轮把当前所有未被遮挡的牌作为一波取出，波内只用随机 key 打散，
**不再按 z 排序**。`order.waves` 保存每波在 `order` 上的 `[start,end)` 区间。
`verify(levelData)` 沿 `order` 用真实槽位规则回放，50 个种子 **50/50 全部通关**。

### 6.3 三带漏斗 25% / 30% / 45%（`src/game/generator.js`）

`buildFunnelSequence()` 直接按 `order` 的**位置**切三带，段长全部对齐到 3 的倍数；
旧的 `TOP_SUITS` / `TOP_RATIO` / `MID_RATIO` / `CROSS_GROUPS` 那套已整体删除。
222 张时实测边界为 `57 / 123 / 222`：

| 带 | order 占比 | 花色 | 三张间距 | 效果 |
|---|---|---|---|---|
| 上带 | 25% | ≥12 种（`TOP_SUIT_MIN`） | 紧邻 | 开局可点花色 ≥10 种、≥6 种各有 ≥3 张 |
| 中带 | 30% | 全花色池，`MID_SPAN=3` | 批内轮转拉开 | 部分成员落进下带，槽位开始变紧 |
| 下带 | 45% | 全花色池，`LONG_TAIL_GROUPS=3` | 长线 | 大量花色「前面已拿 1–2 张，最后一张埋最深处」 |

- **可解性证书**：`replayTypes(types)` 沿 `order` 做 O(n) 花色序列重放，
  要求全程槽位 `< 7` 且最终清空；`verify()` 再带几何复核一次。
  实测沿 `order` 同时挂起花色峰值 **3**（≤6），50 个种子 50/50 通关。
- 花色集合由 `tiles.js` 的 `suitsFor(level)` 给出：L2 15 种 / L1 8 种，
  **删除 `TYPE_LIST.slice(0, types)` 与万子**，每种张数 `%3 == 0`。
- **三个可调参数**都在 `src/game/config.js`：
  `LAYER_SHAPE.planBase`（层基准表）、`LAYER_SHAPE.bellyExtraPx`（肚子宽度）、
  `BAND_RATIOS`（三带比例 `[0.25, 0.30, 0.45]`）。

### 6.4 难度调优：最终用方案 b（离线工具 + seed 池）

方案 a（生成期爬山 `hillClimb()`）已实现并保留为可选：固定几何与 `order`，
反复交换中 / 底带两张牌的花色，先过证书再用贪心探局估计通关率，下降才保留。
实测小探针集会过拟合探针随机源：避开验收源复核后贪心通关率仍约 55%，泛化不足。

因此改用方案 b：

- `tools/tune_pool.mjs`（`npm run tune:pool`）离线扫描候选 seed，逐项筛
  葫芦几何 + 压迫感五项 + 发牌证书 / 开局花色条件 + 四种机器人全不通关 +
  多个泛化随机源 greedy 不通关 + 失败进度 ≥0.60；
  本轮实测扫描 **9473** 个候选、几何通过 4173 个、录取 **240** 个，耗时约 240s；
- `src/game/seed_pool.js` 存池与 `POOL_META`；`generateLevel(2)` 不传 seed 时
  `pickPoolSeed()` 抽一个，传 seed 时完全确定性复现（测试 / 回放走这条路）；
  **seed 池机制本轮未改**，只是用新规格重新生成了池内容；
- `FUNNEL.HILL_STEPS = 0`（默认关闭爬山）。运行时第 2 关生成实测
  **平均 18.2ms / 最大 83ms**（20 局），远低于 400ms 预算。

### 6.5 渲染（`src/game/tiles.js` / `src/game/render.js`）

- 统一 **66×88** 圆角矩形、象牙白牌面 + 底部厚度边；图案框是**正方形**并用
  `ctx.save()` + `ctx.translate()` 居中绘制，筒子圆环不会拉成椭圆；
- 牌面为传统麻将：幺鸡（归一化 `-1~1` 路径，外接框 ≤ 牌宽 65% × 牌高 70%）、
  字牌（東/南 黑、中 红、發 绿、白 蓝色空框）、筒子同心圆环、条子绿竹节加红点；
  **零阿拉伯数字、零额外文字标签**；
- 每张牌绘制前设 `ctx.shadowColor='rgba(0,0,0,0.5)'` / `shadowBlur=8` / `shadowOffsetY=5`，
  绘制完 `ctx.restore()` 立即重置（尺寸与强投影规则本轮未改）；
- 绘制顺序只有一套：`layer` 升序 → 同层 `y` 升序 → `x` 升序（`side` 分支已删除）；
- **分级压暗**：被压牌叠 `rgba(0,0,0,0.45)`，压深每多一层 +0.05、上限 0.62
  （`dimLevel = maxLayer - c.layer`）；可点牌保持原亮度并加
  `rgba(255,246,214,0.92)` 浅色描边；离屏缓存键含 `dimAlpha` 与 `playable`；
- `cardAt` 先判临时区，再把牌堆命中矩形按 `z` 降序，**从最高 z 往下取第一张可点牌**；
- 删除侧堆后槽位面板 / 道具栏重新排布（`SLOT_PANEL = {x:73,y:1024,w:574,h:124}`、
  `SLOT_PITCH=78`、`TOOL_XS=[150,360,570]`、`TOOL_Y=968`），界面不留空洞；
  `dom_view.es5.js` 的槽位坐标改从 `game.layout.slot` 读，不再硬编码旧值。

### 6.6 实机截图

本轮第二关 3 个池内 seed 的开局截图由 `node tools/test_render.mjs --shots`
（CDP 无头 Edge，720×1280）生成：
`.shots/l2_gourd_12.png` / `.shots/l2_gourd_4621.png` / `.shots/l2_gourd_9473.png`。
上一轮的两关对照图为 `.shots/funnel_l1.png` / `funnel_l2.png`（现代版）与
`funnel_legacy_l1.png` / `funnel_legacy_l2.png`（兼容版）。

肉眼观察（3 张一致）：中段第 2、3 层确实比顶部 / 底部更宽，能看出葫芦「肚子」；
带浅色描边的亮牌约 32~33 张，散布在牌堆中央与左右边缘，**不是集中在屏幕上方一行**
（规格里的「顶部」指 z 层第 4–6 层，其 x/y 位置可以落在任意处）；被压暗的
深灰牌连成一大片，深浅随压深有可辨差异；牌面无数字、66×88 不变形。


## 7. 体积控制

| 手段 | 效果 |
|---|---|
| 无前端框架、无 UI 库、无打包器 | 前端资源 ≈ 60 KB 纯文本 |
| 无任何图片/字体/音频文件 | 0 KB 资源，全部代码生成 |
| Rust `opt-level="z"` + `lto` + `strip` + `panic="abort"` + `codegen-units=1` | 主程序显著瘦身 |
| 不捆绑 WebView2 | 直接用系统运行时，避免 +100 MB |

实测单个 `MahLeMah.exe` 通常落在 **4~7 MB**，远低于 10 MB 上限。
构建后核对：`ls -lh src-tauri/target/release/MahLeMah.exe`。

## 8. 验收清单

**结构断言（`node test.js` / `npm run test:sim`，失败即 `process.exit(1)`，实测 1905 项全过）**
- [x] 所有牌 `w/h` 等于 `TILE_W/TILE_H` = **66×88**，比例严格 3:4，全项目唯一一对常量
- [x] 第 1 关 24 张 / 3 层（12/8/4）/ 8 种花色各 3 张
- [x] 第 2 关 222 张 / 7 层（基准 54/48/44/36/22/12/6，seed ±2 浮动）/ 15 种花色，每种 `%3 == 0`
- [x] 两关都只有一个牌堆；矩形各外扩 4px 后连通分量**恒为 1**
- [x] 同层相交面积**恒为 0**；所有坐标落在半格晶格整数倍上；零随机抖动
- [x] 所有牌矩形完整落在 `BOARD_BAND` 内，整体居中；第 2、3 层肚子 ≥ 底层 +33px
- [x] 第 5、6 层完整矩形；第 4 层 ≥85%；第 0–3 层 80%~90% 且每层 ≥2 处边缘缺口
- [x] 压迫感五项（14%~20% / ≥40% / ≥90% / ≥4.0 / 链=7）50 个池内 seed **逐个通过**
- [x] L2 15 种 / L1 8 种传统麻将花色，无万子、无阿拉伯数字、风牌 ≤2 种
- [x] L1 / L2 沿 `order` 各 **50/50**；上带 ≥12 种花色；挂起峰值 3 ≤ 6
- [x] 槽位插入 / 三消 / 200ms 延迟防重入 / 撤销 / 移出临时区 / 洗牌 / 复活

**硬指标（全部达标）**
- [x] L1 greedy 99.5% ≥ 95%；L1 沿 order 重放 50/50
- [x] L2 random 0.0% = 0%；greedy / greedy+10%失误 / 浅层优先 greedy 均 0.0%
- [x] L2 greedy 进度 <30% 前死亡 0/200 ≤ 5%
- [x] 验收 seed 池 240 个 ≥ 100；运行时生成最大 83ms ≤ 400ms

**软指标（如实报告，不改阈值、不改测试让它变绿）**
- [x] L2 greedy 失败进度中位数 70.3%（目标 ≥65%）
- [ ] **✗ L1 随机机器人通关率 2.0%（目标 ≥30%）** —— 见 5.3
- [ ] **✗ 朴素点法槽位 5~6 格占 19.4%**（「经常」为定性描述），7 格占 3.1%
- [ ] **✗ 朴素点法同时挂起花色常 ≥8** —— 槽位只有 7 格，字面不可能；实测峰值 5 种

**核心规则与渲染**
- [x] 7 格槽位；同花色插到最右侧同花色之后；满 3 张延迟 200ms 消除
- [x] 遮挡按几何相交面积判定（>10%），不是层数比较；被压牌不可点且压暗
- [x] 洗牌只重排盘面剩余牌花色；撤销有历史栈；复活只清槽不送道具
- [x] 每张牌强投影 `rgba(0,0,0,0.5) / blur 8 / offsetY 5`，绘制后立即重置
- [x] 绘制顺序 layer 升序 → 同层 y 升序 → x 升序（无侧堆分支）；hover 上浮 2px
- [x] 被压牌 0.45 起分级压暗（上限 0.62）；可点牌浅色描边；缓存键含压暗等级
- [x] `cardAt` 从最高 z 往下取第一张可点牌；被压牌不响应
- [x] 侧堆删除后槽位面板与道具栏重新排布，界面无空洞

**构建与兼容**
- [x] `npm test` = `node test.js && node tools/test_render.mjs`；渲染冒烟 25 个场景全过
- [x] `npm run build:web`：`dist/Mah了个Mah.html` 67.0 KB（单文件，零外部依赖）
- [x] `npm run build:legacy`：`dist/MahLeMah-legacy.html` 99.7 KB，acorn `ecmaVersion:5` 通过
- [x] 实机截图：`.shots/l2_gourd_12.png` / `l2_gourd_4621.png` / `l2_gourd_9473.png`
- [x] Tauri 配置、存档字段、卸载逻辑、音频、槽位规则/道具**未改动**


## 9. 知识产权自查

1. **无任何外部素材**：仓库内不存在图片、音频、字体、视频文件；`icons/` 下的 PNG/ICO 由
   `tools/gen_icon.py` 现场生成，可随时重跑复现。
2. **牌面为公有领域元素**：只使用传统麻将的「条/筒」与「東南中發白」等通用符号
   （本轮已删除万子与数字牌，一条画成原创路径的幺鸡），
   由本项目用 Canvas 路径自行绘制，未参考任何商业游戏的具体花色绘制、底纹、字体或图标风格。
3. **Logo 原创**：圆脸 + 福字帽 + 手持麻将牌的 Q 版形象由 `src/game/logo.js` 从头绘制。
4. **文案原创**：所有界面文案为本项目自写，未使用其他游戏的名称、角色名、口号或关卡名。
5. **算法与代码原创**：关卡生成、遮挡判定、渲染管线、输入处理、音效合成都为本项目实现。
6. **音效合成**：`audio.js` 用 OscillatorNode 与程序化噪声实时合成，无采样素材。

## 10. 常见问题

| 现象 | 处理 |
|---|---|
| `cargo: command not found` | 安装 Rust：<https://rustup.rs>，安装后重开终端 |
| `link.exe not found` / `msvc` 报错 | 安装 VS 2022 Build Tools，勾选「使用 C++ 的桌面开发」（含 Windows SDK） |
| 构建后只有 exe、没有 setup.exe | 正常。`bundle.targets=["app"]` 就是**故意不生成安装包** |
| 想改成安装版 | 把 `targets` 改成 `["nsis"]`，但这会重新引入注册表写入，违背本项目约定 |
| 启动白屏 | 检查 `frontendDist` 是否指向 `src`；dev 构建按 `F12` 看控制台 |
| 提示缺少 WebView2 | 程序弹原生提示并打开官方下载页，安装后重启即可 |
| 存档不生效 | 确认 exe 所在目录可写（不要放在 `C://Program Files` 下）；浏览器预览用 localStorage |
| `MahLeMah_Data` 出现在桌面 | 因为 exe 就放在桌面。数据永远跟着 exe 走，这是绿色版的设计 |
| 卸载后还剩一个空文件夹 | 若 exe 所在目录不为空（你还有别的文件），自删除脚本不会删父目录，属正常 |
| SmartScreen 拦截 | 未签名程序的正常提示，点「更多信息 → 仍要运行」 |
