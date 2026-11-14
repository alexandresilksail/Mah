"""Windows 桌面实机验收截图工具（纯标准库，不装第三方依赖）。

用法：python tools/desktop_screenshot.py <输出.png> [窗口标题关键字]

- 通过 Win32 GDI BitBlt 从真实屏幕 DC 抓取像素（不是浏览器截图、不是模板缩略图）。
- 若给出窗口标题关键字，则用 FindWindow/GetWindowRect 裁剪到该窗口（含边框）。
- 输出标准 PNG（RGB8），自写 PNG chunk + zlib，无 PIL/numpy 依赖。
"""
import ctypes
import struct
import sys
import time
import zlib
from ctypes import wintypes

user32 = ctypes.WinDLL("user32", use_last_error=True)
gdi32 = ctypes.WinDLL("gdi32", use_last_error=True)

# --- 类型声明（64 位句柄安全） ---
user32.GetDC.argtypes = [wintypes.HWND]
user32.GetDC.restype = wintypes.HDC
user32.ReleaseDC.argtypes = [wintypes.HWND, wintypes.HDC]
user32.GetSystemMetrics.argtypes = [ctypes.c_int]
user32.GetSystemMetrics.restype = ctypes.c_int
user32.FindWindowW.argtypes = [wintypes.LPCWSTR, wintypes.LPCWSTR]
user32.FindWindowW.restype = wintypes.HWND
user32.EnumWindows.argtypes = [ctypes.c_void_p, wintypes.LPARAM]
user32.EnumWindows.restype = wintypes.BOOL
user32.GetWindowTextW.argtypes = [wintypes.HWND, wintypes.LPWSTR, ctypes.c_int]
user32.GetWindowTextW.restype = ctypes.c_int
user32.IsWindowVisible.argtypes = [wintypes.HWND]
user32.GetWindowRect.argtypes = [wintypes.HWND, ctypes.POINTER(wintypes.RECT)]
user32.GetWindowThreadProcessId.argtypes = [wintypes.HWND, ctypes.POINTER(wintypes.DWORD)]
user32.GetWindowThreadProcessId.restype = wintypes.DWORD
gdi32.CreateCompatibleDC.argtypes = [wintypes.HDC]
gdi32.CreateCompatibleDC.restype = wintypes.HDC
gdi32.CreateCompatibleBitmap.argtypes = [wintypes.HDC, ctypes.c_int, ctypes.c_int]
gdi32.CreateCompatibleBitmap.restype = wintypes.HBITMAP
gdi32.SelectObject.argtypes = [wintypes.HDC, wintypes.HGDIOBJ]
gdi32.SelectObject.restype = wintypes.HGDIOBJ
gdi32.BitBlt.argtypes = [wintypes.HDC, ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_int,
                         wintypes.HDC, ctypes.c_int, ctypes.c_int, wintypes.DWORD]
gdi32.BitBlt.restype = wintypes.BOOL
gdi32.DeleteDC.argtypes = [wintypes.HDC]
gdi32.DeleteObject.argtypes = [wintypes.HGDIOBJ]
user32.ShowWindow.argtypes = [wintypes.HWND, ctypes.c_int]
user32.SetForegroundWindow.argtypes = [wintypes.HWND]
user32.BringWindowToTop.argtypes = [wintypes.HWND]
user32.SetWindowPos.argtypes = [wintypes.HWND, wintypes.HWND, ctypes.c_int, ctypes.c_int,
                                ctypes.c_int, ctypes.c_int, wintypes.UINT]
try:
    user32.SwitchToThisWindow.argtypes = [wintypes.HWND, wintypes.BOOL]
except AttributeError:
    pass


class BITMAPINFOHEADER(ctypes.Structure):
    _fields_ = [
        ("biSize", wintypes.DWORD), ("biWidth", wintypes.LONG), ("biHeight", wintypes.LONG),
        ("biPlanes", wintypes.WORD), ("biBitCount", wintypes.WORD), ("biCompression", wintypes.DWORD),
        ("biSizeImage", wintypes.DWORD), ("biXPelsPerMeter", wintypes.LONG),
        ("biYPelsPerMeter", wintypes.LONG), ("biClrUsed", wintypes.DWORD),
        ("biClrImportant", wintypes.DWORD),
    ]


class BITMAPINFO(ctypes.Structure):
    _fields_ = [("bmiHeader", BITMAPINFOHEADER), ("bmiColors", wintypes.DWORD * 3)]


gdi32.GetDIBits.argtypes = [wintypes.HDC, wintypes.HBITMAP, wintypes.UINT, wintypes.UINT,
                           ctypes.c_void_p, ctypes.POINTER(BITMAPINFO), wintypes.UINT]
gdi32.GetDIBits.restype = ctypes.c_int

SRCCOPY = 0x00CC0020
BI_RGB = 0


def find_window(keyword):
    """按标题关键字或纯数字 PID 找可见窗口，返回 (hwnd, rect) 或 (None, None)。"""
    found = []
    by_pid = keyword.isdigit()
    target_pid = int(keyword) if by_pid else 0

    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def cb(hwnd, _lparam):
        if not user32.IsWindowVisible(hwnd):
            return True
        match = False
        if by_pid:
            pid = wintypes.DWORD()
            user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
            match = (pid.value == target_pid)
        else:
            buf = ctypes.create_unicode_buffer(512)
            user32.GetWindowTextW(hwnd, buf, 512)
            match = keyword in buf.value
        if match:
            r = wintypes.RECT()
            user32.GetWindowRect(hwnd, ctypes.byref(r))
            if r.right - r.left > 100 and r.bottom - r.top > 100:
                found.append((hwnd, (r.left, r.top, r.right, r.bottom)))
        return True

    user32.EnumWindows(cb, 0)
    return (found[0][0], found[0][1]) if found else (None, None)


def bring_to_front(hwnd):
    """把目标窗口置前，避免 BitBlt 抓到遮挡它的浏览器窗口。"""
    SW_RESTORE = 9
    HWND_TOPMOST = wintypes.HWND(-1)
    SWP_NOSIZE, SWP_NOMOVE, SWP_SHOWWINDOW = 0x0001, 0x0002, 0x0040
    user32.ShowWindow(hwnd, SW_RESTORE)
    user32.SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, 0, 0,
                        SWP_NOSIZE | SWP_NOMOVE | SWP_SHOWWINDOW)
    user32.BringWindowToTop(hwnd)
    user32.SetForegroundWindow(hwnd)
    try:
        user32.SwitchToThisWindow(hwnd, True)
    except AttributeError:
        pass
    time.sleep(1.2)


def grab(x, y, w, h):
    screen_dc = user32.GetDC(0)
    mem_dc = gdi32.CreateCompatibleDC(screen_dc)
    bmp = gdi32.CreateCompatibleBitmap(screen_dc, w, h)
    old = gdi32.SelectObject(mem_dc, bmp)
    ok = gdi32.BitBlt(mem_dc, 0, 0, w, h, screen_dc, x, y, SRCCOPY)
    if not ok:
        raise RuntimeError("BitBlt failed, GetLastError=%d" % ctypes.get_last_error())

    bi = BITMAPINFO()
    bi.bmiHeader.biSize = ctypes.sizeof(BITMAPINFOHEADER)
    bi.bmiHeader.biWidth = w
    bi.bmiHeader.biHeight = h
    bi.bmiHeader.biPlanes = 1
    bi.bmiHeader.biBitCount = 32
    bi.bmiHeader.biCompression = BI_RGB
    buf = ctypes.create_string_buffer(w * h * 4)
    got = gdi32.GetDIBits(mem_dc, bmp, 0, h, buf, ctypes.byref(bi), 0)
    if got != h:
        raise RuntimeError("GetDIBits returned %d (expected %d)" % (got, h))

    gdi32.SelectObject(mem_dc, old)
    gdi32.DeleteObject(bmp)
    gdi32.DeleteDC(mem_dc)
    user32.ReleaseDC(0, screen_dc)

    raw = buf.raw  # BGRA, bottom-up
    rows = []
    for yy in range(h - 1, -1, -1):          # DIB 自下而上 -> PNG 自上而下
        line = bytearray(raw[yy * w * 4:(yy + 1) * w * 4])
        line[0::4], line[2::4] = line[2::4], line[0::4]   # BGR(A) -> RGB(A)
        del line[3::4]                                     # 丢掉 alpha
        rows.append(b"\x00" + bytes(line))
    return b"".join(rows)


def chunk(tag, data):
    return (struct.pack(">I", len(data)) + tag + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))


def write_png(path, w, h, scanlines):
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)   # 8-bit RGB
    png = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr)
           + chunk(b"IDAT", zlib.compress(scanlines, 6)) + chunk(b"IEND", b""))
    with open(path, "wb") as f:
        f.write(png)
    return len(png)


def main():
    if len(sys.argv) < 2:
        print("usage: python tools/desktop_screenshot.py <out.png> [title keyword]")
        return 2
    out = sys.argv[1]
    keyword = sys.argv[2] if len(sys.argv) > 2 else None
    if keyword:
        hwnd, rect = find_window(keyword)
        if not hwnd:
            print("WINDOW_NOT_FOUND: %s" % keyword)
            return 3
        bring_to_front(hwnd)
        _, rect = find_window(keyword)      # 置前后重新取矩形
        x, y, r, b = rect
        w, h = r - x, b - y
        print("window=%s hwnd=%s rect=(%d,%d,%d,%d) size=%dx%d" % (keyword, hwnd, x, y, r, b, w, h))
    else:
        x = y = 0
        w = user32.GetSystemMetrics(0)
        h = user32.GetSystemMetrics(1)
        print("fullscreen=%dx%d" % (w, h))
    data = grab(x, y, w, h)
    size = write_png(out, w, h, data)
    print("saved=%s bytes=%d pixels=%dx%d" % (out, size, w, h))
    return 0


if __name__ == "__main__":
    sys.exit(main())
