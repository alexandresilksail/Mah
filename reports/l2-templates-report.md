# 第二关 50 套布局模板专项验收报告

> 本文件由 `node test-l2-templates.js` **真实运行**自动生成，不是静态 PASS 模板。

- 运行时间：2026-11-13T06:37:29.253Z
- Git commit：`a4340d167ff6b185a0f59ee0ecda7d3901b82cf8`
- 断言：通过 **539**，失败 **0**
- 模板：50 套 · 每套 3 组档位/seed · 共 150 局真实生成
- 两两差异：1225 对 · 结构 sim 最大 0.4354 · 主堆布局 sim 最大 0.4426 · 越界 0 对
- 相似阈值：0.6 · 第二关历史窗口：10 局

## 结构类别（10 类 × 5 套）

| 类别 | 套数 | 可观察布局特征 |
|---|---|---|
| 中央集中型 | 5 | 主堆收在牌桌中央，层层向核心收拢叠压 |
| 多区域分散型 | 5 | 层分散到多个互不相连的区域，形成多堆并立 |
| 双核心叠层型 | 5 | 左右/上下两个独立核心各自叠层 |
| 横向及纵向延展型 | 5 | 沿水平或竖直方向拉长，形成长条延展牌堆 |
| 环形包围型 | 5 | 层沿椭圆环绕，中心留空形成包围结构 |
| 十字交错型 | 5 | 横臂与竖臂交错叠压 |
| 阶梯递进型 | 5 | 层中心沿对角线逐级递降/递升 |
| 多层嵌套型 | 5 | 外框包内层，层层向内嵌套 |
| 非对称复杂叠层型 | 5 | 左右不对称、单边厚重与偏置缺口 |
| 组合异形型 | 5 | 梳齿 / 弧带 / 菱形 / 螺旋 / 沙漏等组合轮廓 |

## 50 套模板 ID 清单

| # | templateId | 名称 | 类别 | 代表布局牌数 | 层数 | 区域数 | 包围盒 | 开局可点 | 结构签名(前 12) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `L2-C01` | 中央密核塔 | 中央集中型 | 321 | 72 | 5 | 660×660 | 20 | `20965c1de23a` |
| 2 | `L2-C02` | 中央沙漏 | 中央集中型 | 282 | 68 | 7 | 660×616 | 21 | `6e31c65561da` |
| 3 | `L2-C03` | 中央菱形核 | 中央集中型 | 300 | 70 | 5 | 660×660 | 20 | `478ba9fe65d4` |
| 4 | `L2-C04` | 中央竖塔 | 中央集中型 | 312 | 71 | 7 | 660×660 | 19 | `660bf931f7e0` |
| 5 | `L2-C05` | 中央宽基座 | 中央集中型 | 273 | 67 | 6 | 660×616 | 22 | `b679ea804e29` |
| 6 | `L2-S01` | 四象限分散 | 多区域分散型 | 291 | 69 | 8 | 660×660 | 20 | `5f1c9c6d9802` |
| 7 | `L2-S02` | 六区并立 | 多区域分散型 | 261 | 66 | 10 | 660×660 | 20 | `f493163aa0cc` |
| 8 | `L2-S03` | 三岛链 | 多区域分散型 | 312 | 71 | 7 | 660×572 | 19 | `b3739eba5bb7` |
| 9 | `L2-S04` | 上下双带 | 多区域分散型 | 192 | 59 | 7 | 660×572 | 20 | `b17a32348e8e` |
| 10 | `L2-S05` | 边缘散点 | 多区域分散型 | 255 | 64 | 8 | 660×660 | 24 | `945b541945bd` |
| 11 | `L2-D01` | 左右双核 | 双核心叠层型 | 321 | 72 | 6 | 660×572 | 19 | `d237f9c16583` |
| 12 | `L2-D02` | 上下双核 | 双核心叠层型 | 282 | 68 | 6 | 660×660 | 20 | `7c56638cad86` |
| 13 | `L2-D03` | 对角双核 | 双核心叠层型 | 300 | 70 | 6 | 660×660 | 19 | `49e6a64801c9` |
| 14 | `L2-D04` | 双核夹桥 | 双核心叠层型 | 312 | 71 | 7 | 660×572 | 21 | `afafd968d9e5` |
| 15 | `L2-D05` | 不等双核 | 双核心叠层型 | 273 | 67 | 6 | 660×660 | 25 | `0da8dc730d33` |
| 16 | `L2-E01` | 横向长卷 | 横向及纵向延展型 | 291 | 69 | 9 | 660×484 | 23 | `63feee774913` |
| 17 | `L2-E02` | 纵向长柱 | 横向及纵向延展型 | 261 | 66 | 7 | 660×660 | 19 | `5ab1e10dad4c` |
| 18 | `L2-E03` | 横向双带 | 横向及纵向延展型 | 312 | 71 | 6 | 660×660 | 21 | `ce41ed1c219b` |
| 19 | `L2-E04` | 纵向阶梯柱 | 横向及纵向延展型 | 192 | 59 | 7 | 660×660 | 20 | `f46fcc4f901f` |
| 20 | `L2-E05` | 斜向长带 | 横向及纵向延展型 | 255 | 64 | 7 | 660×660 | 21 | `0f29fe5822ab` |
| 21 | `L2-R01` | 标准环墙 | 环形包围型 | 321 | 72 | 8 | 660×660 | 21 | `61b1d97c39ca` |
| 22 | `L2-R02` | 双层套环 | 环形包围型 | 282 | 68 | 8 | 660×660 | 21 | `869af06ad098` |
| 23 | `L2-R03` | 半环抱月 | 环形包围型 | 300 | 70 | 9 | 660×660 | 22 | `7871689d6de1` |
| 24 | `L2-R04` | 螺旋收环 | 环形包围型 | 312 | 71 | 8 | 660×660 | 21 | `965519b06544` |
| 25 | `L2-R05` | 环中带核 | 环形包围型 | 273 | 67 | 9 | 660×616 | 25 | `6da0d0916fe0` |
| 26 | `L2-X01` | 正十字 | 十字交错型 | 291 | 69 | 9 | 660×616 | 20 | `214dc472808d` |
| 27 | `L2-X02` | 斜十字 | 十字交错型 | 261 | 66 | 9 | 660×660 | 24 | `b293ee2493d6` |
| 28 | `L2-X03` | 双横一竖 | 十字交错型 | 312 | 71 | 7 | 660×616 | 20 | `ed167e97b1cd` |
| 29 | `L2-X04` | 楔形交错 | 十字交错型 | 192 | 59 | 7 | 660×660 | 19 | `c9b38d5bbd92` |
| 30 | `L2-X05` | 十字嵌套 | 十字交错型 | 255 | 64 | 9 | 660×660 | 20 | `21c0240caa94` |
| 31 | `L2-T01` | 右降阶梯 | 阶梯递进型 | 321 | 72 | 7 | 660×660 | 22 | `893d146020ee` |
| 32 | `L2-T02` | 左升阶梯 | 阶梯递进型 | 282 | 68 | 7 | 660×660 | 20 | `3b4e3d8dcd4a` |
| 33 | `L2-T03` | 折线阶梯 | 阶梯递进型 | 300 | 70 | 8 | 660×660 | 24 | `d10b042516fb` |
| 34 | `L2-T04` | 宽台阶梯 | 阶梯递进型 | 312 | 71 | 6 | 660×572 | 19 | `e26324d44a9e` |
| 35 | `L2-T05` | 嵌套阶梯 | 阶梯递进型 | 273 | 67 | 8 | 660×660 | 24 | `5a133077d5ac` |
| 36 | `L2-N01` | 方框套核 | 多层嵌套型 | 291 | 69 | 5 | 660×660 | 19 | `98d656ef263a` |
| 37 | `L2-N02` | 壳层包裹 | 多层嵌套型 | 261 | 66 | 7 | 660×660 | 19 | `bce7965733b4` |
| 38 | `L2-N03` | 同心菱 | 多层嵌套型 | 312 | 71 | 5 | 660×572 | 24 | `393f2c4b099a` |
| 39 | `L2-N04` | 双层套嵌 | 多层嵌套型 | 192 | 59 | 6 | 660×660 | 21 | `0e77ddcf72fb` |
| 40 | `L2-N05` | 阶梯套嵌 | 多层嵌套型 | 255 | 64 | 7 | 660×616 | 21 | `70f14f7a73f1` |
| 41 | `L2-A01` | 左重右轻 | 非对称复杂叠层型 | 321 | 72 | 7 | 660×572 | 20 | `e731a0cdc746` |
| 42 | `L2-A02` | 右重左轻 | 非对称复杂叠层型 | 282 | 68 | 7 | 660×616 | 20 | `e2caf7898926` |
| 43 | `L2-A03` | 偏置缺口 | 非对称复杂叠层型 | 300 | 70 | 7 | 660×616 | 21 | `26673491316e` |
| 44 | `L2-A04` | 不规则扇面 | 非对称复杂叠层型 | 312 | 71 | 8 | 660×660 | 20 | `ecd7212cabff` |
| 45 | `L2-A05` | 断桥叠层 | 非对称复杂叠层型 | 273 | 67 | 7 | 660×616 | 19 | `8883d718d367` |
| 46 | `L2-M01` | 梳齿长墙 | 组合异形型 | 291 | 69 | 7 | 660×572 | 22 | `c6d56fba63ca` |
| 47 | `L2-M02` | 弧带环绕 | 组合异形型 | 261 | 66 | 8 | 660×616 | 20 | `3c9037229aa8` |
| 48 | `L2-M03` | 菱形叠压 | 组合异形型 | 312 | 71 | 7 | 660×660 | 19 | `4b7b27e86942` |
| 49 | `L2-M04` | 螺旋外扩 | 组合异形型 | 192 | 59 | 8 | 660×660 | 23 | `cc9b366b9845` |
| 50 | `L2-M05` | 沙漏交错 | 组合异形型 | 255 | 64 | 7 | 660×660 | 22 | `364216dc5ff9` |

## 结构参数（每套独立定义）

| templateId | 区域 zones | 轮廓 shapes | 轨迹 | 层级曲线 | 包络 | 半格错位 | 钉层 |
|---|---|---|---|---|---|---|---|
| `L2-C01` | center | blob+pyramid+diamond+blob+nest | central | 1/1.6/2.2/1.6/1 | [object Object] | 1,1,0,1,1,0 | none |
| `L2-C02` | center+midTop+midBottom | blob+band+ring+cross+stair+diamond | central | 2.2/1.6/1/1.6/2.2 | [object Object] | 1,0,0,1,1,1,0,0 | edges |
| `L2-C03` | center | arc+shell+arc+diamond+arc | nest | 1/1/3/1/1 | [object Object] | 0,1,0,1,1,1 | none |
| `L2-C04` | center+north+south | stair+wedge+stair+fan+stair | vertical | 1/1.35/1.7/2.1/2.5 | [object Object] | 0,1,0,1,1,1 | none |
| `L2-C05` | center+midBottom | band+arc+band+comb+band | central | 1/2/2/2/1 | [object Object] | 1,0,1,0,0,1 | edges |
| `L2-S01` | nw+ne+sw+se | split+dual+split+checker+split | scatter | 2.5/2.1/1.7/1.35/1 | [object Object] | 1,1,1,1,0,0 | corners |
| `L2-S02` | nw+north+ne+sw+south+se | blob+band+ring+cross+stair+diamond | scatter | 2.5/2.1/1.7/1.35/1 | [object Object] | 1,0,0,1,1,1,0,0 | none |
| `L2-S03` | west+center+east | comb+fan+comb+wedge+comb | scatter | 2/1/2/1/2 | [object Object] | 1,1,0,1,1,0 | edges |
| `L2-S04` | north+south+center | band+arc+band+comb+band | scatter | 2.5/2.1/1.7/1.35/1 | [object Object] | 1,0,1,0,0,1 | none |
| `L2-S05` | farWest+farEast+nw+se | split+dual+split+checker+split | scatter | 1/1/3/1/1 | [object Object] | 1,1,1,1,0,0 | corners |
| `L2-D01` | coreA+coreB | blob+pyramid+diamond+blob+nest | dual | 1/1.6/2.2/1.6/1 | [object Object] | 1,1,0,1,1,0 | edges |
| `L2-D02` | north+south | blob+band+ring+cross+stair+diamond | dual | 2.2/1.6/1/1.6/2.2 | [object Object] | 0,1,0,1,1,1 | none |
| `L2-D03` | nw+se | arc+shell+arc+diamond+arc | dual | 2/1/2/1/2 | [object Object] | 1,0,0,1,1,1,0,0 | corners |
| `L2-D04` | coreA+center+coreB | cross+blob+cross+wedge+cross | dual | 1/1/2/2/3/3 | [object Object] | 1,0,1,0,0,1 | edges |
| `L2-D05` | west+coreB | stair+wedge+stair+fan+stair | dual | 1/1.35/1.7/2.1/2.5 | [object Object] | 1,1,1,1,0,0 | none |
| `L2-E01` | farWest+west+center+east+farEast | band+arc+band+comb+band | horizontal | 1/1.35/1.7/2.1/2.5 | [object Object] | 1,0,1,0,0,1 | edges |
| `L2-E02` | north+center+south | comb+fan+comb+wedge+comb | vertical | 1/1.35/1.7/2.1/2.5 | [object Object] | 0,1,0,1,1,1 | none |
| `L2-E03` | north+south | band+arc+band+comb+band | horizontal | 1/2/1/2/1 | [object Object] | 1,0,0,1,1,1,0,0 | edges |
| `L2-E04` | west+center+east | stair+wedge+stair+fan+stair | vertical | 1/1/2/2/3/3 | [object Object] | 1,1,0,1,1,0 | none |
| `L2-E05` | nw+center+se | arc+shell+arc+diamond+arc | stair | 1/1.35/1.7/2.1/2.5 | [object Object] | 1,1,1,1,0,0 | corners |
| `L2-R01` | nw+north+ne+east+se+south+sw+west | ring+shell+ring+arc+ring | ring | 1/1/1/1/1 | [object Object] | 1,0,0,1,1,1,0,0 | corners |
| `L2-R02` | nw+ne+sw+se+center | nest+shell+nest+ring+nest | ring | 2.2/1.6/1/1.6/2.2 | [object Object] | 1,1,0,1,1,0 | none |
| `L2-R03` | west+nw+north+ne+east | arc+shell+arc+diamond+arc | ring | 1/1.6/2.2/1.6/1 | [object Object] | 1,0,1,0,0,1 | edges |
| `L2-R04` | nw+ne+se+sw+center | shell+nest+ring+shell+nest | spiral | 1/1/3/1/1 | [object Object] | 1,1,1,1,0,0 | corners |
| `L2-R05` | north+east+south+west+center | ring+shell+ring+arc+ring | ring | 2/1/2/1/2 | [object Object] | 0,1,0,1,1,1 | none |
| `L2-X01` | north+south+west+east+center | cross+blob+cross+wedge+cross | cross | 1/1/1/1/1 | [object Object] | 1,0,0,1,1,1,0,0 | none |
| `L2-X02` | nw+ne+sw+se+center | cross+blob+cross+wedge+cross | cross | 2.2/1.6/1/1.6/2.2 | [object Object] | 1,1,0,1,1,0 | corners |
| `L2-X03` | north+south+center | band+arc+band+comb+band | cross | 1/2/1/2/1 | [object Object] | 1,0,1,0,0,1 | edges |
| `L2-X04` | west+center+east | blob+band+ring+cross+stair+diamond | cross | 1/1/2/2/3/3 | [object Object] | 1,1,1,1,0,0 | none |
| `L2-X05` | center+north+east+south+west | nest+shell+nest+ring+nest | cross | 1/1.6/2.2/1.6/1 | [object Object] | 0,1,0,1,1,1 | none |
| `L2-T01` | nw+center+se | stair+wedge+stair+fan+stair | stair | 1/1.35/1.7/2.1/2.5 | [object Object] | 1,1,0,1,1,0 | corners |
| `L2-T02` | ne+center+sw | stair+wedge+stair+fan+stair | stair | 2.5/2.1/1.7/1.35/1 | [object Object] | 1,1,1,1,0,0 | corners |
| `L2-T03` | west+north+east+south | comb+fan+comb+wedge+comb | stair | 1/2/1/2/1 | [object Object] | 1,0,0,1,1,1,0,0 | none |
| `L2-T04` | center+midBottom | band+arc+band+comb+band | stair | 1/2/2/2/1 | [object Object] | 1,0,1,0,0,1 | edges |
| `L2-T05` | nw+ne+sw+se | blob+band+ring+cross+stair+diamond | stair | 2/1/2/1/2 | [object Object] | 0,1,0,1,1,1 | corners |
| `L2-N01` | center | nest+shell+nest+ring+nest | nest | 1/1.25/1.5/2/3 | [object Object] | 0,1,0,1,1,1 | none |
| `L2-N02` | center+midTop+midBottom | shell+nest+ring+shell+nest | nest | 2.2/1.6/1/1.6/2.2 | [object Object] | 1,1,0,1,1,0 | edges |
| `L2-N03` | center | arc+shell+arc+diamond+arc | nest | 1/1.35/1.7/2.1/2.5 | [object Object] | 1,0,0,1,1,1,0,0 | none |
| `L2-N04` | coreA+coreB | ring+shell+ring+arc+ring | nest | 2/1/2/1/2 | [object Object] | 1,1,1,1,0,0 | none |
| `L2-N05` | center+north+south | blob+band+ring+cross+stair+diamond | nest | 1/1/2/2/3/3 | [object Object] | 1,0,1,0,0,1 | edges |
| `L2-A01` | west+center+east | split+dual+split+checker+split | asym | 1/1.35/1.7/2.1/2.5 | [object Object] | 1,1,0,1,1,0 | left |
| `L2-A02` | east+center+west | comb+fan+comb+wedge+comb | asym | 1/1.35/1.7/2.1/2.5 | [object Object] | 1,1,1,1,0,0 | right |
| `L2-A03` | nw+center+se | wedge+stair+fan+wedge+comb | asym | 1/2/1/2/1 | [object Object] | 1,0,0,1,1,1,0,0 | corners |
| `L2-A04` | sw+south+se+center | fan+arc+fan+wedge+fan | asym | 1/1/3/1/1 | [object Object] | 0,1,0,1,1,1 | none |
| `L2-A05` | west+east+center | checker+split+checker+comb+checker | asym | 2/1/2/1/2 | [object Object] | 1,0,1,0,0,1 | edges |
| `L2-M01` | west+center+east | comb+fan+comb+wedge+comb | horizontal | 1/1.35/1.7/2.1/2.5 | [object Object] | 1,0,1,0,0,1 | edges |
| `L2-M02` | nw+north+ne+center | arc+shell+arc+diamond+arc | ring | 1/1.6/2.2/1.6/1 | [object Object] | 1,0,0,1,1,1,0,0 | corners |
| `L2-M03` | center+north+south | arc+shell+arc+diamond+arc | vertical | 2.2/1.6/1/1.6/2.2 | [object Object] | 0,1,0,1,1,1 | none |
| `L2-M04` | center+nw+ne+se+sw | blob+band+ring+cross+stair+diamond | spiral | 1/1/2/2/3/3 | [object Object] | 1,1,0,1,1,0 | corners |
| `L2-M05` | midTop+center+midBottom | blob+band+ring+cross+stair+diamond | cross | 1/2/1/2/1 | [object Object] | 1,1,1,1,0,0 | edges |

## 结论

- 50 套模板的 `templateId` / 结构参数 / 结构签名 / 等价几何签名全部唯一。
- 150 局真实生成全部通过牌数、层级、坐标、遮挡、悬空、可操作、消除后暴露与真实开局安装校验。
- 1225 对两两比较全部低于 0.6，无「换 seed 冒充不同布局」。
- 平移、左右镜像、换牌面均被等价几何签名归一；模板级与几何级双重去重真实生效。
