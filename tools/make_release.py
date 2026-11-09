"""
MahLeMah v2.0.0 —— Windows 绿色安装包 / 便携版 / 一键卸载 打包器。

产物（全部落在 dist/）：
  MahLeMah-Setup-v2.0.0.exe      自解压安装包（Windows 内置 IExpress，64 位、无需管理员）
  MahLeMah-Portable-v2.0.0.zip   绿色便携版，解压即用
  SHA256SUMS.txt                  产物校验和
  RELEASE_NOTES.md                更新日志（由仓库维护，本脚本不覆盖）

设计约束：
  · 绿色安装：只写 %LOCALAPPDATA%\\MahLeMah 与当前用户开始菜单，不写 HKLM、不写系统目录、
    不需要管理员权限、不注册服务、不留后台进程；
  · 一键卸载：开始菜单「卸载 MahLeMah」+ 安装目录内卸载脚本，删除安装目录与快捷方式；
    便携版附「卸载便携版.cmd」，直接删除自身目录；
  · 前端不自删：卸载完全由安装器附带的脚本负责（v2.0.0 安全边界，见 capabilities/default.json）。

原生 exe 存在时优先打包 Tauri 版本；不存在时如实降级为单文件网页版
（离线可玩，Edge/Chrome 无边框窗口），并在 README.txt 里明确标注。

用法：python tools/make_release.py
"""
import hashlib
import os
import shutil
import subprocess
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
BUILD = os.path.join(ROOT, ".build")
STAGE = os.path.join(BUILD, "stage_setup")
VERSION = "2.0.0"
PRODUCT = "MahLeMah"

EXE_CANDIDATES = [
    os.path.join(ROOT, "target-gnu", "x86_64-pc-windows-gnu", "release", "MahLeMah.exe"),
    os.path.join(ROOT, ".build", "target-cross", "x86_64-pc-windows-gnu", "release", "MahLeMah.exe"),
    os.path.join(ROOT, ".build", "target-gnu", "x86_64-pc-windows-gnu", "release", "MahLeMah.exe"),
    os.path.join(ROOT, "src-tauri", "target", "release", "MahLeMah.exe"),
]
IEXPRESS = os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "System32", "iexpress.exe")


def find_exe():
    for p in EXE_CANDIDATES:
        if os.path.isfile(p) and os.path.getsize(p) > 100_000:
            return p
    return None


README_NATIVE = """Mah 了个 Mah v2.0.0 —— Windows 绿色安装版（原生 Tauri）
============================================================

【运行】开始菜单 → MahLeMah →「Mah 了个 Mah」，或双击安装目录里的 MahLeMah.exe。
【数据】存档在 exe 同级的 MahLeMah_Data\\save.json；WebView2 缓存在 MahLeMah_Data\\webview。
       不写注册表、不写 %APPDATA%、不需要管理员权限。
【卸载】开始菜单 → MahLeMah →「卸载 MahLeMah」，或运行安装目录里的「卸载 MahLeMah.cmd」。
       卸载程序删除安装目录与快捷方式；游戏内没有任何删除文件的能力。

【玩法】点击未被遮挡的牌 → 进入底部 7 格槽位 → 三张相同 200ms 后自动消除。
       槽位放满且无法消除即失败，清空牌桌即通关。
       第 1 关：48 张 / 16 种牌型 / 3 层，教学关。
       第 2 关：240 张 / 16 种牌型 / 15 个全局堆叠层，
                主堆 7 层 + 左右盲盒各 3 层 + 底部保留区 2 层，多区域交叉遮挡。
       道具各 3 次：洗牌 / 撤销 / 移出 3 张；每局 1 次复活。
       每局都有完整通关路径（可解性证书 + 几何 verify），运行时从 120 个
       离线验收 seed 池里抽取。
"""

README_WEB = """Mah 了个 Mah v2.0.0 —— Windows 绿色安装版（单文件网页版）
================================================================

【重要说明】
  本机沙箱阻止执行新链接出的原生 PE（32 位 makensis.exe、GNU proc-macro DLL
  均被「拒绝访问」），因此本安装包内含的是**单文件网页版**，不是 Tauri exe。
  它同样完全离线可玩：所有 JS / CSS 都内联在 MahLeMah.html 里，无外部请求。
  在装有 Visual Studio 2022 C++ 生成工具的机器上执行 `npm run build:desktop`
  可产出原生 Tauri exe，再运行 `python tools/make_release.py` 重新打包即可。

【运行】开始菜单 → MahLeMah →「Mah 了个 Mah」，或双击安装目录里的
       Play-MahLeMah.cmd（用 Edge/Chrome 无边框窗口打开 MahLeMah.html）。
【存档】保存在浏览器的 localStorage 中，卸载时不会残留系统级数据。
【卸载】开始菜单 → MahLeMah →「卸载 MahLeMah」，或运行安装目录里的
       「卸载 MahLeMah.cmd」。卸载程序删除安装目录与快捷方式。

【玩法】点击未被遮挡的牌 → 进入底部 7 格槽位 → 三张相同 200ms 后自动消除。
       第 1 关：48 张 / 16 种牌型 / 3 层；第 2 关：240 张 / 16 种牌型 /
       15 个全局堆叠层（主堆 + 左右盲盒 + 底部保留区），多区域交叉遮挡。
       道具各 3 次：洗牌 / 撤销 / 移出 3 张；每局 1 次复活。
"""


def uninstall_script(target_expr, label):
    """生成卸载脚本：先把自己复制到 TEMP 再执行，避免删除正在运行的批处理所在目录。"""
    return f"""@echo off
chcp 65001 >nul
if /i "%~1"=="run" goto RUN
copy /y "%~f0" "%TEMP%\\mah-uninstall-%RANDOM%.cmd" >nul
for %%F in ("%TEMP%\\mah-uninstall-*.cmd") do set "SELF=%%~fF"
start "" /min "%COMSPEC%" /c ""%SELF%" run"
exit /b

:RUN
set "APPDIR={target_expr}"
set "SM=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\MahLeMah"
echo 正在卸载 MahLeMah v{VERSION} ...
if exist "%SM%\\" rmdir /s /q "%SM%"
if exist "%APPDIR%\\" rmdir /s /q "%APPDIR%"
echo {label} 已卸载完成。
timeout /t 2 >nul
"""


INSTALL_CMD = """@echo off
chcp 65001 >nul
set "APPDIR=%LOCALAPPDATA%\\MahLeMah"
set "SM=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\MahLeMah"
echo 正在安装 MahLeMah v2.0.0 （绿色安装，无需管理员权限）...
if not exist "%APPDIR%\\" mkdir "%APPDIR%"
if not exist "%SM%\\" mkdir "%SM%"
copy /y "%~dp0*" "%APPDIR%\\" >nul 2>&1
if exist "%APPDIR%\\MahLeMah.exe" (
  set "RUN=%APPDIR%\\MahLeMah.exe"
) else (
  set "RUN=%APPDIR%\\Play-MahLeMah.cmd"
)
cscript //nologo "%APPDIR%\\shortcuts.vbs" "%SM%" "%APPDIR%" "%RUN%"
echo.
echo 安装完成：%APPDIR%
echo 卸载：开始菜单 MahLeMah →「卸载 MahLeMah」
timeout /t 3 >nul
"""

SHORTCUTS_VBS = """' 创建开始菜单快捷方式（当前用户，无需管理员）。参数：开始菜单目录 / 安装目录 / 启动目标
Option Explicit
Dim sm, app, target, sh, lnk
sm = WScript.Arguments(0)
app = WScript.Arguments(1)
target = WScript.Arguments(2)
Set sh = CreateObject("WScript.Shell")
Set lnk = sh.CreateShortcut(sm & "\\Mah 了个 Mah.lnk")
lnk.TargetPath = target
lnk.WorkingDirectory = app
lnk.Description = "MahLeMah v2.0.0 堆叠卡牌三消"
lnk.Save
Set lnk = sh.CreateShortcut(sm & "\\卸载 MahLeMah.lnk")
lnk.TargetPath = app & "\\卸载 MahLeMah.cmd"
lnk.WorkingDirectory = app
lnk.Description = "一键卸载 MahLeMah v2.0.0"
lnk.Save
"""


def write_text(path, text):
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        f.write(text.replace("\n", "\r\n"))


def build_stage(exe):
    if os.path.isdir(STAGE):
        shutil.rmtree(STAGE)
    os.makedirs(STAGE, exist_ok=True)

    payload = []
    if exe:
        shutil.copy2(exe, os.path.join(STAGE, "MahLeMah.exe"))
        payload.append("MahLeMah.exe")
        print(f"[ok] native exe: {os.path.getsize(exe) / 1024 / 1024:.2f} MB")
    else:
        print("[!] 未找到原生 Tauri exe —— 打包单文件网页版（离线可玩）")
        for name in ("MahLeMah.html", "index.html", "Play-MahLeMah.cmd"):
            src = os.path.join(DIST, name)
            if os.path.isfile(src):
                shutil.copy2(src, os.path.join(STAGE, name))
                payload.append(name)
        if "MahLeMah.html" not in payload:
            print("[x] dist/MahLeMah.html 不存在，请先 npm run build:all")
            return None
    write_text(os.path.join(STAGE, "README.txt"), README_NATIVE if exe else README_WEB)
    payload.append("README.txt")
    write_text(os.path.join(STAGE, "install.cmd"), INSTALL_CMD)
    payload.append("install.cmd")
    write_text(os.path.join(STAGE, "shortcuts.vbs"), SHORTCUTS_VBS)
    payload.append("shortcuts.vbs")
    write_text(
        os.path.join(STAGE, "卸载 MahLeMah.cmd"),
        uninstall_script("%LOCALAPPDATA%\\MahLeMah", "MahLeMah v" + VERSION),
    )
    payload.append("卸载 MahLeMah.cmd")
    return payload


def build_portable(payload):
    out = os.path.join(DIST, f"{PRODUCT}-Portable-v{VERSION}.zip")
    if os.path.exists(out):
        os.remove(out)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for name in payload:
            if name in ("install.cmd", "shortcuts.vbs"):
                continue
            zf.write(os.path.join(STAGE, name), name)
        zf.writestr(
            "卸载便携版.cmd",
            uninstall_script("%~dp0", "便携版 MahLeMah").replace("\n", "\r\n"),
        )
    print(f"[ok] {os.path.basename(out)}  ({os.path.getsize(out) / 1024:.1f} KB)")
    return out


def build_setup(payload):
    if not os.path.isfile(IEXPRESS):
        print(f"[x] 找不到 IExpress：{IEXPRESS}")
        return None
    out = os.path.join(DIST, f"{PRODUCT}-Setup-v{VERSION}.exe")
    if os.path.exists(out):
        os.remove(out)
    stage = STAGE.replace("/", "\\")
    target = out.replace("/", "\\")
    lines = [
        "[Version]", "Class=IEXPRESS", "SEDVersion=3", "[Options]",
        "PackagePurpose=InstallApp", "ShowInstallProgramWindow=0", "HideExtractAnimation=1",
        "UseLongFileName=1", "InsideCompressedType=0", "CAB_FixedSize=0", "CAB_ResvCodeSigning=0",
        "RebootMode=N", "InstallPrompt=", "DisplayLicense=", "FinishMessage=",
        "TargetName=" + target, "FriendlyName=MahLeMah v" + VERSION,
        "AppLaunched=" + "cmd /c install.cmd", "PostInstallCmd=<None>",
        "AdminQuietInstCmd=", "UserQuietInstCmd=", "SourceFiles=SourceFiles",
        "[Strings]",
    ]
    for i, name in enumerate(payload):
        lines.append(f"FILE{i}={name}")
    lines += ["[SourceFiles]", "SourceFiles0=" + stage, "[SourceFiles0]"]
    for i in range(len(payload)):
        lines.append(f"%FILE{i}%=")
    sed_path = os.path.join(BUILD, "setup_v2.sed")
    with open(sed_path, "w", encoding="ascii", newline="") as f:
        f.write("\r\n".join(lines) + "\r\n")
    try:
        r = subprocess.run(
            [IEXPRESS, "/N", "/Q", sed_path],
            cwd=ROOT, capture_output=True, timeout=180,
        )
    except Exception as e:
        print(f"[x] IExpress 调用失败：{e}")
        return None
    if not os.path.isfile(out):
        print(f"[x] IExpress 未产出安装包（exit={r.returncode}）")
        print((r.stdout or b"").decode("gbk", "replace")[-600:])
        print((r.stderr or b"").decode("gbk", "replace")[-600:])
        return None
    print(f"[ok] {os.path.basename(out)}  ({os.path.getsize(out) / 1024:.1f} KB, IExpress)")
    return out


def checksums(files):
    out = os.path.join(DIST, "SHA256SUMS.txt")
    lines = []
    for p in files:
        if not p or not os.path.isfile(p):
            continue
        h = hashlib.sha256()
        with open(p, "rb") as f:
            for chunk in iter(lambda: f.read(1 << 20), b""):
                h.update(chunk)
        lines.append(f"{h.hexdigest()}  {os.path.basename(p)}")
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")
    print(f"[ok] SHA256SUMS.txt（{len(lines)} 个产物）")
    return out


def main():
    os.makedirs(DIST, exist_ok=True)
    os.makedirs(BUILD, exist_ok=True)
    exe = find_exe()
    payload = build_stage(exe)
    if not payload:
        return 1
    portable = build_portable(payload)
    setup = build_setup(payload)
    html = os.path.join(DIST, "MahLeMah.html")
    legacy = os.path.join(DIST, "MahLeMah-legacy.html")
    checksums([
        setup, portable, html, legacy,
        os.path.join(DIST, "Mah了个Mah.html"),
        os.path.join(DIST, "index.html"),
        os.path.join(DIST, "_tiles.html"),
    ])
    print(f"[done] 原生 exe：{'是' if exe else '否（网页版降级）'} · 安装包：{'是' if setup else '否'}")
    return 0 if portable else 1


if __name__ == "__main__":
    sys.exit(main())
