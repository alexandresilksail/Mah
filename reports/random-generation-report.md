# 连续 200 局随机生成压力测试报告

> 本文件由 `node test-random-generation.js` **真实运行**自动生成，不是静态 PASS 模板。

- 运行时间：2026-11-12T02:22:16.237Z
- Git commit：`04374993a51d29cec465d596de0a6d0e92199856`
- 断言：通过 **5053**，失败 **0**
- 总耗时：6898 ms
- 布局签名算法：`MAH-LAYOUT-SIG-v1/SHA-256`（SHA-256，浏览器与 Node 共用同一实现）
- 历史窗口：每关最近 3 局；重试上限 50 次

## 全局

| 项 | 值 |
|---|---|
| 总生成局数 | 200 |
| gameId 唯一数 | 202 / 202 |
| 布局签名总数 / 去重 | 200 / 183 |
| 生成失败次数 | 0 |
| 重试总次数 | 235 |
| 平均单局生成耗时 | 24.79 ms |
| 失败案例 | 0 |

## 第 1 关 · 100 局

| 项 | 值 |
|---|---|
| 耗时 | 343 ms |
| 牌数范围 | 24 – 48 |
| 开局可点牌范围 | 10 – 17 |
| 档位分布 | {"0":25,"1":25,"2":25,"3":25} |
| 牌数分布 | {"24":25,"30":25,"36":25,"48":25} |
| 牌型数分布 | {"8":25,"10":25,"12":25,"16":25} |
| 生成原因分布 | {"application_restart":25,"title_screen_restart":25,"failure_restart":25,"new_game":25} |
| 布局签名去重 | 100 / 100 |
| 最近三局牌数重复 | 0 |
| 最近三局布局签名重复 | 0 |
| 最近三局几何签名重复 | 0 |
| 重试次数 | 202 |
| 生成失败次数 | 0 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 2.68 ms |

<details><summary>完整 100 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g1-mwcx9xle-1-1im4to5-application_restart | 1 | 3355309309 | 30 | 10 | 10 | f602f2c136d1 | b6d81ade91cd | application_restart | 0 | 4 | PASS |
| 2 | g1-mwcx9xlh-2-1f1875s-title_screen_restart | 0 | 3560325066 | 24 | 8 | 10 | 4f382461353b | 811ba9f7a60c | title_screen_restart | 0 | 1 | PASS |
| 3 | g1-mwcx9xlk-3-crycwp-failure_restart | 3 | 1780269446 | 48 | 16 | 17 | fad3fd3b9e00 | 25d5c950c190 | failure_restart | 0 | 3 | PASS |
| 4 | g1-mwcx9xln-4-19mu0yu-new_game | 2 | 3855791872 | 36 | 12 | 12 | 88393e23f671 | 6b10f2e782d4 | new_game | 0 | 1 | PASS |
| 5 | g1-mwcx9xlp-5-ivuy99-application_restart | 1 | 303556187 | 30 | 10 | 10 | cf41e26c26d8 | b6d81ade91cd | application_restart | 0 | 2 | PASS |
| 6 | g1-mwcx9xlr-6-7e2s3m-title_screen_restart | 0 | 2859847175 | 24 | 8 | 10 | 351a6530af0f | 811ba9f7a60c | title_screen_restart | 0 | 2 | PASS |
| 7 | g1-mwcx9xlu-7-pf03ld-failure_restart | 3 | 3296831961 | 48 | 16 | 17 | 2e6d988b47ff | 25d5c950c190 | failure_restart | 1 | 2 | PASS |
| 8 | g1-mwcx9xlx-8-1jaq52c-new_game | 2 | 3737223008 | 36 | 12 | 12 | 349174ecfd5e | 6b10f2e782d4 | new_game | 0 | 3 | PASS |
| 9 | g1-mwcx9xm0-9-1s0kvk-application_restart | 1 | 1972366254 | 30 | 10 | 10 | 552518b27adb | b6d81ade91cd | application_restart | 2 | 2 | PASS |
| 10 | g1-mwcx9xm2-a-l4bvze-title_screen_restart | 0 | 4048729788 | 24 | 8 | 10 | be0e72eba384 | 811ba9f7a60c | title_screen_restart | 0 | 1 | PASS |
| 11 | g1-mwcx9xm4-b-15phzwz-failure_restart | 3 | 853792290 | 48 | 16 | 17 | f2afb4371bb9 | 25d5c950c190 | failure_restart | 0 | 1 | PASS |
| 12 | g1-mwcx9xm9-c-ixkmj1-new_game | 2 | 1859099964 | 36 | 12 | 12 | c930f9fb6431 | 6b10f2e782d4 | new_game | 3 | 4 | PASS |
| 13 | g1-mwcx9xmf-d-tfxm7r-application_restart | 1 | 381808758 | 30 | 10 | 10 | 11d9026212a5 | b6d81ade91cd | application_restart | 5 | 6 | PASS |
| 14 | g1-mwcx9xmk-e-1ot5cmq-title_screen_restart | 0 | 1286440946 | 24 | 8 | 10 | 0873b4321913 | 811ba9f7a60c | title_screen_restart | 3 | 4 | PASS |
| 15 | g1-mwcx9xmo-f-vp537q-failure_restart | 3 | 589009451 | 48 | 16 | 17 | 5205376ba884 | 25d5c950c190 | failure_restart | 3 | 5 | PASS |
| 16 | g1-mwcx9xmq-g-1ljje4-new_game | 2 | 4257697689 | 36 | 12 | 12 | 7a47253200b2 | 6b10f2e782d4 | new_game | 0 | 2 | PASS |
| 17 | g1-mwcx9xmt-h-47veg6-application_restart | 1 | 2833757039 | 30 | 10 | 10 | f84be38c619f | b6d81ade91cd | application_restart | 0 | 1 | PASS |
| 18 | g1-mwcx9xmv-i-w3wnc-title_screen_restart | 0 | 4062699151 | 24 | 8 | 10 | 5ba76f74cc06 | 811ba9f7a60c | title_screen_restart | 0 | 1 | PASS |
| 19 | g1-mwcx9xn1-j-1et69av-failure_restart | 3 | 1522010176 | 48 | 16 | 17 | 649edd3dcc97 | 25d5c950c190 | failure_restart | 4 | 5 | PASS |
| 20 | g1-mwcx9xn9-k-w7sllr-new_game | 2 | 3348513850 | 36 | 12 | 12 | d061e7b5b5ff | 6b10f2e782d4 | new_game | 3 | 6 | PASS |
| 21 | g1-mwcx9xnc-l-1qgmtpu-application_restart | 1 | 3210724880 | 30 | 10 | 10 | 52c143451036 | b6d81ade91cd | application_restart | 1 | 2 | PASS |
| 22 | g1-mwcx9xnf-m-18s4np6-title_screen_restart | 0 | 938483127 | 24 | 8 | 10 | 050f5f126eb4 | 811ba9f7a60c | title_screen_restart | 1 | 2 | PASS |
| 23 | g1-mwcx9xnj-n-7lryw5-failure_restart | 3 | 863324853 | 48 | 16 | 17 | 08559602a53e | 25d5c950c190 | failure_restart | 3 | 3 | PASS |
| 24 | g1-mwcx9xno-o-1xymcq8-new_game | 2 | 2066463097 | 36 | 12 | 12 | ed97a0688e5c | 6b10f2e782d4 | new_game | 1 | 3 | PASS |
| 25 | g1-mwcx9xnq-p-ufdv4z-application_restart | 1 | 160507385 | 30 | 10 | 10 | 2c3d21266a79 | b6d81ade91cd | application_restart | 1 | 1 | PASS |
| 26 | g1-mwcx9xnv-q-t4z8lp-title_screen_restart | 0 | 3526016238 | 24 | 8 | 10 | 0990a02b503f | 811ba9f7a60c | title_screen_restart | 3 | 4 | PASS |
| 27 | g1-mwcx9xnx-r-1fghok2-failure_restart | 3 | 2274724855 | 48 | 16 | 17 | 4fe54e7ca22d | 25d5c950c190 | failure_restart | 1 | 2 | PASS |
| 28 | g1-mwcx9xnz-s-e7vh2g-new_game | 2 | 2511279355 | 36 | 12 | 12 | 44c8484c0e8c | 6b10f2e782d4 | new_game | 0 | 2 | PASS |
| 29 | g1-mwcx9xo6-t-otcgs2-application_restart | 1 | 1314420891 | 30 | 10 | 10 | 3f43447e328e | b6d81ade91cd | application_restart | 3 | 6 | PASS |
| 30 | g1-mwcx9xo9-u-qux7xn-title_screen_restart | 0 | 2554077385 | 24 | 8 | 10 | eed99f35ca50 | 811ba9f7a60c | title_screen_restart | 0 | 1 | PASS |
| 31 | g1-mwcx9xod-v-k39krg-failure_restart | 3 | 1274936248 | 48 | 16 | 17 | aabe58691451 | 25d5c950c190 | failure_restart | 2 | 3 | PASS |
| 32 | g1-mwcx9xoh-w-1mhqbpd-new_game | 2 | 3173472047 | 36 | 12 | 12 | aabf26663693 | 6b10f2e782d4 | new_game | 0 | 2 | PASS |
| 33 | g1-mwcx9xom-x-11478fg-application_restart | 1 | 3933213758 | 30 | 10 | 10 | d7dd7d0a289f | b6d81ade91cd | application_restart | 1 | 4 | PASS |
| 34 | g1-mwcx9xop-y-1dzpi78-title_screen_restart | 0 | 3541398806 | 24 | 8 | 10 | 233054ce5fb6 | 811ba9f7a60c | title_screen_restart | 2 | 2 | PASS |
| 35 | g1-mwcx9xov-z-1kbo5ue-failure_restart | 3 | 2281094540 | 48 | 16 | 17 | 29b94675e9fe | 25d5c950c190 | failure_restart | 7 | 6 | PASS |
| 36 | g1-mwcx9xoy-10-11p59wh-new_game | 2 | 3139057694 | 36 | 12 | 12 | 479847aba3db | 6b10f2e782d4 | new_game | 0 | 2 | PASS |
| 37 | g1-mwcx9xp2-11-1rfm6we-application_restart | 1 | 3981469533 | 30 | 10 | 10 | 71549e736690 | b6d81ade91cd | application_restart | 1 | 3 | PASS |
| 38 | g1-mwcx9xp5-12-189w6i5-title_screen_restart | 0 | 2423158197 | 24 | 8 | 10 | f5afa0dd8dd5 | 811ba9f7a60c | title_screen_restart | 1 | 2 | PASS |
| 39 | g1-mwcx9xp7-13-isdgre-failure_restart | 3 | 911341904 | 48 | 16 | 17 | eb110b0fba9f | 25d5c950c190 | failure_restart | 0 | 2 | PASS |
| 40 | g1-mwcx9xp9-14-h3ffhb-new_game | 2 | 3099301837 | 36 | 12 | 12 | ecff6f8c5ecd | 6b10f2e782d4 | new_game | 1 | 1 | PASS |
| 41 | g1-mwcx9xpb-15-g4xnm5-application_restart | 1 | 1805323062 | 30 | 10 | 10 | a3ad52fea1d4 | b6d81ade91cd | application_restart | 0 | 1 | PASS |
| 42 | g1-mwcx9xpf-16-qn4yds-title_screen_restart | 0 | 3919751737 | 24 | 8 | 10 | 216ab926f6bc | 811ba9f7a60c | title_screen_restart | 3 | 4 | PASS |
| 43 | g1-mwcx9xph-17-110ylrv-failure_restart | 3 | 3632963980 | 48 | 16 | 17 | 6703416b3b34 | 25d5c950c190 | failure_restart | 0 | 1 | PASS |
| 44 | g1-mwcx9xpj-18-j82z6w-new_game | 2 | 629088728 | 36 | 12 | 12 | 8f16d42264d0 | 6b10f2e782d4 | new_game | 0 | 1 | PASS |
| 45 | g1-mwcx9xpl-19-ts1h14-application_restart | 1 | 42132778 | 30 | 10 | 10 | 76c6cd244efb | b6d81ade91cd | application_restart | 2 | 2 | PASS |
| 46 | g1-mwcx9xpp-1a-ctoo86-title_screen_restart | 0 | 490361185 | 24 | 8 | 10 | d8f0b5357c88 | 811ba9f7a60c | title_screen_restart | 3 | 3 | PASS |
| 47 | g1-mwcx9xpq-1b-4bucvh-failure_restart | 3 | 2806813928 | 48 | 16 | 17 | e07e12d2bc79 | 25d5c950c190 | failure_restart | 0 | 1 | PASS |
| 48 | g1-mwcx9xpw-1c-vz6bg8-new_game | 2 | 952766445 | 36 | 12 | 12 | dade94149256 | 6b10f2e782d4 | new_game | 8 | 6 | PASS |
| 49 | g1-mwcx9xq2-1d-7yu34i-application_restart | 1 | 118102025 | 30 | 10 | 10 | b7ed95c60ced | b6d81ade91cd | application_restart | 6 | 5 | PASS |
| 50 | g1-mwcx9xq5-1e-1djmhcm-title_screen_restart | 0 | 1616774949 | 24 | 8 | 10 | 17ec3cd93971 | 811ba9f7a60c | title_screen_restart | 3 | 2 | PASS |
| 51 | g1-mwcx9xqd-1g-1mhfzq9-failure_restart | 3 | 59089228 | 48 | 16 | 17 | 38a703181978 | 25d5c950c190 | failure_restart | 3 | 4 | PASS |
| 52 | g1-mwcx9xqf-1h-6oexno-new_game | 2 | 3562478711 | 36 | 12 | 12 | 3678db965b24 | 6b10f2e782d4 | new_game | 1 | 2 | PASS |
| 53 | g1-mwcx9xqh-1i-ffya1s-application_restart | 1 | 1446074143 | 30 | 10 | 10 | 3ca6292e38d6 | b6d81ade91cd | application_restart | 0 | 1 | PASS |
| 54 | g1-mwcx9xqi-1j-ixeuwd-title_screen_restart | 0 | 2915647785 | 24 | 8 | 10 | 5737a5cff63f | 811ba9f7a60c | title_screen_restart | 0 | 0 | PASS |
| 55 | g1-mwcx9xqn-1k-ml43wn-failure_restart | 3 | 3438742683 | 48 | 16 | 17 | a10b79727b93 | 25d5c950c190 | failure_restart | 6 | 4 | PASS |
| 56 | g1-mwcx9xqp-1l-3t9mcj-new_game | 2 | 1517691376 | 36 | 12 | 12 | ed8cc392f8c1 | 6b10f2e782d4 | new_game | 0 | 1 | PASS |
| 57 | g1-mwcx9xqu-1m-pu2o29-application_restart | 1 | 3732793790 | 30 | 10 | 10 | 88af90aef531 | b6d81ade91cd | application_restart | 4 | 6 | PASS |
| 58 | g1-mwcx9xqy-1n-1bnpdnl-title_screen_restart | 0 | 1779922665 | 24 | 8 | 10 | bcd19d4e76fa | 811ba9f7a60c | title_screen_restart | 1 | 2 | PASS |
| 59 | g1-mwcx9xr1-1o-1tjfw2g-failure_restart | 3 | 1788182641 | 48 | 16 | 17 | 0a12ba6f3ce3 | 25d5c950c190 | failure_restart | 1 | 2 | PASS |
| 60 | g1-mwcx9xr3-1p-wu4m5o-new_game | 2 | 3262697263 | 36 | 12 | 12 | e635335d9394 | 6b10f2e782d4 | new_game | 0 | 1 | PASS |
| 61 | g1-mwcx9xr6-1q-1dy1bk4-application_restart | 1 | 1619266526 | 30 | 10 | 10 | 73da2da09e1b | b6d81ade91cd | application_restart | 3 | 2 | PASS |
| 62 | g1-mwcx9xr9-1r-l2ooqq-title_screen_restart | 0 | 491582737 | 24 | 8 | 10 | cfc16b2aa09f | 811ba9f7a60c | title_screen_restart | 2 | 2 | PASS |
| 63 | g1-mwcx9xrc-1s-11kmxzc-failure_restart | 3 | 1041411969 | 48 | 16 | 17 | cc3493bc7c66 | 25d5c950c190 | failure_restart | 2 | 2 | PASS |
| 64 | g1-mwcx9xre-1t-1oz1j80-new_game | 2 | 3985667434 | 36 | 12 | 12 | 39fe023ccc09 | 6b10f2e782d4 | new_game | 0 | 1 | PASS |
| 65 | g1-mwcx9xrf-1u-11z1ypa-application_restart | 1 | 3161017559 | 30 | 10 | 10 | 846c4c6672ec | b6d81ade91cd | application_restart | 1 | 1 | PASS |
| 66 | g1-mwcx9xrk-1v-xbl3ot-title_screen_restart | 0 | 4261788146 | 24 | 8 | 10 | 9ab466cd3e67 | 811ba9f7a60c | title_screen_restart | 6 | 5 | PASS |
| 67 | g1-mwcx9xrq-1w-1nq5b1d-failure_restart | 3 | 2111618351 | 48 | 16 | 17 | fab7b5e0cf5b | 25d5c950c190 | failure_restart | 5 | 5 | PASS |
| 68 | g1-mwcx9xs1-1x-16zt281-new_game | 2 | 2995445531 | 36 | 12 | 12 | cb1d05e813d3 | 6b10f2e782d4 | new_game | 12 | 10 | PASS |
| 69 | g1-mwcx9xs2-1y-1ves62y-application_restart | 1 | 1177739841 | 30 | 10 | 10 | 0c97931cbb89 | b6d81ade91cd | application_restart | 0 | 1 | PASS |
| 70 | g1-mwcx9xs8-1z-jc1fco-title_screen_restart | 0 | 1230372170 | 24 | 8 | 10 | 547aaa49a004 | 811ba9f7a60c | title_screen_restart | 5 | 5 | PASS |
| 71 | g1-mwcx9xsa-20-1qsc499-failure_restart | 3 | 2150684702 | 48 | 16 | 17 | dc2c70d79dfb | 25d5c950c190 | failure_restart | 1 | 2 | PASS |
| 72 | g1-mwcx9xsc-21-1v57an4-new_game | 2 | 3093392803 | 36 | 12 | 12 | 53864ade5bc2 | 6b10f2e782d4 | new_game | 1 | 1 | PASS |
| 73 | g1-mwcx9xse-22-1h3486i-application_restart | 1 | 2704204806 | 30 | 10 | 10 | 1845b6c01ec6 | b6d81ade91cd | application_restart | 1 | 2 | PASS |
| 74 | g1-mwcx9xsf-23-wcf63g-title_screen_restart | 0 | 4256849005 | 24 | 8 | 10 | bc02816c3715 | 811ba9f7a60c | title_screen_restart | 0 | 1 | PASS |
| 75 | g1-mwcx9xsg-24-1wdmrf5-failure_restart | 3 | 1362087230 | 48 | 16 | 17 | 414298ab7997 | 25d5c950c190 | failure_restart | 0 | 1 | PASS |
| 76 | g1-mwcx9xsk-25-168aax1-new_game | 2 | 1869901457 | 36 | 12 | 12 | 9ef243e77068 | 6b10f2e782d4 | new_game | 6 | 3 | PASS |
| 77 | g1-mwcx9xsn-26-bzic2m-application_restart | 1 | 3630333220 | 30 | 10 | 10 | 421f53698009 | b6d81ade91cd | application_restart | 2 | 3 | PASS |
| 78 | g1-mwcx9xst-27-1curadg-title_screen_restart | 0 | 3581026576 | 24 | 8 | 10 | 90c5377a21b8 | 811ba9f7a60c | title_screen_restart | 7 | 6 | PASS |
| 79 | g1-mwcx9xsv-28-1mbk9sx-failure_restart | 3 | 226225170 | 48 | 16 | 17 | 065eb8259f83 | 25d5c950c190 | failure_restart | 0 | 2 | PASS |
| 80 | g1-mwcx9xsz-29-10affnj-new_game | 2 | 3404585956 | 36 | 12 | 12 | 6cafd59ea2df | 6b10f2e782d4 | new_game | 3 | 2 | PASS |
| 81 | g1-mwcx9xt1-2a-kqbqoi-application_restart | 1 | 43952832 | 30 | 10 | 10 | bbcc186de91f | b6d81ade91cd | application_restart | 1 | 1 | PASS |
| 82 | g1-mwcx9xt2-2b-m79ut6-title_screen_restart | 0 | 1348744816 | 24 | 8 | 10 | 2f84d1c69de9 | 811ba9f7a60c | title_screen_restart | 0 | 1 | PASS |
| 83 | g1-mwcx9xt4-2c-1g9wbuy-failure_restart | 3 | 809867150 | 48 | 16 | 17 | a75ac44b98a8 | 25d5c950c190 | failure_restart | 1 | 3 | PASS |
| 84 | g1-mwcx9xt8-2d-1l55759-new_game | 2 | 3263448041 | 36 | 12 | 12 | 5ddfa16f5a9b | 6b10f2e782d4 | new_game | 3 | 2 | PASS |
| 85 | g1-mwcx9xt9-2e-jupry9-application_restart | 1 | 446638418 | 30 | 10 | 10 | 586946008556 | b6d81ade91cd | application_restart | 0 | 1 | PASS |
| 86 | g1-mwcx9xte-2f-u4mi8o-title_screen_restart | 0 | 1082814234 | 24 | 8 | 10 | 6b7ad0e2fd7e | 811ba9f7a60c | title_screen_restart | 5 | 4 | PASS |
| 87 | g1-mwcx9xtk-2g-bn997-failure_restart | 3 | 3528784183 | 48 | 16 | 17 | 349b1193ea7f | 25d5c950c190 | failure_restart | 8 | 6 | PASS |
| 88 | g1-mwcx9xto-2h-1b8d4al-new_game | 2 | 3853895460 | 36 | 12 | 12 | 395e1e921071 | 6b10f2e782d4 | new_game | 1 | 2 | PASS |
| 89 | g1-mwcx9xtp-2i-oqdrfh-application_restart | 1 | 3244197998 | 30 | 10 | 10 | 487012c26127 | b6d81ade91cd | application_restart | 0 | 1 | PASS |
| 90 | g1-mwcx9xts-2j-1f48s05-title_screen_restart | 0 | 2841273472 | 24 | 8 | 10 | 31ba5284b928 | 811ba9f7a60c | title_screen_restart | 3 | 3 | PASS |
| 91 | g1-mwcx9xtv-2k-15phwef-failure_restart | 3 | 285455359 | 48 | 16 | 17 | 62a4259b3935 | 25d5c950c190 | failure_restart | 1 | 2 | PASS |
| 92 | g1-mwcx9xtw-2l-1hko5xl-new_game | 2 | 3676313913 | 36 | 12 | 12 | 566831dd1ca3 | 6b10f2e782d4 | new_game | 0 | 0 | PASS |
| 93 | g1-mwcx9xu4-2m-1xkpn4n-application_restart | 1 | 29607285 | 30 | 10 | 10 | 048f3a7873ec | b6d81ade91cd | application_restart | 8 | 8 | PASS |
| 94 | g1-mwcx9xu9-2n-46i0vu-title_screen_restart | 0 | 2531578653 | 24 | 8 | 10 | 5b3f16191fdb | 811ba9f7a60c | title_screen_restart | 5 | 4 | PASS |
| 95 | g1-mwcx9xud-2o-12t9iu0-failure_restart | 3 | 3893242252 | 48 | 16 | 17 | f92638990c8f | 25d5c950c190 | failure_restart | 3 | 3 | PASS |
| 96 | g1-mwcx9xue-2p-fb8q96-new_game | 2 | 4225071611 | 36 | 12 | 12 | 7063d991aafc | 6b10f2e782d4 | new_game | 1 | 2 | PASS |
| 97 | g1-mwcx9xuj-2q-21agez-application_restart | 1 | 612093728 | 30 | 10 | 10 | 6a587c9e85fa | b6d81ade91cd | application_restart | 5 | 4 | PASS |
| 98 | g1-mwcx9xum-2r-1lhlof0-title_screen_restart | 0 | 3902205143 | 24 | 8 | 10 | a8f35eb515e7 | 811ba9f7a60c | title_screen_restart | 1 | 2 | PASS |
| 99 | g1-mwcx9xuq-2s-1kfdmc9-failure_restart | 3 | 24277307 | 48 | 16 | 17 | 8665b902876e | 25d5c950c190 | failure_restart | 4 | 3 | PASS |
| 100 | g1-mwcx9xus-2t-12c780-new_game | 2 | 4059553976 | 36 | 12 | 12 | 3c0d30ed6d3d | 6b10f2e782d4 | new_game | 1 | 1 | PASS |

</details>

## 第 2 关 · 100 局

| 项 | 值 |
|---|---|
| 耗时 | 6134 ms |
| 牌数范围 | 192 – 321 |
| 开局可点牌范围 | 20 – 23 |
| 档位分布 | {"0":9,"1":11,"2":9,"3":8,"4":8,"5":9,"6":8,"7":8,"8":14,"9":16} |
| 牌数分布 | {"192":14,"255":16,"261":8,"273":8,"282":11,"291":9,"300":9,"312":16,"321":9} |
| 牌型数分布 | {"13":36,"14":17,"15":39,"16":8} |
| 生成原因分布 | {"application_restart":25,"title_screen_restart":25,"failure_restart":25,"new_game":25} |
| 布局签名去重 | 83 / 100 |
| 最近三局牌数重复 | 0 |
| 最近三局布局签名重复 | 0 |
| 最近三局几何签名重复 | 0 |
| 重试次数 | 33 |
| 生成失败次数 | 0 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 46.89 ms |

<details><summary>完整 100 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g2-mwcx9xvu-2u-1en1sil-application_restart | 1 | 3190646206 | 282 | 13 | 21 | d415c4b2cabc | 00d1cc888b67 | application_restart | 0 | 37 | PASS |
| 2 | g2-mwcx9xxo-2v-1nzojbc-title_screen_restart | 3 | 2474595036 | 312 | 16 | 23 | f4df7ac0ae56 | 9ad5dc496be7 | title_screen_restart | 0 | 47 | PASS |
| 3 | g2-mwcx9xyz-2w-d4mhhg-failure_restart | 6 | 1703041211 | 261 | 13 | 20 | b2f160cd1f0a | 2901e45d3bcc | failure_restart | 0 | 33 | PASS |
| 4 | g2-mwcx9xzx-2x-104gw0t-new_game | 9 | 544210469 | 255 | 15 | 23 | 5b8415fac435 | 6d3b6d866018 | new_game | 0 | 22 | PASS |
| 5 | g2-mwcx9y0o-2y-1curv08-application_restart | 8 | 2331668526 | 192 | 15 | 22 | 89882470c7fa | 9bf2168a0943 | application_restart | 0 | 16 | PASS |
| 6 | g2-mwcx9y1j-2z-5jyemw-title_screen_restart | 0 | 3724849645 | 321 | 15 | 22 | 16b70b4c8ca8 | b6c7ad370940 | title_screen_restart | 0 | 27 | PASS |
| 7 | g2-mwcx9y2x-30-1fvjq4x-failure_restart | 2 | 297860056 | 300 | 14 | 22 | ccf6efc6ca36 | 6345c2b3f89b | failure_restart | 0 | 33 | PASS |
| 8 | g2-mwcx9y3x-31-cnqufp-new_game | 5 | 927487374 | 291 | 13 | 22 | 1ecd68d0bb87 | dfb0ea947015 | new_game | 0 | 24 | PASS |
| 9 | g2-mwcx9y5s-32-1h3si1c-application_restart | 8 | 2331668526 | 192 | 15 | 22 | 89882470c7fa | 9bf2168a0943 | application_restart | 1 | 57 | PASS |
| 10 | g2-mwcx9y70-33-1c6jmz2-title_screen_restart | 9 | 2480595054 | 255 | 15 | 23 | 154820683bbb | 6d3b6d866018 | title_screen_restart | 0 | 38 | PASS |
| 11 | g2-mwcx9y8c-34-n6zruz-failure_restart | 2 | 924487365 | 300 | 14 | 22 | a39f7db3849d | 6345c2b3f89b | failure_restart | 0 | 38 | PASS |
| 12 | g2-mwcx9y9m-35-13pl33f-new_game | 1 | 1162837754 | 282 | 13 | 21 | a4dca5f76da2 | 00d1cc888b67 | new_game | 0 | 31 | PASS |
| 13 | g2-mwcx9yb2-36-7tm0cd-application_restart | 3 | 777560843 | 312 | 16 | 23 | 9e5836cb90c5 | 9ad5dc496be7 | application_restart | 0 | 37 | PASS |
| 14 | g2-mwcx9yc6-37-1wa0zhz-title_screen_restart | 0 | 3041719678 | 321 | 15 | 22 | d9c5e7be129f | b6c7ad370940 | title_screen_restart | 0 | 28 | PASS |
| 15 | g2-mwcx9ye8-38-5zdnrq-failure_restart | 6 | 1463690819 | 261 | 13 | 20 | 56c00d6f8543 | 2901e45d3bcc | failure_restart | 1 | 59 | PASS |
| 16 | g2-mwcx9yf5-39-tc735j-new_game | 9 | 1797465087 | 255 | 15 | 23 | 27ed2cb3fa78 | 6d3b6d866018 | new_game | 0 | 23 | PASS |
| 17 | g2-mwcx9yg2-3a-1arhbpg-application_restart | 5 | 3194646218 | 291 | 13 | 22 | 670807b937a2 | dfb0ea947015 | application_restart | 0 | 25 | PASS |
| 18 | g2-mwcx9ygt-3b-x0hfdo-title_screen_restart | 8 | 2331668526 | 192 | 15 | 22 | 89882470c7fa | 9bf2168a0943 | title_screen_restart | 0 | 16 | PASS |
| 19 | g2-mwcx9yhv-3c-13mfr5h-failure_restart | 1 | 1402188146 | 282 | 13 | 21 | ca5ca1d52d4d | 00d1cc888b67 | failure_restart | 0 | 33 | PASS |
| 20 | g2-mwcx9yjk-3d-17mbbr4-new_game | 2 | 3578923126 | 300 | 14 | 22 | 5a19f12cae6d | 6345c2b3f89b | new_game | 0 | 47 | PASS |
| 21 | g2-mwcx9yl1-3e-wrrywg-application_restart | 5 | 2420092384 | 291 | 13 | 22 | 80d7afb20c00 | dfb0ea947015 | application_restart | 0 | 38 | PASS |
| 22 | g2-mwcx9ymi-3f-7ico9w-title_screen_restart | 4 | 1940391597 | 273 | 13 | 22 | 493f9756c15c | 3dcdaf6d10e8 | title_screen_restart | 0 | 36 | PASS |
| 23 | g2-mwcx9yng-3g-1tmkqk-failure_restart | 9 | 544210469 | 255 | 15 | 23 | 5b8415fac435 | 6d3b6d866018 | failure_restart | 0 | 22 | PASS |
| 24 | g2-mwcx9ypg-3h-hf2ya9-new_game | 3 | 3727849654 | 312 | 16 | 23 | 61f539b00dc3 | 9ad5dc496be7 | new_game | 1 | 61 | PASS |
| 25 | g2-mwcx9ys4-3i-1spi804-application_restart | 5 | 1554114683 | 291 | 13 | 22 | 20ee9dec8a2f | dfb0ea947015 | application_restart | 1 | 78 | PASS |
| 26 | g2-mwcx9ytz-3j-156h65d-title_screen_restart | 4 | 1165837763 | 273 | 13 | 22 | 83baa4cbe9c9 | 3dcdaf6d10e8 | title_screen_restart | 1 | 53 | PASS |
| 27 | g2-mwcx9yuz-3k-1xl792r-failure_restart | 6 | 1407188161 | 261 | 13 | 20 | 7e0cb8f52d0e | 2901e45d3bcc | failure_restart | 0 | 24 | PASS |
| 28 | g2-mwcx9yvs-3l-khytfl-new_game | 9 | 3494499280 | 255 | 15 | 23 | c9d784e9490c | 6d3b6d866018 | new_game | 0 | 20 | PASS |
| 29 | g2-mwcx9yxa-3m-a23e3j-application_restart | 0 | 774560834 | 321 | 15 | 22 | 8c676713ef25 | b6c7ad370940 | application_restart | 0 | 45 | PASS |
| 30 | g2-mwcx9yyd-3n-1d34w9d-title_screen_restart | 4 | 3820273524 | 273 | 13 | 22 | 0a3af0e3bd1d | 3dcdaf6d10e8 | title_screen_restart | 0 | 23 | PASS |
| 31 | g2-mwcx9yzx-3o-cku251-failure_restart | 8 | 3345572752 | 192 | 15 | 22 | 8d7119827537 | 9bf2168a0943 | failure_restart | 1 | 46 | PASS |
| 32 | g2-mwcx9z1p-3p-17pr37u-new_game | 9 | 4212550456 | 255 | 15 | 23 | 4bff9088a8b1 | 6d3b6d866018 | new_game | 1 | 59 | PASS |
| 33 | g2-mwcx9z3m-3q-1ayoqkh-application_restart | 3 | 3340572737 | 312 | 16 | 23 | d927773ca6c5 | 9ad5dc496be7 | application_restart | 1 | 60 | PASS |
| 34 | g2-mwcx9z60-3r-6qfoe9-title_screen_restart | 0 | 2323668502 | 321 | 15 | 22 | 79021a1a11c1 | b6c7ad370940 | title_screen_restart | 1 | 72 | PASS |
| 35 | g2-mwcx9z7a-3s-1m3249-failure_restart | 8 | 1557114692 | 192 | 15 | 22 | 68e46705433f | 9bf2168a0943 | failure_restart | 0 | 28 | PASS |
| 36 | g2-mwcx9z8f-3t-1fer4h-new_game | 5 | 540210457 | 291 | 13 | 22 | d3a18782f8b5 | dfb0ea947015 | new_game | 0 | 35 | PASS |
| 37 | g2-mwcx9za1-3u-v04ozk-application_restart | 9 | 1797465087 | 255 | 15 | 23 | 27ed2cb3fa78 | 6d3b6d866018 | application_restart | 0 | 38 | PASS |
| 38 | g2-mwcx9zcu-3v-1wy3urj-title_screen_restart | 7 | 1556114689 | 312 | 14 | 23 | a7bd97e91b94 | 9ad5dc496be7 | title_screen_restart | 2 | 92 | PASS |
| 39 | g2-mwcx9zet-3w-jkiccj-failure_restart | 0 | 1697041193 | 321 | 15 | 22 | 31d581a43912 | b6c7ad370940 | failure_restart | 0 | 54 | PASS |
| 40 | g2-mwcx9zgb-3x-6fsmcq-new_game | 6 | 1019911244 | 261 | 13 | 20 | 2076cba2366e | 2901e45d3bcc | new_game | 0 | 32 | PASS |
| 41 | g2-mwcx9zhd-3y-1c17vg2-application_restart | 8 | 1944391609 | 192 | 15 | 22 | 0fbe05b3bb64 | 9bf2168a0943 | application_restart | 0 | 22 | PASS |
| 42 | g2-mwcx9zjl-3z-19wjwqn-title_screen_restart | 3 | 686136976 | 312 | 16 | 23 | 78af14690fb2 | 9ad5dc496be7 | title_screen_restart | 1 | 73 | PASS |
| 43 | g2-mwcx9zlb-40-1wz7upo-failure_restart | 2 | 445786581 | 300 | 14 | 22 | f475306dd389 | 6345c2b3f89b | failure_restart | 0 | 45 | PASS |
| 44 | g2-mwcx9zmr-41-zdxdiv-new_game | 9 | 1797465087 | 255 | 15 | 23 | 27ed2cb3fa78 | 6d3b6d866018 | new_game | 0 | 36 | PASS |
| 45 | g2-mwcx9znr-42-1e0k482-application_restart | 8 | 3197646227 | 192 | 15 | 22 | ab92bbbc27c8 | 9bf2168a0943 | application_restart | 0 | 23 | PASS |
| 46 | g2-mwcx9zpj-43-on50k8-title_screen_restart | 0 | 56509658 | 321 | 15 | 22 | f4945439e97d | b6c7ad370940 | title_screen_restart | 1 | 55 | PASS |
| 47 | g2-mwcx9zr1-44-19nimh6-failure_restart | 1 | 1007003 | 282 | 13 | 21 | 674879ee53f1 | 00d1cc888b67 | failure_restart | 0 | 32 | PASS |
| 48 | g2-mwcx9zs8-45-1d31zy7-new_game | 9 | 2093318137 | 255 | 15 | 23 | 51501b259fb5 | 6d3b6d866018 | new_game | 0 | 31 | PASS |
| 49 | g2-mwcx9zt2-46-13o9slc-application_restart | 8 | 3732849669 | 192 | 15 | 22 | 1e16baa9aedc | 9bf2168a0943 | application_restart | 0 | 20 | PASS |
| 50 | g2-mwcx9zux-47-1txsx5r-title_screen_restart | 6 | 2716945437 | 261 | 13 | 20 | e8cb9df222bf | 2901e45d3bcc | title_screen_restart | 1 | 61 | PASS |
| 51 | g2-mwcx9zxo-49-177mflv-failure_restart | 2 | 2029815458 | 300 | 14 | 22 | 10e701317cb1 | 6345c2b3f89b | failure_restart | 0 | 36 | PASS |
| 52 | g2-mwcx9zzp-4a-dsy6kr-new_game | 7 | 4210550450 | 312 | 14 | 23 | fdf5b7da4202 | 9ad5dc496be7 | new_game | 0 | 58 | PASS |
| 53 | g2-mwcxa02i-4b-t60ixl-application_restart | 1 | 3338572731 | 282 | 13 | 21 | 73f728ee4cbb | 00d1cc888b67 | application_restart | 1 | 82 | PASS |
| 54 | g2-mwcxa04l-4c-1yr5iwx-title_screen_restart | 5 | 4208550444 | 291 | 13 | 22 | bd69fb1ce08f | dfb0ea947015 | title_screen_restart | 0 | 56 | PASS |
| 55 | g2-mwcxa05z-4d-zlqs19-failure_restart | 8 | 3106222360 | 192 | 15 | 22 | 3ce06387b3de | 9bf2168a0943 | failure_restart | 0 | 34 | PASS |
| 56 | g2-mwcxa093-4e-5rdon9-new_game | 9 | 544210469 | 255 | 15 | 23 | 5b8415fac435 | 6d3b6d866018 | new_game | 2 | 105 | PASS |
| 57 | g2-mwcxa0bl-4f-1ia0qm4-application_restart | 7 | 1168837772 | 312 | 14 | 23 | 567569d21dbc | 9ad5dc496be7 | application_restart | 1 | 76 | PASS |
| 58 | g2-mwcxa0hw-4g-xb8fke-title_screen_restart | 2 | 3966200043 | 300 | 14 | 22 | 5b6b97680efc | 6345c2b3f89b | title_screen_restart | 4 | 210 | PASS |
| 59 | g2-mwcxa0jr-4h-1iib9lr-failure_restart | 5 | 2659442776 | 291 | 13 | 22 | 16169be4c685 | dfb0ea947015 | failure_restart | 0 | 47 | PASS |
| 60 | g2-mwcxa0lh-4i-1bt769y-new_game | 9 | 1022911253 | 255 | 15 | 23 | 6b8675006de9 | 6d3b6d866018 | new_game | 0 | 40 | PASS |
| 61 | g2-mwcxa0n1-4j-skjkt4-application_restart | 1 | 148933528 | 282 | 13 | 21 | 63b84ccd64fc | 00d1cc888b67 | application_restart | 0 | 43 | PASS |
| 62 | g2-mwcxa0q3-4k-1ed71u9-title_screen_restart | 2 | 3578923126 | 300 | 14 | 22 | 5a19f12cae6d | 6345c2b3f89b | title_screen_restart | 1 | 90 | PASS |
| 63 | g2-mwcxa0rz-4l-1paqnwf-failure_restart | 7 | 2478595048 | 312 | 14 | 23 | b56098cfd3ae | 9ad5dc496be7 | failure_restart | 0 | 50 | PASS |
| 64 | g2-mwcxa0u0-4m-3lqr6i-new_game | 5 | 2659442776 | 291 | 13 | 22 | 16169be4c685 | dfb0ea947015 | new_game | 0 | 51 | PASS |
| 65 | g2-mwcxa0vd-4n-1g1ubki-application_restart | 4 | 1165837763 | 273 | 13 | 22 | 83baa4cbe9c9 | 3dcdaf6d10e8 | application_restart | 0 | 34 | PASS |
| 66 | g2-mwcxa0yo-4o-a25knn-title_screen_restart | 1 | 1458690804 | 282 | 13 | 21 | 9e08f0b5c17a | 00d1cc888b67 | title_screen_restart | 1 | 101 | PASS |
| 67 | g2-mwcxa10i-4p-1u3ys5u-failure_restart | 3 | 2805369295 | 312 | 16 | 23 | 5918909499e8 | 9ad5dc496be7 | failure_restart | 0 | 47 | PASS |
| 68 | g2-mwcxa12h-4q-awymhv-new_game | 0 | 2027815452 | 321 | 15 | 22 | f9318645b656 | b6c7ad370940 | new_game | 0 | 50 | PASS |
| 69 | g2-mwcxa15m-4r-17g90i-application_restart | 9 | 3973200064 | 255 | 15 | 23 | f7030bd4860f | 6d3b6d866018 | application_restart | 1 | 88 | PASS |
| 70 | g2-mwcxa173-4s-103fjjc-title_screen_restart | 6 | 2477595045 | 261 | 13 | 20 | 00853849d931 | 2901e45d3bcc | title_screen_restart | 0 | 43 | PASS |
| 71 | g2-mwcxa18l-4t-10rxrw7-failure_restart | 7 | 3675347008 | 312 | 14 | 23 | 589ab926fe6d | 9ad5dc496be7 | failure_restart | 0 | 38 | PASS |
| 72 | g2-mwcxa1ab-4u-1y21oqu-new_game | 1 | 1402188146 | 282 | 13 | 21 | ca5ca1d52d4d | 00d1cc888b67 | new_game | 0 | 41 | PASS |
| 73 | g2-mwcxa1bv-4v-rx302o-application_restart | 5 | 1018911241 | 291 | 13 | 22 | 8841802fbeac | dfb0ea947015 | application_restart | 0 | 42 | PASS |
| 74 | g2-mwcxa1d2-4w-1otemsf-title_screen_restart | 8 | 3732849669 | 192 | 15 | 22 | 1e16baa9aedc | 9bf2168a0943 | title_screen_restart | 0 | 23 | PASS |
| 75 | g2-mwcxa1et-4x-upgm1v-failure_restart | 9 | 3733849672 | 255 | 15 | 23 | d5dc73fa0e8b | 6d3b6d866018 | failure_restart | 1 | 58 | PASS |
| 76 | g2-mwcxa1gj-4y-v9fi45-new_game | 7 | 3583923141 | 312 | 14 | 23 | 3da657a73719 | 9ad5dc496be7 | new_game | 0 | 52 | PASS |
| 77 | g2-mwcxa1iu-4z-e9xi5v-application_restart | 1 | 2951295814 | 282 | 13 | 21 | 7b4d4392b4c1 | 00d1cc888b67 | application_restart | 0 | 60 | PASS |
| 78 | g2-mwcxa1km-50-1jf9g9k-title_screen_restart | 4 | 151933537 | 273 | 13 | 22 | a4b6471aa3e9 | 3dcdaf6d10e8 | title_screen_restart | 0 | 47 | PASS |
| 79 | g2-mwcxa1m3-51-xv345u-failure_restart | 9 | 3494499280 | 255 | 15 | 23 | c9d784e9490c | 6d3b6d866018 | failure_restart | 0 | 37 | PASS |
| 80 | g2-mwcxa1nh-52-16liu56-new_game | 0 | 4203550429 | 321 | 15 | 22 | 8f09f34431dd | b6c7ad370940 | new_game | 0 | 34 | PASS |
| 81 | g2-mwcxa1p1-53-1i9f0r4-application_restart | 7 | 1408188164 | 312 | 14 | 23 | 0dd733fa5ca3 | 9ad5dc496be7 | application_restart | 0 | 36 | PASS |
| 82 | g2-mwcxa1sm-54-1eqii44-title_screen_restart | 8 | 8007024 | 192 | 15 | 22 | 6583397c38ff | 9bf2168a0943 | title_screen_restart | 2 | 108 | PASS |
| 83 | g2-mwcxa1u1-55-12jkq0y-failure_restart | 9 | 1318764303 | 255 | 15 | 23 | 23472456cdda | 6d3b6d866018 | failure_restart | 0 | 42 | PASS |
| 84 | g2-mwcxa1v0-56-1rmkn2h-new_game | 6 | 2716945437 | 261 | 13 | 20 | e8cb9df222bf | 2901e45d3bcc | new_game | 0 | 24 | PASS |
| 85 | g2-mwcxa1wq-57-rlhw6n-application_restart | 1 | 2176741980 | 282 | 13 | 21 | 75b0d3e750bb | 00d1cc888b67 | application_restart | 0 | 49 | PASS |
| 86 | g2-mwcxa1xq-58-10jj607-title_screen_restart | 8 | 1944391609 | 192 | 15 | 22 | 0fbe05b3bb64 | 9bf2168a0943 | title_screen_restart | 0 | 21 | PASS |
| 87 | g2-mwcxa1yw-59-1s3b7i2-failure_restart | 2 | 2656442767 | 300 | 14 | 22 | 3aed650aa984 | 6345c2b3f89b | failure_restart | 0 | 35 | PASS |
| 88 | g2-mwcxa20a-5a-fhal8a-new_game | 4 | 3045719690 | 273 | 13 | 22 | 06e93e412d8a | 3dcdaf6d10e8 | new_game | 0 | 31 | PASS |
| 89 | g2-mwcxa21s-5b-cst7ty-application_restart | 3 | 2418092378 | 312 | 16 | 23 | 8ae71fb75135 | 9ad5dc496be7 | application_restart | 0 | 41 | PASS |
| 90 | g2-mwcxa23x-5c-1f0mc78-title_screen_restart | 9 | 2480595054 | 255 | 15 | 23 | 154820683bbb | 6d3b6d866018 | title_screen_restart | 1 | 61 | PASS |
| 91 | g2-mwcxa25u-5d-e8f862-failure_restart | 6 | 2660442779 | 261 | 13 | 20 | 6669117f1299 | 2901e45d3bcc | failure_restart | 1 | 57 | PASS |
| 92 | g2-mwcxa26n-5e-qya8mt-new_game | 8 | 64509682 | 192 | 15 | 22 | 52bc9d2f5090 | 9bf2168a0943 | new_game | 0 | 20 | PASS |
| 93 | g2-mwcxa27o-5f-ze9vz2-application_restart | 1 | 3817273515 | 282 | 13 | 21 | 3a247b80db6e | 00d1cc888b67 | application_restart | 0 | 32 | PASS |
| 94 | g2-mwcxa29d-5g-1fuo4rr-title_screen_restart | 3 | 3101222345 | 312 | 16 | 23 | 724d6d8f34c6 | 9ad5dc496be7 | title_screen_restart | 0 | 47 | PASS |
| 95 | g2-mwcxa2bh-5h-117cf62-failure_restart | 4 | 2714945431 | 273 | 13 | 22 | 99e282513d85 | 3dcdaf6d10e8 | failure_restart | 1 | 61 | PASS |
| 96 | g2-mwcxa2fh-5i-1bbe5sb-new_game | 2 | 3191646209 | 300 | 14 | 22 | e49e2c01c3e8 | 6345c2b3f89b | new_game | 2 | 129 | PASS |
| 97 | g2-mwcxa2gi-5j-1ekbfw-application_restart | 8 | 1317764300 | 192 | 15 | 22 | bc7d6408664c | 9bf2168a0943 | application_restart | 0 | 20 | PASS |
| 98 | g2-mwcxa2hv-5k-14lf6tc-title_screen_restart | 0 | 774560834 | 321 | 15 | 22 | 8c676713ef25 | b6c7ad370940 | title_screen_restart | 0 | 44 | PASS |
| 99 | g2-mwcxa2jk-5l-olvmkk-failure_restart | 7 | 4210550450 | 312 | 14 | 23 | fdf5b7da4202 | 9ad5dc496be7 | failure_restart | 0 | 42 | PASS |
| 100 | g2-mwcxa2ku-5m-d8hife-new_game | 4 | 3968200049 | 273 | 13 | 22 | 3de4361ad8d7 | 3dcdaf6d10e8 | new_game | 0 | 31 | PASS |

</details>

## 失败案例与原因

本次运行 **0** 个生成失败案例；每次重试的原因均记录在 `random-generation-report.json` 的逐局 `retries` 字段。

## 测试性质说明

- 运行时：两关各 100 局真实调用 `createNewGame`，真实生成、真实签名、真实校验。
- 静态审计：三种重新开局入口通过读取 `src/main.js` 源码确认全部走统一入口；未冒充浏览器实测。
- 重启模拟：把存档 JSON 写入磁盘再读回，继续生成并验证差异化。
- 浏览器实际运行 / Windows 安装卸载测试不在本文件覆盖范围，见 `FINAL_ACCEPTANCE.md`。
