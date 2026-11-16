/**
 * 第 2 关验收 seed 池 —— 由 tools/tune_pool.mjs 按档位离线生成，请勿手改。
 *
 * SEED_POOL['L2-<id>'] 与 LEVEL2_PROFILES 一一对应；运行时 generateLevel(2, seed, {profile})
 * 只从当前档位的池里抽 seed，绝不跨档位混用。
 * 每档生成耗时与合格种子数见 POOL_META；生成总耗时 134327 ms。
 *
 * 第 3.3 节入池条件（几何 × 发牌一起验，因为几何现在由 seed 生成）：
 *   开局可点 19–25、平均压深 ≥ 0.28·N、最长遮挡链 ≥ N−8、
 *   **该种子上 5 种机器人（greedy/noisy/lookahead/montecarlo/search）合计通关数 = 0**。
 * 第二关整池均匀洗牌后不再要求存在完整解（见 generator.js 的说明），
 * 因此入池不再看 verify / certificate。
 * 缺口档位如实保留实际数量（不放宽门槛、不用不合格种子补数）。
 */
export const SEED_POOL = {
  'L2-0': [7000, 2654442761, 1013911226, 3668346987, 2027815452, 387283917, 3041719678, 1401188143, 4055623904, 774560834, 3428996595, 1788465060, 147933525, 2802369286, 2175741977, 535210442, 3189646203, 1549114668, 4203550429, 2563018894, 922487359, 3576923120, 1936391585, 295860050, 2950295811, 1309764276, 3964200037, 2323668502, 683136967, 3337572728, 1697041193, 56509658, 2710945419, 1070413884, 3724849645, 2084318110, 443786575, 3098222336, 1457690801, 4112126562],
  'L2-1': [2655442764, 1014911229, 3669346990, 2028815455, 388283920, 1402188146, 4056623907, 775560837, 3429996598, 1789465063, 148933528, 2803369289, 3817273515, 2176741980, 536210445, 3190646206, 1550114671, 4204550432, 2564018897, 923487362, 3577923123, 1937391588, 296860053, 2951295814, 1310764279, 3965200040, 2324668505, 684136970, 3338572731, 1698041196, 57509661, 2711945422, 1071413887, 3725849648, 2085318113, 444786578, 4113126565, 2472595030, 3486499256, 1845967721],
  'L2-2': [2007006, 2656442767, 3670346993, 2029815458, 3043719684, 1403188149, 4057623910, 2417092375, 776560840, 3430996601, 1790465066, 149933531, 2804369292, 1163837757, 3818273518, 2177741983, 537210448, 3191646209, 1551114674, 4205550435, 2565018900, 924487365, 3578923126, 1938391591, 297860056, 2952295817, 1311764282, 3966200043, 2325668508, 685136973, 3339572734, 2712945425, 1072413890, 3726849651, 2086318116, 445786581, 1459690807, 4114126568, 833063498, 3487499259],
  'L2-3': [3007009, 2657442770, 3671346996, 2030815461, 390283926, 3044719687, 1404188152, 4058623913, 2418092378, 777560843, 3431996604, 150933534, 2805369295, 1164837760, 3819273521, 2178741986, 3192646212, 4206550438, 2566018903, 3579923129, 1939391594, 298860059, 2953295820, 1312764285, 3967200046, 2326668511, 686136976, 3340572737, 1700041202, 59509667, 2713945428, 1073413893, 3727849654, 2087318119, 446786584, 3101222345, 1460690810, 2474595036, 834063501, 1847967727],
  'L2-4': [4007012, 2658442773, 1017911238, 3672346999, 2031815464, 391283929, 3045719690, 1405188155, 4059623916, 2419092381, 778560846, 3432996607, 1792465072, 151933537, 1165837763, 3820273524, 2179741989, 539210454, 3193646215, 1553114680, 4207550441, 2567018906, 926487371, 3580923132, 1940391597, 2954295823, 1313764288, 3968200049, 2327668514, 687136979, 3341572740, 1701041205, 60509670, 2714945431, 1074413896, 3728849657, 447786587, 1461690813, 4116126574, 2475595039],
  'L2-5': [5007015, 2659442776, 3673347002, 2032815467, 392283932, 3046719693, 1406188158, 4060623919, 2420092384, 779560849, 3433996610, 1793465075, 152933540, 2807369301, 1166837766, 3821273527, 2180741992, 540210457, 1554114683, 4208550444, 2568018909, 1941391600, 300860065, 2955295826, 1314764291, 3969200052, 688136982, 3342572743, 1702041208, 2715945434, 1075413899, 3729849660, 2089318125, 448786590, 3103222351, 1462690816, 4117126577, 2476595042, 836063507, 1849967733],
  'L2-6': [2660442779, 1019911244, 3674347005, 2033815470, 393283935, 3047719696, 2421092387, 780560852, 153933543, 1167837769, 3822273530, 2181741995, 3195646221, 1555114686, 4209550447, 2569018912, 928487377, 3582923138, 1942391603, 301860068, 2956295829, 1315764294, 3970200055, 2329668520, 689136985, 3343572746, 62509676, 3730849663, 2090318128, 449786593, 4118126580, 837063510, 210436201, 2864871962, 1224340427, 3878776188, 2238244653, 1611617344, 4266053105, 2625521570],
  'L2-7': [7007021, 1020911247, 3675347008, 2034815473, 394283938, 3048719699, 1408188164, 4062623925, 2422092390, 781560855, 3435996616, 1795465081, 154933546, 2809369307, 3823273533, 2182741998, 542210463, 3196646224, 1556114689, 4210550450, 2570018915, 929487380, 3583923141, 1943391606, 302860071, 2957295832, 1316764297, 3971200058, 2330668523, 3344572749, 63509679, 2717945440, 3731849666, 2091318131, 450786596, 3105222357, 1464690822, 4119126583, 2478595048, 838063513],
  'L2-8': [8007024, 3049719702, 155933549, 543210466, 1557114692, 4211550453, 2958295835, 1317764300, 3345572752, 1705041217, 1078413908, 2092318134, 3106222360, 4120126586, 1226340433, 2240244659, 3254148885, 1761543875, 1134916566, 3789352327, 3162725018, 1522193483, 3550001935, 2923374626, 2296747317, 656215782, 29588473, 1043492699, 2444673842, 2592600367, 3993781510, 3367154201, 2740526892, 1099995357, 3127803809, 4141708035, 1874549191, 621294573, 3275730334, 1008571490],
  'L2-9': [9007027, 2663442788, 1022911253, 3677347014, 2036815479, 396283944, 3050719705, 1410188170, 4064623931, 2424092396, 783560861, 3437996622, 156933552, 2811369313, 1170837778, 2184742004, 544210469, 3198646230, 1558114695, 4212550456, 2572018921, 3585923147, 1945391612, 304860077, 2959295838, 1318764303, 3973200064, 2332668529, 692136994, 3346572755, 1706041220, 65509685, 2719945446, 3733849672, 2093318137, 452786602, 3107222363, 1466690828, 4121126589, 2480595054],
};

/** 只从当前档位的池里抽 seed；profileId 缺失时合并全部 L2 池兜底（兼容旧调用）。 */
export function pickPoolSeed(level, profileId, rand = Math.random) {
  const key = 'L2-' + profileId;
  let list = SEED_POOL[key];
  if (!list || !list.length) {
    list = [];
    for (const k in SEED_POOL) if (Object.prototype.hasOwnProperty.call(SEED_POOL, k)) list = list.concat(SEED_POOL[k]);
  }
  if (!list.length) return 0;
  const i = Math.min(list.length - 1, Math.max(0, Math.floor(rand() * list.length)));
  return list[i];
}

export const POOL_META = {
  "version": "2.0.0",
  "candidatesPerProfile": 400,
  "targetPerProfile": 40,
  "totalShort": 0,
  "generateMs": 134327,
  "gateRobots": [
    "greedy",
    "noisy",
    "lookahead",
    "montecarlo",
    "search"
  ],
  "profiles": {
    "L2-0": {
      "profileId": 0,
      "layers": 28,
      "types": 15,
      "cards": 321,
      "candidates": 400,
      "gatePass": 385,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "visibleRange": [
        22,
        25
      ],
      "chainMin": 27,
      "chainNeed": 20,
      "avgPressDepthMin": 7.95,
      "avgPressDepthNeed": 7.84,
      "robotTotals": {
        "random": 0,
        "greedy": 0,
        "noisy": 0,
        "lookahead": 0,
        "montecarlo": 0,
        "search": 0
      },
      "reject": {
        "generate": 0,
        "validate": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 15,
        "chain": 0,
        "robot": 0
      },
      "ms": 16274
    },
    "L2-1": {
      "profileId": 1,
      "layers": 24,
      "types": 13,
      "cards": 282,
      "candidates": 400,
      "gatePass": 333,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "visibleRange": [
        22,
        25
      ],
      "chainMin": 23,
      "chainNeed": 16,
      "avgPressDepthMin": 6.73,
      "avgPressDepthNeed": 6.72,
      "robotTotals": {
        "random": 0,
        "greedy": 0,
        "noisy": 0,
        "lookahead": 0,
        "montecarlo": 0,
        "search": 0
      },
      "reject": {
        "generate": 0,
        "validate": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 67,
        "chain": 0,
        "robot": 0
      },
      "ms": 14979
    },
    "L2-2": {
      "profileId": 2,
      "layers": 26,
      "types": 14,
      "cards": 300,
      "candidates": 400,
      "gatePass": 370,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "visibleRange": [
        22,
        25
      ],
      "chainMin": 32,
      "chainNeed": 18,
      "avgPressDepthMin": 7.38,
      "avgPressDepthNeed": 7.28,
      "robotTotals": {
        "random": 0,
        "greedy": 0,
        "noisy": 0,
        "lookahead": 0,
        "montecarlo": 0,
        "search": 0
      },
      "reject": {
        "generate": 0,
        "validate": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 30,
        "chain": 0,
        "robot": 0
      },
      "ms": 14370
    },
    "L2-3": {
      "profileId": 3,
      "layers": 27,
      "types": 16,
      "cards": 312,
      "candidates": 400,
      "gatePass": 379,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "visibleRange": [
        22,
        25
      ],
      "chainMin": 26,
      "chainNeed": 19,
      "avgPressDepthMin": 7.56,
      "avgPressDepthNeed": 7.56,
      "robotTotals": {
        "random": 0,
        "greedy": 0,
        "noisy": 0,
        "lookahead": 0,
        "montecarlo": 0,
        "search": 0
      },
      "reject": {
        "generate": 0,
        "validate": 0,
        "geometry": 0,
        "visible": 1,
        "pressure": 20,
        "chain": 0,
        "robot": 0
      },
      "ms": 13506
    },
    "L2-4": {
      "profileId": 4,
      "layers": 23,
      "types": 13,
      "cards": 273,
      "candidates": 400,
      "gatePass": 376,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "visibleRange": [
        22,
        25
      ],
      "chainMin": 22,
      "chainNeed": 15,
      "avgPressDepthMin": 6.48,
      "avgPressDepthNeed": 6.44,
      "robotTotals": {
        "random": 0,
        "greedy": 0,
        "noisy": 0,
        "lookahead": 0,
        "montecarlo": 0,
        "search": 0
      },
      "reject": {
        "generate": 0,
        "validate": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 24,
        "chain": 0,
        "robot": 0
      },
      "ms": 14883
    },
    "L2-5": {
      "profileId": 5,
      "layers": 25,
      "types": 13,
      "cards": 291,
      "candidates": 400,
      "gatePass": 339,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "visibleRange": [
        22,
        25
      ],
      "chainMin": 24,
      "chainNeed": 17,
      "avgPressDepthMin": 7.01,
      "avgPressDepthNeed": 7,
      "robotTotals": {
        "random": 0,
        "greedy": 0,
        "noisy": 0,
        "lookahead": 0,
        "montecarlo": 0,
        "search": 0
      },
      "reject": {
        "generate": 0,
        "validate": 0,
        "geometry": 0,
        "visible": 1,
        "pressure": 60,
        "chain": 0,
        "robot": 0
      },
      "ms": 16658
    },
    "L2-6": {
      "profileId": 6,
      "layers": 22,
      "types": 13,
      "cards": 261,
      "candidates": 400,
      "gatePass": 308,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "visibleRange": [
        21,
        25
      ],
      "chainMin": 21,
      "chainNeed": 14,
      "avgPressDepthMin": 6.16,
      "avgPressDepthNeed": 6.16,
      "robotTotals": {
        "random": 0,
        "greedy": 0,
        "noisy": 0,
        "lookahead": 0,
        "montecarlo": 0,
        "search": 0
      },
      "reject": {
        "generate": 0,
        "validate": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 92,
        "chain": 0,
        "robot": 0
      },
      "ms": 12049
    },
    "L2-7": {
      "profileId": 7,
      "layers": 27,
      "types": 14,
      "cards": 312,
      "candidates": 400,
      "gatePass": 367,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "visibleRange": [
        22,
        25
      ],
      "chainMin": 27,
      "chainNeed": 19,
      "avgPressDepthMin": 7.66,
      "avgPressDepthNeed": 7.56,
      "robotTotals": {
        "random": 0,
        "greedy": 0,
        "noisy": 0,
        "lookahead": 0,
        "montecarlo": 0,
        "search": 0
      },
      "reject": {
        "generate": 0,
        "validate": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 33,
        "chain": 0,
        "robot": 0
      },
      "ms": 16476
    },
    "L2-8": {
      "profileId": 8,
      "layers": 15,
      "types": 15,
      "cards": 192,
      "candidates": 400,
      "gatePass": 124,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "visibleRange": [
        21,
        25
      ],
      "chainMin": 15,
      "chainNeed": 7,
      "avgPressDepthMin": 4.2,
      "avgPressDepthNeed": 4.2,
      "robotTotals": {
        "random": 0,
        "greedy": 0,
        "noisy": 0,
        "lookahead": 0,
        "montecarlo": 0,
        "search": 0
      },
      "reject": {
        "generate": 0,
        "validate": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 276,
        "chain": 0,
        "robot": 0
      },
      "ms": 3402
    },
    "L2-9": {
      "profileId": 9,
      "layers": 20,
      "types": 15,
      "cards": 255,
      "candidates": 400,
      "gatePass": 363,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "visibleRange": [
        22,
        25
      ],
      "chainMin": 18,
      "chainNeed": 12,
      "avgPressDepthMin": 5.61,
      "avgPressDepthNeed": 5.6,
      "robotTotals": {
        "random": 0,
        "greedy": 0,
        "noisy": 0,
        "lookahead": 0,
        "montecarlo": 0,
        "search": 0
      },
      "reject": {
        "generate": 0,
        "validate": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 37,
        "chain": 0,
        "robot": 0
      },
      "ms": 11727
    }
  }
};
