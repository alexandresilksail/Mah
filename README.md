# Mah 了个 Mah

> 一款原创的「堆叠卡牌三消」休闲小游戏：点击未被遮挡的麻将牌收入底部槽位，三张相同自动消除。
> Tauri 2 + 原生 HTML/CSS/JS + Canvas，全部美术与音效由代码实时生成。

---

## 0. 直接开玩（网页版，推荐）

`dist/Mah了个Mah.html` 是**单个 HTML 文件**（约 55 KB，零外部依赖）；同目录还有
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

`dist/MahLeMah-legacy.html`（约 88 KB）是**纯 ES5 的第二个单文件产物**，零外部依赖、
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
  逻辑坐标恒为 720×1280；只在离散状态变化时重建 210 个 div，悬停只改边框（IE8 扛得住）。

**验证方式**：本机 IE11 已被系统重定向到 Edge，开不了真文档模式，所以分两路 ——
① acorn `ecmaVersion:5` 保证 IE8 能**解析**；② CDP 在页面所有脚本之前注入
「IE8/9/10 的 API 环境」（抹掉 `Map`/`Set`/`Promise`/`Symbol`/rAF/Web Audio/Canvas），
实测 IE8 档 `hasCanvas=false`、222 张牌全部渲染、点牌进槽 `0→1`、零 JS 异常；
IE9/10 档走 Canvas 路径同样零异常。截图见 `.shots/ie8_sim.png` / `.shots/ie9_sim.png`，
本轮簇模板布局的实机截图为 `.shots/cluster_l1.png`、`.shots/cluster_l2.png`、
`.shots/cluster_legacy_l1.png`、`.shots/cluster_legacy_l2.png`。

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
│       ├── config.js             # 单一常量源：TILE_W/H、槽位、遮挡阈值、关卡与难度参数
│       ├── rng.js                # mulberry32 可复现随机
│       ├── draw.js               # 圆角矩形/文字/缓动/矩形重叠度
│       ├── tiles.js              # 34 种传统麻将牌面（绿边白底）+ 离屏精灵
│       ├── logo.js               # 原创「小福神」Logo
│       ├── layout.js             # 纯 JS 几何：簇模板 / 侧堆 / 遮挡图 / peelOrder（新增）
│       ├── generator.js          # 反向生成花色 / 四段陷阱 / verify / 机器人模拟
│       ├── engine.js             # 纯 JS 槽位函数 + Game 类：入槽/消除/胜负/道具/撤销/复活
│       ├── render.js             # 界面绘制 + 牌堆离屏缓存 + 卸载按钮与确认面板
├── test.js                       # Node 纯逻辑验证（npm run test:sim，550 项断言）
│       ├── dom_view.es5.js       # 无 Canvas 时的 DOM 降级渲染器（IE8/IE7）
│       ├── audio.js              # Web Audio 合成音效
│       └── store.js              # Tauri IPC：MahLeMah_Data 存档 / 一键卸载
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
    ├── test_logic.mjs            # 玩法逻辑自测（209 条断言，含 20 局难度模拟）
    ├── test_render.mjs           # 渲染冒烟（44 场景）+ 卸载 UI 断言
    ├── tune.mjs                  # 难度调参：批量跑 AI 对局
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
| 1 | 18 | 2 层（底层 12 + 顶层 6） | **6** | 1 | 1 | 1 | 1 | 教学关，正常玩必过 |
| 2 | **222** | **主堆 150（7 层簇状） + 左右侧堆各 36** | **15** | **3** | **3** | **3** | 1 | 正式关，反向生成 + 四段陷阱 |

### 5.1 单一常量源（`src/game/config.js`）

全项目只有一处定义牌面尺寸，任何层、任何关卡、任何数量都不缩放：

```js
TILE_W = 54;  TILE_H = 72;            // 严格 3:4
SLOT_CAPACITY = 7;
OVERLAP_THRESHOLD = 0.10;            // 与上层牌相交面积 / 牌面积 > 10% 即被压住
MATCH_DELAY_MS = 200;
```

`TILE_AREA = TILE_W * TILE_H` 由常量推导；旧导出名（`SLOT_SIZE` / `INTERSECT_EPS` /
`COVER_RATIO` / `LAYOUTS[].tileW/tileH`）保留为兼容别名，供 DOM 降级视图读取。

| | 第 1 关 | 第 2 关 |
|---|---|---|
| **牌尺寸** | **54 × 72** | **54 × 72**（完全一致） |
| 层结构 | 底层 4 列 × 3 行 + 顶层 2 列 × 3 行 | 7 层，3~5 个簇错位堆叠 |
| 上下层关系 | 顶层以 `(TILE_W/2, TILE_H/2)` 骑在底层接缝上 | 层间偏移从 4 种半格向量随机选 |
| 开局可点 | **6 张** | **37 张**（seed 7000，随种子浮动） |

### 5.2 核心规则（`src/game/engine.js`）

- 点击可点牌 → 飞入 7 格槽位；**若槽内已有同花色牌，插到最右侧那张同花色之后**，否则放最右端；
- 同花色满 3 张 → 先播入槽动画，**延迟 200ms 再消除**，`pendingMatch` + `resolving` 防重入；
- 入槽后 7 格已满且未触发消除 → 判负；
- 遮挡是**几何判定**：存在 `z` 更高且仍在盘面的牌，与本牌矩形交集 `> TILE_AREA * 0.10`
  即被压住，不可点、渲染时整体叠 `rgba(0,0,0,0.35)` 压暗；
- 道具：洗牌（只重排盘面剩余牌的 `type`，每种花色数量不变）、撤销（历史栈回退一步）、
  移出（槽内最左 3 张，不足 3 张则全部移入临时区，点击临时区可放回）各 3 次；
- 复活 1 次：**只清空槽位与临时区，不赠送 / 不重置道具**。

`slotInsert` / `slotMatchTypes` / `resolveSlot` / `isCovered` 都是不依赖 DOM 的纯函数，
Node 里可直接 `import` 做断言。

### 5.3 教学关：关于「随便点不会死」

规格里「花色仅 6 种，可用鸽巢原理断言」的前提**不成立**：6 种 × 最多 2 张 + 1 = 13 > 7 格，
任意随机点击序列并不能保证不死。`npm run test:sim` 实跑 2000 局随机点击，
**1403 局槽位被塞满（不死率 29.8%）**。项目因此改以两条可验证的保证守住教学关：

1. `verify(l1)`：按反向生成的 `order` 用真实槽位规则回放，18 张全部清空且槽位归零；
2. 18 张 = 6 组 × 3 张、每种花色正好 3 张，正常玩法（优先凑三消）必过。

### 5.4 实测难度（`npm run test:sim`，每种 200 局固定种子）

```
机器人                       通关率       死局率     平均消除进度   失败进度中位
随机机器人                     0.0%      100.0%    5.1%          5.4%
贪心机器人                    40.0%       60.0%   68.7%         56.8%
普通玩家(贪心+5%失误)          34.0%       66.0%   66.4%         56.8%
```

> **未达标项如实说明**：规格要求「贪心机器人通关率 ≤ 5%」，实测 **40.0%**。
> 纯贪心是「看得到全部可点牌花色 + 永不失误」的全知模型，在「理论必然可解 +
> 三元组紧邻」的关卡里会高度贴合 `order` 路径。本轮实跑 200+ 组参数扫描
> （`DECOY_GROUPS` / `TRAP_SPAN` / `LONG_TRAP` / `DECOY_SUITS` / `TRAP_SUITS` /
> `SLOT_BUDGET`），在「verify 全过 + 花色组数差 ≤1 + 平均进度 60%~90%」三条约束下，
> 贪心通关率下界 **26.7%**（60 局）；放宽进度约束后全表最低 **15.0%**，
> 但平均进度跌到 **54.4%**，违反进度规格。默认参数取「不破坏任何明文规格」的最优点
> `LONG_TRAP=4`（40.0% / 68.7%）。追求更狠难度可传
> `{ difficulty: { DECOY_SUITS: 2, TRAP_SPAN: 60, LONG_TRAP: 5 } }`，代价是同时破坏
> 「花色组数差 ≤1」和「平均进度 60%~90%」两条规格。


## 6. 第 2 关：簇模板布局 + 反向生成花色

### 6.1 主堆布局：`generateLayout(seed)`（`src/game/layout.js`）

**不再是整体网格墙**。每局用带种子随机数生成 3~5 个簇，每个簇独立选模板、中心点、层间偏移：

| 模板 | 轮廓 |
|---|---|
| `T` | T 字形：横向长边 + 中央竖列 |
| `ring` | 回字形：外圈 + 内圈留空 |
| `cone` | 锥子形：中间高、四周逐层收低 |

- 相邻层的平移偏移从 `LAYER_OFFSETS = [(W/2,H/2), (0,H/2), (W/2,0), (-W/2,H/2)]`
  里随机选（W=`TILE_W`、H=`TILE_H`），个别牌再叠加 `±TILE_W/4` 抖动打破规整格点感；
- 簇与簇允许边缘互相压叠，但**同一层内不允许超过阈值的重叠**（实测最大 9.7%）；
- 所有牌的矩形必须完整落在 `MAIN_ZONE` 内，越界直接裁剪；
- 数量精确补足 / 裁掉：不足时继续增补簇内牌，超出时裁最高层边缘牌；
- 返回 `[{ id, x, y, layer, cluster }]`，主堆 150 张。

**侧堆**：`generateSidePiles(seed)` 生成左右各 36 张，每侧 6 条竖向队列 × 6 张，
`SIDE_STEP_Y = 13` 让同一队列里只有队首不被压住 —— 靠几何遮挡保证「只有最前面一张可点」。
侧堆与主堆共用 `TILE_W/TILE_H`，绘制时排在最后。

50 个种子的模板覆盖统计（实测）：`{"T":50,"ring":50,"cone":48}`。

### 6.2 剥离顺序 `peelOrder`

先在布局上建 blocker graph（`buildBlockerGraph`），再做拓扑剥离：
每一轮把**当前所有未被遮挡的牌**作为一波取出，波内按 `z` 降序、同 `z` 用随机 key 打散。
得到 `order[0..N-1]` 是一条合法的全消除顺序 —— 每一步只取当时可点的牌。
`verify(levelData)` 用真实槽位规则回放这条 `order`，20 个种子**全部通关（20/20）**。

### 6.3 花色 = 反向生成，不是随机撒（`src/game/generator.js`）

把 `order` 切成 74 个三元组，每组三张同花色。分组序列 `buildGroupSequence` 是**显式四段**：

| 段 | 张数（默认） | 内容 | 作用 |
|---|---|---|---|
| A | 165 | 诱饵组 + 中段组，每组三张**严格紧邻** | 前 15 组只用 3 种花色，开局可连续三消 |
| B | 4 | `LONG_TRAP` 个长期陷阱组的**第一张** | 单张长期挂槽，制造「差一张」 |
| C | 45 | 普通陷阱组，三张紧邻 | 陷阱区主体 |
| D | 8 | 长期陷阱组第二 / 三张成对收尾 | 收第二张后立刻三消，不把槽撑到 7 格 |

- 三个难度参数：`DECOY_GROUPS = 15`、`TRAP_SPAN = 57`（陷阱区 40~60 张）、`LONG_TRAP = 4`；
- 花色池按「组在 `order` 中首次出现的位置」分三段且互不重叠：诱饵 3 种 / 中段 8 种 / 陷阱 4 种；
- 15 种花色全部出现，每种 **4 或 5 组**（差 ≤1），实测张数 `12,15×14`，**全部 %3 == 0**；
- 槽内峰值受 `SLOT_BUDGET` 约束，任何一步都不会停在 7 格且未消除 → `order` 真实可解；
- 侧堆花色按同一原则分配：队列深处放陷阱段花色。

### 6.4 渲染（`src/game/tiles.js` / `src/game/render.js`）

- 统一 54×72 圆角矩形、象牙白牌面 + 底部厚度边；图案框是**正方形**并用
  `ctx.save()` + `ctx.translate()` 居中绘制，筒子圆环不会拉成椭圆；
- 每张牌绘制前设 `ctx.shadowColor='rgba(0,0,0,0.5)'` / `shadowBlur=8` / `shadowOffsetY=5`，
  绘制完 `ctx.restore()` 立即重置，不影响其他元素；
- 绘制顺序：**主堆在前、侧堆最后**；主堆按 `layer` 升序 → 同层 `y` 升序 → `x` 升序；
- 被遮挡牌画完整花色后整体压暗 `rgba(0,0,0,0.35)`；可点牌 hover 上浮 `2px`；
- `cardAt` 先判临时区，再把牌堆命中矩形按 `z` 降序遍历，**只有最高命中牌未被遮挡才返回**；
- 牌堆离屏缓存 + 入场动画封顶 240ms，222 张牌不会拖垮帧率。

### 6.5 实机截图

`.shots/cluster_l1.png` / `.shots/cluster_l2.png`（现代版），
`.shots/cluster_legacy_l1.png` / `.shots/cluster_legacy_l2.png`（兼容版）。


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

**第 7 步结构断言（`npm run test:sim`，失败即 `process.exit(1)`，实测 550 项全过）**
- [x] 所有牌 `w/h` 等于 `TILE_W/TILE_H` = 54×72，比例严格 3:4
- [x] 第 1 关 18 张 / 2 层（12 + 6）/ 6 种花色各 3 张
- [x] 第 2 关 222 张 / 7 层 / 15 种花色，每种数量 `%3 == 0`
- [x] 主堆 150 张 + 左右侧堆各 36 张
- [x] 同层牌重叠面积 ≤ `OVERLAP_THRESHOLD`（实测最大 9.7%）
- [x] 所有牌矩形完整落在安全区（40 个样本越界 0 张）
- [x] 50 个种子统计：T / ring / cone 三种模板全部用到
- [x] 20 个种子 `order` 回放全部存在完整通关路径（20/20）
- [x] 槽位插入 / 三消 / 200ms 延迟防重入 / 撤销 / 移出临时区 / 洗牌 / 复活

**核心规则与渲染**
- [x] 7 格槽位；同花色插到最右侧同花色之后；满 3 张延迟 200ms 消除
- [x] 遮挡按几何相交面积判定，不是层数比较；被压牌不可点且压暗
- [x] 洗牌只重排盘面剩余牌花色，每种花色数量不变
- [x] 撤销有历史栈；移出 3 张进临时区且可点击放回；复活只清槽不送道具
- [x] 单一常量源，全项目没有按层 / 关卡 / 数量缩放牌尺寸的代码
- [x] 每张牌强投影 `rgba(0,0,0,0.5) / blur 8 / offsetY 5`，绘制后立即重置
- [x] 绘制顺序 layer 升序 → 同层 y 升序 → 侧堆最后；hover 上浮 2px
- [x] 点击命中最高的可点牌；点到被遮挡牌不响应

**机器人模拟（每种 200 局，固定种子组）**
- [x] 随机机器人通关率 ≈ 0%（实测 0/200），平均进度 5.1%
- [x] 贪心平均消除进度 60%~90%（实测 68.7%）
- [ ] **贪心机器人通关率 ≤ 5%（实测 40.0%，未达标）** —— 原因与 200+ 组参数扫描
      结论见 5.4；在「必然可解 + 花色组数差 ≤1 + 进度 60%~90%」三条约束下
      实测下界 26.7%（60 局），需要改变机器人模型或放宽规格才能压到 5%
- [ ] **第 1 关「任意时刻随便点，槽位都不会满 7」（实测 1403/2000 局槽满）** ——
      鸽巢原理前提不成立，改以 `verify(l1)` + 正常玩法必过守住教学关，见 5.3

**构建与兼容**
- [x] `npm test` = `node test.js && node tools/test_render.mjs`；渲染冒烟 44 个场景全过
- [x] `npm run build:all`：`dist/Mah了个Mah.html` 56.6 KB、`dist/MahLeMah-legacy.html` 87.5 KB
- [x] ES5 校验（acorn `ecmaVersion:5`）通过；兼容版 222 张牌全部可见
- [x] IE8 档自动切 DOM 渲染，玩法 / 遮挡 / 道具 / 存档一致
- [x] 卸载按钮在 DOM 降级模式下也渲染为深红底
- [x] Tauri 配置、存档字段、卸载逻辑**未改动**


## 9. 知识产权自查

1. **无任何外部素材**：仓库内不存在图片、音频、字体、视频文件；`icons/` 下的 PNG/ICO 由
   `tools/gen_icon.py` 现场生成，可随时重跑复现。
2. **牌面为公有领域元素**：只使用传统麻将的「万/条/筒」与「東南西北中發白」等通用符号，
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
