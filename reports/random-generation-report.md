# 双关卡各 100 局随机生成压力测试报告

> 本文件由 `node test-random-generation.js` **真实运行**自动生成，不是静态 PASS 模板。

- 运行时间：2026-11-13T10:14:17.159Z
- Git commit：`66fe78bb82954e5efa9551a11234b0d1025a94df`
- 断言：通过 **7788**，失败 **0**
- 总耗时：11678 ms
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
| 平均单局生成耗时 | 22.39 ms |
| 失败案例 | 0 |

## 滑动窗口相似度（L1 三局 / L2 十局）

| 关卡 | 窗口对数 | 均值 | P95 | 最大值 | 阈值 | 判定 |
|---|---|---|---|---|---|---|
| L1 | 294 | 0.2347 | 0.4954 | 0.5694 | 0.6 | ✓ 全部 < 0.60 |
| L2 | 945 | 0.2728 | 0.4057 | 0.5977 | 0.6 | ✓ 全部 < 0.60 |

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
| 耗时 | 1740 ms |
| 牌数范围 | 24 – 48 |
| 开局可点牌范围 | 14 – 40 |
| 档位分布 | {"0":25,"1":25,"2":25,"3":25} |
| 牌数分布 | {"24":25,"30":25,"36":25,"48":25} |
| 牌型数分布 | {"8":25,"10":25,"12":25,"16":25} |
| 生成原因分布 | {"application_restart":25,"title_screen_restart":25,"failure_restart":25,"new_game":25} |
| 布局签名去重 | 100 / 100 |
| 最近 3 局总牌数重复 | 0 |
| 最近 3 局布局签名重复 | 0 |
| 最近 3 局几何签名重复 | 0 |
| 重试次数（失败重试合计） | 10 |
| 生成失败次数 | 0 |
| 滑窗 sim 均值 / P95 / 最大 | 0.2347 / 0.4954 / 0.5694 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 11.36 ms |

<details><summary>完整 100 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | sim最大 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g1-mwetks5n-1-eno324-application_restart | 1 | 4183182652 | 30 | 10 | 25 | 0 | 31ea4f7bc2c1 | d584624473f9 | application_restart | 0 | 8 | PASS |
| 2 | g1-mwetks6b-2-10q6qhr-title_screen_restart | 2 | 345926511 | 36 | 12 | 26 | 0.188 | 17db8ddc61b4 | eaeb0211e139 | title_screen_restart | 0 | 13 | PASS |
| 3 | g1-mwetks7i-3-xvf18v-failure_restart | 3 | 3637831982 | 48 | 16 | 35 | 0.243 | fec48d8b7c5a | 3bf9b24f6d00 | failure_restart | 0 | 37 | PASS |
| 4 | g1-mwetks8z-4-e8yz9x-new_game | 0 | 3771253920 | 24 | 8 | 20 | 0.498 | 8a60d85b0c77 | a21595a98225 | new_game | 0 | 29 | PASS |
| 5 | g1-mwetks97-5-1q3o3bg-application_restart | 1 | 2419451727 | 30 | 10 | 27 | 0.227 | 502303a37d3f | ba8a500ecfb8 | application_restart | 0 | 6 | PASS |
| 6 | g1-mwetks9j-6-pb4jj2-title_screen_restart | 2 | 2087361022 | 36 | 12 | 33 | 0.428 | 540b06c9ff47 | 80b61cdf57d2 | title_screen_restart | 0 | 8 | PASS |
| 7 | g1-mwetks9w-7-1dt5uuy-failure_restart | 3 | 2153659806 | 48 | 16 | 33 | 0.324 | 5dcd95967a16 | 9d31ab6eaf43 | failure_restart | 0 | 9 | PASS |
| 8 | g1-mwetksa9-8-xj63mc-new_game | 0 | 3993209093 | 24 | 8 | 20 | 0.42 | e5d1c97f68c6 | 2d9782782c56 | new_game | 0 | 7 | PASS |
| 9 | g1-mwetksag-9-1ic2k4i-application_restart | 1 | 1934719584 | 30 | 10 | 26 | 0.34 | 742e57f2fb10 | b5fc3efb6030 | application_restart | 0 | 5 | PASS |
| 10 | g1-mwetksar-a-18l0phm-title_screen_restart | 2 | 2416242974 | 36 | 12 | 27 | 0.122 | 2bc2458fe7d5 | 0cf3e41b8574 | title_screen_restart | 0 | 7 | PASS |
| 11 | g1-mwetksbm-b-1n4544g-failure_restart | 3 | 245017378 | 48 | 16 | 28 | 0.397 | ac9fc262cea8 | 42a9b1a1c4f7 | failure_restart | 0 | 26 | PASS |
| 12 | g1-mwetkscw-c-1e9n9s6-new_game | 0 | 1882447892 | 24 | 8 | 24 | 0.552 | fe480106df7b | 418ac0f4ea62 | new_game | 0 | 23 | PASS |
| 13 | g1-mwetksd4-d-1sja85b-application_restart | 1 | 1734909506 | 30 | 10 | 27 | 0.39 | 7bc4b21ac406 | 9206c212f3a0 | application_restart | 0 | 5 | PASS |
| 14 | g1-mwetksdh-e-1umk8d3-title_screen_restart | 2 | 3898663390 | 36 | 12 | 28 | 0.529 | 31107d9e95e6 | d02a626f6d64 | title_screen_restart | 0 | 8 | PASS |
| 15 | g1-mwetkse2-f-1b5fquj-failure_restart | 3 | 2284347883 | 48 | 16 | 33 | 0.197 | 90c3bed7366e | d03525e77a47 | failure_restart | 0 | 15 | PASS |
| 16 | g1-mwetksen-g-isovbb-new_game | 0 | 3392048526 | 24 | 8 | 19 | 0.346 | fe123dd441ab | 6a7b5ee4608f | new_game | 0 | 11 | PASS |
| 17 | g1-mwetksf3-h-1u79um8-application_restart | 1 | 704058437 | 30 | 10 | 20 | 0.532 | 127639222de9 | c7539f77ee6f | application_restart | 1 | 13 | PASS |
| 18 | g1-mwetksfj-i-1qdf44d-title_screen_restart | 2 | 1997523156 | 36 | 12 | 26 | 0.145 | d259b8f3ec94 | 5213e834f92a | title_screen_restart | 0 | 10 | PASS |
| 19 | g1-mwetksfx-j-1efwize-failure_restart | 3 | 851631293 | 48 | 16 | 33 | 0.331 | a9c16f02cd26 | 261c7f67213d | failure_restart | 0 | 10 | PASS |
| 20 | g1-mwetksgb-k-1z0zcxx-new_game | 0 | 360339916 | 24 | 8 | 15 | 0.384 | 9768b5fc891f | af06a8bb9638 | new_game | 0 | 7 | PASS |
| 21 | g1-mwetksgl-l-1f7qb1-application_restart | 1 | 1833423664 | 30 | 10 | 20 | 0.186 | bf81dcd8fcb9 | 5be510478e8a | application_restart | 0 | 7 | PASS |
| 22 | g1-mwetksh0-m-66otzi-title_screen_restart | 2 | 1328341204 | 36 | 12 | 28 | 0.343 | ef27b486db8b | eb0df0f6a186 | title_screen_restart | 0 | 10 | PASS |
| 23 | g1-mwetkshf-n-1tno3m1-failure_restart | 3 | 2146079508 | 48 | 16 | 37 | 0.379 | b79f33b613a2 | 60b029071807 | failure_restart | 0 | 11 | PASS |
| 24 | g1-mwetkshw-o-ahuv7x-new_game | 0 | 2160083970 | 24 | 8 | 20 | 0.542 | ccc26300004c | f63f47c8b65f | new_game | 0 | 9 | PASS |
| 25 | g1-mwetksi2-p-1su57kw-application_restart | 1 | 4261069333 | 30 | 10 | 26 | 0.185 | 7157f263a44f | aa23df94669b | application_restart | 0 | 4 | PASS |
| 26 | g1-mwetksic-q-1hivloc-title_screen_restart | 2 | 2310133173 | 36 | 12 | 26 | 0.38 | ae5c349a34e8 | 7e47a3f7cb50 | title_screen_restart | 0 | 6 | PASS |
| 27 | g1-mwetksiz-r-1rw4rih-failure_restart | 3 | 2050531831 | 48 | 16 | 30 | 0.545 | 1966452a92e1 | 040dc7813047 | failure_restart | 0 | 19 | PASS |
| 28 | g1-mwetksjt-s-a6kar4-new_game | 0 | 3153868876 | 24 | 8 | 20 | 0.311 | a57e5b6d36b7 | 6051a9de9552 | new_game | 0 | 17 | PASS |
| 29 | g1-mwetksk1-t-ajfzgp-application_restart | 1 | 3690352135 | 30 | 10 | 23 | 0.467 | 169c0bcfb05f | c0ba0e882d31 | application_restart | 0 | 5 | PASS |
| 30 | g1-mwetkskn-u-14vm5zd-title_screen_restart | 2 | 2820249439 | 36 | 12 | 27 | 0.433 | 2f6ff7860089 | 66706ce28c50 | title_screen_restart | 1 | 18 | PASS |
| 31 | g1-mwetkslk-v-1yu43wz-failure_restart | 3 | 557968118 | 48 | 16 | 34 | 0.301 | ef8484fe1ec4 | f7d71f1c8488 | failure_restart | 0 | 30 | PASS |
| 32 | g1-mwetksn4-w-1hkid1x-new_game | 0 | 1659896086 | 24 | 8 | 19 | 0.365 | 559f8b488eea | eada85bc684d | new_game | 0 | 27 | PASS |
| 33 | g1-mwetksnb-x-16505zs-application_restart | 1 | 2192056295 | 30 | 10 | 26 | 0.4 | 04668ed2b074 | 087e22310295 | application_restart | 0 | 5 | PASS |
| 34 | g1-mwetksnk-y-1b5xuik-title_screen_restart | 2 | 3294033378 | 36 | 12 | 26 | 0.478 | 6df99add78db | 3c9fecd17bc2 | title_screen_restart | 0 | 7 | PASS |
| 35 | g1-mwetkso3-z-10rluzx-failure_restart | 3 | 3082143574 | 48 | 16 | 34 | 0.422 | 2c03f6c1fa2c | 25f5ee5dc931 | failure_restart | 0 | 14 | PASS |
| 36 | g1-mwetksop-10-1uhf978-new_game | 0 | 134920007 | 24 | 8 | 20 | 0.517 | 66971e33d4ea | 04e407259dde | new_game | 0 | 11 | PASS |
| 37 | g1-mwetksoy-11-ui7mtw-application_restart | 1 | 701574374 | 30 | 10 | 30 | 0.467 | e99043f2404d | b39a13efe394 | application_restart | 1 | 7 | PASS |
| 38 | g1-mwetkspb-12-mu0eoe-title_screen_restart | 2 | 2581065649 | 36 | 12 | 28 | 0.265 | aa12af6ba46e | 5efab7d2613b | title_screen_restart | 1 | 10 | PASS |
| 39 | g1-mwetkspw-13-2xouca-failure_restart | 3 | 261072302 | 48 | 16 | 37 | 0.177 | a227694491bc | 8df7933d5808 | failure_restart | 0 | 16 | PASS |
| 40 | g1-mwetksqg-14-1h50i25-new_game | 0 | 3929086784 | 24 | 8 | 24 | 0.322 | 61cec13f46c4 | 4b9985dfcbd6 | new_game | 0 | 10 | PASS |
| 41 | g1-mwetksqm-15-mjrz7r-application_restart | 1 | 1551569239 | 30 | 10 | 27 | 0.437 | 8c1b9625814e | adc12d0d7dc3 | application_restart | 0 | 4 | PASS |
| 42 | g1-mwetksr0-16-1ad3a64-title_screen_restart | 2 | 3009959098 | 36 | 12 | 31 | 0.451 | fafca60302c8 | 371330417ba8 | title_screen_restart | 1 | 11 | PASS |
| 43 | g1-mwetksri-17-1dvorua-failure_restart | 3 | 4004167745 | 48 | 16 | 29 | 0.278 | c8bc04a831fa | 82e75e0ce1fb | failure_restart | 0 | 14 | PASS |
| 44 | g1-mwetkssa-18-1bgy9q-new_game | 0 | 1644252653 | 24 | 8 | 24 | 0.282 | c9e6a676ef4a | 595b96621930 | new_game | 0 | 16 | PASS |
| 45 | g1-mwetkssi-19-qv3uf2-application_restart | 1 | 182614224 | 30 | 10 | 26 | 0.521 | c6f5f253d3bf | 21eaa9e7c8b4 | application_restart | 0 | 5 | PASS |
| 46 | g1-mwetksss-1a-okjo6h-title_screen_restart | 2 | 1178610966 | 36 | 12 | 32 | 0.252 | 32ef8d6d8b78 | 7288183ea813 | title_screen_restart | 0 | 8 | PASS |
| 47 | g1-mwetkstu-1b-1rbn9ia-failure_restart | 3 | 4038046477 | 48 | 16 | 33 | 0.52 | 09ba8628a928 | 6b0da660349d | failure_restart | 0 | 32 | PASS |
| 48 | g1-mwetksvd-1c-18fw2f7-new_game | 0 | 4191667433 | 24 | 8 | 14 | 0.221 | 9a24fcb9a984 | 08cd1ba73ef4 | new_game | 0 | 30 | PASS |
| 49 | g1-mwetksvm-1d-qrz4yb-application_restart | 1 | 2756914623 | 30 | 10 | 26 | 0.261 | 2144f7e2f28d | 3f8c6eca0f0c | application_restart | 0 | 6 | PASS |
| 50 | g1-mwetksvy-1e-wneojl-title_screen_restart | 2 | 2722331602 | 36 | 12 | 33 | 0.282 | ab6a3db36ccf | c8f73b30b182 | title_screen_restart | 0 | 8 | PASS |
| 51 | g1-mwetkswv-1g-12swue2-failure_restart | 3 | 3564921314 | 48 | 16 | 35 | 0.416 | c205743dde51 | d18e5ab2d302 | failure_restart | 0 | 8 | PASS |
| 52 | g1-mwetksxe-1h-1mrbrz7-new_game | 0 | 3279493561 | 24 | 8 | 16 | 0.292 | e7a8891a9915 | 7388c40ad7a6 | new_game | 0 | 10 | PASS |
| 53 | g1-mwetksxs-1i-x4c8x8-application_restart | 1 | 4154324460 | 30 | 10 | 20 | 0.331 | af1975a0f56e | e14dc2f83c87 | application_restart | 2 | 11 | PASS |
| 54 | g1-mwetksy2-1j-13urax-title_screen_restart | 2 | 2410393294 | 36 | 12 | 27 | 0.398 | 3bb8ceb1c741 | b7bd6c98e9b9 | title_screen_restart | 0 | 5 | PASS |
| 55 | g1-mwetksyf-1k-1c77ac9-failure_restart | 3 | 1178962724 | 48 | 16 | 35 | 0.361 | fed60010a98f | bfe6f253e9be | failure_restart | 0 | 9 | PASS |
| 56 | g1-mwetksyu-1l-s7e8zg-new_game | 0 | 598413132 | 24 | 8 | 19 | 0.452 | 2d3cc49b1596 | 7602e6335f4c | new_game | 0 | 9 | PASS |
| 57 | g1-mwetksz1-1m-yl49qn-application_restart | 1 | 698536859 | 30 | 10 | 27 | 0.456 | eb611e2f09ec | 577ef24b6f96 | application_restart | 0 | 5 | PASS |
| 58 | g1-mwetkszc-1n-9pslls-title_screen_restart | 2 | 3710898709 | 36 | 12 | 27 | 0.379 | a3b6120c23f3 | 2ac0003753f8 | title_screen_restart | 0 | 7 | PASS |
| 59 | g1-mwetkszs-1o-wo3hce-failure_restart | 3 | 602433527 | 48 | 16 | 40 | 0.25 | 29faf51ab024 | c2396fdce84f | failure_restart | 0 | 11 | PASS |
| 60 | g1-mwetkt05-1p-lkjp6r-new_game | 0 | 4158325715 | 24 | 8 | 19 | 0.227 | 17fc12cfda68 | 92470d6906e3 | new_game | 0 | 7 | PASS |
| 61 | g1-mwetkt0d-1q-c9utn5-application_restart | 1 | 1208833505 | 30 | 10 | 23 | 0.399 | a04b617f48d6 | eae167662a29 | application_restart | 0 | 6 | PASS |
| 62 | g1-mwetkt0m-1r-1pdmfh4-title_screen_restart | 2 | 4036887879 | 36 | 12 | 27 | 0.308 | 0675704b4954 | c2e5e97be206 | title_screen_restart | 0 | 6 | PASS |
| 63 | g1-mwetkt0z-1s-1l823zi-failure_restart | 3 | 1114058265 | 48 | 16 | 39 | 0.39 | b49f9a70f41f | 0d6c8efb149c | failure_restart | 0 | 9 | PASS |
| 64 | g1-mwetkt1e-1t-kml3yj-new_game | 0 | 2602397341 | 24 | 8 | 24 | 0.458 | 7b4ae6cd6243 | 4c1a993d4e89 | new_game | 0 | 8 | PASS |
| 65 | g1-mwetkt1l-1u-vigkv8-application_restart | 1 | 2053587916 | 30 | 10 | 25 | 0.497 | 6c6a5a76e5a9 | 57a630cef5d7 | application_restart | 0 | 4 | PASS |
| 66 | g1-mwetkt1u-1v-1x3lera-title_screen_restart | 2 | 3751194077 | 36 | 12 | 29 | 0.569 | da8728f54448 | 02de164c6914 | title_screen_restart | 0 | 7 | PASS |
| 67 | g1-mwetkt2e-1w-v7mf7w-failure_restart | 3 | 2348295283 | 48 | 16 | 37 | 0.314 | 70c8fe88a4ee | 8b86ac1e09b9 | failure_restart | 0 | 15 | PASS |
| 68 | g1-mwetkt37-1x-c0xzoz-new_game | 0 | 193243034 | 24 | 8 | 19 | 0.374 | 585fa9e8fc57 | 7e5e5ef827df | new_game | 0 | 16 | PASS |
| 69 | g1-mwetkt3g-1y-trpix7-application_restart | 1 | 2018719700 | 30 | 10 | 25 | 0.448 | bf8e4195d919 | 6f1d94894646 | application_restart | 0 | 7 | PASS |
| 70 | g1-mwetkt3x-1z-v84vnd-title_screen_restart | 2 | 3189532676 | 36 | 12 | 28 | 0.35 | 49a628bc9b61 | 2f7b7688903d | title_screen_restart | 1 | 13 | PASS |
| 71 | g1-mwetkt4c-20-ahvc15-failure_restart | 3 | 2446545680 | 48 | 16 | 32 | 0.204 | 2ea826d6e05b | efc1de0b8ea7 | failure_restart | 0 | 9 | PASS |
| 72 | g1-mwetkt4p-21-b9wrvp-new_game | 0 | 3676499636 | 24 | 8 | 20 | 0.281 | b4e1ca2b4118 | f63f47c8b65f | new_game | 0 | 7 | PASS |
| 73 | g1-mwetkt4y-22-ed41eh-application_restart | 1 | 2395351750 | 30 | 10 | 26 | 0.363 | 082b03829931 | 00841bcb980f | application_restart | 0 | 6 | PASS |
| 74 | g1-mwetkt58-23-155oh8j-title_screen_restart | 2 | 4257140629 | 36 | 12 | 32 | 0.447 | 449f7e335afb | b5cd1ed03095 | title_screen_restart | 0 | 7 | PASS |
| 75 | g1-mwetkt5q-24-1ro1312-failure_restart | 3 | 863763056 | 48 | 16 | 37 | 0.222 | 41e27dadd565 | d63ec376f339 | failure_restart | 0 | 14 | PASS |
| 76 | g1-mwetkt6i-25-4yssm1-new_game | 0 | 4258883063 | 24 | 8 | 24 | 0.252 | 5aa27879e5d9 | 2e4768c0b030 | new_game | 0 | 16 | PASS |
| 77 | g1-mwetkt6r-26-1b47o6k-application_restart | 1 | 1381370251 | 30 | 10 | 26 | 0.409 | 521e8c2d70fe | 8df9cfee92ea | application_restart | 0 | 6 | PASS |
| 78 | g1-mwetkt73-27-et0te2-title_screen_restart | 2 | 2801172497 | 36 | 12 | 33 | 0.496 | d674e6ff0165 | 8108fe548476 | title_screen_restart | 0 | 8 | PASS |
| 79 | g1-mwetkt8b-28-1o6j9yo-failure_restart | 3 | 3697071143 | 48 | 16 | 31 | 0.301 | 211a3c58ac01 | 3fc0528a8691 | failure_restart | 0 | 39 | PASS |
| 80 | g1-mwetkta3-29-ckypr4-new_game | 0 | 2904755782 | 24 | 8 | 15 | 0.343 | e011c3849d52 | e392455f3ff0 | new_game | 0 | 32 | PASS |
| 81 | g1-mwetktab-2a-jc1ubw-application_restart | 1 | 1489591882 | 30 | 10 | 25 | 0.375 | 1aaf50d492c6 | 20854c34639d | application_restart | 0 | 6 | PASS |
| 82 | g1-mwetktam-2b-101t5l3-title_screen_restart | 2 | 2393270382 | 36 | 12 | 32 | 0.386 | e07f50ee107d | bd031606324b | title_screen_restart | 0 | 7 | PASS |
| 83 | g1-mwetktb2-2c-rzd362-failure_restart | 3 | 4229845755 | 48 | 16 | 32 | 0.301 | 74c64af43be1 | 3ec854bbf6d1 | failure_restart | 0 | 12 | PASS |
| 84 | g1-mwetktbk-2d-1xdwahx-new_game | 0 | 3526366176 | 24 | 8 | 15 | 0.496 | e2c43c0183d5 | ead127d77aed | new_game | 0 | 9 | PASS |
| 85 | g1-mwetktbs-2e-ad0i4j-application_restart | 1 | 1039036049 | 30 | 10 | 25 | 0.416 | 9883a3e216a6 | 9bb8e0af7aff | application_restart | 0 | 5 | PASS |
| 86 | g1-mwetktc2-2f-1xo45lv-title_screen_restart | 2 | 1044710790 | 36 | 12 | 32 | 0.256 | 2871ff4e03b3 | a79a67f61744 | title_screen_restart | 0 | 7 | PASS |
| 87 | g1-mwetktch-2g-uu1ic7-failure_restart | 3 | 2996174931 | 48 | 16 | 34 | 0.269 | 0031d3f4193a | fef188d9a986 | failure_restart | 0 | 11 | PASS |
| 88 | g1-mwetktcy-2h-1c3j2y4-new_game | 0 | 920647073 | 24 | 8 | 24 | 0.188 | 910e4a4155e5 | afe26cd4211b | new_game | 0 | 9 | PASS |
| 89 | g1-mwetktd4-2i-1nt2e6y-application_restart | 1 | 1219586110 | 30 | 10 | 21 | 0.488 | d905430523fc | 1ecc213763a7 | application_restart | 0 | 4 | PASS |
| 90 | g1-mwetktdd-2j-14zdqf6-title_screen_restart | 2 | 437870414 | 36 | 12 | 26 | 0.216 | 7c0a8db92d86 | 9e03a92bfcc1 | title_screen_restart | 0 | 6 | PASS |
| 91 | g1-mwetktdr-2k-1l2d9f2-failure_restart | 3 | 3054471580 | 48 | 16 | 37 | 0.321 | dcd502b68ed0 | 70c88b883ff3 | failure_restart | 0 | 11 | PASS |
| 92 | g1-mwetktef-2l-1iruy2v-new_game | 0 | 3504892157 | 24 | 8 | 20 | 0.495 | a8ef35b0b7fa | 9de6e5e8511f | new_game | 0 | 13 | PASS |
| 93 | g1-mwetkten-2m-okx7da-application_restart | 1 | 1920680263 | 30 | 10 | 25 | 0.408 | d1703d76a823 | d88ee7044bae | application_restart | 0 | 6 | PASS |
| 94 | g1-mwetktf5-2n-xwa3qs-title_screen_restart | 2 | 2607038168 | 36 | 12 | 34 | 0.519 | 5bf06d564ed8 | 30db94a242b1 | title_screen_restart | 1 | 14 | PASS |
| 95 | g1-mwetktfy-2o-17p8upv-failure_restart | 3 | 4017869498 | 48 | 16 | 34 | 0.366 | 5a0dd6af7c9a | da7319fdd2e9 | failure_restart | 1 | 25 | PASS |
| 96 | g1-mwetktgf-2p-16gnoa1-new_game | 0 | 1240875661 | 24 | 8 | 24 | 0.452 | 9c1315fd23fd | ee9396d7e240 | new_game | 0 | 9 | PASS |
| 97 | g1-mwetktgl-2q-12h7xz9-application_restart | 1 | 3767454949 | 30 | 10 | 25 | 0.157 | 673f040ea042 | 6500659668f9 | application_restart | 0 | 4 | PASS |
| 98 | g1-mwetktgv-2r-dpbzvh-title_screen_restart | 2 | 4134127633 | 36 | 12 | 26 | 0.395 | 397dd365d278 | b2b98da5793c | title_screen_restart | 0 | 7 | PASS |
| 99 | g1-mwetkthb-2s-z43f06-failure_restart | 3 | 264044650 | 48 | 16 | 34 | 0.385 | 5a5bd85e07ea | 4f05c1d52065 | failure_restart | 0 | 12 | PASS |
| 100 | g1-mwetkthp-2t-17l8z2i-new_game | 0 | 2729760960 | 24 | 8 | 20 | 0.446 | 4f5877cd6b69 | f63f47c8b65f | new_game | 0 | 8 | PASS |

</details>

## 第 2 关 · 100 局

| 项 | 值 |
|---|---|
| 耗时 | 5520 ms |
| 牌数范围 | 192 – 321 |
| 开局可点牌范围 | 19 – 25 |
| 档位分布 | {"0":6,"1":8,"2":10,"3":12,"4":11,"5":5,"6":4,"7":11,"8":13,"9":20} |
| 牌数分布 | {"192":13,"255":20,"261":4,"273":11,"282":8,"291":5,"300":10,"312":23,"321":6} |
| 牌型数分布 | {"13":28,"14":21,"15":39,"16":12} |
| 生成原因分布 | {"application_restart":25,"title_screen_restart":25,"failure_restart":25,"new_game":25} |
| 布局签名去重 | 100 / 100 |
| 最近 10 局模板 ID 重复 | 0 |
| 最近 10 局等价几何签名重复 | 0 |
| 最近 10 局结构签名重复 | 0 |
| 最近 10 局布局签名重复 | 0 |
| 最近 10 局几何签名重复 | 0 |
| 重试次数（失败重试合计） | 4 |
| 生成失败次数 | 0 |
| 滑窗 sim 均值 / P95 / 最大 | 0.2728 / 0.4057 / 0.5977 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 33.43 ms |

<details><summary>完整 100 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | sim最大 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g2-mwetktia-2u-1rgrweu-application_restart | 8 | 3345572752 | 192 | 15 | 19 | 0 | 8a40db35dfb2 | 54b523e3ec83 | application_restart | 0 | 19 | PASS |
| 2 | g2-mwetktjk-2v-e1wze5-title_screen_restart | 2 | 3043719684 | 300 | 14 | 23 | 0.199 | 0b8011031770 | 51f6b9293479 | title_screen_restart | 0 | 35 | PASS |
| 3 | g2-mwetktlb-2w-6k908j-failure_restart | 1 | 296860053 | 282 | 13 | 22 | 0.354 | 9a814a948ceb | 1f2924ab9c1e | failure_restart | 0 | 41 | PASS |
| 4 | g2-mwetktn2-2x-1ajfxmc-new_game | 2 | 3339572734 | 300 | 14 | 23 | 0.4 | 1ddb74d1882e | 14f68dd88ab7 | new_game | 0 | 42 | PASS |
| 5 | g2-mwetktol-2y-dgw0cy-application_restart | 9 | 9007027 | 255 | 15 | 22 | 0.358 | ef359c10255e | 7b6ef15492cb | application_restart | 0 | 28 | PASS |
| 6 | g2-mwetktpy-2z-14alcfg-title_screen_restart | 0 | 295860050 | 321 | 15 | 21 | 0.372 | 37817628e8af | f32df26de948 | title_screen_restart | 0 | 32 | PASS |
| 7 | g2-mwetktrq-30-1w9w2rm-failure_restart | 3 | 2805369295 | 312 | 16 | 19 | 0.473 | 2a733d0d4d3e | 772eea910dda | failure_restart | 0 | 35 | PASS |
| 8 | g2-mwetkttd-31-w6bscw-new_game | 0 | 2175741977 | 321 | 15 | 21 | 0.381 | 659ee5f80217 | f3857a59a099 | new_game | 0 | 34 | PASS |
| 9 | g2-mwetktus-32-1jqkyj6-application_restart | 9 | 2093318137 | 255 | 15 | 22 | 0.418 | 4a8c11d1b9ac | 03499c8e8370 | application_restart | 0 | 26 | PASS |
| 10 | g2-mwetktwa-33-s16k4h-title_screen_restart | 5 | 3103222351 | 291 | 13 | 22 | 0.472 | 4410fae0fc84 | f01249f5a16e | title_screen_restart | 0 | 39 | PASS |
| 11 | g2-mwetkty6-34-oc2aiw-failure_restart | 3 | 3101222345 | 312 | 16 | 22 | 0.48 | cab1f1737582 | c11646a4681c | failure_restart | 0 | 40 | PASS |
| 12 | g2-mwetktzw-35-twqqej-new_game | 0 | 535210442 | 321 | 15 | 20 | 0.361 | 82e13e1d02d5 | 72d5ee26471a | new_game | 0 | 38 | PASS |
| 13 | g2-mwetku1x-36-6wpghv-application_restart | 7 | 2809369307 | 312 | 14 | 23 | 0.369 | 962ea3859de5 | bb50d6b15bfe | application_restart | 0 | 44 | PASS |
| 14 | g2-mwetku3q-37-1l6x37m-title_screen_restart | 1 | 684136970 | 282 | 13 | 22 | 0.291 | 24e8e8c60b5c | e02cb2ffbd5d | title_screen_restart | 0 | 37 | PASS |
| 15 | g2-mwetku55-38-b8mwsg-failure_restart | 4 | 2567018906 | 273 | 13 | 23 | 0.414 | 51836d70ae45 | 0ac92bf3c1a4 | failure_restart | 0 | 32 | PASS |
| 16 | g2-mwetku6d-39-14cvw5b-new_game | 8 | 543210466 | 192 | 15 | 22 | 0.317 | 8241a3ed17bc | ebc7c28e43e5 | new_game | 0 | 25 | PASS |
| 17 | g2-mwetku7i-3a-ur24ek-application_restart | 2 | 3966200043 | 300 | 14 | 25 | 0.323 | 5bbf1656c109 | 4e5a456fe315 | application_restart | 0 | 28 | PASS |
| 18 | g2-mwetku9y-3b-kiw2uz-title_screen_restart | 9 | 1318764303 | 255 | 15 | 20 | 0.36 | f496e612ccaa | 3f6081e86f43 | title_screen_restart | 1 | 65 | PASS |
| 19 | g2-mwetkubn-3c-g7divz-failure_restart | 3 | 2953295820 | 312 | 16 | 23 | 0.457 | 4eb576773092 | e196189c677d | failure_restart | 0 | 40 | PASS |
| 20 | g2-mwetkudh-3d-irbk54-new_game | 4 | 60509670 | 273 | 13 | 23 | 0.43 | b50fdd29a849 | dcefdfce7a4b | new_game | 0 | 37 | PASS |
| 21 | g2-mwetkuez-3e-guagss-application_restart | 9 | 1022911253 | 255 | 15 | 23 | 0.381 | 4d5ea991496b | 36b0b30f9ff8 | application_restart | 0 | 30 | PASS |
| 22 | g2-mwetkugi-3f-mqg5b9-title_screen_restart | 5 | 3969200052 | 291 | 13 | 24 | 0.454 | c5a4b2284e1e | 0a1eabd26906 | title_screen_restart | 0 | 36 | PASS |
| 23 | g2-mwetkuhv-3g-70yrta-failure_restart | 8 | 155933549 | 192 | 15 | 21 | 0.307 | 17f18a308cbe | 6d74c55a6406 | failure_restart | 0 | 25 | PASS |
| 24 | g2-mwetkuiy-3h-160ti05-new_game | 7 | 2182741998 | 312 | 14 | 23 | 0.334 | 9106ba3966aa | 3b94df18c2ba | new_game | 0 | 29 | PASS |
| 25 | g2-mwetkukt-3i-19funlv-application_restart | 9 | 783560861 | 255 | 15 | 24 | 0.368 | e21f6419670a | 6f0faee59810 | application_restart | 1 | 44 | PASS |
| 26 | g2-mwetkulv-3j-8v52f-title_screen_restart | 8 | 1078413908 | 192 | 15 | 24 | 0.496 | ccc2f041f38d | f0219a4f9b4e | title_screen_restart | 0 | 18 | PASS |
| 27 | g2-mwetkums-3k-s78n8x-failure_restart | 9 | 2719945446 | 255 | 15 | 22 | 0.478 | ab6584fc2548 | 855938923bf6 | failure_restart | 0 | 22 | PASS |
| 28 | g2-mwetkuns-3l-a5qz5r-new_game | 8 | 2092318134 | 192 | 15 | 21 | 0.4 | 750c6096f19e | 2b3cd706d4e0 | new_game | 0 | 18 | PASS |
| 29 | g2-mwetkuos-3m-r72b5g-application_restart | 9 | 3198646230 | 255 | 15 | 25 | 0.264 | a18591cf18e5 | 0f16800dea1f | application_restart | 0 | 24 | PASS |
| 30 | g2-mwetkuq6-3n-1v5qaqu-title_screen_restart | 2 | 1790465066 | 300 | 14 | 22 | 0.305 | 556f99fb3ba1 | 87abca520272 | title_screen_restart | 0 | 33 | PASS |
| 31 | g2-mwetkurr-3o-10mcbrn-failure_restart | 7 | 3823273533 | 312 | 14 | 22 | 0.295 | b74c1c312193 | 14753e3a6dcf | failure_restart | 0 | 35 | PASS |
| 32 | g2-mwetkuth-3p-eo9xf0-new_game | 9 | 544210469 | 255 | 15 | 21 | 0.454 | 521157d074dc | 625b116a6898 | new_game | 0 | 37 | PASS |
| 33 | g2-mwetkuv7-3q-195ngb6-application_restart | 1 | 1402188146 | 282 | 13 | 21 | 0.376 | f202f2ffff94 | e546ac5ea5ff | application_restart | 0 | 40 | PASS |
| 34 | g2-mwetkuwk-3r-annkwx-title_screen_restart | 9 | 304860077 | 255 | 15 | 23 | 0.268 | 64859e1e0c34 | 3240a363cc40 | title_screen_restart | 0 | 25 | PASS |
| 35 | g2-mwetkuy1-3s-406koi-failure_restart | 7 | 450786596 | 312 | 14 | 23 | 0.351 | 9d95f7160fd1 | 44f0aa2d60bb | failure_restart | 0 | 35 | PASS |
| 36 | g2-mwetkuzq-3t-29j1pj-new_game | 2 | 4205550435 | 300 | 14 | 25 | 0.354 | 831e0eb55798 | 4ddb818f24cc | new_game | 0 | 35 | PASS |
| 37 | g2-mwetkv13-3u-14pg8vl-application_restart | 6 | 3878776188 | 261 | 13 | 22 | 0.348 | 85ac494b4095 | 47f33cfe7de7 | application_restart | 0 | 27 | PASS |
| 38 | g2-mwetkv27-3v-ss49cl-title_screen_restart | 8 | 1008571490 | 192 | 15 | 22 | 0.397 | 3a2b1b37f63e | 01324f8a3097 | title_screen_restart | 0 | 21 | PASS |
| 39 | g2-mwetkv3c-3w-10qrjcx-failure_restart | 4 | 1940391597 | 273 | 13 | 23 | 0.472 | 614245e4bbce | 35c4deeade31 | failure_restart | 0 | 30 | PASS |
| 40 | g2-mwetkv4z-3x-wj95tr-new_game | 2 | 3043719684 | 300 | 14 | 23 | 0.35 | c9445359a071 | 5778ba98d310 | new_game | 0 | 37 | PASS |
| 41 | g2-mwetkv6b-3y-194uqoh-application_restart | 8 | 2958295835 | 192 | 15 | 20 | 0.349 | aa3827add076 | 0c792195b989 | application_restart | 0 | 25 | PASS |
| 42 | g2-mwetkv8j-3z-1cqgz7b-title_screen_restart | 7 | 4210550450 | 312 | 14 | 22 | 0.351 | 71a29d4be14f | 73e3e7395d60 | title_screen_restart | 1 | 68 | PASS |
| 43 | g2-mwetkvad-40-wa20sp-failure_restart | 4 | 1165837763 | 273 | 13 | 23 | 0.563 | 8c15523c8353 | 140008590833 | failure_restart | 0 | 36 | PASS |
| 44 | g2-mwetkvc7-41-3xjplu-new_game | 2 | 833063498 | 300 | 14 | 25 | 0.507 | 0c929534da4b | 983a8645aea8 | new_game | 0 | 42 | PASS |
| 45 | g2-mwetkvdq-42-pydyp3-application_restart | 4 | 3432996607 | 273 | 13 | 19 | 0.284 | 3ff37cc0d810 | d16f7b91eb3b | application_restart | 0 | 32 | PASS |
| 46 | g2-mwetkvfe-43-1tu3wjj-title_screen_restart | 7 | 3344572749 | 312 | 14 | 19 | 0.367 | 704e8e02ef9c | b59846e3eb77 | title_screen_restart | 0 | 37 | PASS |
| 47 | g2-mwetkvh6-44-uxjvqm-failure_restart | 3 | 2030815461 | 312 | 16 | 23 | 0.471 | 8b88e04ac295 | bfbe3e26d447 | failure_restart | 0 | 37 | PASS |
| 48 | g2-mwetkvj3-45-h4l37h-new_game | 7 | 2034815473 | 312 | 14 | 25 | 0.429 | 8f02409a2cb2 | 6a24b921c3c1 | new_game | 0 | 41 | PASS |
| 49 | g2-mwetkvkx-46-67vfzu-application_restart | 6 | 2569018912 | 261 | 13 | 25 | 0.342 | 60f3598a2bf0 | f93e8b4a8615 | application_restart | 0 | 36 | PASS |
| 50 | g2-mwetkvmg-47-1ylmze7-title_screen_restart | 2 | 537210448 | 300 | 14 | 23 | 0.305 | 247f8b7ac8d8 | ad29d0dee106 | title_screen_restart | 0 | 33 | PASS |
| 51 | g2-mwetkvpi-49-1j272zl-failure_restart | 3 | 2474595036 | 312 | 16 | 19 | 0.334 | b061208ee53b | de36a6c6c41b | failure_restart | 0 | 39 | PASS |
| 52 | g2-mwetkvqz-4a-bfpf8t-new_game | 9 | 452786602 | 255 | 15 | 24 | 0.436 | a53ccb8b3adc | 22b4219bd7fd | new_game | 0 | 28 | PASS |
| 53 | g2-mwetkvsc-4b-ezychf-application_restart | 4 | 4007012 | 273 | 13 | 19 | 0.387 | f1f949db5357 | ad438de077cb | application_restart | 0 | 30 | PASS |
| 54 | g2-mwetkvtu-4c-8bpsqp-title_screen_restart | 1 | 536210445 | 282 | 13 | 23 | 0.408 | 305a9821de18 | 1d986daad8b8 | title_screen_restart | 0 | 33 | PASS |
| 55 | g2-mwetkvv6-4d-1jj0qmi-failure_restart | 4 | 3820273524 | 273 | 13 | 20 | 0.34 | dd23997506b0 | ba5321a9a771 | failure_restart | 0 | 30 | PASS |
| 56 | g2-mwetkvwu-4e-k46zhv-new_game | 3 | 1939391594 | 312 | 16 | 23 | 0.46 | 23e5424a50be | 1576dad3b263 | new_game | 0 | 40 | PASS |
| 57 | g2-mwetkvya-4f-1tdelw1-application_restart | 9 | 3973200064 | 255 | 15 | 23 | 0.378 | 63ef272aba6f | 9dc387a07f03 | application_restart | 0 | 28 | PASS |
| 58 | g2-mwetkvzl-4g-1p66nx1-title_screen_restart | 6 | 1167837769 | 261 | 13 | 19 | 0.506 | d168e13e5173 | 0c1b7343aaab | title_screen_restart | 0 | 29 | PASS |
| 59 | g2-mwetkw0y-4h-1ysrtic-failure_restart | 9 | 1022911253 | 255 | 15 | 19 | 0.406 | 5a3ba6c37067 | d142d792af9c | failure_restart | 0 | 28 | PASS |
| 60 | g2-mwetkw2h-4i-2fj0cc-new_game | 3 | 3101222345 | 312 | 16 | 23 | 0.504 | 814f8572188d | 55e564b00761 | new_game | 0 | 35 | PASS |
| 61 | g2-mwetkw40-4j-1xw4e0q-application_restart | 9 | 3107222363 | 255 | 15 | 19 | 0.416 | 24bd3d34038b | ffb6fb2cc4c7 | application_restart | 0 | 30 | PASS |
| 62 | g2-mwetkw55-4k-1d97uxr-title_screen_restart | 8 | 3275730334 | 192 | 15 | 20 | 0.206 | 6e7fe5f37d49 | 8e1de574f7e8 | title_screen_restart | 0 | 23 | PASS |
| 63 | g2-mwetkw6e-4l-pfo573-failure_restart | 3 | 2713945428 | 312 | 16 | 22 | 0.309 | d39dc8a9154d | d802fb0ed321 | failure_restart | 0 | 33 | PASS |
| 64 | g2-mwetkw82-4m-rummy-new_game | 9 | 544210469 | 255 | 15 | 25 | 0.461 | e77adceb6334 | 9292fef118e3 | new_game | 0 | 33 | PASS |
| 65 | g2-mwetkw9g-4n-dhux9u-application_restart | 1 | 3817273515 | 282 | 13 | 21 | 0.386 | 28e1f9d5a803 | 255d3c9337fd | application_restart | 0 | 28 | PASS |
| 66 | g2-mwetkwav-4o-1ams6bu-title_screen_restart | 5 | 1166837766 | 291 | 13 | 21 | 0.333 | 0e1c1e2c9d6d | 25b84f59e788 | title_screen_restart | 0 | 31 | PASS |
| 67 | g2-mwetkwce-4p-144q12w-failure_restart | 1 | 2564018897 | 282 | 13 | 24 | 0.47 | d74310c0b65f | 67e21ff3ea92 | failure_restart | 0 | 34 | PASS |
| 68 | g2-mwetkwe8-4q-rfzmrp-new_game | 3 | 2326668511 | 312 | 16 | 19 | 0.279 | a7df2fcb0578 | 32755952d310 | new_game | 0 | 41 | PASS |
| 69 | g2-mwetkwfs-4r-vckd6m-application_restart | 4 | 60509670 | 273 | 13 | 19 | 0.372 | d9e76df1aa3b | f20d8b0542d6 | application_restart | 0 | 32 | PASS |
| 70 | g2-mwetkwha-4s-1vlm445-title_screen_restart | 7 | 838063513 | 312 | 14 | 23 | 0.334 | d85987934d16 | 9ec5d42ae4bc | title_screen_restart | 0 | 35 | PASS |
| 71 | g2-mwetkwiz-4t-3oe90y-failure_restart | 6 | 780560852 | 261 | 13 | 24 | 0.439 | e852c3042521 | 7a4f2cfbdda4 | failure_restart | 0 | 37 | PASS |
| 72 | g2-mwetkwki-4u-sle98b-new_game | 2 | 1072413890 | 300 | 14 | 25 | 0.381 | 7a60ff3e4977 | e7f3f1b4cb71 | new_game | 0 | 32 | PASS |
| 73 | g2-mwetkwly-4v-76gx6c-application_restart | 9 | 2424092396 | 255 | 15 | 25 | 0.346 | 3aca241119e9 | eaef5fc1fed3 | application_restart | 0 | 29 | PASS |
| 74 | g2-mwetkwn9-4w-4h96qc-title_screen_restart | 1 | 296860053 | 282 | 13 | 20 | 0.449 | b67f99e6ba97 | 7478aca3fae3 | title_screen_restart | 0 | 27 | PASS |
| 75 | g2-mwetkwoo-4x-1saux3o-failure_restart | 9 | 692136994 | 255 | 15 | 23 | 0.382 | 3cc9cd3ffa43 | e6c7f5cf4c68 | failure_restart | 0 | 30 | PASS |
| 76 | g2-mwetkwq6-4y-1oc8585-new_game | 2 | 2952295817 | 300 | 14 | 23 | 0.447 | 15f8ef69c1cf | e23c170804a7 | new_game | 0 | 38 | PASS |
| 77 | g2-mwetkws0-4z-1il43w1-application_restart | 7 | 929487380 | 312 | 14 | 21 | 0.281 | 1da3612a436a | b98e67bfc460 | application_restart | 0 | 43 | PASS |
| 78 | g2-mwetkwtj-50-819fof-title_screen_restart | 8 | 2296747317 | 192 | 15 | 21 | 0.378 | 81d264ab8487 | b7fb442837ec | title_screen_restart | 0 | 32 | PASS |
| 79 | g2-mwetkwv6-51-11we71t-failure_restart | 0 | 3576923120 | 321 | 15 | 25 | 0.396 | 39a12270766f | f0995571d5c1 | failure_restart | 0 | 39 | PASS |
| 80 | g2-mwetkwww-52-11jmqtq-new_game | 9 | 783560861 | 255 | 15 | 22 | 0.32 | 488aa2f59c35 | 669113456f2c | new_game | 0 | 31 | PASS |
| 81 | g2-mwetkwyf-53-qbi300-application_restart | 0 | 3668346987 | 321 | 15 | 23 | 0.371 | 47223eec4d4d | f976de2983d6 | application_restart | 0 | 40 | PASS |
| 82 | g2-mwetkwzr-54-1j5ty5z-title_screen_restart | 8 | 1522193483 | 192 | 15 | 20 | 0.256 | 57867ab74754 | 880c671ebd0d | title_screen_restart | 0 | 22 | PASS |
| 83 | g2-mwetkx1f-55-10lc4tg-failure_restart | 7 | 4210550450 | 312 | 14 | 23 | 0.598 | 030fc62d2041 | ec0d637223bc | failure_restart | 1 | 50 | PASS |
| 84 | g2-mwetkx2q-56-14ugw78-new_game | 8 | 1099995357 | 192 | 15 | 21 | 0.279 | d8891eeb6b93 | 9fd25b228b95 | new_game | 0 | 22 | PASS |
| 85 | g2-mwetkx3s-57-1tw360b-application_restart | 1 | 2176741980 | 282 | 13 | 23 | 0.303 | 913f20dedbc2 | bdb92dd63a73 | application_restart | 0 | 27 | PASS |
| 86 | g2-mwetkx57-58-1bcjkw3-title_screen_restart | 9 | 4064623931 | 255 | 15 | 23 | 0.378 | b3af79dea1a4 | ed92a0c6abb5 | title_screen_restart | 0 | 28 | PASS |
| 87 | g2-mwetkx6o-59-eci3sf-failure_restart | 5 | 3821273527 | 291 | 13 | 25 | 0.435 | 58e214172fb1 | d84ff585fba8 | failure_restart | 0 | 33 | PASS |
| 88 | g2-mwetkx8b-5a-14qv1h-new_game | 3 | 3967200046 | 312 | 16 | 21 | 0.413 | cb130927d3e6 | 933ab78ff69d | new_game | 0 | 37 | PASS |
| 89 | g2-mwetkx9n-5b-13fa6pe-application_restart | 8 | 621294573 | 192 | 15 | 19 | 0.348 | 76839b05f7b8 | 69eb32a5c55e | application_restart | 0 | 25 | PASS |
| 90 | g2-mwetkxas-5c-1dscqyu-title_screen_restart | 9 | 304860077 | 255 | 15 | 23 | 0.378 | f20221291c9e | 8ef91711a29d | title_screen_restart | 0 | 28 | PASS |
| 91 | g2-mwetkxcb-5d-23bdyr-failure_restart | 7 | 2478595048 | 312 | 14 | 23 | 0.286 | d7d6ee8b9b3c | 50f54b46a934 | failure_restart | 0 | 37 | PASS |
| 92 | g2-mwetkxe2-5e-19dif5o-new_game | 9 | 544210469 | 255 | 15 | 20 | 0.335 | bef1d33b86e3 | 2e7a42b04df3 | new_game | 0 | 33 | PASS |
| 93 | g2-mwetkxff-5f-bvyw4-application_restart | 5 | 3046719693 | 291 | 13 | 20 | 0.325 | ab63fc68fa72 | d634ba122be4 | application_restart | 0 | 32 | PASS |
| 94 | g2-mwetkxh0-5g-o2scpk-title_screen_restart | 3 | 686136976 | 312 | 16 | 21 | 0.578 | cf9d013b2c93 | 87d7aa41034c | title_screen_restart | 0 | 35 | PASS |
| 95 | g2-mwetkxih-5h-tvzhhe-failure_restart | 4 | 3045719690 | 273 | 13 | 25 | 0.29 | 515d6ddf4cba | 0f6c03324edc | failure_restart | 0 | 32 | PASS |
| 96 | g2-mwetkxjt-5i-r4d5eb-new_game | 8 | 3162725018 | 192 | 15 | 21 | 0.416 | 055f864d32db | 10b213e788d1 | new_game | 0 | 26 | PASS |
| 97 | g2-mwetkxld-5j-1ceq4b4-application_restart | 4 | 4007012 | 273 | 13 | 23 | 0.39 | b1db18afd4a5 | ebd78a19943d | application_restart | 0 | 42 | PASS |
| 98 | g2-mwetkxn1-5k-120vfh-title_screen_restart | 3 | 2713945428 | 312 | 16 | 25 | 0.302 | 76d713f1f1b7 | 193115030780 | title_screen_restart | 0 | 38 | PASS |
| 99 | g2-mwetkxoj-5l-hmjvsi-failure_restart | 4 | 1313764288 | 273 | 13 | 23 | 0.414 | 5b9452041d05 | ea1a4d1f4e7b | failure_restart | 0 | 31 | PASS |
| 100 | g2-mwetkxqb-5m-18udx62-new_game | 0 | 774560834 | 321 | 15 | 24 | 0.329 | 51ecfbc8ee6d | 41e7b81da7f0 | new_game | 0 | 42 | PASS |

</details>

## 失败案例与原因

本次运行 **0** 个生成失败案例；每次重试的原因均记录在 `random-generation-report.json` 的逐局 `retries` 字段。

## 测试性质说明

- 运行时：两关各 100 局真实调用 `createNewGame`，真实生成、真实签名、真实校验。
- 相似度：用**真实牌面**两两计算 `layoutSimilarity`（层占位格 Jaccard 均值 ×0.5 + 整体轮廓 Jaccard ×0.5），不是签名比较。
- 静态审计：三种重新开局入口通过读取 `src/main.js` 源码确认全部走统一入口；未冒充浏览器实测。
- 重启模拟：把存档 JSON 写入磁盘再读回，继续生成并验证差异化。
- 浏览器实际运行 / Windows 安装卸载测试不在本文件覆盖范围，见 `FINAL_ACCEPTANCE.md`。
