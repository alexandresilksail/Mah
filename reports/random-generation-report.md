# 连续 200 局随机生成压力测试报告

> 本文件由 `node test-random-generation.js` **真实运行**自动生成，不是静态 PASS 模板。

- 运行时间：2026-11-12T04:14:55.012Z
- Git commit：`f5a578e858ac1acfad42d3adc3c01d9d1eb27f3d`
- 断言：通过 **12881**，失败 **0**
- 总耗时：22300 ms
- 布局签名算法：`MAH-LAYOUT-SIG-v1/SHA-256`（SHA-256，浏览器与 Node 共用同一实现）
- 历史窗口：每关最近 5 局；重复阈值 sim ≥ 0.6；重试上限 50 次

## 全局

| 项 | 值 |
|---|---|
| 总生成局数 | 400 |
| gameId 唯一数 | 402 / 402 |
| 布局签名总数 / 去重 | 400 / 351 |
| 生成失败次数 | 0 |
| 重试总次数 | 317 |
| 平均单局生成耗时 | 28.35 ms |
| 失败案例 | 0 |

## 五局滑动窗口相似度（第 2.4 节）

| 关卡 | 窗口对数 | 均值 | P95 | 最大值 | 阈值 | 判定 |
|---|---|---|---|---|---|---|
| L1 | 985 | 0.4025 | 0.5721 | 0.5995 | 0.6 | ✓ 全部 < 0.60 |
| L2 | 985 | 0.3936 | 0.5420 | 0.5998 | 0.6 | ✓ 全部 < 0.60 |

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

## 第 1 关 · 200 局

| 项 | 值 |
|---|---|
| 耗时 | 10396 ms |
| 牌数范围 | 24 – 48 |
| 开局可点牌范围 | 14 – 35 |
| 档位分布 | {"0":44,"1":49,"2":44,"3":63} |
| 牌数分布 | {"24":44,"30":49,"36":44,"48":63} |
| 牌型数分布 | {"8":44,"10":49,"12":44,"16":63} |
| 生成原因分布 | {"application_restart":50,"title_screen_restart":50,"failure_restart":50,"new_game":50} |
| 布局签名去重 | 200 / 200 |
| 最近 5 局布局签名重复 | 0 |
| 最近 5 局几何签名重复 | 0 |
| 重试次数（失败重试合计） | 276 |
| 生成失败次数 | 0 |
| 滑窗 sim 均值 / P95 / 最大 | 0.4025 / 0.5721 / 0.5995 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 38.77 ms |

<details><summary>完整 200 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | sim最大 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g1-mwd1ak3f-1-vjo45u-application_restart | 2 | 3571800403 | 36 | 12 | 23 | 0 | 96e6512559ee | a0738f062371 | application_restart | 0 | 7 | PASS |
| 2 | g1-mwd1ak57-2-69o6w6-title_screen_restart | 3 | 2233213590 | 48 | 16 | 27 | 0.527 | 2bc039552ef8 | 65b72414c75c | title_screen_restart | 2 | 51 | PASS |
| 3 | g1-mwd1ak7b-3-9hueih-failure_restart | 0 | 1509760187 | 24 | 8 | 21 | 0.345 | 8620baa3f4cc | d3bd915654b4 | failure_restart | 2 | 44 | PASS |
| 4 | g1-mwd1ak7n-4-18hbabq-new_game | 2 | 3804871655 | 36 | 12 | 22 | 0.526 | 3dd2d2d16092 | 2a4ba978aeca | new_game | 0 | 8 | PASS |
| 5 | g1-mwd1ak9n-5-my3f0o-application_restart | 3 | 1276475751 | 48 | 16 | 31 | 0.577 | ab67af02088b | 668bf79be92e | application_restart | 1 | 67 | PASS |
| 6 | g1-mwd1akax-6-1lee7hc-title_screen_restart | 0 | 2522031890 | 24 | 8 | 17 | 0.479 | 34486f14eb7f | 9ff7ea4c246e | title_screen_restart | 0 | 23 | PASS |
| 7 | g1-mwd1akbb-7-15cdvm0-failure_restart | 1 | 3360885582 | 30 | 10 | 21 | 0.572 | 9da2dc581fb8 | 2769918640eb | failure_restart | 1 | 11 | PASS |
| 8 | g1-mwd1akdc-8-12tsb2p-new_game | 3 | 4122207356 | 48 | 16 | 34 | 0.49 | 8b4f8087682b | ae81271f0df9 | new_game | 1 | 69 | PASS |
| 9 | g1-mwd1akgm-9-1tyco24-application_restart | 2 | 2683198637 | 36 | 12 | 22 | 0.519 | c9c9f5caf171 | 999d3778ddd0 | application_restart | 2 | 69 | PASS |
| 10 | g1-mwd1akh5-a-bl4yyv-title_screen_restart | 1 | 219532982 | 30 | 10 | 26 | 0.555 | eb0d8711243b | f5ff7561da26 | title_screen_restart | 0 | 10 | PASS |
| 11 | g1-mwd1akhm-b-tkt2l2-failure_restart | 3 | 1419426967 | 48 | 16 | 24 | 0.542 | 4838201b8e87 | a1b44d6c4194 | failure_restart | 0 | 13 | PASS |
| 12 | g1-mwd1aki8-c-1ij3frf-new_game | 0 | 2613293197 | 24 | 8 | 18 | 0.565 | 637067d6e97f | 3a9858bcb16b | new_game | 0 | 12 | PASS |
| 13 | g1-mwd1akiq-d-1ryubtu-application_restart | 3 | 1724287306 | 48 | 16 | 31 | 0.477 | 09ce3d251e3d | a95a9723ea8c | application_restart | 0 | 15 | PASS |
| 14 | g1-mwd1akjy-e-f328tf-title_screen_restart | 2 | 1252900400 | 36 | 12 | 23 | 0.574 | ebfc5c439594 | 7809c8cee3f1 | title_screen_restart | 3 | 32 | PASS |
| 15 | g1-mwd1akkb-f-12mfwro-failure_restart | 0 | 3067474546 | 24 | 8 | 15 | 0.456 | 5c9ae31d576f | 360ab63824e4 | failure_restart | 0 | 8 | PASS |
| 16 | g1-mwd1akkl-g-19djbq1-new_game | 1 | 4075582967 | 30 | 10 | 25 | 0.372 | 5fb52c496b12 | 8d0608e41248 | new_game | 1 | 8 | PASS |
| 17 | g1-mwd1akmg-h-1mgkz0o-application_restart | 3 | 4241650282 | 48 | 16 | 27 | 0.572 | 71f2c292c1ef | 25b8dc27850f | application_restart | 0 | 64 | PASS |
| 18 | g1-mwd1akq4-i-fdpb4c-title_screen_restart | 1 | 1195883652 | 30 | 10 | 23 | 0.552 | 658fea6d96a3 | c69eb1d05843 | title_screen_restart | 1 | 78 | PASS |
| 19 | g1-mwd1akqf-j-10lvp1y-failure_restart | 2 | 348067700 | 36 | 12 | 22 | 0.568 | 0d7201026529 | e576f77b4532 | failure_restart | 0 | 7 | PASS |
| 20 | g1-mwd1akqq-k-1gh03x5-new_game | 0 | 649137971 | 24 | 8 | 15 | 0.564 | c5af5937591b | 7d545a9910f9 | new_game | 0 | 7 | PASS |
| 21 | g1-mwd1aks1-l-yddi8q-application_restart | 3 | 736106473 | 48 | 16 | 30 | 0.529 | c4d743cf821e | 95ccc86fc903 | application_restart | 2 | 45 | PASS |
| 22 | g1-mwd1aktr-m-tdrmtd-title_screen_restart | 2 | 4238105737 | 36 | 12 | 27 | 0.521 | 05aaa280d930 | cc8c84d10252 | title_screen_restart | 0 | 29 | PASS |
| 23 | g1-mwd1akul-n-1m8hn2h-failure_restart | 3 | 1815613544 | 48 | 16 | 27 | 0.592 | cbb41d0f87f9 | 20c02b7b94ec | failure_restart | 2 | 24 | PASS |
| 24 | g1-mwd1akvc-o-15403oh-new_game | 1 | 2015442973 | 30 | 10 | 21 | 0.462 | 1a85d73f9af5 | 65361cd18faf | new_game | 0 | 13 | PASS |
| 25 | g1-mwd1akw6-p-1j93m36-application_restart | 3 | 966919329 | 48 | 16 | 35 | 0.492 | 3bd45d652ab9 | f3829a3e407c | application_restart | 1 | 27 | PASS |
| 26 | g1-mwd1akxp-q-fwllr7-title_screen_restart | 0 | 1332074775 | 24 | 8 | 19 | 0.395 | 107c5afa95ca | 37e8f227d338 | title_screen_restart | 4 | 37 | PASS |
| 27 | g1-mwd1al02-r-88xpeg-failure_restart | 2 | 489804646 | 36 | 12 | 22 | 0.587 | 99e64c7f4693 | 7e23f52942d0 | failure_restart | 2 | 81 | PASS |
| 28 | g1-mwd1al0j-s-k1uzi1-new_game | 0 | 2282055264 | 24 | 8 | 20 | 0.532 | 3ebce5d11c33 | 25f9c07cf234 | new_game | 0 | 10 | PASS |
| 29 | g1-mwd1al3b-t-hwj2ot-application_restart | 3 | 1578131125 | 48 | 16 | 33 | 0.561 | e60bb1729534 | b37b5c8ffddc | application_restart | 0 | 99 | PASS |
| 30 | g1-mwd1al8s-u-153tr51-title_screen_restart | 1 | 77917131 | 30 | 10 | 26 | 0.522 | 09e2c1d56004 | 6b05f8fe479f | title_screen_restart | 0 | 97 | PASS |
| 31 | g1-mwd1al9i-v-j5y8oi-failure_restart | 3 | 3882675498 | 48 | 16 | 34 | 0.543 | 37ef0982a979 | 5ca161c06c5b | failure_restart | 1 | 22 | PASS |
| 32 | g1-mwd1alal-w-1jtvbgi-new_game | 1 | 986288008 | 30 | 10 | 23 | 0.54 | a0774b617379 | 220123667349 | new_game | 0 | 20 | PASS |
| 33 | g1-mwd1alas-x-1ym15lj-application_restart | 0 | 1613748380 | 24 | 8 | 14 | 0.426 | b8f557fb5ab5 | cefc30618496 | application_restart | 0 | 4 | PASS |
| 34 | g1-mwd1albf-y-lhxv6p-title_screen_restart | 3 | 4220588601 | 48 | 16 | 31 | 0.595 | db5e59212376 | e90e910a2005 | title_screen_restart | 1 | 21 | PASS |
| 35 | g1-mwd1alde-z-3nnk96-failure_restart | 1 | 3877611877 | 30 | 10 | 21 | 0.565 | a95bbca58ec1 | 3639a47ea595 | failure_restart | 11 | 57 | PASS |
| 36 | g1-mwd1ale9-10-wo0478-new_game | 3 | 3724249024 | 48 | 16 | 34 | 0.448 | 7e8a67525522 | f9691dac5dfb | new_game | 1 | 28 | PASS |
| 37 | g1-mwd1alfq-11-bobdk0-application_restart | 0 | 1841165020 | 24 | 8 | 20 | 0.459 | 1e7bd8505c0f | 6be990921a41 | application_restart | 0 | 28 | PASS |
| 38 | g1-mwd1alfy-12-18kxb32-title_screen_restart | 1 | 77676139 | 30 | 10 | 23 | 0.528 | d55cc8503133 | 80cd460b1e19 | title_screen_restart | 0 | 6 | PASS |
| 39 | g1-mwd1alhk-13-dnpqdw-failure_restart | 0 | 2525479463 | 24 | 8 | 20 | 0.515 | 20ef824d7d9a | ab8916ad723c | failure_restart | 3 | 55 | PASS |
| 40 | g1-mwd1alhz-14-sfjq7n-new_game | 3 | 1419845054 | 48 | 16 | 32 | 0.566 | a3530cb56a00 | e0d42c8e2f62 | new_game | 0 | 12 | PASS |
| 41 | g1-mwd1alii-15-kzz4m9-application_restart | 1 | 1687992833 | 30 | 10 | 21 | 0.529 | 9b982f0a31c2 | 7a9be07206ab | application_restart | 0 | 11 | PASS |
| 42 | g1-mwd1alkc-16-a8w3dt-title_screen_restart | 3 | 2836629112 | 48 | 16 | 33 | 0.454 | d994baf7817a | 889d0518869c | title_screen_restart | 0 | 64 | PASS |
| 43 | g1-mwd1alnp-17-1wtkpde-failure_restart | 0 | 50250185 | 24 | 8 | 16 | 0.461 | e7b7b3e2755d | e07f594430bf | failure_restart | 3 | 70 | PASS |
| 44 | g1-mwd1alnx-18-171htb-new_game | 1 | 1431214807 | 30 | 10 | 26 | 0.567 | bc05de6ac9ec | 859ce7679445 | new_game | 0 | 5 | PASS |
| 45 | g1-mwd1aloo-19-v9om8r-application_restart | 3 | 2328749884 | 48 | 16 | 26 | 0.568 | e51c0e3bd52a | b7f0a5a3c257 | application_restart | 0 | 24 | PASS |
| 46 | g1-mwd1alpv-1a-1ck78hv-title_screen_restart | 1 | 1761966863 | 30 | 10 | 21 | 0.545 | e5255d52bc01 | 194d7b74124e | title_screen_restart | 0 | 23 | PASS |
| 47 | g1-mwd1alqg-1b-1o213kt-failure_restart | 2 | 2882049216 | 36 | 12 | 22 | 0.555 | c862ddea7437 | f2d1fcb5e7c7 | failure_restart | 1 | 17 | PASS |
| 48 | g1-mwd1alrt-1c-1at43nh-new_game | 3 | 4000311857 | 48 | 16 | 30 | 0.585 | f85a97c76994 | 9b6509ef35fe | new_game | 0 | 37 | PASS |
| 49 | g1-mwd1altf-1d-1wuyap2-application_restart | 0 | 1833086224 | 24 | 8 | 20 | 0.522 | 684779933bf8 | 4e53659b1484 | application_restart | 2 | 33 | PASS |
| 50 | g1-mwd1alv0-1e-7oqch7-title_screen_restart | 2 | 2190559256 | 36 | 12 | 27 | 0.527 | 88e58a7f9107 | c2a8213d5846 | title_screen_restart | 3 | 54 | PASS |
| 51 | g1-mwd1alw4-1f-1u8rqej-failure_restart | 0 | 114905810 | 24 | 8 | 16 | 0.564 | 8695c00c4214 | 5cc029a09c37 | failure_restart | 0 | 22 | PASS |
| 52 | g1-mwd1alwc-1g-axdv7i-new_game | 1 | 31457154 | 30 | 10 | 22 | 0.532 | 265832b52ebd | 760844bd9c60 | new_game | 0 | 5 | PASS |
| 53 | g1-mwd1alxg-1h-1d7ewk0-application_restart | 3 | 730790115 | 48 | 16 | 35 | 0.557 | 217d3c781320 | 479e4825d801 | application_restart | 4 | 36 | PASS |
| 54 | g1-mwd1alyt-1i-op16di-title_screen_restart | 0 | 2101437414 | 24 | 8 | 15 | 0.485 | 78e361000119 | 358e2ad82d6c | title_screen_restart | 0 | 27 | PASS |
| 55 | g1-mwd1am12-1j-u9s0gm-failure_restart | 3 | 1601609708 | 48 | 16 | 27 | 0.446 | e4be3d75671d | 332dc298ac9a | failure_restart | 0 | 77 | PASS |
| 56 | g1-mwd1am4r-1k-6djaob-new_game | 2 | 3375989653 | 36 | 12 | 23 | 0.556 | b370a7688862 | 4cca212dcc11 | new_game | 2 | 66 | PASS |
| 57 | g1-mwd1am54-1l-16rw86y-application_restart | 1 | 152974280 | 30 | 10 | 21 | 0.552 | ecb9cb98e269 | 106d3bff7393 | application_restart | 0 | 7 | PASS |
| 58 | g1-mwd1am62-1m-kopj9m-title_screen_restart | 3 | 2449142817 | 48 | 16 | 30 | 0.542 | a99949988e9f | 68f3fd877134 | title_screen_restart | 1 | 33 | PASS |
| 59 | g1-mwd1am70-1n-4hq6yx-failure_restart | 1 | 281816849 | 30 | 10 | 25 | 0.481 | 867a327b6e18 | 7709295919df | failure_restart | 1 | 21 | PASS |
| 60 | g1-mwd1am7s-1o-v7j7n9-new_game | 3 | 1231776335 | 48 | 16 | 34 | 0.535 | e1514f2830fc | 14afbdad9443 | new_game | 0 | 24 | PASS |
| 61 | g1-mwd1am94-1p-1hkx0o4-application_restart | 1 | 2267998632 | 30 | 10 | 21 | 0.573 | d73c97549146 | fe842a38bdee | application_restart | 3 | 31 | PASS |
| 62 | g1-mwd1am9i-1q-1dhongx-title_screen_restart | 3 | 1246050929 | 48 | 16 | 24 | 0.438 | 6a02e814c296 | fdd3e3e2698d | title_screen_restart | 0 | 10 | PASS |
| 63 | g1-mwd1ama5-1r-1shwkl2-failure_restart | 0 | 2654624849 | 24 | 8 | 20 | 0.58 | 99c5ff45f131 | 4425429bc468 | failure_restart | 2 | 16 | PASS |
| 64 | g1-mwd1amae-1s-1py0ty3-new_game | 2 | 1244988058 | 36 | 12 | 23 | 0.589 | ba991de6d5b4 | b654a35397db | new_game | 0 | 7 | PASS |
| 65 | g1-mwd1ambf-1t-wlzd24-application_restart | 3 | 2464878961 | 48 | 16 | 32 | 0.502 | 38fb0098fa2f | 7c62799de779 | application_restart | 1 | 32 | PASS |
| 66 | g1-mwd1amct-1u-ljfdwz-title_screen_restart | 0 | 571305198 | 24 | 8 | 17 | 0.485 | 6442a18fd960 | 53b00b3e8b91 | title_screen_restart | 0 | 27 | PASS |
| 67 | g1-mwd1amdc-1v-10jpvzl-failure_restart | 1 | 3721206364 | 30 | 10 | 27 | 0.539 | ce8d48363a51 | 0805661b5847 | failure_restart | 1 | 15 | PASS |
| 68 | g1-mwd1amfa-1w-1aeqbk5-new_game | 3 | 1545851711 | 48 | 16 | 33 | 0.57 | 4d7f546c222b | e274a1b2a692 | new_game | 1 | 66 | PASS |
| 69 | g1-mwd1amio-1x-1a70aij-application_restart | 2 | 3349498923 | 36 | 12 | 22 | 0.488 | ff10a9e9fcbd | 3c67e216d2f7 | application_restart | 3 | 70 | PASS |
| 70 | g1-mwd1amlc-1y-6mygs-title_screen_restart | 3 | 3386246661 | 48 | 16 | 26 | 0.538 | 324ee3845d15 | ac77168a82a7 | title_screen_restart | 1 | 83 | PASS |
| 71 | g1-mwd1amp9-1z-up8hcq-failure_restart | 1 | 1327128236 | 30 | 10 | 20 | 0.523 | 2ef14692e085 | 76cc0f379419 | failure_restart | 3 | 77 | PASS |
| 72 | g1-mwd1ampk-20-lh0ktr-new_game | 2 | 3610111405 | 36 | 12 | 22 | 0.491 | 737dfd9a14a1 | 9231e05bd36e | new_game | 0 | 7 | PASS |
| 73 | g1-mwd1amqz-21-rehayz-application_restart | 0 | 1827820102 | 24 | 8 | 15 | 0.572 | 245b780eb736 | ce0552bb120a | application_restart | 3 | 48 | PASS |
| 74 | g1-mwd1amrk-22-lu1w1g-title_screen_restart | 1 | 2511217225 | 30 | 10 | 27 | 0.52 | 55e03260fe68 | fe6bc12489b7 | title_screen_restart | 3 | 18 | PASS |
| 75 | g1-mwd1amrz-23-mfy3me-failure_restart | 0 | 2038281239 | 24 | 8 | 19 | 0.575 | b27b46dd93a5 | bd220be98a2f | failure_restart | 2 | 12 | PASS |
| 76 | g1-mwd1amsa-24-18ryxp3-new_game | 1 | 704162005 | 30 | 10 | 21 | 0.558 | 8097be63a281 | c7cc40e0eb57 | new_game | 1 | 8 | PASS |
| 77 | g1-mwd1amta-25-1x194rx-application_restart | 3 | 1587417698 | 48 | 16 | 29 | 0.56 | b5db5b197d9b | 8b49a30718af | application_restart | 2 | 34 | PASS |
| 78 | g1-mwd1amu7-26-bz0boo-title_screen_restart | 2 | 354706054 | 36 | 12 | 23 | 0.485 | 16f9cbe3833e | 20fbbe2eaf32 | title_screen_restart | 3 | 21 | PASS |
| 79 | g1-mwd1amyl-27-iikoxb-failure_restart | 3 | 3595329472 | 48 | 16 | 28 | 0.505 | 506336c2593b | 5deb40623423 | failure_restart | 0 | 154 | PASS |
| 80 | g1-mwd1an5b-28-12um5jp-new_game | 0 | 2583385412 | 24 | 8 | 14 | 0.528 | 7d0fa4075e83 | a32c8cfe5281 | new_game | 0 | 124 | PASS |
| 81 | g1-mwd1an65-29-155291w-application_restart | 3 | 241098921 | 48 | 16 | 32 | 0.544 | f83ac9d059d2 | e5d6d2ceedaf | application_restart | 0 | 28 | PASS |
| 82 | g1-mwd1an7j-2a-lgjctb-title_screen_restart | 2 | 3838717904 | 36 | 12 | 27 | 0.594 | fb83a7fd3cae | 8ebb852c6701 | title_screen_restart | 0 | 28 | PASS |
| 83 | g1-mwd1an7z-2b-muzuwn-failure_restart | 3 | 2959290699 | 48 | 16 | 27 | 0.49 | e3eea3e516a8 | b0437d9bbd3a | failure_restart | 1 | 13 | PASS |
| 84 | g1-mwd1an8e-2c-1o7255s-new_game | 0 | 3776325787 | 24 | 8 | 20 | 0.54 | 06eb99edf06a | 144d4b3e8b6b | new_game | 0 | 8 | PASS |
| 85 | g1-mwd1anak-2d-7h8jho-application_restart | 1 | 246635883 | 30 | 10 | 22 | 0.527 | 5b95fab572f7 | c2bc1eb37df2 | application_restart | 3 | 76 | PASS |
| 86 | g1-mwd1anat-2e-14nsiwm-title_screen_restart | 0 | 3075467310 | 24 | 8 | 15 | 0.441 | 98226b7171d6 | 8958fc95dd58 | title_screen_restart | 0 | 5 | PASS |
| 87 | g1-mwd1anbs-2f-1fdmb46-failure_restart | 3 | 4178377939 | 48 | 16 | 30 | 0.573 | cb2e1413dcd7 | cf3ce34be621 | failure_restart | 2 | 33 | PASS |
| 88 | g1-mwd1and4-2g-184e1ls-new_game | 2 | 1348625275 | 36 | 12 | 23 | 0.487 | a73832361c49 | a0de596f0272 | new_game | 9 | 38 | PASS |
| 89 | g1-mwd1andd-2h-1skhko-application_restart | 1 | 2464466479 | 30 | 10 | 27 | 0.593 | 25705b4f2b56 | 823ce34b84ae | application_restart | 0 | 5 | PASS |
| 90 | g1-mwd1anis-2i-2tijm6-title_screen_restart | 0 | 3974915951 | 24 | 8 | 15 | 0.497 | 026788957236 | 7b1e649e0e4e | title_screen_restart | 3 | 192 | PASS |
| 91 | g1-mwd1anj2-2j-1lg6d3y-failure_restart | 1 | 3565812396 | 30 | 10 | 21 | 0.523 | 0a2d6b5579aa | 3b6d3ae7e212 | failure_restart | 1 | 8 | PASS |
| 92 | g1-mwd1anq7-2k-13w9wzh-new_game | 3 | 507855820 | 48 | 16 | 29 | 0.583 | 5ea0c449832e | 93f70f67c132 | new_game | 7 | 253 | PASS |
| 93 | g1-mwd1anx6-2l-1rszb56-application_restart | 2 | 1291863253 | 36 | 12 | 21 | 0.482 | 0400ff1aeff0 | e20849848325 | application_restart | 0 | 137 | PASS |
| 94 | g1-mwd1anyh-2m-zjxsa1-title_screen_restart | 0 | 1120274118 | 24 | 8 | 15 | 0.572 | b5e8ef308b08 | 7d545a9910f9 | title_screen_restart | 5 | 34 | PASS |
| 95 | g1-mwd1anyt-2n-1yn84gp-failure_restart | 2 | 1928057475 | 36 | 12 | 26 | 0.512 | 265d173a5684 | ee6ff115d60a | failure_restart | 0 | 9 | PASS |
| 96 | g1-mwd1ao0q-2o-m2dxrx-new_game | 0 | 3526346502 | 24 | 8 | 19 | 0.56 | eb4eaf908780 | 7de51aacf0bb | new_game | 5 | 61 | PASS |
| 97 | g1-mwd1ao12-2p-1k60rcp-application_restart | 3 | 3780381508 | 48 | 16 | 28 | 0.592 | 3192575431e0 | 4d5d3a76a319 | application_restart | 0 | 10 | PASS |
| 98 | g1-mwd1ao21-2q-1h22hek-title_screen_restart | 1 | 2901503201 | 30 | 10 | 20 | 0.572 | c44fbce89dcf | efecb4320237 | title_screen_restart | 6 | 27 | PASS |
| 99 | g1-mwd1ao2j-2r-1jyja56-failure_restart | 3 | 3306839185 | 48 | 16 | 31 | 0.449 | bbe451e3e194 | 8a985fa21c9e | failure_restart | 0 | 14 | PASS |
| 100 | g1-mwd1ao3d-2s-1r5hpzg-new_game | 2 | 3186990823 | 36 | 12 | 22 | 0.533 | 73b21c0024ee | 3728cc9609e2 | new_game | 0 | 20 | PASS |
| 101 | g1-mwd1ao6c-2u-1ojg5rx-application_restart | 0 | 633229668 | 24 | 8 | 15 | 0.523 | 4a64531d8f2e | a24bf67b864a | application_restart | 4 | 30 | PASS |
| 102 | g1-mwd1ao92-2v-1olxpo3-title_screen_restart | 3 | 589541708 | 48 | 16 | 30 | 0.587 | 4439132d21e4 | 985198c8747a | title_screen_restart | 1 | 95 | PASS |
| 103 | g1-mwd1aoa5-2w-jkqesk-failure_restart | 1 | 2696726644 | 30 | 10 | 26 | 0.491 | a1c6666cfb66 | 08518df0a7f6 | failure_restart | 1 | 24 | PASS |
| 104 | g1-mwd1aoao-2x-14exuav-new_game | 0 | 2619525861 | 24 | 8 | 20 | 0.575 | f5aaa427b0bb | 1bb6efcd0900 | new_game | 2 | 15 | PASS |
| 105 | g1-mwd1aokn-2y-147o5yl-application_restart | 2 | 2289470067 | 36 | 12 | 22 | 0.445 | 1ad5b51b2b1a | 60d71b0832c1 | application_restart | 12 | 356 | PASS |
| 106 | g1-mwd1aokz-2z-1lqa9da-title_screen_restart | 1 | 1110602758 | 30 | 10 | 23 | 0.519 | 04d85d4d8d8c | dfd890ff2990 | title_screen_restart | 1 | 8 | PASS |
| 107 | g1-mwd1aol7-30-1yg7f3p-failure_restart | 2 | 1518462306 | 36 | 12 | 22 | 0.552 | cf567a8b6eb7 | ecee336db981 | failure_restart | 0 | 6 | PASS |
| 108 | g1-mwd1aole-31-1d7f80v-new_game | 0 | 2624001262 | 24 | 8 | 15 | 0.575 | 579f90218ba9 | 4ce4d8679ca9 | new_game | 0 | 4 | PASS |
| 109 | g1-mwd1aolk-32-vfbqyv-application_restart | 1 | 2490491098 | 30 | 10 | 26 | 0.531 | 015f293034d5 | 8804c5870f5e | application_restart | 0 | 4 | PASS |
| 110 | g1-mwd1aomd-33-172s0f9-title_screen_restart | 3 | 193205202 | 48 | 16 | 31 | 0.493 | c48afca8492e | e9fda8c84f80 | title_screen_restart | 0 | 27 | PASS |
| 111 | g1-mwd1aoo1-34-p9osv3-failure_restart | 2 | 3972937169 | 36 | 12 | 23 | 0.506 | 9bd65fd6e645 | 68260c9c24e3 | failure_restart | 2 | 35 | PASS |
| 112 | g1-mwd1aoo9-35-hch6ba-new_game | 0 | 3158914434 | 24 | 8 | 20 | 0.541 | 5e873d037f85 | b2f75a211f7a | new_game | 0 | 4 | PASS |
| 113 | g1-mwd1aorb-36-1ic1wuc-application_restart | 2 | 3293362533 | 36 | 12 | 24 | 0.469 | 4c4a8e75ccad | 1e0738b5a3a0 | application_restart | 1 | 108 | PASS |
| 114 | g1-mwd1aoru-37-1ti6sal-title_screen_restart | 1 | 4292585241 | 30 | 10 | 20 | 0.547 | 2c3871210bca | 696d62ce023d | title_screen_restart | 0 | 11 | PASS |
| 115 | g1-mwd1aov1-38-4urjr7-failure_restart | 3 | 1953370921 | 48 | 16 | 32 | 0.587 | d16f40bb5e3a | 16f349d8de0c | failure_restart | 6 | 112 | PASS |
| 116 | g1-mwd1aowd-39-95m5ny-new_game | 2 | 2655273762 | 36 | 12 | 26 | 0.508 | 7c6ebc16b0c2 | 415a6e052b3f | new_game | 1 | 28 | PASS |
| 117 | g1-mwd1aox7-3a-17lie34-application_restart | 3 | 3767963858 | 48 | 16 | 35 | 0.543 | 7fb7ae4d5c1e | 0c2328551d52 | application_restart | 1 | 26 | PASS |
| 118 | g1-mwd1aoy7-3b-17zxmdr-title_screen_restart | 1 | 2025662546 | 30 | 10 | 25 | 0.589 | 0d0f5d2ac60c | 0fc67ccde658 | title_screen_restart | 0 | 20 | PASS |
| 119 | g1-mwd1aoyh-3c-xi7xl9-failure_restart | 2 | 1060175597 | 36 | 12 | 24 | 0.51 | 5ab38cc57fed | eb2f58f6e1b9 | failure_restart | 0 | 6 | PASS |
| 120 | g1-mwd1aoys-3d-1ec92t4-new_game | 0 | 1314835221 | 24 | 8 | 14 | 0.495 | dc18d3de00bb | 1b79136049b4 | new_game | 0 | 7 | PASS |
| 121 | g1-mwd1ap0b-3e-x5fjj8-application_restart | 3 | 3291686176 | 48 | 16 | 27 | 0.42 | 5fa611e796b9 | 834381e78471 | application_restart | 0 | 52 | PASS |
| 122 | g1-mwd1ap3j-3f-35fyrg-title_screen_restart | 2 | 2067291688 | 36 | 12 | 23 | 0.589 | b0498710a5f9 | 77684d9b68c0 | title_screen_restart | 2 | 66 | PASS |
| 123 | g1-mwd1ap3y-3g-1m3fsf5-failure_restart | 1 | 809838903 | 30 | 10 | 21 | 0.566 | 76cec51d13e1 | b7796682bc5b | failure_restart | 1 | 10 | PASS |
| 124 | g1-mwd1ap68-3h-1ex63ql-new_game | 3 | 499000874 | 48 | 16 | 33 | 0.378 | c2803c120c5e | 348b3aae4998 | new_game | 1 | 80 | PASS |
| 125 | g1-mwd1ap7o-3i-ijgqe1-application_restart | 2 | 248903128 | 36 | 12 | 23 | 0.444 | 69c28e0d8af6 | b38abb528138 | application_restart | 1 | 30 | PASS |
| 126 | g1-mwd1ap85-3j-wy108w-title_screen_restart | 3 | 3239956868 | 48 | 16 | 28 | 0.536 | 173690cb7c6e | c62012f38c65 | title_screen_restart | 1 | 12 | PASS |
| 127 | g1-mwd1ap8h-3k-446u5z-failure_restart | 1 | 3171084947 | 30 | 10 | 22 | 0.554 | 7e8dd892a628 | 05f795f18511 | failure_restart | 0 | 7 | PASS |
| 128 | g1-mwd1ap8p-3l-1vz8lhy-new_game | 2 | 2689141373 | 36 | 12 | 25 | 0.555 | b08a8c3243d4 | 1b5edf9016ad | new_game | 0 | 5 | PASS |
| 129 | g1-mwd1apbe-3m-1hhs3si-application_restart | 3 | 1911407421 | 48 | 16 | 24 | 0.594 | a874790888f3 | 5317628fc98e | application_restart | 0 | 94 | PASS |
| 130 | g1-mwd1apgh-3n-1l2m5cr-title_screen_restart | 2 | 4231006108 | 36 | 12 | 22 | 0.525 | a24fe2584c5f | 4d8eec44694b | title_screen_restart | 0 | 97 | PASS |
| 131 | g1-mwd1apjw-3o-3qahfb-failure_restart | 3 | 1782522076 | 48 | 16 | 31 | 0.467 | f53210f77591 | f7e64b49850d | failure_restart | 1 | 119 | PASS |
| 132 | g1-mwd1apkn-3p-1uikxbk-new_game | 2 | 1451788401 | 36 | 12 | 26 | 0.508 | fe4742067ee6 | c0b059a3efbf | new_game | 0 | 14 | PASS |
| 133 | g1-mwd1apkw-3q-gjhjyo-application_restart | 0 | 4041861612 | 24 | 8 | 21 | 0.525 | 21f77d8b563d | 7a333adac3fd | application_restart | 0 | 5 | PASS |
| 134 | g1-mwd1apl5-3r-rh8d3x-title_screen_restart | 2 | 2259783617 | 36 | 12 | 24 | 0.559 | 126ce9bc626b | b5cd10501a9a | title_screen_restart | 1 | 7 | PASS |
| 135 | g1-mwd1aplp-3s-1b91xv-failure_restart | 3 | 2752979453 | 48 | 16 | 26 | 0.536 | 5b7c563c90e6 | 76d46c176532 | failure_restart | 0 | 16 | PASS |
| 136 | g1-mwd1apmp-3t-t2dyi8-new_game | 1 | 670874338 | 30 | 10 | 24 | 0.563 | a4215921e461 | 53dcd50798c8 | new_game | 3 | 24 | PASS |
| 137 | g1-mwd1apn7-3u-mkr7jv-application_restart | 2 | 1689106199 | 36 | 12 | 23 | 0.597 | d6333cba668e | 1ffb2245572b | application_restart | 1 | 16 | PASS |
| 138 | g1-mwd1apnt-3v-89ed8y-title_screen_restart | 1 | 2313756345 | 30 | 10 | 22 | 0.488 | 231a59dc24ba | 265a5e3d8bb3 | title_screen_restart | 2 | 15 | PASS |
| 139 | g1-mwd1apo6-3w-tm67f0-failure_restart | 3 | 3355894116 | 48 | 16 | 34 | 0.533 | e63088e450eb | 956e2e876fea | failure_restart | 0 | 9 | PASS |
| 140 | g1-mwd1apol-3x-16929pt-new_game | 0 | 1247166065 | 24 | 8 | 15 | 0.572 | 2957bfe5ee4b | 3058e124c6ad | new_game | 1 | 9 | PASS |
| 141 | g1-mwd1apor-3y-1uzc4m9-application_restart | 1 | 3338359056 | 30 | 10 | 25 | 0.564 | 32bef9e1f238 | 89e22d737dff | application_restart | 0 | 4 | PASS |
| 142 | g1-mwd1app5-3z-160jydc-title_screen_restart | 2 | 1275168938 | 36 | 12 | 21 | 0.55 | 7ce55e99d8bb | 2d9a7285af56 | title_screen_restart | 0 | 12 | PASS |
| 143 | g1-mwd1apq3-40-11ep4ha-failure_restart | 3 | 2415489696 | 48 | 16 | 29 | 0.576 | e2f208fd8e03 | c89a490bc984 | failure_restart | 2 | 24 | PASS |
| 144 | g1-mwd1aprq-41-5xrqz0-new_game | 2 | 704524761 | 36 | 12 | 24 | 0.58 | 4169f1796476 | 47dec76fb913 | new_game | 11 | 48 | PASS |
| 145 | g1-mwd1aps8-42-1l16ehs-application_restart | 0 | 2992519279 | 24 | 8 | 16 | 0.403 | 9cede5554ce7 | d4de076767d0 | application_restart | 4 | 14 | PASS |
| 146 | g1-mwd1apv3-43-1kw00wx-title_screen_restart | 3 | 2833829760 | 48 | 16 | 32 | 0.594 | f4bc5070f64c | de172181cfee | title_screen_restart | 9 | 102 | PASS |
| 147 | g1-mwd1apwr-44-stqvte-failure_restart | 0 | 3334509163 | 24 | 8 | 15 | 0.556 | 37b6db6c3170 | 15b0f50509d5 | failure_restart | 4 | 37 | PASS |
| 148 | g1-mwd1apwy-45-58yurk-new_game | 1 | 4141951853 | 30 | 10 | 26 | 0.493 | e8ad14f92ab1 | 90dfa208c779 | new_game | 0 | 4 | PASS |
| 149 | g1-mwd1apxj-46-1xlrg7-application_restart | 3 | 3760262692 | 48 | 16 | 29 | 0.529 | 28858832af36 | 5fccc8d1097f | application_restart | 3 | 17 | PASS |
| 150 | g1-mwd1apy8-47-10w3m4p-title_screen_restart | 2 | 3664567334 | 36 | 12 | 21 | 0.498 | 01cb4d9ef2b6 | bc53dd5b110a | title_screen_restart | 0 | 15 | PASS |
| 151 | g1-mwd1aq0i-48-dplo13-failure_restart | 1 | 1879398776 | 30 | 10 | 22 | 0.566 | bf0f31cf887f | 224c956a4f07 | failure_restart | 9 | 76 | PASS |
| 152 | g1-mwd1aq10-49-w6o07g-new_game | 0 | 318108539 | 24 | 8 | 20 | 0.593 | 0a9e702d6fb8 | 1733ee0df84b | new_game | 1 | 16 | PASS |
| 153 | g1-mwd1aq1b-4a-1ls6tya-application_restart | 3 | 913701379 | 48 | 16 | 30 | 0.561 | 86d6e10273f9 | 5ad5f1598934 | application_restart | 0 | 9 | PASS |
| 154 | g1-mwd1aq1t-4b-6mi5n-title_screen_restart | 0 | 2133608121 | 24 | 8 | 15 | 0.485 | ed3ea468db74 | 899ebdc709cc | title_screen_restart | 0 | 10 | PASS |
| 155 | g1-mwd1aq23-4c-xg7isr-failure_restart | 1 | 4115653733 | 30 | 10 | 22 | 0.579 | 55285ed8af93 | 30a33525dc79 | failure_restart | 0 | 6 | PASS |
| 156 | g1-mwd1aq2g-4d-c6d8ma-new_game | 2 | 4218599706 | 36 | 12 | 23 | 0.556 | 8c1447f20c4c | be3d5ed29bf0 | new_game | 1 | 10 | PASS |
| 157 | g1-mwd1aq33-4e-1ugiq1p-application_restart | 1 | 2593395381 | 30 | 10 | 22 | 0.593 | 5effe5fd4026 | e6f0999ff3f7 | application_restart | 3 | 17 | PASS |
| 158 | g1-mwd1aq4t-4f-cugkpg-title_screen_restart | 3 | 1148930122 | 48 | 16 | 33 | 0.468 | c25d15f6b13c | 6845521eb8ce | title_screen_restart | 5 | 59 | PASS |
| 159 | g1-mwd1aq6c-4g-1x49l2x-failure_restart | 1 | 3245124687 | 30 | 10 | 22 | 0.532 | 520a9763c809 | 4bb46e6ba979 | failure_restart | 2 | 34 | PASS |
| 160 | g1-mwd1aq6r-4h-6gf2su-new_game | 3 | 2207957224 | 48 | 16 | 30 | 0.54 | f2459b9cc8a6 | 113d923cba54 | new_game | 1 | 12 | PASS |
| 161 | g1-mwd1aq7m-4i-etmf4m-application_restart | 1 | 512741076 | 30 | 10 | 22 | 0.578 | 364267f79386 | 4481000153fc | application_restart | 2 | 22 | PASS |
| 162 | g1-mwd1aq7u-4j-1lleoox-title_screen_restart | 0 | 1419114842 | 24 | 8 | 19 | 0.572 | 9919639ee2a1 | 8dbe4367a6f7 | title_screen_restart | 0 | 4 | PASS |
| 163 | g1-mwd1aq8g-4k-z7zqwo-failure_restart | 2 | 578508011 | 36 | 12 | 23 | 0.54 | db0d5c0644a9 | 203003903b5d | failure_restart | 2 | 19 | PASS |
| 164 | g1-mwd1aq8s-4l-d951we-new_game | 0 | 1308406803 | 24 | 8 | 16 | 0.556 | d588e5d09a19 | ff146691fcf3 | new_game | 0 | 6 | PASS |
| 165 | g1-mwd1aq9k-4m-1lkd48q-application_restart | 3 | 2154195457 | 48 | 16 | 27 | 0.468 | c090470889dc | 774fab6741ed | application_restart | 0 | 25 | PASS |
| 166 | g1-mwd1aqay-4n-4gs0a4-title_screen_restart | 1 | 1837878474 | 30 | 10 | 21 | 0.593 | fb184e750458 | 6debc7a1a2b8 | title_screen_restart | 3 | 31 | PASS |
| 167 | g1-mwd1aqby-4o-oq95cc-failure_restart | 3 | 3895470816 | 48 | 16 | 33 | 0.479 | 4040050b3476 | b7b1eef00c8c | failure_restart | 2 | 33 | PASS |
| 168 | g1-mwd1aqdy-4p-1a0lvft-new_game | 0 | 2139812894 | 24 | 8 | 20 | 0.558 | fb9d5736bea5 | 4e08a5a7e55d | new_game | 3 | 47 | PASS |
| 169 | g1-mwd1aqe7-4q-wx9vm-application_restart | 2 | 3008730941 | 36 | 12 | 26 | 0.578 | 7576c2da4426 | 456772cb495e | application_restart | 0 | 6 | PASS |
| 170 | g1-mwd1aqjj-4r-tw5tuh-title_screen_restart | 3 | 1900652989 | 48 | 16 | 29 | 0.553 | 487abb2c9017 | 7049107ab2d0 | title_screen_restart | 9 | 187 | PASS |
| 171 | g1-mwd1aqkw-4s-1lnrh03-failure_restart | 1 | 3011834645 | 30 | 10 | 22 | 0.37 | d9882be4d6c0 | 160bc6ad23e2 | failure_restart | 0 | 26 | PASS |
| 172 | g1-mwd1aql6-4t-1y8j8je-new_game | 2 | 2911089330 | 36 | 12 | 25 | 0.5 | b8c3a192920c | 4eaaf79fbe48 | new_game | 0 | 7 | PASS |
| 173 | g1-mwd1aqnc-4u-1pdtr97-application_restart | 3 | 3527075148 | 48 | 16 | 32 | 0.482 | 6a7d7b2116bb | bc0d87ce502c | application_restart | 0 | 74 | PASS |
| 174 | g1-mwd1aqrc-4v-1oyyk55-title_screen_restart | 2 | 3547170285 | 36 | 12 | 23 | 0.575 | cba9e194ca89 | d7f9e3d50855 | title_screen_restart | 1 | 80 | PASS |
| 175 | g1-mwd1aqrn-4w-o83jje-failure_restart | 0 | 1277729958 | 24 | 8 | 16 | 0.565 | 0692ceb7fff8 | 12fcb9c7626c | failure_restart | 0 | 7 | PASS |
| 176 | g1-mwd1aqrv-4x-8sq35d-new_game | 1 | 3363618047 | 30 | 10 | 21 | 0.475 | 1fe101c6cd13 | 676c79bec529 | new_game | 0 | 5 | PASS |
| 177 | g1-mwd1aqwi-4y-t50ig7-application_restart | 3 | 554867374 | 48 | 16 | 28 | 0.5 | 319e7ef3ed4f | 91beaa9e3dae | application_restart | 0 | 165 | PASS |
| 178 | g1-mwd1ar50-4z-pwjoi1-title_screen_restart | 0 | 3531437566 | 24 | 8 | 17 | 0.476 | abdc5f18ff19 | dc4d4cc414d4 | title_screen_restart | 0 | 161 | PASS |
| 179 | g1-mwd1ar57-50-mew6w1-failure_restart | 1 | 3675670266 | 30 | 10 | 26 | 0.537 | 9728e64802e2 | ffcacca258b9 | failure_restart | 0 | 4 | PASS |
| 180 | g1-mwd1ar6c-51-ifg6q0-new_game | 3 | 3786483598 | 48 | 16 | 30 | 0.464 | 47924281b258 | 9e039f7a88ff | new_game | 1 | 38 | PASS |
| 181 | g1-mwd1ar8f-52-1e58nbc-application_restart | 2 | 1139247381 | 36 | 12 | 23 | 0.537 | a76edae67bd6 | 36d627ee34e0 | application_restart | 1 | 42 | PASS |
| 182 | g1-mwd1ara4-53-jskjqn-title_screen_restart | 3 | 593871533 | 48 | 16 | 23 | 0.586 | db2231c9e0a3 | 158a5ad05f49 | title_screen_restart | 2 | 55 | PASS |
| 183 | g1-mwd1arb5-54-15yda71-failure_restart | 2 | 3711238528 | 36 | 12 | 23 | 0.556 | 30e0e38147ef | 495a9ddb9f85 | failure_restart | 1 | 24 | PASS |
| 184 | g1-mwd1arbq-55-1b04cct-new_game | 1 | 8120032 | 30 | 10 | 22 | 0.569 | 98e9c510ca85 | 3f0c8fcb886f | new_game | 1 | 13 | PASS |
| 185 | g1-mwd1ardn-56-15nc2ho-application_restart | 3 | 3799726099 | 48 | 16 | 29 | 0.597 | 3a14eade86f7 | 0f44ac8db831 | application_restart | 0 | 66 | PASS |
| 186 | g1-mwd1arh2-57-1ufit3x-title_screen_restart | 0 | 1257928003 | 24 | 8 | 14 | 0.556 | f931b4765bdf | 721829aa4fbb | title_screen_restart | 0 | 64 | PASS |
| 187 | g1-mwd1arh9-58-13uxbne-failure_restart | 1 | 1514961736 | 30 | 10 | 27 | 0.488 | 48c98f089e6b | 71d82d271ae3 | failure_restart | 0 | 5 | PASS |
| 188 | g1-mwd1arhj-59-eyka1y-new_game | 2 | 1374370091 | 36 | 12 | 22 | 0.496 | 9abb4aa9f733 | 385d9f0ddc29 | new_game | 0 | 8 | PASS |
| 189 | g1-mwd1arkf-5a-15ah0pr-application_restart | 3 | 1784075623 | 48 | 16 | 29 | 0.517 | 18bb9fabd60e | a65ffe68b530 | application_restart | 0 | 98 | PASS |
| 190 | g1-mwd1arp1-5b-1jpqbsp-title_screen_restart | 1 | 3800394496 | 30 | 10 | 25 | 0.593 | fec65bb1568c | 869ff1b6e081 | title_screen_restart | 0 | 76 | PASS |
| 191 | g1-mwd1arq9-5c-ms7dng-failure_restart | 3 | 399808791 | 48 | 16 | 29 | 0.446 | 652de6ae88c8 | bb900ea81d5b | failure_restart | 2 | 41 | PASS |
| 192 | g1-mwd1arrw-5d-1ujzfo8-new_game | 1 | 945915254 | 30 | 10 | 21 | 0.543 | 51af19ec97bb | 1dab582d11e9 | new_game | 0 | 31 | PASS |
| 193 | g1-mwd1ars3-5e-1nbzn9s-application_restart | 0 | 3749639901 | 24 | 8 | 16 | 0.453 | 47546fe664df | a1ed6df84178 | application_restart | 0 | 4 | PASS |
| 194 | g1-mwd1artl-5f-1nahkki-title_screen_restart | 3 | 3321413380 | 48 | 16 | 32 | 0.504 | 25a563af4ae1 | 2e9d34b79f38 | title_screen_restart | 1 | 53 | PASS |
| 195 | g1-mwd1arwv-5g-1ie0gml-failure_restart | 2 | 2794107111 | 36 | 12 | 22 | 0.542 | c70049fa6934 | 35806e72fd98 | failure_restart | 1 | 62 | PASS |
| 196 | g1-mwd1ary9-5h-1n4cuss-new_game | 0 | 1074753624 | 24 | 8 | 19 | 0.558 | 17dc54c08568 | 2ff7abd48a57 | new_game | 6 | 44 | PASS |
| 197 | g1-mwd1as03-5i-1ezcncr-application_restart | 3 | 3573998767 | 48 | 16 | 31 | 0.6 | 5f6feab36bcc | 3f44dd96d025 | application_restart | 2 | 64 | PASS |
| 198 | g1-mwd1as1x-5j-rriz7y-title_screen_restart | 1 | 3511319573 | 30 | 10 | 21 | 0.556 | e80a04f5a5e0 | d856e798041b | title_screen_restart | 0 | 34 | PASS |
| 199 | g1-mwd1as2m-5k-s125a3-failure_restart | 3 | 1741481626 | 48 | 16 | 29 | 0.589 | c39443f8d3f3 | 376b8a8be0db | failure_restart | 0 | 20 | PASS |
| 200 | g1-mwd1as3y-5l-1icpvr7-new_game | 0 | 3473833336 | 24 | 8 | 15 | 0.519 | 85a85f33f801 | c3174d2507f1 | new_game | 4 | 30 | PASS |

</details>

## 第 2 关 · 200 局

| 项 | 值 |
|---|---|
| 耗时 | 6945 ms |
| 牌数范围 | 192 – 321 |
| 开局可点牌范围 | 22 – 25 |
| 档位分布 | {"0":18,"1":16,"2":21,"3":15,"4":26,"5":13,"6":21,"7":13,"8":24,"9":33} |
| 牌数分布 | {"192":24,"255":33,"261":21,"273":26,"282":16,"291":13,"300":21,"312":28,"321":18} |
| 牌型数分布 | {"13":76,"14":34,"15":75,"16":15} |
| 生成原因分布 | {"application_restart":50,"title_screen_restart":50,"failure_restart":50,"new_game":50} |
| 布局签名去重 | 151 / 200 |
| 最近 5 局布局签名重复 | 0 |
| 最近 5 局几何签名重复 | 0 |
| 重试次数（失败重试合计） | 41 |
| 生成失败次数 | 0 |
| 滑窗 sim 均值 / P95 / 最大 | 0.3936 / 0.5420 / 0.5998 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 17.93 ms |

<details><summary>完整 200 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | sim最大 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g2-mwd1as4c-5m-1ljnqna-application_restart | 5 | 2180741992 | 291 | 13 | 23 | 0 | bf63b565ebe5 | 1a4b4283604e | application_restart | 0 | 11 | PASS |
| 2 | g2-mwd1as57-5n-1roa22a-title_screen_restart | 4 | 4116126574 | 273 | 13 | 24 | 0.388 | 6fd625e18fb2 | ffe9f4649ba9 | title_screen_restart | 0 | 15 | PASS |
| 3 | g2-mwd1as5y-5o-1nxdwmm-failure_restart | 6 | 1611617344 | 261 | 13 | 23 | 0.383 | a01272778729 | 9fd87230f864 | failure_restart | 0 | 13 | PASS |
| 4 | g2-mwd1as6o-5p-1aw7ywr-new_game | 4 | 2475595039 | 273 | 13 | 23 | 0.552 | 12fe864103c0 | 7669b957a185 | new_game | 0 | 13 | PASS |
| 5 | g2-mwd1as7l-5q-12ppqov-application_restart | 3 | 834063501 | 312 | 16 | 25 | 0.522 | aa4ece8964e6 | d0c542a65dba | application_restart | 0 | 18 | PASS |
| 6 | g2-mwd1as8m-5r-j2fpv5-title_screen_restart | 7 | 3344572749 | 312 | 14 | 24 | 0.398 | 9309e6cd8773 | c2a1dc4c7ac3 | title_screen_restart | 0 | 19 | PASS |
| 7 | g2-mwd1as9j-5s-rnu3hy-failure_restart | 8 | 2592600367 | 192 | 15 | 25 | 0.48 | bb945c9873a3 | 19e3bd8d1251 | failure_restart | 0 | 12 | PASS |
| 8 | g2-mwd1asay-5t-iw87vl-new_game | 1 | 684136970 | 282 | 13 | 22 | 0.499 | 087dd279909f | 15aae313df7f | new_game | 2 | 43 | PASS |
| 9 | g2-mwd1asbv-5u-11i6gwv-application_restart | 4 | 3432996607 | 273 | 13 | 24 | 0.536 | 445d37c51763 | 4a7e7e72c005 | application_restart | 0 | 17 | PASS |
| 10 | g2-mwd1ascq-5v-1943bik-title_screen_restart | 9 | 1706041220 | 255 | 15 | 24 | 0.488 | dbdde56cd6ca | 5f3c47864915 | title_screen_restart | 0 | 15 | PASS |
| 11 | g2-mwd1asdg-5w-j02te-failure_restart | 8 | 1226340433 | 192 | 15 | 25 | 0.455 | cbc07d9d6b1a | 62162952c1d4 | failure_restart | 0 | 9 | PASS |
| 12 | g2-mwd1ase7-5x-16oc6ky-new_game | 9 | 3437996622 | 255 | 15 | 25 | 0.374 | c79ce3aaa35b | d7b12c59a720 | new_game | 1 | 21 | PASS |
| 13 | g2-mwd1asf2-5y-1umn38l-application_restart | 2 | 2952295817 | 300 | 14 | 24 | 0.512 | d2b22cb81fe8 | c839afc6fc0e | application_restart | 0 | 16 | PASS |
| 14 | g2-mwd1asg9-5z-pd66t9-title_screen_restart | 0 | 3041719678 | 321 | 15 | 25 | 0.439 | a03b6b59dbf4 | f6e50081566a | title_screen_restart | 0 | 23 | PASS |
| 15 | g2-mwd1ashf-60-1snn4v8-failure_restart | 2 | 1790465066 | 300 | 14 | 24 | 0.472 | 4acfb3ca58a4 | 0b7e7ebf684f | failure_restart | 0 | 20 | PASS |
| 16 | g2-mwd1asir-61-u1ka30-new_game | 7 | 4210550450 | 312 | 14 | 25 | 0.558 | e257ac2d3651 | 42a802bc3b69 | new_game | 1 | 26 | PASS |
| 17 | g2-mwd1asjr-62-1lophrm-application_restart | 4 | 3968200049 | 273 | 13 | 24 | 0.499 | 33f0991ccf60 | 143e1c635478 | application_restart | 0 | 14 | PASS |
| 18 | g2-mwd1aske-63-pnwks-title_screen_restart | 8 | 1557114692 | 192 | 15 | 23 | 0.345 | 45f03188133d | 607c0580732f | title_screen_restart | 0 | 10 | PASS |
| 19 | g2-mwd1asl0-64-15u4w1h-failure_restart | 9 | 2480595054 | 255 | 15 | 25 | 0.499 | 0676643ca306 | 8cb35bb67f9c | failure_restart | 0 | 12 | PASS |
| 20 | g2-mwd1aslw-65-17nqmwi-new_game | 4 | 2954295823 | 273 | 13 | 24 | 0.59 | 71c2b85b4401 | 4b0782b4ec51 | new_game | 0 | 17 | PASS |
| 21 | g2-mwd1asmp-66-8cgi37-application_restart | 6 | 2181741995 | 261 | 13 | 25 | 0.495 | cc07044aa248 | 99292f31c01d | application_restart | 0 | 14 | PASS |
| 22 | g2-mwd1asni-67-8ds9m-title_screen_restart | 7 | 2330668523 | 312 | 14 | 25 | 0.52 | 5754a380656d | 0379ea0f3e0c | title_screen_restart | 0 | 16 | PASS |
| 23 | g2-mwd1asop-68-1igc80x-failure_restart | 8 | 1099995357 | 192 | 15 | 23 | 0.463 | 398b244fd8f0 | a6cdb908c469 | failure_restart | 1 | 24 | PASS |
| 24 | g2-mwd1aspb-69-1qyt2ic-new_game | 4 | 539210454 | 273 | 13 | 24 | 0.532 | f62ac5da693c | b88c4acda47a | new_game | 0 | 13 | PASS |
| 25 | g2-mwd1aspx-6a-3ajlof-application_restart | 8 | 3275730334 | 192 | 15 | 25 | 0.492 | ec4a5c99898b | 2a713ee2a9d8 | application_restart | 0 | 10 | PASS |
| 26 | g2-mwd1asql-6b-1lb75p4-title_screen_restart | 5 | 300860065 | 291 | 13 | 24 | 0.553 | 1bd7702c0f8d | b73112601719 | title_screen_restart | 0 | 15 | PASS |
| 27 | g2-mwd1asre-6c-1yx45aj-failure_restart | 4 | 3728849657 | 273 | 13 | 24 | 0.527 | 7a356b795172 | ffccfd20e565 | failure_restart | 0 | 13 | PASS |
| 28 | g2-mwd1ass8-6d-1t1ss2i-new_game | 1 | 1071413887 | 282 | 13 | 25 | 0.6 | 07fa8bee699c | b5dca020787b | new_game | 0 | 15 | PASS |
| 29 | g2-mwd1ast2-6e-1da2ygc-application_restart | 6 | 3822273530 | 261 | 13 | 24 | 0.415 | 1edecdfcb3ac | a20e1b4c4ce6 | application_restart | 0 | 15 | PASS |
| 30 | g2-mwd1astw-6f-1a06112-title_screen_restart | 2 | 3339572734 | 300 | 14 | 25 | 0.473 | 4c92769943a0 | a493051943e5 | title_screen_restart | 0 | 15 | PASS |
| 31 | g2-mwd1asus-6g-7arcq3-failure_restart | 8 | 3106222360 | 192 | 15 | 23 | 0.47 | 8f2d7bcf52c5 | f8855d8a51d1 | failure_restart | 0 | 13 | PASS |
| 32 | g2-mwd1asvd-6h-dmxrup-new_game | 6 | 3047719696 | 261 | 13 | 23 | 0.519 | 7b86769e9392 | 900fddd4964e | new_game | 0 | 13 | PASS |
| 33 | g2-mwd1aswd-6i-1g3hsrx-application_restart | 8 | 1557114692 | 192 | 15 | 23 | 0.523 | 45f03188133d | 607c0580732f | application_restart | 1 | 23 | PASS |
| 34 | g2-mwd1asx0-6j-1s8wtr2-title_screen_restart | 7 | 2034815473 | 312 | 14 | 25 | 0.517 | 326981f0942e | bd3f00e10d9e | title_screen_restart | 0 | 15 | PASS |
| 35 | g2-mwd1asyb-6k-1tzobi-failure_restart | 9 | 304860077 | 255 | 15 | 23 | 0.388 | 6982c0d098e0 | 8f9ae5dc093f | failure_restart | 1 | 25 | PASS |
| 36 | g2-mwd1aszc-6l-n1uipb-new_game | 2 | 2417092375 | 300 | 14 | 25 | 0.45 | 2397093104c1 | 2f431e584acd | new_game | 0 | 21 | PASS |
| 37 | g2-mwd1at11-6m-1ns03ng-application_restart | 9 | 3677347014 | 255 | 15 | 23 | 0.559 | 75d2b75d35fc | 654129bd0d5d | application_restart | 2 | 40 | PASS |
| 38 | g2-mwd1at1r-6n-1tn1agx-title_screen_restart | 6 | 3582923138 | 261 | 13 | 23 | 0.488 | 7cb47b95fc48 | 7f599af48d5a | title_screen_restart | 0 | 14 | PASS |
| 39 | g2-mwd1at2y-6o-1jrmr69-failure_restart | 1 | 444786578 | 282 | 13 | 24 | 0.488 | 03447fc8a488 | 86c3e720275c | failure_restart | 1 | 27 | PASS |
| 40 | g2-mwd1at40-6p-12yy5uq-new_game | 4 | 1701041205 | 273 | 13 | 23 | 0.534 | 00da00b9638d | a6a51c76e048 | new_game | 0 | 19 | PASS |
| 41 | g2-mwd1at51-6q-14p2uka-application_restart | 3 | 2087318119 | 312 | 16 | 24 | 0.484 | 5669d7b0b30f | cf924d10ed54 | application_restart | 0 | 20 | PASS |
| 42 | g2-mwd1at63-6r-viwrer-title_screen_restart | 8 | 1099995357 | 192 | 15 | 23 | 0.484 | 398b244fd8f0 | a6cdb908c469 | title_screen_restart | 0 | 14 | PASS |
| 43 | g2-mwd1at6p-6s-27dmw5-failure_restart | 1 | 3429996598 | 282 | 13 | 25 | 0.575 | e1c548240528 | cd0fff588631 | failure_restart | 0 | 12 | PASS |
| 44 | g2-mwd1at7t-6t-z7x8pb-new_game | 3 | 1460690810 | 312 | 16 | 25 | 0.504 | 58d98d5e5747 | 3a88665ee09c | new_game | 0 | 20 | PASS |
| 45 | g2-mwd1at9c-6u-1bdj3yo-application_restart | 4 | 3672346999 | 273 | 13 | 24 | 0.513 | bdf9fa366fa0 | fd594238ba2e | application_restart | 1 | 33 | PASS |
| 46 | g2-mwd1ata8-6v-1a3yajm-title_screen_restart | 6 | 4209550447 | 261 | 13 | 24 | 0.529 | 91ad873f3edc | 011e5b3e4214 | title_screen_restart | 0 | 15 | PASS |
| 47 | g2-mwd1atb5-6w-v550jt-failure_restart | 9 | 2663442788 | 255 | 15 | 25 | 0.37 | 9df9ef3db22c | 9612eed18110 | failure_restart | 0 | 15 | PASS |
| 48 | g2-mwd1atbt-6x-1wmtmxk-new_game | 6 | 2625521570 | 261 | 13 | 25 | 0.572 | ceeb4955316c | e3e2cf73801d | new_game | 0 | 11 | PASS |
| 49 | g2-mwd1atcn-6y-18449f-application_restart | 4 | 4059623916 | 273 | 13 | 25 | 0.493 | e8ee799a4e0b | b33fb5bc70da | application_restart | 0 | 15 | PASS |
| 50 | g2-mwd1atdp-6z-1hs8qj9-title_screen_restart | 5 | 300860065 | 291 | 13 | 24 | 0.563 | 1bd7702c0f8d | b73112601719 | title_screen_restart | 0 | 20 | PASS |
| 51 | g2-mwd1atem-70-1b3e25h-failure_restart | 7 | 3583923141 | 312 | 14 | 24 | 0.466 | c797bc3b11ae | 270d6e7b36f8 | failure_restart | 0 | 14 | PASS |
| 52 | g2-mwd1atfr-71-1hq49a9-new_game | 3 | 2953295820 | 312 | 16 | 24 | 0.51 | 29896c750254 | daa6f1fd3181 | new_game | 0 | 19 | PASS |
| 53 | g2-mwd1atgv-72-t5prue-application_restart | 1 | 1550114671 | 282 | 13 | 23 | 0.538 | df3f2bc57d5f | 91bd72fc9ca6 | application_restart | 0 | 19 | PASS |
| 54 | g2-mwd1athu-73-rp7nhx-title_screen_restart | 9 | 3437996622 | 255 | 15 | 25 | 0.478 | c79ce3aaa35b | d7b12c59a720 | title_screen_restart | 0 | 15 | PASS |
| 55 | g2-mwd1atiq-74-o5p64a-failure_restart | 0 | 3428996595 | 321 | 15 | 23 | 0.572 | 60c54daedfd2 | ea22322d63aa | failure_restart | 0 | 17 | PASS |
| 56 | g2-mwd1atjz-75-ig4hoc-new_game | 3 | 3431996604 | 312 | 16 | 25 | 0.597 | 8365f7d3a080 | 5434a5d5bf53 | new_game | 0 | 21 | PASS |
| 57 | g2-mwd1atl4-76-1szoamo-application_restart | 9 | 2811369313 | 255 | 15 | 25 | 0.563 | e3c62cd8d83d | 4859ba9a96ae | application_restart | 0 | 17 | PASS |
| 58 | g2-mwd1atlu-77-pz1ttg-title_screen_restart | 8 | 2296747317 | 192 | 15 | 22 | 0.501 | 2e8e243ec210 | 2ad69dbafd3a | title_screen_restart | 0 | 11 | PASS |
| 59 | g2-mwd1atml-78-1gvktif-failure_restart | 2 | 1790465066 | 300 | 14 | 24 | 0.472 | 4acfb3ca58a4 | 0b7e7ebf684f | failure_restart | 0 | 16 | PASS |
| 60 | g2-mwd1atnk-79-s9myg1-new_game | 0 | 2654442761 | 321 | 15 | 25 | 0.57 | e60a5a7c68c9 | 599fca55f85d | new_game | 0 | 15 | PASS |
| 61 | g2-mwd1ator-7a-lr0iqs-application_restart | 7 | 394283938 | 312 | 14 | 25 | 0.563 | 352e16953176 | 3c19596e4190 | application_restart | 0 | 21 | PASS |
| 62 | g2-mwd1atpz-7b-atyjei-title_screen_restart | 0 | 4112126562 | 321 | 15 | 25 | 0.56 | 6bc27ba82bf5 | 8666ae4a950f | title_screen_restart | 0 | 22 | PASS |
| 63 | g2-mwd1atrl-7c-1qt4zih-failure_restart | 4 | 1165837763 | 273 | 13 | 23 | 0.524 | 0ffec7c5aed2 | 6f9c65e8fd05 | failure_restart | 1 | 40 | PASS |
| 64 | g2-mwd1atsj-7d-1w3mh2t-new_game | 3 | 2713945428 | 312 | 16 | 25 | 0.583 | f270e8889623 | 29aaea95ebf4 | new_game | 0 | 20 | PASS |
| 65 | g2-mwd1attm-7e-1jyvtmq-application_restart | 9 | 1706041220 | 255 | 15 | 24 | 0.398 | dbdde56cd6ca | 5f3c47864915 | application_restart | 0 | 17 | PASS |
| 66 | g2-mwd1atuf-7f-qytpdp-title_screen_restart | 1 | 1937391588 | 282 | 13 | 24 | 0.519 | 0ce9ff524cb2 | 4b1d07dd3e32 | title_screen_restart | 0 | 15 | PASS |
| 67 | g2-mwd1atvw-7g-1tcnx6u-failure_restart | 3 | 2805369295 | 312 | 16 | 25 | 0.531 | 4af8d0a37d4f | 4699624dadad | failure_restart | 1 | 35 | PASS |
| 68 | g2-mwd1atx0-7h-1it4lo2-new_game | 2 | 3818273518 | 300 | 14 | 23 | 0.407 | fecd79a0a664 | b7481e50ad87 | new_game | 0 | 19 | PASS |
| 69 | g2-mwd1aty6-7i-l3r9lw-application_restart | 0 | 4203550429 | 321 | 15 | 24 | 0.536 | 65a544bed99d | b4878fbb6d90 | application_restart | 0 | 20 | PASS |
| 70 | g2-mwd1atzb-7j-1uxq660-title_screen_restart | 6 | 1167837769 | 261 | 13 | 25 | 0.365 | 975533138d9e | 8c0390d42253 | title_screen_restart | 0 | 18 | PASS |
| 71 | g2-mwd1au07-7k-we5n97-failure_restart | 5 | 300860065 | 291 | 13 | 24 | 0.56 | 1bd7702c0f8d | b73112601719 | failure_restart | 0 | 16 | PASS |
| 72 | g2-mwd1au17-7l-1m7xaa6-new_game | 6 | 2238244653 | 261 | 13 | 24 | 0.594 | fe807b6fdf52 | fe0b3c455333 | new_game | 0 | 16 | PASS |
| 73 | g2-mwd1au24-7m-1c3t6z8-application_restart | 9 | 2572018921 | 255 | 15 | 24 | 0.513 | 6a15849eb089 | 4baeca1afda6 | application_restart | 0 | 16 | PASS |
| 74 | g2-mwd1au3d-7n-1ybi71y-title_screen_restart | 8 | 3162725018 | 192 | 15 | 23 | 0.427 | 9914a64d56b6 | 94da966adff8 | title_screen_restart | 1 | 29 | PASS |
| 75 | g2-mwd1au40-7o-11dds2p-failure_restart | 1 | 296860053 | 282 | 13 | 24 | 0.5 | 6cb11773fdd2 | 5d5e39e4dcbb | failure_restart | 0 | 14 | PASS |
| 76 | g2-mwd1au4v-7p-xiilnp-new_game | 8 | 29588473 | 192 | 15 | 24 | 0.549 | 43b33f705c13 | bacdb308df33 | new_game | 0 | 13 | PASS |
| 77 | g2-mwd1au5j-7q-16adfrb-application_restart | 9 | 4121126589 | 255 | 15 | 24 | 0.466 | dd068130ae15 | 350d17077641 | application_restart | 0 | 15 | PASS |
| 78 | g2-mwd1au6i-7r-11m4kyp-title_screen_restart | 3 | 2805369295 | 312 | 16 | 25 | 0.386 | 4af8d0a37d4f | 4699624dadad | title_screen_restart | 0 | 19 | PASS |
| 79 | g2-mwd1au7i-7s-128ud5n-failure_restart | 4 | 60509670 | 273 | 13 | 25 | 0.451 | 17fd0c8f65aa | 672c4ee323b5 | failure_restart | 0 | 13 | PASS |
| 80 | g2-mwd1au8q-7t-12xki9g-new_game | 8 | 543210466 | 192 | 15 | 25 | 0.466 | 0d5fd2cd94e4 | c03a7ccb9cb5 | new_game | 1 | 25 | PASS |
| 81 | g2-mwd1au9b-7u-10j1ps-application_restart | 0 | 683136967 | 321 | 15 | 24 | 0.457 | ac4c0aa9b081 | 39a677aa53ca | application_restart | 0 | 14 | PASS |
| 82 | g2-mwd1auad-7v-19sl8zn-title_screen_restart | 5 | 3969200052 | 291 | 13 | 25 | 0.492 | f912fec2e27f | 040ea60f635a | title_screen_restart | 1 | 21 | PASS |
| 83 | g2-mwd1aub9-7w-xvhky4-failure_restart | 2 | 1459690807 | 300 | 14 | 25 | 0.453 | 8897cc77d0f2 | df9a46dd7e10 | failure_restart | 0 | 17 | PASS |
| 84 | g2-mwd1auc8-7x-rvem3c-new_game | 9 | 2959295838 | 255 | 15 | 24 | 0.479 | cb60b4087d83 | 55250b98d6a7 | new_game | 0 | 14 | PASS |
| 85 | g2-mwd1aud3-7y-3zvyjt-application_restart | 4 | 2954295823 | 273 | 13 | 24 | 0.523 | 71c2b85b4401 | 4b0782b4ec51 | application_restart | 0 | 18 | PASS |
| 86 | g2-mwd1aue0-7z-3562aa-title_screen_restart | 6 | 3970200055 | 261 | 13 | 24 | 0.505 | 4b3249dc1429 | 6ea85ecc0e31 | title_screen_restart | 0 | 15 | PASS |
| 87 | g2-mwd1auex-80-1haajtb-failure_restart | 1 | 296860053 | 282 | 13 | 24 | 0.503 | 6cb11773fdd2 | 5d5e39e4dcbb | failure_restart | 0 | 18 | PASS |
| 88 | g2-mwd1aufs-81-vvghxw-new_game | 9 | 3198646230 | 255 | 15 | 25 | 0.59 | 2067f30179fc | c9a825dc3bcc | new_game | 0 | 13 | PASS |
| 89 | g2-mwd1augo-82-1fttrnp-application_restart | 4 | 3728849657 | 273 | 13 | 24 | 0.574 | 7a356b795172 | ffccfd20e565 | application_restart | 0 | 15 | PASS |
| 90 | g2-mwd1auhk-83-3bpg9v-title_screen_restart | 3 | 298860059 | 312 | 16 | 25 | 0.487 | bfb72e0a89a7 | f09f200b8277 | title_screen_restart | 0 | 16 | PASS |
| 91 | g2-mwd1auic-84-18t7uj4-failure_restart | 8 | 2592600367 | 192 | 15 | 25 | 0.484 | bb945c9873a3 | 19e3bd8d1251 | failure_restart | 0 | 10 | PASS |
| 92 | g2-mwd1aujg-85-1x1fkig-new_game | 5 | 3046719693 | 291 | 13 | 25 | 0.509 | 665ca385ffed | fcf420037bbf | new_game | 1 | 32 | PASS |
| 93 | g2-mwd1aukf-86-1b0hdl3-application_restart | 7 | 3583923141 | 312 | 14 | 24 | 0.512 | c797bc3b11ae | 270d6e7b36f8 | application_restart | 0 | 18 | PASS |
| 94 | g2-mwd1aul8-87-1c7u0v9-title_screen_restart | 9 | 9007027 | 255 | 15 | 24 | 0.46 | 062d51803c11 | 131442076315 | title_screen_restart | 0 | 13 | PASS |
| 95 | g2-mwd1aum0-88-1f2drb2-failure_restart | 6 | 689136985 | 261 | 13 | 24 | 0.481 | 789a174804e9 | 3a9eb68c5a85 | failure_restart | 0 | 13 | PASS |
| 96 | g2-mwd1aun2-89-cg73wk-new_game | 5 | 4208550444 | 291 | 13 | 25 | 0.38 | 9f5ec774e73d | c1cbd9592c1c | new_game | 1 | 25 | PASS |
| 97 | g2-mwd1aunv-8a-27hipg-application_restart | 4 | 2567018906 | 273 | 13 | 25 | 0.502 | 6163a3dc33e9 | 5b261feeaec9 | application_restart | 0 | 14 | PASS |
| 98 | g2-mwd1aup3-8b-ju8c6y-title_screen_restart | 2 | 1311764282 | 300 | 14 | 22 | 0.576 | 324bd9caf397 | 1b635b97416c | title_screen_restart | 1 | 29 | PASS |
| 99 | g2-mwd1auq1-8c-hcoyo3-failure_restart | 9 | 396283944 | 255 | 15 | 25 | 0.555 | 256fcafc4f2d | b05465ec5d5d | failure_restart | 0 | 16 | PASS |
| 100 | g2-mwd1auqz-8d-1n48ot6-new_game | 8 | 1874549191 | 192 | 15 | 24 | 0.391 | cfcda92a2ea7 | b47c59040c35 | new_game | 1 | 21 | PASS |
| 101 | g2-mwd1aurx-8f-kidbat-application_restart | 6 | 210436201 | 261 | 13 | 25 | 0.447 | 40cb8eaf1daa | 1e73f0d18f7f | application_restart | 0 | 9 | PASS |
| 102 | g2-mwd1ausu-8g-4d0ypq-title_screen_restart | 3 | 3007009 | 312 | 16 | 25 | 0.441 | c2fbe7c010ec | 8cadaafdbe71 | title_screen_restart | 0 | 19 | PASS |
| 103 | g2-mwd1autv-8h-1i1c2cn-failure_restart | 7 | 3971200058 | 312 | 14 | 25 | 0.479 | 7289f32e18dc | e07a116ecc80 | failure_restart | 0 | 19 | PASS |
| 104 | g2-mwd1auv4-8i-lfub9n-new_game | 9 | 1170837778 | 255 | 15 | 25 | 0.596 | 2da52e4b1ada | 89cfd23aa691 | new_game | 1 | 25 | PASS |
| 105 | g2-mwd1auvx-8j-nh9amv-application_restart | 6 | 1942391603 | 261 | 13 | 24 | 0.545 | f6dd3c9d4244 | a50ca08cdfb4 | application_restart | 0 | 14 | PASS |
| 106 | g2-mwd1auwr-8k-1kkvnpd-title_screen_restart | 3 | 2566018903 | 312 | 16 | 24 | 0.537 | 070dde163146 | 5b58967e67f5 | title_screen_restart | 0 | 18 | PASS |
| 107 | g2-mwd1auxv-8l-1y9rmq4-failure_restart | 2 | 2952295817 | 300 | 14 | 24 | 0.482 | d2b22cb81fe8 | c839afc6fc0e | failure_restart | 0 | 20 | PASS |
| 108 | g2-mwd1auz2-8m-14d2c7u-new_game | 9 | 3107222363 | 255 | 15 | 22 | 0.484 | 14f04ca3e972 | 85cc7aa0131b | new_game | 0 | 19 | PASS |
| 109 | g2-mwd1av0e-8n-1kkuj1o-application_restart | 0 | 1401188143 | 321 | 15 | 25 | 0.56 | 0cc570288602 | 1cf474203d53 | application_restart | 1 | 32 | PASS |
| 110 | g2-mwd1av1k-8o-1oyva9k-title_screen_restart | 5 | 1462690816 | 291 | 13 | 22 | 0.399 | 9d32562385b4 | e9c51b065517 | title_screen_restart | 0 | 20 | PASS |
| 111 | g2-mwd1av2j-8p-1aa4bf0-failure_restart | 9 | 3050719705 | 255 | 15 | 25 | 0.53 | b8c8782edd51 | 88c62ce67cf7 | failure_restart | 0 | 14 | PASS |
| 112 | g2-mwd1av3f-8q-1h4ic7r-new_game | 1 | 3338572731 | 282 | 13 | 24 | 0.398 | 80853e745aca | 6f7148363c01 | new_game | 0 | 17 | PASS |
| 113 | g2-mwd1av4h-8r-1kmws4p-application_restart | 6 | 301860068 | 261 | 13 | 25 | 0.522 | 9647cf608d39 | 6842db1a65f6 | application_restart | 0 | 17 | PASS |
| 114 | g2-mwd1av5e-8s-mo3dsq-title_screen_restart | 9 | 3107222363 | 255 | 15 | 22 | 0.53 | 14f04ca3e972 | 85cc7aa0131b | title_screen_restart | 0 | 16 | PASS |
| 115 | g2-mwd1av62-8t-1nq9tba-failure_restart | 4 | 4116126574 | 273 | 13 | 24 | 0.433 | 6fd625e18fb2 | ffe9f4649ba9 | failure_restart | 0 | 9 | PASS |
| 116 | g2-mwd1av6w-8u-10zeqg6-new_game | 2 | 3578923126 | 300 | 14 | 25 | 0.513 | a8441489c96c | 4e5c858cbb73 | new_game | 0 | 18 | PASS |
| 117 | g2-mwd1av7u-8v-6h34mf-application_restart | 9 | 1170837778 | 255 | 15 | 25 | 0.459 | 2da52e4b1ada | 89cfd23aa691 | application_restart | 0 | 16 | PASS |
| 118 | g2-mwd1av8n-8w-nmie3c-title_screen_restart | 1 | 2951295814 | 282 | 13 | 25 | 0.479 | a63a6b6f1e0c | 5111267f20e5 | title_screen_restart | 0 | 13 | PASS |
| 119 | g2-mwd1av9l-8x-1qa0acy-failure_restart | 7 | 3435996616 | 312 | 14 | 25 | 0.509 | c860add4f804 | 2365c33aa708 | failure_restart | 0 | 18 | PASS |
| 120 | g2-mwd1avak-8y-1vq6yvm-new_game | 5 | 2568018909 | 291 | 13 | 25 | 0.579 | 1e1cb75733d3 | 49aa3cdb8d60 | new_game | 0 | 14 | PASS |
| 121 | g2-mwd1avbf-8z-16itowg-application_restart | 6 | 2181741995 | 261 | 13 | 25 | 0.521 | cc07044aa248 | 99292f31c01d | application_restart | 0 | 16 | PASS |
| 122 | g2-mwd1avcc-90-14zmqq4-title_screen_restart | 0 | 4203550429 | 321 | 15 | 24 | 0.477 | 65a544bed99d | b4878fbb6d90 | title_screen_restart | 0 | 18 | PASS |
| 123 | g2-mwd1avd9-91-175duo-failure_restart | 4 | 3820273524 | 273 | 13 | 25 | 0.417 | 585ff1cbd81e | f9f21e4078e0 | failure_restart | 0 | 9 | PASS |
| 124 | g2-mwd1avdy-92-1x2dnbx-new_game | 8 | 1008571490 | 192 | 15 | 24 | 0.49 | f3e2d62248f1 | 701ec582100a | new_game | 0 | 10 | PASS |
| 125 | g2-mwd1aven-93-p78u3d-application_restart | 0 | 3098222336 | 321 | 15 | 24 | 0.581 | 0114e5f516bf | adb7b4dd3960 | application_restart | 0 | 15 | PASS |
| 126 | g2-mwd1avfq-94-1xsrbwe-title_screen_restart | 1 | 2951295814 | 282 | 13 | 25 | 0.484 | a63a6b6f1e0c | 5111267f20e5 | title_screen_restart | 0 | 20 | PASS |
| 127 | g2-mwd1avgo-95-xcj6m9-failure_restart | 7 | 3731849666 | 312 | 14 | 24 | 0.557 | 6fdf4f6ca0c6 | 79b2a65dce23 | failure_restart | 0 | 15 | PASS |
| 128 | g2-mwd1avhv-96-b44b92-new_game | 9 | 396283944 | 255 | 15 | 25 | 0.403 | 256fcafc4f2d | b05465ec5d5d | new_game | 0 | 20 | PASS |
| 129 | g2-mwd1avio-97-1we52v-application_restart | 4 | 3728849657 | 273 | 13 | 24 | 0.524 | 7a356b795172 | ffccfd20e565 | application_restart | 0 | 12 | PASS |
| 130 | g2-mwd1avjh-98-vrrx5d-title_screen_restart | 2 | 924487365 | 300 | 14 | 23 | 0.493 | 2ad7fafd8510 | d3e1a114c848 | title_screen_restart | 0 | 13 | PASS |
| 131 | g2-mwd1avkh-99-baoigq-failure_restart | 6 | 2660442779 | 261 | 13 | 24 | 0.489 | f4363f06584d | 261f81a1d19d | failure_restart | 0 | 18 | PASS |
| 132 | g2-mwd1avlf-9a-17amzj-new_game | 5 | 2180741992 | 291 | 13 | 23 | 0.551 | bf63b565ebe5 | 1a4b4283604e | new_game | 0 | 19 | PASS |
| 133 | g2-mwd1avml-9b-j3xc24-application_restart | 2 | 3818273518 | 300 | 14 | 23 | 0.547 | fecd79a0a664 | b7481e50ad87 | application_restart | 0 | 19 | PASS |
| 134 | g2-mwd1avne-9c-17r0mt4-title_screen_restart | 3 | 1312764285 | 312 | 16 | 25 | 0.492 | 2f1d57bfd718 | be75f7247cdd | title_screen_restart | 0 | 14 | PASS |
| 135 | g2-mwd1avo9-9d-1cmchgb-failure_restart | 8 | 2592600367 | 192 | 15 | 25 | 0.466 | bb945c9873a3 | 19e3bd8d1251 | failure_restart | 0 | 13 | PASS |
| 136 | g2-mwd1avoz-9e-n7yasq-new_game | 0 | 1788465060 | 321 | 15 | 24 | 0.526 | 601dac1babde | 9d5bed5e43ac | new_game | 0 | 18 | PASS |
| 137 | g2-mwd1avq1-9f-14k5igp-application_restart | 9 | 396283944 | 255 | 15 | 25 | 0.479 | 256fcafc4f2d | b05465ec5d5d | application_restart | 0 | 18 | PASS |
| 138 | g2-mwd1avqx-9g-1584q2k-title_screen_restart | 2 | 1311764282 | 300 | 14 | 22 | 0.416 | 324bd9caf397 | 1b635b97416c | title_screen_restart | 0 | 14 | PASS |
| 139 | g2-mwd1avrt-9h-1x15u4w-failure_restart | 1 | 3338572731 | 282 | 13 | 24 | 0.428 | 80853e745aca | 6f7148363c01 | failure_restart | 0 | 13 | PASS |
| 140 | g2-mwd1avsp-9i-26uzvy-new_game | 4 | 1461690813 | 273 | 13 | 24 | 0.519 | 6ec28279f279 | 53148fb46861 | new_game | 0 | 12 | PASS |
| 141 | g2-mwd1avtm-9j-1x1ymvq-application_restart | 6 | 1224340427 | 261 | 13 | 25 | 0.507 | aeb942ea61c2 | 939d5fb9bfb8 | application_restart | 0 | 16 | PASS |
| 142 | g2-mwd1avuf-9k-1dw7o0j-title_screen_restart | 8 | 29588473 | 192 | 15 | 24 | 0.488 | 43b33f705c13 | bacdb308df33 | title_screen_restart | 0 | 11 | PASS |
| 143 | g2-mwd1avvd-9l-1rsnddb-failure_restart | 1 | 148933528 | 282 | 13 | 24 | 0.497 | 4bc5d256cc38 | a23350fcbf76 | failure_restart | 1 | 25 | PASS |
| 144 | g2-mwd1avwg-9m-1fai7av-new_game | 9 | 3733849672 | 255 | 15 | 25 | 0.506 | ebcfcfbacab1 | caa6a6b425ca | new_game | 1 | 22 | PASS |
| 145 | g2-mwd1avxb-9n-swdu3e-application_restart | 6 | 2660442779 | 261 | 13 | 24 | 0.547 | f4363f06584d | 261f81a1d19d | application_restart | 0 | 13 | PASS |
| 146 | g2-mwd1avy4-9o-15yzldg-title_screen_restart | 9 | 4064623931 | 255 | 15 | 25 | 0.518 | 64d47d5521d7 | c7232e421259 | title_screen_restart | 0 | 13 | PASS |
| 147 | g2-mwd1avz3-9p-7xpnuq-failure_restart | 0 | 7000 | 321 | 15 | 24 | 0.541 | fb5bb8dc108d | 44ccd3be0086 | failure_restart | 0 | 18 | PASS |
| 148 | g2-mwd1aw00-9q-x4d6w2-new_game | 8 | 3127803809 | 192 | 15 | 24 | 0.467 | 5450f43ad60e | 17c9b90a7dbc | new_game | 0 | 14 | PASS |
| 149 | g2-mwd1aw0p-9r-8r2wvd-application_restart | 3 | 3340572737 | 312 | 16 | 24 | 0.418 | ec9632a902ed | 08103c52fd46 | application_restart | 0 | 16 | PASS |
| 150 | g2-mwd1aw1t-9s-115sorl-title_screen_restart | 0 | 387283917 | 321 | 15 | 24 | 0.523 | d1cb650c3414 | 038902118e19 | title_screen_restart | 0 | 19 | PASS |
| 151 | g2-mwd1aw2x-9t-13vhrcq-failure_restart | 9 | 3585923147 | 255 | 15 | 24 | 0.531 | 1960ee4f0cd0 | d886dc4a18c6 | failure_restart | 0 | 18 | PASS |
| 152 | g2-mwd1aw3t-9u-1ipm19i-new_game | 4 | 4059623916 | 273 | 13 | 25 | 0.504 | e8ee799a4e0b | b33fb5bc70da | new_game | 0 | 17 | PASS |
| 153 | g2-mwd1aw4w-9v-1qlqx53-application_restart | 2 | 1551114674 | 300 | 14 | 25 | 0.413 | a5e7ff8f2669 | 24b57db98b4f | application_restart | 0 | 21 | PASS |
| 154 | g2-mwd1aw5t-9w-skv8ds-title_screen_restart | 8 | 2592600367 | 192 | 15 | 25 | 0.45 | bb945c9873a3 | 19e3bd8d1251 | title_screen_restart | 0 | 12 | PASS |
| 155 | g2-mwd1aw6g-9x-1th46ll-failure_restart | 4 | 1405188155 | 273 | 13 | 24 | 0.598 | a37523549c3f | 45da8a457582 | failure_restart | 0 | 14 | PASS |
| 156 | g2-mwd1aw7c-9y-1g4qads-new_game | 9 | 3107222363 | 255 | 15 | 22 | 0.516 | 14f04ca3e972 | 85cc7aa0131b | new_game | 0 | 15 | PASS |
| 157 | g2-mwd1aw8f-9z-qot92m-application_restart | 6 | 3822273530 | 261 | 13 | 24 | 0.553 | 1edecdfcb3ac | a20e1b4c4ce6 | application_restart | 1 | 23 | PASS |
| 158 | g2-mwd1aw9q-a0-t22vbo-title_screen_restart | 4 | 1940391597 | 273 | 13 | 24 | 0.526 | eea1a0fc9a92 | b935672e90f3 | title_screen_restart | 2 | 31 | PASS |
| 159 | g2-mwd1awas-a1-1n8exh-failure_restart | 3 | 3007009 | 312 | 16 | 25 | 0.5 | c2fbe7c010ec | 8cadaafdbe71 | failure_restart | 0 | 21 | PASS |
| 160 | g2-mwd1awbw-a2-afk46r-new_game | 0 | 3964200037 | 321 | 15 | 24 | 0.507 | 499215577201 | 25d27bbc2ab1 | new_game | 0 | 16 | PASS |
| 161 | g2-mwd1awd4-a3-1hjxgqv-application_restart | 1 | 57509661 | 282 | 13 | 24 | 0.514 | 8285669642d1 | 5d5613ccdc03 | application_restart | 0 | 21 | PASS |
| 162 | g2-mwd1awe3-a4-2ctz7m-title_screen_restart | 9 | 1410188170 | 255 | 15 | 25 | 0.501 | 1cc867b7be8d | f6d3916cf3cf | title_screen_restart | 0 | 17 | PASS |
| 163 | g2-mwd1awf2-a5-tsxlsy-failure_restart | 2 | 1551114674 | 300 | 14 | 25 | 0.526 | a5e7ff8f2669 | 24b57db98b4f | failure_restart | 0 | 17 | PASS |
| 164 | g2-mwd1awgh-a6-i8omsz-new_game | 5 | 1314764291 | 291 | 13 | 24 | 0.587 | c141b50e7b2c | a12477f596f1 | new_game | 2 | 30 | PASS |
| 165 | g2-mwd1awhb-a7-1izb9p3-application_restart | 4 | 60509670 | 273 | 13 | 25 | 0.543 | 17fd0c8f65aa | 672c4ee323b5 | application_restart | 0 | 15 | PASS |
| 166 | g2-mwd1awi3-a8-1ki0640-title_screen_restart | 0 | 1309764276 | 321 | 15 | 25 | 0.395 | 273546cbcf1a | 33b37613dbfb | title_screen_restart | 0 | 13 | PASS |
| 167 | g2-mwd1awji-a9-1d5gswm-failure_restart | 4 | 778560846 | 273 | 13 | 22 | 0.583 | 1fb83f863527 | 60372016c395 | failure_restart | 1 | 29 | PASS |
| 168 | g2-mwd1awkg-aa-15dxlag-new_game | 9 | 452786602 | 255 | 15 | 25 | 0.506 | 035d21abcf9b | bd5474ddfb13 | new_game | 0 | 18 | PASS |
| 169 | g2-mwd1awly-ab-1xptgeq-application_restart | 5 | 1075413899 | 291 | 13 | 25 | 0.499 | c5694326642f | dcfd0a89638f | application_restart | 2 | 38 | PASS |
| 170 | g2-mwd1awn5-ac-16fl693-title_screen_restart | 1 | 148933528 | 282 | 13 | 24 | 0.508 | 4bc5d256cc38 | a23350fcbf76 | title_screen_restart | 1 | 25 | PASS |
| 171 | g2-mwd1awo7-ad-10tuw29-failure_restart | 9 | 2663442788 | 255 | 15 | 25 | 0.535 | 9df9ef3db22c | 9612eed18110 | failure_restart | 1 | 24 | PASS |
| 172 | g2-mwd1awp0-ae-11e66d7-new_game | 8 | 29588473 | 192 | 15 | 24 | 0.477 | 43b33f705c13 | bacdb308df33 | new_game | 0 | 11 | PASS |
| 173 | g2-mwd1awpl-af-1mz7yef-application_restart | 6 | 3674347005 | 261 | 13 | 24 | 0.468 | ea170f5ef61e | 478af308aa88 | application_restart | 0 | 11 | PASS |
| 174 | g2-mwd1awqf-ag-15vwuqv-title_screen_restart | 2 | 833063498 | 300 | 14 | 25 | 0.427 | 5367e65c9896 | 04a38a5680c7 | title_screen_restart | 0 | 16 | PASS |
| 175 | g2-mwd1awr9-ah-g4h94m-failure_restart | 9 | 2480595054 | 255 | 15 | 25 | 0.599 | 0676643ca306 | 8cb35bb67f9c | failure_restart | 0 | 14 | PASS |
| 176 | g2-mwd1aws7-ai-lotfru-new_game | 8 | 1557114692 | 192 | 15 | 23 | 0.565 | 45f03188133d | 607c0580732f | new_game | 1 | 19 | PASS |
| 177 | g2-mwd1awsy-aj-1yskm8s-application_restart | 7 | 3583923141 | 312 | 14 | 24 | 0.477 | c797bc3b11ae | 270d6e7b36f8 | application_restart | 0 | 17 | PASS |
| 178 | g2-mwd1awtr-ak-17gyues-title_screen_restart | 9 | 1558114695 | 255 | 15 | 24 | 0.582 | a341a5eaa299 | b9f1e76e9a57 | title_screen_restart | 0 | 11 | PASS |
| 179 | g2-mwd1awv0-al-laz7vi-failure_restart | 6 | 3730849663 | 261 | 13 | 25 | 0.382 | 5041c1a8baf8 | c43545b3972a | failure_restart | 1 | 30 | PASS |
| 180 | g2-mwd1awvq-am-tyhigo-new_game | 4 | 60509670 | 273 | 13 | 25 | 0.502 | 17fd0c8f65aa | 672c4ee323b5 | new_game | 0 | 13 | PASS |
| 181 | g2-mwd1awwi-an-1c87p9e-application_restart | 2 | 3430996601 | 300 | 14 | 24 | 0.546 | 410966a092c9 | a7a085e46966 | application_restart | 0 | 13 | PASS |
| 182 | g2-mwd1awxl-ao-1s4u3z2-title_screen_restart | 8 | 2923374626 | 192 | 15 | 25 | 0.402 | 7739c011069d | 5fbc31c75b68 | title_screen_restart | 0 | 17 | PASS |
| 183 | g2-mwd1awyd-ap-w2pfe5-failure_restart | 0 | 535210442 | 321 | 15 | 24 | 0.413 | 9d910072eeb2 | 3babb5d88a3f | failure_restart | 0 | 18 | PASS |
| 184 | g2-mwd1awzv-aq-19sqzoj-new_game | 7 | 1943391606 | 312 | 14 | 22 | 0.517 | bddd1e34f507 | d4b9fee46f48 | new_game | 1 | 30 | PASS |
| 185 | g2-mwd1ax0w-ar-1qttxiy-application_restart | 9 | 452786602 | 255 | 15 | 25 | 0.501 | 035d21abcf9b | bd5474ddfb13 | application_restart | 0 | 18 | PASS |
| 186 | g2-mwd1ax1q-as-1c91rwm-title_screen_restart | 0 | 443786575 | 321 | 15 | 24 | 0.463 | 528245ae2304 | ee39cb628471 | title_screen_restart | 0 | 15 | PASS |
| 187 | g2-mwd1ax39-at-iols83-failure_restart | 3 | 4206550438 | 312 | 16 | 23 | 0.483 | 55f5a21f63bb | 78ad1f94990e | failure_restart | 1 | 31 | PASS |
| 188 | g2-mwd1ax48-au-tm883j-new_game | 2 | 2804369292 | 300 | 14 | 23 | 0.518 | d02c7e7094b8 | db17ac0c38fb | new_game | 0 | 16 | PASS |
| 189 | g2-mwd1ax5a-av-1i4cf9z-application_restart | 9 | 3677347014 | 255 | 15 | 23 | 0.498 | 75d2b75d35fc | 654129bd0d5d | application_restart | 0 | 19 | PASS |
| 190 | g2-mwd1ax66-aw-1np4bj0-title_screen_restart | 1 | 444786578 | 282 | 13 | 24 | 0.391 | 03447fc8a488 | 86c3e720275c | title_screen_restart | 0 | 17 | PASS |
| 191 | g2-mwd1ax75-ax-1d9w0pf-failure_restart | 2 | 3726849651 | 300 | 14 | 23 | 0.435 | 51d4b2024981 | a6816417435b | failure_restart | 0 | 21 | PASS |
| 192 | g2-mwd1ax8a-ay-zz8ihv-new_game | 5 | 1702041208 | 291 | 13 | 24 | 0.544 | 5a54425dea14 | 798966eb166b | new_game | 0 | 18 | PASS |
| 193 | g2-mwd1ax93-az-7am0nb-application_restart | 4 | 2031815464 | 273 | 13 | 23 | 0.535 | d6031e4dd9a5 | 75fb910458a9 | application_restart | 0 | 13 | PASS |
| 194 | g2-mwd1axa7-b0-1n1n91e-title_screen_restart | 8 | 4211550453 | 192 | 15 | 23 | 0.474 | 45932f0116d9 | c8e7d328ee63 | title_screen_restart | 1 | 25 | PASS |
| 195 | g2-mwd1axay-b1-18mq3ms-failure_restart | 0 | 56509658 | 321 | 15 | 25 | 0.534 | dc26f813d993 | 238f86ee7b7d | failure_restart | 0 | 17 | PASS |
| 196 | g2-mwd1axc3-b2-1j7iyan-new_game | 8 | 4141708035 | 192 | 15 | 25 | 0.556 | 066e2e5bab18 | 4bf9c30dee45 | new_game | 1 | 20 | PASS |
| 197 | g2-mwd1axcs-b3-bny41p-application_restart | 2 | 3578923126 | 300 | 14 | 25 | 0.506 | a8441489c96c | 4e5c858cbb73 | application_restart | 0 | 17 | PASS |
| 198 | g2-mwd1axdq-b4-10yn0on-title_screen_restart | 7 | 2570018915 | 312 | 14 | 24 | 0.547 | 3e9eb2596b56 | 2602b1e1db4b | title_screen_restart | 0 | 17 | PASS |
| 199 | g2-mwd1axf5-b5-3r7wdd-failure_restart | 0 | 147933525 | 321 | 15 | 24 | 0.554 | 77aa3c42add5 | a38ae365a28b | failure_restart | 1 | 29 | PASS |
| 200 | g2-mwd1axgc-b6-15gg4r1-new_game | 2 | 2952295817 | 300 | 14 | 24 | 0.548 | d2b22cb81fe8 | c839afc6fc0e | new_game | 0 | 20 | PASS |

</details>

## 失败案例与原因

本次运行 **0** 个生成失败案例；每次重试的原因均记录在 `random-generation-report.json` 的逐局 `retries` 字段。

## 测试性质说明

- 运行时：两关各 200 局真实调用 `createNewGame`，真实生成、真实签名、真实校验。
- 相似度：用**真实牌面**两两计算 `layoutSimilarity`（层占位格 Jaccard 均值 ×0.5 + 整体轮廓 Jaccard ×0.5），不是签名比较。
- 静态审计：三种重新开局入口通过读取 `src/main.js` 源码确认全部走统一入口；未冒充浏览器实测。
- 重启模拟：把存档 JSON 写入磁盘再读回，继续生成并验证差异化。
- 浏览器实际运行 / Windows 安装卸载测试不在本文件覆盖范围，见 `FINAL_ACCEPTANCE.md`。
