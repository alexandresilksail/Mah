# 双关卡各 100 局随机生成压力测试报告

> 本文件由 `node test-random-generation.js` **真实运行**自动生成，不是静态 PASS 模板。

- 运行时间：2026-11-13T08:05:56.415Z
- Git commit：`f17b73bce482fae522a43c1df8cd2ca6ebf51b34`
- 断言：通过 **7788**，失败 **0**
- 总耗时：11205 ms
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
| 平均单局生成耗时 | 23.74 ms |
| 失败案例 | 0 |

## 滑动窗口相似度（L1 三局 / L2 十局）

| 关卡 | 窗口对数 | 均值 | P95 | 最大值 | 阈值 | 判定 |
|---|---|---|---|---|---|---|
| L1 | 294 | 0.2480 | 0.4950 | 0.5841 | 0.6 | ✓ 全部 < 0.60 |
| L2 | 945 | 0.2434 | 0.3607 | 0.4865 | 0.6 | ✓ 全部 < 0.60 |

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
| 耗时 | 1578 ms |
| 牌数范围 | 24 – 48 |
| 开局可点牌范围 | 15 – 40 |
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
| 滑窗 sim 均值 / P95 / 最大 | 0.2480 / 0.4950 / 0.5841 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 10.28 ms |

<details><summary>完整 100 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | sim最大 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g1-mweozq50-1-ili0lt-application_restart | 2 | 2760842331 | 36 | 12 | 29 | 0 | 4d5f08726036 | 0c0fbe08aeef | application_restart | 0 | 6 | PASS |
| 2 | g1-mweozq5h-2-dexhe5-title_screen_restart | 1 | 3165231772 | 30 | 10 | 27 | 0.132 | a3925b0dcf28 | 1b12f6b91c38 | title_screen_restart | 0 | 8 | PASS |
| 3 | g1-mweozq5v-3-13jvjpk-failure_restart | 0 | 1110779182 | 24 | 8 | 20 | 0.277 | 903706d1a18e | 7094d0c5428a | failure_restart | 0 | 9 | PASS |
| 4 | g1-mweozq6j-4-1kgz2xq-new_game | 3 | 3851959361 | 48 | 16 | 36 | 0.373 | 17a8c21f21e3 | 322ff08d6427 | new_game | 0 | 22 | PASS |
| 5 | g1-mweozq7s-5-1fc90zp-application_restart | 2 | 811820506 | 36 | 12 | 27 | 0.44 | 78ca71a7ad8d | 6269259c3782 | application_restart | 0 | 26 | PASS |
| 6 | g1-mweozq87-6-r83zr6-title_screen_restart | 1 | 198246636 | 30 | 10 | 25 | 0.467 | e597664a1992 | f36565350ac6 | title_screen_restart | 0 | 9 | PASS |
| 7 | g1-mweozq8h-7-zbl6wq-failure_restart | 0 | 3766461914 | 24 | 8 | 24 | 0.304 | dce181ea9061 | ec217df50489 | failure_restart | 0 | 6 | PASS |
| 8 | g1-mweozq8v-8-1pws4ji-new_game | 3 | 1024664252 | 48 | 16 | 31 | 0.525 | eb5ba41d0187 | 822b5a427a7d | new_game | 0 | 11 | PASS |
| 9 | g1-mweozq99-9-2pghgv-application_restart | 2 | 2278088088 | 36 | 12 | 27 | 0.553 | d3f27f4830f0 | 50dcfd309fa9 | application_restart | 0 | 9 | PASS |
| 10 | g1-mweozq9p-a-41mhgu-title_screen_restart | 1 | 595634750 | 30 | 10 | 25 | 0.456 | 44282a6828f3 | e7a00aa089f7 | title_screen_restart | 2 | 11 | PASS |
| 11 | g1-mweozq9w-b-nn68mu-failure_restart | 0 | 3160761433 | 24 | 8 | 16 | 0.564 | b054e53e1726 | 7d2ee4b04e00 | failure_restart | 0 | 5 | PASS |
| 12 | g1-mweozqaa-c-ukr9fa-new_game | 3 | 1987682591 | 48 | 16 | 34 | 0.482 | 7dc2d25f0c5e | 1acf60fd57fd | new_game | 0 | 12 | PASS |
| 13 | g1-mweozqaz-d-837cam-application_restart | 2 | 577028861 | 36 | 12 | 26 | 0.564 | 7510ec555dbd | 53dcdb353aec | application_restart | 0 | 13 | PASS |
| 14 | g1-mweozqb9-e-17d88ma-title_screen_restart | 1 | 1662268072 | 30 | 10 | 25 | 0.466 | 4afc3647a9f1 | b96416765a3a | title_screen_restart | 0 | 6 | PASS |
| 15 | g1-mweozqbh-f-11or83v-failure_restart | 0 | 3443381909 | 24 | 8 | 15 | 0.519 | 9607537d7264 | b2ccc63c7eba | failure_restart | 0 | 5 | PASS |
| 16 | g1-mweozqc7-g-159lhf3-new_game | 3 | 4073082225 | 48 | 16 | 40 | 0.297 | a542bb79931a | 2f2122f0557d | new_game | 0 | 24 | PASS |
| 17 | g1-mweozqdq-h-1hqhw93-application_restart | 2 | 654680380 | 36 | 12 | 32 | 0.499 | 8e6288020469 | aec0b3170db4 | application_restart | 1 | 33 | PASS |
| 18 | g1-mweozqe2-i-1hx24uk-title_screen_restart | 1 | 2319705896 | 30 | 10 | 27 | 0.493 | c9d8edeee145 | 7adb0fcb51e7 | title_screen_restart | 0 | 7 | PASS |
| 19 | g1-mweozqeb-j-z14x1y-failure_restart | 0 | 2324492588 | 24 | 8 | 15 | 0.281 | 19dfa662716d | ead127d77aed | failure_restart | 0 | 6 | PASS |
| 20 | g1-mweozqev-k-r16b6m-new_game | 3 | 3403529194 | 48 | 16 | 37 | 0.397 | 3060407e77dc | 007d732f70ef | new_game | 0 | 17 | PASS |
| 21 | g1-mweozqfn-l-c9lc8c-application_restart | 2 | 247033010 | 36 | 12 | 26 | 0.319 | 8bb9b5df2620 | e042c1781dfb | application_restart | 1 | 17 | PASS |
| 22 | g1-mweozqfw-m-1ko7jbg-title_screen_restart | 1 | 3091530749 | 30 | 10 | 26 | 0.416 | 0c22c6524bbc | 0a87ef0f7aa3 | title_screen_restart | 0 | 6 | PASS |
| 23 | g1-mweozqg4-n-v7bwcg-failure_restart | 0 | 413322575 | 24 | 8 | 15 | 0.385 | 834f40232ba4 | ea77af896095 | failure_restart | 0 | 5 | PASS |
| 24 | g1-mweozqgt-o-1q3dhih-new_game | 3 | 2911253515 | 48 | 16 | 33 | 0.175 | c0ee09c0dace | 01596a2c56c3 | new_game | 0 | 23 | PASS |
| 25 | g1-mweozqi8-p-hed6o2-application_restart | 2 | 2235546926 | 36 | 12 | 32 | 0.281 | 3a59f416e7ca | 755184c5d9fc | application_restart | 0 | 27 | PASS |
| 26 | g1-mweozqij-q-1g5c35a-title_screen_restart | 1 | 1265515014 | 30 | 10 | 26 | 0.43 | 56d05f6afca6 | 9c14aa14231c | title_screen_restart | 0 | 6 | PASS |
| 27 | g1-mweozqir-r-1h5q2y9-failure_restart | 0 | 277072061 | 24 | 8 | 24 | 0.337 | 531f9fd87a1a | e7f88a922e07 | failure_restart | 0 | 5 | PASS |
| 28 | g1-mweozqj5-s-boih6r-new_game | 3 | 3247351991 | 48 | 16 | 33 | 0.252 | 0174b1a580ce | 7db715724629 | new_game | 0 | 11 | PASS |
| 29 | g1-mweozqjn-t-7mcang-application_restart | 2 | 1305989309 | 36 | 12 | 32 | 0.241 | c171ca48591a | 29a0034d8389 | application_restart | 0 | 10 | PASS |
| 30 | g1-mweozqjw-u-u2rngf-title_screen_restart | 1 | 806418517 | 30 | 10 | 26 | 0.552 | 184921e99d5c | a30608944475 | title_screen_restart | 0 | 5 | PASS |
| 31 | g1-mweozqk3-v-t1g3e8-failure_restart | 0 | 323758172 | 24 | 8 | 15 | 0.251 | 8f97499614d1 | ef54ded92b0f | failure_restart | 0 | 4 | PASS |
| 32 | g1-mweozqke-w-9rxbqp-new_game | 3 | 1861597802 | 48 | 16 | 34 | 0.326 | f9d1aefa69e4 | 7390202381b7 | new_game | 0 | 8 | PASS |
| 33 | g1-mweozqkt-x-1bpbeni-application_restart | 2 | 3784347620 | 36 | 12 | 26 | 0.408 | 07c4c23d6fb9 | 85a30f87f7a6 | application_restart | 0 | 10 | PASS |
| 34 | g1-mweozql6-y-76pqrx-title_screen_restart | 1 | 4286135285 | 30 | 10 | 26 | 0.246 | fe8cdc2785f4 | 347c8be90d58 | title_screen_restart | 0 | 8 | PASS |
| 35 | g1-mweozqle-z-wpgcwf-failure_restart | 0 | 1012187765 | 24 | 8 | 24 | 0.566 | c1dc14e07304 | 4c1a993d4e89 | failure_restart | 0 | 4 | PASS |
| 36 | g1-mweozqls-10-vn1dy9-new_game | 3 | 2175991184 | 48 | 16 | 32 | 0.367 | 5ea077a1f3e8 | 78a86b6452c0 | new_game | 0 | 13 | PASS |
| 37 | g1-mweozqmg-11-cptpr8-application_restart | 2 | 999607921 | 36 | 12 | 32 | 0.252 | eddc335e1f76 | a2d405c188eb | application_restart | 0 | 12 | PASS |
| 38 | g1-mweozqmq-12-hbf5gi-title_screen_restart | 1 | 1261297444 | 30 | 10 | 26 | 0.264 | 104fb35eed84 | 59f8613a4add | title_screen_restart | 0 | 6 | PASS |
| 39 | g1-mweozqmy-13-1lin9vc-failure_restart | 0 | 4185293414 | 24 | 8 | 16 | 0.385 | 6711a87f3bd0 | 585b2746617d | failure_restart | 0 | 5 | PASS |
| 40 | g1-mweozqn8-14-1b27gcl-new_game | 3 | 4068942077 | 48 | 16 | 35 | 0.437 | 61f14d626a52 | 2cb3987f32a2 | new_game | 0 | 8 | PASS |
| 41 | g1-mweozqnq-15-agj3f3-application_restart | 2 | 2438060627 | 36 | 12 | 32 | 0.437 | 597745e5b481 | 6001e282399a | application_restart | 0 | 11 | PASS |
| 42 | g1-mweozqo1-16-57fqmg-title_screen_restart | 1 | 2285727379 | 30 | 10 | 25 | 0.191 | d94c63831011 | 23ed8f982ac4 | title_screen_restart | 0 | 7 | PASS |
| 43 | g1-mweozqob-17-1qi57kf-failure_restart | 0 | 3136604342 | 24 | 8 | 16 | 0.203 | 2cb640231446 | 12068cf0b374 | failure_restart | 0 | 6 | PASS |
| 44 | g1-mweozqoo-18-v0wdgs-new_game | 3 | 312227272 | 48 | 16 | 34 | 0.583 | e043237c7245 | e630dcead320 | new_game | 0 | 10 | PASS |
| 45 | g1-mweozqpd-19-17r9t6q-application_restart | 2 | 3266537795 | 36 | 12 | 23 | 0.34 | a25e990afd01 | faef7f9b6b57 | application_restart | 2 | 18 | PASS |
| 46 | g1-mweozqpp-1a-zrce5k-title_screen_restart | 1 | 2225926859 | 30 | 10 | 23 | 0.392 | 2f24d8321061 | 917e50d79d6d | title_screen_restart | 0 | 7 | PASS |
| 47 | g1-mweozqpx-1b-1vozp7k-failure_restart | 0 | 3404951144 | 24 | 8 | 20 | 0.238 | f73792dc76d6 | 4ea0fa82713e | failure_restart | 0 | 5 | PASS |
| 48 | g1-mweozqqc-1c-1sdyfuu-new_game | 3 | 2083012393 | 48 | 16 | 34 | 0.323 | a75609558cbd | c8999ea08eab | new_game | 0 | 12 | PASS |
| 49 | g1-mweozqqz-1d-1wydksn-application_restart | 2 | 2792640288 | 36 | 12 | 26 | 0.296 | 0c4e60246a5c | 9f3228c0f4e2 | application_restart | 0 | 13 | PASS |
| 50 | g1-mweozqra-1e-1q3o34a-title_screen_restart | 1 | 2066689467 | 30 | 10 | 21 | 0.299 | 68c55caae18d | bed08b1e16c3 | title_screen_restart | 0 | 7 | PASS |
| 51 | g1-mweozqrl-1g-15o0kr2-failure_restart | 0 | 2164401690 | 24 | 8 | 20 | 0.246 | b00569306915 | 2bbcb02c657c | failure_restart | 0 | 2 | PASS |
| 52 | g1-mweozqs5-1h-17p16d1-new_game | 3 | 64110421 | 48 | 16 | 29 | 0.5 | 39ffb70c51c7 | 80caa57c04e6 | new_game | 0 | 18 | PASS |
| 53 | g1-mweozqt7-1i-17tja6g-application_restart | 2 | 3628772680 | 36 | 12 | 28 | 0.396 | 5b70f92e5fd5 | fdb8adfac4f6 | application_restart | 0 | 20 | PASS |
| 54 | g1-mweozqth-1j-1isldia-title_screen_restart | 1 | 374301491 | 30 | 10 | 26 | 0.425 | 3b86af896c6e | e0153d2d94d0 | title_screen_restart | 0 | 6 | PASS |
| 55 | g1-mweozqto-1k-1fqh0wy-failure_restart | 0 | 2899204343 | 24 | 8 | 20 | 0.493 | 33f1369fda18 | 732bf8fe6d6c | failure_restart | 0 | 4 | PASS |
| 56 | g1-mweozqtx-1l-4w1z85-new_game | 3 | 2471909658 | 48 | 16 | 32 | 0.22 | c4ce36496e6a | abeb6ab2ab1a | new_game | 0 | 7 | PASS |
| 57 | g1-mweozquc-1m-11n2wcs-application_restart | 2 | 2148944620 | 36 | 12 | 26 | 0.467 | d08a591545fd | 17551bb6ec3f | application_restart | 0 | 9 | PASS |
| 58 | g1-mweozqul-1n-dndrlj-title_screen_restart | 1 | 3882239895 | 30 | 10 | 25 | 0.425 | f439bb5817f5 | 231179d44b72 | title_screen_restart | 0 | 5 | PASS |
| 59 | g1-mweozqut-1o-jwdhex-failure_restart | 0 | 2398517601 | 24 | 8 | 24 | 0.218 | 3fa6bc3578d2 | 8b6e143a504b | failure_restart | 0 | 5 | PASS |
| 60 | g1-mweozqvi-1p-k211p7-new_game | 3 | 1381791449 | 48 | 16 | 35 | 0.205 | 30b5fddef2b5 | 0f89402fa1f3 | new_game | 0 | 23 | PASS |
| 61 | g1-mweozqwn-1q-ek610x-application_restart | 2 | 1846454705 | 36 | 12 | 28 | 0.297 | 7f13d33c53ec | 851a3f4df0d1 | application_restart | 0 | 23 | PASS |
| 62 | g1-mweozqww-1r-6aioxj-title_screen_restart | 1 | 3347355366 | 30 | 10 | 25 | 0.399 | 4e194ff54388 | b4e354bbac94 | title_screen_restart | 0 | 6 | PASS |
| 63 | g1-mweozqx3-1s-1f8nm62-failure_restart | 0 | 3077088955 | 24 | 8 | 15 | 0.449 | a7048f11da38 | 583d6721dd07 | failure_restart | 0 | 3 | PASS |
| 64 | g1-mweozqxj-1t-1vnv4yp-new_game | 3 | 3600466591 | 48 | 16 | 35 | 0.127 | 3a581b7779a7 | dc3b73655762 | new_game | 0 | 15 | PASS |
| 65 | g1-mweozqyh-1u-1odvxh8-application_restart | 2 | 1802175182 | 36 | 12 | 27 | 0.41 | 48a355c31a58 | 50e93eb95563 | application_restart | 0 | 20 | PASS |
| 66 | g1-mweozqyv-1v-7lf107-title_screen_restart | 1 | 2017048633 | 30 | 10 | 25 | 0.496 | a19afeffa178 | d3cb544db6e1 | title_screen_restart | 0 | 8 | PASS |
| 67 | g1-mweozqz4-1w-113khdy-failure_restart | 0 | 2157957725 | 24 | 8 | 19 | 0.269 | 692d010bd95c | fd29b7369558 | failure_restart | 0 | 5 | PASS |
| 68 | g1-mweozqze-1x-sf4axf-new_game | 3 | 365240040 | 48 | 16 | 34 | 0.21 | 118ad7d79a47 | 38393a3afa9c | new_game | 0 | 9 | PASS |
| 69 | g1-mweozqzr-1y-1otgmu1-application_restart | 2 | 2219804058 | 36 | 12 | 33 | 0.527 | 572afcf7518b | a3529c53598e | application_restart | 0 | 7 | PASS |
| 70 | g1-mweozqzz-1z-sx9zn5-title_screen_restart | 1 | 3823229527 | 30 | 10 | 26 | 0.266 | 158e8dfcf271 | f532c1b54ec3 | title_screen_restart | 0 | 5 | PASS |
| 71 | g1-mweozr06-20-ynvugt-failure_restart | 0 | 4104189020 | 24 | 8 | 20 | 0.495 | dfe97d4d0c69 | 7acd1e5b75b0 | failure_restart | 0 | 4 | PASS |
| 72 | g1-mweozr0h-21-102085n-new_game | 3 | 1671408752 | 48 | 16 | 33 | 0.246 | 0029f8035a0b | 38265505d1b0 | new_game | 0 | 9 | PASS |
| 73 | g1-mweozr12-22-1jicwb6-application_restart | 2 | 1867188104 | 36 | 12 | 27 | 0.366 | fea63b6eada5 | 6afa39c32aeb | application_restart | 0 | 13 | PASS |
| 74 | g1-mweozr1b-23-5foe89-title_screen_restart | 1 | 1267443664 | 30 | 10 | 26 | 0.447 | c85b142a7b84 | be865fa9f8b5 | title_screen_restart | 0 | 5 | PASS |
| 75 | g1-mweozr1i-24-xqo69t-failure_restart | 0 | 1480192942 | 24 | 8 | 16 | 0.318 | fde37bc5c50a | dc40a5506d48 | failure_restart | 0 | 4 | PASS |
| 76 | g1-mweozr1v-25-fsdaei-new_game | 3 | 3738102607 | 48 | 16 | 35 | 0.164 | b085a69d6cc7 | cbff1bd2bda5 | new_game | 0 | 11 | PASS |
| 77 | g1-mweozr2g-26-190ixvv-application_restart | 2 | 2373416153 | 36 | 12 | 31 | 0.485 | 0221e4aff922 | b08c5624af43 | application_restart | 0 | 12 | PASS |
| 78 | g1-mweozr2q-27-9rkyz4-title_screen_restart | 1 | 4060821109 | 30 | 10 | 26 | 0.23 | cc0625dc3cf0 | 3c412e502d0a | title_screen_restart | 0 | 6 | PASS |
| 79 | g1-mweozr2w-28-93li07-failure_restart | 0 | 2082640306 | 24 | 8 | 20 | 0.474 | 9a5f0664c20a | 537ff6a331e2 | failure_restart | 0 | 4 | PASS |
| 80 | g1-mweozr39-29-1996iy7-new_game | 3 | 4017858384 | 48 | 16 | 35 | 0.405 | bd574905c4c7 | 3d0a43d99494 | new_game | 0 | 11 | PASS |
| 81 | g1-mweozr3t-2a-ecwswg-application_restart | 2 | 2559248956 | 36 | 12 | 28 | 0.437 | 36bb5a7b81eb | 5efab7d2613b | application_restart | 0 | 12 | PASS |
| 82 | g1-mweozr42-2b-1weiwkq-title_screen_restart | 1 | 452887080 | 30 | 10 | 30 | 0.282 | 652144e5bfb4 | 5045e0a6300a | title_screen_restart | 0 | 5 | PASS |
| 83 | g1-mweozr48-2c-c8whqt-failure_restart | 0 | 3674504073 | 24 | 8 | 20 | 0.236 | c872286fc5dd | 9b94560450f3 | failure_restart | 0 | 4 | PASS |
| 84 | g1-mweozr4m-2d-ahrtk2-new_game | 3 | 393580359 | 48 | 16 | 29 | 0.493 | 1cc9af5581e5 | c1c7e7837675 | new_game | 0 | 12 | PASS |
| 85 | g1-mweozr5i-2e-dqgff3-application_restart | 2 | 460794013 | 36 | 12 | 27 | 0.514 | c12e369c288e | f7fdd2f8a965 | application_restart | 1 | 19 | PASS |
| 86 | g1-mweozr5z-2f-isd8za-title_screen_restart | 1 | 2994175403 | 30 | 10 | 26 | 0.484 | 68fc9d6163ed | dc13fa634fa4 | title_screen_restart | 1 | 10 | PASS |
| 87 | g1-mweozr67-2g-10az7v8-failure_restart | 0 | 380186742 | 24 | 8 | 24 | 0.215 | 8267933b0bfc | 8976cccc6f80 | failure_restart | 0 | 5 | PASS |
| 88 | g1-mweozr72-2h-11rqxji-new_game | 3 | 3180755915 | 48 | 16 | 34 | 0.353 | c555924acac6 | 089102c801bb | new_game | 0 | 29 | PASS |
| 89 | g1-mweozr8m-2i-1ez5vqr-application_restart | 2 | 3834171498 | 36 | 12 | 26 | 0.484 | fee8535e2f26 | f0e8ac12dbdd | application_restart | 0 | 25 | PASS |
| 90 | g1-mweozr8y-2j-1091wcg-title_screen_restart | 1 | 2120554256 | 30 | 10 | 22 | 0.584 | e4b0e749a105 | 9373a6d120e0 | title_screen_restart | 1 | 9 | PASS |
| 91 | g1-mweozr96-2k-10vvoc5-failure_restart | 0 | 3452348049 | 24 | 8 | 15 | 0.564 | ec25fe6409f2 | 3c31723ab78f | failure_restart | 0 | 5 | PASS |
| 92 | g1-mweozr9j-2l-d5zgs-new_game | 3 | 1753755663 | 48 | 16 | 36 | 0.279 | a0abac565180 | d0fc65e5a072 | new_game | 0 | 11 | PASS |
| 93 | g1-mweozra3-2m-1j870oo-application_restart | 2 | 2421185142 | 36 | 12 | 27 | 0.377 | 479343c90276 | bcaba28ac761 | application_restart | 0 | 12 | PASS |
| 94 | g1-mweozrae-2n-dd3rmy-title_screen_restart | 1 | 4284796415 | 30 | 10 | 26 | 0.43 | cf0cc14e5889 | 39b78f020427 | title_screen_restart | 0 | 7 | PASS |
| 95 | g1-mweozram-2o-18uza50-failure_restart | 0 | 363706077 | 24 | 8 | 20 | 0.451 | 6213c36aed61 | 31b81c5b7c22 | failure_restart | 0 | 5 | PASS |
| 96 | g1-mweozrb1-2p-1d8nwsl-new_game | 3 | 4143774397 | 48 | 16 | 35 | 0.446 | aa59e32a64a1 | a5823f2fbda6 | new_game | 0 | 12 | PASS |
| 97 | g1-mweozrbn-2q-z0vark-application_restart | 2 | 2886852862 | 36 | 12 | 26 | 0.35 | 449205d4dc2e | 5f1dab633888 | application_restart | 0 | 13 | PASS |
| 98 | g1-mweozrc0-2r-1fmkujq-title_screen_restart | 1 | 472470392 | 30 | 10 | 30 | 0.484 | 16e33c0a4286 | 2fdf946ab22b | title_screen_restart | 0 | 7 | PASS |
| 99 | g1-mweozrc6-2s-zdyffi-failure_restart | 0 | 777923052 | 24 | 8 | 20 | 0.414 | 0eaaaaf02159 | 49325255ffe1 | failure_restart | 0 | 4 | PASS |
| 100 | g1-mweozrci-2t-dmk6xf-new_game | 3 | 959132891 | 48 | 16 | 33 | 0.346 | a5576b80fd53 | f80a7837622d | new_game | 0 | 9 | PASS |

</details>

## 第 2 关 · 100 局

| 项 | 值 |
|---|---|
| 耗时 | 5758 ms |
| 牌数范围 | 192 – 321 |
| 开局可点牌范围 | 19 – 25 |
| 档位分布 | {"0":8,"1":11,"2":3,"3":9,"4":5,"5":11,"6":6,"7":7,"8":24,"9":16} |
| 牌数分布 | {"192":24,"255":16,"261":6,"273":5,"282":11,"291":11,"300":3,"312":16,"321":8} |
| 牌型数分布 | {"13":33,"14":10,"15":48,"16":9} |
| 生成原因分布 | {"application_restart":25,"title_screen_restart":25,"failure_restart":25,"new_game":25} |
| 布局签名去重 | 100 / 100 |
| 最近 10 局模板 ID 重复 | 0 |
| 最近 10 局等价几何签名重复 | 0 |
| 最近 10 局结构签名重复 | 0 |
| 最近 10 局布局签名重复 | 0 |
| 最近 10 局几何签名重复 | 0 |
| 重试次数（失败重试合计） | 5 |
| 生成失败次数 | 0 |
| 滑窗 sim 均值 / P95 / 最大 | 0.2434 / 0.3607 / 0.4865 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 37.20 ms |

<details><summary>完整 100 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | sim最大 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g2-mweozre3-2u-1cdao4p-application_restart | 5 | 2032815467 | 291 | 13 | 21 | 0 | eb19e3858e6a | ea0702bbfa3c | application_restart | 0 | 50 | PASS |
| 2 | g2-mweozrfb-2v-ov0aeb-title_screen_restart | 8 | 3106222360 | 192 | 15 | 21 | 0.165 | 505acd3678b4 | c128cc6086be | title_screen_restart | 0 | 23 | PASS |
| 3 | g2-mweozrg8-2w-9usxq1-failure_restart | 9 | 396283944 | 255 | 15 | 22 | 0.254 | ab0f279ce2de | 98f4ac4a9e21 | failure_restart | 0 | 23 | PASS |
| 4 | g2-mweozrhc-2x-1s579xg-new_game | 6 | 2625521570 | 261 | 13 | 20 | 0.29 | b52620fa38ca | a97021f03356 | new_game | 0 | 27 | PASS |
| 5 | g2-mweozrik-2y-17xf3bj-application_restart | 9 | 3585923147 | 255 | 15 | 25 | 0.398 | 03d4a45ac1cd | ae509291d466 | application_restart | 0 | 28 | PASS |
| 6 | g2-mweozrk1-2z-4sx69j-title_screen_restart | 7 | 2182741998 | 312 | 14 | 22 | 0.315 | 45de2f6b98f2 | fe913dcd2c70 | title_screen_restart | 0 | 34 | PASS |
| 7 | g2-mweozrlj-30-s37ryg-failure_restart | 4 | 4059623916 | 273 | 13 | 23 | 0.32 | be013a0f8d56 | 8ce8c9a15e15 | failure_restart | 0 | 29 | PASS |
| 8 | g2-mweozrmx-31-rcii06-new_game | 5 | 448786590 | 291 | 13 | 20 | 0.373 | a96ce35d7fb4 | 14764d726f9d | new_game | 0 | 33 | PASS |
| 9 | g2-mweozro7-32-a0mfhd-application_restart | 8 | 1557114692 | 192 | 15 | 24 | 0.286 | 98167b547e0d | 0195b73bf2aa | application_restart | 0 | 26 | PASS |
| 10 | g2-mweozrpn-33-htnu1s-title_screen_restart | 5 | 2715945434 | 291 | 13 | 20 | 0.363 | a0af67052f99 | 021f4eb3bd53 | title_screen_restart | 0 | 38 | PASS |
| 11 | g2-mweozrrd-34-1x2l8sq-failure_restart | 1 | 1789465063 | 282 | 13 | 19 | 0.371 | cdeb07f7dd29 | 25accdfa3323 | failure_restart | 0 | 38 | PASS |
| 12 | g2-mweozrt4-35-ce2ct9-new_game | 5 | 4117126577 | 291 | 13 | 19 | 0.366 | 395cbaca41a6 | d2f2abe0a7c2 | new_game | 0 | 42 | PASS |
| 13 | g2-mweozrum-36-1ksqbwy-application_restart | 8 | 3049719702 | 192 | 15 | 25 | 0.32 | 7acb33fdbada | 06f244eb85a2 | application_restart | 0 | 29 | PASS |
| 14 | g2-mweozrvy-37-14e5ixr-title_screen_restart | 1 | 3429996598 | 282 | 13 | 23 | 0.286 | 6dc1c327da3e | 79c1db321ea8 | title_screen_restart | 0 | 31 | PASS |
| 15 | g2-mweozrxj-38-u9ligh-failure_restart | 5 | 3729849660 | 291 | 13 | 21 | 0.401 | 2a369e37c7c0 | 005d94f05ed2 | failure_restart | 0 | 35 | PASS |
| 16 | g2-mweozrz3-39-1tvryn0-new_game | 1 | 2803369289 | 282 | 13 | 19 | 0.365 | 392179f04d0f | d8d96830d094 | new_game | 0 | 31 | PASS |
| 17 | g2-mweozs0o-3a-1ve7bdp-application_restart | 3 | 390283926 | 312 | 16 | 19 | 0.331 | 3c043a05db55 | e1ea997e75f1 | application_restart | 0 | 35 | PASS |
| 18 | g2-mweozs2i-3b-1rouj4b-title_screen_restart | 7 | 2809369307 | 312 | 14 | 21 | 0.306 | ec6f54801194 | 7c078f88dcf1 | title_screen_restart | 0 | 40 | PASS |
| 19 | g2-mweozs48-3c-mrrg62-failure_restart | 9 | 783560861 | 255 | 15 | 24 | 0.36 | 84bf62b86587 | e23228f46553 | failure_restart | 0 | 32 | PASS |
| 20 | g2-mweozs5j-3d-y51fr8-new_game | 8 | 1317764300 | 192 | 15 | 19 | 0.315 | e5982259904c | ea5610d8a949 | new_game | 0 | 28 | PASS |
| 21 | g2-mweozs6s-3e-12ns6in-application_restart | 6 | 3195646221 | 261 | 13 | 24 | 0.35 | b15d8ae52900 | c7a0624684f3 | application_restart | 0 | 28 | PASS |
| 22 | g2-mweozs85-3f-1tx4n92-title_screen_restart | 8 | 3275730334 | 192 | 15 | 19 | 0.297 | b783a93cf1db | 4cfed798abb2 | title_screen_restart | 0 | 35 | PASS |
| 23 | g2-mweozs9k-3g-162rmqb-failure_restart | 1 | 2176741980 | 282 | 13 | 20 | 0.289 | dcff869680ee | 035c84b0bd7b | failure_restart | 0 | 32 | PASS |
| 24 | g2-mweozsaz-3h-129tea2-new_game | 4 | 4207550441 | 273 | 13 | 22 | 0.332 | 025f3911de97 | 5f430c795d51 | new_game | 0 | 31 | PASS |
| 25 | g2-mweozsc4-3i-1u348w0-application_restart | 8 | 656215782 | 192 | 15 | 19 | 0.349 | d7003021d40a | a10dbc547caa | application_restart | 0 | 22 | PASS |
| 26 | g2-mweozsdb-3j-50t8di-title_screen_restart | 7 | 4210550450 | 312 | 14 | 20 | 0.346 | d6ace2e751f2 | 1d8dd205bbc1 | title_screen_restart | 0 | 31 | PASS |
| 27 | g2-mweozsey-3k-1cmps8l-failure_restart | 5 | 1702041208 | 291 | 13 | 19 | 0.361 | a741bb0aaa87 | 40b4a19d691f | failure_restart | 0 | 34 | PASS |
| 28 | g2-mweozsgj-3l-1biu2l8-new_game | 9 | 3677347014 | 255 | 15 | 24 | 0.383 | bab7ed5ad90e | 0173c9f5b632 | new_game | 0 | 32 | PASS |
| 29 | g2-mweozsic-3m-12l2a09-application_restart | 3 | 3727849654 | 312 | 16 | 20 | 0.344 | 9a2f86154478 | c4314c7472a4 | application_restart | 0 | 44 | PASS |
| 30 | g2-mweozsk6-3n-9xp1b4-title_screen_restart | 8 | 3254148885 | 192 | 15 | 23 | 0.321 | b76bd48e1d7f | 2f2bdf686048 | title_screen_restart | 0 | 35 | PASS |
| 31 | g2-mweozsls-3o-1hcjv9r-failure_restart | 9 | 692136994 | 255 | 15 | 22 | 0.384 | 927017a0e82b | 33e99877ed20 | failure_restart | 0 | 35 | PASS |
| 32 | g2-mweozsn7-3p-18ji2uz-new_game | 1 | 923487362 | 282 | 13 | 20 | 0.4 | 4d1a5d6fc524 | 3779050ab23f | new_game | 0 | 32 | PASS |
| 33 | g2-mweozsoo-3q-p3nhh6-application_restart | 0 | 56509658 | 321 | 15 | 21 | 0.255 | 6c078d4dbe41 | 95738a58a421 | application_restart | 0 | 31 | PASS |
| 34 | g2-mweozsq9-3r-4cnr72-title_screen_restart | 3 | 2474595036 | 312 | 16 | 20 | 0.408 | 15dea981f1f5 | 1b5cca04acbe | title_screen_restart | 0 | 33 | PASS |
| 35 | g2-mweozsrp-3s-1toxeje-failure_restart | 9 | 4121126589 | 255 | 15 | 24 | 0.307 | 240c67888075 | ca5d9b3bc780 | failure_restart | 0 | 28 | PASS |
| 36 | g2-mweozst1-3t-gqtvg-new_game | 1 | 1845967721 | 282 | 13 | 20 | 0.395 | 46674f027942 | 615e4a754870 | new_game | 0 | 30 | PASS |
| 37 | g2-mweozsua-3u-b8s4kq-application_restart | 9 | 1706041220 | 255 | 15 | 24 | 0.269 | 0a7ee0714ea1 | 18d69c15abc5 | application_restart | 0 | 26 | PASS |
| 38 | g2-mweozsvq-3v-14q2q7h-title_screen_restart | 0 | 1013911226 | 321 | 15 | 20 | 0.363 | ec25967abe24 | 426f9086669f | title_screen_restart | 0 | 37 | PASS |
| 39 | g2-mweozsxk-3w-1f9gpzo-failure_restart | 5 | 1314764291 | 291 | 13 | 24 | 0.347 | 42c35ee3eb05 | 1dffd6deab9e | failure_restart | 0 | 38 | PASS |
| 40 | g2-mweozsyq-3x-4qel50-new_game | 8 | 4141708035 | 192 | 15 | 20 | 0.287 | 6cd102225382 | f1970a04e3cc | new_game | 0 | 25 | PASS |
| 41 | g2-mweozt0j-3y-185vpe7-application_restart | 0 | 387283917 | 321 | 15 | 19 | 0.293 | 8e9146259c67 | 02e44a0b2839 | application_restart | 0 | 52 | PASS |
| 42 | g2-mweozt2g-3z-134yazh-title_screen_restart | 2 | 3966200043 | 300 | 14 | 20 | 0.359 | 43900d7938e9 | 94bf2f156b84 | title_screen_restart | 0 | 43 | PASS |
| 43 | g2-mweozt40-40-1c8fty9-failure_restart | 9 | 452786602 | 255 | 15 | 19 | 0.372 | 8625fe43fc6c | c8f65b118f0c | failure_restart | 0 | 30 | PASS |
| 44 | g2-mweozt5a-41-162p3f4-new_game | 6 | 2625521570 | 261 | 13 | 20 | 0.379 | 1016e612aaba | 87b9c61e97c2 | new_game | 0 | 30 | PASS |
| 45 | g2-mweozt6q-42-1mswxka-application_restart | 5 | 2807369301 | 291 | 13 | 21 | 0.27 | 4ea64e5d1ae8 | 67fae083f9dd | application_restart | 0 | 35 | PASS |
| 46 | g2-mweozt8f-43-gal3vo-title_screen_restart | 9 | 3973200064 | 255 | 15 | 21 | 0.385 | 1eaee4f1da1c | 589eb4a8d7a5 | title_screen_restart | 0 | 35 | PASS |
| 47 | g2-mweozta4-44-1efft1w-failure_restart | 0 | 2802369286 | 321 | 15 | 22 | 0.34 | ccf14ef6bc10 | 8ac07a74f203 | failure_restart | 0 | 40 | PASS |
| 48 | g2-mweoztby-45-xyfw1o-new_game | 4 | 60509670 | 273 | 13 | 20 | 0.313 | 582567ee257f | 0b2575099c5b | new_game | 0 | 38 | PASS |
| 49 | g2-mweoztdm-46-klfu4-application_restart | 7 | 4062623925 | 312 | 14 | 19 | 0.352 | d21e0a1a2172 | 30dcbc66274d | application_restart | 0 | 37 | PASS |
| 50 | g2-mweoztez-47-vugrw7-title_screen_restart | 8 | 1078413908 | 192 | 15 | 21 | 0.327 | 341adf2ed795 | 0dfd8c1fc8e5 | title_screen_restart | 0 | 23 | PASS |
| 51 | g2-mweoztha-49-wbxads-failure_restart | 3 | 1073413893 | 312 | 16 | 20 | 0.294 | 119589695be7 | d84d5b2fdaca | failure_restart | 0 | 34 | PASS |
| 52 | g2-mweoztis-4a-edodfs-new_game | 4 | 3728849657 | 273 | 13 | 23 | 0.363 | 503687747554 | b345b7ce9e91 | new_game | 0 | 31 | PASS |
| 53 | g2-mweoztjt-4b-et6crt-application_restart | 8 | 2240244659 | 192 | 15 | 22 | 0.287 | 798ff9c26b92 | a45409a98174 | application_restart | 0 | 19 | PASS |
| 54 | g2-mweoztkz-4c-1eu1l8l-title_screen_restart | 7 | 4119126583 | 312 | 14 | 21 | 0.383 | 7692d524c9d7 | 50d44dfb3920 | title_screen_restart | 0 | 31 | PASS |
| 55 | g2-mweoztr5-4d-17cdlz8-failure_restart | 8 | 3254148885 | 192 | 15 | 20 | 0.384 | 340b8c9f7e6f | 9cfa28126513 | failure_restart | 1 | 193 | PASS |
| 56 | g2-mweoztsw-4e-14h2uqv-new_game | 9 | 452786602 | 255 | 15 | 25 | 0.382 | 07f57e7c7dd1 | 6c2f55ae9e34 | new_game | 1 | 50 | PASS |
| 57 | g2-mweozttt-4f-122g0w3-application_restart | 8 | 1317764300 | 192 | 15 | 20 | 0.248 | 99daaedda753 | 235c807619d7 | application_restart | 0 | 17 | PASS |
| 58 | g2-mweoztvj-4g-inslot-title_screen_restart | 3 | 1847967727 | 312 | 16 | 21 | 0.395 | d97d19f0b98e | dda7dfefb4c6 | title_screen_restart | 0 | 51 | PASS |
| 59 | g2-mweoztxb-4h-bg5ddt-failure_restart | 9 | 3437996622 | 255 | 15 | 25 | 0.38 | 83e2337c2b84 | 4b8e4fdf8f50 | failure_restart | 0 | 34 | PASS |
| 60 | g2-mweoztzd-4i-r49emf-new_game | 1 | 3190646206 | 282 | 13 | 20 | 0.321 | 3be70587e548 | 4189fd9f2cc1 | new_game | 1 | 58 | PASS |
| 61 | g2-mweozu5k-4j-m63qt9-application_restart | 3 | 150933534 | 312 | 16 | 22 | 0.373 | c0b49712ded5 | 610222c20698 | application_restart | 1 | 203 | PASS |
| 62 | g2-mweozu78-4k-mgdqa6-title_screen_restart | 0 | 3189646203 | 321 | 15 | 23 | 0.335 | 96939493d0bb | a63b0f863340 | title_screen_restart | 0 | 37 | PASS |
| 63 | g2-mweozu8l-4l-yocyj3-failure_restart | 8 | 2958295835 | 192 | 15 | 20 | 0.356 | 4838e227860b | cfe39794fafb | failure_restart | 0 | 26 | PASS |
| 64 | g2-mweozudt-4m-15oktrw-new_game | 3 | 390283926 | 312 | 16 | 21 | 0.371 | f4f37aa7ecec | e16a4c0d38c2 | new_game | 1 | 178 | PASS |
| 65 | g2-mweozuf9-4n-kylzzm-application_restart | 1 | 4113126565 | 282 | 13 | 20 | 0.244 | 5fc3de3b2139 | 225cafcbf8eb | application_restart | 0 | 28 | PASS |
| 66 | g2-mweozugr-4o-1cvwpow-title_screen_restart | 5 | 3433996610 | 291 | 13 | 22 | 0.39 | 7a3848fc7aa2 | 8d55f94d187a | title_screen_restart | 0 | 34 | PASS |
| 67 | g2-mweozui3-4p-mvkzs0-failure_restart | 8 | 1761543875 | 192 | 15 | 19 | 0.244 | fd7cd77c7c45 | 281bd2f98f98 | failure_restart | 0 | 24 | PASS |
| 68 | g2-mweozuj1-4q-119o8ro-new_game | 6 | 1315764294 | 261 | 13 | 21 | 0.276 | 0a3a4e1b09aa | 349c0b550840 | new_game | 0 | 21 | PASS |
| 69 | g2-mweozuk1-4r-7nlsib-application_restart | 8 | 2923374626 | 192 | 15 | 21 | 0.305 | 526b6fd5e912 | 60b607309049 | application_restart | 0 | 20 | PASS |
| 70 | g2-mweozul1-4s-155wxj2-title_screen_restart | 9 | 1022911253 | 255 | 15 | 23 | 0.284 | bdc295bf9652 | ad193ec45c5c | title_screen_restart | 0 | 25 | PASS |
| 71 | g2-mweozulx-4t-8jkdbi-failure_restart | 8 | 1226340433 | 192 | 15 | 20 | 0.277 | 709caa939e09 | e6636b9cec54 | failure_restart | 0 | 17 | PASS |
| 72 | g2-mweozumz-4u-r6yqaw-new_game | 6 | 3674347005 | 261 | 13 | 22 | 0.343 | ae1b8a92fc35 | 3406d114e047 | new_game | 0 | 29 | PASS |
| 73 | g2-mweozuof-4v-1ygwky-application_restart | 8 | 3993781510 | 192 | 15 | 19 | 0.289 | aa4e2975225e | ffb5f5c30d33 | application_restart | 0 | 31 | PASS |
| 74 | g2-mweozupz-4w-m2pcnj-title_screen_restart | 9 | 3346572755 | 255 | 15 | 21 | 0.254 | 78def08abc39 | 06fbfe679d0a | title_screen_restart | 0 | 37 | PASS |
| 75 | g2-mweozur7-4x-vxp4ix-failure_restart | 8 | 1043492699 | 192 | 15 | 22 | 0.326 | 4cceffd80f4f | 631dec314767 | failure_restart | 0 | 23 | PASS |
| 76 | g2-mweozusd-4y-1tuhnzt-new_game | 3 | 3192646212 | 312 | 16 | 22 | 0.377 | 43f649f71723 | 6269192dbf8f | new_game | 0 | 32 | PASS |
| 77 | g2-mweozuts-4z-v9djpa-application_restart | 9 | 2811369313 | 255 | 15 | 23 | 0.337 | b618505a0501 | ec24e12d76a5 | application_restart | 0 | 30 | PASS |
| 78 | g2-mweozuuq-50-9f681y-title_screen_restart | 8 | 3550001935 | 192 | 15 | 20 | 0.342 | b713ac7aa44c | a4ef17e90761 | title_screen_restart | 0 | 18 | PASS |
| 79 | g2-mweozuw4-51-l6l3vt-failure_restart | 5 | 3342572743 | 291 | 13 | 19 | 0.32 | 5e97c9055629 | 291049edb2e5 | failure_restart | 0 | 38 | PASS |
| 80 | g2-mweozuxq-52-obav6h-new_game | 8 | 2092318134 | 192 | 15 | 19 | 0.378 | 3e5fc7065075 | 8ea556edb300 | new_game | 0 | 28 | PASS |
| 81 | g2-mweozuyt-53-1on9orm-application_restart | 1 | 2324668505 | 282 | 13 | 22 | 0.278 | 316bc07e950d | d33a31f4f341 | application_restart | 0 | 26 | PASS |
| 82 | g2-mweozv0a-54-5xj7cw-title_screen_restart | 2 | 924487365 | 300 | 14 | 19 | 0.37 | c0d09bb890cf | 17e0478f5d8d | title_screen_restart | 0 | 33 | PASS |
| 83 | g2-mweozv1y-55-17llrq4-failure_restart | 6 | 3822273530 | 261 | 13 | 20 | 0.334 | a50c96246ccd | 6c7501796bf0 | failure_restart | 0 | 35 | PASS |
| 84 | g2-mweozv3j-56-18zwerf-new_game | 3 | 1404188152 | 312 | 16 | 24 | 0.424 | fb012a16b76e | c6370025ad7c | new_game | 0 | 37 | PASS |
| 85 | g2-mweozv4u-57-1cf1p1f-application_restart | 9 | 3437996622 | 255 | 15 | 21 | 0.366 | ae2b3ee5d279 | d5d440d1779c | application_restart | 0 | 27 | PASS |
| 86 | g2-mweozv5y-58-1f0a6y-title_screen_restart | 8 | 2296747317 | 192 | 15 | 23 | 0.279 | 4d5d57670ebe | b2d9284dc592 | title_screen_restart | 0 | 22 | PASS |
| 87 | g2-mweozv7o-59-j29upv-failure_restart | 0 | 3964200037 | 321 | 15 | 25 | 0.307 | d0a6df93f9d8 | 95c5214920a2 | failure_restart | 0 | 48 | PASS |
| 88 | g2-mweozval-5a-5ywrqd-new_game | 7 | 2570018915 | 312 | 14 | 19 | 0.487 | 000aadf5fb50 | 9829ce3cab5d | new_game | 0 | 62 | PASS |
| 89 | g2-mweozvc4-5b-16h901z-application_restart | 9 | 3346572755 | 255 | 15 | 24 | 0.237 | 2ddf53474ade | 66181df58186 | application_restart | 0 | 30 | PASS |
| 90 | g2-mweozvdc-5c-1at3nnr-title_screen_restart | 5 | 4117126577 | 291 | 13 | 19 | 0.351 | f5626b923e42 | c0e95115aeba | title_screen_restart | 0 | 28 | PASS |
| 91 | g2-mweozvf4-5d-105a4f9-failure_restart | 2 | 149933531 | 300 | 14 | 19 | 0.278 | d1d897a1d44e | 1a4ed8c710f2 | failure_restart | 0 | 41 | PASS |
| 92 | g2-mweozvgu-5e-17cjphd-new_game | 4 | 3045719690 | 273 | 13 | 22 | 0.379 | 77a33ae5ce8e | fa4339691dbf | new_game | 0 | 37 | PASS |
| 93 | g2-mweozvio-5f-1hmddb9-application_restart | 0 | 922487359 | 321 | 15 | 20 | 0.374 | 0782537cdba4 | bf262258c573 | application_restart | 0 | 41 | PASS |
| 94 | g2-mweozvk8-5g-12pt8kk-title_screen_restart | 8 | 4141708035 | 192 | 15 | 20 | 0.243 | 17c667b1af13 | 16e27195c1ca | title_screen_restart | 0 | 30 | PASS |
| 95 | g2-mweozvlj-5h-13twv8u-failure_restart | 1 | 4056623907 | 282 | 13 | 23 | 0.386 | a03ce94f5419 | 681b69e3cf64 | failure_restart | 0 | 28 | PASS |
| 96 | g2-mweozvmj-5i-jcnpgd-new_game | 8 | 656215782 | 192 | 15 | 20 | 0.292 | 019b1861bfe1 | c9ac3e8652b8 | new_game | 0 | 18 | PASS |
| 97 | g2-mweozvnl-5j-19bn9b4-application_restart | 1 | 3190646206 | 282 | 13 | 21 | 0.293 | c718d956efc0 | a6195e323146 | application_restart | 0 | 27 | PASS |
| 98 | g2-mweozvp5-5k-1og4f86-title_screen_restart | 7 | 4210550450 | 312 | 14 | 19 | 0.389 | 182c8c3aa8b4 | 78a5882e4a89 | title_screen_restart | 0 | 38 | PASS |
| 99 | g2-mweozvr3-5l-orsudy-failure_restart | 0 | 1309764276 | 321 | 15 | 22 | 0.352 | 81dae221c90d | e7aed0492ff3 | failure_restart | 0 | 39 | PASS |
| 100 | g2-mweozvsa-5m-10012kv-new_game | 8 | 2923374626 | 192 | 15 | 25 | 0.292 | 7ac6d9e381ac | 981a28db538e | new_game | 0 | 22 | PASS |

</details>

## 失败案例与原因

本次运行 **0** 个生成失败案例；每次重试的原因均记录在 `random-generation-report.json` 的逐局 `retries` 字段。

## 测试性质说明

- 运行时：两关各 100 局真实调用 `createNewGame`，真实生成、真实签名、真实校验。
- 相似度：用**真实牌面**两两计算 `layoutSimilarity`（层占位格 Jaccard 均值 ×0.5 + 整体轮廓 Jaccard ×0.5），不是签名比较。
- 静态审计：三种重新开局入口通过读取 `src/main.js` 源码确认全部走统一入口；未冒充浏览器实测。
- 重启模拟：把存档 JSON 写入磁盘再读回，继续生成并验证差异化。
- 浏览器实际运行 / Windows 安装卸载测试不在本文件覆盖范围，见 `FINAL_ACCEPTANCE.md`。
