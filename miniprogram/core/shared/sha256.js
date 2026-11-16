/**
 * 同步 SHA-256（纯 ES5，零依赖、零 DOM）。
 *
 * 为什么不用 node:crypto / WebCrypto：
 *  · 现代版 HTML、legacy HTML（IE8）、Node 测试必须用**同一份**算法，
 *    否则网页里算出的签名和 200 局测试报告里的签名对不上；
 *  · WebCrypto 的 subtle.digest 是异步 Promise，IE8 没有，legacy 构建也
 *    禁止引入 Promise/regeneratorRuntime；
 *  · 因此用一份可直接被 Babel 降到 ES5 的同步实现。
 *
 * 只用 var / function / for 与位运算，不依赖 Array.prototype.map、
 * Math.imul、TypedArray、Object.keys 等任何需要垫片的 API。
 */
var K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr(x, n) {
  return (x >>> n) | (x << (32 - n));
}

function hex8(n) {
  var s = '';
  var tab = '0123456789abcdef';
  for (var i = 7; i >= 0; i--) s += tab.charAt((n >>> (i * 4)) & 15);
  return s;
}

/** 字符串 → UTF-8 字节数组（ASCII 走快路径） */
function utf8Bytes(str) {
  var out = [];
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if (c < 0x80) {
      out.push(c);
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
      var c2 = str.charCodeAt(i + 1);
      var cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
      out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
      i++;
    } else {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
  }
  return out;
}

/** 返回 64 位小写十六进制摘要 */
export function sha256Hex(str) {
  var bytes = utf8Bytes(String(str));
  var len = bytes.length;
  var padded = len + 1;
  while (padded % 64 !== 56) padded++;
  var total = padded + 8;
  var msg = new Array(total);
  var i;
  for (i = 0; i < total; i++) msg[i] = 0;
  for (i = 0; i < len; i++) msg[i] = bytes[i];
  msg[len] = 0x80;
  var bits = len * 8;
  var hi = Math.floor(bits / 4294967296);
  var lo = bits % 4294967296;
  msg[total - 8] = (hi >>> 24) & 255;
  msg[total - 7] = (hi >>> 16) & 255;
  msg[total - 6] = (hi >>> 8) & 255;
  msg[total - 5] = hi & 255;
  msg[total - 4] = (lo >>> 24) & 255;
  msg[total - 3] = (lo >>> 16) & 255;
  msg[total - 2] = (lo >>> 8) & 255;
  msg[total - 1] = lo & 255;

  var H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  var w = new Array(64);
  for (var off = 0; off < total; off += 64) {
    for (i = 0; i < 16; i++) {
      var j = off + i * 4;
      w[i] = ((msg[j] << 24) | (msg[j + 1] << 16) | (msg[j + 2] << 8) | msg[j + 3]) | 0;
    }
    for (i = 16; i < 64; i++) {
      var x = w[i - 15];
      var y = w[i - 2];
      var s0 = rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
      var s1 = rotr(y, 17) ^ rotr(y, 19) ^ (y >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    var a = H[0], b = H[1], c = H[2], d = H[3];
    var e = H[4], f = H[5], g = H[6], h = H[7];
    for (i = 0; i < 64; i++) {
      var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      var ch = (e & f) ^ ((~e) & g);
      var t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      var maj = (a & b) ^ (a & c) ^ (b & c);
      var t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0;
      d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0;
    H[1] = (H[1] + b) | 0;
    H[2] = (H[2] + c) | 0;
    H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0;
    H[5] = (H[5] + f) | 0;
    H[6] = (H[6] + g) | 0;
    H[7] = (H[7] + h) | 0;
  }
  var out = '';
  for (i = 0; i < 8; i++) out += hex8(H[i]);
  return out;
}
