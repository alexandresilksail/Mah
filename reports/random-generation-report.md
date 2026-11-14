# 双关卡各 100 局随机生成压力测试报告

> 本文件由 `node test-random-generation.js` **真实运行**自动生成，不是静态 PASS 模板。

- 运行时间：2026-11-14T08:53:36.781Z
- Git commit：`8a0c434ad1e4a4da2b906a5744105aeac883144a`
- 断言：通过 **7788**，失败 **0**
- 总耗时：12509 ms
- 布局签名算法：`MAH-LAYOUT-SIG-v1/SHA-256`（SHA-256，浏览器与 Node 共用同一实现）
- 历史窗口：L1 最近 3 局（冻结）/ L2 最近 10 局；第二关 20 套模板 + 模板级 / 几何级双重去重；重复阈值 sim ≥ 0.6；重试上限 50 次

## 全局

| 项 | 值 |
|---|---|
| 总生成局数 | 200 |
| gameId 唯一数 | 202 / 202 |
| 布局签名总数 / 去重 | 200 / 200 |
| 生成失败次数 | 0 |
| 重试总次数 | 14 |
| 平均单局生成耗时 | 22.82 ms |
| 失败案例 | 0 |

## 滑动窗口相似度（L1 三局 / L2 十局）

| 关卡 | 窗口对数 | 均值 | P95 | 最大值 | 阈值 | 判定 |
|---|---|---|---|---|---|---|
| L1 | 294 | 0.2396 | 0.5103 | 0.5971 | 0.6 | ✓ 全部 < 0.60 |
| L2 | 945 | 0.2716 | 0.3919 | 0.5277 | 0.6 | ✓ 全部 < 0.60 |

## 同档位不同 seed 的几何多样性（第 2.4 节）

| 档位 | 30 seed 中不同几何数 | ≥25 |
|---|---|---|
| 0 | 29 | ✓ |
| 1 | 30 | ✓ |
| 2 | 30 | ✓ |
| 3 | 30 | ✓ |

| 档位 | 30 seed 中不同几何数 | ≥25 |
|---|---|---|
| 0 | 27 | ✓ |
| 1 | 28 | ✓ |
| 2 | 25 | ✓ |
| 3 | 30 | ✓ |
| 4 | 26 | ✓ |
| 5 | 27 | ✓ |
| 6 | 29 | ✓ |
| 7 | 26 | ✓ |
| 8 | 29 | ✓ |
| 9 | 26 | ✓ |

## 第 1 关 · 100 局

| 项 | 值 |
|---|---|
| 耗时 | 1581 ms |
| 牌数范围 | 24 – 48 |
| 开局可点牌范围 | 14 – 42 |
| 档位分布 | {"0":25,"1":25,"2":25,"3":25} |
| 牌数分布 | {"24":25,"30":25,"36":25,"48":25} |
| 牌型数分布 | {"8":25,"10":25,"12":25,"16":25} |
| 生成原因分布 | {"application_restart":25,"title_screen_restart":25,"failure_restart":25,"new_game":25} |
| 布局签名去重 | 100 / 100 |
| 最近 3 局总牌数重复 | 0 |
| 最近 3 局布局签名重复 | 0 |
| 最近 3 局几何签名重复 | 0 |
| 重试次数（失败重试合计） | 11 |
| 生成失败次数 | 0 |
| 滑窗 sim 均值 / P95 / 最大 | 0.2396 / 0.5103 / 0.5971 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 10.10 ms |

<details><summary>完整 100 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | sim最大 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g1-mwg64vs0-1-1qyznah-application_restart | 2 | 3340229927 | 36 | 12 | 31 | 0 | cf7474c196f9 | 215a01b28a1c | application_restart | 0 | 7 | PASS |
| 2 | g1-mwg64vsq-2-exjmvr-title_screen_restart | 3 | 3760953148 | 48 | 16 | 35 | 0.122 | 84816e4b7411 | 3a75b3d69ad6 | title_screen_restart | 0 | 14 | PASS |
| 3 | g1-mwg64vta-3-ld1lbn-failure_restart | 0 | 1008628957 | 24 | 8 | 20 | 0.502 | 70fd6b6ba44b | a852bf22424b | failure_restart | 0 | 10 | PASS |
| 4 | g1-mwg64vth-4-8jc6vn-new_game | 1 | 1271745696 | 30 | 10 | 25 | 0.244 | bc4899853234 | ec869859c581 | new_game | 0 | 5 | PASS |
| 5 | g1-mwg64vtt-5-1r9oy5m-application_restart | 2 | 3117011245 | 36 | 12 | 26 | 0.366 | 49b0290ed663 | 95d7c3eac771 | application_restart | 0 | 8 | PASS |
| 6 | g1-mwg64vuv-6-1lu9dwj-title_screen_restart | 3 | 4196953720 | 48 | 16 | 35 | 0.199 | 436ca97c5ecd | 8b3f4dbcc553 | title_screen_restart | 0 | 33 | PASS |
| 7 | g1-mwg64vwe-7-1oqg1iq-failure_restart | 0 | 1499083973 | 24 | 8 | 20 | 0.236 | d9a677cbe319 | 5821d82a695b | failure_restart | 0 | 27 | PASS |
| 8 | g1-mwg64vwn-8-1kkv6yu-new_game | 1 | 2501085734 | 30 | 10 | 30 | 0.452 | 70602caec752 | d71302e76514 | new_game | 0 | 6 | PASS |
| 9 | g1-mwg64vwz-9-2pdqv6-application_restart | 2 | 1684543074 | 36 | 12 | 26 | 0.187 | b9cd5925db43 | f6977e36ac28 | application_restart | 0 | 8 | PASS |
| 10 | g1-mwg64vxg-a-1e4slnr-title_screen_restart | 3 | 3002609250 | 48 | 16 | 34 | 0.449 | 9b312c60ccb9 | 101820c3b9e2 | title_screen_restart | 0 | 11 | PASS |
| 11 | g1-mwg64vxw-b-1pjtp31-failure_restart | 0 | 3693341786 | 24 | 8 | 19 | 0.29 | 41c2f155bd63 | 8b66592be877 | failure_restart | 0 | 8 | PASS |
| 12 | g1-mwg64vyf-c-1x1d79g-new_game | 1 | 3838122633 | 30 | 10 | 30 | 0.236 | 1c61b77da0bb | dc87bca27173 | new_game | 3 | 16 | PASS |
| 13 | g1-mwg64vyq-d-bopy5o-application_restart | 2 | 1716603401 | 36 | 12 | 32 | 0.597 | c5a5301d74df | 1afef8b50295 | application_restart | 0 | 7 | PASS |
| 14 | g1-mwg64vz4-e-2wc85a-title_screen_restart | 3 | 14443917 | 48 | 16 | 33 | 0.29 | 4ad08292f110 | 01102a9fc173 | title_screen_restart | 0 | 9 | PASS |
| 15 | g1-mwg64vzg-f-1o1d8pf-failure_restart | 0 | 1788765201 | 24 | 8 | 16 | 0.265 | f0634e3778e2 | cb3882063936 | failure_restart | 0 | 7 | PASS |
| 16 | g1-mwg64vzm-g-1oby2qs-new_game | 1 | 2792463712 | 30 | 10 | 27 | 0.389 | d85626d78a43 | 98984f1b4f11 | new_game | 0 | 4 | PASS |
| 17 | g1-mwg64vzv-h-19p3nho-application_restart | 2 | 4123033862 | 36 | 12 | 26 | 0.514 | c1b574e56d63 | d7c580d00c12 | application_restart | 0 | 6 | PASS |
| 18 | g1-mwg64w0p-i-7lt05z-title_screen_restart | 3 | 2643413302 | 48 | 16 | 34 | 0.291 | d2fd09b91355 | b79cba29e9f6 | title_screen_restart | 0 | 26 | PASS |
| 19 | g1-mwg64w1s-j-45l9zd-failure_restart | 0 | 530775856 | 24 | 8 | 20 | 0.296 | 42d58e442c46 | 33306680ce36 | failure_restart | 0 | 17 | PASS |
| 20 | g1-mwg64w1z-k-1lgz1ug-new_game | 1 | 1821803635 | 30 | 10 | 22 | 0.263 | 6f112a0c9e9d | f0589cf677b2 | new_game | 0 | 5 | PASS |
| 21 | g1-mwg64w29-l-1lgbt7g-application_restart | 2 | 2923435525 | 36 | 12 | 32 | 0.517 | 3554de6a3880 | ff7f921cb3a9 | application_restart | 0 | 7 | PASS |
| 22 | g1-mwg64w2p-m-sov5hu-title_screen_restart | 3 | 3458661551 | 48 | 16 | 37 | 0.263 | 961899623113 | 2b947fbb6d34 | title_screen_restart | 0 | 12 | PASS |
| 23 | g1-mwg64w35-n-15nb27j-failure_restart | 0 | 1490787257 | 24 | 8 | 20 | 0.517 | 0bc2b449b8ca | 4751c32464e0 | failure_restart | 0 | 9 | PASS |
| 24 | g1-mwg64w3d-o-17fp5w1-new_game | 1 | 2204858183 | 30 | 10 | 25 | 0.542 | 224273611eb0 | e8a573adac2c | new_game | 0 | 5 | PASS |
| 25 | g1-mwg64w3o-p-sde6wu-application_restart | 2 | 1660561259 | 36 | 12 | 26 | 0.484 | 9f2d57e09a04 | 7b3e5568fcf9 | application_restart | 0 | 7 | PASS |
| 26 | g1-mwg64w47-q-7tsold-title_screen_restart | 3 | 1621682886 | 48 | 16 | 34 | 0.18 | 340f91358d04 | 1ae03bd870c4 | title_screen_restart | 0 | 14 | PASS |
| 27 | g1-mwg64w4n-r-ywsn8p-failure_restart | 0 | 3573101265 | 24 | 8 | 21 | 0.261 | abf0b34d39db | d0b8a4f7b3aa | failure_restart | 0 | 8 | PASS |
| 28 | g1-mwg64w4s-s-1o4z10p-new_game | 1 | 4123950902 | 30 | 10 | 23 | 0.432 | f2fa7edc801b | 723d133d6aef | new_game | 0 | 4 | PASS |
| 29 | g1-mwg64w52-t-lq6kwd-application_restart | 2 | 3225691502 | 36 | 12 | 26 | 0.191 | ad9c4c95ccb8 | e37ce1e37f78 | application_restart | 0 | 7 | PASS |
| 30 | g1-mwg64w5f-u-4hi03g-title_screen_restart | 3 | 3149149985 | 48 | 16 | 36 | 0.587 | c9fbed0393a3 | 32b75229fd61 | title_screen_restart | 0 | 10 | PASS |
| 31 | g1-mwg64w5t-v-1mk1y49-failure_restart | 0 | 3687918171 | 24 | 8 | 21 | 0.509 | dcdd1d406baa | 74f3985a4552 | failure_restart | 0 | 8 | PASS |
| 32 | g1-mwg64w61-w-1m139qs-new_game | 1 | 497283945 | 30 | 10 | 21 | 0.3 | f197ccec9361 | ba876a98c9be | new_game | 0 | 5 | PASS |
| 33 | g1-mwg64w6c-x-qbraqp-application_restart | 2 | 4270029707 | 36 | 12 | 29 | 0.233 | 1109eeefb623 | 7ba298339c89 | application_restart | 0 | 7 | PASS |
| 34 | g1-mwg64w6s-y-1s8m5q9-title_screen_restart | 3 | 1917769393 | 48 | 16 | 36 | 0.354 | 54e874e220d1 | 7ba161ebb14d | title_screen_restart | 0 | 12 | PASS |
| 35 | g1-mwg64w7a-z-1g7ij23-failure_restart | 0 | 1596996800 | 24 | 8 | 24 | 0.288 | 382dead594a6 | 8ca6989274ea | failure_restart | 0 | 10 | PASS |
| 36 | g1-mwg64w7i-10-123asl1-new_game | 1 | 4246978758 | 30 | 10 | 26 | 0.497 | ed98eee39490 | 087ccbce5ad8 | new_game | 0 | 7 | PASS |
| 37 | g1-mwg64w7u-11-7hhqi7-application_restart | 2 | 1029459030 | 36 | 12 | 25 | 0.329 | c14d31235b13 | fe59021d4b94 | application_restart | 0 | 8 | PASS |
| 38 | g1-mwg64w8j-12-16dgsk7-title_screen_restart | 3 | 1118490020 | 48 | 16 | 33 | 0.328 | c78d7cfeafbb | 73084e3567d7 | title_screen_restart | 0 | 20 | PASS |
| 39 | g1-mwg64w9i-13-16egmfu-failure_restart | 0 | 3435614787 | 24 | 8 | 14 | 0.381 | 2a3dcc91c85e | dd576b407d18 | failure_restart | 0 | 18 | PASS |
| 40 | g1-mwg64w9r-14-s7hgpr-new_game | 1 | 3905098109 | 30 | 10 | 25 | 0.345 | 831b4b6b58b7 | 9aa640c6813a | new_game | 0 | 6 | PASS |
| 41 | g1-mwg64wa6-15-ua0188-application_restart | 2 | 615959719 | 36 | 12 | 31 | 0.416 | cbb635cbb244 | e8a8f74e9d49 | application_restart | 1 | 11 | PASS |
| 42 | g1-mwg64way-16-18ptd26-title_screen_restart | 3 | 3852806088 | 48 | 16 | 34 | 0.494 | 47d09ec102ba | a60b4c1d3be1 | title_screen_restart | 1 | 23 | PASS |
| 43 | g1-mwg64wbi-17-1goa1f0-failure_restart | 0 | 2569418296 | 24 | 8 | 20 | 0.564 | 03a697fa179e | 6b9e30a7ee3d | failure_restart | 0 | 11 | PASS |
| 44 | g1-mwg64wbp-18-1c35vwa-new_game | 1 | 1135636892 | 30 | 10 | 26 | 0.236 | 6abb588540f4 | c7b9fb74d804 | new_game | 0 | 5 | PASS |
| 45 | g1-mwg64wc5-19-dtowwz-application_restart | 2 | 2927456095 | 36 | 12 | 27 | 0.388 | 6315461722e4 | affa604e1840 | application_restart | 1 | 12 | PASS |
| 46 | g1-mwg64wck-1a-1hdbabo-title_screen_restart | 3 | 3020753119 | 48 | 16 | 33 | 0.296 | b4cc35b8df89 | 78aae81e7511 | title_screen_restart | 0 | 10 | PASS |
| 47 | g1-mwg64wcw-1b-1ydi1p9-failure_restart | 0 | 4290705164 | 24 | 8 | 19 | 0.452 | b7411109b641 | 213707536990 | failure_restart | 0 | 7 | PASS |
| 48 | g1-mwg64wd3-1c-wwiwcy-new_game | 1 | 2195207848 | 30 | 10 | 22 | 0.31 | 51d6fbe0da20 | 4e3bd678fa65 | new_game | 0 | 5 | PASS |
| 49 | g1-mwg64wdj-1d-1xt3cys-application_restart | 2 | 4113943078 | 36 | 12 | 25 | 0.24 | f80a3fbaeb7c | 8bc0f6237a03 | application_restart | 0 | 12 | PASS |
| 50 | g1-mwg64wer-1e-s6fssr-title_screen_restart | 3 | 3043356349 | 48 | 16 | 35 | 0.507 | 6c1d2b0a4f03 | 6d243c991a37 | title_screen_restart | 0 | 34 | PASS |
| 51 | g1-mwg64wgc-1g-1fqkzy5-failure_restart | 0 | 303684260 | 24 | 8 | 20 | 0.265 | 505204c19244 | 9f0ab7fd7a30 | failure_restart | 0 | 2 | PASS |
| 52 | g1-mwg64wgk-1h-agl1d4-new_game | 1 | 1412633421 | 30 | 10 | 27 | 0.336 | 0aacfda0f752 | df4309c031ae | new_game | 0 | 5 | PASS |
| 53 | g1-mwg64wgv-1i-11bnh1j-application_restart | 2 | 569965866 | 36 | 12 | 26 | 0.236 | 7a34bcfd06d2 | da263c02315b | application_restart | 0 | 8 | PASS |
| 54 | g1-mwg64wh9-1j-1ea6myo-title_screen_restart | 3 | 781800086 | 48 | 16 | 42 | 0.48 | bc6c598f241e | 5faa27dbe4b3 | title_screen_restart | 0 | 10 | PASS |
| 55 | g1-mwg64who-1k-ouc31-failure_restart | 0 | 2744857422 | 24 | 8 | 20 | 0.325 | 52129e0e06f0 | 9e31bbac0c69 | failure_restart | 0 | 8 | PASS |
| 56 | g1-mwg64whv-1l-6xtb9s-new_game | 1 | 2159807306 | 30 | 10 | 25 | 0.366 | c43cdef44d8a | a909934b7ddd | new_game | 0 | 4 | PASS |
| 57 | g1-mwg64wi4-1m-1c1nb8z-application_restart | 2 | 592422469 | 36 | 12 | 27 | 0.423 | 6033069197e0 | c81b9375f12d | application_restart | 0 | 7 | PASS |
| 58 | g1-mwg64wik-1n-8duqkm-title_screen_restart | 3 | 2457552669 | 48 | 16 | 34 | 0.42 | c168392b42b4 | cb931c665beb | title_screen_restart | 0 | 12 | PASS |
| 59 | g1-mwg64wiz-1o-1hde415-failure_restart | 0 | 1420750391 | 24 | 8 | 19 | 0.502 | 8da43bff7148 | 642d6b56789a | failure_restart | 0 | 8 | PASS |
| 60 | g1-mwg64wj6-1p-13jwjo6-new_game | 1 | 314975678 | 30 | 10 | 22 | 0.546 | 4d5187a1bff5 | 54ce5a2c24e3 | new_game | 0 | 4 | PASS |
| 61 | g1-mwg64wjd-1q-gp5u2t-application_restart | 2 | 3737454577 | 36 | 12 | 32 | 0.465 | 1dbad42d551a | ce40f35170ae | application_restart | 0 | 4 | PASS |
| 62 | g1-mwg64wjv-1r-hsrjo5-title_screen_restart | 3 | 690895383 | 48 | 16 | 35 | 0.228 | 1a1ca96b5204 | bf889f290454 | title_screen_restart | 0 | 15 | PASS |
| 63 | g1-mwg64wkm-1s-m6euvx-failure_restart | 0 | 1269973438 | 24 | 8 | 21 | 0.479 | a912b08b670f | d0b8a4f7b3aa | failure_restart | 1 | 14 | PASS |
| 64 | g1-mwg64wks-1t-56g0se-new_game | 1 | 3789711667 | 30 | 10 | 25 | 0.542 | b6a67f486453 | 0e625e132310 | new_game | 0 | 4 | PASS |
| 65 | g1-mwg64wl0-1u-1s7mt5k-application_restart | 2 | 2846019321 | 36 | 12 | 32 | 0.542 | 1e6a12d6ff4d | abf4a9731499 | application_restart | 0 | 6 | PASS |
| 66 | g1-mwg64wlb-1v-7rusny-title_screen_restart | 3 | 3451877942 | 48 | 16 | 41 | 0.234 | f612019c8268 | 40888d4958bc | title_screen_restart | 0 | 7 | PASS |
| 67 | g1-mwg64wlm-1w-1nbdeau-failure_restart | 0 | 1779659001 | 24 | 8 | 20 | 0.479 | 239240f7f18c | 3cd73dc080c9 | failure_restart | 0 | 6 | PASS |
| 68 | g1-mwg64wls-1x-1ee4327-new_game | 1 | 486260120 | 30 | 10 | 27 | 0.46 | 0f9c6ca66266 | 88b552400c30 | new_game | 0 | 5 | PASS |
| 69 | g1-mwg64wm0-1y-hf04vi-application_restart | 2 | 3140700361 | 36 | 12 | 22 | 0.333 | c6d1e8870dc0 | dcb1595acd05 | application_restart | 0 | 5 | PASS |
| 70 | g1-mwg64wme-1z-12n6g45-title_screen_restart | 3 | 3809010761 | 48 | 16 | 35 | 0.265 | f2cf356ba62c | d06503849148 | title_screen_restart | 0 | 10 | PASS |
| 71 | g1-mwg64wmr-20-1whd7yz-failure_restart | 0 | 654909731 | 24 | 8 | 22 | 0.445 | 14921dce637c | 104a69245f8f | failure_restart | 0 | 7 | PASS |
| 72 | g1-mwg64wn0-21-12pgxfh-new_game | 1 | 66329628 | 30 | 10 | 27 | 0.357 | 06f1b76514bc | ba4ac66b6e0b | new_game | 1 | 7 | PASS |
| 73 | g1-mwg64wn8-22-19pdcoa-application_restart | 2 | 2669746066 | 36 | 12 | 27 | 0.467 | a05956ba3002 | 25eb1162916e | application_restart | 0 | 5 | PASS |
| 74 | g1-mwg64woi-23-oi7r1x-title_screen_restart | 3 | 2504229684 | 48 | 16 | 29 | 0.471 | 7405f0d09b9b | 4b0bf33fc046 | title_screen_restart | 0 | 43 | PASS |
| 75 | g1-mwg64wqr-24-n7p32o-failure_restart | 0 | 3865167720 | 24 | 8 | 16 | 0.495 | 18fef84146f6 | 3c8b4ac291d7 | failure_restart | 0 | 45 | PASS |
| 76 | g1-mwg64wqz-25-95gcmz-new_game | 1 | 344942017 | 30 | 10 | 25 | 0.58 | 2c3f48e61e87 | 5d167acd22f5 | new_game | 1 | 6 | PASS |
| 77 | g1-mwg64wr7-26-83lw86-application_restart | 2 | 3768508666 | 36 | 12 | 33 | 0.395 | 9668056940f9 | 42a1035e4d37 | application_restart | 0 | 5 | PASS |
| 78 | g1-mwg64wrm-27-ulkhd3-title_screen_restart | 3 | 941414103 | 48 | 16 | 33 | 0.289 | 5ffc924dfe05 | 986b728d18ff | title_screen_restart | 0 | 12 | PASS |
| 79 | g1-mwg64ws3-28-1205wte-failure_restart | 0 | 2763531437 | 24 | 8 | 20 | 0.495 | 52386107f550 | 5c0995185678 | failure_restart | 0 | 10 | PASS |
| 80 | g1-mwg64wsd-29-ws4ss1-new_game | 1 | 260173176 | 30 | 10 | 21 | 0.308 | 3aaeffce96d4 | 2c22190885a5 | new_game | 0 | 7 | PASS |
| 81 | g1-mwg64wss-2a-1ro6sem-application_restart | 2 | 1923383769 | 36 | 12 | 28 | 0.558 | fab0e763ad18 | 2f7191f90f32 | application_restart | 0 | 10 | PASS |
| 82 | g1-mwg64wtd-2b-1j4dov6-title_screen_restart | 3 | 1687100751 | 48 | 16 | 35 | 0.298 | 35c6cb65507f | 5a0914410413 | title_screen_restart | 0 | 16 | PASS |
| 83 | g1-mwg64wty-2c-1r0d1xv-failure_restart | 0 | 1483092927 | 24 | 8 | 16 | 0.296 | a7907a2e3682 | ae79f030e08c | failure_restart | 0 | 12 | PASS |
| 84 | g1-mwg64wu6-2d-hycgf4-new_game | 1 | 774144580 | 30 | 10 | 19 | 0.372 | 2d4a808c7985 | 7da040c61ed4 | new_game | 0 | 5 | PASS |
| 85 | g1-mwg64wuf-2e-1qfivjz-application_restart | 2 | 247020632 | 36 | 12 | 32 | 0.265 | 728a68492b1d | 4e01e384ff1c | application_restart | 0 | 6 | PASS |
| 86 | g1-mwg64wut-2f-7k5nfm-title_screen_restart | 3 | 1716807854 | 48 | 16 | 34 | 0.347 | 421decb3017d | c13fb523bec3 | title_screen_restart | 0 | 11 | PASS |
| 87 | g1-mwg64wv6-2g-380is5-failure_restart | 0 | 1121014087 | 24 | 8 | 20 | 0.415 | 774f95c70d3e | dcb52957b259 | failure_restart | 0 | 7 | PASS |
| 88 | g1-mwg64wve-2h-7854hb-new_game | 1 | 2214046108 | 30 | 10 | 25 | 0.191 | 32fb242826de | 44789c1d6fee | new_game | 1 | 6 | PASS |
| 89 | g1-mwg64wvq-2i-16ivnwc-application_restart | 2 | 3815600685 | 36 | 12 | 32 | 0.215 | 782700ced4da | c8511ba80afa | application_restart | 1 | 9 | PASS |
| 90 | g1-mwg64ww7-2j-fvpvl3-title_screen_restart | 3 | 3852290475 | 48 | 16 | 28 | 0.472 | 9791fefdf9b3 | 0eb2fadd48f1 | title_screen_restart | 0 | 13 | PASS |
| 91 | g1-mwg64wwo-2k-msm1e3-failure_restart | 0 | 579674984 | 24 | 8 | 20 | 0.517 | 5676385f8bbd | 5c0995185678 | failure_restart | 0 | 8 | PASS |
| 92 | g1-mwg64www-2l-1a4eyd2-new_game | 1 | 1756411275 | 30 | 10 | 22 | 0.259 | 8828f7571632 | 0bffcde170de | new_game | 0 | 5 | PASS |
| 93 | g1-mwg64wx6-2m-1ho0nrn-application_restart | 2 | 1212850214 | 36 | 12 | 26 | 0.468 | 9ba8c7ab92a4 | a12f38385f71 | application_restart | 0 | 8 | PASS |
| 94 | g1-mwg64wxk-2n-1vfc8ud-title_screen_restart | 3 | 4254514282 | 48 | 16 | 34 | 0.361 | 6d445e00547b | 961f21195024 | title_screen_restart | 0 | 9 | PASS |
| 95 | g1-mwg64wxy-2o-iqmvoh-failure_restart | 0 | 2070491815 | 24 | 8 | 21 | 0.416 | e21f330eb7a3 | 90e54291d553 | failure_restart | 0 | 7 | PASS |
| 96 | g1-mwg64wy5-2p-1elgk8u-new_game | 1 | 3508290678 | 30 | 10 | 30 | 0.306 | c827bc059326 | 5ea781e37870 | new_game | 0 | 5 | PASS |
| 97 | g1-mwg64wyf-2q-5l7hvo-application_restart | 2 | 1359127141 | 36 | 12 | 27 | 0.241 | 42c021016b5b | 092ee2ff0a21 | application_restart | 0 | 7 | PASS |
| 98 | g1-mwg64wyx-2r-1924gjx-title_screen_restart | 3 | 878628044 | 48 | 16 | 30 | 0.379 | 4bdc89ca0857 | 144a14283150 | title_screen_restart | 0 | 12 | PASS |
| 99 | g1-mwg64wzf-2s-6dnvup-failure_restart | 0 | 2935367761 | 24 | 8 | 24 | 0.513 | 20c2edef4083 | f390f400b6bd | failure_restart | 0 | 10 | PASS |
| 100 | g1-mwg64wzn-2t-pphdua-new_game | 1 | 198043344 | 30 | 10 | 25 | 0.462 | c6e9397aed9e | 374e375a8600 | new_game | 0 | 5 | PASS |

</details>

## 第 2 关 · 100 局

| 项 | 值 |
|---|---|
| 耗时 | 5905 ms |
| 牌数范围 | 192 – 321 |
| 开局可点牌范围 | 19 – 25 |
| 档位分布 | {"0":7,"1":11,"2":10,"3":9,"4":7,"5":12,"6":7,"7":6,"8":15,"9":16} |
| 牌数分布 | {"192":15,"255":16,"261":7,"273":7,"282":11,"291":12,"300":10,"312":15,"321":7} |
| 牌型数分布 | {"13":37,"14":16,"15":38,"16":9} |
| 生成原因分布 | {"application_restart":25,"title_screen_restart":25,"failure_restart":25,"new_game":25} |
| 布局签名去重 | 100 / 100 |
| 最近 10 局模板 ID 重复 | 0 |
| 最近 10 局等价几何签名重复 | 0 |
| 最近 10 局结构签名重复 | 0 |
| 最近 10 局布局签名重复 | 0 |
| 最近 10 局几何签名重复 | 0 |
| 重试次数（失败重试合计） | 3 |
| 生成失败次数 | 0 |
| 滑窗 sim 均值 / P95 / 最大 | 0.2716 / 0.3919 / 0.5277 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 35.54 ms |

<details><summary>完整 100 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | sim最大 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g2-mwg64x0z-2u-1i5q4ci-application_restart | 1 | 2655442764 | 282 | 13 | 22 | 0 | 65185f554c33 | bd77c62ef215 | application_restart | 0 | 48 | PASS |
| 2 | g2-mwg64x2k-2v-1eshkt9-title_screen_restart | 8 | 1099995357 | 192 | 15 | 25 | 0.403 | 317be718b516 | 905e94f3cb86 | title_screen_restart | 0 | 30 | PASS |
| 3 | g2-mwg64x3x-2w-b795cr-failure_restart | 0 | 2027815452 | 321 | 15 | 23 | 0.365 | 83c75436a862 | 4ad870cf241a | failure_restart | 0 | 37 | PASS |
| 4 | g2-mwg64x5h-2x-4klm7n-new_game | 8 | 3254148885 | 192 | 15 | 23 | 0.366 | 6e80dbad63a1 | ec52e16aeada | new_game | 0 | 25 | PASS |
| 5 | g2-mwg64x6j-2y-3q898j-application_restart | 1 | 148933528 | 282 | 13 | 22 | 0.212 | 564fee2f8f0b | d7fbbea2bef5 | application_restart | 0 | 25 | PASS |
| 6 | g2-mwg64x86-2z-i3djaw-title_screen_restart | 0 | 2323668502 | 321 | 15 | 22 | 0.341 | b7533cba81da | ed3a11308eba | title_screen_restart | 0 | 38 | PASS |
| 7 | g2-mwg64xa7-30-wl06l3-failure_restart | 1 | 536210445 | 282 | 13 | 23 | 0.275 | e572911e566f | bce07dc0dbfa | failure_restart | 0 | 42 | PASS |
| 8 | g2-mwg64xbx-31-2n60ss-new_game | 2 | 1163837757 | 300 | 14 | 25 | 0.352 | a1f01455cc17 | 84c952b72e20 | new_game | 0 | 41 | PASS |
| 9 | g2-mwg64xdg-32-1nrakll-application_restart | 1 | 4056623907 | 282 | 13 | 23 | 0.401 | 4a676731d679 | c1832d067905 | application_restart | 0 | 31 | PASS |
| 10 | g2-mwg64xer-33-1r1m9tn-title_screen_restart | 9 | 3677347014 | 255 | 15 | 23 | 0.28 | 2563dc03f225 | e4e4c230dba2 | title_screen_restart | 0 | 30 | PASS |
| 11 | g2-mwg64xgf-34-5cox9a-failure_restart | 0 | 4055623904 | 321 | 15 | 25 | 0.37 | 6c258f03b02b | 9c43ba3e2137 | failure_restart | 0 | 39 | PASS |
| 12 | g2-mwg64xi5-35-1if4a5k-new_game | 9 | 1945391612 | 255 | 15 | 22 | 0.348 | 2fc37415527b | d0ce984346f9 | new_game | 0 | 35 | PASS |
| 13 | g2-mwg64xji-36-1ymjqal-application_restart | 8 | 3367154201 | 192 | 15 | 23 | 0.344 | e15e039b1296 | e7e731e13511 | application_restart | 0 | 25 | PASS |
| 14 | g2-mwg64xl2-37-udpg5f-title_screen_restart | 3 | 59509667 | 312 | 16 | 24 | 0.431 | 44b81790b7da | 7ea8c38b1e24 | title_screen_restart | 0 | 41 | PASS |
| 15 | g2-mwg64xmx-38-17l7r5o-failure_restart | 5 | 1462690816 | 291 | 13 | 20 | 0.408 | 12ca5d916f23 | 7f772fcf0d1c | failure_restart | 0 | 37 | PASS |
| 16 | g2-mwg64xon-39-1uwhge7-new_game | 2 | 537210448 | 300 | 14 | 21 | 0.415 | 15893572413a | 218004ccfe9d | new_game | 0 | 41 | PASS |
| 17 | g2-mwg64xqg-3a-a6941b-application_restart | 6 | 3878776188 | 261 | 13 | 24 | 0.362 | 9d9c7921d12d | a0e91c89f98e | application_restart | 0 | 37 | PASS |
| 18 | g2-mwg64xrk-3b-1k3mkxi-title_screen_restart | 8 | 3345572752 | 192 | 15 | 23 | 0.344 | 8302dbeef612 | ec52e16aeada | title_screen_restart | 0 | 20 | PASS |
| 19 | g2-mwg64xsn-3c-1f8bnom-failure_restart | 5 | 3821273527 | 291 | 13 | 25 | 0.428 | eddc6c6ae0fd | 24ecf76e9d61 | failure_restart | 0 | 29 | PASS |
| 20 | g2-mwg64xu2-3d-1ebxm92-new_game | 1 | 1550114671 | 282 | 13 | 23 | 0.292 | 2d98d0c99ef9 | 6482fb0e14c9 | new_game | 0 | 29 | PASS |
| 21 | g2-mwg64xvo-3e-1okw4pl-application_restart | 2 | 3043719684 | 300 | 14 | 24 | 0.334 | 1ec17ee6b32b | 06265f411457 | application_restart | 0 | 36 | PASS |
| 22 | g2-mwg64xxl-3f-v3d4i6-title_screen_restart | 5 | 1314764291 | 291 | 13 | 23 | 0.449 | fd96736f2a18 | 040827e7ad5e | title_screen_restart | 0 | 40 | PASS |
| 23 | g2-mwg64xzo-3g-cl6ldi-failure_restart | 3 | 3044719687 | 312 | 16 | 24 | 0.349 | cf66237ed15d | 340e95b6b117 | failure_restart | 0 | 46 | PASS |
| 24 | g2-mwg64y1n-3h-8iv4w-new_game | 9 | 2480595054 | 255 | 15 | 20 | 0.37 | 666660e2aae5 | 1c02a206d650 | new_game | 0 | 38 | PASS |
| 25 | g2-mwg64y2z-3i-1j91r5s-application_restart | 1 | 1937391588 | 282 | 13 | 23 | 0.501 | f3c8ebf3f57a | dbc8bcec4732 | application_restart | 0 | 29 | PASS |
| 26 | g2-mwg64y4k-3j-1jt4xdm-title_screen_restart | 3 | 1847967727 | 312 | 16 | 23 | 0.3 | a5addec53c4d | 1eb21676396d | title_screen_restart | 0 | 33 | PASS |
| 27 | g2-mwg64y5x-3k-mxj16h-failure_restart | 8 | 3106222360 | 192 | 15 | 25 | 0.241 | 17193c9cf647 | 380ddf6526bf | failure_restart | 0 | 22 | PASS |
| 28 | g2-mwg64y6w-3l-9qdctg-new_game | 9 | 3107222363 | 255 | 15 | 22 | 0.363 | ce7b13e606f4 | 8c30a06895cb | new_game | 0 | 24 | PASS |
| 29 | g2-mwg64y8f-3m-fisejz-application_restart | 7 | 3971200058 | 312 | 14 | 24 | 0.363 | 7c22310d0ba9 | b6e988f86be1 | application_restart | 0 | 38 | PASS |
| 30 | g2-mwg64ya3-3n-16xxc76-title_screen_restart | 5 | 300860065 | 291 | 13 | 20 | 0.424 | f6dcf32bf1b6 | 7f772fcf0d1c | title_screen_restart | 0 | 35 | PASS |
| 31 | g2-mwg64ybq-3o-k10657-failure_restart | 6 | 4118126580 | 261 | 13 | 20 | 0.237 | 15054b13ff0a | 7e3e7375cdb9 | failure_restart | 0 | 35 | PASS |
| 32 | g2-mwg64ydb-3p-132h1zy-new_game | 9 | 156933552 | 255 | 15 | 19 | 0.435 | b0f5122ee2d6 | 425226936973 | new_game | 0 | 33 | PASS |
| 33 | g2-mwg64yes-3q-18prf17-application_restart | 2 | 2007006 | 300 | 14 | 23 | 0.426 | f7e27d30b024 | 4bf5551747ca | application_restart | 0 | 30 | PASS |
| 34 | g2-mwg64ygg-3r-1jeyepb-title_screen_restart | 0 | 1309764276 | 321 | 15 | 21 | 0.404 | c911a110f299 | d096c1669b82 | title_screen_restart | 0 | 35 | PASS |
| 35 | g2-mwg64yib-3s-kz5rux-failure_restart | 9 | 2663442788 | 255 | 15 | 24 | 0.345 | 7e2c34033ab1 | 8b7f425b9a9b | failure_restart | 0 | 40 | PASS |
| 36 | g2-mwg64ykf-3t-wm7zl1-new_game | 3 | 2474595036 | 312 | 16 | 21 | 0.501 | 1d3ae01719d0 | 766a4a2334a8 | new_game | 0 | 46 | PASS |
| 37 | g2-mwg64ym5-3u-17q2ogr-application_restart | 5 | 3729849660 | 291 | 13 | 24 | 0.351 | dc167bf6517b | f722659cf91c | application_restart | 0 | 34 | PASS |
| 38 | g2-mwg64ynt-3v-c95431-title_screen_restart | 2 | 3043719684 | 300 | 14 | 21 | 0.52 | f1fd49362ea6 | 9d9aef61a71c | title_screen_restart | 0 | 36 | PASS |
| 39 | g2-mwg64ypg-3w-1nek73q-failure_restart | 7 | 3675347008 | 312 | 14 | 20 | 0.355 | bcc640e7d593 | ca7abef5ee0d | failure_restart | 0 | 35 | PASS |
| 40 | g2-mwg64yr6-3x-1t8ft1o-new_game | 9 | 4212550456 | 255 | 15 | 22 | 0.373 | 5ecc6b29825f | b302cc068b41 | new_game | 0 | 33 | PASS |
| 41 | g2-mwg64ysx-3y-1jg19xy-application_restart | 0 | 1936391585 | 321 | 15 | 24 | 0.354 | b161cb3c70e8 | f42fe23a3ac3 | application_restart | 0 | 46 | PASS |
| 42 | g2-mwg64yv0-3z-iav0h2-title_screen_restart | 6 | 2864871962 | 261 | 13 | 25 | 0.412 | 813acfe0eb58 | 9b749af193e6 | title_screen_restart | 0 | 43 | PASS |
| 43 | g2-mwg64ywq-40-1mb8g8x-failure_restart | 1 | 1550114671 | 282 | 13 | 25 | 0.373 | c9fa8bf6f08e | 2d4754482c1f | failure_restart | 0 | 39 | PASS |
| 44 | g2-mwg64yyg-41-1jw1c3e-new_game | 4 | 2419092381 | 273 | 13 | 21 | 0.362 | f65bd50cd40a | c667eb6f2a05 | new_game | 0 | 34 | PASS |
| 45 | g2-mwg64yzx-42-107objw-application_restart | 1 | 388283920 | 282 | 13 | 24 | 0.346 | d37bf550d913 | 709c71aac7dd | application_restart | 0 | 33 | PASS |
| 46 | g2-mwg64z1l-43-jt3iks-title_screen_restart | 4 | 2475595039 | 273 | 13 | 22 | 0.254 | 6122333aa72b | 908fbeff408e | title_screen_restart | 0 | 33 | PASS |
| 47 | g2-mwg64z3p-44-1dqfulx-failure_restart | 2 | 2086318116 | 300 | 14 | 25 | 0.528 | 5c08c828c164 | a62bf1950a44 | failure_restart | 0 | 52 | PASS |
| 48 | g2-mwg64z6o-45-1321f4v-new_game | 5 | 1941391600 | 291 | 13 | 24 | 0.333 | 9b47c7595ac2 | 08362a653c36 | new_game | 0 | 61 | PASS |
| 49 | g2-mwg64z87-46-vw0lfi-application_restart | 9 | 1318764303 | 255 | 15 | 21 | 0.299 | b35631beda9d | c21cb5c8ca80 | application_restart | 0 | 31 | PASS |
| 50 | g2-mwg64z9t-47-qx6dx-title_screen_restart | 5 | 3103222351 | 291 | 13 | 23 | 0.388 | 8e248084f78e | 7bd9b131cee1 | title_screen_restart | 0 | 40 | PASS |
| 51 | g2-mwg64zca-49-150lrv5-failure_restart | 8 | 3789352327 | 192 | 15 | 21 | 0.283 | b9c33916e3a8 | 31c4325a87a2 | failure_restart | 0 | 23 | PASS |
| 52 | g2-mwg64zdl-4a-1asxvgu-new_game | 7 | 3731849666 | 312 | 14 | 24 | 0.408 | f52862b50723 | 4479dd5b94e8 | new_game | 0 | 32 | PASS |
| 53 | g2-mwg64zf6-4b-1rocj6i-application_restart | 6 | 3582923138 | 261 | 13 | 23 | 0.351 | 6b23437fca1a | 80f08d162a05 | application_restart | 0 | 31 | PASS |
| 54 | g2-mwg64zgt-4c-dzmiot-title_screen_restart | 7 | 2034815473 | 312 | 14 | 25 | 0.392 | c0e55f0a9549 | f434fef7681a | title_screen_restart | 0 | 39 | PASS |
| 55 | g2-mwg64zil-4d-y4k8v6-failure_restart | 9 | 3198646230 | 255 | 15 | 25 | 0.364 | b7a990daab30 | bd52ae4f524d | failure_restart | 0 | 35 | PASS |
| 56 | g2-mwg64zjq-4e-1pqhyno-new_game | 8 | 1874549191 | 192 | 15 | 25 | 0.32 | 782dd61ecf20 | 6873f4ba9926 | new_game | 0 | 21 | PASS |
| 57 | g2-mwg64zlf-4f-5oae1u-application_restart | 3 | 1312764285 | 312 | 16 | 25 | 0.264 | eb5291211670 | 6a80aec5f6c7 | application_restart | 0 | 47 | PASS |
| 58 | g2-mwg64znb-4g-1xezq2v-title_screen_restart | 7 | 2422092390 | 312 | 14 | 25 | 0.351 | 031a09a460a9 | 9f1177868741 | title_screen_restart | 0 | 42 | PASS |
| 59 | g2-mwg64zpe-4h-x3lcmv-failure_restart | 2 | 4057623910 | 300 | 14 | 23 | 0.457 | 39f6c7ca7e8b | bd28120b2564 | failure_restart | 0 | 47 | PASS |
| 60 | g2-mwg64zrh-4i-1egqgam-new_game | 5 | 688136982 | 291 | 13 | 24 | 0.418 | 3bbd7f95746b | 98ead02ef026 | new_game | 0 | 46 | PASS |
| 61 | g2-mwg64zt5-4j-19k4y9c-application_restart | 8 | 3106222360 | 192 | 15 | 20 | 0.369 | 90c77b9fee02 | 8ca0c00492d2 | application_restart | 0 | 31 | PASS |
| 62 | g2-mwg64zug-4k-6t917i-title_screen_restart | 9 | 2184742004 | 255 | 15 | 25 | 0.338 | 90aa14ad11b8 | 56df45c2fcff | title_screen_restart | 0 | 33 | PASS |
| 63 | g2-mwg64zwc-4l-yus09w-failure_restart | 2 | 3670346993 | 300 | 14 | 24 | 0.33 | 4d7b35dd00ad | 06265f411457 | failure_restart | 0 | 42 | PASS |
| 64 | g2-mwg64zy9-4m-h7p4am-new_game | 5 | 1406188158 | 291 | 13 | 23 | 0.345 | 56ae7c6b7f9c | f207ca655acd | new_game | 0 | 40 | PASS |
| 65 | g2-mwg64zzx-4n-1pj8w6o-application_restart | 2 | 2029815458 | 300 | 14 | 21 | 0.366 | cc0611ddb93f | 218004ccfe9d | application_restart | 0 | 31 | PASS |
| 66 | g2-mwg6501o-4o-10gimba-title_screen_restart | 7 | 3583923141 | 312 | 14 | 25 | 0.45 | cd682e348e0d | ed41d18d6ef8 | title_screen_restart | 0 | 38 | PASS |
| 67 | g2-mwg6503a-4p-1dmvf0j-failure_restart | 1 | 2564018897 | 282 | 13 | 24 | 0.369 | 80659b1a8b7e | d950d227a729 | failure_restart | 0 | 29 | PASS |
| 68 | g2-mwg6504s-4q-1wgaejl-new_game | 4 | 687136979 | 273 | 13 | 23 | 0.409 | 997205ac788a | 089e8bf99c9a | new_game | 0 | 31 | PASS |
| 69 | g2-mwg65066-4r-qtp0wo-application_restart | 9 | 3198646230 | 255 | 15 | 25 | 0.432 | c8ebd6a5be2d | d4d3c9f81602 | application_restart | 0 | 26 | PASS |
| 70 | g2-mwg65088-4s-ind114-title_screen_restart | 0 | 1457690801 | 321 | 15 | 19 | 0.417 | b226c1f36db2 | f2fd8dc49680 | title_screen_restart | 1 | 55 | PASS |
| 71 | g2-mwg6509v-4t-1yeue8a-failure_restart | 9 | 1706041220 | 255 | 15 | 22 | 0.39 | b4e0f62a715a | d9cd58d598cb | failure_restart | 0 | 32 | PASS |
| 72 | g2-mwg650b1-4u-twvlyx-new_game | 8 | 4141708035 | 192 | 15 | 19 | 0.364 | 57687ef703c3 | c61fc6e44e9a | new_game | 0 | 22 | PASS |
| 73 | g2-mwg650cd-4v-14ne5ed-application_restart | 5 | 2476595042 | 291 | 13 | 23 | 0.403 | 2c648f0c4c51 | 67634a1d8764 | application_restart | 0 | 35 | PASS |
| 74 | g2-mwg650dr-4w-1bbltfr-title_screen_restart | 8 | 3367154201 | 192 | 15 | 19 | 0.258 | ac1fc22b910b | 4525fdf1be42 | title_screen_restart | 0 | 26 | PASS |
| 75 | g2-mwg650f4-4x-ux88av-failure_restart | 1 | 3725849648 | 282 | 13 | 24 | 0.383 | ccc79b938795 | a77b686d6c8f | failure_restart | 0 | 36 | PASS |
| 76 | g2-mwg650gr-4y-1mst8nv-new_game | 2 | 1551114674 | 300 | 14 | 21 | 0.472 | 81f2d42d4fe3 | c99f9232a8b4 | new_game | 0 | 37 | PASS |
| 77 | g2-mwg650ii-4z-1746n0v-application_restart | 5 | 1849967733 | 291 | 13 | 20 | 0.383 | 9859ea5d5e12 | 114bb0ec7e55 | application_restart | 0 | 36 | PASS |
| 78 | g2-mwg650js-50-7ytdap-title_screen_restart | 8 | 2296747317 | 192 | 15 | 23 | 0.387 | fcfdcf36be12 | e7e731e13511 | title_screen_restart | 0 | 21 | PASS |
| 79 | g2-mwg650ky-51-1avqfzl-failure_restart | 4 | 1313764288 | 273 | 13 | 24 | 0.39 | 05773039519e | 1b20f5e27df1 | failure_restart | 0 | 31 | PASS |
| 80 | g2-mwg650mi-52-17euu8n-new_game | 3 | 1939391594 | 312 | 16 | 25 | 0.378 | 59c0cfbd0738 | f434fef7681a | new_game | 0 | 36 | PASS |
| 81 | g2-mwg650ob-53-o0riav-application_restart | 9 | 3677347014 | 255 | 15 | 25 | 0.328 | bc51ddb0ed0a | 042224990c25 | application_restart | 0 | 37 | PASS |
| 82 | g2-mwg650q1-54-1j7536l-title_screen_restart | 6 | 3195646221 | 261 | 13 | 21 | 0.37 | 1fa08338eac3 | bba245dfa435 | title_screen_restart | 0 | 41 | PASS |
| 83 | g2-mwg650rm-55-dnpwb9-failure_restart | 3 | 3007009 | 312 | 16 | 25 | 0.362 | 0bb67c70f1d8 | f006784bb05c | failure_restart | 0 | 34 | PASS |
| 84 | g2-mwg650u5-56-146q5bf-new_game | 1 | 3429996598 | 282 | 13 | 25 | 0.387 | 4b7b5b1107a9 | 08d4391132ab | new_game | 1 | 66 | PASS |
| 85 | g2-mwg650vh-57-7dfzq4-application_restart | 4 | 2327668514 | 273 | 13 | 22 | 0.291 | 933c2051c481 | 908fbeff408e | application_restart | 0 | 27 | PASS |
| 86 | g2-mwg650x2-58-1x5n6gh-title_screen_restart | 3 | 3671346996 | 312 | 16 | 25 | 0.402 | 5f7d4160aeec | e4b8a0cf058d | title_screen_restart | 0 | 38 | PASS |
| 87 | g2-mwg650yr-59-bhkey1-failure_restart | 8 | 1078413908 | 192 | 15 | 20 | 0.281 | f998cf1dc820 | 0f053dcde1c9 | failure_restart | 0 | 30 | PASS |
| 88 | g2-mwg65105-5a-1u6qrun-new_game | 9 | 2719945446 | 255 | 15 | 21 | 0.33 | f2a3bb5761d0 | 3d2d27358ef0 | new_game | 0 | 35 | PASS |
| 89 | g2-mwg65120-5b-1rnhgbf-application_restart | 3 | 3192646212 | 312 | 16 | 23 | 0.384 | 061fd3ed2368 | 1401456fb9be | application_restart | 0 | 44 | PASS |
| 90 | g2-mwg6513s-5c-120qaed-title_screen_restart | 5 | 2180741992 | 291 | 13 | 25 | 0.383 | 4ddaa407b4b5 | 4c74d22de8d0 | title_screen_restart | 0 | 39 | PASS |
| 91 | g2-mwg65153-5d-1i64ske-failure_restart | 8 | 2592600367 | 192 | 15 | 20 | 0.286 | 84962eddf337 | 5840fdd596f8 | failure_restart | 0 | 22 | PASS |
| 92 | g2-mwg65167-5e-1k0n3zk-new_game | 9 | 3733849672 | 255 | 15 | 25 | 0.392 | 1dca48f03a75 | ba9f985675eb | new_game | 0 | 27 | PASS |
| 93 | g2-mwg6517n-5f-vi26tu-application_restart | 4 | 2567018906 | 273 | 13 | 21 | 0.422 | 49c3a35963c6 | 33711508d1e3 | application_restart | 0 | 32 | PASS |
| 94 | g2-mwg6519f-5g-1q7bn5u-title_screen_restart | 0 | 1549114668 | 321 | 15 | 25 | 0.3 | 0e7893f4e260 | 01e32c3b66dd | title_screen_restart | 0 | 46 | PASS |
| 95 | g2-mwg651c1-5h-1fwpxar-failure_restart | 8 | 155933549 | 192 | 15 | 23 | 0.358 | 8e25105e4fa6 | f68ae28b5d63 | failure_restart | 1 | 60 | PASS |
| 96 | g2-mwg651dd-5i-dtpieg-new_game | 6 | 2090318128 | 261 | 13 | 25 | 0.294 | edbf3339a6fa | f5cfb98385f2 | new_game | 0 | 32 | PASS |
| 97 | g2-mwg651f1-5j-1ibdezi-application_restart | 9 | 2424092396 | 255 | 15 | 24 | 0.349 | 9ae24e00ef26 | 5fb2c50a610c | application_restart | 0 | 37 | PASS |
| 98 | g2-mwg651gl-5k-11nedvc-title_screen_restart | 4 | 151933537 | 273 | 13 | 22 | 0.5 | 28f390970946 | 2a7abb846fbb | title_screen_restart | 0 | 32 | PASS |
| 99 | g2-mwg651i3-5l-1gntz40-failure_restart | 6 | 153933543 | 261 | 13 | 25 | 0.397 | 5d718a64e4ac | 2e710f3741c0 | failure_restart | 0 | 29 | PASS |
| 100 | g2-mwg651jc-5m-vjjt23-new_game | 8 | 2923374626 | 192 | 15 | 24 | 0.375 | dad3509277b2 | c8560c445c61 | new_game | 0 | 25 | PASS |

</details>

## 失败案例与原因

本次运行 **0** 个生成失败案例；每次重试的原因均记录在 `random-generation-report.json` 的逐局 `retries` 字段。

## 测试性质说明

- 运行时：两关各 100 局真实调用 `createNewGame`，真实生成、真实签名、真实校验。
- 相似度：用**真实牌面**两两计算 `layoutSimilarity`（层占位格 Jaccard 均值 ×0.5 + 整体轮廓 Jaccard ×0.5），不是签名比较。
- 静态审计：三种重新开局入口通过读取 `src/main.js` 源码确认全部走统一入口；未冒充浏览器实测。
- 重启模拟：把存档 JSON 写入磁盘再读回，继续生成并验证差异化。
- 浏览器实际运行 / Windows 安装卸载测试不在本文件覆盖范围，见 `FINAL_ACCEPTANCE.md`。
