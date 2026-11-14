"""只读枚举当前桌面所有顶层窗口（含隐藏/最小化），用于桌面实机验收定位游戏窗口。

用法：python tools/desktop_windows.py [pid过滤]
输出：hwnd | pid | visible | rect | class | title
不修改任何窗口状态。
"""
import ctypes
import sys
from ctypes import wintypes

user32 = ctypes.WinDLL("user32", use_last_error=True)
user32.EnumWindows.argtypes = [ctypes.c_void_p, wintypes.LPARAM]
user32.EnumWindows.restype = wintypes.BOOL
user32.IsWindowVisible.argtypes = [wintypes.HWND]
user32.GetWindowTextW.argtypes = [wintypes.HWND, wintypes.LPWSTR, ctypes.c_int]
user32.GetWindowTextW.restype = ctypes.c_int
user32.GetClassNameW.argtypes = [wintypes.HWND, wintypes.LPWSTR, ctypes.c_int]
user32.GetClassNameW.restype = ctypes.c_int
user32.GetWindowThreadProcessId.argtypes = [wintypes.HWND, ctypes.POINTER(wintypes.DWORD)]
user32.GetWindowThreadProcessId.restype = wintypes.DWORD
user32.GetWindowRect.argtypes = [wintypes.HWND, ctypes.POINTER(wintypes.RECT)]
user32.IsIconic.argtypes = [wintypes.HWND]


def main():
    pid_filter = int(sys.argv[1]) if len(sys.argv) > 1 else None
    rows = []

    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def cb(hwnd, _lp):
        pid = wintypes.DWORD()
        user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
        if pid_filter is not None and pid.value != pid_filter:
            return True
        title = ctypes.create_unicode_buffer(512)
        cls = ctypes.create_unicode_buffer(256)
        user32.GetWindowTextW(hwnd, title, 512)
        user32.GetClassNameW(hwnd, cls, 256)
        r = wintypes.RECT()
        user32.GetWindowRect(hwnd, ctypes.byref(r))
        vis = bool(user32.IsWindowVisible(hwnd))
        icon = bool(user32.IsIconic(hwnd))
        w, h = r.right - r.left, r.bottom - r.top
        # 只保留有实际尺寸的窗口，避免列出成千个隐藏控件
        if w > 50 and h > 50:
            rows.append((hwnd, pid.value, vis, icon,
                         (r.left, r.top, r.right, r.bottom), cls.value, title.value))
        return True

    user32.EnumWindows(cb, 0)
    print("hwnd | pid | visible | minimized | rect | class | title")
    for hwnd, pid, vis, icon, rect, cls, title in rows:
        print("%s | %d | %s | %s | %s | %s | %s" %
              (hwnd, pid, vis, icon, rect, cls, title[:80]))
    print("TOTAL=%d" % len(rows))
    return 0


if __name__ == "__main__":
    sys.exit(main())
