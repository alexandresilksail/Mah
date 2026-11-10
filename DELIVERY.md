# 交付说明 · v2.0.0（16 牌型 / 双关卡模板 / 六机器人 / 原创 BGM / 双 Windows 产物）

> 本文件是本轮交付的权威说明。代码的唯一真实来源是仓库源文件，本文件不贴源码全文。
> 所有「旧版」信息（24 张第一关、222 张第二关、8/15 种牌型、葫芦单堆、200 局机器人报告、
> 游戏内自删除卸载）已**全部移除**，详见正文与 `RELEASE_NOTES.md` 的变更记录。

---

## 1. 本次交付清单

| 类别 | 文件 | 说明 |
|---|---|---|
| 源码 | `src/game/*` | 16 牌型注册表、双关卡模板、六机器人、原创 BGM、严格模板校验 |
| 桌面外壳 | `src-tauri/*` | Tauri 2，4 个白名单 IPC，存档加固，最小权限 |
| A·便携版 | `dist/MahLeMah-Portable-v2.0.0.zip` | exe + WebView2Loader.dll + 说明，解压即玩 |
| B·安装版 | `dist/MahLeMah-Setup-v2.0.0.exe` | NSIS（amd64），标准卸载入口 + 确认流程 |
| 网页版 | `dist/MahLeMah.html` / `MahLeMah-legacy.html` / `Mah了个Mah.html` / `index.html` | 单文件，离线可玩 |
| 校验 | `dist/SHA256SUMS.txt` | 全部交付物 SHA256 |
| 文档 | `README.md` / `DELIVERY.md` / `RELEASE_NOTES.md` | 本交付 |
| 报告 | `TEST_REPORT.md` / `SECURITY_AUDIT.md` / `reports/DIFFICULTY.md` | 测试 / 安全 / 难度 |

> 未实际运行的测试在本文第 6 节如实标注；未实际生成的 EXE 绝不在本文声称已交付。

---

## 2. 核心数据结构

### 2.1 16 种牌型（`src/game/tile_types.js` 唯一注册表）

顺序即下标 0..15，L2 的 `mixFor(2)` 按此顺序分配组数（每组 3 张）：

```
 0 幺鸡(sparrow)    1 红中(red-centre)  2 青發(erfa)       3 蓝框(blue-frame)
 4 金筒(coin-1)     5 三筒(coin-3)      6 双竹(bamboo-2)    7 五竹(bamboo-5)
 8 梅花(flower-plum) 9 兰花(flower-orchid) 10 金菊(flower-chrys) 11 锦鲤(fish)
12 弯月(moon)       13 朝阳(sun)        14 祥云(cloud)     15 星芒(star)
```

- 三种校验：`validateRegistry()` —— ID 唯一、名称唯一、配色三元组（face/rim/ink）唯一、字段齐全、数量 = 16。
- 每种牌型在两关里 ID 与配色完全一致；缩小到手机尺寸靠「色相 + 图案形状」双重区分。

### 2.2 两关独立布局模板（`src/game/layout_templates.js`）

| 模板 | 关卡 | 总张数 | 区域 | 层计划（底→顶） | 跨区域交叉遮挡 |
|---|---|---|---|---|---|
| `L1_TUTORIAL` | 1 | **48** | 1（`core`） | `[21,15,12]`，3 层 | 无 |
| `L2_MULTI_ZONE` | 2 | **240** | 4（`core`+`sideLeft`+`sideRight`+`reserve`） | `core[45,39,33,27,21,9,6]` / 两侧条各 `[4,4,4]` / `reserve[18,18]` | core↔三区、两侧条↔reserve 双向声明且几何一致 |

- 遮挡关系一律由**几何**（矩形相交 + z 全序）计算，无第二套规则。
- 区域在坐标上互相咬合：侧条压主堆外沿，保留区压主堆底沿与侧条内下角，上层消除后逐层暴露下层。
- 全部坐标落半格晶格整数倍（零随机抖动），同层相交面积恒为 0，外扩 4px 后连通分量 = 1。

### 2.3 模板校验与归一职责分离（测试有效性）

- `validateTemplate(原始模板)`：**严格校验，不修改任何数值**。非法坐标 / 牌数非法 / 网格容量不足 /
  数组长度不一致 / 全局层号重复 / `crosses` 目标不存在或与几何不符 —— 一律直接报错，**不静默修正、不自动截断**。
- `clampTemplate(原始模板)`：先跑 `validateTemplate`，非法直接 `throw`；合法时只做默认值填充与数组复制。
- 两者不再互相调用，职责互不渗透；`test.js` 用正反例验证（合法模板通过、5 类反例全部被拒）。

---

## 3. 六策略难度机器人（`src/game/robots.js`）

每种策略只实现一次、互不重复：

| 策略 | 行为 | 在难度报告中的角色 |
|---|---|---|
| `random` | 随机点可点牌 | 难度门槛下限（两关均 0% 通关，证明「不乱点不行」） |
| `greedy` | 优先凑三消（完整信息） | 证明「关卡可解」 |
| `noisy` | greedy + 10% 失误 | 失误惩罚度量 |
| `lookahead` | 1 步前瞻避死局 | 强策略上界 |
| `montecarlo` | 随机浅模拟选最优即时动作 | 中等偏强 |
| `search` | 受限回溯搜索 | 强策略上界（决策最慢） |

**测试样本量分离**：
- 快速回归（`npm test` 的 `[7]` 段）：**40 个固定池内 seed**，每次改动即时反馈；
- 发布压力测试（`npm run test:release`）：**每关 1000 seed × 6 策略 = 6000 局 / 关，共 12000 局**。

---

## 4. 原创背景音乐与音效（v2.2.0）

- 全部 Web Audio API **实时合成**，工程内**零音频文件**（`.mp3/.wav/.ogg` 在源码与产物中均不存在）。
- **标题 + 两关共 3 首**独立主题：晴日序曲（96 BPM）/ 糖果冲刺（112 BPM）/ 暗流（128 BPM，小调）；
  每首含 A/B 段落变奏、切分琶音、和声铺底、鼓组与节拍同步延迟。切关 `setTrack()` 淡出/淡入。
- 地图每次启动随机（L1 `randomSeed()`、L2 离线验收 seed 池抽样）；曲谱固定，但引擎每次启动
  随机选一套**编曲变奏**（段落顺序 / 琶音八度 / hat 密度 / 延迟湿度 / fill 位置）。
- **音效与 BGM 不打架**：`Sound` 复用 `Music` 的唯一 AudioContext，经 `sfxBus` 共用总线压缩器；
  音效总线串 1000Hz 高通、音源移到 1.0–4.2kHz，把中频让给主旋律；音效触发时 `duck()` 让 BGM
  短暂让路（0.10–0.30）并在约 0.27s 内平滑回满。
- 独立开关：`bgmOn`（音乐）/ `soundOn`（音效）分离；独立音量：`bgmVol` / `sfxVol`（0~1）。
- 循环播放；`pause()/resume()`；`visibilitychange` 后台挂起、回前台恢复。
- 单例守护：第二次 `new Music()` 直接抛错；全链路 `try/catch`，AudioContext 不可用只是无声，不崩溃。
- 首次用户交互（`pointerdown` / `keydown`）后才解锁音频，兼容浏览器自动播放限制；标题页有开启提示。
- 设置持久化到存档 `music` / `musicVol` / `sfxVol`，旧档缺字段用默认值（兼容）。

---

## 5. Windows 构建环境要求（重要）

| 组件 | 说明 |
|---|---|
| Node.js ≥ 18 | 跑构建脚本与测试 |
| Rust ≥ 1.77.2 + `stable-x86_64-pc-windows-gnu` | 编译 `MahLeMah.exe`（本机用 GNU 工具链） |
| MinGW-w64（winlibs 16.x） | GNU 链接器 `ld.exe` / `dlltool.exe` / `windres` |
| **64 位 makensis**（negrutiu/nsis ≥ 3.13） | 编译 NSIS 安装包。**官方 NSIS 只有 32 位，在「系统禁跑 32 位 PE」的机器上不可用**；`build_nsis.mjs` 会自动下载 amd64 版本 |

构建命令：`npm install && npm run build`（= `build:portable` 编译 exe 后 `build:nsis` 编译安装包），
再用 `npm run release` 生成 `SHA256SUMS.txt`。

---

## 6. 未执行 / 未达标项（如实上报，不谎报）

- **4 项难度软指标未达标**（阈值与实测值均未改写，在 `npm test` 中以 `✗` 标注）：
  - 带 10% 失误玩家通关率 ≤30% —— L2 noisy 实测 54.8%
  - 失败局进度中位数 ≥50% —— L2 greedy 实测 28.7%
  - 平均槽位占用 ≥3.0 —— L2 实测 2.71
  - 开局可点花色 ≥10 种 —— L2 实测 9.0
- **无 EXE 谎报**：`MahLeMah.exe`（便携与安装版共用）已在本机真实编译（GNU 工具链，`opt-level=z` 约 2.9 MB），
  Portable zip 与 NSIS exe 均已真实生成并校验（`SHA256SUMS.txt`）。安装→卸载已真实验证通过。
- **Tauri 官方 NSIS 打包器未使用**：受「系统禁跑 32 位 PE」限制，改用 negrutiu 的 64 位 makensis
  经 `tools/make_installer.nsi` 编译安装包；`tauri.conf.json` 仍声明 `bundle.targets=["nsis"]` 表达交付意图，测试据此验收。

---

## 7. 复现命令

```bash
npm install                                  # 安装开发依赖
npm test                                     # 996 项断言 + 渲染冒烟
npm run build:web && npm run build:legacy    # 两个单文件网页版
npm run build                                # Portable zip + NSIS exe
npm run test:release                         # 每关 1000 seed × 6 机器人 = 12000 局 → reports/DIFFICULTY.md
npm run release                              # dist/SHA256SUMS.txt
```
