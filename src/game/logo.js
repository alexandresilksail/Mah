/**
 * 原创 Q 版「小福神」形象：圆脸 + 福字帽 + 手握一张麻将牌。
 * 全部用 Canvas 路径现画，不使用任何现成卡通形象 / IP 素材。
 */
import { rr, circle, text } from './draw.js';

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx 中心 x
 * @param {number} cy 中心 y（约等于脸部中心）
 * @param {number} s  缩放（1 ≈ 200px 宽）
 * @param {number} t  时间（秒），用于轻微上下浮动
 */
export function drawMascot(ctx, cx, cy, s = 1, t = 0) {
  const bob = Math.sin(t * 1.6) * 4;
  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.scale(s, s);

  /* ---- 背后的光晕 ---- */
  const halo = ctx.createRadialGradient(0, -30, 20, 0, -30, 180);
  halo.addColorStop(0, 'rgba(255, 214, 128, 0.30)');
  halo.addColorStop(1, 'rgba(255, 214, 128, 0)');
  ctx.fillStyle = halo;
  circle(ctx, 0, -30, 180);
  ctx.fill();

  /* ---- 阴影 ---- */
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(0, 140, 92, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* ---- 身体 / 袍子 ---- */
  const robe = ctx.createLinearGradient(0, 10, 0, 140);
  robe.addColorStop(0, '#C74A38');
  robe.addColorStop(1, '#8C2A21');
  ctx.fillStyle = robe;
  rr(ctx, -78, 6, 156, 126, 50);
  ctx.fill();
  ctx.strokeStyle = 'rgba(233,196,106,0.9)';
  ctx.lineWidth = 4;
  rr(ctx, -70, 16, 140, 108, 42);
  ctx.stroke();

  // 交领（对襟）衣纹
  ctx.strokeStyle = 'rgba(255,235,190,0.8)';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-52, 20);
  ctx.quadraticCurveTo(-24, 44, 2, 72);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(52, 20);
  ctx.quadraticCurveTo(24, 44, 2, 72);
  ctx.stroke();

  /* ---- 左手（画面右侧）握牌 ---- */
  ctx.save();
  ctx.translate(84, 34);
  ctx.rotate(0.22);
  // 牌
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#B79A6D';
  rr(ctx, -22, -30, 44, 60, 7);
  ctx.fill();
  ctx.restore();
  const face = ctx.createLinearGradient(-22, -32, 22, 28);
  face.addColorStop(0, '#FFFCF2');
  face.addColorStop(1, '#E8D8B3');
  ctx.fillStyle = face;
  rr(ctx, -22, -34, 44, 58, 7);
  ctx.fill();
  ctx.strokeStyle = '#C9B189';
  ctx.lineWidth = 1.5;
  rr(ctx, -22, -34, 44, 58, 7);
  ctx.stroke();
  text(ctx, '中', 0, -4, { size: 30, weight: '700', fill: '#B3392E' });
  // 手指
  ctx.fillStyle = '#FFE1BE';
  circle(ctx, -6, 30, 13);
  ctx.fill();
  circle(ctx, 12, 28, 12);
  ctx.fill();
  ctx.restore();

  /* ---- 右手（画面左侧）扶袖 ---- */
  ctx.fillStyle = '#FFE1BE';
  circle(ctx, -84, 46, 21);
  ctx.fill();
  ctx.strokeStyle = '#E8B98C';
  ctx.lineWidth = 2;
  ctx.stroke();

  /* ---- 耳朵 ---- */
  ctx.fillStyle = '#FFE1BE';
  circle(ctx, -74, -44, 13);
  ctx.fill();
  circle(ctx, 74, -44, 13);
  ctx.fill();

  /* ---- 头 ---- */
  const skin = ctx.createRadialGradient(-20, -78, 12, 0, -44, 92);
  skin.addColorStop(0, '#FFF0D8');
  skin.addColorStop(1, '#FFD9B0');
  ctx.fillStyle = skin;
  circle(ctx, 0, -46, 74);
  ctx.fill();
  ctx.strokeStyle = 'rgba(224,168,122,0.85)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  /* ---- 腮红 ---- */
  ctx.fillStyle = 'rgba(255,138,138,0.45)';
  circle(ctx, -46, -24, 12);
  ctx.fill();
  circle(ctx, 46, -24, 12);
  ctx.fill();

  /* ---- 眼睛 ---- */
  ctx.fillStyle = '#3A2A1E';
  circle(ctx, -26, -52, 9);
  ctx.fill();
  circle(ctx, 26, -52, 9);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  circle(ctx, -23, -55, 3.2);
  ctx.fill();
  circle(ctx, 29, -55, 3.2);
  ctx.fill();

  /* ---- 嘴 ---- */
  ctx.strokeStyle = '#8C4A32';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, -30, 15, 0.18 * Math.PI, 0.82 * Math.PI);
  ctx.stroke();

  /* ---- 福字帽 ---- */
  // 帽檐
  const brim = ctx.createLinearGradient(0, -110, 0, -88);
  brim.addColorStop(0, '#F0D07C');
  brim.addColorStop(1, '#B58B3C');
  ctx.fillStyle = brim;
  rr(ctx, -88, -110, 176, 24, 12);
  ctx.fill();
  // 帽身
  const crown = ctx.createLinearGradient(0, -170, 0, -104);
  crown.addColorStop(0, '#C0392B');
  crown.addColorStop(1, '#8C2A21');
  ctx.fillStyle = crown;
  rr(ctx, -64, -166, 128, 62, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(233,196,106,0.8)';
  ctx.lineWidth = 3;
  rr(ctx, -58, -160, 116, 50, 16);
  ctx.stroke();
  // 帽上的「福」
  text(ctx, '福', 0, -132, { size: 40, weight: '700', fill: '#F7E4B0' });
  // 帽顶小球
  ctx.fillStyle = '#E9C46A';
  circle(ctx, 0, -172, 11);
  ctx.fill();

  ctx.restore();
}

/** 游戏名：先描边再填充，形成金色立体字 */
export function drawTitle(ctx, cx, cy, size = 64) {
  const str = 'Mah了个Mah';
  ctx.save();
  ctx.font = `800 ${size}px "Segoe UI", "Microsoft YaHei", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  ctx.lineWidth = size * 0.28;
  ctx.strokeStyle = '#5A2A18';
  ctx.strokeText(str, cx, cy);
  ctx.restore();

  const g = ctx.createLinearGradient(0, cy - size, 0, cy + size);
  g.addColorStop(0, '#FFF3CE');
  g.addColorStop(0.5, '#E9C46A');
  g.addColorStop(1, '#C08A32');
  ctx.lineWidth = size * 0.2;
  ctx.strokeStyle = '#7A3B1E';
  ctx.strokeText(str, cx, cy);
  ctx.fillStyle = g;
  ctx.fillText(str, cx, cy);
  ctx.restore();
}
