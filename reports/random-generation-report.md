# 连续 200 局随机生成压力测试报告

> 本文件由 `node test-random-generation.js` **真实运行**自动生成，不是静态 PASS 模板。

- 运行时间：2026-11-11T14:36:38.726Z
- Git commit：`1f95db08e60c74c21a0aa8dff85877e61e55f9f4`
- 断言：通过 **5053**，失败 **0**
- 总耗时：4719 ms
- 布局签名算法：`MAH-LAYOUT-SIG-v1/SHA-256`（SHA-256，浏览器与 Node 共用同一实现）
- 历史窗口：每关最近 3 局；重试上限 50 次

## 全局

| 项 | 值 |
|---|---|
| 总生成局数 | 200 |
| gameId 唯一数 | 202 / 202 |
| 布局签名总数 / 去重 | 200 / 187 |
| 生成失败次数 | 0 |
| 重试总次数 | 228 |
| 平均单局生成耗时 | 17.15 ms |
| 失败案例 | 0 |

## 第 1 关 · 100 局

| 项 | 值 |
|---|---|
| 耗时 | 227 ms |
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
| 重试次数 | 188 |
| 生成失败次数 | 0 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 1.67 ms |

<details><summary>完整 100 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g1-mwc82jct-1-zdgb0d-application_restart | 3 | 355755863 | 48 | 16 | 17 | 8c39568e94aa | 25d5c950c190 | application_restart | 0 | 3 | PASS |
| 2 | g1-mwc82jcx-2-17z9gfl-title_screen_restart | 1 | 3453083691 | 30 | 10 | 10 | a5d8fe4e42bc | b6d81ade91cd | title_screen_restart | 0 | 2 | PASS |
| 3 | g1-mwc82jd3-3-x5zafm-failure_restart | 2 | 2605598824 | 36 | 12 | 12 | 97d8f6f42c3e | 6b10f2e782d4 | failure_restart | 3 | 5 | PASS |
| 4 | g1-mwc82jd6-4-jxpeu9-new_game | 0 | 2344057560 | 24 | 8 | 10 | 9a2b56db78f4 | 811ba9f7a60c | new_game | 1 | 1 | PASS |
| 5 | g1-mwc82jd8-5-a6xvyf-application_restart | 3 | 888197476 | 48 | 16 | 17 | b3f96d8f6906 | 25d5c950c190 | application_restart | 0 | 1 | PASS |
| 6 | g1-mwc82jdf-6-o2cq4q-title_screen_restart | 1 | 2925445252 | 30 | 10 | 10 | 67ca989ef1f4 | b6d81ade91cd | title_screen_restart | 8 | 5 | PASS |
| 7 | g1-mwc82jdg-7-98k1v0-failure_restart | 2 | 2250329391 | 36 | 12 | 12 | 5589d0803a1a | 6b10f2e782d4 | failure_restart | 0 | 1 | PASS |
| 8 | g1-mwc82jdi-8-28gvw5-new_game | 0 | 1907972787 | 24 | 8 | 10 | 8d865a1239de | 811ba9f7a60c | new_game | 1 | 1 | PASS |
| 9 | g1-mwc82jdk-9-183g65n-application_restart | 3 | 2849983653 | 48 | 16 | 17 | b7d52b4d86b3 | 25d5c950c190 | application_restart | 1 | 2 | PASS |
| 10 | g1-mwc82jdr-a-1z0b8cu-title_screen_restart | 1 | 287025293 | 30 | 10 | 10 | e8b4ba254050 | b6d81ade91cd | title_screen_restart | 8 | 6 | PASS |
| 11 | g1-mwc82jds-b-1arzbts-failure_restart | 2 | 1024005812 | 36 | 12 | 12 | 01ea0aeae4ea | 6b10f2e782d4 | failure_restart | 0 | 0 | PASS |
| 12 | g1-mwc82jdw-c-1dzdblf-new_game | 0 | 752267004 | 24 | 8 | 10 | 2e9146634fbd | 811ba9f7a60c | new_game | 3 | 3 | PASS |
| 13 | g1-mwc82jdy-d-jwn0dy-application_restart | 3 | 2904974701 | 48 | 16 | 17 | e432c42f61b5 | 25d5c950c190 | application_restart | 1 | 2 | PASS |
| 14 | g1-mwc82jdz-e-rjdlw1-title_screen_restart | 1 | 3104567448 | 30 | 10 | 10 | 9e46ee46de0d | b6d81ade91cd | title_screen_restart | 0 | 0 | PASS |
| 15 | g1-mwc82je1-f-1tb377j-failure_restart | 2 | 1728544910 | 36 | 12 | 12 | d4028dce6848 | 6b10f2e782d4 | failure_restart | 0 | 1 | PASS |
| 16 | g1-mwc82je4-g-hro0ny-new_game | 0 | 2539964439 | 24 | 8 | 10 | c62be4ae8918 | 811ba9f7a60c | new_game | 2 | 3 | PASS |
| 17 | g1-mwc82je7-h-1cl4n9t-application_restart | 3 | 1547938363 | 48 | 16 | 17 | 2bff6783ed68 | 25d5c950c190 | application_restart | 2 | 2 | PASS |
| 18 | g1-mwc82jea-i-15si51g-title_screen_restart | 1 | 3425796310 | 30 | 10 | 10 | 97487b294c55 | b6d81ade91cd | title_screen_restart | 2 | 2 | PASS |
| 19 | g1-mwc82jec-j-gg8bhi-failure_restart | 2 | 1691215250 | 36 | 12 | 12 | c5965342269d | 6b10f2e782d4 | failure_restart | 1 | 2 | PASS |
| 20 | g1-mwc82jed-k-wxz6zw-new_game | 0 | 262022267 | 24 | 8 | 10 | 32dc240fdc2a | 811ba9f7a60c | new_game | 0 | 0 | PASS |
| 21 | g1-mwc82jef-l-ty02q1-application_restart | 3 | 2306825772 | 48 | 16 | 17 | 0586e76c7d92 | 25d5c950c190 | application_restart | 0 | 1 | PASS |
| 22 | g1-mwc82jej-m-10jf58f-title_screen_restart | 1 | 2543365954 | 30 | 10 | 10 | 5341c3f25891 | b6d81ade91cd | title_screen_restart | 0 | 2 | PASS |
| 23 | g1-mwc82jen-n-o1qj0f-failure_restart | 2 | 3633106643 | 36 | 12 | 12 | e8062c8b9c2c | 6b10f2e782d4 | failure_restart | 2 | 3 | PASS |
| 24 | g1-mwc82jep-o-716dlq-new_game | 0 | 1568830856 | 24 | 8 | 10 | 46447e407e88 | 811ba9f7a60c | new_game | 1 | 1 | PASS |
| 25 | g1-mwc82jes-p-17rijcw-application_restart | 3 | 2143149249 | 48 | 16 | 17 | 9d71fe1922b7 | 25d5c950c190 | application_restart | 2 | 2 | PASS |
| 26 | g1-mwc82jev-q-11xntcq-title_screen_restart | 1 | 2156734364 | 30 | 10 | 10 | a6208a35f0a1 | b6d81ade91cd | title_screen_restart | 3 | 2 | PASS |
| 27 | g1-mwc82jf0-r-yzch09-failure_restart | 2 | 3391857343 | 36 | 12 | 12 | 65dcdb7b9f80 | 6b10f2e782d4 | failure_restart | 3 | 4 | PASS |
| 28 | g1-mwc82jf6-s-wo20j-new_game | 0 | 2620174045 | 24 | 8 | 10 | ee02e89f2b89 | 811ba9f7a60c | new_game | 4 | 4 | PASS |
| 29 | g1-mwc82jf9-t-lui6d5-application_restart | 3 | 956221122 | 48 | 16 | 17 | 705ecfa2db70 | 25d5c950c190 | application_restart | 2 | 2 | PASS |
| 30 | g1-mwc82jfa-u-gsobho-title_screen_restart | 1 | 1668906871 | 30 | 10 | 10 | 13960ce65e8b | b6d81ade91cd | title_screen_restart | 1 | 1 | PASS |
| 31 | g1-mwc82jfc-v-10qak6k-failure_restart | 2 | 2306492502 | 36 | 12 | 12 | 2385dafb1fa7 | 6b10f2e782d4 | failure_restart | 0 | 1 | PASS |
| 32 | g1-mwc82jfd-w-dvlfg4-new_game | 0 | 3809887976 | 24 | 8 | 10 | 10220cd48aee | 811ba9f7a60c | new_game | 0 | 1 | PASS |
| 33 | g1-mwc82jfh-x-1e87otm-application_restart | 3 | 164184729 | 48 | 16 | 17 | e158a1cbcac6 | 25d5c950c190 | application_restart | 5 | 4 | PASS |
| 34 | g1-mwc82jfj-y-1syzk4w-title_screen_restart | 1 | 294376570 | 30 | 10 | 10 | c733a6e95547 | b6d81ade91cd | title_screen_restart | 1 | 1 | PASS |
| 35 | g1-mwc82jfk-z-pes25z-failure_restart | 2 | 3760420717 | 36 | 12 | 12 | 9c467942540a | 6b10f2e782d4 | failure_restart | 0 | 0 | PASS |
| 36 | g1-mwc82jfn-10-1kptkoh-new_game | 0 | 1269480929 | 24 | 8 | 10 | b3002aa39fa6 | 811ba9f7a60c | new_game | 2 | 2 | PASS |
| 37 | g1-mwc82jfo-11-1b3nrwq-application_restart | 3 | 2670052843 | 48 | 16 | 17 | 685764c30749 | 25d5c950c190 | application_restart | 1 | 1 | PASS |
| 38 | g1-mwc82jfq-12-1iqoal7-title_screen_restart | 1 | 1092246976 | 30 | 10 | 10 | 6e4e2823e788 | b6d81ade91cd | title_screen_restart | 1 | 1 | PASS |
| 39 | g1-mwc82jfr-13-uruzu6-failure_restart | 2 | 3755591216 | 36 | 12 | 12 | 51ae74bb11d9 | 6b10f2e782d4 | failure_restart | 1 | 1 | PASS |
| 40 | g1-mwc82jfv-14-1ou8vut-new_game | 0 | 2662509636 | 24 | 8 | 10 | c069d31430bc | 811ba9f7a60c | new_game | 6 | 3 | PASS |
| 41 | g1-mwc82jfx-15-mszq02-application_restart | 3 | 1330582544 | 48 | 16 | 17 | 386487dd452d | 25d5c950c190 | application_restart | 1 | 2 | PASS |
| 42 | g1-mwc82jfz-16-src892-title_screen_restart | 1 | 588700076 | 30 | 10 | 10 | 556011ba16e4 | b6d81ade91cd | title_screen_restart | 0 | 1 | PASS |
| 43 | g1-mwc82jg0-17-26qlnf-failure_restart | 2 | 1248533231 | 36 | 12 | 12 | 50814e8b1e73 | 6b10f2e782d4 | failure_restart | 1 | 1 | PASS |
| 44 | g1-mwc82jg1-18-18yxd18-new_game | 0 | 902579583 | 24 | 8 | 10 | a327c089cd50 | 811ba9f7a60c | new_game | 0 | 1 | PASS |
| 45 | g1-mwc82jg3-19-9d5ztc-application_restart | 3 | 2533631070 | 48 | 16 | 17 | 65629b2b2d29 | 25d5c950c190 | application_restart | 1 | 1 | PASS |
| 46 | g1-mwc82jg4-1a-1ofz7xg-title_screen_restart | 1 | 2315355673 | 30 | 10 | 10 | 00d7a912416b | b6d81ade91cd | title_screen_restart | 0 | 1 | PASS |
| 47 | g1-mwc82jg7-1b-n9uvor-failure_restart | 2 | 1981680460 | 36 | 12 | 12 | dd634887a264 | 6b10f2e782d4 | failure_restart | 4 | 3 | PASS |
| 48 | g1-mwc82jg9-1c-s5ek8g-new_game | 0 | 2214822152 | 24 | 8 | 10 | 599377d2a95a | 811ba9f7a60c | new_game | 2 | 1 | PASS |
| 49 | g1-mwc82jgb-1d-125qpp4-application_restart | 3 | 1777154643 | 48 | 16 | 17 | 69993617042d | 25d5c950c190 | application_restart | 0 | 1 | PASS |
| 50 | g1-mwc82jge-1e-136g4ue-title_screen_restart | 1 | 1727965214 | 30 | 10 | 10 | f257de32f108 | b6d81ade91cd | title_screen_restart | 5 | 3 | PASS |
| 51 | g1-mwc82jgl-1g-1euk8o9-failure_restart | 2 | 2670885406 | 36 | 12 | 12 | 7cedad55a543 | 6b10f2e782d4 | failure_restart | 3 | 2 | PASS |
| 52 | g1-mwc82jgm-1h-j5dl7s-new_game | 0 | 1640890964 | 24 | 8 | 10 | f6534728733d | 811ba9f7a60c | new_game | 0 | 0 | PASS |
| 53 | g1-mwc82jgo-1i-10b0dxo-application_restart | 3 | 1029829403 | 48 | 16 | 17 | f729fd0d7910 | 25d5c950c190 | application_restart | 1 | 1 | PASS |
| 54 | g1-mwc82jgq-1j-1vz3fv9-title_screen_restart | 1 | 1825568379 | 30 | 10 | 10 | 3f5210342ec2 | b6d81ade91cd | title_screen_restart | 1 | 1 | PASS |
| 55 | g1-mwc82jgr-1k-1x3jcqv-failure_restart | 2 | 1225267899 | 36 | 12 | 12 | 1cc6ed0d98e7 | 6b10f2e782d4 | failure_restart | 1 | 1 | PASS |
| 56 | g1-mwc82jgt-1l-y0hmnj-new_game | 0 | 3992958814 | 24 | 8 | 10 | 8b1628b1598c | 811ba9f7a60c | new_game | 1 | 1 | PASS |
| 57 | g1-mwc82jgv-1m-ics222-application_restart | 3 | 3631241082 | 48 | 16 | 17 | 2c2f4f1f2566 | 25d5c950c190 | application_restart | 3 | 2 | PASS |
| 58 | g1-mwc82jgx-1n-11ocmsj-title_screen_restart | 1 | 695390152 | 30 | 10 | 10 | 1ea22f75b690 | b6d81ade91cd | title_screen_restart | 1 | 1 | PASS |
| 59 | g1-mwc82jh3-1o-1qzw4fw-failure_restart | 2 | 870910441 | 36 | 12 | 12 | 299890c04852 | 6b10f2e782d4 | failure_restart | 10 | 5 | PASS |
| 60 | g1-mwc82jh5-1p-1akal29-new_game | 0 | 3972454533 | 24 | 8 | 10 | 824e046076ae | 811ba9f7a60c | new_game | 5 | 2 | PASS |
| 61 | g1-mwc82jh7-1q-15wvgd8-application_restart | 3 | 3441493375 | 48 | 16 | 17 | 8630406774fa | 25d5c950c190 | application_restart | 3 | 1 | PASS |
| 62 | g1-mwc82jha-1r-1gphs77-title_screen_restart | 1 | 194853271 | 30 | 10 | 10 | c15a5aee7977 | b6d81ade91cd | title_screen_restart | 5 | 2 | PASS |
| 63 | g1-mwc82jhe-1s-144odr7-failure_restart | 2 | 3774609347 | 36 | 12 | 12 | a72393e5e83a | 6b10f2e782d4 | failure_restart | 7 | 3 | PASS |
| 64 | g1-mwc82jhf-1t-1vpdhfk-new_game | 0 | 528644777 | 24 | 8 | 10 | bdce266a2064 | 811ba9f7a60c | new_game | 1 | 1 | PASS |
| 65 | g1-mwc82jhg-1u-vgtbed-application_restart | 3 | 1869007810 | 48 | 16 | 17 | c485ea235922 | 25d5c950c190 | application_restart | 0 | 1 | PASS |
| 66 | g1-mwc82jhi-1v-1qjrken-title_screen_restart | 1 | 917789302 | 30 | 10 | 10 | 60490c7d135b | b6d81ade91cd | title_screen_restart | 3 | 1 | PASS |
| 67 | g1-mwc82jhj-1w-1ac4ye0-failure_restart | 2 | 2339072938 | 36 | 12 | 12 | 363914363f7a | 6b10f2e782d4 | failure_restart | 0 | 1 | PASS |
| 68 | g1-mwc82jhk-1x-zrjaug-new_game | 0 | 559916198 | 24 | 8 | 10 | 978e109bd839 | 811ba9f7a60c | new_game | 0 | 1 | PASS |
| 69 | g1-mwc82jhl-1y-ky818r-application_restart | 3 | 1453352349 | 48 | 16 | 17 | a32b8dc267eb | 25d5c950c190 | application_restart | 0 | 1 | PASS |
| 70 | g1-mwc82jhn-1z-1irwq68-title_screen_restart | 1 | 1764803728 | 30 | 10 | 10 | 5b398a7e0549 | b6d81ade91cd | title_screen_restart | 1 | 1 | PASS |
| 71 | g1-mwc82jho-20-1hoob4b-failure_restart | 2 | 3091746311 | 36 | 12 | 12 | 37a555062c86 | 6b10f2e782d4 | failure_restart | 0 | 1 | PASS |
| 72 | g1-mwc82jhp-21-16uomyp-new_game | 0 | 2011508403 | 24 | 8 | 10 | 112a9210256d | 811ba9f7a60c | new_game | 0 | 1 | PASS |
| 73 | g1-mwc82jhu-22-fkxk19-application_restart | 3 | 4116021817 | 48 | 16 | 17 | ee90ae3b297b | 25d5c950c190 | application_restart | 11 | 5 | PASS |
| 74 | g1-mwc82jhv-23-1kvocaz-title_screen_restart | 1 | 88254702 | 30 | 10 | 10 | 9aae4e384309 | b6d81ade91cd | title_screen_restart | 0 | 1 | PASS |
| 75 | g1-mwc82jhw-24-1ewzfiq-failure_restart | 2 | 2146654184 | 36 | 12 | 12 | febff65f13a0 | 6b10f2e782d4 | failure_restart | 0 | 1 | PASS |
| 76 | g1-mwc82jhx-25-yeto4f-new_game | 0 | 103259421 | 24 | 8 | 10 | 180e894a3f8b | 811ba9f7a60c | new_game | 0 | 0 | PASS |
| 77 | g1-mwc82jhy-26-19l4uqt-application_restart | 3 | 49930328 | 48 | 16 | 17 | aa315d46dd21 | 25d5c950c190 | application_restart | 0 | 1 | PASS |
| 78 | g1-mwc82ji0-27-1k08ttf-title_screen_restart | 1 | 653927001 | 30 | 10 | 10 | 304f4a49d558 | b6d81ade91cd | title_screen_restart | 2 | 1 | PASS |
| 79 | g1-mwc82ji2-28-1absbgm-failure_restart | 2 | 3787897571 | 36 | 12 | 12 | d2a0d1293943 | 6b10f2e782d4 | failure_restart | 3 | 2 | PASS |
| 80 | g1-mwc82ji3-29-13fgcei-new_game | 0 | 4074645961 | 24 | 8 | 10 | e1e2811f422a | 811ba9f7a60c | new_game | 0 | 1 | PASS |
| 81 | g1-mwc82ji4-2a-1fezprw-application_restart | 3 | 175675987 | 48 | 16 | 17 | c6f1912ef3c0 | 25d5c950c190 | application_restart | 1 | 1 | PASS |
| 82 | g1-mwc82ji6-2b-180sx69-title_screen_restart | 1 | 1314191861 | 30 | 10 | 10 | 18a7c4f54e11 | b6d81ade91cd | title_screen_restart | 3 | 2 | PASS |
| 83 | g1-mwc82ji9-2c-1ytel8o-failure_restart | 2 | 2569741869 | 36 | 12 | 12 | 495c75d52150 | 6b10f2e782d4 | failure_restart | 5 | 2 | PASS |
| 84 | g1-mwc82jia-2d-1l5gpfp-new_game | 0 | 3085698707 | 24 | 8 | 10 | e1bdb0f0c800 | 811ba9f7a60c | new_game | 1 | 1 | PASS |
| 85 | g1-mwc82jib-2e-1knx0h2-application_restart | 3 | 913515000 | 48 | 16 | 17 | aae0723e82c2 | 25d5c950c190 | application_restart | 0 | 1 | PASS |
| 86 | g1-mwc82jid-2f-qoaeci-title_screen_restart | 1 | 2896851318 | 30 | 10 | 10 | ec194a782bc1 | b6d81ade91cd | title_screen_restart | 3 | 2 | PASS |
| 87 | g1-mwc82jie-2g-s3nr7u-failure_restart | 2 | 2668977697 | 36 | 12 | 12 | 46969a24b130 | 6b10f2e782d4 | failure_restart | 0 | 1 | PASS |
| 88 | g1-mwc82jij-2h-1i92ice-new_game | 0 | 776213888 | 24 | 8 | 10 | cd09872a654e | 811ba9f7a60c | new_game | 11 | 5 | PASS |
| 89 | g1-mwc82jil-2i-4d310r-application_restart | 3 | 1989102062 | 48 | 16 | 17 | 2093f9d5b7bb | 25d5c950c190 | application_restart | 2 | 2 | PASS |
| 90 | g1-mwc82jil-2j-f8u369-title_screen_restart | 1 | 1487346054 | 30 | 10 | 10 | b8c9a4cacc5a | b6d81ade91cd | title_screen_restart | 0 | 0 | PASS |
| 91 | g1-mwc82jim-2k-5xycy3-failure_restart | 2 | 3266600747 | 36 | 12 | 12 | 4602827c1033 | 6b10f2e782d4 | failure_restart | 0 | 0 | PASS |
| 92 | g1-mwc82jin-2l-sb2pua-new_game | 0 | 3041741012 | 24 | 8 | 10 | f59d8aeb229a | 811ba9f7a60c | new_game | 0 | 1 | PASS |
| 93 | g1-mwc82jio-2m-1a1zoyo-application_restart | 3 | 3383507091 | 48 | 16 | 17 | 0d9d55e5fcda | 25d5c950c190 | application_restart | 1 | 1 | PASS |
| 94 | g1-mwc82jir-2n-jwnyoe-title_screen_restart | 1 | 2750894226 | 30 | 10 | 10 | 90db58743685 | b6d81ade91cd | title_screen_restart | 6 | 2 | PASS |
| 95 | g1-mwc82jis-2o-1s6jdum-failure_restart | 2 | 525154512 | 36 | 12 | 12 | 6469cd62db96 | 6b10f2e782d4 | failure_restart | 1 | 1 | PASS |
| 96 | g1-mwc82jit-2p-1f7alf2-new_game | 0 | 3191041854 | 24 | 8 | 10 | b9e60d5d38d4 | 811ba9f7a60c | new_game | 0 | 0 | PASS |
| 97 | g1-mwc82jiv-2q-1nkdwg-application_restart | 3 | 989168935 | 48 | 16 | 17 | e4e1c6d616cc | 25d5c950c190 | application_restart | 2 | 2 | PASS |
| 98 | g1-mwc82jiw-2r-1hc954f-title_screen_restart | 1 | 1994211786 | 30 | 10 | 10 | c763ff2b751f | b6d81ade91cd | title_screen_restart | 0 | 1 | PASS |
| 99 | g1-mwc82jiz-2s-zxkwqr-failure_restart | 2 | 3714071416 | 36 | 12 | 12 | f39d9b41e892 | 6b10f2e782d4 | failure_restart | 5 | 3 | PASS |
| 100 | g1-mwc82jj1-2t-kxoaie-new_game | 0 | 2991680845 | 24 | 8 | 10 | 7c55c3e9f858 | 811ba9f7a60c | new_game | 3 | 2 | PASS |

</details>

## 第 2 关 · 100 局

| 项 | 值 |
|---|---|
| 耗时 | 4193 ms |
| 牌数范围 | 192 – 321 |
| 开局可点牌范围 | 20 – 23 |
| 档位分布 | {"0":11,"1":14,"2":8,"3":6,"4":7,"5":8,"6":7,"7":11,"8":15,"9":13} |
| 牌数分布 | {"192":15,"255":13,"261":7,"273":7,"282":14,"291":8,"300":8,"312":17,"321":11} |
| 牌型数分布 | {"13":36,"14":19,"15":39,"16":6} |
| 生成原因分布 | {"application_restart":25,"title_screen_restart":25,"failure_restart":25,"new_game":25} |
| 布局签名去重 | 87 / 100 |
| 最近三局牌数重复 | 0 |
| 最近三局布局签名重复 | 0 |
| 最近三局几何签名重复 | 0 |
| 重试次数 | 40 |
| 生成失败次数 | 0 |
| 重启模拟历史有效 | true |
| 平均单局耗时 | 32.63 ms |

<details><summary>完整 100 局逐局记录</summary>

| # | gameId | 档位 | seed | 牌数 | 牌型数 | 可点 | 布局签名(前12) | 几何签名(前12) | 原因 | 重试 | 耗时ms | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g2-mwc82jk6-2u-onnmzw-application_restart | 7 | 1168837772 | 312 | 14 | 23 | 567569d21dbc | 9ad5dc496be7 | application_restart | 0 | 41 | PASS |
| 2 | g2-mwc82jla-2v-19p60kq-title_screen_restart | 0 | 3668346987 | 321 | 15 | 22 | 2aa125aeb402 | b6c7ad370940 | title_screen_restart | 0 | 25 | PASS |
| 3 | g2-mwc82jmg-2w-1l9bt17-failure_restart | 1 | 2324668505 | 282 | 13 | 21 | b84b049c06c2 | 00d1cc888b67 | failure_restart | 0 | 28 | PASS |
| 4 | g2-mwc82jn2-2x-1mig9pn-new_game | 8 | 4211550453 | 192 | 15 | 22 | f4e2290e5ec2 | 9bf2168a0943 | new_game | 0 | 12 | PASS |
| 5 | g2-mwc82jnv-2y-426fhp-application_restart | 4 | 299860062 | 273 | 13 | 22 | 50e20b453bd8 | 3dcdaf6d10e8 | application_restart | 0 | 24 | PASS |
| 6 | g2-mwc82jp7-2z-m7b623-title_screen_restart | 7 | 838063513 | 312 | 14 | 23 | 2e4438be495d | 9ad5dc496be7 | title_screen_restart | 0 | 39 | PASS |
| 7 | g2-mwc82jrv-30-1ae70yk-failure_restart | 2 | 445786581 | 300 | 14 | 22 | f475306dd389 | 6345c2b3f89b | failure_restart | 2 | 85 | PASS |
| 8 | g2-mwc82jtk-31-rfcot5-new_game | 5 | 2715945434 | 291 | 13 | 22 | b8c43d6e3c11 | dfb0ea947015 | new_game | 1 | 50 | PASS |
| 9 | g2-mwc82jux-32-ofye3p-application_restart | 8 | 3584923144 | 192 | 15 | 22 | d0e89e8b4085 | 9bf2168a0943 | application_restart | 1 | 39 | PASS |
| 10 | g2-mwc82jvn-33-joshl3-title_screen_restart | 7 | 929487380 | 312 | 14 | 23 | c831f1b97e68 | 9ad5dc496be7 | title_screen_restart | 0 | 22 | PASS |
| 11 | g2-mwc82jwh-34-gwpoyw-failure_restart | 9 | 2959295838 | 255 | 15 | 23 | 658fcd1dbee2 | 6d3b6d866018 | failure_restart | 0 | 21 | PASS |
| 12 | g2-mwc82jyy-35-1unflmm-new_game | 2 | 2325668508 | 300 | 14 | 22 | 78604ee0dd4b | 6345c2b3f89b | new_game | 2 | 84 | PASS |
| 13 | g2-mwc82k08-36-1tap4nv-application_restart | 0 | 2654442761 | 321 | 15 | 22 | 9b1bd319b9ac | b6c7ad370940 | application_restart | 0 | 35 | PASS |
| 14 | g2-mwc82k1z-37-6prglz-title_screen_restart | 1 | 2472595030 | 282 | 13 | 21 | 39f1ce8a8eac | 00d1cc888b67 | title_screen_restart | 1 | 50 | PASS |
| 15 | g2-mwc82k2z-38-5wwji1-failure_restart | 7 | 2091318131 | 312 | 14 | 23 | 8b7a4ecfe1f3 | 9ad5dc496be7 | failure_restart | 0 | 27 | PASS |
| 16 | g2-mwc82k4q-39-2ieof2-new_game | 8 | 1796465084 | 192 | 15 | 22 | 8b9d0adde20d | 9bf2168a0943 | new_game | 1 | 51 | PASS |
| 17 | g2-mwc82k5t-3a-12th4g8-application_restart | 4 | 2031815464 | 273 | 13 | 22 | cff1672177e8 | 3dcdaf6d10e8 | application_restart | 0 | 34 | PASS |
| 18 | g2-mwc82k6r-3b-8jgqqd-title_screen_restart | 1 | 1014911229 | 282 | 13 | 21 | 19f33dfc8c29 | 00d1cc888b67 | title_screen_restart | 0 | 22 | PASS |
| 19 | g2-mwc82k8g-3c-ulpxq8-failure_restart | 0 | 535210442 | 321 | 15 | 22 | 060701f272c0 | b6c7ad370940 | failure_restart | 1 | 49 | PASS |
| 20 | g2-mwc82k98-3d-h5fafl-new_game | 8 | 3436996619 | 192 | 15 | 22 | f6bf93712aee | 9bf2168a0943 | new_game | 0 | 15 | PASS |
| 21 | g2-mwc82ka2-3e-4pzgz3-application_restart | 4 | 2714945431 | 273 | 13 | 22 | 99e282513d85 | 3dcdaf6d10e8 | application_restart | 0 | 25 | PASS |
| 22 | g2-mwc82kba-3f-buy6ta-title_screen_restart | 2 | 685136973 | 300 | 14 | 22 | b170c600cc0b | 6345c2b3f89b | title_screen_restart | 0 | 35 | PASS |
| 23 | g2-mwc82kev-3g-ze2ttn-failure_restart | 1 | 3099222339 | 282 | 13 | 21 | 1b3f445b03a8 | 00d1cc888b67 | failure_restart | 5 | 119 | PASS |
| 24 | g2-mwc82kfi-3h-cx3ofj-new_game | 8 | 3049719702 | 192 | 15 | 22 | 319cee4ac59b | 9bf2168a0943 | new_game | 0 | 13 | PASS |
| 25 | g2-mwc82khg-3i-vd75k7-application_restart | 6 | 1703041211 | 261 | 13 | 20 | b2f160cd1f0a | 2901e45d3bcc | application_restart | 2 | 65 | PASS |
| 26 | g2-mwc82kib-3j-1affhh7-title_screen_restart | 9 | 2093318137 | 255 | 15 | 23 | 51501b259fb5 | 6d3b6d866018 | title_screen_restart | 0 | 24 | PASS |
| 27 | g2-mwc82kj6-3k-1nihe7p-failure_restart | 5 | 152933540 | 291 | 13 | 22 | bde18029638b | dfb0ea947015 | failure_restart | 0 | 22 | PASS |
| 28 | g2-mwc82kjw-3l-rzl0hg-new_game | 8 | 4120126586 | 192 | 15 | 22 | b776db4b171f | 9bf2168a0943 | new_game | 0 | 16 | PASS |
| 29 | g2-mwc82kkg-3m-1yueugy-application_restart | 4 | 2567018906 | 273 | 13 | 22 | 1933208a586b | 3dcdaf6d10e8 | application_restart | 0 | 17 | PASS |
| 30 | g2-mwc82kld-3n-r0cerp-title_screen_restart | 1 | 3338572731 | 282 | 13 | 21 | 73f728ee4cbb | 00d1cc888b67 | title_screen_restart | 0 | 23 | PASS |
| 31 | g2-mwc82kmj-3o-jhouil-failure_restart | 0 | 3098222336 | 321 | 15 | 22 | d6bc8265e4ce | b6c7ad370940 | failure_restart | 0 | 32 | PASS |
| 32 | g2-mwc82knx-3p-1br44li-new_game | 3 | 1791465069 | 312 | 16 | 23 | aad90a305fb0 | 9ad5dc496be7 | new_game | 0 | 36 | PASS |
| 33 | g2-mwc82kor-3q-wyhe92-application_restart | 6 | 780560852 | 261 | 13 | 20 | a9de891a751f | 2901e45d3bcc | application_restart | 0 | 19 | PASS |
| 34 | g2-mwc82kpu-3r-lsrslh-title_screen_restart | 1 | 684136970 | 282 | 13 | 21 | 259e26580c8d | 00d1cc888b67 | title_screen_restart | 0 | 30 | PASS |
| 35 | g2-mwc82kqi-3s-1l175sr-failure_restart | 2 | 4114126568 | 300 | 14 | 22 | 7e3768286dc6 | 6345c2b3f89b | failure_restart | 0 | 16 | PASS |
| 36 | g2-mwc82krg-3t-2ltxud-new_game | 7 | 3823273533 | 312 | 14 | 23 | a96759048964 | 9ad5dc496be7 | new_game | 0 | 23 | PASS |
| 37 | g2-mwc82ksd-3u-1ksc1vt-application_restart | 9 | 1558114695 | 255 | 15 | 23 | d073ff1fe084 | 6d3b6d866018 | application_restart | 0 | 21 | PASS |
| 38 | g2-mwc82ktd-3v-186nq2q-title_screen_restart | 0 | 535210442 | 321 | 15 | 22 | 060701f272c0 | b6c7ad370940 | title_screen_restart | 0 | 29 | PASS |
| 39 | g2-mwc82kuv-3w-l6rf33-failure_restart | 4 | 1313764288 | 273 | 13 | 22 | 7c694d049713 | 3dcdaf6d10e8 | failure_restart | 1 | 43 | PASS |
| 40 | g2-mwc82kvz-3x-1ebv1ur-new_game | 3 | 2474595036 | 312 | 16 | 23 | f4df7ac0ae56 | 9ad5dc496be7 | new_game | 0 | 31 | PASS |
| 41 | g2-mwc82kwo-3y-lo4g7c-application_restart | 8 | 8007024 | 192 | 15 | 22 | 6583397c38ff | 9bf2168a0943 | application_restart | 0 | 13 | PASS |
| 42 | g2-mwc82kx8-3z-oxlb1t-title_screen_restart | 1 | 3190646206 | 282 | 13 | 21 | d415c4b2cabc | 00d1cc888b67 | title_screen_restart | 0 | 16 | PASS |
| 43 | g2-mwc82kxy-40-1c7nvjl-failure_restart | 9 | 2572018921 | 255 | 15 | 23 | 5f0d7e90582d | 6d3b6d866018 | failure_restart | 0 | 18 | PASS |
| 44 | g2-mwc82kyv-41-1my15vt-new_game | 2 | 297860056 | 300 | 14 | 22 | ccf6efc6ca36 | 6345c2b3f89b | new_game | 0 | 26 | PASS |
| 45 | g2-mwc82kzp-42-pg71uq-application_restart | 7 | 3196646224 | 312 | 14 | 23 | 5f1346a96876 | 9ad5dc496be7 | application_restart | 0 | 20 | PASS |
| 46 | g2-mwc82l1t-43-1ev3shk-title_screen_restart | 1 | 536210445 | 282 | 13 | 21 | 715e31c65965 | 00d1cc888b67 | title_screen_restart | 2 | 64 | PASS |
| 47 | g2-mwc82l2m-44-1yxkwb8-failure_restart | 6 | 153933543 | 261 | 13 | 20 | a7492321dde6 | 2901e45d3bcc | failure_restart | 0 | 19 | PASS |
| 48 | g2-mwc82l3j-45-4xidpy-new_game | 0 | 1549114668 | 321 | 15 | 22 | f3bceedc354c | b6c7ad370940 | new_game | 0 | 26 | PASS |
| 49 | g2-mwc82l4d-46-wu7xqn-application_restart | 5 | 2807369301 | 291 | 13 | 22 | a97b0205fc8f | dfb0ea947015 | application_restart | 0 | 18 | PASS |
| 50 | g2-mwc82l5b-47-1rwhtva-title_screen_restart | 1 | 2803369289 | 282 | 13 | 21 | 31861be0f8af | 00d1cc888b67 | title_screen_restart | 0 | 23 | PASS |
| 51 | g2-mwc82l7m-49-bc26ii-failure_restart | 9 | 2811369313 | 255 | 15 | 23 | 4744cdb5d647 | 6d3b6d866018 | failure_restart | 1 | 52 | PASS |
| 52 | g2-mwc82l8k-4a-1f3qtm6-new_game | 4 | 1313764288 | 273 | 13 | 22 | 7c694d049713 | 3dcdaf6d10e8 | new_game | 0 | 27 | PASS |
| 53 | g2-mwc82l9r-4b-1pzqexp-application_restart | 3 | 2030815461 | 312 | 16 | 23 | 1fab7cdf528a | 9ad5dc496be7 | application_restart | 0 | 33 | PASS |
| 54 | g2-mwc82lc3-4c-18mp5m0-title_screen_restart | 5 | 1554114683 | 291 | 13 | 22 | 20ee9dec8a2f | dfb0ea947015 | title_screen_restart | 2 | 73 | PASS |
| 55 | g2-mwc82lcx-4d-q0hyta-failure_restart | 1 | 1162837754 | 282 | 13 | 21 | a4dca5f76da2 | 00d1cc888b67 | failure_restart | 0 | 20 | PASS |
| 56 | g2-mwc82lf8-4e-13fwj2z-new_game | 8 | 451786599 | 192 | 15 | 22 | 7d6c49c0d230 | 9bf2168a0943 | new_game | 2 | 75 | PASS |
| 57 | g2-mwc82lfu-4f-1880qz1-application_restart | 9 | 3050719705 | 255 | 15 | 23 | 6fed017a01fc | 6d3b6d866018 | application_restart | 0 | 17 | PASS |
| 58 | g2-mwc82lhk-4g-15o0ms3-title_screen_restart | 4 | 3820273524 | 273 | 13 | 22 | 0a3af0e3bd1d | 3dcdaf6d10e8 | title_screen_restart | 2 | 55 | PASS |
| 59 | g2-mwc82lib-4h-8ttaud-failure_restart | 7 | 3675347008 | 312 | 14 | 23 | 589ab926fe6d | 9ad5dc496be7 | failure_restart | 0 | 20 | PASS |
| 60 | g2-mwc82lkh-4i-1yb2esa-new_game | 6 | 928487377 | 261 | 13 | 20 | dfa8367f835d | 2901e45d3bcc | new_game | 2 | 68 | PASS |
| 61 | g2-mwc82ll4-4j-1hvy2s1-application_restart | 9 | 3494499280 | 255 | 15 | 23 | c9d784e9490c | 6d3b6d866018 | application_restart | 0 | 15 | PASS |
| 62 | g2-mwc82llx-4k-1r88jgr-title_screen_restart | 1 | 296860053 | 282 | 13 | 21 | 685445dfdc26 | 00d1cc888b67 | title_screen_restart | 0 | 21 | PASS |
| 63 | g2-mwc82lmi-4l-290nai-failure_restart | 8 | 691136991 | 192 | 15 | 22 | 1e39adc5fe9e | 9bf2168a0943 | failure_restart | 0 | 11 | PASS |
| 64 | g2-mwc82lna-4m-xu3bdm-new_game | 7 | 1943391606 | 312 | 14 | 23 | 43043f09622d | 9ad5dc496be7 | new_game | 0 | 24 | PASS |
| 65 | g2-mwc82lof-4n-cl8u2q-application_restart | 5 | 2659442776 | 291 | 13 | 22 | 16169be4c685 | dfb0ea947015 | application_restart | 0 | 30 | PASS |
| 66 | g2-mwc82lpe-4o-1uym8tz-title_screen_restart | 2 | 445786581 | 300 | 14 | 22 | f475306dd389 | 6345c2b3f89b | title_screen_restart | 0 | 26 | PASS |
| 67 | g2-mwc82lqg-4p-a6c2fs-failure_restart | 9 | 4212550456 | 255 | 15 | 23 | 4bff9088a8b1 | 6d3b6d866018 | failure_restart | 0 | 26 | PASS |
| 68 | g2-mwc82lrq-4q-1mwyljk-new_game | 3 | 1552114677 | 312 | 16 | 23 | bf8fd60796f1 | 9ad5dc496be7 | new_game | 0 | 38 | PASS |
| 69 | g2-mwc82lt3-4r-1yjylpe-application_restart | 8 | 1944391609 | 192 | 15 | 22 | 0fbe05b3bb64 | 9bf2168a0943 | application_restart | 1 | 40 | PASS |
| 70 | g2-mwc82lto-4s-p7x0n2-title_screen_restart | 5 | 2476595042 | 291 | 13 | 22 | b1c5787aa3b8 | dfb0ea947015 | title_screen_restart | 0 | 17 | PASS |
| 71 | g2-mwc82lul-4t-bai1es-failure_restart | 0 | 1457690801 | 321 | 15 | 22 | 5ea828a9cfbd | b6c7ad370940 | failure_restart | 0 | 23 | PASS |
| 72 | g2-mwc82lvo-4u-1z2oa-new_game | 9 | 65509685 | 255 | 15 | 23 | 4f20bedaaeb2 | 6d3b6d866018 | new_game | 0 | 26 | PASS |
| 73 | g2-mwc82lwo-4v-mz7j8y-application_restart | 6 | 2477595045 | 261 | 13 | 20 | 00853849d931 | 2901e45d3bcc | application_restart | 0 | 26 | PASS |
| 74 | g2-mwc82lxu-4w-281534-title_screen_restart | 7 | 1943391606 | 312 | 14 | 23 | 43043f09622d | 9ad5dc496be7 | title_screen_restart | 0 | 32 | PASS |
| 75 | g2-mwc82lz1-4x-1wafxmr-failure_restart | 8 | 2423092393 | 192 | 15 | 22 | 1100499931c6 | 9bf2168a0943 | failure_restart | 1 | 31 | PASS |
| 76 | g2-mwc82m26-4y-ooqdak-new_game | 5 | 1406188158 | 291 | 13 | 22 | 7cca00396dd0 | dfb0ea947015 | new_game | 3 | 109 | PASS |
| 77 | g2-mwc82m3e-4z-1oou83l-application_restart | 0 | 3576923120 | 321 | 15 | 22 | cde7ad65402c | b6c7ad370940 | application_restart | 0 | 33 | PASS |
| 78 | g2-mwc82m4d-50-1wo6ixg-title_screen_restart | 1 | 2803369289 | 282 | 13 | 21 | 31861be0f8af | 00d1cc888b67 | title_screen_restart | 0 | 22 | PASS |
| 79 | g2-mwc82m53-51-1360r90-failure_restart | 8 | 3972200061 | 192 | 15 | 22 | 96f34784fb86 | 9bf2168a0943 | failure_restart | 0 | 17 | PASS |
| 80 | g2-mwc82m5n-52-1re1b5k-new_game | 9 | 544210469 | 255 | 15 | 23 | 5b8415fac435 | 6d3b6d866018 | new_game | 0 | 16 | PASS |
| 81 | g2-mwc82m6k-53-ml9my5-application_restart | 0 | 3098222336 | 321 | 15 | 22 | d6bc8265e4ce | b6c7ad370940 | application_restart | 0 | 27 | PASS |
| 82 | g2-mwc82m8e-54-pvq1km-title_screen_restart | 6 | 4209550447 | 261 | 13 | 20 | f7270bb61d86 | 2901e45d3bcc | title_screen_restart | 2 | 55 | PASS |
| 83 | g2-mwc82mao-55-5a0s8r-failure_restart | 7 | 838063513 | 312 | 14 | 23 | 2e4438be495d | 9ad5dc496be7 | failure_restart | 2 | 75 | PASS |
| 84 | g2-mwc82mbg-56-1rzp1d-new_game | 5 | 2420092384 | 291 | 13 | 22 | 80d7afb20c00 | dfb0ea947015 | new_game | 0 | 18 | PASS |
| 85 | g2-mwc82mea-57-ju06iw-application_restart | 8 | 8007024 | 192 | 15 | 22 | 6583397c38ff | 9bf2168a0943 | application_restart | 3 | 92 | PASS |
| 86 | g2-mwc82mf2-58-o7n4q6-title_screen_restart | 1 | 296860053 | 282 | 13 | 21 | 685445dfdc26 | 00d1cc888b67 | title_screen_restart | 0 | 24 | PASS |
| 87 | g2-mwc82mg4-59-3kivu0-failure_restart | 7 | 1795465081 | 312 | 14 | 23 | 52d01b819824 | 9ad5dc496be7 | failure_restart | 0 | 26 | PASS |
| 88 | g2-mwc82mgw-5a-54fenb-new_game | 9 | 2036815479 | 255 | 15 | 23 | e15d2719eb88 | 6d3b6d866018 | new_game | 0 | 18 | PASS |
| 89 | g2-mwc82mhr-5b-lrlmna-application_restart | 2 | 4205550435 | 300 | 14 | 22 | dcb549373d64 | 6345c2b3f89b | application_restart | 0 | 25 | PASS |
| 90 | g2-mwc82miw-5c-1konrnu-title_screen_restart | 0 | 387283917 | 321 | 15 | 22 | f2131edd72fa | b6c7ad370940 | title_screen_restart | 0 | 32 | PASS |
| 91 | g2-mwc82mjz-5d-xp3z9y-failure_restart | 3 | 2030815461 | 312 | 16 | 23 | 1fab7cdf528a | 9ad5dc496be7 | failure_restart | 0 | 28 | PASS |
| 92 | g2-mwc82mkn-5e-k2cphv-new_game | 9 | 1706041220 | 255 | 15 | 23 | 82a4adfac6db | 6d3b6d866018 | new_game | 0 | 14 | PASS |
| 93 | g2-mwc82mlc-5f-1vvjygz-application_restart | 6 | 928487377 | 261 | 13 | 20 | dfa8367f835d | 2901e45d3bcc | application_restart | 0 | 17 | PASS |
| 94 | g2-mwc82mma-5g-lcjk5m-title_screen_restart | 0 | 3041719678 | 321 | 15 | 22 | d9c5e7be129f | b6c7ad370940 | title_screen_restart | 0 | 25 | PASS |
| 95 | g2-mwc82mn3-5h-jozu5y-failure_restart | 8 | 4063623928 | 192 | 15 | 22 | 77d75e5ee112 | 9bf2168a0943 | failure_restart | 0 | 17 | PASS |
| 96 | g2-mwc82mny-5i-1kwf76x-new_game | 2 | 1938391591 | 300 | 14 | 22 | e89db0321606 | 6345c2b3f89b | new_game | 0 | 27 | PASS |
| 97 | g2-mwc82mov-5j-u2lae3-application_restart | 9 | 4212550456 | 255 | 15 | 23 | 4bff9088a8b1 | 6d3b6d866018 | application_restart | 0 | 23 | PASS |
| 98 | g2-mwc82mpv-5k-19zu8xm-title_screen_restart | 3 | 390283926 | 312 | 16 | 23 | e52a25a5e823 | 9ad5dc496be7 | title_screen_restart | 0 | 28 | PASS |
| 99 | g2-mwc82mqt-5l-1fc0cy5-failure_restart | 1 | 536210445 | 282 | 13 | 21 | 715e31c65965 | 00d1cc888b67 | failure_restart | 0 | 24 | PASS |
| 100 | g2-mwc82mrd-5m-10hae28-new_game | 8 | 3676347011 | 192 | 15 | 22 | eb53000e1f93 | 9bf2168a0943 | new_game | 0 | 10 | PASS |

</details>

## 失败案例与原因

本次运行 **0** 个生成失败案例；每次重试的原因均记录在 `random-generation-report.json` 的逐局 `retries` 字段。

## 测试性质说明

- 运行时：两关各 100 局真实调用 `createNewGame`，真实生成、真实签名、真实校验。
- 静态审计：三种重新开局入口通过读取 `src/main.js` 源码确认全部走统一入口；未冒充浏览器实测。
- 重启模拟：把存档 JSON 写入磁盘再读回，继续生成并验证差异化。
- 浏览器实际运行 / Windows 安装卸载测试不在本文件覆盖范围，见 `FINAL_ACCEPTANCE.md`。
