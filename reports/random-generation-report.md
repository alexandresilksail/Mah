# 双关卡各 100 局随机生成压力测试报告

> 本文件由 `node test-random-generation.js` **真实运行**自动生成，不是静态 PASS 模板。

- 运行时间：2026-11-13T12:40:25.679Z
- Git commit：`e71486e75c24154e6bffb64db509a30d0791f416`
- 断言：通过 **7788**，失败 **0**
- 总耗时：13154 ms
- 布局签名算法：`MAH-LAYOUT-SIG-v1/SHA-256`（SHA-256，浏览器与 Node 共用同一实现）
- 历史窗口：L1 最近 3 局（冻结）/ L2 最近 10 局；第二关 20 套模板 + 模板级 / 几何级双重去重；重复阈值 sim ≥ 0.6；重试上限 50 次

## 全局

| 项 | 值 |
|---|---|
| 总生成局数 | 200 |
| gameId 唯一数 | 202 / 202 |
| 布局签名总数 / 去重 | 200 / 200 |
| 生成失败次数 | 0 |
| 重试总次数 | 6 |
| 平均单局生成耗时 | 24.29 ms |
| 失败案例 | 0 |

## 滑动窗口相似度（L1 三局 / L2 十局）

| 关卡 | 窗口对数 | 均值 | P95 | 最大值 | 阈值 | 判定 |
|---|---|---|---|---|---|---|
| L1 | 294 | 0.2707 | 0.5128 | 0.5838 | 0.6 | ✓ 全部 < 0.60 |
| L2 | 945 | 0.2611 | 0.3802 | 0.5628 | 0.6 | ✓ 全部 < 0.60 |

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
| 耗时 | 2077 ms |
| 牌数范围 | 24 – 48 |
| 开局可点牌范围 | 14 – 41 |
| 档位分布 | {"0":25,"1":25,"2":25,"3":25} |
| 牌数分布 | {"24":25,"30":25,"36":25,"48":25} |
| 牌型数分布 | {"8":25,"10":25,"12":25,"16":25} |
| 生成原因分布 | {"application_restart":25,"title_screen_restart":25,"failure_restart":25,"new_game":25} |
| 布局签名去重 | 100 / 100 |
| 最近 3 局总牌数重复 | 0 |
| 最近 3 局布局签名重复 | 0 |
| 最近 3 局几何签名重复 | 0 |
| 重试次数（失败重试合计） | 4 |
| 生成失败次数 | 0 |
| 滑窗 sim 均值 / P95 / 最大 | 0.2707 / 0.5128 / 0.5838 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 13.49 ms |

<details><summary>完整 100 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | sim最大 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g1-mweyspgu-1-1an98pk-application_restart | 1 | 2155339295 | 30 | 10 | 26 | 0 | 6008ea31accf | ec06122a920e | application_restart | 0 | 8 | PASS |
| 2 | g1-mweysphu-2-1bjk77o-title_screen_restart | 3 | 4207252379 | 48 | 16 | 36 | 0.267 | 9ef1987e33d8 | ac02e0b83c68 | title_screen_restart | 0 | 20 | PASS |
| 3 | g1-mweyspir-3-1y8ne1y-failure_restart | 0 | 2081241457 | 24 | 8 | 19 | 0.374 | b79d6f91a826 | bde426d124ba | failure_restart | 0 | 18 | PASS |
| 4 | g1-mweyspj4-4-1d05s1x-new_game | 2 | 2001268940 | 36 | 12 | 27 | 0.408 | eabc89c87587 | 6293e5d0a213 | new_game | 0 | 8 | PASS |
| 5 | g1-mweyspjl-5-end99k-application_restart | 1 | 740628288 | 30 | 10 | 30 | 0.465 | 17294fe6bd5f | 38817c670d38 | application_restart | 0 | 12 | PASS |
| 6 | g1-mweyspk0-6-68m972-title_screen_restart | 3 | 2620265305 | 48 | 16 | 35 | 0.209 | c3fc36941737 | bb0026d7b022 | title_screen_restart | 0 | 11 | PASS |
| 7 | g1-mweyspki-7-1hiqf3d-failure_restart | 0 | 670080711 | 24 | 8 | 19 | 0.395 | ecff0008a414 | 58d6c0d2319a | failure_restart | 0 | 11 | PASS |
| 8 | g1-mweyspku-8-xo4xy9-new_game | 2 | 264453902 | 36 | 12 | 27 | 0.437 | ad4b6c1af090 | 6c2c6dae1c90 | new_game | 0 | 7 | PASS |
| 9 | g1-mweyspl7-9-cyjdqa-application_restart | 1 | 3521070540 | 30 | 10 | 30 | 0.452 | 7eea4aa2098e | 82d0898c73e2 | application_restart | 0 | 8 | PASS |
| 10 | g1-mweysplq-a-1tj89qd-title_screen_restart | 3 | 236393182 | 48 | 16 | 35 | 0.578 | 1202613eb9d3 | fdc4aa1487d7 | title_screen_restart | 0 | 15 | PASS |
| 11 | g1-mweyspme-b-j9usye-failure_restart | 0 | 1919108907 | 24 | 8 | 24 | 0.239 | 95662b209756 | 57abec8abbe1 | failure_restart | 0 | 13 | PASS |
| 12 | g1-mweyspmr-c-qgrgbs-new_game | 2 | 2921209998 | 36 | 12 | 26 | 0.283 | 44099906dff1 | 47a9ae2fae59 | new_game | 0 | 10 | PASS |
| 13 | g1-mweyspnc-d-yep6ug-application_restart | 1 | 1845007991 | 30 | 10 | 25 | 0.504 | 559e3a36e2cb | d749b724d43e | application_restart | 0 | 13 | PASS |
| 14 | g1-mweyspos-e-11ucuil-title_screen_restart | 3 | 2472544248 | 48 | 16 | 39 | 0.536 | 44ed456b9579 | f6448f9a9e79 | title_screen_restart | 0 | 47 | PASS |
| 15 | g1-mweyspr1-f-1eg4u0y-failure_restart | 0 | 3206284765 | 24 | 8 | 20 | 0.28 | b7390e1e7e96 | 9acdbe504b29 | failure_restart | 0 | 41 | PASS |
| 16 | g1-mweysprd-g-1a0r15j-new_game | 2 | 1987755965 | 36 | 12 | 32 | 0.211 | e46f7a0821a3 | f4171b31455d | new_game | 0 | 9 | PASS |
| 17 | g1-mweysprt-h-5sjvu-application_restart | 1 | 2739711394 | 30 | 10 | 26 | 0.515 | f86db63ce1e6 | 83cb866fb55a | application_restart | 0 | 10 | PASS |
| 18 | g1-mweyspt6-i-1cuy76x-title_screen_restart | 3 | 963784352 | 48 | 16 | 33 | 0.416 | b416a3399f82 | ca13a818f6fe | title_screen_restart | 0 | 44 | PASS |
| 19 | g1-mweyspul-j-phfkpl-failure_restart | 0 | 1888009940 | 24 | 8 | 24 | 0.584 | 79fbdaf33def | b4c05587da35 | failure_restart | 0 | 25 | PASS |
| 20 | g1-mweysput-k-1vqhiwh-new_game | 2 | 3764991679 | 36 | 12 | 28 | 0.336 | f60771ebc979 | 0683c10889d0 | new_game | 0 | 6 | PASS |
| 21 | g1-mweyspv5-l-n2kfvn-application_restart | 1 | 926804803 | 30 | 10 | 22 | 0.412 | 616688d40c59 | 97f4e1e8e04d | application_restart | 0 | 7 | PASS |
| 22 | g1-mweyspvm-m-1g0xfb-title_screen_restart | 3 | 2355773591 | 48 | 16 | 36 | 0.4 | 16e4eed8263d | cd9291f9771e | title_screen_restart | 0 | 14 | PASS |
| 23 | g1-mweyspwa-n-1o0tqoi-failure_restart | 0 | 4135654158 | 24 | 8 | 17 | 0.479 | 0981a6a9a76f | 140be6ecf7ba | failure_restart | 0 | 12 | PASS |
| 24 | g1-mweyspwk-o-1lfacz4-new_game | 2 | 656747565 | 36 | 12 | 27 | 0.519 | 1ff4f2cf498a | 476cf58fde18 | new_game | 0 | 7 | PASS |
| 25 | g1-mweyspwy-p-1u29sv8-application_restart | 1 | 707084465 | 30 | 10 | 25 | 0.448 | 3833562138bf | 6757fb37fbf1 | application_restart | 0 | 9 | PASS |
| 26 | g1-mweyspy5-q-5fl4sx-title_screen_restart | 3 | 1288973860 | 48 | 16 | 32 | 0.318 | 387fc9edc617 | f79414aa2629 | title_screen_restart | 0 | 41 | PASS |
| 27 | g1-mweysq09-r-1355597-failure_restart | 0 | 3414058778 | 24 | 8 | 15 | 0.564 | 67ab736090ac | 02fed593c584 | failure_restart | 0 | 36 | PASS |
| 28 | g1-mweysq0i-s-8ijpl5-new_game | 2 | 2375218675 | 36 | 12 | 32 | 0.281 | c5d8916c6af2 | aad663376de5 | new_game | 0 | 6 | PASS |
| 29 | g1-mweysq0t-t-1rhvdfg-application_restart | 1 | 2256464952 | 30 | 10 | 26 | 0.467 | 69afe5a6f325 | 172d848e8857 | application_restart | 0 | 6 | PASS |
| 30 | g1-mweysq1w-u-1pddyzj-title_screen_restart | 3 | 1483402482 | 48 | 16 | 32 | 0.296 | 0f68e30c624e | 6694d58fce8c | title_screen_restart | 0 | 36 | PASS |
| 31 | g1-mweysq40-v-za9s50-failure_restart | 0 | 3497995218 | 24 | 8 | 21 | 0.393 | f39918919681 | 57ddf01161cb | failure_restart | 0 | 39 | PASS |
| 32 | g1-mweysq49-w-1x7jece-new_game | 2 | 2193216287 | 36 | 12 | 33 | 0.528 | 6be40227aca2 | c0ff990f5632 | new_game | 0 | 6 | PASS |
| 33 | g1-mweysq4n-x-z2i5i0-application_restart | 1 | 22208256 | 30 | 10 | 20 | 0.444 | 2f011336e493 | 9a468104116e | application_restart | 0 | 10 | PASS |
| 34 | g1-mweysq5h-y-1qhipei-title_screen_restart | 3 | 4224227650 | 48 | 16 | 34 | 0.496 | 8e6fc2e6651a | de668d91887c | title_screen_restart | 0 | 23 | PASS |
| 35 | g1-mweysq6o-z-1kimv9q-failure_restart | 0 | 141518669 | 24 | 8 | 16 | 0.114 | c56eb46a6fe9 | 454be0844295 | failure_restart | 0 | 23 | PASS |
| 36 | g1-mweysq6z-10-1wgqi0g-new_game | 2 | 1602834429 | 36 | 12 | 26 | 0.485 | 3f279744d03f | 2c62004b0599 | new_game | 0 | 7 | PASS |
| 37 | g1-mweysq7d-11-1w0b04d-application_restart | 1 | 4072221669 | 30 | 10 | 22 | 0.275 | 1fac95895a28 | 58567f8109e7 | application_restart | 0 | 7 | PASS |
| 38 | g1-mweysq7v-12-1cqc22o-title_screen_restart | 3 | 141059067 | 48 | 16 | 35 | 0.291 | e2ac3ad9d202 | 374b577ce5e4 | title_screen_restart | 0 | 12 | PASS |
| 39 | g1-mweysq8g-13-vbyt5x-failure_restart | 0 | 3930431026 | 24 | 8 | 21 | 0.409 | 5323b1753519 | c1ca5674ff23 | failure_restart | 0 | 12 | PASS |
| 40 | g1-mweysq8u-14-1fjrxjk-new_game | 2 | 198272491 | 36 | 12 | 26 | 0.456 | aba821b7e673 | ea91c4fec054 | new_game | 0 | 11 | PASS |
| 41 | g1-mweysq9c-15-1ch95en-application_restart | 1 | 3714139788 | 30 | 10 | 30 | 0.29 | 8766b13cec33 | 7f9ead263b05 | application_restart | 0 | 10 | PASS |
| 42 | g1-mweysq9r-16-1cq9ccw-title_screen_restart | 3 | 1775109653 | 48 | 16 | 35 | 0.422 | 5a289431949f | 5982829558e2 | title_screen_restart | 0 | 12 | PASS |
| 43 | g1-mweysqag-17-5qso0h-failure_restart | 0 | 4040099843 | 24 | 8 | 14 | 0.264 | 1039d98fe595 | 8de2bfa15237 | failure_restart | 0 | 14 | PASS |
| 44 | g1-mweysqas-18-12dyt3p-new_game | 2 | 389824416 | 36 | 12 | 27 | 0.393 | e69b941bc45c | 89a74d087c63 | new_game | 0 | 9 | PASS |
| 45 | g1-mweysqb8-19-k7rd3e-application_restart | 1 | 2226816699 | 30 | 10 | 26 | 0.43 | 2c2ac21a2a00 | 9bf16e4ca102 | application_restart | 0 | 10 | PASS |
| 46 | g1-mweysqbl-1a-1ddktef-title_screen_restart | 3 | 3203153529 | 48 | 16 | 41 | 0.261 | 8619280a37d5 | 3c22cd1b56ed | title_screen_restart | 0 | 10 | PASS |
| 47 | g1-mweysqc3-1b-f2hh6d-failure_restart | 0 | 3598278505 | 24 | 8 | 20 | 0.236 | 4c039fd488bd | 4751c32464e0 | failure_restart | 0 | 10 | PASS |
| 48 | g1-mweysqcd-1c-m99evg-new_game | 2 | 4022949406 | 36 | 12 | 27 | 0.48 | a549e9f70aed | 0d96eae7bebd | new_game | 0 | 8 | PASS |
| 49 | g1-mweysqcv-1d-1y3u9pg-application_restart | 1 | 1440736619 | 30 | 10 | 25 | 0.452 | aa1943a85262 | 51635172261d | application_restart | 1 | 13 | PASS |
| 50 | g1-mweysqda-1e-gmanw-title_screen_restart | 3 | 3416083915 | 48 | 16 | 34 | 0.225 | 68a896950429 | f01d284ec5ae | title_screen_restart | 0 | 11 | PASS |
| 51 | g1-mweysqdx-1g-1rvlr86-failure_restart | 0 | 2189525959 | 24 | 8 | 20 | 0.494 | 9a227772946f | e39b1da9606f | failure_restart | 0 | 3 | PASS |
| 52 | g1-mweysqe7-1h-1uvkwhc-new_game | 2 | 2468741615 | 36 | 12 | 32 | 0.438 | e89acecb0531 | 8dbf1d50a8fa | new_game | 0 | 7 | PASS |
| 53 | g1-mweysqei-1i-e4q1rj-application_restart | 1 | 172702555 | 30 | 10 | 26 | 0.451 | eba2ba2b1520 | 9a97639478d5 | application_restart | 0 | 7 | PASS |
| 54 | g1-mweysqf7-1j-nj2xuf-title_screen_restart | 3 | 824341461 | 48 | 16 | 34 | 0.376 | 2748b5a4c946 | e53dd20873da | title_screen_restart | 0 | 22 | PASS |
| 55 | g1-mweysqgf-1k-1ab2zbf-failure_restart | 0 | 617868069 | 24 | 8 | 24 | 0.539 | 57e4c892c62a | 595b96621930 | failure_restart | 0 | 25 | PASS |
| 56 | g1-mweysqgq-1l-1p843k8-new_game | 2 | 3486488366 | 36 | 12 | 33 | 0.171 | 08bde9a74f65 | 3914f6866752 | new_game | 0 | 8 | PASS |
| 57 | g1-mweysqh3-1m-s1i3k1-application_restart | 1 | 3897153707 | 30 | 10 | 26 | 0.238 | ace2fe2d0f2f | 3e8f02c1ab43 | application_restart | 0 | 7 | PASS |
| 58 | g1-mweysqho-1n-nodidg-title_screen_restart | 3 | 532189728 | 48 | 16 | 28 | 0.446 | 4aa8ad9f0b2c | 9054ded7b3d1 | title_screen_restart | 0 | 16 | PASS |
| 59 | g1-mweysqic-1o-1qh0q0r-failure_restart | 0 | 1441070571 | 24 | 8 | 20 | 0.556 | e02e6b00f41a | 5821d82a695b | failure_restart | 0 | 14 | PASS |
| 60 | g1-mweysqin-1p-1mocv4d-new_game | 2 | 3446602426 | 36 | 12 | 31 | 0.261 | 750c112afa70 | 8cdff46e7817 | new_game | 0 | 8 | PASS |
| 61 | g1-mweysqj4-1q-p6ui7s-application_restart | 1 | 166702327 | 30 | 10 | 21 | 0.515 | 7e6bdd2d11e2 | b2e72fdb8126 | application_restart | 0 | 13 | PASS |
| 62 | g1-mweysqka-1r-15ytxi4-title_screen_restart | 3 | 3606465846 | 48 | 16 | 36 | 0.463 | c4babe6961f0 | 176881075cee | title_screen_restart | 0 | 34 | PASS |
| 63 | g1-mweysqlj-1s-125vz4y-failure_restart | 0 | 3624522836 | 24 | 8 | 19 | 0.449 | db8d29f03e0b | 4e96b77ebc8b | failure_restart | 0 | 26 | PASS |
| 64 | g1-mweysqlw-1t-lbiv19-new_game | 2 | 3556338799 | 36 | 12 | 27 | 0.235 | 2cb394205a55 | 9b0ec266ad5f | new_game | 1 | 11 | PASS |
| 65 | g1-mweysqmb-1u-12ijlrm-application_restart | 1 | 219225376 | 30 | 10 | 25 | 0.465 | f7190f1452fe | 9152c17c6f69 | application_restart | 0 | 9 | PASS |
| 66 | g1-mweysqml-1v-1hky4hn-title_screen_restart | 3 | 3158773938 | 48 | 16 | 37 | 0.506 | e1f1c6a36642 | 88f491973ef5 | title_screen_restart | 0 | 9 | PASS |
| 67 | g1-mweysqmz-1w-1alff8v-failure_restart | 0 | 2502757255 | 24 | 8 | 20 | 0.422 | fa353b6a24ee | 6f3c6893b5a5 | failure_restart | 0 | 7 | PASS |
| 68 | g1-mweysqn9-1x-1inubpm-new_game | 2 | 1071333358 | 36 | 12 | 28 | 0.361 | 216569c97a0f | 62eb8595caa2 | new_game | 0 | 9 | PASS |
| 69 | g1-mweysqnn-1y-12ys3ff-application_restart | 1 | 586768852 | 30 | 10 | 26 | 0.506 | dba379b86d67 | 29cd68e8af92 | application_restart | 0 | 8 | PASS |
| 70 | g1-mweysqo5-1z-184eivc-title_screen_restart | 3 | 2295317347 | 48 | 16 | 33 | 0.201 | fe11bfa4536f | fb53f55dbfef | title_screen_restart | 0 | 15 | PASS |
| 71 | g1-mweysqot-20-ck3qr7-failure_restart | 0 | 3441575514 | 24 | 8 | 19 | 0.465 | 3fb175fd4e77 | fa89f42e9a67 | failure_restart | 0 | 13 | PASS |
| 72 | g1-mweysqp1-21-2u02le-new_game | 2 | 3543500884 | 36 | 12 | 32 | 0.502 | e09192e9fb53 | b2718857b522 | new_game | 0 | 6 | PASS |
| 73 | g1-mweysqpb-22-1wk1zrr-application_restart | 1 | 1906646424 | 30 | 10 | 25 | 0.215 | b3b7ef5a780a | 00021e9cbff4 | application_restart | 0 | 6 | PASS |
| 74 | g1-mweysqpl-23-12jktl4-title_screen_restart | 3 | 2834871428 | 48 | 16 | 35 | 0.387 | d8f43ea3057e | f7a665019e4d | title_screen_restart | 0 | 7 | PASS |
| 75 | g1-mweysqpx-24-93df8j-failure_restart | 0 | 1613612327 | 24 | 8 | 20 | 0.149 | a809cc878deb | 8169cd0aaf68 | failure_restart | 0 | 6 | PASS |
| 76 | g1-mweysqq6-25-9qeasg-new_game | 2 | 2231020710 | 36 | 12 | 33 | 0.324 | 505db66b73ef | 873ca2c788ea | new_game | 0 | 6 | PASS |
| 77 | g1-mweysqqi-26-11h8zio-application_restart | 1 | 2973360331 | 30 | 10 | 21 | 0.521 | 4d3fcd68cf92 | 453fd8ec513f | application_restart | 0 | 9 | PASS |
| 78 | g1-mweysqr7-27-1h49cfc-title_screen_restart | 3 | 1901785623 | 48 | 16 | 36 | 0.494 | cc161bfbecf4 | fcc3a099a867 | title_screen_restart | 0 | 19 | PASS |
| 79 | g1-mweysqs0-28-1dzejbl-failure_restart | 0 | 1091322354 | 24 | 8 | 20 | 0.518 | 8b1c80c0fb03 | f1f2880a59e2 | failure_restart | 0 | 14 | PASS |
| 80 | g1-mweysqs8-29-1i0jouc-new_game | 2 | 136787977 | 36 | 12 | 28 | 0.236 | 8e1cac903afd | e9f4abf59b59 | new_game | 0 | 6 | PASS |
| 81 | g1-mweysqsi-2a-1e0nnzw-application_restart | 1 | 638548466 | 30 | 10 | 30 | 0.518 | f62ac0283634 | 1a05a7ff1cee | application_restart | 0 | 6 | PASS |
| 82 | g1-mweysqsx-2b-q00ys2-title_screen_restart | 3 | 896274047 | 48 | 16 | 31 | 0.535 | c0b02fa3fe76 | 8d201c34f964 | title_screen_restart | 0 | 11 | PASS |
| 83 | g1-mweysqti-2c-tpimuf-failure_restart | 0 | 2130064870 | 24 | 8 | 14 | 0.485 | 74efddf46af6 | 13ecc41e437f | failure_restart | 0 | 12 | PASS |
| 84 | g1-mweysqtu-2d-1aey7ys-new_game | 2 | 247140577 | 36 | 12 | 28 | 0.512 | 750a41e1ae9f | e4686fc75da2 | new_game | 0 | 9 | PASS |
| 85 | g1-mweysqu9-2e-uaf83k-application_restart | 1 | 1411768994 | 30 | 10 | 25 | 0.343 | c5719e77ee01 | ee375eacaeda | application_restart | 0 | 9 | PASS |
| 86 | g1-mweysquy-2f-1w31rt2-title_screen_restart | 3 | 3729560371 | 48 | 16 | 34 | 0.2 | f67694824160 | c42c1048b85d | title_screen_restart | 0 | 21 | PASS |
| 87 | g1-mweysqwb-2g-lzoipv-failure_restart | 0 | 212544133 | 24 | 8 | 14 | 0.377 | 2114a4b173cf | 08cd1ba73ef4 | failure_restart | 0 | 24 | PASS |
| 88 | g1-mweysqwo-2h-16wflqf-new_game | 2 | 3229167659 | 36 | 12 | 33 | 0.435 | d4417e858f7a | 365c6c0d6ef5 | new_game | 0 | 9 | PASS |
| 89 | g1-mweysqx1-2i-jn12m2-application_restart | 1 | 1044426918 | 30 | 10 | 21 | 0.381 | 581364cefed3 | 9be8969b7094 | application_restart | 0 | 9 | PASS |
| 90 | g1-mweysqxu-2j-1m53wtw-title_screen_restart | 3 | 2777832064 | 48 | 16 | 33 | 0.414 | a3fb9ea081df | 666eea5c3401 | title_screen_restart | 0 | 24 | PASS |
| 91 | g1-mweysqyu-2k-4onglv-failure_restart | 0 | 2700959445 | 24 | 8 | 20 | 0.248 | 59a91dfef377 | 4fd366081c97 | failure_restart | 0 | 19 | PASS |
| 92 | g1-mweysqz3-2l-1hjk7di-new_game | 2 | 1073592858 | 36 | 12 | 27 | 0.48 | 344344fa4a7c | a614dd4e600e | new_game | 0 | 6 | PASS |
| 93 | g1-mweysqzd-2m-5q0k6g-application_restart | 1 | 1544364236 | 30 | 10 | 26 | 0.577 | 284742d37757 | b594805181ff | application_restart | 0 | 7 | PASS |
| 94 | g1-mweysqzq-2n-ld2tnn-title_screen_restart | 3 | 3181291206 | 48 | 16 | 34 | 0.391 | 036e8e29379e | 8d3f137ca673 | title_screen_restart | 0 | 11 | PASS |
| 95 | g1-mweysr06-2o-3rnl8t-failure_restart | 0 | 1985368047 | 24 | 8 | 21 | 0.472 | 4240bd25623c | 8ae14a30a671 | failure_restart | 0 | 8 | PASS |
| 96 | g1-mweysr0k-2p-l7h3xa-new_game | 2 | 226661885 | 36 | 12 | 28 | 0.408 | 73e553e433ac | 5a3b9541cfcc | new_game | 1 | 11 | PASS |
| 97 | g1-mweysr10-2q-1wxksw1-application_restart | 1 | 130358204 | 30 | 10 | 26 | 0.38 | adcbdca1a4e9 | 229c81f545ed | application_restart | 1 | 10 | PASS |
| 98 | g1-mweysr1f-2r-1p5x8tm-title_screen_restart | 3 | 3050448016 | 48 | 16 | 34 | 0.216 | ea8d9c5652bc | c2635c35d9f7 | title_screen_restart | 0 | 10 | PASS |
| 99 | g1-mweysr1y-2s-1qrx3dc-failure_restart | 0 | 2121784199 | 24 | 8 | 21 | 0.369 | 8de49c45a392 | cfe3010d396f | failure_restart | 0 | 9 | PASS |
| 100 | g1-mweysr28-2t-1jt9x20-new_game | 2 | 177604572 | 36 | 12 | 26 | 0.213 | 62ed082ab242 | 99c0b858f281 | new_game | 0 | 7 | PASS |

</details>

## 第 2 关 · 100 局

| 项 | 值 |
|---|---|
| 耗时 | 5765 ms |
| 牌数范围 | 192 – 321 |
| 开局可点牌范围 | 19 – 25 |
| 档位分布 | {"0":6,"1":5,"2":9,"3":8,"4":8,"5":6,"6":7,"7":10,"8":19,"9":22} |
| 牌数分布 | {"192":19,"255":22,"261":7,"273":8,"282":5,"291":6,"300":9,"312":18,"321":6} |
| 牌型数分布 | {"13":26,"14":19,"15":47,"16":8} |
| 生成原因分布 | {"application_restart":25,"title_screen_restart":25,"failure_restart":25,"new_game":25} |
| 布局签名去重 | 100 / 100 |
| 最近 10 局模板 ID 重复 | 0 |
| 最近 10 局等价几何签名重复 | 0 |
| 最近 10 局结构签名重复 | 0 |
| 最近 10 局布局签名重复 | 0 |
| 最近 10 局几何签名重复 | 0 |
| 重试次数（失败重试合计） | 2 |
| 生成失败次数 | 0 |
| 滑窗 sim 均值 / P95 / 最大 | 0.2611 / 0.3802 / 0.5628 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 35.09 ms |

<details><summary>完整 100 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | sim最大 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g2-mweysr36-2u-1bm4pki-application_restart | 9 | 4212550456 | 255 | 15 | 21 | 0 | a16e2af7e3ab | 822325bf4b50 | application_restart | 0 | 31 | PASS |
| 2 | g2-mweysr4m-2v-1valnbm-title_screen_restart | 6 | 1611617344 | 261 | 13 | 20 | 0.264 | bf8fd35863f9 | 92db5f36af74 | title_screen_restart | 0 | 36 | PASS |
| 3 | g2-mweysr6g-2w-o22asj-failure_restart | 5 | 3433996610 | 291 | 13 | 23 | 0.37 | 296bbc237367 | 270970d9d02d | failure_restart | 0 | 45 | PASS |
| 4 | g2-mweysr7w-2x-1p99dj5-new_game | 8 | 1008571490 | 192 | 15 | 21 | 0.309 | 536b3821b60f | 2ebe9ab07626 | new_game | 0 | 24 | PASS |
| 5 | g2-mweysr9c-2y-1l0hq8u-application_restart | 5 | 2089318125 | 291 | 13 | 19 | 0.341 | 8a1607b2c333 | b72385ce4a43 | application_restart | 0 | 40 | PASS |
| 6 | g2-mweysraq-2z-e2zhic-title_screen_restart | 9 | 544210469 | 255 | 15 | 23 | 0.366 | 94aa4f8b100f | b9e2a6c12396 | title_screen_restart | 0 | 29 | PASS |
| 7 | g2-mweysrc0-30-usops4-failure_restart | 8 | 3127803809 | 192 | 15 | 19 | 0.354 | 5d9e4b273bd7 | 93bced0cf2b1 | failure_restart | 0 | 24 | PASS |
| 8 | g2-mweysrdh-31-zafgfh-new_game | 7 | 450786596 | 312 | 14 | 21 | 0.337 | 897f41e9e5d2 | 0f2bc5682824 | new_game | 0 | 39 | PASS |
| 9 | g2-mweysrfb-32-1d6lran-application_restart | 9 | 2093318137 | 255 | 15 | 24 | 0.244 | 03be1d843255 | 9e35c8d402aa | application_restart | 0 | 35 | PASS |
| 10 | g2-mweysrgj-33-l2sbkp-title_screen_restart | 4 | 447786587 | 273 | 13 | 24 | 0.29 | 41550a7bb712 | b5bd3b7fa6ec | title_screen_restart | 0 | 29 | PASS |
| 11 | g2-mweysrhv-34-foreyn-failure_restart | 8 | 3367154201 | 192 | 15 | 19 | 0.301 | ebfe09abb852 | 76d2f518278a | failure_restart | 0 | 25 | PASS |
| 12 | g2-mweysrjc-35-1n76ybh-new_game | 7 | 1020911247 | 312 | 14 | 19 | 0.415 | a21d56a9d500 | ff8beb7cde83 | new_game | 0 | 38 | PASS |
| 13 | g2-mweysrl3-36-111gtxt-application_restart | 0 | 3724849645 | 321 | 15 | 22 | 0.445 | d0a0ec7450b3 | 09cee81a68b9 | application_restart | 0 | 40 | PASS |
| 14 | g2-mweysrmp-37-14ta48t-title_screen_restart | 6 | 928487377 | 261 | 13 | 20 | 0.445 | 73809a1329cc | f1a558ecdba0 | title_screen_restart | 0 | 32 | PASS |
| 15 | g2-mweysroe-38-3fz323-failure_restart | 3 | 3727849654 | 312 | 16 | 25 | 0.353 | 567325b06c24 | e2e6fc6c973f | failure_restart | 0 | 37 | PASS |
| 16 | g2-mweysrpv-39-1an4pe8-new_game | 8 | 3106222360 | 192 | 15 | 24 | 0.265 | aef4ce69cf94 | 851d9ab3aed1 | new_game | 0 | 28 | PASS |
| 17 | g2-mweysrr9-3a-hzuaca-application_restart | 3 | 150933534 | 312 | 16 | 20 | 0.342 | 5e0e88f352a6 | ad16d3f8f471 | application_restart | 0 | 36 | PASS |
| 18 | g2-mweysrt2-3b-1b2vbfx-title_screen_restart | 9 | 3973200064 | 255 | 15 | 19 | 0.337 | 2a6dcd162e5e | a866a63b42ed | title_screen_restart | 0 | 38 | PASS |
| 19 | g2-mweysrux-3c-1v0ndcr-failure_restart | 3 | 2657442770 | 312 | 16 | 25 | 0.323 | 47a6cc4204ca | ab7d52409378 | failure_restart | 0 | 42 | PASS |
| 20 | g2-mweysrwo-3d-1w4jlww-new_game | 5 | 2807369301 | 291 | 13 | 21 | 0.285 | 4f221ff26b1d | a9d484767f37 | new_game | 0 | 37 | PASS |
| 21 | g2-mweysry7-3e-x4qcpe-application_restart | 9 | 1466690828 | 255 | 15 | 25 | 0.327 | f0123ac2eb50 | e9a85e8fda30 | application_restart | 0 | 32 | PASS |
| 22 | g2-mweysrzo-3f-14s6oxx-title_screen_restart | 4 | 2658442773 | 273 | 13 | 23 | 0.315 | 5859aa18c285 | ff63314f2a30 | title_screen_restart | 0 | 33 | PASS |
| 23 | g2-mweyss1c-3g-18rcobn-failure_restart | 2 | 3191646209 | 300 | 14 | 25 | 0.37 | c2d4d7d13e56 | 0f8ee956372c | failure_restart | 0 | 37 | PASS |
| 24 | g2-mweyss2z-3h-2tve2c-new_game | 3 | 1700041202 | 312 | 16 | 24 | 0.393 | 0bd7e2848b07 | 9290ff62c2ae | new_game | 0 | 37 | PASS |
| 25 | g2-mweyss4s-3i-1uj8i3r-application_restart | 2 | 2565018900 | 300 | 14 | 23 | 0.361 | 93c7a24db550 | 8c514f198437 | application_restart | 0 | 37 | PASS |
| 26 | g2-mweyss6e-3j-bxawp-title_screen_restart | 9 | 2093318137 | 255 | 15 | 24 | 0.375 | 09c1a5bf07d1 | cb1d66ec6dab | title_screen_restart | 0 | 32 | PASS |
| 27 | g2-mweyss82-3k-lt6ux0-failure_restart | 7 | 1556114689 | 312 | 14 | 23 | 0.371 | 2bf92760716c | f1ca29b82f80 | failure_restart | 0 | 39 | PASS |
| 28 | g2-mweyss9v-3l-yklhrj-new_game | 8 | 2958295835 | 192 | 15 | 24 | 0.309 | 7d0742f42af4 | 6501c518651a | new_game | 0 | 32 | PASS |
| 29 | g2-mweyssay-3m-1c3t6a4-application_restart | 9 | 2811369313 | 255 | 15 | 25 | 0.387 | f58833dee17f | 95561cc1a3c8 | application_restart | 0 | 24 | PASS |
| 30 | g2-mweysscc-3n-1438c9j-title_screen_restart | 1 | 2655442764 | 282 | 13 | 22 | 0.416 | 81e1a810fa83 | 506b1e4d3936 | title_screen_restart | 0 | 32 | PASS |
| 31 | g2-mweysse7-3o-1d0zxw6-failure_restart | 7 | 7007021 | 312 | 14 | 24 | 0.47 | f18bf3230251 | ed0ecc7717ef | failure_restart | 0 | 44 | PASS |
| 32 | g2-mweyssg3-3p-6xf7u7-new_game | 5 | 3342572743 | 291 | 13 | 21 | 0.454 | 647b59bc543b | 41d4e92c7179 | new_game | 0 | 34 | PASS |
| 33 | g2-mweysshs-3q-1ewalcj-application_restart | 4 | 1940391597 | 273 | 13 | 20 | 0.315 | d0f142ca547b | 412779d262a4 | application_restart | 0 | 36 | PASS |
| 34 | g2-mweyssjf-3r-m93f4n-title_screen_restart | 7 | 3105222357 | 312 | 14 | 25 | 0.39 | 99288d2312d9 | f131bdc99495 | title_screen_restart | 0 | 40 | PASS |
| 35 | g2-mweyssl9-3s-1tifgh7-failure_restart | 6 | 2864871962 | 261 | 13 | 19 | 0.248 | fc19a5dd79e5 | 7e7794c47938 | failure_restart | 0 | 39 | PASS |
| 36 | g2-mweyssmj-3t-1sj6viz-new_game | 8 | 1317764300 | 192 | 15 | 20 | 0.234 | 0e4f1ef78db4 | 6cbc34b27ef5 | new_game | 0 | 23 | PASS |
| 37 | g2-mweyssnm-3u-1e7j6d6-application_restart | 9 | 2332668529 | 255 | 15 | 25 | 0.353 | fb46cb1915b7 | 0f16800dea1f | application_restart | 0 | 26 | PASS |
| 38 | g2-mweyssos-3v-14bq0vr-title_screen_restart | 8 | 1522193483 | 192 | 15 | 24 | 0.31 | 8cc47fe513e8 | 1e9bbef44ab2 | title_screen_restart | 0 | 23 | PASS |
| 39 | g2-mweyssq0-3w-api1kk-failure_restart | 4 | 447786587 | 273 | 13 | 22 | 0.376 | 6bdfda504f30 | 95abc00ce69f | failure_restart | 0 | 32 | PASS |
| 40 | g2-mweyssra-3x-15efl1g-new_game | 8 | 155933549 | 192 | 15 | 21 | 0.319 | 17f18a308cbe | 6d74c55a6406 | new_game | 0 | 24 | PASS |
| 41 | g2-mweysssr-3y-1n1z22r-application_restart | 2 | 2325668508 | 300 | 14 | 25 | 0.454 | 5fe3d8662e5a | 0f8ee956372c | application_restart | 0 | 39 | PASS |
| 42 | g2-mweyssve-3z-1clzl6r-title_screen_restart | 3 | 4206550438 | 312 | 16 | 22 | 0.371 | dd5bc662349e | c53cd90a0d7e | title_screen_restart | 0 | 61 | PASS |
| 43 | g2-mweyssx7-40-zadko5-failure_restart | 1 | 684136970 | 282 | 13 | 19 | 0.366 | f84898764f11 | a95c703e990f | failure_restart | 0 | 38 | PASS |
| 44 | g2-mweyssz3-41-yjxp5y-new_game | 7 | 2330668523 | 312 | 14 | 23 | 0.309 | 039540de8e4e | 3529b858ccc0 | new_game | 0 | 43 | PASS |
| 45 | g2-mweyst1t-42-1jx8oep-application_restart | 3 | 1073413893 | 312 | 16 | 23 | 0.419 | 1bf857985b74 | f5d2bf1ce023 | application_restart | 1 | 69 | PASS |
| 46 | g2-mweyst3s-43-hxuolj-title_screen_restart | 0 | 56509658 | 321 | 15 | 25 | 0.488 | ddabb8068e15 | cfb46e8b8747 | title_screen_restart | 0 | 44 | PASS |
| 47 | g2-mweyst5i-44-mn6yva-failure_restart | 9 | 3050719705 | 255 | 15 | 20 | 0.335 | 53ae29da3f97 | 96baf3c52263 | failure_restart | 0 | 36 | PASS |
| 48 | g2-mweyst6z-45-w2ju9m-new_game | 1 | 2324668505 | 282 | 13 | 25 | 0.352 | fdc686110105 | 185bb7833d00 | new_game | 0 | 33 | PASS |
| 49 | g2-mweyst8i-46-idsqot-application_restart | 2 | 4114126568 | 300 | 14 | 24 | 0.332 | 7f719f988672 | c8d8a06a12ed | application_restart | 0 | 35 | PASS |
| 50 | g2-mweyst9w-47-3q0232-title_screen_restart | 8 | 3162725018 | 192 | 15 | 20 | 0.367 | 1b37d93d0a60 | 5a9dff54969a | title_screen_restart | 0 | 24 | PASS |
| 51 | g2-mweystca-49-1ql8szh-failure_restart | 9 | 3107222363 | 255 | 15 | 24 | 0.359 | d8725bdb6452 | 0d55df8aa8e9 | failure_restart | 0 | 29 | PASS |
| 52 | g2-mweystdp-4a-yprl5e-new_game | 2 | 3818273518 | 300 | 14 | 23 | 0.347 | 6f13a2336344 | 0f442a24abd2 | new_game | 0 | 33 | PASS |
| 53 | g2-mweystf3-4b-a7av9o-application_restart | 8 | 2240244659 | 192 | 15 | 24 | 0.344 | 6763fcef1783 | 4b1b440d43c7 | application_restart | 0 | 27 | PASS |
| 54 | g2-mweystgq-4c-1dams47-title_screen_restart | 5 | 3103222351 | 291 | 13 | 23 | 0.409 | 6bd9e25a553d | f12cd0ae755f | title_screen_restart | 0 | 43 | PASS |
| 55 | g2-mweysti5-4d-tixf09-failure_restart | 8 | 2444673842 | 192 | 15 | 22 | 0.363 | fa0c6e2f129f | 6bbab8cd4833 | failure_restart | 0 | 23 | PASS |
| 56 | g2-mweystjd-4e-14glc2b-new_game | 4 | 60509670 | 273 | 13 | 23 | 0.384 | a1ec251bf70f | 1b8d1dee2e0b | new_game | 0 | 30 | PASS |
| 57 | g2-mweystl5-4f-1bqbcrm-application_restart | 0 | 1013911226 | 321 | 15 | 25 | 0.411 | 2199f0b18a59 | aefc18ba7795 | application_restart | 0 | 43 | PASS |
| 58 | g2-mweystml-4g-e5z23r-title_screen_restart | 8 | 2740526892 | 192 | 15 | 20 | 0.269 | c4336db837d5 | 31243a4c8578 | title_screen_restart | 0 | 26 | PASS |
| 59 | g2-mweystnn-4h-13s0ub3-failure_restart | 9 | 452786602 | 255 | 15 | 23 | 0.365 | b93e9815273d | baded8f94d53 | failure_restart | 0 | 25 | PASS |
| 60 | g2-mweystpb-4i-18von3o-new_game | 0 | 1788465060 | 321 | 15 | 20 | 0.216 | 91ad7f7e372f | ae0b680efa8f | new_game | 0 | 41 | PASS |
| 61 | g2-mweystra-4j-10f6f2l-application_restart | 9 | 2424092396 | 255 | 15 | 25 | 0.409 | 629780aded97 | 6ee5e0966270 | application_restart | 0 | 39 | PASS |
| 62 | g2-mweystth-4k-9hwqjf-title_screen_restart | 7 | 1795465081 | 312 | 14 | 23 | 0.563 | fcf56ce587a3 | ac0f5c315049 | title_screen_restart | 0 | 54 | PASS |
| 63 | g2-mweystvp-4l-1dmdghc-failure_restart | 9 | 1410188170 | 255 | 15 | 24 | 0.368 | faff878d8c16 | a7ceafae8be8 | failure_restart | 0 | 44 | PASS |
| 64 | g2-mweystxe-4m-oif1vn-new_game | 6 | 3195646221 | 261 | 13 | 22 | 0.375 | e26a40a48fdb | 316a5a52d9df | new_game | 0 | 39 | PASS |
| 65 | g2-mweystzb-4n-s3r04c-application_restart | 4 | 1405188155 | 273 | 13 | 23 | 0.261 | f54d8c9d579a | 9d5c74e8615c | application_restart | 0 | 44 | PASS |
| 66 | g2-mweysu0x-4o-12sev2z-title_screen_restart | 8 | 2092318134 | 192 | 15 | 20 | 0.327 | 15de4be954d7 | ffe8a33e6c10 | title_screen_restart | 0 | 27 | PASS |
| 67 | g2-mweysu24-4p-o1tn83-failure_restart | 9 | 2184742004 | 255 | 15 | 25 | 0.39 | 5299ebd1acc5 | 3e606cf5ac5b | failure_restart | 0 | 31 | PASS |
| 68 | g2-mweysu3z-4q-807v8h-new_game | 6 | 3822273530 | 261 | 13 | 24 | 0.383 | 9dfa361e0de2 | 611116f92338 | new_game | 0 | 42 | PASS |
| 69 | g2-mweysu5g-4r-1e9nk1z-application_restart | 2 | 4205550435 | 300 | 14 | 21 | 0.389 | 9f666f89de4d | ee57668c055a | application_restart | 0 | 36 | PASS |
| 70 | g2-mweysu72-4s-1x7itn-title_screen_restart | 9 | 2480595054 | 255 | 15 | 25 | 0.364 | 31df77f9f9b9 | 9169682eb983 | title_screen_restart | 0 | 34 | PASS |
| 71 | g2-mweysu8i-4t-17dyxe7-failure_restart | 1 | 2472595030 | 282 | 13 | 22 | 0.279 | 0b6536fe0af5 | 9bf27c3222be | failure_restart | 0 | 31 | PASS |
| 72 | g2-mweysuaa-4u-1xs359f-new_game | 2 | 1163837757 | 300 | 14 | 23 | 0.333 | 79d7fe8b45be | 9c774917ee26 | new_game | 0 | 41 | PASS |
| 73 | g2-mweysubv-4v-zwk211-application_restart | 6 | 2090318128 | 261 | 13 | 20 | 0.418 | 2676ea9f7323 | e7a031b82472 | application_restart | 0 | 31 | PASS |
| 74 | g2-mweysudq-4w-16420gp-title_screen_restart | 3 | 686136976 | 312 | 16 | 19 | 0.407 | fe29d6db0da8 | 32755952d310 | title_screen_restart | 0 | 44 | PASS |
| 75 | g2-mweysuf3-4x-1nbnvi9-failure_restart | 8 | 4211550453 | 192 | 15 | 21 | 0.325 | d618e7f18890 | 6d74c55a6406 | failure_restart | 0 | 26 | PASS |
| 76 | g2-mweysug8-4y-1gsb8o8-new_game | 1 | 2711945422 | 282 | 13 | 23 | 0.411 | 8c990b8c0cd3 | 1b24998e3e21 | new_game | 0 | 30 | PASS |
| 77 | g2-mweysuhx-4z-1ho71cn-application_restart | 4 | 1074413896 | 273 | 13 | 24 | 0.358 | 3f838577f2ba | 4c7e11def24e | application_restart | 0 | 35 | PASS |
| 78 | g2-mweysuj9-50-14vj6ts-title_screen_restart | 8 | 3789352327 | 192 | 15 | 20 | 0.323 | e9e87d122c19 | 598ec2dffd48 | title_screen_restart | 0 | 27 | PASS |
| 79 | g2-mweysuki-51-j8mvaq-failure_restart | 4 | 1701041205 | 273 | 13 | 24 | 0.331 | 35830cebd07c | 2efb968fdf16 | failure_restart | 0 | 33 | PASS |
| 80 | g2-mweysulu-52-cbxuh4-new_game | 8 | 1317764300 | 192 | 15 | 22 | 0.501 | fc0f1082a1c0 | 21510df30aea | new_game | 0 | 24 | PASS |
| 81 | g2-mweysumz-53-1ulwyhk-application_restart | 9 | 2719945446 | 255 | 15 | 24 | 0.447 | 195aa1c406a7 | 05d415e0c234 | application_restart | 0 | 27 | PASS |
| 82 | g2-mweysuoo-54-ifcu1x-title_screen_restart | 3 | 2657442770 | 312 | 16 | 22 | 0.334 | adbbcdf74ab8 | 45c6ac01ad82 | title_screen_restart | 0 | 42 | PASS |
| 83 | g2-mweysuqb-55-11b2wzm-failure_restart | 9 | 1410188170 | 255 | 15 | 22 | 0.359 | c98b5bc3e36b | 7be00151ea81 | failure_restart | 0 | 33 | PASS |
| 84 | g2-mweysus0-56-q3699a-new_game | 7 | 3048719699 | 312 | 14 | 24 | 0.301 | 6bc6bb379f4b | b81f63ed1d63 | new_game | 0 | 40 | PASS |
| 85 | g2-mweysutn-57-p0e9my-application_restart | 6 | 3047719696 | 261 | 13 | 23 | 0.374 | 91f5b90acba8 | 70e573a26454 | application_restart | 0 | 32 | PASS |
| 86 | g2-mweysuv3-58-uqspjp-title_screen_restart | 9 | 3973200064 | 255 | 15 | 23 | 0.357 | 890b219d5baf | 7c1a736357fc | title_screen_restart | 0 | 30 | PASS |
| 87 | g2-mweysuw9-59-1b8x41h-failure_restart | 8 | 4211550453 | 192 | 15 | 23 | 0.276 | 3e1698cb811f | 48c0ebd5bdfe | failure_restart | 0 | 24 | PASS |
| 88 | g2-mweysuxv-5a-1ucw3x4-new_game | 7 | 2717945440 | 312 | 14 | 19 | 0.286 | 016b570ac4fb | ea70e48f2b75 | new_game | 0 | 44 | PASS |
| 89 | g2-mweysuzw-5b-1mfttl3-application_restart | 9 | 396283944 | 255 | 15 | 25 | 0.446 | 5d00b0353b1f | 95561cc1a3c8 | application_restart | 0 | 43 | PASS |
| 90 | g2-mweysv1c-5c-fl5qij-title_screen_restart | 8 | 3127803809 | 192 | 15 | 19 | 0.334 | 1240d7310d04 | ada57de2679a | title_screen_restart | 0 | 24 | PASS |
| 91 | g2-mweysv36-5d-1q061oa-failure_restart | 9 | 2480595054 | 255 | 15 | 19 | 0.448 | 90bd34d335f2 | 00b012724c5b | failure_restart | 1 | 52 | PASS |
| 92 | g2-mweysv4q-5e-79s9td-new_game | 2 | 3578923126 | 300 | 14 | 20 | 0.329 | 0572a1b3b5b2 | cb847bc209eb | new_game | 0 | 38 | PASS |
| 93 | g2-mweysv6o-5f-1avguu2-application_restart | 0 | 1401188143 | 321 | 15 | 25 | 0.352 | 526c94a2ba75 | 3a9daab569cb | application_restart | 0 | 46 | PASS |
| 94 | g2-mweysv8i-5g-1t7kr62-title_screen_restart | 9 | 1466690828 | 255 | 15 | 23 | 0.435 | 3a12b3f79178 | bc0a6034ba54 | title_screen_restart | 0 | 35 | PASS |
| 95 | g2-mweysv9o-5h-tc7lpf-failure_restart | 8 | 1226340433 | 192 | 15 | 20 | 0.277 | bb1c9fdcc0a3 | 64fe20f9572b | failure_restart | 0 | 21 | PASS |
| 96 | g2-mweysvar-5i-1j6wkhn-new_game | 9 | 1706041220 | 255 | 15 | 22 | 0.496 | dbce6d33cb5a | df19f035e1ef | new_game | 0 | 23 | PASS |
| 97 | g2-mweysvcd-5j-txhmjj-application_restart | 7 | 2034815473 | 312 | 14 | 23 | 0.266 | 6c7b9a77d104 | c37a0f9eae4a | application_restart | 0 | 40 | PASS |
| 98 | g2-mweysvef-5k-6yqqhw-title_screen_restart | 0 | 2175741977 | 321 | 15 | 22 | 0.323 | 07ddeec75ccf | c8db43475770 | title_screen_restart | 0 | 47 | PASS |
| 99 | g2-mweysvg9-5l-v2gxbd-failure_restart | 5 | 3433996610 | 291 | 13 | 25 | 0.381 | 2afdd4e09175 | d266d6bf8959 | failure_restart | 0 | 37 | PASS |
| 100 | g2-mweysvhv-5m-1gm7zth-new_game | 2 | 3191646209 | 300 | 14 | 23 | 0.348 | d63351502923 | adcfe7c9d5b7 | new_game | 0 | 36 | PASS |

</details>

## 失败案例与原因

本次运行 **0** 个生成失败案例；每次重试的原因均记录在 `random-generation-report.json` 的逐局 `retries` 字段。

## 测试性质说明

- 运行时：两关各 100 局真实调用 `createNewGame`，真实生成、真实签名、真实校验。
- 相似度：用**真实牌面**两两计算 `layoutSimilarity`（层占位格 Jaccard 均值 ×0.5 + 整体轮廓 Jaccard ×0.5），不是签名比较。
- 静态审计：三种重新开局入口通过读取 `src/main.js` 源码确认全部走统一入口；未冒充浏览器实测。
- 重启模拟：把存档 JSON 写入磁盘再读回，继续生成并验证差异化。
- 浏览器实际运行 / Windows 安装卸载测试不在本文件覆盖范围，见 `FINAL_ACCEPTANCE.md`。
