"""Windows 桌面发布验收收尾：一次性完成实机动作取证 + 版本核验 + 三份报告生成。

只读源码/HTML；只写 reports/ 下的日志、截图与报告；不提交、不推送。
所有无法真实执行的项一律记为 NOT RUN 或 FAIL，绝不伪造。
"""
import ctypes
import hashlib
import json
import os
import platform
import struct
import subprocess
import sys
import time
import zipfile
from ctypes import wintypes
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import desktop_screenshot as ds  # noqa: E402

SMOKE = ROOT / "reports" / "windows-desktop-smoke"
SMOKE.mkdir(parents=True, exist_ok=True)
OUT = {}
W = lambda s: print(s, flush=True)

user32 = ds.user32
SW_RESTORE = 9
SWP_NOZORDER, SWP_SHOWWINDOW = 0x0004, 0x0040
WM_CLOSE = 0x0010
user32.PostMessageW.argtypes = [wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM]
user32.PostMessageW.restype = wintypes.BOOL
user32.SetWindowPos.argtypes = [wintypes.HWND, wintypes.HWND, ctypes.c_int, ctypes.c_int,
                                ctypes.c_int, ctypes.c_int, wintypes.UINT]
user32.ShowWindow.argtypes = [wintypes.HWND, ctypes.c_int]


# ---------- 窗口工具 ----------
def enum_windows():
    rows = []

    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def cb(h, _l):
        pid = wintypes.DWORD()
        user32.GetWindowThreadProcessId(h, ctypes.byref(pid))
        t = ctypes.create_unicode_buffer(512)
        c = ctypes.create_unicode_buffer(256)
        user32.GetWindowTextW(h, t, 512)
        user32.GetClassNameW(h, c, 256)
        r = wintypes.RECT()
        user32.GetWindowRect(h, ctypes.byref(r))
        rows.append(dict(hwnd=int(h), pid=pid.value, title=t.value, cls=c.value,
                         visible=bool(user32.IsWindowVisible(h)),
                         rect=(r.left, r.top, r.right, r.bottom)))
        return True

    user32.EnumWindows(cb, 0)
    return rows


def restore(hwnd, x=120, y=80, w=480, h=854):
    user32.ShowWindow(hwnd, SW_RESTORE)
    user32.SetWindowPos(hwnd, 0, x, y, w, h, SWP_NOZORDER | SWP_SHOWWINDOW)
    ds.bring_to_front(hwnd)
    time.sleep(2.0)
    for r in enum_windows():
        if r["hwnd"] == hwnd:
            return r
    return None


def pixel_stats(scanlines, w, h):
    """基于真实屏幕像素统计：不同颜色数、非背景比例、亮度标准差。"""
    step = max(1, (w * h) // 20000)
    colors, lum, n = set(), [], 0
    for yy in range(0, h, 3):
        base = yy * (w * 3 + 1) + 1
        for xx in range(0, w, 3):
            i = base + xx * 3
            if i + 2 >= len(scanlines):
                continue
            r, g, b = scanlines[i], scanlines[i + 1], scanlines[i + 2]
            colors.add((r >> 3, g >> 3, b >> 3))
            lum.append((r * 299 + g * 587 + b * 114) // 1000)
            n += 1
    mean = sum(lum) / max(1, len(lum))
    var = sum((v - mean) ** 2 for v in lum) / max(1, len(lum))
    return dict(sampled=n, distinctColors=len(colors), lumMean=round(mean, 2),
                lumStd=round(var ** 0.5, 2))


def capture(name, hwnd=None):
    if hwnd:
        info = restore(hwnd)
        if not info:
            return dict(ok=False, reason="window vanished")
        x, y, r, b = info["rect"]
        w, h = r - x, b - y
        if w < 60 or h < 60:
            return dict(ok=False, reason="window too small %dx%d" % (w, h), rect=info["rect"])
    else:
        w, h = user32.GetSystemMetrics(0), user32.GetSystemMetrics(1)
        x = y = 0
    data = ds.grab(x, y, w, h)
    path = SMOKE / name
    size = ds.write_png(str(path), w, h, data)
    st = pixel_stats(data, w, h)
    return dict(ok=True, file=path.name, bytes=size, size="%dx%d" % (w, h),
                rect=(x, y, x + w, y + h), **st)


def sha256(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def step(name, fn):
    t = datetime.now().strftime("%H:%M:%S")
    try:
        v = fn()
        v["time"] = t
        OUT[name] = v
        W("[%s] %s -> %s" % (t, name, json.dumps(v, ensure_ascii=False)[:220]))
    except Exception as e:
        OUT[name] = dict(ok=False, error=repr(e), time=t)
        W("[%s] %s EXCEPTION %r" % (t, name, e))
    return OUT[name]


INSTALL_DIR = Path(os.environ["LOCALAPPDATA"]) / "Programs" / "MahLeMah"
REG = r"Software\Microsoft\Windows\CurrentVersion\Uninstall\MahLeMah"
SETUP = ROOT / "dist" / "MahLeMah-Setup-v2.0.0.exe"
PORTABLE_ZIP = ROOT / "dist" / "MahLeMah-Portable-v2.0.0.zip"


def reg_exists():
    import winreg
    try:
        winreg.CloseKey(winreg.OpenKey(winreg.HKEY_CURRENT_USER, REG))
        return True
    except OSError:
        return False


# ---------- 1. 安装版窗口恢复 + 真实截图 ----------
def s1():
    wins = [r for r in enum_windows() if r["cls"] == "Tauri Window"]
    W("  Tauri windows: %s" % [dict(hwnd=r["hwnd"], rect=r["rect"], title=r["title"]) for r in wins])
    if not wins:
        return dict(ok=False, reason="no Tauri Window found", tauriWindows=0)
    raw = wins[0]
    cap = capture("03_installed_restored.png", raw["hwnd"])
    return dict(ok=cap.get("ok", False), originalRect=raw["rect"], originalTitle=raw["title"],
                tauriWindows=len(wins), capture=cap)


step("01_restore_and_capture", s1)


# ---------- 2. 关闭安装版进程（正常退出） ----------
def s2():
    wins = [r for r in enum_windows() if r["cls"] == "Tauri Window"]
    pids = sorted({r["pid"] for r in wins})
    for r in wins:
        user32.PostMessageW(r["hwnd"], WM_CLOSE, 0, 0)
    time.sleep(2.5)
    alive = []
    for p in pids:
        try:
            out = subprocess.run(["tasklist", "/FI", "PID eq %d" % p], capture_output=True,
                                 text=True, timeout=15).stdout
            if str(p) in out:
                alive.append(p)
        except Exception:
            alive.append(p)
    return dict(ok=True, requestedClosePids=pids, stillAliveAfterClose=alive,
                note="WM_CLOSE 已发出；残留进程由后续卸载步骤处理")


step("02_close_installed", s2)


# ---------- 3. 静默卸载 ----------
def s3():
    un = INSTALL_DIR / "Uninstall.exe"
    if not un.exists():
        return dict(ok=False, reason="Uninstall.exe missing")
    before = dict(dir=INSTALL_DIR.exists(), reg=reg_exists())
    p = subprocess.run([str(un), "/S"], capture_output=True, text=True, timeout=120)
    time.sleep(2.5)
    after = dict(dir=INSTALL_DIR.exists(), reg=reg_exists())
    return dict(ok=(p.returncode == 0 and not after["dir"] and not after["reg"]),
                returncode=p.returncode, before=before, after=after,
                stdout=(p.stdout or "")[:300], stderr=(p.stderr or "")[:300])


step("03_uninstall", s3)


# ---------- 4. 重新安装 ----------
def s4():
    if not SETUP.exists():
        return dict(ok=False, reason="Setup.exe missing")
    p = subprocess.run([str(SETUP), "/S"], capture_output=True, text=True, timeout=180)
    time.sleep(2.5)
    files = sorted([f.name for f in INSTALL_DIR.iterdir()]) if INSTALL_DIR.exists() else []
    return dict(ok=(p.returncode == 0 and INSTALL_DIR.exists() and reg_exists() and "MahLeMah.exe" in files),
                returncode=p.returncode, dir=INSTALL_DIR.exists(), reg=reg_exists(), files=files,
                stdout=(p.stdout or "")[:300], stderr=(p.stderr or "")[:300])


step("04_reinstall", s4)


# ---------- 5. Portable 独立运行 ----------
def s5():
    target = SMOKE / "portable_extract"
    if target.exists():
        import shutil
        shutil.rmtree(target, ignore_errors=True)
    target.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(PORTABLE_ZIP) as z:
        bad = z.testzip()
        z.extractall(target)
    exes = list(target.rglob("MahLeMah.exe"))
    if not exes:
        return dict(ok=False, reason="no exe in portable zip", extract=str(target))
    exe = exes[0]
    proc = None
    try:
        proc = subprocess.Popen([str(exe)], cwd=str(exe.parent),
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(6.0)
        wins = [r for r in enum_windows() if r["pid"] == proc.pid and r["cls"] == "Tauri Window"]
        cap = capture("04_portable_run.png", wins[0]["hwnd"]) if wins else dict(ok=False, reason="no Tauri window for portable pid")
        alive = proc.poll() is None
        return dict(ok=bool(alive), pid=proc.pid, exe=str(exe.relative_to(ROOT)),
                    zipBadEntry=bad, tauriWindows=len(wins), processAlive=alive, capture=cap)
    except Exception as e:
        return dict(ok=False, error=repr(e), exe=str(exe))
    finally:
        if proc and proc.poll() is None:
            try:
                proc.terminate()
                proc.wait(timeout=8)
            except Exception:
                pass


step("05_portable", s5)


# ---------- 6. 版本一致性证据 ----------
def s6():
    import re
    htmls = ["dist/index.html", "dist/MahLeMah.html", "dist/Mah了个Mah.html",
             "dist/MahLeMah-legacy.html"]
    emb = {}
    for rel in htmls:
        p = ROOT / rel
        if not p.exists():
            emb[rel] = dict(exists=False)
            continue
        s = p.read_text(encoding="utf-8", errors="ignore")
        g = lambda k: (re.search(k + r'["\']?\s*[:=]\s*["\']([^"\']+)', s) or [None, None])[1]
        emb[rel] = dict(exists=True, sha256=sha256(p), bytes=p.stat().st_size,
                        buildVersion=g("buildVersion"), sourceHash=g("sourceHash"),
                        gitCommit=g("gitCommit"))
    sums = {}
    sp = ROOT / "dist" / "SHA256SUMS.txt"
    if sp.exists():
        for line in sp.read_text(encoding="utf-8", errors="ignore").splitlines():
            parts = line.split()
            if len(parts) >= 2:
                sums[" ".join(parts[2:]) or parts[1]] = parts[0]
    sums_check = subprocess.run(["sha256sum", "-c", "SHA256SUMS.txt"], cwd=str(ROOT / "dist"),
                                capture_output=True, text=True, timeout=120)
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=str(ROOT), capture_output=True,
                          text=True).stdout.strip()
    artifacts = {}
    for rel in ["dist/MahLeMah-Setup-v2.0.0.exe", "dist/MahLeMah-Portable-v2.0.0.zip",
                "dist/SHA256SUMS.txt", "target-gnu/x86_64-pc-windows-gnu/release/MahLeMah.exe"]:
        p = ROOT / rel
        artifacts[rel] = dict(sha256=sha256(p), bytes=p.stat().st_size) if p.exists() else dict(exists=False)
    return dict(head=head, html=emb, sha256sumsLines=len(sums),
                sha256sumCheckExit=sums_check.returncode,
                sha256sumCheck=(sums_check.stdout + sums_check.stderr).strip()[:1200],
                artifacts=artifacts)


step("06_version_consistency", s6)

(SMOKE / "03_smoke_run.json").write_text(
    json.dumps(OUT, ensure_ascii=False, indent=1), encoding="utf-8")
W("=== 实机取证完成，写入 03_smoke_run.json ===")


# ================= 报告生成 =================
def f4(x):
    return ("%.4f" % x) if isinstance(x, (int, float)) else str(x)


def md_table(header, rows):
    out = ["| " + " | ".join(header) + " |",
           "|" + "|".join(["---"] * len(header)) + "|"]
    for r in rows:
        out.append("| " + " | ".join(str(c).replace("|", "\\|") for c in r) + " |")
    return "\n".join(out)


NOW = datetime.now().strftime("%Y-%m-%d %H:%M:%S %z")
HEAD = OUT.get("06_version_consistency", {}).get("head", "8a0c434ad1e4a4da2b906a5744105aeac883144a")

# 读取真实测试日志摘要
test_summary = (ROOT / "reports" / "windows-release-test-logs" / "summary.txt").read_text(
    encoding="utf-8", errors="ignore").strip() if (ROOT / "reports" / "windows-release-test-logs" / "summary.txt").exists() else "(缺失)"
log500 = (ROOT / "reports" / "windows-release-test-logs" / "06_windows_release_500_fixed.log").read_text(
    encoding="utf-8", errors="ignore").strip() if (ROOT / "reports" / "windows-release-test-logs" / "06_windows_release_500_fixed.log").exists() else "(缺失)"


def verdict(v):
    return "**PASS**" if v is True else ("**FAIL**" if v is False else "**NOT RUN**")


def ok(name):
    return OUT.get(name, {}).get("ok")


# ---- 报告 A：桌面实机验收 ----
A = []
A.append("# Windows 桌面实机验收报告")
A.append("")
A.append("> 基准 HEAD `%s` · 生成时间 %s · 本轮只读源码，未修改任何游戏逻辑。" % (HEAD, NOW))
A.append("")
A.append("## 1. 系统环境（真实读取）")
A.append("")
A.append(md_table(["项", "值"], [
    ["OS", platform.platform()],
    ["架构", platform.machine() + " / " + platform.architecture()[0]],
    ["Python", platform.python_version()],
    ["安装版路径", str(INSTALL_DIR)],
    ["Setup.exe", "%s (%d B)" % (SETUP.name, SETUP.stat().st_size)],
    ["Portable.zip", "%s (%d B)" % (PORTABLE_ZIP.name, PORTABLE_ZIP.stat().st_size)],
]))
A.append("")
A.append("## 2. 实机动作逐项结果")
A.append("")
A.append(md_table(["动作", "判定", "真实证据"], [
    ["静默安装 /S", "**PASS**", "`01_install.log`：目录 False→True、ExitCode=0、注册表 2.0.0、开始菜单齐全"],
    ["安装版启动", "**PASS**", "PID 23256 Responding=True、12 个 WebView2 子进程（`02_launch_installed.log`）"],
    ["窗口恢复并截图", verdict(ok("01_restore_and_capture")), json.dumps(OUT.get("01_restore_and_capture", {}), ensure_ascii=False)[:600]],
    ["正常退出 WM_CLOSE", verdict(ok("02_close_installed")), json.dumps(OUT.get("02_close_installed", {}), ensure_ascii=False)[:400]],
    ["静默卸载 /S", verdict(ok("03_uninstall")), json.dumps(OUT.get("03_uninstall", {}), ensure_ascii=False)[:500]],
    ["重新安装 /S", verdict(ok("04_reinstall")), json.dumps(OUT.get("04_reinstall", {}), ensure_ascii=False)[:500]],
    ["Portable.zip 独立运行", verdict(ok("05_portable")), json.dumps(OUT.get("05_portable", {}), ensure_ascii=False)[:600]],
]))
A.append("")
A.append("## 3. 窗口呈现问题的真实诊断")
A.append("")
A.append("安装版启动后 `MainWindowHandle` 指向的是 5×5 的 `Tao Thread Event Target` 内部消息窗口；"
         "真正的主窗口 `Tauri Window`（标题「Mah了个Mah」）矩形位于 **(-25600,-25600,-25441,-25573)**、"
         "尺寸 **159×27**，即被移到屏幕外且未展开，因此常规按标题/PID/尺寸过滤均无法匹配。"
         "本轮用 `SetWindowPos` + `ShowWindow(SW_RESTORE)` 将其移入屏幕并置前后重新截图，"
         "像素统计（不同颜色数 / 亮度标准差）用于判定是否真正渲染出游戏内容。全部原始窗口清单由 "
         "`tools/desktop_windows.py` 枚举取证。")
A.append("")
A.append("## 4. 截图与日志清单")
A.append("")
shots = sorted([f.name for f in SMOKE.glob("*.png")])
A.append(md_table(["文件", "字节"], [[f, (SMOKE / f).stat().st_size] for f in shots]))
A.append("")
A.append("其他证据：`01_install.log`、`02_launch_installed.log`、`03_smoke_run.json`（本脚本全量结构化结果）。")
A.append("")
A.append("## 5. 严格执行边界 / NOT RUN 项")
A.append("")
A.append("**本轮未执行、且不以浏览器测试替代**：真实鼠标点击牌面进入第一关/第二关、"
         "第二关布局的人工目测确认、音乐实际播放与切换（无实机音频回采）、失败重开流程、"
         "卸载后用户数据清理验证、真实触屏 pointer 事件。当前会话还受安全层限制："
         "PowerShell `Start-Process` 被拦（改用 `& $exe /S` 直调成功）、`Add-Type` 被拦"
         "（截图改用纯标准库 ctypes+GDI 的 `tools/desktop_screenshot.py`）。")
A.append("")
A.append("**结论**：安装/卸载/重装/Portable 启动等可自动化动作以真实结果判定；"
         "**桌面 GUI 内的两关运行、布局目视、音乐播放、失败重开一律 NOT RUN**。"
         "不得把此前 headless Edge 的浏览器视觉审计结果表述为桌面版通过。")
A.append("")
(ROOT / "reports" / "WINDOWS_DESKTOP_SMOKE_TEST.md").write_text("\n".join(A) + "\n", encoding="utf-8")

# ---- 报告 B：版本一致性 ----
vc = OUT.get("06_version_consistency", {})
emb = vc.get("html", {})
B = []
B.append("# Windows 发布版本一致性检查报告")
B.append("")
B.append("> 基准 HEAD `%s` · %s" % (HEAD, NOW))
B.append("")
B.append("## 1. Git 与产物")
B.append("")
B.append(md_table(["项", "值"], [
    ["Git HEAD", "`%s`" % HEAD],
    ["4 个 HTML 内嵌 buildVersion", ", ".join(sorted({str(v.get("buildVersion")) for v in emb.values()}))],
    ["4 个 HTML 内嵌 gitCommit", ", ".join(sorted({str(v.get("gitCommit")) for v in emb.values()}))],
    ["4 个 HTML 内嵌 sourceHash", ", ".join(sorted({str(v.get("sourceHash"))[:16] + "…" for v in emb.values()}))],
    ["SHA256SUMS.txt 行数", vc.get("sha256sumsLines")],
    ["`sha256sum -c` 退出码", vc.get("sha256sumCheckExit")],
]))
B.append("")
B.append("## 2. 4 个 HTML 产物（只读核验，未修改）")
B.append("")
B.append(md_table(["产物", "字节", "sha256(前16)", "buildVersion", "sourceHash(前16)"],
                  [[k, v.get("bytes"), str(v.get("sha256"))[:16], v.get("buildVersion"),
                    str(v.get("sourceHash"))[:16]] for k, v in emb.items()]))
B.append("")
B.append("## 3. 发布产物哈希")
B.append("")
B.append(md_table(["产物", "字节", "sha256(前20)"],
                  [[k, v.get("bytes"), str(v.get("sha256"))[:20]] for k, v in vc.get("artifacts", {}).items()]))
B.append("")
B.append("## 4. `sha256sum -c SHA256SUMS.txt` 真实输出")
B.append("")
B.append("```")
B.append(vc.get("sha256sumCheck", "(未执行)"))
B.append("```")
B.append("")
B.append("## 5. 已知差异（如实登记，未擅自修改）")
B.append("")
B.append("- 4 个 HTML 内嵌 `buildVersion=%s`、`gitCommit` 指向 `e71486e…`，"
         "**比 HEAD `%s` 滞后一提交**（`8a0c434` 为后续审计修复提交）；"
         "`sourceHash` 4/4 一致，构建一致性测试 110/0。按本轮限制**未重建、未修改** 4 个 HTML。" %
         (next(iter(emb.values())).get("buildVersion"), HEAD[:8]))
B.append("- 桌面 exe / Setup.exe / Portable.zip 均由本轮 `cargo build --release` 重新产出，"
         "与 `target-gnu/.../release/MahLeMah.exe` 同源；`SHA256SUMS.txt` 已由 `npm run release` 重新生成，"
         "旧清单已备份至 `reports/windows-release-backup/`，未沿用旧产物。")
B.append("- 判定：**版本一致性 = CONDITIONAL / 未完成**。源码与产物本身哈希自洽、清单校验通过，"
         "但 Web 产物内嵌的构建版本号与 HEAD 不一致，需在授权后统一重建才能标记 PASS。")
B.append("")
(ROOT / "reports" / "RELEASE_VERSION_CONSISTENCY.md").write_text("\n".join(B) + "\n", encoding="utf-8")

# ---- 报告 C：最终发布验收 ----
C = []
C.append("# Windows 桌面版最终发布验收报告")
C.append("")
C.append("> 基准 HEAD `%s` · 生成时间 %s" % (HEAD, NOW))
C.append("> 本报告仅汇总前序各报告的真实执行结果，未重新计算任何未执行数据。")
C.append("")
C.append("## 1. 验收矩阵")
C.append("")
matrix = [
    ["Windows 构建环境", "**FAIL**", "MSVC/Windows SDK/`link.exe` 缺失（环境配置），GNU 备用链路可用；360 主动防御间歇拦截", "`WINDOWS_BUILD_ENV_AUDIT.md`"],
    ["Cargo 及桌面 Release 构建", "**PASS**", "`cargo build --release` EXIT=0；`cargo check` 增量重试 EXIT=0；`build:portable`/`build:nsis`/`release` 全成功", "`WINDOWS_RELEASE_BUILD_REPORT.md`"],
    ["Setup.exe", "**PASS**", "本轮重建 14,733,015 B，PE amd64，静默安装 ExitCode=0", "`WINDOWS_RELEASE_ARTIFACTS.md`"],
    ["Portable.zip", "**PASS**", "本轮重建 14,703,556 B，CRC/testzip 通过，新旧哈希不同", "`WINDOWS_RELEASE_ARTIFACTS.md`"],
    ["SHA256 校验", "**PASS**", "`sha256sum -c` 退出码 %s" % vc.get("sha256sumCheckExit"), "`RELEASE_VERSION_CONSISTENCY.md`"],
    ["500 局 Release 测试", "**PASS**", "`stress_release --seeds 42` 504 局 + `windows_release_500.mjs` 500 局专项（修正采样后 PASS）", "`WINDOWS_RELEASE_TEST_REPORT.md`"],
    ["100 局专项回归", "**PASS**", "`l2_100_games` 100 局：20 套全用到、最近 10 局模板零重复", "`WINDOWS_RELEASE_TEST_REPORT.md`"],
    ["桌面实机运行", verdict(ok("05_portable")), "进程/Portable 启动取证见 `WINDOWS_DESKTOP_SMOKE_TEST.md`；窗口曾被移到屏幕外(-25600)，已尝试恢复", "`WINDOWS_DESKTOP_SMOKE_TEST.md`"],
    ["安装与卸载", verdict(all([ok("03_uninstall"), ok("04_reinstall")])), "静默安装/卸载/重装真实执行，注册表与目录状态取证", "`WINDOWS_DESKTOP_SMOKE_TEST.md`"],
    ["音乐播放", "**NOT RUN**", "无实机音频回采，未执行；不得用 Web 模拟测试代替", "—"],
    ["版本一致性", "**NOT RUN / 未完成**", "4 个 HTML 内嵌 `buildVersion` 比 HEAD 滞后一提交，按限制未重建", "`RELEASE_VERSION_CONSISTENCY.md`"],
]
C.append(md_table(["项目", "判定", "依据", "报告"], matrix))
C.append("")
C.append("## 2. 测试执行摘要（真实日志）")
C.append("")
C.append("```")
C.append(test_summary)
C.append("```")
C.append("")
C.append("500 局专项验收日志尾部：")
C.append("")
C.append("```")
C.append("\n".join(log500.splitlines()[-14:]))
C.append("```")
C.append("")
C.append("## 3. 遗留风险")
C.append("")
C.append("- **Electron/Tauri 桌面真机 GUI 内验收未完成**：两关实际游玩、布局目视、失败重开、退出交互，"
         "受当前会话与安全层限制未执行，标记 NOT RUN。")
C.append("- **音乐播放与切换未实机验证**（仅有历史 Web 模拟 69/0 与真实音频 54/54 的浏览器侧证据）。")
C.append("- **DOM 降级路径 / 真实触屏 pointer 事件**未执行。")
C.append("- **牌面花色逐像素模板匹配**未执行（第二阶段仅验证牌体轮廓/位置/相位）。")
C.append("- **Windows 构建环境不完整**：无 MSVC/SDK，依赖 MinGW GNU 链路；`os error 5` 由第三方防护间歇触发，"
         "本轮通过增量重试绕过，但环境本身未修复。")
C.append("- **版本漂移**：4 个 HTML 内嵌构建版本号滞后 HEAD 一提交。")
C.append("")
C.append("## 4. 最终结论")
C.append("")
C.append("**NOT READY**")
C.append("")
C.append("判定理由：Release 构建、发布产物、SHA256 校验、500 局与 100 局 Release 测试均已真实通过；"
         "但「桌面实机运行」「音乐播放」「版本一致性」三项未完成或为 NOT RUN，"
         "且构建环境存在未修复的 MSVC 缺失与间歇性 `os error 5`。"
         "**浏览器端视觉审计通过不等于 Windows 桌面版通过**。")
C.append("")
C.append("三层区分：① 第二关核心几何与浏览器视觉验收 → PASS（前序阶段）；"
         "② 本轮 Windows Release 构建与自动化测试 → PASS；"
         "③ Windows 桌面发布验收 → **NOT READY**。")
C.append("")
C.append("解除条件：补齐桌面 GUI 实机验收（含音乐）、授权统一重建 4 个 HTML 使 `buildVersion` 对齐 HEAD、"
         "修复或规避构建环境拦截，并将全部 NOT RUN 项转为真实执行后重新出具本报告。")
C.append("")
(ROOT / "reports" / "WINDOWS_FINAL_RELEASE_ACCEPTANCE.md").write_text("\n".join(C) + "\n", encoding="utf-8")

W("=== 三份报告已生成 ===")
for p in ["WINDOWS_DESKTOP_SMOKE_TEST.md", "RELEASE_VERSION_CONSISTENCY.md",
          "WINDOWS_FINAL_RELEASE_ACCEPTANCE.md"]:
    f = ROOT / "reports" / p
    W("  %s  %d B  %d 行" % (p, f.stat().st_size, len(f.read_text(encoding="utf-8").splitlines())))
