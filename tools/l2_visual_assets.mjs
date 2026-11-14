/**
 * Stage 2 视觉审计配套产物：把 l2-thumbnails.json 里 20 套模板的规范掩膜
 * 逐套落成独立缩略图 PNG 与规范布局数据 JSON，便于与真实游戏截图一一对照。
 *
 *   node tools/l2_visual_assets.mjs
 *
 * 只读：不改任何源码 / 模板 / 生成算法。缩略图仅由 mask 字符串绘制，
 * 绝不作为「游戏截图」使用（游戏截图全部来自 dist/index.html 的真实 Canvas）。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const reports = join(root, 'reports');
const diffDir = join(reports, 'l2-visual-diff');
if (!existsSync(diffDir)) mkdirSync(diffDir, { recursive: true });

// ---- 极简 PNG 编码器（RGBA8，无外部依赖） ----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const W = 360, H = 640;
const thumbData = JSON.parse(readFileSync(join(reports, 'l2-thumbnails.json'), 'utf8'));
const comparison = JSON.parse(readFileSync(join(reports, 'l2-visual-comparison.json'), 'utf8'));
const byId = Object.fromEntries(comparison.templates.map((t) => [t.templateId, t]));

function rect(px, x0, y0, w, h, r, g, b) {
  for (let y = Math.max(0, y0 | 0); y < Math.min(H, (y0 + h) | 0); y++) {
    for (let x = Math.max(0, x0 | 0); x < Math.min(W, (x0 + w) | 0); x++) {
      const i = (y * W + x) * 4;
      px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255;
    }
  }
}

let made = 0;
for (const it of thumbData.templates) {
  const px = Buffer.alloc(W * H * 4);
  // 背景
  for (let i = 0; i < W * H; i++) { px[i * 4] = 251; px[i * 4 + 1] = 246; px[i * 4 + 2] = 236; px[i * 4 + 3] = 255; }
  // 标题条
  rect(px, 0, 0, W, 44, 30, 41, 59);
  // 9x5 掩膜：等比映射到 300x? 区域（不允许非等比拉伸）
  const rows = it.mask.length, cols = it.mask[0].length;
  const CELL = 34;                    // 每格正方形，保持 1:1 比例
  const gw = cols * CELL, gh = rows * CELL;
  const ox = Math.round((W - gw) / 2), oy = Math.round((H - gh) / 2);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const on = it.mask[r][c] === '#';
    const x0 = ox + c * CELL, y0 = oy + r * CELL;
    rect(px, x0, y0, CELL - 2, CELL - 2, on ? 216 : 240, on ? 106 : 231, on ? 42 : 218);
    // 格线（浅）
    rect(px, x0 + CELL - 2, y0, 2, CELL - 2, 255, 255, 255);
    rect(px, x0, y0 + CELL - 2, CELL - 2, 2, 255, 255, 255);
  }
  const png = encodePNG(W, H, px);
  writeFileSync(join(diffDir, `${it.templateId}_thumb.png`), png);

  // 逐套规范布局数据（模板规格 + 本次实拍测得的关键量）
  const t = byId[it.templateId];
  const p = t && t.profiles[4];
  const spec = {
    templateId: it.templateId,
    name: it.name,
    category: it.category,
    feature: it.feature,
    thumbnailProfileId: thumbData.profileId,
    mask: it.mask,
    maskCellCount: it.maskCellCount,
    box: it.box,
    thumbnailSeed: it.seed,
    thumbnailImage: `l2-visual-diff/${it.templateId}_thumb.png`,
    specOutlineImage: `l2-visual-screenshots/${it.templateId}_spec.png`,
    realGameScreenshots: [0, 4, 9].map((q) => `l2-visual-screenshots/${it.templateId}_p${q}.png`),
    diffImage: `l2-visual-diff/${it.templateId}_diff.png`,
    metricsFile: `l2-visual-diff/${it.templateId}_metrics.json`,
    measured: p ? {
      auditSeed: p.seed, auditProfileId: p.profileId,
      specFillRot: p.specFillRot,
      specLayoutSignature: p.specLayoutSignature,
      renderSignature: p.renderSignature,
      totalTiles: p.totalTiles,
      mainStackCount: p.mainStackCount,
      mainStackDetected: p.mainStackDetected,
      layerCount: p.layers.length,
      iou: p.iou, coverage: p.coverage, leakage: p.leakage,
      offsetDx: p.offsetDx, offsetDy: p.offsetDy,
      diffRatio: t.diffRatio,
      occlusion: p.occlusion,
      verdict: t.verdict,
    } : null,
  };
  writeFileSync(join(diffDir, `${it.templateId}_spec.json`), JSON.stringify(spec, null, 2), 'utf8');
  made++;
}
console.log(`[assets] 已生成 ${made} 套独立缩略图 PNG + 规范布局 JSON（${W}x${H}，与主档截图同 9:16 比例）`);
