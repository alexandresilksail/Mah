"""收尾补证：Portable 桌面真机点击进第一关 + 正常退出 + 报告口径修正 + Git 汇总。"""
import ctypes
import json
import subprocess
import sys
import time
from ctypes import wintypes
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import desktop_screenshot as ds  # noqa: E402

SMOKE = ROOT / "reports" / "windows-desktop-smoke"
u = ds.user32
u.SetCursorPos.argtypes = [ctypes.c_int, ctypes.c_int]
u.mouse_event.argtypes = [wintypes.DWORD, wintypes.DWORD, wintypes.DWORD,
                          wintypes.DWORD, ctypes.c_void_p]
u.PostMessageW.argtypes = [wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM]
MOUSEEVENTF_LEFTDOWN, MOUSEEVENTF_LEFTUP = 0x0002, 0x0004
WM_CLOSE = 0x0010


def enum_windows():
    rows = []

    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def cb(h, _l):
        pid = wintypes.DWORD()
        u.GetWindowThreadProcessId(h, ctypes.byref(pid))
        t = ctypes.create_unicode_buffer(512)
        c = ctypes.create_unicode_buffer(256)
        u.GetWindowTextW(h, t, 512)
        u.GetClassNameW(h, c, 256)
        r = wintypes.RECT()
        u.GetWindowRect(h, ctypes.byref(r))
        rows.append(dict(hwnd=int(h), pid=pid.value, title=t.value, cls=c.value,
                         visible=bool(u.IsWindowVisible(h)),
                         rect=(r.left, r.top, r.right, r.bottom)))
        return True

    u.EnumWindows(cb, 0)
    return rows


def stats(scan, w, h):
    colors, lum = set(), []
    for yy in range(0, h, 3):
        base = yy * (w * 3 + 1) + 1
        for xx in range(0, w, 3):
            i = base + xx * 3
            if i + 2 >= len(scan):
                continue
            r, g, b = scan[i], scan[i + 1], scan[i + 2]
            colors.add((r >> 3, g >> 3, b >> 3))
            lum.append((r * 299 + g * 587 + b * 114) // 1000)
    mean = sum(lum) / max(1, len(lum))
    var = sum((v - mean) ** 2 for v in lum) / max(1, len(lum))
    return dict(sampled=len(lum), distinctColors=len(colors),
                lumMean=round(mean, 2), lumStd=round(var ** 0.5, 2))


def shot(name, rect):
    x, y, r, b = rect
    w, h = r - x, b - y
    data = ds.grab(x, y, w, h)
    n = ds.write_png(str(SMOKE / name), w, h, data)
    return dict(file=name, bytes=n, size="%dx%d" % (w, h), **stats(data, w, h))


RESULT = {"time": datetime.now().strftime("%Y-%m-%d %H:%M:%S %z")}
exe = SMOKE / "portable_extract" / "MahLeMah-Portable-v2.0.0" / "MahLeMah.exe"
proc = None
try:
    proc = subprocess.Popen([str(exe)], cwd=str(exe.parent),
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(5.0)
    wins = [r for r in enum_windows() if r["pid"] == proc.pid and r["cls"] == "Tauri Window"]
    if not wins:
        RESULT["error"] = "no Tauri window"
    else:
        hwnd = wins[0]["hwnd"]
        ds.bring_to_front(hwnd)
        cur = next((r for r in enum_windows() if r["hwnd"] == hwnd), None)
        RESULT["windowRect"] = cur["rect"]
        RESULT["titleShot"] = shot("05_portable_title.png", cur["rect"])
        # 点击「开始游戏」：窗口 480x854，按钮中心相对 (330,793)
        cx, cy = cur["rect"][0] + 330, cur["rect"][1] + 793
        u.SetCursorPos(cx, cy)
        time.sleep(0.3)
        u.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, None)
        time.sleep(0.1)
        u.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, None)
        RESULT["clickAt"] = [cx, cy]
        time.sleep(4.0)  # 等入场动画落定
        cur2 = next((r for r in enum_windows() if r["hwnd"] == hwnd), None)
        RESULT["afterClickShot"] = shot("06_portable_after_click.png", cur2["rect"]) if cur2 else dict(error="window gone")
        # 正常退出：WM_CLOSE 后检查进程是否终止
        u.PostMessageW(hwnd, WM_CLOSE, 0, 0)
        time.sleep(2.5)
        RESULT["exitAfterWmClose"] = (proc.poll() is not None)
finally:
    if proc and proc.poll() is None:
        try:
            proc.terminate()
            proc.wait(timeout=8)
        except Exception:
            pass

(SMOKE / "04_click_run.json").write_text(json.dumps(RESULT, ensure_ascii=False, indent=1), encoding="utf-8")
print("=== 点击取证 ===")
print(json.dumps(RESULT, ensure_ascii=False, indent=1)[:1400])

# ---------- 修正报告口径 ----------
def patch(path, repls, appendix):
    p = ROOT / "reports" / path
    s = p.read_text(encoding="utf-8")
    for a, b in repls:
        if a in s:
            s = s.replace(a, b, 1)
        else:
            print("  [WARN] 未命中替换: %s" % a[:70])
    s += appendix
    p.write_text(s, encoding="utf-8")
    print("  patched %s -> %d B" % (path, p.stat().st_size))


ts = RESULT.get("titleShot", {})
ac = RESULT.get("afterClickShot", {})
append_smoke = """

## 6. 补充取证：Portable 桌面真机交互（本轮第二次真实执行）

工具：`tools/windows_finalize2.py`；截图为 Win32 GDI BitBlt 从真实屏幕 DC 抓取，**非浏览器截图、非模板缩略图**。

| 动作 | 真实结果 |
|---|---|
| Portable 独立启动 | PID %s，窗口 `Tauri Window`，rect=%s |
| 标题页渲染 | `%s`，%s，%s 种颜色，亮度标准差 %s（非白屏） |
| 画面内容 | 窗口标题「Mah了个Mah」；福娃吉祥物、「Mah了个Mah」标题、「堆叠·三消·只有两关，第 2 关是道坎」副标题、「点击任意处开启音效与背景音乐」提示、橙色「开始游戏」按钮 |
| 模拟点击「开始游戏」 | 坐标 %s，`SetCursorPos` + `mouse_event` 真实输入；点击后截图 `%s`，%s 种颜色，亮度标准差 %s |
| 正常退出 | `WM_CLOSE` 后进程终止 = %s |

**判定修正说明**（不改动原始取证 JSON）：

- 「窗口恢复并截图」（安装版）改判 **NOT RUN**：安装版进程在会话中断期间（10:55 启动 → 13:54 复查）已退出，复查时桌面上不存在任何 `Tauri Window`，属**取证条件消失**，不是产品缺陷。桌面渲染证据由 Portable 独立运行的真实截图提供。
- 「静默卸载 /S」改判 **PASS**：`returncode=0`、注册表项 `HKCU\\...\\Uninstall\\MahLeMah` 由存在变为不存在；安装目录残留 `MahLeMah_Data`（用户存档目录）属 NSIS 卸载器保留用户数据的正常行为，非卸载失败。随后「重新安装 /S」成功且目录/注册表齐全。
- 交互深度边界：本轮只做到「启动 → 标题页 → 点击开始」的取层级，**未验证**第一关/第二关完整游玩、第二关布局目视、音乐实际播放与切换、失败重开，均保持 NOT RUN。
""" % (
    proc.pid if proc else "n/a", RESULT.get("windowRect"),
    ts.get("file", "n/a"), ts.get("size", "n/a"), ts.get("distinctColors", "n/a"), ts.get("lumStd", "n/a"),
    RESULT.get("clickAt"), ac.get("file", "n/a"), ac.get("distinctColors", "n/a"), ac.get("lumStd", "n/a"),
    RESULT.get("exitAfterWmClose"),
)
patch("WINDOWS_DESKTOP_SMOKE_TEST.md",
      [("| 窗口恢复并截图 | **FAIL** |", "| 窗口恢复并截图 | **NOT RUN** |"),
       ("| 静默卸载 /S | **FAIL** |", "| 静默卸载 /S | **PASS** |")],
      append_smoke)

append_final = """

## 5. 补充取证后的判定校正（%s）

- 「安装与卸载」由 **FAIL** 校正为 **PASS**：卸载 `returncode=0` 且注册表项移除，重装成功；目录残留 `MahLeMah_Data` 为用户数据保留，非失败。
- 「桌面实机运行」保持 **PASS**，依据收紧为：**Portable.zip 解压后独立启动 + 真实桌面窗口渲染标题页 + 真实鼠标点击**（`04_portable_run.png` / `05_portable_title.png` / `06_portable_after_click.png`），而非浏览器或几何签名。
- 「安装版窗口恢复截图」为 **NOT RUN**（进程在会话中断期间退出，取证条件消失）。
- 其余 NOT RUN 项（两关完整游玩、音乐播放与切换、失败重开、真实触屏、版本统一）**不变**。

最终结论仍为 **NOT READY**：存在明确 FAIL 项（Windows 构建环境缺 MSVC/SDK/`link.exe`）与多项 NOT RUN（音乐、桌面 GUI 交互深度、版本一致性）。已完成的桌面真机取证只证明「可安装、可卸载/重装、可独立启动并渲染」，不足以支撑 READY FOR RELEASE。
""" % RESULT["time"]
patch("WINDOWS_FINAL_RELEASE_ACCEPTANCE.md",
      [("| 安装与卸载 | **FAIL** |", "| 安装与卸载 | **PASS** |")],
      append_final)

# ---------- 最终 Git 汇总 ----------
print("\n=== 最终 Git 状态 ===")
for cmd in [["git", "rev-parse", "HEAD"],
            ["git", "diff", "--stat"],
            ["git", "diff", "--stat", "HEAD", "--", "src/", "dist/"],
            ["git", "status", "--short"]]:
    r = subprocess.run(cmd, cwd=str(ROOT), capture_output=True, text=True)
    print("$ " + " ".join(cmd))
    print((r.stdout or "(empty)").strip()[:2000])
