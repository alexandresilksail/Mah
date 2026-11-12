# 双关卡各 100 局随机生成压力测试报告

> 本文件由 `node test-random-generation.js` **真实运行**自动生成，不是静态 PASS 模板。

- 运行时间：2026-11-12T14:00:41.676Z
- Git commit：`cb43412f6f7bca753833448d5823a1f9aad56cda`
- 断言：通过 **7285**，失败 **0**
- 总耗时：9727 ms
- 布局签名算法：`MAH-LAYOUT-SIG-v1/SHA-256`（SHA-256，浏览器与 Node 共用同一实现）
- 历史窗口：每关最近 3 局；重复阈值 sim ≥ 0.6；重试上限 50 次

## 全局

| 项 | 值 |
|---|---|
| 总生成局数 | 200 |
| gameId 唯一数 | 202 / 202 |
| 布局签名总数 / 去重 | 200 / 189 |
| 生成失败次数 | 0 |
| 重试总次数 | 9 |
| 平均单局生成耗时 | 14.36 ms |
| 失败案例 | 0 |

## 最近三局滑动窗口相似度

| 关卡 | 窗口对数 | 均值 | P95 | 最大值 | 阈值 | 判定 |
|---|---|---|---|---|---|---|
| L1 | 294 | 0.2404 | 0.4970 | 0.5911 | 0.6 | ✓ 全部 < 0.60 |
| L2 | 294 | 0.3892 | 0.5229 | 0.5903 | 0.6 | ✓ 全部 < 0.60 |

## 同档位不同 seed 的几何多样性（第 2.4 节）

| 档位 | 30 seed 中不同几何数 | ≥25 |
|---|---|---|
| 0 | 29 | ✓ |
| 1 | 30 | ✓ |
| 2 | 30 | ✓ |
| 3 | 30 | ✓ |

| 档位 | 30 seed 中不同几何数 | ≥25 |
|---|---|---|
| 0 | 30 | ✓ |
| 1 | 30 | ✓ |
| 2 | 30 | ✓ |
| 3 | 30 | ✓ |
| 4 | 30 | ✓ |
| 5 | 30 | ✓ |
| 6 | 30 | ✓ |
| 7 | 30 | ✓ |
| 8 | 30 | ✓ |
| 9 | 30 | ✓ |

## 第 1 关 · 100 局

| 项 | 值 |
|---|---|
| 耗时 | 1737 ms |
| 牌数范围 | 24 – 48 |
| 开局可点牌范围 | 15 – 42 |
| 档位分布 | {"0":25,"1":25,"2":25,"3":25} |
| 牌数分布 | {"24":25,"30":25,"36":25,"48":25} |
| 牌型数分布 | {"8":25,"10":25,"12":25,"16":25} |
| 生成原因分布 | {"application_restart":25,"title_screen_restart":25,"failure_restart":25,"new_game":25} |
| 布局签名去重 | 100 / 100 |
| 最近 3 局总牌数重复 | 0 |
| 最近 3 局布局签名重复 | 0 |
| 最近 3 局几何签名重复 | 0 |
| 重试次数（失败重试合计） | 9 |
| 生成失败次数 | 0 |
| 滑窗 sim 均值 / P95 / 最大 | 0.2404 / 0.4970 / 0.5911 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 11.31 ms |

<details><summary>完整 100 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | sim最大 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g1-mwdm84ve-1-y1ke36-application_restart | 2 | 1805461526 | 36 | 12 | 33 | 0 | 2b751304d07a | 58888d6df966 | application_restart | 0 | 11 | PASS |
| 2 | g1-mwdm84wj-2-168m20g-title_screen_restart | 3 | 1869167036 | 48 | 16 | 29 | 0.223 | 4e27effffb34 | 00fca2a2845b | title_screen_restart | 0 | 29 | PASS |
| 3 | g1-mwdm84xi-3-ngxpqk-failure_restart | 1 | 2946116843 | 30 | 10 | 25 | 0.313 | 8f81b4d49f2e | d0e1fad11c9b | failure_restart | 0 | 16 | PASS |
| 4 | g1-mwdm84xq-4-1qv9y0p-new_game | 0 | 70850340 | 24 | 8 | 19 | 0.528 | 9d9fde7bfb31 | 8153cce69805 | new_game | 0 | 5 | PASS |
| 5 | g1-mwdm84y1-5-183zwz8-application_restart | 2 | 1500717013 | 36 | 12 | 32 | 0.485 | a332972ad1be | 7c20b81ec260 | application_restart | 0 | 8 | PASS |
| 6 | g1-mwdm84yj-6-oj7fdb-title_screen_restart | 3 | 380752676 | 48 | 16 | 32 | 0.333 | 4bc43b8d7997 | 2ac7fb4883bd | title_screen_restart | 0 | 15 | PASS |
| 7 | g1-mwdm84zd-7-1u08j1u-failure_restart | 1 | 1287016961 | 30 | 10 | 27 | 0.289 | 35d3f37cc93e | 36c0d8d5da97 | failure_restart | 0 | 14 | PASS |
| 8 | g1-mwdm84zm-8-1hxtbmj-new_game | 0 | 696759107 | 24 | 8 | 20 | 0.423 | 76c7242e9ce4 | 9b6646bc94dc | new_game | 0 | 5 | PASS |
| 9 | g1-mwdm84zu-9-1k7p8nn-application_restart | 2 | 3324266840 | 36 | 12 | 31 | 0.453 | f4dda6a3c819 | 84b2a9b1a533 | application_restart | 0 | 6 | PASS |
| 10 | g1-mwdm850a-a-18ne5yk-title_screen_restart | 3 | 3753426112 | 48 | 16 | 35 | 0.488 | 45f754d299fc | f7d528909c03 | title_screen_restart | 0 | 12 | PASS |
| 11 | g1-mwdm850v-b-125r5o6-failure_restart | 1 | 93508191 | 30 | 10 | 25 | 0.19 | 0d81f52dfc65 | 8df0e653118e | failure_restart | 0 | 12 | PASS |
| 12 | g1-mwdm8514-c-17gu6p3-new_game | 0 | 3387082694 | 24 | 8 | 21 | 0.485 | 0df689b0c5cd | 8b2e10257e45 | new_game | 0 | 7 | PASS |
| 13 | g1-mwdm851g-d-bw3xjh-application_restart | 2 | 2060217829 | 36 | 12 | 26 | 0.452 | fe493e33892a | 238ffc4ae180 | application_restart | 0 | 8 | PASS |
| 14 | g1-mwdm8524-e-1fd1k9w-title_screen_restart | 3 | 1233936998 | 48 | 16 | 33 | 0.419 | 7303aff89092 | a088546925ca | title_screen_restart | 0 | 17 | PASS |
| 15 | g1-mwdm852r-f-1y3tzuv-failure_restart | 1 | 1607112701 | 30 | 10 | 23 | 0.386 | 52d039f1e8fa | 0aba1ed973ad | failure_restart | 0 | 13 | PASS |
| 16 | g1-mwdm852y-g-1rnn2sh-new_game | 0 | 4134245112 | 24 | 8 | 24 | 0.401 | 87046699a243 | e28ef95d9675 | new_game | 0 | 5 | PASS |
| 17 | g1-mwdm8538-h-1yy4ke8-application_restart | 2 | 1780595365 | 36 | 12 | 26 | 0.239 | 0a2ce8d32607 | 7d436f52a00a | application_restart | 0 | 7 | PASS |
| 18 | g1-mwdm853q-i-1dbmr1f-title_screen_restart | 3 | 3196800571 | 48 | 16 | 40 | 0.437 | 125d82c66262 | 3281e17dc90b | title_screen_restart | 0 | 11 | PASS |
| 19 | g1-mwdm8544-j-twc2qv-failure_restart | 1 | 1302641591 | 30 | 10 | 27 | 0.584 | f272092b0eeb | 47a5d2a59f51 | failure_restart | 0 | 8 | PASS |
| 20 | g1-mwdm854d-k-1whwrb8-new_game | 0 | 2765535102 | 24 | 8 | 17 | 0.244 | d3a499b554f2 | fdc1d0e9b240 | new_game | 0 | 5 | PASS |
| 21 | g1-mwdm854l-l-q1m69x-application_restart | 2 | 2673788523 | 36 | 12 | 32 | 0.21 | 163add26b26e | 62c77127b5ab | application_restart | 0 | 6 | PASS |
| 22 | g1-mwdm8551-m-1vuxqo5-title_screen_restart | 3 | 126568389 | 48 | 16 | 33 | 0.314 | 9dd2d7f7c727 | a3613db25e54 | title_screen_restart | 0 | 11 | PASS |
| 23 | g1-mwdm855i-n-jdi8az-failure_restart | 1 | 3418661327 | 30 | 10 | 25 | 0.249 | d95a0223709d | 1cce2c8a634b | failure_restart | 0 | 10 | PASS |
| 24 | g1-mwdm855r-o-1l90hqh-new_game | 0 | 570322770 | 24 | 8 | 20 | 0.517 | db3609aae1c9 | 92f3dd1e9af1 | new_game | 0 | 5 | PASS |
| 25 | g1-mwdm855z-p-1nwh46v-application_restart | 2 | 3421692543 | 36 | 12 | 32 | 0.48 | 8ce43486de58 | c0605e3a1534 | application_restart | 0 | 6 | PASS |
| 26 | g1-mwdm856i-q-17okph1-title_screen_restart | 3 | 196554065 | 48 | 16 | 33 | 0.293 | 98acffadde07 | 67ccc0e4bb68 | title_screen_restart | 0 | 15 | PASS |
| 27 | g1-mwdm8576-r-148618u-failure_restart | 1 | 919802035 | 30 | 10 | 26 | 0.215 | 9182915f90b5 | c9811dc0f6af | failure_restart | 0 | 12 | PASS |
| 28 | g1-mwdm857e-s-t0patc-new_game | 0 | 1977777566 | 24 | 8 | 20 | 0.322 | d22bd93942b9 | 31b81c5b7c22 | new_game | 0 | 4 | PASS |
| 29 | g1-mwdm857m-t-z8sty9-application_restart | 2 | 4237047671 | 36 | 12 | 32 | 0.293 | 91f4346ced6d | 9bf2bbdc618a | application_restart | 0 | 6 | PASS |
| 30 | g1-mwdm8582-u-1ythuf8-title_screen_restart | 3 | 3475602187 | 48 | 16 | 33 | 0.329 | 60df5aece063 | 692f4f06a7ac | title_screen_restart | 0 | 12 | PASS |
| 31 | g1-mwdm858s-v-qvqx9q-failure_restart | 1 | 3699718953 | 30 | 10 | 25 | 0.241 | c514936d0526 | d2f77643c5b6 | failure_restart | 1 | 16 | PASS |
| 32 | g1-mwdm8594-w-1b5mqsw-new_game | 0 | 686531080 | 24 | 8 | 24 | 0.293 | db556b10da76 | ee9396d7e240 | new_game | 0 | 8 | PASS |
| 33 | g1-mwdm859l-x-1x8do7x-application_restart | 2 | 880952436 | 36 | 12 | 26 | 0.486 | 3140fb0ae2b2 | 1753befecb89 | application_restart | 0 | 12 | PASS |
| 34 | g1-mwdm85a4-y-1ehjhtj-title_screen_restart | 3 | 746819136 | 48 | 16 | 42 | 0.442 | 83d7d506b7b7 | dd028c90aaba | title_screen_restart | 0 | 15 | PASS |
| 35 | g1-mwdm85aq-z-g11vhc-failure_restart | 1 | 4023105934 | 30 | 10 | 26 | 0.385 | aa276cba6a61 | e0f84acfe8a6 | failure_restart | 0 | 13 | PASS |
| 36 | g1-mwdm85b1-10-qchwgh-new_game | 0 | 3602015161 | 24 | 8 | 22 | 0.258 | 576181a73cd0 | 26add1611eec | new_game | 0 | 5 | PASS |
| 37 | g1-mwdm85bh-11-ys5c7o-application_restart | 2 | 2703984744 | 36 | 12 | 32 | 0.495 | 4be70ceacfb2 | 5197c75a3729 | application_restart | 1 | 14 | PASS |
| 38 | g1-mwdm85ca-12-1iiwpvq-title_screen_restart | 3 | 747623009 | 48 | 16 | 33 | 0.586 | 68a881c85331 | 146ad3355229 | title_screen_restart | 0 | 25 | PASS |
| 39 | g1-mwdm85df-13-qrq11z-failure_restart | 1 | 2792027573 | 30 | 10 | 27 | 0.289 | aa426b460bb0 | ea90c1cf7011 | failure_restart | 0 | 23 | PASS |
| 40 | g1-mwdm85dq-14-14k84ic-new_game | 0 | 292183220 | 24 | 8 | 20 | 0.26 | 415ed118d7e4 | b85941245b2d | new_game | 0 | 7 | PASS |
| 41 | g1-mwdm85dy-15-187qusz-application_restart | 2 | 1347245364 | 36 | 12 | 31 | 0.591 | 66aef4e672ab | f26a0a2b4dbf | application_restart | 0 | 5 | PASS |
| 42 | g1-mwdm85eg-16-1q0b0t2-title_screen_restart | 3 | 17962785 | 48 | 16 | 35 | 0.442 | 5467a23aadc3 | 6086936c6a72 | title_screen_restart | 0 | 13 | PASS |
| 43 | g1-mwdm85f3-17-z6ymw5-failure_restart | 1 | 1805973832 | 30 | 10 | 25 | 0.423 | 7264e431bb2d | d1ae76458013 | failure_restart | 0 | 11 | PASS |
| 44 | g1-mwdm85fa-18-1rztdia-new_game | 0 | 2750050861 | 24 | 8 | 21 | 0.558 | bf90dcaa69f1 | a845c81c77f5 | new_game | 0 | 4 | PASS |
| 45 | g1-mwdm85fk-19-8eb0bb-application_restart | 2 | 1102768948 | 36 | 12 | 26 | 0.441 | 7f23add10943 | f22e37e9e07c | application_restart | 0 | 8 | PASS |
| 46 | g1-mwdm85g8-1a-affnvu-title_screen_restart | 3 | 411183378 | 48 | 16 | 34 | 0.457 | 46814cca0e2e | d9ce8c2dd726 | title_screen_restart | 0 | 20 | PASS |
| 47 | g1-mwdm85h6-1b-1jbkmir-failure_restart | 1 | 1702311777 | 30 | 10 | 25 | 0.459 | 45f77f9d4518 | 7c13db499864 | failure_restart | 0 | 18 | PASS |
| 48 | g1-mwdm85hg-1c-807y9u-new_game | 0 | 2493212584 | 24 | 8 | 15 | 0.495 | d557738405c4 | 448725e23952 | new_game | 0 | 6 | PASS |
| 49 | g1-mwdm85hq-1d-olglvb-application_restart | 2 | 3029233174 | 36 | 12 | 29 | 0.232 | d1ba7531d2d3 | b10c9db01924 | application_restart | 0 | 7 | PASS |
| 50 | g1-mwdm85i7-1e-1chqsdz-title_screen_restart | 3 | 10086974 | 48 | 16 | 28 | 0.42 | 7f60e275bc65 | 739ee7bb2588 | title_screen_restart | 0 | 11 | PASS |
| 51 | g1-mwdm85is-1g-1k029n3-failure_restart | 1 | 998153730 | 30 | 10 | 26 | 0.302 | 19aab525f626 | 34024ce992f6 | failure_restart | 0 | 3 | PASS |
| 52 | g1-mwdm85j0-1h-19kzxcc-new_game | 0 | 4285952509 | 24 | 8 | 20 | 0.432 | d709e4d6970b | c429fb1a1865 | new_game | 0 | 5 | PASS |
| 53 | g1-mwdm85jc-1i-128kc2t-application_restart | 2 | 746200421 | 36 | 12 | 26 | 0.407 | 2097ead4647b | d770936c3b8e | application_restart | 0 | 9 | PASS |
| 54 | g1-mwdm85k0-1j-qaifcr-title_screen_restart | 3 | 1004366320 | 48 | 16 | 35 | 0.254 | 2cee4e2d102e | e3d029969a87 | title_screen_restart | 0 | 18 | PASS |
| 55 | g1-mwdm85kk-1k-z8zut-failure_restart | 1 | 69463933 | 30 | 10 | 25 | 0.352 | 9fb7f1d9f19f | 0201ac381892 | failure_restart | 0 | 10 | PASS |
| 56 | g1-mwdm85ks-1l-1grfn56-new_game | 0 | 2926558174 | 24 | 8 | 24 | 0.204 | 9ac891181b3f | 03e3e814903f | new_game | 0 | 5 | PASS |
| 57 | g1-mwdm85kz-1m-16ubue2-application_restart | 2 | 2521061764 | 36 | 12 | 31 | 0.561 | 02f6eec6e71d | 4df213d17504 | application_restart | 0 | 5 | PASS |
| 58 | g1-mwdm85le-1n-110fynl-title_screen_restart | 3 | 2784393566 | 48 | 16 | 40 | 0.439 | f344c50f6cf0 | b3ceb8029329 | title_screen_restart | 0 | 9 | PASS |
| 59 | g1-mwdm85ls-1o-1yey0nr-failure_restart | 1 | 2206023969 | 30 | 10 | 26 | 0.164 | d5124ddeddff | ad1123e36ba3 | failure_restart | 0 | 7 | PASS |
| 60 | g1-mwdm85m0-1p-9g8iw2-new_game | 0 | 3027930915 | 24 | 8 | 19 | 0.485 | a13ffd983cfd | 6a7b5ee4608f | new_game | 0 | 5 | PASS |
| 61 | g1-mwdm85ma-1q-1ea8xur-application_restart | 2 | 1020308885 | 36 | 12 | 27 | 0.44 | 64eca181d186 | 949209a10b4d | application_restart | 0 | 7 | PASS |
| 62 | g1-mwdm85nf-1r-13dxzk6-title_screen_restart | 3 | 472462503 | 48 | 16 | 33 | 0.307 | ac1feefe9363 | 19333d51256f | title_screen_restart | 0 | 35 | PASS |
| 63 | g1-mwdm85p8-1s-15dv8ft-failure_restart | 1 | 2591593113 | 30 | 10 | 30 | 0.282 | 96743accf89c | c9f75c9b2c06 | failure_restart | 0 | 35 | PASS |
| 64 | g1-mwdm85pg-1t-rkz6zc-new_game | 0 | 3952018957 | 24 | 8 | 24 | 0.337 | 1ed9095c7315 | 924df9013cf8 | new_game | 0 | 4 | PASS |
| 65 | g1-mwdm85px-1u-uug9xb-application_restart | 2 | 3368801187 | 36 | 12 | 27 | 0.486 | d2a15ed57103 | 9915fb167ae1 | application_restart | 2 | 15 | PASS |
| 66 | g1-mwdm85qd-1v-w3q996-title_screen_restart | 3 | 574954609 | 48 | 16 | 35 | 0.4 | ca3a79beb6f5 | fdf2f3e2c358 | title_screen_restart | 0 | 11 | PASS |
| 67 | g1-mwdm85qu-1w-zaof7v-failure_restart | 1 | 1561057588 | 30 | 10 | 30 | 0.486 | 2c3bdb5742eb | ff264c410248 | failure_restart | 0 | 9 | PASS |
| 68 | g1-mwdm85r4-1x-1wek2c7-new_game | 0 | 4203824844 | 24 | 8 | 20 | 0.267 | 3dcffa911712 | 995842b9e157 | new_game | 0 | 6 | PASS |
| 69 | g1-mwdm85rs-1y-1sdgydl-application_restart | 2 | 3268189723 | 36 | 12 | 21 | 0.519 | 4c6c34c73205 | 4fb1f7c8de97 | application_restart | 1 | 22 | PASS |
| 70 | g1-mwdm85ss-1z-hei2jr-title_screen_restart | 3 | 2519525255 | 48 | 16 | 40 | 0.358 | 333164cfb000 | 77e0c4212a32 | title_screen_restart | 0 | 21 | PASS |
| 71 | g1-mwdm85ta-20-2gp3fi-failure_restart | 1 | 2082032480 | 30 | 10 | 26 | 0.527 | c059768370d3 | 6f73c9c4ca00 | failure_restart | 0 | 10 | PASS |
| 72 | g1-mwdm85tk-21-vdahg-new_game | 0 | 3268968128 | 24 | 8 | 24 | 0.539 | b12137f8e5a6 | c419f67f6fe4 | new_game | 0 | 6 | PASS |
| 73 | g1-mwdm85tt-22-4mrhxr-application_restart | 2 | 552632550 | 36 | 12 | 28 | 0.132 | 254a35dc3b79 | c6dc55159fef | application_restart | 0 | 8 | PASS |
| 74 | g1-mwdm85u9-23-1l7ygq2-title_screen_restart | 3 | 509079406 | 48 | 16 | 37 | 0.5 | 2af747e92dd9 | 1ccc54036d7f | title_screen_restart | 0 | 11 | PASS |
| 75 | g1-mwdm85uu-24-1vxx6rl-failure_restart | 1 | 3466730933 | 30 | 10 | 21 | 0.261 | f4c0a5262a31 | 5c98ac0a541d | failure_restart | 1 | 12 | PASS |
| 76 | g1-mwdm85v1-25-1ewfp8d-new_game | 0 | 3560828731 | 24 | 8 | 24 | 0.401 | 81f8de530129 | e8036f3e37bf | new_game | 0 | 4 | PASS |
| 77 | g1-mwdm85v8-26-vskea-application_restart | 2 | 4167273186 | 36 | 12 | 32 | 0.17 | 278b2e606fdb | 84fb6ffbbfc8 | application_restart | 0 | 6 | PASS |
| 78 | g1-mwdm85w8-27-znyufo-title_screen_restart | 3 | 3370395775 | 48 | 16 | 33 | 0.574 | fbd61f6cf01d | 8519ff779b2c | title_screen_restart | 0 | 32 | PASS |
| 79 | g1-mwdm85y4-28-n2dzl4-failure_restart | 1 | 3313752259 | 30 | 10 | 25 | 0.26 | c8f9e00c42e7 | da7bcf70e785 | failure_restart | 0 | 39 | PASS |
| 80 | g1-mwdm85yf-29-1e8q3s3-new_game | 0 | 1452252823 | 24 | 8 | 19 | 0.211 | 8d1c73bfb220 | d8dd7f23efdc | new_game | 0 | 6 | PASS |
| 81 | g1-mwdm85yu-2a-1cbjyun-application_restart | 2 | 4242851765 | 36 | 12 | 27 | 0.425 | be06a5d3af44 | 7bf8af1e8724 | application_restart | 1 | 12 | PASS |
| 82 | g1-mwdm85zc-2b-1lmue7d-title_screen_restart | 3 | 774605651 | 48 | 16 | 36 | 0.441 | c50f0cba5634 | d8dcc8baff34 | title_screen_restart | 0 | 12 | PASS |
| 83 | g1-mwdm85zu-2c-1ygmpxb-failure_restart | 1 | 3994688969 | 30 | 10 | 26 | 0.35 | 278242a32a8b | 57156ab268cf | failure_restart | 0 | 10 | PASS |
| 84 | g1-mwdm8603-2d-19pxkw6-new_game | 0 | 3288593085 | 24 | 8 | 19 | 0.418 | bfee9c591a8e | f9cecaf6c5c6 | new_game | 0 | 5 | PASS |
| 85 | g1-mwdm860h-2e-1606q2i-application_restart | 2 | 1987452922 | 36 | 12 | 27 | 0.4 | a741f5f67e40 | 30852f8351af | application_restart | 1 | 11 | PASS |
| 86 | g1-mwdm860x-2f-1ktc1cj-title_screen_restart | 3 | 3826107780 | 48 | 16 | 39 | 0.229 | f9c2ffaa1c33 | 26db8c1559ac | title_screen_restart | 0 | 12 | PASS |
| 87 | g1-mwdm861f-2g-md65uf-failure_restart | 1 | 351999265 | 30 | 10 | 26 | 0.35 | 768962cefcf9 | 3c6c11609402 | failure_restart | 0 | 11 | PASS |
| 88 | g1-mwdm861p-2h-9hvk3y-new_game | 0 | 2564352474 | 24 | 8 | 20 | 0.265 | 2dca7de1fa9c | 5ad0b4ed7174 | new_game | 0 | 6 | PASS |
| 89 | g1-mwdm861z-2i-l24ye9-application_restart | 2 | 2362289224 | 36 | 12 | 28 | 0.565 | 588c1cdf8a37 | 76294427a4f8 | application_restart | 0 | 7 | PASS |
| 90 | g1-mwdm862k-2j-1gx6cvd-title_screen_restart | 3 | 882280994 | 48 | 16 | 30 | 0.436 | f1f88b12d1b7 | 0eb75d62e837 | title_screen_restart | 0 | 17 | PASS |
| 91 | g1-mwdm8632-2k-3onmie-failure_restart | 1 | 1991877902 | 30 | 10 | 26 | 0.205 | d72b33390e7b | d7af03a98639 | failure_restart | 0 | 9 | PASS |
| 92 | g1-mwdm8639-2l-1szamu2-new_game | 0 | 3752753339 | 24 | 8 | 19 | 0.278 | 33c9d0e9b29b | 58d6c0d2319a | new_game | 0 | 5 | PASS |
| 93 | g1-mwdm863m-2m-mcytes-application_restart | 2 | 948870037 | 36 | 12 | 27 | 0.332 | 1821150ea6fb | 8c6a3ef4d228 | application_restart | 0 | 11 | PASS |
| 94 | g1-mwdm864h-2n-f0g157-title_screen_restart | 3 | 1021555045 | 48 | 16 | 35 | 0.371 | 1773d6a67c73 | 2581d85d82f6 | title_screen_restart | 0 | 22 | PASS |
| 95 | g1-mwdm8656-2o-1hk5hpy-failure_restart | 1 | 3024332651 | 30 | 10 | 27 | 0.4 | b3fd529af472 | 4ae6cfa6b629 | failure_restart | 1 | 14 | PASS |
| 96 | g1-mwdm865d-2p-ytd5fn-new_game | 0 | 2971319945 | 24 | 8 | 20 | 0.34 | 0e3c587ce693 | 687f5189829a | new_game | 0 | 4 | PASS |
| 97 | g1-mwdm865s-2q-1hyatle-application_restart | 2 | 890216520 | 36 | 12 | 26 | 0.425 | 2957fc9a11b6 | 73b04407079c | application_restart | 0 | 14 | PASS |
| 98 | g1-mwdm866n-2r-1ay1cdm-title_screen_restart | 3 | 3047848554 | 48 | 16 | 40 | 0.287 | 7ab02f3f386c | 3ac254a97f53 | title_screen_restart | 0 | 18 | PASS |
| 99 | g1-mwdm8673-2s-1nd7eoz-failure_restart | 1 | 3537262874 | 30 | 10 | 27 | 0.425 | 7a70cb235223 | 959ff5d013d4 | failure_restart | 0 | 9 | PASS |
| 100 | g1-mwdm867a-2t-1p4p2cl-new_game | 0 | 1604671692 | 24 | 8 | 20 | 0.214 | 414b18c1be09 | 76605d9e1981 | new_game | 0 | 5 | PASS |

</details>

## 第 2 关 · 100 局

| 项 | 值 |
|---|---|
| 耗时 | 3589 ms |
| 牌数范围 | 192 – 321 |
| 开局可点牌范围 | 22 – 25 |
| 档位分布 | {"0":8,"1":9,"2":12,"3":7,"4":11,"5":10,"6":11,"7":8,"8":11,"9":13} |
| 牌数分布 | {"192":11,"255":13,"261":11,"273":11,"282":9,"291":10,"300":12,"312":15,"321":8} |
| 牌型数分布 | {"13":41,"14":20,"15":32,"16":7} |
| 生成原因分布 | {"application_restart":25,"title_screen_restart":25,"failure_restart":25,"new_game":25} |
| 布局签名去重 | 89 / 100 |
| 最近 3 局总牌数重复 | 0 |
| 最近 3 局布局签名重复 | 0 |
| 最近 3 局几何签名重复 | 0 |
| 重试次数（失败重试合计） | 0 |
| 生成失败次数 | 0 |
| 滑窗 sim 均值 / P95 / 最大 | 0.3892 / 0.5229 / 0.5903 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 17.40 ms |

<details><summary>完整 100 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | sim最大 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g2-mwdm867o-2u-1cu309f-application_restart | 1 | 1698041196 | 282 | 13 | 23 | 0 | cb9d399db719 | 8234a9db0611 | application_restart | 0 | 11 | PASS |
| 2 | g2-mwdm868t-2v-tilbic-title_screen_restart | 3 | 2953295820 | 312 | 16 | 24 | 0.296 | 29896c750254 | daa6f1fd3181 | title_screen_restart | 0 | 22 | PASS |
| 3 | g2-mwdm86a6-2w-16o13s2-failure_restart | 6 | 3970200055 | 261 | 13 | 24 | 0.425 | 4b3249dc1429 | 6ea85ecc0e31 | failure_restart | 0 | 20 | PASS |
| 4 | g2-mwdm86b8-2x-e6m9m8-new_game | 2 | 537210448 | 300 | 14 | 25 | 0.499 | 9a70b370dd76 | a84dacdf897c | new_game | 0 | 21 | PASS |
| 5 | g2-mwdm86c0-2y-8ygesy-application_restart | 8 | 621294573 | 192 | 15 | 24 | 0.359 | e08a11a9a833 | 0ab7c5bf0aa8 | application_restart | 0 | 11 | PASS |
| 6 | g2-mwdm86co-2z-103k09r-title_screen_restart | 5 | 3342572743 | 291 | 13 | 25 | 0.509 | 711de1f381d3 | 1efdc16d8d05 | title_screen_restart | 0 | 16 | PASS |
| 7 | g2-mwdm86dm-30-1wkhnfx-failure_restart | 3 | 3727849654 | 312 | 16 | 25 | 0.471 | e484d245d9d9 | 748f317f71c2 | failure_restart | 0 | 19 | PASS |
| 8 | g2-mwdm86es-31-1ivadbo-new_game | 1 | 3965200040 | 282 | 13 | 24 | 0.523 | 61c76089b18d | fcaed141aca3 | new_game | 0 | 18 | PASS |
| 9 | g2-mwdm86fn-32-hntq3v-application_restart | 8 | 1043492699 | 192 | 15 | 23 | 0.467 | 028c26c966d7 | ca6485e6cf3a | application_restart | 0 | 13 | PASS |
| 10 | g2-mwdm86gc-33-oqnkl9-title_screen_restart | 5 | 779560849 | 291 | 13 | 24 | 0.55 | 2e967d218302 | fa2aadc3152e | title_screen_restart | 0 | 14 | PASS |
| 11 | g2-mwdm86hi-34-q0bliu-failure_restart | 6 | 2033815470 | 261 | 13 | 22 | 0.557 | c75fd35a2a45 | 35ce5468f755 | failure_restart | 0 | 19 | PASS |
| 12 | g2-mwdm86ik-35-zd22fc-new_game | 7 | 1020911247 | 312 | 14 | 23 | 0.437 | 537cd14bffaa | 326c9b00049c | new_game | 0 | 17 | PASS |
| 13 | g2-mwdm86jk-36-7m1sj5-application_restart | 1 | 536210445 | 282 | 13 | 24 | 0.385 | fc9531543d33 | 98799c11d097 | application_restart | 0 | 18 | PASS |
| 14 | g2-mwdm86kl-37-i0tt1z-title_screen_restart | 9 | 2572018921 | 255 | 15 | 24 | 0.497 | 6a15849eb089 | 4baeca1afda6 | title_screen_restart | 0 | 17 | PASS |
| 15 | g2-mwdm86lg-38-fxd2hu-failure_restart | 2 | 4205550435 | 300 | 14 | 23 | 0.421 | 58526650b750 | 7bf86ed292a9 | failure_restart | 0 | 16 | PASS |
| 16 | g2-mwdm86mg-39-u2lrcl-new_game | 0 | 1309764276 | 321 | 15 | 25 | 0.521 | 273546cbcf1a | 33b37613dbfb | new_game | 0 | 19 | PASS |
| 17 | g2-mwdm86nk-3a-1929p0v-application_restart | 4 | 3580923132 | 273 | 13 | 23 | 0.387 | 931a194ec886 | da483e0d3c99 | application_restart | 0 | 17 | PASS |
| 18 | g2-mwdm86ok-3b-1khoavb-title_screen_restart | 5 | 2715945434 | 291 | 13 | 24 | 0.565 | c5dddbbd9723 | e7b88ff4b5ad | title_screen_restart | 0 | 19 | PASS |
| 19 | g2-mwdm86pu-3c-wietdx-failure_restart | 3 | 2418092378 | 312 | 16 | 25 | 0.44 | 660439d180be | f68e019d25f3 | failure_restart | 0 | 28 | PASS |
| 20 | g2-mwdm86rb-3d-1nncihg-new_game | 8 | 1557114692 | 192 | 15 | 23 | 0.342 | 45f03188133d | 607c0580732f | new_game | 0 | 20 | PASS |
| 21 | g2-mwdm86s0-3e-6i15zz-application_restart | 0 | 2563018894 | 321 | 15 | 23 | 0.5 | 2d37b6dd4c67 | bd7f41edd437 | application_restart | 0 | 17 | PASS |
| 22 | g2-mwdm86t2-3f-1kmvihe-title_screen_restart | 2 | 4205550435 | 300 | 14 | 23 | 0.479 | 58526650b750 | 7bf86ed292a9 | title_screen_restart | 0 | 19 | PASS |
| 23 | g2-mwdm86tx-3g-19y5dqz-failure_restart | 4 | 1940391597 | 273 | 13 | 24 | 0.33 | eea1a0fc9a92 | b935672e90f3 | failure_restart | 0 | 12 | PASS |
| 24 | g2-mwdm86ur-3h-1crh58l-new_game | 8 | 3162725018 | 192 | 15 | 23 | 0.373 | 9914a64d56b6 | 94da966adff8 | new_game | 0 | 12 | PASS |
| 25 | g2-mwdm86vg-3i-1trita4-application_restart | 5 | 2715945434 | 291 | 13 | 24 | 0.565 | c5dddbbd9723 | e7b88ff4b5ad | application_restart | 0 | 12 | PASS |
| 26 | g2-mwdm86w8-3j-1c69dcj-title_screen_restart | 2 | 2656442767 | 300 | 14 | 25 | 0.502 | c6207fffe935 | 7b618e9468fb | title_screen_restart | 0 | 11 | PASS |
| 27 | g2-mwdm86xa-3k-18pu0nu-failure_restart | 7 | 1943391606 | 312 | 14 | 22 | 0.5 | bddd1e34f507 | d4b9fee46f48 | failure_restart | 0 | 19 | PASS |
| 28 | g2-mwdm86yg-3l-1ywcotf-new_game | 0 | 3337572728 | 321 | 15 | 23 | 0.437 | 09611f418eba | 8cab99fc35f0 | new_game | 0 | 22 | PASS |
| 29 | g2-mwdm86zp-3m-2iirnq-application_restart | 4 | 4007012 | 273 | 13 | 25 | 0.497 | 75d6d92734b0 | 377b76b02864 | application_restart | 0 | 20 | PASS |
| 30 | g2-mwdm870l-3n-vkgcfb-title_screen_restart | 8 | 2592600367 | 192 | 15 | 25 | 0.474 | bb945c9873a3 | 19e3bd8d1251 | title_screen_restart | 0 | 10 | PASS |
| 31 | g2-mwdm8714-3o-130e4ig-failure_restart | 6 | 2033815470 | 261 | 13 | 22 | 0.553 | c75fd35a2a45 | 35ce5468f755 | failure_restart | 0 | 11 | PASS |
| 32 | g2-mwdm871v-3p-1rwbika-new_game | 1 | 1845967721 | 282 | 13 | 25 | 0.517 | 6cf5a3fe0cf6 | 59116a2fc18b | new_game | 0 | 13 | PASS |
| 33 | g2-mwdm872t-3q-bcjwj8-application_restart | 5 | 836063507 | 291 | 13 | 25 | 0.405 | 45cb7e9145f4 | 2f63ee2ea58b | application_restart | 0 | 17 | PASS |
| 34 | g2-mwdm873t-3r-122bu1l-title_screen_restart | 9 | 2036815479 | 255 | 15 | 24 | 0.497 | a642bf3bd01f | 5482d3ad8f70 | title_screen_restart | 0 | 16 | PASS |
| 35 | g2-mwdm874o-3s-4ngs1t-failure_restart | 2 | 1311764282 | 300 | 14 | 22 | 0.414 | 324bd9caf397 | 1b635b97416c | failure_restart | 0 | 16 | PASS |
| 36 | g2-mwdm8763-3t-qlvaox-new_game | 4 | 1792465072 | 273 | 13 | 25 | 0.523 | e56c81d8e5a1 | 597fd4b6c28a | new_game | 0 | 31 | PASS |
| 37 | g2-mwdm876x-3u-refgxp-application_restart | 8 | 4211550453 | 192 | 15 | 23 | 0.432 | 45932f0116d9 | c8e7d328ee63 | application_restart | 0 | 12 | PASS |
| 38 | g2-mwdm877l-3v-19eewsk-title_screen_restart | 0 | 1549114668 | 321 | 15 | 24 | 0.529 | e787ebbba784 | 4d73cfc8c3cc | title_screen_restart | 0 | 17 | PASS |
| 39 | g2-mwdm878s-3w-njc4h2-failure_restart | 5 | 540210457 | 291 | 13 | 24 | 0.413 | f594e91a0784 | 8202a983d6cc | failure_restart | 0 | 19 | PASS |
| 40 | g2-mwdm879w-3x-1s2t9f1-new_game | 2 | 3966200043 | 300 | 14 | 24 | 0.465 | 819f83da5a47 | 724364dc02cb | new_game | 0 | 20 | PASS |
| 41 | g2-mwdm87ba-3y-1wuut3q-application_restart | 3 | 59509667 | 312 | 16 | 23 | 0.59 | f049b5097250 | 58d8e5a59b78 | application_restart | 0 | 25 | PASS |
| 42 | g2-mwdm87cd-3z-pvlgjs-title_screen_restart | 9 | 3973200064 | 255 | 15 | 25 | 0.394 | bc0595f092ca | 652b98d86104 | title_screen_restart | 0 | 19 | PASS |
| 43 | g2-mwdm87dj-40-1v7ibe-failure_restart | 0 | 3337572728 | 321 | 15 | 23 | 0.484 | 09611f418eba | 8cab99fc35f0 | failure_restart | 0 | 23 | PASS |
| 44 | g2-mwdm87ew-41-1skihkd-new_game | 4 | 2419092381 | 273 | 13 | 25 | 0.38 | 1cbb488bce95 | 1883b6063c4b | new_game | 0 | 21 | PASS |
| 45 | g2-mwdm87g0-42-1oyb5ib-application_restart | 6 | 1611617344 | 261 | 13 | 23 | 0.549 | a01272778729 | 9fd87230f864 | application_restart | 0 | 18 | PASS |
| 46 | g2-mwdm87gr-43-cfmzlm-title_screen_restart | 9 | 1318764303 | 255 | 15 | 25 | 0.538 | 31c385aac4fb | 74ac36a0613f | title_screen_restart | 0 | 14 | PASS |
| 47 | g2-mwdm87hn-44-wky3cz-failure_restart | 1 | 1937391588 | 282 | 13 | 24 | 0.313 | 0ce9ff524cb2 | 4b1d07dd3e32 | failure_restart | 0 | 17 | PASS |
| 48 | g2-mwdm87iu-45-ii08fk-new_game | 2 | 776560840 | 300 | 14 | 25 | 0.515 | 09dd4f5c42af | 8f2067be8e08 | new_game | 0 | 23 | PASS |
| 49 | g2-mwdm87js-46-ci0v7h-application_restart | 8 | 1705041217 | 192 | 15 | 25 | 0.376 | 1e555538300e | cec8a1d10123 | application_restart | 0 | 11 | PASS |
| 50 | g2-mwdm87kl-47-wiig4l-title_screen_restart | 3 | 2418092378 | 312 | 16 | 25 | 0.335 | 660439d180be | f68e019d25f3 | title_screen_restart | 0 | 20 | PASS |
| 51 | g2-mwdm87ml-49-1jemxh8-failure_restart | 9 | 783560861 | 255 | 15 | 25 | 0.473 | c70139694531 | f95995771d9a | failure_restart | 0 | 13 | PASS |
| 52 | g2-mwdm87nd-4a-1aadbzp-new_game | 6 | 4266053105 | 261 | 13 | 24 | 0.385 | 59c061674925 | 3cb603d67035 | new_game | 0 | 14 | PASS |
| 53 | g2-mwdm87o4-4b-s10d0f-application_restart | 8 | 29588473 | 192 | 15 | 24 | 0.375 | 43b33f705c13 | bacdb308df33 | application_restart | 0 | 12 | PASS |
| 54 | g2-mwdm87ov-4c-12ixl04-title_screen_restart | 2 | 2952295817 | 300 | 14 | 24 | 0.39 | d2b22cb81fe8 | c839afc6fc0e | title_screen_restart | 0 | 18 | PASS |
| 55 | g2-mwdm87q6-4d-1aufby1-failure_restart | 9 | 1170837778 | 255 | 15 | 25 | 0.437 | 2da52e4b1ada | 89cfd23aa691 | failure_restart | 0 | 22 | PASS |
| 56 | g2-mwdm87qy-4e-1fwiqol-new_game | 6 | 2864871962 | 261 | 13 | 24 | 0.501 | c127d1b333db | 57b89d88435f | new_game | 0 | 14 | PASS |
| 57 | g2-mwdm87rw-4f-veh5t-application_restart | 0 | 2654442761 | 321 | 15 | 25 | 0.467 | e60a5a7c68c9 | 599fca55f85d | application_restart | 0 | 18 | PASS |
| 58 | g2-mwdm87t5-4g-e50d5h-title_screen_restart | 7 | 2182741998 | 312 | 14 | 24 | 0.565 | aad0859c95d3 | 090c217982aa | title_screen_restart | 0 | 24 | PASS |
| 59 | g2-mwdm87u9-4h-192xdws-failure_restart | 9 | 3050719705 | 255 | 15 | 25 | 0.369 | b8c8782edd51 | 88c62ce67cf7 | failure_restart | 0 | 18 | PASS |
| 60 | g2-mwdm87v9-4i-124mi74-new_game | 6 | 3970200055 | 261 | 13 | 24 | 0.486 | 4b3249dc1429 | 6ea85ecc0e31 | new_game | 0 | 19 | PASS |
| 61 | g2-mwdm87vw-4j-1hwy6o4-application_restart | 8 | 3106222360 | 192 | 15 | 23 | 0.458 | 8f2d7bcf52c5 | f8855d8a51d1 | application_restart | 0 | 11 | PASS |
| 62 | g2-mwdm87wo-4k-w9nh1h-title_screen_restart | 3 | 3579923129 | 312 | 16 | 24 | 0.381 | 13bf7a7c63fa | e185988cb838 | title_screen_restart | 0 | 19 | PASS |
| 63 | g2-mwdm87xs-4l-11xir94-failure_restart | 4 | 3580923132 | 273 | 13 | 23 | 0.584 | 931a194ec886 | da483e0d3c99 | failure_restart | 0 | 19 | PASS |
| 64 | g2-mwdm87yr-4m-b2fttj-new_game | 9 | 1945391612 | 255 | 15 | 24 | 0.508 | 5f26a08e6453 | c420e7c7f8df | new_game | 0 | 15 | PASS |
| 65 | g2-mwdm87zo-4n-1g27wv1-application_restart | 5 | 2420092384 | 291 | 13 | 23 | 0.482 | 8af77d247a80 | d0e4686cd0ae | application_restart | 0 | 18 | PASS |
| 66 | g2-mwdm880i-4o-1achzmw-title_screen_restart | 8 | 1078413908 | 192 | 15 | 24 | 0.37 | 61a68dd63acd | ca408542f255 | title_screen_restart | 0 | 13 | PASS |
| 67 | g2-mwdm881d-4p-17tamyg-failure_restart | 0 | 2175741977 | 321 | 15 | 24 | 0.402 | e82344bca5d9 | 9dc7600b4fbd | failure_restart | 0 | 20 | PASS |
| 68 | g2-mwdm882g-4q-72jj7u-new_game | 1 | 2655442764 | 282 | 13 | 23 | 0.472 | 47bd8881b218 | 31511411ac90 | new_game | 0 | 17 | PASS |
| 69 | g2-mwdm883e-4r-14dojzh-application_restart | 4 | 60509670 | 273 | 13 | 25 | 0.421 | 17fd0c8f65aa | 672c4ee323b5 | application_restart | 0 | 18 | PASS |
| 70 | g2-mwdm884h-4s-zcp3br-title_screen_restart | 6 | 1942391603 | 261 | 13 | 24 | 0.488 | f6dd3c9d4244 | a50ca08cdfb4 | title_screen_restart | 0 | 20 | PASS |
| 71 | g2-mwdm885b-4t-29tlyx-failure_restart | 9 | 156933552 | 255 | 15 | 25 | 0.464 | d3aa3dd53a6b | a1c3b0b9a1b6 | failure_restart | 0 | 12 | PASS |
| 72 | g2-mwdm8868-4u-16nmtvj-new_game | 7 | 3344572749 | 312 | 14 | 24 | 0.479 | 9309e6cd8773 | c2a1dc4c7ac3 | new_game | 0 | 20 | PASS |
| 73 | g2-mwdm887f-4v-1647brn-application_restart | 2 | 1551114674 | 300 | 14 | 25 | 0.497 | a5e7ff8f2669 | 24b57db98b4f | application_restart | 0 | 20 | PASS |
| 74 | g2-mwdm888j-4w-m51at4-title_screen_restart | 4 | 1701041205 | 273 | 13 | 23 | 0.5 | 00da00b9638d | a6a51c76e048 | title_screen_restart | 0 | 19 | PASS |
| 75 | g2-mwdm889f-4x-1vkfdrz-failure_restart | 9 | 1706041220 | 255 | 15 | 24 | 0.301 | dbdde56cd6ca | 5f3c47864915 | failure_restart | 0 | 15 | PASS |
| 76 | g2-mwdm88ae-4y-13c6p2u-new_game | 7 | 3196646224 | 312 | 14 | 23 | 0.394 | acce52c52496 | f79abffdd573 | new_game | 0 | 18 | PASS |
| 77 | g2-mwdm88bg-4z-mchh3w-application_restart | 6 | 2329668520 | 261 | 13 | 25 | 0.501 | 1bbc953eceab | fe12ebf659da | application_restart | 0 | 18 | PASS |
| 78 | g2-mwdm88c9-50-pgk8ld-title_screen_restart | 5 | 1941391600 | 291 | 13 | 24 | 0.484 | f4ddaef64b3b | 25ba0f2843c7 | title_screen_restart | 0 | 16 | PASS |
| 79 | g2-mwdm88d9-51-10d04bc-failure_restart | 1 | 3486499256 | 282 | 13 | 25 | 0.426 | a2ace68b7a8f | 59f49bf81906 | failure_restart | 0 | 18 | PASS |
| 80 | g2-mwdm88e8-52-9b9z02-new_game | 2 | 2417092375 | 300 | 14 | 25 | 0.401 | 2397093104c1 | 2f431e584acd | new_game | 0 | 18 | PASS |
| 81 | g2-mwdm88fc-53-1ksx4m3-application_restart | 9 | 1466690828 | 255 | 15 | 25 | 0.505 | b1b82082da13 | 9a640ea45ff0 | application_restart | 0 | 19 | PASS |
| 82 | g2-mwdm88gd-54-1y6fh9w-title_screen_restart | 4 | 447786587 | 273 | 13 | 25 | 0.492 | 1a8024a0a296 | 69eb2c25d937 | title_screen_restart | 0 | 20 | PASS |
| 83 | g2-mwdm88hb-55-197o5aj-failure_restart | 7 | 3105222357 | 312 | 14 | 23 | 0.39 | 2558135a1452 | 84a4b4a7ea63 | failure_restart | 0 | 18 | PASS |
| 84 | g2-mwdm88if-56-1ne0q4-new_game | 1 | 1789465063 | 282 | 13 | 23 | 0.441 | 0fd20c2ff970 | 99fbe9793086 | new_game | 0 | 18 | PASS |
| 85 | g2-mwdm88jl-57-12twtpp-application_restart | 9 | 2093318137 | 255 | 15 | 25 | 0.493 | f14518ee0d0c | feafb51809c2 | application_restart | 0 | 21 | PASS |
| 86 | g2-mwdm88kh-58-3xhvvz-title_screen_restart | 5 | 3729849660 | 291 | 13 | 25 | 0.407 | 24ecd5d03239 | 0354f7fa47f8 | title_screen_restart | 0 | 14 | PASS |
| 87 | g2-mwdm88le-59-pnon4t-failure_restart | 4 | 4059623916 | 273 | 13 | 25 | 0.5 | e8ee799a4e0b | b33fb5bc70da | failure_restart | 0 | 16 | PASS |
| 88 | g2-mwdm88me-5a-b98dg5-new_game | 6 | 1167837769 | 261 | 13 | 25 | 0.512 | 975533138d9e | 8c0390d42253 | new_game | 0 | 19 | PASS |
| 89 | g2-mwdm88nb-5b-19w0tn8-application_restart | 1 | 296860053 | 282 | 13 | 24 | 0.515 | 6cb11773fdd2 | 5d5e39e4dcbb | application_restart | 0 | 16 | PASS |
| 90 | g2-mwdm88od-5c-z2km6y-title_screen_restart | 2 | 833063498 | 300 | 14 | 25 | 0.483 | 5367e65c9896 | 04a38a5680c7 | title_screen_restart | 0 | 21 | PASS |
| 91 | g2-mwdm88po-5d-1yr5xlr-failure_restart | 4 | 2954295823 | 273 | 13 | 24 | 0.559 | 71c2b85b4401 | 4b0782b4ec51 | failure_restart | 0 | 23 | PASS |
| 92 | g2-mwdm88qp-5e-1o6tm97-new_game | 7 | 3344572749 | 312 | 14 | 24 | 0.457 | 9309e6cd8773 | c2a1dc4c7ac3 | new_game | 0 | 21 | PASS |
| 93 | g2-mwdm88rp-5f-i7omzr-application_restart | 0 | 2084318110 | 321 | 15 | 25 | 0.377 | eec051be3cb1 | 97044d883b40 | application_restart | 0 | 15 | PASS |
| 94 | g2-mwdm88ss-5g-1utmj8z-title_screen_restart | 8 | 2592600367 | 192 | 15 | 25 | 0.364 | bb945c9873a3 | 19e3bd8d1251 | title_screen_restart | 0 | 13 | PASS |
| 95 | g2-mwdm88tf-5h-4n7wrd-failure_restart | 6 | 1611617344 | 261 | 13 | 23 | 0.392 | a01272778729 | 9fd87230f864 | failure_restart | 0 | 13 | PASS |
| 96 | g2-mwdm88ub-5i-xnm7i-new_game | 7 | 2330668523 | 312 | 14 | 25 | 0.455 | 5754a380656d | 0379ea0f3e0c | new_game | 0 | 15 | PASS |
| 97 | g2-mwdm88vk-5j-xmghtk-application_restart | 5 | 4117126577 | 291 | 13 | 25 | 0.497 | d5d5d99119d6 | ef4e66d42c38 | application_restart | 0 | 23 | PASS |
| 98 | g2-mwdm88wm-5k-1iyvci2-title_screen_restart | 9 | 3973200064 | 255 | 15 | 25 | 0.53 | bc0595f092ca | 652b98d86104 | title_screen_restart | 0 | 14 | PASS |
| 99 | g2-mwdm88xd-5l-3kp0z-failure_restart | 2 | 3043719684 | 300 | 14 | 25 | 0.471 | 5bb1213071a9 | c3685f604248 | failure_restart | 0 | 13 | PASS |
| 100 | g2-mwdm88yf-5m-ebteiv-new_game | 3 | 1460690810 | 312 | 16 | 25 | 0.411 | 58d98d5e5747 | 3a88665ee09c | new_game | 0 | 20 | PASS |

</details>

## 失败案例与原因

本次运行 **0** 个生成失败案例；每次重试的原因均记录在 `random-generation-report.json` 的逐局 `retries` 字段。

## 测试性质说明

- 运行时：两关各 100 局真实调用 `createNewGame`，真实生成、真实签名、真实校验。
- 相似度：用**真实牌面**两两计算 `layoutSimilarity`（层占位格 Jaccard 均值 ×0.5 + 整体轮廓 Jaccard ×0.5），不是签名比较。
- 静态审计：三种重新开局入口通过读取 `src/main.js` 源码确认全部走统一入口；未冒充浏览器实测。
- 重启模拟：把存档 JSON 写入磁盘再读回，继续生成并验证差异化。
- 浏览器实际运行 / Windows 安装卸载测试不在本文件覆盖范围，见 `FINAL_ACCEPTANCE.md`。
