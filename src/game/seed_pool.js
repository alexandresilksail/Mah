/**
 * 第 2 关验收 seed 池 —— 由 tools/tune_pool.mjs 按档位离线生成，请勿手改。
 *
 * SEED_POOL['L2-<id>'] 与 LEVEL2_PROFILES 一一对应；运行时 generateLevel(2, seed, {profile})
 * 只从当前档位的池里抽 seed，绝不跨档位混用。
 * 每档生成耗时与合格种子数见 POOL_META；生成总耗时 116906 ms。
 * 门槛：minPending > 4、SOLVABLE_SHARE 偏差 ≤ 3%、开局可点 19–25、
 * 平均压深 ≥ 0.28·N、最长遮挡链 ≥ N−8、random 0 通关、强策略可解。
 * 缺口档位如实保留实际数量（不放宽门槛、不用不合格种子补数）。
 */
export const SEED_POOL = {
  'L2-0': [7000, 2654442761, 1013911226, 3668346987, 2027815452, 387283917, 3041719678, 1401188143, 2415092369, 774560834, 3428996595, 1788465060, 147933525, 2802369286, 1161837751, 3816273512, 2175741977, 535210442, 3189646203, 1549114668, 4203550429, 2563018894, 922487359, 3576923120, 1936391585, 295860050, 1309764276, 3964200037, 2323668502, 683136967, 3337572728, 1697041193, 56509658, 2710945419, 3724849645, 2084318110, 443786575, 3098222336, 1457690801, 4112126562],
  'L2-1': [1007003, 2655442764, 1014911229, 2028815455, 388283920, 1402188146, 4056623907, 775560837, 3429996598, 1789465063, 148933528, 2803369289, 1162837754, 3817273515, 2176741980, 536210445, 3190646206, 4204550432, 2564018897, 3577923123, 296860053, 2951295814, 1310764279, 3965200040, 2324668505, 684136970, 3338572731, 1698041196, 57509661, 2711945422, 1071413887, 3725849648, 2085318113, 444786578, 3099222339, 1458690804, 4113126565, 2472595030, 832063495, 3486499256],
  'L2-2': [2007006, 2656442767, 1015911232, 3670346993, 2029815458, 389283923, 3043719684, 4057623910, 2417092375, 776560840, 3430996601, 1790465066, 149933531, 2804369292, 1163837757, 2177741983, 537210448, 3191646209, 1551114674, 4205550435, 2565018900, 924487365, 3578923126, 1938391591, 297860056, 1311764282, 3966200043, 2325668508, 685136973, 3339572734, 58509664, 2712945425, 1072413890, 2086318116, 445786581, 1459690807, 4114126568, 2473595033, 833063498, 3487499259],
  'L2-3': [3007009, 2657442770, 1016911235, 3671346996, 2030815461, 390283926, 3044719687, 1404188152, 4058623913, 2418092378, 777560843, 3431996604, 1791465069, 150933534, 2805369295, 1164837760, 3819273521, 3192646212, 1552114677, 4206550438, 2566018903, 925487368, 3579923129, 1939391594, 298860059, 2953295820, 1312764285, 2326668511, 686136976, 3340572737, 59509667, 2713945428, 1073413893, 3727849654, 2087318119, 446786584, 3101222345, 1460690810, 4115126571, 2474595036],
  'L2-4': [4007012, 1017911238, 2031815464, 391283929, 3045719690, 1405188155, 2419092381, 778560846, 3432996607, 1792465072, 151933537, 1165837763, 3820273524, 539210454, 3193646215, 1553114680, 4207550441, 2567018906, 926487371, 3580923132, 1940391597, 299860062, 1313764288, 3968200049, 2327668514, 687136979, 3341572740, 1701041205, 60509670, 2714945431, 1074413896, 3728849657, 2088318122, 447786587, 3102222348, 1461690813, 2475595039, 835063504, 3489499265, 1848967730],
  'L2-5': [5007015, 2659442776, 1018911241, 3673347002, 2032815467, 392283932, 3046719693, 1406188158, 4060623919, 2420092384, 779560849, 3433996610, 1793465075, 152933540, 2807369301, 1166837766, 3821273527, 2180741992, 540210457, 3194646218, 1554114683, 4208550444, 2568018909, 927487374, 3581923135, 1941391600, 2955295826, 1314764291, 3969200052, 2328668517, 688136982, 1702041208, 61509673, 2715945434, 1075413899, 3729849660, 2089318125, 448786590, 4117126577, 2476595042],
  'L2-6': [6007018, 2660442779, 1019911244, 3674347005, 2033815470, 3047719696, 1407188161, 4061623922, 2421092387, 780560852, 3434996613, 1794465078, 153933543, 2808369304, 3822273530, 2181741995, 3195646221, 4209550447, 928487377, 3582923138, 1942391603, 301860068, 2956295829, 1315764294, 3970200055, 3343572746, 1703041211, 62509676, 2716945437, 1076413902, 3730849663, 2090318128, 3104222354, 1463690819, 4118126580, 2477595045, 837063510, 3491499271, 210436201, 1224340427],
  'L2-7': [7007021, 2661442782, 1020911247, 3675347008, 2034815473, 394283938, 1408188164, 4062623925, 781560855, 3435996616, 1795465081, 154933546, 2809369307, 1168837772, 3823273533, 2182741998, 542210463, 3196646224, 1556114689, 4210550450, 2570018915, 929487380, 3583923141, 1943391606, 302860071, 2957295832, 1316764297, 3971200058, 2330668523, 3344572749, 1704041214, 63509679, 2717945440, 1077413905, 3731849666, 2091318131, 3105222357, 1464690822, 2478595048, 838063513],
  'L2-8': [8007024, 2662442785, 1021911250, 3676347011, 395283941, 3049719702, 1409188167, 4063623928, 2423092393, 782560858, 3436996619, 1796465084, 155933549, 2810369310, 1169837775, 3824273536, 2183742001, 543210466, 3197646227, 1557114692, 4211550453, 2571018918, 930487383, 3584923144, 1944391609, 303860074, 2958295835, 1317764300, 3972200061, 2331668526, 691136991, 3345572752, 1705041217, 64509682, 1078413908, 3732849669, 2092318134, 451786599, 3106222360, 4120126586],
  'L2-9': [9007027, 2663442788, 1022911253, 3677347014, 2036815479, 396283944, 3050719705, 1410188170, 4064623931, 783560861, 1797465087, 156933552, 2811369313, 1170837778, 2184742004, 544210469, 1558114695, 4212550456, 2572018921, 931487386, 3585923147, 1945391612, 304860077, 2959295838, 1318764303, 3973200064, 2332668529, 692136994, 3346572755, 1706041220, 65509685, 2719945446, 1079413911, 3733849672, 2093318137, 452786602, 3107222363, 4121126589, 2480595054, 3494499280],
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
  "candidatesPerProfile": 200,
  "targetPerProfile": 40,
  "totalShort": 0,
  "generateMs": 116906,
  "profiles": {
    "L2-0": {
      "profileId": 0,
      "layers": 28,
      "types": 15,
      "cards": 321,
      "candidates": 200,
      "gatePass": 174,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "minPendingMin": 5,
      "badPendingSeeds": 0,
      "solvableShare": 1,
      "solvableDeviation": 0,
      "solvableOk": true,
      "visibleRange": [
        22,
        22
      ],
      "chainMin": 31,
      "avgPressDepthMin": 21.01,
      "reject": {
        "generate": 0,
        "cert": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 0,
        "chain": 0,
        "random": 0,
        "strong": 2,
        "pending": 24
      },
      "ms": 14836
    },
    "L2-1": {
      "profileId": 1,
      "layers": 24,
      "types": 13,
      "cards": 282,
      "candidates": 200,
      "gatePass": 167,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "minPendingMin": 5,
      "badPendingSeeds": 0,
      "solvableShare": 1,
      "solvableDeviation": 0,
      "solvableOk": true,
      "visibleRange": [
        21,
        21
      ],
      "chainMin": 27,
      "avgPressDepthMin": 18.06,
      "reject": {
        "generate": 0,
        "cert": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 0,
        "chain": 0,
        "random": 0,
        "strong": 1,
        "pending": 32
      },
      "ms": 10645
    },
    "L2-2": {
      "profileId": 2,
      "layers": 26,
      "types": 14,
      "cards": 300,
      "candidates": 200,
      "gatePass": 163,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "minPendingMin": 5,
      "badPendingSeeds": 0,
      "solvableShare": 1,
      "solvableDeviation": 0,
      "solvableOk": true,
      "visibleRange": [
        22,
        22
      ],
      "chainMin": 29,
      "avgPressDepthMin": 19.32,
      "reject": {
        "generate": 0,
        "cert": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 0,
        "chain": 0,
        "random": 0,
        "strong": 4,
        "pending": 33
      },
      "ms": 13004
    },
    "L2-3": {
      "profileId": 3,
      "layers": 27,
      "types": 16,
      "cards": 312,
      "candidates": 200,
      "gatePass": 171,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "minPendingMin": 5,
      "badPendingSeeds": 0,
      "solvableShare": 1,
      "solvableDeviation": 0,
      "solvableOk": true,
      "visibleRange": [
        23,
        23
      ],
      "chainMin": 31,
      "avgPressDepthMin": 20.04,
      "reject": {
        "generate": 0,
        "cert": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 0,
        "chain": 0,
        "random": 0,
        "strong": 1,
        "pending": 28
      },
      "ms": 13879
    },
    "L2-4": {
      "profileId": 4,
      "layers": 23,
      "types": 13,
      "cards": 273,
      "candidates": 200,
      "gatePass": 172,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "minPendingMin": 5,
      "badPendingSeeds": 0,
      "solvableShare": 1,
      "solvableDeviation": 0,
      "solvableOk": true,
      "visibleRange": [
        22,
        22
      ],
      "chainMin": 27,
      "avgPressDepthMin": 17.03,
      "reject": {
        "generate": 0,
        "cert": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 0,
        "chain": 0,
        "random": 0,
        "strong": 0,
        "pending": 28
      },
      "ms": 12110
    },
    "L2-5": {
      "profileId": 5,
      "layers": 25,
      "types": 13,
      "cards": 291,
      "candidates": 200,
      "gatePass": 171,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "minPendingMin": 5,
      "badPendingSeeds": 0,
      "solvableShare": 1,
      "solvableDeviation": 0,
      "solvableOk": true,
      "visibleRange": [
        22,
        22
      ],
      "chainMin": 29,
      "avgPressDepthMin": 18.69,
      "reject": {
        "generate": 0,
        "cert": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 0,
        "chain": 0,
        "random": 0,
        "strong": 1,
        "pending": 28
      },
      "ms": 13697
    },
    "L2-6": {
      "profileId": 6,
      "layers": 22,
      "types": 13,
      "cards": 261,
      "candidates": 200,
      "gatePass": 151,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "minPendingMin": 5,
      "badPendingSeeds": 0,
      "solvableShare": 1,
      "solvableDeviation": 0,
      "solvableOk": true,
      "visibleRange": [
        20,
        20
      ],
      "chainMin": 25,
      "avgPressDepthMin": 16.39,
      "reject": {
        "generate": 0,
        "cert": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 0,
        "chain": 0,
        "random": 0,
        "strong": 5,
        "pending": 44
      },
      "ms": 9824
    },
    "L2-7": {
      "profileId": 7,
      "layers": 27,
      "types": 14,
      "cards": 312,
      "candidates": 200,
      "gatePass": 180,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "minPendingMin": 5,
      "badPendingSeeds": 0,
      "solvableShare": 1,
      "solvableDeviation": 0,
      "solvableOk": true,
      "visibleRange": [
        23,
        23
      ],
      "chainMin": 31,
      "avgPressDepthMin": 20.04,
      "reject": {
        "generate": 0,
        "cert": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 0,
        "chain": 0,
        "random": 0,
        "strong": 0,
        "pending": 20
      },
      "ms": 12777
    },
    "L2-8": {
      "profileId": 8,
      "layers": 15,
      "types": 15,
      "cards": 192,
      "candidates": 200,
      "gatePass": 169,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "minPendingMin": 5,
      "badPendingSeeds": 0,
      "solvableShare": 1,
      "solvableDeviation": 0,
      "solvableOk": true,
      "visibleRange": [
        22,
        22
      ],
      "chainMin": 19,
      "avgPressDepthMin": 11.01,
      "reject": {
        "generate": 0,
        "cert": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 0,
        "chain": 0,
        "random": 0,
        "strong": 4,
        "pending": 27
      },
      "ms": 6397
    },
    "L2-9": {
      "profileId": 9,
      "layers": 20,
      "types": 15,
      "cards": 255,
      "candidates": 200,
      "gatePass": 173,
      "accepted": 40,
      "target": 40,
      "short": 0,
      "minPendingMin": 5,
      "badPendingSeeds": 0,
      "solvableShare": 1,
      "solvableDeviation": 0,
      "solvableOk": true,
      "visibleRange": [
        23,
        23
      ],
      "chainMin": 23,
      "avgPressDepthMin": 15.15,
      "reject": {
        "generate": 0,
        "cert": 0,
        "geometry": 0,
        "visible": 0,
        "pressure": 0,
        "chain": 0,
        "random": 0,
        "strong": 2,
        "pending": 25
      },
      "ms": 9735
    }
  }
};
