# 双关卡各 100 局随机生成压力测试报告

> 本文件由 `node test-random-generation.js` **真实运行**自动生成，不是静态 PASS 模板。

- 运行时间：2026-11-13T06:37:17.550Z
- Git commit：`a4340d167ff6b185a0f59ee0ecda7d3901b82cf8`
- 断言：通过 **7788**，失败 **0**
- 总耗时：13685 ms
- 布局签名算法：`MAH-LAYOUT-SIG-v1/SHA-256`（SHA-256，浏览器与 Node 共用同一实现）
- 历史窗口：L1 最近 3 局（冻结）/ L2 最近 10 局；第二关 50 套模板 + 模板级 / 几何级双重去重；重复阈值 sim ≥ 0.6；重试上限 50 次

## 全局

| 项 | 值 |
|---|---|
| 总生成局数 | 200 |
| gameId 唯一数 | 202 / 202 |
| 布局签名总数 / 去重 | 200 / 200 |
| 生成失败次数 | 0 |
| 重试总次数 | 12 |
| 平均单局生成耗时 | 29.54 ms |
| 失败案例 | 0 |

## 滑动窗口相似度（L1 三局 / L2 十局）

| 关卡 | 窗口对数 | 均值 | P95 | 最大值 | 阈值 | 判定 |
|---|---|---|---|---|---|---|
| L1 | 294 | 0.2450 | 0.4918 | 0.5845 | 0.6 | ✓ 全部 < 0.60 |
| L2 | 945 | 0.1525 | 0.2402 | 0.4281 | 0.6 | ✓ 全部 < 0.60 |

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
| 耗时 | 1753 ms |
| 牌数范围 | 24 – 48 |
| 开局可点牌范围 | 15 – 39 |
| 档位分布 | {"0":25,"1":25,"2":25,"3":25} |
| 牌数分布 | {"24":25,"30":25,"36":25,"48":25} |
| 牌型数分布 | {"8":25,"10":25,"12":25,"16":25} |
| 生成原因分布 | {"application_restart":25,"title_screen_restart":25,"failure_restart":25,"new_game":25} |
| 布局签名去重 | 100 / 100 |
| 最近 3 局总牌数重复 | 0 |
| 最近 3 局布局签名重复 | 0 |
| 最近 3 局几何签名重复 | 0 |
| 重试次数（失败重试合计） | 7 |
| 生成失败次数 | 0 |
| 滑窗 sim 均值 / P95 / 最大 | 0.2450 / 0.4918 / 0.5845 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 11.33 ms |

<details><summary>完整 100 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | sim最大 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g1-mweltohl-1-1dxq74h-application_restart | 1 | 2770536127 | 30 | 10 | 26 | 0 | a60060633017 | 7fd5e36b0ba1 | application_restart | 0 | 7 | PASS |
| 2 | g1-mweltoib-2-gzdbsb-title_screen_restart | 3 | 4030693290 | 48 | 16 | 33 | 0.109 | 441475d8a628 | 7848f612fd71 | title_screen_restart | 0 | 17 | PASS |
| 3 | g1-mweltoix-3-1mk0i62-failure_restart | 0 | 4076950352 | 24 | 8 | 16 | 0.372 | 06f82d3416fd | ae4d8517eea2 | failure_restart | 0 | 12 | PASS |
| 4 | g1-mweltoj7-4-qvlb1f-new_game | 2 | 717176305 | 36 | 12 | 33 | 0.278 | 97a96de4c0cd | 19099ab9566b | new_game | 0 | 7 | PASS |
| 5 | g1-mweltojh-5-u45ay6-application_restart | 1 | 3860098961 | 30 | 10 | 25 | 0.535 | baa781965b87 | 3fc25dc1bb94 | application_restart | 0 | 7 | PASS |
| 6 | g1-mweltoju-6-7c02mu-title_screen_restart | 3 | 2257182226 | 48 | 16 | 36 | 0.339 | d29a2519a121 | 33f3949c81fa | title_screen_restart | 0 | 9 | PASS |
| 7 | g1-mweltokb-7-1ir70x8-failure_restart | 0 | 2435832818 | 24 | 8 | 20 | 0.42 | 2241bddb1726 | f27be5966fc2 | failure_restart | 0 | 8 | PASS |
| 8 | g1-mweltokk-8-2mdrx3-new_game | 2 | 1564041084 | 36 | 12 | 27 | 0.408 | c487995bc3d5 | 559f9bd12d77 | new_game | 0 | 6 | PASS |
| 9 | g1-mweltol4-9-1v8l9q5-application_restart | 1 | 2126681165 | 30 | 10 | 21 | 0.491 | 7864951609bc | fef5e292bdda | application_restart | 0 | 12 | PASS |
| 10 | g1-mweltolh-a-3beyi9-title_screen_restart | 3 | 4001953556 | 48 | 16 | 35 | 0.361 | f6d7479a6b6d | ecc9ed7fb769 | title_screen_restart | 0 | 11 | PASS |
| 11 | g1-mweltolz-b-14wbv2-failure_restart | 0 | 4172231158 | 24 | 8 | 24 | 0.308 | ba034581bbb0 | 1ce5e494e40d | failure_restart | 0 | 9 | PASS |
| 12 | g1-mweltom6-c-7qxzwx-new_game | 2 | 3541192102 | 36 | 12 | 32 | 0.462 | eda384138230 | fc912b4a2a02 | new_game | 0 | 6 | PASS |
| 13 | g1-mweltomh-d-1wx390d-application_restart | 1 | 2642077735 | 30 | 10 | 27 | 0.539 | b08d0bdad830 | db1a4be4d7e1 | application_restart | 0 | 6 | PASS |
| 14 | g1-mweltomu-e-dahuij-title_screen_restart | 3 | 521766674 | 48 | 16 | 39 | 0.505 | 3cb1e64190e7 | 8cae7c5ce930 | title_screen_restart | 0 | 9 | PASS |
| 15 | g1-mwelton8-f-bpr949-failure_restart | 0 | 2769676130 | 24 | 8 | 19 | 0.395 | 08f9f83d7715 | 78d798ea3a35 | failure_restart | 0 | 7 | PASS |
| 16 | g1-mweltong-g-1wvpfb4-new_game | 2 | 1691047809 | 36 | 12 | 32 | 0.211 | 4fd720ac2e6a | e06a86b1227b | new_game | 0 | 5 | PASS |
| 17 | g1-mweltonr-h-1drvw64-application_restart | 1 | 3292719392 | 30 | 10 | 25 | 0.306 | ec5b0b380e3e | 13b631f87fbb | application_restart | 0 | 6 | PASS |
| 18 | g1-mweltoo5-i-uleguh-title_screen_restart | 3 | 914831401 | 48 | 16 | 35 | 0.268 | 35d749ab4e7d | 38756dc4a1ad | title_screen_restart | 0 | 12 | PASS |
| 19 | g1-mweltoom-j-1mqp4kg-failure_restart | 0 | 2975216973 | 24 | 8 | 20 | 0.273 | 0688dcb7e45f | fa5937a9f210 | failure_restart | 0 | 9 | PASS |
| 20 | g1-mweltoov-k-cqsxjp-new_game | 2 | 3262968162 | 36 | 12 | 22 | 0.564 | 2114cd8bafbf | bf611861e658 | new_game | 0 | 6 | PASS |
| 21 | g1-mweltop7-l-b4apph-application_restart | 1 | 399640519 | 30 | 10 | 26 | 0.493 | 93819ed2d5a8 | e036c030c82f | application_restart | 0 | 7 | PASS |
| 22 | g1-mweltopj-m-16rax2v-title_screen_restart | 3 | 3714301428 | 48 | 16 | 31 | 0.348 | 9f91ec1699ad | f6e018d7b95c | title_screen_restart | 0 | 8 | PASS |
| 23 | g1-mweltopy-n-1nw9wqc-failure_restart | 0 | 503317403 | 24 | 8 | 21 | 0.258 | e6062af7e14f | 89fa76921bc8 | failure_restart | 0 | 8 | PASS |
| 24 | g1-mweltoq8-o-190wyj3-new_game | 2 | 2103900859 | 36 | 12 | 26 | 0.394 | 85aca9f8122f | 47a9ae2fae59 | new_game | 0 | 8 | PASS |
| 25 | g1-mweltoqn-p-10mf8jj-application_restart | 1 | 486679040 | 30 | 10 | 21 | 0.308 | 2188ebb6ce34 | dfbe0dbca05f | application_restart | 0 | 9 | PASS |
| 26 | g1-mweltoqz-q-t62ye3-title_screen_restart | 3 | 312110716 | 48 | 16 | 34 | 0.432 | fe0000b5e2a0 | f53eca0072ee | title_screen_restart | 0 | 9 | PASS |
| 27 | g1-mweltorc-r-1vrxcl8-failure_restart | 0 | 2258435403 | 24 | 8 | 20 | 0.296 | 785dd1061af4 | da4709fc4ce9 | failure_restart | 0 | 7 | PASS |
| 28 | g1-mweltorx-s-tsmsuw-new_game | 2 | 777711124 | 36 | 12 | 22 | 0.564 | 906c6d641841 | e1c98e6a858d | new_game | 0 | 18 | PASS |
| 29 | g1-mweltosv-t-gfekpe-application_restart | 1 | 3162290706 | 30 | 10 | 25 | 0.457 | 5c217d278676 | f546be4c0f0e | application_restart | 0 | 20 | PASS |
| 30 | g1-mweltoti-u-d1m7ag-title_screen_restart | 3 | 2920635820 | 48 | 16 | 35 | 0.439 | 2ddc6d084de5 | dab7afbb169f | title_screen_restart | 0 | 19 | PASS |
| 31 | g1-mweltouh-v-1bpdkaw-failure_restart | 0 | 3532581811 | 24 | 8 | 20 | 0.493 | 4b7f7518c805 | 59bebcb1efb5 | failure_restart | 0 | 18 | PASS |
| 32 | g1-mweltov2-w-1ocbnc5-new_game | 2 | 2540556116 | 36 | 12 | 22 | 0.425 | b835e78513fd | 23625c1d7862 | new_game | 1 | 18 | PASS |
| 33 | g1-mweltovt-x-nvy70a-application_restart | 1 | 2433723931 | 30 | 10 | 20 | 0.395 | 970e68e04f17 | 89e60960e3b5 | application_restart | 1 | 16 | PASS |
| 34 | g1-mweltowf-y-1nvj69e-title_screen_restart | 3 | 3785519161 | 48 | 16 | 34 | 0.462 | da9d1366288a | c9573185e44f | title_screen_restart | 0 | 19 | PASS |
| 35 | g1-mweltoxf-z-3s04oh-failure_restart | 0 | 1308236131 | 24 | 8 | 15 | 0.143 | dffa0505961a | 583d6721dd07 | failure_restart | 0 | 19 | PASS |
| 36 | g1-mweltoxr-10-u1htxb-new_game | 2 | 701312259 | 36 | 12 | 27 | 0.278 | a7e716d17c17 | c5bb64d9d9c7 | new_game | 0 | 7 | PASS |
| 37 | g1-mweltoy2-11-of3lfn-application_restart | 1 | 2024149455 | 30 | 10 | 25 | 0.549 | c3ead4886d0e | 0275fe4e602f | application_restart | 0 | 7 | PASS |
| 38 | g1-mweltoyi-12-1jzm36x-title_screen_restart | 3 | 1810907212 | 48 | 16 | 33 | 0.172 | 50f835b18a52 | 5e06c2f6efa7 | title_screen_restart | 0 | 14 | PASS |
| 39 | g1-mweltoz6-13-113imxr-failure_restart | 0 | 2734571433 | 24 | 8 | 21 | 0.323 | 898c9ea4f929 | 78b8a836ffab | failure_restart | 0 | 12 | PASS |
| 40 | g1-mweltoze-14-1l93khm-new_game | 2 | 841154598 | 36 | 12 | 27 | 0.394 | 95dd9b49d322 | abfa03d389b9 | new_game | 0 | 6 | PASS |
| 41 | g1-mweltozp-15-ajryi9-application_restart | 1 | 3894385509 | 30 | 10 | 26 | 0.246 | e8197827d69d | 35455a48d26f | application_restart | 0 | 7 | PASS |
| 42 | g1-mweltp04-16-1rbtphq-title_screen_restart | 3 | 2985997416 | 48 | 16 | 30 | 0.44 | be3af4f69a51 | c3494f128e88 | title_screen_restart | 0 | 12 | PASS |
| 43 | g1-mweltp0o-17-1d515v7-failure_restart | 0 | 1618744524 | 24 | 8 | 21 | 0.459 | dc20e2be53c1 | 2e701aede963 | failure_restart | 0 | 10 | PASS |
| 44 | g1-mweltp13-18-1s3daq7-new_game | 2 | 3612473864 | 36 | 12 | 27 | 0.44 | 6824194f2850 | c2c8e66d3be1 | new_game | 1 | 12 | PASS |
| 45 | g1-mweltp1e-19-1tm08b8-application_restart | 1 | 3077571163 | 30 | 10 | 25 | 0.456 | b43d7ea1e512 | 1d9fb7cd74ab | application_restart | 0 | 6 | PASS |
| 46 | g1-mweltp22-1a-qwrlxh-title_screen_restart | 3 | 2532911298 | 48 | 16 | 34 | 0.223 | e1121b83c306 | a68bcc22114f | title_screen_restart | 0 | 21 | PASS |
| 47 | g1-mweltp32-1b-i0bhk1-failure_restart | 0 | 727294125 | 24 | 8 | 20 | 0.328 | 1f84128beeac | 1611552f4f78 | failure_restart | 0 | 20 | PASS |
| 48 | g1-mweltp3d-1c-1nncghm-new_game | 2 | 329395708 | 36 | 12 | 27 | 0.205 | 5ce552ed7b0b | a647afdd1a24 | new_game | 0 | 8 | PASS |
| 49 | g1-mweltp3u-1d-rin7gw-application_restart | 1 | 3938136193 | 30 | 10 | 23 | 0.385 | 40f6619d24a7 | 420ef050e896 | application_restart | 1 | 12 | PASS |
| 50 | g1-mweltp4b-1e-1nlf4qb-title_screen_restart | 3 | 323462238 | 48 | 16 | 34 | 0.46 | 73ed50347c1b | eedcfe45a520 | title_screen_restart | 0 | 13 | PASS |
| 51 | g1-mweltp53-1g-1jkpygf-failure_restart | 0 | 197579818 | 24 | 8 | 16 | 0.256 | 252da23afefb | 35ce402108c1 | failure_restart | 0 | 3 | PASS |
| 52 | g1-mweltp5e-1h-1ffamia-new_game | 2 | 3533242162 | 36 | 12 | 26 | 0.435 | c19d838aed63 | dcb7718ae6e2 | new_game | 0 | 8 | PASS |
| 53 | g1-mweltp5t-1i-f2gzkm-application_restart | 1 | 3996743331 | 30 | 10 | 25 | 0.421 | 4a4acd033ef5 | 49832a19fbcb | application_restart | 0 | 9 | PASS |
| 54 | g1-mweltp6f-1j-1ftekxh-title_screen_restart | 3 | 3400085465 | 48 | 16 | 33 | 0.367 | c329e62e3fde | c41534c69e0b | title_screen_restart | 0 | 18 | PASS |
| 55 | g1-mweltp7a-1k-1ewygev-failure_restart | 0 | 1324896669 | 24 | 8 | 20 | 0.307 | 4bfb081d4679 | 122e3650d54b | failure_restart | 0 | 16 | PASS |
| 56 | g1-mweltp7l-1l-1fvvzn8-new_game | 2 | 1588712159 | 36 | 12 | 28 | 0.299 | 51765960d0a8 | 3952cc32d262 | new_game | 0 | 8 | PASS |
| 57 | g1-mweltp7y-1m-17herxk-application_restart | 1 | 1631992337 | 30 | 10 | 26 | 0.425 | 864adf241bee | d6cd2952158c | application_restart | 0 | 8 | PASS |
| 58 | g1-mweltp8c-1n-1auj1f3-title_screen_restart | 3 | 2581463186 | 48 | 16 | 28 | 0.357 | c05983d37108 | b2ca328e19b1 | title_screen_restart | 0 | 11 | PASS |
| 59 | g1-mweltp8w-1o-d6kww7-failure_restart | 0 | 3585594413 | 24 | 8 | 17 | 0.34 | 4ddb5c45acbe | a1ed19f94898 | failure_restart | 0 | 10 | PASS |
| 60 | g1-mweltp94-1p-8m69yx-new_game | 2 | 3760778064 | 36 | 12 | 31 | 0.269 | 4a7ee868b5f3 | dd94cd0389a3 | new_game | 0 | 6 | PASS |
| 61 | g1-mweltp9e-1q-gpcxdz-application_restart | 1 | 4252768884 | 30 | 10 | 27 | 0.251 | 1ac8903bb0a7 | 1c4ad5fb529f | application_restart | 0 | 6 | PASS |
| 62 | g1-mweltpa3-1r-5x49b3-title_screen_restart | 3 | 3008360051 | 48 | 16 | 34 | 0.426 | a63752ac3488 | 972e9560d6b8 | title_screen_restart | 0 | 22 | PASS |
| 63 | g1-mweltpb7-1s-1lyjj7b-failure_restart | 0 | 4143015469 | 24 | 8 | 20 | 0.211 | 99fbed77fe5f | dd99b83985bd | failure_restart | 0 | 21 | PASS |
| 64 | g1-mweltpbf-1t-cly7zq-new_game | 2 | 3921377138 | 36 | 12 | 27 | 0.438 | 2ff834b4e1a2 | 8829232af05e | new_game | 0 | 6 | PASS |
| 65 | g1-mweltpbp-1u-1o3srjs-application_restart | 1 | 4003609332 | 30 | 10 | 26 | 0.364 | 01dc372b8fe6 | d2edf685345c | application_restart | 0 | 6 | PASS |
| 66 | g1-mweltpc2-1v-1x0b4e5-title_screen_restart | 3 | 3741146647 | 48 | 16 | 35 | 0.184 | 7962676814ef | a2f05a4a1f78 | title_screen_restart | 0 | 9 | PASS |
| 67 | g1-mweltpci-1w-f3f7tq-failure_restart | 0 | 2143220746 | 24 | 8 | 20 | 0.3 | 7694f5d8b93c | 1747c40fb397 | failure_restart | 0 | 9 | PASS |
| 68 | g1-mweltpcu-1x-1j673oj-new_game | 2 | 1243062969 | 36 | 12 | 27 | 0.378 | f62dd9a2c1d8 | eab1b8366248 | new_game | 1 | 10 | PASS |
| 69 | g1-mweltpd3-1y-1h7n28i-application_restart | 1 | 3738471216 | 30 | 10 | 25 | 0.342 | ecda1fd1cd2c | cfc02f403d14 | application_restart | 0 | 6 | PASS |
| 70 | g1-mweltpdp-1z-yf9lrh-title_screen_restart | 3 | 4216883497 | 48 | 16 | 31 | 0.487 | 6b92802e5584 | be614a1ae4bf | title_screen_restart | 0 | 20 | PASS |
| 71 | g1-mweltpen-20-19fnkh0-failure_restart | 0 | 3700009933 | 24 | 8 | 20 | 0.198 | 35ff62a6f775 | 2d9782782c56 | failure_restart | 0 | 18 | PASS |
| 72 | g1-mweltpev-21-1p8intm-new_game | 2 | 3696709662 | 36 | 12 | 26 | 0.471 | 731ec88e2bfe | 84f9c3262825 | new_game | 0 | 5 | PASS |
| 73 | g1-mweltpf5-22-1c323ik-application_restart | 1 | 37022687 | 30 | 10 | 26 | 0.38 | 495eb192be76 | 4b1d4918f4b3 | application_restart | 0 | 6 | PASS |
| 74 | g1-mweltpfg-23-1qrejc7-title_screen_restart | 3 | 2696012078 | 48 | 16 | 32 | 0.372 | 8e43963e6532 | ab14959dc5a9 | title_screen_restart | 0 | 8 | PASS |
| 75 | g1-mweltpfs-24-1fo4bg6-failure_restart | 0 | 2113126421 | 24 | 8 | 19 | 0.163 | 0d32857cf9a1 | a9aebe6f6e69 | failure_restart | 0 | 7 | PASS |
| 76 | g1-mweltpg1-25-e7i5ga-new_game | 2 | 4094886396 | 36 | 12 | 32 | 0.499 | 2f13325d3772 | 5ee70aec8da3 | new_game | 0 | 6 | PASS |
| 77 | g1-mweltpgb-26-ocoepd-application_restart | 1 | 1986067227 | 30 | 10 | 26 | 0.242 | 9e3e19361631 | 6f1766dab931 | application_restart | 0 | 6 | PASS |
| 78 | g1-mweltpgo-27-zv0i69-title_screen_restart | 3 | 2115970200 | 48 | 16 | 33 | 0.583 | d513a577f991 | e7131caf8bed | title_screen_restart | 0 | 10 | PASS |
| 79 | g1-mweltph5-28-zj3o2m-failure_restart | 0 | 2802850261 | 24 | 8 | 16 | 0.296 | a58d5b354135 | cc7147357e6a | failure_restart | 0 | 10 | PASS |
| 80 | g1-mweltphd-29-1yaa9z8-new_game | 2 | 465704192 | 36 | 12 | 31 | 0.558 | 5831d32cf805 | fc7f5c1f8d9e | new_game | 0 | 5 | PASS |
| 81 | g1-mweltphn-2a-1hmxn1j-application_restart | 1 | 1680911806 | 30 | 10 | 26 | 0.416 | 8b722aadc3f7 | 554a445b66d8 | application_restart | 0 | 6 | PASS |
| 82 | g1-mweltpi0-2b-16qsaxq-title_screen_restart | 3 | 3200449166 | 48 | 16 | 39 | 0.266 | 0d46bb541cc2 | ebef109cd214 | title_screen_restart | 0 | 10 | PASS |
| 83 | g1-mweltpil-2c-4kxz3z-failure_restart | 0 | 299629245 | 24 | 8 | 16 | 0.372 | 6bf502a31736 | 9ce1d1d38825 | failure_restart | 0 | 12 | PASS |
| 84 | g1-mweltpjl-2d-msl20q-new_game | 2 | 1630541551 | 36 | 12 | 28 | 0.366 | 7af703ba488e | 10d3688a374b | new_game | 0 | 32 | PASS |
| 85 | g1-mweltpl4-2e-hdixiz-application_restart | 1 | 3804727786 | 30 | 10 | 26 | 0.407 | ea4df7e34ef9 | c9811dc0f6af | application_restart | 0 | 29 | PASS |
| 86 | g1-mweltplg-2f-d12acf-title_screen_restart | 3 | 3446765634 | 48 | 16 | 38 | 0.169 | 9fe81137d5d0 | 2e0844afa167 | title_screen_restart | 0 | 9 | PASS |
| 87 | g1-mweltpls-2g-1kcbbuv-failure_restart | 0 | 2912642764 | 24 | 8 | 21 | 0.233 | ff0d16629c22 | ab81d94f326b | failure_restart | 0 | 7 | PASS |
| 88 | g1-mweltpm1-2h-1sids5v-new_game | 2 | 4065439033 | 36 | 12 | 28 | 0.425 | 80b88cffbd29 | a758223d5305 | new_game | 0 | 6 | PASS |
| 89 | g1-mweltpmc-2i-12igtn8-application_restart | 1 | 3729446498 | 30 | 10 | 25 | 0.363 | f57ca7e8bc26 | f16391fd2cb2 | application_restart | 0 | 6 | PASS |
| 90 | g1-mweltpmo-2j-oqn2zo-title_screen_restart | 3 | 1164640850 | 48 | 16 | 38 | 0.124 | f279731e090a | e2dd9206253d | title_screen_restart | 0 | 9 | PASS |
| 91 | g1-mweltpn3-2k-xweqvm-failure_restart | 0 | 1334464756 | 24 | 8 | 20 | 0.28 | 7eee2061f10d | 687f5189829a | failure_restart | 0 | 8 | PASS |
| 92 | g1-mweltpnb-2l-1su98d8-new_game | 2 | 2629762475 | 36 | 12 | 27 | 0.497 | 1db3071df0d8 | 4a40af77df77 | new_game | 0 | 5 | PASS |
| 93 | g1-mweltpnp-2m-vrh58k-application_restart | 1 | 2810310409 | 30 | 10 | 27 | 0.497 | 416bc7864788 | b94a9a2e2edb | application_restart | 1 | 10 | PASS |
| 94 | g1-mweltpob-2n-zyu4ls-title_screen_restart | 3 | 3335007863 | 48 | 16 | 38 | 0.334 | 9aa424e7de4d | 118a5dd73fea | title_screen_restart | 0 | 19 | PASS |
| 95 | g1-mweltppc-2o-10pxwcf-failure_restart | 0 | 1541136990 | 24 | 8 | 20 | 0.389 | 8a3d89f3467e | 637460d73722 | failure_restart | 1 | 20 | PASS |
| 96 | g1-mweltppl-2p-1hoz8gg-new_game | 2 | 3214683479 | 36 | 12 | 32 | 0.262 | 65a7c597ac32 | d59f4c6f9053 | new_game | 0 | 6 | PASS |
| 97 | g1-mweltppv-2q-dvqqco-application_restart | 1 | 3741102437 | 30 | 10 | 25 | 0.497 | 5847a66980ee | 8c31c765743b | application_restart | 0 | 6 | PASS |
| 98 | g1-mweltpr9-2r-195zzkf-title_screen_restart | 3 | 1895636238 | 48 | 16 | 34 | 0.435 | c3d0c6483ec6 | a0fcd9574f42 | title_screen_restart | 0 | 48 | PASS |
| 99 | g1-mweltptt-2s-9f68wx-failure_restart | 0 | 1268527551 | 24 | 8 | 24 | 0.584 | 702174baef66 | 6932c0689812 | failure_restart | 0 | 45 | PASS |
| 100 | g1-mweltpu1-2t-li0i6o-new_game | 2 | 168755412 | 36 | 12 | 32 | 0.131 | ccc70f3fb26a | d0ec6fe48779 | new_game | 0 | 6 | PASS |

</details>

## 第 2 关 · 100 局

| 项 | 值 |
|---|---|
| 耗时 | 7591 ms |
| 牌数范围 | 192 – 321 |
| 开局可点牌范围 | 19 – 25 |
| 档位分布 | {"0":8,"1":7,"2":10,"3":7,"4":9,"5":12,"6":10,"7":12,"8":13,"9":12} |
| 牌数分布 | {"192":13,"255":12,"261":10,"273":9,"282":7,"291":12,"300":10,"312":19,"321":8} |
| 牌型数分布 | {"13":38,"14":22,"15":33,"16":7} |
| 生成原因分布 | {"application_restart":25,"title_screen_restart":25,"failure_restart":25,"new_game":25} |
| 布局签名去重 | 100 / 100 |
| 最近 10 局模板 ID 重复 | 0 |
| 最近 10 局等价几何签名重复 | 0 |
| 最近 10 局结构签名重复 | 0 |
| 最近 10 局布局签名重复 | 0 |
| 最近 10 局几何签名重复 | 0 |
| 重试次数（失败重试合计） | 5 |
| 生成失败次数 | 0 |
| 滑窗 sim 均值 / P95 / 最大 | 0.1525 / 0.2402 / 0.4281 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 47.75 ms |

<details><summary>完整 100 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | sim最大 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g2-mweltpv1-2u-frgbw0-application_restart | 8 | 1557114692 | 192 | 15 | 21 | 0 | 7dcc9796f330 | 988072991a5f | application_restart | 0 | 32 | PASS |
| 2 | g2-mweltpwu-2v-1q1nsae-title_screen_restart | 0 | 3041719678 | 321 | 15 | 22 | 0.122 | 1b60f1dae7b9 | cb21bdf2934b | title_screen_restart | 0 | 53 | PASS |
| 3 | g2-mweltpym-2w-10y940o-failure_restart | 8 | 1134916566 | 192 | 15 | 24 | 0.132 | de7abcd524a6 | 7c25b5faf380 | failure_restart | 0 | 34 | PASS |
| 4 | g2-mweltq05-2x-1c446i9-new_game | 5 | 2089318125 | 291 | 13 | 19 | 0.209 | 0cd108b1ba38 | b682bcdaeeed | new_game | 0 | 41 | PASS |
| 5 | g2-mweltq23-2y-1kjv2w-application_restart | 7 | 2957295832 | 312 | 14 | 21 | 0.21 | 84190dc86e15 | c03d24fa464e | application_restart | 0 | 41 | PASS |
| 6 | g2-mweltq3w-2z-1h7ew3h-title_screen_restart | 6 | 1555114686 | 261 | 13 | 21 | 0.202 | 20f1db1a8d4c | 5ebd03183c8e | title_screen_restart | 0 | 36 | PASS |
| 7 | g2-mweltq5q-30-11klefz-failure_restart | 5 | 1406188158 | 291 | 13 | 19 | 0.166 | ca5e6128c04d | 77b26a1eb355 | failure_restart | 0 | 45 | PASS |
| 8 | g2-mweltq7w-31-1ii8fan-new_game | 8 | 2444673842 | 192 | 15 | 25 | 0.256 | c88b89aa4e26 | f4cf52f2c63b | new_game | 0 | 45 | PASS |
| 9 | g2-mweltq9v-32-a2cmq6-application_restart | 7 | 4119126583 | 312 | 14 | 19 | 0.255 | f3e8475cc84f | d26f3a21ee27 | application_restart | 0 | 50 | PASS |
| 10 | g2-mweltqbt-33-so3pd8-title_screen_restart | 9 | 9007027 | 255 | 15 | 22 | 0.176 | ef0298433b9c | 1679afdbed0e | title_screen_restart | 0 | 38 | PASS |
| 11 | g2-mweltqds-34-1g4mgnn-failure_restart | 5 | 448786590 | 291 | 13 | 22 | 0.378 | 818065036c13 | d13e1a88673d | failure_restart | 0 | 49 | PASS |
| 12 | g2-mweltqg0-35-1xf3udz-new_game | 8 | 1522193483 | 192 | 15 | 19 | 0.165 | 383722e64946 | 56bdfeec405c | new_game | 0 | 45 | PASS |
| 13 | g2-mweltqi5-36-18g9qbp-application_restart | 9 | 2959295838 | 255 | 15 | 23 | 0.191 | 11233429ee5a | 2dc6dbfc46cc | application_restart | 0 | 54 | PASS |
| 14 | g2-mweltqjo-37-14wjv1z-title_screen_restart | 8 | 2296747317 | 192 | 15 | 24 | 0.206 | bd445bb8205d | c33b6d82ea6c | title_screen_restart | 0 | 30 | PASS |
| 15 | g2-mweltql6-38-19co592-failure_restart | 6 | 4209550447 | 261 | 13 | 19 | 0.249 | d52ca0f78b58 | 53996f4efd74 | failure_restart | 0 | 41 | PASS |
| 16 | g2-mweltqn7-39-77jpev-new_game | 2 | 2177741983 | 300 | 14 | 20 | 0.174 | 18a2998cd8ef | 492482faab21 | new_game | 0 | 43 | PASS |
| 17 | g2-mweltqpi-3a-k4s6sa-application_restart | 8 | 1317764300 | 192 | 15 | 25 | 0.191 | 7211705ab0bc | 557162e2c8f3 | application_restart | 1 | 60 | PASS |
| 18 | g2-mweltqqv-3b-2w72ml-title_screen_restart | 5 | 392283932 | 291 | 13 | 23 | 0.175 | ec6b1fc75652 | 0d389d305036 | title_screen_restart | 0 | 34 | PASS |
| 19 | g2-mweltqsn-3c-1gtd1lz-failure_restart | 6 | 3674347005 | 261 | 13 | 20 | 0.2 | f3c9cef48b81 | 21d7c0f35d47 | failure_restart | 0 | 38 | PASS |
| 20 | g2-mweltqv4-3d-1tww4i6-new_game | 0 | 922487359 | 321 | 15 | 19 | 0.21 | 39061c841623 | 36dd88ab8e2c | new_game | 0 | 66 | PASS |
| 21 | g2-mweltqyb-3e-82uvcd-application_restart | 2 | 3670346993 | 300 | 14 | 19 | 0.198 | d03ed0899938 | 73e795643002 | application_restart | 0 | 64 | PASS |
| 22 | g2-mweltr0i-3f-1q4fkqe-title_screen_restart | 7 | 2034815473 | 312 | 14 | 21 | 0.201 | 98b41a6d08f7 | e070c5536c9d | title_screen_restart | 0 | 45 | PASS |
| 23 | g2-mweltr7w-3g-l4nury-failure_restart | 3 | 2087318119 | 312 | 16 | 19 | 0.388 | 9e0d5ba28711 | fa4f9c098a63 | failure_restart | 1 | 235 | PASS |
| 24 | g2-mweltrai-3h-s0j8gi-new_game | 7 | 7007021 | 312 | 14 | 20 | 0.355 | 8a40d3014542 | 34ab857a6500 | new_game | 0 | 53 | PASS |
| 25 | g2-mweltrcd-3i-rjpj64-application_restart | 6 | 1224340427 | 261 | 13 | 21 | 0.233 | 164e37c4add2 | 1c124f93cc93 | application_restart | 0 | 38 | PASS |
| 26 | g2-mweltre5-3j-domhxt-title_screen_restart | 4 | 2179741989 | 273 | 13 | 23 | 0.21 | e35a8c1bbdf3 | 3a354b3498da | title_screen_restart | 0 | 42 | PASS |
| 27 | g2-mweltrfv-3k-1c7n75r-failure_restart | 8 | 3275730334 | 192 | 15 | 20 | 0.187 | 1994b0a04ec7 | 2084416a9163 | failure_restart | 0 | 33 | PASS |
| 28 | g2-mweltrhl-3l-18okimq-new_game | 7 | 3971200058 | 312 | 14 | 21 | 0.247 | e410c063b527 | 8c8a7c6a1d5a | new_game | 0 | 48 | PASS |
| 29 | g2-mweltrjn-3m-1m9gu3p-application_restart | 4 | 3672346999 | 273 | 13 | 24 | 0.17 | 8d7928bc5f40 | 65aaaaa837c5 | application_restart | 0 | 42 | PASS |
| 30 | g2-mweltrlg-3n-1lozp4-title_screen_restart | 2 | 4114126568 | 300 | 14 | 23 | 0.221 | 7983369ef994 | 75224f25af22 | title_screen_restart | 0 | 43 | PASS |
| 31 | g2-mweltrnr-3o-121jduh-failure_restart | 7 | 2478595048 | 312 | 14 | 19 | 0.233 | 2a2b1a07a3c0 | 49d330429421 | failure_restart | 0 | 50 | PASS |
| 32 | g2-mweltrpp-3p-164n507-new_game | 1 | 2655442764 | 282 | 13 | 21 | 0.428 | 4e152ea6d521 | c4cac834d9ef | new_game | 0 | 39 | PASS |
| 33 | g2-mweltrrb-3q-12l0h2v-application_restart | 8 | 1008571490 | 192 | 15 | 21 | 0.207 | f3f4f39827d6 | 2987b0a94294 | application_restart | 0 | 30 | PASS |
| 34 | g2-mweltrso-3r-1fvpzui-title_screen_restart | 4 | 3580923132 | 273 | 13 | 22 | 0.188 | a79c47353758 | 71e0c526ba59 | title_screen_restart | 0 | 32 | PASS |
| 35 | g2-mweltrub-3s-1yoeuo8-failure_restart | 9 | 783560861 | 255 | 15 | 19 | 0.241 | 4d8955cdd0fb | 2837800bfb55 | failure_restart | 0 | 39 | PASS |
| 36 | g2-mweltrw7-3t-1k7qsmr-new_game | 6 | 1555114686 | 261 | 13 | 20 | 0.284 | 5a770bb6e8c6 | b6e96321e08f | new_game | 0 | 48 | PASS |
| 37 | g2-mweltry4-3u-fsbnbs-application_restart | 0 | 3428996595 | 321 | 15 | 22 | 0.338 | 4839a7bfb82c | 6c8a1c4319f2 | application_restart | 0 | 43 | PASS |
| 38 | g2-mwelts05-3v-1kq5mui-title_screen_restart | 2 | 2804369292 | 300 | 14 | 20 | 0.223 | 642f032ea6b6 | 8b5c62f00b5d | title_screen_restart | 0 | 44 | PASS |
| 39 | g2-mwelts2d-3w-o2ve28-failure_restart | 4 | 539210454 | 273 | 13 | 20 | 0.222 | 2ce3c4476758 | e6533fa9d8e6 | failure_restart | 0 | 48 | PASS |
| 40 | g2-mwelts4h-3x-1f30700-new_game | 6 | 2660442779 | 261 | 13 | 20 | 0.219 | 75891a2c58c4 | e37832542407 | new_game | 0 | 47 | PASS |
| 41 | g2-mwelts6o-3y-hnr4c7-application_restart | 5 | 3821273527 | 291 | 13 | 24 | 0.167 | 0e064bc84adc | 47418f73ef1a | application_restart | 0 | 47 | PASS |
| 42 | g2-mwelts8e-3z-k92q1e-title_screen_restart | 6 | 2569018912 | 261 | 13 | 20 | 0.336 | 3101adc36814 | c65a79136144 | title_screen_restart | 0 | 38 | PASS |
| 43 | g2-mwelts9y-40-otfjkl-failure_restart | 8 | 2240244659 | 192 | 15 | 24 | 0.219 | 9001d80ec21b | 5fc487a1e489 | failure_restart | 0 | 31 | PASS |
| 44 | g2-mweltsbj-41-1i42sfe-new_game | 1 | 57509661 | 282 | 13 | 20 | 0.216 | 794df546f185 | db9fbb8b8e80 | new_game | 0 | 41 | PASS |
| 45 | g2-mweltseo-42-4yr3c5-application_restart | 3 | 298860059 | 312 | 16 | 19 | 0.282 | 9ee377bbe6ce | a9a6209f34b3 | application_restart | 0 | 86 | PASS |
| 46 | g2-mweltsif-43-28brdn-title_screen_restart | 4 | 4116126574 | 273 | 13 | 20 | 0.177 | 227c51070770 | f069c790a375 | title_screen_restart | 0 | 68 | PASS |
| 47 | g2-mweltsk6-44-1se71v8-failure_restart | 0 | 535210442 | 321 | 15 | 22 | 0.173 | 5a4150e526a5 | 35f6cfae4f20 | failure_restart | 0 | 42 | PASS |
| 48 | g2-mweltsmh-45-k4dgmd-new_game | 5 | 300860065 | 291 | 13 | 21 | 0.174 | 7e2fb2e38b3d | 2471fb7a1993 | new_game | 0 | 53 | PASS |
| 49 | g2-mweltsoj-46-xb0och-application_restart | 8 | 4141708035 | 192 | 15 | 19 | 0.16 | bc7d50b9bc95 | 731c8ca77f4d | application_restart | 0 | 36 | PASS |
| 50 | g2-mweltsq0-47-sw961j-title_screen_restart | 1 | 388283920 | 282 | 13 | 21 | 0.168 | 03f43d85a39c | 10a3cfa30462 | title_screen_restart | 0 | 39 | PASS |
| 51 | g2-mweltstf-49-2ndrjq-failure_restart | 6 | 4209550447 | 261 | 13 | 21 | 0.24 | 853fc2a50993 | ff85bc408117 | failure_restart | 0 | 32 | PASS |
| 52 | g2-mweltswc-4a-157rz49-new_game | 0 | 147933525 | 321 | 15 | 19 | 0.263 | 5581157976d3 | 8bf90aa30776 | new_game | 0 | 81 | PASS |
| 53 | g2-mweltszo-4b-1mj235d-application_restart | 9 | 1945391612 | 255 | 15 | 19 | 0.133 | 0c66079e93d5 | 56716f6357ac | application_restart | 0 | 62 | PASS |
| 54 | g2-mweltt1f-4c-10s8hdy-title_screen_restart | 2 | 2712945425 | 300 | 14 | 21 | 0.202 | ccb696a64ef2 | cb6e47bd508e | title_screen_restart | 0 | 43 | PASS |
| 55 | g2-mweltt4h-4d-196yicr-failure_restart | 0 | 3668346987 | 321 | 15 | 21 | 0.283 | bc275582e836 | c1a3d5dc525d | failure_restart | 1 | 81 | PASS |
| 56 | g2-mweltt6h-4e-7sl5dp-new_game | 5 | 1793465075 | 291 | 13 | 20 | 0.264 | cecd1c585396 | d07b9a89503d | new_game | 0 | 43 | PASS |
| 57 | g2-mweltt8f-4f-ai9zws-application_restart | 2 | 2177741983 | 300 | 14 | 25 | 0.352 | 0f7314a0e613 | f8dc5b8915b5 | application_restart | 0 | 44 | PASS |
| 58 | g2-mwelttab-4g-1o983gp-title_screen_restart | 4 | 2714945431 | 273 | 13 | 19 | 0.188 | 0162d4c081fb | 3bea357c5bf1 | title_screen_restart | 0 | 40 | PASS |
| 59 | g2-mwelttdr-4h-1lw4brr-failure_restart | 6 | 393283935 | 261 | 13 | 23 | 0.338 | acfb32b66177 | a0c8283d138d | failure_restart | 1 | 102 | PASS |
| 60 | g2-mwelttfp-4i-qnj81c-new_game | 3 | 3007009 | 312 | 16 | 24 | 0.212 | 4051cfb80e18 | 292d35070629 | new_game | 0 | 45 | PASS |
| 61 | g2-mweltthh-4j-l7o7d6-application_restart | 9 | 304860077 | 255 | 15 | 22 | 0.184 | a9b221d5a0c7 | f1c924053741 | application_restart | 0 | 34 | PASS |
| 62 | g2-mwelttjc-4k-1h2f6u1-title_screen_restart | 3 | 2474595036 | 312 | 16 | 25 | 0.269 | 688720e0f213 | 47f763dcd6fb | title_screen_restart | 0 | 44 | PASS |
| 63 | g2-mwelttkz-4l-10pjuzd-failure_restart | 8 | 1557114692 | 192 | 15 | 19 | 0.197 | 2d70f0f41252 | 463499f53f48 | failure_restart | 0 | 26 | PASS |
| 64 | g2-mwelttme-4m-kxo1ou-new_game | 1 | 3965200040 | 282 | 13 | 22 | 0.224 | 5a59a646625b | 94f76b3f9b5e | new_game | 0 | 36 | PASS |
| 65 | g2-mwelttoh-4n-v0qh0q-application_restart | 7 | 1943391606 | 312 | 14 | 20 | 0.358 | d12009d3b19c | 6310eb00dc71 | application_restart | 0 | 47 | PASS |
| 66 | g2-mwelttqu-4o-ubkipz-title_screen_restart | 5 | 1554114683 | 291 | 13 | 23 | 0.258 | d7c9b62f3932 | 5325b817bf77 | title_screen_restart | 0 | 52 | PASS |
| 67 | g2-mwelttt0-4p-de2n39-failure_restart | 2 | 2325668508 | 300 | 14 | 22 | 0.123 | ff58dbe2d299 | 615312ac991b | failure_restart | 0 | 47 | PASS |
| 68 | g2-mwelttuy-4q-py4o2x-new_game | 7 | 929487380 | 312 | 14 | 20 | 0.286 | fcc9d740e166 | 0943849254cc | new_game | 0 | 42 | PASS |
| 69 | g2-mwelttwy-4r-s52m2y-application_restart | 2 | 4114126568 | 300 | 14 | 19 | 0.216 | d8ce268a49c6 | 46d68a1041de | application_restart | 0 | 45 | PASS |
| 70 | g2-mwelttzf-4s-bvrmbt-title_screen_restart | 9 | 1945391612 | 255 | 15 | 19 | 0.312 | 7dbd33095d79 | a102341c8e88 | title_screen_restart | 0 | 58 | PASS |
| 71 | g2-mweltu20-4t-gsn38r-failure_restart | 8 | 1008571490 | 192 | 15 | 19 | 0.151 | 70f6f84c9335 | 73456fa17064 | failure_restart | 0 | 52 | PASS |
| 72 | g2-mweltu3w-4u-18vsriw-new_game | 7 | 3731849666 | 312 | 14 | 20 | 0.24 | 3c8339ff64a3 | b6836e434312 | new_game | 0 | 46 | PASS |
| 73 | g2-mweltu5l-4v-2d0ke7-application_restart | 9 | 452786602 | 255 | 15 | 19 | 0.16 | d649441a81ed | 847a4d35ed67 | application_restart | 0 | 31 | PASS |
| 74 | g2-mweltu79-4w-11h80l0-title_screen_restart | 7 | 2330668523 | 312 | 14 | 22 | 0.213 | 29551f74d125 | 70ca9e964791 | title_screen_restart | 0 | 40 | PASS |
| 75 | g2-mweltu9d-4x-1qepeyn-failure_restart | 2 | 3487499259 | 300 | 14 | 21 | 0.277 | 39ed4f8614a4 | 07ac034679dd | failure_restart | 0 | 47 | PASS |
| 76 | g2-mweltuba-4y-1nsjhlx-new_game | 4 | 2179741989 | 273 | 13 | 20 | 0.259 | 384dd38ac216 | 8e7d86255e0c | new_game | 0 | 40 | PASS |
| 77 | g2-mweltud4-4z-1l1xx75-application_restart | 5 | 3673347002 | 291 | 13 | 23 | 0.177 | 8e116af2a784 | 0d1dddb9a27b | application_restart | 0 | 42 | PASS |
| 78 | g2-mweltuf3-50-895biu-title_screen_restart | 3 | 2030815461 | 312 | 16 | 24 | 0.246 | 496c49f6e111 | 02894eec8181 | title_screen_restart | 0 | 46 | PASS |
| 79 | g2-mweltuhb-51-15c0pnq-failure_restart | 9 | 3346572755 | 255 | 15 | 20 | 0.21 | e3daaac9d1d5 | 941c24316d01 | failure_restart | 0 | 51 | PASS |
| 80 | g2-mweltujs-52-fqmc2z-new_game | 1 | 4204550432 | 282 | 13 | 23 | 0.225 | b12f23d5c719 | 10aadd4044ba | new_game | 0 | 53 | PASS |
| 81 | g2-mweltult-53-l5tekr-application_restart | 3 | 3579923129 | 312 | 16 | 22 | 0.225 | e79d7f531d28 | 3f8c209ae145 | application_restart | 0 | 46 | PASS |
| 82 | g2-mweltuno-54-1ohg4k-title_screen_restart | 4 | 2954295823 | 273 | 13 | 21 | 0.242 | c0ea1cfe8e30 | f982a01f4143 | title_screen_restart | 0 | 40 | PASS |
| 83 | g2-mweltupx-55-imna2g-failure_restart | 9 | 3107222363 | 255 | 15 | 20 | 0.201 | 7ccd65e6a54c | d4132c75f5c3 | failure_restart | 0 | 57 | PASS |
| 84 | g2-mweltusr-56-f60wx6-new_game | 1 | 2803369289 | 282 | 13 | 24 | 0.283 | b8efab3b5ba9 | 3964cf850e34 | new_game | 0 | 61 | PASS |
| 85 | g2-mweltuuq-57-cm5xoh-application_restart | 7 | 154933546 | 312 | 14 | 23 | 0.318 | 5c1a6e612062 | ddf35b5e0b28 | application_restart | 0 | 41 | PASS |
| 86 | g2-mweltuwu-58-1fc2ruh-title_screen_restart | 0 | 1013911226 | 321 | 15 | 20 | 0.205 | 6526790d313d | 51c536d75f67 | title_screen_restart | 0 | 48 | PASS |
| 87 | g2-mweltuzh-59-1smkzuf-failure_restart | 2 | 833063498 | 300 | 14 | 19 | 0.24 | c62f517b0bbe | 90374021146f | failure_restart | 0 | 58 | PASS |
| 88 | g2-mweltv22-5a-1gmnck9-new_game | 7 | 929487380 | 312 | 14 | 19 | 0.226 | ba0f10d76ae9 | 6e9d9abdb2e6 | new_game | 0 | 55 | PASS |
| 89 | g2-mweltv49-5b-1mc0ps0-application_restart | 5 | 392283932 | 291 | 13 | 19 | 0.188 | 1cc793d1cdb1 | 6e33ae182e1b | application_restart | 0 | 46 | PASS |
| 90 | g2-mweltv5u-5c-7nzjqy-title_screen_restart | 8 | 3789352327 | 192 | 15 | 19 | 0.125 | 3502c59127eb | 107844b0ae7b | title_screen_restart | 0 | 31 | PASS |
| 91 | g2-mweltv7l-5d-4tsk1j-failure_restart | 0 | 683136967 | 321 | 15 | 21 | 0.242 | dd673971a391 | d8ec763f101a | failure_restart | 0 | 45 | PASS |
| 92 | g2-mweltvaf-5e-vtsmvb-new_game | 5 | 836063507 | 291 | 13 | 25 | 0.231 | a3d672bd51eb | 39e65a35ed10 | new_game | 1 | 74 | PASS |
| 93 | g2-mweltvcc-5f-1fai8xw-application_restart | 4 | 4059623916 | 273 | 13 | 19 | 0.267 | 399a8ad3a6c1 | a83f37b7adc6 | application_restart | 0 | 42 | PASS |
| 94 | g2-mweltveh-5g-1wz2feo-title_screen_restart | 3 | 2566018903 | 312 | 16 | 20 | 0.269 | ea498f3bd2c8 | e890984e64aa | title_screen_restart | 0 | 48 | PASS |
| 95 | g2-mweltvgd-5h-euwgqb-failure_restart | 9 | 692136994 | 255 | 15 | 22 | 0.208 | 292bc86a283d | 6cf35dea6f6f | failure_restart | 0 | 38 | PASS |
| 96 | g2-mweltvhx-5i-1efjief-new_game | 6 | 1942391603 | 261 | 13 | 21 | 0.206 | 600fa72f3df3 | 4ebec94bff0b | new_game | 0 | 34 | PASS |
| 97 | g2-mweltvj9-5j-17u1rgs-application_restart | 9 | 1706041220 | 255 | 15 | 23 | 0.188 | aa7204580e0b | 35c3c29c3cb6 | application_restart | 0 | 29 | PASS |
| 98 | g2-mweltvks-5k-3mjzho-title_screen_restart | 1 | 2028815455 | 282 | 13 | 24 | 0.384 | a0d9c7a0bfb7 | 88863130a908 | title_screen_restart | 0 | 36 | PASS |
| 99 | g2-mweltvml-5l-12kd7du-failure_restart | 5 | 3342572743 | 291 | 13 | 23 | 0.245 | 5bbbeb12f2e4 | c5a5c5bbfd72 | failure_restart | 0 | 40 | PASS |
| 100 | g2-mweltvoc-5m-17w5fec-new_game | 9 | 3107222363 | 255 | 15 | 23 | 0.372 | 7730217b2c99 | 5e0113c34f13 | new_game | 0 | 35 | PASS |

</details>

## 失败案例与原因

本次运行 **0** 个生成失败案例；每次重试的原因均记录在 `random-generation-report.json` 的逐局 `retries` 字段。

## 测试性质说明

- 运行时：两关各 100 局真实调用 `createNewGame`，真实生成、真实签名、真实校验。
- 相似度：用**真实牌面**两两计算 `layoutSimilarity`（层占位格 Jaccard 均值 ×0.5 + 整体轮廓 Jaccard ×0.5），不是签名比较。
- 静态审计：三种重新开局入口通过读取 `src/main.js` 源码确认全部走统一入口；未冒充浏览器实测。
- 重启模拟：把存档 JSON 写入磁盘再读回，继续生成并验证差异化。
- 浏览器实际运行 / Windows 安装卸载测试不在本文件覆盖范围，见 `FINAL_ACCEPTANCE.md`。
