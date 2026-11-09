#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
纯 Python 生成应用图标（不使用 PIL / 任何外部图片素材）。

图标内容：暖木色圆角底 + 象牙麻将牌 + 红色「中」字（全部由矩形/圆角矩形程序化绘制），
输出 src-tauri/icons/ 下的 PNG 与 ICO。

用法： python tools/gen_icon.py
"""
import os
import struct
import zlib

S = 1024  # 渲染分辨率（再盒式降采样，得到干净的抗锯齿）

OUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src-tauri", "icons"
)


# --------------------------------------------------------------------------
# 画布
# --------------------------------------------------------------------------
class Canvas:
    def __init__(self, size):
        self.size = size
        self.buf = bytearray(size * size * 4)  # RGBA，全透明

    def blend(self, idx, color, alpha):
        if alpha <= 0:
            return
        b = self.buf
        sa = alpha
        da = b[idx + 3] / 255.0
        oa = sa + da * (1.0 - sa)
        if oa <= 0:
            return
        for k in range(3):
            dc = b[idx + k] / 255.0
            sc = color[k] / 255.0
            v = (sc * sa + dc * da * (1.0 - sa)) / oa
            b[idx + k] = max(0, min(255, int(v * 255 + 0.5)))
        b[idx + 3] = max(0, min(255, int(oa * 255 + 0.5)))

    def paint(self, bbox, test, colorat, alpha=1.0, samples=2):
        n = self.size
        x0 = max(0, int(bbox[0]))
        y0 = max(0, int(bbox[1]))
        x1 = min(n, int(bbox[2]) + 1)
        y1 = min(n, int(bbox[3]) + 1)
        step = 1.0 / samples
        off = [step * (i + 0.5) for i in range(samples)]
        total = float(samples * samples)
        for y in range(y0, y1):
            row = y * n
            for x in range(x0, x1):
                hit = 0
                for oy in off:
                    py = y + oy
                    for ox in off:
                        if test(x + ox, py):
                            hit += 1
                if not hit:
                    continue
                self.blend((row + x) * 4, colorat(x, y), (hit / total) * alpha)

    def resize(self, dw, dh):
        src = self.buf
        sw = sh = self.size
        out = bytearray(dw * dh * 4)
        for ty in range(dh):
            sy0 = ty * sh // dh
            sy1 = max(sy0 + 1, (ty + 1) * sh // dh)
            for tx in range(dw):
                sx0 = tx * sw // dw
                sx1 = max(sx0 + 1, (tx + 1) * sw // dw)
                r = g = b = a = 0.0
                cnt = 0
                for sy in range(sy0, sy1):
                    base = sy * sw
                    for sx in range(sx0, sx1):
                        i = (base + sx) * 4
                        al = src[i + 3] / 255.0
                        r += src[i] * al
                        g += src[i + 1] * al
                        b += src[i + 2] * al
                        a += al
                        cnt += 1
                o = (ty * dw + tx) * 4
                if a > 0:
                    out[o] = max(0, min(255, int(r / a + 0.5)))
                    out[o + 1] = max(0, min(255, int(g / a + 0.5)))
                    out[o + 2] = max(0, min(255, int(b / a + 0.5)))
                    out[o + 3] = max(0, min(255, int(a / cnt * 255 + 0.5)))
        return bytes(out)


# --------------------------------------------------------------------------
# 形状判定
# --------------------------------------------------------------------------
def rrect_test(x, y, w, h, r):
    x1, y1 = x + w, y + h

    def t(px, py):
        if px < x or py < y or px > x1 or py > y1:
            return False
        if px < x + r:
            cx = x + r
        elif px > x1 - r:
            cx = x1 - r
        else:
            cx = px
        if py < y + r:
            cy = y + r
        elif py > y1 - r:
            cy = y1 - r
        else:
            cy = py
        dx, dy = px - cx, py - cy
        return dx * dx + dy * dy <= r * r

    return t


def circle_test(cx, cy, r):
    r2 = r * r

    def t(px, py):
        dx, dy = px - cx, py - cy
        return dx * dx + dy * dy <= r2

    return t


def ring_test(outer, inner):
    def t(px, py):
        return outer(px, py) and not inner(px, py)

    return t


def vgrad(y0, y1, c0, c1):
    span = max(1.0, y1 - y0)

    def f(px, py):
        k = (py - y0) / span
        k = 0.0 if k < 0 else (1.0 if k > 1 else k)
        return (c0[0] + (c1[0] - c0[0]) * k,
                c0[1] + (c1[1] - c0[1]) * k,
                c0[2] + (c1[2] - c0[2]) * k)

    return f


def solid(c):
    return lambda px, py: c


# --------------------------------------------------------------------------
# 绘制
# --------------------------------------------------------------------------
def build(size=S):
    cv = Canvas(size)
    k = size / 1024.0

    def sc(v):
        return v * k

    # ---- 背景：暖木色圆角方块 ----
    bx, by, bw, bh, br = sc(18), sc(18), sc(988), sc(988), sc(214)
    bg_test = rrect_test(bx, by, bw, bh, br)
    cv.paint((bx, by, bx + bw, by + bh), bg_test, vgrad(by, by + bh, (88, 60, 40), (21, 13, 8)))

    # 顶部暖光
    gc = (sc(512), sc(250))
    gr = sc(560)

    def glow_col(px, py):
        d = (((px - gc[0]) ** 2 + (py - gc[1]) ** 2) ** 0.5) / gr
        a = max(0.0, 1.0 - d) ** 2
        return (255 * a + 40, 196 * a + 30, 108 * a + 20)

    cv.paint((0, 0, size, sc(760)), circle_test(gc[0], gc[1], gr), glow_col)

    # 金色细边框
    rim_outer = bg_test
    rim_inner = rrect_test(bx + sc(11), by + sc(11), bw - sc(22), bh - sc(22), br - sc(9))
    cv.paint((bx, by, bx + bw, by + bh), ring_test(rim_outer, rim_inner), solid((233, 196, 106)), alpha=0.9)

    # ---- 麻将牌 ----
    tw, th = sc(464), sc(552)
    tx = (size - tw) / 2
    ty = (size - th) / 2 + sc(14)
    tile_test = rrect_test(tx, ty, tw, th, sc(72))

    # 柔和投影（多层叠加）
    for i in range(6):
        g = sc(6) * i
        sh = rrect_test(tx - g, ty + sc(30) - g, tw + g * 2, th + g * 2, sc(72) + g)
        cv.paint(
            (tx - g, ty + sc(30) - g, tx + tw + g, ty + th + sc(30) + g),
            sh,
            solid((0, 0, 0)),
            alpha=0.055,
        )

    # 牌体侧面（厚度）
    side_y = ty + sc(20)
    cv.paint(
        (tx, side_y, tx + tw, side_y + th),
        rrect_test(tx, side_y, tw, th, sc(72)),
        vgrad(side_y, side_y + th, (198, 170, 124), (152, 124, 82)),
    )

    # 牌面
    cv.paint((tx, ty, tx + tw, ty + th), tile_test, vgrad(ty, ty + th, (255, 253, 245), (225, 207, 167)))

    # 牌面内描边
    inner = rrect_test(tx + sc(15), ty + sc(15), tw - sc(30), th - sc(30), sc(59))
    cv.paint((tx, ty, tx + tw, ty + th), ring_test(tile_test, inner), solid((200, 176, 136)))

    # ---- 「中」：方框 + 穿过的竖笔 ----
    cx = tx + tw / 2
    cy = ty + th / 2
    box = sc(104)
    bar = sc(32)
    ext = sc(36)
    red = (176, 46, 36)

    rects = [
        (cx - bar / 2, cy - box - ext, bar, (box + ext) * 2),      # 竖笔
        (cx - box, cy - box, box * 2, bar),                        # 上横
        (cx - box, cy + box - bar, box * 2, bar),                  # 下横
        (cx - box, cy - box, bar, box * 2),                        # 左竖
        (cx + box - bar, cy - box, bar, box * 2),                  # 右竖
    ]
    for (rx, ry, rw, rh) in rects:
        cv.paint((rx, ry, rx + rw, ry + rh), rrect_test(rx, ry, rw, rh, sc(4)), solid(red))

    return cv


# --------------------------------------------------------------------------
# 输出
# --------------------------------------------------------------------------
def write_png(path, w, h, rgba):
    raw = bytearray()
    stride = w * 4
    for y in range(h):
        raw.append(0)
        raw += rgba[y * stride:(y + 1) * stride]

    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(
            ">I", zlib.crc32(tag + data) & 0xFFFFFFFF
        )

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


def write_ico(path, images):
    count = len(images)
    header = struct.pack("<HHH", 0, 1, count)
    offset = 6 + 16 * count
    entries = b""
    blobs = b""
    for size, data in images:
        dim = 0 if size >= 256 else size
        entries += struct.pack("<BBBBHHII", dim, dim, 0, 0, 1, 32, len(data), offset)
        blobs += data
        offset += len(data)
    with open(path, "wb") as f:
        f.write(header + entries + blobs)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    cv = build(S)
    cache = {S: cv.resize(S, S)}

    def img(n):
        if n not in cache:
            cache[n] = cv.resize(n, n)
        return cache[n]

    targets = {
        "icon.png": 512,
        "32x32.png": 32,
        "128x128.png": 128,
        "128x128@2x.png": 256,
        "StoreLogo.png": 50,
        "Square30x30Logo.png": 30,
        "Square44x44Logo.png": 44,
        "Square71x71Logo.png": 71,
        "Square89x89Logo.png": 89,
        "Square107x107Logo.png": 107,
        "Square142x142Logo.png": 142,
        "Square150x150Logo.png": 150,
        "Square284x284Logo.png": 284,
        "Square310x310Logo.png": 310,
    }
    for name, n in targets.items():
        write_png(os.path.join(OUT_DIR, name), n, n, img(n))

    imgs = []
    for n in [16, 24, 32, 48, 64, 128, 256]:
        tmp = os.path.join(OUT_DIR, f".tmp{n}.png")
        write_png(tmp, n, n, img(n))
        with open(tmp, "rb") as f:
            imgs.append((n, f.read()))
        os.remove(tmp)
    write_ico(os.path.join(OUT_DIR, "icon.ico"), imgs)

    total = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in os.listdir(OUT_DIR))
    print(f"icons -> {OUT_DIR}  (total {total / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
